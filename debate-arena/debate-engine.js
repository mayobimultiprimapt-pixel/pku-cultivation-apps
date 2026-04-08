/**
 * 论道殿 · 双轨四科 — 法庭引擎
 * ========================================
 * Phase: 接案(read) → 破(break) → 立(build) → 论证链(chain) → 完形(cloze)
 * HP提升至8，适配四科
 */

const CourtEngine = (() => {
  let S = {};

  function init(subject) {
    S = {
      subject,
      cases: CaseDB.getCases(subject),
      caseIndex: 0,
      phase: 'read',
      score: 0,
      combo: 0,
      maxCombo: 0,
      playerHp: 8,
      judgeHp: 8,
      breakSuccess: 0,
      buildSuccess: 0,
      chainSuccess: 0,
      breakSelected: [],
      buildSelected: [],
      chainSelected: [],
      clozeSelected: [],
      totalCases: 0,
    };
    S.totalCases = S.cases.length;
    return S;
  }

  function getCase() { return S.cases[S.caseIndex] || null; }
  function getState() { return S; }

  // ═══ Phase 2: 破 — 识别谬误 ═══
  function generateBreakHand(c) {
    const correctTypes = c.breakPhase.fallacies.map(f => f.type);
    const allBreak = CaseDB.getBreakCards();
    const correct = allBreak.filter(b => correctTypes.includes(b.id));
    const wrong = allBreak.filter(b => c.breakPhase.distractors.includes(b.id));
    return CaseDB.shuffle([...correct, ...wrong]);
  }

  function submitBreak(selectedIds) {
    const c = getCase();
    if (!c) return null;

    const correctTypes = c.breakPhase.fallacies.map(f => f.type);
    let matched = 0;
    let wrong = 0;
    const results = selectedIds.map(id => {
      const isCorrect = correctTypes.includes(id);
      if (isCorrect) matched++;
      else wrong++;
      return { id, isCorrect };
    });

    const allCorrect = matched === correctTypes.length && wrong === 0;
    const scoreGained = matched * 30 - wrong * 10;

    if (allCorrect) {
      S.breakSuccess++;
      S.combo++;
      S.maxCombo = Math.max(S.maxCombo, S.combo);
    } else {
      S.combo = 0;
      if (wrong > 0) S.playerHp = Math.max(0, S.playerHp - 1);
    }
    S.score += Math.max(0, scoreGained);
    S.phase = 'build';

    return {
      results,
      matched,
      total: correctTypes.length,
      allCorrect,
      scoreGained: Math.max(0, scoreGained),
      hints: c.breakPhase.fallacies.map(f => f.hint),
    };
  }

  // ═══ Phase 3: 立 — 选原理+政策 ═══
  function generateBuildPool(c) {
    return CaseDB.shuffle([...c.buildPhase.pool]);
  }

  function submitBuild(selectedNames) {
    const c = getCase();
    if (!c) return null;

    const slots = c.buildPhase.slots;
    let matched = 0;
    const results = slots.map((slot, i) => {
      const picked = selectedNames[i] || '';
      const isCorrect = picked === slot.correct;
      if (isCorrect) matched++;
      return { slot: slot.label, picked, expected: slot.correct, desc: slot.desc, isCorrect };
    });

    const allCorrect = matched === slots.length;
    const scoreGained = matched * 25;

    if (allCorrect) {
      S.buildSuccess++;
      S.combo++;
      S.maxCombo = Math.max(S.maxCombo, S.combo);
      S.judgeHp = Math.max(0, S.judgeHp - 1);
    } else {
      S.combo = 0;
      const wrongCount = slots.length - matched;
      if (wrongCount >= 2) S.playerHp = Math.max(0, S.playerHp - 1);
    }
    S.score += scoreGained;
    S.phase = 'chain';

    return { results, allCorrect, scoreGained };
  }

  // ═══ Phase 4: 论证链 ═══
  function submitChain(selectedKeywords) {
    const c = getCase();
    if (!c) return null;

    const correct = c.chainPhase.correct;
    let matched = 0;
    const results = correct.map((kw, i) => {
      const picked = selectedKeywords[i] || '';
      const isCorrect = picked === kw;
      if (isCorrect) matched++;
      return { picked, expected: kw, isCorrect };
    });

    const allCorrect = matched === correct.length;
    const scoreGained = allCorrect ? 50 : matched * 15;

    if (allCorrect) {
      S.chainSuccess++;
      S.combo += 2;
      S.maxCombo = Math.max(S.maxCombo, S.combo);
      S.judgeHp = Math.max(0, S.judgeHp - 1);
    } else {
      S.combo = 0;
    }
    S.score += scoreGained;
    S.phase = 'cloze';

    return { results, allCorrect, scoreGained };
  }

  // ═══ 下一案件 ═══
  function nextCase() {
    S.caseIndex++;
    S.phase = 'read';
    S.breakSelected = [];
    S.buildSelected = [];
    S.chainSelected = [];
    S.clozeSelected = [];

    if (S.caseIndex >= S.cases.length || S.playerHp <= 0 || S.judgeHp <= 0) {
      return { finished: true };
    }
    return { finished: false };
  }

  // ═══ 最终统计 ═══
  function getFinalStats() {
    let grade = 'D', title = '道心崩碎...';
    if (S.score >= 800) { grade = 'SSS'; title = '千古名判！'; }
    else if (S.score >= 600) { grade = 'SS'; title = '破局宗师！'; }
    else if (S.score >= 450) { grade = 'S'; title = '逻辑猎手！'; }
    else if (S.score >= 350) { grade = 'A'; title = '主理翘楚！'; }
    else if (S.score >= 250) { grade = 'B'; title = '初识法理'; }
    else if (S.score >= 150) { grade = 'C'; title = '尚需磨砺'; }

    return {
      grade, title,
      score: S.score,
      breakSuccess: S.breakSuccess,
      buildSuccess: S.buildSuccess,
      chainSuccess: S.chainSuccess,
      maxCombo: S.maxCombo,
      playerHp: S.playerHp,
      judgeHp: S.judgeHp,
    };
  }

  return { init, getState, getCase, generateBreakHand, generateBuildPool,
           submitBreak, submitBuild, submitChain, nextCase, getFinalStats };
})();
