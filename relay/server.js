/**
 * PKU API 中转隧道
 * 解决 GitHub Pages CORS 限制，统一管理 API 密钥
 * 支持: OpenRouter (DeepSeek/Claude/GPT) + Perplexity + Gemini
 */
const express = require('express');
const cors = require('cors');
const app = express();

// ---- CORS: 允许所有来源 ----
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));

// ---- 环境变量密钥 ----
const KEYS = {
  OPENROUTER: process.env.OPENROUTER_API_KEY || '',
  GEMINI: process.env.GEMINI_API_KEY || '',
  PERPLEXITY: process.env.PERPLEXITY_API_KEY || ''
};

// ---- 健康检查 ----
app.get('/', (req, res) => {
  res.json({
    status: '🚀 PKU API 隧道在线',
    version: '1.0.0',
    channels: {
      openrouter: !!KEYS.OPENROUTER,
      gemini: !!KEYS.GEMINI,
      perplexity: !!KEYS.PERPLEXITY
    },
    timestamp: new Date().toISOString()
  });
});

// ---- 通用 OpenRouter 中转 ----
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens } = req.body;
    const key = KEYS.OPENROUTER;
    if (!key) return res.status(500).json({ error: 'OpenRouter key not configured' });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://mayobimultiprimapt-pixel.github.io',
        'X-Title': 'PKU Exam Vault'
      },
      body: JSON.stringify({ model, messages, temperature: temperature || 0.7, max_tokens: max_tokens || 4096 })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[OR] ${model} ${response.status}:`, JSON.stringify(data).substring(0, 200));
      return res.status(response.status).json(data);
    }

    // Strip <think> tags from DeepSeek R1
    if (data.choices?.[0]?.message?.content) {
      data.choices[0].message.content = data.choices[0].message.content
        .replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }

    console.log(`[OR] ✅ ${model} => ${data.choices?.[0]?.message?.content?.length || 0} chars`);
    res.json(data);
  } catch (err) {
    console.error('[OR] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Gemini 中转 ----
app.post('/gemini/generate', async (req, res) => {
  try {
    const { model, messages, max_tokens } = req.body;
    const key = KEYS.GEMINI;
    if (!key) return res.status(500).json({ error: 'Gemini key not configured' });

    const geminiModel = model || 'gemini-3.1-pro-preview';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${key}`;

    // Convert OpenAI format to Gemini format
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const sysMsg = messages.find(m => m.role === 'system');

    const body = {
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: max_tokens || 4096 }
    };
    if (sysMsg) body.system_instruction = { parts: [{ text: sysMsg.content }] };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[Gemini] ${geminiModel} ${response.status}:`, JSON.stringify(data).substring(0, 200));
      return res.status(response.status).json(data);
    }

    // Convert Gemini response to OpenAI format for compatibility
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    const openaiResponse = {
      choices: [{ message: { role: 'assistant', content: text } }],
      model: geminiModel,
      usage: data.usageMetadata
    };

    console.log(`[Gemini] ✅ ${geminiModel} => ${text.length} chars`);
    res.json(openaiResponse);
  } catch (err) {
    console.error('[Gemini] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Perplexity 中转 ----
app.post('/perplexity/search', async (req, res) => {
  try {
    const { model, messages, max_tokens } = req.body;
    const key = KEYS.PERPLEXITY;
    if (!key) return res.status(500).json({ error: 'Perplexity key not configured' });

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model || 'sonar-pro',
        messages,
        max_tokens: max_tokens || 4096
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[PPX] ${response.status}:`, JSON.stringify(data).substring(0, 200));
      return res.status(response.status).json(data);
    }

    console.log(`[PPX] ✅ sonar-pro => ${data.choices?.[0]?.message?.content?.length || 0} chars`);
    res.json(data);
  } catch (err) {
    console.error('[PPX] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- 启动 ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PKU API 隧道启动 | 端口: ${PORT}`);
  console.log(`   OpenRouter: ${KEYS.OPENROUTER ? '✅' : '❌'}`);
  console.log(`   Gemini:     ${KEYS.GEMINI ? '✅' : '❌'}`);
  console.log(`   Perplexity: ${KEYS.PERPLEXITY ? '✅' : '❌'}`);
});
