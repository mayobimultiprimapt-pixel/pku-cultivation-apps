/**
 * 万法归宗·题库中转层 v1.0
 * 所有游戏共用此模块从中转阁拉题
 * 失败时自动回退到本地题库（零破坏）
 */
const RELAY_BASE = 'https://pku-api-relay.onrender.com';

/**
 * 从中转阁拉取题目
 * @param {string} subject - 科目 '101'|'201'|'301'|'408'
 * @param {object} opts - { count, type, fallback[] }
 * @returns {Promise<{questions, source}>}
 */
async function fetchFromRelay(subject, opts = {}) {
  const { count = 20, type = null, fallback = [] } = opts;
  try {
    const params = new URLSearchParams({ count });
    if (type) params.set('type', type);
    const resp = await fetch(`${RELAY_BASE}/feed/paper/${subject}?${params}`, {
      signal: AbortSignal.timeout(6000) // 6秒超时
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.success && data.questions && data.questions.length > 0) {
      console.log(`[中转阁] ✅ ${subject} 拉题成功 | ${data.questions.length}题 | 来源: ${data.source}`);
      return { questions: data.questions, source: data.source, fromRelay: true };
    }
    throw new Error(data.error || '空响应');
  } catch (e) {
    console.warn(`[中转阁] ⚠️ ${subject} 拉题失败，回退本地题库 | ${e.message}`);
    // 回退本地题库
    const local = fallback.length > 0 ? fallback : [];
    return { questions: local, source: 'local-fallback', fromRelay: false };
  }
}

/**
 * 智能题库加载器 — 新旧题库合并，中转阁优先
 * @param {string} subject
 * @param {Array} localBank - 本地题库数组（原始格式）
 * @param {object} opts
 */
async function loadSmartBank(subject, localBank = [], opts = {}) {
  const relayResult = await fetchFromRelay(subject, { ...opts, fallback: localBank });
  if (relayResult.fromRelay && relayResult.questions.length > 0) {
    // 中转阁有数据：合并本地题库（去重），中转阁优先
    const relayIds = new Set(relayResult.questions.map(q => q.id || q.stem || q.q));
    const uniqueLocal = localBank.filter(q => !relayIds.has(q.id || q.stem || q.q));
    const merged = [...relayResult.questions, ...uniqueLocal];
    console.log(`[中转阁] 📚 合并题库: 中转阁${relayResult.questions.length}题 + 本地${uniqueLocal.length}题 = ${merged.length}题`);
    return { questions: merged, source: relayResult.source, fromRelay: true };
  }
  return { questions: localBank, source: 'local', fromRelay: false };
}

/**
 * 格式化适配器 — 将中转阁格式转为游戏所需的简化格式
 * 中转阁: { stem, options, answer, type, analysis }
 * 游戏格式: { q, o, a } (battleground/ghost-dorm使用)
 */
function adaptQuestion(q) {
  // 已经是简化格式（battleground）
  if (q.q !== undefined) return q;
  // 中转阁/题库格式 → 简化格式
  const optionLetters = (q.options || []).map(o => o.replace(/^[A-D][\.、]\s*/, ''));
  // answer: 'A','B','AB'等 → 索引
  let answerIdx = 0;
  if (typeof q.answer === 'string') {
    const letter = q.answer.trim().toUpperCase()[0];
    answerIdx = ['A','B','C','D'].indexOf(letter);
    if (answerIdx < 0) answerIdx = 0;
  } else if (typeof q.answer === 'number') {
    answerIdx = q.answer;
  }
  return {
    q: q.stem || q.question || q.q || '',
    o: optionLetters,
    a: answerIdx,
    type: q.type || 'single',
    analysis: q.analysis || '',
    chapter: q.chapter || '',
    difficulty: q.difficulty || 2,
    // 保留原始字段
    id: q.id,
    stem: q.stem,
    options: q.options,
    answer: q.answer
  };
}

/**
 * 公开接口：为游戏提供题目（含适配）
 */
window.RelayQuestions = {
  fetch: fetchFromRelay,
  loadSmart: loadSmartBank,
  adapt: adaptQuestion,
  relay: RELAY_BASE,

  /**
   * 给游戏用的简单接口
   * @param {string} subject  
   * @param {Array} localBank 本地题库
   * @param {Function} onReady(questions, source) 回调
   */
  init(subject, localBank, onReady) {
    loadSmartBank(subject, localBank || []).then(result => {
      const adapted = result.questions.map(adaptQuestion);
      // 随机打乱
      for (let i = adapted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [adapted[i], adapted[j]] = [adapted[j], adapted[i]];
      }
      if (onReady) onReady(adapted, result.source);
    }).catch(e => {
      console.error('[中转阁] init失败，使用本地题库', e);
      if (onReady) onReady((localBank || []).map(adaptQuestion), 'local-error-fallback');
    });
  }
};
