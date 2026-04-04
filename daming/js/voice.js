// ============================================================
// Voice Module — 语音识别
// ============================================================
const Voice = {
  recognition: null,
  isRecording: false,
  supported: false,

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[語音] 浏览器不支持语音识别');
      const btn = document.getElementById('voice-btn');
      if (btn) btn.style.display = 'none';
      return;
    }

    this.supported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'zh-CN';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const input = document.getElementById('chat-input');
      if (finalTranscript) {
        input.value += finalTranscript;
        Chat.autoResize(input);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('[語音] Error:', event.error);
      if (event.error === 'not-allowed') {
        App.toast('请允许使用麦克风', 'error');
      }
      this.stop();
    };

    this.recognition.onend = () => {
      if (this.isRecording) {
        // Auto-restart if still recording
        try {
          this.recognition.start();
        } catch(e) {}
      }
    };
  },

  toggle() {
    if (!this.supported) {
      App.toast('您的浏览器不支持语音识别', 'error');
      return;
    }

    if (this.isRecording) {
      this.stop();
    } else {
      this.start();
    }
  },

  start() {
    if (!this.supported || this.isRecording) return;

    try {
      this.recognition.start();
      this.isRecording = true;
      document.getElementById('voice-btn').classList.add('recording');
      App.toast('🎙️ 正在聆听...', 'info');
    } catch (e) {
      console.error('[語音] Start error:', e);
    }
  },

  stop() {
    if (!this.isRecording) return;

    this.isRecording = false;
    document.getElementById('voice-btn').classList.remove('recording');

    try {
      this.recognition.stop();
    } catch (e) {}

    App.toast('语音识别已停止', 'info');
  }
};
