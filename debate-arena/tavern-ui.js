/**
 * 骗子酒馆 · Liar's Deck UI v5.0
 * ========================================
 * 1:1 Mockup还原: NPC半身像坐桌后 + 桌上散落牌
 * 1-3张出牌 · 30s倒计时 · 全翻牌验证
 * 4按钮: BET/CHECK/CALL LIAR/FOLD
 */
const TavernUI = (() => {
  let timerInterval = null;
  let subject = '101';

  // ═══════════════════════════════════════════════
  //  CSS Injection
  // ═══════════════════════════════════════════════
  function injectStyles() {
    if (document.getElementById('liarbar-styles')) return;
    const s = document.createElement('style');
    s.id = 'liarbar-styles';
    s.textContent = `
/* ══════ LIAR'S BAR v5 — FULL TABLE LAYOUT ══════ */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Orbitron:wght@500;700;900&display=swap');

.tavern-screen { position:relative;width:100%;height:100vh;overflow:hidden;background:#1a1208; }

/* ── Background — Russian Roulette Den ── */
.lb-ambient {
  position:absolute;inset:0;z-index:0;
  background:url('assets/russian-roulette-bg.png') center/cover no-repeat;
}
.lb-ambient::after {
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(200,50,50,0.06) 0%, transparent 50%),
    linear-gradient(180deg, transparent 0%, rgba(10,4,4,0.4) 100%);
}
.lb-fog {
  position:absolute;inset:0;z-index:1;
  background:radial-gradient(ellipse at 30% 50%, rgba(255,200,100,0.03) 0%, transparent 60%);
  animation:fogDrift 12s ease-in-out infinite alternate;pointer-events:none;
}
@keyframes fogDrift { 0%{transform:translateX(-8px)} 100%{transform:translateX(8px)} }

/* ── HUD ── */
.lb-hud {
  position:absolute;top:0;left:0;right:0;z-index:20;
  display:flex;justify-content:space-between;align-items:center;
  padding:8px 16px;pointer-events:none;
}
.lb-hud-box {
  background:rgba(0,0,0,0.6);border:1px solid rgba(212,175,55,0.2);
  border-radius:4px;padding:4px 14px;pointer-events:auto;
  font-family:'Orbitron',monospace;font-size:13px;font-weight:700;
  color:#ffd700;letter-spacing:1px;
  box-shadow:0 2px 8px rgba(0,0,0,0.3);
}
.lb-hud-lives { display:flex;gap:2px;font-size:14px;margin-left:8px; }

/* ══ NPC CHARACTERS — Sitting BEHIND the table ══ */
.lb-scene {
  position:absolute;top:0;left:0;right:0;bottom:0;z-index:5;
  pointer-events:none;
}
.lb-npc-char {
  position:absolute;z-index:6;
  display:flex;flex-direction:column;align-items:center;
  transition:all 0.4s ease;pointer-events:auto;
}
.lb-npc-char.active { filter:brightness(1.2); }
.lb-npc-char.eliminated { opacity:0.2;filter:grayscale(0.9)saturate(0.2); }
.lb-npc-char.shot { animation:npcShot 0.4s ease; }
@keyframes npcShot { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-10px) rotate(-5deg)} 75%{transform:translateY(4px)} }

/* NPC body — Large emoji character serving as half-body portrait */
.lb-npc-body {
  font-size:72px;line-height:1;
  filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5));
  transition:transform 0.3s ease;
}
.lb-npc-char.active .lb-npc-body { transform:scale(1.08); }

/* ══ NEON FOX HALF-BODY PORTRAIT ══ */
.neon-fox-portrait {
  position:relative; width:90px; height:110px;
  filter:drop-shadow(0 0 15px rgba(255,100,0,0.6)) drop-shadow(0 0 30px rgba(255,50,200,0.3));
  animation:neonPulse 3s ease-in-out infinite alternate;
}
@keyframes neonPulse {
  0% { filter:drop-shadow(0 0 10px rgba(255,100,0,0.5)) drop-shadow(0 0 20px rgba(255,50,200,0.2)); }
  100% { filter:drop-shadow(0 0 20px rgba(255,100,0,0.8)) drop-shadow(0 0 40px rgba(255,50,200,0.5)); }
}
.nfox-head {
  width:70px; height:65px;
  background:linear-gradient(135deg, #ff6600, #cc3300);
  border-radius:50% 50% 40% 40%;
  position:absolute; top:0; left:10px; z-index:3;
  border:2px solid rgba(255,100,0,0.8);
  box-shadow:inset 0 0 15px rgba(255,150,0,0.3), 0 0 10px rgba(255,100,0,0.5);
}
.nfox-ear { width:22px; height:35px; background:linear-gradient(to top, #ff6600, #ff9900); border-radius:4px 50% 0 0; position:absolute; top:-12px; }
.nfox-ear.l { left:8px; transform:rotate(-20deg); }
.nfox-ear.r { right:8px; transform:rotate(20deg); border-radius:50% 4px 0 0; }
.nfox-ear::after { content:''; position:absolute; inset:3px; background:rgba(255,150,50,0.3); border-radius:inherit; }
.nfox-eyes { position:absolute; top:22px; width:100%; display:flex; justify-content:center; gap:14px; }
.nfox-eye { width:12px; height:12px; background:#fff; border-radius:50%; position:relative; box-shadow:0 0 6px rgba(0,255,255,0.8); }
.nfox-eye::after { content:''; position:absolute; width:5px; height:5px; background:#00ffcc; border-radius:50%; top:3px; left:4px; box-shadow:0 0 4px #00ffcc; }
.nfox-glasses { position:absolute; top:20px; width:100%; display:flex; justify-content:center; gap:8px; }
.nfox-lens { width:20px; height:9px; border:2px solid rgba(0,255,255,0.7); background:rgba(0,255,255,0.08); border-radius:2px; box-shadow:0 0 8px rgba(0,255,255,0.4); }
.nfox-snout { position:absolute; top:40px; left:50%; transform:translateX(-50%); width:30px; height:22px; background:#ffe0b2; border-radius:40% 40% 50% 50%; }
.nfox-nose { width:10px; height:7px; background:#111; border-radius:50%; margin:3px auto 0; }
.nfox-torso {
  width:90px; height:55px;
  background:linear-gradient(to bottom, #1a1a2e, #0f0f23);
  border-radius:35px 35px 12px 12px;
  position:absolute; top:52px; z-index:2;
  border:1px solid rgba(0,255,255,0.2);
  box-shadow:inset 0 5px 15px rgba(0,0,0,0.6), 0 0 12px rgba(0,255,255,0.15);
}
.nfox-collar { position:absolute; top:52px; left:25px; width:40px; height:12px; background:rgba(0,255,255,0.3); z-index:4; border-radius:0 0 12px 12px; border:1px solid rgba(0,255,255,0.4); box-shadow:0 0 6px rgba(0,255,255,0.4); }

/* NPC nameplate */
.lb-npc-plate {
  background:rgba(0,0,0,0.7);border:1px solid rgba(212,175,55,0.15);
  border-radius:3px;padding:2px 10px;margin-top:-4px;
  text-align:center;white-space:nowrap;
}
.lb-npc-plate-name {
  font-family:'Noto Serif SC',serif;font-size:11px;font-weight:700;
  color:#d4af37;letter-spacing:1px;
}
.lb-npc-plate-chips {
  font-family:'Orbitron',monospace;font-size:8px;color:#888;
}

/* NPC card backs (below each NPC) */
.lb-npc-hand {
  display:flex;gap:2px;margin-top:3px;
}
.lb-card-back-sm {
  width:18px;height:26px;border-radius:2px;
  background:linear-gradient(145deg,#5a3018,#3a1e0c);
  border:1px solid rgba(180,120,50,0.2);
  font-size:8px;display:flex;align-items:center;justify-content:center;
  color:#886633;box-shadow:0 1px 3px rgba(0,0,0,0.3);
}

/* NPC speech bubble */
.lb-npc-speech {
  position:absolute;bottom:-32px;left:50%;transform:translateX(-50%);
  background:rgba(10,8,5,0.92);border:1px solid rgba(212,175,55,0.12);
  border-radius:6px;padding:5px 10px;white-space:nowrap;
  font-family:'Noto Serif SC',serif;font-size:10px;color:#ccc;
  max-width:180px;overflow:hidden;text-overflow:ellipsis;
  box-shadow:0 4px 12px rgba(0,0,0,0.4);
  animation:bubblePop 0.3s ease;pointer-events:none;
}
.lb-npc-speech::before {
  content:'';position:absolute;top:-5px;left:50%;transform:translateX(-50%);
  border-left:5px solid transparent;border-right:5px solid transparent;
  border-bottom:5px solid rgba(10,8,5,0.92);
}
@keyframes bubblePop { from{transform:translateX(-50%) scale(0.8);opacity:0} to{transform:translateX(-50%) scale(1);opacity:1} }

/* Position NPC — single fox centered */
.lb-npc-fox   { left:50%;top:6%;transform:translateX(-50%); }

/* ── Table Surface — Russian Roulette Wheel Style ── */
.lb-table-wrap {
  position:absolute;top:42%;left:50%;transform:translate(-50%,-48%);
  z-index:4;width:78%;max-width:720px;
}
.lb-table-surface {
  width:100%;aspect-ratio:2.4/1;
  background:
    conic-gradient(
      from 0deg,
      #8b0000 0deg, #2a0a0a 15deg,
      #1a0505 15deg, #8b0000 30deg,
      #2a0a0a 30deg, #1a0505 45deg,
      #8b0000 45deg, #2a0a0a 60deg,
      #1a0505 60deg, #8b0000 75deg,
      #2a0a0a 75deg, #1a0505 90deg,
      #8b0000 90deg, #2a0a0a 105deg,
      #1a0505 105deg, #8b0000 120deg,
      #2a0a0a 120deg, #1a0505 135deg,
      #8b0000 135deg, #2a0a0a 150deg,
      #1a0505 150deg, #8b0000 165deg,
      #2a0a0a 165deg, #1a0505 180deg,
      #8b0000 180deg, #2a0a0a 195deg,
      #1a0505 195deg, #8b0000 210deg,
      #2a0a0a 210deg, #1a0505 225deg,
      #8b0000 225deg, #2a0a0a 240deg,
      #1a0505 240deg, #8b0000 255deg,
      #2a0a0a 255deg, #1a0505 270deg,
      #8b0000 270deg, #2a0a0a 285deg,
      #1a0505 285deg, #8b0000 300deg,
      #2a0a0a 300deg, #1a0505 315deg,
      #8b0000 315deg, #2a0a0a 330deg,
      #1a0505 330deg, #8b0000 345deg,
      #2a0a0a 345deg, #1a0505 360deg
    );
  border-radius:50%;position:relative;
  border:8px solid rgba(180,140,60,0.6);
  box-shadow:
    inset 0 0 60px rgba(0,0,0,0.7),
    inset 0 0 20px rgba(139,0,0,0.3),
    0 10px 40px rgba(0,0,0,0.6),
    0 0 30px rgba(139,0,0,0.15);
}
/* 轮盘中心金属轴心 */
.lb-table-surface::before {
  content:'';
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:60px;height:60px;border-radius:50%;
  background:radial-gradient(circle, #d4af37 0%, #8b6914 60%, #3a2d0a 100%);
  border:3px solid rgba(255,215,0,0.5);
  box-shadow:0 0 15px rgba(212,175,55,0.4), inset 0 0 10px rgba(0,0,0,0.5);
  z-index:6;
}
/* 轮盘金色外圈 */
.lb-table-surface::after {
  content:'';
  position:absolute;inset:15px;border-radius:50%;
  border:2px solid rgba(212,175,55,0.25);
  box-shadow:inset 0 0 5px rgba(212,175,55,0.15);
}

/* ── Table center: played cards + chips + gun ── */
.lb-table-center {
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  display:flex;align-items:center;gap:8px;z-index:7;
}
.lb-table-cards { display:flex;gap:4px; }

.lb-played-card {
  width:46px;height:64px;border-radius:4px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  box-shadow:0 3px 10px rgba(0,0,0,0.4);
  transition:transform 0.3s ease;animation:cardDeal 0.4s ease;
}
.lb-played-card.face-down {
  background:linear-gradient(145deg,#663322,#442211);
  border:1px solid rgba(180,120,50,0.3);
  font-size:14px;color:#aa8844;
}
.lb-played-card.face-up {
  background:linear-gradient(145deg,#f0e8d0,#ddd5b8);
  border:1px solid rgba(180,150,90,0.3);
  padding:3px;font-size:7px;color:#5a4a30;text-align:center;line-height:1.2;
  font-family:'Noto Serif SC',serif;
}
.lb-played-card .card-suit { font-size:16px;font-weight:900; }
@keyframes cardDeal { from{transform:translateY(-20px)scale(0.7);opacity:0} to{transform:translateY(0)scale(1);opacity:1} }

/* Table chips */
.lb-table-chips {
  display:flex;flex-direction:column;align-items:center;gap:1px;
}
.lb-chip {
  width:14px;height:8px;background:linear-gradient(to bottom,#ffd700,#c8a600);
  border-radius:50%;border:1px solid rgba(200,160,0,0.5);
}
.lb-pot-label {
  font-family:'Orbitron',monospace;font-size:9px;color:#ffd700;margin-top:2px;
}

/* Table gun */
.lb-table-gun {
  font-size:32px;transform:rotate(-20deg);
  filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5));margin-left:8px;
}

/* Main suit badge */
.lb-main-badge {
  position:absolute;top:8px;left:50%;transform:translateX(-50%);
  background:rgba(0,0,0,0.75);border:1px solid rgba(255,215,0,0.3);
  border-radius:4px;padding:3px 14px;z-index:8;
  font-family:'Orbitron',monospace;font-size:12px;font-weight:700;
  color:#ffd700;letter-spacing:1px;
}

/* ── Timer Bar ── */
.lb-timer {
  position:absolute;bottom:0;left:0;right:0;z-index:8;
  height:4px;background:rgba(0,0,0,0.3);
}
.lb-timer-fill {
  height:100%;background:linear-gradient(90deg,#ffd700,#ff6600);
  transition:width linear;
}
.lb-timer-text {
  position:absolute;top:-16px;right:8px;
  font-family:'Orbitron',monospace;font-size:10px;color:#888;
}

/* ── Player Hand ── */
.lb-hand-area {
  position:absolute;bottom:68px;left:50%;transform:translateX(-50%);
  z-index:15;display:flex;gap:8px;perspective:800px;
}
.lb-hand-card {
  width:100px;height:140px;border-radius:6px;
  background:linear-gradient(145deg,#f0e8d0,#e8dfc0);
  border:2px solid rgba(180,150,90,0.25);
  box-shadow:0 4px 12px rgba(0,0,0,0.3);
  cursor:pointer;transition:all 0.25s ease;
  display:flex;flex-direction:column;align-items:center;
  padding:6px;position:relative;overflow:hidden;
  font-family:'Noto Serif SC',serif;
}
.lb-hand-card:hover { transform:translateY(-14px);box-shadow:0 8px 20px rgba(0,0,0,0.4); }
.lb-hand-card.selected {
  transform:translateY(-24px) scale(1.05);
  border-color:rgba(255,215,0,0.6);
  box-shadow:0 0 20px rgba(255,215,0,0.2),0 8px 24px rgba(0,0,0,0.4);
}
.lb-hand-card .hc-suit { font-size:22px;font-weight:900;margin-top:2px; }
.lb-hand-card .hc-label { font-size:9px;color:#887755;margin-top:2px;letter-spacing:0.5px; }
.lb-hand-card .hc-text {
  font-size:9px;color:#5a4a30;line-height:1.4;margin-top:6px;
  text-align:center;overflow:hidden;
  display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;
}
.lb-hand-card .hc-joker { font-size:28px;margin-top:8px; }

/* Selection count hint */
.lb-select-hint {
  position:absolute;bottom:54px;left:50%;transform:translateX(-50%);
  z-index:16;font-family:'Orbitron',monospace;font-size:10px;
  color:#d4af37;letter-spacing:1px;
  background:rgba(0,0,0,0.5);padding:2px 10px;border-radius:3px;
}

/* ── Action Buttons ── */
.lb-actions {
  position:absolute;bottom:8px;left:50%;transform:translateX(-50%);
  z-index:20;display:flex;gap:6px;
}
.lb-btn {
  padding:10px 22px;border:2px solid transparent;border-radius:4px;
  font-family:'Orbitron',monospace;font-weight:700;font-size:12px;
  letter-spacing:1px;cursor:pointer;transition:all 0.2s ease;
  text-transform:uppercase;
}
.lb-btn:hover { transform:translateY(-2px); }
.lb-btn:disabled { opacity:0.3;cursor:not-allowed;transform:none; }

.lb-btn-bet {
  background:linear-gradient(135deg,#5a4a1a,#3a300a);
  color:#ffd700;border-color:rgba(255,215,0,0.3);
}
.lb-btn-bet:hover:not(:disabled) { border-color:rgba(255,215,0,0.6);box-shadow:0 4px 16px rgba(255,215,0,0.15); }

.lb-btn-check {
  background:linear-gradient(135deg,#1a3a5a,#0d2240);
  color:#66aaff;border-color:rgba(68,150,255,0.25);
}
.lb-btn-check:hover:not(:disabled) { border-color:rgba(68,150,255,0.5); }

.lb-btn-liar {
  background:linear-gradient(135deg,#5a1a1a,#3a0d0d);
  color:#ff5555;border-color:rgba(255,68,68,0.3);font-size:13px;
}
.lb-btn-liar:hover:not(:disabled) { border-color:rgba(255,68,68,0.6);box-shadow:0 4px 16px rgba(255,68,68,0.15); }

.lb-btn-fold {
  background:rgba(255,255,255,0.04);color:#777;
  border-color:rgba(255,255,255,0.08);
}
.lb-btn-fold:hover:not(:disabled) { color:#aaa;border-color:rgba(255,255,255,0.15); }

/* ── Overlays ── */
.lb-overlay {
  position:absolute;inset:0;z-index:30;
  background:rgba(5,4,3,0.85);backdrop-filter:blur(6px);
  display:flex;align-items:center;justify-content:center;
}
.lb-overlay-card {
  width:92%;max-width:440px;
  background:rgba(15,12,8,0.95);border:1px solid rgba(212,175,55,0.12);
  border-radius:8px;padding:24px;text-align:center;
  box-shadow:0 20px 60px rgba(0,0,0,0.5);
}
.lb-overlay-icon { font-size:48px;margin-bottom:6px; }
.lb-overlay-title {
  font-family:'Noto Serif SC',serif;font-size:22px;font-weight:900;
  color:#ffd700;letter-spacing:3px;margin-bottom:4px;
}
.lb-overlay-sub {
  font-family:'Orbitron',monospace;font-size:10px;color:#888;
  letter-spacing:2px;margin-bottom:12px;
}
.lb-overlay-text {
  font-size:12px;color:#ccc;line-height:1.6;margin-bottom:12px;
  font-family:'Noto Serif SC',serif;
}
.lb-overlay-knowledge {
  background:rgba(0,0,0,0.3);border-radius:4px;padding:10px;
  font-size:11px;color:#aaa;line-height:1.6;text-align:left;
  margin-bottom:12px;border-left:3px solid rgba(212,175,55,0.3);
  white-space:pre-line;max-height:150px;overflow-y:auto;
}
.lb-overlay-btns { display:flex;justify-content:center;gap:8px;margin-top:8px; }

/* Reveal cards row */
.lb-reveal-cards { display:flex;gap:8px;justify-content:center;margin:10px 0;flex-wrap:wrap; }
.lb-reveal-card-item {
  width:90px;height:120px;border-radius:5px;padding:6px;text-align:center;
  font-family:'Noto Serif SC',serif;font-size:9px;line-height:1.4;
  box-shadow:0 3px 10px rgba(0,0,0,0.3);overflow:hidden;
  display:flex;flex-direction:column;align-items:center;
}
.lb-reveal-card-item.legit {
  background:linear-gradient(145deg,#d4f0d4,#b8ddb8);border:2px solid rgba(50,180,50,0.3);
  color:#2a5a2a;
}
.lb-reveal-card-item.fake {
  background:linear-gradient(145deg,#f0d4d4,#ddb8b8);border:2px solid rgba(180,50,50,0.3);
  color:#5a2a2a;
}
.lb-reveal-card-item .rci-suit { font-size:18px;font-weight:900; }

/* Intro */
.lb-intro-npcs { display:flex;justify-content:center;gap:20px;margin:12px 0; }
.lb-intro-npc { text-align:center; }
.lb-intro-npc-emoji { font-size:36px; }
.lb-intro-npc-name { font-size:11px;color:#d4af37;font-weight:700; }
.lb-intro-npc-trait { font-size:8px;color:#666; }
.lb-intro-warn {
  background:rgba(80,20,20,0.25);border:1px solid rgba(255,50,50,0.15);
  border-radius:4px;padding:8px;margin:8px 0;font-size:11px;color:#cc6666;
}
.lb-declare-suit { font-size:64px;margin:12px 0;animation:suitBounce 0.5s ease; }
@keyframes suitBounce { from{transform:scale(0.3)rotate(-20deg);opacity:0} to{transform:scale(1)rotate(0);opacity:1} }

/* Roulette */
.lb-roulette-gun { font-size:56px;margin:12px 0;animation:gunShake 0.6s ease-in-out infinite alternate; }
@keyframes gunShake { 0%{transform:rotate(-8deg)} 100%{transform:rotate(8deg)} }
.lb-rr-hit { color:#ff2222;text-shadow:0 0 20px rgba(255,0,0,0.4); }
.lb-rr-safe { color:#888; }

/* Result grid */
.lb-result-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0; }
.lb-rg { background:rgba(0,0,0,0.3);padding:8px;border-radius:4px;border:1px solid rgba(255,255,255,0.03); }
.lb-rg .rg-l { display:block;font-size:8px;color:#666;text-transform:uppercase;letter-spacing:1px;font-family:'Orbitron',monospace; }
.lb-rg .rg-v { display:block;font-family:'Orbitron',monospace;font-size:16px;font-weight:800;color:#ffd700;margin-top:2px; }

.lb-learnings {
  text-align:left;margin:8px 0;max-height:100px;overflow-y:auto;
  padding:8px;background:rgba(0,0,0,0.2);border-radius:4px;
}
.lb-learn-item { font-size:9px;color:#aaa;line-height:1.4;margin-bottom:3px;padding-left:6px;border-left:2px solid rgba(212,175,55,0.15);white-space:pre-line; }

/* Responsive */
.hidden { display:none !important; }
@media(max-width:700px) {
  .lb-npc-body { font-size:48px; }
  .lb-npc-fox { left:5%;top:15%; }
  .lb-npc-owl { top:9%; }
  .lb-npc-tiger { right:5%;top:15%; }
  .lb-hand-card { width:58px;height:82px; }
  .lb-hand-card .hc-text { font-size:6px;-webkit-line-clamp:3; }
  .lb-btn { padding:8px 14px;font-size:10px; }
  .lb-table-wrap { width:92%; }
  .lb-played-card { width:36px;height:50px; }
}
`;
    document.head.appendChild(s);
  }

  // ═══════════════════════════════════════════════
  //  Start
  // ═══════════════════════════════════════════════
  function start(sub) {
    subject = sub || '101';
    injectStyles();
    TavernEngine.init(subject);
    buildDOM();
    showOverlay('intro');
  }

  // ═══════════════════════════════════════════════
  //  Build DOM — Characters sit BEHIND the table
  // ═══════════════════════════════════════════════
  function buildDOM() {
    const G = TavernEngine.getState();
    const info = CaseDB.getSubjectInfo(subject);

    let screen = document.getElementById('tavernScreen');
    if (!screen) {
      screen = document.createElement('section');
      screen.id = 'tavernScreen';
      screen.className = 'screen tavern-screen hidden';
      document.getElementById('app').appendChild(screen);
    }

    screen.innerHTML = `
      <div class="lb-ambient"></div>
      <div class="lb-fog"></div>

      <!-- HUD -->
      <div class="lb-hud">
        <div class="lb-hud-box">Chip: $<span id="lbChips">${G.playerChips}</span>
          <span class="lb-hud-lives" id="lbLives">❤️❤️❤️❤️❤️❤️</span>
        </div>
        <div class="lb-hud-box"><span id="lbRound">${G.roundNum}</span>/<span id="lbMaxRounds">${G.maxRounds}</span></div>
        <div class="lb-hud-box">Pot: $<span id="lbPot">${G.pot}</span></div>
      </div>

      <!-- Scene: Characters sitting behind table -->
      <div class="lb-scene">
        ${G.players.filter(p=>!p.isHuman).map(npc => `
          <div class="lb-npc-char lb-npc-${npc.id}" id="lbNpc_${npc.id}">
            ${npc.id === 'fox' ? `
              <div class="neon-fox-portrait">
                <div class="nfox-ear l"></div>
                <div class="nfox-ear r"></div>
                <div class="nfox-head">
                  <div class="nfox-eyes"><div class="nfox-eye"></div><div class="nfox-eye"></div></div>
                  <div class="nfox-glasses"><div class="nfox-lens"></div><div class="nfox-lens"></div></div>
                  <div class="nfox-snout"><div class="nfox-nose"></div></div>
                </div>
                <div class="nfox-collar"></div>
                <div class="nfox-torso"></div>
              </div>
            ` : `<div class="lb-npc-body">${npc.emoji}</div>`}
            <div class="lb-npc-plate">
              <div class="lb-npc-plate-name">${npc.name}</div>
              <div class="lb-npc-plate-chips">$<span id="lbChips_${npc.id}">${G.npcChips[npc.id]}</span></div>
            </div>
            <div class="lb-npc-hand" id="lbHand_${npc.id}">
              ${'<div class="lb-card-back-sm">🂠</div>'.repeat(5)}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Table Surface -->
      <div class="lb-table-wrap">
        <div class="lb-table-surface">
          <div class="lb-main-badge hidden" id="lbMainBadge">主牌: A</div>
          <div class="lb-table-center">
            <div class="lb-table-cards" id="lbTableCards"></div>
            <div class="lb-table-chips">
              <div class="lb-chip"></div><div class="lb-chip"></div><div class="lb-chip"></div>
              <div class="lb-pot-label">$<span id="lbPotCenter">${G.pot}</span></div>
            </div>
            <div class="lb-table-gun">🔫</div>
          </div>
          <!-- Timer -->
          <div class="lb-timer hidden" id="lbTimer">
            <div class="lb-timer-fill" id="lbTimerFill" style="width:100%"></div>
            <div class="lb-timer-text" id="lbTimerText">30s</div>
          </div>
        </div>
      </div>

      <!-- Select hint -->
      <div class="lb-select-hint hidden" id="lbSelectHint">选择 1-3 张牌打出</div>

      <!-- Player Hand -->
      <div class="lb-hand-area" id="lbHandArea"></div>

      <!-- Actions -->
      <div class="lb-actions" id="lbActions">
        <button class="lb-btn lb-btn-bet" id="lbBtnBet" onclick="TavernUI.onBet()">BET<br/>下注</button>
        <button class="lb-btn lb-btn-check" id="lbBtnCheck" onclick="TavernUI.onCheck()">CHECK<br/>过牌</button>
        <button class="lb-btn lb-btn-liar" id="lbBtnLiar" onclick="TavernUI.onCallLiar()">CALL LIAR<br/>质疑!</button>
        <button class="lb-btn lb-btn-fold" id="lbBtnFold" onclick="TavernUI.onFold()">FOLD<br/>弃牌</button>
      </div>

      <!-- Overlay -->
      <div class="lb-overlay hidden" id="lbOverlay">
        <div class="lb-overlay-card" id="lbOverlayContent"></div>
      </div>
    `;

    screen.classList.remove('hidden');
    document.querySelectorAll('.screen').forEach(s => {
      if (s.id !== 'tavernScreen') s.classList.add('hidden');
    });
  }

  // ═══════════════════════════════════════════════
  //  Overlay System
  // ═══════════════════════════════════════════════
  function showOverlay(type, data) {
    const el = document.getElementById('lbOverlay');
    const content = document.getElementById('lbOverlayContent');
    el.classList.remove('hidden');

    const info = CaseDB.getSubjectInfo(subject);
    const G = TavernEngine.getState();

    switch(type) {
      case 'intro':
        content.innerHTML = `
          <div class="lb-overlay-icon">🍺</div>
          <div class="lb-overlay-title">LIAR'S BAR</div>
          <div class="lb-overlay-sub">骗子酒馆 · ${info.label}</div>
          <div class="lb-overlay-text">
            100张知识卡牌 · 每轮声明<strong>主牌</strong>(A/K/Q)<br/>
            选 <strong>1-3 张</strong>牌面朝下打出，声称全是主牌<br/>
            下家选择<strong>跟随</strong>或<strong>质疑翻牌</strong> · 30秒倒计时
          </div>
          <div class="lb-intro-npcs">
            <div class="lb-intro-npc"><div class="lb-intro-npc-emoji">🦊</div><div class="lb-intro-npc-name">狐教授</div><div class="lb-intro-npc-trait">爱骗·老狐狸</div></div>
            <div class="lb-intro-npc"><div class="lb-intro-npc-emoji">🦉</div><div class="lb-intro-npc-name">枭博士</div><div class="lb-intro-npc-trait">谨慎·学究</div></div>
            <div class="lb-intro-npc"><div class="lb-intro-npc-emoji">🐯</div><div class="lb-intro-npc-name">虎掌柜</div><div class="lb-intro-npc-trait">豪迈·随性</div></div>
          </div>
          <div class="lb-intro-warn">
            ⚠ 翻牌全是主牌/🃏 → <strong>质疑者</strong>开枪<br/>
            🎯 翻牌含非主牌 → <strong>骗子</strong>开枪<br/>
            🔫 左轮6弹巢·1发实弹·中弹淘汰 · 战至最后1人
          </div>
          <div class="lb-overlay-btns">
            <button class="lb-btn lb-btn-bet" onclick="TavernUI.beginGame()" style="font-size:14px;padding:12px 32px">⚡ 入 座 开 局</button>
          </div>`;
        break;

      case 'declare':
        content.innerHTML = `
          <div class="lb-overlay-icon">🎴</div>
          <div class="lb-overlay-title">第 ${G.roundNum} 轮</div>
          <div class="lb-overlay-sub">ROUND ${G.roundNum} / ${G.maxRounds}</div>
          <div class="lb-overlay-text">系统声明本轮主牌:</div>
          <div class="lb-declare-suit" style="color:${data.color||'#ffd700'}">${data.suit}</div>
          <div class="lb-overlay-text">
            打出的牌<strong>必须声称</strong>是 <strong>${data.suit}</strong><br/>
            🃏 Joker = 万能百搭 · 永远算真话
          </div>
          <div class="lb-overlay-btns">
            <button class="lb-btn lb-btn-bet" onclick="TavernUI.startPlayPhase()">开始出牌 →</button>
          </div>`;
        break;

      case 'reveal': {
        const allLegit = data.allLegit;
        content.innerHTML = `
          <div class="lb-overlay-icon">${allLegit ? '😰' : '🎯'}</div>
          <div class="lb-overlay-title">${allLegit ? '冤枉好人!' : '抓到骗子!'}</div>
          <div class="lb-overlay-sub">${data.challenger.emoji} ${data.challenger.name} 翻开 ${data.liar.emoji} ${data.liar.name} 的 ${data.cards.length} 张牌</div>
          <div class="lb-reveal-cards">
            ${data.cards.map(c => {
              const legit = c.suit === G.mainSuit || c.suit === 'Joker';
              return `<div class="lb-reveal-card-item ${legit ? 'legit' : 'fake'}">
                <div class="rci-suit" style="color:${c.suitColor}">${c.display}</div>
                <div>${c.text.substring(0,20)}</div>
              </div>`;
            }).join('')}
          </div>
          <div class="lb-overlay-text">
            主牌: <strong>${G.mainSuit}</strong> ·
            <span style="color:${allLegit ? '#ff5555' : '#55ff55'}">
              ${allLegit ? `全是主牌! ${data.challenger.name} 质疑失败!` : `含伪牌! ${data.liar.name} 说谎被抓!`}
            </span>
          </div>
          <div class="lb-overlay-knowledge">${data.explanation}</div>
          <div class="lb-overlay-text" style="font-size:14px;color:#ff6644">
            🔫 ${data.loser.emoji} ${data.loser.name} 必须对自己开枪!
          </div>
          <div class="lb-overlay-btns">
            <button class="lb-btn lb-btn-liar" onclick="TavernUI.showRoulette()">🔫 拿起左轮...</button>
          </div>`;
        break;
      }

      case 'roulette':
        content.innerHTML = `
          <div class="lb-overlay-icon">${data.target.emoji}</div>
          <div class="lb-overlay-title">${data.target.name} 的审判</div>
          <div class="lb-overlay-sub">${data.target.isHuman ? '你' : data.target.name}拿起了左轮...</div>
          <div class="lb-roulette-gun">🔫</div>
          <div style="font-family:'Orbitron',monospace;font-size:10px;color:#884444;margin:8px 0">
            CHAMBER: ${G.chamberIndex}/6
          </div>
          <div class="lb-overlay-btns">
            <button class="lb-btn lb-btn-liar" id="lbTriggerBtn" onclick="TavernUI.onPullTrigger()" style="animation:gunShake 1.5s ease-in-out infinite">
              💀 ${data.target.isHuman ? '扣动扳机' : '让'+data.target.name+'扣扳机'}
            </button>
          </div>`;
        break;

      case 'rouletteResult':
        content.innerHTML = `
          <div class="lb-overlay-icon" style="font-size:56px">${data.hit ? '💥' : '😮‍💨'}</div>
          <div class="lb-overlay-title ${data.hit ? 'lb-rr-hit' : 'lb-rr-safe'}">
            ${data.hit ? '砰！中弹！' : '咔嗒...活了'}
          </div>
          <div class="lb-overlay-sub">${data.target.emoji} ${data.target.name} ${data.hit ? '倒在了桌上...' : '放下左轮，擦了擦汗'}</div>
          <div class="lb-overlay-btns">
            <button class="lb-btn lb-btn-bet" onclick="TavernUI.afterRoulette()">
              ${data.gameOver ? '📊 查看结算' : '▶ 新一轮 · 重新发牌'}
            </button>
          </div>`;
        break;

      case 'result': {
        const grade = TavernEngine.getGrade();
        content.innerHTML = `
          <div class="lb-overlay-icon">${G.players[0].alive ? '🏆' : '💀'}</div>
          <div class="lb-overlay-title">${G.players[0].alive ? '幸存者!' : '醉倒在酒馆...'}</div>
          <div class="lb-overlay-sub">${info.icon} ${info.label} · LIAR'S DECK · ${G.roundNum} ROUNDS</div>
          <div class="lb-result-grid">
            <div class="lb-rg"><span class="rg-l">识破</span><span class="rg-v">${G.correctCalls}</span></div>
            <div class="lb-rg"><span class="rg-l">段位</span><span class="rg-v">${grade.title}</span></div>
            <div class="lb-rg"><span class="rg-l">轮盘</span><span class="rg-v">${G.rouletteCount}</span></div>
            <div class="lb-rg"><span class="rg-l">得分</span><span class="rg-v">${G.score}</span></div>
            <div class="lb-rg"><span class="rg-l">灵气</span><span class="rg-v">+${grade.qi}</span></div>
            <div class="lb-rg"><span class="rg-l">击杀</span><span class="rg-v">${G.npcKills}</span></div>
          </div>
          ${G.learnings.length > 0 ? `
            <div class="lb-learnings">
              <div style="font-size:10px;color:#ffd700;font-weight:700;margin-bottom:4px">💡 知识点复盘:</div>
              ${G.learnings.slice(0,8).map(l => `<div class="lb-learn-item">${l}</div>`).join('')}
            </div>` : '<div style="color:#55ff55;font-size:12px;margin:8px 0">💯 完美通关!</div>'}
          <div class="lb-overlay-btns">
            <button class="lb-btn lb-btn-bet" onclick="TavernUI.restart()">🔄 RE-DEAL</button>
            <button class="lb-btn lb-btn-fold" onclick="TavernUI.quit()">🏠 EXIT</button>
          </div>`;
        break;
      }
    }
  }

  function hideOverlay() {
    document.getElementById('lbOverlay').classList.add('hidden');
  }

  // ═══════════════════════════════════════════════
  //  Game Flow
  // ═══════════════════════════════════════════════
  let selectedCards = []; // multi-select indices
  let pendingReveal = null;
  let pendingRouletteResult = null;

  function beginGame() {
    hideOverlay();
    newRound();
  }

  function newRound() {
    const G = TavernEngine.getState();
    if (G.roundNum >= G.maxRounds || G.deck.length === 0 || TavernEngine.getAlive().length <= 1) {
      showOverlay('result');
      return;
    }
    const mainSuit = TavernEngine.declareMainSuit();
    updateHUD();
    const colors = { 'A':'#4488cc', 'K':'#cc4444', 'Q':'#cc8844' };
    showOverlay('declare', { suit: mainSuit, color: colors[mainSuit] });
  }

  function startPlayPhase() {
    hideOverlay();
    const G = TavernEngine.getState();
    const mainEl = document.getElementById('lbMainBadge');
    mainEl.textContent = `主牌: ${G.mainSuit}`;
    mainEl.classList.remove('hidden');
    document.getElementById('lbTableCards').innerHTML = '';
    selectedCards = [];
    updateNpcHands();
    runTurn();
  }

  function runTurn() {
    const G = TavernEngine.getState();
    const current = TavernEngine.getCurrentPlayer();

    if (!current || !current.alive) {
      G.turnIndex = TavernEngine.getNextAliveIndex(G.turnIndex);
      runTurn();
      return;
    }

    updateHUD();
    highlightActiveNpc(current.id);

    if (current.isHuman) {
      if (G.phase === 'play') showPlayerPlayUI();
      else if (G.phase === 'judge') showPlayerJudgeUI();
    } else {
      if (G.phase === 'play') npcDoPlay(current);
      else if (G.phase === 'judge') npcDoJudge(current);
    }
  }

  // ═══════════════════════════════════════════════
  //  Timer
  // ═══════════════════════════════════════════════
  function startTimer(seconds, onTimeout) {
    stopTimer();
    let left = seconds;
    const timerEl = document.getElementById('lbTimer');
    const fill = document.getElementById('lbTimerFill');
    const text = document.getElementById('lbTimerText');
    timerEl.classList.remove('hidden');
    fill.style.transition = 'none';
    fill.style.width = '100%';
    fill.offsetHeight;
    fill.style.transition = `width ${seconds}s linear`;
    fill.style.width = '0%';
    text.textContent = `${left}s`;
    text.style.color = '#888';

    timerInterval = setInterval(() => {
      left--;
      text.textContent = `${left}s`;
      if (left <= 5) text.style.color = '#ff4444';
      if (left <= 0) {
        stopTimer();
        if (onTimeout) onTimeout();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    const timerEl = document.getElementById('lbTimer');
    if (timerEl) timerEl.classList.add('hidden');
  }

  // ═══════════════════════════════════════════════
  //  Player: Play 1-3 cards
  // ═══════════════════════════════════════════════
  function showPlayerPlayUI() {
    selectedCards = [];
    renderHandCards(true);
    showButtons(['bet', 'fold']);
    document.getElementById('lbBtnBet').disabled = true;
    document.getElementById('lbSelectHint').classList.remove('hidden');
    document.getElementById('lbSelectHint').textContent = '选择 1-3 张牌打出 (0 已选)';
    startTimer(30, () => {
      // Auto-play first card on timeout
      if (selectedCards.length === 0) selectedCards = [0];
      onBet();
    });
  }

  function selectCard(idx) {
    const pos = selectedCards.indexOf(idx);
    if (pos >= 0) {
      selectedCards.splice(pos, 1);
    } else if (selectedCards.length < 3) {
      selectedCards.push(idx);
    }
    document.querySelectorAll('.lb-hand-card').forEach((c, i) => {
      c.classList.toggle('selected', selectedCards.includes(i));
    });
    document.getElementById('lbBtnBet').disabled = selectedCards.length === 0;
    document.getElementById('lbSelectHint').textContent = `选择 1-3 张牌打出 (${selectedCards.length} 已选)`;
  }

  function onBet() {
    if (selectedCards.length === 0) return;
    stopTimer();
    document.getElementById('lbSelectHint').classList.add('hidden');
    const result = TavernEngine.playerPlayCards(selectedCards);
    if (!result) return;

    // Add face-down cards to table
    for (let i = 0; i < result.count; i++) {
      addTableCard(false);
    }
    selectedCards = [];
    renderHandCards(false);
    updateHUD();
    setTimeout(() => runTurn(), 600);
  }

  function onFold() {
    const G = TavernEngine.getState();
    const player = G.players[0];
    if (player.hand.length === 0) return;
    const idx = selectedCards.length > 0 ? selectedCards[0] : 0;
    player.hand.splice(idx, 1);
    const newCard = G.deck.pop();
    if (newCard) player.hand.push(newCard);
    G.playerChips -= 10;
    selectedCards = [];
    renderHandCards(true);
    updateHUD();
  }

  // ═══════════════════════════════════════════════
  //  Player: Judge
  // ═══════════════════════════════════════════════
  function showPlayerJudgeUI() {
    const G = TavernEngine.getState();
    const liar = G.players.find(p => p.id === G.tablePlayerId);
    renderHandCards(false);
    showButtons(['check', 'liar']);
    document.getElementById('lbSelectHint').classList.add('hidden');

    if (liar) showNpcBubble(liar.id, `打出 ${(G.tableCards||[]).length} 张「${G.mainSuit}」`);

    startTimer(30, () => onCheck());
  }

  function onCheck() {
    stopTimer();
    hideNpcBubbles();
    TavernEngine.judgeAction('follow');
    TavernEngine.getState().phase = 'play';
    setTimeout(() => runTurn(), 400);
  }

  function onCallLiar() {
    stopTimer();
    hideNpcBubbles();
    const result = TavernEngine.judgeAction('call');
    pendingReveal = result;
    flipAllTableCards(result.cards);
    setTimeout(() => showOverlay('reveal', result), 800);
  }

  // ═══════════════════════════════════════════════
  //  NPC: Play
  // ═══════════════════════════════════════════════
  function npcDoPlay(npc) {
    showButtons([]);
    document.getElementById('lbSelectHint').classList.add('hidden');
    showNpcBubble(npc.id, `${npc.name} 选牌中...`);

    setTimeout(() => {
      const result = TavernEngine.npcPlayCards();
      if (!result) return;
      hideNpcBubbles();

      for (let i = 0; i < result.count; i++) {
        setTimeout(() => addTableCard(false), i * 200);
      }

      const npcData = TavernData.getNPC(npc.id);
      const phrases = npcData ? npcData.truePhrases : ['就这样'];
      showNpcBubble(npc.id, `${result.count}张 ${TavernEngine.getState().mainSuit}! ${phrases[Math.floor(Math.random()*phrases.length)]}`);

      updateHUD();
      updateNpcHands();
      setTimeout(() => { hideNpcBubbles(); runTurn(); }, 1500);
    }, 1000 + Math.random() * 800);
  }

  // ═══════════════════════════════════════════════
  //  NPC: Judge
  // ═══════════════════════════════════════════════
  function npcDoJudge(npc) {
    showButtons([]);
    const npcData = TavernData.getNPC(npc.id);
    showNpcBubble(npc.id, `${npc.name} 在犹豫...`);

    setTimeout(() => {
      const result = TavernEngine.npcJudge();
      if (!result) return;
      hideNpcBubbles();

      if (result.action === 'call') {
        const scared = npcData ? npcData.taunts : ['骗子!'];
        showNpcBubble(npc.id, `${scared[Math.floor(Math.random()*scared.length)]} 翻牌!`);
        pendingReveal = result.result;
        flipAllTableCards(result.result.cards);
        setTimeout(() => { hideNpcBubbles(); showOverlay('reveal', result.result); }, 1000);
      } else {
        const pass = npcData ? npcData.truePhrases : ['...算了'];
        showNpcBubble(npc.id, pass[Math.floor(Math.random()*pass.length)]);
        setTimeout(() => { hideNpcBubbles(); runTurn(); }, 800);
      }
    }, 1200 + Math.random() * 600);
  }

  // ═══════════════════════════════════════════════
  //  Roulette
  // ═══════════════════════════════════════════════
  function showRoulette() {
    const G = TavernEngine.getState();
    const target = G.players.find(p => p.id === G.rouletteTarget);
    showOverlay('roulette', { target });
  }

  function onPullTrigger() {
    const btn = document.getElementById('lbTriggerBtn');
    if (btn) btn.disabled = true;
    const result = TavernEngine.pullTrigger();
    pendingRouletteResult = result;
    setTimeout(() => showOverlay('rouletteResult', result), 1500);
  }

  function afterRoulette() {
    const result = pendingRouletteResult;
    if (result.gameOver) { showOverlay('result'); return; }
    const canContinue = TavernEngine.continueAfterRoulette();
    if (!canContinue) { showOverlay('result'); return; }
    hideOverlay();
    updateNpcVisuals();
    newRound();
  }

  // ═══════════════════════════════════════════════
  //  Render: Hand Cards
  // ═══════════════════════════════════════════════
  function renderHandCards(selectable) {
    const G = TavernEngine.getState();
    const player = G.players[0];
    const handArea = document.getElementById('lbHandArea');
    if (!handArea) return;
    handArea.innerHTML = '';
    player.hand.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = `lb-hand-card${selectedCards.includes(i) ? ' selected' : ''}`;
      if (selectable) el.onclick = () => selectCard(i);
      if (card.suit === 'Joker') {
        el.innerHTML = `<div class="hc-joker">🃏</div><div class="hc-label">百搭</div><div class="hc-text" style="color:#d4a017">JOKER</div>`;
      } else {
        el.innerHTML = `<div class="hc-suit" style="color:${card.suitColor}">${card.display}</div><div class="hc-label">${card.suitLabel}</div><div class="hc-text">${card.text}</div>`;
      }
      handArea.appendChild(el);
    });
  }

  // ═══════════════════════════════════════════════
  //  Render: Table Cards
  // ═══════════════════════════════════════════════
  function addTableCard(faceUp) {
    const container = document.getElementById('lbTableCards');
    const el = document.createElement('div');
    el.className = `lb-played-card ${faceUp ? 'face-up' : 'face-down'}`;
    el.textContent = faceUp ? '?' : '🂠';
    container.appendChild(el);
  }

  function flipAllTableCards(cards) {
    const container = document.getElementById('lbTableCards');
    const cardEls = container.querySelectorAll('.lb-played-card');
    cards.forEach((card, i) => {
      const el = cardEls[cardEls.length - cards.length + i];
      if (el) {
        el.className = 'lb-played-card face-up';
        el.innerHTML = `<div class="card-suit" style="color:${card.suitColor}">${card.display}</div><div style="font-size:6px;margin-top:2px">${card.text.substring(0,12)}</div>`;
      }
    });
  }

  // ═══════════════════════════════════════════════
  //  UI Helpers
  // ═══════════════════════════════════════════════
  function showButtons(types) {
    const map = { bet:'lbBtnBet', check:'lbBtnCheck', liar:'lbBtnLiar', fold:'lbBtnFold' };
    Object.entries(map).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el) { el.style.display = types.includes(key) ? '' : 'none'; el.disabled = false; }
    });
  }

  function updateHUD() {
    const G = TavernEngine.getState();
    const el = (id) => document.getElementById(id);
    if (el('lbChips')) el('lbChips').textContent = G.playerChips;
    if (el('lbPot')) el('lbPot').textContent = G.pot;
    if (el('lbPotCenter')) el('lbPotCenter').textContent = G.pot;
    if (el('lbRound')) el('lbRound').textContent = G.roundNum;
    G.players.filter(p => !p.isHuman).forEach(npc => {
      const c = el('lbChips_' + npc.id);
      if (c) c.textContent = G.npcChips[npc.id] || 0;
    });
    const livesEl = el('lbLives');
    if (livesEl) {
      const hp = G.players[0].hp || 0;
      livesEl.textContent = '❤️'.repeat(Math.max(0, hp)) + '🖤'.repeat(Math.max(0, 6 - hp));
    }
  }

  function updateNpcHands() {
    const G = TavernEngine.getState();
    G.players.filter(p => !p.isHuman).forEach(npc => {
      const el = document.getElementById('lbHand_' + npc.id);
      if (el) {
        const count = npc.hand ? npc.hand.length : 0;
        el.innerHTML = '<div class="lb-card-back-sm">🂠</div>'.repeat(Math.min(5, count));
      }
    });
  }

  function highlightActiveNpc(playerId) {
    document.querySelectorAll('.lb-npc-char').forEach(n => n.classList.remove('active'));
    const el = document.getElementById('lbNpc_' + playerId);
    if (el) el.classList.add('active');
  }

  function updateNpcVisuals() {
    const G = TavernEngine.getState();
    G.players.filter(p => !p.isHuman).forEach(npc => {
      const el = document.getElementById('lbNpc_' + npc.id);
      if (el) el.classList.toggle('eliminated', !npc.alive);
    });
  }

  function showNpcBubble(npcId, text) {
    hideNpcBubbles();
    const npcEl = document.getElementById('lbNpc_' + npcId);
    if (!npcEl) return;
    const bubble = document.createElement('div');
    bubble.className = 'lb-npc-speech';
    bubble.textContent = text;
    npcEl.appendChild(bubble);
  }

  function hideNpcBubbles() {
    document.querySelectorAll('.lb-npc-speech').forEach(b => b.remove());
  }

  function restart() { hideOverlay(); TavernEngine.destroy(); start(subject); }
  function quit() {
    TavernEngine.destroy();
    document.getElementById('tavernScreen')?.classList.add('hidden');
    document.getElementById('startScreen')?.classList.remove('hidden');
  }

  return {
    start, beginGame, startPlayPhase,
    onBet, onCheck, onCallLiar, onFold,
    showRoulette, onPullTrigger, afterRoulette,
    restart, quit,
  };
})();
