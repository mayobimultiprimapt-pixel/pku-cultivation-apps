// ============================================================
// Chat Module — 对话引擎
// ============================================================
const Chat = {
  messages: [],
  conversations: [],
  currentConversationId: null,
  isLoading: false,

  async init() {
    await this.loadConversations();
    this.setupKeyboard();
  },

  setupKeyboard() {
    const input = document.getElementById('chat-input');
    if (!input) return;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        this.send();
      }
    });
  },

  // --- Conversations ---
  async loadConversations() {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      if (data.success) {
        this.conversations = data.conversations;
        this.renderConversationList();
      }
    } catch (e) {
      const stored = localStorage.getItem('daming_conversations');
      if (stored) {
        this.conversations = JSON.parse(stored);
        this.renderConversationList();
      }
    }
  },

  renderConversationList() {
    const list = document.getElementById('conversation-list');
    if (!list) return;

    list.innerHTML = this.conversations.map(c => `
      <div class="convo-item ${c.id === this.currentConversationId ? 'active' : ''}" onclick="Chat.loadConversation('${c.id}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="convo-title">${this.escapeHtml(c.title)}</span>
        <button class="btn-icon convo-delete" onclick="event.stopPropagation(); Chat.deleteConversation('${c.id}')" title="删除">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `).join('');
  },

  async newConversation() {
    this.messages = [];
    this.currentConversationId = null;
    this.renderMessages();
    document.getElementById('welcome-screen').style.display = 'flex';
    App.switchTab('chat');
    document.getElementById('chat-input').focus();
    this.renderConversationList();
  },

  async loadConversation(id) {
    const convo = this.conversations.find(c => c.id === id);
    if (!convo) return;

    this.currentConversationId = id;
    App.saveLastActive();
    this.messages = convo.messages || [];
    document.getElementById('welcome-screen').style.display = 'none';
    this.renderMessages();
    this.renderConversationList();
    App.switchTab('chat');

    // Scroll to bottom
    const container = document.getElementById('chat-messages');
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  },

  async saveCurrentConversation() {
    if (this.messages.length === 0) return;

    const title = this.messages[0].content.slice(0, 30) + (this.messages[0].content.length > 30 ? '...' : '');

    if (this.currentConversationId) {
      // Update existing
      const convo = this.conversations.find(c => c.id === this.currentConversationId);
      if (convo) {
        convo.messages = this.messages;
        convo.title = title;
        convo.updatedAt = new Date().toISOString();
      }
      try {
        await fetch(`/api/conversations/${this.currentConversationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, messages: this.messages })
        });
      } catch (e) {
        localStorage.setItem('daming_conversations', JSON.stringify(this.conversations));
      }
    } else {
      // Create new
      const convoData = { title, messages: this.messages };
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(convoData)
        });
        const data = await res.json();
        if (data.success) {
          this.currentConversationId = data.conversation.id;
          this.conversations.unshift(data.conversation);
        }
      } catch (e) {
        const newConvo = {
          id: Date.now().toString(36),
          ...convoData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.currentConversationId = newConvo.id;
        this.conversations.unshift(newConvo);
        localStorage.setItem('daming_conversations', JSON.stringify(this.conversations));
      }
    }
    this.renderConversationList();
  },

  async deleteConversation(id) {
    if (!confirm('确定删除此对话？')) return;
    this.conversations = this.conversations.filter(c => c.id !== id);
    if (this.currentConversationId === id) {
      this.currentConversationId = null;
      this.messages = [];
      this.renderMessages();
      document.getElementById('welcome-screen').style.display = 'flex';
    }
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    } catch (e) {
      localStorage.setItem('daming_conversations', JSON.stringify(this.conversations));
    }
    this.renderConversationList();
  },

  // --- Sending Messages ---
  sendQuick(text) {
    document.getElementById('chat-input').value = text;
    this.send();
  },

  async send() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    const attachments = Upload.getAndClear();

    if (!text && attachments.length === 0) return;
    if (this.isLoading) return;

    // Hide welcome
    document.getElementById('welcome-screen').style.display = 'none';

    // Compose user message
    let userContent = text;
    let imageData = null;

    // Handle attachments
    attachments.forEach(att => {
      if (att.type === 'image') {
        imageData = att.dataUrl;
        userContent += `\n[上传图片: ${att.name}]`;
      } else if (att.type === 'file' && att.content && typeof att.content === 'string' && !att.content.startsWith('data:')) {
        userContent += `\n\n--- 上传文件: ${att.name} ---\n${att.content}\n--- 文件结束 ---`;
      } else {
        userContent += `\n[上传文件: ${att.name}]`;
      }
    });

    // Add user message
    const userMsg = {
      role: 'user',
      content: userContent,
      imageData: imageData,
      timestamp: new Date().toISOString()
    };
    this.messages.push(userMsg);
    this.addMessageToDOM(userMsg);

    input.value = '';
    this.autoResize(input);

    // Show typing
    this.isLoading = true;
    this.showTyping();
    this.updateSendButton();

    try {
      // Build history for context
      const history = this.messages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const modelName = App.currentModel || 'gemini-2.5-flash-preview-05-20';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userContent,
          history: history.slice(-20), // Last 20 messages for context
          imageData: imageData,
          modelName: modelName
        })
      });

      const data = await res.json();
      this.hideTyping();

      if (data.success) {
        const aiMsg = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };
        this.messages.push(aiMsg);
        this.addMessageToDOM(aiMsg);
      }
    } catch (error) {
      this.hideTyping();
      const errMsg = {
        role: 'assistant',
        content: '⚠️ **通信中断** — 军机处与天庭连接暂时断开。请检查网络或稍后重试。',
        timestamp: new Date().toISOString()
      };
      this.messages.push(errMsg);
      this.addMessageToDOM(errMsg);
    }

    this.isLoading = false;
    this.updateSendButton();
    this.saveCurrentConversation();
    App.saveLastActive();
  },

  // --- DOM Rendering ---
  addMessageToDOM(msg) {
    const container = document.getElementById('chat-messages');
    const isUser = msg.role === 'user';

    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

    const avatarText = isUser ? '圣' : '臣';
    let contentHtml = isUser ? this.escapeHtml(msg.content) : this.renderMarkdown(msg.content);

    // Add image preview for user messages with images
    let imageHtml = '';
    if (msg.imageData) {
      imageHtml = `<img src="${msg.imageData}" class="message-image" alt="上传图片">`;
    }

    div.innerHTML = `
      <div class="message-avatar">${avatarText}</div>
      <div class="message-body">
        ${imageHtml}
        <div class="message-content">${contentHtml}</div>
        <div class="message-actions">
          <button class="msg-action-btn" onclick="Chat.copyMessage(this)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            复制
          </button>
          ${!isUser ? `
            <button class="msg-action-btn" onclick="Chat.saveAsMemory(${this.messages.length - 1})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              记忆
            </button>
          ` : ''}
        </div>
      </div>
    `;

    container.appendChild(div);

    // Scroll to bottom
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  },

  renderMessages() {
    const container = document.getElementById('chat-messages');
    // Keep welcome screen, remove messages
    const welcome = document.getElementById('welcome-screen');
    container.innerHTML = '';
    container.appendChild(welcome);

    this.messages.forEach(msg => {
      this.addMessageToDOM(msg);
    });
  },

  showTyping() {
    const container = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.className = 'message ai-message';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="message-avatar">臣</div>
      <div class="message-body">
        <div class="message-content">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  },

  hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  },

  updateSendButton() {
    const btn = document.getElementById('send-btn');
    btn.classList.toggle('disabled', this.isLoading);
  },

  // --- Actions ---
  copyMessage(btn) {
    const content = btn.closest('.message-body').querySelector('.message-content').textContent;
    navigator.clipboard.writeText(content).then(() => {
      App.toast('已复制', 'success');
    });
  },

  saveAsMemory(msgIndex) {
    const msg = this.messages[msgIndex];
    if (!msg) return;

    const title = msg.content.slice(0, 50).replace(/[#*\n]/g, '').trim();
    Memory.save({
      title: title || '军机处回复',
      content: msg.content,
      type: 'chat',
      starred: true,
      tags: ['对话', '短视频']
    });
  },

  // --- Textarea Auto-resize ---
  autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  },

  // --- Markdown Rendering ---
  renderMarkdown(text) {
    if (!text) return '';

    // Escape HTML first
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered list items
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

    // Ordered list items
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');

    // Paragraphs (double newlines)
    html = html.replace(/\n\n/g, '</p><p>');

    // Single newlines
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML.replace(/\n/g, '<br>');
  }
};
