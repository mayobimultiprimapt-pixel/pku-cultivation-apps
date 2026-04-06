/**
 * 识海天碑 · Spirit Tree Canvas Renderer
 * =======================================
 * Renders the holographic spirit tree with animated leaf nodes.
 */

const SpiritTree = (() => {
  let canvas, ctx;
  let width, height;
  let particles = [];
  let leafNodes = [];
  let animFrame;
  let trunkPoints = [];

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    generateTrunk();
    animate();
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    generateTrunk();
  }

  function generateTrunk() {
    trunkPoints = [];
    const baseX = width / 2;
    const baseY = height - 20;
    const topY = 60;
    const segments = 12;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = baseY + (topY - baseY) * t;
      const sway = Math.sin(t * Math.PI * 1.5) * (15 * t);
      const x = baseX + sway;
      const thickness = 8 * (1 - t * 0.7);
      trunkPoints.push({ x, y, thickness, t });
    }
  }

  function updateLeaves(cards) {
    leafNodes = [];
    if (!cards || cards.length === 0) return;

    const cx = width / 2;
    const cy = height * 0.35;
    const maxRadius = Math.min(width, height) * 0.35;

    // Arrange cards in a spiral-tree pattern
    cards.forEach((card, i) => {
      const angle = (i / cards.length) * Math.PI * 2 + (i * 0.618 * Math.PI * 2);
      const layerT = Math.sqrt(i / cards.length);
      const radius = maxRadius * layerT * 0.85 + 20;
      
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius * 0.6 - layerT * 30;

      const glow = card.treeState.glowIntensity;
      const isWithering = card.treeState.isWithering;
      const leafType = card.treeState.leafType;

      let color, size, emoji;
      switch (leafType) {
        case 'flower':
          color = `rgba(255, 128, 171, ${0.5 + glow * 0.5})`;
          size = 10;
          emoji = '🌸';
          break;
        case 'branch':
          color = `rgba(255, 213, 79, ${0.5 + glow * 0.5})`;
          size = 8;
          emoji = '✨';
          break;
        case 'leaf':
          color = `rgba(0, 230, 118, ${0.5 + glow * 0.5})`;
          size = 7;
          emoji = '🍃';
          break;
        default:
          color = `rgba(102, 187, 106, ${0.3 + glow * 0.4})`;
          size = 5;
          emoji = '🌱';
      }

      if (isWithering) {
        color = `rgba(255, 23, 68, ${0.3 + Math.sin(Date.now() / 500 + i) * 0.2})`;
      }

      leafNodes.push({
        x, y, size, color, glow, isWithering, leafType, emoji,
        offsetPhase: Math.random() * Math.PI * 2,
        card
      });
    });
  }

  function drawTrunk(time) {
    ctx.save();
    
    // Draw trunk
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.lineWidth = 2;
    
    trunkPoints.forEach((p, i) => {
      const sway = Math.sin(time * 0.001 + p.t * 3) * 2;
      const px = p.x + sway;
      if (i === 0) ctx.moveTo(px, p.y);
      else ctx.lineTo(px, p.y);
    });
    ctx.stroke();

    // Draw trunk glow
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.06)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    trunkPoints.forEach((p, i) => {
      const sway = Math.sin(time * 0.001 + p.t * 3) * 2;
      const px = p.x + sway;
      if (i === 0) ctx.moveTo(px, p.y);
      else ctx.lineTo(px, p.y);
    });
    ctx.stroke();

    // Branches
    const branchCount = 6;
    for (let b = 0; b < branchCount; b++) {
      const t = 0.3 + (b / branchCount) * 0.5;
      const idx = Math.floor(t * (trunkPoints.length - 1));
      const tp = trunkPoints[idx];
      if (!tp) continue;
      
      const dir = b % 2 === 0 ? -1 : 1;
      const len = 30 + Math.random() * 30;
      const branchSway = Math.sin(time * 0.0015 + b) * 3;
      
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(tp.x, tp.y);
      ctx.quadraticCurveTo(
        tp.x + dir * len * 0.5 + branchSway,
        tp.y - 15,
        tp.x + dir * len + branchSway,
        tp.y - 25
      );
      ctx.stroke();
    }
    
    ctx.restore();
  }

  function drawLeaves(time) {
    leafNodes.forEach((leaf, i) => {
      const wobble = Math.sin(time * 0.002 + leaf.offsetPhase) * 3;
      const px = leaf.x + wobble;
      const py = leaf.y + Math.cos(time * 0.0015 + leaf.offsetPhase) * 2;

      // Glow circle
      const glowRadius = leaf.size + (leaf.isWithering ? 2 : leaf.glow * 6);
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
      
      if (leaf.isWithering) {
        gradient.addColorStop(0, 'rgba(255, 23, 68, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 23, 68, 0)');
      } else {
        const g = leaf.glow;
        gradient.addColorStop(0, `rgba(0, 255, 136, ${g * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
      }

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.fillStyle = leaf.color;
      ctx.arc(px, py, leaf.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Connection line to trunk
      const trunkIdx = Math.floor(Math.random() * trunkPoints.length * 0.6 + trunkPoints.length * 0.2);
      const tp = trunkPoints[Math.min(trunkIdx, trunkPoints.length - 1)];
      if (tp) {
        ctx.beginPath();
        ctx.strokeStyle = leaf.isWithering
          ? 'rgba(255, 23, 68, 0.05)'
          : `rgba(0, 255, 136, ${0.02 + leaf.glow * 0.03})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(px, py);
        ctx.lineTo(tp.x, tp.y);
        ctx.stroke();
      }
    });
  }

  function drawParticles(time) {
    // Ambient floating particles
    if (particles.length < 30) {
      particles.push({
        x: Math.random() * width,
        y: height + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.3 - Math.random() * 0.5,
        size: 1 + Math.random() * 2,
        life: 1,
        decay: 0.002 + Math.random() * 0.003
      });
    }

    particles.forEach((p, i) => {
      p.x += p.vx + Math.sin(time * 0.001 + i) * 0.1;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0 || p.y < -10) {
        particles.splice(i, 1);
        return;
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(0, 255, 136, ${p.life * 0.3})`;
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawBase(time) {
    // Glowing base platform
    const baseY = height - 15;
    const gradient = ctx.createLinearGradient(width * 0.2, baseY, width * 0.8, baseY);
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0)');
    gradient.addColorStop(0.3, 'rgba(0, 255, 136, 0.08)');
    gradient.addColorStop(0.5, `rgba(0, 255, 136, ${0.1 + Math.sin(time * 0.002) * 0.03})`);
    gradient.addColorStop(0.7, 'rgba(0, 255, 136, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, baseY - 4, width, 8);
  }

  function animate(time = 0) {
    ctx.clearRect(0, 0, width, height);
    drawBase(time);
    drawParticles(time);
    drawTrunk(time);
    drawLeaves(time);
    animFrame = requestAnimationFrame(animate);
  }

  function destroy() {
    if (animFrame) cancelAnimationFrame(animFrame);
    window.removeEventListener('resize', resize);
  }

  return { init, updateLeaves, destroy };
})();
