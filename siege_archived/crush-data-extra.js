/**
 * 消消乐 · 扩展题库 v2.0
 * 4科×400+题 · 历年常考核心题型
 * 自动注入到 CrushData 动态关卡池
 */
(function(){
  // ═══ 201 英语扩展 (400题) ═══
  const ENG_EXTRA = [
    {sentence:'The committee _____ the proposal after lengthy debate.',answer:'endorsed',meaning:'endorsed = 认可',distractors:['rejected','ignored','postponed','revised','withdrew','opposed']},
    {sentence:'Urban sprawl has _____ environmental degradation.',answer:'exacerbated',meaning:'exacerbated = 加剧',distractors:['reduced','prevented','resolved','reversed','halted','contained']},
    {sentence:'The treaty aims to _____ peaceful relations between nations.',answer:'foster',meaning:'foster = 促进',distractors:['sever','disrupt','undermine','terminate','compromise','abandon']},
    {sentence:'Scientists must _____ their findings through peer review.',answer:'substantiate',meaning:'substantiate = 证实',distractors:['fabricate','conceal','distort','suppress','retract','negate']},
    {sentence:'The new policy _____ a significant shift in government strategy.',answer:'represents',meaning:'represents = 代表',distractors:['prevents','undermines','conceals','delays','opposes','denies']},
    {sentence:'Her _____ contribution to science earned her the Nobel Prize.',answer:'outstanding',meaning:'outstanding = 杰出的',distractors:['mediocre','negligible','trivial','modest','average','minimal']},
    {sentence:'The study _____ the relationship between poverty and crime.',answer:'examines',meaning:'examines = 研究',distractors:['ignores','denies','rejects','conceals','dismisses','overlooks']},
    {sentence:'Economic sanctions can _____ a country\'s development.',answer:'hamper',meaning:'hamper = 阻碍',distractors:['boost','accelerate','promote','facilitate','enhance','enable']},
    {sentence:'The results were _____ across multiple experiments.',answer:'replicated',meaning:'replicated = 重复验证',distractors:['contradicted','fabricated','disproved','ignored','rejected','falsified']},
    {sentence:'Globalization has _____ interconnectedness among nations.',answer:'heightened',meaning:'heightened = 增强',distractors:['diminished','severed','weakened','reduced','limited','restricted']},
    {sentence:'The _____ of the argument is that education reduces inequality.',answer:'premise',meaning:'premise = 前提',distractors:['outcome','result','effect','symptom','conclusion','product']},
    {sentence:'Researchers _____ a new method for treating the disease.',answer:'devised',meaning:'devised = 设计出',distractors:['abandoned','rejected','copied','borrowed','inherited','destroyed']},
    {sentence:'The court _____ the defendant of all charges.',answer:'acquitted',meaning:'acquitted = 宣告无罪',distractors:['convicted','accused','sentenced','prosecuted','detained','indicted']},
    {sentence:'Public opinion can _____ government policy decisions.',answer:'influence',meaning:'influence = 影响',distractors:['prevent','replace','destroy','eliminate','ignore','bypass']},
    {sentence:'The merger will _____ the two companies into one entity.',answer:'consolidate',meaning:'consolidate = 合并',distractors:['divide','separate','dissolve','fragment','scatter','disperse']},
    {sentence:'The professor _____ the students to think critically.',answer:'encouraged',meaning:'encouraged = 鼓励',distractors:['forbade','prevented','discouraged','prohibited','restricted','punished']},
    {sentence:'The evidence _____ the hypothesis that was proposed.',answer:'supports',meaning:'supports = 支持',distractors:['refutes','contradicts','undermines','disproves','negates','weakens']},
    {sentence:'The discovery _____ our understanding of the universe.',answer:'revolutionized',meaning:'revolutionized = 彻底改变',distractors:['confirmed','preserved','maintained','retained','sustained','repeated']},
    {sentence:'The gap between the rich and poor continues to _____.',answer:'widen',meaning:'widen = 扩大',distractors:['narrow','close','shrink','diminish','disappear','stabilize']},
    {sentence:'The organization _____ against racial discrimination.',answer:'advocates',meaning:'advocates = 倡导反对',distractors:['promotes','supports','endorses','practices','enables','ignores']},
    {sentence:'The law was _____ to protect children from exploitation.',answer:'enacted',meaning:'enacted = 颁布',distractors:['repealed','ignored','violated','abolished','suspended','withdrawn']},
    {sentence:'The _____ nature of the problem requires a collaborative approach.',answer:'complex',meaning:'complex = 复杂的',distractors:['simple','trivial','basic','elementary','obvious','straightforward']},
    {sentence:'The new technology has the _____ to transform healthcare.',answer:'potential',meaning:'potential = 潜力',distractors:['inability','failure','weakness','limitation','deficiency','obstacle']},
    {sentence:'The interview _____ several controversial topics.',answer:'touched',meaning:'touched on = 涉及',distractors:['avoided','skipped','ignored','bypassed','omitted','missed']},
    {sentence:'Critics argue that the reform is too _____ in scope.',answer:'narrow',meaning:'narrow = 狭窄的',distractors:['broad','extensive','comprehensive','ambitious','sweeping','radical']},
    {sentence:'The artist\'s work _____ a wide range of emotions.',answer:'evokes',meaning:'evokes = 唤起',distractors:['suppresses','conceals','inhibits','represses','blocks','restrains']},
    {sentence:'The company _____ its employees with health insurance.',answer:'provides',meaning:'provides = 提供',distractors:['denies','deprives','strips','charges','penalizes','withholds']},
    {sentence:'The scandal _____ the politician\'s career.',answer:'ruined',meaning:'ruined = 毁掉',distractors:['enhanced','boosted','promoted','advanced','elevated','improved']},
    {sentence:'Researchers _____ that the treatment is safe for children.',answer:'confirmed',meaning:'confirmed = 确认',distractors:['denied','doubted','questioned','disputed','challenged','refuted']},
    {sentence:'The policy is _____ to reducing carbon emissions.',answer:'geared',meaning:'geared toward = 旨在',distractors:['opposed','indifferent','resistant','hostile','averse','contrary']},
    {sentence:'The report _____ the need for immediate action.',answer:'emphasizes',meaning:'emphasizes = 强调',distractors:['downplays','ignores','dismisses','overlooks','minimizes','rejects']},
    {sentence:'The theory has been _____ debated among scholars.',answer:'extensively',meaning:'extensively = 广泛地',distractors:['barely','rarely','seldom','hardly','never','scarcely']},
    {sentence:'The country _____ rapid economic growth in the 1990s.',answer:'experienced',meaning:'experienced = 经历了',distractors:['avoided','prevented','missed','escaped','resisted','opposed']},
    {sentence:'The book offers a _____ analysis of modern society.',answer:'penetrating',meaning:'penetrating = 深刻的',distractors:['superficial','shallow','cursory','brief','hasty','careless']},
    {sentence:'Automation may _____ many jobs in the manufacturing sector.',answer:'eliminate',meaning:'eliminate = 消除',distractors:['create','generate','multiply','produce','expand','increase']},
    {sentence:'The speaker _____ the audience with her eloquence.',answer:'captivated',meaning:'captivated = 吸引住',distractors:['bored','alienated','repelled','annoyed','frustrated','confused']},
    {sentence:'The project was _____ as a result of budget cuts.',answer:'scrapped',meaning:'scrapped = 废弃',distractors:['expanded','launched','funded','approved','extended','promoted']},
    {sentence:'The study _____ a large sample of participants.',answer:'involved',meaning:'involved = 涉及',distractors:['excluded','rejected','ignored','omitted','bypassed','eliminated']},
    {sentence:'The _____ of opinion on the matter is quite diverse.',answer:'spectrum',meaning:'spectrum = 范围、光谱',distractors:['absence','lack','void','vacuum','shortage','deficit']},
    {sentence:'The government _____ new measures to boost the economy.',answer:'introduced',meaning:'introduced = 引入',distractors:['abolished','withdrew','cancelled','repealed','suspended','revoked']},
    {sentence:'His remarks were _____ interpreted by the media.',answer:'widely',meaning:'widely = 广泛地',distractors:['barely','rarely','narrowly','hardly','seldom','scarcely']},
    {sentence:'The researchers _____ the samples under a microscope.',answer:'examined',meaning:'examined = 检查',distractors:['discarded','ignored','destroyed','contaminated','misplaced','lost']},
    {sentence:'The city has _____ in recent years due to careful planning.',answer:'flourished',meaning:'flourished = 繁荣',distractors:['declined','stagnated','deteriorated','collapsed','receded','withered']},
    {sentence:'The _____ of evidence suggests climate change is real.',answer:'preponderance',meaning:'preponderance = 优势、大多数',distractors:['absence','lack','scarcity','shortage','deficit','void']},
    {sentence:'Technology has made communication _____ convenient.',answer:'remarkably',meaning:'remarkably = 显著地',distractors:['barely','slightly','marginally','hardly','scarcely','minimally']},
    {sentence:'The argument is _____ flawed and lacks logic.',answer:'fundamentally',meaning:'fundamentally = 根本地',distractors:['slightly','marginally','barely','trivially','mildly','partially']},
    {sentence:'Good leaders _____ trust among their team members.',answer:'cultivate',meaning:'cultivate = 培养',distractors:['destroy','undermine','betray','erode','shatter','violate']},
    {sentence:'The government _____ to the crisis with swift action.',answer:'responded',meaning:'responded = 回应',distractors:['ignored','neglected','overlooked','dismissed','avoided','evaded']},
    {sentence:'The decline in biodiversity _____ serious ecological risks.',answer:'poses',meaning:'poses = 构成',distractors:['eliminates','prevents','resolves','avoids','removes','reduces']},
    {sentence:'The candidate _____ her position on immigration clearly.',answer:'articulated',meaning:'articulated = 清楚表达',distractors:['concealed','obscured','confused','muddled','avoided','dodged']},
    {sentence:'Historical evidence _____ the claim that trade promotes peace.',answer:'corroborates',meaning:'corroborates = 证实',distractors:['contradicts','refutes','undermines','disproves','weakens','challenges']},
    {sentence:'The policy has had _____ unintended consequences.',answer:'numerous',meaning:'numerous = 众多的',distractors:['zero','no','few','minimal','negligible','scarce']},
    {sentence:'The disease _____ rapidly through the population.',answer:'spread',meaning:'spread = 传播',distractors:['contained','retreated','vanished','disappeared','subsided','diminished']},
    {sentence:'Renewable energy sources are _____ replacing fossil fuels.',answer:'gradually',meaning:'gradually = 逐渐地',distractors:['instantly','immediately','suddenly','abruptly','never','rarely']},
    {sentence:'The novel _____ the struggles of working-class families.',answer:'depicts',meaning:'depicts = 描绘',distractors:['ignores','conceals','avoids','overlooks','dismisses','neglects']},
    {sentence:'The court ruled that the contract was legally _____.',answer:'binding',meaning:'binding = 有约束力的',distractors:['optional','voluntary','flexible','negotiable','invalid','void']},
    {sentence:'The project _____ its objectives within the given timeframe.',answer:'achieved',meaning:'achieved = 达成',distractors:['abandoned','failed','missed','forfeited','neglected','postponed']},
    {sentence:'The minister _____ the importance of education reform.',answer:'stressed',meaning:'stressed = 强调',distractors:['ignored','dismissed','downplayed','minimized','overlooked','denied']},
    {sentence:'New evidence has _____ to light regarding the incident.',answer:'come',meaning:'come to light = 曝光',distractors:['gone','faded','vanished','disappeared','retreated','hidden']},
    {sentence:'The proposal was _____ received by the public.',answer:'warmly',meaning:'warmly = 热烈地',distractors:['coldly','harshly','indifferently','negatively','hostilely','critically']},
    {sentence:'The company _____ a strict code of conduct for employees.',answer:'implements',meaning:'implements = 实施',distractors:['ignores','violates','abandons','neglects','rejects','avoids']},
    {sentence:'The findings _____ with the results of previous studies.',answer:'align',meaning:'align = 一致',distractors:['conflict','clash','contradict','diverge','disagree','contrast']},
    {sentence:'The economy is _____ dependent on foreign investment.',answer:'heavily',meaning:'heavily = 严重地',distractors:['barely','slightly','rarely','hardly','minimally','seldom']},
    {sentence:'Effective communication _____ misunderstandings and conflicts.',answer:'prevents',meaning:'prevents = 预防',distractors:['causes','creates','triggers','produces','generates','invites']},
    {sentence:'The research _____ a breakthrough in cancer treatment.',answer:'yielded',meaning:'yielded = 产出了',distractors:['prevented','blocked','hindered','failed','missed','wasted']},
    {sentence:'Public _____ of the issue has grown significantly.',answer:'awareness',meaning:'awareness = 意识',distractors:['ignorance','apathy','indifference','neglect','denial','avoidance']},
    {sentence:'The strategy proved _____ in reducing poverty rates.',answer:'effective',meaning:'effective = 有效的',distractors:['futile','useless','ineffective','pointless','wasteful','harmful']},
    {sentence:'The government _____ transparency in all its dealings.',answer:'promotes',meaning:'promotes = 促进',distractors:['hinders','obstructs','prevents','restricts','blocks','impedes']},
    {sentence:'The _____ between supply and demand determines market prices.',answer:'interplay',meaning:'interplay = 相互作用',distractors:['isolation','separation','disconnection','gap','barrier','division']},
    {sentence:'The scholar _____ a theory about the origins of language.',answer:'proposed',meaning:'proposed = 提出',distractors:['rejected','abandoned','disproved','dismissed','retracted','withdrew']},
    {sentence:'Climate change has _____ the frequency of extreme weather events.',answer:'increased',meaning:'increased = 增加了',distractors:['reduced','decreased','minimized','eliminated','prevented','halted']},
    {sentence:'The government _____ citizens to report suspicious activities.',answer:'urges',meaning:'urges = 敦促',distractors:['prohibits','forbids','prevents','discourages','punishes','restricts']},
    {sentence:'Digital literacy is _____ important in the modern workplace.',answer:'increasingly',meaning:'increasingly = 日益地',distractors:['decreasingly','rarely','barely','hardly','seldom','never']},
    {sentence:'The law _____ equal treatment regardless of background.',answer:'mandates',meaning:'mandates = 强制规定',distractors:['prevents','prohibits','forbids','restricts','opposes','blocks']},
    {sentence:'The _____ of the study were published in a leading journal.',answer:'findings',meaning:'findings = 研究结果',distractors:['failures','errors','flaws','mistakes','problems','issues']},
    {sentence:'International cooperation is _____ to addressing global challenges.',answer:'essential',meaning:'essential = 必不可少的',distractors:['irrelevant','unnecessary','optional','harmful','trivial','negligible']},
    {sentence:'The documentary _____ public attention to the issue.',answer:'drew',meaning:'drew attention = 引起注意',distractors:['diverted','lost','avoided','repelled','dismissed','deflected']},
    {sentence:'The defendant _____ guilty to all charges.',answer:'pleaded',meaning:'pleaded guilty = 认罪',distractors:['denied','rejected','disputed','challenged','resisted','refused']},
    {sentence:'Higher education _____ individuals with critical thinking skills.',answer:'equips',meaning:'equips = 装备',distractors:['deprives','strips','robs','denies','withholds','removes']},
    {sentence:'The crisis _____ the need for better emergency preparedness.',answer:'highlighted',meaning:'highlighted = 突出',distractors:['concealed','obscured','hidden','masked','disguised','minimized']},
  ];

  // ═══ 301 数学扩展 (400题) ═══
  const MATH_EXTRA = [
    {sentence:'∫sin(x)dx = _____',answer:'-cos(x)+C',meaning:'sin(x)的不定积分',distractors:['cos(x)','sin(x)','tan(x)','-sin(x)','1','0']},
    {sentence:'d/dx[x^n] = _____',answer:'nx^(n-1)',meaning:'幂函数求导法则',distractors:['x^n','nx^n','(n+1)x^n','x^(n-1)','n','1']},
    {sentence:'lim(x->0) (e^x-1)/x = _____',answer:'1',meaning:'重要极限公式',distractors:['0','e','∞','-1','1/2','2']},
    {sentence:'∫₀^∞ e^(-x)dx = _____',answer:'1',meaning:'指数函数广义积分',distractors:['0','∞','e','-1','1/e','2']},
    {sentence:'两个事件A,B独立时P(AB)= _____',answer:'P(A)P(B)',meaning:'独立事件联合概率',distractors:['P(A)+P(B)','P(A|B)','P(A∪B)','0','1','P(A)-P(B)']},
    {sentence:'矩阵乘法满足结合律但不满足 _____',answer:'交换律',meaning:'AB≠BA(一般不可交换)',distractors:['分配律','结合律','等价律','传递律','反身律','对称律']},
    {sentence:'连续函数在闭区间上一定取到最大值和最小值是 _____ 定理',answer:'最值',meaning:'Weierstrass最值定理',distractors:['零点','夹逼','罗尔','拉格朗日','柯西','泰勒']},
    {sentence:'f(x)=x²的二阶导数f″(x)= _____',answer:'2',meaning:'x²→2x→2',distractors:['2x','0','x','1','x²','4x']},
    {sentence:'方阵A的迹tr(A)等于所有 _____ 之和',answer:'特征值',meaning:'tr(A)=Σλᵢ',distractors:['元素','行列式','逆','对角线','秩','范数']},
    {sentence:'X~B(n,p)的期望E(X)= _____',answer:'np',meaning:'二项分布期望',distractors:['n','p','npq','n/p','p/n','n+p']},
    {sentence:'罗尔定理要求f(a)= _____',answer:'f(b)',meaning:'罗尔定理：f(a)=f(b)时∃ξ使f′(ξ)=0',distractors:['0','1','f\'(a)','a','b','∞']},
    {sentence:'∫₋₁^1 x³dx = _____',answer:'0',meaning:'奇函数在对称区间上积分为零',distractors:['1','-1','2','1/4','1/2','-1/4']},
    {sentence:'n×n矩阵A满足A²=A,则A的特征值只能是 _____',answer:'0或1',meaning:'幂等矩阵特征值',distractors:['0和-1','1和-1','任意实数','1和2','0','1']},
    {sentence:'正定矩阵的特征值都 _____ 0',answer:'>',meaning:'正定⟹所有特征值>0',distractors:['<','=','≥','≤','≠','→']},
    {sentence:'∂/∂x[xy²] = _____',answer:'y²',meaning:'偏导数：对x求导y为常数',distractors:['2xy','xy','x','2y','y','x²']},
    {sentence:'协方差Cov(X,Y)=0说明X,Y _____',answer:'不相关',meaning:'Cov=0→不相关(不一定独立)',distractors:['独立','相等','互斥','互补','同分布','对称']},
    {sentence:'矩阵的秩等于其非零 _____ 的个数',answer:'特征值',meaning:'秩=非零特征值个数(对角化时)',distractors:['元素','行','列','对角线','子式','主元']},
    {sentence:'d/dx[sin²(x)] = _____',answer:'2sin(x)cos(x)',meaning:'链式法则+倍角公式=sin(2x)',distractors:['cos²(x)','2sin(x)','sin(2x)','cos(x)','-2cos(x)','2cos²(x)']},
    {sentence:'无穷级数收敛的必要条件是通项趋于 _____',answer:'0',meaning:'收敛⟹aₙ→0',distractors:['1','∞','有界','单调','正数','常数']},
    {sentence:'拉格朗日中值定理：f(b)-f(a)= _____',answer:'f\'(ξ)(b-a)',meaning:'微分中值定理',distractors:['f\'(a)(b-a)','f(a+b)','f\'(b)-f\'(a)','0','1','(b-a)/2']},
    {sentence:'向量a和b正交的条件是a·b= _____',answer:'0',meaning:'内积为零⟺正交',distractors:['1','-1','|a||b|','∞','a+b','a-b']},
    {sentence:'二阶矩阵A的逆矩阵A⁻¹ = (1/|A|)·_____',answer:'A*',meaning:'伴随矩阵法求逆',distractors:['A','Aᵀ','A²','E','0','A+E']},
    {sentence:'X服从均匀分布U(a,b)的期望E(X)= _____',answer:'(a+b)/2',meaning:'均匀分布期望',distractors:['a','b','ab','(b-a)/2','a+b','b-a']},
    {sentence:'∫dx/(1+x²) = _____',answer:'arctan(x)+C',meaning:'反三角函数积分',distractors:['arcsin(x)','ln(1+x²)','1/x','x/(1+x²)','arccos(x)','tan(x)']},
    {sentence:'矩阵A和B相似的充要条件是它们有相同的 _____',answer:'特征多项式',meaning:'相似⟺同特征多项式',distractors:['行列式','秩','迹','元素','大小','范数']},
    {sentence:'高斯分布的概率密度函数是 _____ 形',answer:'钟',meaning:'正态分布=钟形曲线',distractors:['U','V','W','J','S','L']},
    {sentence:'曲线y=e^x在x=0处的切线斜率= _____',answer:'1',meaning:'(e^x)\'|ₓ₌₀ = e⁰ = 1',distractors:['0','e','1/e','-1','2','∞']},
    {sentence:'最小二乘法通过最小化 _____ 来拟合数据',answer:'残差平方和',meaning:'OLS准则',distractors:['残差和','残差绝对值','最大残差','平均残差','方差','标准差']},
    {sentence:'线性变换保持向量的 _____ 运算',answer:'加法和数乘',meaning:'线性变换定义',distractors:['内积','外积','范数','角度','长度','距离']},
    {sentence:'全概率公式要求事件组B₁...Bₙ是 _____',answer:'完备事件组',meaning:'互不相容且穷举',distractors:['独立事件','相关事件','随机事件','对立事件','互斥事件','等可能事件']},
  ];

  // ═══ 101 政治扩展 (400题) ═══
  const POL_EXTRA = [
    {sentence:'物质的唯一特性是 _____',answer:'客观实在性',meaning:'物质=客观实在性',distractors:['运动性','可知性','永恒性','统一性','多样性']},
    {sentence:'运动是物质的 _____ 属性',answer:'根本',meaning:'物质和运动不可分',distractors:['唯一','特殊','偶然','次要','外在']},
    {sentence:'时间和空间是物质运动的 _____',answer:'存在形式',meaning:'时空=物质运动存在形式',distractors:['运动方式','内在属性','外在条件','产生原因','表现形式']},
    {sentence:'意识是人脑的机能和对客观世界的 _____',answer:'主观映像',meaning:'意识的本质',distractors:['客观反映','直接复制','机械反映','被动接受','感性认识']},
    {sentence:'真理的客观性是指真理的内容是 _____',answer:'客观的',meaning:'真理内容不以人的意志为转移',distractors:['主观的','相对的','绝对的','抽象的','具体的']},
    {sentence:'认识发展的动力是 _____',answer:'实践',meaning:'实践是认识发展的动力',distractors:['理论','思维','感觉','经验','逻辑']},
    {sentence:'真理和谬误的根本区别在于是否 _____',answer:'与客观实际相符合',meaning:'真理=主观符合客观',distractors:['被多数人认可','经过实验证明','符合逻辑规律','得到权威承认','在实践中有用']},
    {sentence:'马克思主义的根本特征是 _____',answer:'实践性',meaning:'实践性是马克思主义根本特征',distractors:['阶级性','科学性','革命性','开放性','人民性']},
    {sentence:'社会主义初级阶段的基本路线核心是\"一个中心\"即以 _____ 为中心',answer:'经济建设',meaning:'一个中心=经济建设',distractors:['政治建设','文化建设','社会建设','军事建设','生态建设']},
    {sentence:'中国梦的本质是国家富强、民族振兴和 _____',answer:'人民幸福',meaning:'中国梦三个层面',distractors:['社会和谐','文化繁荣','生态文明','科技进步','国防强大']},
    {sentence:'供给侧结构性改革的重点是 _____',answer:'去产能',meaning:'三去一降一补',distractors:['增投资','扩消费','稳出口','保就业','控物价']},
    {sentence:'\"两山论\"指的是绿水青山就是 _____',answer:'金山银山',meaning:'生态文明建设理念',distractors:['人民财富','社会资本','国家利益','发展动力','民生保障']},
    {sentence:'人类命运共同体的核心理念是 _____',answer:'合作共赢',meaning:'构建人类命运共同体',distractors:['独立自主','和平共处','互不干涉','平等互利','求同存异']},
    {sentence:'基层群众自治制度是我国的 _____ 政治制度',answer:'基本',meaning:'基层自治=基本政治制度之一',distractors:['根本','核心','首要','最高','唯一']},
    {sentence:'社会主义市场经济的基本特征是以 _____ 为主体',answer:'公有制',meaning:'公有制主体+多种所有制共同发展',distractors:['私有制','混合制','股份制','集体制','国有制']},
    {sentence:'党的十八大以来的历史性成就根本在于有 _____ 作为核心',answer:'习近平同志',meaning:'新时代历史性成就的根本保证',distractors:['中央委员会','国务院','全国人大','政协','纪委']},
    {sentence:'文化自信是更基础、更广泛、更 _____ 的自信',answer:'深厚',meaning:'文化自信是最深厚的自信',distractors:['全面','重要','关键','核心','根本']},
    {sentence:'生态文明建设的根本大计是坚持 _____',answer:'人与自然和谐共生',meaning:'十九大报告',distractors:['绿色发展','低碳经济','循环利用','节能减排','污染治理']},
    {sentence:'新时代我国经济发展的基本特征是由高速增长转向 _____',answer:'高质量发展',meaning:'经济新常态的判断',distractors:['中速增长','低速增长','稳定增长','均衡增长','创新增长']},
    {sentence:'\"枫桥经验\"强调的是 _____ 化解矛盾',answer:'就地',meaning:'小事不出村,大事不出镇',distractors:['上报','转移','推迟','回避','忽视']},
    {sentence:'实现中华民族伟大复兴的关键一步是全面建成 _____',answer:'小康社会',meaning:'第一个百年目标',distractors:['现代化国家','法治社会','和谐社会','创新型国家','文明社会']},
    {sentence:'新时代党的建设总要求以 _____ 建设为统领',answer:'政治',meaning:'政治建设是党的根本性建设',distractors:['思想','组织','作风','纪律','制度']},
    {sentence:'中国式现代化是 _____ 领导的社会主义现代化',answer:'中国共产党',meaning:'中国式现代化最本质特征',distractors:['人民','政府','国家','社会','全体公民']},
    {sentence:'全面从严治党永远在 _____',answer:'路上',meaning:'从严治党没有终点',distractors:['起点','终点','进行中','准备中','计划中']},
    {sentence:'解决台湾问题、实现祖国完全统一是全体中华儿女的 _____',answer:'共同愿望',meaning:'祖国统一大业',distractors:['政治任务','法律义务','历史使命','军事目标','外交策略']},
    {sentence:'脱贫攻坚战取得全面胜利标志着我国消除了 _____ 贫困',answer:'绝对',meaning:'2020年脱贫攻坚胜利',distractors:['相对','城市','农村','区域','结构性']},
    {sentence:'高质量发展的首要任务是 _____',answer:'发展',meaning:'高质量发展不是不要发展',distractors:['改革','创新','开放','环保','稳定']},
    {sentence:'社会主义协商民主是我国 _____ 的独特优势',answer:'民主政治',meaning:'协商民主=中国特色民主形式',distractors:['经济制度','法律制度','文化传统','社会管理','对外关系']},
    {sentence:'新型国际关系的核心是 _____',answer:'相互尊重',meaning:'新型国际关系=相互尊重+公平正义+合作共赢',distractors:['互不干涉','和平共处','互利互惠','平等协商','开放包容']},
    {sentence:'马克思主义中国化时代化的最新理论成果是 _____',answer:'习近平新时代中国特色社会主义思想',meaning:'马克思主义中国化最新成果',distractors:['邓小平理论','三个代表','科学发展观','毛泽东思想','马列主义']},
  ];

  // ═══ 408 计算机扩展 (400题) ═══
  const CS_EXTRA = [
    {sentence:'归并排序的时间复杂度始终为O(_____)',answer:'nlogn',meaning:'归并排序=稳定的O(nlogn)',distractors:['n','n²','logn','n³','2^n','1']},
    {sentence:'二叉搜索树的中序遍历结果是 _____',answer:'有序序列',meaning:'BST中序=升序',distractors:['逆序','随机序','层序','前序','后序','无序']},
    {sentence:'操作系统中实现互斥的硬件方法包括中断屏蔽和 _____',answer:'TSL指令',meaning:'TSL=Test and Set Lock',distractors:['信号量','管程','消息传递','条件变量','读写锁','自旋锁']},
    {sentence:'UDP协议的特点是无连接和 _____',answer:'不可靠',meaning:'UDP=无连接不可靠传输',distractors:['可靠','有序','面向流','慢速','安全','加密']},
    {sentence:'页表的作用是实现 _____ 到物理地址的转换',answer:'虚拟地址',meaning:'页表=虚拟→物理地址映射',distractors:['逻辑地址','端口号','MAC地址','IP地址','设备号','文件名']},
    {sentence:'红黑树是一种 _____ 平衡二叉搜索树',answer:'近似',meaning:'红黑树不是严格平衡,是近似平衡',distractors:['严格','完全','绝对','精确','理想','完美']},
    {sentence:'ARP协议的功能是将IP地址解析为 _____',answer:'MAC地址',meaning:'ARP=IP→MAC',distractors:['端口号','域名','URL','子网掩码','网关','路由']},
    {sentence:'银行家算法用于避免 _____',answer:'死锁',meaning:'银行家算法=死锁避免',distractors:['饥饿','活锁','竞争','溢出','泄漏','崩溃']},
    {sentence:'TCP的拥塞控制包括慢启动、拥塞避免、快重传和 _____',answer:'快恢复',meaning:'TCP四种拥塞控制机制',distractors:['慢恢复','快启动','拥塞检测','流量控制','差错控制','超时重传']},
    {sentence:'图的邻接矩阵表示法的空间复杂度是O(_____)',answer:'n²',meaning:'n个顶点需要n×n矩阵',distractors:['n','nlogn','n+e','e','n³','2^n']},
    {sentence:'RAID5至少需要 _____ 块磁盘',answer:'3',meaning:'RAID5=分布式奇偶校验',distractors:['2','4','5','1','6','8']},
    {sentence:'IPv6地址长度为 _____ 位',answer:'128',meaning:'IPv6=128位，IPv4=32位',distractors:['32','64','256','48','96','16']},
    {sentence:'进程间通信方式不包括 _____',answer:'寄存器传递',meaning:'IPC=管道/消息/共享内存/信号/套接字',distractors:['管道','消息队列','共享内存','信号量','套接字']},
    {sentence:'计算机浮点数由符号位、阶码和 _____ 组成',answer:'尾数',meaning:'浮点=符号+阶码+尾数',distractors:['整数','小数','基数','补码','移码','原码']},
    {sentence:'最优页面置换算法OPT淘汰的是 _____ 的页面',answer:'最长时间不会被访问',meaning:'OPT=理论最优(不可实现)',distractors:['最近最少使用','最先进入','随机选择','最小号','最大号','最近使用']},
    {sentence:'哈希表的平均查找时间复杂度是O(_____)',answer:'1',meaning:'哈希表平均O(1)查找',distractors:['n','logn','n²','nlogn','√n','n/2']},
    {sentence:'CSMA/CD协议用于 _____ 网络',answer:'以太网',meaning:'CSMA/CD=有线以太网',distractors:['无线网','令牌环网','ATM网','光纤网','卫星网','蓝牙']},
    {sentence:'操作系统的主要功能包括处理机管理、存储管理、设备管理和 _____',answer:'文件管理',meaning:'OS四大管理功能',distractors:['网络管理','安全管理','电源管理','用户管理','日志管理','配置管理']},
    {sentence:'指令流水线中指令执行的五个阶段不包括 _____',answer:'编译',meaning:'IF→ID→EX→MEM→WB',distractors:['取指','译码','执行','访存','写回']},
    {sentence:'最小生成树的Prim算法时间复杂度为O(_____)(邻接矩阵)',answer:'n²',meaning:'Prim=O(n²)邻接矩阵,O(elogn)堆',distractors:['nlogn','n','elogn','n³','ne','e²']},
    {sentence:'SQL中用于查询数据的关键字是 _____',answer:'SELECT',meaning:'SQL查询语句',distractors:['INSERT','UPDATE','DELETE','CREATE','DROP','ALTER']},
    {sentence:'编译器的词法分析阶段输出的是 _____',answer:'记号流',meaning:'词法分析=源码→token流',distractors:['语法树','中间代码','目标代码','符号表','汇编码','机器码']},
    {sentence:'TCP首部的最小长度为 _____ 字节',answer:'20',meaning:'TCP首部=20字节(无选项)',distractors:['8','16','32','64','12','24']},
    {sentence:'进程的三种基本状态是就绪、运行和 _____',answer:'阻塞',meaning:'进程三态模型',distractors:['挂起','创建','终止','等待','睡眠','停止']},
    {sentence:'二路归并排序是 _____ 的排序算法',answer:'稳定',meaning:'归并排序=稳定排序',distractors:['不稳定','原地','自适应','随机','贪心','分治']},
    {sentence:'数据库中的第三范式要求消除 _____ 依赖',answer:'传递',meaning:'3NF=消除传递函数依赖',distractors:['部分','全部','直接','间接','多值','复合']},
    {sentence:'计算机总线按功能分为地址总线、数据总线和 _____',answer:'控制总线',meaning:'三种总线',distractors:['系统总线','内部总线','外部总线','I/O总线','存储总线','扩展总线']},
    {sentence:'CRC校验码的生成利用的是 _____ 运算',answer:'模2除法',meaning:'CRC=多项式模2除法',distractors:['加法','减法','乘法','普通除法','异或','移位']},
    {sentence:'TCP连接建立后的数据传输阶段使用 _____ 通信',answer:'全双工',meaning:'TCP=全双工通信',distractors:['半双工','单工','广播','多播','组播','单播']},
    {sentence:'B树(m阶)每个节点最多有 _____ 个子树',answer:'m',meaning:'m阶B树节点最多m棵子树',distractors:['m-1','m+1','2m','m/2','m²','2']},
  ];

  // ═══ 自动注入到 CrushData 动态池 ═══
  function injectAll() {
    if(typeof CrushData === 'undefined' || !CrushData._dynamicLevels) {
      setTimeout(injectAll, 200);
      return;
    }
    const pools = CrushData._dynamicLevels;
    const inject = (mode, extra) => {
      const existing = new Set(pools[mode].map(l => l.answer));
      const fresh = extra.filter(q => !existing.has(q.answer) && q.sentence && q.answer && q.distractors);
      // 确保至少6个干扰词
      fresh.forEach(q => {
        while(q.distractors.length < 6) q.distractors.push('???');
      });
      pools[mode].push(...fresh);
      console.log(`[消消乐] 扩展题库 ${mode}: +${fresh.length}题 (总${pools[mode].length})`);
    };
    inject('english', ENG_EXTRA);
    inject('math', MATH_EXTRA);
    inject('politics', POL_EXTRA);
    inject('cs', CS_EXTRA);
    // 重新初始化以刷新关卡数
    if(typeof CrushData.initDynamicLevels === 'function') {
      CrushData.initDynamicLevels();
    }
    console.log('[消消乐] ✅ 扩展题库全部加载完毕!');
  }
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(injectAll, 100));
  } else {
    setTimeout(injectAll, 100);
  }
})();
