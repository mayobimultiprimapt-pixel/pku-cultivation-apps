// ============================================================
//  AI 缇庡鍏荤敓椤鹃棶 鈥?OpenRouter API (DeepSeek V3)
//  瀵嗛挜浠庡叡浜姞瀵嗙紪 api-keys.js 鑷姩鑾峰彇
// ============================================================

function getORKey(){return (window.PKU_KEYS&&window.PKU_KEYS.OPENROUTER_API_KEY)||null}
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = 'deepseek/deepseek-chat-v3-0324';

let chatHistory = [];
let chatLoading = false;

const BEAUTY_SYSTEM_PROMPT = '浣犳槸涓撳睘AI缇庡鍏荤敓椤鹃棶锛岀簿閫氱瀛﹀噺鑴?浣撶Н楗娉?211椁愮洏)銆佺編瀹规姢鑲?鐑熼叞鑳?A閱?VC)銆佹场婢″吇鐢?鐟舵荡/绮炬补)銆佷腑鍖诲吇鐢?浣撹川杈ㄨ瘑/椋熺枟)銆佹噿浜哄彉缇庢柟妗堛€傚洖绛旇涓撲笟浣嗛€氫織锛岀粰鍑虹簿纭彲鎵ц鏂规(椋熸潗鐢ㄩ噺/鏃堕棿/姝ラ)锛屾湁绂佸繉蹇呴』棰勮鈿狅笍锛岀敤emoji璁╁洖绛旂敓鍔ㄣ€?;

