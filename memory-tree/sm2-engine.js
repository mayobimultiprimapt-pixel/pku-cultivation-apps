/**
 * 识海天碑 · SM-2 Core Engine
 * ============================
 * Pure SM-2 algorithm + review scheduler + card state management.
 * Zero external dependencies. All state persisted in localStorage.
 */

const SM2Engine = (() => {
  // ─── SM-2 核心公式 ─────────────────────────────────────────
  function calculateSM2(card, grade) {
    // grade: 0=完全忘记, 1=勉强记起, 2=有印象但错, 3=困难回忆, 4=正常回忆, 5=轻松回忆
    let { easeFactor, interval, repetitions } = card.sm2;

    if (grade >= 3) {
      // 答对
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      // 答错 → 走火入魔，跌落炼气期
      repetitions = 0;
      interval = 1;
    }

    // 更新难度因子
    easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const now = new Date();
    const nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

    return {
      easeFactor: Math.round(easeFactor * 100) / 100,
      interval,
      repetitions,
      nextReviewDate: nextReviewDate.toISOString(),
      lastReviewDate: now.toISOString(),
      grade
    };
  }

  // ─── 创建新卡片 ─────────────────────────────────────────
  function createCard({ question, answer, subject, chapter, topic, difficulty = 3, source = 'manual', tags = [] }) {
    const id = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    return {
      id,
      content: {
        question,
        answer,
        hint: '',
        explanation: '',
      },
      meta: {
        subject,     // "101" | "201" | "301" | "408"
        chapter,
        topic,
        difficulty,
        source,      // "manual" | "tianji_import" | "ghost_dorm_error" | "ai_generated"
        tags
      },
      sm2: {
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date().toISOString(),
        lastReviewDate: null,
        grade: null
      },
      treeState: {
        leafType: 'sprout',    // sprout → leaf → branch → flower
        glowIntensity: 0.5,
        isWithering: false,
        cultivationStage: '炼气'
      },
      stats: {
        totalReviews: 0,
        correctCount: 0,
        incorrectCount: 0,
        averageRecallTime: 0,
        lapseCount: 0
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // ─── 处理复习评分 ─────────────────────────────────────────
  function reviewCard(card, grade, recallTimeMs = 0) {
    const sm2Before = { ...card.sm2 };
    const sm2After = calculateSM2(card, grade);

    // 更新 SM-2 状态
    card.sm2 = sm2After;
    card.updatedAt = new Date().toISOString();

    // 更新统计
    card.stats.totalReviews += 1;
    if (grade >= 3) {
      card.stats.correctCount += 1;
    } else {
      card.stats.incorrectCount += 1;
      card.stats.lapseCount += 1;
    }
    if (recallTimeMs > 0) {
      const prev = card.stats.averageRecallTime;
      const n = card.stats.totalReviews;
      card.stats.averageRecallTime = Math.round((prev * (n - 1) + recallTimeMs) / n);
    }

    // 更新神识之树状态
    updateTreeState(card);

    // 生成复习日志
    const log = {
      id: 'log_' + Date.now(),
      cardId: card.id,
      grade,
      recallTimeMs,
      userAction: grade >= 4 ? 'easy' : grade === 3 ? 'hard' : grade >= 1 ? 'partial' : 'forgot',
      sm2Before,
      sm2After: { ...card.sm2 },
      reviewedAt: new Date().toISOString()
    };

    return { card, log };
  }

  // ─── 更新神识之树可视化状态 ─────────────────────────────────
  function updateTreeState(card) {
    const { repetitions, easeFactor, interval } = card.sm2;
    const { correctCount, lapseCount, totalReviews } = card.stats;

    // 光芒强度 基于记忆强度
    const retentionRate = totalReviews > 0 ? correctCount / totalReviews : 0.5;
    card.treeState.glowIntensity = Math.min(1, Math.max(0, retentionRate));

    // 是否枯竭
    const now = new Date();
    const nextReview = new Date(card.sm2.nextReviewDate);
    const overdueDays = (now - nextReview) / (1000 * 60 * 60 * 24);
    card.treeState.isWithering = overdueDays > 0;

    // 叶片类型 基于连续正确次数
    if (repetitions >= 10) {
      card.treeState.leafType = 'flower';      // 🌸 灵花
      card.treeState.cultivationStage = '元婴';
    } else if (repetitions >= 6) {
      card.treeState.leafType = 'branch';       // 🌿 灵脉
      card.treeState.cultivationStage = '金丹';
    } else if (repetitions >= 3) {
      card.treeState.leafType = 'leaf';          // 🍃 灵叶
      card.treeState.cultivationStage = '筑基';
    } else {
      card.treeState.leafType = 'sprout';        // 🌱 灵芽
      card.treeState.cultivationStage = '炼气';
    }

    // 走火入魔 (最近一次是失败)
    if (card.sm2.grade !== null && card.sm2.grade < 3) {
      card.treeState.leafType = 'sprout';
      card.treeState.cultivationStage = '炼气';
      card.treeState.glowIntensity = Math.max(0, card.treeState.glowIntensity - 0.3);
    }
  }

  // ─── 获取今日待复习队列 ─────────────────────────────────────
  function getDueCards(allCards, limit = 50) {
    const now = new Date();
    return allCards
      .filter(c => c.isActive && new Date(c.sm2.nextReviewDate) <= now)
      .sort((a, b) => {
        // 优先级：1.过期最久的 2.难度因子最低的 3.走火入魔的
        const overA = now - new Date(a.sm2.nextReviewDate);
        const overB = now - new Date(b.sm2.nextReviewDate);
        if (a.treeState.isWithering !== b.treeState.isWithering) {
          return a.treeState.isWithering ? -1 : 1;
        }
        if (Math.abs(overA - overB) > 1000 * 60 * 60) {
          return overB - overA; // descending overdue
        }
        return a.sm2.easeFactor - b.sm2.easeFactor;
      })
      .slice(0, limit);
  }

  // ─── 获取新卡片（未学习过的） ─────────────────────────────────
  function getNewCards(allCards, limit = 10) {
    return allCards
      .filter(c => c.isActive && c.sm2.repetitions === 0 && c.sm2.lastReviewDate === null)
      .slice(0, limit);
  }

  // ─── 全局统计 ─────────────────────────────────────────────
  function getGlobalStats(allCards) {
    const active = allCards.filter(c => c.isActive);
    const total = active.length;
    if (total === 0) return { total: 0, mastered: 0, learning: 0, new: 0, withering: 0, retentionRate: 0, dueToday: 0 };

    const mastered = active.filter(c => c.sm2.repetitions >= 6).length;
    const learning = active.filter(c => c.sm2.repetitions > 0 && c.sm2.repetitions < 6).length;
    const newCards = active.filter(c => c.sm2.repetitions === 0).length;
    const withering = active.filter(c => c.treeState.isWithering).length;
    const dueToday = getDueCards(active, 9999).length;

    const totalReviews = active.reduce((s, c) => s + c.stats.totalReviews, 0);
    const totalCorrect = active.reduce((s, c) => s + c.stats.correctCount, 0);
    const retentionRate = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    // 按科目统计
    const bySubject = {};
    active.forEach(c => {
      const subj = c.meta.subject || 'unknown';
      if (!bySubject[subj]) bySubject[subj] = { total: 0, mastered: 0, withering: 0 };
      bySubject[subj].total++;
      if (c.sm2.repetitions >= 6) bySubject[subj].mastered++;
      if (c.treeState.isWithering) bySubject[subj].withering++;
    });

    return { total, mastered, learning, new: newCards, withering, dueToday, retentionRate, bySubject };
  }

  // ─── localStorage 持久化 ────────────────────────────────────
  const STORAGE_KEY = 'pku_memory_tree_cards';
  const LOGS_KEY = 'pku_memory_tree_logs';

  function saveCards(cards) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }

  function loadCards() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  function saveLogs(logs) {
    // 只保留最近 500 条日志
    const trimmed = logs.slice(-500);
    localStorage.setItem(LOGS_KEY, JSON.stringify(trimmed));
  }

  function loadLogs() {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  // ─── 种子卡片（从完整数据库加载 125+ 张）────────────────────
  function getSeedCards() {
    if (typeof CardDatabase !== 'undefined') {
      return CardDatabase.getAllCards().map(c => createCard(c));
    }
    // Fallback: 基础卡片（如果 card-database.js 未加载）
    return [
      createCard({ question: '矛盾的普遍性与特殊性的辩证关系？', answer: '普遍性寓于特殊性之中，特殊性包含普遍性。两者在一定条件下可以相互转化。', subject: '101', chapter: '马原', topic: '唯物辩证法', tags: ['辩证法', '核心'] }),
      createCard({ question: 'TCP 三次握手的过程？', answer: '1. C→S: SYN=1, seq=x\n2. S→C: SYN=1, ACK=1, seq=y, ack=x+1\n3. C→S: ACK=1, seq=x+1, ack=y+1', subject: '408', chapter: '计网', topic: 'TCP协议', tags: ['计网', '必考'] }),
      createCard({ question: '洛必达法则的适用条件？', answer: '1. 极限为 0/0 或 ∞/∞ 型\n2. f(x)和g(x)在去心邻域内可导\n3. g\'(x) ≠ 0\n4. lim f\'(x)/g\'(x) 存在或为∞', subject: '301', chapter: '高数', topic: '极限', tags: ['核心'] }),
    ];
  }

  // ─── 批量导入卡片 ──────────────────────────────────────────
  function importCards(existingCards, jsonArray) {
    const existingQs = new Set(existingCards.map(c => c.content.question));
    let added = 0;
    jsonArray.forEach(item => {
      if (!existingQs.has(item.question)) {
        existingCards.push(createCard({
          question: item.question,
          answer: item.answer,
          subject: item.subject || '101',
          chapter: item.chapter || '',
          topic: item.topic || '',
          difficulty: item.difficulty || 3,
          source: item.source || 'import',
          tags: item.tags || []
        }));
        added++;
      }
    });
    saveCards(existingCards);
    return { added, total: existingCards.length };
  }

  // ─── 导出卡片 ──────────────────────────────────────────────
  function exportCards(cards) {
    const data = JSON.stringify(cards, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `识海天碑_备份_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Perplexity 每日时政注入 ───────────────────────────────
  async function injectDailyCards(existingCards) {
    if (typeof CardDatabase === 'undefined' || !CardDatabase.PerplexityService) return 0;
    try {
      const dailyCards = await CardDatabase.PerplexityService.generateDailyCards();
      if (dailyCards.length === 0) return 0;
      const { added } = importCards(existingCards, dailyCards.map(c => ({
        ...c, subject: '101', source: 'perplexity_daily'
      })));
      return added;
    } catch (e) {
      console.warn('[识海天碑] 每日时政注入失败:', e);
      return 0;
    }
  }

  return {
    calculateSM2,
    createCard,
    reviewCard,
    getDueCards,
    getNewCards,
    getGlobalStats,
    saveCards,
    loadCards,
    saveLogs,
    loadLogs,
    getSeedCards,
    updateTreeState,
    importCards,
    exportCards,
    injectDailyCards
  };
})();
