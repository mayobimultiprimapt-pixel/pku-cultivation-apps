/**
 * Ghost Dorm Question Bank - 4 subjects, ~60 questions
 * Maps to real exam sections:
 *   101 Politics: danxuan (Section_1)
 *   201 English: vocabulary/grammar
 *   301 Math: xuanze (Section_1) + tiankong (Section_2)
 *   408 CS: danxuan (Section_1)
 */
const GhostData = (() => {
  const QUESTIONS = [
    // ===== 101 POLITICS (15) =====
    {id:'p01',subject:'politics',text:'马克思主义哲学的直接理论来源是',
     options:['黑格尔的辩证法和费尔巴哈的唯物主义','培根的经验论','康德的先验论','亚里士多德的形而上学'],
     answer:0, explain:'马哲直接来源：黑格尔辩证法(合理内核) + 费尔巴哈唯物主义(基本内核)'},
    {id:'p02',subject:'politics',text:'社会主义核心价值观中，属于社会层面的是',
     options:['富强、民主、文明、和谐','自由、平等、公正、法治','爱国、敬业、诚信、友善','自由、民主、文明、法治'],
     answer:1, explain:'社会层面：自由、平等、公正、法治'},
    {id:'p03',subject:'politics',text:'毛泽东思想活的灵魂的三个基本方面是',
     options:['实事求是、群众路线、独立自主','统一战线、武装斗争、党的建设','理论联系实际、密切联系群众、批评与自我批评','解放思想、改革开放、科学发展'],
     answer:0, explain:'毛泽东思想活的灵魂=实事求是+群众路线+独立自主'},
    {id:'p04',subject:'politics',text:'中国特色社会主义最本质的特征是',
     options:['中国共产党领导','人民当家作主','依法治国','社会主义市场经济'],
     answer:0, explain:'十九大写入党章：党的领导是中国特色社会主义最本质的特征'},
    {id:'p05',subject:'politics',text:'唯物辩证法的实质和核心是',
     options:['对立统一规律','质量互变规律','否定之否定规律','因果联系规律'],
     answer:0, explain:'对立统一规律（矛盾规律）是辩证法的实质和核心'},
    {id:'p06',subject:'politics',text:'我国社会主要矛盾已转化为',
     options:['人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾','人民日益增长的物质文化需要和落后社会生产之间的矛盾','生产力和生产关系的矛盾','经济基础和上层建筑的矛盾'],
     answer:0, explain:'十九大提出新时代主要矛盾转化'},
    {id:'p07',subject:'politics',text:'实践是检验真理的唯一标准，这是因为',
     options:['实践具有直接现实性的品格','实践是认识的来源','实践是认识的目的','实践具有社会历史性'],
     answer:0, explain:'实践的直接现实性使其成为检验真理的唯一标准'},
    {id:'p08',subject:'politics',text:'新民主主义革命的三大法宝是',
     options:['统一战线、武装斗争、党的建设','土地革命、武装斗争、根据地建设','理论联系实际、密切联系群众、自我批评','独立自主、自力更生、艰苦奋斗'],
     answer:0, explain:'毛泽东在《＜共产党人＞发刊词》中总结三大法宝'},
    {id:'p09',subject:'politics',text:'认识的本质是',
     options:['主体对客体的能动反映','主体对客体的直观反映','感觉的综合','绝对精神的自我认识'],
     answer:0, explain:'辩证唯物主义认为认识是主体对客体的能动反映'},
    {id:'p10',subject:'politics',text:'社会存在是指',
     options:['社会物质生活条件的总和','自然环境','生产方式','社会意识形态'],
     answer:0, explain:'社会存在=地理环境+人口因素+生产方式(决定性)'},
    {id:'p11',subject:'politics',text:'全面依法治国总目标是',
     options:['建设中国特色社会主义法治体系，建设社会主义法治国家','实现国家治理体系和治理能力现代化','维护社会公平正义','实现全体人民共同富裕'],
     answer:0, explain:'十八届四中全会确定全面依法治国总目标'},
    {id:'p12',subject:'politics',text:'价值规律的表现形式是',
     options:['价格围绕价值上下波动','价格与价值完全一致','价格高于价值','供求决定价格'],
     answer:0, explain:'价值规律：价格围绕价值上下波动'},
    // ===== 201 ENGLISH (10) =====
    {id:'e01',subject:'english',text:'The study provided _____ evidence to support the hypothesis.',
     options:['empirical','imperial','emphatic','epidemic'],
     answer:0, explain:'empirical=经验的/实证的, imperial=帝国的, emphatic=强调的, epidemic=流行的'},
    {id:'e02',subject:'english',text:'The government should _____ resources more efficiently.',
     options:['allocate','alleviate','alternate','alienate'],
     answer:0, explain:'allocate=分配, alleviate=减轻, alternate=交替, alienate=疏远'},
    {id:'e03',subject:'english',text:'Her _____ attitude made negotiations difficult.',
     options:['pragmatic','problematic','pathetic','periodic'],
     answer:0, explain:'pragmatic=务实的, problematic=有问题的, pathetic=可怜的'},
    {id:'e04',subject:'english',text:'The effects of pollution are _____ to human health.',
     options:['detrimental','instrumental','supplementary','elementary'],
     answer:0, explain:'detrimental=有害的, instrumental=有帮助的'},
    {id:'e05',subject:'english',text:'Scientists tried to _____ the cause of the outbreak.',
     options:['ascertain','assert','assemble','assimilate'],
     answer:0, explain:'ascertain=查明/确定, assert=断言, assemble=组装'},
    {id:'e06',subject:'english',text:'The internet has become _____ in modern society.',
     options:['ubiquitous','ambiguous','conspicuous','contiguous'],
     answer:0, explain:'ubiquitous=无处不在的, ambiguous=模糊的'},
    {id:'e07',subject:'english',text:'Social media has _____ the way people communicate.',
     options:['transformed','transplanted','transcribed','transgressed'],
     answer:0, explain:'transformed=彻底改变, transplanted=移植'},
    {id:'e08',subject:'english',text:'The report highlighted the _____ between rich and poor.',
     options:['disparity','prosperity','integrity','posterity'],
     answer:0, explain:'disparity=差距/不平等, prosperity=繁荣'},
    {id:'e09',subject:'english',text:'We must _____ the consequences before making a decision.',
     options:['contemplate','compensate','concatenate','contaminate'],
     answer:0, explain:'contemplate=深思, compensate=补偿, contaminate=污染'},
    {id:'e10',subject:'english',text:'The new law aims to _____ discrimination in the workplace.',
     options:['eliminate','elaborate','illuminate','estimate'],
     answer:0, explain:'eliminate=消除, elaborate=详述, illuminate=照亮'},
    // ===== 301 MATH (12) =====
    {id:'m01',subject:'math',text:'lim(x->0) sin(x)/x 的值为',
     options:['1','0','不存在','+inf'],
     answer:0, explain:'重要极限：lim(x->0) sinx/x = 1'},
    {id:'m02',subject:'math',text:'函数 f(x)=|x| 在 x=0 处',
     options:['连续但不可导','可导','不连续','可导且导数为0'],
     answer:0, explain:'|x|在x=0处连续，但左导数=-1，右导数=1，不可导'},
    {id:'m03',subject:'math',text:'设 A 是 n 阶可逆矩阵，则 |A^(-1)| =',
     options:['|A|^(-1)','|A|','-|A|','1'],
     answer:0, explain:'|A^(-1)| = 1/|A| = |A|^(-1)'},
    {id:'m04',subject:'math',text:'级数 sum(1/n) (n=1 to inf) 是',
     options:['发散的','收敛的','条件收敛的','绝对收敛的'],
     answer:0, explain:'调和级数 sum(1/n) 发散（p=1级数发散）'},
    {id:'m05',subject:'math',text:'二重积分 double_integral_D dxdy 的几何意义是',
     options:['区域D的面积','区域D的体积','区域D上的曲面面积','区域D的周长'],
     answer:0, explain:'被积函数为1时，二重积分=区域面积'},
    {id:'m06',subject:'math',text:'Stokes 公式将曲面积分转化为',
     options:['曲线积分','体积分','二重积分','三重积分'],
     answer:0, explain:'Stokes定理：曲面积分<->曲线积分'},
    {id:'m07',subject:'math',text:'特征值全为正的对称矩阵是',
     options:['正定矩阵','半正定矩阵','负定矩阵','不定矩阵'],
     answer:0, explain:'对称矩阵正定 <=> 所有特征值>0'},
    {id:'m08',subject:'math',text:'泰勒展开 e^x = 1 + x + x^2/2! + ...，其收敛半径为',
     options:['+inf','1','0','e'],
     answer:0, explain:'e^x 的泰勒级数在整个实数轴收敛，R=+inf'},
    {id:'m09',subject:'math',text:'向量 a=(1,2,3) 和 b=(2,4,6) 的关系是',
     options:['线性相关','线性无关','正交','无法判断'],
     answer:0, explain:'b=2a，所以线性相关'},
    {id:'m10',subject:'math',text:'拉格朗日中值定理要求函数在 [a,b] 上',
     options:['连续且在(a,b)可导','连续即可','可导即可','二阶可导'],
     answer:0, explain:'拉格朗日中值定理：[a,b]连续 + (a,b)可导'},
    {id:'m11',subject:'math',text:'齐次线性方程组 Ax=0 有非零解的充要条件是',
     options:['r(A)<n','r(A)=n','|A|!=0','A可逆'],
     answer:0, explain:'Ax=0有非零解 <=> r(A)<n（未知数个数）'},
    {id:'m12',subject:'math',text:'全微分 dz = Pdx + Qdy 是恰当微分的条件是',
     options:['dP/dy = dQ/dx','dP/dx = dQ/dy','P=Q','dP/dx + dQ/dy = 0'],
     answer:0, explain:'恰当微分条件：dP/dy = dQ/dx'},
    // ===== 408 CS (12) =====
    {id:'c01',subject:'cs408',text:'栈和队列的共同特点是',
     options:['只允许在端点处插入和删除元素','都是先进先出','都是先进后出','没有共同点'],
     answer:0, explain:'栈和队列都是操作受限的线性表，只在端点操作'},
    {id:'c02',subject:'cs408',text:'快速排序的平均时间复杂度为',
     options:['O(nlogn)','O(n^2)','O(n)','O(logn)'],
     answer:0, explain:'快排平均O(nlogn)，最坏O(n^2)'},
    {id:'c03',subject:'cs408',text:'在 TCP/IP 模型中，HTTP 协议工作在',
     options:['应用层','传输层','网络层','数据链路层'],
     answer:0, explain:'HTTP是应用层协议，基于TCP'},
    {id:'c04',subject:'cs408',text:'进程和线程的关系，下列说法正确的是',
     options:['线程是进程中的一个执行单元','进程是线程的子集','线程拥有独立的地址空间','一个进程只能有一个线程'],
     answer:0, explain:'线程是CPU调度的基本单位，进程是资源分配的基本单位'},
    {id:'c05',subject:'cs408',text:'虚拟内存的基础是',
     options:['局部性原理','全局性原理','缓存一致性','总线仲裁'],
     answer:0, explain:'虚拟内存基于时间局部性和空间局部性'},
    {id:'c06',subject:'cs408',text:'二叉树的先序遍历序列为 ABDECF，中序遍历序列为 DBEACF，则后序遍历序列为',
     options:['DEBFCA','DEFBCA','DEBCFA','DFEBCA'],
     answer:0, explain:'由先序+中序可唯一确定二叉树，后序为DEBFCA'},
    {id:'c07',subject:'cs408',text:'死锁产生的四个必要条件不包括',
     options:['可剥夺条件','互斥条件','请求和保持条件','循环等待条件'],
     answer:0, explain:'四个必要条件：互斥、请求保持、不可剥夺、循环等待。"可剥夺"不是'},
    {id:'c08',subject:'cs408',text:'TCP 三次握手中，第二次握手服务器发送的标志位是',
     options:['SYN+ACK','SYN','ACK','FIN+ACK'],
     answer:0, explain:'三次握手：SYN -> SYN+ACK -> ACK'},
    {id:'c09',subject:'cs408',text:'B+ 树与 B 树的主要区别是',
     options:['B+树的数据全在叶子节点','B+树没有关键字','B树的叶子节点有指针','B树比B+树更适合范围查询'],
     answer:0, explain:'B+树所有数据在叶子节点，叶子有链表，适合范围查询'},
    {id:'c10',subject:'cs408',text:'以下哪个不是操作系统的功能',
     options:['编译程序','进程管理','存储管理','设备管理'],
     answer:0, explain:'编译程序是系统软件，不是OS的核心功能'},
    {id:'c11',subject:'cs408',text:'哈夫曼树的带权路径长度(WPL)具有的特点是',
     options:['最小','最大','等于节点数','等于叶子数'],
     answer:0, explain:'哈夫曼树(最优二叉树)的WPL最小'},
    {id:'c12',subject:'cs408',text:'IPv4 地址长度为',
     options:['32位','64位','128位','16位'],
     answer:0, explain:'IPv4=32位, IPv6=128位'},
  ];

  // Shuffle helper
  function shuffle(arr) {
    const a = [...arr];
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  // Get a random subset of N questions, balanced across subjects
  function getQuestionSet(n) {
    const bySubject = {};
    QUESTIONS.forEach(q => {
      if(!bySubject[q.subject]) bySubject[q.subject] = [];
      bySubject[q.subject].push(q);
    });
    const subjects = Object.keys(bySubject);
    const perSubject = Math.ceil(n / subjects.length);
    let pool = [];
    subjects.forEach(s => {
      pool.push(...shuffle(bySubject[s]).slice(0, perSubject));
    });
    return shuffle(pool).slice(0, n);
  }

  // Ghost types
  const GHOSTS = [
    {type:'wanderer', icon:'🧟', name:'游魂', speech:'嘿嘿...来考你一题...', timer:15, penalty:15},
    {type:'wraith', icon:'😱', name:'怨灵', speech:'答对...就放你走...', timer:10, penalty:25},
    {type:'specter', icon:'💀', name:'厉鬼', speech:'看你能不能活着出去!', timer:8, penalty:35},
  ];

  // Room definitions: 3 floors x 4 rooms
  function generateRooms() {
    const questions = getQuestionSet(36);
    let qi = 0;
    const rooms = [];
    for(let floor=1; floor<=3; floor++){
      for(let room=1; room<=4; room++){
        const roomNum = floor*100 + room;
        const ghostLevel = Math.min(floor-1, 2); // 0,1,2
        const hasScroll = false; // Assigned later
        rooms.push({
          id: roomNum,
          floor,
          searched: false,
          spotsSearched: {desk:false, closet:false, bed:false},
          ghost: {...GHOSTS[ghostLevel]},
          ghostDefeated: false,
          hasScroll: false,
          scrollCollected: false,
          // Each room: 1 search trap question + 1 ghost question = 2 questions
          trapQuestion: questions[qi++] || questions[0],
          ghostQuestion: questions[qi++] || questions[1],
        });
      }
    }
    // Place 5 scrolls randomly
    const shuffledRooms = shuffle([...rooms]);
    for(let i=0; i<5 && i<shuffledRooms.length; i++){
      shuffledRooms[i].hasScroll = true;
      // Scroll guardian question
      shuffledRooms[i].scrollQuestion = questions[qi++] || questions[2];
    }
    // Hallway questions (one per floor transition)
    const hallQuestions = [
      questions[qi++] || questions[3],
      questions[qi++] || questions[4],
    ];
    return {rooms, hallQuestions};
  }

  return {QUESTIONS, GHOSTS, generateRooms, shuffle, getQuestionSet};
})();
