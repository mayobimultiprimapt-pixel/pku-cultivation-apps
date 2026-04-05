/**
 * PKU API 中转隧道 + 数据中枢
 * 1. CORS 中转 - OpenRouter/Gemini/Perplexity
 * 2. 自动采集 - 定时抓取情报+出题
 * 3. 投喂游戏 - 统一题库API供所有游戏调用
 */
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

// ---- 环境变量密钥 ----
const KEYS = {
  OPENROUTER: process.env.OPENROUTER_API_KEY || '',
  GEMINI: process.env.GEMINI_API_KEY || '',
  PERPLEXITY: process.env.PERPLEXITY_API_KEY || ''
};

// ---- 内存题库 (服务端持久存储) ----
const VAULT = {
  questions: [],      // 所有采集的题目
  intelligence: [],   // 今日情报
  lastCollection: null,
  stats: { total: 0, today: 0, bySubject: {}, bySource: {} }
};

// =============================================
// PART 1: API 中转隧道 (原有功能)
// =============================================

// ---- 健康检查 ----
app.get('/', (req, res) => {
  res.json({
    status: '🚀 PKU API 隧道 + 数据中枢',
    version: '2.0.0',
    channels: {
      openrouter: !!KEYS.OPENROUTER,
      gemini: !!KEYS.GEMINI,
      perplexity: !!KEYS.PERPLEXITY
    },
    vault: {
      totalQuestions: VAULT.questions.length,
      todayIntel: VAULT.intelligence.length,
      lastCollection: VAULT.lastCollection
    },
    timestamp: new Date().toISOString()
  });
});

// ---- 通用 OpenRouter 中转 ----
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens } = req.body;
    const key = KEYS.OPENROUTER;
    if (!key) return res.status(500).json({ error: 'OpenRouter key not configured' });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io',
        'X-Title': 'PKU Exam Vault'
      },
      body: JSON.stringify({ model, messages, temperature: temperature || 0.7, max_tokens: max_tokens || 4096 })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[OR] ${model} ${response.status}:`, JSON.stringify(data).substring(0, 200));
      return res.status(response.status).json(data);
    }

    if (data.choices?.[0]?.message?.content) {
      data.choices[0].message.content = data.choices[0].message.content
        .replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }

    console.log(`[OR] ✅ ${model} => ${data.choices?.[0]?.message?.content?.length || 0} chars`);
    res.json(data);
  } catch (err) {
    console.error('[OR] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Gemini 中转 ----
app.post('/gemini/generate', async (req, res) => {
  try {
    const { model, messages, max_tokens } = req.body;
    const key = KEYS.GEMINI;
    if (!key) return res.status(500).json({ error: 'Gemini key not configured' });

    const text = await callGemini(model || 'gemini-3.1-pro-preview', messages, max_tokens || 4096);
    res.json({ choices: [{ message: { role: 'assistant', content: text } }], model });
  } catch (err) {
    console.error('[Gemini] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Perplexity 中转 ----
app.post('/perplexity/search', async (req, res) => {
  try {
    const { model, messages, max_tokens } = req.body;
    const key = KEYS.PERPLEXITY;
    if (!key) return res.status(500).json({ error: 'Perplexity key not configured' });

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model: model || 'sonar-pro', messages, max_tokens: max_tokens || 4096 })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    console.log(`[PPX] ✅ sonar-pro => ${data.choices?.[0]?.message?.content?.length || 0} chars`);
    res.json(data);
  } catch (err) {
    console.error('[PPX] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// PART 2: 自动采集中枢
// =============================================

const SUBJECTS = {
  '101': '政治 — 马原/毛中特/史纲/思修',
  '201': '英语 — 阅读/翻译/写作',
  '301': '数学 — 高数/线代/概率论',
  '408': '计算机 — 数据结构/OS/网络/组成原理'
};

const MODELS_CONFIG = [
  { id: 'deepseek-r1', model: 'deepseek/deepseek-r1-0528', name: 'DeepSeek-R1', type: 'openrouter' },
  { id: 'claude-4.5', model: 'anthropic/claude-sonnet-4.5', name: 'Claude-4.5', type: 'openrouter' },
  { id: 'gpt-4.1', model: 'openai/gpt-4.1', name: 'GPT-4.1', type: 'openrouter' },
  { id: 'ds-v3.2', model: 'deepseek/deepseek-v3.2', name: 'DeepSeek-V3.2', type: 'openrouter' },
  { id: 'gemini', model: 'gemini-3.1-pro-preview', name: 'Gemini-3.1-Pro', type: 'gemini' }
];

// 内部调用 Gemini
async function callGemini(model, messages, maxTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEYS.GEMINI}`;
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }]
  }));
  const sysMsg = messages.find(m => m.role === 'system');
  const body = { contents, generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens } };
  if (sysMsg) body.system_instruction = { parts: [{ text: sysMsg.content }] };

  const response = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${JSON.stringify(data).substring(0, 100)}`);
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

// 内部调用 OpenRouter
async function callOpenRouter(model, messages, maxTokens) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEYS.OPENROUTER}`,
      'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io',
      'X-Title': 'PKU Auto Collector'
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: maxTokens || 4096 })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`OR ${response.status}: ${data.error?.message || ''}`);
  let text = data.choices?.[0]?.message?.content || '';
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

