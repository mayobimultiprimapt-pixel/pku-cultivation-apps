/**
 * Vocabulary Crush - Main Controller
 * Level map -> Game grid -> Result
 */
const CrushApp = (() => {
  let mode = 'english';
  let currentLevel = 0;
  let selected = null; // {r,c}
  let processing = false;
  let progress = {}; // {english:{0:{stars:3},...}, math:{...}}

  function init() {
    // Load progress
    try { progress = JSON.parse(localStorage.getItem('crush_progress')||'{}'); } catch(e){}
    if(!progress.english) progress.english = {};
    if(!progress.math) progress.math = {};

    // Tab switching
    document.querySelectorAll('.lv-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.lv-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        mode = tab.dataset.mode;
        renderLevelMap();
      });
    });

    renderLevelMap();
  }

  // ═══ LEVEL MAP ═══
  function renderLevelMap() {
    const map = document.getElementById('lvMap');
    const total = CrushData.getTotalLevels(mode);
    const prog = progress[mode] || {};

    // Find highest completed
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
    renderGame();
  }

  function renderGame() {
    const S = CrushEngine.getState();
    if(!S) return;

    // HUD
    document.getElementById('gameLevel').textContent = `Lv.${currentLevel+1}`;
    document.getElementById('gameScore').textContent = S.score;
    document.getElementById('gameMoves').textContent = S.moves;

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

    // Grid
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

    // Already selected - try swap
    const sr = selected.r, sc = selected.c;
    selected = null;

    if(sr === r && sc === c) {
      renderGrid();
      return;
    }

    // Check adjacency
    if(Math.abs(sr-r)+Math.abs(sc-c) !== 1) {
      selected = {r, c};
      renderGrid();
      return;
    }

    processing = true;
    const result = CrushEngine.swap(sr, sc, r, c);

    if(!result || !result.valid) {
      // Invalid swap - shake
      processing = false;
      renderGrid();
      if(navigator.vibrate) navigator.vibrate(50);
      return;
    }

    // Animate matches
    animateResult(result);
  }

  function animateResult(result) {
    let delay = 0;
    const S = CrushEngine.getState();

    result.chains.forEach((chain, idx) => {
      setTimeout(() => {
        // Show combo
        if(chain.chain >= 2) {
          showCombo(`COMBO x${chain.chain}!`);
        }
        // Show score
        showFloat(`+${chain.score}`, false);
        // Target hit feedback
        if(chain.targetHits > 0) {
          if(navigator.vibrate) navigator.vibrate(100);
        }
        renderGame();
      }, delay);
      delay += 350;
    });

    setTimeout(() => {
      processing = false;
      renderGame();

      if(result.finished) {
        setTimeout(() => showResult(), 500);
      }
    }, delay + 200);
  }

  // ═══ EFFECTS ═══
  function showCombo(text) {
    const el = document.getElementById('comboDisplay');
    document.getElementById('comboText').textContent = text;
    el.classList.remove('hidden');
    const inner = document.getElementById('comboText');
    inner.style.animation = 'none';
    inner.offsetHeight;
    inner.style.animation = 'comboIn .6s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(() => el.classList.add('hidden'), 1200);
  }

  function showFloat(text, negative) {
    const el = document.getElementById('floatScore');
    el.textContent = text;
    el.className = `float-score${negative?' negative':''}`;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'floatUp 1s ease-out forwards';
    setTimeout(() => el.classList.add('hidden'), 1000);
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

    document.getElementById('resultStars').textContent = stars > 0 ? '⭐'.repeat(stars) : '💔';
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

    // Learning
    const learn = document.getElementById('resultLearn');
    learn.innerHTML = `<div class="result-learn-title">💡 你学到了：</div>` +
      S.wordsLearned.map(w => `<div class="result-learn-item">· ${w}</div>`).join('');
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
