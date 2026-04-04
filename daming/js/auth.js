// ============================================================
// Auth Module — 登录认证
// ============================================================
const Auth = {
  PASSWORD: 'zmqawqw1314',
  SESSION_KEY: 'daming_authed',

  init() {
    // Check existing session
    if (sessionStorage.getItem(this.SESSION_KEY) === 'true') {
      this.enterApp();
      return;
    }

    // Enter key handler
    const input = document.getElementById('login-password');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.login();
      });
      input.focus();
    }

    // Generate particles
    this.createParticles();
  },

  login() {
    const input = document.getElementById('login-password');
    const errorEl = document.getElementById('login-error');
    const group = document.getElementById('password-group');
    const pwd = input.value.trim();

    if (!pwd) {
      this.showError('请输入军机密钥', group, errorEl);
      return;
    }

    if (pwd !== this.PASSWORD) {
      this.showError('密钥错误，非请勿入！', group, errorEl);
      input.value = '';
      input.focus();
      return;
    }

    // Success
    sessionStorage.setItem(this.SESSION_KEY, 'true');
    errorEl.textContent = '';
    group.classList.remove('error');

    // Animate out
    const loginCard = document.querySelector('.login-card');
    loginCard.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    loginCard.style.opacity = '0';
    loginCard.style.transform = 'scale(0.95)';

    setTimeout(() => this.enterApp(), 400);
  },

  showError(msg, group, errorEl) {
    errorEl.textContent = msg;
    group.classList.remove('error');
    void group.offsetWidth; // Force reflow for re-animation
    group.classList.add('error');
  },

  enterApp() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('app-page').classList.add('active');
    App.init();
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    location.reload();
  },

  createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      p.style.width = (1 + Math.random() * 3) + 'px';
      p.style.height = p.style.width;
      container.appendChild(p);
    }
  }
};
