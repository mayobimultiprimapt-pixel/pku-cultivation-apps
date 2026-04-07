/**
 * 刺激战场 · v2.0 沉浸版主控制器
 * ========================================
 * 地图选择 → 跳伞 → 搜索/奔跑 → 遭遇敌人 → 答题击杀 → 搜刮 → 空投 → 决赛圈 → 吃鸡
 */
const BG = (() => {
  let selectedMap = null;
  let selectedOpt = -1;
  let minimapAnim = null;
  let aliveCount = 100;
  let aliveInterval = null;

  // AI player name pool
  const AI_NAMES = ['阿强','小明','大壮','铁柱','翠花','建国','秀芬','志强','美丽','国庆',
    'Bot_Alpha','xXx_Killer','ProGamer','冷锋','狙击手','王者','学霸','考研上岸','背锅侠',
    '摆烂大师','卷王','保研仔','图书馆幽灵','绩点战神','食堂杀手','逃课大师',
    'DeepSeek-R1','Claude-4','GPT-4o','Gemini-2.5','暴力破解','遗忘曲线'];

  const WEAPONS = {
    politics: {icon:'📜', name:'政策文件', ammo:'∞'},
    english:  {icon:'📖', name:'外刊精读', ammo:'∞'},
    math:     {icon:'📐', name:'公式推导', ammo:'∞'},
    cs:       {icon:'💻', name:'代码编译', ammo:'∞'}
  };

  const LOOT_TABLE = [
    {icon:'💊', text:'急救包 +10HP', effect:'hp', val:10, weight:30},
    {icon:'🛡️', text:'防弹衣 +5HP', effect:'hp', val:5, weight:25},
    {icon:'⏱️', text:'肾上腺素 +15秒', effect:'time', val:15, weight:20},
    {icon:'💡', text:'战术手册 +1提示', effect:'hint', val:1, weight:15},
    {icon:'🔥', text:'兴奋剂 下题×2', effect:'double', val:1, weight:10},
  ];

  function init() {
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

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
  }

  // ═══ PARACHUTE ═══
  function enterParachute() {
    const map = BGData.getMap(selectedMap);
    if (!map) return;
    show('paraScreen');
    aliveCount = 100;
    document.getElementById('paraMapName').textContent = `${map.icon} ${map.name} · 空降中...`;
    document.getElementById('paraAlive').textContent = `存活 100/100`;
    const paraBg = document.getElementById('paraBg');
    if (map.bgImage) {
      paraBg.style.background = `url('${map.bgImage}') center/cover no-repeat`;
    } else {
      paraBg.style.background = map.bgColor;
    }
  }

  function selectZone(zone) {
    BGEngine.init(selectedMap, zone);
    const paraBg = document.getElementById('paraBg');
    paraBg.style.animation = 'none';
    paraBg.offsetHeight;
    paraBg.style.animation = 'paraZoom 1.5s ease-in forwards';
    paraBg.style.transform = 'scale(2)';
    setTimeout(() => enterBattle(), 1200);
  }

  // ═══ BATTLE ═══
  function enterBattle() {
    show('battleScreen');
    const S = BGEngine.getState();

    const bg = document.getElementById('battleBg');
    if (S.map.bgImage) {
      bg.style.background = `url('${S.map.bgImage}') center/cover no-repeat`;
      bg.style.opacity = '0.5';
    } else {
      bg.style.background = S.map.bgColor;
    }

    // Weapon
    const wp = WEAPONS[selectedMap] || WEAPONS.cs;
    document.getElementById('weaponDisplay').querySelector('.weapon-icon').textContent = wp.icon;
    document.getElementById('weaponName').textContent = wp.name;
    document.getElementById('weaponAmmo').textContent = wp.ammo;

    document.getElementById('killTotal').textContent = S.totalEnemies;
    document.getElementById('killFeed').innerHTML = '';
    document.getElementById('hudAlive').textContent = `🟢 存活 ${aliveCount}`;

    BGEngine.startTimers(onTick, onPoisonDamage);
    startMinimap();
    startAliveSimulation();

    // Start with running phase
    startRunPhase();
    updateHUD();
  }

  // ═══ IMMERSIVE BATTLE LOOP ═══
  // Phase 1: Running/Searching (1.5s auto) → Phase 2: Encounter alert → Phase 3: Question → Phase 4: Loot
  function startRunPhase() {
    const S = BGEngine.getState();
    if (!S || S.finished) return;

    // Hide question card + enemy
    document.getElementById('questionCard').classList.add('hidden');
    document.getElementById('enemyWrap').style.display = 'none';
    document.getElementById('encounterAlert').classList.add('hidden');
    document.getElementById('crosshair').classList.remove('aiming');

    // Show running overlay
    const runOvl = document.getElementById('runOverlay');
    runOvl.classList.remove('hidden');

    // Running text varies
    const runTexts = ['🏃 搜索物资中...', '🏃 前进中...', '🏃 警戒搜索...', '🏃 转移中...', '🏃 跑毒中...'];
    document.getElementById('runText').textContent = runTexts[Math.floor(Math.random() * runTexts.length)];

    // Terrain scrolls faster during running
    document.getElementById('battleTerrain').style.animationDuration = '1.5s';

    // Auto-generate kill feed during run
    if (Math.random() > 0.4) addKillFeedAI();

    // After 1.5s → encounter
    setTimeout(() => encounterPhase(), 1200 + Math.random() * 800);
  }

  function encounterPhase() {
    const S = BGEngine.getState();
    if (!S || S.finished) return;

    // Hide run overlay
    document.getElementById('runOverlay').classList.add('hidden');
    document.getElementById('battleTerrain').style.animationDuration = '4s';

    // Show encounter alert
    const alert = document.getElementById('encounterAlert');
    alert.classList.remove('hidden');

    // Show enemy approaching
    const enemyWrap = document.getElementById('enemyWrap');
    enemyWrap.style.display = 'block';
    enemyWrap.classList.remove('approaching');
    enemyWrap.offsetHeight;
    enemyWrap.classList.add('approaching');

    // Enemy info
    const level = Math.min(5, Math.floor(S.current / Math.max(1, S.totalEnemies / 5)) + 1);
    const enemyNames = ['假人兵','机器人','AI刷手','背题侠','押题王'];
    document.getElementById('enemyName').textContent = `${enemyNames[Math.min(level-1,4)]} · Lv.${level}`;
    document.getElementById('enemyHpFill').style.width = '100%';

    const fig = document.getElementById('enemyFigure');
    fig.className = 'enemy-figure';
    fig.textContent = S.map.enemyEmoji;

    // Crosshair aims
    document.getElementById('crosshair').classList.add('aiming');

    // After 600ms → show question card
    setTimeout(() => {
      alert.classList.add('hidden');
      showQuestionCard();
    }, 600);
  }

  function showQuestionCard() {
    const S = BGEngine.getState();
    const q = BGEngine.getCurrentQuestion();
    if (!q) return;

    selectedOpt = -1;
    document.getElementById('fireBtn').disabled = true;

    // Question card
    const card = document.getElementById('questionCard');
    card.classList.remove('hidden');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'cardSlideUp .3s ease-out';

    document.getElementById('qNum').textContent = `#${S.current + 1}/${S.totalEnemies}`;
    document.getElementById('qKp').textContent = q.kp || q.hint || '';
    document.getElementById('qStem').textContent = q.stem;

    const optsDiv = document.getElementById('qOptions');
    optsDiv.innerHTML = q.opts.map((o, i) =>
      `<button class="q-opt" data-idx="${i}" onclick="BG.selectOption(${i})">${o}</button>`
    ).join('');

    // Reveal if scroll active
    if (S.revealNext) {
      S.revealNext = false;
      setTimeout(() => {
        if (optsDiv.children[q.ans]) optsDiv.children[q.ans].classList.add('reveal');
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
      // ─── KILL ───
      opts[selectedOpt].classList.add('correct');

      // Enemy hit animation
      const fig = document.getElementById('enemyFigure');
      fig.classList.add('hit');

      // Screen shake
      document.getElementById('battleScreen').classList.add('shake');
      setTimeout(() => document.getElementById('battleScreen').classList.remove('shake'), 300);

      showFloatScore(`+${result.scoreGained}`, false);
      if (navigator.vibrate) navigator.vibrate(50);

      // Combo display
      if (result.comboTitle) showCombo(result.comboTitle);

      // Kill feed (self)
      addKillFeedSelf();

      // Decrease alive
      aliveCount = Math.max(1, aliveCount - 1);
      document.getElementById('hudAlive').textContent = `🟢 存活 ${aliveCount}`;

      // After animation → loot → next
      setTimeout(() => {
        if (result.finished) {
          setTimeout(() => showResult(result), 400);
        } else if (result.airdrop) {
          triggerAirdrop();
        } else {
          showLootPopup();
          setTimeout(() => startRunPhase(), 1000);
        }
        updateHUD();
      }, 700);

    } else {
      // ─── MISS ───
      opts[selectedOpt].classList.add('wrong');
      opts[result.correctAns].classList.add('correct');

      const fig = document.getElementById('enemyFigure');
      fig.classList.add('dodge');

      // Red flash
      const flash = document.getElementById('dmgFlash');
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 400);

      // Screen shake
      document.getElementById('battleScreen').classList.add('shake');
      setTimeout(() => document.getElementById('battleScreen').classList.remove('shake'), 300);

      showFloatScore(`-${result.damage}❤️`, true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      setTimeout(() => {
        if (result.finished) {
          setTimeout(() => showResult(result), 400);
        } else {
          startRunPhase();
        }
        updateHUD();
      }, 1200);
    }
  }

  // ═══ LOOT POPUP ═══
  function showLootPopup() {
    // 60% chance to find loot
    if (Math.random() > 0.6) return;

    const pool = [];
    LOOT_TABLE.forEach(l => { for(let i=0;i<l.weight;i++) pool.push(l); });
    const loot = pool[Math.floor(Math.random() * pool.length)];

    const S = BGEngine.getState();
    if (!S) return;

    // Apply effect
    switch(loot.effect) {
      case 'hp': S.hp = Math.min(S.maxHp || 100, S.hp + loot.val); break;
      case 'time': S.timeLeft = Math.min(S.timeLeft + loot.val, S.totalTime); break;
      case 'hint': S.hints += loot.val; break;
      case 'double': S.doubleScoreCount = (S.doubleScoreCount||0) + loot.val; break;
    }

    const popup = document.getElementById('lootPopup');
    document.getElementById('lootItem').textContent = `${loot.icon} ${loot.text}`;
    popup.classList.remove('hidden');
    popup.style.animation = 'none';
    popup.offsetHeight;
    popup.style.animation = 'lootPop .3s ease-out';
    setTimeout(() => popup.classList.add('hidden'), 800);
  }

  // ═══ KILL FEED ═══
  function addKillFeedSelf() {
    const S = BGEngine.getState();
    const feed = document.getElementById('killFeed');
    const enemy = document.getElementById('enemyName').textContent;
    const wp = WEAPONS[selectedMap] || WEAPONS.cs;
    const item = document.createElement('div');
    item.className = 'kf-item self';
    item.textContent = `你 [${wp.name}] 击杀了 ${enemy}`;
    feed.insertBefore(item, feed.firstChild);
    // Keep max 5 items
    while (feed.children.length > 5) feed.removeChild(feed.lastChild);
    setTimeout(() => item.remove(), 6000);
  }

  function addKillFeedAI() {
    const feed = document.getElementById('killFeed');
    const n1 = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
    let n2 = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
    while (n2 === n1) n2 = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
    const weapons = ['M416','AKM','UMP45','Kar98k','M24','S12K','AWM','GROZA'];
    const wp = weapons[Math.floor(Math.random() * weapons.length)];
    const item = document.createElement('div');
    item.className = 'kf-item';
    item.textContent = `${n1} [${wp}] 淘汰了 ${n2}`;
    feed.insertBefore(item, feed.firstChild);
    while (feed.children.length > 5) feed.removeChild(feed.lastChild);
    setTimeout(() => item.remove(), 5000);
  }

  // ═══ ALIVE SIMULATION ═══
  function startAliveSimulation() {
    aliveInterval = setInterval(() => {
      const S = BGEngine.getState();
      if (!S || S.finished) { clearInterval(aliveInterval); return; }
      if (aliveCount > 10 && Math.random() > 0.5) {
        aliveCount = Math.max(2, aliveCount - Math.floor(Math.random() * 3 + 1));
        document.getElementById('hudAlive').textContent = `🟢 存活 ${aliveCount}`;
        if (Math.random() > 0.6) addKillFeedAI();
      }
    }, 4000);
  }

  // ═══ HUD UPDATES ═══
  function updateHUD() {
    const S = BGEngine.getState();
    if (!S) return;

    const hpFill = document.getElementById('hpFill');
    hpFill.style.width = `${S.hp}%`;
    hpFill.className = `hp-fill${S.hp <= 30 ? ' danger' : ''}`;
    document.getElementById('hpText').textContent = `${Math.round(S.hp)}%`;

    document.getElementById('scoreVal').textContent = S.score;
    document.getElementById('killCount').innerHTML = `💀 ${S.kills}/<span id="killTotal">${S.totalEnemies}</span>`;
    document.getElementById('hintCount').textContent = S.hints;
  }

  function onTick(S) {
    const mins = Math.floor(S.timeLeft / 60);
    const secs = S.timeLeft % 60;
    const timerEl = document.getElementById('hudTimer');
    timerEl.textContent = `⏱ ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    timerEl.className = `hud-timer${S.timeLeft <= 30 ? ' danger' : ''}`;

    document.getElementById('minimapLabel').textContent =
      S.poisonPhase > 0 ? `毒圈${S.poisonPhase}阶 ${S.poisonDps}%/s` : `毒圈 ${mins}:${String(secs).padStart(2,'0')}`;

    // Poison warning
    document.getElementById('poisonWarn').classList.toggle('hidden', !S.inPoison);

    // Poison edge overlay
    const edge = document.getElementById('poisonEdge');
    edge.classList.remove('active','phase2','phase3');
    if (S.inPoison) {
      if (S.poisonPhase >= 3) edge.classList.add('phase3');
      else if (S.poisonPhase >= 2) edge.classList.add('phase2');
      else edge.classList.add('active');
    }

    updateHUD();

    if (S.timeLeft <= 0 && !S.finished) {
      showResult({ finished: true, won: S.kills >= S.totalEnemies });
    }
  }

  function onPoisonDamage(S) {
    const flash = document.getElementById('dmgFlash');
    flash.style.background = 'radial-gradient(ellipse,transparent 40%,rgba(168,85,247,.3))';
    flash.classList.add('active');
    setTimeout(() => { flash.classList.remove('active'); flash.style.background = ''; }, 400);
    updateHUD();
    if (S.hp <= 0) showResult({ finished: true, won: false });
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
  function stopMinimap() { if (minimapAnim) cancelAnimationFrame(minimapAnim); }

  // ═══ EFFECTS ═══
  function showFloatScore(text, negative) {
    const el = document.getElementById('floatScore');
    el.textContent = text;
    el.className = `float-score${negative ? ' negative' : ''}`;
    el.classList.remove('hidden');
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
    container._items = items;
  }
  function pickAirdrop(idx) {
    const container = document.getElementById('adItems');
    const items = container._items;
    if (!items || !items[idx]) return;
    BGEngine.applyAirdrop(items[idx]);
    document.querySelectorAll('.ad-item').forEach((el, i) => {
      if (i === idx) el.classList.add('picked');
      else el.style.opacity = '0.3';
    });
    setTimeout(() => closeAirdrop(), 800);
  }
  function closeAirdrop() {
    show('battleScreen');
    startMinimap();
    startRunPhase();
    updateHUD();
  }

  // ═══ HINT ═══
  function useHint() {
    const hint = BGEngine.useHint();
    if (!hint) return;
    updateHUD();
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
    const S = BGEngine.getState() || { kills:0, totalEnemies:1, score:0, maxCombo:0, hp:0 };
    const { grade, qi } = BGEngine.getGrade();
    const elapsed = BGEngine.getElapsed();

    BGEngine.destroy();
    stopMinimap();
    if (aliveInterval) clearInterval(aliveInterval);

    show('resultScreen');
    const won = result?.won || false;

    const card = document.querySelector('.result-card');
    card.classList.toggle('dead', !won);

    document.getElementById('resultIcon').textContent = won ? '🏆' : '💀';
    document.getElementById('resultTitle').textContent = won
      ? '大吉大利！今晚吃鸡！' : '落地成盒...';
    document.getElementById('resultRank').textContent = won ? '#1' : `#${Math.max(2, aliveCount)}`;

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
    if (aliveInterval) clearInterval(aliveInterval);
    enterParachute();
  }

  function backToMap() {
    BGEngine.destroy();
    stopMinimap();
    if (aliveInterval) clearInterval(aliveInterval);
    selectedMap = null;
    document.querySelectorAll('.map-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('btnJump').disabled = true;
    show('mapScreen');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { selectZone, selectOption, fire, useHint,
           openAirdrop, pickAirdrop, closeAirdrop,
           restart, backToMap };
})();
