/**
 * 📡 PKU 全局自动抓题引擎 v2.0 — 双通道版
 * ========================================
 * 主通道: Perplexity sonar-deep-research (用户输入卡密)
 * 副通道: BaosiAPI gemini-3.1-pro-high (自动降级，无需输入)
 * ========================================
 * 使用方法: <script src="../shared/pku-auto-fetch.js"></script>
 */
const PKUAutoFetch = (() => {
  const VAULT_KEYS = ['101','201','301','408'];
  const PPLX_URL = 'https://api.perplexity.ai/chat/completions';
  const MODEL_CHAIN = ['sonar-deep-research','sonar-reasoning-pro','sonar-pro','sonar'];
  const CACHE_TTL = 12 * 60 * 60 * 1000; // 12小时TTL

  // ═══ 副卡密 · BaosiAPI 中转配置（强制最高版·严禁套皮） ═══
  const BAOSI_URL = 'https://api.baosiapi.com/v1/chat/completions';
  const BAOSI_KEY = 'sk-Wq6ZDfqGBUOMHN3DMeyccH8nqDzsiGJpfFmdY5RJujPk9E97';
  const BAOSI_MODEL = 'gemini-3.1-pro-high'; // 写死最高版，绝不降级

  // ═══ API Key 管理 ═══
  function getKey() { return sessionStorage.getItem('pku_pplx_key') || ''; }
  function setKey(k) { sessionStorage.setItem('pku_pplx_key', k); }
  function hasKey() { return !!getKey(); }

  // ═══ 四科抓题 Prompt（考试大纲级） ═══
  const FETCH_PROMPTS = {
    '101': `你是2026年考研政治命题组核心专家。请基于最新搜索结果，生成40道高质量政治单选题。
要求：
- 必须包含最近60天的时政热点（二十大三中全会、新质生产力等最新表述）
- 涵盖马原(10题)、毛中特(10题)、思修(10题)、史纲(5题)、时政(5题)
- 每道题4个选项，干扰项要有迷惑性
- 难度梯度：简单10/中等20/困难10

格式(严格JSON数组，不要任何其他文字):
[{"stem":"题干","opts":["A.选项","B.选项","C.选项","D.选项"],"ans":0,"hint":"解析关键词","chapter":"马原/毛中特/思修/史纲/时政","difficulty":1}]
ans是正确选项索引(0-3), difficulty取1-3。`,

    '201': `你是2026年考研英语命题组核心专家。请基于最新搜索结果，生成35道高质量英语选择题。
要求：
- 必须从最近3个月的《经济学人》《卫报》《纽约时报》中提取真实语料
- 涵盖：阅读理解推断题(10)、词汇辨析(10)、完形填空(10)、语法长难句(5)
- 干扰选项要模拟真题中的偷换概念/词义泛化等设置手法

格式(严格JSON数组):
[{"stem":"题干","opts":["A.选项","B.选项","C.选项","D.选项"],"ans":0,"hint":"解析","chapter":"阅读/词汇/完形/语法","difficulty":1}]`,

    '301': `你是2026年考研数学命题组核心专家。请基于最新搜索结果，生成30道高质量数学选择题。
要求：
- 涵盖高数(15题)、线代(10题)、概率(5题)
- 重点出近2年未考查但大纲覆盖的知识点（大小年轮换）
- 包含反常规解法题型（洛必达失效、参数方程求导等）
- 难度梯度：基础8/中等12/压轴10

格式(严格JSON数组):
[{"stem":"题干","opts":["A.选项","B.选项","C.选项","D.选项"],"ans":0,"hint":"解析","chapter":"高数/线代/概率","difficulty":1}]`,

    '408': `你是2026年408计算机统考命题组核心专家。请基于最新搜索结果，生成45道高质量选择题。
要求：
- 分布：数据结构(12)、计算机组成(11)、操作系统(11)、计算机网络(11)
- 重点出大纲边缘但连续3年未考的知识点
- 融入前沿交叉考点（RISC-V架构、SDN、容器技术与OS的关联）
- 包含跨子科目综合题（如数据结构+OS页面调度）

格式(严格JSON数组):
[{"stem":"题干","opts":["A.选项","B.选项","C.选项","D.选项"],"ans":0,"hint":"解析","chapter":"数据结构/组成/OS/网络","difficulty":1}]`
  };

  const SUBJ_NAMES = {'101':'政治','201':'英语','301':'数学','408':'计算机'};

  // ═══ 核心抓取函数（双通道） ═══
  async function fetchSubject(subCode) {
    const key = getKey();
    const prompt = FETCH_PROMPTS[subCode];
    if (!prompt) return null;

    // ── 主通道: Perplexity（有卡密时优先） ──
    if (key && key.startsWith('pplx-')) {
      for (const model of MODEL_CHAIN) {
        console.log(`[📡主通道] ${SUBJ_NAMES[subCode]} → Perplexity ${model}`);
        try {
          const resp = await fetch(PPLX_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: '你是考研命题组核心专家。只输出严格JSON数组，不要任何其他文字、解释或markdown标记。' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.5,
              max_tokens: 16000,
              search_recency_filter: 'month',
              return_related_questions: false
            })
          });
          if (!resp.ok) {
            if (resp.status === 401 || resp.status === 429) { console.warn(`[📡] ${model} 配额/认证失败, 降级...`); continue; }
            throw new Error('HTTP ' + resp.status);
          }
          const data = await resp.json();
          if (data.error) { console.warn(`[📡] ${model} 错误:`, data.error.message); continue; }
          const raw = (data.choices || [{}])[0]?.message?.content || '';
          let questions = parseJSON(raw);
          if (questions && questions.length > 0) {
            console.log(`[📡] ✅ ${SUBJ_NAMES[subCode]} Perplexity ${model} 成功: ${questions.length}道`);
            return questions;
          }
        } catch(e) {
          if (e.message.includes('quota') || e.message.includes('401')) continue;
          console.warn(`[📡] ${model} 失败:`, e.message);
        }
      }
      console.warn('[📡] Perplexity主通道全部失败，降级到副通道...');
    }

    // ── 副通道: BaosiAPI（自动降级 / 无卡密时直接使用） ──
    return await _fetchViaBaosi(subCode, prompt);
  }

  // ═══ 副通道抓取（强制 gemini-3.1-pro-high，绝不降级） ═══
  async function _fetchViaBaosi(subCode, prompt) {
    console.log(`[📡副通道] ${SUBJ_NAMES[subCode]} → BaosiAPI ${BAOSI_MODEL} (写死最高版)`);
    try {
      const resp = await fetch(BAOSI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + BAOSI_KEY },
        body: JSON.stringify({
          model: BAOSI_MODEL,
          messages: [
            { role: 'system', content: '你是2026年考研命题组核心专家。只输出严格JSON数组，不要任何其他文字、解释或markdown标记。不要输出```json等标记。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 16000
        })
      });
      if (!resp.ok) throw new Error(`BaosiAPI HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      // 验证模型不被套皮
      const usedModel = data.model || data.choices?.[0]?.model || BAOSI_MODEL;
      console.log(`[📡副通道] 实际响应模型: ${usedModel}`);
      const raw = (data.choices || [{}])[0]?.message?.content || '';
      let questions = parseJSON(raw);
      if (questions && questions.length > 0) {
        console.log(`[📡] ✅ ${SUBJ_NAMES[subCode]} BaosiAPI ${BAOSI_MODEL} 成功: ${questions.length}道`);
        return questions;
      }
    } catch(e) {
      console.error(`[📡副通道] ${BAOSI_MODEL} 失败:`, e.message);
    }
    return null;
  }

  function parseJSON(raw) {
    // 尝试多种方式解析JSON
    try { return JSON.parse(raw); } catch(e) {}
    const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) try { return JSON.parse(m[1]); } catch(e) {}
    const s = raw.indexOf('['), e = raw.lastIndexOf(']');
    if (s >= 0 && e > s) try { return JSON.parse(raw.substring(s, e + 1)); } catch(ex) {}
    return null;
  }

  // ═══ 写入全局金库 ═══
  function writeToVault(subCode, questions) {
    if (!questions || !Array.isArray(questions) || questions.length === 0) return 0;
    
    // 标准化格式（兼容所有游戏模块的读取方式）
    const standardized = questions.map(q => ({
      stem: q.stem || q.q || '',
      q: q.stem || q.q || '',
      options: q.opts || q.options || ['A','B','C','D'],
      o: q.opts || q.options || ['A','B','C','D'],
      answer: 'ABCD'[q.ans || 0],
      a: q.ans || 0,
      analysis: q.hint || q.analysis || '',
      chapter: q.chapter || '',
      difficulty: q.difficulty || 2,
      type: 'single_choice',
      source: 'pku-auto-fetch',
      fetchTime: new Date().toISOString()
    }));

    // 合并：保留旧题 + 新题去重
    let existing = [];
    try {
      const raw = localStorage.getItem('Global_Vault_' + subCode);
      if (raw) existing = JSON.parse(raw);
      if (!Array.isArray(existing)) existing = [];
    } catch(e) { existing = []; }

    const existStems = new Set(existing.map(q => (q.stem || q.q || '').substring(0, 30)));
    const fresh = standardized.filter(q => !existStems.has((q.stem || '').substring(0, 30)) && q.stem.length > 5);
    
    const merged = [...fresh, ...existing];
    localStorage.setItem('Global_Vault_' + subCode, JSON.stringify(merged));
    localStorage.setItem('Vault_FetchTime_' + subCode, Date.now().toString());

    console.log(`[📡金库] ${SUBJ_NAMES[subCode]}: 新增${fresh.length}题, 总计${merged.length}题`);
    return fresh.length;
  }

  // ═══ 检查是否需要刷新 ═══
  function needsRefresh(subCode) {
    const lastFetch = parseInt(localStorage.getItem('Vault_FetchTime_' + subCode) || '0');
    return (Date.now() - lastFetch) > CACHE_TTL;
  }

  // ═══ 全科抓取 ═══
  async function fetchAll(onProgress) {
    const results = {};
    let total = 0;
    for (let i = 0; i < VAULT_KEYS.length; i++) {
      const sub = VAULT_KEYS[i];
      if (onProgress) onProgress(sub, 'fetching', i, VAULT_KEYS.length);
      
      if (!needsRefresh(sub)) {
        if (onProgress) onProgress(sub, 'cached', i, VAULT_KEYS.length);
        const existing = JSON.parse(localStorage.getItem('Global_Vault_' + sub) || '[]');
        results[sub] = { cached: true, count: existing.length };
        continue;
      }

      try {
        const questions = await fetchSubject(sub);
        if (questions) {
          const added = writeToVault(sub, questions);
          total += added;
          results[sub] = { added, total: JSON.parse(localStorage.getItem('Global_Vault_' + sub) || '[]').length };
        } else {
          results[sub] = { error: '抓取失败' };
        }
      } catch(e) {
        results[sub] = { error: e.message };
      }
      if (onProgress) onProgress(sub, 'done', i + 1, VAULT_KEYS.length);
    }
    return { results, totalAdded: total };
  }

  // ═══ 获取金库统计 ═══
  function getVaultStats() {
    const stats = {};
    for (const sub of VAULT_KEYS) {
      try {
        const raw = localStorage.getItem('Global_Vault_' + sub);
        const arr = raw ? JSON.parse(raw) : [];
        const lastFetch = parseInt(localStorage.getItem('Vault_FetchTime_' + sub) || '0');
        stats[sub] = {
          count: arr.length,
          lastFetch: lastFetch ? new Date(lastFetch).toLocaleString('zh-CN') : '未抓取',
          needsRefresh: needsRefresh(sub)
        };
      } catch(e) {
        stats[sub] = { count: 0, lastFetch: '错误', needsRefresh: true };
      }
    }
    return stats;
  }

  // ═══ 注入 UI 弹窗（任何页面调用即可） ═══
  function injectUI() {
    if (document.getElementById('pkuFetchModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'pkuFetchModal';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(6,6,12,.95);backdrop-filter:blur(20px);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;';

    overlay.innerHTML = `
      <div style="background:rgba(18,18,36,.95);border:1px solid rgba(255,215,0,.15);border-radius:20px;padding:32px 28px;max-width:460px;width:92%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.8)">
        <div style="font-size:36px;margin-bottom:8px">📡</div>
        <h2 style="font-size:24px;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 4px">全局情报抓取</h2>
        <div style="font-family:monospace;font-size:10px;letter-spacing:3px;color:#555;margin-bottom:16px">PERPLEXITY sonar-deep-research</div>
        <p style="font-size:12px;color:#888;line-height:1.8;margin-bottom:16px;text-align:left">
          输入 Perplexity API Key，系统将使用<strong style="color:#08f7fe">最高级深度研究模型</strong>自动搜索全网最新考研情报，生成四科压卷级选择题，一键注入所有游戏。<br>
          🔒 密钥仅存于本次会话，关闭浏览器自动清除。
        </p>
        <input type="password" id="pkuFetchKeyInput" placeholder="pplx-xxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false"
          style="width:100%;padding:14px 16px;background:rgba(6,6,14,.8);border:1px solid rgba(255,215,0,.1);border-radius:10px;color:#e8e8f0;font-family:monospace;font-size:13px;outline:none;letter-spacing:.5px;margin-bottom:8px">
        <div id="pkuFetchErr" style="color:#ff2e63;font-size:12px;min-height:18px;margin-bottom:8px"></div>
        <div id="pkuFetchProgress" style="display:none;margin-bottom:12px">
          <div style="background:rgba(255,255,255,.04);border-radius:4px;height:6px;overflow:hidden;margin-bottom:6px">
            <div id="pkuFetchBar" style="height:100%;background:linear-gradient(90deg,#39ff14,#08f7fe,#9d4edd);border-radius:4px;transition:width .4s;width:0%"></div>
          </div>
          <div id="pkuFetchStatus" style="font-size:11px;color:#08f7fe;font-family:monospace;letter-spacing:1px">准备中...</div>
        </div>
        <div id="pkuFetchStats" style="display:none;background:rgba(6,6,14,.6);border:1px solid rgba(255,215,0,.08);border-radius:10px;padding:12px;margin-bottom:12px;text-align:left;font-size:11px;color:#888;line-height:2">
        </div>
        <button id="pkuFetchBtn" onclick="PKUAutoFetch._startFetch()" style="width:100%;padding:14px;border:none;border-radius:12px;background:linear-gradient(135deg,#ffd700,#ff8c00);color:#000;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:2px;transition:.3s">
          ⚡ 注入卡密 · 启动全科抓取
        </button>
        <button onclick="PKUAutoFetch._useFallback()" style="margin-top:10px;background:linear-gradient(135deg,rgba(57,255,20,.1),rgba(8,247,254,.1));border:1px solid rgba(57,255,20,.15);color:#39ff14;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:12px;letter-spacing:1px">🔄 跳过卡密 · 副通道自动抓取</button>
        <button onclick="PKUAutoFetch._closeModal()" style="margin-top:6px;background:none;border:1px solid rgba(255,255,255,.06);color:#444;padding:6px 16px;border-radius:8px;cursor:pointer;font-size:11px">跳过（使用已有题库）</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // 如果已有 key，显示统计并允许直接关闭
    if (hasKey()) {
      _showStats();
      overlay.style.display = 'none'; // 有key就不弹了
    }
  }

  function _showStats() {
    const stats = getVaultStats();
    const statsEl = document.getElementById('pkuFetchStats');
    if (!statsEl) return;
    let html = '<strong style="color:#ffd700">📦 金库库存:</strong><br>';
    for (const [sub, info] of Object.entries(stats)) {
      const color = info.count > 0 ? '#39ff14' : '#ff2e63';
      html += `<span style="color:${color}">● ${SUBJ_NAMES[sub]}(${sub}): ${info.count}题</span> · <span style="color:#555">${info.lastFetch}</span><br>`;
    }
    statsEl.innerHTML = html;
    statsEl.style.display = 'block';
  }

  async function _startFetch() {
    const input = document.getElementById('pkuFetchKeyInput');
    const errEl = document.getElementById('pkuFetchErr');
    const btn = document.getElementById('pkuFetchBtn');
    const progress = document.getElementById('pkuFetchProgress');
    const bar = document.getElementById('pkuFetchBar');
    const status = document.getElementById('pkuFetchStatus');

    const key = input.value.trim();
    
    // 如果输入了Perplexity卡密，走主通道
    if (key && key.startsWith('pplx-')) {
      setKey(key);
    }
    // 没有输入卡密 → 自动走BaosiAPI副通道（gemini-3.1-pro-high）
    // 不报错，直接开始
    
    errEl.textContent = '';
    btn.disabled = true;
    const channelName = (key && key.startsWith('pplx-')) ? 'Perplexity 主通道' : `BaosiAPI ${BAOSI_MODEL}`;
    btn.textContent = `🔴 ${channelName} 抓取中...`;
    progress.style.display = 'block';

    try {
      const result = await fetchAll((sub, state, done, total) => {
        const pct = Math.round((done / total) * 100);
        bar.style.width = pct + '%';
        if (state === 'fetching') {
          const ch = hasKey() ? 'sonar-deep-research 深度搜索' : `${BAOSI_MODEL} 抓取`;
          status.textContent = `🔴 ${SUBJ_NAMES[sub]} · ${ch}中...`;
        } else if (state === 'cached') {
          status.textContent = `✅ ${SUBJ_NAMES[sub]} · 12h内已抓取，使用缓存`;
        } else {
          status.textContent = `✅ ${SUBJ_NAMES[sub]} · 完成 (${done}/${total})`;
        }
      });

      bar.style.width = '100%';
      _showStats();

      let summary = `🏆 抓取完毕！新增 ${result.totalAdded} 道题\n`;
      for (const [sub, info] of Object.entries(result.results)) {
        if (info.cached) summary += `${SUBJ_NAMES[sub]}: 缓存${info.count}题 `;
        else if (info.error) summary += `${SUBJ_NAMES[sub]}: ❌${info.error} `;
        else summary += `${SUBJ_NAMES[sub]}: +${info.added}题(总${info.total}) `;
      }
      status.textContent = summary;
      status.style.color = '#39ff14';
      btn.textContent = '✅ 完成！点击进入游戏';
      btn.disabled = false;
      btn.onclick = () => _closeModal();

    } catch(e) {
      errEl.textContent = '❌ ' + e.message;
      btn.disabled = false;
      btn.textContent = '⚡ 重试';
    }
  }

  function _closeModal() {
    const modal = document.getElementById('pkuFetchModal');
    if (modal) modal.style.display = 'none';
  }

  function showModal() {
    injectUI();
    const modal = document.getElementById('pkuFetchModal');
    if (modal) {
      modal.style.display = 'flex';
      _showStats();
      // 如果已有key，自动填入
      if (hasKey()) {
        const input = document.getElementById('pkuFetchKeyInput');
        if (input) input.value = getKey();
      }
    }
  }

  // ═══ 副通道一键抓取（无需输入卡密） ═══
  async function _useFallback() {
    const btn = document.getElementById('pkuFetchBtn');
    const progress = document.getElementById('pkuFetchProgress');
    const bar = document.getElementById('pkuFetchBar');
    const status = document.getElementById('pkuFetchStatus');
    const errEl = document.getElementById('pkuFetchErr');
    if (btn) { btn.disabled = true; btn.textContent = '🔴 副通道抓取中...'; }
    if (progress) progress.style.display = 'block';
    if (errEl) errEl.textContent = '';

    try {
      const result = await fetchAll((sub, state, done, total) => {
        const pct = Math.round((done / total) * 100);
        if (bar) bar.style.width = pct + '%';
        if (status) {
          if (state === 'fetching') status.textContent = `🔴 ${SUBJ_NAMES[sub]} · ${BAOSI_MODEL} 强制最高版抓取中...`;
          else if (state === 'cached') status.textContent = `✅ ${SUBJ_NAMES[sub]} · 缓存命中`;
          else status.textContent = `✅ ${SUBJ_NAMES[sub]} · 完成 (${done}/${total})`;
        }
      });
      if (bar) bar.style.width = '100%';
      _showStats();
      if (status) { status.textContent = `🏆 副通道抓取完毕！新增 ${result.totalAdded} 道题`; status.style.color = '#39ff14'; }
      if (btn) { btn.textContent = '✅ 完成！进入游戏'; btn.disabled = false; btn.onclick = () => _closeModal(); }
    } catch(e) {
      if (errEl) errEl.textContent = '❌ ' + e.message;
      if (btn) { btn.disabled = false; btn.textContent = '⚡ 重试'; }
    }
  }

  // ═══ 自动初始化：页面加载时注入UI ═══
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      injectUI();
      // 如果没有key且金库为空，自动弹出
      const stats = getVaultStats();
      const totalQ = Object.values(stats).reduce((s, v) => s + v.count, 0);
      if (!hasKey() && totalQ === 0) {
        showModal();
      }
    });
  }

  return {
    fetchAll, fetchSubject, writeToVault, getVaultStats,
    getKey, setKey, hasKey, showModal, needsRefresh,
    injectUI, _startFetch, _closeModal, _useFallback,
    SUBJ_NAMES, VAULT_KEYS
  };
})();
