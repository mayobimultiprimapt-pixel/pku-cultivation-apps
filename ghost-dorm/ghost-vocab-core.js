/**
 * Ghost Dorm VocabCore · 单词记忆 SubjectCore 实现
 *
 * 给 index.html 的答题插槽注入"单词记忆"内核：保留塔防/建造/伤害/金币全部外壳，
 * 只把"答一道选择题"换成"看英选中 / 看中选英 / 拼写 / 熟词复习"中的一种。
 *
 * 公开 API（挂到 window.VocabCore）：
 *   getChallenge(starRange) → q · 返回一道单词题，q.type ∈ vocab-en-zh/zh-en/spell/review
 *   renderUI(q, container, onAnswer) · 渲染 4 种 UI 之一；判定后回调 onAnswer(correct, score, q)
 *   getDailyProgress() → { learned, target, streak, wrongPending, imprisoned }
 *
 * 内部状态（localStorage）：
 *   GD_Vocab_WordState_v1 · 按单词存 { seen, lastReview, nextReview, streak, status }
 *     status: 0 新词 / 1 见过 / 2 记得 / 3 熟词
 *   GD_Vocab_WrongQueue_v1 · 当日错词数组（FIFO，新错词进尾，下次抓优先取头）
 *   GD_Vocab_DailyProgress_v1 · { date, learned, target, sessionStreak, maxStreak }
 *
 * SM-2 简版间隔重复：
 *   答对 → nextReview = today + interval * 2.5（status++）
 *   答错 → nextReview = today + 1d，进 WrongQueue
 *   到 nextReview 当天起优先抽
 */
