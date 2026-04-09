/**
 * Vocabulary Crush Data — v2.0
 * 三层关卡池: 内置 + 金库(Global_Vault) + Perplexity每日抓取
 * 4科全覆盖: 英语完形/数学填空/政治填空/计算机填空
 */
const CrushData = (() => {

  // ═══ 内置关卡池 ═══

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
    {sentence:'The company sought to _____ its market share through innovation.',
     answer:'expand', meaning:'expand = 扩大',
     distractors:['reduce','abandon','restrict','neglect','forfeit','diminish']},
    {sentence:'Her _____ knowledge of history impressed the professors.',
     answer:'profound', meaning:'profound = 深刻的',
     distractors:['shallow','trivial','limited','vague','cursory','modest']},
    {sentence:'The researchers _____ that the drug was effective.',
     answer:'concluded', meaning:'concluded = 结论是',
     distractors:['doubted','denied','rejected','ignored','disputed','refuted']},
    {sentence:'Climate change poses a _____ threat to biodiversity.',
     answer:'grave', meaning:'grave = 严重的',
     distractors:['minor','slight','trivial','modest','marginal','feeble']},
    {sentence:'The treaty was designed to _____ nuclear proliferation.',
     answer:'curb', meaning:'curb = 抑制、遏制',
     distractors:['promote','enable','trigger','permit','foster','amplify']},
    {sentence:'The government must _____ the needs of all citizens.',
     answer:'address', meaning:'address = 处理、解决',
     distractors:['neglect','bypass','dismiss','abandon','evade','shun']},
    {sentence:'The study revealed a _____ flaw in the methodology.',
     answer:'fundamental', meaning:'fundamental = 根本的',
     distractors:['minor','trivial','cosmetic','surface','peripheral','slight']},
    {sentence:'Economic growth has been _____ in recent years.',
     answer:'sluggish', meaning:'sluggish = 缓慢的',
     distractors:['rapid','robust','steady','booming','soaring','vibrant']},
    {sentence:'The proposal was met with _____ opposition from unions.',
     answer:'fierce', meaning:'fierce = 激烈的',
     distractors:['mild','weak','slight','passive','calm','gentle']},
    {sentence:'Scientists _____ the data to identify patterns.',
     answer:'analyzed', meaning:'analyzed = 分析',
     distractors:['ignored','destroyed','deleted','concealed','altered','forged']},
    {sentence:'The crisis _____ a fundamental change in policy.',
     answer:'necessitated', meaning:'necessitated = 使…成为必要',
     distractors:['prevented','hindered','blocked','impeded','avoided','delayed']},
    {sentence:'The phenomenon is _____ to this region.',
     answer:'peculiar', meaning:'peculiar = 特有的',
     distractors:['common','universal','typical','ordinary','standard','general']},
    {sentence:'The two theories are _____ incompatible.',
     answer:'inherently', meaning:'inherently = 内在地',
     distractors:['barely','slightly','rarely','hardly','partly','merely']},
    {sentence:'The medication can _____ symptoms but not cure the disease.',
     answer:'alleviate', meaning:'alleviate = 减轻',
     distractors:['worsen','intensify','provoke','aggravate','amplify','compound']},
    {sentence:'Research has _____ the link between diet and health.',
     answer:'established', meaning:'established = 确立',
     distractors:['disproved','weakened','severed','ignored','denied','refuted']},
    {sentence:'The article provides a _____ overview of the topic.',
     answer:'concise', meaning:'concise = 简洁的',
     distractors:['lengthy','verbose','rambling','tedious','vague','obscure']},
    {sentence:'The new policy will _____ take effect next month.',
     answer:'presumably', meaning:'presumably = 大概',
     distractors:['definitely','certainly','absolutely','undoubtedly','invariably','surely']},
    {sentence:'The success of the project _____ on adequate funding.',
     answer:'hinges', meaning:'hinges on = 取决于',
     distractors:['relies','builds','rests','feeds','hangs','leans']},
    {sentence:'Critics _____ that the plan is too ambitious.',
     answer:'contend', meaning:'contend = 主张、争论',
     distractors:['deny','accept','concede','approve','endorse','embrace']},
    {sentence:'The report _____ several areas for improvement.',
     answer:'identified', meaning:'identified = 识别出',
     distractors:['concealed','omitted','ignored','bypassed','overlooked','missed']},
    {sentence:'The _____ of this technology is still being debated.',
     answer:'feasibility', meaning:'feasibility = 可行性',
     distractors:['simplicity','popularity','necessity','extremity','toxicity','scarcity']},
    {sentence:'Cultural differences can _____ misunderstandings.',
     answer:'foster', meaning:'foster = 促进、助长',
     distractors:['prevent','resolve','avoid','reduce','suppress','eliminate']},
    {sentence:'The new regulation will _____ to all industries.',
     answer:'apply', meaning:'apply = 适用',
     distractors:['refer','relate','confine','restrict','limit','pertain']},
    {sentence:'The project was _____ due to a lack of resources.',
     answer:'suspended', meaning:'suspended = 暂停',
     distractors:['accelerated','promoted','expanded','launched','initiated','extended']},
    {sentence:'Experts _____ caution when interpreting the results.',
     answer:'urge', meaning:'urge = 敦促',
     distractors:['forbid','prohibit','prevent','discourage','oppose','reject']},
    {sentence:'The candidate demonstrated _____ leadership skills.',
     answer:'exceptional', meaning:'exceptional = 杰出的',
     distractors:['mediocre','average','ordinary','typical','moderate','adequate']},
    {sentence:'Environmental _____ has become a global priority.',
     answer:'sustainability', meaning:'sustainability = 可持续性',
     distractors:['destruction','exploitation','pollution','consumption','expansion','extraction']},
    {sentence:'The theory was _____ modified after new evidence emerged.',
     answer:'subsequently', meaning:'subsequently = 随后地',
     distractors:['previously','initially','originally','formerly','beforehand','already']},
    {sentence:'The invention _____ the course of human history.',
     answer:'altered', meaning:'altered = 改变了',
     distractors:['preserved','maintained','sustained','continued','retained','replicated']},
    {sentence:'The _____ between the two cultures led to rich artistic exchange.',
     answer:'interaction', meaning:'interaction = 互动交流',
     distractors:['isolation','separation','division','conflict','barrier','distance']},
    {sentence:'Students must _____ to the academic integrity policy.',
     answer:'adhere', meaning:'adhere = 遵守',
     distractors:['object','resist','violate','ignore','deviate','contradict']},
    {sentence:'The findings _____ previous assumptions about the topic.',
     answer:'challenged', meaning:'challenged = 质疑',
     distractors:['confirmed','validated','supported','endorsed','upheld','reinforced']},
    {sentence:'The government announced measures to _____ inflation.',
     answer:'combat', meaning:'combat = 对抗',
     distractors:['fuel','trigger','promote','encourage','sustain','welcome']},
    {sentence:'His argument lacks _____ and fails to convince.',
     answer:'coherence', meaning:'coherence = 连贯性',
     distractors:['length','volume','quantity','frequency','intensity','magnitude']},
    {sentence:'The conference _____ experts from around the world.',
     answer:'attracted', meaning:'attracted = 吸引',
     distractors:['repelled','excluded','deterred','rejected','dismissed','alienated']},
    {sentence:'The company aims to _____ a more diverse workforce.',
     answer:'cultivate', meaning:'cultivate = 培养',
     distractors:['dismiss','dissolve','abandon','neglect','disband','suppress']},
    {sentence:'Poverty remains a _____ issue in developing countries.',
     answer:'persistent', meaning:'persistent = 持续存在的',
     distractors:['temporary','fleeting','isolated','rare','sporadic','brief']},
    {sentence:'The regulation is intended to _____ consumer rights.',
     answer:'safeguard', meaning:'safeguard = 保护',
     distractors:['undermine','compromise','violate','restrict','infringe','neglect']},
    {sentence:'The study _____ the importance of early intervention.',
     answer:'underscored', meaning:'underscored = 强调',
     distractors:['downplayed','minimized','dismissed','overlooked','belittled','ignored']},
    {sentence:'Technological advances have _____ traditional industries.',
     answer:'disrupted', meaning:'disrupted = 颠覆',
     distractors:['preserved','sustained','maintained','stabilized','protected','reinforced']},
    {sentence:'The author presents a _____ argument for reform.',
     answer:'compelling', meaning:'compelling = 令人信服的',
     distractors:['weak','flawed','dubious','vague','incoherent','hollow']},
    {sentence:'The data _____ a strong correlation between the variables.',
     answer:'suggests', meaning:'suggests = 表明',
     distractors:['denies','refutes','contradicts','conceals','disproves','opposes']},
    {sentence:'The team managed to _____ a major crisis.',
     answer:'avert', meaning:'avert = 避免、防止',
     distractors:['cause','provoke','trigger','invite','create','generate']},
    {sentence:'We should _____ from making hasty judgments.',
     answer:'refrain', meaning:'refrain = 克制、避免',
     distractors:['proceed','continue','persist','insist','advance','hasten']},
    {sentence:'The policy aims to _____ economic inequality.',
     answer:'redress', meaning:'redress = 纠正',
     distractors:['deepen','widen','worsen','intensify','perpetuate','maintain']},
    {sentence:'Her contribution to the field is _____ significant.',
     answer:'immensely', meaning:'immensely = 极其地',
     distractors:['barely','mildly','slightly','marginally','moderately','partially']},
    {sentence:'The evidence was deemed _____ by the court.',
     answer:'inadmissible', meaning:'inadmissible = 不可采纳的',
     distractors:['credible','reliable','authentic','legitimate','acceptable','valid']},
    {sentence:'The project requires _____ between multiple departments.',
     answer:'collaboration', meaning:'collaboration = 合作',
     distractors:['competition','isolation','separation','rivalry','conflict','opposition']},
    {sentence:'The discovery has _____ implications for medicine.',
     answer:'far-reaching', meaning:'far-reaching = 深远的',
     distractors:['negligible','minimal','trivial','limited','marginal','minor']},
    {sentence:'Teachers play a _____ role in shaping young minds.',
     answer:'pivotal', meaning:'pivotal = 关键的',
     distractors:['minor','marginal','trivial','negligible','secondary','peripheral']},
    {sentence:'The economy has shown signs of _____.',
     answer:'recovery', meaning:'recovery = 复苏',
     distractors:['collapse','decline','stagnation','recession','contraction','downturn']},
    {sentence:'The committee will _____ the proposal next week.',
     answer:'deliberate', meaning:'deliberate = 审议',
     distractors:['reject','dismiss','abandon','ignore','discard','shelve']},
    {sentence:'The findings are _____ with previous research.',
     answer:'consistent', meaning:'consistent = 一致的',
     distractors:['conflicting','contradictory','incompatible','inconsistent','divergent','opposing']},
    {sentence:'His views are considered _____ by mainstream scholars.',
     answer:'controversial', meaning:'controversial = 有争议的',
     distractors:['conventional','orthodox','mainstream','traditional','accepted','established']},
    {sentence:'The government _____ new regulations to protect wildlife.',
     answer:'enacted', meaning:'enacted = 颁布',
     distractors:['repealed','abolished','revoked','cancelled','withdrew','suspended']},
    {sentence:'The problem _____ a creative approach to solve.',
     answer:'demands', meaning:'demands = 要求',
     distractors:['rejects','avoids','prevents','excludes','resists','opposes']},
    {sentence:'The gap between theory and _____ remains wide.',
     answer:'practice', meaning:'practice = 实践',
     distractors:['concept','notion','belief','thought','opinion','hypothesis']},
    {sentence:'The report was _____ criticized for its methodology.',
     answer:'extensively', meaning:'extensively = 广泛地',
     distractors:['briefly','mildly','barely','slightly','rarely','seldom']},
    {sentence:'The vaccine has proven to be _____ effective.',
     answer:'remarkably', meaning:'remarkably = 显著地',
     distractors:['barely','slightly','marginally','moderately','mildly','partially']},
    {sentence:'Failure to _____ with regulations may result in fines.',
     answer:'comply', meaning:'comply = 遵守',
     distractors:['agree','accept','consent','approve','permit','admit']},
    {sentence:'The research _____ new light on the origins of the disease.',
     answer:'shed', meaning:'shed light on = 阐明',
     distractors:['cast','threw','lost','hid','blocked','dimmed']},
    {sentence:'Social media has _____ the spread of misinformation.',
     answer:'facilitated', meaning:'facilitated = 促进了',
     distractors:['prevented','blocked','hindered','restricted','impeded','curbed']},
    {sentence:'The author draws a _____ between two historical events.',
     answer:'parallel', meaning:'draw a parallel = 做类比',
     distractors:['contrast','conflict','barrier','division','boundary','limit']},
    {sentence:'The proposal was _____ rejected by the committee.',
     answer:'unanimously', meaning:'unanimously = 一致地',
     distractors:['partially','reluctantly','hesitantly','narrowly','barely','tentatively']},
    {sentence:'Globalization has _____ cultural boundaries.',
     answer:'blurred', meaning:'blurred = 模糊了',
     distractors:['defined','sharpened','reinforced','strengthened','clarified','solidified']},
    {sentence:'The new system is designed to _____ efficiency.',
     answer:'enhance', meaning:'enhance = 增强',
     distractors:['reduce','diminish','impair','undermine','weaken','compromise']},
    {sentence:'His behavior was _____ inappropriate.',
     answer:'deemed', meaning:'deemed = 被认为',
     distractors:['proven','found','shown','declared','labeled','branded']},
    {sentence:'The study _____ a sample of 500 participants.',
     answer:'comprised', meaning:'comprised = 由…组成',
     distractors:['excluded','rejected','eliminated','omitted','lacked','missed']},
    {sentence:'The two countries established _____ ties.',
     answer:'diplomatic', meaning:'diplomatic = 外交的',
     distractors:['hostile','aggressive','toxic','combative','adversarial','militant']},
    {sentence:'The policy had _____ consequences for the economy.',
     answer:'adverse', meaning:'adverse = 不利的',
     distractors:['positive','beneficial','favorable','welcome','harmless','neutral']},
    {sentence:'The organization _____ to promote human rights.',
     answer:'strives', meaning:'strives = 努力',
     distractors:['refuses','declines','hesitates','neglects','fails','ceases']},
    {sentence:'The region is _____ rich in natural resources.',
     answer:'abundantly', meaning:'abundantly = 丰富地',
     distractors:['barely','scarcely','slightly','modestly','poorly','sparsely']},
    {sentence:'The decision will _____ affect millions of people.',
     answer:'inevitably', meaning:'inevitably = 不可避免地',
     distractors:['rarely','hardly','barely','seldom','unlikely','scarcely']},
    {sentence:'The speaker made a _____ plea for peace.',
     answer:'passionate', meaning:'passionate = 充满激情的',
     distractors:['indifferent','apathetic','lukewarm','casual','detached','passive']},
    {sentence:'The theory was _____ by later experiments.',
     answer:'validated', meaning:'validated = 验证',
     distractors:['disproved','refuted','invalidated','challenged','denied','debunked']},
    {sentence:'Access to education is a _____ right.',
     answer:'fundamental', meaning:'fundamental = 基本的',
     distractors:['optional','luxury','secondary','peripheral','marginal','trivial']},
    {sentence:'The document _____ the terms of the agreement.',
     answer:'stipulates', meaning:'stipulates = 规定',
     distractors:['ignores','omits','violates','contradicts','overrides','bypasses']},
    {sentence:'The incident _____ widespread public outrage.',
     answer:'provoked', meaning:'provoked = 引发',
     distractors:['suppressed','calmed','soothed','prevented','pacified','appeased']},
    {sentence:'The company has _____ its commitment to sustainability.',
     answer:'reaffirmed', meaning:'reaffirmed = 重申',
     distractors:['abandoned','retracted','withdrew','reversed','denied','rejected']},
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
    {sentence:'d/dx[ln(x)] = _____', answer:'1/x', meaning:'ln(x)的导数',
     distractors:['x','ln(x)','e^x','1','x^2','0']},
    {sentence:'∫e^x dx = _____', answer:'e^x+C', meaning:'e^x的不定积分',
     distractors:['xe^x','e^x/x','ln(x)','x','1','e']},
    {sentence:'lim(x->∞)(1+1/x)^x = _____', answer:'e', meaning:'第二重要极限',
     distractors:['1','∞','0','pi','2','1/e']},
    {sentence:'n阶方阵A可逆的充要条件是|A| _____ 0', answer:'≠', meaning:'行列式不为零⟺可逆',
     distractors:['=','>','<','≥','≤','→']},
    {sentence:'正态分布N(μ,σ²)中，P(|X-μ|<σ)≈_____', answer:'68.3%', meaning:'一个标准差覆盖68.3%',
     distractors:['95.4%','99.7%','50%','75%','90%','80%']},
    {sentence:'二阶矩阵[[a,b],[c,d]]的行列式= _____', answer:'ad-bc', meaning:'2×2行列式公式',
     distractors:['ac-bd','ab-cd','a+d','a-d','abcd','ac+bd']},
    {sentence:'级数∑(1/n)发散，∑(1/n²) _____', answer:'收敛', meaning:'p级数：p>1收敛，p≤1发散',
     distractors:['发散','振荡','不确定','趋于0','趋于∞','条件收敛']},
    {sentence:'设f(x)连续，F(x)=∫₀ˣf(t)dt，则F\'(x)= _____', answer:'f(x)', meaning:'变上限积分求导=被积函数',
     distractors:['F(x)','f\'(x)','0','1','∫f(x)','f(0)']},
    {sentence:'向量组线性相关的充要条件是齐次方程有 _____', answer:'非零解', meaning:'Ax=0有非零解⟺列向量线性相关',
     distractors:['零解','唯一解','无穷解','特解','通解','矛盾']},
    {sentence:'泊松分布的期望和方差都等于 _____', answer:'λ', meaning:'X~P(λ): E(X)=D(X)=λ',
     distractors:['μ','σ','σ²','0','1','n']},
    {sentence:'多元函数可微的必要条件是各 _____ 存在', answer:'偏导数', meaning:'可微⇒偏导存在(反之不然)',
     distractors:['极限','连续','方向导数','梯度','全导','高阶导']},
    {sentence:'格林公式将平面区域上的二重积分转化为 _____ 积分', answer:'曲线', meaning:'Green公式连接二重积分与曲线积分',
     distractors:['三重','面积','体积','路径','弧长','法向']},
    {sentence:'实对称矩阵的特征值都是 _____', answer:'实数', meaning:'实对称矩阵特征值必为实数',
     distractors:['正数','整数','复数','有理数','自然数','负数']},
    {sentence:'D(aX+b) = _____', answer:'a²D(X)', meaning:'方差性质：D(aX+b)=a²D(X)',
     distractors:['aD(X)','D(X)+b','a²D(X)+b','aD(X)+b','D(X)','a+b']},
    {sentence:'隐函数存在定理要求F\'y _____ 0', answer:'≠', meaning:'F(x,y)=0, Fy≠0则y=f(x)存在',
     distractors:['=','>','<','≥','≤','→']},
    {sentence:'矩阵A的转置的行列式等于 _____', answer:'|A|', meaning:'|Aᵀ|=|A|',
     distractors:['|A|⁻¹','-|A|','0','1','|A|²','tr(A)']},
    {sentence:'E(X²)-[E(X)]² = _____', answer:'D(X)', meaning:'方差公式D(X)=E(X²)-[E(X)]²',
     distractors:['E(X)','E(X²)','σ','μ','0','1']},
    {sentence:'曲面z=f(x,y)在点P处的法向量可由 _____ 确定', answer:'梯度', meaning:'法向量=(fx,fy,-1)',
     distractors:['切线','导数','极值','积分','曲率','散度']},
    {sentence:'∫₀^π sin(x)dx = _____', answer:'2', meaning:'sin(x)在[0,π]上的定积分',
     distractors:['0','1','π','-1','-2','π/2']},
    {sentence:'n维向量空间的基由 _____ 个线性无关向量组成', answer:'n', meaning:'n维空间的基恰好n个向量',
     distractors:['n-1','n+1','2n','1','∞','n²']},
    {sentence:'条件概率P(A|B) = P(AB)/_____ ', answer:'P(B)', meaning:'条件概率公式',
     distractors:['P(A)','P(A∪B)','1','P(B|A)','P(Ā)','P(B̄)']},
    {sentence:'f(x)在x₀处取极值的必要条件是f\'(x₀)= _____', answer:'0', meaning:'费马引理：极值点导数为零',
     distractors:['1','-1','∞','f(x₀)','不存在','x₀']},
    {sentence:'A×A⁻¹ = _____', answer:'E', meaning:'可逆矩阵乘其逆=单位矩阵E',
     distractors:['A','0','A²','2A','I-A','Aᵀ']},
    {sentence:'中心极限定理说明大量独立变量之和近似服从 _____ 分布', answer:'正态', meaning:'CLT: 大数和趋向正态',
     distractors:['均匀','指数','泊松','二项','几何','卡方']},
    {sentence:'Cauchy-Schwarz不等式: |E(XY)|² ≤ E(X²)·_____', answer:'E(Y²)', meaning:'柯西-施瓦茨不等式',
     distractors:['E(Y)','D(Y)','[E(Y)]²','E(XY)','1','E(X)']},
    {sentence:'曲线y=x³的拐点坐标是 _____', answer:'(0,0)', meaning:'y"=6x=0 → x=0为拐点',
     distractors:['(1,1)','(-1,-1)','(0,1)','(1,0)','不存在','(2,8)']},
    {sentence:'齐次线性方程组Ax=0有非零解⟺r(A) _____ n', answer:'<', meaning:'秩小于未知数个数时有非零解',
     distractors:['=','>','≤','≥','≠','→']},
  ];

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
    {sentence:'矛盾的两个基本属性是同一性和 _____',answer:'斗争性',meaning:'矛盾=同一性+斗争性',distractors:['统一性','普遍性','特殊性','相对性','绝对性']},
    {sentence:'辩证否定的实质是 _____',answer:'扬弃',meaning:'辩证否定=扬弃(既克服又保留)',distractors:['全盘否定','绝对肯定','简单抛弃','完全继承','彻底革命']},
    {sentence:'量变和质变的关系是量变是质变的 _____',answer:'必要准备',meaning:'量变→质变→新的量变',distractors:['充分条件','唯一原因','直接结果','根本目的','外在表现']},
    {sentence:'历史唯物主义认为社会发展的决定力量是 _____',answer:'生产力',meaning:'生产力是最终决定力量',distractors:['生产关系','上层建筑','阶级斗争','科学技术','英雄人物']},
    {sentence:'毛泽东思想活的灵魂是实事求是、群众路线和 _____',answer:'独立自主',meaning:'毛泽东思想三个活的灵魂',distractors:['武装斗争','统一战线','党的建设','自力更生','艰苦奋斗']},
    {sentence:'邓小平理论的精髓是 _____',answer:'解放思想实事求是',meaning:'邓小平理论精髓',distractors:['改革开放','四项基本原则','科学发展','三个代表','和平发展']},
    {sentence:'"三个代表"重要思想的核心观点不包括代表 _____',answer:'先进军事力量',meaning:'三个代表=先进生产力+先进文化+最广大人民利益',distractors:['先进生产力','先进文化','最广大人民利益','社会进步','人民群众']},
    {sentence:'科学发展观的核心立场是 _____',answer:'以人为本',meaning:'科学发展观=以人为本',distractors:['全面发展','协调发展','可持续发展','统筹兼顾','改革创新']},
    {sentence:'新发展理念不包括 _____',answer:'速度优先',meaning:'新发展理念=创新协调绿色开放共享',distractors:['创新','协调','绿色','开放','共享']},
    {sentence:'人民代表大会制度是我国的根本 _____',answer:'政治制度',meaning:'人民代表大会制度=根本政治制度',distractors:['经济制度','文化制度','法律制度','社会制度','军事制度']},
    {sentence:'中国共产党的根本组织原则是 _____',answer:'民主集中制',meaning:'民主集中制=党的根本组织原则',distractors:['集体领导','个人分工','少数服从多数','一人一票','协商民主']},
    {sentence:'马克思主义政治经济学认为，商品的二因素是使用价值和 _____',answer:'价值',meaning:'商品=使用价值+价值(二因素)',distractors:['交换价值','价格','成本','利润','效用']},
    {sentence:'五四运动标志着中国 _____ 的开端',answer:'新民主主义革命',meaning:'五四=新民主主义革命起点',distractors:['旧民主主义革命','社会主义革命','资产阶级革命','无产阶级专政','改革开放']},
    {sentence:'遵义会议的意义是确立了 _____ 的正确领导',answer:'毛泽东',meaning:'遵义会议=生死攸关转折点',distractors:['周恩来','朱德','王稼祥','张闻天','陈独秀']},
    {sentence:'社会主义核心价值观个人层面包括爱国、敬业、诚信和 _____',answer:'友善',meaning:'个人层面:爱国敬业诚信友善',distractors:['自由','平等','公正','法治','文明']},
    {sentence:'全面建设社会主义现代化国家的首要任务是 _____',answer:'高质量发展',meaning:'二十大报告明确提出',distractors:['改革开放','科技创新','乡村振兴','共同富裕','绿色发展']},
    {sentence:'"两个维护"中的核心是维护习近平总书记的 _____',answer:'核心地位',meaning:'两个维护的核心内容',distractors:['最高权力','绝对权威','领导地位','指挥权','决策权']},
    {sentence:'中华民族精神的核心是 _____',answer:'爱国主义',meaning:'民族精神核心=爱国主义',distractors:['集体主义','社会主义','共产主义','改革创新','自强不息']},
    {sentence:'改革开放是决定当代中国命运的 _____',answer:'关键一招',meaning:'改革开放=关键一招(邓小平)',distractors:['唯一出路','最终目标','基本原则','根本方针','核心战略']},
    {sentence:'全过程人民民主是社会主义民主政治的 _____',answer:'本质属性',meaning:'二十大报告提出',distractors:['基本形式','外在特征','具体方式','发展阶段','历史产物']},
    {sentence:'共同富裕是社会主义的 _____',answer:'本质要求',meaning:'共同富裕=社会主义本质要求',distractors:['最终目标','基本原则','核心内容','初级阶段','远大理想']},
    {sentence:'意识形态工作是党的一项极端 _____ 的工作',answer:'重要',meaning:'意识形态工作极端重要',distractors:['复杂','困难','基础','特殊','艰巨']},
    {sentence:'总体国家安全观的根本是 _____',answer:'政治安全',meaning:'政治安全是根本',distractors:['经济安全','军事安全','文化安全','社会安全','网络安全']},
    {sentence:'「一带一路」的原则是共商共建 _____',answer:'共享',meaning:'一带一路三原则',distractors:['共赢','共治','共存','共进','共融']},
    {sentence:'依法治国首先是依 _____ 治国',answer:'宪',meaning:'依法治国首先依宪治国',distractors:['法','规','律','令','章']},
    {sentence:'「四个自信」不包括 _____',answer:'军事自信',meaning:'四个自信=道路+理论+制度+文化',distractors:['道路自信','理论自信','制度自信','文化自信','历史自信']},
    {sentence:'乡村振兴战略的总要求中排在第一位的是 _____',answer:'产业兴旺',meaning:'产业兴旺+生态宜居+乡风文明+治理有效+生活富裕',distractors:['生态宜居','乡风文明','治理有效','生活富裕','脱贫攻坚']},
    {sentence:'中国式现代化的本质要求的首要内容是坚持 _____',answer:'党的领导',meaning:'中国式现代化本质要求',distractors:['人民至上','改革开放','科技创新','共同富裕','绿色发展']},
  ];

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
    {sentence:'二叉树第i层最多有 _____ 个节点',answer:'2^(i-1)',meaning:'二叉树第i层最多2^(i-1)个节点',distractors:['2^i','i','2i','i^2','2^(i+1)','i-1']},
    {sentence:'堆排序的时间复杂度为 O(_____)',answer:'nlogn',meaning:'堆排序=建堆O(n)+n次调整O(logn)',distractors:['n','n²','logn','nlog²n','n³','1']},
    {sentence:'图的深度优先遍历使用的数据结构是 _____',answer:'栈',meaning:'DFS用栈，BFS用队列',distractors:['队列','堆','数组','链表','哈希表','树']},
    {sentence:'TCP使用 _____ 次挥手断开连接',answer:'四',meaning:'TCP四次挥手:FIN→ACK→FIN→ACK',distractors:['二','三','五','一','六','零']},
    {sentence:'页面置换算法LRU淘汰的是 _____ 页面',answer:'最近最久未使用',meaning:'LRU=Least Recently Used',distractors:['最先进入','随机选择','使用次数最少','最大号','最小号','最近使用']},
    {sentence:'AVL树是一种 _____ 二叉搜索树',answer:'平衡',meaning:'AVL=自平衡BST，高度差≤1',distractors:['完全','满','完美','最优','最小','随机']},
    {sentence:'DNS解析通常使用 _____ 协议',answer:'UDP',meaning:'DNS默认UDP端口53',distractors:['TCP','HTTP','FTP','SMTP','ICMP','ARP']},
    {sentence:'冯·诺依曼体系结构的核心思想是 _____',answer:'存储程序',meaning:'程序和数据存储在内存中',distractors:['并行计算','流水线','虚拟化','分时复用','中断驱动','微程序']},
    {sentence:'进程状态转换中，就绪→运行是由 _____ 完成的',answer:'调度程序',meaning:'进程调度器选择就绪进程运行',distractors:['用户程序','中断','硬件','编译器','加载器','链接器']},
    {sentence:'子网掩码的作用是区分IP地址中的网络号和 _____',answer:'主机号',meaning:'子网掩码划分网络号和主机号',distractors:['端口号','协议号','版本号','序列号','校验码','标志位']},
    {sentence:'散列冲突的处理方法中，开放定址法不包括 _____',answer:'链地址法',meaning:'开放定址=线性/二次/双散列探测',distractors:['线性探测','二次探测','双散列','再散列','伪随机','顺序探测']},
    {sentence:'操作系统中的信号量P操作会使信号量值 _____',answer:'减1',meaning:'P操作=wait，S=S-1',distractors:['加1','置0','置1','不变','翻转','清零']},
    {sentence:'Cache和主存之间的地址映射方式中，冲突最少的是 _____',answer:'全相联',meaning:'全相联=任意映射，冲突最少',distractors:['直接映射','组相联','段页式','固定映射','随机映射','散列映射']},
    {sentence:'Dijkstra算法用于求 _____ 最短路径',answer:'单源',meaning:'Dijkstra=单源最短路(非负权)',distractors:['多源','全局','无向','有向','加权','最长']},
    {sentence:'计算机中补码表示法的优点是统一了 _____ 的处理',answer:'加减法',meaning:'补码使加减法统一为加法',distractors:['乘除法','逻辑运算','移位','比较','取反','存储']},
    {sentence:'关系数据库中，表的每一行称为一个 _____',answer:'元组',meaning:'行=元组(tuple)，列=属性',distractors:['属性','域','码','键','视图','索引']},
    {sentence:'HTTPS在HTTP基础上加入了 _____ 协议',answer:'SSL/TLS',meaning:'HTTPS=HTTP+SSL/TLS加密',distractors:['SSH','IPSec','PPTP','L2TP','WPA','AES']},
    {sentence:'中断响应过程中，CPU首先做的是 _____',answer:'保护现场',meaning:'中断→保护现场→中断服务→恢复现场',distractors:['恢复现场','执行程序','刷新内存','清空缓存','加载指令','切换模式']},
    {sentence:'拓扑排序要求图是有向 _____ 图',answer:'无环',meaning:'DAG=有向无环图才能拓扑排序',distractors:['有环','连通','完全','二部','平面','稠密']},
    {sentence:'虚拟存储器的最大容量由 _____ 的位数决定',answer:'地址总线',meaning:'虚存大小=地址空间大小',distractors:['数据总线','控制总线','内存容量','硬盘容量','CPU频率','缓存大小']},
    {sentence:'KMP算法的时间复杂度为 O(_____)',answer:'m+n',meaning:'KMP=O(m+n)，m=模式长度，n=文本长度',distractors:['mn','n²','m²','nlogn','n','m']},
    {sentence:'磁盘调度算法SCAN又称为 _____ 算法',answer:'电梯',meaning:'SCAN=电梯算法，单向扫描',distractors:['最短寻道','先来先服','循环扫描','随机选择','最近优先','最远优先']},
    {sentence:'TCP的流量控制使用的是 _____ 机制',answer:'滑动窗口',meaning:'TCP用滑动窗口控制流量',distractors:['令牌桶','漏桶','拥塞避免','慢启动','快重传','快恢复']},
    {sentence:'数据链路层的差错控制主要使用 _____ 校验',answer:'CRC',meaning:'CRC=循环冗余校验，数据链路层常用',distractors:['奇偶','海明','校验和','MD5','SHA','AES']},
    {sentence:'完全二叉树的n个节点中，叶子节点数为 _____',answer:'⌈n/2⌉',meaning:'完全二叉树叶子数=⌈n/2⌉',distractors:['n/2','n-1','n+1','⌊n/2⌋','logn','2n']},
    {sentence:'OSPF协议属于 _____ 路由算法',answer:'链路状态',meaning:'OSPF=链路状态，RIP=距离向量',distractors:['距离向量','路径向量','泛洪','源路由','默认','静态']},
    {sentence:'流水线中的数据冒险可以通过 _____ 技术解决',answer:'转发',meaning:'数据转发(forwarding)解决数据冒险',distractors:['分支预测','延迟槽','重排序','缓存','预取','旁路']},
    {sentence:'文件系统中，i-node存储的是文件的 _____',answer:'元数据',meaning:'inode=文件属性(非文件名)',distractors:['文件名','文件内容','目录项','路径','扩展名','后缀']},
  ];

  const COLORS = ['c0','c1','c2','c3','c4','c5'];
  const GRID_SIZE = 6;
  const MOVES_PER_LEVEL = 35;
  const TARGET_MATCHES = 3;
  const QUESTIONS_PER_LEVEL = 5;

  // ═══ 动态关卡池（金库 + Perplexity 注入） ═══
  const _dynamicLevels = { english:[], math:[], politics:[], cs:[] };

  function _getBuiltinPool(mode) {
    if(mode === 'math') return MATH_LEVELS;
    if(mode === 'politics') return POLITICS_LEVELS;
    if(mode === 'cs') return CS_LEVELS;
    return ENGLISH_LEVELS;
  }

  function _getMergedPool(mode) {
    return [..._getBuiltinPool(mode), ..._dynamicLevels[mode]];
  }

  // ═══ 唯一的 getLevel (多题束制) ═══
  function getLevel(mode, idx) {
    const pool = _getMergedPool(mode);
    const startIdx = idx * QUESTIONS_PER_LEVEL;
    if(startIdx >= pool.length) return null;
    // 每关抽取 QUESTIONS_PER_LEVEL 题，不足则有多少用多少
    const questions = pool.slice(startIdx, startIdx + QUESTIONS_PER_LEVEL);
    if(questions.length === 0) return null;
    // 第一题作为当前活动题，其余备用
    const first = questions[0];
    return {
      ...first,
      index: idx,
      moves: MOVES_PER_LEVEL,
      questions: questions,
      questionIndex: 0,
      totalQuestions: questions.length
    };
  }

  function getTotalLevels(mode) {
    const pool = _getMergedPool(mode);
    return Math.ceil(pool.length / QUESTIONS_PER_LEVEL);
  }

  function buildGrid(level) {
    const grid = [];
    const allWords = [level.answer, ...level.distractors];
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
    while(targets.length > TARGET_MATCHES + 2){
      const t = targets.pop();
      const distractor = level.distractors[Math.floor(Math.random()*level.distractors.length)];
      t.word = distractor;
      t.isTarget = false;
      t.color = COLORS[allWords.indexOf(distractor) % COLORS.length];
    }
    return grid;
  }

  function wouldMatch(grid, currentRow, r, c, word) {
    if(c >= 2 && currentRow[c-1] && currentRow[c-2] &&
       currentRow[c-1].word === word && currentRow[c-2].word === word) return true;
    if(r >= 2 && grid[r-1] && grid[r-2] &&
       grid[r-1][c].word === word && grid[r-2][c].word === word) return true;
    return false;
  }

  // ═══ 金库对接: 从 Global_Vault 读取并转换为消消乐关卡 ═══
  function _loadVaultLevels() {
    const subjMap = {english:'201', math:'301', politics:'101', cs:'408'};
    for(const [mode, subCode] of Object.entries(subjMap)) {
      try {
        const raw = localStorage.getItem('Global_Vault_' + subCode);
        if(!raw) continue;
        const vaultQ = JSON.parse(raw);
        if(!Array.isArray(vaultQ)) continue;

        const converted = vaultQ.filter(q => {
          // 过滤有效题目
          const stem = q.q || q.stem || '';
          return stem.length > 5;
        }).map(q => {
          const stem = q.q || q.stem || '';
          const opts = q.o || q.options || [];
          const ansIdx = typeof q.a === 'number' ? q.a : 0;
          const analysis = q.analysis || q.explain || '';

          if(opts.length >= 3) {
            // 有选项的题 → 转为填空题
            const answer = (opts[ansIdx] || opts[0] || '').replace(/^[A-D][\.、\s]+/, '').trim();
            const distractors = opts.filter((_,i) => i !== ansIdx)
              .map(o => (o||'').replace(/^[A-D][\.、\s]+/, '').trim())
              .filter(d => d.length > 0);
            // 将题干中的答案替换为空格，或直接在末尾加空格
            let sentence = stem;
            if(sentence.includes(answer)) {
              sentence = sentence.replace(answer, '_____');
            } else if(!sentence.includes('_____')) {
              sentence = sentence + ' → _____';
            }
            // 确保至少6个干扰词
            while(distractors.length < 6) {
              distractors.push(_randomFiller(mode));
            }
            return {
              sentence, answer, meaning: analysis || `${answer}`,
              distractors: distractors.slice(0,6),
              fromVault: true
            };
          }
          return null;
        }).filter(Boolean);

        if(converted.length > 0) {
          // 去重: 检查题干前30字符
          const existing = new Set(_dynamicLevels[mode].map(l => l.sentence.slice(0,30)));
          const builtin = new Set(_getBuiltinPool(mode).map(l => l.sentence.slice(0,30)));
          const fresh = converted.filter(l => !existing.has(l.sentence.slice(0,30)) && !builtin.has(l.sentence.slice(0,30)));
          _dynamicLevels[mode].push(...fresh);
          if(fresh.length > 0) console.log(`[消消乐] 金库 ${subCode} → 加载 +${fresh.length} 关 (${mode})`);
        }
      } catch(e) { console.warn(`[消消乐] 金库读取失败 (${mode}):`, e.message); }
    }
  }

  // ═══ Perplexity每日关卡加载 ═══
  function _loadPerplexityLevels() {
    const subjMap = {english:'201', math:'301', politics:'101', cs:'408'};
    for(const [mode, subCode] of Object.entries(subjMap)) {
      try {
        const key = 'Siege_Levels_' + subCode;
        const raw = localStorage.getItem(key);
        if(!raw) continue;
        const levels = JSON.parse(raw);
        if(!Array.isArray(levels)) continue;

        const valid = levels.filter(l => l.sentence && l.answer && l.distractors).map(l => ({
          sentence: l.sentence,
          answer: l.answer,
          meaning: l.meaning || l.answer,
          distractors: (l.distractors || []).slice(0,6),
          fromPerplexity: true
        }));

        if(valid.length > 0) {
          const existing = new Set(_dynamicLevels[mode].map(l => l.sentence.slice(0,30)));
          const builtin = new Set(_getBuiltinPool(mode).map(l => l.sentence.slice(0,30)));
          const fresh = valid.filter(l => !existing.has(l.sentence.slice(0,30)) && !builtin.has(l.sentence.slice(0,30)));
          _dynamicLevels[mode].push(...fresh);
          if(fresh.length > 0) console.log(`[消消乐] Perplexity ${subCode} → 加载 +${fresh.length} 关 (${mode})`);
        }
      } catch(e) {}
    }
  }

  // 随机填充词（确保干扰词数量足够）
  function _randomFiller(mode) {
    const fillers = {
      english: ['however','therefore','moreover','although','despite','regarding','meanwhile','consequently'],
      math: ['x','y','0','1','2','n+1','∞','π'],
      politics: ['唯心主义','形而上学','机械唯物','经验主义','教条主义','修正主义'],
      cs: ['O(1)','O(n)','栈','队列','链表','哈希','二叉树','图']
    };
    const f = fillers[mode] || fillers.english;
    return f[Math.floor(Math.random() * f.length)];
  }

  // ═══ 初始化: 加载所有动态关卡 ═══
  function initDynamicLevels() {
    _loadVaultLevels();
    _loadPerplexityLevels();
    const total = Object.values(_dynamicLevels).reduce((s,a) => s+a.length, 0);
    if(total > 0) console.log(`[消消乐] 📡 动态关卡池加载完毕: 共 ${total} 关`);
  }

  // 页面加载时自动初始化
  if(typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initDynamicLevels);
  }

  return {
    getLevel, getTotalLevels, buildGrid, initDynamicLevels,
    GRID_SIZE, COLORS, TARGET_MATCHES,
    _dynamicLevels // 暴露供调试
  };
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
格式:[{"sentence":"快速排序的平均时间复杂度是O(_____)",  "answer":"nlogn","meaning":"快排平均O(nlogn)","distractors":["n","n²","logn","1","n³","2^n"]}]
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
          localStorage.setItem('Siege_Levels_'+subj,JSON.stringify(levels));
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
    if(totalAdded>0){
      console.log('[消消乐] 📡 今日共注入 '+totalAdded+' 个Perplexity最新关卡!');
      // 重新加载动态关卡池
      CrushData.initDynamicLevels();
    }
  }

  siegeDailyInject().catch(e=>console.warn('[消消乐] 自动抓题异常:',e));
})();
