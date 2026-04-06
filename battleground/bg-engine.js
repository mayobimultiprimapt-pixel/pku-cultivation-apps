/**
 * 刺激战场 · 战斗引擎
 * ========================================
 * 毒圈收缩 + 小地图Canvas + 空投触发 + 分数计算
 */
const BGEngine = (() => {
  let S = null; // state
  let timerInterval = null;
  let poisonInterval = null;
  let minimapCtx = null;

  function init(mapId, zone) {
    const map = BGData.getMap(mapId);
    if (!map) return null;

    // Shuffle questions
    const qs = [...map.questions];
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }

    S = {
      mapId, map, zone,
      questions: qs,
      current: 0,
      hp: 100,
      maxHp: 100,
      score: 0,
      kills: 0,
      totalEnemies: qs.length,
      combo: 0,
      maxCombo: 0,
      hints: zone === 'safe' ? 5 : (zone === 'hot' ? 2 : 3),
      timeLeft: map.totalTime,
      totalTime: map.totalTime,
      airdropInterval: Math.floor(qs.length / map.airdrops),
      nextAirdrop: Math.floor(qs.length / map.airdrops),
      airdropsPending: false,
      doubleScoreCount: 0,
      revealNext: false,
      inPoison: false,
      poisonPhase: 0, // 0=safe, 1=light, 2=medium, 3=heavy
      poisonDps: 0,
      // Minimap circle data
      circleRadius: 1.0, // 1.0 = full map
      circleCenter: { x: 0.5, y: 0.5 },
      playerPos: { x: 0.5, y: 0.5 },
      started: false,
      finished: false,
      startedAt: Date.now(),
    };

    // Zone modifiers
    if (zone === 'hot') {
      S.hp = 80; // less hp in hot zone
    } else if (zone === 'safe') {
      S.timeLeft += 30; // bonus time
      S.totalTime += 30;
    }

    return S;
  }

  function startTimers(onTick, onPoisonDamage) {
    S.started = true;
    const t1 = S.totalTime / 3;
    const t2 = (S.totalTime * 2) / 3;
    const t3 = (S.totalTime * 5) / 6;

    // Main timer
    timerInterval = setInterval(() => {
      if (S.finished) { clearInterval(timerInterval); return; }
      S.timeLeft = Math.max(0, S.timeLeft - 1);

      // Poison circle phases
      const elapsed = S.totalTime - S.timeLeft;
      if (elapsed >= t3) {
        S.poisonPhase = 3; S.poisonDps = 5;
        S.circleRadius = 0.15;
      } else if (elapsed >= t2) {
        S.poisonPhase = 2; S.poisonDps = 3;
        S.circleRadius = 0.35;
      } else if (elapsed >= t1) {
        S.poisonPhase = 1; S.poisonDps = 1;
        S.circleRadius = 0.6;
      } else {
        S.poisonPhase = 0; S.poisonDps = 0;
        S.circleRadius = 1.0;
      }

      // Move circle center slightly for "running to safe zone" feel
      if (S.poisonPhase > 0) {
        S.circleCenter.x = 0.5 + Math.sin(elapsed * 0.05) * 0.15;
        S.circleCenter.y = 0.5 + Math.cos(elapsed * 0.07) * 0.1;
      }

      // Check if player in poison
      const dx = S.playerPos.x - S.circleCenter.x;
      const dy = S.playerPos.y - S.circleCenter.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      S.inPoison = dist > S.circleRadius * 0.45;

      if (onTick) onTick(S);

      if (S.timeLeft <= 0) {
        S.finished = true;
        clearInterval(timerInterval);
      }
    }, 1000);

    // Poison damage tick
    poisonInterval = setInterval(() => {
      if (S.finished) { clearInterval(poisonInterval); return; }
      if (S.inPoison && S.poisonDps > 0) {
        S.hp = Math.max(0, S.hp - S.poisonDps);
        if (onPoisonDamage) onPoisonDamage(S);
        if (S.hp <= 0) {
          S.finished = true;
          clearInterval(timerInterval);
          clearInterval(poisonInterval);
        }
      }
      // Simulate player "running toward circle"
      if (S.inPoison) {
        S.playerPos.x += (S.circleCenter.x - S.playerPos.x) * 0.1;
        S.playerPos.y += (S.circleCenter.y - S.playerPos.y) * 0.1;
      } else {
        // Slight random movement when safe
        S.playerPos.x += (Math.random() - 0.5) * 0.02;
        S.playerPos.y += (Math.random() - 0.5) * 0.02;
        S.playerPos.x = Math.max(0.1, Math.min(0.9, S.playerPos.x));
        S.playerPos.y = Math.max(0.1, Math.min(0.9, S.playerPos.y));
      }
    }, 1000);
  }

  function getCurrentQuestion() {
    if (!S || S.current >= S.questions.length) return null;
    return S.questions[S.current];
  }

  function answer(optIndex) {
    const q = getCurrentQuestion();
    if (!q) return null;
    const correct = optIndex === q.ans;
    const result = { correct, correctAns: q.ans };

    if (correct) {
      S.combo++;
      S.maxCombo = Math.max(S.maxCombo, S.combo);
      let multiplier = 1;
      if (S.doubleScoreCount > 0) { multiplier = 2; S.doubleScoreCount--; }
      if (S.combo >= 8) multiplier *= 2;
      else if (S.combo >= 5) multiplier *= 1.5;
      else if (S.combo >= 3) multiplier *= 1.2;
      const gained = S.map.scorePerQ * multiplier;
      S.score += gained;
      S.kills++;
      result.scoreGained = gained;
      result.combo = S.combo;

      // Combo titles
      if (S.combo === 3) result.comboTitle = '🔥 三连杀!';
      else if (S.combo === 5) result.comboTitle = '⚡ 五连杀!';
      else if (S.combo === 8) result.comboTitle = '💀 超神!';
      else if (S.combo === 10) result.comboTitle = '👑 传说!';
    } else {
      S.combo = 0;
      const dmg = S.zone === 'hot' ? 15 : (S.zone === 'safe' ? 5 : 10);
      S.hp = Math.max(0, S.hp - dmg);
      result.damage = dmg;
    }

    S.current++;
    result.finished = S.current >= S.questions.length || S.hp <= 0;
    result.won = S.current >= S.questions.length && S.hp > 0;

    // Check airdrop
    result.airdrop = false;
    if (correct && S.kills > 0 && S.kills % S.airdropInterval === 0 && S.kills < S.totalEnemies) {
      result.airdrop = true;
    }

    if (result.finished) S.finished = true;

    return result;
  }

  function applyAirdrop(item) {
    if (!S) return;
    switch(item.effect) {
      case 'hp':
        S.hp = Math.min(S.maxHp, S.hp + 20);
        S.maxHp = Math.min(120, S.maxHp + 5);
        break;
      case 'time':
        S.timeLeft = Math.min(S.timeLeft + 30, S.totalTime);
        break;
      case 'hint':
        S.hints += 3;
        break;
      case 'reveal':
        S.revealNext = true;
        break;
      case 'double':
        S.doubleScoreCount += 3;
        break;
    }
  }

  function useHint() {
    if (!S || S.hints <= 0) return null;
    const q = getCurrentQuestion();
    if (!q) return null;
    S.hints--;
    return q.hint;
  }

  function drawMinimap(canvas) {
    if (!S) return;
    if (!minimapCtx) minimapCtx = canvas.getContext('2d');
    const ctx = minimapCtx;
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2;

    ctx.clearRect(0, 0, w, h);

    // Background (full map)
    ctx.fillStyle = 'rgba(10,15,30,0.8)';
    ctx.beginPath();
    ctx.arc(cx, cy, cx, 0, Math.PI*2);
    ctx.fill();

    // Poison zone (outside circle = purple)
    ctx.fillStyle = 'rgba(168,85,247,0.25)';
    ctx.beginPath();
    ctx.arc(cx, cy, cx, 0, Math.PI*2);
    ctx.fill();

    // Safe zone (the circle)
    const safeR = S.circleRadius * cx * 0.9;
    const safeCx = S.circleCenter.x * w;
    const safeCy = S.circleCenter.y * h;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(safeCx, safeCy, safeR, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Re-draw safe zone with clear bg
    ctx.fillStyle = 'rgba(6,20,40,0.6)';
    ctx.beginPath();
    ctx.arc(safeCx, safeCy, safeR, 0, Math.PI*2);
    ctx.fill();

    // Safe zone border (blue)
    ctx.strokeStyle = 'rgba(59,130,246,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(safeCx, safeCy, safeR, 0, Math.PI*2);
    ctx.stroke();

    // Outer poison ring glow
    if (S.poisonPhase > 0) {
      ctx.strokeStyle = `rgba(168,85,247,${0.3 + S.poisonPhase * 0.15})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(safeCx, safeCy, safeR + 3, 0, Math.PI*2);
      ctx.stroke();
    }

    // Enemy dots (remaining)
    const remaining = S.totalEnemies - S.kills;
    for (let i = 0; i < Math.min(remaining, 8); i++) {
      const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.001;
      const edist = safeR * (0.3 + Math.random() * 0.5);
      const ex = safeCx + Math.cos(angle) * edist;
      const ey = safeCy + Math.sin(angle) * edist;
      ctx.fillStyle = 'rgba(239,68,68,0.8)';
      ctx.beginPath();
      ctx.arc(ex, ey, 2, 0, Math.PI*2);
      ctx.fill();
    }

    // Player dot (green, with glow)
    const px = S.playerPos.x * w;
    const py = S.playerPos.y * h;
    ctx.fillStyle = S.inPoison ? 'rgba(168,85,247,0.9)' : 'rgba(16,185,129,0.9)';
    ctx.shadowColor = S.inPoison ? '#a855f7' : '#10b981';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player direction indicator
    ctx.strokeStyle = S.inPoison ? '#a855f7' : '#10b981';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - 6);
    ctx.stroke();
  }

  function getState() { return S; }

  function getElapsed() {
    if (!S) return 0;
    return Math.floor((Date.now() - S.startedAt) / 1000);
  }

  function getGrade() {
    if (!S) return { grade:'F', qi:0 };
    const pct = S.kills / S.totalEnemies;
    const won = S.hp > 0 && S.kills >= S.totalEnemies;
    let grade, qi;
    if (won && pct === 1) { grade = 'SSS'; qi = 80; }
    else if (pct >= 0.9) { grade = 'S'; qi = 60; }
    else if (pct >= 0.7) { grade = 'A'; qi = 40; }
    else if (pct >= 0.5) { grade = 'B'; qi = 25; }
    else if (pct >= 0.3) { grade = 'C'; qi = 10; }
    else { grade = 'F'; qi = 5; }
    if (S.maxCombo >= 8) qi += 20;
    else if (S.maxCombo >= 5) qi += 10;
    return { grade, qi };
  }

  function destroy() {
    if (timerInterval) clearInterval(timerInterval);
    if (poisonInterval) clearInterval(poisonInterval);
    S = null;
    minimapCtx = null;
  }

  return { init, startTimers, getCurrentQuestion, answer,
           applyAirdrop, useHint, drawMinimap, getState, getElapsed,
           getGrade, destroy };
})();
