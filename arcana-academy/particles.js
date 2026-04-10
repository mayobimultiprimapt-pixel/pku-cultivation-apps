/* ============================================
   PARTICLES.JS — 赛博朋克粒子特效引擎
   ============================================ */

class ParticleEngine {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split('');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        // Matrix rain columns
        this.columns = Math.floor(this.canvas.width / 18);
        this.drops = Array(this.columns).fill(0).map(() => Math.random() * -50);

        // Floating particles
        for (let i = 0; i < 60; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.4 + 0.1,
                color: Math.random() > 0.7 ? '#b44aff' : '#00d4ff',
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.005
            });
        }
    }

    drawMatrixRain() {
        this.ctx.font = '12px monospace';
        for (let i = 0; i < this.columns; i++) {
            if (Math.random() > 0.97) continue;
            const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
            const x = i * 18;
            const y = this.drops[i] * 18;

            const alpha = Math.max(0, 0.08 - (this.drops[i] * 0.001));
            this.ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
            this.ctx.fillText(char, x, y);

            if (y > this.canvas.height && Math.random() > 0.99) {
                this.drops[i] = 0;
            }
            this.drops[i] += 0.3;
        }
    }

    drawParticles() {
        for (const p of this.particles) {
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += p.pulseSpeed;

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            const opacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
            const size = p.size * (0.8 + 0.2 * Math.sin(p.pulse));

            const r = parseInt(p.color.slice(1, 3), 16);
            const g = parseInt(p.color.slice(3, 5), 16);
            const b = parseInt(p.color.slice(5, 7), 16);

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.15})`;
            this.ctx.fill();
        }
    }

    burst(x, y, color = '#00d4ff', count = 30) {
        const burstParticles = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = Math.random() * 4 + 2;
            burstParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: Math.random() * 0.02 + 0.015,
                size: Math.random() * 3 + 1,
                color
            });
        }

        const drawBurst = () => {
            for (let i = burstParticles.length - 1; i >= 0; i--) {
                const bp = burstParticles[i];
                bp.x += bp.vx;
                bp.y += bp.vy;
                bp.vx *= 0.96;
                bp.vy *= 0.96;
                bp.life -= bp.decay;

                if (bp.life <= 0) {
                    burstParticles.splice(i, 1);
                    continue;
                }

                const r = parseInt(bp.color.slice(1, 3), 16);
                const g = parseInt(bp.color.slice(3, 5), 16);
                const b = parseInt(bp.color.slice(5, 7), 16);

                this.ctx.beginPath();
                this.ctx.arc(bp.x, bp.y, bp.size * bp.life, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${bp.life * 0.8})`;
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.arc(bp.x, bp.y, bp.size * bp.life * 2.5, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${bp.life * 0.15})`;
                this.ctx.fill();
            }
            if (burstParticles.length > 0) {
                requestAnimationFrame(drawBurst);
            }
        };
        requestAnimationFrame(drawBurst);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(6, 6, 16, 0.12)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawMatrixRain();
        this.drawParticles();

        requestAnimationFrame(() => this.animate());
    }
}

const particleEngine = new ParticleEngine();
