/* ============================================
   QUESTIONS.JS — 基础题库 + 转换工具
   101 政治 | 201 英语 | 301 数学 | 408 计算机
   ============================================ */

const QUESTION_BANK = {
    408: [
        { id:'ds001',topic:'数据结构',difficulty:3,text:'对于包含 n 个顶点的连通图，若进行深度优先搜索（DFS）遍历，其生成的 DFS 树中的边数为 _________ 条。',options:{A:'n',B:'n - 1',C:'n + 1',D:'2n'},answer:'B',explain:'连通图的 DFS 树包含 n 顶点，因此有 n-1 条边。' },
        { id:'ds002',topic:'算法复杂度',difficulty:2,text:'快速排序在平均情况下的时间复杂度是 _________。',options:{A:'O(n)',B:'O(n log n)',C:'O(n²)',D:'O(log n)'},answer:'B',explain:'快排平均 O(n log n)，最坏 O(n²)。' },
        { id:'os001',topic:'操作系统',difficulty:4,text:'死锁的四个必要条件：互斥、占有并等待、环路等待，以及 _________。',options:{A:'不可抢占',B:'无限期阻塞',C:'动态分配',D:'资源共享'},answer:'A',explain:'四个必要条件：互斥、占有等待、不可抢占、循环等待。' },
        { id:'os002',topic:'内存管理',difficulty:3,text:'LRU 页面置换算法优先淘汰 _________ 的页面。',options:{A:'最早进入内存',B:'访问次数最少',C:'最长时间未被访问',D:'未来最少访问'},answer:'C',explain:'LRU = Least Recently Used，淘汰最近最久未使用的页面。' },
        { id:'cn001',topic:'计算机网络',difficulty:3,text:'TCP/IP 中负责端到端可靠传输的协议是 _________。',options:{A:'IP',B:'UDP',C:'TCP',D:'HTTP'},answer:'C',explain:'TCP 面向连接提供可靠传输，UDP 不可靠。' },
        { id:'co001',topic:'计算机组成原理',difficulty:4,text:'Cache 存在的理论依据是程序的 _________ 原理。',options:{A:'指令执行',B:'地址映射',C:'局部性',D:'分级存储'},answer:'C',explain:'局部性原理（时间+空间局部性）是 Cache 的理论基础。' },
    ],
    101: [
        { id:'mz001',topic:'马克思主义基本原理',difficulty:3,text:'唯物辩证法的总特征是联系的观点和 _________ 的观点。',options:{A:'矛盾',B:'发展',C:'实践',D:'对立统一'},answer:'B',explain:'两个总特征：联系+发展。' },
        { id:'mz002',topic:'政治经济学',difficulty:3,text:'购买劳动力的资本称为 _________ 资本。',options:{A:'固定',B:'流动',C:'可变',D:'不变'},answer:'C',explain:'购买劳动力=可变资本，购买生产资料=不变资本。' },
        { id:'ls001',topic:'中国近现代史纲要',difficulty:2,text:'_________ 标志着新民主主义革命的开端。',options:{A:'辛亥革命',B:'五四运动',C:'中共一大',D:'南昌起义'},answer:'B',explain:'1919年五四运动=新民主主义革命开端。' },
        { id:'mzt001',topic:'毛泽东思想',difficulty:2,text:'中国革命的首要问题是 _________。',options:{A:'农民问题',B:'分清敌友',C:'武装斗争',D:'统一战线'},answer:'B',explain:'毛泽东："谁是敌人？谁是朋友？这是革命的首要问题。"' },
    ],
    201: [
        { id:'en001',topic:'完形填空',difficulty:3,text:'Many people are _________ to believe false information online without verifying the source.',options:{A:'prevented',B:'reluctant',C:'prone',D:'accustomed'},answer:'C',explain:'be prone to = 倾向于、容易...' },
        { id:'en002',topic:'语法长难句',difficulty:4,text:'_________ had the researchers published their findings when they were facing severe criticism.',options:{A:'Scarcely',B:'Although',C:'No sooner',D:'Not until'},answer:'A',explain:'Scarcely...when... 一...就...，置于句首部分倒装。' },
        { id:'en003',topic:'词义辨析',difficulty:3,text:'Constant exposure to violent media can have a(n) _________ effect on children.',options:{A:'beneficial',B:'detrimental',C:'ambiguous',D:'trivial'},answer:'B',explain:'detrimental = 有害的、不利的。' },
        { id:'en004',topic:'短语搭配',difficulty:2,text:'The committee decided to _________ the new policy despite strong opposition.',options:{A:'do away with',B:'come up with',C:'put up with',D:'go ahead with'},answer:'D',explain:'go ahead with = 推进、继续进行。' },
    ],
    301: [
        { id:'ma001',topic:'高等数学-极限',difficulty:2,text:'lim(x→0) sin(x)/x = _________。',options:{A:'0',B:'1',C:'∞',D:'e'},answer:'B',explain:'第一重要极限=1。' },
        { id:'ma002',topic:'线性代数-矩阵',difficulty:3,text:'若 |A|=0，则 A 一定是 _________ 矩阵。',options:{A:'奇异(不可逆)',B:'对称',C:'非奇异(可逆)',D:'正交'},answer:'A',explain:'行列式=0 → 奇异矩阵，不可逆。' },
        { id:'ma003',topic:'高等数学-导数',difficulty:3,text:'f(x)=|x| 在 x=0 处连续但不可 _________。',options:{A:'积',B:'导',C:'微',D:'分'},answer:'B',explain:'左导数=-1，右导数=1，不相等，不可导。' },
        { id:'ma004',topic:'概率论',difficulty:4,text:'P(AB)=0 则 A 和 B 是 _________ 事件。',options:{A:'相互独立',B:'互斥',C:'对立',D:'必然'},answer:'B',explain:'P(AB)=0 → 不能同时发生 → 互斥。' },
    ]
};

// ═══ 题库统计 ═══
let _questionIdCounter = 1000;
function _nextId(prefix) { return prefix + '_v' + (_questionIdCounter++); }

function getRandomQuestion(subject) {
    const questions = QUESTION_BANK[subject] || [];
    if (questions.length === 0) return null;
    // 优先从业力录抽题（20%概率）
    if (typeof game !== 'undefined' && game.battle && Math.random() < 0.2) {
        const karmaQ = game.battle.getKarmaQuestion(subject);
        if (karmaQ) return karmaQ;
    }
    return questions[Math.floor(Math.random() * questions.length)];
}

function getSubjectName(subjectCode) {
    const names = { 101: '思想政治理论', 201: '英语 (一)', 301: '数学 (一)', 408: '计算机学科专业基础' };
    return names[subjectCode] || '未知科目';
}

function getSubjectIcon(subjectCode) {
    const icons = { 101: '🗡️', 201: '🏆', 301: '⭐', 408: '⚔️' };
    return icons[subjectCode] || '📚';
}

function getDifficultyStars(level) {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
}

function getDifficultyLabel(level) {
    const labels = ['', 'EASY', 'NORMAL', 'MEDIUM', 'HARD', 'EXTREME'];
    return labels[level] || 'UNKNOWN';
}
