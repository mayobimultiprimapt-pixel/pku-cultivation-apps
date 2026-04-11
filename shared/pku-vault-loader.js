/**
 * ============================================================================
 *  PKU Vault Loader v2.0 — 分桶金库加载器
 * ============================================================================
 *  支持按题型精确拉取，题量严格按考卷结构
 *  
 *  新API:
 *    VaultLoader.getTyped('101', 'single_choice', 16)  → 严格16道单选
 *    VaultLoader.getTyped('201', 'reading')             → 全部阅读理解
 *    VaultLoader.getPaperByType('101')                  → 按考卷结构返回完整题目
 *    VaultLoader.stats()                                 → 含分桶统计
 *  
 *  向下兼容:
 *    VaultLoader.get('101', 20)                         → 从混合池取（旧逻辑）
 * ============================================================================
 */
const VaultLoader = (() => {
  const SUBJECTS = ['101', '201', '301', '408'];
  const NAMES = { '101': '政治', '201': '英语', '301': '数学', '408': '计算机' };

  // 考卷结构：每科每个题型要多少道
  const EXAM_STRUCTURE = {
    '101': {
      single_choice:  { count: 16, scorePer: 1,  total: 16 },
      multi_choice:   { count: 17, scorePer: 2,  total: 34 },
      essay_material: { count: 5,  scorePer: 10, total: 50 }
    },
    '201': {
      cloze:                  { count: 20, scorePer: 0.5, total: 10 },
      reading:                { count: 4,  scorePer: null, total: 40, note: '4篇×5题=20题' },
      new_type:               { count: 1,  scorePer: null, total: 10, note: '1套5题' },
      translation:            { count: 1,  scorePer: null, total: 10, note: '1套5句' },
      writing:                { count: 2,  scorePer: null, total: 30, note: '小+大作文' }
    },
    '301': {
      single_choice:  { count: 10, scorePer: 5,  total: 50 },
      fill_blank:     { count: 6,  scorePer: 5,  total: 30 },
      essay_solution: { count: 6,  scorePer: null, total: 70 }
    },
    '408': {
      single_choice:      { count: 40, scorePer: 2, total: 80 },
      comprehensive:      { count: 7,  scorePer: 10, total: 70 }
    }
  };

  // 题型中文名
  const TYPE_NAMES = {
    single_choice: '单选', multi_choice: '多选', essay_material: '材料分析',
    cloze: '完形填空', reading: '阅读理解', new_type: '新题型',
    translation: '翻译', writing: '写作',
    fill_blank: '填空', essay_solution: '解答',
    comprehensive: '综合应用', essay_comprehensive: '综合应用'
  };

  // ═══ 读取分桶金库 ═══
  function _readTypedVault(sub, type) {
    try {
      const raw = localStorage.getItem('Global_Vault_' + sub + '_' + type);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch(e) { return []; }
  }

  // ═══ 读取混合池（向下兼容） ═══
  function _readLegacyVault(sub) {
    try {
      const raw = localStorage.getItem('Global_Vault_' + sub);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch(e) { return []; }
  }

  function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * 从分桶金库取题（新API）
   * @param {string} sub - '101'|'201'|'301'|'408'
   * @param {string} type - 'single_choice'|'multi_choice'|'cloze' 等
   * @param {number} [count] - 需要的题数，默认按考卷数量
   * @returns {Array}
   */
  function getTyped(sub, type, count) {
    // 先从分桶读
    let pool = _readTypedVault(sub, type);

    // 如果分桶为空，尝试从混合池中按type过滤
    if (pool.length === 0) {
      const legacy = _readLegacyVault(sub);
      pool = legacy.filter(q => (q.type || 'single_choice') === type);
    }

    pool = _shuffle(pool);

    // 默认数量 = 考卷要求数量
    if (!count && EXAM_STRUCTURE[sub] && EXAM_STRUCTURE[sub][type]) {
      count = EXAM_STRUCTURE[sub][type].count;
    }

    const result = count ? pool.slice(0, count) : pool;
    console.log(`[VaultLoader] ${NAMES[sub]} ${TYPE_NAMES[type]||type}: 需${count||'全部'}, 库${pool.length}, 出${result.length}`);
    return result;
  }

  /**
   * 按考卷结构获取某科全部题型
   * @param {string} sub
   * @returns {Object} { single_choice: [...], multi_choice: [...], ... }
   */
  function getPaperByType(sub) {
    const struct = EXAM_STRUCTURE[sub];
    if (!struct) return {};
    const paper = {};
    for (const [type, spec] of Object.entries(struct)) {
      paper[type] = {
        questions: getTyped(sub, type, spec.count),
        target: spec.count,
        scorePerItem: spec.scorePer,
        totalScore: spec.total,
        name: TYPE_NAMES[type] || type
      };
    }
    return paper;
  }

  /**
   * 从混合池取题（向下兼容旧API）
   */
  function get(sub, count, type) {
    if (type) return getTyped(sub, type, count);
    let pool = _readLegacyVault(sub);
    pool = _shuffle(pool);
    const result = pool.slice(0, count || pool.length);
    return result;
  }

  /** 四科混合取题 */
  function getAll(perSubject) {
    let all = [];
    for (const sub of SUBJECTS) all = all.concat(get(sub, perSubject || 10));
    return _shuffle(all);
  }

  /** 金库统计（含分桶） */
  function stats() {
    const s = {};
    let grandTotal = 0;
    for (const sub of SUBJECTS) {
      const struct = EXAM_STRUCTURE[sub] || {};
      const types = {};
      let subTotal = 0;
      for (const type of Object.keys(struct)) {
        const arr = _readTypedVault(sub, type);
        types[type] = { count: arr.length, target: struct[type].count, name: TYPE_NAMES[type] || type };
        subTotal += arr.length;
      }
      const legacy = _readLegacyVault(sub).length;
      s[sub] = { name: NAMES[sub], types, typed: subTotal, legacy, total: subTotal + legacy };
      grandTotal += subTotal + legacy;
    }
    s.grandTotal = grandTotal;
    return s;
  }

  function isEmpty() {
    return SUBJECTS.every(sub => {
      const struct = EXAM_STRUCTURE[sub] || {};
      return Object.keys(struct).every(t => _readTypedVault(sub, t).length === 0) && _readLegacyVault(sub).length === 0;
    });
  }

  function hasSubject(sub) {
    const struct = EXAM_STRUCTURE[sub] || {};
    const hasTyped = Object.keys(struct).some(t => _readTypedVault(sub, t).length > 0);
    return hasTyped || _readLegacyVault(sub).length > 0;
  }

  console.log('[VaultLoader] v2.0 Ready (分桶模式)');

  return {
    get, getAll, getTyped, getPaperByType, stats, isEmpty, hasSubject,
    SUBJECTS, NAMES, EXAM_STRUCTURE, TYPE_NAMES
  };
})();
