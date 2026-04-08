/**
 * 骗子酒馆 · 四科NPC + 发言库
 * ========================================
 * 3位酒客 × 真/假发言 × 微表情
 * 新增: 301数学 + 408计算机 题库
 * 题量加倍: 每科至少16道
 */
const TavernData = (() => {
  // ═══ NPC 角色 ═══
  const NPCS = [
    {
      id:'fox', name:'狐教授', emoji:'🦊',
      title:'学术圈的老狐狸',
      style:'巧舌如簧，措辞华丽，最擅长把假话包装得像教科书',
      lieRate:0.6,
      tells:['他说谎时左眼会微微眨动','注意他摸酒杯的频率'],
      tellAnim:'eye-twitch',
      truePhrases:['哼，这种基础知识还用说？','本教授岂会说谎，品鉴一下——','信不信由你，但事实就是——'],
      liePhrases:['嗯...让我想想...这个嘛——','本教授可以负责任地说——','这是学界公认的，你可以查——'],
      taunts:['啧啧，太嫩了','又上当了？','本教授出手，你挡不住的'],
      scared:['这...你怎么看出来的？','运气好而已！','下次不会这么简单了'],
    },
    {
      id:'owl', name:'枭博士', emoji:'🦉',
      title:'总在推眼镜的学究',
      style:'学术型，动不动引用论文和数据，但紧张时会露馅',
      lieRate:0.3,
      tells:['她紧张时推眼镜的频率会变高','说谎时语速会变慢'],
      tellAnim:'push-glasses',
      truePhrases:['根据教材第X章——','这是基本常识——','学术界早有定论——'],
      liePhrases:['嗯...如果我没记错的话...','这个...大概是这样的——','根据...某篇论文...'],
      taunts:['数据不会说谎，但你会看错','你需要回去多读两本书'],
      scared:['你...你怎么知道我在说谎？','我只是记混了！不是故意的！'],
    },
    {
      id:'tiger', name:'虎掌柜', emoji:'🐯',
      title:'酒馆的主人',
      style:'豪迈直接，说话像拍桌子，但骗你的时候会突然温柔劝酒',
      lieRate:0.5,
      tells:['他说谎时会不自觉地摸脸上的伤疤','骗你时会主动劝你喝酒'],
      tellAnim:'touch-scar',
      truePhrases:['老子跟你说！','这是铁打的事实——','在我酒馆里，没人敢说假话——'],
      liePhrases:['来来来，先喝一杯再说——','兄弟，这事儿吧...','你先别急，听我慢慢说——'],
      taunts:['哈哈哈！你太老实了！','在我的地盘，你玩不过我'],
      scared:['嘶...你小子眼睛挺毒啊','行行行，算你厉害'],
    }
  ];

  // ═══ 发言库 ═══
  const CLAIMS = {
    // ── 101 政治 ──
    '101': [
      // ── 假话 ──
      {speaker:'fox', claim:'共同富裕就是同步富裕，要求所有人同时达到相同的收入水平。', isLie:true,
       truth:'共同富裕不等于同步同等富裕，是分阶段促进、允许差异的。', difficulty:1},
      {speaker:'tiger', claim:'新质生产力的核心标志是GDP增长速度的大幅提升。', isLie:true,
       truth:'新质生产力的核心标志是全要素生产率的大幅提升，不是GDP增速。', difficulty:1},
      {speaker:'owl', claim:'否定之否定规律揭示了事物发展的源泉和动力。', isLie:true,
       truth:'矛盾规律才揭示源泉和动力；否定之否定揭示方向和道路（前进性+曲折性）。', difficulty:2},
      {speaker:'fox', claim:'上层建筑决定经济基础，所以制度改革是根本动力。', isLie:true,
       truth:'经济基础决定上层建筑，不是反过来。上层建筑有反作用但不是决定作用。', difficulty:2},
      {speaker:'tiger', claim:'中国式现代化最本质的特征是全面市场经济体制。', isLie:true,
       truth:'中国式现代化最本质的特征是中国共产党的领导。', difficulty:1},
      {speaker:'owl', claim:'实践是认识的唯一来源，所以书本知识不算真正的认识。', isLie:true,
       truth:'实践是认识的来源，但间接经验（书本知识）也是获取认识的途径，只是归根到底来源于实践。', difficulty:3},
      {speaker:'fox', claim:'量变积累到一定程度就一定会发生质变，这是自动的过程。', isLie:true,
       truth:'量变是质变的必要准备，但质变还需要条件，不是自动的。主观能动性也起作用。', difficulty:3},
      {speaker:'tiger', claim:'社会存在和社会意识是始终同步变化的。', isLie:true,
       truth:'社会意识具有相对独立性，可能超前或落后于社会存在，不一定同步。', difficulty:2},
      {speaker:'fox', claim:'感性认识和理性认识的区别仅仅在于认识的深浅程度。', isLie:true,
       truth:'二者不仅有深浅之分，更根本的区别在于反映形式不同：感性是具体形象，理性是抽象概念。', difficulty:3},
      {speaker:'owl', claim:'新发展理念中，"创新"解决的是人与自然和谐共生的问题。', isLie:true,
       truth:'创新解决的是发展动力问题；绿色才解决人与自然和谐共生问题。', difficulty:2},
      // ── 真话 ──
      {speaker:'owl', claim:'实践是检验真理的唯一标准，这是由实践的直接现实性决定的。', isLie:false, truth:'', difficulty:1},
      {speaker:'fox', claim:'社会主义的根本任务是解放和发展社会生产力。', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'量变是质变的必要准备，质变是量变的必然结果。', isLie:false, truth:'', difficulty:1},
      {speaker:'owl', claim:'人民群众是历史的创造者，这是历史唯物主义的根本观点。', isLie:false, truth:'', difficulty:1},
      {speaker:'fox', claim:'高质量发展是全面建设社会主义现代化国家的首要任务。', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'社会存在决定社会意识，这是历史观的基本问题。', isLie:false, truth:'', difficulty:2},
      {speaker:'owl', claim:'矛盾的主要方面决定事物的性质。', isLie:false, truth:'', difficulty:2},
      {speaker:'fox', claim:'全面依法治国的总目标是建设中国特色社会主义法治体系。', isLie:false, truth:'', difficulty:2},
      {speaker:'tiger', claim:'我国社会主要矛盾是人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾。', isLie:false, truth:'', difficulty:2},
      {speaker:'owl', claim:'矛盾分析法是唯物辩证法的根本方法。', isLie:false, truth:'', difficulty:3},
    ],

    // ── 201 英语 (大幅扩充) ──
    '201': [
      // ── 假话 ──
      {speaker:'fox', claim:'"Ubiquitous" means extremely rare and hard to find.', isLie:true,
       truth:'Ubiquitous means "found everywhere", the exact opposite of rare.', difficulty:1},
      {speaker:'tiger', claim:'"Pragmatic" describes someone who is idealistic and theoretical.', isLie:true,
       truth:'Pragmatic means practical and realistic, the opposite of idealistic.', difficulty:1},
      {speaker:'owl', claim:'"Exacerbate" means to improve or fix a problematic situation.', isLie:true,
       truth:'Exacerbate means to make worse, not improve. (ex+acerb = make more bitter)', difficulty:2},
      {speaker:'fox', claim:'"Mitigate" means to intensify or make something more severe.', isLie:true,
       truth:'Mitigate means to lessen or reduce severity, the opposite of intensify.', difficulty:2},
      {speaker:'tiger', claim:'"Ambivalent" means being absolutely certain about a decision.', isLie:true,
       truth:'Ambivalent means having mixed/conflicting feelings. (ambi = both sides)', difficulty:2},
      {speaker:'owl', claim:'"Refute" and "deny" are completely interchangeable in academic writing.', isLie:true,
       truth:'Refute means to disprove with evidence; deny simply means to reject. They are NOT interchangeable.', difficulty:3},
      {speaker:'fox', claim:'"Inevitable" means something that can be easily prevented or avoided.', isLie:true,
       truth:'Inevitable means unavoidable, certain to happen, the opposite of preventable.', difficulty:1},
      {speaker:'tiger', claim:'"Detrimental" suggests something is extremely beneficial and positive.', isLie:true,
       truth:'Detrimental means causing harm or damage. (de+tri = grinding down)', difficulty:2},
      {speaker:'owl', claim:'"Empirical" means based purely on theoretical speculation without any data.', isLie:true,
       truth:'Empirical means based on observation, experiment, and real data, not speculation.', difficulty:2},
      {speaker:'fox', claim:'"Paradox" means a statement that everyone agrees is obvious and self-evident.', isLie:true,
       truth:'A paradox is a seemingly contradictory statement that may reveal a deeper truth.', difficulty:3},
      // ── 真话 ──
      {speaker:'owl', claim:'"Albeit" is a conjunction meaning "although" or "even though".', isLie:false, truth:'', difficulty:1},
      {speaker:'fox', claim:'"Corroborate" means to support or confirm with evidence.', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'"Empirical" refers to evidence based on observation and experiment.', isLie:false, truth:'', difficulty:1},
      {speaker:'owl', claim:'"Sardonic" describes a tone that is mockingly cynical or scornful.', isLie:false, truth:'', difficulty:2},
      {speaker:'fox', claim:'"Notwithstanding" is a formal word meaning "in spite of" or "despite".', isLie:false, truth:'', difficulty:2},
      {speaker:'tiger', claim:'"Comprehensive" means thorough and all-inclusive.', isLie:false, truth:'', difficulty:1},
      {speaker:'owl', claim:'"Subsequent" means coming after or following in time or order.', isLie:false, truth:'', difficulty:1},
      {speaker:'fox', claim:'"Plausible" means seemingly reasonable or probable, though not proven.', isLie:false, truth:'', difficulty:2},
      {speaker:'tiger', claim:'"Scrutinize" means to examine something very carefully and critically.', isLie:false, truth:'', difficulty:2},
      {speaker:'owl', claim:'"Unprecedented" means never done or known before in history.', isLie:false, truth:'', difficulty:1},
    ],

    // ── 301 数学 (全新) ──
    '301': [
      // ── 假话 ──
      {speaker:'fox', claim:'可导一定连续，连续一定可导。', isLie:true,
       truth:'可导必定连续是对的，但连续不一定可导。例如f(x)=|x|在x=0连续但不可导。', difficulty:1},
      {speaker:'tiger', claim:'无穷小量乘以有界变量一定是无穷大量。', isLie:true,
       truth:'无穷小量乘以有界变量仍然是无穷小量，不是无穷大。', difficulty:1},
      {speaker:'owl', claim:'行列式等于零的矩阵一定是零矩阵。', isLie:true,
       truth:'行列式为零说明矩阵奇异（不满秩），但矩阵本身不一定是零矩阵。例如[[1,1],[1,1]]。', difficulty:2},
      {speaker:'fox', claim:'特征值全为零的矩阵一定是零矩阵。', isLie:true,
       truth:'不一定。幂零矩阵特征值全为零但矩阵不一定是零矩阵。例如[[0,1],[0,0]]。', difficulty:3},
      {speaker:'tiger', claim:'级数各项趋于零，则级数收敛。', isLie:true,
       truth:'各项趋于零只是收敛的必要条件，不是充分条件。调和级数∑1/n就是反例。', difficulty:2},
      {speaker:'owl', claim:'两个连续函数的乘积一定可积分。', isLie:true,
       truth:'这个表述本身不准确。在闭区间上连续函数确实可积，但"两个连续函数的乘积可积"是因为乘积仍连续，表述应更严谨。真正的陷阱是暗示"可积需要额外条件"。', difficulty:3},
      {speaker:'fox', claim:'实对称矩阵的特征值可以是复数。', isLie:true,
       truth:'实对称矩阵的特征值一定是实数，这是实对称矩阵的重要性质。', difficulty:2},
      {speaker:'tiger', claim:'梯度方向是函数值下降最快的方向。', isLie:true,
       truth:'梯度方向是函数值上升最快的方向，负梯度方向才是下降最快的方向。', difficulty:1},
      {speaker:'owl', claim:'向量组线性无关等价于对应齐次方程组有非零解。', isLie:true,
       truth:'正好反了。线性无关等价于齐次方程组只有零解；线性相关才有非零解。', difficulty:2},
      {speaker:'fox', claim:'概率为零的事件就是不可能事件。', isLie:true,
       truth:'概率为零不等于不可能事件。例如连续分布中某一点的概率为0，但不是不可能事件。', difficulty:3},
      // ── 真话 ──
      {speaker:'owl', claim:'可导必定连续，但连续不一定可导。', isLie:false, truth:'', difficulty:1},
      {speaker:'fox', claim:'n阶方阵可逆的充要条件是其行列式不等于零。', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'正交矩阵的行列式等于±1。', isLie:false, truth:'', difficulty:2},
      {speaker:'owl', claim:'罗尔定理要求函数在[a,b]上连续，(a,b)上可导，且f(a)=f(b)。', isLie:false, truth:'', difficulty:2},
      {speaker:'fox', claim:'向量空间的维数等于其基中向量的个数。', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'全概率公式是贝叶斯公式的基础。', isLie:false, truth:'', difficulty:2},
      {speaker:'owl', claim:'幂级数在收敛半径内绝对收敛，在收敛半径外发散。', isLie:false, truth:'', difficulty:2},
      {speaker:'fox', claim:'相似矩阵有相同的特征值。', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'中心极限定理指出，大量独立同分布随机变量之和近似服从正态分布。', isLie:false, truth:'', difficulty:2},
      {speaker:'owl', claim:'二次型的正定性等价于所有特征值大于零。', isLie:false, truth:'', difficulty:3},
    ],

    // ── 408 计算机 ──
    '408': [
      // ── 假话 ──
      {speaker:'fox', claim:'TCP三次握手中第三次握手可以省略，两次就足够建立可靠连接了。', isLie:true,
       truth:'第三次握手不能省略，它用于防止已失效的SYN导致服务器建立无效连接。', difficulty:2},
      {speaker:'tiger', claim:'堆排序的最好/最坏/平均时间复杂度都是O(nlogn)，所以它在所有方面都优于快速排序。', isLie:true,
       truth:'虽然堆排序时间复杂度稳定，但快排的缓存命中率更高，实际运行通常比堆排序更快。', difficulty:2},
      {speaker:'owl', claim:'B+树的所有节点都存储数据记录，叶子节点和内部节点没有功能区别。', isLie:true,
       truth:'B+树只在叶子节点存储数据，内部节点只存储索引键，这是它与B树的关键区别。', difficulty:2},
      {speaker:'fox', claim:'死锁的四个必要条件中，只要破坏任意两个就能解决死锁。', isLie:true,
       truth:'只需要破坏四个必要条件中的任何一个就可以预防死锁，不需要破坏两个。', difficulty:1},
      {speaker:'tiger', claim:'虚拟内存的页面大小越小，页表就越小，系统效率就越高。', isLie:true,
       truth:'页面越小，页表越大（需要更多页表项），反而可能降低效率。', difficulty:2},
      {speaker:'owl', claim:'栈和队列的区别仅仅在于实现方式不同，逻辑功能完全一样。', isLie:true,
       truth:'栈是LIFO（后进先出），队列是FIFO（先进先出），逻辑功能根本不同。', difficulty:1},
      {speaker:'fox', claim:'哈希冲突可以通过增大哈希表来完全消除。', isLie:true,
       truth:'哈希冲突不可能完全消除（鸽巢原理），只能减少概率和优化解决方案。', difficulty:2},
      {speaker:'tiger', claim:'IP地址和MAC地址的作用完全相同，用哪个都行。', isLie:true,
       truth:'IP地址用于网络层寻址（逻辑地址），MAC地址用于数据链路层寻址（物理地址），作用完全不同。', difficulty:1},
      {speaker:'owl', claim:'二叉搜索树的查找时间复杂度始终是O(logn)。', isLie:true,
       truth:'二叉搜索树在最坏情况下（退化为链表）查找时间复杂度为O(n)，只有平衡时才是O(logn)。', difficulty:2},
      {speaker:'fox', claim:'进程间通信只能通过共享内存实现，没有其他方式。', isLie:true,
       truth:'进程间通信有多种方式：管道、消息队列、信号量、Socket、共享内存等。', difficulty:1},
      // ── 真话 ──
      {speaker:'owl', claim:'TCP是面向连接的可靠传输协议，UDP是无连接的不可靠传输协议。', isLie:false, truth:'', difficulty:1},
      {speaker:'fox', claim:'操作系统的进程调度包括长程调度、中程调度和短程调度。', isLie:false, truth:'', difficulty:2},
      {speaker:'tiger', claim:'快速排序的平均时间复杂度是O(nlogn)，最坏情况是O(n²)。', isLie:false, truth:'', difficulty:1},
      {speaker:'owl', claim:'数据链路层的主要功能是帧定界、差错控制和流量控制。', isLie:false, truth:'', difficulty:2},
      {speaker:'fox', claim:'AVL树是一种自平衡二叉搜索树，左右子树高度差不超过1。', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'虚拟内存利用了程序的局部性原理（时间局部性和空间局部性）。', isLie:false, truth:'', difficulty:2},
      {speaker:'owl', claim:'图的深度优先搜索(DFS)使用栈，而广度优先搜索(BFS)使用队列。', isLie:false, truth:'', difficulty:1},
      {speaker:'fox', claim:'数据库的ACID属性是：原子性、一致性、隔离性和持久性。', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'页面置换算法中，LRU替换最近最久未使用的页面。', isLie:false, truth:'', difficulty:2},
      {speaker:'owl', claim:'最小生成树的Prim算法时间复杂度为O(V²)或O(ElogV)（用堆优化）。', isLie:false, truth:'', difficulty:3},
    ],
  };

  // 兼容旧代码的 politics/english key
  CLAIMS['politics'] = CLAIMS['101'];
  CLAIMS['english'] = CLAIMS['201'];

  function getNPC(id) { return NPCS.find(n => n.id === id); }
  function getAllNPCs() { return [...NPCS]; }

  // ═══ 每科目标轮数（≥真实考卷题量）═══
  const TARGET_ROUNDS = {
    '101': 20,  // 政治fallback：33选择题→20轮
    '201': 20,  // 英语：完形20+阅读20→20轮
    '301': 15,  // 数学：8选择+6填空→15轮
    '408': 20,  // 计算机：40选择→20轮
  };

  /**
   * Build a round set: auto-aligns to exam quantity
   * Pulls from vault first, then static, then recycles if needed
   */
  function buildRounds(subject, count) {
    const subKey = subject === 'politics' ? '101' : subject === 'english' ? '201' : subject;
    
    // 使用考卷对齐的目标轮数
    const targetCount = count || TARGET_ROUNDS[subKey] || 15;
    
    // 从金库读取并转换
    const vaultQuestions = CaseDB.loadVaultQuestions(subKey);
    const converted = [];
    
    if (vaultQuestions.length > 0) {
      vaultQuestions.forEach((vq, idx) => {
        const speakers = ['fox','owl','tiger'];
        const opts = vq.o || vq.opts || [];
        const correctIdx = typeof vq.a === 'number' ? vq.a : 0;
        const correctAnswer = opts[correctIdx] || '正确答案';
        const wrongAnswers = opts.filter((_, i) => i !== correctIdx);
        
        // 每道vault题生成2条发言：1条假话(用错误选项) + 1条真话(用正确选项)
        if (wrongAnswers.length > 0) {
          converted.push({
            speaker: speakers[idx % 3],
            claim: `关于「${vq.q?.substring(0, 30) || '考点'}」：${wrongAnswers[0]}`,
            isLie: true,
            truth: `正确答案是「${correctAnswer}」。${vq.analysis || vq.tip || ''}`,
            difficulty: vq.difficulty || 2,
            source: '🔥金库',
          });
        }
        converted.push({
          speaker: speakers[(idx + 1) % 3],
          claim: `${vq.q?.substring(0, 50) || '考点'}——答案是：${correctAnswer}`,
          isLie: false,
          truth: '',
          difficulty: vq.difficulty || 2,
          source: '🔥金库',
        });
      });
    }
    
    // 混入静态题
    const staticPool = [...(CLAIMS[subKey] || CLAIMS['101'])];
    let pool = [...converted, ...staticPool];
    
    console.log(`[骗子酒馆] ${subKey}科: 金库${converted.length}条 + 静态${staticPool.length}条 = ${pool.length}条 (目标≥${targetCount}轮)`);
    
    // 如果不够目标数，循环复用静态题
    while (pool.length < targetCount) {
      const recycled = staticPool.map(c => ({...c, difficulty: Math.min(3, (c.difficulty||1) + 1)}));
      pool.push(...recycled.slice(0, targetCount - pool.length));
    }
    
    // Shuffle
    for(let i=pool.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [pool[i],pool[j]]=[pool[j],pool[i]];
    }
    // Sort by difficulty (easy first)
    pool.sort((a,b) => (a.difficulty||1) - (b.difficulty||1));

    // Ensure good lie/truth ratio
    const lies = pool.filter(c => c.isLie);
    const truths = pool.filter(c => !c.isLie);
    const rounds = [];
    for(let i=0; i<targetCount; i++) {
      if(i < 4) {
        // Easy warmup: alternate
        rounds.push(i%2===0 ? (lies.shift()||truths.shift()) : (truths.shift()||lies.shift()));
      } else if(i < 10) {
        // Mid: 60% lies
        rounds.push(Math.random()<0.6 ? (lies.shift()||truths.shift()) : (truths.shift()||lies.shift()));
      } else {
        // Hard: random mix
        rounds.push((Math.random()<0.5 ? lies : truths).shift() || pool.shift());
      }
    }
    return rounds.filter(Boolean).slice(0, targetCount);
  }

  return { getNPC, getAllNPCs, buildRounds, CLAIMS, TARGET_ROUNDS };
})();

