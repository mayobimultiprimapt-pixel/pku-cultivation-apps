/**
 * 骗子酒馆 · UI 渲染器 v2.0
 * ========================================
 * 酒馆桌面 → NPC发言 → 判定 → 俄罗斯轮盘 → 结算
 * 支持四科 + 10轮制
 */
const TavernUI = (() => {
  let timerInterval = null;
  let subject = '101';

  function start(sub) {
    subject = sub || '101';
    TavernEngine.init(subject);
    buildTavernDOM();
    showIntro();
  }

  function buildTavernDOM() {
    const info = CaseDB.getSubjectInfo(subject);
    let screen = document.getElementById('tavernScreen');
    if(!screen) {
      screen = document.createElement('section');
      screen.id = 'tavernScreen';
      screen.className = 'screen tavern-screen hidden';
      document.getElementById('app').appendChild(screen);
    }
    screen.innerHTML = `
      <!-- Tavern ambient background -->
      <div class="tv-bg"></div>

      <!-- HUD top -->
      <div class="tv-hud">
        <div class="tv-round">第 <span id="tvRound">1</span>/<span id="tvTotal">10</span> 局</div>
        <div class="tv-title">🍺 骗子酒馆 · <span style="color:${info.color}">${info.icon} ${info.name}</span></div>
        <div class="tv-lives" id="tvLives">❤️❤️❤️❤️❤️❤️</div>
      </div>

      <!-- Intro overlay -->
      <div class="tv-intro" id="tvIntro">
        <div class="tv-intro-card">
          <div class="tv-intro-icon">🍺</div>
          <h2>欢迎来到骗子酒馆</h2>
          <div class="tv-intro-subject" style="color:${info.color};font-size:.9rem;font-weight:700;margin:.3rem 0">${info.icon} ${info.label} · 排雷挑战</div>
          <p>三位酒客将轮流说出考研知识点<br/>有的是真话，有的是骗子编的假话</p>
          <div class="tv-npc-intro">
            <div class="tv-npc-chip"><span>🦊</span> 狐教授 <small>油滑</small></div>
            <div class="tv-npc-chip"><span>🦉</span> 枭博士 <small>学究</small></div>
            <div class="tv-npc-chip"><span>🐯</span> 虎掌柜 <small>豪迈</small></div>
          </div>
          <p class="tv-intro-warn">⚠️ 判断错误 → 拿起左轮，朝自己扣扳机</p>
          <p class="tv-intro-rounds">📊 本轮: 10局 · 后期缩短时限 · 难度递增</p>
          <button class="tv-btn tv-btn-gold" onclick="TavernUI.beginRounds()">入座开局</button>
        </div>
      </div>

      <!-- Table scene (main game area) -->
      <div class="tv-table hidden" id="tvTable">
        <!-- NPC row -->
        <div class="tv-npcs" id="tvNPCs">
          <div class="tv-npc" id="npcFox">
            <div class="tv-npc-avatar"><span class="tv-npc-emoji">🦊</span></div>
            <div class="tv-npc-name">狐教授</div>
          </div>
          <div class="tv-npc" id="npcOwl">
            <div class="tv-npc-avatar"><span class="tv-npc-emoji">🦉</span></div>
            <div class="tv-npc-name">枭博士</div>
          </div>
          <div class="tv-npc" id="npcTiger">
            <div class="tv-npc-avatar"><span class="tv-npc-emoji">🐯</span></div>
            <div class="tv-npc-name">虎掌柜</div>
          </div>
        </div>

        <!-- Center: revolver + glass -->
        <div class="tv-center">
          <div class="tv-revolver">🔫</div>
          <div class="tv-glass">🥃</div>
          <div class="tv-chamber-label">6弹仓 · 1发子弹</div>
        </div>

        <!-- Claim card area -->
        <div class="tv-claim-area hidden" id="tvClaimArea">
          <div class="tv-speaker" id="tvSpeaker">
            <div class="tv-speaker-avatar" id="tvSpeakerAvatar">🦊</div>
            <div class="tv-speaker-name" id="tvSpeakerName">狐教授</div>
            <div class="tv-speaker-tell hidden" id="tvSpeakerTell"></div>
          </div>
          <div class="tv-bubble" id="tvBubble">
            <div class="tv-bubble-text" id="tvBubbleText">Loading...</div>
          </div>
          <div class="tv-timer-bar">
            <div class="tv-timer-fill" id="tvTimerFill"></div>
          </div>
          <div class="tv-timer-text" id="tvTimerText">15s</div>
          <div class="tv-hint" id="tvHint">注意观察对手的微表情...</div>
        </div>

        <!-- Decision buttons -->
        <div class="tv-actions hidden" id="tvActions">
          <button class="tv-btn tv-btn-believe" onclick="TavernUI.onDecide('believe')">
            🍺 我信你
          </button>
          <button class="tv-btn tv-btn-liar" onclick="TavernUI.onDecide('liar')">
            🔫 骗子!
          </button>
        </div>
      </div>

      <!-- Reveal overlay -->
      <div class="tv-reveal hidden" id="tvReveal">
        <div class="tv-reveal-card" id="tvRevealCard">
          <div class="tv-reveal-icon" id="tvRevealIcon">✅</div>
          <div class="tv-reveal-title" id="tvRevealTitle">判断正确!</div>
          <div class="tv-reveal-text" id="tvRevealText"></div>
          <div class="tv-reveal-npc-react" id="tvRevealReact"></div>
          <button class="tv-btn tv-btn-gold" id="tvRevealBtn" onclick="TavernUI.afterReveal()">继续</button>
        </div>
      </div>

      <!-- Roulette overlay -->
      <div class="tv-roulette hidden" id="tvRoulette">
        <div class="tv-roulette-card">
          <div class="tv-roulette-title">你猜错了！</div>
          <div class="tv-roulette-sub">轮到你开枪...</div>
          <div class="tv-cylinder" id="tvCylinder">
            <div class="tv-cylinder-inner" id="tvCylinderInner">
              <div class="tv-chamber" data-ch="0"></div>
              <div class="tv-chamber" data-ch="1"></div>
              <div class="tv-chamber" data-ch="2"></div>
              <div class="tv-chamber" data-ch="3"></div>
              <div class="tv-chamber" data-ch="4"></div>
              <div class="tv-chamber" data-ch="5"></div>
            </div>
          </div>
          <div class="tv-chamber-info" id="tvChamberInfo">弹仓: 0/6 已空</div>
          <button class="tv-btn tv-btn-danger" id="tvTriggerBtn" onclick="TavernUI.onPullTrigger()">💀 扣动扳机</button>
        </div>
      </div>

      <!-- Roulette result flash -->
      <div class="tv-roulette-result hidden" id="tvRouletteResult">
        <div class="tv-rr-text" id="tvRRText">咔嗒...</div>
      </div>

      <!-- Final result -->
      <div class="tv-result hidden" id="tvResult">
        <div class="tv-result-card">
          <div class="tv-result-icon" id="tvResultIcon">🏆</div>
          <h2 class="tv-result-title" id="tvResultTitle">幸存者!</h2>
          <div class="tv-result-subject" id="tvResultSubject" style="font-size:.8rem;margin-bottom:.5rem"></div>
          <div class="tv-result-grid">
            <div class="tv-rg"><span class="rg-l">识破骗子</span><span class="rg-v" id="trCorrect">0</span></div>
            <div class="tv-rg"><span class="rg-l">信誉等级</span><span class="rg-v" id="trGrade">-</span></div>
            <div class="tv-rg"><span class="rg-l">轮盘次数</span><span class="rg-v" id="trRoulette">0</span></div>
            <div class="tv-rg"><span class="rg-l">得分</span><span class="rg-v" id="trScore">0</span></div>
            <div class="tv-rg"><span class="rg-l">灵气</span><span class="rg-v" id="trQi">+0</span></div>
            <div class="tv-rg"><span class="rg-l">存活</span><span class="rg-v" id="trSurvived">0次</span></div>
          </div>
          <div class="tv-learnings" id="tvLearnings"></div>
          <div class="tv-result-btns">
            <button class="tv-btn tv-btn-gold" onclick="TavernUI.restart()">🔄 再来一局</button>
            <button class="tv-btn tv-btn-ghost" onclick="TavernUI.quit()">🏠 返回</button>
          </div>
        </div>
      </div>
    `;
  }

  // ═══ PHASE: INTRO ═══
  function showIntro() {
    const screen = document.getElementById('tavernScreen');
    screen.classList.remove('hidden');
    document.querySelectorAll('.screen').forEach(s => {
      if(s.id !== 'tavernScreen') s.classList.add('hidden');
    });
    document.getElementById('tvIntro').classList.remove('hidden');
    document.getElementById('tvTable').classList.add('hidden');
  }

  function beginRounds() {
    document.getElementById('tvIntro').classList.add('hidden');
    document.getElementById('tvTable').classList.remove('hidden');
    showClaim();
  }

  // ═══ PHASE: CLAIM ═══
  function showClaim() {
    const S = TavernEngine.getState();
    const round = TavernEngine.getCurrentRound();
    const npc = TavernEngine.getNPCForRound();
    if(!round || !npc) { showFinalResult(); return; }

    document.getElementById('tvRound').textContent = S.current + 1;
    document.getElementById('tvTotal').textContent = S.totalRounds;
    updateLives();

    document.querySelectorAll('.tv-npc').forEach(n => n.classList.remove('active'));
    const npcEl = document.getElementById(`npc${npc.id.charAt(0).toUpperCase()+npc.id.slice(1)}`);
    if(npcEl) npcEl.classList.add('active');

    const claimArea = document.getElementById('tvClaimArea');
    claimArea.classList.remove('hidden');
    document.getElementById('tvSpeakerAvatar').textContent = npc.emoji;
    document.getElementById('tvSpeakerAvatar').className = `tv-speaker-avatar ${round.isLie ? npc.tellAnim : ''}`;
    document.getElementById('tvSpeakerName').textContent = npc.name;

    const tellEl = document.getElementById('tvSpeakerTell');
    if(round.isLie && S.current < 5) {
      tellEl.textContent = npc.tells[0];
      tellEl.classList.remove('hidden');
    } else {
      tellEl.classList.add('hidden');
    }

    const phrases = round.isLie ? npc.liePhrases : npc.truePhrases;
    const prefix = phrases[Math.floor(Math.random()*phrases.length)];
    const fullText = `${prefix}\n\n「${round.claim}」`;
    typeText('tvBubbleText', fullText, 25);

    document.getElementById('tvHint').textContent =
      S.current < 3 ? '注意观察对手的微表情...' :
      S.current < 6 ? '半真半假，仔细分辨...' :
      S.current < 8 ? '⚠️ 时间紧迫，快做决定！' : '💀 最后冲刺！';

    document.getElementById('tvActions').classList.remove('hidden');
    startTimer(S.timerSeconds);
  }

  function typeText(elId, text, speed) {
    const el = document.getElementById(elId);
    el.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      if(i < text.length) {
        el.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
  }

  function startTimer(seconds) {
    if(timerInterval) clearInterval(timerInterval);
    let left = seconds;
    const fill = document.getElementById('tvTimerFill');
    const text = document.getElementById('tvTimerText');
    fill.style.width = '100%';
    fill.style.transition = 'none';
    fill.offsetHeight;
    fill.style.transition = `width ${seconds}s linear`;
    fill.style.width = '0%';

    timerInterval = setInterval(() => {
      left--;
      text.textContent = `${left}s`;
      if(left <= 5) text.style.color = '#ef4444';
      else text.style.color = '';
      if(left <= 0) {
        clearInterval(timerInterval);
        onDecide('believe');
      }
    }, 1000);
  }

  // ═══ PHASE: DECIDE ═══
  function onDecide(action) {
    if(timerInterval) clearInterval(timerInterval);
    document.getElementById('tvActions').classList.add('hidden');
    document.getElementById('tvClaimArea').classList.add('hidden');

    const result = TavernEngine.decide(action);
    if(!result) return;

    showReveal(result);
  }

  // ═══ PHASE: REVEAL ═══
  let pendingRouletteResult = null;

  function showReveal(result) {
    pendingRouletteResult = result;
    const reveal = document.getElementById('tvReveal');
    reveal.classList.remove('hidden');

    const card = document.getElementById('tvRevealCard');
    card.className = `tv-reveal-card ${result.correct ? 'correct' : 'wrong'}`;

    document.getElementById('tvRevealIcon').textContent = result.correct ? '✅' : '❌';
    document.getElementById('tvRevealTitle').textContent = result.correct
      ? (result.action === 'liar' ? '识破骗子!' : '判断正确!')
      : (result.action === 'liar' ? '冤枉好人了!' : '你被骗了!');
    document.getElementById('tvRevealText').textContent = result.explanation;

    const npc = result.npc;
    const react = result.correct
      ? npc.scared[Math.floor(Math.random()*npc.scared.length)]
      : npc.taunts[Math.floor(Math.random()*npc.taunts.length)];
    document.getElementById('tvRevealReact').textContent = `${npc.emoji} ${npc.name}：「${react}」`;

    document.getElementById('tvRevealBtn').textContent = result.needRoulette ? '拿起左轮...' : '下一局';

    if(!result.correct && navigator.vibrate) navigator.vibrate([100,50,100]);
  }

  function afterReveal() {
    document.getElementById('tvReveal').classList.add('hidden');
    if(pendingRouletteResult && pendingRouletteResult.needRoulette) {
      showRoulette();
    } else {
      advanceRound();
    }
  }

  // ═══ PHASE: ROULETTE ═══
  function showRoulette() {
    const S = TavernEngine.getState();
    document.getElementById('tvRoulette').classList.remove('hidden');
    document.getElementById('tvChamberInfo').textContent = `弹仓: ${S.chamberIndex}/6 已空`;

    const inner = document.getElementById('tvCylinderInner');
    inner.style.animation = 'none';
    inner.offsetHeight;
    inner.style.animation = 'cylinderSpin 1.5s cubic-bezier(.25,.46,.45,.94)';

    document.querySelectorAll('.tv-chamber').forEach((ch, i) => {
      ch.className = `tv-chamber${i < S.chamberIndex ? ' spent' : ''}`;
    });

    const btn = document.getElementById('tvTriggerBtn');
    btn.disabled = true;
    setTimeout(() => { btn.disabled = false; }, 1500);
  }

  function onPullTrigger() {
    const result = TavernEngine.pullTrigger();
    document.getElementById('tvRoulette').classList.add('hidden');

    const rrEl = document.getElementById('tvRouletteResult');
    const rrText = document.getElementById('tvRRText');
    rrEl.classList.remove('hidden');

    if(result.hit) {
      rrEl.className = 'tv-roulette-result hit';
      rrText.textContent = '💥 砰！';
      if(navigator.vibrate) navigator.vibrate([300,100,300,100,500]);
      setTimeout(() => {
        rrEl.classList.add('hidden');
        showFinalResult();
      }, 2000);
    } else {
      rrEl.className = 'tv-roulette-result survived';
      rrText.textContent = '咔嗒... 你活了。';
      if(navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => {
        rrEl.classList.add('hidden');
        advanceRound();
      }, 1500);
    }
  }

  // ═══ ADVANCE ═══
  function advanceRound() {
    const hasNext = TavernEngine.nextRound();
    if(hasNext) {
      showClaim();
    } else {
      showFinalResult();
    }
  }

  // ═══ FINAL RESULT ═══
  function showFinalResult() {
    const S = TavernEngine.getState();
    const { title, qi } = TavernEngine.getGrade();
    const won = S.lives > 0;
    const info = CaseDB.getSubjectInfo(subject);

    document.getElementById('tvTable').classList.add('hidden');
    document.getElementById('tvResult').classList.remove('hidden');

    document.getElementById('tvResultIcon').textContent = won ? '🏆' : '💀';
    document.getElementById('tvResultTitle').textContent = won ? '幸存者!' : '醉倒在酒馆...';
    const subEl = document.getElementById('tvResultSubject');
    if (subEl) {
      subEl.textContent = `${info.icon} ${info.label} · 骗子酒馆`;
      subEl.style.color = info.color;
    }
    document.getElementById('trCorrect').textContent = S.correctCalls;
    document.getElementById('trGrade').textContent = title;
    document.getElementById('trRoulette').textContent = S.rouletteCount;
    document.getElementById('trScore').textContent = S.score;
    document.getElementById('trQi').textContent = `+${qi}`;
    document.getElementById('trSurvived').textContent = `${S.survived}次`;

    const learnEl = document.getElementById('tvLearnings');
    if(S.learnings.length > 0) {
      learnEl.innerHTML = `<div class="tv-learn-title">💡 你学到了：</div>` +
        S.learnings.map(l => `<div class="tv-learn-item">· ${l}</div>`).join('');
    } else {
      learnEl.innerHTML = '<div class="tv-learn-title">💯 全部判断正确，无需复习！</div>';
    }
  }

  // ═══ HELPERS ═══
  function updateLives() {
    const S = TavernEngine.getState();
    const total = 6;
    let hearts = '❤️'.repeat(Math.max(0,Math.min(6, 6 - S.rouletteCount + S.survived))) +
                 '🖤'.repeat(Math.max(0, S.rouletteCount - S.survived));
    document.getElementById('tvLives').textContent = hearts;
  }

  function restart() {
    TavernEngine.destroy();
    start(subject);
  }

  function quit() {
    TavernEngine.destroy();
    document.getElementById('tavernScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
  }

  return { start, beginRounds, onDecide, afterReveal, onPullTrigger, restart, quit };
})();
