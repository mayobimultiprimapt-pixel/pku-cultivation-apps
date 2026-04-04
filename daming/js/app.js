// ============================================================
// App Controller — Main Application Logic
// ============================================================
const App = {
  models: [],
  currentModel: 'gemini-2.5-flash-preview-05-20',

  async init() {
    // Check session
    if (Auth.checkSession()) {
      this.showApp();
    }

    // Load models from server
    await this.loadModels();

    // Restore last active model
    const savedModel = localStorage.getItem('daming_model');
    if (savedModel) this.currentModel = savedModel;
    this.updateModelBadge();

    // Initialize modules
    Templates.render();
    Memory.load();

    // Restore last conversation
    await this.restoreLastConversation();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') Chat.send();
    });
  },

  async loadModels() {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      if (data.success) {
        this.models = data.models;
      }
    } catch (e) {
      console.warn('Failed to load models:', e);
    }
  },

  async restoreLastConversation() {
    try {
      const res = await fetch('/api/last-active');
      const data = await res.json();
      if (data.success && data.conversationId) {
        // Restore model if saved
        if (data.modelName) {
          this.currentModel = data.modelName;
          localStorage.setItem('daming_model', data.modelName);
          this.updateModelBadge();
        }
        // Load the conversation
        await Chat.loadConversations();
        const convo = Chat.conversations.find(c => c.id === data.conversationId);
        if (convo) {
          Chat.loadConversation(data.conversationId);
        }
      } else {
        await Chat.loadConversations();
      }
    } catch (e) {
      await Chat.loadConversations();
    }
  },

  saveLastActive() {
    const convoId = Chat.currentConversationId;
    if (convoId) {
      fetch('/api/last-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convoId,
          modelName: this.currentModel
        })
      }).catch(() => {});
    }
  },

  updateModelBadge() {
    const el = document.getElementById('model-badge-text');
    if (!el) return;
    const model = this.models.find(m => m.id === this.currentModel);
    el.textContent = model ? model.label : this.currentModel;
  },

  showApp() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('app-page').classList.add('active');
  },

  switchTab(tab) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${tab}`).classList.add('active');

    // Show/hide sidebar chat list
    const chatList = document.getElementById('sidebar-chat-list');
    if (chatList) chatList.style.display = tab === 'chat' ? '' : 'none';
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  },

  async showSettings() {
    document.getElementById('settings-modal').classList.remove('hidden');
    // Ensure models are loaded
    if (this.models.length === 0) {
      await this.loadModels();
    }
    // Load model select dynamically
    this.populateModelSelect();
    // Show key status
    this.showKeyStatus();
    // Load style
    document.getElementById('setting-style').value = localStorage.getItem('daming_style') || '';
  },

  populateModelSelect() {
    const select = document.getElementById('setting-model');
    if (!select || this.models.length === 0) return;

    let html = '';
    let lastGroup = '';
    this.models.forEach(m => {
      if (m.group !== lastGroup) {
        if (lastGroup) html += '</optgroup>';
        html += `<optgroup label="${m.group}">`;
        lastGroup = m.group;
      }
      const status = m.available ? '' : ' (无密钥)';
      const disabled = m.available ? '' : 'disabled';
      html += `<option value="${m.id}" ${disabled}>${m.label} — ${m.desc}${status}</option>`;
    });
    if (lastGroup) html += '</optgroup>';
    select.innerHTML = html;
    select.value = this.currentModel;
  },

  showKeyStatus() {
    const container = document.getElementById('key-status');
    if (!container || this.models.length === 0) return;

    const providers = {};
    this.models.forEach(m => {
      if (!providers[m.group]) {
        providers[m.group] = m.available;
      }
    });

    container.innerHTML = Object.entries(providers).map(([name, avail]) => {
      const cls = avail ? 'available' : 'unavailable';
      const icon = avail ? '✅' : '❌';
      return `<span class="key-chip ${cls}">${icon} ${name}</span>`;
    }).join('');
  },

  hideSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
    // Save model selection
    const select = document.getElementById('setting-model');
    if (select && select.value) {
      this.currentModel = select.value;
      localStorage.setItem('daming_model', select.value);
      this.updateModelBadge();
    }
    localStorage.setItem('daming_style', document.getElementById('setting-style').value);
    this.toast('设置已保存', 'success');
    // Save last active
    this.saveLastActive();
  },

  clearAllData() {
    if (!confirm('确定清除所有对话和记忆数据？此操作不可撤销。')) return;
    fetch('/api/conversations', { method: 'GET' })
      .then(r => r.json())
      .then(data => {
        (data.conversations || []).forEach(c => {
          fetch(`/api/conversations/${c.id}`, { method: 'DELETE' });
        });
      });
    fetch('/api/memories', { method: 'GET' })
      .then(r => r.json())
      .then(data => {
        (data.memories || []).forEach(m => {
          fetch(`/api/memories/${m.id}`, { method: 'DELETE' });
        });
      });
    localStorage.clear();
    this.toast('数据已清除', 'success');
    setTimeout(() => location.reload(), 1000);
  },

  toast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => App.init());
