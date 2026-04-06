/**
 * 论道殿 · 每日题目自动更新服务
 * ========================================
 * 通过中转阁调用 Perplexity + Gemini，每日生成新的：
 * 1. 卡牌池惩罚题（基于最新时政/真题趋势）
 * 2. 巩固题（覆盖薄弱知识点）
 * 
 * 缓存策略：每日首次调用后缓存到 localStorage，当天不重复请求
 */

const DailyUpdate = (() => {

  const RELAY = 'https://pku-api-relay.onrender.com';
  const CACHE_PREFIX = 'pku_debate_daily_';

  // ─── 每日政治时政题更新 ────────────────────────────────
  async function fetchPoliticsQuiz() {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${CACHE_PREFIX}politics_${today}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log('[论道殿] 使用缓存的今日政治题');
      return JSON.parse(cached);
    }

    try {
      const res = await fetch(`${RELAY}/perplexity/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sonar-reasoning-pro',
          messages: [
            { role: 'system', content: '你是考研政治命题专家。生成骗子酒馆风格的政治辨析题。严格输出JSON。' },
            { role: 'user', content: `今天是${today}。基于最近一周的时政热点，生成6道政治辨析选择题。
每题要求：混合正确和错误的理论表述，让学生辨别真假。
类型分布：辩证法2题 + 认识论2题 + 唯物史观2题。

输出JSON数组：
[{
  "type": "dialectics|epistemology|historical",
  "q": "题干",
  "opts": ["选项A(正确答案放第一个)", "选项B", "选项C", "选项D"],
  "ans": 0,
  "diff": 1-3,
  "source": "时政来源"
}]
只输出JSON。` }
          ],
          max_tokens: 3000
        })
      });

      if (!res.ok) throw new Error(`Perplexity ${res.status}`);
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON');
      const questions = JSON.parse(match[0]);
      localStorage.setItem(cacheKey, JSON.stringify(questions));
      console.log(`[论道殿] Perplexity 生成 ${questions.length} 道今日政治题`);
      return questions;
    } catch (e) {
      console.warn('[论道殿] 政治题更新失败:', e.message);
      return [];
    }
  }

  // ─── 每日英语推断题更新 ────────────────────────────────
  async function fetchEnglishQuiz() {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${CACHE_PREFIX}english_${today}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log('[论道殿] 使用缓存的今日英语题');
      return JSON.parse(cached);
    }

    try {
      const res = await fetch(`${RELAY}/gemini/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [{ role: 'user', content: `Generate 6 English reading inference quiz questions for Chinese graduate exam prep.
Types: inference(2), attitude(2), vocab(2).

Output strict JSON:
[{
  "type": "inference|attitude|vocab",
  "q": "Question in English",
  "opts": ["Correct answer first", "Wrong B", "Wrong C", "Wrong D"],
  "ans": 0,
  "diff": 1-3
}]
Only JSON, no extra text.` }],
          max_tokens: 2000
        })
      });

      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON');
      const questions = JSON.parse(match[0]);
      localStorage.setItem(cacheKey, JSON.stringify(questions));
      console.log(`[论道殿] Gemini 生成 ${questions.length} 道今日英语题`);
      return questions;
    } catch (e) {
      console.warn('[论道殿] 英语题更新失败:', e.message);
      return [];
    }
  }

  // ─── 注入今日题目到题库 ────────────────────────────────
  async function injectDailyQuestions() {
    const [polQuiz, engQuiz] = await Promise.all([
      fetchPoliticsQuiz(),
      fetchEnglishQuiz()
    ]);

    let injected = 0;

    // 注入政治惩罚题
    if (polQuiz.length > 0) {
      polQuiz.forEach(q => {
        const type = q.type || 'dialectics';
        if (!window._dailyPoliticsQuiz) window._dailyPoliticsQuiz = {};
        if (!window._dailyPoliticsQuiz[type]) window._dailyPoliticsQuiz[type] = [];
        window._dailyPoliticsQuiz[type].push(q);
        injected++;
      });
    }

    // 注入英语惩罚题
    if (engQuiz.length > 0) {
      engQuiz.forEach(q => {
        const type = q.type || 'inference';
        if (!window._dailyEnglishQuiz) window._dailyEnglishQuiz = {};
        if (!window._dailyEnglishQuiz[type]) window._dailyEnglishQuiz[type] = [];
        window._dailyEnglishQuiz[type].push(q);
        injected++;
      });
    }

    console.log(`[论道殿] 今日注入 ${injected} 道新题`);
    return injected;
  }

  // ─── 获取题目（优先使用今日题，回退到静态题库）─────────
  function getDailyQuiz(type, diff) {
    // 先查今日动态题
    const dailyPol = window._dailyPoliticsQuiz?.[type];
    const dailyEng = window._dailyEnglishQuiz?.[type];
    const daily = dailyPol || dailyEng || [];

    if (daily.length > 0) {
      const filtered = diff ? daily.filter(q => q.diff <= diff) : daily;
      if (filtered.length > 0) {
        return filtered[Math.floor(Math.random() * filtered.length)];
      }
    }

    // 回退到静态题库
    return DebateData.getQuiz(type, diff);
  }

  // ─── 清理过期缓存 ─────────────────────────────────────
  function cleanOldCache() {
    const today = new Date().toISOString().split('T')[0];
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX) && !key.includes(today)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    if (keysToRemove.length) console.log(`[论道殿] 清理 ${keysToRemove.length} 条过期缓存`);
  }

  // ─── 初始化（页面加载时调用）─────────────────────────
  async function init() {
    cleanOldCache();
    const count = await injectDailyQuestions();
    return count;
  }

  return { init, getDailyQuiz, fetchPoliticsQuiz, fetchEnglishQuiz };
})();
