/**
 * 识海天碑 · Main Application Controller
 * ========================================
 * Orchestrates SM-2 engine, Spirit Tree, AI service, and UI.
 */

const App = (() => {
  let allCards = [];
  let reviewLogs = [];
  let reviewQueue = [];
  let currentReviewIndex = 0;
  let isCardFlipped = false;
  let currentSubjectFilter = 'all';
  let sessionStats = { total: 0, correct: 0 };
  let reviewStartTime = 0;

  // ─── 初始化 ─────────────────────────────────────────
  function init() {
    allCards = SM2Engine.loadCards();
    reviewLogs = SM2Engine.loadLogs();

    // 首次使用：加载种子卡片（125+ 张全科覆盖）
    if (allCards.length === 0) {
      allCards = SM2Engine.getSeedCards();
      SM2Engine.saveCards(allCards);
      console.log(`[识海天碑] 初始化加载 ${allCards.length} 张卡片`);
    }

    // 更新所有卡片的枯竭状态
    allCards.forEach(card => SM2Engine.updateTreeState(card));
    SM2Engine.saveCards(allCards);

    // 初始化 Spirit Tree
    SpiritTree.init(document.getElementById('spiritTreeCanvas'));
    
    // 绑定科目筛选
    document.querySelectorAll('.subject-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.subject-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentSubjectFilter = chip.dataset.subject;
        refreshUI();
      });
    });

    // 点击 Modal 外部关闭
    document.getElementById('addCardModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) hideAddCardModal();
    });

    refreshUI();

    // 每日自动注入 Perplexity 时政卡片（异步，不阻塞UI）
    SM2Engine.injectDailyCards(allCards).then(added => {
      if (added > 0) {
        console.log(`[识海天碑] Perplexity注入 ${added} 张时政卡片`);
        refreshUI();
      }
    });
  }

  // ─── 刷新 UI ─────────────────────────────────────────
  function refreshUI() {
    const filtered = currentSubjectFilter === 'all'
      ? allCards
      : allCards.filter(c => c.meta.subject === currentSubjectFilter);

    const stats = SM2Engine.getGlobalStats(filtered);

    // 统计卡片
    document.getElementById('totalCards').textContent = stats.total;
    document.getElementById('dueCards').textContent = stats.dueToday;
    document.getElementById('witheringCards').textContent = stats.withering;
    document.getElementById('masteredCards').textContent = stats.mastered;

    // 侧边信息
    document.getElementById('dueCount').textContent = stats.dueToday;
    document.getElementById('newCount').textContent = stats.new;
    document.getElementById('masteredCount').textContent = stats.mastered;

    // 记忆保持率圆环
    const pct = stats.retentionRate;
    const ring = document.getElementById('retentionRing');
    const circumference = 263.9;
    ring.style.strokeDashoffset = circumference - (circumference * pct / 100);
    document.getElementById('retentionPct').textContent = pct + '%';

    // 灵力等级
    const totalReviews = allCards.reduce((s, c) => s + c.stats.totalReviews, 0);
    const qiLevel = Math.floor(totalReviews / 10) + 1;
    document.getElementById('qiLevel').textContent = `Lv.${qiLevel}`;
    
    const ranks = ['炼气期', '筑基期', '金丹期', '元婴期', '化神期', '渡劫期'];
    const rankIndex = Math.min(Math.floor(qiLevel / 10), ranks.length - 1);
    document.getElementById('cultivationRank').textContent = ranks[rankIndex];

    // 更新按钮文字
    const btn = document.getElementById('btnStartReview');
    if (stats.dueToday > 0) {
      btn.innerHTML = `⚡ 开始渡劫 (${stats.dueToday})`;
    } else if (stats.new > 0) {
      btn.innerHTML = `✨ 学习新卡 (${stats.new})`;
    } else {
      btn.innerHTML = `🧘 今日修炼圆满`;
    }

    // 更新神识之树
    SpiritTree.updateLeaves(filtered);
  }

  // ─── 开始复习 ─────────────────────────────────────────
  function startReview() {
    const filtered = currentSubjectFilter === 'all'
      ? allCards
      : allCards.filter(c => c.meta.subject === currentSubjectFilter);

    // 先取待复习的，再取新卡
    reviewQueue = SM2Engine.getDueCards(filtered, 30);
    if (reviewQueue.length < 10) {
      const newCards = SM2Engine.getNewCards(filtered, 10 - reviewQueue.length);
      reviewQueue = [...reviewQueue, ...newCards];
    }

    if (reviewQueue.length === 0) {
      alert('🧘 今日修炼已圆满，无需再复习。灵树会在明天需要你时苏醒。');
      return;
    }

    currentReviewIndex = 0;
    isCardFlipped = false;
    sessionStats = { total: 0, correct: 0 };
    
    document.getElementById('reviewOverlay').classList.add('active');
    document.getElementById('flipCardContainer').style.display = 'flex';
    document.getElementById('reviewComplete').classList.remove('active');
    
    showCurrentCard();
  }

  // ─── 显示当前卡片 ─────────────────────────────────────
  function showCurrentCard() {
    if (currentReviewIndex >= reviewQueue.length) {
      showComplete();
      return;
    }

    const card = reviewQueue[currentReviewIndex];
    isCardFlipped = false;
    reviewStartTime = Date.now();

    // Reset flip state
    document.getElementById('flipCard').classList.remove('flipped');
    document.getElementById('gradeButtons').classList.remove('active');
    document.getElementById('aiActionBtns').classList.remove('active');
    document.getElementById('aiHintBox').classList.remove('active');

    // Fill card content
    const subjectNames = { '101': '政治', '201': '英语', '301': '数学', '408': '408' };
    const badge = document.getElementById('cardSubjectBadge');
    badge.textContent = subjectNames[card.meta.subject] || card.meta.subject;
    badge.className = 'subject-badge s' + card.meta.subject;

    // Leaf icon based on state
    const leafIcons = { sprout: '🌱', leaf: '🍃', branch: '✨', flower: '🌸' };
    document.getElementById('cardLeafIcon').textContent = 
      card.treeState.isWithering ? '💀' : (leafIcons[card.treeState.leafType] || '🌱');

    document.getElementById('cardQuestion').textContent = card.content.question;
    document.getElementById('cardAnswer').textContent = card.content.answer;

    // Progress
    const progress = ((currentReviewIndex) / reviewQueue.length) * 100;
    document.getElementById('reviewProgressFill').style.width = progress + '%';
    document.getElementById('reviewCounter').textContent = 
      `${currentReviewIndex + 1} / ${reviewQueue.length}`;

    // Pre-calculate intervals for grade buttons
    updateGradeIntervals(card);
  }

  // ─── 翻转卡片 ─────────────────────────────────────────
  function flipCard() {
    if (isCardFlipped) return;
    isCardFlipped = true;
    
    document.getElementById('flipCard').classList.add('flipped');
    
    // 显示评分按钮和 AI 按钮
    setTimeout(() => {
      document.getElementById('gradeButtons').classList.add('active');
      document.getElementById('aiActionBtns').classList.add('active');
    }, 300);
  }

  // ─── 评分卡片 ─────────────────────────────────────────
  function gradeCard(grade) {
    const card = reviewQueue[currentReviewIndex];
    const recallTime = Date.now() - reviewStartTime;

    const { card: updated, log } = SM2Engine.reviewCard(card, grade, recallTime);

    // 同步到主列表
    const idx = allCards.findIndex(c => c.id === updated.id);
    if (idx >= 0) allCards[idx] = updated;

    // 保存
    reviewLogs.push(log);
    SM2Engine.saveCards(allCards);
    SM2Engine.saveLogs(reviewLogs);

    // 统计
    sessionStats.total++;
    if (grade >= 3) sessionStats.correct++;

    // 走火入魔动画
    if (grade < 3) {
      document.getElementById('flipCard').classList.add('shake');
      setTimeout(() => document.getElementById('flipCard').classList.remove('shake'), 500);

      // 如果答错，记录到 Mem0
      AIService.saveToMemory(
        card.meta.topic || card.meta.chapter,
        card.content.question
      ).catch(() => {});
    } else {
      document.getElementById('flipCard').classList.add('leaf-bloom');
      setTimeout(() => document.getElementById('flipCard').classList.remove('leaf-bloom'), 2000);
    }

    // 下一张
    currentReviewIndex++;
    setTimeout(() => showCurrentCard(), grade < 3 ? 800 : 400);
  }

  // ─── 更新评分按钮的间隔预览 ─────────────────────────────
  function updateGradeIntervals(card) {
    const intervals = [0, 3, 4, 5].map(grade => {
      const sim = SM2Engine.calculateSM2({ sm2: { ...card.sm2 } }, grade);
      return sim.interval;
    });

    document.getElementById('gradeHardInterval').textContent = formatInterval(intervals[1]);
    document.getElementById('gradeGoodInterval').textContent = formatInterval(intervals[2]);
    document.getElementById('gradeEasyInterval').textContent = formatInterval(intervals[3]);
  }

  function formatInterval(days) {
    if (days < 1) return '<1天';
    if (days === 1) return '1天';
    if (days < 30) return days + '天';
    if (days < 365) return Math.round(days / 30) + '月';
    return Math.round(days / 365 * 10) / 10 + '年';
  }

  // ─── AI 功能 ─────────────────────────────────────────
  async function requestHint() {
    const card = reviewQueue[currentReviewIndex];
    showAIBox('💡 SPIRIT HINT', '顾枢正在灵光一闪中...');
    
    try {
      const hint = await AIService.getQuickHint(card.content.question, card.content.answer);
      showAIBox('💡 SPIRIT HINT', hint);
      card.content.hint = hint;
      SM2Engine.saveCards(allCards);
    } catch (e) {
      showAIBox('⚠️ ERROR', '灵气通道暂时中断：' + e.message);
    }
  }

  async function requestExplanation() {
    const card = reviewQueue[currentReviewIndex];
    showAIBox('📖 DEEP INSIGHT', '顾枢正在推演中...');
    
    try {
      const explanation = await AIService.getDeepExplanation(
        card.content.question, card.content.answer, card.meta.subject
      );
      showAIBox('📖 DEEP INSIGHT', explanation);
      card.content.explanation = explanation;
      SM2Engine.saveCards(allCards);
    } catch (e) {
      showAIBox('⚠️ ERROR', '推演失败：' + e.message);
    }
  }

  async function requestMasterClass() {
    const card = reviewQueue[currentReviewIndex];
    showAIBox('👑 MASTER CLASS', '顾枢正在开坛讲法...\n（调用 Claude Opus 4.6，请稍候）');
    
    try {
      // 获取该知识点的历史错误
      const errorHistory = reviewLogs
        .filter(l => l.cardId === card.id && l.grade < 3)
        .map(l => card.content.question)
        .slice(-3);

      const lecture = await AIService.getMasterClass(
        card.content.question, card.content.answer, errorHistory
      );
      showAIBox('👑 MASTER CLASS · 顾枢亲讲', lecture);
    } catch (e) {
      showAIBox('⚠️ ERROR', '顾枢闭关中：' + e.message);
    }
  }

  function showAIBox(label, content) {
    const box = document.getElementById('aiHintBox');
    box.classList.add('active');
    document.getElementById('aiHintLabel').textContent = label;
    const contentEl = document.getElementById('aiHintContent');
    contentEl.textContent = content;
    contentEl.classList.toggle('loading', content.includes('正在'));
  }

  // ─── 完成界面 ─────────────────────────────────────────
  function showComplete() {
    document.getElementById('flipCardContainer').style.display = 'none';
    document.getElementById('gradeButtons').classList.remove('active');
    document.getElementById('aiActionBtns').classList.remove('active');
    document.getElementById('aiHintBox').classList.remove('active');

    document.getElementById('reviewComplete').classList.add('active');
    document.getElementById('completeTotal').textContent = sessionStats.total;
    document.getElementById('completeCorrect').textContent = sessionStats.correct;
    
    const accuracy = sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0;
    document.getElementById('completeAccuracy').textContent = accuracy + '%';

    document.getElementById('reviewProgressFill').style.width = '100%';
  }

  // ─── 退出复习 ─────────────────────────────────────────
  function exitReview() {
    document.getElementById('reviewOverlay').classList.remove('active');
    refreshUI();
  }

  // ─── 添加卡片 ─────────────────────────────────────────
  function showAddCardModal() {
    document.getElementById('addCardModal').classList.add('active');
  }

  function hideAddCardModal() {
    document.getElementById('addCardModal').classList.remove('active');
    // Reset form
    document.getElementById('newCardChapter').value = '';
    document.getElementById('newCardTopic').value = '';
    document.getElementById('newCardQuestion').value = '';
    document.getElementById('newCardAnswer').value = '';
  }

  function saveNewCard() {
    const subject = document.getElementById('newCardSubject').value;
    const chapter = document.getElementById('newCardChapter').value.trim();
    const topic = document.getElementById('newCardTopic').value.trim();
    const question = document.getElementById('newCardQuestion').value.trim();
    const answer = document.getElementById('newCardAnswer').value.trim();

    if (!question || !answer) {
      alert('问题和答案不能为空！');
      return;
    }

    const card = SM2Engine.createCard({
      question, answer, subject, chapter, topic,
      difficulty: 3,
      source: 'manual',
      tags: topic ? topic.split(/[,，、\s]+/) : []
    });

    allCards.push(card);
    SM2Engine.saveCards(allCards);
    hideAddCardModal();
    refreshUI();
  }

  // ─── 导出备份 ─────────────────────────────────────────────
  function exportBackup() {
    SM2Engine.exportCards(allCards);
  }

  // ─── 重置数据（危险操作）────────────────────────────────────
  function resetAllData() {
    if (!confirm('⚠️ 确定要清除所有数据并重新加载吗？此操作不可恢复！')) return;
    localStorage.removeItem('pku_memory_tree_cards');
    localStorage.removeItem('pku_memory_tree_logs');
    location.reload();
  }

  // ─── 初始化启动 ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  return {
    startReview,
    flipCard,
    gradeCard,
    exitReview,
    showAddCardModal,
    hideAddCardModal,
    saveNewCard,
    requestHint,
    requestExplanation,
    requestMasterClass,
    refreshUI,
    exportBackup,
    resetAllData
  };
})();
