/**
 * PKU API 中转隧道 + 数据中枢 v3.0
 * 1. CORS 中转 — OpenRouter/Gemini/Perplexity
 * 2. 考卷库 — 接收题库站上传的原始题目
 * 3. 情报库 — 接收天机阁的实时情报
 * 4. 试卷工厂 — 最强模型融合情报+题库，生成今日特供试卷
 * 5. 游戏投喂 — 各游戏APP直接拉取试卷
 */
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

const KEYS = {
  OPENROUTER: process.env.OPENROUTER_API_KEY || '',
  GEMINI: process.env.GEMINI_API_KEY || '',
  PERPLEXITY: process.env.PERPLEXITY_API_KEY || ''
};

// =============================================
// 数据仓库 (内存持久化)
// =============================================
const VAULT = {
  // 原始题库 (题库搜集站上传)
  rawQuestions: { '101': [], '201': [], '301': [], '408': [] },
  // 今日情报 (天机阁上传)
  intelligence: { '101': [], '201': [], '301': [], '408': [] },
  // 今日特供试卷 (最强模型生成)
  papers: { '101': null, '201': null, '301': null, '408': null },
  // 统计
  stats: { totalRaw: 0, totalPapers: 0, lastGenerated: null }
};

const SUBJECTS = {
  '101': '政治 — 马原/毛中特/史纲/思修',
  '201': '英语 — 阅读/翻译/写作',
  '301': '数学 — 高数/线代/概率论',
  '408': '计算机 — 数据结构/OS/网络/组成原理'
};

// =============================================
// PART 1: API 中转隧道
// =============================================

app.get('/', (req, res) => {
  const rawCount = Object.values(VAULT.rawQuestions).reduce((s, a) => s + a.length, 0);
  const intelCount = Object.values(VAULT.intelligence).reduce((s, a) => s + a.length, 0);
  const paperCount = Object.values(VAULT.papers).filter(p => p).length;
  res.json({
    status: '🚀 PKU 数据中枢 v3.0',
    vault: { rawQuestions: rawCount, intelligence: intelCount, papers: `${paperCount}/4科` },
    stats: VAULT.stats,
    timestamp: new Date().toISOString()
  });
});

// OpenRouter 中转
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens } = req.body;
    if (!KEYS.OPENROUTER) return res.status(500).json({ error: 'OpenRouter key missing' });
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.OPENROUTER}`,
        'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io', 'X-Title': 'PKU Vault' },
      body: JSON.stringify({ model, messages, temperature: temperature || 0.7, max_tokens: max_tokens || 4096 })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    if (data.choices?.[0]?.message?.content)
      data.choices[0].message.content = data.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Gemini 中转
app.post('/gemini/generate', async (req, res) => {
  try {
    const { model, messages, max_tokens } = req.body;
    const text = await callGemini(model || 'gemini-3.1-pro-preview', messages, max_tokens || 4096);
    res.json({ choices: [{ message: { role: 'assistant', content: text } }], model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Perplexity 中转
app.post('/perplexity/search', async (req, res) => {
  try {
    const { model, messages, max_tokens } = req.body;
    if (!KEYS.PERPLEXITY) return res.status(500).json({ error: 'Perplexity key missing' });
    const r = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.PERPLEXITY}` },
      body: JSON.stringify({ model: model || 'sonar-pro', messages, max_tokens: max_tokens || 4096 })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================
// PART 2: 考卷库 — 接收原始题目
// =============================================

// 题库搜集站 → 上传题目
app.post('/feed/upload', (req, res) => {
  const { questions, subject, source } = req.body;
  if (!questions?.length) return res.status(400).json({ error: 'questions array required' });
  const subj = subject || '101';
  if (!VAULT.rawQuestions[subj]) VAULT.rawQuestions[subj] = [];

  const processed = questions.map((q, i) => ({
    ...q,
    id: q.id || `raw-${subj}-${Date.now()}-${i}`,
    subject: subj,
    source: q.source || source || 'unknown',
    uploadedAt: new Date().toISOString()
  }));

  VAULT.rawQuestions[subj].push(...processed);
  VAULT.stats.totalRaw += processed.length;
  console.log(`[VAULT] 📥 ${source || '?'} → ${subj} +${processed.length}题 | 总库: ${VAULT.rawQuestions[subj].length}`);
  res.json({ success: true, added: processed.length, subjectTotal: VAULT.rawQuestions[subj].length });
});

