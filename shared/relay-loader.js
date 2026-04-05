/**
 * PKU 统一题库加载器
 * 所有游戏共用此脚本，自动从中转站拉取最新试卷
 * 如果中转站无数据，fallback到本地题库
 *
 * 用法: <script src="../shared/relay-loader.js"></script>
 * 然后调用: await PKU_RELAY.loadPaper('101')
 */
(function() {
  const RELAY_URL = 'https://pku-api-relay.onrender.com';

  window.PKU_RELAY = {
    ready: false,
    papers: {},   // 按科目缓存
    questions: {}, // 散装题目缓存

    /**
     * 从中转站拉取今日试卷
     * @param {string} subject - 科目代码 (101/201/301/408)
     * @param {number} count - 需要的题目数量
     * @returns {Array} 题目数组
     */
    async loadPaper(subject, count) {
      count = count || 30;
      
      // 1. 优先读取天机阁造血中心刚产出的最热鲜库
      try {
        const vault = localStorage.getItem('Global_Vault_' + subject);
        if (vault) {
          const parsed = JSON.parse(vault);
          if (parsed && parsed.length > 0) {
            const questions = parsed.map(q => this._normalize(q, subject));
            this.papers[subject] = questions;
            console.log(`[RELAY] ✅ ${subject} 直接读取[天机阁金库] ${questions.length} 题 (Offline Vault)`);
            return questions;
          }
        }
      } catch(e) { console.warn("[Vault 解析失败]", e); }

      // 2. 否则从中央中转站拉取
      try {
        const r = await fetch(`${RELAY_URL}/feed/paper/${subject}?count=${count}&random=true`);
        if (!r.ok) throw new Error(`${r.status}`);
        const data = await r.json();
        if (data.success && data.questions?.length > 0) {
          // 转换为统一格式
          const questions = data.questions.map(q => this._normalize(q, subject));
          this.papers[subject] = questions;
          console.log(`[RELAY] ✅ ${subject} 拉取 ${questions.length} 题 (${data.source})`);
          return questions;
        }
      } catch(e) {
        console.log(`[RELAY] ⚠️ ${subject} 中转站拉取失败: ${e.message}, 回落安全库`);
      }
      
      // 3. Fallback到本地旧题库
      return this._getLocal(subject);
    },

    /**
     * 获取单道随机题目 (游戏内使用)
     * @param {string} subject
     * @param {string} type - single/multi/judge
     * @returns {Object} 单道题
     */
    getQuestion(subject, type) {
      const pool = this.papers[subject] || this._getLocal(subject);
      if (!pool.length) return null;
      let filtered = type ? pool.filter(q => q.type === type) : pool;
      if (!filtered.length) filtered = pool;
      return filtered[Math.floor(Math.random() * filtered.length)];
    },

    /**
     * 预加载所有科目
     */
    async preloadAll() {
      const subjects = ['101', '201', '301', '408'];
      await Promise.allSettled(subjects.map(s => this.loadPaper(s)));
      this.ready = true;
      console.log('[RELAY] 🎯 所有科目预加载完毕');
    },

    /**
     * 统一题目格式 (兼容各种来源)
     */
    _normalize(q, subject) {
      return {
        id: q.id || `q-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        stem: q.question || q.stem || q.q || '',
        question: q.question || q.stem || q.q || '',
        options: q.options || q.o || [],
        answer: q.answer || q.a || '',
        type: q.type || 'single',
        analysis: q.analysis || '',
        difficulty: q.difficulty || 3,
        subject: subject,
        source: q.source || 'relay'
      };
    },

    /**
     * 从本地题库获取 (fallback)
     */
    _getLocal(subject) {
      // 检查各种本地题库格式
      if (typeof QUESTION_BANK !== 'undefined' && QUESTION_BANK[subject]) {
        return QUESTION_BANK[subject].map(q => this._normalize(q, subject));
      }
      if (typeof QB !== 'undefined' && QB[subject]) {
        return QB[subject].map(q => this._normalize({
          question: q.q, options: q.o, answer: q.o[q.a], type: 'single'
        }, subject));
      }
      return [];
    }
  };

  // 自动预加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PKU_RELAY.preloadAll());
  } else {
    PKU_RELAY.preloadAll();
  }
})();
