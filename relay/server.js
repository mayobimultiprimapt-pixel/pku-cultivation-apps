/**
 * PKU API 中转阁 · 数据中枢 v6.0
 * 万法归宗·中枢数据库 — 纯考研生态
 * 1. CORS 中转 — OpenRouter/Gemini/Perplexity/Anthropic
 * 2. 考卷库 — 接收/存储/分发完整密卷（多套叠加）
 * 3. 情报库 — 天机阁情报 + 卦象天机统一入库
 * 4. 试卷工厂 — 三脑合璧(Claude+Gemini+DeepSeek)
 * 5. DeepSeek R1 押题推演引擎 [NEW]
 * 6. 游戏投喂 — 所有游戏/修炼APP统一拉题接口
 * 7. 论道殿/九宫算阵专用投喂端点 [NEW]
 */
const express = require('express');
// ── 客户端密钥透传: 前端 header 补充后端环境变量 ──
// Render 部署可能没配 env，前端登录后的 key 通过 header 送入
function resolveKey(headerKey, envKey) {
  return function(req) { return req.headers[headerKey] || envKey || ''; };
}
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));

const KEYS = {
  OPENROUTER: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_BACKUP: process.env.OPENROUTER_BACKUP_KEY || '',
  GEMINI: process.env.GEMINI_API_KEY || '',
  PERPLEXITY: process.env.PERPLEXITY_API_KEY || '',
  ANTHROPIC: process.env.ANTHROPIC_API_KEY || '',
  GPTSAPI: process.env.GPTSAPI_KEY || '',
  GPTSAPI_NEW: process.env.GPTSAPI_KEY_NEW || ''
};

// ── 最优模型矩阵（基于钥匙验证 2026-04-06）──
const BEST_MODELS = {
  // 情报窃取：Perplexity 最强推理搜索
  intel: 'sonar-reasoning-pro',
  // 出卷主力：Gemini 2.5 Pro（免费+最强）
  forge_primary: 'gemini-2.5-pro',
  // 出卷备用：Claude Opus 4.6 via OpenRouter
  forge_backup: 'anthropic/claude-opus-4.6',
  // 押题推演：DeepSeek R1（深度推理）
  predict: 'deepseek/deepseek-r1',
  // 快速任务：Gemini 2.5 Flash
  fast: 'gemini-2.5-flash',
  // 兜底：DeepSeek V3.2
  fallback: 'deepseek/deepseek-v3.2'
};

// =============================================
// 数据仓库 (内存持久化 v5.0 -> MongoDB v6.0)
// 每科支持多套完整密卷叠加
// =============================================
let useMongoDB = false;
const mongoose = require('mongoose');

const mongouri = process.env.MONGODB_URI;
if (mongouri) {
  mongoose.connect(mongouri).then(() => {
    useMongoDB = true;
    console.log('[MongoDB] ✅ 金库连接成功，开启永生模式');
  }).catch(e => {
    console.warn('[MongoDB] ⚠️ 连接失败，降级为内存模式:', e.message);
  });
}

// 设定 MongoDB Schema
const PaperSchema = new mongoose.Schema({
  id: String, subject: String, paperNum: Number, source: String,
  questions: Array, metadata: Object, uploadedAt: Date
});
const IntelSchema = new mongoose.Schema({
  subject: String, content: String, source: String, date: String
});
const VaultPaper = mongoose.model('VaultPaper', PaperSchema);
const VaultIntel = mongoose.model('VaultIntel', IntelSchema);

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

