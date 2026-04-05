/**
 * 🔑 PKU考研应用集 · 加密API密钥管理
 * 密钥已加密，需登录后自动解密
 */
(function(){
  var EK={
    OR:'CQZcDgVcAQAeCVZJDklSQBNEVQcIVklUQAJPEkEJUQABGQ5DU0ZDTgYGAwdOVEdSFkUTBQZSUEhZR1kVQhIGAVAES1VBVk5GFA==',
    GE:'OyQLACQINElWRVE8BEgwOTYYYl1rfBwLAiY0OiJmSlpSDEAVABUS',
    PP:'Ch0dGVoFIlIBfVMpWyUiGBMGWFkCcUxfSRE7GAVTWlhOHQlIKB8gGHp9eFguO0AtRgcHS3E='
  };
  function dec(e,k){
    var b=atob(e),r='';
    for(var i=0;i<b.length;i++)r+=String.fromCharCode(b.charCodeAt(i)^k.charCodeAt(i%k.length));
    return r;
  }
  // Check if already authenticated
  var pwd=localStorage.getItem('pku_pwd');
  if(pwd){
    try{
      var or=dec(EK.OR,pwd);
      if(or.startsWith('sk-or-')){
        window.PKU_KEYS={
          OPENROUTER_API_KEY:or,
          OPENROUTER_URL:'https://openrouter.ai/api/v1/chat/completions',
          OPENROUTER_MODEL:'anthropic/claude-3.7-sonnet',
          GEMINI_API_KEY:dec(EK.GE,pwd),
          PERPLEXITY_API_KEY:dec(EK.PP,pwd)
        };
        console.log('[PKU-KEYS] ✅ 密钥已解密加载');
      }
    }catch(e){}
  }
  // Auth function for sub-apps
  window.PKU_AUTH={
    isLoggedIn:function(){return !!window.PKU_KEYS;},
    login:function(user,pass){
      if(user!==pass)return false;
      try{
        var or=dec(EK.OR,pass);
        if(!or.startsWith('sk-or-'))return false;
        localStorage.setItem('pku_pwd',pass);
        window.PKU_KEYS={
          OPENROUTER_API_KEY:or,
          OPENROUTER_URL:'https://openrouter.ai/api/v1/chat/completions',
          OPENROUTER_MODEL:'anthropic/claude-3.7-sonnet',
          GEMINI_API_KEY:dec(EK.GE,pass),
          PERPLEXITY_API_KEY:dec(EK.PP,pass)
        };
        return true;
      }catch(e){return false}
    },
    logout:function(){localStorage.removeItem('pku_pwd');window.PKU_KEYS=null;}
  };
  // Universal AI call
  window.PKU_AI=async function(sys,usr,opts){
    if(!window.PKU_KEYS)throw new Error('未登录');
    var k=window.PKU_KEYS.OPENROUTER_API_KEY;
    var r=await fetch(window.PKU_KEYS.OPENROUTER_URL,{method:'POST',headers:{'Authorization':'Bearer '+k,'Content-Type':'application/json'},body:JSON.stringify({model:(opts&&opts.model)||window.PKU_KEYS.OPENROUTER_MODEL,messages:[{role:'system',content:sys},{role:'user',content:usr}],temperature:(opts&&opts.temperature)||0.4,max_tokens:(opts&&opts.maxTokens)||4096})});
    var d=await r.json();if(d.error)throw new Error(d.error.message);
    var c=(d.choices||[{}])[0]?.message?.content||'';
    return c.replace(/<think>[\s\S]*?<\/think>/g,'').trim();
  };
  window.PKU_SEARCH=async function(sys,usr){
    if(!window.PKU_KEYS)throw new Error('未登录');
    var k=window.PKU_KEYS.PERPLEXITY_API_KEY;
    var r=await fetch('https://api.perplexity.ai/chat/completions',{method:'POST',headers:{'Authorization':'Bearer '+k,'Content-Type':'application/json'},body:JSON.stringify({model:'sonar-pro',messages:[{role:'system',content:sys},{role:'user',content:usr}],temperature:0.2,max_tokens:2048})});
    var d=await r.json();if(d.error)throw new Error(d.error.message);
    return (d.choices||[{}])[0]?.message?.content||'';
  };
})();
