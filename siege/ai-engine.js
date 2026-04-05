// ============================================================
//  AI 出题引擎 · 实时生成考研真题
//  调用 DeepSeek-R1 / Claude-4 结合历年题型规律生成新题
// ============================================================

const AI_QUESTION_ENGINE = {
  // API 通道配置（从 api-keys.js 或本地 .env 读取）
  channels: {
    deepseek: {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'deepseek/deepseek-r1-0528',
      getName: () => 'DeepSeek-R1'
    },
    claude: {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'anthropic/claude-sonnet-4-20250514',
      getName: () => 'Claude-4-Sonnet'
    },
    gpt4o: {
      url: 'https://api.gptsapi.net/v1/chat/completions',
      model: 'gpt-4o',
      getName: () => 'GPT-4o'
    },
    deepseekV3: {
      url: 'https://api.gptsapi.net/v1/chat/completions',
      model: 'deepseek-chat',
      getName: () => 'DeepSeek-V3'
    }
  },

  // 获取 API Key（多源回退）
  getKey(channel) {
    // 1. 从 api-keys.js 全局变量
    if (typeof API_KEYS !== 'undefined') {
      if (channel === 'deepseek' || channel === 'claude') return API_KEYS.OPENROUTER_API_KEY;
      if (channel === 'gpt4o' || channel === 'deepseekV3') return API_KEYS.MIRROR_API_KEY;
    }
    // 2. 从 localStorage
    const stored = localStorage.getItem('siege_api_key_' + channel);
    if (stored) return stored;
    // 3. 从内嵌 Base64
    try {
      const embedded = {
        openrouter: atob('c2stb3ItdjEtOGIzY2UyODIyOTQwNGI1OWJlNTNhMDkwYTg5OWQ5MjZkMGE1MmI2MTJhZDg4MTg1ZmRhYjk2MGQ4OGQ4Nzk3Yw=='),
        mirror: atob('c2stVllqNDg4bnBHYnd2b1piWjhja0YzTHA4Y0hTdXg4d2Rqc1RHbTEyYm0yd2Zo')
      };
      if (channel === 'deepseek' || channel === 'claude') return embedded.openrouter;
      if (channel === 'gpt4o' || channel === 'deepseekV3') return embedded.mirror;
    } catch(e) {}
    return null;
  },

  // 各科出题 Prompt 模板
  getPrompt(subject, count, type) {
    const subjectMeta = {
      '101': {
        name: '考研政治(101)',
        chapters: '马克思主义基本原理、毛泽东思想和中国特色社会主义理论体系概论、中国近现代史纲要、思想道德与法治、形势与政策',
        style: '紧跟时政热点，注重理论联系实际，考查对基本概念和原理的理解'
      },
      '201': {
        name: '考研英语一(201)',
        chapters: '阅读理解、完形填空、翻译、写作、新题型',
        style: '词汇量要求约5500，阅读材料多来自经济学人、纽约时报等外刊，重点考查推理判断和词义理解'
      },
      '301': {
        name: '考研数学一(301)',
        chapters: '高等数学(极限、微积分、微分方程、级数、多元函数)、线性代数(矩阵、行列式、向量、线性方程组、特征值)、概率论与数理统计',
        style: '注重计算能力和综合运用，常见一题多知识点交叉'
      },
      '408': {
        name: '计算机学科专业基础(408)',
        chapters: '数据结构(线性表、树、图、排序、查找)、计算机组成原理(数据表示、指令系统、存储器、CPU、总线)、操作系统(进程、内存、文件、I/O)、计算机网络(OSI/TCP/IP、各层协议)',
        style: '知识面广，注重基础概念和算法分析，常考复杂度分析和协议细节'
      }
    };

    const meta = subjectMeta[subject];
    const typeDesc = {
      single: '单选题(4个选项ABCD，只有一个正确答案)',
      multi: '多选题(4个选项ABCD，2-4个正确答案)',
      judge: '判断题(2个选项：A.正确 B.错误)'
    };

    return `你是一位资深考研命题专家，精通${meta.name}。

请严格按照以下JSON格式生成${count}道${typeDesc[type] || '单选题'}：

要求：
1. 题目必须符合考研真实难度和风格
2. 涵盖章节：${meta.chapters}
3. 命题风格：${meta.style}
4. 每道题都必须包含详细解析
5. 难度分布：简单30%、中等50%、困难20%

严格按以下JSON数组格式输出，不要有任何其他文字：
[
  {
    "id": "ai-${subject}-001",
    "type": "${type}",
    "stem": "题目内容",
    "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
    "answer": "A",
    "analysis": "详细解析",
    "chapter": "所属章节",
    "difficulty": 3
  }
]`;
  },

  // 调用 AI 生成题目
  async generate(subject, count = 10, type = 'single', channel = 'deepseek') {
    const ch = this.channels[channel];
    const key = this.getKey(channel);
    if (!key) throw new Error('未找到 API 密钥，请在设置中配置');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    };
    if (channel === 'deepseek' || channel === 'claude') {
      headers['HTTP-Referer'] = 'https://mayobimultiprimapt-pixel.github.io/pku-cultivation-apps/siege/';
      headers['X-Title'] = 'PKU Exam Match-3 Battle';
    }

    const response = await fetch(ch.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: ch.model,
        messages: [
          { role: 'system', content: '你是考研命题专家。只输出JSON数组，不要任何解释文字。' },
          { role: 'user', content: this.getPrompt(subject, count, type) }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 提取 JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('AI返回格式异常');

    const questions = JSON.parse(jsonMatch[0]);
    return questions.map((q, i) => ({
      ...q,
      id: `ai-${subject}-${Date.now()}-${i}`,
      source: ch.getName(),
      generated: Date.now()
    }));
  },

  // 批量生成并存储
  async batchGenerate(subject, totalCount = 50, onProgress) {
    const results = [];
    const types = ['single', 'single', 'single', 'multi', 'judge']; // 60% single, 20% multi, 20% judge
    const channels = ['deepseek', 'claude', 'deepseekV3']; // 轮换模型
    const batchSize = 10;

    for (let i = 0; i < totalCount; i += batchSize) {
      const remaining = Math.min(batchSize, totalCount - i);
      const type = types[Math.floor(i / batchSize) % types.length];
      const channel = channels[Math.floor(i / batchSize) % channels.length];

      try {
        if (onProgress) onProgress(`正在用 ${this.channels[channel].getName()} 生成第 ${i+1}-${i+remaining} 题...`, i/totalCount);
        const batch = await this.generate(subject, remaining, type, channel);
        results.push(...batch);
      } catch (e) {
        console.error(`[AI出题] 批次失败:`, e);
        if (onProgress) onProgress(`⚠️ ${e.message}，跳过本批`, i/totalCount);
      }

      // 防限流
      if (i + batchSize < totalCount) await new Promise(r => setTimeout(r, 2000));
    }

    // 存储到 localStorage
    this.saveToBank(subject, results);
    return results;
  },

  // 存储 AI 生成题目到本地题库
  saveToBank(subject, questions) {
    const key = 'siege_ai_bank_' + subject;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const merged = [...existing, ...questions];
    // 去重
    const seen = new Set();
    const deduped = merged.filter(q => {
      const sig = q.stem.slice(0, 50);
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
    localStorage.setItem(key, JSON.stringify(deduped));
    return deduped.length;
  },

  // 从本地题库加载 AI 题目
  loadFromBank(subject) {
    const key = 'siege_ai_bank_' + subject;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  // 获取题库统计
  getStats() {
    const stats = {};
    ['101', '201', '301', '408'].forEach(sub => {
      const bank = this.loadFromBank(sub);
      stats[sub] = {
        total: bank.length,
        byType: {
          single: bank.filter(q => q.type === 'single').length,
          multi: bank.filter(q => q.type === 'multi').length,
          judge: bank.filter(q => q.type === 'judge').length
        },
        byModel: {}
      };
      bank.forEach(q => {
        const src = q.source || 'unknown';
        stats[sub].byModel[src] = (stats[sub].byModel[src] || 0) + 1;
      });
    });
    return stats;
  }
};

// === 扩展消消乐的 getQuestion 函数，合并 AI 题库 ===
const _origGetQuestion = typeof getQuestion === 'function' ? getQuestion : null;
function getQuestionEnhanced(subject, type) {
  // 合并静态题库 + AI题库
  const staticBank = (typeof QUESTION_BANK !== 'undefined' && QUESTION_BANK[subject]) ? QUESTION_BANK[subject] : [];
  const aiBank = AI_QUESTION_ENGINE.loadFromBank(subject);
  const fullBank = [...staticBank, ...aiBank];

  if (fullBank.length === 0) return null;

  const pool = fullBank.filter(q => {
    if (type === 'single') return q.type === 'single';
    if (type === 'multi') return q.type === 'multi';
    if (type === 'judge') return q.type === 'judge';
    return true;
  });

  const source = pool.length > 0 ? pool : fullBank;
  return source[Math.floor(Math.random() * source.length)];
}

// 覆盖原始函数
if (typeof window !== 'undefined') {
  window.getQuestion = getQuestionEnhanced;
}

console.log('[消消乐] 🤖 AI出题引擎已加载 | 调用 AI_QUESTION_ENGINE.batchGenerate(subject, count) 生成题目');
