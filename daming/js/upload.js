// ============================================================
// Upload Module — 文件 & 图片上传
// ============================================================
const Upload = {
  currentAttachments: [],

  triggerFileInput() {
    document.getElementById('file-input').click();
  },

  triggerImageInput() {
    document.getElementById('image-input').click();
  },

  handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.addAttachment({
        type: 'file',
        name: file.name,
        size: file.size,
        mimeType: file.type,
        content: e.target.result
      });
    };

    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  },

  handleImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      App.toast('请选择图片文件', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      App.toast('图片大小不能超过10MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.addAttachment({
        type: 'image',
        name: file.name,
        size: file.size,
        mimeType: file.type,
        dataUrl: e.target.result
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  },

  addAttachment(attachment) {
    this.currentAttachments.push(attachment);
    this.renderPreview();
    App.toast(`已添加: ${attachment.name}`, 'success');
  },

  removeAttachment(index) {
    this.currentAttachments.splice(index, 1);
    this.renderPreview();
  },

  renderPreview() {
    const container = document.getElementById('attachment-preview');
    const items = document.getElementById('attachment-items');

    if (this.currentAttachments.length === 0) {
      container.classList.add('hidden');
      items.innerHTML = '';
      return;
    }

    container.classList.remove('hidden');
    items.innerHTML = this.currentAttachments.map((att, i) => {
      if (att.type === 'image') {
        return `
          <div class="attachment-item">
            <img src="${att.dataUrl}" alt="${att.name}">
            <span>${att.name}</span>
            <button class="attachment-remove" onclick="Upload.removeAttachment(${i})">×</button>
          </div>`;
      }
      return `
        <div class="attachment-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>${att.name}</span>
          <button class="attachment-remove" onclick="Upload.removeAttachment(${i})">×</button>
        </div>`;
    }).join('');
  },

  getAndClear() {
    const atts = [...this.currentAttachments];
    this.currentAttachments = [];
    this.renderPreview();
    return atts;
  },

  // Drag & drop setup
  setupDragDrop() {
    const body = document.body;
    let dragCounter = 0;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'drop-overlay';
    overlay.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <p>松手上传文件</p>
    `;
    body.appendChild(overlay);

    body.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      overlay.classList.add('active');
    });

    body.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        overlay.classList.remove('active');
        dragCounter = 0;
      }
    });

    body.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    body.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      overlay.classList.remove('active');

      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            this.addAttachment({
              type: 'image',
              name: file.name,
              size: file.size,
              mimeType: file.type,
              dataUrl: ev.target.result
            });
          };
          reader.readAsDataURL(file);
        } else {
          const reader = new FileReader();
          reader.onload = (ev) => {
            this.addAttachment({
              type: 'file',
              name: file.name,
              size: file.size,
              mimeType: file.type,
              content: ev.target.result
            });
          };
          if (file.type.startsWith('text/') || file.name.match(/\.(txt|md|json|csv)$/i)) {
            reader.readAsText(file);
          } else {
            reader.readAsDataURL(file);
          }
        }
      });
    });
  }
};
