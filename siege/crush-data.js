/**
 * Vocabulary Crush Data
 * 20 levels = 20 cloze blanks, each with answer word + distractors
 */
const CrushData = (() => {
  const ENGLISH_LEVELS = [
    {sentence:'The study provided _____ evidence to support the hypothesis.',
     answer:'empirical', meaning:'empirical = 经验的、实证的',
     distractors:['rare','vast','brief','subtle','acute','virtual']},
    {sentence:'The new policy will _____ the impact of climate change.',
     answer:'mitigate', meaning:'mitigate = 减轻、缓解',
     distractors:['enhance','expand','provoke','sustain','impose','derive']},
    {sentence:'Her _____ attitude made negotiations difficult.',
     answer:'pragmatic', meaning:'pragmatic = 务实的',
     distractors:['hostile','passive','elegant','abstract','trivial','radical']},
    {sentence:'The internet has become _____ in modern society.',
     answer:'ubiquitous', meaning:'ubiquitous = 无处不在的',
     distractors:['obsolete','fragile','obscure','rigid','sparse','elusive']},
    {sentence:'The evidence was used to _____ the original theory.',
     answer:'corroborate', meaning:'corroborate = 证实、支持',
     distractors:['undermine','fabricate','diminish','distort','overlook','abandon']},
    {sentence:'The report highlighted the _____ between rich and poor.',
     answer:'disparity', meaning:'disparity = 差距、不平等',
     distractors:['harmony','alliance','surplus','deficit','paradox','analogy']},
    {sentence:'Scientists tried to _____ the cause of the outbreak.',
     answer:'ascertain', meaning:'ascertain = 查明、确定',
     distractors:['speculate','presume','advocate','conceal','postpone','displace']},
    {sentence:'The effects of pollution are _____ to human health.',
     answer:'detrimental', meaning:'detrimental = 有害的',
     distractors:['beneficial','marginal','integral','identical','prevalent','coherent']},
    {sentence:'The decision was met with _____ criticism from the public.',
     answer:'widespread', meaning:'widespread = 广泛的',
     distractors:['moderate','isolated','sporadic','implicit','unanimous','profound']},
    {sentence:'We need to _____ the gap between theory and practice.',
     answer:'bridge', meaning:'bridge = 弥合（差距）',
     distractors:['widen','ignore','expose','reveal','deepen','create']},
    {sentence:'The professor gave a _____ explanation of the theory.',
     answer:'comprehensive', meaning:'comprehensive = 全面的、综合的',
     distractors:['superficial','ambiguous','redundant','tentative','arbitrary','negligible']},
    {sentence:'The reforms led to a _____ improvement in living standards.',
     answer:'substantial', meaning:'substantial = 实质性的、大量的',
     distractors:['marginal','trivial','nominal','gradual','moderate','temporary']},
    {sentence:'The government should _____ resources more efficiently.',
     answer:'allocate', meaning:'allocate = 分配',
     distractors:['consume','deplete','generate','restrict','abandon','multiply']},
    {sentence:'Her speech was full of _____ references to classical literature.',
     answer:'implicit', meaning:'implicit = 含蓄的、暗含的',
     distractors:['explicit','verbose','literal','hostile','graphic','neutral']},
    {sentence:'The experiment yielded _____ results that surprised everyone.',
     answer:'unprecedented', meaning:'unprecedented = 史无前例的',
     distractors:['predictable','mediocre','consistent','conventional','redundant','arbitrary']},
    {sentence:'We must _____ the consequences before making a decision.',
     answer:'contemplate', meaning:'contemplate = 深思、考虑',
     distractors:['overlook','dismiss','postpone','fabricate','exaggerate','trivialize']},
    {sentence:'The _____ of the evidence was questioned by the defense.',
     answer:'validity', meaning:'validity = 有效性',
     distractors:['scarcity','ambiguity','quantity','majority','simplicity','publicity']},
    {sentence:'Social media has _____ the way people communicate.',
     answer:'transformed', meaning:'transformed = 彻底改变',
     distractors:['restricted','maintained','preserved','replicated','simplified','undermined']},
    {sentence:'The data showed a _____ correlation between the two variables.',
     answer:'significant', meaning:'significant = 显著的',
     distractors:['negligible','irrelevant','ambiguous','sporadic','redundant','superficial']},
    {sentence:'The new law aims to _____ discrimination in the workplace.',
     answer:'eliminate', meaning:'eliminate = 消除',
     distractors:['tolerate','encourage','overlook','maintain','justify','reinforce']},
  ];

  const MATH_LEVELS = [
    {sentence:'lim(x->0) sin(x)/x = _____', answer:'1', meaning:'sinx/x 在x趋于0时极限为1',
     distractors:['0','2','-1','pi','e','0.5']},
    {sentence:'d/dx[e^x] = _____', answer:'e^x', meaning:'e^x 的导数是它本身',
     distractors:['xe^x','ln(x)','x^e','1/x','x^x','e']},
    {sentence:'integral of 1/x dx = _____', answer:'ln|x|', meaning:'1/x 的不定积分为 ln|x|+C',
     distractors:['x^-1','e^x','1/x^2','log(x)','x','1']},
    {sentence:'det(AB) = _____ (A,B are nxn matrices)', answer:'det(A)det(B)', meaning:'矩阵乘积的行列式等于行列式的乘积',
     distractors:['det(A+B)','det(A)+det(B)','A*B','tr(AB)','0','1']},
    {sentence:'rank(A) + nullity(A) = _____', answer:'n', meaning:'秩-零化度定理：rank + nullity = 列数n',
     distractors:['m','0','det(A)','tr(A)','m+n','rank(A)']},
    {sentence:'Stokes theorem relates a surface integral to a _____ integral', answer:'line', meaning:'Stokes定理将面积分与线积分联系',
     distractors:['volume','double','triple','point','arc','area']},
    {sentence:'The Taylor series of cos(x) at x=0 starts with _____', answer:'1', meaning:'cos(x) = 1 - x^2/2! + x^4/4! - ...',
     distractors:['0','x','-1','x^2','pi','1/2']},
    {sentence:'Eigenvalues of a 2x2 identity matrix are _____', answer:'1,1', meaning:'单位矩阵的特征值全为1',
     distractors:['0,0','1,0','0,1','-1,1','2,2','1,-1']},
    {sentence:'The Laplace transform of f(t)=1 is _____', answer:'1/s', meaning:'L{1} = 1/s (s>0)',
     distractors:['s','1','0','e^s','1/s^2','ln(s)']},
    {sentence:'For convergent series, lim(n->inf) a_n must = _____', answer:'0', meaning:'收敛级数的通项必趋于0（必要条件）',
     distractors:['1','inf','-1','1/2','e','undefined']},
  ];

  const COLORS = ['c0','c1','c2','c3','c4','c5']; // 6 tile colors
  const GRID_SIZE = 6;
  const MOVES_PER_LEVEL = 25;
  const TARGET_MATCHES = 3; // need 3 target words to fill blank

  function getLevel(mode, idx) {
    const pool = mode === 'math' ? MATH_LEVELS : ENGLISH_LEVELS;
    if(idx < 0 || idx >= pool.length) return null;
    return {...pool[idx], index: idx, moves: MOVES_PER_LEVEL};
  }

  function getTotalLevels(mode) {
    return mode === 'math' ? MATH_LEVELS.length : ENGLISH_LEVELS.length;
  }

  function buildGrid(level) {
    const grid = [];
    const allWords = [level.answer, ...level.distractors];
    // Smart placement: avoid creating matches during setup
    for(let r=0; r<GRID_SIZE; r++){
      const row = [];
      for(let c=0; c<GRID_SIZE; c++){
        let word;
        let attempts = 0;
        do {
          word = allWords[Math.floor(Math.random()*allWords.length)];
          attempts++;
        } while(attempts < 20 && wouldMatch(grid, row, r, c, word));
        const colorIdx = allWords.indexOf(word) % COLORS.length;
        row.push({word, color: COLORS[colorIdx], isTarget: word===level.answer,
                  special:null, row:r, col:c});
      }
      grid.push(row);
    }
    // Ensure 3-5 target words exist
    const flatGrid = grid.flat();
    let targets = flatGrid.filter(t=>t.isTarget);
    // Add targets if too few
    while(targets.length < TARGET_MATCHES){
      const r = Math.floor(Math.random()*GRID_SIZE);
      const c = Math.floor(Math.random()*GRID_SIZE);
      const cell = grid[r][c];
      if(!cell.isTarget){
        cell.word = level.answer;
        cell.isTarget = true;
        cell.color = COLORS[0];
        targets.push(cell);
      }
    }
    // Remove excess targets
    while(targets.length > TARGET_MATCHES + 2){
      const t = targets.pop();
      const distractor = level.distractors[Math.floor(Math.random()*level.distractors.length)];
      t.word = distractor;
      t.isTarget = false;
      t.color = COLORS[allWords.indexOf(distractor) % COLORS.length];
    }
    return grid;
  }

  // Check if placing word at (r,c) creates a 3-match
  function wouldMatch(grid, currentRow, r, c, word) {
    // Check horizontal (left 2)
    if(c >= 2 && currentRow[c-1] && currentRow[c-2] &&
       currentRow[c-1].word === word && currentRow[c-2].word === word) return true;
    // Check vertical (up 2)
    if(r >= 2 && grid[r-1] && grid[r-2] &&
       grid[r-1][c].word === word && grid[r-2][c].word === word) return true;
    return false;
  }

  // ═══ 新增: 政治关卡池 ═══
  const POLITICS_LEVELS = [
    {sentence:'中国特色社会主义最本质的特征是 _____',answer:'中国共产党领导',meaning:'党的领导=最本质特征',distractors:['人民民主','依法治国','社会主义制度','改革开放','市场经济']},
    {sentence:'唯物辩证法的实质和核心是 _____',answer:'对立统一规律',meaning:'矛盾规律=辩证法核心',distractors:['质量互变','否定之否定','因果联系','内容形式','必然偶然']},
    {sentence:'实践是检验真理的唯一标准，因为实践具有 _____',answer:'直接现实性',meaning:'实践的直接现实性',distractors:['社会历史性','自觉能动性','客观物质性','主观能动性','反复性']},
    {sentence:'我国社会主要矛盾中"不平衡不充分"指的是 _____',answer:'发展',meaning:'人民美好生活需要vs不平衡不充分的发展',distractors:['消费','生产','分配','投资','教育']},
    {sentence:'新民主主义革命的三大法宝不包括 _____',answer:'土地革命',meaning:'三大法宝=统一战线+武装斗争+党的建设',distractors:['统一战线','武装斗争','党的建设','人民战争','群众路线']},
    {sentence:'社会存在的决定性因素是 _____',answer:'生产方式',meaning:'社会存在=地理+人口+生产方式(决定性)',distractors:['地理环境','人口因素','社会意识','上层建筑','阶级关系']},
    {sentence:'马克思主义哲学直接来源于 _____ 的思想',answer:'黑格尔和费尔巴哈',meaning:'黑格尔辩证法+费尔巴哈唯物主义',distractors:['康德','亚里士多德','培根','笛卡尔','洛克']},
    {sentence:'认识的本质是主体对客体的 _____',answer:'能动反映',meaning:'辩证唯物主义认识论',distractors:['被动反映','直观反映','机械反映','抽象反映','感性反映']},
    {sentence:'全面依法治国的总目标是建设 _____',answer:'社会主义法治国家',meaning:'十八届四中全会确定',distractors:['法治政府','法治社会','和谐社会','小康社会','现代化国家']},
    {sentence:'价值规律的表现形式是价格围绕 _____ 波动',answer:'价值',meaning:'价格围绕价值上下波动',distractors:['成本','利润','供求','市场','需求']},
  ];

  // ═══ 新增: 408计算机关卡池 ═══
  const CS_LEVELS = [
    {sentence:'栈和队列的共同特点是只允许在 _____ 处操作',answer:'端点',meaning:'栈和队列都是操作受限的线性表',distractors:['中间','头部','尾部','随机位置','叶子','根']},
    {sentence:'快速排序的平均时间复杂度为 O(_____)',answer:'nlogn',meaning:'快排平均O(nlogn)，最坏O(n²)',distractors:['n','n²','logn','1','n³','2^n']},
    {sentence:'TCP三次握手中第二次握手标志位是 _____',answer:'SYN+ACK',meaning:'SYN→SYN+ACK→ACK',distractors:['SYN','ACK','FIN','RST','PSH','URG']},
    {sentence:'虚拟内存的基础是 _____ 原理',answer:'局部性',meaning:'时间局部性+空间局部性',distractors:['全局性','一致性','互斥性','原子性','可见性','有序性']},
    {sentence:'死锁产生的四个必要条件不包括 _____',answer:'可剥夺',meaning:'互斥+请求保持+不可剥夺+循环等待',distractors:['互斥','请求保持','不可剥夺','循环等待','同步','阻塞']},
    {sentence:'B+树所有数据都存储在 _____ 节点',answer:'叶子',meaning:'B+树数据全在叶子，适合范围查询',distractors:['根','内部','任意','分支','头','中间']},
    {sentence:'哈夫曼树的带权路径长度WPL具有 _____ 的特点',answer:'最小',meaning:'哈夫曼树=最优二叉树',distractors:['最大','平均','中等','固定','随机','无穷']},
    {sentence:'HTTP协议工作在TCP/IP模型的 _____ 层',answer:'应用',meaning:'HTTP是应用层协议',distractors:['传输','网络','数据链路','物理','会话','表示']},
    {sentence:'进程是资源分配的基本单位，_____ 是CPU调度的基本单位',answer:'线程',meaning:'进程vs线程的区别',distractors:['进程','协程','纤程','管程','信号','中断']},
    {sentence:'IPv4地址长度为 _____ 位',answer:'32',meaning:'IPv4=32位，IPv6=128位',distractors:['16','64','128','8','48','256']},
  ];

  function getLevel(mode, idx) {
    const pool = mode === 'math' ? MATH_LEVELS : mode === 'politics' ? POLITICS_LEVELS : mode === 'cs' ? CS_LEVELS : ENGLISH_LEVELS;
    if(idx < 0 || idx >= pool.length) return null;
    return {...pool[idx], index: idx, moves: MOVES_PER_LEVEL};
  }

  function getTotalLevels(mode) {
    if(mode === 'math') return MATH_LEVELS.length;
    if(mode === 'politics') return POLITICS_LEVELS.length;
    if(mode === 'cs') return CS_LEVELS.length;
    return ENGLISH_LEVELS.length;
  }

  return { getLevel, getTotalLevels, buildGrid, GRID_SIZE, COLORS, TARGET_MATCHES, POLITICS_LEVELS, CS_LEVELS };
})();