// 天机阁 → 上传情报
app.post('/hub/intel', (req, res) => {
  const { subject, content, source } = req.body;
  const subj = subject || '101';
  if (!VAULT.intelligence[subj]) VAULT.intelligence[subj] = [];

  const entry = {
    id: `intel-${subj}-${Date.now()}`,
    subject: subj, content,
    source: source || 'Perplexity',
    timestamp: new Date().toISOString()
  };
  VAULT.intelligence[subj].push(entry);
  console.log(`[INTEL] 📡 ${subj} 情报 +1 | ${(content || '').length}字`);
  res.json({ success: true, intel: entry });
});

// 主动搜集情报 (服务端调Perplexity)
app.post('/hub/collect-intel', async (req, res) => {
  const { subject } = req.body;
  const subjects = subject ? [subject] : Object.keys(SUBJECTS);
  const results = [];

  for (const subj of subjects) {
    try {
      const r = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.PERPLEXITY}` },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [{ role: 'user', content: `搜索2025-2026年中国考研${SUBJECTS[subj]}最新命题趋势,包括:1)最新政策变化 2)高频考点 3)名校真题风向 4)学术前沿热点。用中文详细总结,突出今年新增热点。` }],
          max_tokens: 4096
        })
      });
      const data = await r.json();
      const intel = data.choices?.[0]?.message?.content || '';
      if (intel) {
        if (!VAULT.intelligence[subj]) VAULT.intelligence[subj] = [];
        VAULT.intelligence[subj].push({ id: `intel-${subj}-${Date.now()}`, subject: subj, content: intel, source: 'auto-perplexity', timestamp: new Date().toISOString() });
        results.push({ subject: subj, length: intel.length, success: true });
        console.log(`[INTEL] ✅ ${subj} 情报 ${intel.length}字`);
      }
    } catch (err) {
      results.push({ subject: subj, success: false, error: err.message });
    }
  }
  res.json({ success: true, results });
});

// =============================================
// PART 3: 试卷工厂 — 最强模型生成今日试卷
// =============================================

async function callGemini(model, messages, maxTokens) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEYS.GEMINI}`;
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }]
  }));
  const sysMsg = messages.find(m => m.role === 'system');
  const body = { contents, generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens } };
  if (sysMsg) body.system_instruction = { parts: [{ text: sysMsg.content }] };
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await r.json();
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${JSON.stringify(data).substring(0, 150)}`);
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

// 生成今日特供试卷
async function generatePaper(subject) {
  console.log(`\n[PAPER] 🏭 开始生成 ${subject} 今日特供试卷...`);

  // 收集素材
  const rawQ = VAULT.rawQuestions[subject] || [];
  const intel = VAULT.intelligence[subject] || [];

  // 取最近的情报摘要
  const latestIntel = intel.slice(-3).map(i => i.content).join('\n---\n');
  // 取最近的题目样本
  const sampleQ = rawQ.slice(-20).map(q => `[${q.type}] ${q.question}`).join('\n');

  const prompt = `你是中国研究生考试${SUBJECTS[subject]}的顶级命题专家。

## 今日最新情报
${latestIntel || '(暂无情报，请根据历年高频考点出题)'}

## 已有题目样本参考
${sampleQ || '(暂无样本)'}

## 任务
基于以上情报和素材，生成一份**15道高质量模拟试卷**：
- 8道单选题 (type:"single")
- 4道多选题 (type:"multi")
- 3道判断题 (type:"judge")

要求：
1. 紧跟最新考研命题趋势和热点
2. 难度分布: 简单30% 中等50% 困难20%
3. 避免与样本重复
4. 每题必须有详细解析

