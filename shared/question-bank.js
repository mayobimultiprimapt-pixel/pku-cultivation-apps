// ============================================================
//  北大考研 · 统一题库共享层 v1.0
//  所有游戏（消消乐/刺激战场/猛鬼宿舍）共享此脚本
//  题目来源：天机阁 · 题库搜集站
// ============================================================

const PKU_QBANK = {
  // 存储键名前缀（与搜集站统一）
  KEY_PREFIX: 'pku_qbank_',
  PAPERS_PREFIX: 'pku_papers_',
  META_KEY: 'pku_qbank_meta',

  // 考试结构模板 — 还原真实考研试卷结构
  EXAM_STRUCTURE: {
    '101': {
      name: '考研政治', fullScore: 100, timeLimit: 150,
      sections: [
        { name: '一、单项选择题', type: 'single', count: 16, scoreEach: 1, instruction: '下列每题给出的四个选项中，只有一个选项是最符合题目要求的。' },
        { name: '二、多项选择题', type: 'multi', count: 17, scoreEach: 2, instruction: '下列每题给出的四个选项中，至少有两个选项是符合题目要求的。少选1分，错选不得分。' },
        { name: '三、材料分析题', type: 'material', count: 5, scoreEach: 10, instruction: '结合材料回答问题。' }
      ]
    },
    '201': {
      name: '考研英语一', fullScore: 100, timeLimit: 180,
      sections: [
        { name: 'Section I: Cloze', type: 'single', count: 20, scoreEach: 0.5, instruction: 'Read the following text and fill each blank with the best answer.' },
        { name: 'Section II: Reading Part A', type: 'single', count: 20, scoreEach: 2, instruction: 'Read the following passages and answer the questions.' },
        { name: 'Section II: Reading Part B', type: 'single', count: 5, scoreEach: 2, instruction: 'Match the headings/sentences with the paragraphs.' },
        { name: 'Section III: Translation', type: 'fill', count: 5, scoreEach: 2, instruction: 'Translate the underlined sentences into Chinese.' },
        { name: 'Section IV: Writing', type: 'essay', count: 2, scoreEach: 15, instruction: 'Write an essay according to the instructions.' }
      ]
    },
    '301': {
      name: '考研数学一', fullScore: 150, timeLimit: 180,
      sections: [
        { name: '一、选择题', type: 'single', count: 10, scoreEach: 5, instruction: '下列每题给出的四个选项中，只有一个选项是符合题目要求的。' },
        { name: '二、填空题', type: 'fill', count: 6, scoreEach: 5, instruction: '请将答案填写在答题纸指定位置。' },
        { name: '三、解答题', type: 'solution', count: 6, scoreEach: 'varies', instruction: '解答应写出文字说明、证明过程或演算步骤。' }
      ]
    },
    '408': {
      name: '计算机学科专业基础', fullScore: 150, timeLimit: 180,
      sections: [
        { name: '一、单项选择题', type: 'single', count: 40, scoreEach: 2, instruction: '下列每题给出的四个选项中，只有一个选项是最符合题目要求的。' },
        { name: '二、综合应用题', type: 'solution', count: 7, scoreEach: 'varies', instruction: '解答应写出必要的分析和计算过程。' }
      ]
    }
  },

  // ---- 读取题库 ----
  getQuestions(subject) {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_PREFIX + subject) || '[]');
    } catch(e) { return []; }
  },

  // ---- 读取完整试卷 ----
  getPapers(subject) {
    try {
      return JSON.parse(localStorage.getItem(this.PAPERS_PREFIX + subject) || '[]');
    } catch(e) { return []; }
  },

  // ---- 按类型/章节筛选 ----
  filterQuestions(subject, filters = {}) {
    let qs = this.getQuestions(subject);
    if (filters.type) qs = qs.filter(q => q.type === filters.type);
    if (filters.chapter) qs = qs.filter(q => q.chapter && q.chapter.includes(filters.chapter));
    if (filters.difficulty) qs = qs.filter(q => q.difficulty === filters.difficulty);
    if (filters.source) qs = qs.filter(q => q.source && q.source.includes(filters.source));
    return qs;
  },

  // ---- 随机抽题 ----
  getRandomQuestions(subject, count, type) {
    let pool = type ? this.filterQuestions(subject, { type }) : this.getQuestions(subject);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },

  // ---- 生成一套完整模拟卷 ----
  generatePaper(subject) {
    const struct = this.EXAM_STRUCTURE[subject];
    if (!struct) return null;
    const allQs = this.getQuestions(subject);
    if (allQs.length < 10) return null;

    const paper = {
      id: `paper-${subject}-${Date.now()}`,
      subject, title: `${struct.name} · AI密卷 #${Math.floor(Math.random()*999)+1}`,
      fullScore: struct.fullScore, timeLimit: struct.timeLimit,
      generated: Date.now(), sections: []
    };

    struct.sections.forEach(sec => {
      const pool = allQs.filter(q => {
        if (sec.type === 'single') return q.type === 'single';
        if (sec.type === 'multi') return q.type === 'multi';
        if (sec.type === 'material' || sec.type === 'essay') return q.type === 'material' || q.type === 'fill';
        if (sec.type === 'fill') return q.type === 'fill' || q.type === 'judge';
        if (sec.type === 'solution') return q.type === 'solution' || q.type === 'material';
        return true;
      });
      const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, sec.count);
      paper.sections.push({ ...sec, questions: picked });
    });

    return paper;
  },

  // ---- 统计 ----
  getStats() {
    const stats = {};
    ['101','201','301','408'].forEach(sub => {
      const qs = this.getQuestions(sub);
      const papers = this.getPapers(sub);
      stats[sub] = {
        questions: qs.length,
        papers: papers.length,
        byType: {},
        bySource: {},
        byChapter: {}
      };
      qs.forEach(q => {
        stats[sub].byType[q.type] = (stats[sub].byType[q.type]||0) + 1;
        const src = q.source || '静态';
        stats[sub].bySource[src] = (stats[sub].bySource[src]||0) + 1;
        if (q.chapter) stats[sub].byChapter[q.chapter] = (stats[sub].byChapter[q.chapter]||0) + 1;
      });
    });
    return stats;
  },

  // ---- 写入（由搜集站调用）----
  saveQuestions(subject, questions) {
    const existing = this.getQuestions(subject);
    const merged = [...existing, ...questions];
    const seen = new Set();
    const deduped = merged.filter(q => {
      const sig = (q.stem || '').slice(0, 60);
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
    localStorage.setItem(this.KEY_PREFIX + subject, JSON.stringify(deduped));
    this._updateMeta();
    return deduped.length;
  },

  savePaper(subject, paper) {
    const papers = this.getPapers(subject);
    papers.push(paper);
    localStorage.setItem(this.PAPERS_PREFIX + subject, JSON.stringify(papers));
    this._updateMeta();
  },

  _updateMeta() {
    const meta = { lastUpdate: Date.now(), stats: this.getStats() };
    localStorage.setItem(this.META_KEY, JSON.stringify(meta));
  }
};

// ---- 自动注入到游戏 ----
// 如果当前页面有 QUESTION_BANK 变量（消消乐），自动合并共享题库
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof QUESTION_BANK !== 'undefined') {
      ['101','201','301','408'].forEach(sub => {
        const shared = PKU_QBANK.getQuestions(sub);
        if (shared.length > 0 && QUESTION_BANK[sub]) {
          const existing = new Set(QUESTION_BANK[sub].map(q => q.id));
          const newQs = shared.filter(q => !existing.has(q.id));
          QUESTION_BANK[sub].push(...newQs);
          if (newQs.length > 0) console.log(`[共享题库] ${sub}: 注入 ${newQs.length} 道题`);
        }
      });
    }
    console.log('[共享题库] 📡 已连接天机阁题库搜集站');
  });
}