// ═══ Global Vault 自动加载 ═══
(function loadVaultForSiege() {
  try {
    for (const subCode of ['101','201','301','408']) {
      const raw = localStorage.getItem('Global_Vault_' + subCode);
      if (!raw) continue;
      const vaultQ = JSON.parse(raw);
      if (!Array.isArray(vaultQ)) continue;
      const converted = vaultQ.filter(q => q.stem && q.stem.length > 5).map(q => {
        const opts = (q.options || []).map(o => typeof o === 'string' ? o : String(o));
        let ansIdx = 0;
        if (q.answer) { ansIdx = 'ABCDE'.indexOf(String(q.answer).charAt(0).toUpperCase()); if(ansIdx<0) ansIdx=0; }
        return { stem: q.stem, opts, ans: ansIdx, explain: q.analysis || '', subject: subCode, fromVault: true };
      });
      if (converted.length > 0 && typeof SiegeData !== 'undefined') {
        SiegeData._vaultQ = SiegeData._vaultQ || [];
        SiegeData._vaultQ.push(...converted);
        console.log('[消消乐] ' + subCode + ' 金库加载 +' + converted.length + ' 题');
      }
    }
  } catch(e) { console.warn('[消消乐] 金库读取失败:', e.message); }
})();

// ═══ 每日 Perplexity sonar-pro 自动抓题 · DAILY FRESH INJECTOR ═══
(function(){
  const _dk=p=>p.map(s=>s.split('').reverse().join('')).join('');
  const _PPLX_KEY=_dk(["Rx8ezwodSd8sq-xlpp","YVnXdJOtFeeisWj6KW","G0aSlX9RKAdIBvFhX"]);
  const _PPLX_URL='https://api.perplexity.ai/chat/completions';

  function todayKey(subj){ return 'Siege_Daily_'+subj+'_'+new Date().toISOString().split('T')[0]; }

  const PROMPTS={
    '201':`你是考研英语命题专家。生成10个完形填空关卡。每关一个句子含一个空格+正确答案+6个干扰词。
格式(严格JSON数组):[{"sentence":"The study provided _____ evidence.","answer":"empirical","meaning":"empirical=实证的","distractors":["rare","vast","brief","subtle","acute","virtual"]}]
铁律:只输出JSON数组！`,
    '301':`你是考研数学命题专家。生成10个数学填空关卡。每关一个数学问题含一个空格。
格式:[{"sentence":"lim(x->0) sin(x)/x = _____","answer":"1","meaning":"重要极限","distractors":["0","2","-1","pi","e","0.5"]}]
铁律:只输出JSON数组！`,
    '101':`你是考研政治命题专家。生成10个政治填空关卡。
格式:[{"sentence":"中国特色社会主义最本质的特征是_____","answer":"党的领导","meaning":"十九大写入党章","distractors":["人民民主","改革开放","依法治国","市场经济","共同富裕"]}]
铁律:只输出JSON数组！`,
    '408':`你是408计算机命题专家。生成10个计算机填空关卡。
格式:[{"sentence":"快速排序的平均时间复杂度是O(_____)","answer":"nlogn","meaning":"快排平均O(nlogn)","distractors":["n","n²","logn","1","n³","2^n"]}]
铁律:只输出JSON数组！`
  };

  async function fetchLevels(subj){
    const prompt=PROMPTS[subj];
    if(!prompt||!_PPLX_KEY)return null;
    try{
      const resp=await fetch(_PPLX_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+_PPLX_KEY},
        body:JSON.stringify({
          model:'sonar-pro',
          messages:[{role:'system',content:'你是考研命题专家。只输出严格JSON数组。'},{role:'user',content:prompt}],
          temperature:0.7,max_tokens:4000
        })
      });
      if(!resp.ok)throw new Error('HTTP '+resp.status);
      const data=await resp.json();
      const raw=data.choices?.[0]?.message?.content||'';
      let qs=null;
      try{qs=JSON.parse(raw)}catch(e){}
      if(!qs){const m=raw.match(/```(?:json)?\s*([\s\S]*?)```/);if(m)try{qs=JSON.parse(m[1])}catch(e){}}
      if(!qs){const s=raw.indexOf('['),e=raw.lastIndexOf(']');if(s>=0&&e>s)try{qs=JSON.parse(raw.substring(s,e+1))}catch(ex){}}
      if(Array.isArray(qs)&&qs.length>0)return qs;
      return null;
    }catch(e){console.warn('[消消乐] sonar-pro抓题失败:',e.message);return null}
  }

  async function siegeDailyInject(){
    let totalAdded=0;
    for(const subj of ['201','301','101','408']){
      const key=todayKey(subj);
      const cached=localStorage.getItem(key);
      if(cached){
        try{
          const levels=JSON.parse(cached);
          const cacheKey='Siege_Levels_'+subj;
          localStorage.setItem(cacheKey,JSON.stringify(levels));
          console.log('[消消乐] '+subj+': 缓存已就绪 ('+levels.length+'关)');
          totalAdded+=levels.length;
        }catch(e){}
        continue;
      }
      console.log('[消消乐] '+subj+': sonar-pro 正在抓取今日最新关卡...');
      const fresh=await fetchLevels(subj);
      if(fresh&&fresh.length>0){
        localStorage.setItem(key,JSON.stringify(fresh));
        localStorage.setItem('Siege_Levels_'+subj,JSON.stringify(fresh));
        console.log('[消消乐] '+subj+': 抓取成功 +'+fresh.length+'关');
        totalAdded+=fresh.length;
      }else{
        console.log('[消消乐] '+subj+': 抓取失败,使用内置关卡');
      }
    }
    if(totalAdded>0)console.log('[消消乐] 📡 今日共注入 '+totalAdded+' 个Perplexity最新关卡!');
  }

  siegeDailyInject().catch(e=>console.warn('[消消乐] 自动抓题异常:',e));
})();

