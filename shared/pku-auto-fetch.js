/**
 * ============================================================================
 *  PKU Auto-Fetch v3.0 — 三模型链式押题引擎
 * ============================================================================
 *  ① Perplexity sonar-deep-research → 搜索情报
 *  ② Claude Sonnet 4.6 (OpenRouter)  → 精准押题
 *  ③ Gemini 3.1 Pro Preview (直连)    → 创新出题
 *  
 *  金库分桶存储：Global_Vault_{sub}_{type}
 *  向下兼容旧 Global_Vault_{sub} 混合池
 * ============================================================================
 */
const PKUAutoFetch = (() => {
  const VAULT_KEYS = ['101','201','301','408'];
  const CACHE_TTL = 12 * 60 * 60 * 1000;
  const SUBJ_NAMES = {'101':'政治','201':'英语','301':'数学','408':'计算机'};

  // ══════ API 配置 ══════
  const PPLX_URL = 'https://corsproxy.io/?https://api.perplexity.ai/chat/completions';
  const PPLX_MODELS = ['sonar-deep-research','sonar-reasoning-pro','sonar-pro','sonar'];
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent';

  // 密钥管理（会话级）
  function getKey() { return sessionStorage.getItem('PKU_PPLX_KEY') || ''; }
  function setKey(k) { sessionStorage.setItem('PKU_PPLX_KEY', k); }
  function hasKey() { return !!getKey(); }

  // 获取SDK钥匙
  function _getSDKKeys() {
    if (typeof PKUSDK !== 'undefined' && window.PKU_KEYS && window.PKU_KEYS.tier === 'premium') {
      return {
        pplx: window.PKU_KEYS.PERPLEXITY_API_KEY || '',
        or: window.PKU_KEYS.OPENROUTER_API_KEY || '',
        gd: window.PKU_KEYS.GEMINI_DIRECT_KEY || '',
        bs: window.PKU_KEYS.BAOSI_API_KEY || ''
      };
    }
    return { pplx: '', or: '', gd: '', bs: '' };
  }

  // ══════════════════════════════════════════════════════════
  //  STAGE 1: Perplexity 情报搜索
  // ══════════════════════════════════════════════════════════
  const INTEL_PROMPTS = {
    '101': `搜索2026年考研政治(101)最新命题趋势：
1. 最近3个月的重大时政事件（二十大、中央经济工作会议、两会等）
2. 教育部考试院大纲变动/新增考点
3. 各大名师（肖秀荣/徐涛/腿姐）的押题方向预测
4. 历年大小年规律：2025年重点考了什么→2026年轮换方向
5. "冷门但高概率"的考点预警
只输出情报摘要文字，不要出题。`,

    '201': `搜索2026年考研英语一(201)最新命题趋势：
1. 近6个月《经济学人》《卫报》《大西洋月刊》高频话题（AI/气候/经济）
2. 完形填空近3年词汇复现规律
3. 阅读理解出题来源期刊分析
4. 翻译/写作命题方向预测（社会热点/科技/教育）
5. 新题型最可能的形式（七选五vs排序vs小标题）
只输出情报摘要文字，不要出题。`,

    '301': `搜索2026年考研数学一(301)最新命题趋势：
1. 2023-2025真题的知识点分布统计
2. 连续3年未考但大纲覆盖的"必考回归"知识点
3. 高频压轴题型（无穷级数判敛/多元函数极值/参数估计等）
4. 计算量vs证明题的比例趋势
5. 名师（张宇/汤家凤/武忠祥）的核心押题方向
只输出情报摘要文字，不要出题。`,

    '408': `搜索2026年考研408计算机学科专业基础最新命题趋势：
1. 2023-2025真题四科（DS/CO/OS/NET）分值波动
2. 近年新增考点（RISC-V/SDN/容器/NVMe等前沿概念）
3. 综合应用题常考的跨学科结合点
4. 数据结构算法题的代码语言偏好与冷门结构（B+树/红黑树/跳表）
5. 王道/天勤/严蔚敏教材重点章节预测
只输出情报摘要文字，不要出题。`
  };

  async function fetchIntel(subCode) {
    const sdkKeys = _getSDKKeys();
    const pplxKey = getKey() || sdkKeys.pplx;
    if (!pplxKey) {
      console.log(`[📡S1] ${SUBJ_NAMES[subCode]}: 无Perplexity钥匙，跳过情报搜索`);
      return null;
    }

    for (const model of PPLX_MODELS) {
      console.log(`[📡S1] ${SUBJ_NAMES[subCode]} → Perplexity ${model} 搜索情报...`);
      try {
        const resp = await fetch(PPLX_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + pplxKey },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: '你是一位考研命题研究专家。请基于最新搜索结果输出详细的命题趋势分析。' },
              { role: 'user', content: INTEL_PROMPTS[subCode] }
            ],
            temperature: 0.3,
            max_tokens: 4000,
            search_recency_filter: 'month',
            return_related_questions: false
          })
        });
        if (!resp.ok) { if (resp.status === 401 || resp.status === 429) continue; throw new Error('HTTP ' + resp.status); }
        const data = await resp.json();
        if (data.error) { console.warn(`[📡S1] ${model}:`, data.error.message); continue; }
        const intel = (data.choices || [{}])[0]?.message?.content || '';
        if (intel.length > 100) {
          console.log(`[📡S1] ✅ ${SUBJ_NAMES[subCode]} 情报获取成功 (${intel.length}字)`);
          return intel;
        }
      } catch(e) {
        console.warn(`[📡S1] ${model} 失败:`, e.message);
        if (e.message.includes('quota') || e.message.includes('401')) continue;
      }
    }
    return null;
  }

  // ══════════════════════════════════════════════════════════
  //  STAGE 2: Claude 精准押题
  // ══════════════════════════════════════════════════════════
  const PREDICT_PROMPTS = {
    '101': (intel) => `你是全国考研政治命题组核心专家，以下是最新搜集的2026命题趋势情报：

${intel}

请基于以上情报，输出精准押题清单（JSON格式）：
{
  "single_choice": ["押题知识点1", "押题知识点2", ...共16个],
  "multi_choice": ["押题知识点1", ...共17个],
  "essay_material": ["材料分析方向1", ...共5个],
  "key_traps": ["今年最可能的命题陷阱1", "陷阱2", ...],
  "cold_spots": ["冷门高概率考点1", ...]
}
严格输出纯JSON，不要其他文字。`,

    '201': (intel) => `你是考研英语一命题组核心专家，以下是最新情报：

${intel}

输出精准押题清单（JSON）：
{
  "cloze_focus": ["完形填空重点词汇/搭配1", ...共20个],
  "reading_topics": ["阅读理解预测话题1", ...共4个],
  "new_type_variant": "seven_choose_five|paragraph_ordering|heading_matching",
  "translation_themes": ["翻译预测主题1", ...共5个],
  "writing_small": "小作文预测题型和方向",
  "writing_big": "大作文预测话题和图画方向",
  "key_vocabulary": ["核心词汇1", ...共30个]
}
严格JSON，不要其他文字。`,

    '301': (intel) => `你是考研数学一命题组核心专家，以下是最新情报：

${intel}

输出精准押题清单（JSON）：
{
  "choice_points": ["选择题押题知识点1", ...共10个],
  "fill_points": ["填空题押题知识点1", ...共6个],
  "essay_points": ["解答题押题方向1", ...共6个],
  "必考回归": ["3年未考即将回归的考点1", ...],
  "压轴预测": ["压轴题最可能的题型和知识点"]
}
严格JSON，不要其他文字。`,

    '408': (intel) => `你是408计算机统考命题组核心专家，以下是最新情报：

${intel}

输出精准押题清单（JSON）：
{
  "ds_choice": ["数据结构选择题押题1", ...共12个],
  "co_choice": ["组成原理选择题押题1", ...共12个],
  "os_choice": ["操作系统选择题押题1", ...共9个],
  "net_choice": ["网络选择题押题1", ...共7个],
  "comprehensive": ["综合应用题押题方向1", ...共7个],
  "跨学科结合": ["跨科综合题预测方向1", ...]
}
严格JSON，不要其他文字。`
  };

  async function predictQuestions(subCode, intel) {
    if (!intel) return null;
    const sdkKeys = _getSDKKeys();
    const orKey = sdkKeys.or;
    if (!orKey) {
      console.log(`[📡S2] ${SUBJ_NAMES[subCode]}: 无OpenRouter钥匙，跳过Claude押题`);
      return null;
    }

    console.log(`[📡S2] ${SUBJ_NAMES[subCode]} → Claude Sonnet 4.6 精准押题...`);
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + orKey },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4',
          messages: [
            { role: 'system', content: '你是考研押题第一人。根据情报做出精准判断。只输出JSON。' },
            { role: 'user', content: PREDICT_PROMPTS[subCode](intel) }
          ],
          temperature: 0.4,
          max_tokens: 4000
        })
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      const raw = (data.choices || [{}])[0]?.message?.content || '';
      const predictions = parseJSON(raw);
      if (predictions) {
        console.log(`[📡S2] ✅ ${SUBJ_NAMES[subCode]} Claude押题成功`);
        return predictions;
      }
    } catch(e) {
      console.warn(`[📡S2] Claude押题失败:`, e.message);
    }
    return null;
  }

  // ══════════════════════════════════════════════════════════
  //  STAGE 3: Gemini 按题型创新出题
  // ══════════════════════════════════════════════════════════

  // 全题型 Prompt 工厂
  const TYPE_PROMPTS = {
    // ── 101 政治 ──
    '101_single_choice': (pred, intel) => ({
      sys: '你是考研政治命题组核心专家。根据押题方向和情报生成高质量单选题。只输出纯JSON数组。',
      usr: `根据以下押题方向生成16道政治单选题：
${JSON.stringify(pred?.single_choice || ['马原辩证法','毛中特新发展理念','史纲改革开放','思修社会主义核心价值观','时政热点'])}

情报参考：${(intel||'').substring(0, 800)}

要求：4选1，涵盖马原(4)+毛中特(4)+史纲(3)+思修(3)+时政(2)
格式：[{"stem":"题干","options":["A.xx","B.xx","C.xx","D.xx"],"answer":"A","analysis":"解析","chapter":"马原","difficulty":2,"type":"single_choice"}]`
    }),

    '101_multi_choice': (pred, intel) => ({
      sys: '你是考研政治命题组核心专家。生成高质量多选题。只输出纯JSON数组。',
      usr: `根据押题方向生成17道政治多选题：
${JSON.stringify(pred?.multi_choice || [])}
情报：${(intel||'').substring(0, 600)}
要求：4选多(≥2个正确)，多选少选不得分。涵盖马原(5)+毛中特(5)+史纲(3)+思修(2)+时政(2)
格式：[{"stem":"题干","options":["A.xx","B.xx","C.xx","D.xx"],"answer":"ACD","analysis":"解析","chapter":"马原","difficulty":2,"type":"multi_choice"}]`
    }),

    '101_essay_material': (pred, intel) => ({
      sys: '你是考研政治命题组核心专家。生成材料分析题。只输出纯JSON数组。',
      usr: `根据押题方向生成5道材料分析题：
${JSON.stringify(pred?.essay_material || [])}
情报：${(intel||'').substring(0, 600)}
要求：每题含300-500字材料+2-3个子问题+参考答案。分布：马原(2)+毛中特(1)+史纲(1)+思修(1)
格式：[{"material":"材料文本","subQuestions":["问题1","问题2"],"referenceAnswer":"参考答案","chapter":"马原","difficulty":3,"type":"essay_material","score":10}]`
    }),

    // ── 201 英语 ──
    '201_cloze': (pred, intel) => ({
      sys: '你是考研英语命题组核心专家。生成完形填空题。只输出纯JSON。',
      usr: `生成1套完形填空(20空)：
词汇重点：${JSON.stringify(pred?.cloze_focus || [])}
要求：一篇240-280词的英文文章，20个编号空白，每空4个选项
格式：{"passage":"原文(用___1___标记空白位置)","blanks":[{"id":1,"options":["A.word1","B.word2","C.word3","D.word4"],"answer":"A","analysis":"解析"},...共20个],"type":"cloze"}`
    }),

    '201_reading': (pred, intel) => ({
      sys: '你是考研英语命题组核心专家。生成阅读理解题。只输出纯JSON数组。',
      usr: `生成4篇阅读理解(每篇5题=20题)：
预测话题：${JSON.stringify(pred?.reading_topics || ['AI技术','气候变化','经济政策','教育改革'])}
要求：每篇400-500词英文文章+5道四选一题目，模拟The Economist/Guardian语料
格式：[{"passage":"英文篇章","questions":[{"stem":"What...","options":["A.xx","B.xx","C.xx","D.xx"],"answer":"B","analysis":"解析"},...5题],"type":"reading_comprehension"},...4篇]`
    }),

    '201_new_type': (pred, intel) => ({
      sys: '你是考研英语命题组核心专家。生成新题型。只输出纯JSON。',
      usr: `生成1套新题型(5题)，类型：${pred?.new_type_variant || 'seven_choose_five'}
要求：一篇文章+5个空位+7个选项(其中5个正确2个干扰)
格式：{"passage":"英文文章(标明[A]-[E]位置)","options":["选项文本1","选项文本2",...7个],"answers":["A","C","E","F","B"],"analysis":"解析","type":"new_type"}`
    }),

    '201_translation': (pred, intel) => ({
      sys: '你是考研英语命题组核心专家。生成翻译题。只输出纯JSON。',
      usr: `生成1套英译汉翻译(5个划线句)：
主题方向：${JSON.stringify(pred?.translation_themes || [])}
要求：400词英文文章，5个划线句(含长难句/复合结构)，每句配参考译文
格式：{"passage":"英文全文","sentences":[{"id":1,"original":"划线英文句","reference":"参考中文翻译","analysis":"翻译要点"},...5句],"type":"translation"}`
    }),

    '201_writing': (pred, intel) => ({
      sys: '你是考研英语命题组核心专家。生成写作题。只输出纯JSON。',
      usr: `生成2道写作题(小作文+大作文)：
小作文方向：${pred?.writing_small || '书信/通知'}
大作文方向：${pred?.writing_big || '图画作文'}
格式：[{"type":"writing_small","prompt":"题目要求","wordCount":"100-120","referenceEssay":"参考范文","score":10},{"type":"writing_big","prompt":"题目要求(含图画描述)","wordCount":"160-200","referenceEssay":"参考范文","score":20}]`
    }),

    // ── 301 数学 ──
    '301_single_choice': (pred, intel) => ({
      sys: '你是考研数学命题组核心专家。生成高质量选择题。只输出纯JSON数组。',
      usr: `根据押题方向生成10道数学选择题：
${JSON.stringify(pred?.choice_points || [])}
要求：高数(6)+线代(2)+概率(2)，每题5分，4选1
格式：[{"stem":"题干(可含LaTeX)","options":["A.xx","B.xx","C.xx","D.xx"],"answer":"B","analysis":"完整解题过程","chapter":"高数/线代/概率","difficulty":2,"type":"single_choice","score":5}]`
    }),

    '301_fill_blank': (pred, intel) => ({
      sys: '你是考研数学命题组核心专家。生成填空题。只输出纯JSON数组。',
      usr: `根据押题方向生成6道数学填空题：
${JSON.stringify(pred?.fill_points || [])}
要求：高数(4)+线代(1)+概率(1)，每题5分
格式：[{"stem":"题干(可含LaTeX)","answer":"数学表达式答案","analysis":"完整解题过程","chapter":"高数","difficulty":2,"type":"fill_blank","score":5}]`
    }),

    '301_essay_solution': (pred, intel) => ({
      sys: '你是考研数学命题组核心专家。生成解答题。只输出纯JSON数组。',
      usr: `根据押题方向生成6道数学解答题：
${JSON.stringify(pred?.essay_points || [])}
要求：含证明题，每题10-12分，需写出完整解题步骤
格式：[{"stem":"题干","solution":"完整解题步骤","answer":"最终答案","chapter":"高数","difficulty":3,"type":"essay_solution","score":12}]`
    }),

    // ── 408 计算机 ──
    '408_single_choice': (pred, intel) => ({
      sys: '你是408统考命题组核心专家。生成高质量选择题。只输出纯JSON数组。',
      usr: `根据押题方向生成40道408选择题：
DS(12)：${JSON.stringify(pred?.ds_choice || [])}
CO(12)：${JSON.stringify(pred?.co_choice || [])}
OS(9)：${JSON.stringify(pred?.os_choice || [])}
NET(7)：${JSON.stringify(pred?.net_choice || [])}
要求：DS12+CO12+OS9+NET7=40题，4选1，每题2分
格式：[{"stem":"题干","options":["A.xx","B.xx","C.xx","D.xx"],"answer":"C","analysis":"解析","chapter":"数据结构/组成原理/操作系统/计算机网络","difficulty":2,"type":"single_choice","score":2}]`
    }),

    '408_comprehensive': (pred, intel) => ({
      sys: '你是408统考命题组核心专家。生成综合应用题。只输出纯JSON数组。',
      usr: `根据押题方向生成7道综合应用题：
${JSON.stringify(pred?.comprehensive || [])}
要求：DS(2)+CO(2)+OS(2)+NET(1)=7题，每题10分，含算法/计算/分析
格式：[{"stem":"题干","solution":"完整解答步骤","answer":"答案","chapter":"数据结构","difficulty":3,"type":"essay_comprehensive","score":10}]`
    })
  };

  // 所有需要生成的题型列表
  const SUBJECT_TYPES = {
    '101': ['101_single_choice', '101_multi_choice', '101_essay_material'],
    '201': ['201_cloze', '201_reading', '201_new_type', '201_translation', '201_writing'],
    '301': ['301_single_choice', '301_fill_blank', '301_essay_solution'],
    '408': ['408_single_choice', '408_comprehensive']
  };

  async function generateByType(subCode, typeKey, predictions, intel) {
    const promptFn = TYPE_PROMPTS[typeKey];
    if (!promptFn) return null;
    const { sys, usr } = promptFn(predictions, intel);

    const sdkKeys = _getSDKKeys();

    // 优先 Gemini 直连（创意出题）
    if (sdkKeys.gd) {
      console.log(`[📡S3] ${typeKey} → Gemini 3.1 Pro Preview 直连出题...`);
      try {
        const resp = await fetch(GEMINI_URL + '?key=' + sdkKeys.gd, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: sys + '\n\n' + usr }] }
            ],
            generationConfig: { temperature: 0.6, maxOutputTokens: 16000 }
          })
        });
        const data = await resp.json();
        if (!data.error) {
          const raw = (data.candidates || [{}])[0]?.content?.parts?.[0]?.text || '';
          const result = parseJSON(raw);
          if (result) {
            console.log(`[📡S3] ✅ ${typeKey} Gemini出题成功: ${Array.isArray(result) ? result.length + '题' : 'OK'}`);
            return result;
          }
        }
      } catch(e) { console.warn(`[📡S3] Gemini失败:`, e.message); }
    }

    // 降级：BaosiAPI
    if (sdkKeys.bs) {
      console.log(`[📡S3] ${typeKey} → BaosiAPI gemini-3.1-pro-high 备份出题...`);
      try {
        const resp = await fetch('https://api.baosiapi.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sdkKeys.bs },
          body: JSON.stringify({
            model: 'gemini-3.1-pro-high',
            messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }],
            temperature: 0.6, max_tokens: 16000
          })
        });
        const data = await resp.json();
        const raw = (data.choices || [{}])[0]?.message?.content || '';
        const result = parseJSON(raw);
        if (result) { console.log(`[📡S3] ✅ ${typeKey} BaosiAPI出题成功`); return result; }
      } catch(e) { console.warn(`[📡S3] BaosiAPI失败:`, e.message); }
    }

    // 再降级：直接用Perplexity出题（单步，老逻辑兜底）
    const pplxKey = getKey() || sdkKeys.pplx;
    if (pplxKey) {
      console.log(`[📡S3] ${typeKey} → Perplexity sonar 兜底出题...`);
      try {
        const resp = await fetch(PPLX_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + pplxKey },
          body: JSON.stringify({
            model: 'sonar', messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }],
            temperature: 0.5, max_tokens: 16000, search_recency_filter: 'month'
          })
        });
        const data = await resp.json();
        const raw = (data.choices || [{}])[0]?.message?.content || '';
        const result = parseJSON(raw);
        if (result) { console.log(`[📡S3] ✅ ${typeKey} Perplexity兜底成功`); return result; }
      } catch(e) { console.warn(`[📡S3] Perplexity兜底失败:`, e.message); }
    }

    return null;
  }

  // ══════════════════════════════════════════════════════════
  //  三阶段融合：情报→押题→出题
  // ══════════════════════════════════════════════════════════

  async function fetchSubjectFull(subCode, onTypeProgress) {
    const types = SUBJECT_TYPES[subCode];
    if (!types) return {};

    // Stage 1: Perplexity 情报
    console.log(`\n[📡] ══════ ${SUBJ_NAMES[subCode]}(${subCode}) 三模型链启动 ══════`);
    const intel = await fetchIntel(subCode);

    // Stage 2: Claude 押题
    const predictions = await predictQuestions(subCode, intel || `2026年${SUBJ_NAMES[subCode]}考研最新趋势分析`);

    // Stage 3: Gemini 按题型出题
    const results = {};
    for (let i = 0; i < types.length; i++) {
      const typeKey = types[i];
      if (onTypeProgress) onTypeProgress(subCode, typeKey, i, types.length);
      console.log(`[📡S3] ── ${typeKey} (${i+1}/${types.length}) ──`);

      const questions = await generateByType(subCode, typeKey, predictions, intel);
      if (questions) {
        const typeName = typeKey.split('_').slice(1).join('_');
        const added = writeToTypedVault(subCode, typeName, questions);
        results[typeKey] = { count: Array.isArray(questions) ? questions.length : 1, added };
        // 同时写入混合池（向下兼容）
        if (Array.isArray(questions)) {
          writeToVaultLegacy(subCode, questions);
        }
      } else {
        results[typeKey] = { error: '生成失败' };
      }
    }

    return results;
  }

  // ══════════════════════════════════════════════════════════
  //  金库存储（分桶 + 混合池向下兼容）
  // ══════════════════════════════════════════════════════════

  function writeToTypedVault(subCode, typeName, data) {
    const key = 'Global_Vault_' + subCode + '_' + typeName;
    let existing = [];
    try { existing = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
    if (!Array.isArray(existing)) existing = [];

    const items = Array.isArray(data) ? data : [data];
    const tagged = items.map(q => ({ ...q, source: 'chain_v3', fetchTime: new Date().toISOString() }));

    // 去重
    const existStems = new Set(existing.map(q => (q.stem || q.passage || q.material || '').substring(0, 40)));
    const fresh = tagged.filter(q => {
      const sig = (q.stem || q.passage || q.material || '').substring(0, 40);
      return sig.length > 3 && !existStems.has(sig);
    });

    const merged = [...fresh, ...existing];
    try { localStorage.setItem(key, JSON.stringify(merged)); } catch(e) { console.warn('存储溢出:', key); }
    localStorage.setItem('Vault_FetchTime_' + subCode, Date.now().toString());

    console.log(`[📡金库] ${key}: 新增${fresh.length}, 总计${merged.length}`);
    return fresh.length;
  }

  function writeToVaultLegacy(subCode, questions) {
    if (!Array.isArray(questions) || questions.length === 0) return 0;
    // 只写有options的客观题到混合池
    const objective = questions.filter(q => q.options && q.options.length >= 2);
    if (objective.length === 0) return 0;

    const standardized = objective.map(q => ({
      stem: q.stem || q.q || '', q: q.stem || q.q || '',
      options: q.options || [], o: q.options || [],
      answer: q.answer || 'A', a: typeof q.a === 'number' ? q.a : Math.max(0, 'ABCD'.indexOf((q.answer||'A')[0])),
      analysis: q.analysis || q.hint || '', chapter: q.chapter || '',
      difficulty: q.difficulty || 2, type: q.type || 'single_choice',
      source: 'chain_v3', fetchTime: new Date().toISOString()
    }));

    let existing = [];
    try { existing = JSON.parse(localStorage.getItem('Global_Vault_' + subCode) || '[]'); } catch(e) {}
    const existStems = new Set(existing.map(q => (q.stem || q.q || '').substring(0, 30)));
    const fresh = standardized.filter(q => !existStems.has(q.stem.substring(0, 30)) && q.stem.length > 5);
    const merged = [...fresh, ...existing];
    localStorage.setItem('Global_Vault_' + subCode, JSON.stringify(merged));
    return fresh.length;
  }

  function parseJSON(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e) {}
    // 去markdown标记
    let clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    try { return JSON.parse(clean); } catch(e) {}
    // 找JSON数组
    const s = clean.indexOf('['), e2 = clean.lastIndexOf(']');
    if (s >= 0 && e2 > s) try { return JSON.parse(clean.substring(s, e2 + 1)); } catch(ex) {}
    // 找JSON对象
    const o = clean.indexOf('{'), c = clean.lastIndexOf('}');
    if (o >= 0 && c > o) try { return JSON.parse(clean.substring(o, c + 1)); } catch(ex) {}
    return null;
  }

  function needsRefresh(subCode) {
    const lastFetch = parseInt(localStorage.getItem('Vault_FetchTime_' + subCode) || '0');
    return (Date.now() - lastFetch) > CACHE_TTL;
  }

  // ══════════════════════════════════════════════════════════
  //  全科抓取
  // ══════════════════════════════════════════════════════════
  async function fetchAll(onProgress) {
    const results = {};
    let total = 0;
    for (let i = 0; i < VAULT_KEYS.length; i++) {
      const sub = VAULT_KEYS[i];
      if (onProgress) onProgress(sub, 'fetching', i, VAULT_KEYS.length);

      if (!needsRefresh(sub)) {
        if (onProgress) onProgress(sub, 'cached', i, VAULT_KEYS.length);
        results[sub] = { cached: true };
        continue;
      }

      try {
        const typeResults = await fetchSubjectFull(sub, (s, type, ti, tt) => {
          if (onProgress) onProgress(sub, 'type_' + type, i, VAULT_KEYS.length, ti, tt);
        });
        results[sub] = typeResults;
      } catch(e) {
        results[sub] = { error: e.message };
      }
      if (onProgress) onProgress(sub, 'done', i + 1, VAULT_KEYS.length);
    }
    return { results, totalAdded: total };
  }

  // 金库统计（含分桶）
  function getVaultStats() {
    const stats = {};
    for (const sub of VAULT_KEYS) {
      const types = SUBJECT_TYPES[sub] || [];
      const typeCounts = {};
      let subTotal = 0;
      for (const t of types) {
        const typeName = t.split('_').slice(1).join('_');
        try {
          const arr = JSON.parse(localStorage.getItem('Global_Vault_' + sub + '_' + typeName) || '[]');
          typeCounts[typeName] = arr.length;
          subTotal += arr.length;
        } catch(e) { typeCounts[typeName] = 0; }
      }
      // 混合池
      let legacyCount = 0;
      try { legacyCount = JSON.parse(localStorage.getItem('Global_Vault_' + sub) || '[]').length; } catch(e) {}
      const lastFetch = parseInt(localStorage.getItem('Vault_FetchTime_' + sub) || '0');
      stats[sub] = {
        types: typeCounts, typed: subTotal, legacy: legacyCount,
        lastFetch: lastFetch ? new Date(lastFetch).toLocaleString('zh-CN') : '未抓取',
        needsRefresh: needsRefresh(sub)
      };
    }
    return stats;
  }

  // ══════════════════════════════════════════════════════════
  //  UI 弹窗
  // ══════════════════════════════════════════════════════════
  function injectUI() {
    if (document.getElementById('pkuFetchModal')) return;
    const overlay = document.createElement('div');
    overlay.id = 'pkuFetchModal';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(6,6,12,.95);backdrop-filter:blur(20px);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';

    overlay.innerHTML = `
      <div style="background:rgba(18,18,36,.95);border:1px solid rgba(255,215,0,.15);border-radius:20px;padding:32px 28px;max-width:500px;width:92%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.8);max-height:90vh;overflow-y:auto">
        <div style="font-size:36px;margin-bottom:8px">🔗</div>
        <h2 style="font-size:22px;background:linear-gradient(135deg,#ffd700,#ff8c00,#ff2e63);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 4px">三模型链式押题引擎</h2>
        <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#555;margin-bottom:12px">PERPLEXITY → CLAUDE → GEMINI · v3.0</div>
        <p style="font-size:11px;color:#888;line-height:1.8;margin-bottom:16px;text-align:left">
          ① <strong style="color:#08f7fe">Perplexity</strong> 搜索全网最新考研情报<br>
          ② <strong style="color:#a855f7">Claude 4.6</strong> 根据情报精准押题<br>
          ③ <strong style="color:#39ff14">Gemini 3.1</strong> 按13种题型创新出题<br>
          🔒 全部题目按考卷结构分桶注入金库
        </p>
        <input type="password" id="pkuFetchKeyInput" placeholder="pplx-xxxxxxxx (可选，超级用户自动注入)" autocomplete="off"
          style="width:100%;padding:14px 16px;background:rgba(6,6,14,.8);border:1px solid rgba(255,215,0,.1);border-radius:10px;color:#e8e8f0;font-family:monospace;font-size:13px;outline:none;margin-bottom:8px">
        <div id="pkuFetchErr" style="color:#ff2e63;font-size:12px;min-height:18px;margin-bottom:8px"></div>
        <div id="pkuFetchProgress" style="display:none;margin-bottom:12px">
          <div style="background:rgba(255,255,255,.04);border-radius:4px;height:6px;overflow:hidden;margin-bottom:6px">
            <div id="pkuFetchBar" style="height:100%;background:linear-gradient(90deg,#08f7fe,#a855f7,#39ff14);border-radius:4px;transition:width .4s;width:0%"></div>
          </div>
          <div id="pkuFetchStatus" style="font-size:11px;color:#08f7fe;font-family:monospace;letter-spacing:1px">准备中...</div>
        </div>
        <div id="pkuFetchStats" style="display:none;background:rgba(6,6,14,.6);border:1px solid rgba(255,215,0,.08);border-radius:10px;padding:12px;margin-bottom:12px;text-align:left;font-size:10px;color:#888;line-height:1.8"></div>
        <button id="pkuFetchBtn" onclick="PKUAutoFetch._startFetch()" style="width:100%;padding:14px;border:none;border-radius:12px;background:linear-gradient(135deg,#ffd700,#a855f7,#08f7fe);color:#fff;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:2px">
          🔗 启动三模型链式押题
        </button>
        <button onclick="PKUAutoFetch._closeModal()" style="margin-top:8px;background:none;border:1px solid rgba(255,255,255,.06);color:#444;padding:6px 16px;border-radius:8px;cursor:pointer;font-size:11px">跳过（使用已有题库）</button>
      </div>
    `;
    document.body.appendChild(overlay);
    if (hasKey() || (_getSDKKeys().pplx)) { _showStats(); overlay.style.display = 'none'; }
  }

  function _showStats() {
    const stats = getVaultStats();
    const el = document.getElementById('pkuFetchStats');
    if (!el) return;
    const TYPE_NAMES = {
      single_choice:'单选',multi_choice:'多选',essay_material:'材料分析',
      cloze:'完形',reading:'阅读',new_type:'新题型',translation:'翻译',writing:'写作',
      fill_blank:'填空',essay_solution:'解答',comprehensive:'综合应用'
    };
    let html = '<strong style="color:#ffd700">📦 金库库存(分桶):</strong><br>';
    for (const [sub, info] of Object.entries(stats)) {
      html += `<div style="margin:4px 0"><strong style="color:#08f7fe">${SUBJ_NAMES[sub]}(${sub})</strong>: `;
      for (const [t, c] of Object.entries(info.types || {})) {
        const color = c > 0 ? '#39ff14' : '#555';
        html += `<span style="color:${color}">${TYPE_NAMES[t]||t}:${c}</span> `;
      }
      html += `<span style="color:#666">| 混合池:${info.legacy}</span></div>`;
    }
    el.innerHTML = html;
    el.style.display = 'block';
  }

  async function _startFetch() {
    const input = document.getElementById('pkuFetchKeyInput');
    const errEl = document.getElementById('pkuFetchErr');
    const btn = document.getElementById('pkuFetchBtn');
    const progress = document.getElementById('pkuFetchProgress');
    const bar = document.getElementById('pkuFetchBar');
    const status = document.getElementById('pkuFetchStatus');

    const key = (input?.value || '').trim();
    if (key && key.startsWith('pplx-')) setKey(key);

    if (errEl) errEl.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = '🔴 三模型链运行中...'; }
    if (progress) progress.style.display = 'block';

    try {
      const result = await fetchAll((sub, state, done, total) => {
        const pct = Math.round(((done + 0.5) / total) * 100);
        if (bar) bar.style.width = pct + '%';
        if (status) {
          if (state === 'fetching') status.textContent = `🔴 ${SUBJ_NAMES[sub]} · S1-情报搜索...`;
          else if (state === 'cached') status.textContent = `✅ ${SUBJ_NAMES[sub]} · 12h缓存`;
          else if (state.startsWith('type_')) status.textContent = `🔴 ${SUBJ_NAMES[sub]} · S3-${state.replace('type_','')}...`;
          else status.textContent = `✅ ${SUBJ_NAMES[sub]} · 完成 (${done}/${total})`;
        }
      });

      if (bar) bar.style.width = '100%';
      _showStats();
      if (status) { status.textContent = '🏆 三模型链全部完成！';  status.style.color = '#39ff14'; }
      if (btn) { btn.textContent = '✅ 完成！进入游戏'; btn.disabled = false; btn.onclick = () => _closeModal(); }
    } catch(e) {
      if (errEl) errEl.textContent = '❌' + e.message;
      if (btn) { btn.disabled = false; btn.textContent = '🔄 重试'; }
    }
  }

  function _closeModal() {
    const m = document.getElementById('pkuFetchModal');
    if (m) m.style.display = 'none';
  }

  function showModal() {
    injectUI();
    const m = document.getElementById('pkuFetchModal');
    if (m) {
      m.style.display = 'flex';
      _showStats();
      const sdkKeys = _getSDKKeys();
      if (hasKey() || sdkKeys.pplx) {
        const input = document.getElementById('pkuFetchKeyInput');
        if (input) input.value = getKey() || sdkKeys.pplx || '';
      }
    }
  }

  // 自动初始化
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      injectUI();
      const stats = getVaultStats();
      const totalQ = Object.values(stats).reduce((s, v) => s + (v.typed || 0) + (v.legacy || 0), 0);
      if (totalQ === 0 && !hasKey() && !_getSDKKeys().pplx) showModal();
    });
  }

  return {
    fetchAll, fetchSubjectFull, fetchIntel, predictQuestions, generateByType,
    writeToTypedVault, writeToVaultLegacy, getVaultStats, parseJSON,
    getKey, setKey, hasKey, showModal, needsRefresh, injectUI,
    _startFetch, _closeModal, _showStats,
    SUBJ_NAMES, VAULT_KEYS, SUBJECT_TYPES
  };
})();
