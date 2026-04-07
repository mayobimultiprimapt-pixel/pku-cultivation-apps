/**
 * Vocabulary Crush Engine — v2.0
 * Match-3 with word tiles: swap, match, cascade, special tiles (bomb + rainbow)
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
    if(Math.abs(r1-r2)+Math.abs(c1-c2) !== 1) return null;

    // Check for special tile activation (rainbow click)
    const tile1 = S.grid[r1][c1];
    const tile2 = S.grid[r2][c2];

    // Rainbow special: clear all tiles of the swapped word
    if(tile1.special === 'rainbow' || tile2.special === 'rainbow') {
      S.moves--;
      S.combo = 0;
      const rainbowTile = tile1.special === 'rainbow' ? tile1 : tile2;
      const otherTile = tile1.special === 'rainbow' ? tile2 : tile1;
      const result = activateRainbow(rainbowTile, otherTile.word);
      result.valid = true;
      checkWinLose(result);
      return result;
    }

    // Do swap
    doSwap(r1,c1,r2,c2);

    // Check matches
    const matches = findMatches();
    if(matches.length === 0) {
      doSwap(r1,c1,r2,c2);
      return { valid:false };
    }

    S.moves--;
    S.combo = 0;

    // Determine special tile creation from this swap
    const swapInfo = {r1,c1,r2,c2};
    const result = processChain(swapInfo);
    result.valid = true;

    checkWinLose(result);
    return result;
  }

  function checkWinLose(result) {
    if(S.targetMatched >= S.targetNeeded) {
      S.won = true;
      S.finished = true;
    } else if(S.moves <= 0) {
      S.finished = true;
    }
    result.finished = S.finished;
    result.won = S.won;
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

  function processChain(swapInfo) {
    const allMatched = [];
    let chainCount = 0;
    let firstChain = true;

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

      // ═══ 特殊方块生成 (4消=炸弹, 5消=彩虹) ═══
      let specialCreated = null;
      if(firstChain && swapInfo) {
        // Group matches by word to find the line length
        const matchCount = matches.length;
        if(matchCount >= 5) {
          // 5+消: 生成彩虹方块
          specialCreated = { type:'rainbow', r:swapInfo.r1, c:swapInfo.c1 };
        } else if(matchCount >= 4) {
          // 4消: 生成炸弹方块
          specialCreated = { type:'bomb', r:swapInfo.r1, c:swapInfo.c1 };
        }
      }

      // Record
      allMatched.push({matches:[...matches], chain:chainCount, score:gained,
                       targetHits:targetHits.length, specialCreated});

      // Activate specials that were matched
      for(const m of matches) {
        if(m.tile.special === 'bomb') {
          activateBomb(m.r, m.c, matches);
        }
      }

      // Remove matched tiles
      for(const m of matches){
        S.grid[m.r][m.c] = {word:null,color:null,isTarget:false,special:null,row:m.r,col:m.c};
      }

      // Place special tile if created (after clearing)
      if(specialCreated) {
        const sr = specialCreated.r, sc = specialCreated.c;
        if(S.grid[sr][sc].word === null) {
          // Create a new tile with special power
          const level = S.level;
          const allWords = [level.answer, ...level.distractors];
          const word = allWords[Math.floor(Math.random()*allWords.length)];
          const colorIdx = allWords.indexOf(word) % CrushData.COLORS.length;
          S.grid[sr][sc] = {
            word, color:CrushData.COLORS[colorIdx],
            isTarget:word===level.answer,
            special:specialCreated.type, row:sr, col:sc, isNew:true
          };
        }
      }

      // Drop tiles
      dropTiles();
      // Fill new tiles
      fillEmpty();
      firstChain = false;
    }

    return {chains:allMatched, totalChains:chainCount, combo:S.combo};
  }

  // ═══ 炸弹爆炸: 清除周围8格 ═══
  function activateBomb(r, c, existingMatches) {
    const matchSet = new Set(existingMatches.map(m => `${m.r},${m.c}`));
    for(let dr=-1; dr<=1; dr++) {
      for(let dc=-1; dc<=1; dc++) {
        const nr = r+dr, nc = c+dc;
        if(nr>=0 && nr<SIZE && nc>=0 && nc<SIZE) {
          const key = `${nr},${nc}`;
          if(!matchSet.has(key) && S.grid[nr][nc].word !== null) {
            // Count target hits from bomb
            if(S.grid[nr][nc].isTarget) S.targetMatched++;
            S.score += 15;
            S.grid[nr][nc] = {word:null,color:null,isTarget:false,special:null,row:nr,col:nc};
          }
        }
      }
    }
  }

  // ═══ 彩虹消除: 清除全场同色/同词方块 ═══
  function activateRainbow(rainbowTile, targetWord) {
    const chains = [];
    const matches = [];
    let scoreGained = 0;

    // Clear all tiles matching the target word
    for(let r=0; r<SIZE; r++) {
      for(let c=0; c<SIZE; c++) {
        if(S.grid[r][c].word === targetWord) {
          if(S.grid[r][c].isTarget) S.targetMatched++;
          matches.push({r,c,tile:{...S.grid[r][c]}});
          S.grid[r][c] = {word:null,color:null,isTarget:false,special:null,row:r,col:c};
          scoreGained += 20;
        }
      }
    }

    // Also clear the rainbow tile itself
    const rr = rainbowTile.row, rc = rainbowTile.col;
    if(S.grid[rr][rc].word !== null) {
      S.grid[rr][rc] = {word:null,color:null,isTarget:false,special:null,row:rr,col:rc};
    }

    S.score += scoreGained;
    S.combo++;
    S.maxCombo = Math.max(S.maxCombo, S.combo);

    chains.push({matches, chain:1, score:scoreGained, targetHits:matches.filter(m=>m.tile&&m.tile.isTarget).length, specialCreated:{type:'rainbow_activated'}});

    dropTiles();
    fillEmpty();

    // Continue chain if new matches appeared
    const bonus = processChain(null);
    chains.push(...bonus.chains);

    return {chains, totalChains:1+bonus.totalChains, combo:S.combo};
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
    const efficiency = S.moves / S.maxMoves;
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