严格输出JSON数组格式。每题包含: question, options(数组), answer, type, analysis, difficulty(1-5)。
第一个字符必须是[，最后一个字符必须是]。禁止输出任何多余文字。`;

  try {
    // 最强智脑管理中枢: Claude-4.5 → DeepSeek-R1 → V3.2(兜底)
    const sysPrompt = '你是考研命题专家。严格输出JSON数组，禁止输出任何多余文字、markdown标记。第一个字符必须是[，最后一个字符必须是]。';
    let raw;
    const models = [
      { model: 'anthropic/claude-sonnet-4.5', name: 'Claude-4.5-Sonnet' },
      { model: 'deepseek/deepseek-r1-0528', name: 'DeepSeek-R1' },
      { model: 'deepseek/deepseek-v3.2', name: 'DeepSeek-V3.2' }
    ];
    let usedModel = '';
    for (const m of models) {
      try {
        console.log(`[PAPER] 🧠 尝试 ${m.name}...`);
        const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.OPENROUTER}`,
            'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io', 'X-Title': 'PKU Paper Factory' },
          body: JSON.stringify({ model: m.model, messages: [
            { role: 'system', content: sysPrompt }, { role: 'user', content: prompt }
          ], temperature: 0.7, max_tokens: 8000 })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(`${r.status}: ${JSON.stringify(data).substring(0,100)}`);
        raw = (data.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        usedModel = m.name;
        console.log(`[PAPER] ✅ ${m.name} => ${raw.length} chars`);
        break;
      } catch(e) {
        console.log(`[PAPER] ❌ ${m.name} 失败: ${e.message}`);
      }
    }
    if (!raw) throw new Error('所有模型均失败');

    let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array in response');

    let jsonStr = match[0];
    // Fix common JSON issues
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');           // trailing commas
    jsonStr = jsonStr.replace(/}\s*{/g, '},{');                  // missing commas between objects
    jsonStr = jsonStr.replace(/"\s*\n\s*"/g, '","');             // broken strings
    jsonStr = jsonStr.replace(/\t/g, ' ');                       // tabs
    // Fix truncated JSON (close unclosed brackets)
    const opens = (jsonStr.match(/\[/g) || []).length;
    const closes = (jsonStr.match(/\]/g) || []).length;
    if (opens > closes) jsonStr += ']'.repeat(opens - closes);

    let parsed;
    try { parsed = JSON.parse(jsonStr); } catch(e1) {
      // Last resort: eval-like approach with Function
      try {
        const fn = new Function('return ' + jsonStr);
        parsed = fn();
      } catch(e2) {
        throw new Error(`${e1.message}`);
      }
    }

    const paper = {
      id: `paper-${subject}-${Date.now()}`,
      subject,
      subjectName: SUBJECTS[subject],
      generatedAt: new Date().toISOString(),
      generator: usedModel || 'AI',
      intelSources: intel.slice(-3).length,
      rawPoolSize: rawQ.length,
      questions: parsed.map((q, i) => ({
        ...q,
        id: `paper-${subject}-${Date.now()}-${i}`,
        paperGenerated: true
      }))
    };

    VAULT.papers[subject] = paper;
    VAULT.stats.totalPapers++;
    VAULT.stats.lastGenerated = new Date().toISOString();

    console.log(`[PAPER] ✅ ${subject} 试卷生成完毕 | ${paper.questions.length}题 | 基于${paper.intelSources}条情报+${paper.rawPoolSize}道原始题`);
    return paper;
  } catch (err) {
    console.error(`[PAPER] ❌ ${subject} 生成失败:`, err.message);
    throw err;
  }
}

