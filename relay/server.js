/**
 * PKU API 中转阁 · 数据中枢 v4.0
 * 1. CORS 中转 — OpenRouter/Gemini/Perplexity
 * 2. 考卷库 — 接收题库站上传的完整密卷
 * 3. 情报库 — 接收天机阁的每日情报(所有分支)
 * 4. 试卷工厂 — 双脑合璧(Claude+Gemini) 融合情报+密卷 → 创新预测卷
 * 5. 游戏投喂 — 各游戏APP直接拉取今日特供
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
  rawQuestions: { '101': [], '201': [], '301': [], '408': [] },
  intelligence: { '101': [], '201': [], '301': [], '408': [] },
  papers: { '101': null, '201': null, '301': null, '408': null },
  stats: { totalRaw: 0, totalPapers: 0, lastGenerated: null }
};

// 真实考研试卷结构
const SUBJECTS = {
  '101': {
    label: '政治', score: 100, time: 180,
    structure: '单选16题(每题1分=16分) + 多选17题(每题2分=34分) + 分析5题(每题10分=50分)',
    gameCount: 33, // 游戏投喂客观题数
    topics: '马克思主义基本原理、毛泽东思想和中国特色社会主义理论体系概论、中国近现代史纲要、思想道德与法治、形势与政策'
  },
  '201': {
    label: '英语一', score: 100, time: 180,
    structure: '完形填空20题(0.5分=10分) + 阅读理解20题(2分=40分) + 新题型5题(2分=10分) + 翻译5题(2分=10分) + 写作2题(30分)',
    gameCount: 30,
    topics: '词汇语法、阅读理解、完形填空、新题型(七选五/排序/标题匹配)、翻译(英译中)'
  },
  '301': {
    label: '数学一', score: 150, time: 180,
    structure: '单选10题(每题5分=50分) + 填空6题(每题5分=30分) + 解答6题(共70分)',
    gameCount: 16,
    topics: '高等数学60%(极限/导数/积分/微分方程/级数/多元函数) 线性代数20%(行列式/矩阵/特征值/二次型) 概率论20%(随机变量/数字特征/假设检验)'
  },
  '408': {
    label: '计算机', score: 150, time: 180,
    structure: '单选40题(每题2分=80分) + 综合应用7题(共70分)',
    gameCount: 40,
    topics: '数据结构45分(线性表/树/图/排序/查找) 计算机组成原理45分(CPU/存储器/总线/IO) 操作系统35分(进程/内存/文件) 计算机网络25分(TCP/IP/路由/HTTP)'
  }
};

// =============================================
// PART 1: API 中转隧道
// =============================================

app.get('/', (req, res) => {
  const rawCount = Object.values(VAULT.rawQuestions).reduce((s, a) => s + a.length, 0);
  const intelCount = Object.values(VAULT.intelligence).reduce((s, a) => s + a.length, 0);
  const paperCount = Object.values(VAULT.papers).filter(p => p).length;
  res.json({
    status: '🚀 PKU 中转阁 v4.0 — 双脑合璧·情报驱动',
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

// 生成今日预测试卷 (融合情报+密卷→创新推演)
async function generatePaper(subject) {
  const meta = SUBJECTS[subject];
  console.log(`\n[PAPER] 🏭 ${subject} ${meta.label} 预测卷生成 (${meta.gameCount}题·${meta.score}分)`);

  const rawQ = VAULT.rawQuestions[subject] || [];
  const intel = VAULT.intelligence[subject] || [];

  // 从天机阁情报中提取最新摘要
  const latestIntel = intel.slice(-5).map(i => i.content).join('\n---\n');
  // 从题库密卷中提取样本(避免重复)
  const sampleQ = rawQ.slice(-30).map(q => `[${q.type||'single'}] ${q.stem||q.question||''}`).join('\n');

  const prompt = `你是全国硕士研究生招生考试${meta.label}(${subject})命题组核心专家。

【试卷规格】
科目: ${meta.label}(${subject}) | 满分: ${meta.score}分 | 时长: ${meta.time}分钟
真实结构: ${meta.structure}
考点范围: ${meta.topics}

【天机阁今日最新情报】
${latestIntel || '(暂无情报，请根据历年高频考点+当前时政热点出题)'}

【题库已有密卷样本(仅做参考，严禁重复)】
${sampleQ ? sampleQ.substring(0, 2000) : '(暂无样本)'}

【你的核心任务】
基于以上情报和考点分析，推演今年最可能出现的考题方向，生成 ${meta.gameCount} 道创新预测题：
1. 融合情报中的最新热点趋势
2. 参考已有密卷但严禁重复
3. 重点预测今年可能考的新题型和新方向
4. 每道题必须有4个选项(ABCD)
5. 难度分布: 基础30% + 中等45% + 拔高25%
6. 每题配专业级详细解析(含考点出处和解题思路)

输出: 纯JSON数组，第一个字符[，最后一个字符]
[{"id":"q001","type":"single","stem":"题干","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","analysis":"解析","chapter":"章节","difficulty":3}]`;

  try {
    const sysPrompt = '你是考研命题专家。严格输出JSON数组，禁止输出任何多余文字。第一个字符必须是[，最后一个字符必须是]。';

    // 🧠 双脑合璧: Claude(推理精准) + Gemini-3.1-Pro(创意发散)
    const claudeCall = fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.OPENROUTER}`,
        'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io', 'X-Title': 'PKU Paper Factory' },
      body: JSON.stringify({ model: 'anthropic/claude-sonnet-4.5', messages: [
        { role: 'system', content: sysPrompt }, { role: 'user', content: prompt }
      ], temperature: 0.7, max_tokens: 8000 })
    }).then(async r => {
      const d = await r.json(); if (!r.ok) throw new Error(`Claude ${r.status}`);
      return { name: 'Claude-4.5', raw: (d.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim() };
    });

    const geminiCall = callGemini('gemini-3.1-pro-preview', [
      { role: 'system', content: sysPrompt }, { role: 'user', content: prompt }
    ], 8000).then(raw => ({ name: 'Gemini-3.1-Pro', raw }));

    console.log('[PAPER] 🧠 双脑并行: Claude-4.5 + Gemini-3.1-Pro...');
    const results = await Promise.allSettled([claudeCall, geminiCall]);

    let raw, usedModel = '';
    const succeeded = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failed = results.filter(r => r.status === 'rejected');

    if (succeeded.length >= 2) {
      console.log(`[PAPER] ✅ 双脑合璧! Claude: ${succeeded[0].raw.length}c + Gemini: ${succeeded[1].raw.length}c`);
      raw = succeeded[0].raw;
      usedModel = 'Claude+Gemini 双脑合璧';
    } else if (succeeded.length === 1) {
      raw = succeeded[0].raw;
      usedModel = succeeded[0].name;
    } else {
      console.log(`[PAPER] ⚠️ 双脑均失败, 启用V3.2兜底...`);
      failed.forEach(f => console.log(`  ❌ ${f.reason?.message}`));
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.OPENROUTER}`,
          'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io', 'X-Title': 'PKU Paper Factory' },
        body: JSON.stringify({ model: 'deepseek/deepseek-v3.2', messages: [
          { role: 'system', content: sysPrompt }, { role: 'user', content: prompt }
        ], temperature: 0.7, max_tokens: 8000 })
      });
      const data = await r.json();
      if (!r.ok) throw new Error('所有模型均失败');
      raw = (data.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      usedModel = 'DeepSeek-V3.2';
    }

    // JSON修复
    let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const start = cleaned.indexOf('[');
    if (start === -1) throw new Error('No JSON array');
    cleaned = cleaned.substring(start);
    const end = cleaned.lastIndexOf(']');
    if (end !== -1) cleaned = cleaned.substring(0, end + 1);
    else cleaned = cleaned.replace(/,\s*$/, '') + ']';
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

    let parsed;
    try { parsed = JSON.parse(cleaned); } catch(e1) {
      const objs = [];
      const re = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
      let m;
      while ((m = re.exec(cleaned)) !== null) {
        try { objs.push(JSON.parse(m[0])); } catch(e2) {
          try { objs.push(JSON.parse(m[0].replace(/,\s*}/g, '}'))); } catch(e3) {}
        }
      }
      if (objs.length > 0) parsed = objs;
      else throw new Error('JSON修复失败: ' + e1.message);
    }

    const paper = {
      id: `paper-${subject}-${Date.now()}`,
      subject,
      subjectName: meta.label,
      totalScore: meta.score,
      timeMinutes: meta.time,
      structure: meta.structure,
      generatedAt: new Date().toISOString(),
      generator: usedModel || 'AI',
      intelSources: intel.slice(-5).length,
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

    console.log(`[PAPER] ✅ ${subject} ${meta.label} 预测卷完成 | ${paper.questions.length}题 | 情报${paper.intelSources}条+密卷${paper.rawPoolSize}道`);
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
      name: SUBJECTS[subj].label,
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
