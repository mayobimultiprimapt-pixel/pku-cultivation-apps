/**
 * Ghost Dorm Engine
 * State: sanity, floor, rooms, scrolls, questions answered
 */
const GhostEngine = (() => {
  let S = null;

  function init() {
    const {rooms, hallQuestions} = GhostData.generateRooms();
    S = {
      sanity: 100,
      maxSanity: 100,
      floor: 1, // 1-3
      rooms,
      hallQuestions,
      hallQuestionsUsed: [false, false],
      scrollsCollected: 0,
      scrollsNeeded: 5,
      questionsAnswered: 0,
      questionsCorrect: 0,
      ghostsDefeated: 0,
      wrongAnswers: [], // {question, yourAnswer, correctAnswer}
      startedAt: Date.now(),
      finished: false,
      won: false,
      currentRoom: null,
    };
    return S;
  }

  function getState() { return S; }

  function getRoomsOnFloor(floor) {
    return S.rooms.filter(r => r.floor === floor);
  }

  function enterRoom(roomId) {
    const room = S.rooms.find(r => r.id === roomId);
    if(!room) return null;
    S.currentRoom = room;
    return room;
  }

  function exitRoom() {
    S.currentRoom = null;
  }

  // Search a spot in current room
  function searchSpot(spot) {
    if(!S.currentRoom) return null;
    const room = S.currentRoom;
    if(room.spotsSearched[spot]) return {type:'empty', msg:'这里已经搜过了'};
    room.spotsSearched[spot] = true;

    // First unsearched spot triggers trap question
    const searchedCount = Object.values(room.spotsSearched).filter(v=>v).length;

    if(searchedCount === 1 && !room.searched) {
      // First search: find item + trigger trap question
      room.searched = true;
      return {type:'trap', msg:'地上有张纸条...上面写着考题!', question: room.trapQuestion};
    }

    if(spot === 'desk' && room.hasScroll && !room.scrollCollected) {
      // Found scroll, but need guardian question
      return {type:'scroll', msg:'发现了一张密卷! 但它被诅咒保护着...', question: room.scrollQuestion};
    }

    // Random item
    const items = [
      {type:'talisman', msg:'发现一张符咒! 理智+15', effect:'sanity', value:15},
      {type:'nothing', msg:'什么都没有...只有灰尘', effect:null},
      {type:'fright', msg:'突然有东西动了! 理智-5', effect:'sanity', value:-5},
    ];
    const item = items[Math.floor(Math.random()*items.length)];
    if(item.effect === 'sanity') {
      S.sanity = Math.max(0, Math.min(100, S.sanity + item.value));
    }
    return item;
  }

  // Check if ghost encounter should trigger on room entry
  function checkGhostEncounter() {
    if(!S.currentRoom || S.currentRoom.ghostDefeated) return null;
    // Ghost appears after player has searched at least 1 spot
    const searched = Object.values(S.currentRoom.spotsSearched).filter(v=>v).length;
    if(searched >= 1) {
      return S.currentRoom;
    }
    return null;
  }

  // Force ghost encounter (called after trap question)
  function triggerGhost() {
    if(!S.currentRoom || S.currentRoom.ghostDefeated) return null;
    return {
      ghost: S.currentRoom.ghost,
      question: S.currentRoom.ghostQuestion,
      room: S.currentRoom,
    };
  }

  // Answer a question
  function answerQuestion(question, selectedIdx, context) {
    S.questionsAnswered++;
    const correct = selectedIdx === question.answer;

    if(correct) {
      S.questionsCorrect++;
      S.sanity = Math.min(100, S.sanity + 10);

      if(context === 'ghost') {
        S.currentRoom.ghostDefeated = true;
        S.ghostsDefeated++;
      }
      if(context === 'scroll') {
        S.currentRoom.scrollCollected = true;
        S.scrollsCollected++;
      }
    } else {
      // Wrong answer penalty
      const penalty = context === 'ghost' ? S.currentRoom.ghost.penalty : 15;
      S.sanity = Math.max(0, S.sanity - penalty);
      S.wrongAnswers.push({
        q: question.text,
        yours: question.options[selectedIdx],
        correct: question.options[question.answer],
        explain: question.explain,
      });
      if(context === 'ghost') {
        S.currentRoom.ghostDefeated = true; // Ghost leaves even if wrong
      }
    }

    // Check end conditions
    if(S.sanity <= 0) {
      S.finished = true;
      S.won = false;
    }
    if(S.scrollsCollected >= S.scrollsNeeded) {
      S.finished = true;
      S.won = true;
    }

    return {correct, sanity: S.sanity, finished: S.finished, won: S.won};
  }

  // Hallway ghost check when changing floors
  function hallwayGhost(floorTransition) {
    // floorTransition: 0 = going to 2F, 1 = going to 3F
    const idx = floorTransition;
    if(idx < 0 || idx >= S.hallQuestions.length) return null;
    if(S.hallQuestionsUsed[idx]) return null;
    S.hallQuestionsUsed[idx] = true;
    return {
      ghost: GhostData.GHOSTS[Math.min(idx, 2)],
      question: S.hallQuestions[idx],
    };
  }

  // Drain sanity (called periodically in hallway)
  function drainSanity(amount) {
    S.sanity = Math.max(0, S.sanity - amount);
    if(S.sanity <= 0) {
      S.finished = true;
      S.won = false;
    }
    return S.sanity;
  }

  function getGrade() {
    if(!S) return {qi:0};
    let qi = 5;
    qi += S.scrollsCollected * 5;
    qi += S.questionsCorrect * 2;
    if(S.won) qi += 20;
    if(S.questionsAnswered > 0) {
      const acc = S.questionsCorrect / S.questionsAnswered;
      if(acc >= 0.8) qi += 10;
    }
    return {qi};
  }

  function getElapsed() {
    return S ? Math.floor((Date.now() - S.startedAt) / 1000) : 0;
  }

  return {init, getState, getRoomsOnFloor, enterRoom, exitRoom,
    searchSpot, checkGhostEncounter, triggerGhost, answerQuestion,
    hallwayGhost, drainSanity, getGrade, getElapsed};
})();