(function (global) {
  'use strict';

  if (!global.GhostVocabData || !Array.isArray(global.GhostVocabData.WORDS)) {
    console.warn('[VocabCore] GhostVocabData 未加载，VocabCore 不挂载');
    return;
  }

  const WORDS = global.GhostVocabData.WORDS;
  const KEY_STATE = 'GD_Vocab_WordState_v1';
  const KEY_WRONG = 'GD_Vocab_WrongQueue_v1';
  const KEY_DAILY = 'GD_Vocab_DailyProgress_v1';
  const DAY_MS = 86_400_000;
  const TARGET_PER_DAY = 30; // 每日目标新见词数

  // ── 持久化 ──────────────────────────────────────
  function load(k, fb) {
    try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch (e) { return fb; }
  }
  function save(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* quota */ }
  }
  function today() { return new Date().toISOString().split('T')[0]; }
  function todayMs() { return new Date(today()).getTime(); }

  function loadDaily() {
    const d = load(KEY_DAILY, null);
    if (!d || d.date !== today()) {
      return { date: today(), learned: 0, target: TARGET_PER_DAY, sessionStreak: 0, maxStreak: 0 };
    }
    return d;
  }

  // ── 词状态 ──────────────────────────────────────
  function getWordState(w) {
    const all = load(KEY_STATE, {});
    return all[w] || { seen: 0, lastReview: 0, nextReview: 0, streak: 0, status: 0 };
  }
  function setWordState(w, st) {
    const all = load(KEY_STATE, {});
    all[w] = st;
    save(KEY_STATE, all);
  }

  // ── 错词队列 ──────────────────────────────────
  function pushWrong(word) {
    const q = load(KEY_WRONG, []);
    if (!q.includes(word)) q.push(word);
    save(KEY_WRONG, q);
  }
  function popWrong() {
    const q = load(KEY_WRONG, []);
    if (q.length === 0) return null;
    const w = q.shift();
    save(KEY_WRONG, q);
    return w;
  }
  function peekWrongCount() { return load(KEY_WRONG, []).length; }

  // ── 选词策略 ──────────────────────────────────
  // 优先级：错词队列 > 到期复习 > 新词
  function pickWord(starRange) {
    const tierLo = starRange ? starRange[0] : 1;
    const tierHi = starRange ? starRange[1] : 5;
    // tier 1 词在 starRange [1,2] 出现，tier 2 词在 [3,5] 出现
    const allowTier1 = tierLo <= 2;
    const allowTier2 = tierHi >= 3;
    const candidates = WORDS.filter((x) =>
      (x.tier === 1 && allowTier1) || (x.tier === 2 && allowTier2),
    );

    // 1) 错词队列
    const wrong = peekWrongCount();
    if (wrong > 0 && Math.random() < 0.6) {
      const w = popWrong();
      const card = WORDS.find((x) => x.w === w);
      if (card) return { card, source: 'wrong' };
    }

    // 2) 到期复习（nextReview <= 今天）
    const now = todayMs();
    const dueList = candidates.filter((c) => {
      const st = getWordState(c.w);
      return st.nextReview > 0 && st.nextReview <= now && st.status < 3;
    });
    if (dueList.length > 0 && Math.random() < 0.5) {
      return { card: dueList[Math.floor(Math.random() * dueList.length)], source: 'due' };
    }

    // 3) 新词（status === 0）
    const fresh = candidates.filter((c) => getWordState(c.w).status === 0);
    if (fresh.length > 0) {
      return { card: fresh[Math.floor(Math.random() * fresh.length)], source: 'fresh' };
    }

    // 4) 兜底 · 整库随机
    return { card: candidates[Math.floor(Math.random() * candidates.length)], source: 'random' };
  }

  // ── 干扰选项生成 ──────────────────────────────
  function pickDistractors(correctCard, field, n) {
    const pool = WORDS.filter((x) => x[field] !== correctCard[field]);
    const out = [];
    while (out.length < n && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      const cand = pool.splice(idx, 1)[0];
      if (!out.some((x) => x[field] === cand[field])) out.push(cand);
    }
    return out;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── 出题：根据 source / status 决定题型 ───────
  function buildQuestion(card, source) {
    const st = getWordState(card.w);
    // 题型选择规则：
    //   新词 → vocab-en-zh（最基础：看英文选中文）
    //   见过 1-2 次 → 50% en-zh / 50% zh-en
    //   见过 3+ 次或 source=due → 30% en-zh / 30% zh-en / 40% spell
    //   source=wrong → 强制 spell（最难，强化记忆）
    //   熟词复盘 → vocab-review
    let type;
    if (source === 'wrong') {
      type = 'vocab-spell';
    } else if (st.status >= 3) {
      type = 'vocab-review';
    } else if (st.status >= 2 || source === 'due') {
      const r = Math.random();
      type = r < 0.3 ? 'vocab-en-zh' : r < 0.6 ? 'vocab-zh-en' : 'vocab-spell';
    } else if (st.status === 1) {
      type = Math.random() < 0.5 ? 'vocab-en-zh' : 'vocab-zh-en';
    } else {
      type = 'vocab-en-zh';
    }

    const distractors = pickDistractors(card, 'zh', 3);

    if (type === 'vocab-en-zh') {
      const opts = shuffle([card, ...distractors]).map((x) => x.zh);
      return {
        type, word: card.w,
        q: `📕 ${card.w}  <span class="vc-pos">${card.pos}</span>`,
        opts, ans: opts.indexOf(card.zh),
        kp: `${card.w} · ${card.zh} ${card.pos}`,
        tip: card.ex || '',
      };
    }
    if (type === 'vocab-zh-en') {
      const opts = shuffle([card, ...pickDistractors(card, 'w', 3)]).map((x) => x.w);
      return {
        type, word: card.w,
        q: `📗 「${card.zh}」 用英语怎么说？`,
        opts, ans: opts.indexOf(card.w),
        kp: `${card.w} · ${card.zh}`,
        tip: card.ex || '',
      };
    }
    if (type === 'vocab-spell') {
      // 给中文 + 首字母 + 长度提示
      const hint = card.w[0] + '_'.repeat(card.w.length - 1);
      return {
        type, word: card.w,
        q: `📘 「${card.zh}」 ${card.pos}<br><span class="vc-hint">${hint} (${card.w.length} 字母)</span>`,
        ans: card.w.toLowerCase(),
        kp: `${card.w} · ${card.zh}`,
        tip: card.ex || '',
      };
    }
    // vocab-review · 熟词速答（判断中文释义是否正确）
    const wrong = Math.random() < 0.5;
    const shown = wrong ? distractors[0].zh : card.zh;
    return {
      type, word: card.w,
      q: `📙 ${card.w} 的意思是「${shown}」？`,
      ans: wrong ? false : true,
      kp: `${card.w} · ${card.zh}`,
      tip: card.ex || '',
    };
  }

  // ── 公开：取一道题 ────────────────────────────
  function getChallenge(starRange) {
    const { card, source } = pickWord(starRange);
    const q = buildQuestion(card, source);
    q.__source = source;
    return q;
  }

  // ── 公开：渲染 UI ─────────────────────────────
  function renderUI(q, container, onAnswer) {
    const opts = q.opts || [];

    if (q.type === 'vocab-en-zh' || q.type === 'vocab-zh-en') {
      // 4 选 1
      const letters = 'ABCD';
      const html = `<div class="qz-opts vc-opts">
        ${opts.map((o, i) => `<button class="qz-opt vc-opt" data-i="${i}"><span class="om">${letters[i]}</span>${escapeHtml(o)}</button>`).join('')}
      </div>`;
      container.insertAdjacentHTML('beforeend', html);
      container.querySelectorAll('.vc-opt').forEach((el) => {
        el.addEventListener('click', () => {
          const i = parseInt(el.dataset.i, 10);
          container.querySelectorAll('.vc-opt').forEach((b, j) => {
            b.classList.add('disabled');
            b.style.pointerEvents = 'none';
            if (j === q.ans) b.classList.add('correct');
            if (j === i && i !== q.ans) b.classList.add('wrong');
          });
          const correct = i === q.ans;
          afterAnswer(q, correct, container, () => onAnswer(correct, correct ? 2 : 0, q));
        });
      });
      return;
    }

    if (q.type === 'vocab-spell') {
      // 输入框 + 提交
      const html = `<div class="vc-spell">
        <input id="vcSpellInput" class="vc-input" autocomplete="off" autocapitalize="none" placeholder="输入完整单词..." />
        <button id="vcSpellSubmit" class="essay-sub">提交</button>
      </div>`;
      container.insertAdjacentHTML('beforeend', html);
      const input = container.querySelector('#vcSpellInput');
      const btn = container.querySelector('#vcSpellSubmit');
      input.focus();
      function submit() {
        const v = (input.value || '').trim().toLowerCase();
        if (!v) return;
        const correct = v === q.ans;
        input.disabled = true;
        btn.disabled = true;
        input.classList.add(correct ? 'correct' : 'wrong');
        afterAnswer(q, correct, container, () => onAnswer(correct, correct ? 3 : 0, q));
      }
      btn.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
      return;
    }

    if (q.type === 'vocab-review') {
      const html = `<div class="judge-row">
        <button class="judge-btn vc-true">✓ 正确</button>
        <button class="judge-btn vc-false">✗ 错误</button>
      </div>`;
      container.insertAdjacentHTML('beforeend', html);
      function judge(v) {
        const correct = v === q.ans;
        container.querySelectorAll('.judge-btn').forEach((el) => { el.style.pointerEvents = 'none'; });
        afterAnswer(q, correct, container, () => onAnswer(correct, correct ? 1 : 0, q));
      }
      container.querySelector('.vc-true').addEventListener('click', () => judge(true));
      container.querySelector('.vc-false').addEventListener('click', () => judge(false));
      return;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // ── 答题后果：更新词状态 + 错词队列 + 每日进度 ──
  function afterAnswer(q, correct, container, cb) {
    const st = getWordState(q.word);
    const now = todayMs();

    if (correct) {
      st.streak = (st.streak || 0) + 1;
      st.status = Math.min(3, (st.status || 0) + 1);
      const intervalDays = [1, 2, 4, 7, 15][Math.min(st.status, 4)];
      st.lastReview = now;
      st.nextReview = now + intervalDays * DAY_MS;
      st.seen = (st.seen || 0) + 1;
    } else {
      st.streak = 0;
      st.status = Math.max(0, (st.status || 0) - 1);
      st.lastReview = now;
      st.nextReview = now + DAY_MS;
      st.seen = (st.seen || 0) + 1;
      pushWrong(q.word);
    }
    setWordState(q.word, st);

    // 每日进度（"learned" = 当日首次见词数）
    const d = loadDaily();
    if (st.seen === 1 || (st.seen > 0 && st.lastReview && now - st.lastReview < DAY_MS && correct)) {
      // 简化：只要今天答对的不在 learned 集合里就 +1（按词去重不要紧，UI 用作粗略指标）
    }
    if (correct) {
      d.sessionStreak = (d.sessionStreak || 0) + 1;
      d.maxStreak = Math.max(d.maxStreak || 0, d.sessionStreak);
      // learned 按"今天 status 升到 ≥1 的新词"算（粗略：每次答对 +1，封顶 target）
      d.learned = Math.min(d.target, (d.learned || 0) + 1);
    } else {
      d.sessionStreak = 0;
    }
    save(KEY_DAILY, d);

    // 连胜加成提示（>=3 连胜在弹一行 floating 提示）
    if (correct && d.sessionStreak >= 3) {
      const banner = document.createElement('div');
      banner.className = 'vc-streak-banner';
      banner.textContent = `🔥 ${d.sessionStreak} 连胜！伤害加成 +${(d.sessionStreak - 2) * 25}%`;
      container.appendChild(banner);
      setTimeout(() => banner.remove(), 1400);
    }

    setTimeout(cb, 600);
  }

  // ── 公开：每日进度（菜单/HUD 可用） ──────────
  function getDailyProgress() {
    const d = loadDaily();
    let imprisoned = 0;
    const all = load(KEY_STATE, {});
    for (const w in all) if (all[w].status >= 3) imprisoned++;
    return {
      learned: d.learned || 0,
      target: d.target || TARGET_PER_DAY,
      sessionStreak: d.sessionStreak || 0,
      maxStreak: d.maxStreak || 0,
      wrongPending: peekWrongCount(),
      imprisoned,
      totalLib: WORDS.length,
    };
  }

  global.VocabCore = { getChallenge, renderUI, getDailyProgress };
  console.log('[VocabCore] 挂载完毕 · 词库 ' + WORDS.length + ' 词');
})(typeof window !== 'undefined' ? window : globalThis);
