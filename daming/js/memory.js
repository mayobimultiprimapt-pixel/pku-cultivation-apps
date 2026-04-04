// ============================================================
// Memory Module — 记忆点系统
// ============================================================
const Memory = {
  items: [],
  filtered: null,

  async init() {
    await this.load();
  },

  async load() {
    try {
      const res = await fetch('/api/memories');
      const data = await res.json();
      if (data.success) {
        this.items = data.memories;
        this.render();
      }
    } catch (e) {
      // Fallback to localStorage
      const stored = localStorage.getItem('daming_memories');
      if (stored) {
        this.items = JSON.parse(stored);
        this.render();
      }
    }
  },

  async save(memory) {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory)
      });
      const data = await res.json();
      if (data.success) {
        this.items.unshift(data.memory);
        this.render();
        App.toast('💫 已保存为记忆点', 'success');
        return data.memory;
      }
    } catch (e) {
      // Fallback
      const item = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        ...memory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.items.unshift(item);
      localStorage.setItem('daming_memories', JSON.stringify(this.items));
      this.render();
      App.toast('💫 已保存（本地存储）', 'success');
      return item;
    }
  },

  async toggleStar(id) {
    const item = this.items.find(m => m.id === id);
    if (!item) return;
    item.starred = !item.starred;

    try {
      await fetch(`/api/memories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: item.starred })
      });
    } catch (e) {
      localStorage.setItem('daming_memories', JSON.stringify(this.items));
    }
    this.render();
  },

  async remove(id) {
    if (!confirm('确定删除此记忆点？')) return;
    this.items = this.items.filter(m => m.id !== id);
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
    } catch (e) {
      localStorage.setItem('daming_memories', JSON.stringify(this.items));
    }
    this.render();
    App.toast('记忆点已删除', 'info');
  },

  search(query) {
    if (!query.trim()) {
      this.filtered = null;
      this.render();
      return;
    }
    const q = query.toLowerCase();
    this.filtered = this.items.filter(m =>
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.content && m.content.toLowerCase().includes(q)) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
    );
    this.render();
  },

  render() {
    const container = document.getElementById('memory-list');
    const emptyState = document.getElementById('memory-empty');
    const items = this.filtered !== null ? this.filtered : this.items;

    if (items.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      // Remove all cards
      container.querySelectorAll('.memory-card').forEach(c => c.remove());
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Remove existing cards
    container.querySelectorAll('.memory-card').forEach(c => c.remove());

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.innerHTML = `
        <div class="memory-card-header">
          <span class="star" onclick="Memory.toggleStar('${item.id}')">${item.starred ? '⭐' : '☆'}</span>
          <span class="memory-card-title">${this.escapeHtml(item.title)}</span>
          <span class="memory-card-date">${this.formatDate(item.createdAt)}</span>
        </div>
        <div class="memory-card-content">${this.escapeHtml(item.content)}</div>
        <div class="memory-card-actions">
          <button class="msg-action-btn" onclick="Memory.copyContent('${item.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            复制
          </button>
          <button class="msg-action-btn" onclick="Memory.useInChat('${item.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            发送到对话
          </button>
          <button class="msg-action-btn" onclick="Memory.remove('${item.id}')" style="color: var(--crimson-bright)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            删除
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  },

  copyContent(id) {
    const item = this.items.find(m => m.id === id);
    if (!item) return;
    navigator.clipboard.writeText(item.content).then(() => {
      App.toast('已复制到剪贴板', 'success');
    });
  },

  useInChat(id) {
    const item = this.items.find(m => m.id === id);
    if (!item) return;
    App.switchTab('chat');
    const input = document.getElementById('chat-input');
    input.value = item.content;
    Chat.autoResize(input);
    input.focus();
  },

  exportAll() {
    if (this.items.length === 0) {
      App.toast('暂无记忆点可导出', 'error');
      return;
    }
    const text = this.items.map(m =>
      `# ${m.title}\n📅 ${m.createdAt}\n${m.starred ? '⭐ 已星标' : ''}\n\n${m.content}\n\n---\n`
    ).join('\n');

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `军机处记忆点_${new Date().toISOString().slice(0,10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    App.toast('记忆点已导出', 'success');
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
