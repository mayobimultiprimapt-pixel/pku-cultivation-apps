/**
 * 骗子酒馆 · 游戏引擎
 * ========================================
 * 6局制 + 俄罗斯轮盘 + 信誉值
 */
const TavernEngine = (() => {
  let S = null;

  function init(subject) {
    const rounds = TavernData.buildRounds(subject, 6);
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
      learnings: [], // 学到的知识点
      // Meta
      finished: false,
      phase:'intro', // intro, claim, decide, reveal, roulette, result
      timerSeconds: 15,
    };
    return S;
  }

  function buildChambers() {
    // 6 slots, randomly place 1 bullet
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

  /**
   * Player makes their decision
   * @param {string} action - 'believe' or 'liar'
   * @returns {object} result
   */
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
        // Correctly believed truth
        result.correct = true;
        S.credibility += 1;
        S.score += 10;
        S.correctCalls++;
        result.explanation = '✅ 他说的是真话，你的判断正确。';
      } else {
        // Believed a lie!
        result.correct = false;
        S.credibility -= 2;
        S.wrongCalls++;
        result.needRoulette = true;
        result.explanation = `❌ 你被骗了！\n${r.truth}`;
        S.learnings.push(r.truth);
      }
    } else { // 'liar'
      if(r.isLie) {
        // Correctly identified liar
        result.correct = true;
        S.credibility += 3;
        S.score += 30;
        S.correctCalls++;
        result.explanation = `🎯 识破骗子！\n${r.truth}`;
        S.learnings.push(r.truth);
      } else {
        // Wrongly accused truth-teller
        result.correct = false;
        S.credibility -= 3;
        S.wrongCalls++;
        result.needRoulette = true;
        result.explanation = '❌ 冤枉好人了！他说的其实是对的。';
      }
    }

    return result;
  }

  /**
   * Pull the trigger
   * @returns {object} { hit: boolean, chamberIndex: number }
   */
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
      S.credibility += 1; // survival bonus
      S.score += 5;
    }

    return { hit, chamberIndex: idx, remaining: 6 - S.chamberIndex };
  }

  function nextRound() {
    if(!S) return false;
    S.current++;
    if(S.current >= S.totalRounds) {
      S.finished = true;
      return false;
    }
    // Adjust timer for difficulty
    if(S.current >= 4) S.timerSeconds = 10;
    return true;
  }

  function getGrade() {
    if(!S) return { title:'韭菜', qi:0 };
    let title, qi, multiplier;
    if(S.credibility >= 15) { title = '🏆 测谎大师'; qi = 60; multiplier = 2; }
    else if(S.credibility >= 10) { title = '⭐ 老练酒客'; qi = 45; multiplier = 1.5; }
    else if(S.credibility >= 5) { title = '🍺 常客'; qi = 25; multiplier = 1; }
    else { title = '💀 韭菜'; qi = 10; multiplier = 0.5; }
    qi = Math.round(qi * multiplier);
    return { title, qi, multiplier };
  }

  function getState() { return S; }

  function destroy() { S = null; }

  return { init, getCurrentRound, getNPCForRound, decide,
           pullTrigger, nextRound, getGrade, getState, destroy };
})();
