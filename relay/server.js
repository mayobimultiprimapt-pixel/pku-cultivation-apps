/**
 * PKU API 中转阁 · 数据中枢 v5.0
 * 万法归宗·中枢数据库
 * 1. CORS 中转 — OpenRouter/Gemini/Perplexity
 * 2. 考卷库 — 接收/存储/分发完整密卷（多套叠加）
 * 3. 情报库 — 天机阁情报 + 卦象天机统一入库
 * 4. 试卷工厂 — 双脑合璧 → 情报驱动预测卷
 * 5. 游戏投喂 — 所有游戏APP统一拉题接口
 */
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));

const KEYS = {
  OPENROUTER: process.env.OPENROUTER_API_KEY || '',
  GEMINI: process.env.GEMINI_API_KEY || '',
  PERPLEXITY: process.env.PERPLEXITY_API_KEY || ''
};

// =============================================
// 数据仓库 (内存持久化) v5.0
// 每科支持多套完整密卷叠加
// =============================================
const VAULT = {
  // 原始题目池（从题库上传的散题）
  rawQuestions: { '101': [], '201': [], '301': [], '408': [] },
  // 完整密卷库（每科多套，按时间排序）
  papers: { '101': [], '201': [], '301': [], '408': [] },
  // 情报库（Perplexity + 卦象天机）
  intelligence: { '101': [], '201': [], '301': [], '408': [] },
  // 统计
  stats: { totalRaw: 0, totalPapers: 0, lastGenerated: null, lastIntel: null }
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
    structure: '完形填空20题(0.5分=10分) + 阅读A节20题(2分=40分) + 新题型B节5题(2分=10分) + 翻译C节5句(2分=10分) + 写作2题(小10+大20=30分)',
    gameCount: 45,
    topics: '英语知识运用(词汇/语法/上下文连贯)、传统阅读理解(主旨/细节/推断/态度)、新题型(七选五/段落排序/小标题匹配)、英译汉翻译'
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

// =============================================
// PART 2B: 完整密卷库 — 题库搜集站上传完整卷
// =============================================

// 题库搜集站 → 上传完整密卷（一套卷子一次性存入）
app.post('/vault/papers', (req, res) => {
  const { paper, subject, source, paperNum, metadata } = req.body;
  if (!paper || !paper.questions?.length) return res.status(400).json({ error: 'paper.questions required' });
  const subj = subject || '101';
  if (!VAULT.papers[subj]) VAULT.papers[subj] = [];

  const entry = {
    id: `paper-${subj}-${Date.now()}`,
    subject: subj,
    paperNum: paperNum || VAULT.papers[subj].length + 1,
    source: source || 'question-bank',
    questions: paper.questions,
    metadata: metadata || {},
    uploadedAt: new Date().toISOString()
  };
  VAULT.papers[subj].unshift(entry); // 最新卷子在最前
  if (VAULT.papers[subj].length > 50) VAULT.papers[subj].length = 50; // 每科保留最近50套
  VAULT.stats.totalPapers++;
  VAULT.stats.lastGenerated = entry.uploadedAt;
  console.log(`[VAULT] 📦 ${subj} 第${entry.paperNum}套密卷入库 | ${entry.questions.length}题 | 共${VAULT.papers[subj].length}套`);
  res.json({ success: true, paperId: entry.id, paperNum: entry.paperNum, questions: entry.questions.length, totalPapers: VAULT.papers[subj].length });
});

// 查询某科所有密卷列表
app.get('/vault/papers/:subject', (req, res) => {
  const subj = req.params.subject;
  const papers = (VAULT.papers[subj] || []).map(p => ({
    id: p.id, paperNum: p.paperNum, source: p.source,
    questions: p.questions.length, uploadedAt: p.uploadedAt,
    metadata: p.metadata
  }));
  res.json({ success: true, subject: subj, total: papers.length, papers });
});

// 获取某科某套完整密卷
app.get('/vault/papers/:subject/:paperId', (req, res) => {
  const { subject: subj, paperId } = req.params;
  const paper = (VAULT.papers[subj] || []).find(p => p.id === paperId || String(p.paperNum) === paperId);
  if (!paper) return res.status(404).json({ error: '密卷不存在' });
  res.json({ success: true, paper });
});

// 兼容旧接口：题库搜集站 → 上传散题
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

// 天机阁/断卦 → 统一上传情报（支持 /hub/intel 和 /feed/intelligence 两个路由）
function saveIntel(subj, content, source, date) {
  if (!VAULT.intelligence[subj]) VAULT.intelligence[subj] = [];
  const entry = {
    id: `intel-${subj}-${Date.now()}`,
    subject: subj, content,
    source: source || 'unknown',
    timestamp: date || new Date().toISOString()
  };
  VAULT.intelligence[subj].unshift(entry);
  if (VAULT.intelligence[subj].length > 100) VAULT.intelligence[subj].length = 100;
  VAULT.stats.lastIntel = entry.timestamp;
  console.log(`[INTEL] 📡 ${subj} [${source}] +1 | ${(content || '').length}字`);
  return entry;
}

app.post('/hub/intel', (req, res) => {
  const { subject, content, source, date } = req.body;
  const entry = saveIntel(subject || '101', content, source, date);
  res.json({ success: true, intel: entry });
});

// 天机阁卦象断卦天机入口
app.post('/feed/intelligence', (req, res) => {
  const { subject, content, source, date } = req.body;
  const entry = saveIntel(subject || '101', content, source || '卦象天机', date);
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

  // 按真实考试结构分节描述
  const sectionsDesc = meta.sections.map(s =>
    `▸ ${s.label}：严格生成 ${s.count} 题，type="${s.type}"，每题${s.score}分 — ${s.note}`
  ).join('\n');
  const totalBySection = meta.sections.map(s => `${s.label}${s.count}题`).join(' + ');

  const prompt = `你是全国硕士研究生招生考试${meta.label}(${subject})命题组核心专家。

【试卷规格】
科目: ${meta.label}(${subject}) | 满分: ${meta.score}分 | 时长: ${meta.time}分钟
真实结构: ${meta.structure}
考点范围: ${meta.topics}
本次任务: ${totalBySection} = 共${meta.gameCount}道预测题

【分节出题要求（必须严格遵守每节题数）】
${sectionsDesc}

【天机阁今日最新情报（命题趋势推演依据）】
${latestIntel || '(暂无情报，请根据历年高频考点+当前时政热点推演今年命题方向)'}

【题库已有密卷样本（仅做参考，严禁重复）】
${sampleQ ? sampleQ.substring(0, 2000) : '(暂无样本)'}

【核心任务：情报驱动预测出题】
基于以上情报推演今年最可能出现的考题方向，生成全部 ${meta.gameCount} 道创新预测题：
1. 每节题数必须精确（不多不少）
2. 融合情报中的最新热点趋势
3. 严禁与已有密卷重复
4. 每道题有4个选项(ABCD)，多选题≥2个正确答案
5. 难度分布: 基础30% + 中等45% + 拔高25%
6. 每题配专业级详细解析(含考点出处和解题思路)

输出: 纯JSON数组，第一个字符[，最后一个字符]，禁止多余文字
[{"id":"q001","type":"${meta.sections[0].type}","stem":"题干","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","analysis":"解析","chapter":"章节","difficulty":3,"score":${meta.sections[0].score}}]`;

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

// 游戏统一拉题接口 — 从密卷库取题（支持多套合并池）
app.get('/feed/paper/:subject', (req, res) => {
  const { subject } = req.params;
  const { count, type, random, paperNum } = req.query;
  const papers = VAULT.papers[subject] || [];

  // 决定题目来源
  let allQ = [];
  if (paperNum) {
    // 指定某套密卷
    const p = papers.find(p => String(p.paperNum) === paperNum);
    allQ = p ? [...p.questions] : [];
  } else if (papers.length > 0) {
    // 默认：最新三套密卷合并成大题库
    const pool = papers.slice(0, 3);
    allQ = pool.flatMap(p => p.questions);
  } else {
    // fallback：散题池
    allQ = [...(VAULT.rawQuestions[subject] || [])];
  }

  if (!allQ.length) return res.json({ success: false, error: '暂无题目，请先采集密卷', questions: [], tip: '在题库搜集站采集后会自动同步' });

  // 按题型筛选
  if (type) allQ = allQ.filter(q => q.type === type);

  // 随机打乱
  if (random !== 'false') {
    for (let i = allQ.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQ[i], allQ[j]] = [allQ[j], allQ[i]];
    }
  }
  const n = Math.min(parseInt(count) || allQ.length, allQ.length);
  res.json({
    success: true,
    source: papers.length > 0 ? `密卷池(${Math.min(papers.length,3)}套合并)` : 'rawPool',
    subject, totalPapers: papers.length,
    total: allQ.length, returned: n,
    questions: allQ.slice(0, n)
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
    const papers = VAULT.papers[subj] || [];
    status[subj] = {
      name: SUBJECTS[subj].label,
      rawQuestions: (VAULT.rawQuestions[subj] || []).length,
      intelligence: (VAULT.intelligence[subj] || []).length,
      papers: papers.length,
      latestPaper: papers[0] ? {
        paperNum: papers[0].paperNum,
        questions: papers[0].questions.length,
        uploadedAt: papers[0].uploadedAt,
        source: papers[0].source
      } : null
    };
  }
  res.json({ subjects: status, stats: VAULT.stats, uptime: Math.round(process.uptime()) + 's', version: 'v5.0' });
});

// =============================================
// 启动
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 PKU 数据中枢 v5.0 · 万法归宗 | 端口: ${PORT}`);
  console.log(`   OpenRouter: ${KEYS.OPENROUTER ? '✅' : '❌'}`);
  console.log(`   Gemini:     ${KEYS.GEMINI ? '✅' : '❌'}`);
  console.log(`   Perplexity: ${KEYS.PERPLEXITY ? '✅' : '❌'}`);
  console.log(`   ─────────────────────────────────────────`);
  console.log(`   中转:    POST /v1/chat/completions`);
  console.log(`   存密卷:  POST /vault/papers`);
  console.log(`   查密卷:  GET  /vault/papers/:subject`);
  console.log(`   存情报:  POST /feed/intelligence  (卦象天机)`);
  console.log(`   存情报:  POST /hub/intel          (Perplexity)`);
  console.log(`   出卷:    POST /paper/generate`);
  console.log(`   一键:    POST /paper/auto`);
  console.log(`   游戏拉题: GET /feed/paper/:subject`);
  console.log(`   状态:    GET  /hub/status\n`);
});
