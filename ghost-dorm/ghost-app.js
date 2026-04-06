/**
 * Ghost Dorm Controller
 * Manages screen transitions, rendering, ghost encounters, timers
 */
const GhostApp = (() => {
  let sanityTimer = null;
  let ghostTimer = null;
  let ghostCountdown = 0;
  let currentQuestionContext = null; // 'trap','ghost','scroll','hallway'
  let currentQuestion = null;
  let pendingGhost = false;

  function startGame() {
    GhostEngine.init();
    pendingGhost = false;
    show('hallScreen');
    renderHall();
    startSanityDrain();
  }

  // ═══ HALLWAY ═══
  function renderHall() {
    const S = GhostEngine.getState();
    if(!S) return;

    // HUD
    updateSanityUI();
    document.getElementById('hudFloor').textContent = S.floor + 'F';
    document.getElementById('hudScrolls').textContent = S.scrollsCollected;
    document.getElementById('navFloorLabel').textContent = S.floor + 'F 走廊';

    // Floor nav
    document.getElementById('navDown').disabled = S.floor <= 1;
    document.getElementById('navUp').disabled = S.floor >= 3;

    // Doors
    const rooms = GhostEngine.getRoomsOnFloor(S.floor);
    const container = document.getElementById('hallDoors');
    container.innerHTML = '';
    rooms.forEach(room => {
      const el = document.createElement('div');
      el.className = 'door';
      if(room.searched) el.classList.add('searched');
      if(!room.ghostDefeated && room.searched) el.classList.add('has-ghost');
      if(room.hasScroll && !room.scrollCollected) el.classList.add('has-scroll');

      let status = '未探索';
      if(room.searched && room.ghostDefeated) status = '已清理';
      else if(room.searched) status = '有动静...';

      el.innerHTML = `<div class="door-num">Room ${room.id}</div>
                      <div class="door-status">${status}</div>`;
      el.addEventListener('click', () => {
        if(!room.searched || !room.ghostDefeated) enterRoom(room.id);
      });
      container.appendChild(el);
    });

    // Random hallway ghost flash
    if(Math.random() < 0.15) {
      const ghost = document.getElementById('hallGhost');
      ghost.classList.remove('hidden');
      setTimeout(() => ghost.classList.add('hidden'), 600);
    }

    // Low sanity warning
    document.getElementById('app').classList.toggle('low-sanity', S.sanity < 30);
  }

  function changeFloor(dir) {
    const S = GhostEngine.getState();
    const newFloor = S.floor + dir;
    if(newFloor < 1 || newFloor > 3) return;

    // Check hallway ghost
    const hallIdx = dir > 0 ? S.floor - 1 : newFloor - 1;
    const encounter = GhostEngine.hallwayGhost(hallIdx);

    if(encounter) {
      // Show warning first
      const warn = document.getElementById('hallWarn');
      warn.classList.remove('hidden');
      warn.textContent = '楼梯间传来奇怪的声音...';
      setTimeout(() => {
        warn.classList.add('hidden');
        S.floor = newFloor;
        showGhostEncounter(encounter.ghost, encounter.question, 'hallway');
      }, 1500);
    } else {
      S.floor = newFloor;
      renderHall();
    }
  }

  // ═══ ROOM ═══
  function enterRoom(roomId) {
    const room = GhostEngine.enterRoom(roomId);
    if(!room) return;
    stopSanityDrain();
    show('roomScreen');
    renderRoom();
  }

  function renderRoom() {
    const S = GhostEngine.getState();
    const room = S.currentRoom;
    if(!room) return;

    document.getElementById('roomLabel').textContent = `Room ${room.id}`;
    document.getElementById('roomSanity').textContent = S.sanity;

    // Reset hotspots
    document.querySelectorAll('.hotspot').forEach(h => {
      h.classList.remove('searched');
    });
    if(room.spotsSearched.desk) document.querySelector('.hs-desk').classList.add('searched');
    if(room.spotsSearched.closet) document.querySelector('.hs-closet').classList.add('searched');
    if(room.spotsSearched.bed) document.querySelector('.hs-bed').classList.add('searched');

    document.getElementById('roomFound').classList.add('hidden');
  }

  function searchSpot(spot) {
    const result = GhostEngine.searchSpot(spot);
    if(!result) return;

    const foundEl = document.getElementById('roomFound');
    const foundIcon = document.getElementById('foundIcon');
    const foundText = document.getElementById('foundText');

    if(result.type === 'trap') {
      // Show found, then trigger trap question
      foundIcon.textContent = '📝';
      foundText.textContent = result.msg;
      foundEl.classList.remove('hidden');
      currentQuestion = result.question;
      currentQuestionContext = 'trap';
      pendingGhost = true;
      setTimeout(() => {
        foundEl.classList.add('hidden');
        showGhostEncounter(
          {icon:'🧟', name:'知识陷阱', speech:'这里有道题...答不出来就困在这里!', timer:12, penalty:15},
          result.question, 'trap');
      }, 1500);
      return;
    }

    if(result.type === 'scroll') {
      foundIcon.textContent = '📜';
      foundText.textContent = result.msg;
      foundEl.classList.remove('hidden');
      currentQuestion = result.question;
      currentQuestionContext = 'scroll';
      setTimeout(() => {
        foundEl.classList.add('hidden');
        showGhostEncounter(
          {icon:'🛡', name:'密卷守护者', speech:'想拿走这张密卷? 先过我这关!', timer:10, penalty:20},
          result.question, 'scroll');
      }, 1500);
      return;
    }

    // Normal item
    foundIcon.textContent = result.type === 'talisman' ? '🧿' : result.type === 'fright' ? '😨' : '💨';
    foundText.textContent = result.msg;
    foundEl.classList.remove('hidden');
    setTimeout(() => foundEl.classList.add('hidden'), 2000);

    // Render updated state
    renderRoom();
    updateSanityUI();

    // Check if ghost should appear
    if(pendingGhost) return;
    const ghostCheck = GhostEngine.checkGhostEncounter();
    if(ghostCheck && !ghostCheck.ghostDefeated) {
      pendingGhost = true;
      setTimeout(() => {
        const enc = GhostEngine.triggerGhost();
        if(enc) {
          showGhostEncounter(enc.ghost, enc.question, 'ghost');
        }
      }, 2000);
    }

    // Check sanity
    checkGameEnd();
  }

  function exitRoom() {
    GhostEngine.exitRoom();
    pendingGhost = false;
    show('hallScreen');
    renderHall();
    startSanityDrain();
  }

  // ═══ GHOST ENCOUNTER ═══
  function showGhostEncounter(ghost, question, context) {
    currentQuestion = question;
    currentQuestionContext = context;

    show('ghostScreen');

    // Ghost visual
    document.getElementById('ghostFigure').textContent = ghost.icon;
    document.getElementById('ghostSpeech').textContent = ghost.speech;

    // Subject label
    const subjectMap = {politics:'政治101', english:'英语201', math:'数学301', cs408:'计算机408'};
    document.getElementById('gqSubject').textContent = subjectMap[question.subject] || '综合';

    // Question text
    document.getElementById('gqText').textContent = question.text;

    // Options
    const optContainer = document.getElementById('gqOptions');
    optContainer.innerHTML = '';
    const labels = ['A','B','C','D'];
    question.options.forEach((opt, i) => {
      const el = document.createElement('div');
      el.className = 'gq-opt';
      el.textContent = `${labels[i]}. ${opt}`;
      el.addEventListener('click', () => selectAnswer(i));
      optContainer.appendChild(el);
    });

    // Timer
    ghostCountdown = ghost.timer;
    document.getElementById('gqTimer').textContent = ghostCountdown;
    document.getElementById('ghostResult').classList.add('hidden');

    clearInterval(ghostTimer);
    ghostTimer = setInterval(() => {
      ghostCountdown--;
      document.getElementById('gqTimer').textContent = ghostCountdown;
      if(ghostCountdown <= 0) {
        clearInterval(ghostTimer);
        selectAnswer(-1); // Time's up = wrong
      }
    }, 1000);
  }

  function selectAnswer(idx) {
    clearInterval(ghostTimer);

    // Disable options
    document.querySelectorAll('.gq-opt').forEach(el => {
      el.style.pointerEvents = 'none';
    });

    const question = currentQuestion;
    const actualIdx = idx < 0 ? -1 : idx;
    const result = GhostEngine.answerQuestion(question, actualIdx, currentQuestionContext);

    // Highlight correct/wrong
    const opts = document.querySelectorAll('.gq-opt');
    opts.forEach((el, i) => {
      if(i === question.answer) el.classList.add('correct');
      if(i === actualIdx && actualIdx !== question.answer) el.classList.add('wrong');
    });

    // Show result after delay
    setTimeout(() => {
      const resEl = document.getElementById('ghostResult');
      resEl.classList.remove('hidden');
      document.getElementById('grIcon').textContent = result.correct ? '✅' : '❌';
      document.getElementById('grText').textContent = result.correct ? '正确! 鬼被驱散了' : '答错了...';
      document.getElementById('grText').style.color = result.correct ? '#10b981' : '#ef4444';
      document.getElementById('grExplain').textContent = question.explain;

      if(!result.correct && currentQuestionContext === 'ghost') {
        // Jump scare!
        showJumpScare();
      }

      updateSanityUI();

      if(result.finished) {
        setTimeout(() => showGameEnd(result.won), 1500);
      }
    }, 800);
  }

  function afterGhost() {
    pendingGhost = false;
    const S = GhostEngine.getState();
    if(S.finished) {
      showGameEnd(S.won);
      return;
    }

    if(currentQuestionContext === 'hallway') {
      show('hallScreen');
      renderHall();
      startSanityDrain();
    } else {
      show('roomScreen');
      renderRoom();
      // Check if ghost still needs to appear
      if(currentQuestionContext === 'trap') {
        const enc = GhostEngine.triggerGhost();
        if(enc) {
          setTimeout(() => {
            showGhostEncounter(enc.ghost, enc.question, 'ghost');
          }, 1000);
          return;
        }
      }
    }
  }

  // ═══ JUMP SCARE ═══
  function showJumpScare() {
    const js = document.getElementById('jumpScare');
    js.classList.remove('hidden');
    if(navigator.vibrate) navigator.vibrate([100,50,200]);
    setTimeout(() => js.classList.add('hidden'), 800);
  }

  // ═══ SANITY ═══
  function startSanityDrain() {
    stopSanityDrain();
    sanityTimer = setInterval(() => {
      const sanity = GhostEngine.drainSanity(0.5);
      updateSanityUI();
      if(sanity <= 0) {
        stopSanityDrain();
        showGameEnd(false);
      }
    }, 1000);
  }

  function stopSanityDrain() {
    clearInterval(sanityTimer);
  }

  function updateSanityUI() {
    const S = GhostEngine.getState();
    if(!S) return;
    const pct = Math.max(0, (S.sanity / S.maxSanity) * 100);
    const fill = document.getElementById('sanityFill');
    if(fill) fill.style.width = pct + '%';
    const val = document.getElementById('sanityVal');
    if(val) val.textContent = Math.round(S.sanity);
    const roomSanity = document.getElementById('roomSanity');
    if(roomSanity) roomSanity.textContent = Math.round(S.sanity);
    document.getElementById('app').classList.toggle('low-sanity', S.sanity < 30);
  }

  // ═══ GAME END ═══
  function checkGameEnd() {
    const S = GhostEngine.getState();
    if(S && S.finished) showGameEnd(S.won);
  }

  function showGameEnd(won) {
    stopSanityDrain();
    clearInterval(ghostTimer);

    const S = GhostEngine.getState();
    const {qi} = GhostEngine.getGrade();
    const elapsed = GhostEngine.getElapsed();
    const m = Math.floor(elapsed/60), s = elapsed%60;

    show('overScreen');
    const card = document.querySelector('.over-card');
    card.className = 'over-card' + (won ? ' win' : '');

    document.getElementById('overIcon').textContent = won ? '🌅' : '💀';
    document.getElementById('overTitle').textContent = won ? '天亮了!' : '理智崩溃...';
    document.getElementById('overSub').textContent = won
      ? '你成功收集了全部密卷并存活到天亮!' : '你被厉鬼抓走了...';

    document.getElementById('ogTime').textContent = `${m}:${String(s).padStart(2,'0')}`;
    document.getElementById('ogScrolls').textContent = `${S.scrollsCollected}/5`;
    document.getElementById('ogTotal').textContent = S.questionsAnswered;
    const acc = S.questionsAnswered > 0
      ? Math.round(S.questionsCorrect / S.questionsAnswered * 100) : 0;
    document.getElementById('ogAcc').textContent = acc + '%';
    document.getElementById('ogGhosts').textContent = S.ghostsDefeated;
    document.getElementById('ogQi').textContent = `+${qi}`;

    // Wrong answers review
    const learn = document.getElementById('overLearn');
    if(S.wrongAnswers.length > 0) {
      learn.innerHTML = '<div class="over-learn-title">你答错的题:</div>' +
        S.wrongAnswers.map(w =>
          `<div class="over-learn-item">
            <strong>Q:</strong> ${w.q}<br>
            <span style="color:#ef4444">你的答案: ${w.yours}</span><br>
            <span style="color:#10b981">正确答案: ${w.correct}</span><br>
            <span style="color:#94a3b8">${w.explain}</span>
          </div>`
        ).join('');
    } else {
      learn.innerHTML = '<div class="over-learn-title">全部答对! 太强了!</div>';
    }
  }

  function backToLevels() {
    stopSanityDrain();
    show('startScreen');
  }

  // ═══ UTILS ═══
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Ready
  });

  return {startGame, exitRoom, searchSpot, changeFloor, afterGhost, backToLevels};
})();
