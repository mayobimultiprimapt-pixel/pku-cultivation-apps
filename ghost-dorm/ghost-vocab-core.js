/**
 * Ghost Dorm VocabCore · 单词记忆 SubjectCore 实现
 *
 * 给 ghost_dorm_game.html 的答题插槽注入"单词记忆"内核：保留塔防/建造/伤害/金币全部外壳，
 * 只把"答一道选择题"换成"看英选中 / 看中选英 / 熟词速答 / 字母引导"中的一种。
 *
 * 公开 API（挂到 window.VocabCore）：
 *   getChallenge(starRange) → q · 返回一道单词题
 *   renderUI(q, container, onAnswer) · 渲染 UI；判定后回调 onAnswer(correct, score, q)
 *   getDailyProgress() → { learned, target, streak, wrongPending, imprisoned }
 *
 * 2026-05-16 主理人 11 调整 · 零基础小白包：
 *   - 拼写题暂时关闭（小白现场打英文门槛太高）
 *   - 前 5 次 getChallenge 走引导关（abc 字母 / 最基础高频词）
 *   - 每题加 🔊 发音按钮（浏览器 SpeechSynthesis）
 *   - 题型分阶：新词只 en-zh，熟悉了才解锁 zh-en，最后熟词速答
 *   - 答错弹小白卡片（中文 + emoji + 音标 + 例句翻译），强制看 1.4s 再过
 *   - 首关 wordState 几乎空时强制 tier-1 高频
 *
 * 内部状态（localStorage）：
 *   GD_Vocab_WordState_v1 · 按单词存 { seen, lastReview, nextReview, streak, status }
 *   GD_Vocab_WrongQueue_v1 · 当日错词数组
 *   GD_Vocab_DailyProgress_v1 · 当日进度 + tutorialStep
 *   GD_Vocab_TutorialDone_v1 · 引导关是否过了
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
  const KEY_TUTORIAL = 'GD_Vocab_TutorialDone_v1';
  const KEY_UNIT_PROG = 'GD_Vocab_UnitProgress_v1';
  const DAY_MS = 86_400_000;
  const TARGET_PER_DAY = 30;

  // ── 章节模式：5500 词全集 + 当前 Unit 词池 ────────
  let EXTENDED_WORDS = null;   // null = 未加载 · array = enriched word lib (5500 词 + 200 词 enriched 覆盖)
  let CURRENT_CHAPTER = null;  // null = 无章节 · { category, unit, displayName, words[] }
  let _extLoading = null;      // Promise · 防止并发 fetch

  async function tryFetch(paths) {
    for (const p of paths) {
      try {
        const r = await fetch(p, { cache: 'force-cache' });
        if (r.ok) return await r.json();
      } catch (e) { /* try next */ }
    }
    return null;
  }

  // 加载 5500 词全集 · 兼容 GitHub Pages 同目录 / daima-shanhai 上一级 / 绝对根
  async function loadExtended() {
    if (EXTENDED_WORDS) return EXTENDED_WORDS;
    if (_extLoading) return _extLoading;
    _extLoading = (async () => {
      const data = await tryFetch([
        'kaoyan-5500.json',
        '../vocab/kaoyan-5500.json',
        '/vocab/kaoyan-5500.json',
      ]);
      if (!data || !Array.isArray(data)) {
        console.warn('[VocabCore] 5500 词 JSON 加载失败 · 章节模式将仅用 200 词内置');
        return null;
      }
      // 转 shape：5500 schema {w, pos[], m[], ph?[]} → 内部 {w, zh, pos, ex, ex_zh, phonetic, emoji, tier}
      // 同 w 在 200 词包里有 enriched 数据则覆盖
      const map200 = new Map(WORDS.map((x) => [x.w, x]));
      EXTENDED_WORDS = data.map((item) => {
        const enriched = map200.get(item.w);
        if (enriched) return enriched;
        return {
          w: item.w,
          pos: (item.pos && item.pos.length ? item.pos.join('/') : '') + '.',
          zh: (item.m && item.m[0]) || item.w,
          ex: (item.ph && item.ph[0]) || '',
          ex_zh: '',
          phonetic: '',
          emoji: '🔤',
          tier: 3, // 5500 - 200 部分归 tier 3（章节模式专用，避免污染 tier-1 起手关）
        };
      });
      console.log('[VocabCore] 5500 词加载完毕 · ' + EXTENDED_WORDS.length + ' 词 · 200 词 enriched merged');
      return EXTENDED_WORDS;
    })();
    return _extLoading;
  }

  function setChapter(chapterId) {
    if (!chapterId) { CURRENT_CHAPTER = null; return; }
    if (typeof global.GhostVocabUnits === 'undefined') {
      console.warn('[VocabCore] GhostVocabUnits 未加载，setChapter 无效');
      return;
    }
    const u = global.GhostVocabUnits.UNITS.find((x) => `${x.category}-u${x.unit}` === chapterId);
    if (!u) {
      console.warn('[VocabCore] 章节未找到：' + chapterId);
      return;
    }
    CURRENT_CHAPTER = u;
    void loadExtended(); // 异步预加载 · 第一题可能用 fallback，第二题起就有 5500 词
    console.log('[VocabCore] 章节切换：' + u.displayName + ' · ' + u.words.length + ' 词');
  }

  function getCurrentChapter() { return CURRENT_CHAPTER; }

  function getChapterProgress(chapterId) {
    if (!chapterId && CURRENT_CHAPTER) chapterId = `${CURRENT_CHAPTER.category}-u${CURRENT_CHAPTER.unit}`;
    if (!chapterId) return { learned: 0, mastered: 0, total: 0 };
    const u = global.GhostVocabUnits?.UNITS.find((x) => `${x.category}-u${x.unit}` === chapterId);
    if (!u) return { learned: 0, mastered: 0, total: 0 };
    const stateMap = load(KEY_STATE, {});
    let learned = 0, mastered = 0;
    for (const w of u.words) {
      const st = stateMap[w];
      if (!st) continue;
      if (st.status >= 1) learned++;
      if (st.status >= 3) mastered++;
    }
    return { learned, mastered, total: u.words.length };
  }

  // ── 持久化 helpers ───────────────────────────
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
      return { date: today(), learned: 0, target: TARGET_PER_DAY, sessionStreak: 0, maxStreak: 0, tutorialStep: 0 };
    }
    if (typeof d.tutorialStep !== 'number') d.tutorialStep = 0;
    return d;
  }

  function getWordState(w) {
    const all = load(KEY_STATE, {});
    return all[w] || { seen: 0, lastReview: 0, nextReview: 0, streak: 0, status: 0 };
  }
  function setWordState(w, st) {
    const all = load(KEY_STATE, {});
    all[w] = st;
    save(KEY_STATE, all);
  }

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

  // ── 引导关 5 题（首次开局 · 全中文界面 + 超高频词 · 跟 200 词库无关） ──
  const TUTORIAL_STEPS = [
    {
      type: 'vocab-tutorial', step: 0,
      q: '🔤 哪个是字母 <b>a</b>？',
      opts: ['a', 'e', 'o', 'u'], ans: 0,
      kp: 'a 字母 · 26 字母里的第 1 个',
      tip: '英语字母 a 念 /eɪ/，像中文「诶」',
    },
    {
      type: 'vocab-tutorial', step: 1,
      q: '👋 「<b>你好</b>」用英语怎么说？',
      opts: ['hello', 'bye', 'sorry', 'thanks'], ans: 0,
      kp: 'hello · 你好',
      tip: '最简单的招呼语，全世界都听得懂',
    },
    {
      type: 'vocab-tutorial', step: 2,
      q: '🙇 「<b>thank you</b>」是什么意思？',
      opts: ['谢谢', '再见', '对不起', '请'], ans: 0,
      kp: 'thank you · 谢谢',
      tip: 'thank you 比 thanks 更正式',
    },
    {
      type: 'vocab-tutorial', step: 3,
      q: '👤 「<b>我</b>」用英语是哪个？',
      opts: ['I', 'you', 'he', 'she'], ans: 0,
      kp: 'I · 我（永远大写）',
      tip: 'I 不管在句中哪里都要大写，是个特殊规则',
    },
    {
      type: 'vocab-tutorial', step: 4,
      q: '✅ 「<b>yes</b>」是什么意思？',
      opts: ['是', '不', '可能', '不知道'], ans: 0,
      kp: 'yes · 是 / 对 / 好的',
      tip: '同意时说 yes，不同意时说 no',
    },
  ];

  // ── 选词策略 · 章节模式 / 首关 tier-1 ──────
  function pickWord(starRange) {
    // 当前活跃词库（章节模式用 EXTENDED + chapter 过滤；否则用 200 内置）
    let activeLib = WORDS;
    let chapterFilter = null;
    if (CURRENT_CHAPTER) {
      if (EXTENDED_WORDS) {
        activeLib = EXTENDED_WORDS;
        chapterFilter = new Set(CURRENT_CHAPTER.words);
      } else {
        // 5500 词还没加载完 · fallback：在 200 词包里取章节词（可能空）
        chapterFilter = new Set(CURRENT_CHAPTER.words);
      }
    }

    const tierLo = starRange ? starRange[0] : 1;
    const tierHi = starRange ? starRange[1] : 5;
    const allowTier1 = tierLo <= 2;
    const allowTier2 = tierHi >= 3;

    const stateMap = load(KEY_STATE, {});
    const seenCount = Object.keys(stateMap).length;
    const forceTier1 = seenCount < 15 && !CURRENT_CHAPTER; // 章节模式不强制 tier-1（章节是用户主动选的）

    let candidates = activeLib.filter((x) => {
      if (chapterFilter && !chapterFilter.has(x.w)) return false;
      if (forceTier1) return x.tier === 1;
      if (CURRENT_CHAPTER) return true; // 章节模式不按 tier 卡
      return (x.tier === 1 && allowTier1) || (x.tier === 2 && allowTier2);
    });
    // 章节模式 candidates 为空 → 章节词全在 5500 范围外（理论上不会，但兜底回 200 包章节交集）
    if (candidates.length === 0 && chapterFilter) {
      candidates = WORDS.filter((x) => chapterFilter.has(x.w));
    }
    if (candidates.length === 0) candidates = activeLib;

    // 1) 错词队列优先
    if (peekWrongCount() > 0 && Math.random() < 0.6) {
      const w = popWrong();
      const card = WORDS.find((x) => x.w === w);
      if (card) return { card, source: 'wrong' };
    }
    // 2) 到期复习
    const now = todayMs();
    const dueList = candidates.filter((c) => {
      const st = getWordState(c.w);
      return st.nextReview > 0 && st.nextReview <= now && st.status < 3;
    });
    if (dueList.length > 0 && Math.random() < 0.5) {
      return { card: dueList[Math.floor(Math.random() * dueList.length)], source: 'due' };
    }
    // 3) 新词
    const fresh = candidates.filter((c) => getWordState(c.w).status === 0);
    if (fresh.length > 0) {
      return { card: fresh[Math.floor(Math.random() * fresh.length)], source: 'fresh' };
    }
    return { card: candidates[Math.floor(Math.random() * candidates.length)], source: 'random' };
  }

  // ── 干扰选项 · 章节模式优先从同章节内抽 ───
  function pickDistractors(correctCard, field, n) {
    // 1) 章节模式 + 同章节词池足够 → 从同章节抽（语义近，更难辨）
    let pool;
    if (CURRENT_CHAPTER && EXTENDED_WORDS) {
      const wordSet = new Set(CURRENT_CHAPTER.words);
      pool = EXTENDED_WORDS.filter((x) => wordSet.has(x.w) && x[field] !== correctCard[field]);
      if (pool.length < n) {
        // 2) 章节内不够 → 扩到全集
        pool = EXTENDED_WORDS.filter((x) => x[field] !== correctCard[field]);
      }
    } else {
      pool = WORDS.filter((x) => x[field] !== correctCard[field]);
    }
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

  // ── 出题：题型分阶解锁 · 拼写关已关 ─────────
  function buildQuestion(card, source) {
    const st = getWordState(card.w);
    // 新词 / 错词 → en-zh 最低门槛；status 高才解锁 zh-en、最后熟词速答
    let type;
    if (source === 'wrong' || st.status === 0) {
      type = 'vocab-en-zh';
    } else if (st.status >= 3) {
      type = 'vocab-review';
    } else if (st.status === 1) {
      type = Math.random() < 0.7 ? 'vocab-en-zh' : 'vocab-zh-en';
    } else {
      type = Math.random() < 0.5 ? 'vocab-en-zh' : 'vocab-zh-en';
    }

    if (type === 'vocab-en-zh') {
      const opts = shuffle([card, ...pickDistractors(card, 'zh', 3)]).map((x) => x.zh);
      return {
        type, word: card.w, card,
        q: `📕 <span class="vc-bigword">${card.w}</span> <span class="vc-pos">${card.pos}</span>`,
        opts, ans: opts.indexOf(card.zh),
        kp: `${card.w} · ${card.zh} ${card.pos}`,
        tip: card.ex || '',
      };
    }
    if (type === 'vocab-zh-en') {
      const opts = shuffle([card, ...pickDistractors(card, 'w', 3)]).map((x) => x.w);
      return {
        type, word: card.w, card,
        q: `📗 「<b>${card.zh}</b>」 用英语怎么说？`,
        opts, ans: opts.indexOf(card.w),
        kp: `${card.w} · ${card.zh}`,
        tip: card.ex || '',
      };
    }
    // vocab-review · 熟词速答
    const wrongOpt = Math.random() < 0.5;
    const shown = wrongOpt ? pickDistractors(card, 'zh', 1)[0].zh : card.zh;
    return {
      type, word: card.w, card,
      q: `📙 <span class="vc-bigword">${card.w}</span> 的意思是「${shown}」？`,
      ans: !wrongOpt,
      kp: `${card.w} · ${card.zh}`,
      tip: card.ex || '',
    };
  }

  // ── 公开：取一道题 ────────────────────────────
  function getChallenge(starRange) {
    if (load(KEY_TUTORIAL, 0) !== 1) {
      const d = loadDaily();
      const step = d.tutorialStep || 0;
      if (step < TUTORIAL_STEPS.length) {
        const q = Object.assign({}, TUTORIAL_STEPS[step]);
        q.__source = 'tutorial';
        return q;
      }
      save(KEY_TUTORIAL, 1); // 5 题全过 · 标记 tutorial done
    }
    const { card, source } = pickWord(starRange);
    const q = buildQuestion(card, source);
    q.__source = source;
    return q;
  }

  // ── TTS 发音 ──────────────────────────────────
  function speak(text) {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    } catch (e) { /* 浏览器不支持就静默 */ }
  }

  // ── 公开：渲染 UI ─────────────────────────────
  function renderUI(q, container, onAnswer) {
    if (q.type === 'vocab-tutorial') {
      return renderChoice(q, container, onAnswer, { tts: false, score: 1 });
    }
    if (q.type === 'vocab-en-zh') {
      return renderChoice(q, container, onAnswer, { tts: true, ttsWord: q.word, score: 2 });
    }
    if (q.type === 'vocab-zh-en') {
      return renderChoice(q, container, onAnswer, { tts: false, score: 2 });
    }
    if (q.type === 'vocab-review') {
      return renderJudge(q, container, onAnswer);
    }
  }

  function renderChoice(q, container, onAnswer, opts) {
    const letters = 'ABCD';
    const ttsBtn = opts.tts && opts.ttsWord
      ? `<div class="vc-tts-row"><button class="vc-tts" title="点击发音" onclick="VocabCore._speak('${escapeAttr(opts.ttsWord)}')">🔊 听一遍</button></div>`
      : '';
    const html = `
      ${ttsBtn}
      <div class="qz-opts vc-opts">
        ${q.opts.map((o, i) => `<button class="qz-opt vc-opt" data-i="${i}"><span class="om">${letters[i]}</span>${escapeHtml(o)}</button>`).join('')}
      </div>`;
    container.insertAdjacentHTML('beforeend', html);
    // TTS 自动播一遍（仅 en-zh 时，让小白先听到读音）
    if (opts.tts && opts.ttsWord) {
      setTimeout(() => speak(opts.ttsWord), 250);
    }
    container.querySelectorAll('.vc-opt').forEach((el) => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.i, 10);
        container.querySelectorAll('.vc-opt').forEach((b, j) => {
          b.classList.add('disabled'); b.style.pointerEvents = 'none';
          if (j === q.ans) b.classList.add('correct');
          if (j === i && i !== q.ans) b.classList.add('wrong');
        });
        const correct = i === q.ans;
        afterAnswer(q, correct, container, () => onAnswer(correct, correct ? opts.score : 0, q));
      });
    });
  }

  function renderJudge(q, container, onAnswer) {
    const html = `
      <div class="vc-tts-row"><button class="vc-tts" onclick="VocabCore._speak('${escapeAttr(q.word)}')">🔊 听一遍</button></div>
      <div class="judge-row">
        <button class="judge-btn vc-true">✓ 正确</button>
        <button class="judge-btn vc-false">✗ 错误</button>
      </div>`;
    container.insertAdjacentHTML('beforeend', html);
    setTimeout(() => speak(q.word), 250);
    function judge(v) {
      const correct = v === q.ans;
      container.querySelectorAll('.judge-btn').forEach((el) => { el.style.pointerEvents = 'none'; });
      const btn = container.querySelector(v ? '.vc-true' : '.vc-false');
      if (btn) btn.classList.add(correct ? 'correct' : 'wrong');
      afterAnswer(q, correct, container, () => onAnswer(correct, correct ? 1 : 0, q));
    }
    container.querySelector('.vc-true').addEventListener('click', () => judge(true));
    container.querySelector('.vc-false').addEventListener('click', () => judge(false));
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  function escapeAttr(s) { return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

  // ── 小白卡片：答对/答错都塞 · 带「继续 →」按钮 · 用户手动点才走下一题 ──
  function flashWhiteCard(q, container, correct, onContinue) {
    const c = q.card;
    const headIcon = correct ? '✅' : '❌';
    const headTone = correct ? 'ok' : 'fail';
    let inner = '';
    if (c) {
      const phon = c.phonetic ? `<span class="vc-phon">[${escapeHtml(c.phonetic)}]</span>` : '';
      const emoji = c.emoji ? `<span class="vc-emoji">${escapeHtml(c.emoji)}</span>` : '🔤';
      const exZh = c.ex_zh ? `<div class="vc-ex-zh">↳ ${escapeHtml(c.ex_zh)}</div>` : '';
      const ex = c.ex ? `<div class="vc-ex-en">${escapeHtml(c.ex)}</div>` : '';
      inner = `
        <div class="vc-wc-head">${emoji} <b>${escapeHtml(c.w)}</b> ${phon}</div>
        <div class="vc-wc-zh">${escapeHtml(c.zh)} <span class="vc-pos">${escapeHtml(c.pos)}</span></div>
        ${ex}${exZh}`;
    } else if (q.tip || q.kp) {
      // tutorial 题：用 q.kp + q.tip 展示
      inner = `
        <div class="vc-wc-head">${escapeHtml(q.kp || '')}</div>
        ${q.tip ? `<div class="vc-ex-zh">↳ ${escapeHtml(q.tip)}</div>` : ''}`;
    } else {
      inner = `<div class="vc-wc-head">${headIcon} ${correct ? '答对了' : '看下次'}</div>`;
    }
    const card = document.createElement('div');
    card.className = 'vc-whitecard vc-wc-' + headTone;
    card.innerHTML = `
      <div class="vc-wc-badge">${headIcon} ${correct ? '正确' : '答错'}</div>
      ${inner}
      <button class="vc-wc-continue" type="button">继续 →</button>`;
    container.appendChild(card);
    if (c) setTimeout(() => speak(c.w), 100);
    const btn = card.querySelector('.vc-wc-continue');
    btn.addEventListener('click', () => {
      btn.disabled = true;
      onContinue();
    });
    // 按 Enter / 空格也能继续
    function keyClose(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.removeEventListener('keydown', keyClose);
        btn.click();
      }
    }
    document.addEventListener('keydown', keyClose);
  }

  // 关闭答题 overlay · vocab 题接管自动关逻辑
  function closeQuizOverlay() {
    const ov = document.getElementById('quizOverlay');
    if (ov) ov.classList.remove('open');
    try { if (typeof G !== 'undefined' && G) G.quizActive = false; } catch (e) { /* G 未定义 */ }
  }

  // ── 答题后果 · 答对/答错都弹卡片 + 等用户点「继续」──
  function afterAnswer(q, correct, container, cb) {
    // tutorial 题：不动 wordState，只推 tutorialStep
    if (q.type === 'vocab-tutorial') {
      const d = loadDaily();
      d.tutorialStep = (d.tutorialStep || 0) + 1;
      if (correct) d.sessionStreak = (d.sessionStreak || 0) + 1;
      else d.sessionStreak = 0;
      save(KEY_DAILY, d);
      // tutorial 也弹卡片让用户消化
      flashWhiteCard(q, container, correct, () => { cb(); closeQuizOverlay(); });
      return;
    }

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

    const d = loadDaily();
    if (correct) {
      d.sessionStreak = (d.sessionStreak || 0) + 1;
      d.maxStreak = Math.max(d.maxStreak || 0, d.sessionStreak);
      d.learned = Math.min(d.target, (d.learned || 0) + 1);
    } else {
      d.sessionStreak = 0;
    }
    save(KEY_DAILY, d);

    if (correct && d.sessionStreak >= 3) {
      const banner = document.createElement('div');
      banner.className = 'vc-streak-banner';
      banner.textContent = `🔥 ${d.sessionStreak} 连胜！伤害加成 +${(d.sessionStreak - 2) * 25}%`;
      container.appendChild(banner);
    }

    // 卡片 + 继续按钮：用户手动点才走（同时关 overlay）
    flashWhiteCard(q, container, correct, () => {
      cb();              // 触发 resolveQuiz 副作用（伤害/金币/HUD/qz-knowledge 行）
      closeQuizOverlay(); // 关界面 · 覆盖 resolveQuiz 末尾原本的 1.6s setTimeout
    });
  }

  // ── 公开：每日进度 ────────────────────────────
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
      tutorialDone: load(KEY_TUTORIAL, 0) === 1,
    };
  }

  // ── 调试 ──────────────────────────────────
  function _resetTutorial() { save(KEY_TUTORIAL, 0); const d = loadDaily(); d.tutorialStep = 0; save(KEY_DAILY, d); }
  function _resetAll() {
    [KEY_STATE, KEY_WRONG, KEY_DAILY, KEY_TUTORIAL].forEach((k) => localStorage.removeItem(k));
  }

  global.VocabCore = {
    getChallenge,
    renderUI,
    getDailyProgress,
    setChapter,
    getCurrentChapter,
    getChapterProgress,
    loadExtended,
    _speak: speak,
    _resetTutorial,
    _resetAll,
  };
  console.log('[VocabCore] 挂载完毕 · 内置 ' + WORDS.length + ' 词 · 引导关 ' + (load(KEY_TUTORIAL, 0) === 1 ? '已过' : '待过') + ' · 章节模式 ready (待 setChapter)');
})(typeof window !== 'undefined' ? window : globalThis);
