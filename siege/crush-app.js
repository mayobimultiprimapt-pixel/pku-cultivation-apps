/**
 * Vocabulary Crush — Main Controller v2.0
 * 金库对接 + 4科主题背景 + 特殊方块反馈 + 粒子庆祝
 */
const CrushApp = (() => {
  let mode = 'english';
  let currentLevel = 0;
  let selected = null;
  let processing = false;
  let progress = {};

  function init() {
    try { progress = JSON.parse(localStorage.getItem('crush_progress')||'{}'); } catch(e){}
    if(!progress.english) progress.english = {};
    if(!progress.math) progress.math = {};
    if(!progress.politics) progress.politics = {};
    if(!progress.cs) progress.cs = {};

    // Tab switching
    document.querySelectorAll('.lv-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.lv-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        mode = tab.dataset.mode;
        updateTheme();
        renderLevelMap();
      });
    });

    updateTheme();
    renderLevelMap();

    // 背景粒子
    initParticles();
  }

  // ═══ 科目主题切换 ═══
  function updateTheme() {
    document.body.dataset.mode = mode;
  }

  // ═══ 背景粒子系统 ═══
  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.4';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];
    const PARTICLE_COUNT = 30;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const modeColors = {
      english:'rgba(59,130,246,',
      math:'rgba(255,215,0,',
      politics:'rgba(239,68,68,',
      cs:'rgba(168,85,247,'
    };

    for(let i=0; i<PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        vx: (Math.random()-0.5)*0.3,
        vy: -Math.random()*0.5 - 0.1,
        size: Math.random()*2.5+0.5,
        alpha: Math.random()*0.5+0.2,
        pulse: Math.random()*Math.PI*2
      });
    }

    function animate() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const colorBase = modeColors[mode] || modeColors.english;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        const pAlpha = p.alpha * (0.5 + 0.5*Math.sin(p.pulse));

        if(p.y < -10) { p.y = canvas.height+10; p.x = Math.random()*canvas.width; }
        if(p.x < -10) p.x = canvas.width+10;
        if(p.x > canvas.width+10) p.x = -10;

        ctx.fillStyle = colorBase + pAlpha + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ═══ LEVEL MAP ═══
  function renderLevelMap() {
    const map = document.getElementById('lvMap');
    const total = CrushData.getTotalLevels(mode);
    const prog = progress[mode] || {};

    let highest = -1;
    for(let i=0;i<total;i++){
      if(prog[i] && prog[i].stars > 0) highest = i;
    }

    map.innerHTML = '';
    for(let i=0;i<total;i++){
      const node = document.createElement('div');
      node.className = 'lv-node';
      const stars = prog[i] ? prog[i].stars : 0;

      if(stars > 0) {
        node.classList.add('completed');
        node.innerHTML = `<span>${i+1}</span><span class="lv-node-stars">${'⭐'.repeat(stars)}</span>`;
      } else if(i <= highest + 1) {
        node.classList.add('current');
        node.innerHTML = `<span>${i+1}</span>`;
      } else {
        node.classList.add('locked');
        node.innerHTML = `<span>🔒</span>`;
      }

      if(!node.classList.contains('locked')) {
        node.addEventListener('click', () => showLevelPopup(i));
      }
      map.appendChild(node);
    }

    // 特殊标记: 金库关卡 / Perplexity关卡
    const builtinCount = {english:20, math:10, politics:10, cs:10};
    const bc = builtinCount[mode] || 10;
    const nodes = map.querySelectorAll('.lv-node');
    nodes.forEach((n, i) => {
      if(i >= bc) {
        n.classList.add('dynamic-level');
        // 添加金库/AI标记
        const badge = document.createElement('span');
        badge.className = 'lv-source-badge';
        badge.textContent = '📡';
        badge.title = '金库/AI动态关卡';
        n.appendChild(badge);
      }
    });

    // Total stars
    let totalStars = 0;
    Object.values(prog).forEach(p => totalStars += (p.stars||0));
    document.getElementById('lvTotalStars').textContent = `⭐ ${totalStars}/${total*3}`;
  }

  function showLevelPopup(idx) {
    currentLevel = idx;
    const level = CrushData.getLevel(mode, idx);
    if(!level) return;

    document.getElementById('popLevel').textContent = `Level ${idx+1}`;
    document.getElementById('popSentence').textContent = level.sentence;
    document.getElementById('popMoves').textContent = `📦 ${level.moves}步`;
    document.getElementById('lvPopup').classList.remove('hidden');
  }

  function closePopup() {
    document.getElementById('lvPopup').classList.add('hidden');
  }

  // ═══ GAME ═══
  function startLevel() {
    closePopup();
    CrushEngine.init(mode, currentLevel);
    show('gameScreen');
    updateTheme();
    renderGame();
  }

  function renderGame() {
    const S = CrushEngine.getState();
    if(!S) return;

    document.getElementById('gameLevel').textContent = `Lv.${currentLevel+1}`;
    document.getElementById('gameScore').textContent = S.score;
    document.getElementById('gameMoves').textContent = S.moves;

    // Moves color warning
    const movesEl = document.getElementById('gameMoves');
    movesEl.classList.toggle('low-moves', S.moves <= 5);

    // Sentence
    const sentText = document.getElementById('sentenceText');
    const filledCount = Math.min(S.targetMatched, S.targetNeeded);
    if(filledCount >= S.targetNeeded) {
      sentText.innerHTML = S.level.sentence.replace('_____',
        `<span class="filled">${S.level.answer}</span>`);
    } else {
      sentText.innerHTML = S.level.sentence.replace('_____',
        `<span class="blank">_____</span>`);
    }
    document.getElementById('sentenceHint').textContent =
      filledCount >= S.targetNeeded
        ? '✅ 填空完成!'
        : `找到并消除 "${S.level.answer}" × ${S.targetNeeded - filledCount}`;

    // Progress
    const pct = (filledCount / S.targetNeeded * 100);
    document.getElementById('progressFill').style.width = `${pct}%`;
    document.getElementById('progressText').textContent = `${filledCount}/${S.targetNeeded}`;

    renderGrid();
  }

  function renderGrid() {
    const grid = CrushEngine.getGrid();
    if(!grid) return;
    const container = document.getElementById('gameGrid');
    container.innerHTML = '';

    for(let r=0;r<6;r++){
      for(let c=0;c<6;c++){
        const tile = grid[r][c];
        const el = document.createElement('div');
        el.className = `tile ${tile.color||'c0'}`;
        el.textContent = tile.word || '';
        el.dataset.r = r;
        el.dataset.c = c;

        if(tile.isTarget) el.classList.add('target');
        if(tile.isNew) { el.classList.add('falling'); tile.isNew = false; }
        if(tile.special === 'bomb') el.classList.add('bomb');
        if(tile.special === 'rainbow') el.classList.add('rainbow');
        if(selected && selected.r === r && selected.c === c) el.classList.add('selected');

        el.addEventListener('click', () => onTileClick(r, c));
        container.appendChild(el);
      }
    }
  }

  function onTileClick(r, c) {
    if(processing) return;
    const S = CrushEngine.getState();
    if(!S || S.finished) return;

    if(!selected) {
      selected = {r, c};
      renderGrid();
      return;
    }

    const sr = selected.r, sc = selected.c;
    selected = null;

    if(sr === r && sc === c) {
      renderGrid();
      return;
    }

    if(Math.abs(sr-r)+Math.abs(sc-c) !== 1) {
      selected = {r, c};
      renderGrid();
      return;
    }

    processing = true;
    const result = CrushEngine.swap(sr, sc, r, c);

    if(!result || !result.valid) {
      processing = false;
      renderGrid();
      // Shake animation
      const grid = document.getElementById('gameGrid');
      grid.classList.add('shake');
      setTimeout(() => grid.classList.remove('shake'), 300);
      if(navigator.vibrate) navigator.vibrate(50);
      return;
    }

    animateResult(result);
  }

  function animateResult(result) {
    let delay = 0;

    result.chains.forEach((chain, idx) => {
      setTimeout(() => {
        // ═══ 5级Combo反馈 ═══
        const comboLevel = Math.min(chain.chain, 5);
        if(chain.chain >= 2) {
          const comboTexts = {2:'GOOD!', 3:'GREAT!', 4:'AMAZING!', 5:'LEGENDARY!'};
          showCombo(comboTexts[comboLevel] || `COMBO x${chain.chain}!`, comboLevel);
        }
        // Special tile creation feedback
        if(chain.specialCreated) {
          if(chain.specialCreated.type === 'bomb') {
            showCombo('💣 BOMB!', 3);
          } else if(chain.specialCreated.type === 'rainbow') {
            showCombo('🌈 RAINBOW!', 5);
          } else if(chain.specialCreated.type === 'rainbow_activated') {
            showCombo('🌈 UNLEASHED!', 5);
          }
        }

        // ═══ 分级屏震 ═══
        const grid = document.getElementById('gameGrid');
        if(comboLevel >= 4) {
          grid.classList.add('shake-heavy');
          setTimeout(() => grid.classList.remove('shake-heavy'), 450);
          if(navigator.vibrate) navigator.vibrate([50,30,80]);
        } else if(comboLevel >= 3) {
          grid.classList.add('shake-medium');
          setTimeout(() => grid.classList.remove('shake-medium'), 350);
          if(navigator.vibrate) navigator.vibrate([50,30,50]);
        } else if(comboLevel >= 2) {
          grid.classList.add('shake-light');
          setTimeout(() => grid.classList.remove('shake-light'), 250);
        }

        // ═══ 分数飘字(大消大字) ═══
        showFloat(`+${chain.score}`, false, chain.score >= 100);
        if(chain.targetHits > 0) {
          showFloat(`⭐ 目标词 ×${chain.targetHits}`, false, true);
          if(navigator.vibrate) navigator.vibrate(100);
          spawnBurstParticles(chain.targetHits * 8);
        } else {
          spawnBurstParticles(Math.min(comboLevel * 4, 20));
        }

        // ═══ 分数弹跳 ═══
        const scoreEl = document.getElementById('gameScore');
        scoreEl.classList.remove('bounce');
        void scoreEl.offsetWidth;
        scoreEl.classList.add('bounce');

        renderGame();
      }, delay);
      delay += 380;
    });

    setTimeout(() => {
      processing = false;
      renderGame();

      if(result.finished) {
        setTimeout(() => showResult(), 500);
      }
    }, delay + 200);
  }

  // ═══ 消除粒子爆发(增强版) ═══
  function spawnBurstParticles(count = 12) {
    const burst = document.createElement('div');
    burst.className = 'burst-container';
    document.body.appendChild(burst);
    const colors = ['#f59e0b','#10b981','#3b82f6','#ef4444','#a855f7','#22d3ee','#ec4899','#f97316'];

    for(let i=0; i<count; i++) {
      const p = document.createElement('div');
      p.className = 'burst-particle';
      const angle = (i/count) * Math.PI * 2 + (Math.random()-0.5)*0.5;
      const dist = 30 + Math.random()*80;
      p.style.setProperty('--tx', Math.cos(angle)*dist + 'px');
      p.style.setProperty('--ty', Math.sin(angle)*dist + 'px');
      p.style.background = colors[i % colors.length];
      const size = 4 + Math.random()*6;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.animationDelay = (Math.random()*0.1) + 's';
      burst.appendChild(p);
    }

    setTimeout(() => burst.remove(), 1000);
  }

  // ═══ EFFECTS (增强版) ═══
  function showCombo(text, level = 2) {
    const el = document.getElementById('comboDisplay');
    const inner = document.getElementById('comboText');
    inner.textContent = text;
    inner.className = 'combo-text combo-' + Math.min(level, 5);
    el.classList.remove('hidden');
    inner.style.animation = 'none';
    void inner.offsetHeight;
    inner.style.animation = 'comboSlam .5s cubic-bezier(.34,1.56,.64,1)';
    const duration = level >= 4 ? 1800 : 1200;
    setTimeout(() => el.classList.add('hidden'), duration);
  }

  function showFloat(text, negative, big = false) {
    const el = document.createElement('div');
    el.textContent = text;
    el.className = `float-score${negative ? ' negative' : ''}${big ? ' big' : ''}`;
    el.style.left = (30 + Math.random()*40) + '%';
    el.style.top = (25 + Math.random()*15) + '%';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }

  // ═══ RESULT ═══
  function showResult() {
    const S = CrushEngine.getState();
    const {stars, qi} = CrushEngine.getGrade();
    const elapsed = CrushEngine.getElapsed();

    // Save progress
    const prev = progress[mode][currentLevel];
    if(!prev || stars > prev.stars) {
      progress[mode][currentLevel] = {stars};
      try { localStorage.setItem('crush_progress', JSON.stringify(progress)); } catch(e){}
    }

    show('resultScreen');

    // Stars display with animation
    const starsEl = document.getElementById('resultStars');
    if(stars > 0) {
      starsEl.innerHTML = '';
      for(let i=0; i<stars; i++) {
        setTimeout(() => {
          starsEl.innerHTML += `<span class="star-pop" style="animation-delay:${i*0.15}s">⭐</span>`;
        }, i * 200);
      }
    } else {
      starsEl.textContent = '💔';
    }

    document.getElementById('resultTitle').textContent = S.won ? '通关!' : '步数用完...';

    // Completed sentence
    document.getElementById('resultSentence').innerHTML = S.won
      ? S.level.sentence.replace('_____', `<b style="color:#10b981">${S.level.answer}</b>`)
      : S.level.sentence;

    document.getElementById('rScore').textContent = S.score;
    document.getElementById('rMoves').textContent = `${S.maxMoves-S.moves}/${S.maxMoves}`;
    document.getElementById('rCombo').textContent = `x${S.maxCombo}`;
    document.getElementById('rWords').textContent = `${Math.min(S.targetMatched,S.targetNeeded)}/${S.targetNeeded}`;
    const m = Math.floor(elapsed/60), s = elapsed%60;
    document.getElementById('rTime').textContent = `${m}:${String(s).padStart(2,'0')}`;
    document.getElementById('rQi').textContent = `+${qi}`;

    // Learning card with flip animation
    const learn = document.getElementById('resultLearn');
    learn.innerHTML = `<div class="result-learn-title">💡 你学到了：</div>` +
      S.wordsLearned.map((w,i) =>
        `<div class="result-learn-item flip-in" style="animation-delay:${i*0.2}s">· ${w}</div>`
      ).join('');

    // Victory celebration
    if(S.won) {
      spawnCelebration();
    }
  }

  // ═══ 通关庆祝: 星星飘落 ═══
  function spawnCelebration() {
    const container = document.createElement('div');
    container.className = 'celebration-container';
    document.body.appendChild(container);

    const emojis = ['⭐','✨','🌟','💫','🎉','🎊'];
    for(let i=0; i<20; i++) {
      const star = document.createElement('div');
      star.className = 'celebration-star';
      star.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      star.style.left = Math.random()*100 + '%';
      star.style.animationDuration = (1.5 + Math.random()*2) + 's';
      star.style.animationDelay = Math.random()*1 + 's';
      star.style.fontSize = (14 + Math.random()*16) + 'px';
      container.appendChild(star);
    }

    setTimeout(() => container.remove(), 4000);
  }

  function nextLevel() {
    CrushEngine.destroy();
    currentLevel++;
    const total = CrushData.getTotalLevels(mode);
    if(currentLevel >= total) {
      currentLevel = 0;
      backToLevels();
      return;
    }
    CrushEngine.init(mode, currentLevel);
    show('gameScreen');
    selected = null;
    processing = false;
    renderGame();
  }

  function backToLevels() {
    CrushEngine.destroy();
    selected = null;
    processing = false;
    show('levelScreen');
    renderLevelMap();
  }

  // ═══ UTILS ═══
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
  }

  document.addEventListener('DOMContentLoaded', init);

  return {closePopup, startLevel, nextLevel, backToLevels};
})();
