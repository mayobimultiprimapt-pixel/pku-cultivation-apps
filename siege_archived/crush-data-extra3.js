/**
 * 消消乐 · 扩展题库 v3.0 (第三批)
 * 高频核心题型 · 冲刺500题/科
 */
(function(){
const E3=[
{sentence:'The government _____ austerity measures to reduce the deficit.',answer:'imposed',meaning:'imposed = 实施',distractors:['lifted','removed','cancelled','abolished','withdrew','reversed']},
{sentence:'The professor\'s lecture _____ a lively discussion among students.',answer:'sparked',meaning:'sparked = 引发',distractors:['stifled','suppressed','prevented','blocked','halted','stopped']},
{sentence:'Access to education should not be _____ by economic status.',answer:'determined',meaning:'determined by = 取决于',distractors:['improved','enhanced','guaranteed','ensured','protected','supported']},
{sentence:'The survey _____ that most citizens support the new policy.',answer:'reveals',meaning:'reveals = 揭示',distractors:['conceals','hides','masks','obscures','suppresses','ignores']},
{sentence:'Global warming _____ an existential threat to many species.',answer:'constitutes',meaning:'constitutes = 构成',distractors:['eliminates','resolves','prevents','removes','avoids','reduces']},
{sentence:'The author _____ vivid imagery to convey her message.',answer:'employs',meaning:'employs = 运用',distractors:['avoids','rejects','abandons','neglects','ignores','dismisses']},
{sentence:'Sustainable development _____ economic growth with environmental protection.',answer:'reconciles',meaning:'reconciles = 调和',distractors:['separates','conflicts','opposes','contradicts','divides','isolates']},
{sentence:'The evidence _____ the traditional view of the historical event.',answer:'challenges',meaning:'challenges = 挑战',distractors:['confirms','supports','validates','endorses','reinforces','strengthens']},
{sentence:'Urbanization has _____ transformed the social landscape.',answer:'profoundly',meaning:'profoundly = 深刻地',distractors:['barely','slightly','marginally','trivially','superficially','minimally']},
{sentence:'The experiment was _____ to test the effectiveness of the drug.',answer:'designed',meaning:'designed = 设计来',distractors:['abandoned','cancelled','rejected','postponed','neglected','forgotten']},
{sentence:'Poverty is often _____ with poor health outcomes.',answer:'associated',meaning:'associated with = 与…相关',distractors:['incompatible','unrelated','disconnected','separate','independent','isolated']},
{sentence:'The president _____ a state of emergency following the disaster.',answer:'declared',meaning:'declared = 宣布',distractors:['denied','concealed','revoked','cancelled','retracted','withdrew']},
{sentence:'Automation has _____ the way goods are manufactured.',answer:'altered',meaning:'altered = 改变了',distractors:['preserved','maintained','retained','sustained','continued','prolonged']},
{sentence:'The policy was _____ criticized by opposition leaders.',answer:'sharply',meaning:'sharply = 尖锐地',distractors:['mildly','gently','slightly','softly','kindly','warmly']},
{sentence:'The research team _____ their methodology in the paper.',answer:'described',meaning:'described = 描述了',distractors:['concealed','omitted','withheld','obscured','hidden','suppressed']},
{sentence:'The university _____ a wide variety of courses to students.',answer:'offers',meaning:'offers = 提供',distractors:['denies','restricts','withholds','limits','withdraws','cancels']},
{sentence:'The phenomenon has _____ considerable academic interest.',answer:'generated',meaning:'generated = 产生了',distractors:['lost','destroyed','eliminated','diminished','reduced','suppressed']},
{sentence:'The new regulations _____ strict penalties for violations.',answer:'stipulate',meaning:'stipulate = 规定',distractors:['waive','ignore','exempt','overlook','dismiss','abolish']},
{sentence:'Cultural diversity _____ to the richness of society.',answer:'contributes',meaning:'contributes to = 有助于',distractors:['detracts','harms','threatens','damages','undermines','weakens']},
{sentence:'The company _____ a new strategy to expand globally.',answer:'adopted',meaning:'adopted = 采纳了',distractors:['rejected','abandoned','discarded','opposed','refused','declined']},
{sentence:'Higher interest rates tend to _____ consumer spending.',answer:'discourage',meaning:'discourage = 抑制',distractors:['encourage','boost','stimulate','promote','increase','enhance']},
{sentence:'The issue _____ a more nuanced approach than previously thought.',answer:'requires',meaning:'requires = 需要',distractors:['avoids','prevents','eliminates','bypasses','ignores','rejects']},
{sentence:'The historian _____ the events leading to the revolution.',answer:'traced',meaning:'traced = 追溯',distractors:['fabricated','invented','ignored','concealed','distorted','forgot']},
{sentence:'Social media has _____ the way people communicate globally.',answer:'transformed',meaning:'transformed = 变革了',distractors:['preserved','maintained','retained','continued','sustained','fixed']},
{sentence:'The charity _____ funds for disaster relief operations.',answer:'raised',meaning:'raised funds = 筹集资金',distractors:['wasted','lost','spent','consumed','depleted','squandered']},
{sentence:'The _____ of the study was limited by the small sample size.',answer:'validity',meaning:'validity = 有效性',distractors:['popularity','fame','success','profit','entertainment','beauty']},
{sentence:'The speaker _____ to several key points during the presentation.',answer:'referred',meaning:'referred to = 提及',distractors:['avoided','skipped','ignored','missed','bypassed','omitted']},
{sentence:'The treaty _____ a framework for future cooperation.',answer:'establishes',meaning:'establishes = 建立',distractors:['destroys','undermines','abolishes','dissolves','eliminates','prevents']},
{sentence:'Online learning has _____ more accessible in recent years.',answer:'become',meaning:'become = 变得',distractors:['remained','stayed','continued','persisted','lingered','endured']},
{sentence:'The report _____ the successes and failures of the program.',answer:'evaluates',meaning:'evaluates = 评估',distractors:['ignores','conceals','overlooks','dismisses','neglects','avoids']},
{sentence:'The government must _____ adequate resources to healthcare.',answer:'allocate',meaning:'allocate = 分配',distractors:['withhold','deny','divert','waste','squander','withdraw']},
{sentence:'Public health campaigns _____ people about the risks of smoking.',answer:'inform',meaning:'inform = 告知',distractors:['mislead','deceive','confuse','misinform','distract','ignore']},
{sentence:'The law _____ discrimination on the basis of gender or race.',answer:'prohibits',meaning:'prohibits = 禁止',distractors:['permits','allows','endorses','supports','enables','encourages']},
{sentence:'The crisis _____ the vulnerability of global supply chains.',answer:'exposed',meaning:'exposed = 暴露了',distractors:['concealed','hidden','masked','protected','shielded','covered']},
{sentence:'Scientists _____ new ways to harness renewable energy.',answer:'explore',meaning:'explore = 探索',distractors:['abandon','reject','ignore','dismiss','neglect','avoid']},
{sentence:'The election _____ a turning point in the nation\'s history.',answer:'marked',meaning:'marked = 标志着',distractors:['prevented','delayed','missed','avoided','blocked','skipped']},
{sentence:'The _____ of artificial intelligence raises ethical questions.',answer:'emergence',meaning:'emergence = 出现',distractors:['absence','disappearance','decline','loss','removal','extinction']},
{sentence:'The debate _____ around the issue of immigration reform.',answer:'centered',meaning:'centered on = 围绕',distractors:['avoided','ignored','skipped','bypassed','missed','dodged']},
{sentence:'The company _____ its workforce by 20% due to the recession.',answer:'reduced',meaning:'reduced = 缩减了',distractors:['expanded','increased','doubled','tripled','multiplied','enlarged']},
{sentence:'Foreign aid _____ a vital role in supporting developing nations.',answer:'plays',meaning:'plays a role = 发挥作用',distractors:['avoids','lacks','misses','loses','wastes','ignores']},
];

const M3=[
{sentence:'∫tan(x)dx = _____',answer:'-ln|cos(x)|+C',meaning:'∫tanx=-ln|cosx|+C',distractors:['ln|sin(x)|','sec²(x)','1/cos(x)','-cos(x)','sin(x)','sec(x)']},
{sentence:'二项分布B(n,p)的方差D(X)= _____',answer:'np(1-p)',meaning:'npq, q=1-p',distractors:['np','n(1-p)','p(1-p)','n²p','np²','n/p']},
{sentence:'微分方程y\'+P(x)y=Q(x)是 _____ 阶线性方程',answer:'一',meaning:'一阶线性ODE',distractors:['二','零','三','高','非','齐']},
{sentence:'向量组的秩等于向量组的 _____ 的向量个数',answer:'极大线性无关组',meaning:'秩=极大线性无关组的元素个数',distractors:['全部向量','零向量','单位向量','正交基','标准基','特征向量']},
{sentence:'∫₀^(π/2) sin^n(x)dx的递推公式称为 _____ 公式',answer:'华里士',meaning:'Wallis公式/递推公式',distractors:['泰勒','欧拉','高斯','贝塞尔','牛顿','莱布尼茨']},
{sentence:'正交矩阵Q满足Q^TQ = _____',answer:'E',meaning:'正交矩阵的转置=逆',distractors:['Q','0','Q²','2E','Q^T','-E']},
{sentence:'随机变量X的分布函数F(x)是 _____ 函数',answer:'右连续非递减',meaning:'F(x)=P(X≤x), 右连续+不减',distractors:['左连续递增','连续递减','可导','对称','周期','有界递减']},
{sentence:'n维向量空间的基变换矩阵是 _____',answer:'可逆',meaning:'基变换矩阵必可逆',distractors:['奇异','零','对角','对称','正交','单位']},
{sentence:'傅里叶级数展开要求函数满足 _____ 条件',answer:'Dirichlet',meaning:'狄利克雷条件',distractors:['柯西','黎曼','勒贝格','阿贝尔','魏尔斯特拉斯','波尔查诺']},
{sentence:'设f(x)在x₀的某邻域内二阶可导,f\'(x₀)=0,f\"(x₀)>0,则x₀是 _____',answer:'极小值点',meaning:'二阶导数判别法',distractors:['极大值点','拐点','不确定','鞍点','临界点','非极值']},
{sentence:'概率密度函数f(x)对全体实数的积分= _____',answer:'1',meaning:'概率密度归一化条件',distractors:['0','∞','f(0)','E(X)','D(X)','p']},
{sentence:'斯托克斯公式联系的是曲面积分和 _____ 积分',answer:'曲线',meaning:'Stokes公式:曲面↔曲线积分',distractors:['二重','三重','体积','面积','点','弧长']},
{sentence:'矩阵A的伴随矩阵A*满足AA*= _____',answer:'|A|E',meaning:'AA*=|A|E',distractors:['A','E','0','A²','|A|','A^T']},
{sentence:'设随机变量X~N(0,1),则P(X>0)= _____',answer:'0.5',meaning:'标准正态关于0对称',distractors:['0','1','0.68','0.95','0.99','0.34']},
{sentence:'幂级数∑xⁿ/n!的收敛半径R= _____',answer:'∞',meaning:'e^x的展开收敛域=(-∞,∞)',distractors:['1','0','e','π','2','n']},
];

const P3=[
{sentence:'对立统一规律是唯物辩证法的 _____',answer:'实质和核心',meaning:'对立统一=辩证法核心',distractors:['基础','补充','表现','形式','手段']},
{sentence:'生产关系中起决定作用的是 _____',answer:'生产资料所有制',meaning:'所有制是生产关系基础',distractors:['分配方式','交换关系','消费方式','管理形式','劳动组织']},
{sentence:'\"四个意识\"包括政治意识、大局意识、核心意识和 _____',answer:'看齐意识',meaning:'四个意识',distractors:['法律意识','责任意识','忧患意识','创新意识','发展意识']},
{sentence:'中国特色社会主义最大优势是 _____',answer:'中国共产党领导',meaning:'最大优势=党的领导',distractors:['公有制经济','人民代表大会','政协制度','民族区域自治','基层自治']},
{sentence:'深化党和国家机构改革的首要任务是加强党的 _____',answer:'全面领导',meaning:'机构改革=加强党的全面领导',distractors:['经济领导','军事领导','文化领导','外交领导','科技领导']},
{sentence:'实践是检验真理的 _____ 标准',answer:'唯一',meaning:'实践=唯一检验真理标准',distractors:['重要','主要','基本','根本','首要']},
{sentence:'否定之否定规律揭示了事物发展的 _____ 性',answer:'前进',meaning:'否定之否定=螺旋上升/前进',distractors:['倒退','循环','停滞','直线','随机']},
{sentence:'资本主义经济危机的根源是资本主义的 _____',answer:'基本矛盾',meaning:'生产社会化vs私人占有',distractors:['市场竞争','利润追求','技术进步','全球化','工资制度']},
{sentence:'社会主义初级阶段是 _____ 不可逾越的历史阶段',answer:'任何情况下都',meaning:'初级阶段不可逾越',distractors:['可以','有时','特殊情况下','发达国家','社会主义国家']},
{sentence:'新民主主义革命的性质是 _____',answer:'资产阶级民主革命',meaning:'新民主主义=资产阶级民主革命(无产阶级领导)',distractors:['社会主义革命','无产阶级革命','农民革命','民族革命','文化革命']},
{sentence:'马克思主义最鲜明的品格是 _____',answer:'人民性',meaning:'人民性=最鲜明品格',distractors:['阶级性','科学性','革命性','实践性','开放性']},
{sentence:'我国的基本经济制度是公有制为主体多种所有制经济 _____',answer:'共同发展',meaning:'基本经济制度',distractors:['竞争发展','独立发展','互补发展','并行发展','交叉发展']},
{sentence:'全面推进依法治国的总抓手是建设 _____',answer:'中国特色社会主义法治体系',meaning:'总抓手=法治体系建设',distractors:['法治政府','法治社会','宪法体系','司法体系','执法体系']},
{sentence:'文化自信的底气来源于中华优秀传统文化、革命文化和 _____',answer:'社会主义先进文化',meaning:'三大文化来源',distractors:['外来文化','网络文化','流行文化','商业文化','精英文化']},
{sentence:'总体国家安全观以 _____ 安全为宗旨',answer:'人民',meaning:'人民安全是宗旨',distractors:['国家','政治','经济','军事','领土']},
];

const C3=[
{sentence:'平衡二叉树(AVL)中每个节点的平衡因子取值范围是 _____',answer:'-1,0,1',meaning:'AVL平衡因子∈{-1,0,1}',distractors:['-2到2','0到2','-1到2','0和1','任意整数','-3到3']},
{sentence:'死锁产生的四个必要条件中不包括 _____',answer:'可抢占',meaning:'互斥+请求保持+不可抢占+循环等待',distractors:['互斥','请求保持','不可抢占','循环等待','资源有限']},
{sentence:'HTTP/1.1 默认使用 _____ 连接',answer:'持久',meaning:'HTTP/1.1=Keep-Alive持久连接',distractors:['非持久','短','UDP','加密','压缩','异步']},
{sentence:'哈夫曼树是 _____ 最小的二叉树',answer:'带权路径长度',meaning:'WPL最小=最优二叉树',distractors:['深度','节点数','叶子数','度','高度','宽度']},
{sentence:'操作系统的内存管理中,\"抖动\"现象是由于 _____ 过小',answer:'物理内存',meaning:'物理内存不足→频繁换页→抖动',distractors:['虚拟内存','硬盘','缓存','寄存器','总线','页面']},
{sentence:'ICMP协议工作在 _____ 层',answer:'网络',meaning:'ICMP=网络层协议(IP层)',distractors:['应用','传输','数据链路','物理','会话','表示']},
{sentence:'计算机中原码表示法中\"+0\"和\"-0\" _____',answer:'编码不同',meaning:'原码有±0问题,补码无',distractors:['编码相同','不存在','都是0','相加为1','互为补码','互为反码']},
{sentence:'数据库的并发控制主要使用 _____ 技术',answer:'封锁',meaning:'封锁(锁)=并发控制主要手段',distractors:['恢复','备份','索引','视图','触发','日志']},
{sentence:'在网络中,交换机工作在OSI模型的第 _____ 层',answer:'二',meaning:'交换机=数据链路层设备',distractors:['一','三','四','五','六','七']},
{sentence:'线性表的顺序存储结构的特点是 _____ 存储',answer:'随机',meaning:'数组=随机存取(O(1))',distractors:['顺序','链式','索引','散列','树形','图形']},
{sentence:'操作系统中SPOOLing技术实现了 _____ 设备的虚拟化',answer:'独占',meaning:'SPOOLing=将独占设备虚拟为共享',distractors:['共享','虚拟','网络','存储','输入','输出']},
{sentence:'关系数据库中,候选码可以有 _____',answer:'多个',meaning:'候选码≥1个,主码唯一',distractors:['仅1个','0个','无限个','偶数个','奇数个','固定个']},
{sentence:'cache的命中率h意味着CPU访问cache的概率为 _____',answer:'h',meaning:'命中率=命中次数/总访问次数',distractors:['1-h','h²','2h','h/2','1/h','1+h']},
{sentence:'Wi-Fi使用的IEEE标准是 _____',answer:'802.11',meaning:'Wi-Fi=IEEE 802.11标准族',distractors:['802.3','802.15','802.16','802.1','802.5','802.2']},
{sentence:'计算机中的流水线冲突不包括 _____ 冲突',answer:'语义',meaning:'三种冲突:结构+数据+控制',distractors:['结构','数据','控制','资源','RAW','WAR']},
];

  function injectBatch3(){
    if(typeof CrushData==='undefined'||!CrushData._dynamicLevels){setTimeout(injectBatch3,400);return}
    const p=CrushData._dynamicLevels;
    const add=(m,arr)=>{const ex=new Set(p[m].map(l=>l.answer));
      const f=arr.filter(q=>!ex.has(q.answer)&&q.sentence&&q.answer);
      f.forEach(q=>{while((q.distractors||[]).length<6)q.distractors.push('???')});
      p[m].push(...f);console.log(`[消消乐] 题库批次3 ${m}: +${f.length}`)};
    add('english',E3);add('math',M3);add('politics',P3);add('cs',C3);
    console.log('[消消乐] ✅ 题库批次3加载完毕!');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(injectBatch3,300));
  else setTimeout(injectBatch3,300);
})();
