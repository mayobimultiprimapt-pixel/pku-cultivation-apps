/**
 * 消消乐 · 扩展题库 v3.0 (第二批)
 * 历年常考核心题型 · 四科大规模补充
 */
(function(){
const E2=[
{sentence:'The situation _____ immediate attention from authorities.',answer:'warrants',meaning:'warrants = 值得、需要',distractors:['avoids','prevents','blocks','rejects','delays','ignores']},
{sentence:'The study aims to _____ the factors contributing to obesity.',answer:'investigate',meaning:'investigate = 调查',distractors:['overlook','dismiss','ignore','conceal','deny','suppress']},
{sentence:'Modern architecture _____ functionality with aesthetics.',answer:'integrates',meaning:'integrates = 融合',distractors:['separates','divides','isolates','fragments','scatters','splits']},
{sentence:'The politician tried to _____ the allegations against him.',answer:'refute',meaning:'refute = 反驳',distractors:['confirm','support','endorse','validate','accept','embrace']},
{sentence:'The economy is expected to _____ in the coming quarter.',answer:'rebound',meaning:'rebound = 反弹',distractors:['collapse','plummet','stagnate','decline','shrink','deteriorate']},
{sentence:'Exposure to sunlight _____ vitamin D production in the body.',answer:'stimulates',meaning:'stimulates = 刺激促进',distractors:['inhibits','blocks','reduces','prevents','suppresses','halts']},
{sentence:'The _____ of the law is to protect consumers from fraud.',answer:'intent',meaning:'intent = 目的',distractors:['flaw','weakness','failure','defect','problem','limitation']},
{sentence:'The documentary _____ the lives of refugees in war zones.',answer:'chronicles',meaning:'chronicles = 记录',distractors:['fabricates','distorts','ignores','conceals','omits','falsifies']},
{sentence:'International trade has _____ benefited developing nations.',answer:'substantially',meaning:'substantially = 大幅地',distractors:['barely','hardly','slightly','marginally','minimally','negligibly']},
{sentence:'The professor _____ a theory that challenged conventional wisdom.',answer:'advanced',meaning:'advanced = 提出',distractors:['abandoned','retracted','withdrew','rejected','dismissed','discarded']},
{sentence:'Strict regulations _____ businesses from polluting rivers.',answer:'prohibit',meaning:'prohibit = 禁止',distractors:['encourage','permit','allow','enable','authorize','empower']},
{sentence:'The conference _____ a platform for interdisciplinary dialogue.',answer:'provided',meaning:'provided = 提供了',distractors:['denied','eliminated','removed','blocked','prevented','restricted']},
{sentence:'The reform has _____ mixed reactions from different sectors.',answer:'elicited',meaning:'elicited = 引出',distractors:['suppressed','concealed','prevented','blocked','hidden','masked']},
{sentence:'His _____ behavior at the meeting surprised everyone.',answer:'erratic',meaning:'erratic = 反复无常的',distractors:['consistent','steady','predictable','stable','reliable','uniform']},
{sentence:'The country _____ significant progress in poverty reduction.',answer:'achieved',meaning:'achieved = 取得了',distractors:['lost','forfeited','squandered','wasted','missed','abandoned']},
{sentence:'The ecosystem is _____ fragile and requires careful management.',answer:'inherently',meaning:'inherently = 本质上',distractors:['barely','slightly','rarely','hardly','minimally','superficially']},
{sentence:'Deforestation has _____ the habitat of many endangered species.',answer:'destroyed',meaning:'destroyed = 摧毁了',distractors:['protected','preserved','maintained','expanded','enhanced','restored']},
{sentence:'The journal _____ articles on a wide range of scientific topics.',answer:'publishes',meaning:'publishes = 发表',distractors:['rejects','censors','suppresses','withholds','bans','blocks']},
{sentence:'The treaty _____ both nations to reduce nuclear weapons.',answer:'obliges',meaning:'obliges = 义务约束',distractors:['permits','allows','frees','exempts','releases','excuses']},
{sentence:'Consumer confidence _____ a crucial role in economic recovery.',answer:'plays',meaning:'plays a role = 发挥作用',distractors:['avoids','misses','lacks','loses','ignores','wastes']},
{sentence:'The initiative seeks to _____ access to clean water in rural areas.',answer:'improve',meaning:'improve = 改善',distractors:['restrict','limit','reduce','deny','block','prevent']},
{sentence:'Scientists have _____ a correlation between stress and illness.',answer:'observed',meaning:'observed = 观察到',distractors:['denied','refuted','dismissed','overlooked','missed','ignored']},
{sentence:'The legislation was _____ designed to close tax loopholes.',answer:'specifically',meaning:'specifically = 专门地',distractors:['vaguely','loosely','casually','randomly','accidentally','barely']},
{sentence:'Her _____ to the project was both intellectual and financial.',answer:'contribution',meaning:'contribution = 贡献',distractors:['opposition','resistance','objection','indifference','hostility','apathy']},
{sentence:'The institution _____ a reputation for academic excellence.',answer:'maintains',meaning:'maintains = 维持',distractors:['lacks','lost','abandoned','destroyed','ruined','squandered']},
{sentence:'Critics _____ that the policy favors the wealthy.',answer:'allege',meaning:'allege = 声称',distractors:['deny','refute','disprove','reject','dismiss','contradict']},
{sentence:'The team _____ a thorough investigation of the incident.',answer:'conducted',meaning:'conducted = 进行了',distractors:['avoided','postponed','cancelled','abandoned','delayed','ignored']},
{sentence:'The report _____ a number of recommendations for improvement.',answer:'outlines',meaning:'outlines = 概述',distractors:['conceals','hides','omits','ignores','suppresses','withholds']},
{sentence:'The professor _____ students to participate in class discussions.',answer:'invites',meaning:'invites = 邀请',distractors:['forbids','prevents','discourages','prohibits','blocks','restricts']},
{sentence:'The data _____ that the policy has been largely successful.',answer:'indicates',meaning:'indicates = 表明',distractors:['denies','contradicts','conceals','disproves','refutes','negates']},
{sentence:'Technological innovation has _____ new opportunities for growth.',answer:'created',meaning:'created = 创造了',distractors:['destroyed','eliminated','removed','blocked','prevented','hindered']},
{sentence:'Education is widely _____ as a key driver of social mobility.',answer:'regarded',meaning:'regarded as = 被视为',distractors:['dismissed','ignored','overlooked','rejected','denied','doubted']},
{sentence:'The patient _____ well to the new treatment regimen.',answer:'responded',meaning:'responded = 反应良好',distractors:['failed','resisted','declined','worsened','deteriorated','collapsed']},
{sentence:'The government has _____ to address the housing crisis.',answer:'pledged',meaning:'pledged = 承诺',distractors:['refused','declined','failed','neglected','forgotten','avoided']},
{sentence:'The research _____ important implications for public health policy.',answer:'carries',meaning:'carries implications = 具有影响',distractors:['lacks','avoids','misses','ignores','drops','loses']},
{sentence:'Freedom of speech is _____ protected by the constitution.',answer:'explicitly',meaning:'explicitly = 明确地',distractors:['vaguely','implicitly','barely','ambiguously','loosely','indirectly']},
{sentence:'The negotiations _____ in a historic peace agreement.',answer:'culminated',meaning:'culminated in = 以…告终',distractors:['failed','collapsed','stalled','faltered','deadlocked','dissolved']},
{sentence:'The museum _____ a vast collection of ancient artifacts.',answer:'houses',meaning:'houses = 收藏',distractors:['lacks','discards','destroys','sells','abandons','rejects']},
{sentence:'The committee _____ strict guidelines for research ethics.',answer:'established',meaning:'established = 建立了',distractors:['abolished','removed','ignored','violated','abandoned','dissolved']},
{sentence:'Rising temperatures could _____ agricultural productivity.',answer:'diminish',meaning:'diminish = 减少',distractors:['boost','increase','enhance','multiply','expand','double']},
];

const M2=[
{sentence:'三阶矩阵A的特征值为1,2,3,则|A|= _____',answer:'6',meaning:'|A|=λ₁λ₂λ₃=1×2×3',distractors:['5','3','0','1','7','12']},
{sentence:'∫cos²(x)dx中需要用到 _____ 公式',answer:'降幂',meaning:'cos²x=(1+cos2x)/2',distractors:['升幂','倍角','半角','和差化积','积化和差','万能']},
{sentence:'∑(n=1→∞)1/n! = _____',answer:'e-1',meaning:'e=∑1/n!(n=0→∞)',distractors:['e','1','e+1','2','π','∞']},
{sentence:'n阶行列式可以按任意一行(列)展开是 _____ 定理',answer:'拉普拉斯',meaning:'Laplace展开定理',distractors:['高斯','克莱姆','哈密顿','凯莱','施密特','格拉姆']},
{sentence:'曲线y=x²在x=1处的曲率= _____',answer:'2/5√5',meaning:'κ=|y″|/(1+y′²)^(3/2)',distractors:['2','1','1/2','√2','1/√5','2/√5']},
{sentence:'伽马函数Γ(1/2)= _____',answer:'√π',meaning:'Γ(1/2)=√π',distractors:['π','1','1/2','2','e','∞']},
{sentence:'d/dx[arcsin(x)] = _____',answer:'1/√(1-x²)',meaning:'反正弦导数',distractors:['1/√(1+x²)','arccos(x)','1/(1-x²)','cos(x)','-1/√(1-x²)','arctan(x)']},
{sentence:'收敛级数∑aₙ的Cauchy准则要求|∑ₘₙ| _____ ε',answer:'<',meaning:'柯西收敛准则',distractors:['>','=','≥','≤','≠','→']},
{sentence:'若A是m×n矩阵,则A的列空间维数= _____',answer:'rank(A)',meaning:'列空间维数=列秩=秩',distractors:['n','m','0','m+n','det(A)','tr(A)']},
{sentence:'贝叶斯公式是 _____ 公式的逆过程',answer:'全概率',meaning:'贝叶斯=全概率公式的逆',distractors:['加法','乘法','条件','独立','容斥','递推']},
{sentence:'∫₀^1 x^α·ln(x)dx收敛的条件是α _____ -1',answer:'>',meaning:'该瑕积分在α>-1时收敛',distractors:['<','=','≥','≤','≠','→']},
{sentence:'两个矩阵可以相乘的条件是A的列数等于B的 _____',answer:'行数',meaning:'Aₘₓₙ·Bₙₓₚ=Cₘₓₚ',distractors:['列数','秩','行列式','维数','元素数','特征值']},
{sentence:'若X和Y独立,则D(X+Y)= _____',answer:'D(X)+D(Y)',meaning:'独立时方差可加',distractors:['D(X)D(Y)','D(X)-D(Y)','E(X)+E(Y)','D(XY)','0','1']},
{sentence:'定积分的中值定理：∫ₐᵇf(x)dx = f(ξ)·_____',answer:'(b-a)',meaning:'积分中值定理',distractors:['(b+a)','f(a)','f(b)','1','ξ','(b-a)/2']},
{sentence:'施密特正交化方法用于将线性无关向量组化为 _____',answer:'正交向量组',meaning:'Gram-Schmidt正交化',distractors:['标准基','特征向量','零向量','单位向量','同方向向量','平行向量']},
{sentence:'χ²分布的自由度n对应的期望E(χ²)= _____',answer:'n',meaning:'χ²(n)的期望=n',distractors:['n²','2n','n-1','n+1','1','0']},
{sentence:'隐函数dy/dx = -Fx/_____ ',answer:'Fy',meaning:'F(x,y)=0的隐函数求导',distractors:['Fx','F','x','y','Fxy','Fxx']},
{sentence:'Abel定理：幂级数在收敛半径端点处 _____ 收敛',answer:'可能',meaning:'Abel定理讨论端点收敛性',distractors:['一定','不可能','绝对','条件','发散','振荡']},
{sentence:'空间曲线的Frenet标架包含切向量、法向量和 _____',answer:'副法向量',meaning:'T,N,B三个单位向量',distractors:['梯度','散度','旋度','法平面','切平面','曲率']},
{sentence:'大数定律说明样本均值依概率收敛于 _____',answer:'总体均值',meaning:'大数定律核心',distractors:['方差','中位数','众数','标准差','极值','四分位数']},
{sentence:'∫∫_D dxdy 的几何意义是区域D的 _____',answer:'面积',meaning:'二重积分=面积(被积函数为1时)',distractors:['体积','周长','质量','密度','惯量','重心']},
{sentence:'矩阵的Jordan标准形由Jordan块组成，每个块对角线上是 _____',answer:'特征值',meaning:'Jordan块=特征值+次对角线1',distractors:['0','1','行列式','秩','迹','范数']},
{sentence:'t分布当自由度n→∞时趋于 _____分布',answer:'标准正态',meaning:'t分布→N(0,1)',distractors:['均匀','指数','卡方','F','泊松','二项']},
{sentence:'多元函数的极值点处 _____ 为零',answer:'梯度',meaning:'极值必要条件:∇f=0',distractors:['海森矩阵','行列式','秩','方向导数','散度','旋度']},
{sentence:'可分离变量微分方程的形式是dy/dx = f(x)·_____',answer:'g(y)',meaning:'分离变量法',distractors:['f(y)','g(x)','f(x)','1','0','xy']},
];

const P2=[
{sentence:'认识运动的总规律是从实践到认识、再从认识到 _____',answer:'实践',meaning:'认识运动的反复性和无限性',distractors:['理论','感觉','思维','经验','直觉']},
{sentence:'社会主义初级阶段的分配制度是以 _____ 为主体',answer:'按劳分配',meaning:'按劳分配+多种分配方式并存',distractors:['按需分配','平均分配','按资分配','按权分配','按股分配']},
{sentence:'\"四个全面\"战略布局中排在第一位的是 _____',answer:'全面建设社会主义现代化国家',meaning:'四个全面之首',distractors:['全面深化改革','全面依法治国','全面从严治党','全面脱贫攻坚']},
{sentence:'矛盾的主要方面决定事物的 _____',answer:'性质',meaning:'主要矛盾方面决定性质',distractors:['数量','方向','速度','规模','形式']},
{sentence:'人民群众是历史的 _____',answer:'创造者',meaning:'人民群众创造历史',distractors:['旁观者','参与者','追随者','评判者','记录者']},
{sentence:'唯物史观认为经济基础决定 _____',answer:'上层建筑',meaning:'经济基础→上层建筑',distractors:['生产力','生产关系','生产方式','社会意识','阶级关系']},
{sentence:'社会主义的根本任务是解放和 _____',answer:'发展生产力',meaning:'社会主义根本任务',distractors:['消灭私有制','建立公有制','实现共产主义','消除剥削','缩小差距']},
{sentence:'中国革命的基本问题是 _____',answer:'农民问题',meaning:'农民=中国革命基本问题',distractors:['工人问题','军队问题','政权问题','党建问题','知识分子问题']},
{sentence:'党的思想路线的核心是 _____',answer:'实事求是',meaning:'思想路线核心',distractors:['群众路线','自力更生','独立自主','解放思想','开拓创新']},
{sentence:'抗日战争胜利的决定性力量是 _____',answer:'全民族抗战',meaning:'抗日民族统一战线',distractors:['国民党正面战场','共产党敌后战场','国际援助','苏联出兵','美国原子弹']},
{sentence:'\"一国两制\"最早是为解决 _____ 问题提出的',answer:'台湾',meaning:'一国两制最初为台湾设计',distractors:['香港','澳门','西藏','新疆','南海']},
{sentence:'全面深化改革的总目标包括完善中国特色社会主义制度和推进国家 _____',answer:'治理体系和治理能力现代化',meaning:'十八届三中全会确定',distractors:['经济现代化','军事现代化','教育现代化','科技现代化','文化现代化']},
{sentence:'新时代的主要矛盾是人民日益增长的美好生活需要和 _____之间的矛盾',answer:'不平衡不充分的发展',meaning:'十九大报告',distractors:['落后的社会生产','物质文化需求','生产力不足','分配不公','贫富差距']},
{sentence:'绝对真理和相对真理是 _____ 的两个方面',answer:'同一条真理',meaning:'绝对真理和相对真理辩证统一',distractors:['不同真理','对立真理','矛盾真理','独立真理','平行真理']},
{sentence:'感性认识到理性认识的飞跃需要 _____',answer:'抽象思维',meaning:'感性→理性需要理性思维',distractors:['感觉经验','直觉判断','情感认同','实践验证','权威认定']},
{sentence:'中国特色社会主义进入了 _____',answer:'新时代',meaning:'十九大历史方位判断',distractors:['新阶段','新纪元','新世纪','新时期','新征程']},
{sentence:'社会主义生态文明建设要牢固树立 _____ 理念',answer:'绿水青山就是金山银山',meaning:'生态文明核心理念',distractors:['先污染后治理','发展优先','经济第一','速度至上','效率为王']},
{sentence:'坚持和完善\"一国两制\"的根本宗旨是维护国家 _____',answer:'主权安全发展利益',meaning:'一国两制根本宗旨',distractors:['经济利益','文化传统','历史地位','国际形象','军事实力']},
{sentence:'习近平法治思想的核心要义是 _____ 个坚持',answer:'十一',meaning:'习近平法治思想十一个坚持',distractors:['八','十','十二','九','七']},
{sentence:'中国特色大国外交的目标是推动构建 _____',answer:'人类命运共同体',meaning:'大国外交目标',distractors:['国际新秩序','世界政府','全球联盟','经济共同体','安全共同体']},
{sentence:'百年未有之大变局中的\"变\"主要指国际 _____之变',answer:'格局',meaning:'世界格局深刻变化',distractors:['关系','组织','法律','货币','语言']},
{sentence:'社会主义核心价值观社会层面是自由、平等、公正、_____',answer:'法治',meaning:'社会层面四个词',distractors:['民主','文明','和谐','富强','诚信']},
{sentence:'新征程上的\"三个务必\"不包括务必 _____',answer:'谨慎从事',meaning:'务必不忘初心+务必谦虚谨慎+务必敢于斗争',distractors:['不忘初心','谦虚谨慎','敢于斗争','牢记使命','艰苦奋斗']},
{sentence:'习近平强调教育的根本任务是 _____',answer:'立德树人',meaning:'教育根本任务',distractors:['传授知识','培养技能','提高素质','就业创业','科研创新']},
{sentence:'\"五位一体\"总体布局中的\"五位\"不包括 _____',answer:'军事建设',meaning:'经济+政治+文化+社会+生态',distractors:['经济建设','政治建设','文化建设','社会建设','生态文明建设']},
];

const C2=[
{sentence:'Floyd算法求解的是 _____ 最短路径',answer:'全源',meaning:'Floyd=所有顶点间最短路',distractors:['单源','两点','最长','关键','最宽']},
{sentence:'操作系统中内核态和用户态的切换通过 _____ 实现',answer:'中断',meaning:'中断/异常/系统调用触发态切换',distractors:['函数调用','循环','递归','分支','跳转','赋值']},
{sentence:'在关系代数中,选择操作对应SQL的 _____ 子句',answer:'WHERE',meaning:'选择=WHERE条件筛选',distractors:['SELECT','FROM','GROUP BY','ORDER BY','HAVING','JOIN']},
{sentence:'计算机中IEEE 754标准用于表示 _____',answer:'浮点数',meaning:'IEEE 754=浮点数标准',distractors:['整数','字符','布尔','地址','指令','信号']},
{sentence:'网络层的主要功能是 _____',answer:'路由选择',meaning:'网络层=路由+转发',distractors:['差错控制','流量控制','链路管理','编码','加密','认证']},
{sentence:'线性表的链式存储比顺序存储的优点是 _____',answer:'插入删除方便',meaning:'链式=O(1)插入删除(已知位置)',distractors:['随机访问快','占用空间小','查找效率高','排序方便','遍历快速','存取方便']},
{sentence:'TLB(快表)用于加速 _____ 的转换',answer:'地址',meaning:'TLB=Translation Lookaside Buffer',distractors:['数据','指令','信号','协议','文件','进程']},
{sentence:'图的广度优先遍历生成的是 _____ 树',answer:'广度优先',meaning:'BFS生成BFS树',distractors:['深度优先','最小生成','平衡','红黑','B','哈夫曼']},
{sentence:'RISC和CISC是两种不同的 _____ 设计',answer:'指令集',meaning:'RISC=精简指令集,CISC=复杂指令集',distractors:['操作系统','编译器','网络','数据库','总线','存储']},
{sentence:'多级反馈队列调度算法兼顾了 _____ 和响应时间',answer:'吞吐量',meaning:'多级反馈=兼顾多种目标',distractors:['安全性','可靠性','稳定性','兼容性','可用性','可扩展性']},
{sentence:'NAT技术实现的是 _____ 地址的转换',answer:'IP',meaning:'NAT=Network Address Translation',distractors:['MAC','端口','域名','URL','物理','逻辑']},
{sentence:'线索二叉树的优点是能在O(1)时间找到节点的 _____',answer:'前驱和后继',meaning:'线索=利用空指针存前驱后继',distractors:['父节点','子节点','兄弟','祖先','深度','高度']},
{sentence:'磁盘的格式化分为 _____ 格式化和高级格式化',answer:'低级',meaning:'低级=物理格式化,高级=逻辑格式化',distractors:['中级','快速','完全','安全','增量','差量']},
{sentence:'TCP使用 _____ 位序列号来标识数据',answer:'32',meaning:'TCP序列号=32位',distractors:['8','16','64','128','24','48']},
{sentence:'希尔排序是对 _____ 排序的改进',answer:'直接插入',meaning:'Shell=改进的插入排序',distractors:['冒泡','选择','归并','快速','堆','桶']},
{sentence:'计算机中的DMA控制器实现了 _____ 和内存之间的直接数据传输',answer:'I/O设备',meaning:'DMA=直接内存访问',distractors:['CPU','寄存器','缓存','总线','外设','控制器']},
{sentence:'数据库的ACID特性中I代表 _____',answer:'隔离性',meaning:'ACID=原子性+一致性+隔离性+持久性',distractors:['完整性','独立性','不变性','继承性','标识性','一致性']},
{sentence:'SMTP协议用于 _____ 电子邮件',answer:'发送',meaning:'SMTP=发送邮件,POP3/IMAP=接收',distractors:['接收','转发','存储','加密','压缩','过滤']},
{sentence:'在计算机组成中,微指令的集合称为 _____',answer:'微程序',meaning:'微程序=控制存储器中的微指令序列',distractors:['宏程序','子程序','主程序','汇编程序','高级程序','机器程序']},
{sentence:'VLAN划分的依据通常是 _____',answer:'交换机端口',meaning:'基于端口的VLAN最常用',distractors:['IP地址','MAC地址','协议类型','用户名','时间','地理位置']},
{sentence:'基数排序的时间复杂度是O(_____)',answer:'d(n+r)',meaning:'d=位数,n=元素数,r=基数',distractors:['nlogn','n²','n','logn','n³','2^n']},
{sentence:'操作系统的I/O方式中,中断方式比程序查询方式的优势是 _____',answer:'CPU利用率高',meaning:'中断=CPU不用忙等',distractors:['速度更快','更简单','更安全','更可靠','更节能','更灵活']},
{sentence:'在计算机网络中,路由器工作在OSI模型的第 _____ 层',answer:'三',meaning:'路由器=网络层设备',distractors:['一','二','四','五','六','七']},
{sentence:'数据库中外码(外键)用于实现表之间的 _____',answer:'参照完整性',meaning:'外键=参照完整性约束',distractors:['实体完整性','用户自定义完整性','域完整性','键完整性','唯一完整性','全局完整性']},
{sentence:'进程同步的经典问题\"哲学家就餐\"涉及 _____ 个哲学家',answer:'5',meaning:'5个哲学家+5根筷子',distractors:['3','4','6','7','2','8']},
];

  function injectBatch2(){
    if(typeof CrushData==='undefined'||!CrushData._dynamicLevels){setTimeout(injectBatch2,300);return}
    const p=CrushData._dynamicLevels;
    const add=(m,arr)=>{const ex=new Set(p[m].map(l=>l.answer));
      const f=arr.filter(q=>!ex.has(q.answer)&&q.sentence&&q.answer);
      f.forEach(q=>{while((q.distractors||[]).length<6)q.distractors.push('???')});
      p[m].push(...f);console.log(`[消消乐] 题库批次2 ${m}: +${f.length}`)};
    add('english',E2);add('math',M2);add('politics',P2);add('cs',C2);
    console.log('[消消乐] ✅ 题库批次2加载完毕!');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(injectBatch2,200));
  else setTimeout(injectBatch2,200);
})();
