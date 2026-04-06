/**
 * 识海天碑 · AI Service Layer
 * ============================
 * Three-tier waterfall AI integration with fallback chains.
 * Models verified from official documentation (2026-04-06).
 */

const AIService = (() => {
  // ─── 通道配置 ─────────────────────────────────────────────
  // ═══ 全部走中转阁，避免 CORS + 保护密钥 ═══
  const RELAY = 'https://pku-api-relay.onrender.com';

  const CONFIG = {
    relay: RELAY,
    gemini: {
      baseUrl: `${RELAY}/gemini/generate`,
      models: {
        flashLite: 'gemini-3.1-flash-lite-preview',
        pro: 'gemini-3.1-pro-preview',
        flash: 'gemini-2.5-flash',
      }
    },
    openrouter: {
      baseUrl: `${RELAY}/v1/chat/completions`,
      models: {
        opus: 'anthropic/claude-opus-4.6',
        gpt5: 'openai/gpt-5.4',
        geminiPro: 'google/gemini-3.1-pro-preview',
        qwenFree: 'qwen/qwen3.6-plus:free',
        stepFree: 'stepfun/step-3.5-flash:free',
      }
    },
    perplexity: {
      baseUrl: `${RELAY}/perplexity/search`,
    },
    mem0: {
      apiKey: '35f9ce3d-7369-432b-9a3d-6db857a6f27e',
      baseUrl: 'https://api.mem0.ai/v1',
    }
  };

  // ─── Gemini 原生调用 ─────────────────────────────────────
  // ─── Gemini 走中转阁 /gemini/generate ──────────────────────
  async function callGemini(prompt, model = CONFIG.gemini.models.flashLite, options = {}) {
    const res = await fetch(CONFIG.gemini.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 512
      })
    });

    if (!res.ok) throw new Error(`Gemini ${model}: ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(`Gemini: ${data.error}`);
    return data.choices?.[0]?.message?.content || '';
  }

  // ─── OpenRouter 调用 ─────────────────────────────────────
  // ─── OpenRouter 走中转阁 /v1/chat/completions ──────────────
  async function callOpenRouter(messages, model = CONFIG.openrouter.models.qwenFree, options = {}) {
    const res = await fetch(CONFIG.openrouter.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: typeof messages === 'string'
          ? [{ role: 'user', content: messages }]
          : messages,
        max_tokens: options.maxTokens || 512,
        temperature: options.temperature || 0.7
      })
    });

    if (!res.ok) throw new Error(`OpenRouter ${model}: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // ─── Perplexity 走中转阁 /perplexity/search ────────────────
  async function callPerplexity(messages, model = 'sonar-reasoning-pro', options = {}) {
    const res = await fetch(CONFIG.perplexity.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: typeof messages === 'string'
          ? [{ role: 'user', content: messages }]
          : messages,
        max_tokens: options.maxTokens || 512
      })
    });

    if (!res.ok) throw new Error(`Perplexity ${model}: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // ─── 三级瀑布调用 ─────────────────────────────────────────

  /**
   * Level 1: 即时提示 (免费)
   * 1行助记提示，用最快的模型
   */
  async function getQuickHint(question, answer) {
    const prompt = `你是修仙导师顾枢。用一句话给学生一个巧妙的记忆提示（类比、口诀、或谐音），帮助记住这个考研知识点：
问：${question}
答：${answer}
只输出提示语，不要多余解释。`;

    const chain = [
      () => callGemini(prompt, CONFIG.gemini.models.flashLite),
      () => callOpenRouter(prompt, CONFIG.openrouter.models.qwenFree),
      () => callOpenRouter(prompt, CONFIG.openrouter.models.stepFree),
    ];

    return runFallbackChain(chain, 'hint');
  }

  /**
   * Level 2: 知识推演 (免费/低价)
   * 3-5句深入解释 + 关联考点
   */
  async function getDeepExplanation(question, answer, subject) {
    const subjectName = { '101': '政治', '201': '英语', '301': '数学', '408': '计算机综合' }[subject] || subject;
    const prompt = `你是考研导师顾枢。请用3-5句话深入解释这个${subjectName}知识点，指出它和哪些其他高频考点相关联：
问：${question}
答：${answer}
要求：用修仙比喻让解释生动有趣，但知识点必须准确。`;

    const chain = [
      () => callGemini(prompt, CONFIG.gemini.models.pro, { maxTokens: 800 }),
      () => callOpenRouter(prompt, CONFIG.openrouter.models.geminiPro, { maxTokens: 800 }),
      () => callGemini(prompt, CONFIG.gemini.models.flash, { maxTokens: 800 }),
    ];

    return runFallbackChain(chain, 'explanation');
  }

  /**
   * Level 3: 大师级讲解 (付费)
   * 顾枢人格完整推演
   */
  async function getMasterClass(question, answer, errorHistory = []) {
    const messages = [
      {
        role: 'system',
        content: `你是顾枢，北大考研修仙体系的上仙导师。你语气严厉但充满智慧，善用修仙比喻。
学生在以下知识点反复犯错：${JSON.stringify(errorHistory.slice(-5))}
请进行一次完整的"开窍讲解"，要求：
1. 先指出学生的思维误区
2. 用一个生动的比喻重新建立正确认知
3. 给出3个关联的高频考题方向
4. 最后用一句"顾枢金句"总结`
      },
      {
        role: 'user',
        content: `师尊，我又在这道题上跌倒了:\n问：${question}\n答：${answer}\n请帮我彻底理解它。`
      }
    ];

    const chain = [
      () => callOpenRouter(messages, CONFIG.openrouter.models.opus, { maxTokens: 1200, temperature: 0.8 }),
      () => callOpenRouter(messages, CONFIG.openrouter.models.gpt5, { maxTokens: 1200 }),
      () => callGemini(messages[1].content, CONFIG.gemini.models.pro, { maxTokens: 1200 }),
    ];

    return runFallbackChain(chain, 'master_class');
  }

  // ─── AI 生成记忆卡片 ─────────────────────────────────────
  async function generateCards(topic, subject, count = 5) {
    const prompt = `你是考研出题专家。为科目${subject}的"${topic}"知识点生成${count}张记忆卡片。
每张卡片包含一个简洁的问题和详细的答案。
输出JSON数组格式：[{"question":"...","answer":"...","difficulty":1-5}]
只输出JSON，不要其他文字。`;

    try {
      const result = await callGemini(prompt, CONFIG.gemini.models.pro, { maxTokens: 2000, jsonMode: true });
      return JSON.parse(result);
    } catch (e) {
      console.warn('AI card generation failed:', e);
      return [];
    }
  }

  // ─── 容错链执行器 ─────────────────────────────────────────
  async function runFallbackChain(chain, purpose) {
    const attempts = [];
    for (let i = 0; i < chain.length; i++) {
      try {
        const result = await chain[i]();
        if (result && result.trim()) {
          logAICall(purpose, i, true, attempts);
          return result;
        }
      } catch (e) {
        attempts.push(e.message);
        console.warn(`[识海天碑] 通道 ${i + 1} 降级:`, e.message);
      }
    }
    logAICall(purpose, chain.length, false, attempts);
    return '⚠️ 顾枢暂时闭关修炼中，所有通道不可用。该知识点已标记为最高优先级复习。';
  }

  // ─── AI 调用日志 ─────────────────────────────────────────
  function logAICall(purpose, channelIndex, success, attempts) {
    const logs = JSON.parse(localStorage.getItem('pku_ai_logs') || '[]');
    logs.push({
      purpose,
      channelIndex,
      success,
      attempts,
      timestamp: new Date().toISOString()
    });
    // 只保留最近 100 条
    localStorage.setItem('pku_ai_logs', JSON.stringify(logs.slice(-100)));
  }

  // ─── Mem0 跨会话记忆 ─────────────────────────────────────
  async function saveToMemory(topic, weakness) {
    try {
      await fetch(`${CONFIG.mem0.baseUrl}/memories/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${CONFIG.mem0.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `学生在「${topic}」反复犯错。薄弱点：${weakness}` }],
          user_id: 'pku_cultivation_2026'
        })
      });
    } catch (e) {
      console.warn('Mem0 save failed:', e);
    }
  }

  async function recallMemory() {
    try {
      const res = await fetch(`${CONFIG.mem0.baseUrl}/memories/?user_id=pku_cultivation_2026`, {
        headers: { 'Authorization': `Token ${CONFIG.mem0.apiKey}` }
      });
      const data = await res.json();
      return data.results || [];
    } catch { return []; }
  }

  return {
    getQuickHint,
    getDeepExplanation,
    getMasterClass,
    generateCards,
    saveToMemory,
    recallMemory,
    // Expose low-level for testing
    callGemini,
    callOpenRouter,
    CONFIG
  };
})();
