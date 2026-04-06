/**
 * 论道殿 · 诸天舌战 — 主控制器
 * ========================================
 * 接案 → 破(识别谬误) → 立(选原理) → 论证链(关键词拼) → 判决
 */

const CourtApp = (() => {
  let mode = 'politics';
  let gameMode = 'court'; // 'court' or 'tavern'
  let breakHand = [];
  let buildPool = [];

  // ─── 初始化 ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.mode-card').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mode = btn.dataset.mode;
      });
    });
    document.getElementById('btnStart').addEventListener('click', startTrial);

    // Game mode buttons
    document.querySelectorAll('.gamemode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gamemode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameMode = btn.dataset.gamemode;
      });
    });

    // 每日更新
    if (typeof DailyUpdate !== 'undefined') {
      DailyUpdate.init().then(n => {
        if (n > 0) {
          const b = document.getElementById('dailyBadge');
          if (b) b.textContent = `✨ ${n}道新题`;
        }
      });
    }
  });

  // ─── 开始庭审 ───────────────────────────────────────
  function startTrial() {
    CourtEngine.init(mode);
    show('courtScreen');
    loadCase();
  }

  // ─── 加载案件 ───────────────────────────────────────
  function loadCase() {
    const c = CourtEngine.getCase();
    const S = CourtEngine.getState();
    if (!c) { showResults(); return; }

    document.getElementById('caseSubject').textContent = mode === 'english' ? '英语推断' : '政治论述';
    document.getElementById('caseRound').innerHTML = `案件 ${S.caseIndex+1}/${S.totalCases}` +
      (document.getElementById('dailyBadge')?.outerHTML || '');
    document.getElementById('dossierDiff').textContent = '★'.repeat(c.diff) + '☆'.repeat(5-c.diff);
    document.getElementById('dossierBadge').textContent = mode === 'english' ? '📜 Contract' : '📋 卷宗';
    document.getElementById('dossierTitle').textContent = c.title;
    document.getElementById('dossierText').textContent = c.text;

    // 原告/被告
    const parties = document.getElementById('dossierParties');
    parties.innerHTML = `
      <div class="party-card plaintiff">
        <span class="party-label">${c.plaintiff.label}</span>
        ${c.plaintiff.text}
      </div>
      <div class="party-card defendant">
        <span class="party-label">${c.defendant.label}</span>
        ${c.defendant.text}
      </div>
    `;

    setPhase('read');
    setSpeech('"本庭受理此案。仔细阅读卷宗，准备破局。"');
    renderReadPhase();
    updateStats();
  }

  // ═══ Phase 1: 接案 ═══════════════════════════════════
  function renderReadPhase() {
    const battle = document.getElementById('panelBattle');
    battle.innerHTML = `
      <div class="battle-title"><span class="bt-icon">📋</span> 阅读卷宗</div>
      <div class="phase-content" style="justify-content:center;align-items:center;text-align:center">
        <div style="max-width:320px">
          <div style="font-size:2.5rem;margin-bottom:.5rem;filter:drop-shadow(0 0 15px var(--gold-g))">⚖️</div>
          <div style="font-family:var(--ff-c);font-size:.85rem;color:var(--dim);margin-bottom:.8rem">
            仔细阅读左侧卷宗和原被告陈述<br>找出其中的逻辑谬误
          </div>
          <button class="act-btn primary" onclick="CourtApp.enterBreak()">🔨 准备破局</button>
        </div>
      </div>
    `;
    clearHand();
  }

  // ═══ Phase 2: 破 ═══════════════════════════════════
  function enterBreak() {
    const c = CourtEngine.getCase();
    if (!c) return;
    setPhase('break');
    setSpeech('"原被告各执一词。请指出他们论述中的逻辑谬误！"');

    // 显示谬误卡
    const battle = document.getElementById('panelBattle');
    const fallacies = c.breakPhase.fallacies;
    battle.innerHTML = `
      <div class="battle-title"><span class="bt-icon">🔨</span> 破 · 识别谬误</div>
      <div class="phase-content">
        <div style="font-size:.6rem;color:var(--muted);margin-bottom:.2rem">找出以下陈述中的逻辑错误类型：</div>
        <div class="fallacy-row" id="fallacyRow">
          ${fallacies.map((f, i) => `
            <div class="fallacy-card" id="fc-${i}">
              <span class="fc-type">谬误 ${i+1}</span>
              ${f.text}
            </div>
          `).join('')}
        </div>
        <div style="font-size:.55rem;color:var(--dim);margin-top:.3rem">↓ 从手牌中选择对应的破谬卡，每个谬误对应一种类型</div>
      </div>
    `;

    // 生成手牌（破谬卡）
    breakHand = CourtEngine.generateBreakHand(c);
    renderBreakHand();

    // 设置按钮
    setActionBtn('⚡ 提交破局', () => submitBreakPhase());
  }

  function renderBreakHand() {
    const S = CourtEngine.getState();
    const el = document.getElementById('handCards');
    document.getElementById('handPhase').textContent = '选择破谬卡';
    el.innerHTML = breakHand.map((card, i) => `
      <div class="hand-card t-break ${S.breakSelected.includes(card.id) ? 'selected' : ''}"
           onclick="CourtApp.toggleBreakCard('${card.id}')" id="bk-${i}">
        <span class="hc-badge break">${card.icon} 破谬</span>
        <span class="hc-icon">${card.icon}</span>
        <span class="hc-name">${card.name}</span>
      </div>
    `).join('');
    updateActionBtn();
  }

  function toggleBreakCard(id) {
    const S = CourtEngine.getState();
    const c = CourtEngine.getCase();
    const maxSelect = c.breakPhase.fallacies.length;
    const idx = S.breakSelected.indexOf(id);
    if (idx >= 0) {
      S.breakSelected.splice(idx, 1);
    } else if (S.breakSelected.length < maxSelect) {
      S.breakSelected.push(id);
    }
    renderBreakHand();
  }

  function submitBreakPhase() {
    const S = CourtEngine.getState();
    if (S.breakSelected.length === 0) return;

    const result = CourtEngine.submitBreak(S.breakSelected);
    updateStats();

    // 显示结果
    const battle = document.getElementById('panelBattle');
    const c = CourtEngine.getCase();
    battle.innerHTML = `
      <div class="battle-title"><span class="bt-icon">🔨</span> 破局结果</div>
      <div class="phase-content">
        ${result.results.map(r => `
          <div style="display:flex;align-items:center;gap:.3rem;font-size:.7rem;font-family:var(--ff-c)">
            <span>${r.isCorrect ? '✅' : '❌'}</span>
            <span>${CaseDB.BREAK_CARDS.find(b=>b.id===r.id)?.name || r.id}</span>
          </div>
        `).join('')}
        <div style="margin-top:.3rem;font-size:.65rem;color:var(--dim);font-family:var(--ff-c)">
          ${result.hints.map(h => `<div>💡 ${h}</div>`).join('')}
        </div>
        <div style="font-family:var(--ff-d);font-size:1rem;color:var(--gold);margin-top:.3rem">
          ${result.allCorrect ? '✨ 完美破局！' : ''} +${result.scoreGained}分
        </div>
        <button class="act-btn ${result.allCorrect ? 'success' : 'primary'}" onclick="CourtApp.enterBuild()" style="margin-top:.4rem">
          ⚔️ 进入立论 →
        </button>
      </div>
    `;

    setSpeech(result.allCorrect
      ? '"精彩！谬误全部击破。现在构建你的论证！"'
      : '"还差一些，但庭审继续。请构建论证！"');
    clearHand();
  }

  // ═══ Phase 3: 立 ═══════════════════════════════════
  function enterBuild() {
    const c = CourtEngine.getCase();
    if (!c) return;
    setPhase('build');
    setSpeech('"现在请选出正确的理论武器，填入论点槽中！"');

    buildPool = CourtEngine.generateBuildPool(c);
    const slots = c.buildPhase.slots;
    CourtEngine.getState().buildSelected = new Array(slots.length).fill('');

    const battle = document.getElementById('panelBattle');
    battle.innerHTML = `
      <div class="battle-title"><span class="bt-icon">⚔️</span> 立 · 构建论证</div>
      <div class="phase-content">
        <div class="arg-slots" id="argSlots">
          ${slots.map((s, i) => `
            <div class="arg-slot" id="slot-${i}" onclick="CourtApp.clearSlot(${i})">
              <span class="slot-label">${s.label}</span>
              <span id="slotVal-${i}">?</span>
            </div>
            ${i < slots.length - 1 ? '<span class="slot-arrow">→</span>' : ''}
          `).join('')}
        </div>
        <div style="font-size:.55rem;color:var(--dim);margin-top:.3rem">↓ 从手牌中依次选择填入每个论点槽</div>
      </div>
    `;

    renderBuildHand();
    setActionBtn('⚡ 提交论证', () => submitBuildPhase());
  }

  function renderBuildHand() {
    const S = CourtEngine.getState();
    const el = document.getElementById('handCards');
    document.getElementById('handPhase').textContent = '选择理论卡牌';
    el.innerHTML = buildPool.map((name, i) => {
      const isUsed = S.buildSelected.includes(name);
      return `
        <div class="hand-card t-principle ${isUsed ? 'selected' : ''}"
             onclick="CourtApp.pickBuildCard('${name}')" id="bd-${i}">
          <span class="hc-badge principle">📖 原理</span>
          <span class="hc-icon">📖</span>
          <span class="hc-name">${name}</span>
        </div>
      `;
    }).join('');
    updateActionBtn();
  }

  function pickBuildCard(name) {
    const S = CourtEngine.getState();
    const c = CourtEngine.getCase();
    // 找到第一个空槽
    const emptyIdx = S.buildSelected.indexOf('');
    if (emptyIdx < 0) return;

    S.buildSelected[emptyIdx] = name;
    document.getElementById(`slotVal-${emptyIdx}`).textContent = name;
    document.getElementById(`slot-${emptyIdx}`).classList.add('filled');

    renderBuildHand();
  }

  function clearSlot(idx) {
    const S = CourtEngine.getState();
    if (S.buildSelected[idx]) {
      S.buildSelected[idx] = '';
      document.getElementById(`slotVal-${idx}`).textContent = '?';
      document.getElementById(`slot-${idx}`).classList.remove('filled');
      renderBuildHand();
    }
  }

  function submitBuildPhase() {
    const S = CourtEngine.getState();
    if (S.buildSelected.includes('')) return;

    const result = CourtEngine.submitBuild(S.buildSelected);
    updateStats();

    const battle = document.getElementById('panelBattle');
    battle.innerHTML = `
      <div class="battle-title"><span class="bt-icon">⚔️</span> 立论结果</div>
      <div class="phase-content">
        ${result.results.map(r => `
          <div style="display:flex;align-items:center;gap:.3rem;font-size:.68rem;font-family:var(--ff-c);margin-bottom:.2rem">
            <span>${r.isCorrect ? '✅' : '❌'}</span>
            <span style="color:var(--dim)">${r.slot}：</span>
            <span style="color:${r.isCorrect ? 'var(--emerald)' : 'var(--ruby)'}">${r.picked}</span>
            ${!r.isCorrect ? `<span style="color:var(--dim);font-size:.55rem">→ 应为「${r.expected}」</span>` : ''}
          </div>
          <div style="font-size:.55rem;color:var(--muted);margin-left:1.2rem;margin-bottom:.3rem">${r.desc}</div>
        `).join('')}
        <div style="font-family:var(--ff-d);font-size:1rem;color:var(--gold);margin-top:.3rem">
          ${result.allCorrect ? '✨ 论证完美！' : ''} +${result.scoreGained}分
        </div>
        <button class="act-btn ${result.allCorrect ? 'success' : 'primary'}" onclick="CourtApp.enterChain()" style="margin-top:.3rem">
          🔗 构建论证链 →
        </button>
      </div>
    `;

    setSpeech(result.allCorrect
      ? '"论证严密！最后一步：完成论证链。"'
      : '"有瑕疵，但继续。完成论证链！"');
    clearHand();
  }

  // ═══ Phase 4: 论证链 ═══════════════════════════════
  function enterChain() {
    const c = CourtEngine.getCase();
    if (!c) return;
    setPhase('chain');
    setSpeech('"最后一步：用关键词构建完整论证链！"');

    const chain = c.chainPhase;
    CourtEngine.getState().chainSelected = [];

    const battle = document.getElementById('panelBattle');
    battle.innerHTML = `
      <div class="battle-title"><span class="bt-icon">🔗</span> 论证链 · ${chain.prompt}</div>
      <div class="phase-content">
        <div class="chain-row" id="chainRow">
          ${chain.correct.map((_, i) => `
            <div class="chain-slot" id="cs-${i}">___</div>
            ${i < chain.correct.length - 1 ? '<span class="chain-arrow">→</span>' : ''}
          `).join('')}
        </div>
        <div class="chain-options" id="chainOpts">
          ${CaseDB.shuffle([...chain.options]).map(opt => `
            <button class="chain-chip" onclick="CourtApp.pickChain('${opt.replace(/'/g, "\\'")}')">${opt}</button>
          `).join('')}
        </div>
      </div>
    `;
    clearHand();
    setActionBtn('⚡ 提交论证链', () => submitChainPhase());
  }

  function pickChain(keyword) {
    const S = CourtEngine.getState();
    const c = CourtEngine.getCase();
    const idx = S.chainSelected.length;
    if (idx >= c.chainPhase.correct.length) return;

    S.chainSelected.push(keyword);
    document.getElementById(`cs-${idx}`).textContent = keyword;
    document.getElementById(`cs-${idx}`).classList.add('filled');

    // Mark chip as used
    document.querySelectorAll('.chain-chip').forEach(ch => {
      if (ch.textContent === keyword) ch.classList.add('used');
    });
    updateActionBtn();
  }

  function submitChainPhase() {
    const S = CourtEngine.getState();
    const c = CourtEngine.getCase();
    if (S.chainSelected.length < c.chainPhase.correct.length) return;

    const result = CourtEngine.submitChain(S.chainSelected);
    updateStats();

    // Show results on chain slots
    result.results.forEach((r, i) => {
      const el = document.getElementById(`cs-${i}`);
      el.classList.add(r.isCorrect ? 'correct' : 'wrong');
      if (!r.isCorrect) el.title = `应为: ${r.expected}`;
    });

    // Mark correct/wrong chips
    document.querySelectorAll('.chain-chip').forEach(ch => {
      if (c.chainPhase.correct.includes(ch.textContent)) ch.classList.add('correct');
    });

    // Add verdict button
    const battle = document.getElementById('panelBattle');
    battle.innerHTML += `
      <div style="text-align:center;margin-top:.5rem">
        <div style="font-family:var(--ff-d);font-size:1.1rem;color:var(--gold)">
          ${result.allCorrect ? '🏆 完美论证链！' : ''} +${result.scoreGained}分
        </div>
        <button class="act-btn ${result.allCorrect ? 'success' : 'primary'}" onclick="CourtApp.enterCloze()" style="margin-top:.3rem">
          📝 完形填空 →
        </button>
      </div>
    `;

    setSpeech(result.allCorrect
      ? '"此一局，无懈可击！乃一流论辩！"'
      : '"尚有不足，但已展现潜力。"');
  }

  // ═══ Phase 5: 完形填空 Bonus ═════════════════════════
  function enterCloze() {
    const c = CourtEngine.getCase();
    if (!c || !c.clozePhase) { showVerdict(); return; }
    setPhase('cloze');
    setSpeech('"最后一关！填入正确的关键词，完成论证降书！"');

    const cloze = c.clozePhase;
    CourtEngine.getState().clozeSelected = new Array(cloze.blanks.length).fill('');

    // 渲染文章 + 空格
    let passageHtml = cloze.passage;
    cloze.blanks.forEach((_, i) => {
      passageHtml = passageHtml.replace(
        `___①②③④⑤⑥⑦⑧⑨`[i] ? `___${'①②③④⑤⑥⑦⑧⑨'[i]}___` : `___${i+1}___`,
        `<span class="cloze-blank" id="cb-${i}" onclick="CourtApp.clearCloze(${i})">①②③④⑤⑥⑦⑧⑨'[i] || (i+1)</span>`
      );
    });
    // Fix: use proper unicode circles
    const circles = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨'];
    passageHtml = cloze.passage;
    cloze.blanks.forEach((_, i) => {
      passageHtml = passageHtml.replace(
        `___${circles[i]}___`,
        `<span class="cloze-blank" id="cb-${i}" onclick="CourtApp.clearCloze(${i})">${circles[i]}</span>`
      );
    });

    // 打乱选项
    const allOpts = CaseDB.shuffle([...cloze.blanks, ...cloze.distractors]);

    const battle = document.getElementById('panelBattle');
    battle.innerHTML = `
      <div class="battle-title"><span class="bt-icon">📝</span> 完形填空 · 论证降书</div>
      <div class="phase-content">
        <div class="cloze-passage">${passageHtml}</div>
        <div style="font-size:.55rem;color:var(--dim);margin-top:.2rem">↓ 选择正确的词语填入空格</div>
        <div class="cloze-options" id="clozeOpts">
          ${allOpts.map(opt => `
            <button class="cloze-opt" onclick="CourtApp.pickCloze('${opt.replace(/'/g, "\\'")}')"
              data-word="${opt}">${opt}</button>
          `).join('')}
        </div>
      </div>
    `;
    clearHand();
    setActionBtn('⭐ 提交完形填空', () => submitCloze());
  }

  function pickCloze(word) {
    const S = CourtEngine.getState();
    const c = CourtEngine.getCase();
    if (!c?.clozePhase) return;
    const idx = S.clozeSelected.indexOf('');
    if (idx < 0) return;

    S.clozeSelected[idx] = word;
    const el = document.getElementById(`cb-${idx}`);
    if (el) { el.textContent = word; el.classList.add('filled'); }

    // Mark option as used
    document.querySelectorAll('.cloze-opt').forEach(opt => {
      if (opt.dataset.word === word) opt.classList.add('used');
    });
    updateActionBtn();
  }

  function clearCloze(idx) {
    const S = CourtEngine.getState();
    const circles = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨'];
    if (S.clozeSelected[idx]) {
      const word = S.clozeSelected[idx];
      S.clozeSelected[idx] = '';
      const el = document.getElementById(`cb-${idx}`);
      if (el) { el.textContent = circles[idx]; el.classList.remove('filled'); }
      document.querySelectorAll('.cloze-opt').forEach(opt => {
        if (opt.dataset.word === word) opt.classList.remove('used');
      });
      updateActionBtn();
    }
  }

  function submitCloze() {
    const S = CourtEngine.getState();
    const c = CourtEngine.getCase();
    if (!c?.clozePhase) return;
    if (S.clozeSelected.includes('')) return;

    const blanks = c.clozePhase.blanks;
    let matched = 0;
    blanks.forEach((correct, i) => {
      const el = document.getElementById(`cb-${i}`);
      if (S.clozeSelected[i] === correct) {
        matched++;
        if (el) el.classList.add('correct');
      } else {
        if (el) { el.classList.add('wrong'); el.title = `应为: ${correct}`; }
      }
    });

    // Mark correct options
    document.querySelectorAll('.cloze-opt').forEach(opt => {
      if (blanks.includes(opt.dataset.word)) opt.classList.add('correct');
    });

    const allCorrect = matched === blanks.length;
    const scoreGained = allCorrect ? 60 : matched * 12;
    S.score = (S.score || 0) + scoreGained;
    if (allCorrect) { S.combo = (S.combo || 0) + 1; S.maxCombo = Math.max(S.maxCombo || 0, S.combo); }
    else { S.combo = 0; }
    updateStats();

    const battle = document.getElementById('panelBattle');
    battle.innerHTML += `
      <div style="text-align:center;margin-top:.4rem">
        <div style="font-family:var(--ff-d);font-size:1.1rem;color:var(--gold)">
          ${allCorrect ? '🏆 完形天衍！' : `${matched}/${blanks.length} 正确`} +${scoreGained}分
        </div>
        <button class="act-btn ${allCorrect ? 'success' : 'primary'}" onclick="CourtApp.showVerdict()" style="margin-top:.3rem">
          ⚖️ 宣判 →
        </button>
      </div>
    `;

    setSpeech(allCorrect
      ? '"完美降书！法理大储！"'
      : '"还有缺漏，但已走完全程。"');
  }

  // ═══ 判决 + 下一案 ═══════════════════════════════════
  function showVerdict() {
    const S = CourtEngine.getState();
    const judgeArea = document.getElementById('judgeVerdictArea');
    judgeArea.innerHTML = `
      <button class="act-btn primary" onclick="CourtApp.nextCase()" style="width:100%;margin-top:.3rem">
        ${S.caseIndex + 1 >= S.totalCases ? '📊 最终结算' : '📋 下一案件 →'}
      </button>
    `;
    setSpeech('"案件审结。下一案！"');
  }

  function nextCase() {
    document.getElementById('judgeVerdictArea').innerHTML = '';
    const result = CourtEngine.nextCase();
    if (result.finished) {
      showResults();
    } else {
      loadCase();
    }
  }

  // ═══ 结算 ═══════════════════════════════════════════
  function showResults() {
    const stats = CourtEngine.getFinalStats();
    show('resultScreen');
    document.getElementById('rGrade').textContent = stats.grade;
    document.getElementById('rTitle').textContent = stats.title;
    document.getElementById('rScore').textContent = stats.score;
    document.getElementById('rBreak').textContent = stats.breakSuccess;
    document.getElementById('rBuild').textContent = stats.buildSuccess;
    document.getElementById('rChain').textContent = stats.chainSuccess;
    document.getElementById('rCombo').textContent = stats.maxCombo;
    document.getElementById('rHp').textContent = stats.playerHp + '/6';
  }

  // ═══ UI 工具 ═══════════════════════════════════════
  function updateStats() {
    const S = CourtEngine.getState();
    document.getElementById('comboVal').textContent = S.combo;
    document.getElementById('scoreVal').textContent = S.score;
    document.getElementById('playerHp').style.width = (S.playerHp / 6 * 100) + '%';
    document.getElementById('judgeHp').style.width = (S.judgeHp / 6 * 100) + '%';
    document.getElementById('playerHpN').textContent = S.playerHp;
    document.getElementById('judgeHpN').textContent = S.judgeHp;
  }

  function setPhase(phase) {
    document.querySelectorAll('.pi-step').forEach(el => {
      el.classList.remove('active','done');
      const p = el.dataset.phase;
      const order = ['read','break','build','chain'];
      if (order.indexOf(p) < order.indexOf(phase)) el.classList.add('done');
      if (p === phase) el.classList.add('active');
    });
  }

  function setSpeech(text) {
    document.getElementById('judgeSpeech').textContent = text;
  }

  function setActionBtn(text, handler) {
    const btn = document.getElementById('btnAction');
    btn.textContent = text;
    btn.onclick = handler;
    btn.disabled = false;
  }

  function updateActionBtn() {
    const S = CourtEngine.getState();
    const btn = document.getElementById('btnAction');
    if (S.phase === 'break') {
      btn.disabled = S.breakSelected.length === 0;
    } else if (S.phase === 'build') {
      btn.disabled = S.buildSelected.includes('');
    } else if (S.phase === 'chain') {
      const c = CourtEngine.getCase();
      btn.disabled = S.chainSelected.length < (c?.chainPhase.correct.length || 3);
    } else if (S.phase === 'cloze') {
      const c = CourtEngine.getCase();
      btn.disabled = S.clozeSelected?.includes('') ?? true;
    }
  }

  function clearHand() {
    document.getElementById('handCards').innerHTML =
      '<div style="color:var(--muted);font-size:.6rem;padding:.5rem">—</div>';
    document.getElementById('handPhase').textContent = '';
  }

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
  }

  function restart() { startTrial(); }
  function backToMenu() { show('startScreen'); }

  return { startTrial, enterBreak, enterBuild, enterChain, enterCloze,
           toggleBreakCard, pickBuildCard, clearSlot, pickChain,
           pickCloze, clearCloze,
           showVerdict, nextCase, restart, backToMenu };
})();
