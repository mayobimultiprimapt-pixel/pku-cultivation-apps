/**
 * 论道殿 · 双轨四科 — 全科题库 + 金库穿透
 * ========================================
 * 101 政治(法庭) · 201 英语(酒馆) · 301 数学(酒馆) · 408 计算机(法庭)
 * 自动读取 Global_Vault 优先使用最新生成的考题
 */

const CaseDB = (() => {

  // ═══ 科目配置 ═══
  const SUBJECTS = {
    '101': { name:'政治论述', icon:'🏛️', mode:'court', color:'#ef4444', label:'101 政治' },
    '201': { name:'英语推断', icon:'📜', mode:'tavern', color:'#3b82f6', label:'201 英语' },
    '301': { name:'数学排雷', icon:'📐', mode:'tavern', color:'#f59e0b', label:'301 数学' },
    '408': { name:'计算机法庭', icon:'💻', mode:'court', color:'#22c55e', label:'408 计算机' },
  };

  // ═══ 破谬卡牌类型 ═══
  const BREAK_CARDS = [
    {id:'absolute',   name:'绝对化击破', icon:'🔨', desc:'选项出现"一切/完全/必然"'},
    {id:'causal',     name:'因果倒置击破', icon:'🔨', desc:'颠倒了因果关系'},
    {id:'partial',    name:'以偏概全击破', icon:'🔨', desc:'个案推广为普遍'},
    {id:'swap',       name:'偷换概念击破', icon:'🔨', desc:'用相似概念替换'},
    {id:'outdated',   name:'过时论据击破', icon:'🔨', desc:'用旧政策解释新问题'},
    {id:'overinfer',  name:'过度推断击破', icon:'🔨', desc:'推断超出原文支持'},
    {id:'circular',   name:'循环论证击破', icon:'🔨', desc:'以结论证明结论'},
    {id:'false_dilemma', name:'非此即彼击破', icon:'🔨', desc:'制造虚假二选一'},
  ];

  // ═══ 政治案件库 (法庭模式) ═══
  const POLITICS_CASES = [
    {
      id:'pc01', diff:2,
      title:'《关于"新质生产力"的决策审议》',
      text:'习近平总书记指出要加快发展新质生产力。某地方政府在推进中，出现了两种对立观点。请作为主理官，厘清事实，驳斥谬误。',
      plaintiff: {label:'原告（错误观点）', text:'主张"只要引进AI技术就能自动实现新质生产力，无需改革生产关系"。'},
      defendant: {label:'被告（模糊立场）', text:'主张"应全面暂停传统产业以集中资源发展高科技"。'},
      breakPhase: {
        fallacies: [
          {text:'"引进技术就自动实现"——忽视了生产关系的配套调整', type:'partial', hint:'以偏概全：技术只是生产力一个方面'},
          {text:'"全面暂停传统产业"——极端化处理，无视现实', type:'absolute', hint:'绝对化：不能"全面"暂停'},
        ],
        distractors: ['causal','outdated'],
      },
      buildPhase: {
        slots: [
          {label:'定性(是什么)', correct:'生产力决定', desc:'新质生产力本质是生产力的跃升'},
          {label:'原理(为什么)', correct:'量变质变', desc:'技术积累(量变)→产业升级(质变)'},
          {label:'对策(怎么办)', correct:'创新驱动', desc:'科技创新+体制改革双轮驱动'},
        ],
        pool: ['生产力决定','量变质变','创新驱动','否定之否定','矛盾同一性','阶级分析','计划经济','平均主义'],
      },
      chainPhase: {
        prompt:'构建论证链：新质生产力的内在逻辑',
        correct: ['科技创新突破','生产力质变跃升','生产关系适应性调整'],
        options: ['科技创新突破','生产力质变跃升','生产关系适应性调整','全面否定传统','市场自动调节','均贫富'],
      },
      clozePhase: {
        passage: '新质生产力的核心在于以___①___为驱动力，推动生产力从___②___到___③___的跃升，这一过程需要___④___的配套调整来释放新的生产力潜能。',
        blanks: ['科技创新','量变','质变','生产关系'],
        distractors: ['行政命令','矛盾','否定','上层建筑'],
      },
    },
    {
      id:'pc02', diff:3,
      title:'《"共同富裕是否等于均贫富"的最终裁决》',
      text:'在推进共同富裕的过程中，社会上出现了"杀富济贫""养懒汉"等误读。请运用马克思主义原理，厘清共同富裕的科学内涵。',
      plaintiff: {label:'原告（极端观点）', text:'主张"共同富裕就是要消灭富人阶层，实现绝对平均"。'},
      defendant: {label:'被告（消极观点）', text:'主张"共同富裕就是政府发钱，不需要个人奋斗"。'},
      breakPhase: {
        fallacies: [
          {text:'"消灭富人实现绝对平均"——偷换了共同富裕的概念', type:'swap', hint:'偷换概念：共同富裕≠均贫富'},
          {text:'"政府发钱不需要奋斗"——因果倒置，富裕的根本靠劳动', type:'causal', hint:'因果倒置：劳动创造才是因'},
        ],
        distractors: ['overinfer','partial'],
      },
      buildPhase: {
        slots: [
          {label:'定性(是什么)', correct:'矛盾主次方面', desc:'效率与公平的辩证统一'},
          {label:'原理(为什么)', correct:'人民群众', desc:'人民群众是财富创造的主体'},
          {label:'对策(怎么办)', correct:'第三次分配', desc:'初次+再分配+第三次分配协调'},
        ],
        pool: ['矛盾主次方面','人民群众','第三次分配','否定之否定','绝对平均','计划经济','英雄史观','内外因'],
      },
      chainPhase: {
        prompt:'论证：共同富裕的实现路径',
        correct: ['做大蛋糕(发展)','分好蛋糕(分配)','人人参与(共建共享)'],
        options: ['做大蛋糕(发展)','分好蛋糕(分配)','人人参与(共建共享)','消灭差距','平均分配','取消市场'],
      },
      clozePhase: {
        passage: '共同富裕不是___①___，而是在做大"蛋糕"的基础上，通过___②___、再分配和___③___协调配套，实现全体人民在___④___中共同富裕。',
        blanks: ['均贫富','初次分配','第三次分配','共建共享'],
        distractors: ['平均主义','政府发钱','国有化','市场竞争'],
      },
    },
    {
      id:'pc03', diff:2,
      title:'《中国式现代化道路的合法性审查》',
      text:'有人质疑：中国式现代化不过是"西方现代化的翻版"。请从唯物史观角度，论证中国式现代化的独特性和必然性。',
      plaintiff: {label:'原告（西方中心论）', text:'主张"现代化只有一种模式，即西方自由市场模式"。'},
      defendant: {label:'被告（历史虚无）', text:'主张"中国的发展纯粹是偶然的历史运气"。'},
      breakPhase: {
        fallacies: [
          {text:'"只有一种模式"——绝对化，否定了发展道路的多样性', type:'absolute', hint:'绝对化：现代化不止一种'},
          {text:'"纯粹偶然"——否定了历史发展的规律性', type:'causal', hint:'因果倒置：历史发展有内在规律'},
        ],
        distractors: ['swap','partial'],
      },
      buildPhase: {
        slots: [
          {label:'定性(是什么)', correct:'矛盾特殊性', desc:'中国国情决定了独特的现代化道路'},
          {label:'原理(为什么)', correct:'社会存在决定', desc:'中国的社会存在决定了中国式现代化'},
          {label:'对策(怎么办)', correct:'全过程民主', desc:'全过程人民民主是政治保障'},
        ],
        pool: ['矛盾特殊性','社会存在决定','全过程民主','矛盾普遍性','英雄史观','否定一切','西方普世','绝对真理'],
      },
      chainPhase: {
        prompt:'论证：中国式现代化的理论逻辑',
        correct: ['国情决定道路(特殊性)','人民主体地位(史观)','制度优势保障(上层建筑)'],
        options: ['国情决定道路(特殊性)','人民主体地位(史观)','制度优势保障(上层建筑)','照搬西方模式','历史偶然论','精英决定论'],
      },
      clozePhase: {
        passage: '中国式现代化的核心逻辑是：由___①___决定独特的发展道路，以___②___为主体力量，依托___③___保障前进方向，这体现了发展道路的___④___。',
        blanks: ['中国国情','人民群众','制度优势','多样性'],
        distractors: ['西方经验','精英阶层','市场力量','单一性'],
      },
    },
    {
      id:'pc04', diff:3,
      title:'《数字经济是否加剧贫富分化的决策审议》',
      text:'数字经济高速发展，但平台垄断、算法歧视、数字鸿沟等问题引发争议。请从政治经济学角度分析。',
      plaintiff: {label:'原告（市场决定论）', text:'主张"技术红利会自动均匀扩散至所有阶层，无需政府干预"。'},
      defendant: {label:'被告（技术恐惧论）', text:'主张"应暂停AI发展，以保障传统就业岗位"。'},
      breakPhase: {
        fallacies: [
          {text:'"自动均匀扩散"——以偏概全，技术红利分配不均是现实', type:'partial', hint:'以偏概全：硅谷富裕≠全民受益'},
          {text:'"暂停AI发展"——绝对化，技术进步不可逆', type:'absolute', hint:'绝对化：不能"暂停"生产力发展'},
        ],
        distractors: ['causal','swap'],
      },
      buildPhase: {
        slots: [
          {label:'定性(是什么)', correct:'生产力决定', desc:'数字技术是新型生产力'},
          {label:'原理(为什么)', correct:'经济基础决定', desc:'新经济基础需要新的制度规范'},
          {label:'对策(怎么办)', correct:'供给侧改革', desc:'数字经济治理+包容性发展'},
        ],
        pool: ['生产力决定','经济基础决定','供给侧改革','否定之否定','均贫富','计划分配','阶级消灭','市场万能'],
      },
      chainPhase: {
        prompt:'论证：数字经济治理的政策逻辑',
        correct: ['发展新质生产力','完善分配制度','弥合数字鸿沟'],
        options: ['发展新质生产力','完善分配制度','弥合数字鸿沟','暂停技术创新','取消平台经济','自由放任'],
      },
      clozePhase: {
        passage: '数字经济治理应坚持发展与___①___并重，通过___②___推动产业升级，同时___③___确保技术红利惠及全民，这体现了___④___与公平的辩证统一。',
        blanks: ['规范','科技创新','完善分配','效率'],
        distractors: ['管制','行政命令','取消市场','速度'],
      },
    },
    // ── 新增政治案件 ──
    {
      id:'pc05', diff:2,
      title:'《人类命运共同体的法理论证》',
      text:'面对逆全球化浪潮，有人质疑构建人类命运共同体的可行性。请运用辩证唯物主义分析。',
      plaintiff: {label:'原告（零和博弈论）', text:'主张"国际关系本质是零和博弈，一方获利必然意味着另一方损失"。'},
      defendant: {label:'被告（孤立主义）', text:'主张"各国完全独立发展即可，国际合作不过是空话"。'},
      breakPhase: {
        fallacies: [
          {text:'"零和博弈"——制造虚假二选一，忽视了合作共赢的可能性', type:'false_dilemma', hint:'非此即彼：合作可以共赢'},
          {text:'"完全独立发展"——绝对化，全球化使各国经济深度联结', type:'absolute', hint:'绝对化：全球化不可逆转'},
        ],
        distractors: ['causal','partial'],
      },
      buildPhase: {
        slots: [
          {label:'定性(是什么)', correct:'联系的普遍性', desc:'世界是普遍联系的整体'},
          {label:'原理(为什么)', correct:'矛盾同一性', desc:'对立中存在统一，竞争中有合作'},
          {label:'对策(怎么办)', correct:'多边主义', desc:'坚持多边主义，推动全球治理'},
        ],
        pool: ['联系的普遍性','矛盾同一性','多边主义','机械唯物','零和博弈','单边主义','闭关锁国','丛林法则'],
      },
      chainPhase: {
        prompt:'论证：人类命运共同体的辩证逻辑',
        correct: ['全球化深度联结(联系)','利益交融共存(矛盾统一)','共商共建共享(对策)'],
        options: ['全球化深度联结(联系)','利益交融共存(矛盾统一)','共商共建共享(对策)','零和博弈','各自为政','弱肉强食'],
      },
      clozePhase: {
        passage: '构建人类命运共同体的哲学基础是___①___的普遍性。在全球化时代，各国利益___②___、命运与共，应以___③___推动全球治理，实现___④___。',
        blanks: ['联系','深度交融','多边主义','合作共赢'],
        distractors: ['矛盾','完全独立','单边主义','零和博弈'],
      },
    },
  ];

  // ═══ 408 计算机案件库 (法庭模式) ═══
  const CS_CASES = [
    {
      id:'cs01', diff:2,
      title:'《关于B+树索引效率的终审判决》',
      text:'数据库优化审查中，两方就B+树与哈希索引的适用场景产生严重分歧。请作为技术仲裁官，厘清真相。',
      plaintiff: {label:'原告（哈希万能论）', text:'主张"哈希索引在所有场景下都比B+树更快，应全面替换B+树索引"。'},
      defendant: {label:'被告（B+树过时论）', text:'主张"B+树索引已过时，现代数据库应完全依赖内存索引"。'},
      breakPhase: {
        fallacies: [
          {text:'"所有场景都比B+树更快"——绝对化，范围查询时哈希索引无法使用', type:'absolute', hint:'绝对化：哈希不支持范围查询'},
          {text:'"完全依赖内存索引"——以偏概全，大量数据仍需磁盘存储', type:'partial', hint:'以偏概全：内存有限，磁盘不可替代'},
        ],
        distractors: ['causal','swap'],
      },
      buildPhase: {
        slots: [
          {label:'数据结构(是什么)', correct:'B+树多路平衡', desc:'B+树是多路平衡搜索树，叶子节点链表相连'},
          {label:'原理(为什么)', correct:'磁盘I/O优化', desc:'减少磁盘随机访问，顺序读取效率高'},
          {label:'应用(怎么用)', correct:'范围查询+排序', desc:'B+树天然支持范围查找和有序遍历'},
        ],
        pool: ['B+树多路平衡','磁盘I/O优化','范围查询+排序','红黑树','哈希散列','内存映射','链表遍历','全表扫描'],
      },
      chainPhase: {
        prompt:'论证：B+树在数据库中的核心价值',
        correct: ['多路平衡降低树高','叶节点链表有序连接','支持高效范围和等值查询'],
        options: ['多路平衡降低树高','叶节点链表有序连接','支持高效范围和等值查询','仅支持等值查询','树高不影响性能','内存完全替代磁盘'],
      },
      clozePhase: {
        passage: 'B+树的核心优势在于通过___①___降低树高度，减少___②___次数。其叶子节点通过___③___相连，天然支持___④___操作。',
        blanks: ['多路分叉','磁盘I/O','链表指针','范围查询'],
        distractors: ['二叉分叉','CPU计算','哈希映射','随机访问'],
      },
    },
    {
      id:'cs02', diff:3,
      title:'《TCP三次握手的必要性听证》',
      text:'某协议设计团队提议简化TCP连接建立过程，引发了关于网络可靠性的激烈辩论。',
      plaintiff: {label:'原告（简化派）', text:'主张"两次握手就够了，第三次握手完全多余"。'},
      defendant: {label:'被告（UDP优越论）', text:'主张"UDP比TCP更优秀，因为它更快，所有场景都应该使用UDP"。'},
      breakPhase: {
        fallacies: [
          {text:'"两次握手就够了"——因果倒置，第三次握手是为了防止已失效的SYN', type:'causal', hint:'因果：没有第三次握手，服务器可能建立无效连接'},
          {text:'"所有场景都应该使用UDP"——绝对化，可靠传输场景必须TCP', type:'absolute', hint:'绝对化：文件传输、网页等需要可靠性'},
        ],
        distractors: ['partial','swap'],
      },
      buildPhase: {
        slots: [
          {label:'协议特点', correct:'面向连接可靠传输', desc:'TCP提供面向连接、可靠、有序的字节流传输'},
          {label:'三握手目的', correct:'同步序列号', desc:'双方交换初始序列号ISN，建立可靠的序号空间'},
          {label:'防御作用', correct:'防止旧连接干扰', desc:'第三次握手防止已失效的SYN突然到达'},
        ],
        pool: ['面向连接可靠传输','同步序列号','防止旧连接干扰','无连接','随机序号','仅验证速度','硬件加速','数据压缩'],
      },
      chainPhase: {
        prompt:'论证：TCP三次握手的必要性',
        correct: ['SYN请求建立连接','SYN+ACK确认接收能力','ACK确认双向通信可靠'],
        options: ['SYN请求建立连接','SYN+ACK确认接收能力','ACK确认双向通信可靠','两次即可建立','第三次仅是礼节','握手次数越多越好'],
      },
      clozePhase: {
        passage: 'TCP三次握手的核心目的是双方交换___①___，并确认___②___。第三次握手的关键作用是防止___③___突然到达服务器，导致服务器建立___④___。',
        blanks: ['初始序列号','双向通信能力','已失效的SYN','无效连接'],
        distractors: ['IP地址','单向传输','正常数据','重复连接'],
      },
    },
    {
      id:'cs03', diff:2,
      title:'《进程与线程的权责审判》',
      text:'操作系统设计会议上，关于进程和线程的资源分配方案引发了争论。',
      plaintiff: {label:'原告（线程万能论）', text:'主张"线程已完全取代进程，进程概念已过时"。'},
      defendant: {label:'被告（隔离恐惧症）', text:'主张"多线程一定比多进程更高效，任何场景都应用线程"。'},
      breakPhase: {
        fallacies: [
          {text:'"进程概念已过时"——偷换概念，进程是资源分配单位，线程是调度单位', type:'swap', hint:'偷换概念：二者角色不同，不能替代'},
          {text:'"任何场景都应用线程"——过度推断，线程崩溃可能导致整个进程终止', type:'overinfer', hint:'过度推断：线程隔离性差，有安全风险'},
        ],
        distractors: ['absolute','causal'],
      },
      buildPhase: {
        slots: [
          {label:'进程是什么', correct:'资源分配基本单位', desc:'进程拥有独立的地址空间和系统资源'},
          {label:'线程是什么', correct:'CPU调度基本单位', desc:'线程共享进程资源，切换开销小'},
          {label:'关系', correct:'线程依赖于进程', desc:'线程在进程空间内运行，共享进程资源'},
        ],
        pool: ['资源分配基本单位','CPU调度基本单位','线程依赖于进程','相互独立','线程拥有地址空间','进程切换更快','线程不需要进程','完全等价'],
      },
      chainPhase: {
        prompt:'论证：进程与线程的分工逻辑',
        correct: ['进程隔离资源保安全','线程共享资源提效率','二者互补各有所长'],
        options: ['进程隔离资源保安全','线程共享资源提效率','二者互补各有所长','线程完全替代进程','资源隔离无意义','效率是唯一指标'],
      },
      clozePhase: {
        passage: '进程是操作系统___①___的基本单位，而线程是___②___的基本单位。线程共享进程的___③___，但拥有独立的___④___和程序计数器。',
        blanks: ['资源分配','CPU调度','地址空间','栈'],
        distractors: ['线程调度','内存管理','独立内存','堆'],
      },
    },
    {
      id:'cs04', diff:3,
      title:'《关于时间复杂度O(nlogn)排序下界的终审》',
      text:'算法设计课上，对比较排序算法的理论下界展开审议。',
      plaintiff: {label:'原告（暴力突破论）', text:'主张"只要算法设计得足够巧妙，就一定能突破O(nlogn)下界"。'},
      defendant: {label:'被告（线性排序替代论）', text:'主张"基数排序O(n)，所以比较排序已无存在价值"。'},
      breakPhase: {
        fallacies: [
          {text:'"一定能突破O(nlogn)下界"——否定了数学证明的严格性', type:'overinfer', hint:'过度推断：决策树模型已证明下界不可突破'},
          {text:'"比较排序无存在价值"——以偏概全，基数排序有严格适用条件', type:'partial', hint:'以偏概全：基数排序要求数据范围有限'},
        ],
        distractors: ['absolute','circular'],
      },
      buildPhase: {
        slots: [
          {label:'理论基础', correct:'决策树模型', desc:'n个元素有n!种排列，决策树至少高Ω(nlogn)'},
          {label:'下界含义', correct:'最坏情况不可优于', desc:'任何比较排序最坏情况都>=Ω(nlogn)次比较'},
          {label:'非比较排序', correct:'依赖数据特征', desc:'计数/基数/桶排序需要额外条件'},
        ],
        pool: ['决策树模型','最坏情况不可优于','依赖数据特征','贪心策略','递归展开','硬件加速','并行计算','量子突破'],
      },
      chainPhase: {
        prompt:'论证：比较排序O(nlogn)下界的逻辑链',
        correct: ['n!种可能排列','决策树至少log(n!)高','Stirling近似得O(nlogn)'],
        options: ['n!种可能排列','决策树至少log(n!)高','Stirling近似得O(nlogn)','暴力穷举可突破','量子计算改变规则','硬件速度抵消'],
      },
      clozePhase: {
        passage: '比较排序的下界证明基于___①___模型：n个元素有___②___种排列，决策树至少需要___③___层，由Stirling公式得下界为___④___。',
        blanks: ['决策树','n!','log(n!)','Ω(nlogn)'],
        distractors: ['递归树','2^n','n','O(n)'],
      },
    },
  ];

  // ═══ 英语案件库 (法庭模式，用于金库穿透时的Fallback) ═══
  const ENGLISH_CASES = [
    {
      id:'ec01', diff:2,
      title:'"Is Algorithm Creativity Genuine?" — Cross-Dimensional Arbitration',
      text:'Recent studies suggest that AI-generated art, while visually impressive, lacks the intentionality that defines human creativity. Critics argue this distinction is merely semantic, while proponents maintain it is fundamental.',
      plaintiff: {label:'Plaintiff (Overstatement)', text:'"AI has achieved true creative consciousness, making human artists obsolete."'},
      defendant: {label:'Defendant (Misdirection)', text:'"Since no one can define creativity precisely, the question is meaningless."'},
      breakPhase: {
        fallacies: [
          {text:'"True creative consciousness" — overinference from "visually impressive" to "conscious"', type:'overinfer', hint:'Overinference: impressive output ≠ consciousness'},
          {text:'"Question is meaningless" — swaps "hard to define" with "meaningless"', type:'swap', hint:'Concept swap: difficulty ≠ meaninglessness'},
        ],
        distractors: ['absolute','causal'],
      },
      buildPhase: {
        slots: [
          {label:'Evidence (What)', correct:'intentionality', desc:'The text says creativity requires intentionality'},
          {label:'Logic (Why)', correct:'distinction', desc:'The author sees a fundamental distinction'},
          {label:'Conclusion (So)', correct:'cautious', desc:'Author is cautiously skeptical of AI creativity'},
        ],
        pool: ['intentionality','distinction','cautious','obsolete','meaningless','hostile','supportive','indifferent'],
      },
      chainPhase: {
        prompt:'Build the author\'s logic chain:',
        correct: ['AI output is impressive','But lacks intentionality','Therefore not truly creative'],
        options: ['AI output is impressive','But lacks intentionality','Therefore not truly creative','AI is conscious','Creativity is meaningless','Artists are obsolete'],
      },
      clozePhase: {
        passage: 'While AI-generated art is visually ___①___, it lacks the ___②___ that defines human creativity. This ___③___ is considered ___④___ by proponents of the distinction.',
        blanks: ['impressive','intentionality','distinction','fundamental'],
        distractors: ['meaningless','consciousness','similarity','semantic'],
      },
    },
    {
      id:'ec02', diff:3,
      title:'"Remote Work: Liberation or Isolation?" — Evidence Review',
      text:'A longitudinal study of 5,000 workers found that while remote employees reported 23% higher job satisfaction, their promotion rates dropped by 35% and cross-team collaboration scores fell significantly. The authors conclude that "the full picture is more nuanced than either camp suggests."',
      plaintiff: {label:'Plaintiff (Absolute claim)', text:'"Remote work is objectively superior to office work in every measurable dimension."'},
      defendant: {label:'Defendant (Cherry-pick)', text:'"The 35% drop in promotions proves remote work is a career death sentence."'},
      breakPhase: {
        fallacies: [
          {text:'"Every measurable dimension" — absolute claim contradicted by promotion data', type:'absolute', hint:'Absolute: "every" is too strong'},
          {text:'"Career death sentence" — overinference from lower promotion rates', type:'overinfer', hint:'Overinference: lower rates ≠ death sentence'},
        ],
        distractors: ['swap','causal'],
      },
      buildPhase: {
        slots: [
          {label:'Evidence (What)', correct:'trade-off', desc:'Data shows a trade-off: satisfaction ↑ but promotion ↓'},
          {label:'Tone (How)', correct:'nuanced', desc:'"More nuanced than either camp" = balanced'},
          {label:'Conclusion (So)', correct:'complex', desc:'The author sees remote work as complex, not black/white'},
        ],
        pool: ['trade-off','nuanced','complex','superior','terrible','indifferent','hostile','simple'],
      },
      chainPhase: {
        prompt:'Reconstruct the author\'s argument:',
        correct: ['Higher satisfaction (pro)','Lower promotion rates (con)','Reality is nuanced (balanced)'],
        options: ['Higher satisfaction (pro)','Lower promotion rates (con)','Reality is nuanced (balanced)','Remote is always better','Office is always better','Data is unreliable'],
      },
      clozePhase: {
        passage: 'Remote workers reported ___①___% higher satisfaction, but promotion rates ___②___ by 35%. The authors conclude the picture is more ___③___ than ___④___ camp suggests.',
        blanks: ['23','dropped','nuanced','either'],
        distractors: ['35','increased','simple','every'],
      },
    },
    {
      id:'ec03', diff:2,
      title:'"Education as Economic Driver" — Inference Challenge',
      text:'"Far from being a luxury, education is increasingly recognized as a fundamental driver of economic mobility. However, the extent to which this holds true across different socioeconomic contexts remains underexplored."',
      plaintiff: {label:'Plaintiff (Reverse)', text:'"The author believes education is a luxury that most people cannot afford."'},
      defendant: {label:'Defendant (Overreach)', text:'"Education guarantees economic success for everyone regardless of context."'},
      breakPhase: {
        fallacies: [
          {text:'"Education is a luxury" — reverses the author\'s "far from being a luxury"', type:'swap', hint:'Reverse: author says the OPPOSITE'},
          {text:'"Guarantees for everyone" — absolute; author says "context matters"', type:'absolute', hint:'"Regardless" contradicts "different contexts"'},
        ],
        distractors: ['causal','partial'],
      },
      buildPhase: {
        slots: [
          {label:'Evidence (What)', correct:'driver', desc:'"Fundamental driver" = education drives mobility'},
          {label:'Qualifier (But)', correct:'underexplored', desc:'"Underexplored" = more research needed'},
          {label:'Tone (How)', correct:'measured', desc:'Positive but with scholarly caution'},
        ],
        pool: ['driver','underexplored','measured','luxury','guaranteed','pessimistic','dismissive','certain'],
      },
      chainPhase: {
        prompt:'Trace the author\'s reasoning:',
        correct: ['Education drives mobility','But context varies','More research is needed'],
        options: ['Education drives mobility','But context varies','More research is needed','Education is useless','Context doesn\'t matter','The answer is clear'],
      },
      clozePhase: {
        passage: 'Far from being a ___①___, education is a fundamental ___②___ of economic mobility. However, the extent to which this holds across different ___③___ contexts remains ___④___.',
        blanks: ['luxury','driver','socioeconomic','underexplored'],
        distractors: ['necessity','barrier','political','proven'],
      },
    },
  ];

  // ═══ 金库穿透读取 ═══
  function loadVaultQuestions(subjectCode) {
    try {
      const raw = localStorage.getItem('Global_Vault_' + subjectCode);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) return [];
      console.log(`[论道殿] 金库穿透: ${subjectCode} → ${arr.length}道题`);
      return arr;
    } catch(e) {
      console.warn('[论道殿] 金库读取失败:', subjectCode, e);
      return [];
    }
  }

  function getVaultCount(subjectCode) {
    try {
      const raw = localStorage.getItem('Global_Vault_' + subjectCode);
      if (!raw) return 0;
      return JSON.parse(raw).length || 0;
    } catch { return 0; }
  }

  // ═══ 获取法庭案件 ═══
  function getCases(subject) {
    if (subject === '408') return shuffle([...CS_CASES]);
    if (subject === '201') return shuffle([...ENGLISH_CASES]);
    return shuffle([...POLITICS_CASES]);
  }

  function getSubjectInfo(code) {
    return SUBJECTS[code] || SUBJECTS['101'];
  }

  function getBreakCards() { return [...BREAK_CARDS]; }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return { getCases, getBreakCards, shuffle, getSubjectInfo, getVaultCount, loadVaultQuestions,
           BREAK_CARDS, POLITICS_CASES, ENGLISH_CASES, CS_CASES, SUBJECTS };
})();
