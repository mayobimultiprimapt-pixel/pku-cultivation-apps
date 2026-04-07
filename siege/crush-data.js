/**
 * Vocabulary Crush Data
 * 20 levels = 20 cloze blanks, each with answer word + distractors
 */
const CrushData = (() => {
  const ENGLISH_LEVELS = [
    {sentence:'The study provided _____ evidence to support the hypothesis.',
     answer:'empirical', meaning:'empirical = 经验的、实证的',
     distractors:['rare','vast','brief','subtle','acute','virtual']},
    {sentence:'The new policy will _____ the impact of climate change.',
     answer:'mitigate', meaning:'mitigate = 减轻、缓解',
     distractors:['enhance','expand','provoke','sustain','impose','derive']},
    {sentence:'Her _____ attitude made negotiations difficult.',
     answer:'pragmatic', meaning:'pragmatic = 务实的',
     distractors:['hostile','passive','elegant','abstract','trivial','radical']},
    {sentence:'The internet has become _____ in modern society.',
     answer:'ubiquitous', meaning:'ubiquitous = 无处不在的',
     distractors:['obsolete','fragile','obscure','rigid','sparse','elusive']},
    {sentence:'The evidence was used to _____ the original theory.',
     answer:'corroborate', meaning:'corroborate = 证实、支持',
     distractors:['undermine','fabricate','diminish','distort','overlook','abandon']},
    {sentence:'The report highlighted the _____ between rich and poor.',
     answer:'disparity', meaning:'disparity = 差距、不平等',
     distractors:['harmony','alliance','surplus','deficit','paradox','analogy']},
    {sentence:'Scientists tried to _____ the cause of the outbreak.',
     answer:'ascertain', meaning:'ascertain = 查明、确定',
     distractors:['speculate','presume','advocate','conceal','postpone','displace']},
    {sentence:'The effects of pollution are _____ to human health.',
     answer:'detrimental', meaning:'detrimental = 有害的',
     distractors:['beneficial','marginal','integral','identical','prevalent','coherent']},
    {sentence:'The decision was met with _____ criticism from the public.',
     answer:'widespread', meaning:'widespread = 广泛的',
     distractors:['moderate','isolated','sporadic','implicit','unanimous','profound']},
    {sentence:'We need to _____ the gap between theory and practice.',
     answer:'bridge', meaning:'bridge = 弥合（差距）',
     distractors:['widen','ignore','expose','reveal','deepen','create']},
    {sentence:'The professor gave a _____ explanation of the theory.',
     answer:'comprehensive', meaning:'comprehensive = 全面的、综合的',
     distractors:['superficial','ambiguous','redundant','tentative','arbitrary','negligible']},
    {sentence:'The reforms led to a _____ improvement in living standards.',
     answer:'substantial', meaning:'substantial = 实质性的、大量的',
     distractors:['marginal','trivial','nominal','gradual','moderate','temporary']},
    {sentence:'The government should _____ resources more efficiently.',
     answer:'allocate', meaning:'allocate = 分配',
     distractors:['consume','deplete','generate','restrict','abandon','multiply']},
    {sentence:'Her speech was full of _____ references to classical literature.',
     answer:'implicit', meaning:'implicit = 含蓄的、暗含的',
     distractors:['explicit','verbose','literal','hostile','graphic','neutral']},
    {sentence:'The experiment yielded _____ results that surprised everyone.',
     answer:'unprecedented', meaning:'unprecedented = 史无前例的',
     distractors:['predictable','mediocre','consistent','conventional','redundant','arbitrary']},
    {sentence:'We must _____ the consequences before making a decision.',
     answer:'contemplate', meaning:'contemplate = 深思、考虑',
     distractors:['overlook','dismiss','postpone','fabricate','exaggerate','trivialize']},
    {sentence:'The _____ of the evidence was questioned by the defense.',
     answer:'validity', meaning:'validity = 有效性',
     distractors:['scarcity','ambiguity','quantity','majority','simplicity','publicity']},
    {sentence:'Social media has _____ the way people communicate.',
     answer:'transformed', meaning:'transformed = 彻底改变',
     distractors:['restricted','maintained','preserved','replicated','simplified','undermined']},
    {sentence:'The data showed a _____ correlation between the two variables.',
     answer:'significant', meaning:'significant = 显著的',
     distractors:['negligible','irrelevant','ambiguous','sporadic','redundant','superficial']},
    {sentence:'The new law aims to _____ discrimination in the workplace.',
     answer:'eliminate', meaning:'eliminate = 消除',
     distractors:['tolerate','encourage','overlook','maintain','justify','reinforce']},
  ];

  const MATH_LEVELS = [
    {sentence:'lim(x->0) sin(x)/x = _____', answer:'1', meaning:'sinx/x 在x趋于0时极限为1',
     distractors:['0','2','-1','pi','e','0.5']},
    {sentence:'d/dx[e^x] = _____', answer:'e^x', meaning:'e^x 的导数是它本身',
     distractors:['xe^x','ln(x)','x^e','1/x','x^x','e']},
    {sentence:'integral of 1/x dx = _____', answer:'ln|x|', meaning:'1/x 的不定积分为 ln|x|+C',
     distractors:['x^-1','e^x','1/x^2','log(x)','x','1']},
    {sentence:'det(AB) = _____ (A,B are nxn matrices)', answer:'det(A)det(B)', meaning:'矩阵乘积的行列式等于行列式的乘积',
     distractors:['det(A+B)','det(A)+det(B)','A*B','tr(AB)','0','1']},
    {sentence:'rank(A) + nullity(A) = _____', answer:'n', meaning:'秩-零化度定理：rank + nullity = 列数n',
     distractors:['m','0','det(A)','tr(A)','m+n','rank(A)']},
    {sentence:'Stokes theorem relates a surface integral to a _____ integral', answer:'line', meaning:'Stokes定理将面积分与线积分联系',
     distractors:['volume','double','triple','point','arc','area']},
    {sentence:'The Taylor series of cos(x) at x=0 starts with _____', answer:'1', meaning:'cos(x) = 1 - x^2/2! + x^4/4! - ...',
     distractors:['0','x','-1','x^2','pi','1/2']},
    {sentence:'Eigenvalues of a 2x2 identity matrix are _____', answer:'1,1', meaning:'单位矩阵的特征值全为1',
     distractors:['0,0','1,0','0,1','-1,1','2,2','1,-1']},
    {sentence:'The Laplace transform of f(t)=1 is _____', answer:'1/s', meaning:'L{1} = 1/s (s>0)',
     distractors:['s','1','0','e^s','1/s^2','ln(s)']},
    {sentence:'For convergent series, lim(n->inf) a_n must = _____', answer:'0', meaning:'收敛级数的通项必趋于0（必要条件）',
     distractors:['1','inf','-1','1/2','e','undefined']},
  ];

  const COLORS = ['c0','c1','c2','c3','c4','c5']; // 6 tile colors
  const GRID_SIZE = 6;
  const MOVES_PER_LEVEL = 25;
  const TARGET_MATCHES = 3; // need 3 target words to fill blank

  function getLevel(mode, idx) {
    const pool = mode === 'math' ? MATH_LEVELS : ENGLISH_LEVELS;
    if(idx < 0 || idx >= pool.length) return null;
    return {...pool[idx], index: idx, moves: MOVES_PER_LEVEL};
  }

  function getTotalLevels(mode) {
    return mode === 'math' ? MATH_LEVELS.length : ENGLISH_LEVELS.length;
  }

  function buildGrid(level) {
    const grid = [];
    const allWords = [level.answer, ...level.distractors];
    // Smart placement: avoid creating matches during setup
    for(let r=0; r<GRID_SIZE; r++){
      const row = [];
      for(let c=0; c<GRID_SIZE; c++){
        let word;
        let attempts = 0;
        do {
          word = allWords[Math.floor(Math.random()*allWords.length)];
          attempts++;
        } while(attempts < 20 && wouldMatch(grid, row, r, c, word));
        const colorIdx = allWords.indexOf(word) % COLORS.length;
        row.push({word, color: COLORS[colorIdx], isTarget: word===level.answer,
                  special:null, row:r, col:c});
      }
      grid.push(row);
    }
    // Ensure 3-5 target words exist
    const flatGrid = grid.flat();
    let targets = flatGrid.filter(t=>t.isTarget);
    // Add targets if too few
    while(targets.length < TARGET_MATCHES){
      const r = Math.floor(Math.random()*GRID_SIZE);
      const c = Math.floor(Math.random()*GRID_SIZE);
      const cell = grid[r][c];
      if(!cell.isTarget){
        cell.word = level.answer;
        cell.isTarget = true;
        cell.color = COLORS[0];
        targets.push(cell);
      }
    }
    // Remove excess targets
    while(targets.length > TARGET_MATCHES + 2){
      const t = targets.pop();
      const distractor = level.distractors[Math.floor(Math.random()*level.distractors.length)];
      t.word = distractor;
      t.isTarget = false;
      t.color = COLORS[allWords.indexOf(distractor) % COLORS.length];
    }
    return grid;
  }

  // Check if placing word at (r,c) creates a 3-match
  function wouldMatch(grid, currentRow, r, c, word) {
    // Check horizontal (left 2)
    if(c >= 2 && currentRow[c-1] && currentRow[c-2] &&
       currentRow[c-1].word === word && currentRow[c-2].word === word) return true;
    // Check vertical (up 2)
    if(r >= 2 && grid[r-1] && grid[r-2] &&
       grid[r-1][c].word === word && grid[r-2][c].word === word) return true;
    return false;
  }

  return { getLevel, getTotalLevels, buildGrid, GRID_SIZE, COLORS, TARGET_MATCHES };
})();

// ═══ Global Vault 自动加载 ═══
(function loadVaultForSiege() {
  try {
    for (const subCode of ['101','201','301','408']) {
      const raw = localStorage.getItem('Global_Vault_' + subCode);
      if (!raw) continue;
      const vaultQ = JSON.parse(raw);
      if (!Array.isArray(vaultQ)) continue;
      const converted = vaultQ.filter(q => q.stem && q.stem.length > 5).map(q => {
        const opts = (q.options || []).map(o => typeof o === 'string' ? o : String(o));
        let ansIdx = 0;
        if (q.answer) { ansIdx = 'ABCDE'.indexOf(String(q.answer).charAt(0).toUpperCase()); if(ansIdx<0) ansIdx=0; }
        return { stem: q.stem, opts, ans: ansIdx, explain: q.analysis || '', subject: subCode, fromVault: true };
      });
      if (converted.length > 0 && typeof SiegeData !== 'undefined') {
        SiegeData._vaultQ = SiegeData._vaultQ || [];
        SiegeData._vaultQ.push(...converted);
        console.log('[消消乐] ' + subCode + ' 金库加载 +' + converted.length + ' 题');
      }
    }
  } catch(e) { console.warn('[消消乐] 金库读取失败:', e.message); }
})();
