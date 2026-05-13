/**
 * 天工坊 · 自镜阵
 * 全站浮窗 · 用户呈奏修缮文牒 → 自动建 GitHub issue → Claude Action 接管
 *
 * 不依赖任何框架，纯 vanilla JS。
 * 全局命名空间隔离（IIFE）。
 * 所有元素 id/class 前缀 tg- 避免与子应用冲突。
 */
(function () {
  'use strict';

  // 避免重复注入（同一页面可能有多个 script 标签）
  if (window.__TG_LOADED__) return;
  window.__TG_LOADED__ = true;

  const REPO = 'mayobimultiprimapt-pixel/pku-cultivation-apps';
  const PAT_KEY = 'tiangong_gh_pat';
  const HISTORY_KEY = 'tiangong_history';
  const POLL_INTERVAL = 30000;
  const MAX_HISTORY = 50;
  const PAT_GUIDE_URL =
    'https://github.com/settings/tokens/new?description=Tiangong-Workshop&scopes=public_repo';

  // ───────────── CSS 注入 ─────────────
  const css = `
    #tg-fab {
      position: fixed; right: 24px; bottom: 24px; z-index: 99999;
      width: 56px; height: 56px; border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #c9a352 0%, #8a6b2c 60%, #3a2810 100%);
      border: 1px solid rgba(255,215,128,0.6);
      box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 16px rgba(201,163,82,0.4);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #f5e6c0; font-family: serif; font-size: 24px; font-weight: 500;
      transition: transform .2s, box-shadow .2s;
      user-select: none;
    }
    #tg-fab:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.6), 0 0 24px rgba(201,163,82,0.6); }
    #tg-fab.active { background: radial-gradient(circle at 30% 30%, #ffd87a 0%, #c9a352 60%, #5a4020 100%); }

    #tg-mask {
      position: fixed; inset: 0; z-index: 99998;
      background: rgba(10,8,20,0.7); backdrop-filter: blur(4px);
      display: none; align-items: center; justify-content: center;
    }
    #tg-mask.show { display: flex; }

    #tg-panel {
      width: min(520px, 92vw); max-height: 88vh;
      background: linear-gradient(160deg, #1f1830 0%, #0f0c1c 100%);
      border: 1px solid rgba(201,163,82,0.45);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7), inset 0 0 80px rgba(201,163,82,0.08);
      color: #e8d8b0; font-family: "Noto Serif SC", serif;
      display: flex; flex-direction: column; overflow: hidden;
      position: relative;
    }
    #tg-panel::before, #tg-panel::after {
      content: ''; position: absolute; width: 24px; height: 24px;
      border: 1px solid rgba(201,163,82,0.6); pointer-events: none;
    }
    #tg-panel::before { top: 6px; left: 6px; border-right: none; border-bottom: none; }
    #tg-panel::after { bottom: 6px; right: 6px; border-left: none; border-top: none; }

    .tg-head {
      padding: 22px 24px 14px; border-bottom: 1px solid rgba(201,163,82,0.18);
      display: flex; align-items: flex-end; justify-content: space-between;
    }
    .tg-title {
      font-size: 22px; letter-spacing: 0.32em; color: #f5d77a;
      text-shadow: 0 0 8px rgba(245,215,122,0.3);
    }
    .tg-subtitle {
      font-size: 10px; letter-spacing: 0.4em; color: #8a7a5a; margin-top: 6px;
    }
    .tg-close {
      background: none; border: none; color: #8a7a5a; cursor: pointer;
      font-size: 20px; padding: 0 4px;
    }
    .tg-close:hover { color: #f5d77a; }

    .tg-body { padding: 18px 24px; overflow-y: auto; flex: 1; min-height: 0; }

    .tg-pat-warn {
      padding: 14px 16px; background: rgba(255,80,80,0.08);
      border: 1px solid rgba(255,120,120,0.3); border-radius: 8px;
      font-size: 12px; color: #ffb0a0; margin-bottom: 14px;
    }
    .tg-pat-warn a { color: #ffd877; text-decoration: underline; }

    .tg-input {
      width: 100%; min-height: 100px; resize: vertical;
      padding: 14px 16px; border-radius: 8px;
      background: rgba(10,8,20,0.6);
      border: 1px solid rgba(201,163,82,0.25);
      color: #e8d8b0; font-family: inherit; font-size: 14px; line-height: 1.7;
      outline: none; box-sizing: border-box;
    }
    .tg-input:focus { border-color: rgba(201,163,82,0.6); box-shadow: 0 0 0 2px rgba(201,163,82,0.15); }
    .tg-input::placeholder { color: #6a5b40; letter-spacing: 0.08em; }

    .tg-hint {
      font-size: 11px; color: #6a5b40; margin: 10px 2px 0;
      letter-spacing: 0.12em;
    }
    .tg-hint code {
      background: rgba(201,163,82,0.08); padding: 1px 6px; border-radius: 4px;
      color: #c9a352; font-family: ui-monospace, monospace; font-size: 11px;
    }

    .tg-submit {
      margin-top: 14px; width: 100%; padding: 12px;
      border-radius: 999px;
      background: linear-gradient(180deg, #c9a352 0%, #8a6b2c 100%);
      border: 1px solid rgba(255,215,128,0.4);
      color: #0f0c1c; font-family: inherit; font-size: 14px;
      font-weight: 600; letter-spacing: 0.4em;
      cursor: pointer; transition: all .2s;
    }
    .tg-submit:hover:not(:disabled) { background: linear-gradient(180deg, #ffd87a 0%, #c9a352 100%); }
    .tg-submit:disabled { opacity: 0.4; cursor: not-allowed; }

    .tg-pat-input {
      width: 100%; padding: 10px 14px; border-radius: 8px;
      background: rgba(10,8,20,0.6);
      border: 1px solid rgba(201,163,82,0.25);
      color: #e8d8b0; font-family: ui-monospace, monospace; font-size: 12px;
      outline: none; box-sizing: border-box;
    }
    .tg-pat-row { display: flex; gap: 8px; margin-top: 8px; }
    .tg-pat-row .tg-input { flex: 1; min-height: 0; padding: 10px 14px; font-family: ui-monospace, monospace; }
    .tg-pat-save {
      padding: 10px 18px; border-radius: 8px;
      background: rgba(201,163,82,0.18); border: 1px solid rgba(201,163,82,0.4);
      color: #f5d77a; cursor: pointer; letter-spacing: 0.2em; font-size: 12px;
    }
    .tg-pat-save:hover { background: rgba(201,163,82,0.3); }

    .tg-history {
      margin-top: 22px; padding-top: 14px;
      border-top: 1px solid rgba(201,163,82,0.18);
    }
    .tg-history-head {
      font-size: 11px; letter-spacing: 0.36em; color: #c9a352; margin-bottom: 10px;
    }
    .tg-history-empty {
      font-size: 12px; color: #6a5b40; text-align: center; padding: 16px 0;
    }
    .tg-item {
      padding: 10px 12px; margin-bottom: 8px;
      background: rgba(201,163,82,0.05);
      border: 1px solid rgba(201,163,82,0.12);
      border-radius: 6px;
      font-size: 12px; display: flex; align-items: flex-start; gap: 10px;
    }
    .tg-item-no {
      color: #c9a352; font-family: ui-monospace, monospace; font-size: 11px;
      white-space: nowrap; margin-top: 1px;
    }
    .tg-item-body { flex: 1; min-width: 0; }
    .tg-item-title {
      color: #e8d8b0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      letter-spacing: 0.06em;
    }
    .tg-item-meta {
      font-size: 10px; color: #6a5b40; margin-top: 4px; letter-spacing: 0.12em;
    }
    .tg-item-link {
      color: #c9a352; text-decoration: none; font-size: 11px;
    }
    .tg-item-link:hover { color: #f5d77a; text-decoration: underline; }
    .tg-status {
      display: inline-block; padding: 1px 8px; border-radius: 10px;
      font-size: 10px; letter-spacing: 0.18em;
    }
    .tg-status-pending { background: rgba(255,200,80,0.12); color: #ffc850; }
    .tg-status-pr { background: rgba(120,180,255,0.12); color: #88c0ff; }
    .tg-status-merged { background: rgba(120,255,180,0.12); color: #88ffc0; }
    .tg-status-failed { background: rgba(255,120,120,0.12); color: #ff9090; }
    .tg-status-closed { background: rgba(150,150,150,0.12); color: #aaa; }

    .tg-foot {
      padding: 10px 24px; border-top: 1px solid rgba(201,163,82,0.18);
      font-size: 10px; color: #4a3e28; letter-spacing: 0.32em; text-align: center;
    }
    .tg-toast {
      position: fixed; bottom: 90px; right: 24px; z-index: 100000;
      padding: 10px 16px; border-radius: 8px;
      background: rgba(10,8,20,0.92); border: 1px solid rgba(201,163,82,0.4);
      color: #f5d77a; font-size: 12px; letter-spacing: 0.18em;
      max-width: 320px; opacity: 0; transform: translateY(8px); transition: all .3s;
    }
    .tg-toast.show { opacity: 1; transform: translateY(0); }
    .tg-toast.err { border-color: rgba(255,120,120,0.6); color: #ff9090; }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ───────────── 状态 ─────────────
  let pat = localStorage.getItem(PAT_KEY) || '';
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch (e) {
    history = [];
  }

  // ───────────── DOM 构建 ─────────────
  const root = document.createElement('div');
  root.id = 'tg-root';
  root.innerHTML = `
    <button id="tg-fab" title="天工坊 · 自镜阵" aria-label="天工坊">工</button>
    <div id="tg-mask">
      <div id="tg-panel" role="dialog" aria-labelledby="tg-title">
        <div class="tg-head">
          <div>
            <div id="tg-title" class="tg-title">天 工 坊</div>
            <div class="tg-subtitle">自 镜 阵 · 山门子弟自修缮</div>
          </div>
          <button class="tg-close" aria-label="关闭">✕</button>
        </div>
        <div class="tg-body">
          <div id="tg-pat-section"></div>
          <textarea id="tg-input" class="tg-input"
            placeholder="请详述需修缮之处…&#10;例：奥秘学院 · 塔罗答题三响无回 · 求修&#10;例：识海天碑 · 加一段口诀朗读功能"></textarea>
          <div class="tg-hint">📜 提交后自动建 issue 触发 <code>@claude</code>，约 1-2 分钟后开 PR · 你 review merge 即上线</div>
          <button id="tg-submit" class="tg-submit">布 阵</button>
          <div class="tg-history">
            <div class="tg-history-head">📒 案 卷 阁</div>
            <div id="tg-history-list"></div>
          </div>
        </div>
        <div class="tg-foot">天 工 坊 · v0.1 · 山门子弟自留</div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // ───────────── 引用 ─────────────
  const $ = (id) => document.getElementById(id);
  const $fab = $('tg-fab');
  const $mask = $('tg-mask');
  const $panel = $('tg-panel');
  const $close = root.querySelector('.tg-close');
  const $input = $('tg-input');
  const $submit = $('tg-submit');
  const $historyList = $('tg-history-list');
  const $patSection = $('tg-pat-section');

  // ───────────── PAT 区渲染 ─────────────
  function renderPATSection() {
    if (pat) {
      $patSection.innerHTML = `
        <div style="font-size:11px; color:#6a5b40; margin-bottom:14px; letter-spacing:0.12em;">
          🔑 师门凭信已存（<a href="#" id="tg-pat-clear" style="color:#c9a352;">重置</a>）
        </div>`;
      $patSection.querySelector('#tg-pat-clear').onclick = (e) => {
        e.preventDefault();
        if (confirm('清除已存的 GitHub PAT？')) {
          localStorage.removeItem(PAT_KEY);
          pat = '';
          renderPATSection();
        }
      };
    } else {
      $patSection.innerHTML = `
        <div class="tg-pat-warn">
          ⚠ 首次呈奏，需师门凭信 (GitHub PAT) 方可建 issue。<br>
          <a href="${PAT_GUIDE_URL}" target="_blank" rel="noopener">点此前往生成</a>（勾选 <code>public_repo</code>，过期时间随你）
        </div>
        <div class="tg-pat-row">
          <input id="tg-pat-input" class="tg-input" type="password" placeholder="粘贴你的 GitHub PAT (ghp_xxx 或 github_pat_xxx)" />
          <button class="tg-pat-save" id="tg-pat-save">封 印</button>
        </div>`;
      $patSection.querySelector('#tg-pat-save').onclick = () => {
        const v = $patSection.querySelector('#tg-pat-input').value.trim();
        if (!v) { toast('凭信为空', true); return; }
        if (!/^gh[ps]_|^github_pat_/.test(v)) {
          if (!confirm('格式不像标准 GitHub PAT，继续保存？')) return;
        }
        pat = v;
        localStorage.setItem(PAT_KEY, v);
        renderPATSection();
        toast('凭信已封印');
      };
    }
  }

  // ───────────── 历史渲染 ─────────────
  function renderHistory() {
    if (history.length === 0) {
      $historyList.innerHTML = '<div class="tg-history-empty">尚无文牒 · 上方呈奏一道</div>';
      return;
    }
    $historyList.innerHTML = history.slice(0, 20).map((item) => {
      const status = item.status || 'pending';
      const statusLabel = {
        pending: '锻造中',
        pr: '已开 PR',
        merged: '已合并',
        closed: '已关闭',
        failed: '失败',
      }[status] || status;
      return `
        <div class="tg-item">
          <span class="tg-item-no">#${item.id}</span>
          <div class="tg-item-body">
            <div class="tg-item-title">${escapeHtml(item.title)}</div>
            <div class="tg-item-meta">
              <span class="tg-status tg-status-${status}">${statusLabel}</span>
              · <a class="tg-item-link" href="${item.url}" target="_blank" rel="noopener">看 issue</a>
              ${item.pr_url ? ` · <a class="tg-item-link" href="${item.pr_url}" target="_blank" rel="noopener">看 PR</a>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function saveHistory() {
    history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  // ───────────── Toast ─────────────
  let toastTimer = null;
  function toast(msg, isErr) {
    let el = document.getElementById('tg-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tg-toast';
      el.className = 'tg-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'tg-toast' + (isErr ? ' err' : '') + ' show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'tg-toast' + (isErr ? ' err' : ''); }, 2800);
  }

  // ───────────── 呈奏 ─────────────
  async function submitDocket() {
    const text = $input.value.trim();
    if (!text) { toast('文牒为空', true); return; }
    if (!pat) { toast('需先封印师门凭信', true); return; }

    const currentPage = location.pathname.replace(/^\/pku-cultivation-apps/, '') || '/';
    const title = `[天工坊] ${text.slice(0, 60).replace(/\n/g, ' ')}`;
    const body = `@claude\n\n${text}\n\n---\n_via 天工坊 · 触发页 \`${currentPage}\` · 时辰 ${new Date().toLocaleString('zh-CN')}_`;

    $submit.disabled = true;
    $submit.textContent = '锻 造 中…';

    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pat}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ title, body }),
      });
      if (!r.ok) {
        const errBody = await r.text();
        throw new Error(`GitHub API ${r.status}: ${errBody.slice(0, 120)}`);
      }
      const issue = await r.json();
      history.unshift({
        id: issue.number,
        url: issue.html_url,
        title: text.slice(0, 80),
        created: Date.now(),
        status: 'pending',
        pr_url: null,
      });
      saveHistory();
      renderHistory();
      $input.value = '';
      toast(`文牒 #${issue.number} 已呈奏，天工锻造中…`);
    } catch (e) {
      toast('呈奏失败：' + e.message, true);
    } finally {
      $submit.disabled = false;
      $submit.textContent = '布 阵';
    }
  }

  // ───────────── 轮询状态 ─────────────
  async function pollOne(item) {
    if (item.status === 'merged' || item.status === 'closed' || item.status === 'failed') return false;
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/issues/${item.id}`, {
        headers: pat ? { 'Authorization': `Bearer ${pat}` } : {},
      });
      if (!r.ok) return false;
      const issue = await r.json();
      let newStatus = item.status;
      let newPRUrl = item.pr_url;

      // 看 issue 评论里是否有 PR 链接
      if (!newPRUrl) {
        const cr = await fetch(`https://api.github.com/repos/${REPO}/issues/${item.id}/comments`, {
          headers: pat ? { 'Authorization': `Bearer ${pat}` } : {},
        });
        if (cr.ok) {
          const comments = await cr.json();
          for (const c of comments) {
            const m = c.body && c.body.match(/\/pull\/(\d+)/);
            if (m) {
              newPRUrl = `https://github.com/${REPO}/pull/${m[1]}`;
              newStatus = 'pr';
              break;
            }
          }
        }
      }

      // 如果有 PR URL，查 PR 是否 merged / closed
      if (newPRUrl) {
        const prMatch = newPRUrl.match(/\/pull\/(\d+)/);
        if (prMatch) {
          const pr = await fetch(`https://api.github.com/repos/${REPO}/pulls/${prMatch[1]}`, {
            headers: pat ? { 'Authorization': `Bearer ${pat}` } : {},
          }).then(r => r.ok ? r.json() : null);
          if (pr) {
            if (pr.merged) newStatus = 'merged';
            else if (pr.state === 'closed') newStatus = 'closed';
            else newStatus = 'pr';
          }
        }
      } else if (issue.state === 'closed') {
        newStatus = 'closed';
      }

      if (newStatus !== item.status || newPRUrl !== item.pr_url) {
        item.status = newStatus;
        item.pr_url = newPRUrl;
        return true;
      }
    } catch (e) {
      // 静默失败，下次再试
    }
    return false;
  }

  async function pollAll() {
    let anyChanged = false;
    for (const item of history.slice(0, 10)) {
      if (await pollOne(item)) anyChanged = true;
    }
    if (anyChanged) {
      saveHistory();
      if ($mask.classList.contains('show')) renderHistory();
    }
  }

  // ───────────── 事件 ─────────────
  function openPanel() {
    renderPATSection();
    renderHistory();
    $mask.classList.add('show');
    $fab.classList.add('active');
    setTimeout(() => $input.focus(), 50);
    pollAll();
  }
  function closePanel() {
    $mask.classList.remove('show');
    $fab.classList.remove('active');
  }

  $fab.onclick = () => ($mask.classList.contains('show') ? closePanel() : openPanel());
  $close.onclick = closePanel;
  $mask.onclick = (e) => { if (e.target === $mask) closePanel(); };
  $submit.onclick = submitDocket;
  $input.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      submitDocket();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $mask.classList.contains('show')) closePanel();
  });

  // 每 30 秒后台轮询一次（即使面板关着也跑）
  setInterval(pollAll, POLL_INTERVAL);
})();