// 统一内部 AI 调用
async function callAI(modelConfig, messages, maxTokens) {
  if (modelConfig.type === 'gemini') return callGemini(modelConfig.model, messages, maxTokens);
  return callOpenRouter(modelConfig.model, messages, maxTokens);
}

// 采集情报
async function collectIntelligence(subject) {
  console.log(`[INTEL] 📡 开始搜集 ${SUBJECTS[subject]} 情报...`);
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.PERPLEXITY}` },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: `搜索2025-2026年中国考研${SUBJECTS[subject]}最新命题趋势和热点话题,包括:1)最新政策变化 2)高频考点 3)名校真题风向 4)学术前沿热点。用中文详细总结。` }],
        max_tokens: 4096
      })
    });
    const data = await response.json();
    const intel = data.choices?.[0]?.message?.content || '';
    if (intel) {
      const entry = {
        id: `intel-${subject}-${Date.now()}`,
        subject, content: intel,
        timestamp: new Date().toISOString(),
        source: 'Perplexity-sonar-pro'
      };
      VAULT.intelligence.push(entry);
      console.log(`[INTEL] ✅ ${subject} 情报 ${intel.length} 字`);
      return entry;
    }
  } catch (err) {
    console.error(`[INTEL] ❌ ${subject} 失败:`, err.message);
  }
  return null;
}

// 采集题目
async function collectQuestions(subject, count, modelConfig) {
  console.log(`[QGEN] 📝 ${modelConfig.name} → ${subject} ${count}题...`);
  const prompt = `请生成${count}道中国研究生考试${SUBJECTS[subject]}的高质量模拟题，混合单选、多选和判断题。
严格以JSON数组格式输出，每题包含: question(题目), options(选项数组), answer(正确答案), type(single/multi/judge), analysis(解析), difficulty(1-5)。
第一个字符必须是[，最后一个字符必须是]。禁止输出markdown标记或任何多余文字。`;

  try {
    const raw = await callAI(modelConfig, [
      { role: 'system', content: '你是考研命题专家。严格要求：直接输出JSON数组，禁止输出任何多余文字。第一个字符必须是[，最后一个字符必须是]。' },
      { role: 'user', content: prompt }
    ], 8000);

    // Parse JSON
    let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array found');

    let parsed;
    try { parsed = JSON.parse(match[0]); } catch {
      parsed = JSON.parse(match[0].replace(/,\s*([}\]])/g, '$1'));
    }

    const questions = parsed.map((q, i) => ({
      ...q,
      id: `auto-${subject}-${modelConfig.id}-${Date.now()}-${i}`,
      subject,
      source: modelConfig.name,
      generated: new Date().toISOString(),
      autoCollected: true
    }));

    VAULT.questions.push(...questions);
    VAULT.stats.total += questions.length;
    VAULT.stats.bySubject[subject] = (VAULT.stats.bySubject[subject] || 0) + questions.length;
    VAULT.stats.bySource[modelConfig.name] = (VAULT.stats.bySource[modelConfig.name] || 0) + questions.length;

    console.log(`[QGEN] ✅ ${modelConfig.name} → +${questions.length}题 | 总库: ${VAULT.questions.length}`);
    return questions;
  } catch (err) {
    console.error(`[QGEN] ❌ ${modelConfig.name} → ${err.message}`);
    return [];
  }
}

// 全量采集 (情报+出题)
async function runFullCollection() {
  console.log('\n=== 🔥 全量采集启动 ===');
  const startTime = Date.now();
  const results = { intel: [], questions: [] };

  // Phase 1: 搜集情报
  for (const subj of Object.keys(SUBJECTS)) {
    if (KEYS.PERPLEXITY) {
      const intel = await collectIntelligence(subj);
      if (intel) results.intel.push(intel);
    }
  }

  // Phase 2: 全模型出题
  for (const subj of Object.keys(SUBJECTS)) {
    for (const mc of MODELS_CONFIG) {
      const q = await collectQuestions(subj, 10, mc);
      results.questions.push(...q);
      await new Promise(r => setTimeout(r, 1000)); // 防止限速
    }
  }

  VAULT.lastCollection = new Date().toISOString();
  VAULT.stats.today = results.questions.length;

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== ✅ 采集完毕 | ${results.intel.length}条情报 + ${results.questions.length}道题 | 耗时${elapsed}s ===\n`);
  return results;
}