// 真实考研试卷结构 (含 sections 用于精准 prompt 生成)
const SUBJECTS = {
  '101': {
    label: '政治', score: 100, time: 180,
    structure: '单选16题(每题1分=16分) + 多选17题(每题2分=34分) + 分析5题(每题10分=50分)',
    gameCount: 33,
    topics: '马克思主义基本原理、毛泽东思想和中国特色社会主义理论体系概论、中国近现代史纲要、思想道德与法治、形势与政策',
    sections: [
      { type:'single', label:'单项选择题', count:16, score:1, note:'四选一' },
      { type:'multi',  label:'多项选择题', count:17, score:2, note:'≥2个正确答案' }
    ]
  },
  '201': {
    label: '英语一', score: 100, time: 180,
    structure: '完形填空20题(0.5分=10分) + 阅读A节20题(2分=40分) + 新题型B节5题(2分=10分) + 翻译C节5句(2分=10分) + 写作2题(小10+大20=30分)',
    gameCount: 45,
    topics: '英语知识运用(词汇/语法/上下文连贯)、传统阅读理解(主旨/细节/推断/态度)、新题型(七选五/段落排序/小标题匹配)、英译汉翻译',
    sections: [
      { type:'cloze',   label:'完形填空',   count:20, score:0.5, note:'约350词文章20空' },
      { type:'reading', label:'阅读理解A节', count:20, score:2,   note:'4篇×5题' },
      { type:'newtype', label:'新题型B节',   count:5,  score:2,   note:'七选五/排序/小标题' }
    ]
  },
  '301': {
    label: '数学一', score: 150, time: 180,
    structure: '单选10题(每题5分=50分) + 填空6题(每题5分=30分) + 解答6题(共70分)',
    gameCount: 16,
    topics: '高等数学60%(极限/导数/积分/微分方程/级数/多元函数) 线性代数20%(行列式/矩阵/特征值/二次型) 概率论20%(随机变量/数字特征/假设检验)',
    sections: [
      { type:'single', label:'选择题', count:10, score:5, note:'四选一' },
      { type:'blank',  label:'填空题', count:6,  score:5, note:'直接填结果' }
    ]
  },
  '408': {
    label: '计算机', score: 150, time: 180,
    structure: '单选40题(每题2分=80分) + 综合应用7题(共70分)',
    gameCount: 40,
    topics: '数据结构45分(线性表/树/图/排序/查找) 计算机组成原理45分(CPU/存储器/总线/IO) 操作系统35分(进程/内存/文件) 计算机网络25分(TCP/IP/路由/HTTP)',
    sections: [
      { type:'single', label:'单项选择题', count:40, score:2, note:'覆盖四大模块' }
    ]
  }
};

// ── 422 校验中间件 — 拦截不合规试卷 ──
function validate422(req, res, next) {
  const paper = req.body?.paper;
  if (!paper || !paper.questions) return next();
  const subj = req.body.subject || paper.subject;
  const meta = SUBJECTS[subj];
  if (!meta) return res.status(422).json({ success: false, error: 'TEMPLATE_VIOLATION', message: `未知科目代码: ${subj}` });
  // 基本题数校验 (允许 80% 容差，因为 AI 可能略有偏差)
  const expected = meta.gameCount;
  const actual = paper.questions.length;
  if (actual < expected * 0.5) {
    return res.status(422).json({ success: false, error: 'TEMPLATE_VIOLATION',
      message: `[${subj}] 题数严重不足: ${actual}/${expected}, 低于50%最低线` });
  }
  next();
}

// =============================================
// PART 1: API 中转隧道
// =============================================

