/**
 * 刺激战场 · 主控制器
 * ========================================
 * 地图选择 → 跳伞 → 战斗 → 空投 → 结算
 */
const BG = (() => {
  let selectedMap = null;
  let selectedOpt = -1;
  let minimapAnim = null;

  function init() {
    // Map card selection
    document.querySelectorAll('.map-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.map-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedMap = card.dataset.map;
        document.getElementById('btnJump').disabled = false;
      });
    });
    document.getElementById('btnJump').addEventListener('click', () => {
      if (selectedMap) enterParachute();
    });
  }

  // ═══ SCREEN MANAGEMENT ═══
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
  }

  // ═══ PARACHUTE ═══
  function enterParachute() {
    const map = BGData.getMap(selectedMap);
    if (!map) return;
    show('paraScreen');
    document.getElementById('paraMapName').textContent = `${map.icon} ${map.name} · 空降中...`;
    document.getElementById('paraCount').textContent = `剩余 ${map.questions.length}/${map.questions.length}`;

    // Set background
    const paraBg = document.getElementById('paraBg');
    paraBg.style.background = map.bgColor;
  }

  function selectZone(zone) {
    // Init engine
    BGEngine.init(selectedMap, zone);
    // Landing animation
    const paraBg = document.getElementById('paraBg');
    paraBg.style.animation = 'none';
    paraBg.offsetHeight; // reflow
    paraBg.style.animation = 'paraZoom 1.5s ease-in forwards';
    paraBg.style.transform = 'scale(2)';

    setTimeout(() => enterBattle(), 1200);
  }

  // ═══ BATTLE ═══
  function enterBattle() {
    show('battleScreen');
    const S = BGEngine.getState();

    // Set battle background
    document.getElementById('battleBg').style.background = S.map.bgColor;

    // Add poison overlay element
    let poisonOverlay = document.querySelector('.battle-poison-overlay');
    if (!poisonOverlay) {
      poisonOverlay = document.createElement('div');
      poisonOverlay.className = 'battle-poison-overlay';
      document.getElementById('battleScreen').appendChild(poisonOverlay);
    }

    // Update kill total
    document.getElementById('killTotal').textContent = S.totalEnemies;

    // Start timers
    BGEngine.startTimers(onTick, onPoisonDamage);

    // Start minimap rendering
    startMinimap();

    // Load first question
    loadQuestion();
    updateHUD();
  }

  function loadQuestion() {
    const S = BGEngine.getState();
    const q = BGEngine.getCurrentQuestion();
    if (!q) return;

    selectedOpt = -1;
    document.getElementById('fireBtn').disabled = true;

    // Enemy
    const level = Math.min(5, Math.floor(S.current / (S.totalEnemies / 5)) + 1);
    document.getElementById('enemyName').textContent = `假人兵 · Lv.${level}`;
    document.getElementById('enemyHpFill').style.width = '100%';

    // Reset enemy animation
    const fig = document.getElementById('enemyBody');
    fig.style.display = 'flex';
    const enemyFig = document.getElementById('enemyBody').querySelector('.enemy-figure');
    enemyFig.className = 'enemy-figure';
    enemyFig.textContent = S.map.enemyEmoji;

    // Question
    document.getElementById('qStem').textContent = q.stem;
    const optsDiv = document.getElementById('qOptions');
    optsDiv.innerHTML = q.opts.map((o, i) =>
      `<button class="q-opt" data-idx="${i}" onclick="BG.selectOption(${i})">${o}</button>`
    ).join('');

    // Reveal if scroll active
    if (S.revealNext) {
      S.revealNext = false;
      setTimeout(() => {
        optsDiv.children[q.ans].classList.add('reveal');
      }, 500);
    }
  }

  function selectOption(idx) {
    selectedOpt = idx;
    document.querySelectorAll('.q-opt').forEach((o, i) => {
      o.classList.toggle('selected', i === idx);
    });
    document.getElementById('fireBtn').disabled = false;
  }

  function fire() {
    if (selectedOpt < 0) return;
    const result = BGEngine.answer(selectedOpt);
    if (!result) return;

    const opts = document.querySelectorAll('.q-opt');

    if (result.correct) {
      // Correct: kill animation
      opts[selectedOpt].classList.add('correct');
      const enemyFig = document.querySelector('.enemy-figure');
      enemyFig.classList.add('hit');

      // Float score
      showFloatScore(`+${result.scoreGained}`, false);

      // Vibrate
      if (navigator.vibrate) navigator.vibrate(50);

      // Combo display
      if (result.comboTitle) showCombo(result.comboTitle);

      // Sound feedback placeholder
      // TODO: add audio

      setTimeout(() => {
        if (result.finished) {
          setTimeout(() => showResult(result), 500);
        } else if (result.airdrop) {
          triggerAirdrop();
        } else {
          loadQuestion();
        }
        updateHUD();
      }, 800);
    } else {
      // Wrong: hit feedback
      opts[selectedOpt].classList.add('wrong');
      opts[result.correctAns].classList.add('correct');
      const enemyFig = document.querySelector('.enemy-figure');
      enemyFig.classList.add('dodge');

      // Red flash
      const flash = document.createElement('div');
      flash.className = 'hit-flash';
      document.getElementById('battleScreen').appendChild(flash);
      setTimeout(() => flash.remove(), 500);

      showFloatScore(`-${result.damage}❤️`, true);

      // Vibrate longer
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      setTimeout(() => {
        if (result.finished) {
          setTimeout(() => showResult(result), 500);
        } else {
          loadQuestion();
        }
        updateHUD();
      }, 1500);
    }
  }

  // ═══ HUD UPDATES ═══
  function updateHUD() {
    const S = BGEngine.getState();
    if (!S) return;

    // HP
    const hpFill = document.getElementById('hpFill');
    hpFill.style.width = `${S.hp}%`;
    hpFill.className = `hp-fill${S.hp <= 30 ? ' danger' : ''}`;
    document.getElementById('hpText').textContent = `${Math.round(S.hp)}%`;

    // Score & kills
    document.getElementById('scoreVal').textContent = S.score;
    document.getElementById('killCount').innerHTML = `💀 ${S.kills}/<span id="killTotal">${S.totalEnemies}</span>`;

    // Hints
    document.getElementById('hintCount').textContent = S.hints;
  }

  function onTick(S) {
    // Timer display
    const mins = Math.floor(S.timeLeft / 60);
    const secs = S.timeLeft % 60;
    const timerEl = document.getElementById('hudTimer');
    timerEl.textContent = `⏱ ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    timerEl.className = `hud-timer${S.timeLeft <= 30 ? ' danger' : ''}`;

    // Minimap label
    document.getElementById('minimapLabel').textContent =
      S.poisonPhase > 0 ? `毒圈${S.poisonPhase}阶 ${S.poisonDps}%/s` : `毒圈 ${mins}:${String(secs).padStart(2,'0')}`;

    // Poison warning
    const warn = document.getElementById('poisonWarn');
    warn.classList.toggle('hidden', !S.inPoison);

    // Poison overlay
    const overlay = document.querySelector('.battle-poison-overlay');
    if (overlay) overlay.classList.toggle('active', S.inPoison);

    updateHUD();

    // Time up
    if (S.timeLeft <= 0 && !S.finished) {
      showResult({ finished: true, won: S.kills >= S.totalEnemies });
    }
  }

  function onPoisonDamage(S) {
    // Flash border purple
    const flash = document.createElement('div');
    flash.className = 'hit-flash';
    flash.style.background = 'radial-gradient(ellipse,transparent 50%,rgba(168,85,247,.2))';
    document.getElementById('battleScreen').appendChild(flash);
    setTimeout(() => flash.remove(), 400);
    updateHUD();

    if (S.hp <= 0) {
      showResult({ finished: true, won: false });
    }
  }

  // ═══ MINIMAP ═══
  function startMinimap() {
    const canvas = document.getElementById('minimap');
    function renderLoop() {
      BGEngine.drawMinimap(canvas);
      minimapAnim = requestAnimationFrame(renderLoop);
    }
    renderLoop();
  }

  function stopMinimap() {
    if (minimapAnim) cancelAnimationFrame(minimapAnim);
  }

  // ═══ EFFECTS ═══
  function showFloatScore(text, negative) {
    const el = document.getElementById('floatScore');
    el.textContent = text;
    el.className = `float-score${negative ? ' negative' : ''}`;
    el.classList.remove('hidden');
    // Reset animation
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'floatUp 1s ease-out forwards';
    setTimeout(() => el.classList.add('hidden'), 1000);
  }

  function showCombo(title) {
    const el = document.getElementById('comboDisplay');
    document.getElementById('comboText').textContent = title;
    el.classList.remove('hidden');
    const textEl = document.getElementById('comboText');
    textEl.style.animation = 'none';
    textEl.offsetHeight;
    textEl.style.animation = 'comboIn .6s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(() => el.classList.add('hidden'), 1500);
  }

  // ═══ AIRDROP ═══
  function triggerAirdrop() {
    const notify = document.getElementById('airdropNotify');
    notify.classList.remove('hidden');
    document.getElementById('airdropText').textContent = '空投物资！点击拾取';
  }

  function openAirdrop() {
    document.getElementById('airdropNotify').classList.add('hidden');
    show('airdropScreen');
    stopMinimap();

    const items = BGData.rollAirdrop();
    const container = document.getElementById('adItems');
    container.innerHTML = items.map((item, i) =>
      `<button class="ad-item" onclick="BG.pickAirdrop(${i})" data-idx="${i}">
        <span class="ad-item-icon">${item.icon}</span>
        <div>
          <div class="ad-item-name">${item.name}</div>
          <div class="ad-item-desc">${item.desc}</div>
        </div>
      </button>`
    ).join('');

    // Store items for picking
    container._items = items;
  }

  function pickAirdrop(idx) {
    const container = document.getElementById('adItems');
    const items = container._items;
    if (!items || !items[idx]) return;

    // Apply effect
    BGEngine.applyAirdrop(items[idx]);

    // Visual feedback
    document.querySelectorAll('.ad-item').forEach((el, i) => {
      if (i === idx) el.classList.add('picked');
      else el.style.opacity = '0.3';
    });

    setTimeout(() => closeAirdrop(), 800);
  }

  function closeAirdrop() {
    show('battleScreen');
    startMinimap();
    loadQuestion();
    updateHUD();
  }

  // ═══ HINT ═══
  function useHint() {
    const hint = BGEngine.useHint();
    if (!hint) return;
    updateHUD();

    // Show hint as toast
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      z-index:50;padding:.6rem 1.2rem;background:rgba(6,182,212,.15);
      border:1px solid rgba(6,182,212,.5);border-radius:10px;
      font-size:.8rem;color:#22d3ee;backdrop-filter:blur(8px);
      animation:floatUp 2.5s ease-out forwards;pointer-events:none`;
    toast.textContent = `💡 ${hint}`;
    document.getElementById('battleScreen').appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // ═══ RESULT ═══
  function showResult(result) {
    // Capture state BEFORE destroying
    const S = BGEngine.getState() || {
      kills:0, totalEnemies:1, score:0, maxCombo:0, hp:0
    };
    const { grade, qi } = BGEngine.getGrade();
    const elapsed = BGEngine.getElapsed();

    BGEngine.destroy();
    stopMinimap();

    show('resultScreen');
    const won = result?.won || false;

    const card = document.querySelector('.result-card');
    card.classList.toggle('dead', !won);

    document.getElementById('resultIcon').textContent = won ? '🏆' : '💀';
    document.getElementById('resultTitle').textContent = won
      ? '大吉大利！今晚吃鸡！' : '落地成盒...';

    document.getElementById('rKills').textContent = `${S.kills}/${S.totalEnemies}`;
    document.getElementById('rScore').textContent = S.score;
    document.getElementById('rCombo').textContent = S.maxCombo;
    const m = Math.floor(elapsed/60), s = elapsed%60;
    document.getElementById('rTime').textContent = `${m}:${String(s).padStart(2,'0')}`;
    document.getElementById('rHp').textContent = `${Math.round(S.hp)}%`;
    document.getElementById('rQi').textContent = `+${qi}`;
  }

  function restart() {
    BGEngine.destroy();
    stopMinimap();
    enterParachute();
  }

  function backToMap() {
    BGEngine.destroy();
    stopMinimap();
    selectedMap = null;
    document.querySelectorAll('.map-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('btnJump').disabled = true;
    show('mapScreen');
  }

  // ═══ INIT ═══
  document.addEventListener('DOMContentLoaded', init);

  return { selectZone, selectOption, fire, useHint,
           openAirdrop, pickAirdrop, closeAirdrop,
           restart, backToMap };
})();