// ---- 手动触发采集 ----
app.post('/hub/collect', async (req, res) => {
  const { subject, count, model } = req.body;
  try {
    if (subject && model) {
      // 指定科目+模型采集
      const mc = MODELS_CONFIG.find(m => m.id === model) || MODELS_CONFIG[0];
      const questions = await collectQuestions(subject, count || 10, mc);
      return res.json({ success: true, count: questions.length, questions });
    }
    // 全量采集
    const results = await runFullCollection();
    res.json({ success: true, ...results, vault: VAULT.stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- 搜集情报 ----
app.post('/hub/intel', async (req, res) => {
  const { subject } = req.body;
  try {
    if (subject) {
      const intel = await collectIntelligence(subject);
      return res.json({ success: !!intel, intel });
    }
    // 搜集所有科目
    const results = [];
    for (const s of Object.keys(SUBJECTS)) {
      const intel = await collectIntelligence(s);
      if (intel) results.push(intel);
    }
    res.json({ success: true, count: results.length, intelligence: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// PART 3: 游戏投喂 API
// =============================================

// ---- 获取题目 (供游戏调用) ----
app.get('/feed/questions', (req, res) => {
  const { subject, count, type, difficulty, random } = req.query;
  let pool = [...VAULT.questions];

  if (subject) pool = pool.filter(q => q.subject === subject);
  if (type) pool = pool.filter(q => q.type === type);
  if (difficulty) pool = pool.filter(q => q.difficulty === parseInt(difficulty));

  // 随机打乱
  if (random !== 'false') {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }

  const n = Math.min(parseInt(count) || 10, pool.length);
  res.json({
    success: true,
    total: VAULT.questions.length,
    returned: n,
    questions: pool.slice(0, n)
  });
});

// ---- 接收前端采集的题目 (题库站投喂) ----
app.post('/feed/upload', (req, res) => {
  const { questions, subject, source } = req.body;
  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'questions array required' });
  }

  const processed = questions.map((q, i) => ({
    ...q,
    id: q.id || `upload-${Date.now()}-${i}`,
    subject: q.subject || subject || '101',
    source: q.source || source || 'manual-upload',
    uploaded: new Date().toISOString()
  }));

  VAULT.questions.push(...processed);
  VAULT.stats.total += processed.length;

  console.log(`[FEED] 📥 接收 ${processed.length} 题 | 总库: ${VAULT.questions.length}`);
  res.json({ success: true, added: processed.length, total: VAULT.questions.length });
});

// ---- 获取今日情报 ----
app.get('/feed/intel', (req, res) => {
  const { subject } = req.query;
  let intel = [...VAULT.intelligence];
  if (subject) intel = intel.filter(i => i.subject === subject);

  // 只返回今日
  const today = new Date().toISOString().split('T')[0];
  intel = intel.filter(i => i.timestamp?.startsWith(today));

  res.json({ success: true, count: intel.length, intelligence: intel });
});

// ---- 数据中枢状态 ----
app.get('/hub/status', (req, res) => {
  res.json({
    vault: {
      totalQuestions: VAULT.questions.length,
      todayIntel: VAULT.intelligence.filter(i => i.timestamp?.startsWith(new Date().toISOString().split('T')[0])).length,
      lastCollection: VAULT.lastCollection,
      stats: VAULT.stats
    },
    models: MODELS_CONFIG.map(m => m.name),
    subjects: SUBJECTS,
    uptime: process.uptime()
  });
});

// =============================================
// 启动
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PKU API 隧道 + 数据中枢启动 | 端口: ${PORT}`);
  console.log(`   OpenRouter: ${KEYS.OPENROUTER ? '✅' : '❌'}`);
  console.log(`   Gemini:     ${KEYS.GEMINI ? '✅' : '❌'}`);
  console.log(`   Perplexity: ${KEYS.PERPLEXITY ? '✅' : '❌'}`);
  console.log(`   中枢API: /hub/collect | /hub/intel | /hub/status`);
  console.log(`   投喂API: /feed/questions | /feed/upload | /feed/intel`);
});