const QUICK_QUESTIONS = [
  { icon:'馃拵', text:'缇庣櫧鏈€蹇柟妗? },
  { icon:'馃', text:'浠婂ぉ鍚冧粈涔堝噺鑴? },
  { icon:'馃泚', text:'娉℃尽閰嶆柟鎺ㄨ崘' },
  { icon:'馃槾', text:'鍔╃湢鍏婚鏂规' },
  { icon:'馃拪', text:'鑳跺師铔嬬櫧鎬庝箞琛? },
  { icon:'馃嵉', text:'绁涙箍缇庣櫧鑼舵帹鑽? },
  { icon:'馃Т', text:'A閱囧拰VC鑳戒竴璧风敤鍚? },
  { icon:'馃弮', text:'鎳掍汉5鍒嗛挓鐕冭剛' },
];

// Load saved chat
try { const s = JSON.parse(localStorage.getItem('beauty_chat') || '[]'); if (s.length) chatHistory = s; } catch(e){}

// Format markdown
function fmtAI(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<div style="font-size:15px;font-weight:700;margin:10px 0 4px;color:var(--accent-peach)">$1</div>')
    .replace(/^## (.*$)/gm, '<div style="font-size:16px;font-weight:700;margin:12px 0 4px;color:var(--accent-rose)">$1</div>')
    .replace(/^- (.*$)/gm, '<div style="padding-left:12px;margin:2px 0">鈥?$1</div>')
    .replace(/^(\d+)\. (.*$)/gm, '<div style="padding-left:12px;margin:2px 0"><b>$1.</b> $2</div>')
    .replace(/\n\n/g, '<div style="height:6px"></div>')
    .replace(/\n/g, '<br>');
}

// Render chat
function renderChatTab() {
  const msgHTML = chatHistory.length === 0 ? `
    <div style="text-align:center;padding:40px 20px">
      <div style="font-size:48px;margin-bottom:16px">馃尭</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">浣犲ソ锛佹垜鏄編瀹瑰吇鐢烝I椤鹃棶</div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">
        闂垜浠讳綍缇庡銆佸噺鑲ャ€佹姢鑲ゃ€佹场婢°€佸吇鐢熼棶棰?br>
        姣斿锛氬崍椁愬悆浠€涔堣兘缇庣櫧鍙堝噺鑴傦紵<br>
        鎴栫偣鍑讳笅鏂瑰揩鎹锋爣绛惧紑濮?馃憞
      </div>
    </div>
  ` : chatHistory.map(function(msg) {
    if (msg.role === 'user') {
      return '<div style="display:flex;justify-content:flex-end;margin:12px 0"><div style="max-width:85%;padding:12px 16px;border-radius:16px 16px 4px 16px;background:linear-gradient(135deg,#e8527a,#a78bfa);font-size:13px;line-height:1.6">' + msg.content + '</div></div>';
    } else {
      return '<div style="display:flex;margin:12px 0"><div style="max-width:90%;padding:14px 16px;border-radius:16px 16px 16px 4px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);font-size:13px;line-height:1.7">' + fmtAI(msg.content) + '</div></div>';
    }
  }).join('');
  
  var loadingHTML = chatLoading ? '<div style="display:flex;margin:12px 0"><div style="padding:14px 16px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)"><div class="loading-spinner" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin-right:8px"></div><span style="font-size:12px;color:var(--text-secondary)">AI 姝ｅ湪鎬濊€?..</span></div></div>' : '';

  return '<div class="hero-card" style="margin-top:8px">' +
    '<img src="hero.png" class="hero-img" alt="ai"/>' +
    '<div class="hero-overlay">' +
    '<div class="hero-date">AI 缇庡椤鹃棶 路 DeepSeek V3</div>' +
    '<div class="hero-title">闂?em>AI</em></div>' +
    '<div class="hero-sub">缇庡路鍑忚偉路鎶よ偆路鍏荤敓路娉℃尽 鑷敱鎻愰棶</div>' +
    '</div></div>' +
    
    '<div style="padding:12px 0;display:flex;gap:8px;overflow-x:auto">' +
    QUICK_QUESTIONS.map(function(q) {
      return '<button onclick="doAsk(\'' + q.text + '\')" style="flex-shrink:0;padding:8px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:var(--text-primary);font-size:12px;cursor:pointer">' + q.icon + ' ' + q.text + '</button>';
    }).join('') +
    '</div>' +

    '<div id="chatBox" style="min-height:200px;max-height:55vh;overflow-y:auto;padding-bottom:8px">' +
    msgHTML + loadingHTML +
    '</div>' +
    
    '<div id="chatError" style="display:none;padding:10px;margin:8px 0;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:12px;font-size:12px;color:#ef4444"></div>' +

    '<div style="padding:12px 0">' +
    '<div style="display:flex;gap:8px">' +
    '<input type="text" id="chatInput" placeholder="闂垜浠讳綍缇庡鍑忚偉鍏荤敓闂..." style="flex:1;padding:14px 16px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:var(--text-primary);font-size:14px;outline:none"/>' +
    '<button id="chatSendBtn" style="width:48px;height:48px;border-radius:24px;border:none;background:linear-gradient(135deg,#e8527a,#a78bfa);color:white;font-size:18px;cursor:pointer">鉃?/button>' +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;margin-top:8px;font-size:10px;color:var(--text-secondary)">' +
    '<span>馃 DeepSeek V3 路 OpenRouter</span>' +
    '<span id="chatClearBtn" style="cursor:pointer;color:rgba(255,255,255,0.3)">馃棏锔?娓呯┖瀵硅瘽</span>' +
    '</div></div>';
}

// Bind events after render (called from app.js bindEvents)
function bindChatEvents() {
  var input = document.getElementById('chatInput');
  var sendBtn = document.getElementById('chatSendBtn');
  var clearBtn = document.getElementById('chatClearBtn');
  
  if (sendBtn) {
    sendBtn.onclick = function() { doSend(); };
  }
  if (input) {
    input.onkeydown = function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    };
  }
  if (clearBtn) {
    clearBtn.onclick = function() {
      if (confirm('纭娓呯┖瀵硅瘽锛?)) {
        chatHistory = [];
        localStorage.removeItem('beauty_chat');
        renderApp();
      }
    };
  }
  // Scroll to bottom
  var box = document.getElementById('chatBox');
  if (box) box.scrollTop = box.scrollHeight;
}

// Send message
function doSend() {
  var input = document.getElementById('chatInput');
  if (!input) { alert('鎵句笉鍒拌緭鍏ユ'); return; }
  var text = input.value.trim();
  if (!text) { return; }
  if (chatLoading) { return; }
  
  input.value = '';
  doAsk(text);
}

// Ask a question (from input or quick button)
function doAsk(text) {
  if (chatLoading) return;
  
  // Push user message and show loading
  chatHistory.push({ role: 'user', content: text });
  chatLoading = true;
  renderApp();
  
  // Hide error
  var errDiv = document.getElementById('chatError');
  if (errDiv) errDiv.style.display = 'none';
  
  // Make API call
  var msgs = [{ role: 'system', content: BEAUTY_SYSTEM_PROMPT }];
  var recent = chatHistory.slice(-20);
  for (var i = 0; i < recent.length; i++) msgs.push(recent[i]);
  
  fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getORKey(),
      'HTTP-Referer': 'http://localhost:8866',
      'X-Title': 'beauty-wellness'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: msgs,
      temperature: 0.7,
      max_tokens: 2000
    })
  })
  .then(function(res) {
    if (!res.ok) {
      return res.text().then(function(t) { throw new Error('HTTP ' + res.status + ': ' + t.substring(0, 200)); });
    }
    return res.json();
  })
  .then(function(data) {
    var reply = '鏈幏鍙栧埌鍥炲';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      reply = data.choices[0].message.content;
    }
    chatHistory.push({ role: 'assistant', content: reply });
    try { localStorage.setItem('beauty_chat', JSON.stringify(chatHistory.slice(-50))); } catch(e){}
    chatLoading = false;
    renderApp();
  })
  .catch(function(err) {
    chatHistory.push({ role: 'assistant', content: '鉂?璇锋眰澶辫触: ' + err.message });
    chatLoading = false;
    renderApp();
    // Also show error div
    setTimeout(function() {
      var errDiv = document.getElementById('chatError');
      if (errDiv) {
        errDiv.style.display = 'block';
        errDiv.textContent = '鈿狅笍 API閿欒: ' + err.message;
      }
    }, 200);
  });
}

