/**
 * 北大考研 · 修仙应用集
 * PKU Core SDK v6.0
 * 融合授权解密、中转阁拉题、AI调用与持久化缓存通信
 * 适用于独立 App / PWA 打包
 */
(function() {
  const RELAY_BASE = 'https://pku-api-relay.onrender.com';

  var EK = {
    OR: 'CQZcDgVcAQAeUgNXV1FIXUZWExASAlcIBwUGCElaRwARQEBTBQhXAgRSTAlJB0AUQQVRUFVWBgBKVElVFEJOUFICUQwKBElUEA==',
    GE: 'OyQLACQINXViYUNZW0gUVQsEEwcyBlt7bXcLBkpdOFAZHhtER2QA',
    PP: 'Ch0dGVoFIlIBfVNmBGQ5AhMQHhtEdAUDDEV+WQgPGAgNFhMIelllWnl+MwElN0Y9RkdDS3Y='
  };

  function dec(e, k) {
    var b = atob(e), r = '';
    for(var i=0; i<b.length; i++) r += String.fromCharCode(b.charCodeAt(i)^k.charCodeAt(i%k.length));
    return r;
  }

  // ---- 1. 鉴权与密钥管理 (Auth & Keys) ----
  const PKU_AUTH = {
    isLoggedIn: function() { return !!window.PKU_KEYS; },
    login: function(user, pass) {
      if(user !== pass) return false;
      try {
        var or = dec(EK.OR, pass);
        if(!or.startsWith('sk-or-')) return false;
        localStorage.setItem('pku_pwd', pass);
        
        // 关键：强制走中转阁解决 CORS 和封锁问题
        window.PKU_KEYS = {
          OPENROUTER_API_KEY: or,
          OPENROUTER_URL: `${RELAY_BASE}/v1/chat/completions`,
          OPENROUTER_MODEL: 'anthropic/claude-3.7-sonnet',
          GEMINI_API_KEY: dec(EK.GE, pass),
          PERPLEXITY_API_KEY: dec(EK.PP, pass),
          PERPLEXITY_URL: `${RELAY_BASE}/perplexity/search`
        };
        return true;
      } catch(e) { return false; }
    },
    logout: function() { localStorage.removeItem('pku_pwd'); window.PKU_KEYS = null; },
    _autoLogin: function() {
      var pwd = localStorage.getItem('pku_pwd');
      if(pwd) this.login(pwd, pwd);
    }
  };
  PKU_AUTH._autoLogin();

  // ---- 2. AI 模型通信层 (AI Communicator) ----
  const PKU_AI = async function(sys, usr, opts = {}) {
    if(!window.PKU_KEYS) throw new Error('未登录或未授权');
    const url = window.PKU_KEYS.OPENROUTER_URL;
    const body = {
      model: opts.model || window.PKU_KEYS.OPENROUTER_MODEL,
      messages: [{role:'system',content:sys},{role:'user',content:usr}],
      temperature: opts.temperature || 0.4,
      max_tokens: opts.maxTokens || 4096
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + window.PKU_KEYS.OPENROUTER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
    return ((d.choices||[{}])[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g,'').trim();
  };

  const PKU_SEARCH = async function(sys, usr) {
    if(!window.PKU_KEYS) throw new Error('未授权');
    const res = await fetch(window.PKU_KEYS.PERPLEXITY_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + window.PKU_KEYS.PERPLEXITY_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'sonar-pro', messages:[{role:'system',content:sys},{role:'user',content:usr}], temperature: 0.2 })
    });
    const d = await res.json();
    if(d.error) throw new Error(d.error.message);
    return ((d.choices||[{}])[0]?.message?.content || '').trim();
  };

  // ---- 3. 中转阁题库接驳 (Relay Question Fetcher) ----
  const RelayQuestions = {
    relay: RELAY_BASE,
    fetch: async function(subject, opts = {}) {
      const { count = 20, type = null, fallback = [], paperNum = '' } = opts;
      try {
        const params = new URLSearchParams({ count });
        if(type) params.set('type', type);
        if(paperNum) params.set('paperNum', paperNum);
        
        const resp = await fetch(`${RELAY_BASE}/feed/paper/${subject}?${params}`, { signal: AbortSignal.timeout(8000) });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        
        if (data.success && data.questions?.length > 0) {
          return { questions: data.questions, source: data.source, fromRelay: true };
        }
        throw new Error(data.error || 'Empty');
      } catch (e) {
        console.warn(`[PKUSDK] ⚠️ ${subject} 拉题失败，回退本地题库`, e.message);
        return { questions: fallback.length?fallback:[], source: 'local-fallback', fromRelay: false };
      }
    },
    adapt: function(q) {
      if (q.q !== undefined) return q;
      const optL = (q.options || []).map(o => o.replace(/^[A-D][\.、]\s*/, ''));
      let aIdx = 0;
      if (typeof q.answer === 'string') {
        const l = q.answer.trim().toUpperCase()[0];
        aIdx = Math.max(0, ['A','B','C','D'].indexOf(l));
      } else if (typeof q.answer === 'number') { aIdx = q.answer; }
      return { q: q.stem || q.question || q.q || '', o: optL, a: aIdx, type: q.type || 'single', analysis: q.analysis, chapter: q.chapter, difficulty: q.difficulty || 2, rawId: q.id };
    },
    loadSmart: async function(subject, localBank = [], opts = {}) {
      try {
        const vault = localStorage.getItem('Global_Vault_' + subject);
        if (vault) {
          const parsed = JSON.parse(vault);
          if (parsed && parsed.length > 0) {
            console.log(`[PKUSDK] ✅ ${subject} 直接读取[天机阁金库] ${parsed.length} 题 (Offline Vault)`);
            return { questions: parsed, source: 'offline-vault', fromRelay: true };
          }
        }
      } catch(e) { console.warn("[Vault解析失败]", e); }

      const relayResult = await this.fetch(subject, { ...opts, fallback: localBank });
      if (relayResult.fromRelay && relayResult.questions.length > 0) {
        const relayIds = new Set(relayResult.questions.map(q => q.id || q.stem || q.q));
        const uniqueLocal = localBank.filter(q => !relayIds.has(q.id || q.stem || q.q));
        const merged = [...relayResult.questions, ...uniqueLocal];
        return { questions: merged, source: relayResult.source, fromRelay: true };
      }
      return { questions: localBank, source: 'local', fromRelay: false };
    },
    init: function(subject, localBank, onReady) {
      this.loadSmart(subject, localBank || []).then(result => {
        const adapted = result.questions.map(this.adapt);
        for (let i = adapted.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [adapted[i], adapted[j]] = [adapted[j], adapted[i]];
        }
        if (onReady) onReady(adapted, result.source);
      }).catch(e => {
        if (onReady) onReady((localBank || []).map(this.adapt), 'local-error-fallback');
      });
    }
  };

  // ---- 4. SM-2 记忆引擎核心算子 (Memory Engine) ----
  const MemoryEngine = {
    // 依据用户评分(0-5)计算下一次复习时间
    // 0:完全忘记, 3:勉强回想, 5:倒背如流
    calculate: function(item, quality) {
      const q = Math.max(0, Math.min(5, quality));
      let rep = item.repetitions || 0;
      let ef = item.easeFactor || 2.5;
      let ivl = item.interval || 0;

      if (q < 3) {
        rep = 0; ivl = 1; // 回退到第一天
      } else {
        if (rep === 0) ivl = 1;
        else if (rep === 1) ivl = 6;
        else ivl = Math.round(ivl * ef);
        rep++;
      }
      
      ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      if (ef < 1.3) ef = 1.3;

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + ivl);
      
      return {
        repetitions: rep,
        easeFactor: ef,
        interval: ivl,
        nextReview: nextDate.toISOString(),
        lastQuality: q,
        lastReview: new Date().toISOString()
      };
    }
  };

  // ---- 公开暴露 ----
  window.PKUSDK = {
    Auth: PKU_AUTH,
    AI: { chat: PKU_AI, search: PKU_SEARCH },
    Questions: RelayQuestions,
    Memory: MemoryEngine,
    base: RELAY_BASE
  };

  // 兼容旧版代码依赖（为了无缝升级，不可轻易删除）
  window.PKU_AUTH = PKU_AUTH;
  window.PKU_AI = PKU_AI;
  window.PKU_SEARCH = PKU_SEARCH;
  window.RelayQuestions = RelayQuestions;

})();
