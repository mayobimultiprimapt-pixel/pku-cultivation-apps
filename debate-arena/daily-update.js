/**
 * 论道殿 · 全科每日自动更新服务 v3.0
 * ========================================
 * 通过中转阁调用 Perplexity + Gemini，每日生成：
 * - 101 政治: 10道辨析题 (Perplexity sonar-reasoning-pro)
 * - 201 英语: 10道推断题 (Gemini)
 * - 301 数学: 10道判断题 (Gemini)  
 * - 408 计算机: 10道选择题 (Gemini)
 * 
 * 缓存策略：localStorage + Global_Vault 双写
 * 题量对齐：每科≥10道，配合静态题库达到考卷水平
 */

const DailyUpdate = (() => {

  const RELAY = 'https://pku-api-relay.onrender.com';
  const CACHE_PREFIX = 'pku_debate_daily_';

  // ─── 通用Fetch + 缓存 ─────────────────────────────────
  async function fetchWithCache(subject, cacheKey, fetchFn) {
    const today = new Date().toISOString().split('T')[0];
    const fullKey = `${CACHE_PREFIX}${subject}_${today}`;
    const cached = localStorage.getItem(fullKey);
    if (cached) {
      console.log(`[论道殿] 使用缓存的今日${subject}题`);
      return JSON.parse(cached);
    }

    try {
      const questions = await fetchFn();
      if (questions.length > 0) {
        localStorage.setItem(fullKey, JSON.stringify(questions));
        // 双写Global_Vault，让其他模块也能用
        mergeToVault(subject, questions);
      }
      return questions;
    } catch(e) {
      console.warn(`[论道殿] ${subject}题更新失败:`, e.message);
      return [];
    }
  }

  // ─── 写入Global_Vault ─────────────────────────────────
  function mergeToVault(subject, newQuestions) {
    try {
      const key = 'Global_Vault_' + subject;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      // 去重（按题干前30字）
      const existingSet = new Set(existing.map(q => (q.q||'').substring(0,30)));
      const unique = newQuestions.filter(q => !existingSet.has((q.q||'').substring(0,30)));
      if (unique.length > 0) {
        const merged = [...unique, ...existing];
        localStorage.setItem(key, JSON.stringify(merged));
        console.log(`[论道殿] 金库写入: ${subject} +${unique.length}道 (总${merged.length})`);
      }
    } catch(e) {
      console.warn('[论道殿] 金库写入失败:', e);
    }
  }

  // ─── 101 政治时政题 ────────────────────────────────────
  async function fetchPoliticsQuiz() {
    return fetchWithCache('101', 'politics', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${RELAY}/perplexity/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sonar-reasoning-pro',
          messages: [
            { role: 'system', content: '你是考研政治命题专家。生成考研政治辨析选择题。严格输出JSON。' },
            { role: 'user', content: `今天是${today}。生成10道考研政治辨析选择题。
类型分布：马原3题(辩证法/认识论/唯物史观) + 毛中特3题 + 习思2题 + 时政2题。
混合正确和错误的理论表述，难度梯度1-3。

输出JSON数组：
[{
  "q": "题干",
  "o": ["正确答案", "错误B", "错误C", "错误D"],
  "a": 0,
  "difficulty": 1-3,
  "type": "marxism|mao|xi|current",
  "chapter": "考点章节",
  "analysis": "解析"
}]
只输出JSON。` }
          ],
          max_tokens: 4000
        })
      });
      if (!res.ok) throw new Error(`Perplexity ${res.status}`);
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON');
      return JSON.parse(match[0]);
    });
  }

  // ─── 201 英语推断题 ────────────────────────────────────
  async function fetchEnglishQuiz() {
    return fetchWithCache('201', 'english', async () => {
      const res = await fetch(`${RELAY}/gemini/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [{ role: 'user', content: `Generate 10 English vocabulary and reading inference questions for Chinese graduate exam prep.
Types: vocabulary(4), inference(3), attitude(3).
Each item tests a subtle distinction that trips up Chinese students.

Output strict JSON:
[{
  "q": "Question stem",
  "o": ["Correct answer", "Wrong B", "Wrong C", "Wrong D"],
  "a": 0,
  "difficulty": 1-3,
  "type": "vocab|inference|attitude",
  "chapter": "Topic area",
  "analysis": "Brief explanation"
}]
Only JSON.` }],
          max_tokens: 3000
        })
      });
      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON');
      return JSON.parse(match[0]);
    });
  }

  // ─── 301 数学判断题 ────────────────────────────────────
  async function fetchMathQuiz() {
    return fetchWithCache('301', 'math', async () => {
      const res = await fetch(`${RELAY}/gemini/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [{ role: 'user', content: `生成10道考研数学一判断选择题。
类型分布：高等数学4题(极限/导数/积分/级数) + 线性代数3题(矩阵/特征值/向量空间) + 概率统计3题。
每题设计一个常见陷阱或易混淆概念。

输出JSON:
[{
  "q": "题干",
  "o": ["正确答案", "错误B", "错误C", "错误D"],
  "a": 0,
  "difficulty": 1-3,
  "type": "calculus|algebra|probability",
  "chapter": "知识点",
  "analysis": "解析"
}]
只输出JSON。` }],
          max_tokens: 3000
        })
      });
      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON');
      return JSON.parse(match[0]);
    });
  }

  // ─── 408 计算机选择题 ──────────────────────────────────
  async function fetchCSQuiz() {
    return fetchWithCache('408', 'cs', async () => {
      const res = await fetch(`${RELAY}/gemini/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [{ role: 'user', content: `生成10道408计算机综合选择题。
类型分布：数据结构3题(树/图/排序/查找) + 计算机组成2题 + 操作系统3题(进程/内存/文件) + 计算机网络2题(TCP/IP/HTTP)。
题目源自真题风格，难度梯度1-3。

输出JSON:
[{
  "q": "题干",
  "o": ["正确答案", "错误B", "错误C", "错误D"],
  "a": 0,
  "difficulty": 1-3,
  "type": "ds|arch|os|network",
  "chapter": "知识点",
  "analysis": "解析"
}]
只输出JSON。` }],
          max_tokens: 3000
        })
      });
      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON');
      return JSON.parse(match[0]);
    });
  }

  // ─── 全科注入 ─────────────────────────────────────────
  async function injectDailyQuestions() {
    console.log('[论道殿] 开始全科自动检索最新考题...');
    const results = await Promise.allSettled([
      fetchPoliticsQuiz(),
      fetchEnglishQuiz(),
      fetchMathQuiz(),
      fetchCSQuiz(),
    ]);

    let total = 0;
    results.forEach((r, i) => {
      const subject = ['101','201','301','408'][i];
      if (r.status === 'fulfilled' && r.value.length > 0) {
        total += r.value.length;
        console.log(`[论道殿] ${subject}: +${r.value.length}道`);
      } else {
        console.warn(`[论道殿] ${subject}: 获取失败或为空`);
      }
    });

    console.log(`[论道殿] 全科注入完成: ${total}道新题已入库`);
    return total;
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

  // ─── 金库存量报告 ─────────────────────────────────────
  function getVaultReport() {
    return ['101','201','301','408'].map(sub => {
      const count = CaseDB.getVaultCount(sub);
      return { subject: sub, count, info: CaseDB.getSubjectInfo(sub) };
    });
  }

  // ─── 初始化 ─────────────────────────────────────────
  async function init() {
    cleanOldCache();
    const count = await injectDailyQuestions();
    const report = getVaultReport();
    console.log('[论道殿] 金库存量:', report.map(r => `${r.subject}:${r.count}道`).join(' | '));
    return count;
  }

  return { init, getVaultReport, fetchPoliticsQuiz, fetchEnglishQuiz, fetchMathQuiz, fetchCSQuiz };
})();
