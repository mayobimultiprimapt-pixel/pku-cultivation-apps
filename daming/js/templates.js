// ============================================================
// Templates Module — 短视频模板库
// ============================================================
const Templates = {
  data: [
    {
      id: 'daoyan',
      icon: '🎥',
      name: '导演分镜',
      desc: '专业级分镜脚本生成 — 8K UE5 PBR标准，含镜头配置、光影细节、环境音效推演',
      tags: ['分镜', 'UE5', '专业', '玄幻'],
      prompt: '【导演分镜模式】请根据以下剧本/场景生成严格遵循「导演分镜系统」骨架模板的专业分镜脚本。\\n\\n剧本内容：{topic}\\n\\n要求：\\n1. 严格执行N+1顺延\\n2. 首尾0.01秒定场空镜\\n3. 中间剧情镜头不控秒\\n4. 完整输出Execution Summary + zh + zh scene三段式结构'
    },
    {
      id: 'koubo',
      icon: '📹',
      name: '口播讲解',
      desc: '面对镜头分享知识、观点、经验的短视频脚本',
      tags: ['知识', '干货', '观点输出'],
      prompt: '请帮我写一个口播类短视频脚本。主题是：{topic}。要求：\n1. 开场3秒内抓住注意力\n2. 内容有3个核心干货点\n3. 结尾有行动号召\n4. 总时长控制在60秒左右\n5. 给出拍摄和剪辑建议'
    },
    {
      id: 'juqing',
      icon: '🎭',
      name: '剧情反转',
      desc: '有故事性和反转的剧情短视频，易产生传播',
      tags: ['故事', '反转', '情感'],
      prompt: '请帮我策划一个剧情反转类短视频。主题是：{topic}。要求：\n1. 有明确的冲突和反转\n2. 角色设定清晰\n3. 结局出人意料\n4. 给出分镜脚本\n5. 推荐配乐风格'
    },
    {
      id: 'vlog',
      icon: '📱',
      name: 'Vlog记录',
      desc: '日常生活记录、旅行体验的Vlog结构',
      tags: ['日常', '旅行', '生活'],
      prompt: '请帮我设计一个Vlog短视频方案。主题是：{topic}。要求：\n1. Vlog结构化（开场/过程/结尾）\n2. 有个人风格和记忆点\n3. 给出拍摄场景建议\n4. 推荐背景音乐\n5. 剪辑节奏建议'
    },
    {
      id: 'zhongcao',
      icon: '🛍️',
      name: '种草带货',
      desc: '产品推荐、好物分享的种草视频脚本',
      tags: ['带货', '测评', '推荐'],
      prompt: '请帮我写一个种草带货短视频脚本。产品是：{topic}。要求：\n1. 痛点引入法开场\n2. 产品亮点展示（3个核心卖点）\n3. 使用场景演示\n4. 价格锚点和促销话术\n5. 评论区引导话术'
    },
    {
      id: 'kepu',
      icon: '📖',
      name: '知识科普',
      desc: '把复杂知识用简单有趣的方式讲清楚',
      tags: ['科普', '冷知识', '教育'],
      prompt: '请帮我设计一个知识科普短视频。主题是：{topic}。要求：\n1. 用一个有趣的问题/现象开场\n2. 深入浅出解释原理\n3. 用类比让观众秒懂\n4. 给出视觉化展示建议\n5. 结尾留一个思考问题'
    },
    {
      id: 'jiedu',
      icon: '🎬',
      name: '影视解说',
      desc: '电影、电视剧、综艺的解说评论视频',
      tags: ['影视', '解说', '评论'],
      prompt: '请帮我写一个影视解说短视频脚本。影视作品是：{topic}。要求：\n1. 吸引人的开场悬念\n2. 剧情概述（不剧透核心）\n3. 深度解读和个人观点\n4. 给出画面剪辑建议\n5. 推荐背景音乐'
    },
    {
      id: 'challenge',
      icon: '🔥',
      name: '挑战热点',
      desc: '追热点、蹭流量的挑战类短视频方案',
      tags: ['热点', '挑战', '流量'],
      prompt: '请帮我策划一个追热点的挑战短视频。热点/话题是：{topic}。要求：\n1. 分析这个热点的流量逻辑\n2. 设计独特的切入角度\n3. 结合个人特色的创意方案\n4. 标题和话题标签建议\n5. 发布时间建议'
    },
    {
      id: 'qinggan',
      icon: '💝',
      name: '情感共鸣',
      desc: '引发情感共鸣和互动的治愈系视频',
      tags: ['情感', '治愈', '共鸣'],
      prompt: '请帮我设计一个情感共鸣类短视频。主题是：{topic}。要求：\n1. 选择能引起广泛共鸣的切入点\n2. 故事化叙事结构\n3. 有泪点或笑点的高潮\n4. 文案金句设计\n5. 配乐和画面风格建议'
    },
    {
      id: 'tutorial',
      icon: '🛠️',
      name: '教程教学',
      desc: '手把手教学类视频，实操性强',
      tags: ['教程', '技巧', '实操'],
      prompt: '请帮我设计一个教程类短视频。教学内容是：{topic}。要求：\n1. 展示最终效果（吸引观看）\n2. 分步骤清晰讲解\n3. 重点标注和字幕提示\n4. 常见问题预判\n5. 拍摄角度和镜头建议'
    },
    {
      id: 'duibi',
      icon: '⚡',
      name: '对比测评',
      desc: 'A vs B 对比形式的测评视频',
      tags: ['对比', '测评', '选择'],
      prompt: '请帮我策划一个对比测评短视频。对比对象是：{topic}。要求：\n1. 开场抛出"选哪个"的悬念\n2. 5个维度逐一对比\n3. 每个维度有明确胜负\n4. 总结推荐和适用人群\n5. 引导评论区投票'
    },
    {
      id: 'series',
      icon: '📺',
      name: '系列连载',
      desc: '设计可持续更新的系列内容框架',
      tags: ['系列', '连载', 'IP'],
      prompt: '请帮我策划一个短视频系列内容。系列主题是：{topic}。要求：\n1. 设计系列名称和固定开场\n2. 规划前10期内容主题\n3. 每期内容结构模板\n4. 系列IP视觉规范\n5. 粉丝互动和留存策略'
    },
    {
      id: 'custom',
      icon: '✨',
      name: '自由创作',
      desc: '告诉军机大臣你的想法，定制专属方案',
      tags: ['自由', '定制', '创意'],
      prompt: '{topic}'
    }
  ],

  render() {
    const grid = document.getElementById('templates-grid');
    if (!grid) return;

    grid.innerHTML = this.data.map(t => `
      <div class="template-card" onclick="Templates.use('${t.id}')" id="template-${t.id}">
        <div class="template-icon">${t.icon}</div>
        <div class="template-name">${t.name}</div>
        <div class="template-desc">${t.desc}</div>
        <div class="template-tags">
          ${t.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
        </div>
      </div>
    `).join('');
  },

  use(id) {
    const template = this.data.find(t => t.id === id);
    if (!template) return;

    if (id === 'custom') {
      App.switchTab('chat');
      document.getElementById('chat-input').focus();
      return;
    }

    // Switch to chat and prompt for topic
    App.switchTab('chat');
    const input = document.getElementById('chat-input');
    input.value = `【${template.name}模板】\n请帮我生成一个${template.name}短视频方案，主题是：`;
    input.focus();
    Chat.autoResize(input);
    App.toast(`已选择「${template.name}」模板`, 'info');
  }
};
