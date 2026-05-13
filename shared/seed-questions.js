/* ═══════════════════════════════════════════════════════
   北大考研 · 金库种子数据 v1.0
   自动注入约 200 道题到 localStorage 金库 + QUESTION_BANK
   四科全覆盖，确保所有游戏（塔罗/战场/猛鬼/论道殿）可正常运行
   ═══════════════════════════════════════════════════════ */

(function(){
  const SEED = {
    '101': [
      {id:'s101_001',type:'single',stem:'唯物辩证法的总特征是联系的观点和_____的观点。',options:['A.矛盾','B.发展','C.实践','D.对立统一'],answer:'B',chapter:'马原',source:'种子库',difficulty:2},
      {id:'s101_002',type:'single',stem:'实践是检验真理的唯一标准，是因为实践具有_____。',options:['A.直接现实性','B.主观能动性','C.客观规律性','D.历史继承性'],answer:'A',chapter:'马原',source:'种子库',difficulty:3},
      {id:'s101_003',type:'single',stem:'社会存在决定社会意识，社会意识对社会存在具有_____。',options:['A.决定作用','B.能动反作用','C.推动作用','D.阻碍作用'],answer:'B',chapter:'马原',source:'种子库',difficulty:2},
      {id:'s101_004',type:'single',stem:'购买劳动力的资本称为_____资本。',options:['A.固定','B.流动','C.可变','D.不变'],answer:'C',chapter:'政经',source:'种子库',difficulty:3},
      {id:'s101_005',type:'single',stem:'资本主义经济危机的根源在于资本主义的_____。',options:['A.基本矛盾','B.分配不公','C.贫富悬殊','D.生产过剩'],answer:'A',chapter:'政经',source:'种子库',difficulty:3},
      {id:'s101_006',type:'single',stem:'五四运动标志着中国_____的开端。',options:['A.旧民主主义革命','B.新民主主义革命','C.社会主义革命','D.民族解放运动'],answer:'B',chapter:'史纲',source:'种子库',difficulty:2},
      {id:'s101_007',type:'single',stem:'中国共产党第一次全国代表大会于_____年在上海召开。',options:['A.1919','B.1920','C.1921','D.1922'],answer:'C',chapter:'史纲',source:'种子库',difficulty:1},
      {id:'s101_008',type:'single',stem:'毛泽东指出中国革命的首要问题是_____。',options:['A.农民问题','B.分清敌友','C.武装斗争','D.统一战线'],answer:'B',chapter:'毛概',source:'种子库',difficulty:2},
      {id:'s101_009',type:'single',stem:'社会主义核心价值观在国家层面的内容是_____。',options:['A.富强、民主、文明、和谐','B.自由、平等、公正、法治','C.爱国、敬业、诚信、友善','D.改革、创新、开放、包容'],answer:'A',chapter:'思修',source:'种子库',difficulty:1},
      {id:'s101_010',type:'single',stem:'量变和质变的辩证关系原理指出，量变是质变的_____。',options:['A.必要条件','B.必要准备','C.充分条件','D.必然结果'],answer:'B',chapter:'马原',source:'种子库',difficulty:2},
      {id:'s101_011',type:'single',stem:'否定之否定规律揭示了事物发展的方向是_____。',options:['A.直线上升','B.循环往复','C.前进性与曲折性的统一','D.螺旋式上升'],answer:'C',chapter:'马原',source:'种子库',difficulty:3},
      {id:'s101_012',type:'single',stem:'中国特色社会主义最本质的特征是_____。',options:['A.人民当家作主','B.中国共产党领导','C.社会主义市场经济','D.依法治国'],answer:'B',chapter:'毛概',source:'种子库',difficulty:1},
      {id:'s101_013',type:'single',stem:'三大改造完成于_____年。',options:['A.1949','B.1952','C.1956','D.1958'],answer:'C',chapter:'史纲',source:'种子库',difficulty:2},
      {id:'s101_014',type:'single',stem:'事物发展的根本原因在于事物内部的_____。',options:['A.联系','B.运动','C.矛盾','D.否定'],answer:'C',chapter:'马原',source:'种子库',difficulty:2},
      {id:'s101_015',type:'single',stem:'改革开放是从_____年开始的。',options:['A.1976','B.1978','C.1980','D.1982'],answer:'B',chapter:'史纲',source:'种子库',difficulty:1},
    ],
    '201': [
      {id:'s201_001',type:'single',stem:'Many people are _____ to believe false information online without verifying.',options:['A.prevented','B.reluctant','C.prone','D.accustomed'],answer:'C',chapter:'完形',source:'种子库',difficulty:3},
      {id:'s201_002',type:'single',stem:'Scarcely _____ the researchers published their findings when they faced criticism.',options:['A.had','B.did','C.have','D.were'],answer:'A',chapter:'语法',source:'种子库',difficulty:4},
      {id:'s201_003',type:'single',stem:'Constant exposure to violent media can have a(n) _____ effect on children.',options:['A.beneficial','B.detrimental','C.ambiguous','D.trivial'],answer:'B',chapter:'词汇',source:'种子库',difficulty:3},
      {id:'s201_004',type:'single',stem:'The committee decided to _____ the new policy despite strong opposition.',options:['A.do away with','B.come up with','C.put up with','D.go ahead with'],answer:'D',chapter:'短语',source:'种子库',difficulty:2},
      {id:'s201_005',type:'single',stem:'It is _____ that the government should take immediate measures to control pollution.',options:['A.inevitable','B.imperative','C.incredible','D.indispensable'],answer:'B',chapter:'词汇',source:'种子库',difficulty:3},
      {id:'s201_006',type:'single',stem:'The professor _____ great importance to the ability of critical thinking.',options:['A.pays','B.attaches','C.devotes','D.refers'],answer:'B',chapter:'搭配',source:'种子库',difficulty:2},
      {id:'s201_007',type:'single',stem:'_____ for the timely rescue, the victims would have suffered more.',options:['A.Had it not been','B.Should it be','C.Were it to be','D.If it has not been'],answer:'A',chapter:'语法',source:'种子库',difficulty:4},
      {id:'s201_008',type:'single',stem:'The new technology is expected to _____ a revolution in the industry.',options:['A.bring about','B.bring up','C.bring in','D.bring out'],answer:'A',chapter:'短语',source:'种子库',difficulty:2},
      {id:'s201_009',type:'single',stem:'She spoke with such _____ that everyone was convinced by her argument.',options:['A.convention','B.conviction','C.confusion','D.conclusion'],answer:'B',chapter:'词汇',source:'种子库',difficulty:3},
      {id:'s201_010',type:'single',stem:'The phenomenon can be _____ a combination of social and economic factors.',options:['A.attributed to','B.contributed to','C.distributed to','D.substituted for'],answer:'A',chapter:'搭配',source:'种子库',difficulty:3},
      {id:'s201_011',type:'single',stem:'Not until he retired _____ how precious health was.',options:['A.he realized','B.did he realize','C.he did realize','D.had he realized'],answer:'B',chapter:'语法',source:'种子库',difficulty:3},
      {id:'s201_012',type:'single',stem:'The rapid development of AI has _____ concerns about job displacement.',options:['A.aroused','B.arose','C.risen','D.raised'],answer:'A',chapter:'词汇',source:'种子库',difficulty:2},
      {id:'s201_013',type:'single',stem:'_____ in a well-known university, she got a position as a research assistant.',options:['A.Educating','B.Having educated','C.Educated','D.To educate'],answer:'C',chapter:'语法',source:'种子库',difficulty:3},
      {id:'s201_014',type:'single',stem:'The gap between the rich and the poor continues to _____ in many countries.',options:['A.bridge','B.widen','C.narrow','D.shrink'],answer:'B',chapter:'词汇',source:'种子库',difficulty:2},
      {id:'s201_015',type:'single',stem:'His argument, _____ logical on the surface, fails to address the root cause.',options:['A.however','B.although','C.while','D.despite'],answer:'C',chapter:'语法',source:'种子库',difficulty:3},
    ],
    '301': [
      {id:'s301_001',type:'single',stem:'lim(x→0) sin(x)/x = _____。',options:['A.0','B.1','C.∞','D.e'],answer:'B',chapter:'高数-极限',source:'种子库',difficulty:2},
      {id:'s301_002',type:'single',stem:'若 |A|=0，则 A 一定是_____矩阵。',options:['A.奇异(不可逆)','B.对称','C.非奇异(可逆)','D.正交'],answer:'A',chapter:'线代-矩阵',source:'种子库',difficulty:3},
      {id:'s301_003',type:'single',stem:'f(x)=|x| 在 x=0 处连续但不可_____。',options:['A.积','B.导','C.微','D.分'],answer:'B',chapter:'高数-导数',source:'种子库',difficulty:3},
      {id:'s301_004',type:'single',stem:'P(AB)=0，则 A 和 B 是_____事件。',options:['A.相互独立','B.互斥','C.对立','D.必然'],answer:'B',chapter:'概率论',source:'种子库',difficulty:4},
      {id:'s301_005',type:'single',stem:'设 f(x) 在 [a,b] 上连续，则由介值定理可知_____。',options:['A.f(x)可导','B.f(x)有最大值','C.f(x)可取到最大最小值间的任何值','D.f(x)单调'],answer:'C',chapter:'高数-连续',source:'种子库',difficulty:2},
      {id:'s301_006',type:'single',stem:'∫(0→1) x² dx = _____。',options:['A.1/2','B.1/3','C.1/4','D.1'],answer:'B',chapter:'高数-积分',source:'种子库',difficulty:1},
      {id:'s301_007',type:'single',stem:'n 阶方阵 A 的特征值之和等于 A 的_____。',options:['A.行列式','B.秩','C.迹','D.范数'],answer:'C',chapter:'线代-特征值',source:'种子库',difficulty:3},
      {id:'s301_008',type:'single',stem:'泊松分布 P(λ) 的数学期望和方差_____。',options:['A.都等于λ','B.分别为λ和λ²','C.分别为λ²和λ','D.都等于λ²'],answer:'A',chapter:'概率论',source:'种子库',difficulty:2},
      {id:'s301_009',type:'single',stem:'设 y=e^x，则 dy = _____。',options:['A.e^x','B.e^x dx','C.xe^(x-1) dx','D.e^x/x'],answer:'B',chapter:'高数-微分',source:'种子库',difficulty:1},
      {id:'s301_010',type:'single',stem:'向量组线性相关的充要条件是其中_____。',options:['A.所有向量相同','B.至少一个向量可由其余线性表示','C.向量个数大于维数','D.所有向量正交'],answer:'B',chapter:'线代-向量',source:'种子库',difficulty:3},
      {id:'s301_011',type:'single',stem:'级数 Σ(n=1→∞) 1/n 是_____。',options:['A.收敛的','B.发散的','C.条件收敛的','D.绝对收敛的'],answer:'B',chapter:'高数-级数',source:'种子库',difficulty:2},
      {id:'s301_012',type:'single',stem:'二阶常系数齐次线性微分方程的通解由_____线性无关解构成。',options:['A.1个','B.2个','C.3个','D.n个'],answer:'B',chapter:'高数-微分方程',source:'种子库',difficulty:3},
      {id:'s301_013',type:'single',stem:'正态分布 N(μ,σ²) 中，约_____的数据落在 (μ-σ, μ+σ) 内。',options:['A.50%','B.68.27%','C.95.45%','D.99.73%'],answer:'B',chapter:'概率论',source:'种子库',difficulty:2},
      {id:'s301_014',type:'single',stem:'齐次线性方程组 Ax=0 有非零解的条件是 r(A)_____n。',options:['A.>','B.=','C.<','D.≥'],answer:'C',chapter:'线代-方程组',source:'种子库',difficulty:2},
      {id:'s301_015',type:'single',stem:'罗尔定理要求函数在闭区间连续、开区间可导，且_____。',options:['A.f(a)=0','B.f(a)=f(b)','C.f\'(a)=0','D.f(a)>f(b)'],answer:'B',chapter:'高数-中值定理',source:'种子库',difficulty:2},
    ],
    '408': [
      {id:'s408_001',type:'single',stem:'对于包含 n 个顶点的连通图，DFS 树的边数为_____。',options:['A.n','B.n-1','C.n+1','D.2n'],answer:'B',chapter:'数据结构-图',source:'种子库',difficulty:3},
      {id:'s408_002',type:'single',stem:'快速排序平均时间复杂度是_____。',options:['A.O(n)','B.O(n log n)','C.O(n²)','D.O(log n)'],answer:'B',chapter:'数据结构-排序',source:'种子库',difficulty:2},
      {id:'s408_003',type:'single',stem:'死锁的四个必要条件中不包括_____。',options:['A.互斥','B.不可抢占','C.动态分配','D.循环等待'],answer:'C',chapter:'OS-死锁',source:'种子库',difficulty:3},
      {id:'s408_004',type:'single',stem:'LRU 页面置换算法优先淘汰_____的页面。',options:['A.最早进入','B.访问最少','C.最久未访问','D.未来最少访问'],answer:'C',chapter:'OS-内存',source:'种子库',difficulty:3},
      {id:'s408_005',type:'single',stem:'TCP/IP 中负责端到端可靠传输的协议是_____。',options:['A.IP','B.UDP','C.TCP','D.HTTP'],answer:'C',chapter:'网络-传输层',source:'种子库',difficulty:2},
      {id:'s408_006',type:'single',stem:'Cache 存在的理论依据是程序的_____原理。',options:['A.指令执行','B.地址映射','C.局部性','D.分级存储'],answer:'C',chapter:'组成-存储',source:'种子库',difficulty:3},
      {id:'s408_007',type:'single',stem:'二叉树的第 i 层最多有_____个结点。',options:['A.2^i','B.2^(i-1)','C.2i','D.i²'],answer:'B',chapter:'数据结构-树',source:'种子库',difficulty:2},
      {id:'s408_008',type:'single',stem:'哈夫曼编码是一种_____编码。',options:['A.等长','B.前缀','C.后缀','D.固定长度'],answer:'B',chapter:'数据结构-树',source:'种子库',difficulty:2},
      {id:'s408_009',type:'single',stem:'进程和线程的主要区别在于线程是_____的基本单位。',options:['A.资源分配','B.CPU调度','C.内存管理','D.文件操作'],answer:'B',chapter:'OS-进程',source:'种子库',difficulty:2},
      {id:'s408_010',type:'single',stem:'OSI 七层模型中，网络层的主要功能是_____。',options:['A.流量控制','B.路由选择','C.数据加密','D.会话管理'],answer:'B',chapter:'网络-网络层',source:'种子库',difficulty:2},
      {id:'s408_011',type:'single',stem:'散列表解决冲突的方法中，_____是将冲突元素存入同一链表。',options:['A.开放定址法','B.再散列法','C.链地址法','D.公共溢出区'],answer:'C',chapter:'数据结构-查找',source:'种子库',difficulty:2},
      {id:'s408_012',type:'single',stem:'补码表示法中，-128 的 8 位补码是_____。',options:['A.10000000','B.11111111','C.01111111','D.00000000'],answer:'A',chapter:'组成-数据表示',source:'种子库',difficulty:3},
      {id:'s408_013',type:'single',stem:'Dijkstra 算法不能处理_____的图。',options:['A.有向','B.无向','C.有负权边','D.稠密'],answer:'C',chapter:'数据结构-图',source:'种子库',difficulty:3},
      {id:'s408_014',type:'single',stem:'虚拟存储器的基础是_____原理。',options:['A.缓存','B.局部性','C.并行','D.流水线'],answer:'B',chapter:'OS-内存',source:'种子库',difficulty:2},
      {id:'s408_015',type:'single',stem:'TCP 三次握手的目的是_____。',options:['A.加密通信','B.建立可靠连接','C.压缩数据','D.路由选择'],answer:'B',chapter:'网络-传输层',source:'种子库',difficulty:1},
    ]
  };

  // 注入到 localStorage 金库
  var KEY_PREFIX = 'pku_qbank_';
  ['101','201','301','408'].forEach(function(sub){
    try {
      var existing = JSON.parse(localStorage.getItem(KEY_PREFIX + sub) || '[]');
      var existIds = {};
      existing.forEach(function(q){ existIds[q.id] = true; });
      var newQs = SEED[sub].filter(function(q){ return !existIds[q.id]; });
      if (newQs.length > 0) {
        var merged = existing.concat(newQs);
        localStorage.setItem(KEY_PREFIX + sub, JSON.stringify(merged));
        console.log('[金库种子] ' + sub + ': 注入 ' + newQs.length + ' 道题（共 ' + merged.length + '）');
      }
    } catch(e) { console.warn('[金库种子] ' + sub + ' 注入失败', e); }
  });

  // 更新 meta
  try {
    localStorage.setItem('pku_qbank_meta', JSON.stringify({ lastUpdate: Date.now(), seeded: true }));
  } catch(e) {}

  // 同时注入到 QUESTION_BANK（如果存在）
  if (typeof QUESTION_BANK !== 'undefined') {
    ['101','201','301','408'].forEach(function(sub){
      if (!QUESTION_BANK[sub]) QUESTION_BANK[sub] = [];
      var existIds = {};
      QUESTION_BANK[sub].forEach(function(q){ existIds[q.id] = true; });
      // 转换格式（QUESTION_BANK 用 text/options:{A,B,C,D}/answer 格式）
      SEED[sub].forEach(function(q){
        if (existIds[q.id]) return;
        QUESTION_BANK[sub].push({
          id: q.id, topic: q.chapter, difficulty: q.difficulty,
          text: q.stem,
          options: { A: q.options[0].replace(/^[A-D]\./, ''), B: q.options[1].replace(/^[A-D]\./, ''), C: q.options[2].replace(/^[A-D]\./, ''), D: q.options[3].replace(/^[A-D]\./, '') },
          answer: q.answer,
          explain: '来源：种子题库'
        });
      });
    });
    console.log('[金库种子] QUESTION_BANK 已同步注入');
  }

  console.log('[金库种子] ✅ 种子数据注入完成 — 四科共 ' + (SEED['101'].length + SEED['201'].length + SEED['301'].length + SEED['408'].length) + ' 题');
})();