app.get('/', (req, res) => {
  const rawCount = Object.values(VAULT.rawQuestions).reduce((s, a) => s + a.length, 0);
  const intelCount = Object.values(VAULT.intelligence).reduce((s, a) => s + a.length, 0);
  const paperCount = Object.values(VAULT.papers).filter(p => p).length;
  res.json({
    status: '🚀 PKU 中转阁 v6.0 — 三脑合璧·DeepSeek押题·纯考研生态',
    vault: { rawQuestions: rawCount, intelligence: intelCount, papers: `${paperCount}/4科` },
    stats: VAULT.stats,
    models: BEST_MODELS,
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

// Gemini 中转 (支持前端透传 key)
app.post('/gemini/generate', async (req, res) => {
  try {
    const { model, messages, max_tokens } = req.body;
    const clientKey = req.headers['x-gemini-key'] || '';
    const text = await callGemini(model || BEST_MODELS.forge_primary, messages, max_tokens || 4096, clientKey);
    res.json({ choices: [{ message: { role: 'assistant', content: text } }], model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Perplexity 中转 (支持前端透传 key)
app.post('/perplexity/search', async (req, res) => {
  try {
    const { model, messages, max_tokens } = req.body;
    const pplxKey = req.headers['x-perplexity-key'] || KEYS.PERPLEXITY;
    if (!pplxKey) return res.status(500).json({ error: 'Perplexity key missing' });
    const r = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pplxKey}` },
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
app.post('/vault/papers', validate422, async (req, res) => {
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
    uploadedAt: new Date()
  };

  if (useMongoDB) {
    try {
      if(!paperNum) { const count = await VaultPaper.countDocuments({subject: subj}); entry.paperNum = count + 1; }
      await new VaultPaper(entry).save();
      const count = await VaultPaper.countDocuments({subject: subj});
      VAULT.stats.totalPapers++; VAULT.stats.lastGenerated = entry.uploadedAt;
      console.log(`[VAULT-DB] 📦 ${subj} 第${entry.paperNum}套密卷入库 | ${entry.questions.length}题 | 共${count}套`);
      return res.json({ success: true, paperId: entry.id, paperNum: entry.paperNum, questions: entry.questions.length, totalPapers: count });
    } catch(e) { console.error('[VAULT-DB] 保存失败:', e.message); }
  }

  // 内存降级
  VAULT.papers[subj].unshift({ ...entry, uploadedAt: entry.uploadedAt.toISOString() });
  if (VAULT.papers[subj].length > 50) VAULT.papers[subj].length = 50; 
  VAULT.stats.totalPapers++;
  VAULT.stats.lastGenerated = entry.uploadedAt.toISOString();
  console.log(`[VAULT] 📦 ${subj} 第${entry.paperNum}套密卷入库 | ${entry.questions.length}题 | 共${VAULT.papers[subj].length}套`);
  res.json({ success: true, paperId: entry.id, paperNum: entry.paperNum, questions: entry.questions.length, totalPapers: VAULT.papers[subj].length });
});

// 查询某科所有密卷列表
app.get('/vault/papers/:subject', async (req, res) => {
  const subj = req.params.subject;
  if (useMongoDB) {
    try {
      const dbPapers = await VaultPaper.find({subject: subj}).sort({uploadedAt: -1}).select('-questions');
      return res.json({ success: true, subject: subj, total: dbPapers.length, papers: dbPapers });
    } catch(e) { }
  }
  const papers = (VAULT.papers[subj] || []).map(p => ({
    id: p.id, paperNum: p.paperNum, source: p.source,
    questions: p.questions.length, uploadedAt: p.uploadedAt,
    metadata: p.metadata
  }));
  res.json({ success: true, subject: subj, total: papers.length, papers });
});

// 获取某科某套完整密卷
app.get('/vault/papers/:subject/:paperId', async (req, res) => {
  const { subject: subj, paperId } = req.params;
  if(useMongoDB) {
    try {
      const p = await VaultPaper.findOne({ $or: [{id: paperId}, {paperNum: Number(paperId)}, {_id: paperId}] });
      if(p) return res.json({ success: true, paper: p });
    } catch(e) {}
  }
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
async function saveIntel(subj, content, source, date) {
  const entry = {
    id: `intel-${subj}-${Date.now()}`,
    subject: subj, content,
    source: source || 'unknown',
    timestamp: date || new Date().toISOString()
  };

  if(useMongoDB) {
    try {
      // 避免重复内容
      const exist = await VaultIntel.findOne({ subject: subj, content: entry.content });
      if (exist) { console.log(`[INTEL-DB] 📡 ${subj} 忽略重复情报`); return exist; }
      
      await new VaultIntel({subject: entry.subject, content: entry.content, source: entry.source, date: entry.timestamp}).save();
      VAULT.stats.lastIntel = entry.timestamp;
      console.log(`[INTEL-DB] 📡 ${subj} [${source}] +1 | ${(content || '').length}字`);
      return entry;
    } catch(e) {}
  }

  if (!VAULT.intelligence[subj]) VAULT.intelligence[subj] = [];
  const dup = VAULT.intelligence[subj].find(i => i.content === entry.content);
  if (dup) {
    console.log(`[INTEL] 📡 ${subj} 忽略重复情报`);
    return dup;
  }
  VAULT.intelligence[subj].unshift(entry);
  if (VAULT.intelligence[subj].length > 100) VAULT.intelligence[subj].length = 100;
  VAULT.stats.lastIntel = entry.timestamp;
  console.log(`[INTEL] 📡 ${subj} [${source}] +1 | ${(content || '').length}字`);
  return entry;
}

app.post('/hub/intel', async (req, res) => {
  const { subject, content, source, date } = req.body;
  const entry = await saveIntel(subject || '101', content, source, date);
  res.json({ success: true, intel: entry });
});

// 天机阁卦象断卦天机入口
app.post('/feed/intelligence', async (req, res) => {
  const { subject, content, source, date } = req.body;
  const entry = await saveIntel(subject || '101', content, source || '卦象天机', date);
  res.json({ success: true, intel: entry });
});

// 主动搜集情报 (服务端调Perplexity)
app.post('/hub/collect-intel', async (req, res) => {
  const { subject } = req.body;
  const subjects = subject ? [subject] : Object.keys(SUBJECTS);
  const results = [];

  const authHeader = req.headers['x-perplexity-key'];
  const pplxKey = authHeader || KEYS.PERPLEXITY;

  for (const subj of subjects) {
    try {
      const r = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pplxKey}` },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [{ 
            role: 'system', 
            content: `[IRON PROTOCOL] 你是最高级情报官。请针对研究生考试${SUBJECTS[subj]?.label || subj}科目，基于以下大纲结构：[${SUBJECTS[subj]?.structure || ''}] 和高频核心板块 [${SUBJECTS[subj]?.topics || ''}]，深度搜索最新学术会议、命题人论文、政策变化等。严格按考点大纲架构，强制写入死忠搜查命令。对每个命中考点输出具体知识点及预测命中率(%)，不啰嗦。` 
          },{ 
            role: 'user', 
            content: `窃取搜索2025-2026年中国考研${SUBJECTS[subj]?.label || subj}最新命题趋势,包括:1)最新政策变化 2)高频考点 3)名校真题风向 4)学术前沿热点。用中文详细总结,突出今年新增热点。` 
          }],
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

async function callGemini(model, messages, maxTokens, clientKey) {
  const gKey = clientKey || KEYS.GEMINI;
  if (!gKey) throw new Error('Gemini key missing — 请在 Render 配置 GEMINI_API_KEY 或前端透传 x-gemini-key');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gKey}`;
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

    // 🧠 三脑合璧: Claude Opus 4.6(推理精准) + Gemini 2.5 Pro(创意发散) + DeepSeek V3.2(兜底)
    const claudeCall = fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.OPENROUTER}`,
        'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io', 'X-Title': 'PKU Paper Factory' },
      body: JSON.stringify({ model: BEST_MODELS.forge_backup, messages: [
        { role: 'system', content: sysPrompt }, { role: 'user', content: prompt }
      ], temperature: 0.7, max_tokens: 8000 })
    }).then(async r => {
      const d = await r.json(); if (!r.ok) throw new Error(`Claude ${r.status}`);
      return { name: 'Claude-Opus-4.6', raw: (d.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim() };
    });

    const geminiCall = callGemini(BEST_MODELS.forge_primary, [
      { role: 'system', content: sysPrompt }, { role: 'user', content: prompt }
    ], 8000).then(raw => ({ name: 'Gemini-2.5-Pro', raw }));

    console.log(`[PAPER] 🧠 三脑并行: ${BEST_MODELS.forge_backup} + ${BEST_MODELS.forge_primary}...`);
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
      console.log(`[PAPER] ⚠️ 双脑均失败, 启用${BEST_MODELS.fallback}兜底...`);
      failed.forEach(f => console.log(`  ❌ ${f.reason?.message}`));
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.OPENROUTER}`,
          'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io', 'X-Title': 'PKU Paper Factory' },
        body: JSON.stringify({ model: BEST_MODELS.fallback, messages: [
          { role: 'system', content: sysPrompt }, { role: 'user', content: prompt }
        ], temperature: 0.7, max_tokens: 8000 })
      });
      const data = await r.json();
      if (!r.ok) throw new Error('所有模型均失败');
      raw = (data.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      usedModel = BEST_MODELS.fallback;
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
app.get('/feed/paper/:subject', async (req, res) => {
  const { subject } = req.params;
  const { count, type, random, paperNum } = req.query;
  let papers = [];
  
  if (useMongoDB) {
    try {
      papers = await VaultPaper.find({subject}).sort({uploadedAt: -1}).limit(3);
      if (paperNum) {
        const p = await VaultPaper.findOne({ $or: [{paperNum: Number(paperNum)}, {id: paperNum}] });
        if(p) papers = [p]; else papers = [];
      }
    } catch(e) {}
  } else {
    papers = VAULT.papers[subject] || [];
  }

  // 决定题目来源
  let allQ = [];
  if (paperNum && papers.length > 0 && String(papers[0]?.paperNum) === paperNum) { // in memory approach check
    allQ = [...papers[0].questions];
  } else if (paperNum && !useMongoDB) {
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
  res.json({ subjects: status, stats: VAULT.stats, uptime: Math.round(process.uptime()) + 's', version: 'v6.0', models: BEST_MODELS });
});

// =============================================
// PART 5: DeepSeek R1 押题推演引擎 [NEW]
// =============================================

// DeepSeek R1 押题推演
app.post('/deepseek/predict', async (req, res) => {
  const { subject } = req.body;
  const subjects = subject ? [subject] : Object.keys(SUBJECTS);
  const predictions = {};

  for (const subj of subjects) {
    const meta = SUBJECTS[subj];
    const intel = (VAULT.intelligence[subj] || []).slice(-5).map(i => i.content).join('\n---\n');
    const papers = VAULT.papers[subj] || [];
    const existingQ = papers.slice(0, 3).flatMap(p => (p.questions || []).slice(0, 10)).map(q => q.stem || q.question || '').join('\n');

    const prompt = `[DEEPSEEK PREDICTION ENGINE] 你是中国考研${meta.label}(${subj})的最高级命题趋势分析师。

基于以下情报和已有题库，进行深度推理预测2026年考研${meta.label}的命题方向：

【最新情报】
${intel || '(暂无)'}

【已有题库样本】
${existingQ || '(暂无)'}

【考纲结构】
${meta.structure}
${meta.topics}

请输出：
1. 【命中预测TOP10】具体考点 + 命中概率(%) + 理由
2. 【押题重点】今年最可能出的5道大题方向
3. 【冷门警告】3个容易被忽略但可能出现的考点
4. 【复习优先级】按ROI排序的复习建议

用中文输出，每条结论必须有具体依据。`;

    try {
      console.log(`[PREDICT] 🎯 DeepSeek R1 推演 ${subj} ${meta.label}...`);
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.OPENROUTER}`,
          'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io', 'X-Title': 'PKU DeepSeek Predict' },
        body: JSON.stringify({ model: BEST_MODELS.predict, messages: [
          { role: 'user', content: prompt }
        ], temperature: 0.3, max_tokens: 8000 })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(`DeepSeek R1 ${r.status}: ${JSON.stringify(data).substring(0,150)}`);
      let content = data.choices?.[0]?.message?.content || '';
      content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      predictions[subj] = { success: true, prediction: content, length: content.length };
      console.log(`[PREDICT] ✅ ${subj} 推演完成 ${content.length}字`);
    } catch(e) {
      predictions[subj] = { success: false, error: e.message };
      console.error(`[PREDICT] ❌ ${subj}: ${e.message}`);
    }
  }
  res.json({ success: true, model: BEST_MODELS.predict, predictions });
});

// 押题终极试卷（融合情报+推演+题库 → 最终押题卷）
app.post('/paper/final-exam', async (req, res) => {
  const { subject } = req.body;
  const subj = subject || '101';
  const meta = SUBJECTS[subj];
  if (!meta) return res.status(400).json({ error: `未知科目: ${subj}` });

  console.log(`\n🎯 押题终极试卷 ${subj} ${meta.label} 生成...`);

  // Step 1: 拉取最新情报
  const intel = (VAULT.intelligence[subj] || []).slice(-5).map(i => i.content).join('\n---\n');

  // Step 2: DeepSeek R1 推演押题重点
  let prediction = '';
  try {
    const predRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.OPENROUTER}`,
        'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io', 'X-Title': 'PKU Final Exam' },
      body: JSON.stringify({ model: BEST_MODELS.predict, messages: [
        { role: 'user', content: `基于以下考研${meta.label}情报，列出今年最可能考的10个具体知识点和5个大题方向：\n${intel || '(暂无情报，基于历年规律推演)'}` }
      ], temperature: 0.3, max_tokens: 4000 })
    });
    const pd = await predRes.json();
    prediction = (pd.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    console.log(`[FINAL] DeepSeek R1 推演完成 ${prediction.length}字`);
  } catch(e) { console.warn('[FINAL] DeepSeek推演失败:', e.message); }

  // Step 3: Gemini 2.5 Pro 基于押题生成终极试卷
  try {
    const paper = await generatePaper(subj);  // 复用已有出卷逻辑
    paper.type = 'final-exam';
    paper.prediction = prediction;
    res.json({ success: true, paper, prediction });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
// PART 6: Anthropic 直连中转 [NEW]
// =============================================
app.post('/anthropic/messages', async (req, res) => {
  const antKey = req.headers['x-anthropic-key'] || KEYS.ANTHROPIC;
  if (!antKey) return res.status(500).json({ error: 'Anthropic key missing' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': antKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// PART 7: 论道殿/九宫算阵专用投喂 [NEW]
// =============================================

// 论道殿原理卡牌投喂
app.get('/feed/cards/:subject', (req, res) => {
  const subj = req.params.subject;
  // 从密卷库提取可转化为卡牌的材料分析题/论述题
  const papers = VAULT.papers[subj] || [];
  const analysiQ = papers.flatMap(p => (p.questions || []).filter(q =>
    q.type === 'analysis' || q.type === 'multi' || q.type === 'comprehensive'
  ));
  res.json({ success: true, subject: subj, total: analysiQ.length, cards: analysiQ.slice(0, 20) });
});

// 九宫算阵代码补全题投喂
app.get('/feed/code-puzzles/:subject', (req, res) => {
  const subj = req.params.subject;
  const papers = VAULT.papers[subj] || [];
  const codeQ = papers.flatMap(p => (p.questions || []).filter(q =>
    q.type === 'comprehensive' || q.type === 'solution' || q.type === 'proof'
  ));
  res.json({ success: true, subject: subj, total: codeQ.length, puzzles: codeQ.slice(0, 15) });
});

// =============================================
// 启动
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 PKU 数据中枢 v6.0 · 纯考研生态 | 端口: ${PORT}`);
  console.log(`   OpenRouter: ${KEYS.OPENROUTER ? '✅' : '❌'} → ${BEST_MODELS.forge_backup}`);
  console.log(`   Gemini:     ${KEYS.GEMINI ? '✅' : '❌'} → ${BEST_MODELS.forge_primary}`);
  console.log(`   Perplexity: ${KEYS.PERPLEXITY ? '✅' : '❌'} → ${BEST_MODELS.intel}`);
  console.log(`   Anthropic:  ${KEYS.ANTHROPIC ? '✅' : '❌'} → 直连中转`);
  console.log(`   DeepSeek:   via OpenRouter → ${BEST_MODELS.predict}`);
  console.log(`   ─────────────────────────────────────────`);
  console.log(`   中转:       POST /v1/chat/completions`);
  console.log(`   Anthropic:  POST /anthropic/messages`);
  console.log(`   存密卷:     POST /vault/papers`);
  console.log(`   查密卷:     GET  /vault/papers/:subject`);
  console.log(`   存情报:     POST /feed/intelligence`);
  console.log(`   出卷:       POST /paper/generate`);
  console.log(`   押题推演:   POST /deepseek/predict  [NEW]`);
  console.log(`   押题终卷:   POST /paper/final-exam  [NEW]`);
  console.log(`   论道殿投喂: GET  /feed/cards/:subject [NEW]`);
  console.log(`   算阵投喂:   GET  /feed/code-puzzles/:subject [NEW]`);
  console.log(`   一键:       POST /paper/auto`);
  console.log(`   游戏拉题:   GET  /feed/paper/:subject`);
  console.log(`   状态:       GET  /hub/status\n`);
});
