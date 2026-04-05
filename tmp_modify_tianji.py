import re
import os

target = 'tianji/index.html'

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove api-keys.js
content = content.replace('<script src="api-keys.js"></script>', '')

# 2. Add SDK
if '<script src="../shared/pku-core-sdk.js"></script>' not in content:
    content = content.replace('</head>', '<script src="../shared/pku-core-sdk.js"></script>\n</head>')

# 3. Add Splash Screen after <body>
splash_html = '''
<!-- TIANJI SPLASH SCREEN -->
<div id="tianjiSplash" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#020617;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:\\'Orbitron\\',monospace;color:#08f7fe;text-align:center;overflow:hidden;transition:opacity 0.6s ease">
  <div style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0.05;background:repeating-linear-gradient(0deg,transparent,transparent 2px,#08f7fe 3px);background-size:100% 4px;animation:scanline 4s linear infinite;z-index:1;"></div>
  <style>@keyframes scanline{0%{background-position:0 0}100%{background-position:0 100px}} @keyframes spin10{100%{transform:rotate(360deg)}} @keyframes pullLoad{0%{width:0%}100%{width:100%}}</style>
  <div style="font-size:120px;color:#ffd700;animation:spin10 10s linear infinite;margin-bottom:20px;z-index:2;position:relative;text-shadow:0 0 30px rgba(255,215,0,0.5);">☯</div>
  <div style="font-size:40px;font-weight:900;letter-spacing:8px;margin-bottom:10px;z-index:2;position:relative;text-shadow:0 0 20px #08f7fe;">TIANJI PROTOCOL</div>
  <div style="font-size:14px;color:#39ff14;letter-spacing:4px;z-index:2;position:relative;">VERIFYING MATRIX CORE AUTHORIZATION...</div>
  <div style="margin-top:20px;width:200px;height:2px;background:rgba(8,247,254,0.2);position:relative;overflow:hidden;z-index:2;"><div style="position:absolute;left:0;top:0;height:100%;background:#08f7fe;animation:pullLoad 1.5s ease-out forwards;box-shadow:0 0 10px #08f7fe;"></div></div>
</div>
<script>
  window.addEventListener('load', () => {
    setTimeout(() => {
      if(typeof PKUSDK === 'undefined' || !PKUSDK.Auth.isLoggedIn()) {
        alert('ACCESS DENIED: 天机不可泄露，请返回大本营完成密钥矩阵融合。');
        window.location.href = '../index.html';
      } else {
        const sp = document.getElementById('tianjiSplash');
        if (sp) { sp.style.opacity = '0'; setTimeout(()=>sp.remove(), 600); }
      }
    }, 1500);
  });
</script>
'''
if 'id="tianjiSplash"' not in content:
    content = content.replace('<body>', '<body>\n' + splash_html)

# 4. Replace callAI and searchPerplexity
# We will use regex to find the functions and replace them
call_ai_regex = re.compile(r'async function callAI\([\s\S]*?^}', re.MULTILINE)
new_call_ai = '''async function callAI(systemPrompt, userPrompt, maxTokens = 8192, module = 'general') {
  console.log(`[天机阁] 🚀 [${module}] 呼叫核心矩阵指令...`);
  try {
    return await PKUSDK.AI.chat(systemPrompt, userPrompt, { maxTokens });
  } catch (e) {
    throw new Error(`[${module}]核心计算集群连接失败：` + e.message);
  }
}'''

search_pplx_regex = re.compile(r'async function searchPerplexity\([\s\S]*?^}', re.MULTILINE)
new_search_pplx = '''async function searchPerplexity(query, customSystem) {
  console.log('[天机] 🔴 IRON PROTOCOL 启动 | sonar-pro MAX | 目标:', query.slice(0, 50) + '...');
  try {
    const res = await PKUSDK.AI.search(customSystem || PPLX_IRON_PROTOCOL, query);
    return res;
  } catch(e) {
    throw new Error('情报链接断开: ' + e.message);
  }
}'''

content = call_ai_regex.sub(new_call_ai, content)
content = search_pplx_regex.sub(new_search_pplx, content)

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)

print('Tianji updated successfully.')
