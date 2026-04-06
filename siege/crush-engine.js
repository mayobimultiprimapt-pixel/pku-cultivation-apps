/**
 * Vocabulary Crush Engine
 * Match-3 with word tiles: swap, match, cascade, special tiles
 */
const CrushEngine = (() => {
  let S = null;
  const SIZE = 6;

  function init(mode, levelIdx) {
    const level = CrushData.getLevel(mode, levelIdx);
    if(!level) return null;
    S = {
      mode, levelIdx, level,
      grid: CrushData.buildGrid(level),
      score: 0,
      moves: level.moves,
      maxMoves: level.moves,
      combo: 0,
      maxCombo: 0,
      targetMatched: 0,
      targetNeeded: CrushData.TARGET_MATCHES,
      wordsLearned: [level.meaning],
      finished: false,
      won: false,
      startedAt: Date.now(),
    };
    return S;
  }

  function getState() { return S; }
  function getGrid() { return S ? S.grid : null; }

  function swap(r1,c1,r2,c2) {
    if(!S || S.finished) return null;
    // Must be adjacent
    if(Math.abs(r1-r2)+Math.abs(c1-c2) !== 1) return null;

    // Do swap
    doSwap(r1,c1,r2,c2);

    // Check matches
    const matches = findMatches();
    if(matches.length === 0) {
      // No match, swap back
      doSwap(r1,c1,r2,c2);
      return { valid:false };
    }

    S.moves--;
    S.combo = 0;

    // Process chain
    const result = processChain();
    result.valid = true;

    // Check win/lose
    if(S.targetMatched >= S.targetNeeded) {
      S.won = true;
      S.finished = true;
    } else if(S.moves <= 0) {
      S.finished = true;
    }

    result.finished = S.finished;
    result.won = S.won;
    return result;
  }

  function doSwap(r1,c1,r2,c2) {
    const tmp = {...S.grid[r1][c1]};
    S.grid[r1][c1] = {...S.grid[r2][c2], row:r1, col:c1};
    S.grid[r2][c2] = {...tmp, row:r2, col:c2};
  }

  function findMatches() {
    const matches = new Set();
    const g = S.grid;
    // Horizontal
    for(let r=0;r<SIZE;r++){
      for(let c=0;c<SIZE-2;c++){
        if(g[r][c].word && g[r][c].word===g[r][c+1].word && g[r][c].word===g[r][c+2].word){
          matches.add(`${r},${c}`);matches.add(`${r},${c+1}`);matches.add(`${r},${c+2}`);
          // Check for 4 or 5
          if(c+3<SIZE && g[r][c].word===g[r][c+3].word) matches.add(`${r},${c+3}`);
          if(c+4<SIZE && g[r][c].word===g[r][c+4].word) matches.add(`${r},${c+4}`);
        }
      }
    }
    // Vertical
    for(let c=0;c<SIZE;c++){
      for(let r=0;r<SIZE-2;r++){
        if(g[r][c].word && g[r][c].word===g[r+1][c].word && g[r][c].word===g[r+2][c].word){
          matches.add(`${r},${c}`);matches.add(`${r+1},${c}`);matches.add(`${r+2},${c}`);
          if(r+3<SIZE && g[r][c].word===g[r+3][c].word) matches.add(`${r+3},${c}`);
          if(r+4<SIZE && g[r][c].word===g[r+4][c].word) matches.add(`${r+4},${c}`);
        }
      }
    }
    return [...matches].map(s => {
      const [r,c] = s.split(',').map(Number);
      return {r,c,tile:g[r][c]};
    });
  }

  function processChain() {
    const allMatched = [];
    let chainCount = 0;

    while(true) {
      const matches = findMatches();
      if(matches.length === 0) break;
      chainCount++;
      S.combo++;
      S.maxCombo = Math.max(S.maxCombo, S.combo);

      // Score
      const baseScore = matches.length * 10;
      const multiplier = Math.min(chainCount, 5);
      const gained = baseScore * multiplier;
      S.score += gained;

      // Check for target words
      const targetHits = matches.filter(m => m.tile.isTarget);
      S.targetMatched += targetHits.length;

      // Record
      allMatched.push({matches:[...matches], chain:chainCount, score:gained,
                       targetHits:targetHits.length});

      // Remove matched tiles
      for(const m of matches){
        S.grid[m.r][m.c] = {word:null,color:null,isTarget:false,special:null,row:m.r,col:m.c};
      }

      // Drop tiles
      dropTiles();

      // Fill new tiles
      fillEmpty();
    }

    return {chains:allMatched, totalChains:chainCount, combo:S.combo};
  }

  function dropTiles() {
    for(let c=0;c<SIZE;c++){
      let writeRow = SIZE-1;
      for(let r=SIZE-1;r>=0;r--){
        if(S.grid[r][c].word !== null){
          if(r !== writeRow){
            S.grid[writeRow][c] = {...S.grid[r][c], row:writeRow, col:c};
            S.grid[r][c] = {word:null,color:null,isTarget:false,special:null,row:r,col:c};
          }
          writeRow--;
        }
      }
    }
  }

  function fillEmpty() {
    const level = S.level;
    const allWords = [level.answer, ...level.distractors];
    for(let r=0;r<SIZE;r++){
      for(let c=0;c<SIZE;c++){
        if(S.grid[r][c].word === null){
          // Small chance of target word if we still need them
          const needMore = S.targetMatched < S.targetNeeded;
          const currentTargets = S.grid.flat().filter(t=>t.isTarget).length;
          let word;
          if(needMore && currentTargets < 2 && Math.random()<0.15){
            word = level.answer;
          } else {
            word = allWords[Math.floor(Math.random()*allWords.length)];
          }
          const colorIdx = allWords.indexOf(word) % CrushData.COLORS.length;
          S.grid[r][c] = {
            word, color:CrushData.COLORS[colorIdx],
            isTarget:word===level.answer,
            special:null, row:r, col:c, isNew:true
          };
        }
      }
    }
  }

  function getGrade() {
    if(!S) return {stars:0,qi:0};
    const movesUsed = S.maxMoves - S.moves;
    const efficiency = S.moves / S.maxMoves; // remaining ratio
    let stars, qi;
    if(S.won){
      if(efficiency >= 0.5) {stars=3;qi=35;}
      else if(efficiency >= 0.25) {stars=2;qi=25;}
      else {stars=1;qi=15;}
    } else {
      stars=0;qi=5;
    }
    if(S.maxCombo >= 4) qi += 10;
    return {stars, qi};
  }

  function getElapsed() {
    return S ? Math.floor((Date.now()-S.startedAt)/1000) : 0;
  }

  function destroy() { S = null; }

  return {init,getState,getGrid,swap,getGrade,getElapsed,destroy};
})();
