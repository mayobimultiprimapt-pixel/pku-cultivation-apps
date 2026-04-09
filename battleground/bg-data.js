/**
 * 刺激战场 · 数据层改造版
 * ========================================
 * 从独立题库文件加载500题/科，每局按真实卷面结构随机抽题
 * 
 * 卷面结构(选择题部分):
 *   101政治: 33题 (16单选+17多选)
 *   301数学: 10题 (10道单选)
 *   201英语: 45题 (20完形+20阅读+5新题型)
 *   408计算机: 40题 (DS12+计组12+OS9+计网7)
 */
const BGData = (() => {
  // ═══ 每局抽题配置 · 真实卷面结构 ═══
  const EXAM_STRUCTURE = {
    politics: {
      total: 33,
      // 真实卷面: 马原约24% 毛概约30% 史纲约14% 思修约16% 时政约16%
      // cat标签: marx, mao, xi, hist, history, moral, ethics, news, current
      distribution: { marx:8, mao:5, xi:4, hist:3, history:3, moral:3, ethics:2, news:3, current:2 }
    },
    math: {
      total: 10,
      // 真实卷面: 高数60% 线代20% 概率20%
      distribution: { calculus:6, linalg:2, prob:2 }
    },
    english: {
      total: 45,
      // 真实卷面: 完形20题 阅读20题 新题型5题
      // cat标签: cloze, reading, new, newtype
      distribution: { cloze:20, reading:20, new:3, newtype:2 }
    },
    cs: {
      total: 40,
      // 真实卷面: DS约30% CO约30% OS约23% NET约17%
      distribution: { ds:12, co:12, os:9, net:7 }
    }
  };

  const MAPS = {
    politics: {
      name:'政治沙漠', icon:'🏜️', subject:'101政治',
      bgColor:'linear-gradient(180deg,#1a0f00,#2d1a00,#451a03)',
      bgImage:'bg-desert.png',
      totalTime:300, scorePerQ:1,
      airdrops:2, enemyEmoji:'🤖',
      questions:[] // 由题库文件填充
    },
    math: {
      name:'数学雨林', icon:'🌴', subject:'301数学',
      bgColor:'linear-gradient(180deg,#002a10,#003d15,#064e3b)',
      bgImage:'bg-jungle.png',
      totalTime:300, scorePerQ:5,
      airdrops:2, enemyEmoji:'🧮',
      questions:[]
    },
    english: {
      name:'极寒冰原', icon:'❄️', subject:'201英语',
      bgColor:'linear-gradient(180deg,#0a1628,#1e3a5f,#1e40af)',
      bgImage:'bg-snow.png',
      totalTime:240, scorePerQ:2,
      airdrops:3, enemyEmoji:'📖',
      questions:[]
    },
    cs: {
      name:'赛博都市', icon:'🏙️', subject:'408计算机',
      bgColor:'linear-gradient(180deg,#0d0520,#1a0a3e,#2d1b69)',
      bgImage:'bg-city.png',
      totalTime:360, scorePerQ:2,
      airdrops:5, enemyEmoji:'💻',
      questions:[]
    }
  };

  // ═══ 从全局题库变量加载题目 ═══
  function loadQuestionBanks() {
    const bankMap = {
      politics: typeof POLITICS_QUESTIONS !== 'undefined' ? POLITICS_QUESTIONS : [],
      math:     typeof MATH_QUESTIONS !== 'undefined' ? MATH_QUESTIONS : [],
      english:  typeof ENGLISH_QUESTIONS !== 'undefined' ? ENGLISH_QUESTIONS : [],
      cs:       typeof CS_QUESTIONS !== 'undefined' ? CS_QUESTIONS : []
    };

    for (const [mapId, bank] of Object.entries(bankMap)) {
      if (bank.length > 0) {
        MAPS[mapId].questions = bank;
        console.log(`[刺激战场] ${mapId}: 加载题库 ${bank.length} 题`);
      }
    }
  }

  // ═══ 按卷面结构抽题 · 核心函数 ═══
  function buildExamPaper(mapId) {
    const struct = EXAM_STRUCTURE[mapId];
    const allQ = MAPS[mapId]?.questions || [];
    if (allQ.length === 0 || !struct) return allQ; // fallback

    const result = [];
    const dist = struct.distribution;

    // 按分类分组
    const byCat = {};
    allQ.forEach(q => {
      const c = q.cat || 'unknown';
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push(q);
    });

    // 按配额从各分类随机抽题
    for (const [cat, count] of Object.entries(dist)) {
      const pool = byCat[cat] || [];
      const shuffled = shuffleArray([...pool]);
      const picked = shuffled.slice(0, Math.min(count, shuffled.length));
      result.push(...picked);
    }

    // 如果某些分类题不够，从其他分类补充
    if (result.length < struct.total) {
      const usedStems = new Set(result.map(q => q.stem));
      const remaining = allQ.filter(q => !usedStems.has(q.stem));
      const extra = shuffleArray(remaining).slice(0, struct.total - result.length);
      result.push(...extra);
    }

    // 最终打乱顺序(模拟随机出题)
    return shuffleArray(result).slice(0, struct.total);
  }

  // ═══ 工具函数 ═══
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Airdrop items pool
  const AIRDROPS = [
    {id:'shield', icon:'🛡️', name:'护盾 +20%', desc:'额外生命值', weight:40, effect:'hp'},
    {id:'time',   icon:'⏱️', name:'时间 +30秒', desc:'毒圈延缓', weight:25, effect:'time'},
    {id:'ammo',   icon:'💡', name:'弹药 +3',    desc:'增加提示次数', weight:20, effect:'hint'},
    {id:'scroll', icon:'📝', name:'押题卷',     desc:'下题直接显示答案', weight:10, effect:'reveal'},
    {id:'buff',   icon:'🔥', name:'连杀Buff',   desc:'下3题分数×2', weight:5, effect:'double'},
  ];

  function getMap(id) {
    if (!MAPS[id]) return null;
    // 每次获取地图时，按卷面结构抽题（每局不同）
    const map = { ...MAPS[id] };
    map.questions = buildExamPaper(id);
    return map;
  }
  function getMapIds() { return Object.keys(MAPS); }
  function getAirdrops() { return [...AIRDROPS]; }

  // Weighted random airdrop selection (pick 3 unique)
  function rollAirdrop() {
    const pool = [];
    AIRDROPS.forEach(a => { for(let i=0;i<a.weight;i++) pool.push(a); });
    const picked = new Set();
    const result = [];
    while(result.length < 3 && picked.size < AIRDROPS.length) {
      const r = pool[Math.floor(Math.random()*pool.length)];
      if(!picked.has(r.id)) { picked.add(r.id); result.push({...r}); }
    }
    return result;
  }


  // ═══ Global Vault 注入 — 从天机阁金库读取真题合并 ═══
  const VAULT_MAP = { politics:'101', english:'201', math:'301', cs:'408' };
  function convertVaultQ(vq) {
    const opts = (vq.options || []).map(o => typeof o === 'string' ? o : String(o));
    let ansIdx = 0;
    if (vq.answer && opts.length > 0) {
      const ansLetter = String(vq.answer).trim().charAt(0).toUpperCase();
      ansIdx = 'ABCDE'.indexOf(ansLetter);
      if (ansIdx < 0) ansIdx = 0;
    }
    return {
      stem: vq.stem || vq.q || '题目加载失败',
      opts: opts.length >= 2 ? opts : ['A.暂无','B.暂无','C.暂无','D.暂无'],
      ans: ansIdx,
      hint: vq.analysis ? vq.analysis.substring(0, 50) : '来源: 天机阁金库',
      fromVault: true
    };
  }
  function loadVaultQuestions() {
    try {
      for (const [mapId, subCode] of Object.entries(VAULT_MAP)) {
        const raw = localStorage.getItem('Global_Vault_' + subCode);
        if (!raw) continue;
        const vaultQ = JSON.parse(raw);
        if (!Array.isArray(vaultQ) || vaultQ.length === 0) continue;
        const single = vaultQ.filter(q => !q.type || q.type === 'single_choice' || q.type === 'multi_choice');
        const converted = single.map(convertVaultQ).filter(q => q.stem.length > 5);
        if (converted.length > 0 && MAPS[mapId]) {
          const existStems = new Set(MAPS[mapId].questions.map(q => q.stem));
          const newQ = converted.filter(q => !existStems.has(q.stem));
          MAPS[mapId].questions = [...MAPS[mapId].questions, ...newQ];
          console.log('[刺激战场] ' + mapId + ': 加载金库 +' + newQ.length + ' 题 (总' + MAPS[mapId].questions.length + ')');
        }
      }
    } catch(e) { console.warn('[刺激战场] 金库读取失败:', e.message); }
  }

  // ═══ 终端投放系统 · 替代原每日抓题 ═══
  // 改为通过终端(最强大脑)投放新题目到本地存储
  const TERMINAL_INJECT_KEY = 'BG_Terminal_Inject_';
  
  function injectFromTerminal(mapId, questions) {
    // 终端投放的题目写入 localStorage
    if (!Array.isArray(questions) || questions.length === 0) return 0;
    const key = TERMINAL_INJECT_KEY + mapId;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const existStems = new Set([...existing.map(q => q.stem), ...MAPS[mapId].questions.map(q => q.stem)]);
    const newQ = questions.filter(q => q.stem && !existStems.has(q.stem));
    if (newQ.length > 0) {
      existing.push(...newQ);
      localStorage.setItem(key, JSON.stringify(existing));
      MAPS[mapId].questions.push(...newQ);
      console.log(`[刺激战场] 终端投放 ${mapId}: +${newQ.length} 题 (总${MAPS[mapId].questions.length})`);
    }
    return newQ.length;
  }

  function loadTerminalQuestions() {
    try {
      for (const mapId of Object.keys(MAPS)) {
        const key = TERMINAL_INJECT_KEY + mapId;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const questions = JSON.parse(raw);
        if (!Array.isArray(questions) || questions.length === 0) continue;
        const existStems = new Set(MAPS[mapId].questions.map(q => q.stem));
        const newQ = questions.filter(q => !existStems.has(q.stem));
        if (newQ.length > 0) {
          MAPS[mapId].questions.push(...newQ);
          console.log(`[刺激战场] ${mapId}: 终端缓存加载 +${newQ.length} 题`);
        }
      }
    } catch(e) { console.warn('[刺激战场] 终端缓存读取失败:', e.message); }
  }

  // ═══ 初始化加载 ═══
  function initAll() {
    loadQuestionBanks();
    if (typeof localStorage !== 'undefined') {
      loadVaultQuestions();
      loadTerminalQuestions();
    }
    // 输出统计
    for (const [id, map] of Object.entries(MAPS)) {
      const struct = EXAM_STRUCTURE[id];
      console.log(`[刺激战场] ${map.icon} ${map.name}: 题库${map.questions.length}题, 每局抽${struct.total}题`);
    }
  }

  // 页面加载时自动初始化
  initAll();

  return { getMap, getMapIds, getAirdrops, rollAirdrop, MAPS, 
           loadVaultQuestions, injectFromTerminal, buildExamPaper,
           EXAM_STRUCTURE };
})();
