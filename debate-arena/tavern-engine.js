/**
 * 骗子酒馆 · 游戏引擎 v3.0
 * ========================================
 * 考卷对齐题量 + 俄罗斯轮盘 + 信誉值 + 四科支持
 * 201英语20轮 · 301数学15轮 · 408计算机20轮
 */
const TavernEngine = (() => {
  let S = null;

  function init(subject) {
    // 不传count，让buildRounds用TARGET_ROUNDS自动对齐考卷题量
    const rounds = TavernData.buildRounds(subject);
    S = {
      subject,
      rounds,
      current: 0,
      totalRounds: rounds.length,
      // Revolver: 6 chambers, 1 bullet
      chambers: buildChambers(),
      chamberIndex: 0,
      // Stats
      lives: 6,
      score: 0,
      credibility: 0,
      rouletteCount: 0,
      survived: 0,
      correctCalls: 0,
      wrongCalls: 0,
      learnings: [],
      // Meta
      finished: false,
      phase:'intro',
      timerSeconds: 15,
    };
    return S;
  }

  function buildChambers() {
    const c = [false,false,false,false,false,false];
    c[Math.floor(Math.random()*6)] = true;
    return c;
  }

  function getCurrentRound() {
    if(!S || S.current >= S.rounds.length) return null;
    return S.rounds[S.current];
  }

  function getNPCForRound() {
    const r = getCurrentRound();
    if(!r) return null;
    return TavernData.getNPC(r.speaker);
  }

  function decide(action) {
    const r = getCurrentRound();
    if(!r) return null;
    const npc = getNPCForRound();

    const result = {
      action,
      claim: r,
      npc,
      correct: false,
      needRoulette: false,
      explanation: '',
    };

    if(action === 'believe') {
      if(!r.isLie) {
        result.correct = true;
        S.credibility += 1;
        S.score += 10;
        S.correctCalls++;
        result.explanation = '✅ 他说的是真话，你的判断正确。';
      } else {
        result.correct = false;
        S.credibility -= 2;
        S.wrongCalls++;
        result.needRoulette = true;
        result.explanation = `❌ 你被骗了！\n${r.truth}`;
        S.learnings.push(r.truth);
      }
    } else {
      if(r.isLie) {
        result.correct = true;
        S.credibility += 3;
        S.score += 30;
        S.correctCalls++;
        result.explanation = `🎯 识破骗子！\n${r.truth}`;
        S.learnings.push(r.truth);
      } else {
        result.correct = false;
        S.credibility -= 3;
        S.wrongCalls++;
        result.needRoulette = true;
        result.explanation = '❌ 冤枉好人了！他说的其实是对的。';
      }
    }

    return result;
  }

  function pullTrigger() {
    if(!S) return { hit:true };
    S.rouletteCount++;
    const hit = S.chambers[S.chamberIndex];
    const idx = S.chamberIndex;
    S.chamberIndex++;

    if(hit) {
      S.lives = 0;
      S.finished = true;
    } else {
      S.survived++;
      S.credibility += 1;
      S.score += 5;
      // 弹仓打完自动装弹（支持20轮长局）
      if(S.chamberIndex >= 6) {
        S.chambers = buildChambers();
        S.chamberIndex = 0;
        console.log('[酒馆] 弹仓已空，重新装弹！');
      }
    }

    return { hit, chamberIndex: idx % 6, remaining: 6 - (S.chamberIndex % 6) };
  }

  function nextRound() {
    if(!S) return false;
    S.current++;
    if(S.current >= S.totalRounds) {
      S.finished = true;
      return false;
    }
    // 渐进式缩短时限（适配15-20轮长局）
    const pct = S.current / S.totalRounds;
    if(pct >= 0.75) S.timerSeconds = 8;      // 最后25%: 8秒
    else if(pct >= 0.50) S.timerSeconds = 10; // 中后期: 10秒
    else if(pct >= 0.25) S.timerSeconds = 12; // 中前期: 12秒
    // 前25%保持15秒
    return true;
  }

  function getGrade() {
    if(!S) return { title:'韭菜', qi:0 };
    let title, qi, multiplier;
    if(S.credibility >= 20) { title = '🏆 测谎大师'; qi = 80; multiplier = 2; }
    else if(S.credibility >= 15) { title = '⭐ 老练酒客'; qi = 60; multiplier = 1.5; }
    else if(S.credibility >= 10) { title = '🍺 常客'; qi = 40; multiplier = 1.2; }
    else if(S.credibility >= 5) { title = '🍺 新手'; qi = 25; multiplier = 1; }
    else { title = '💀 韭菜'; qi = 10; multiplier = 0.5; }
    qi = Math.round(qi * multiplier);
    return { title, qi, multiplier };
  }

  function getState() { return S; }

  function destroy() { S = null; }

  return { init, getCurrentRound, getNPCForRound, decide,
           pullTrigger, nextRound, getGrade, getState, destroy };
})();
