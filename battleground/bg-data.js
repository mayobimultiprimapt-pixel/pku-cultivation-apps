/**
 * 刺激战场 · 地图配置 + 内置题库
 * ========================================
 * 4地图 × 选择题 = 完整吃鸡数据源
 */
const BGData = (() => {
  const MAPS = {
    politics: {
      name:'政治沙漠', icon:'🏜️', subject:'101政治',
      bgColor:'linear-gradient(180deg,#1a0f00,#2d1a00,#451a03)',
      totalTime:180, scorePerQ:1,
      airdrops:2, enemyEmoji:'🤖',
      questions:[
        {stem:'关于新质生产力，下列说法正确的是：',
         opts:['A. 新质生产力不包含传统产业升级','B. 数据是新质生产力的核心要素','C. 核心标志是全要素生产率大幅提升','D. 发展新质生产力必须放弃制造业'],
         ans:2, hint:'关键词：全要素生产率'},
        {stem:'习近平新时代中国特色社会主义思想的核心要义是：',
         opts:['A. 坚持和发展中国特色社会主义','B. 实现共产主义','C. 消灭私有制','D. 全球治理'],
         ans:0, hint:'核心要义=主题主线'},
        {stem:'中国式现代化最本质的特征是：',
         opts:['A. 经济高速增长','B. 中国共产党的领导','C. 全面西化','D. 市场经济'],
         ans:1, hint:'最本质特征=党的领导'},
        {stem:'马克思主义中国化时代化最新理论成果是：',
         opts:['A. 毛泽东思想','B. 邓小平理论','C. 习近平新时代中国特色社会主义思想','D. 三个代表'],
         ans:2, hint:'最新=新时代'},
        {stem:'社会主义的根本任务是：',
         opts:['A. 消灭剥削','B. 解放和发展社会生产力','C. 实现共同富裕','D. 阶级斗争'],
         ans:1, hint:'根本任务=发展生产力'},
        {stem:'我国社会主要矛盾已转化为：',
         opts:['A. 人民日益增长的物质文化需要同落后的社会生产之间的矛盾','B. 人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾','C. 生产力与生产关系的矛盾','D. 经济基础与上层建筑的矛盾'],
         ans:1, hint:'美好生活+不平衡不充分'},
        {stem:'全面建设社会主义现代化国家的首要任务是：',
         opts:['A. 科技自立自强','B. 高质量发展','C. 共同富裕','D. 国防建设'],
         ans:1, hint:'首要任务=高质量发展'},
        {stem:'唯物辩证法的根本方法是：',
         opts:['A. 分析与综合','B. 归纳与演绎','C. 矛盾分析法','D. 类比法'],
         ans:2, hint:'根本方法=矛盾分析'},
        {stem:'实践是检验真理的唯一标准，因为：',
         opts:['A. 实践具有直接现实性','B. 实践是认识的来源','C. 实践是认识的目的','D. 科学理论具有权威性'],
         ans:0, hint:'直接现实性=可验证'},
        {stem:'否定之否定规律揭示了事物发展的：',
         opts:['A. 源泉和动力','B. 状态和形式','C. 方向和道路','D. 根本原因'],
         ans:2, hint:'方向=前进，道路=曲折'},
        {stem:'量变和质变的辩证关系是：',
         opts:['A. 量变是质变的必要准备','B. 量变就是质变','C. 质变不需要量变','D. 量变和质变无关'],
         ans:0, hint:'量变→准备→质变→新量变'},
        {stem:'人民群众是历史的创造者，最根本原因在于：',
         opts:['A. 人民群众是社会物质财富的创造者','B. 人口越多力量越大','C. 人民群众人数众多','D. 群众运动总是正确的'],
         ans:0, hint:'物质财富=最根本'},
        {stem:'社会存在与社会意识的关系问题是：',
         opts:['A. 历史观的基本问题','B. 认识论的基本问题','C. 自然观的基本问题','D. 方法论的基本问题'],
         ans:0, hint:'社会存在/意识=历史观'},
        {stem:'中国特色社会主义进入新时代的重大意义包括：',
         opts:['A. 意味着中华民族实现了从站起来到强起来的飞跃','B. 意味着中国已经是发达国家','C. 意味着社会主义初级阶段已经结束','D. 意味着阶级斗争已消失'],
         ans:0, hint:'站起来→富起来→强起来'},
        {stem:'共同富裕是社会主义的本质要求，实现路径是：',
         opts:['A. 先富带动后富','B. 平均分配','C. 消灭富人阶层','D. 参考西方模式'],
         ans:0, hint:'先富带后富=邓小平'},
        {stem:'全面依法治国的总目标是：',
         opts:['A. 建设中国特色社会主义法治体系，建设社会主义法治国家','B. 消灭犯罪','C. 实现绝对公平','D. 取消人治'],
         ans:0, hint:'法治体系+法治国家=双建设'},
      ]
    },
    math: {
      name:'数学雨林', icon:'🌴', subject:'301数学',
      bgColor:'linear-gradient(180deg,#002a10,#003d15,#064e3b)',
      totalTime:300, scorePerQ:5,
      airdrops:2, enemyEmoji:'🧮',
      questions:[
        {stem:'函数f(x)=x²-2x+1的最小值是：',
         opts:['A. 0','B. 1','C. -1','D. 2'], ans:0, hint:'配方: (x-1)²'},
        {stem:'极限 lim(x→0) sin(x)/x 等于：',
         opts:['A. 0','B. 1','C. ∞','D. -1'], ans:1, hint:'第一个重要极限'},
        {stem:'∫₀¹ x² dx 等于：',
         opts:['A. 1/3','B. 1/2','C. 1','D. 2/3'], ans:0, hint:'x³/3 从0到1'},
        {stem:'矩阵A的秩r(A)=0，则A是：',
         opts:['A. 单位矩阵','B. 零矩阵','C. 对角矩阵','D. 可逆矩阵'], ans:1, hint:'秩为0=全零'},
        {stem:'设f(x)=eˣ，则f\'(x)=',
         opts:['A. eˣ','B. xeˣ⁻¹','C. 1/eˣ','D. ln(x)'], ans:0, hint:'指数函数求导不变'},
        {stem:'向量a=(1,2,3)和b=(2,4,6)的关系是：',
         opts:['A. 线性无关','B. 线性相关','C. 正交','D. 等价'], ans:1, hint:'b=2a'},
        {stem:'泰勒展开 eˣ ≈ 1+x+x²/2+... 的收敛半径是：',
         opts:['A. 1','B. 2','C. ∞','D. 0'], ans:2, hint:'eˣ处处收敛'},
        {stem:'二阶常系数齐次方程y\'\'-4y=0的通解是：',
         opts:['A. C₁e²ˣ+C₂e⁻²ˣ','B. C₁cos2x+C₂sin2x','C. C₁e⁴ˣ','D. C₁x+C₂'],
         ans:0, hint:'特征方程r²-4=0, r=±2'},
        {stem:'P(A∪B) = P(A)+P(B) 成立的条件是：',
         opts:['A. A,B互斥','B. A,B独立','C. A⊂B','D. 任意情况'], ans:0, hint:'互斥=不能同时发生'},
        {stem:'梯度grad f在某点处的方向是：',
         opts:['A. 函数增长最快的方向','B. 函数减小最快的方向','C. 等值线的切线方向','D. 任意方向'],
         ans:0, hint:'梯度=最速上升方向'},
      ]
    },
    english: {
      name:'极寒冰原', icon:'❄️', subject:'201英语',
      bgColor:'linear-gradient(180deg,#0a1628,#1e3a5f,#1e40af)',
      totalTime:240, scorePerQ:2,
      airdrops:3, enemyEmoji:'📖',
      questions:[
        {stem:'The word "ubiquitous" most nearly means:',
         opts:['A. rare','B. everywhere','C. dangerous','D. beautiful'], ans:1, hint:'ubi=everywhere'},
        {stem:'"The findings are preliminary" implies the results are:',
         opts:['A. final','B. not yet confirmed','C. wrong','D. secret'], ans:1, hint:'preliminary=初步的'},
        {stem:'Which best describes "paradox"?',
         opts:['A. A simple truth','B. A self-contradictory statement','C. An obvious fact','D. A lie'], ans:1, hint:'para+dox=beyond belief'},
        {stem:'"She acquiesced to the decision" means she:',
         opts:['A. rejected it','B. accepted it reluctantly','C. celebrated it','D. ignored it'], ans:1, hint:'acquiesce=默许'},
        {stem:'The antonym of "benevolent" is:',
         opts:['A. kind','B. generous','C. malevolent','D. wise'], ans:2, hint:'bene=good, male=bad'},
        {stem:'"The study corroborates previous findings" means it:',
         opts:['A. contradicts them','B. supports them','C. ignores them','D. replaces them'], ans:1, hint:'corroborate=证实'},
        {stem:'What does "albeit" mean in context?',
         opts:['A. because','B. although','C. therefore','D. unless'], ans:1, hint:'albeit=虽然'},
        {stem:'"Empirical evidence" refers to evidence based on:',
         opts:['A. theory','B. observation','C. opinion','D. tradition'], ans:1, hint:'empirical=经验的/实证的'},
        {stem:'The word "exacerbate" means to:',
         opts:['A. improve','B. make worse','C. examine','D. explain'], ans:1, hint:'ex+acerb=使更尖锐'},
        {stem:'"The author\'s tone is sardonic" suggests the tone is:',
         opts:['A. sad','B. happy','C. mocking','D. neutral'], ans:2, hint:'sardonic=讽刺的'},
        {stem:'Which word means "to make something less severe"?',
         opts:['A. aggravate','B. mitigate','C. perpetuate','D. exacerbate'], ans:1, hint:'mitigate=缓解'},
        {stem:'"A comprehensive review" means:',
         opts:['A. a quick glance','B. a thorough examination','C. a biased study','D. an outdated report'], ans:1, hint:'comprehensive=全面的'},
        {stem:'The phrase "in light of" means:',
         opts:['A. despite','B. considering','C. ignoring','D. before'], ans:1, hint:'in light of=鉴于'},
        {stem:'"Inevitable" means something that is:',
         opts:['A. avoidable','B. uncertain','C. unavoidable','D. unlikely'], ans:2, hint:'in+evitable=不可避免'},
        {stem:'"The hypothesis was refuted" means it was:',
         opts:['A. proven','B. disproven','C. modified','D. accepted'], ans:1, hint:'refute=驳斥'},
        {stem:'Which sentence uses "notwithstanding" correctly?',
         opts:['A. Notwithstanding the rain, we went outside','B. We notwithstanding left early','C. The notwithstanding was clear','D. He notwithstanding agreed'], ans:0, hint:'notwithstanding=尽管'},
        {stem:'"Pertinent" information is information that is:',
         opts:['A. irrelevant','B. outdated','C. relevant','D. secret'], ans:2, hint:'pertinent=相关的'},
        {stem:'The prefix "anti-" in "antithesis" means:',
         opts:['A. for','B. against','C. before','D. after'], ans:1, hint:'anti-=反，对立'},
        {stem:'"She was ambivalent about the proposal" means:',
         opts:['A. she strongly supported it','B. she had mixed feelings','C. she rejected it','D. she ignored it'], ans:1, hint:'ambi+valent=两面的'},
        {stem:'"Pragmatic" approach is one that is:',
         opts:['A. idealistic','B. impractical','C. practical','D. theoretical'], ans:2, hint:'pragmatic=务实的'},
      ]
    },
    cs: {
      name:'赛博都市', icon:'🏙️', subject:'408计算机',
      bgColor:'linear-gradient(180deg,#0d0520,#1a0a3e,#2d1b69)',
      totalTime:360, scorePerQ:2,
      airdrops:5, enemyEmoji:'💻',
      questions:[
        {stem:'栈(Stack)的特点是：',opts:['A. 先进先出','B. 先进后出','C. 随机访问','D. 双端操作'],ans:1,hint:'LIFO'},
        {stem:'二叉树的前序遍历顺序是：',opts:['A. 左根右','B. 根左右','C. 左右根','D. 右根左'],ans:1,hint:'根→左→右'},
        {stem:'TCP协议属于OSI模型的：',opts:['A. 网络层','B. 传输层','C. 应用层','D. 数据链路层'],ans:1,hint:'传输层协议'},
        {stem:'快速排序的平均时间复杂度是：',opts:['A. O(n)','B. O(n log n)','C. O(n²)','D. O(log n)'],ans:1,hint:'分治法nlogn'},
        {stem:'虚拟内存管理中，页面置换算法LRU是指：',opts:['A. 最近最少使用','B. 先进先出','C. 最优置换','D. 随机置换'],ans:0,hint:'Least Recently Used'},
        {stem:'在SQL中，用于删除表中所有数据但保留表结构的语句是：',opts:['A. DROP TABLE','B. DELETE FROM','C. TRUNCATE TABLE','D. ALTER TABLE'],ans:2,hint:'TRUNCATE只清数据'},
        {stem:'IP地址192.168.1.1属于哪类地址？',opts:['A. A类','B. B类','C. C类','D. D类'],ans:2,hint:'192.168.x.x=C类私有'},
        {stem:'哈夫曼编码的主要用途是：',opts:['A. 数据加密','B. 数据压缩','C. 数据排序','D. 数据查找'],ans:1,hint:'变长编码→压缩'},
        {stem:'进程和线程的主要区别是：',opts:['A. 进程有独立地址空间，线程共享','B. 线程有独立地址空间','C. 两者完全相同','D. 进程比线程轻量'],ans:0,hint:'地址空间独立vs共享'},
        {stem:'死锁产生的四个必要条件不包括：',opts:['A. 互斥','B. 请求与保持','C. 可抢占','D. 循环等待'],ans:2,hint:'不可抢占才是条件'},
        {stem:'B+树与B树的主要区别是：',opts:['A. B+树所有数据在叶子节点','B. B树数据在叶子节点','C. B+树不支持范围查询','D. 两者完全相同'],ans:0,hint:'B+树叶子链表'},
        {stem:'HTTP状态码404表示：',opts:['A. 服务器错误','B. 请求成功','C. 资源未找到','D. 重定向'],ans:2,hint:'Not Found'},
        {stem:'图的深度优先搜索(DFS)使用的数据结构是：',opts:['A. 队列','B. 栈','C. 堆','D. 哈希表'],ans:1,hint:'DFS用栈(递归)'},
        {stem:'操作系统的管态(核心态)可以执行：',opts:['A. 只能执行用户程序','B. 所有指令包括特权指令','C. 只能执行I/O','D. 不能访问内存'],ans:1,hint:'核心态=全权限'},
        {stem:'在计算机网络中，ARP协议的功能是：',opts:['A. IP→MAC地址解析','B. MAC→IP地址解析','C. 域名→IP解析','D. 路由选择'],ans:0,hint:'ARP=地址解析'},
        {stem:'堆排序的时间复杂度为：',opts:['A. O(n)','B. O(n log n)','C. O(n²)','D. O(log n)'],ans:1,hint:'建堆+调整=nlogn'},
        {stem:'关系代数中，σ运算表示：',opts:['A. 投影','B. 选择','C. 连接','D. 除'],ans:1,hint:'σ=selection选择'},
        {stem:'冯·诺依曼体系结构的核心思想是：',opts:['A. 存储程序','B. 并行计算','C. 分布式','D. 量子计算'],ans:0,hint:'存储程序=核心'},
        {stem:'在C语言中，malloc分配的内存在哪个区域？',opts:['A. 栈','B. 堆','C. 全局区','D. 代码区'],ans:1,hint:'malloc=堆分配'},
        {stem:'DNS使用的传输层协议主要是：',opts:['A. 仅TCP','B. 仅UDP','C. UDP为主，TCP为辅','D. 不使用传输层'],ans:2,hint:'查询UDP，区域传送TCP'},
        // 20 more questions for 408 (40 total needed, showing key ones)
        {stem:'中断向量表存放的是：',opts:['A. 中断服务程序的入口地址','B. 中断请求信号','C. 中断屏蔽字','D. 中断返回地址'],ans:0,hint:'向量表=入口地址'},
        {stem:'Cache的地址映射方式不包括：',opts:['A. 直接映射','B. 全相联映射','C. 组相联映射','D. 链式映射'],ans:3,hint:'只有直接/全相联/组相联'},
        {stem:'二叉搜索树的中序遍历结果是：',opts:['A. 无序序列','B. 有序序列','C. 逆序序列','D. 随机序列'],ans:1,hint:'BST中序=升序'},
        {stem:'子网掩码255.255.255.0对应的CIDR是：',opts:['A. /16','B. /24','C. /8','D. /32'],ans:1,hint:'3个255=24个1'},
        {stem:'最短路径算法Dijkstra不适用于：',opts:['A. 无向图','B. 有向图','C. 含负权边的图','D. 稀疏图'],ans:2,hint:'负权边用Bellman-Ford'},
        {stem:'页式存储管理中，页表的作用是：',opts:['A. 逻辑地址→物理地址','B. 内存分配','C. 进程调度','D. 文件管理'],ans:0,hint:'页表=地址映射'},
        {stem:'TCP三次握手的第二步，服务器发送：',opts:['A. SYN','B. SYN+ACK','C. ACK','D. FIN'],ans:1,hint:'二次=SYN+ACK'},
        {stem:'AVL树的平衡因子范围是：',opts:['A. {-2,-1,0,1,2}','B. {-1,0,1}','C. {0,1}','D. {-1,0}'],ans:1,hint:'|BF|≤1'},
        {stem:'RAID5至少需要几块磁盘？',opts:['A. 2','B. 3','C. 4','D. 5'],ans:1,hint:'RAID5需要≥3'},
        {stem:'编译器的词法分析阶段输出的是：',opts:['A. 语法树','B. 中间代码','C. 记号流(Token)','D. 目标代码'],ans:2,hint:'词法→Token'},
        {stem:'数据库事务的ACID特性中，I代表：',opts:['A. 完整性','B. 隔离性','C. 一致性','D. 持久性'],ans:1,hint:'I=Isolation隔离'},
        {stem:'PV操作用于解决：',opts:['A. 死锁问题','B. 进程同步与互斥','C. 内存管理','D. 文件系统'],ans:1,hint:'P=wait V=signal'},
        {stem:'TCP的滑动窗口机制主要用于：',opts:['A. 路由选择','B. 流量控制','C. 差错检测','D. 地址解析'],ans:1,hint:'滑动窗口=流量控制'},
        {stem:'在图的存储中，邻接表适合存储：',opts:['A. 稠密图','B. 稀疏图','C. 完全图','D. 树'],ans:1,hint:'稀疏图用邻接表省空间'},
        {stem:'操作系统中，信号量S的初值为5，执行10次P操作和6次V操作后，S的值为：',opts:['A. 1','B. -1','C. 5','D. 0'],ans:0,hint:'5-10+6=1'},
        {stem:'HTTP/2相比HTTP/1.1的主要改进是：',opts:['A. 多路复用','B. 明文传输','C. 无状态','D. 单向通信'],ans:0,hint:'多路复用=关键改进'},
        {stem:'红黑树是一种：',opts:['A. 二叉搜索树','B. B树','C. 堆','D. 哈夫曼树'],ans:0,hint:'红黑树是近似平衡BST'},
        {stem:'虚拟存储器的基础是：',opts:['A. 局部性原理','B. 冯诺依曼原理','C. 并行原理','D. 互斥原理'],ans:0,hint:'时间/空间局部性'},
        {stem:'关系数据库中，第三范式(3NF)要求消除：',opts:['A. 部分函数依赖','B. 传递函数依赖','C. 多值依赖','D. 连接依赖'],ans:1,hint:'3NF消除传递依赖'},
        {stem:'计算机中补码表示法的优点是：',opts:['A. 0的表示唯一','B. 表示范围更大','C. 计算更慢','D. 不能表示负数'],ans:0,hint:'补码的+0和-0相同'},
      ]
    }
  };

  // Airdrop items pool
  const AIRDROPS = [
    {id:'shield', icon:'🛡️', name:'护盾 +20%', desc:'额外生命值', weight:40, effect:'hp'},
    {id:'time',   icon:'⏱️', name:'时间 +30秒', desc:'毒圈延缓', weight:25, effect:'time'},
    {id:'ammo',   icon:'💡', name:'弹药 +3',    desc:'增加提示次数', weight:20, effect:'hint'},
    {id:'scroll', icon:'📝', name:'押题卷',     desc:'下题直接显示答案', weight:10, effect:'reveal'},
    {id:'buff',   icon:'🔥', name:'连杀Buff',   desc:'下3题分数×2', weight:5, effect:'double'},
  ];

  function getMap(id) { return MAPS[id] || null; }
  function getMapIds() { return Object.keys(MAPS); }
  function getAirdrops() { return [...AIRDROPS]; }

  // Weighted random airdrop selection (pick 3 unique)
  function rollAirdrop() {
    const pool = [];
    AIRDROPS.forEach(a => { for(let i=0;i<a.weight;i++) pool.push(a); });
    const picked = new Set();
    const result = [];
    while(result.length < 3 && picked.size < AIRDROPS.length) {
      const r = pool[Math.floor(Math.random()*pool.length)];
      if(!picked.has(r.id)) { picked.add(r.id); result.push({...r}); }
    }
    return result;
  }


  // ═══ Global Vault 注入 — 从天机阁金库读取真题合并 ═══
  const VAULT_MAP = { politics:'101', english:'201', math:'301', cs:'408' };
  function convertVaultQ(vq) {
    // 转换 vault 格式 → 游戏格式
    const opts = (vq.options || []).map(o => typeof o === 'string' ? o : String(o));
    let ansIdx = 0;
    if (vq.answer && opts.length > 0) {
      const ansLetter = String(vq.answer).trim().charAt(0).toUpperCase();
      ansIdx = 'ABCDE'.indexOf(ansLetter);
      if (ansIdx < 0) ansIdx = 0;
    }
    return {
      stem: vq.stem || vq.q || '题目加载失败',
      opts: opts.length >= 2 ? opts : ['A.暂无','B.暂无','C.暂无','D.暂无'],
      ans: ansIdx,
      hint: vq.analysis ? vq.analysis.substring(0, 50) : '来源: 天机阁金库',
      fromVault: true
    };
  }
  function loadVaultQuestions() {
    try {
      for (const [mapId, subCode] of Object.entries(VAULT_MAP)) {
        const raw = localStorage.getItem('Global_Vault_' + subCode);
        if (!raw) continue;
        const vaultQ = JSON.parse(raw);
        if (!Array.isArray(vaultQ) || vaultQ.length === 0) continue;
        // 只取 single_choice 类型
        const single = vaultQ.filter(q => !q.type || q.type === 'single_choice' || q.type === 'multi_choice');
        const converted = single.map(convertVaultQ).filter(q => q.stem.length > 5);
        if (converted.length > 0 && MAPS[mapId]) {
          // 合并: vault题放前面 + 原有题保底
          const existStems = new Set(MAPS[mapId].questions.map(q => q.stem));
          const newQ = converted.filter(q => !existStems.has(q.stem));
          MAPS[mapId].questions = [...newQ, ...MAPS[mapId].questions];
          console.log('[刺激战场] ' + mapId + ': 加载金库 +' + newQ.length + ' 题 (总' + MAPS[mapId].questions.length + ')');
        }
      }
    } catch(e) { console.warn('[刺激战场] 金库读取失败:', e.message); }
  }
  // 页面加载时自动读取
  if (typeof localStorage !== 'undefined') loadVaultQuestions();

  return { getMap, getMapIds, getAirdrops, rollAirdrop, MAPS, loadVaultQuestions };
})();