// 手动触发生成试卷
app.post('/paper/generate', async (req, res) => {
  const { subject } = req.body;
  try {
    if (subject) {
      const paper = await generatePaper(subject);
      return res.json({ success: true, paper });
    }
    // 全科目生成
    const results = {};
    for (const subj of Object.keys(SUBJECTS)) {
      try {
        results[subj] = await generatePaper(subj);
      } catch (err) {
        results[subj] = { error: err.message };
      }
    }
    res.json({ success: true, papers: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 一键全流程: 搜集情报 → 生成试卷
app.post('/paper/auto', async (req, res) => {
  console.log('\n🔥🔥🔥 一键全流程启动 🔥🔥🔥');
  const startTime = Date.now();
  const report = { intel: [], papers: [] };

  // Step 1: 搜集情报
  if (KEYS.PERPLEXITY) {
    console.log('[AUTO] Step 1: 搜集情报...');
    for (const subj of Object.keys(SUBJECTS)) {
      try {
        const r = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.PERPLEXITY}` },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [{ role: 'user', content: `2025-2026年中国考研${SUBJECTS[subj]}最新命题趋势热点,用中文总结要点。` }],
            max_tokens: 2048
          })
        });
        const data = await r.json();
        const content = data.choices?.[0]?.message?.content || '';
        if (content) {
          if (!VAULT.intelligence[subj]) VAULT.intelligence[subj] = [];
          VAULT.intelligence[subj].push({ id: `intel-${subj}-${Date.now()}`, subject: subj, content, source: 'auto', timestamp: new Date().toISOString() });
          report.intel.push({ subject: subj, chars: content.length });
        }
      } catch (err) { report.intel.push({ subject: subj, error: err.message }); }
    }
  }

  // Step 2: 用 Gemini 生成试卷
  console.log('[AUTO] Step 2: 生成试卷...');
  for (const subj of Object.keys(SUBJECTS)) {
    try {
      const paper = await generatePaper(subj);
      report.papers.push({ subject: subj, questions: paper.questions.length });
    } catch (err) {
      report.papers.push({ subject: subj, error: err.message });
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 全流程完毕 | 耗时${elapsed}s\n`);
  res.json({ success: true, elapsed: `${elapsed}s`, report });
});

// =============================================
// PART 4: 游戏投喂 API
// =============================================

// 获取今日试卷 (游戏调用此接口)
app.get('/feed/paper/:subject', (req, res) => {
  const { subject } = req.params;
  const { count, type, random } = req.query;
  const paper = VAULT.papers[subject];

  if (!paper) {
    // 没有试卷时从原始题库随机抽题
    const raw = VAULT.rawQuestions[subject] || [];
    if (!raw.length) return res.json({ success: false, error: '暂无试卷和题目，请先采集', questions: [] });

    const pool = [...raw];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const n = Math.min(parseInt(count) || 10, pool.length);
    return res.json({ success: true, source: 'rawPool', subject, questions: pool.slice(0, n) });
  }

  // 有试卷时返回
  let questions = [...paper.questions];
  if (type) questions = questions.filter(q => q.type === type);
  if (random !== 'false') {
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
  }
  const n = Math.min(parseInt(count) || questions.length, questions.length);

  res.json({
    success: true,
    source: 'todayPaper',
    subject,
    generatedAt: paper.generatedAt,
    generator: paper.generator,
    total: paper.questions.length,
    returned: n,
    questions: questions.slice(0, n)
  });
});

// 通用题目获取 (兼容旧接口)
app.get('/feed/questions', (req, res) => {
  const { subject, count, type } = req.query;
  const allQ = subject ? (VAULT.rawQuestions[subject] || []) : Object.values(VAULT.rawQuestions).flat();
  let pool = [...allQ];
  if (type) pool = pool.filter(q => q.type === type);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const n = Math.min(parseInt(count) || 10, pool.length);
  res.json({ success: true, total: allQ.length, returned: n, questions: pool.slice(0, n) });
});

// 获取情报
app.get('/feed/intel/:subject', (req, res) => {
  const intel = VAULT.intelligence[req.params.subject] || [];
  const today = new Date().toISOString().split('T')[0];
  const todayIntel = intel.filter(i => i.timestamp?.startsWith(today));
  res.json({ success: true, subject: req.params.subject, count: todayIntel.length, intelligence: todayIntel });
});

// 中枢状态面板
app.get('/hub/status', (req, res) => {
  const status = {};
  for (const subj of Object.keys(SUBJECTS)) {
    status[subj] = {
      name: SUBJECTS[subj],
      rawQuestions: (VAULT.rawQuestions[subj] || []).length,
      intelligence: (VAULT.intelligence[subj] || []).length,
      paper: VAULT.papers[subj] ? {
        questions: VAULT.papers[subj].questions.length,
        generatedAt: VAULT.papers[subj].generatedAt,
        generator: VAULT.papers[subj].generator
      } : null
    };
  }
  res.json({ subjects: status, stats: VAULT.stats, uptime: Math.round(process.uptime()) + 's' });
});

// =============================================
// 启动
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 PKU 数据中枢 v3.0 启动 | 端口: ${PORT}`);
  console.log(`   OpenRouter: ${KEYS.OPENROUTER ? '✅' : '❌'}`);
  console.log(`   Gemini:     ${KEYS.GEMINI ? '✅' : '❌'}`);
  console.log(`   Perplexity: ${KEYS.PERPLEXITY ? '✅' : '❌'}`);
  console.log(`   ─────────────────────────────`);
  console.log(`   中转: POST /v1/chat/completions`);
  console.log(`   上传: POST /feed/upload`);
  console.log(`   情报: POST /hub/collect-intel`);
  console.log(`   出卷: POST /paper/generate`);
  console.log(`   一键: POST /paper/auto`);
  console.log(`   投喂: GET  /feed/paper/:subject`);
  console.log(`   状态: GET  /hub/status\n`);
});
