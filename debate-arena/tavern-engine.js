/**
 * 骗子酒馆 · Liar's Deck Engine v4.0
 * ========================================
 * 100牌池(30A+30K+30Q+10Joker) · 4人轮转博弈
 * 主牌声明 → 暗置出牌 → 跟随/开牌 → 俄罗斯轮盘
 * 最后1人存活者胜出
 */
const TavernEngine = (() => {
  let G = null; // Game state

  // ═══════════════════════════════════════════════
  //  Init: 开局
  // ═══════════════════════════════════════════════
  function init(subject) {
    const deck = TavernData.generateDeck(subject);
    shuffle(deck);

    const players = [
      { id:'player', name:'你', emoji:'🧑', isHuman:true, hand:[], alive:true, hp:6 },
      { id:'fox',    name:'酒鬼狐狸', emoji:'🦊', isHuman:false, hand:[], alive:true, hp:6,
        lieRate:0.50, callRate:0.45 },
    ];

    G = {
      subject,
      deck,            // draw pile
      discard: [],     // played cards
      players,
      // Rotation
      turnIndex: 0,    // whose turn to ACT (play a card)
      phase: 'intro',  // intro | declare | play | judge | reveal | roulette | npcRoulette | result
      // Round
      mainSuit: null,  // 'A','K','Q' — declared at start of each round
      roundNum: 0,
      maxRounds: 20,
      // Last played card (face-down on table)
      tableCard: null,      // the actual card object
      tablePlayerId: null,  // who played it
      tableClaim: null,     // what they claimed
      // Table history (all played cards for display)
      tableHistory: [],
      // Revolver
      chambers: buildChambers(),
      chamberIndex: 0,
      // Roulette target
      rouletteTarget: null,
      // Stats
      score: 0,
      correctCalls: 0,
      wrongCalls: 0,
      survived: 0,
      rouletteCount: 0,
      learnings: [],
      npcKills: 0,
      // Chips
      playerChips: 1500,
      pot: 0,
      npcChips: { fox:2100 },
    };

    // Deal 5 cards to each player
    players.forEach(p => {
      for (let i = 0; i < 5; i++) {
        const card = drawCard();
        if (card) p.hand.push(card);
      }
    });

    return G;
  }

  // ═══════════════════════════════════════════════
  //  Deck helpers
  // ═══════════════════════════════════════════════
  function drawCard() {
    if (!G || G.deck.length === 0) return null;
    return G.deck.pop();
  }

  function replenishHand(player) {
    while (player.hand.length < 5 && G.deck.length > 0) {
      player.hand.push(drawCard());
    }
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function buildChambers() {
    const c = [false,false,false,false,false,false];
    c[Math.floor(Math.random() * 6)] = true;
    return c;
  }

  // ═══════════════════════════════════════════════
  //  Turn management
  // ═══════════════════════════════════════════════
  function getAlive() {
    return G.players.filter(p => p.alive);
  }

  function getCurrentPlayer() {
    return G.players[G.turnIndex];
  }

  function getNextAliveIndex(fromIdx) {
    let idx = (fromIdx + 1) % G.players.length;
    let safety = 0;
    while (!G.players[idx].alive && safety < 8) {
      idx = (idx + 1) % G.players.length;
      safety++;
    }
    return idx;
  }

  function advanceTurn() {
    G.turnIndex = getNextAliveIndex(G.turnIndex);
  }

  // ═══════════════════════════════════════════════
  //  Phase: Declare main suit
  // ═══════════════════════════════════════════════
  function declareMainSuit() {
    const suits = ['A', 'K', 'Q'];
    G.mainSuit = suits[Math.floor(Math.random() * 3)];
    G.roundNum++;
    G.phase = 'play';
    // Bet into pot
    const bet = 25;
    G.pot += bet * getAlive().length;
    G.playerChips -= bet;
    Object.keys(G.npcChips).forEach(k => { G.npcChips[k] -= bet; });
    return G.mainSuit;
  }

  // ═══════════════════════════════════════════════
  //  Phase: Play a card (human or NPC)
  // ═══════════════════════════════════════════════

  /**
   * Human plays 1-3 cards from hand
   * @param {number[]} cardIndices - indices in player's hand (1 to 3)
   */
  function playerPlayCards(cardIndices) {
    const player = G.players[0];
    if (!player.alive || cardIndices.length === 0 || cardIndices.length > 3) return null;

    // Sort descending so splice doesn't shift indices
    const sorted = [...cardIndices].sort((a, b) => b - a);
    const cards = sorted.map(i => player.hand.splice(i, 1)[0]).reverse();

    G.tableCards = cards;
    G.tablePlayerId = player.id;
    G.tableClaim = G.mainSuit;

    G.tableHistory.push({
      cards,
      count: cards.length,
      playerId: player.id,
      playerEmoji: player.emoji,
      playerName: player.name,
      claimed: G.mainSuit,
      revealed: false,
    });

    replenishHand(player);
    G.phase = 'judge';
    advanceTurn();

    return { cards, claim: G.mainSuit, count: cards.length };
  }

  /**
   * NPC plays 1-3 cards (AI decision)
   */
  function npcPlayCards() {
    const npc = getCurrentPlayer();
    if (!npc || npc.isHuman || !npc.alive) return null;

    // AI: decide how many cards to play (1-3)
    const maxPlay = Math.min(3, npc.hand.length);
    const playCount = Math.min(maxPlay, Math.floor(Math.random() * 3) + 1);

    const mainCards = npc.hand.map((c, i) => ({ c, i }))
      .filter(x => x.c.suit === G.mainSuit || x.c.suit === 'Joker');
    const otherCards = npc.hand.map((c, i) => ({ c, i }))
      .filter(x => x.c.suit !== G.mainSuit && x.c.suit !== 'Joker');

    const willLie = Math.random() < (npc.lieRate || 0.4);
    const selectedIndices = [];

    for (let n = 0; n < playCount; n++) {
      if (willLie && otherCards.length > 0) {
        const pick = otherCards.splice(Math.floor(Math.random() * otherCards.length), 1)[0];
        selectedIndices.push(pick.i);
      } else if (mainCards.length > 0) {
        const pick = mainCards.splice(Math.floor(Math.random() * mainCards.length), 1)[0];
        selectedIndices.push(pick.i);
      } else if (otherCards.length > 0) {
        const pick = otherCards.splice(Math.floor(Math.random() * otherCards.length), 1)[0];
        selectedIndices.push(pick.i);
      }
    }

    // Sort descending to splice safely
    const sorted = [...selectedIndices].sort((a, b) => b - a);
    const cards = sorted.map(i => npc.hand.splice(i, 1)[0]).reverse();

    G.tableCards = cards;
    G.tablePlayerId = npc.id;
    G.tableClaim = G.mainSuit;

    G.tableHistory.push({
      cards,
      count: cards.length,
      playerId: npc.id,
      playerEmoji: npc.emoji,
      playerName: npc.name,
      claimed: G.mainSuit,
      revealed: false,
    });

    replenishHand(npc);
    G.phase = 'judge';
    advanceTurn();

    return {
      npc,
      claim: G.mainSuit,
      count: cards.length,
      cardBack: true,
    };
  }

  // ═══════════════════════════════════════════════
  //  Phase: Judge (Follow or Call)
  // ═══════════════════════════════════════════════

  /**
   * Human decision: follow (check) or call (liar)
   * @param {string} action - 'follow' or 'call'
   */
  function judgeAction(action) {
    if (action === 'call') {
      return revealCards();
    }
    return { action: 'follow', nextPlayer: getCurrentPlayer() };
  }

  /**
   * NPC judges the last played card
   * Returns the NPC's decision
   */
  function npcJudge() {
    const npc = getCurrentPlayer();
    if (!npc || npc.isHuman || !npc.alive) return null;

    let callProb = npc.callRate || 0.4;
    const mainInHand = npc.hand.filter(c => c.suit === G.mainSuit || c.suit === 'Joker').length;
    if (mainInHand >= 3) callProb += 0.2;
    if (mainInHand === 0) callProb -= 0.15;
    // More cards played = more suspicious
    if ((G.tableCards || []).length >= 3) callProb += 0.15;
    if (G.roundNum > 10) callProb += 0.1;

    const willCall = Math.random() < Math.min(0.85, Math.max(0.1, callProb));

    if (willCall) {
      const result = revealCards();
      return { action: 'call', npc, result };
    } else {
      G.phase = 'play';
      return { action: 'follow', npc, nextPlayer: getCurrentPlayer() };
    }
  }

  // ═══════════════════════════════════════════════
  //  Reveal: flip the table card
  // ═══════════════════════════════════════════════
  function revealCards() {
    const cards = G.tableCards || [];
    const playerId = G.tablePlayerId;
    const judgerId = getCurrentPlayer().id;

    // Check if ALL cards are main suit or Joker
    const allLegit = cards.every(c => c.suit === G.mainSuit || c.suit === 'Joker');

    // Mark as revealed in history
    const lastEntry = G.tableHistory[G.tableHistory.length - 1];
    if (lastEntry) lastEntry.revealed = true;

    let loserId, winnerId;
    if (allLegit) {
      // All cards legit → challenger loses
      loserId = judgerId;
      winnerId = playerId;
    } else {
      // Contains fake card → liar loses
      loserId = playerId;
      winnerId = judgerId;
    }

    const loser = G.players.find(p => p.id === loserId);
    const winner = G.players.find(p => p.id === winnerId);
    const liar = G.players.find(p => p.id === playerId);
    const challenger = G.players.find(p => p.id === judgerId);

    // Score
    if (winner.isHuman) {
      G.score += 30;
      G.correctCalls++;
    }
    if (loser.isHuman) {
      G.wrongCalls++;
    }

    // Learning: add ALL card knowledge
    cards.forEach(c => {
      if (c.knowledge) G.learnings.push(c.knowledge);
    });

    G.rouletteTarget = loserId;
    G.phase = loser.isHuman ? 'roulette' : 'npcRoulette';

    return {
      cards,
      allLegit,
      liar,
      challenger,
      loser,
      winner,
      explanation: cards.map(c => c.knowledge || c.text || '').join('\n'),
    };
  }

  // ═══════════════════════════════════════════════
  //  Roulette
  // ═══════════════════════════════════════════════
  function pullTrigger() {
    const targetId = G.rouletteTarget;
    const target = G.players.find(p => p.id === targetId);
    if (!target) return { hit: true };

    G.rouletteCount++;
    const hit = G.chambers[G.chamberIndex];
    G.chamberIndex++;

    if (hit) {
      target.hp = 0;
      target.alive = false;
      if (target.isHuman) {
        G.phase = 'result';
      } else {
        G.npcKills++;
      }
    } else {
      G.survived++;
      G.score += 5;
      // Refill chambers if empty
      if (G.chamberIndex >= 6) {
        G.chambers = buildChambers();
        G.chamberIndex = 0;
      }
    }

    // Check win condition
    const alive = getAlive();
    if (alive.length <= 1) {
      G.phase = 'result';
      return { hit, target, gameOver: true, winner: alive[0] };
    }

    return { hit, target, gameOver: false };
  }

  /**
   * After roulette: reshuffle table cards back, redeal to all alive players
   */
  function continueAfterRoulette() {
    if (G.phase === 'result') return false;

    if (G.roundNum >= G.maxRounds || G.deck.length === 0) {
      G.phase = 'result';
      return false;
    }

    const alive = getAlive();
    if (alive.length <= 1) {
      G.phase = 'result';
      return false;
    }

    // Collect all table cards back into deck
    G.tableHistory.forEach(entry => {
      if (entry.cards) entry.cards.forEach(c => G.deck.push(c));
    });
    G.tableHistory = [];
    G.tableCards = null;
    G.tablePlayerId = null;
    shuffle(G.deck);

    // Redeal 5 cards to each alive player
    alive.forEach(p => {
      p.hand = [];
      for (let i = 0; i < 5 && G.deck.length > 0; i++) {
        p.hand.push(G.deck.pop());
      }
    });

    G.phase = 'declare';
    const loserIdx = G.players.findIndex(p => p.id === G.rouletteTarget);
    if (loserIdx >= 0 && G.players[loserIdx].alive) {
      G.turnIndex = loserIdx;
    } else {
      G.turnIndex = getNextAliveIndex(loserIdx >= 0 ? loserIdx : G.turnIndex);
    }

    return true;
  }

  // ═══════════════════════════════════════════════
  //  Grading
  // ═══════════════════════════════════════════════
  function getGrade() {
    if (!G) return { title:'韭菜', qi:0 };
    const playerAlive = G.players[0].alive;
    const kills = G.npcKills;

    let title, qi;
    if (playerAlive && kills >= 3) { title = '🏆 酒神'; qi = 120; }
    else if (playerAlive && kills >= 2) { title = '⭐ 赌圣'; qi = 80; }
    else if (playerAlive && kills >= 1) { title = '🍺 老炮'; qi = 50; }
    else if (playerAlive) { title = '🍺 幸存者'; qi = 30; }
    else { title = '💀 醉鬼'; qi = 10; }

    return { title, qi };
  }

  // ═══════════════════════════════════════════════
  //  Accessors
  // ═══════════════════════════════════════════════
  function getState() { return G; }
  function destroy() { G = null; }

  return {
    init, declareMainSuit,
    playerPlayCards, npcPlayCards,
    judgeAction, npcJudge,
    revealCards, pullTrigger, continueAfterRoulette,
    getCurrentPlayer, getAlive, getNextAliveIndex,
    getGrade, getState, destroy,
  };
})();
