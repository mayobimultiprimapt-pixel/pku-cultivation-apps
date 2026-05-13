/**
 * 北大考研 · 修仙应用集
 * PKU Core SDK v8.2
 * ─────────────────────────────────────────────────────
 * 超级用户 → 自动解密5把正版钥匙 → 5通道智能路由
 * 注册用户 → 可购买二手钥匙(BaosiAPI) / 跳过走纯本地
 * 游客     → 纯本地知识库
 * ─────────────────────────────────────────────────────
 * 5通道模型路由策略：
 *   ① OpenRouter  → Claude Sonnet 4.6        (推理/对话)
 *   ② Gemini直连  → gemini-3.1-pro-preview  (创意出题, $300额度)
 *   ③ Gemini直连  → gemini-2.5-flash         (快速兜底)
 *   ④ BaosiAPI   → gemini-3.1-pro-high      (创意备份)
 *   ⑤ Perplexity → sonar-deep-research      (情报搜索)
 */
(function() {
  'use strict';
  const RELAY_BASE = 'https://pku-api-relay.onrender.com';
  const VER = '8.2';

  // ─── audit_pku.md SEC-1/2 收尾 · 已拆 ───
  // 历史上这里有 5 把 API key 用 XOR 加密内嵌前端，XOR 密钥就是 super-user 密码本身，
  // 30 秒可解，已实质泄漏。已 revoke 老 key + 全部走 Render 后端 env vars 中转。
  // 前端不再持有原始 key，由 relay 后端用 server-side KEYS 自行决定调用上游。

  // ─── 最优模型路由表 ───
  const BAOSI_URL = 'https://api.baosiapi.com/v1/chat/completions';
  const GEMINI_DIRECT_URL = 'https://generativelanguage.googleapis.com/v1beta';

  const MODEL_MAP = {
    // 正版通道 (超级用户) — 5通道
    premium: {
      reasoning:    'anthropic/claude-sonnet-4.6',     // ① 推理/对话/代码 → OpenRouter
      creative:     'gemini-3.1-pro-preview',          // ② 创意出题/生成 → Gemini直连 ($300额度)
      creativeBase: 'gemini-2.5-pro',                  // 创意基础版 → Gemini直连
      search:       'sonar-deep-research',             // ⑤ 情报搜索 → Perplexity
      searchFast:   'sonar-pro',                       // 快速搜索
      fast:         'gemini-2.5-flash',                // ③ 快速兜底 → Gemini直连
      baosiFallback:'gemini-3.1-pro-high'              // ④ BaosiAPI备份通道
    },
    // Gemini直连通道的模型列表 (走 Google AI Studio API)
    geminiDirectModels: ['gemini-3.1-pro-preview', 'gemini-3-pro-preview', 'gemini-3-flash-preview',
                         'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite',
                         'gemini-3.1-flash-lite-preview', 'gemini-pro-latest', 'gemini-flash-latest'],
    // BaosiAPI通道的模型列表 (备份)
    baosiModels: ['gemini-3.1-pro-high', 'gemini-3.1-pro', 'gemini-3-flash', 'gemini-3.1-flash-lite'],
    // 二手通道 (购买用户) — 走BaosiAPI
    secondhand: {
      reasoning:  'deepseek-chat',
      creative:   'deepseek-chat',
      fast:       'deepseek-chat'
    }
  };

  // ─── 1. 认证与密钥管理 (Auth) ───
  const SUPER_USER = 'zmqags1314';

  const PKU_AUTH = {
    /** 是否已登录（任何身份） */
    isLoggedIn: function() { return !!localStorage.getItem('pku_user'); },
    /** 是否超级用户（拥有正版钥匙） */
    isSuperUser: function() { return localStorage.getItem('pku_user') === SUPER_USER; },
    /** 是否有任何可用钥匙 */
    hasKeys: function() { return !!window.PKU_KEYS; },

    /**
     * 超级用户登录 — 走纯 relay 中转，前端不再持有原始 API key
     * audit_pku.md SEC-1/2 修复：删 EK 解密 + 删 pku_pwd 明文落盘
     */
    login: function(user, pass) {
      if (user !== SUPER_USER || pass !== SUPER_USER) return false;
      localStorage.setItem('pku_user', SUPER_USER);
      // 不再 setItem('pku_pwd')，密码只用作前端门闸校验
      // 所有 LLM 调用走 relay 后端，由 Render env vars 持有真正的 key
      window.PKU_KEYS = {
        tier: 'premium',
        // URL 全部走 relay 中转
        OPENROUTER_URL:    RELAY_BASE + '/v1/chat/completions',
        PERPLEXITY_URL:    RELAY_BASE + '/perplexity/search',
        GEMINI_URL:        RELAY_BASE + '/gemini/generate',
        BAOSI_URL:         RELAY_BASE + '/baosi/chat',
        ANTHROPIC_URL:     RELAY_BASE + '/anthropic/messages',
        GEMINI_DIRECT_URL: GEMINI_DIRECT_URL,
        // 兼容字段：旧代码可能读 *_API_KEY，全空让 fetch 走 relay 的 KEYS env fallback
        OPENROUTER_API_KEY: '',
        GEMINI_API_KEY:     '',
        GEMINI_DIRECT_KEY:  '',
        PERPLEXITY_API_KEY: '',
        BAOSI_API_KEY:      ''
      };
      return true;
    },

    /**
     * 普通用户注册
     */
    register: function(user, pass) {
      if (!user || !pass || user.length < 3 || pass.length < 4) return { ok: false, msg: '用户名≥3位, 密码≥4位' };
      if (user === SUPER_USER) return { ok: false, msg: '此用户名已被占用' };
      var users = JSON.parse(localStorage.getItem('pku_users') || '{}');
      if (users[user]) return { ok: false, msg: '用户名已存在' };
      users[user] = { pass: _hash(pass), created: Date.now() };
      localStorage.setItem('pku_users', JSON.stringify(users));
      return { ok: true };
    },

    /**
     * 普通用户登录 — 不给正版钥匙，需自行购买二手钥匙
     */
    loginNormal: function(user, pass) {
      var users = JSON.parse(localStorage.getItem('pku_users') || '{}');
      if (!users[user] || users[user].pass !== _hash(pass)) return false;
      localStorage.setItem('pku_user', user);
      // 检查是否有已购买的二手钥匙
      var sk = localStorage.getItem('pku_secondhand_' + user);
      if (sk) {
        window.PKU_KEYS = { tier: 'secondhand', SECONDHAND_KEY: sk };
      } else {
        window.PKU_KEYS = null; // 纯本地
      }
      return true;
    },

    /**
     * 普通用户输入购买的二手钥匙
     */
    setSecondhandKey: function(key) {
      var user = localStorage.getItem('pku_user');
      if (!user || user === SUPER_USER) return false;
      localStorage.setItem('pku_secondhand_' + user, key);
      window.PKU_KEYS = { tier: 'secondhand', SECONDHAND_KEY: key };
      return true;
    },

    /** 登出 */
    logout: function() {
      localStorage.removeItem('pku_user');
      localStorage.removeItem('pku_pwd');
      window.PKU_KEYS = null;
    },

    /** 自动登录（页面加载时调用） · SEC-1/2 修复：不再读 pku_pwd */
    _autoLogin: function() {
      var user = localStorage.getItem('pku_user');
      if (!user) return;
      if (user === SUPER_USER) {
        // 走纯中转，直接重建 window.PKU_KEYS（不需要密码）
        this.login(SUPER_USER, SUPER_USER);
      } else {
        // 普通用户恢复二手钥匙
        var sk = localStorage.getItem('pku_secondhand_' + user);
        if (sk) {
          window.PKU_KEYS = { tier: 'secondhand', SECONDHAND_KEY: sk };
        }
      }
      // 历史遗留：旧版本可能存了明文 pku_pwd，本次清除一次
      if (localStorage.getItem('pku_pwd')) localStorage.removeItem('pku_pwd');
    },

    /** 是否需要弹出认证网关 */
    needsAuthGate: function() {
      return !this.isLoggedIn();
    },

    /** 重定向到认证网关 */
    redirectToGate: function() {
      var current = window.location.pathname;
      if (!current.includes('auth-gate')) {
        window.location.href = (current.includes('/pku-cultivation-apps') ? '' : '../') + 'auth-gate/index.html?redirect=' + encodeURIComponent(window.location.href);
      }
    }
  };

  function _hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return 'h' + Math.abs(h).toString(36);
  }

  PKU_AUTH._autoLogin();

  // ─── 2. AI 通信层 — 智能模型路由 ───

  /**
   * 获取最优模型 —— 根据用途自动匹配
   * @param {string} purpose - 'reasoning'|'creative'|'search'|'searchFast'|'fast'
   */
  function _getModel(purpose, opts) {
    if (opts && opts.model) return opts.model; // 手动指定优先
    var tier = (window.PKU_KEYS && window.PKU_KEYS.tier) || 'none';
    if (tier === 'premium') return MODEL_MAP.premium[purpose] || MODEL_MAP.premium.reasoning;
    if (tier === 'secondhand') return MODEL_MAP.secondhand[purpose] || MODEL_MAP.secondhand.reasoning;
    return null; // 无钥匙
  }

  /**
   * 智能端点路由 — 5通道自动选择
   * Gemini直连模型 → Google AI Studio API (优先, $300额度)
   * BaosiAPI模型  → BaosiAPI代理 (备份)
   * Claude等      → OpenRouter
   */
  function _getEndpoint(model) {
    if (!window.PKU_KEYS) return null;
    if (window.PKU_KEYS.tier === 'premium') {
      // ① Gemini直连通道 (优先 — $300额度, 直连Fetch格式不同)
      if (model && MODEL_MAP.geminiDirectModels.some(function(m) { return model === m; })) {
        return {
          url: window.PKU_KEYS.GEMINI_DIRECT_URL + '/models/' + model + ':generateContent?key=' + window.PKU_KEYS.GEMINI_DIRECT_KEY,
          key: null,  // key在URL里
          via: 'Gemini直连',
          isGeminiDirect: true
        };
      }
      // ② BaosiAPI通道 (备份)
      if (model && MODEL_MAP.baosiModels.some(function(m) { return model.indexOf(m) !== -1; })) {
        return { url: window.PKU_KEYS.BAOSI_URL, key: window.PKU_KEYS.BAOSI_API_KEY, via: 'BaosiAPI' };
      }
      // ③ OpenRouter通道 (Claude等)
      return { url: window.PKU_KEYS.OPENROUTER_URL, key: window.PKU_KEYS.OPENROUTER_API_KEY, via: 'OpenRouter' };
    }
    if (window.PKU_KEYS.tier === 'secondhand') {
      return { url: BAOSI_URL, key: window.PKU_KEYS.SECONDHAND_KEY, via: 'BaosiAPI(二手)' };
    }
    return null;
  }

  /**
   * 统一Fetch — 自动处理 Gemini直连 vs OpenAI格式的差异
   */
  async function _unifiedFetch(ep, messages, opts) {
    if (ep.isGeminiDirect) {
      // Gemini直连API格式: contents + parts
      var contents = messages.map(function(m) {
        return { role: m.role === 'assistant' ? 'model' : (m.role === 'system' ? 'user' : m.role), parts: [{ text: m.content }] };
      });
      var res = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          generationConfig: { temperature: opts.temperature || 0.4, maxOutputTokens: opts.maxTokens || 4096 }
        })
      });
      var d = await res.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return ((d.candidates || [{}])[0]?.content?.parts?.[0]?.text || '').trim();
    } else {
      // OpenAI兼容格式 (OpenRouter / BaosiAPI)
      var model = opts._model;
      var body = { model: model, messages: messages, temperature: opts.temperature || 0.4, max_tokens: opts.maxTokens || 4096 };
      var headers = { 'Content-Type': 'application/json' };
      if (ep.key) headers['Authorization'] = 'Bearer ' + ep.key;
      var res2 = await fetch(ep.url, { method: 'POST', headers: headers, body: JSON.stringify(body) });
      var d2 = await res2.json();
      if (d2.error) throw new Error(d2.error.message || JSON.stringify(d2.error));
      return ((d2.choices || [{}])[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }
  }

  /**
   * chat(sys, usr, opts) — 系统+用户消息
   * opts.purpose: 'reasoning'|'creative'|'fast' — 自动选模型
   */
  const PKU_AI = async function(sys, usr, opts) {
    opts = opts || {};
    var model = _getModel(opts.purpose || 'reasoning', opts);
    var ep = _getEndpoint(model);
    if (!ep) throw new Error('未授权 — 请登录并激活钥匙');

    console.log('[PKUSDK] 🎯 ' + (opts.purpose||'reasoning') + ' → ' + model + ' via ' + ep.via);
    var messages = [{ role: 'system', content: sys }, { role: 'user', content: usr }];
    return _unifiedFetch(ep, messages, { temperature: opts.temperature, maxTokens: opts.maxTokens, _model: model });
  };

  /** chatRaw(messages, opts) — 原始多轮对话 */
  const PKU_AI_RAW = async function(messages, opts) {
    opts = opts || {};
    var model = _getModel(opts.purpose || 'reasoning', opts);
    var ep = _getEndpoint(model);
    if (!ep) throw new Error('未授权 — 请登录并激活钥匙');

    console.log('[PKUSDK] 🎯 RAW ' + (opts.purpose||'reasoning') + ' → ' + model + ' via ' + ep.via);
    return _unifiedFetch(ep, messages, { temperature: opts.temperature || 0.9, maxTokens: opts.maxTokens || 1000, _model: model });
  };

  /** simple(prompt, opts) — 最简单轮调用 */
  const PKU_AI_SIMPLE = async function(prompt, opts) {
    return PKU_AI_RAW([{ role: 'user', content: prompt }], opts);
  };

  /** search(sys, usr) — Perplexity搜索（仅超级用户） */
  const PKU_SEARCH = async function(sys, usr) {
    if (!window.PKU_KEYS || window.PKU_KEYS.tier !== 'premium') throw new Error('未授权 — 搜索需要正版钥匙');
    var model = _getModel('search');
    var res = await fetch(window.PKU_KEYS.PERPLEXITY_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + window.PKU_KEYS.PERPLEXITY_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: model, messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }], temperature: 0.2 })
    });
    var d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return ((d.choices || [{}])[0]?.message?.content || '').trim();
  };

  // ─── 3. 中转阁题库接驳 (Relay Questions) ───
  const RelayQuestions = {
    relay: RELAY_BASE,
    fetch: async function(subject, opts) {
      opts = opts || {};
      var count = opts.count || 20, type = opts.type || null, fallback = opts.fallback || [];
      try {
        var params = new URLSearchParams({ count: count });
        if (type) params.set('type', type);
        // audit_pku.md COMPAT-1 修复：AbortSignal.timeout 在 iOS Safari 15.4-/Android Chrome 100- 不支持，feature detect
        var _ts = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? { signal: AbortSignal.timeout(8000) } : {};
        var resp = await fetch(RELAY_BASE + '/feed/paper/' + subject + '?' + params, _ts);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        var data = await resp.json();
        if (data.success && data.questions && data.questions.length > 0) {
          return { questions: data.questions, source: data.source, fromRelay: true };
        }
        throw new Error(data.error || 'Empty');
      } catch (e) {
        console.warn('[PKUSDK] ⚠️ ' + subject + ' 拉题失败，回退本地题库', e.message);
        return { questions: fallback, source: 'local-fallback', fromRelay: false };
      }
    },
    adapt: function(q) {
      if (q.q !== undefined) return q;
      var optL = (q.options || []).map(function(o) { return o.replace(/^[A-D][\.、]\s*/, ''); });
      var aIdx = 0;
      if (typeof q.answer === 'string') {
        var l = q.answer.trim().toUpperCase()[0];
        aIdx = Math.max(0, ['A', 'B', 'C', 'D'].indexOf(l));
      } else if (typeof q.answer === 'number') { aIdx = q.answer; }
      return { q: q.stem || q.question || q.q || '', o: optL, a: aIdx, type: q.type || 'single', analysis: q.analysis, chapter: q.chapter, difficulty: q.difficulty || 2, rawId: q.id };
    },
    loadSmart: async function(subject, localBank, opts) {
      opts = opts || {};
      try {
        var vault = localStorage.getItem('Global_Vault_' + subject);
        if (vault) {
          var parsed = JSON.parse(vault);
          if (parsed && parsed.length > 0) {
            console.log('[PKUSDK] ✅ ' + subject + ' 读取[天机阁金库] ' + parsed.length + ' 题');
            return { questions: parsed, source: 'offline-vault', fromRelay: true };
          }
        }
      } catch (e) { }
      var relayResult = await this.fetch(subject, Object.assign({}, opts, { fallback: localBank || [] }));
      if (relayResult.fromRelay && relayResult.questions.length > 0) {
        return { questions: relayResult.questions, source: relayResult.source, fromRelay: true };
      }
      return { questions: localBank || [], source: 'local', fromRelay: false };
    },
    init: function(subject, localBank, onReady) {
      var self = this;
      this.loadSmart(subject, localBank || []).then(function(result) {
        var adapted = result.questions.map(self.adapt);
        for (var i = adapted.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = adapted[i]; adapted[i] = adapted[j]; adapted[j] = t;
        }
        if (onReady) onReady(adapted, result.source);
      }).catch(function(e) {
        if (onReady) onReady((localBank || []).map(self.adapt), 'local-error-fallback');
      });
    }
  };

  // ─── 4. SM-2 记忆引擎 ───
  const MemoryEngine = {
    calculate: function(item, quality) {
      var q = Math.max(0, Math.min(5, quality));
      var rep = item.repetitions || 0, ef = item.easeFactor || 2.5, ivl = item.interval || 0;
      if (q < 3) { rep = 0; ivl = 1; }
      else {
        if (rep === 0) ivl = 1;
        else if (rep === 1) ivl = 6;
        else ivl = Math.round(ivl * ef);
        rep++;
      }
      ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      if (ef < 1.3) ef = 1.3;
      var nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + ivl);
      return { repetitions: rep, easeFactor: ef, interval: ivl, nextReview: nextDate.toISOString(), lastQuality: q, lastReview: new Date().toISOString() };
    }
  };

  // ─── 公开暴露 ───
  window.PKUSDK = {
    version: VER,
    Auth: PKU_AUTH,
    AI: {
      chat: PKU_AI,
      chatRaw: PKU_AI_RAW,
      simple: PKU_AI_SIMPLE,
      search: PKU_SEARCH
    },
    Questions: RelayQuestions,
    Memory: MemoryEngine,
    Models: MODEL_MAP,
    base: RELAY_BASE
  };

  // 兼容旧版
  window.PKU_AUTH = PKU_AUTH;
  window.PKU_AI = PKU_AI;
  window.PKU_SEARCH = PKU_SEARCH;
  window.RelayQuestions = RelayQuestions;

  var tierLabel = window.PKU_KEYS ? (window.PKU_KEYS.tier === 'premium' ? '🔱 正版通道' : '🔑 二手钥匙') : '📦 本地模式';
  var userLabel = PKU_AUTH.isLoggedIn() ? PKU_AUTH.isSuperUser() ? '👑 超级用户' : '👤 ' + localStorage.getItem('pku_user') : '👻 游客';
  console.log('[PKUSDK] v' + VER + ' · ' + userLabel + ' · ' + tierLabel);

})();
