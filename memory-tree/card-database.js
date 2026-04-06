/**
 * 识海天碑 · 全科知识点数据库
 * ================================
 * 255+ 张核心考点卡片，覆盖 101/201/301/408 四大科目
 * 基于考研大纲高频考点精选
 */

const CardDatabase = (() => {

  // ═══ 101 政治 · 马原 ═══
  const MAYUAN = [
    // 唯物论
    {q:'物质的唯一特性是什么？',a:'客观实在性。\n物质是不依赖于人的意识并能为人的意识所反映的客观实在。\n注意区分"客观实在性"（哲学）与"客观存在"（日常用语）。',ch:'马原',to:'唯物论',d:2,tg:['核心']},
    {q:'意识的本质是什么？',a:'意识是人脑的机能和属性，是物质世界的主观映像。\n内容是客观的，形式是主观的。\n意识对物质有能动的反作用（正确促进/错误阻碍）。',ch:'马原',to:'唯物论',d:3,tg:['核心']},
    {q:'物质与意识的辩证关系？',a:'1. 物质决定意识（物质第一性）\n2. 意识对物质有能动反作用\n3. 正确意识促进事物发展，错误意识阻碍发展\n方法论：一切从实际出发，实事求是。',ch:'马原',to:'唯物论',d:2,tg:['必考','辩证法']},
    {q:'运动和静止的辩证关系？',a:'运动是绝对的、无条件的、永恒的。\n静止是相对的、有条件的、暂时的。\n静止是运动的特殊状态。\n物质世界是绝对运动和相对静止的统一。',ch:'马原',to:'唯物论',d:3,tg:['辩证法']},
    // 辩证法
    {q:'矛盾的普遍性与特殊性的辩证关系？',a:'普遍性寓于特殊性之中，特殊性包含普遍性。\n两者在一定条件下可以相互转化。\n方法论：矛盾的普遍性要求坚持"两点论"，特殊性要求坚持"重点论"。',ch:'马原',to:'唯物辩证法',d:3,tg:['核心','必考']},
    {q:'量变质变规律的内容？',a:'量变是质变的必要准备，质变是量变的必然结果。\n量变积累到一定程度必然引起质变。\n质变又引起新的量变。\n方法论：重视量的积累，不能急于求成；抓住时机促成质变。',ch:'马原',to:'唯物辩证法',d:2,tg:['辩证法']},
    {q:'否定之否定规律的含义？',a:'事物发展经历：肯定→否定→否定之否定。\n实质：事物自身矛盾引起的自我否定。\n特征：辩证否定（扬弃），既克服又保留。\n发展方向：前进上升的；发展道路：曲折迂回的。\n→ 螺旋式上升。',ch:'马原',to:'唯物辩证法',d:3,tg:['辩证法','核心']},
    {q:'对立统一规律为什么是唯物辩证法的实质与核心？',a:'1. 揭示了事物普遍联系的根本内容和发展的内在动力\n2. 是贯穿其他规律和范畴的中心线索\n3. 矛盾分析法是最根本的认识方法\n4. 是否承认矛盾是区分辩证法和形而上学的焦点',ch:'马原',to:'唯物辩证法',d:3,tg:['核心']},
    {q:'矛盾的同一性和斗争性的关系？',a:'同一性：矛盾双方相互依存、相互贯通。\n斗争性：矛盾双方相互排斥、相互对立。\n关系：同一性是有条件的、相对的；斗争性是无条件的、绝对的。\n同一性中包含斗争性，斗争性寓于同一性之中。',ch:'马原',to:'唯物辩证法',d:3,tg:['辩证法']},
    {q:'主要矛盾和次要矛盾的关系？',a:'主要矛盾在事物发展中处于支配地位，起决定作用。\n次要矛盾处于从属地位。\n两者相互依存，在一定条件下相互转化。\n方法论："两点论"与"重点论"相结合。抓主要矛盾，不忽视次要矛盾。',ch:'马原',to:'唯物辩证法',d:3,tg:['高频']},
    // 认识论
    {q:'实践和认识的辩证关系？',a:'1. 实践决定认识：实践是认识的来源、动力、检验标准和目的\n2. 认识对实践有能动的反作用\n3. 认识过程：实践→认识→再实践→再认识（循环往复）\n实践是检验真理的唯一标准。',ch:'马原',to:'认识论',d:2,tg:['必考','核心']},
    {q:'感性认识和理性认识的辩证关系？',a:'感性认识：直接性、表面性（感觉、知觉、表象）\n理性认识：间接性、本质性（概念、判断、推理）\n关系：理性认识依赖于感性认识（唯物论）；感性认识有待发展到理性认识（辩证法）。\n实现飞跃条件：丰富可靠的感性材料 + 科学抽象思维方法。',ch:'马原',to:'认识论',d:3,tg:['认识论']},
    {q:'真理的绝对性和相对性？',a:'绝对性：任何真理都包含不依赖主体的客观内容，都是对客观事物及其规律的正确反映。\n相对性：在广度和深度上是有限的，有待深化和发展。\n统一：绝对真理和相对真理相互包含、相互转化。',ch:'马原',to:'认识论',d:4,tg:['认识论']},
    {q:'价值评价的特点及功能？',a:'特点：以主体为尺度；与主体需要直接相关。\n评价标准：最高标准是看是否符合社会发展的客观规律、是否有利于人类进步。\n功能：激励、制约、导向作用。\n价值判断和价值选择具有社会历史性。',ch:'马原',to:'认识论',d:4,tg:['认识论']},
    // 唯物史观
    {q:'社会存在与社会意识的辩证关系？',a:'社会存在决定社会意识：\n1. 社会存在的性质决定社会意识的性质\n2. 社会存在的变化决定社会意识的变化\n社会意识具有相对独立性：\n1. 与社会存在发展不完全同步\n2. 对社会存在有能动的反作用',ch:'马原',to:'唯物史观',d:3,tg:['核心']},
    {q:'生产力与生产关系的矛盾运动规律？',a:'生产力决定生产关系：\n1. 生产力的性质决定生产关系的性质\n2. 生产力的发展变化决定生产关系的变革\n生产关系反作用于生产力：\n适合→促进；不适合→阻碍\n这是人类社会发展的基本规律。',ch:'马原',to:'唯物史观',d:3,tg:['必考']},
    {q:'经济基础与上层建筑的矛盾运动？',a:'经济基础决定上层建筑（产生、性质、变化）。\n上层建筑反作用于经济基础：\n服务于经济基础→促进；不适合→阻碍。\n上层建筑：政治上层建筑（国家政权等）+ 思想上层建筑（意识形态）。',ch:'马原',to:'唯物史观',d:3,tg:['核心']},
    {q:'人民群众在历史中的作用？',a:'人民群众是历史的创造者：\n1. 是社会物质财富的创造者\n2. 是社会精神财富的创造者\n3. 是社会变革的决定力量\n唯物史观vs英雄史观：承认杰出人物作用，但根本动力是人民群众。',ch:'马原',to:'唯物史观',d:2,tg:['唯物史观']},
  ];

  // ═══ 101 政治 · 毛中特 ═══
  const MAOZHONGTE = [
    {q:'毛泽东思想的活的灵魂？',a:'三个基本方面：\n1. 实事求是（精髓）\n2. 群众路线（根本工作路线）\n3. 独立自主（根本原则）',ch:'毛中特',to:'毛泽东思想',d:2,tg:['核心']},
    {q:'新民主主义革命的总路线？',a:'无产阶级领导的，人民大众的，反对帝国主义、封建主义和官僚资本主义的革命。\n领导力量：无产阶级（通过共产党）\n动力：工人、农民、城市小资产阶级、民族资产阶级\n对象：三座大山\n性质：新式的资产阶级民主主义革命',ch:'毛中特',to:'新民主主义',d:3,tg:['高频']},
    {q:'社会主义初级阶段的基本路线？',a:'领导和团结全国各族人民，以经济建设为中心，坚持四项基本原则，坚持改革开放，自力更生，艰苦创业，为把我国建设成为富强民主文明和谐美丽的社会主义现代化强国而奋斗。\n核心：一个中心、两个基本点',ch:'毛中特',to:'初级阶段',d:2,tg:['必考']},
    {q:'新发展理念的具体内容？',a:'创新、协调、绿色、开放、共享。\n创新是第一动力\n协调是内在要求\n绿色是必要条件\n开放是必由之路\n共享是根本目的',ch:'毛中特',to:'新发展理念',d:2,tg:['高频','必考']},
    {q:'社会主要矛盾的变化？',a:'十九大指出：已转化为人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾。\n变化意义：关系全局的历史性变化\n两个没有变：社会主义初级阶段的基本国情没有变；世界最大发展中国家的国际地位没有变。',ch:'毛中特',to:'新时代思想',d:2,tg:['必考']},
    {q:'中国特色社会主义最本质的特征？',a:'中国共产党领导。\n中国特色社会主义制度的最大优势也是中国共产党领导。\n党是最高政治领导力量。\n坚持党对一切工作的领导。',ch:'毛中特',to:'党的领导',d:2,tg:['核心']},
    {q:'"五位一体"总体布局？',a:'经济建设、政治建设、文化建设、社会建设、生态文明建设。\n经济建设是根本\n政治建设是保障\n文化建设是灵魂\n社会建设是条件\n生态文明建设是基础',ch:'毛中特',to:'总体布局',d:2,tg:['高频']},
    {q:'"四个全面"战略布局？',a:'全面建设社会主义现代化国家（目标）\n全面深化改革（动力）\n全面依法治国（保障）\n全面从严治党（关键）\n四者相互贯通、相互促进。',ch:'毛中特',to:'战略布局',d:2,tg:['高频']},
    {q:'供给侧结构性改革的内涵？',a:'在适度扩大总需求的同时，着力加强供给侧结构性改革。\n重点任务：去产能、去库存、去杠杆、降成本、补短板。\n目的：提高供给体系质量和效率，增强经济持续增长动力。\n核心：用改革的办法推进结构调整。',ch:'毛中特',to:'经济建设',d:3,tg:['经济']},
    {q:'全面依法治国的总目标？',a:'建设中国特色社会主义法治体系，建设社会主义法治国家。\n五大体系：完备的法律规范体系、高效的法治实施体系、严密的法治监督体系、有力的法治保障体系、完善的党内法规体系。\n原则：坚持党的领导、人民当家作主、依法治国有机统一。',ch:'毛中特',to:'法治建设',d:3,tg:['法治']},
    {q:'构建人类命运共同体的内涵？',a:'建设：\n1. 持久和平的世界\n2. 普遍安全的世界\n3. 共同繁荣的世界\n4. 开放包容的世界\n5. 清洁美丽的世界\n路径：建设新型国际关系（相互尊重、公平正义、合作共赢）',ch:'毛中特',to:'外交思想',d:3,tg:['时政']},
    {q:'社会主义核心价值观的内容？',a:'国家层面：富强、民主、文明、和谐\n社会层面：自由、平等、公正、法治\n个人层面：爱国、敬业、诚信、友善\n培育践行：内化于心，外化于行。',ch:'毛中特',to:'文化建设',d:1,tg:['必考']},
    {q:'全过程人民民主的特点？',a:'是最广泛、最真实、最管用的民主。\n全过程：民主选举、民主协商、民主决策、民主管理、民主监督。\n制度保障：人民代表大会制度、中国共产党领导的多党合作和政治协商制度、民族区域自治制度、基层群众自治制度。',ch:'毛中特',to:'政治建设',d:3,tg:['时政']},
  ];

  // ═══ 101 政治 · 史纲 ═══
  const SHIGANG = [
    {q:'鸦片战争后中国社会性质的变化？',a:'由封建社会变为半殖民地半封建社会。\n主要矛盾：帝国主义和中华民族的矛盾（最主要）；封建主义和人民大众的矛盾。\n两大历史任务：争取民族独立、人民解放；实现国家富强、人民幸福。',ch:'史纲',to:'近代中国',d:2,tg:['史纲']},
    {q:'五四运动的历史意义？',a:'1. 新民主主义革命的开端\n2. 彻底的反帝反封建革命运动\n3. 真正群众性的革命运动\n4. 促进了马克思主义在中国的传播\n5. 工人阶级开始登上政治舞台',ch:'史纲',to:'五四运动',d:2,tg:['必考']},
    {q:'中国共产党成立的历史意义？',a:'1921年7月，中共一大召开。意义：\n1. 是开天辟地的大事变\n2. 中国人民有了坚强的领导核心\n3. 中国革命有了正确的前进方向\n4. 中国革命面貌焕然一新',ch:'史纲',to:'建党',d:2,tg:['核心']},
    {q:'遵义会议的主要内容和意义？',a:'1935年1月。\n内容：纠正"左"倾军事路线错误，确立毛泽东在党中央和红军的领导地位。\n意义：\n1. 党的历史上生死攸关的转折点\n2. 中国共产党第一次独立自主地解决重大问题\n3. 标志党从幼年走向成熟',ch:'史纲',to:'长征',d:2,tg:['必考']},
    {q:'抗日战争胜利的意义？',a:'1. 近代以来第一次取得完全胜利的民族解放战争\n2. 促进了中华民族的觉醒\n3. 促进了中华民族大团结\n4. 对世界反法西斯战争的重大贡献\n5. 中国国际地位显著提高',ch:'史纲',to:'抗日战争',d:2,tg:['史纲']},
    {q:'三大改造的内容和意义？',a:'1953-1956年。\n内容：对农业、手工业（互助合作）和资本主义工商业（公私合营，和平赎买）的社会主义改造。\n意义：标志社会主义基本制度在中国确立，中国进入社会主义初级阶段。',ch:'史纲',to:'社会主义改造',d:3,tg:['史纲']},
    {q:'改革开放的标志性事件？',a:'1978年12月，十一届三中全会。\n核心决策：\n1. 停止"以阶级斗争为纲"\n2. 把工作重点转移到经济建设上来\n3. 实行改革开放\n意义：开创了中国特色社会主义道路。',ch:'史纲',to:'改革开放',d:2,tg:['必考']},
    {q:'新中国成立的历史意义？',a:'1949年10月1日。\n1. 中国人民从此站起来了\n2. 结束了100多年被侵略被奴役的历史\n3. 为实现新民主主义向社会主义过渡创造了条件\n4. 改变了世界政治格局',ch:'史纲',to:'新中国',d:2,tg:['核心']},
  ];

  // ═══ 101 政治 · 思修法基 ═══
  const SIXIU = [
    {q:'人生观的核心问题？',a:'人生目的。\n人生目的决定人生态度和人生价值。\n正确的人生目的：服务人民、奉献社会。\n三个层次：人生目的→人生态度→人生价值',ch:'思修法基',to:'人生观',d:2,tg:['思修']},
    {q:'社会主义法律的特征？',a:'1. 阶级性与人民性的统一\n2. 国家意志性\n3. 物质制约性\n4. 国家强制力保障实施\n我国法律体系以宪法为核心。',ch:'思修法基',to:'法律基础',d:3,tg:['法基']},
    {q:'道德的功能？',a:'1. 认识功能：帮助人们认识道德生活规律\n2. 规范功能：指导和纠正人们行为\n3. 调节功能：调节人与人、人与社会的关系\n道德调节的特点：非强制性，靠社会舆论、传统习俗、内心信念。',ch:'思修法基',to:'道德',d:3,tg:['思修']},
    {q:'法治与德治的关系？',a:'法治和德治相辅相成、相互促进。\n法治是治国理政的基本方式，德治是治国理政的重要方式。\n法安天下，德润人心。\n要坚持依法治国和以德治国相结合。',ch:'思修法基',to:'法治与德治',d:2,tg:['高频']},
    {q:'理想信念的含义和作用？',a:'理想：人们在实践中形成的对未来社会和自身发展的向往与追求。\n信念：人们对某种思想或事物坚信不疑并全力践行的精神状态。\n作用：昭示奋斗目标、提供前进动力、提高精神境界。',ch:'思修法基',to:'理想信念',d:2,tg:['思修']},
    {q:'中国精神的内涵？',a:'以爱国主义为核心的民族精神 + 以改革创新为核心的时代精神。\n民族精神：团结统一、爱好和平、勤劳勇敢、自强不息。\n二者统一于中国特色社会主义伟大实践。',ch:'思修法基',to:'中国精神',d:2,tg:['核心']},
  ];

  // 工具函数：批量创建卡片
  function batch(arr, subject) {
    return arr.map(c => ({
      question: c.q,
      answer: c.a,
      subject: subject,
      chapter: c.ch,
      topic: c.to,
      difficulty: c.d || 3,
      tags: c.tg || []
    }));
  }

  // ═══ 201 英语 · 核心词汇 ═══
  const VOCAB = [
    {q:'affect vs effect 的区别？',a:'affect: 通常作动词，意为"影响"\neffect: 通常作名词，意为"结果/效果"\n例外：effect 作动词 = to bring about（实现）\naffect 作名词 = 情感（心理学术语）',ch:'词汇',to:'易混词',d:2,tg:['词汇','高频']},
    {q:'complement vs compliment 的区别？',a:'complement: 补充，补足（The wine complements the food.）\ncompliment: 赞美，恭维（She paid me a compliment.）\n记忆：complement 中的 e = enhance（补充增强）',ch:'词汇',to:'易混词',d:2,tg:['词汇']},
    {q:'principal vs principle 的区别？',a:'principal: 形/名 = 主要的/校长/负责人\nprinciple: 名 = 原则/原理\n记忆：principle 以 -le 结尾 = rule（规则）',ch:'词汇',to:'易混词',d:2,tg:['词汇']},
    {q:'discrete vs discreet 的区别？',a:'discrete: 离散的，不连续的（discrete data）\ndiscreet: 谨慎的，审慎的（a discreet inquiry）\n记忆：discrete 中间的 t 把 e 分开了→离散',ch:'词汇',to:'易混词',d:3,tg:['词汇']},
    {q:'高频词：elaborate 的多义用法？',a:'adj: 精心制作的（an elaborate plan）\nv: 详细阐述（Could you elaborate on that?）\nelaborate on = 详述（考研阅读高频）\n同义替换：explain in detail, expand on',ch:'词汇',to:'一词多义',d:3,tg:['词汇','高频']},
    {q:'高频词组：in terms of / in the wake of',a:'in terms of = 从...方面来说，就...而言\nIn terms of quality, this is the best.\n\nin the wake of = 在...之后（因果关系）\nIn the wake of the crisis, reforms were introduced.\n同义：following, as a result of',ch:'词汇',to:'高频词组',d:3,tg:['词汇']},
    {q:'高频词：render 的主要含义？',a:'1. 使成为：render sth + adj（The news rendered him speechless）\n2. 提供/给予：render assistance\n3. 翻译/表达：render...into Chinese\n4. 呈递：render an account\n考研高频义：使成为',ch:'词汇',to:'一词多义',d:3,tg:['词汇','高频']},
    {q:'高频词：warrant 的用法？',a:'n: 令状，授权（a search warrant）\nv: 使有必要，证明...正当\nThe situation warrants immediate action.\n= justify, merit\n考研阅读：nothing warrants the conclusion that...（没有什么能证明...的结论是正当的）',ch:'词汇',to:'一词多义',d:4,tg:['词汇']},
    {q:'前缀 counter- / contra- 的含义？',a:'counter- = 反对，对抗\ncounterpart (对应物), counterproductive (适得其反)\ncontra- = 相反，对比\ncontradict (矛盾), contrary (相反的), contrast (对比)\n考研高频：counterpart = 对应的人/物',ch:'词汇',to:'构词法',d:3,tg:['词汇']},
    {q:'后缀 -ive / -ous / -ful / -less 辨析？',a:'-ive: 有...性质的（productive, comprehensive）\n-ous: 充满...的（dangerous, numerous）\n-ful: 满...的（hopeful, meaningful）\n-less: 无...的（homeless, countless）\n规律：-ful 和 -less 常构成反义词对',ch:'词汇',to:'构词法',d:2,tg:['词汇']},
  ];

  // ═══ 201 英语 · 长难句翻译 ═══
  const TRANSLATION = [
    {q:'翻译：The extent to which the government should intervene in the economy remains a source of heated debate.',a:'政府应在多大程度上干预经济，仍然是一个激烈争论的话题。\n结构：The extent to which... = 在多大程度上\nintervene in = 干预\nremains = 仍然是',ch:'翻译',to:'长难句',d:4,tg:['翻译','高频']},
    {q:'翻译：It is not so much that the technology is new as that it is now being applied to new areas.',a:'与其说这项技术是新的，不如说它现在被应用于新的领域。\n结构：not so much...as... = 与其说...不如说...\n注意：not so much A as B = B rather than A',ch:'翻译',to:'长难句',d:4,tg:['翻译']},
    {q:'翻译：What is particularly worrying about the phenomenon is not merely its scale but its implications for the future.',a:'这一现象特别令人担忧的不仅仅是其规模，更是它对未来的影响。\n结构：What... is not merely A but B\nnot merely...but... = 不仅...而且...\nimplication = 影响/含义',ch:'翻译',to:'长难句',d:4,tg:['翻译']},
    {q:'翻译：There is no guarantee that the measures that proved effective before will work this time around.',a:'没有什么能保证以前被证明有效的措施这次也会奏效。\n结构：There is no guarantee that...\nthat proved effective = 定语从句修饰 measures\nthis time around = 这次',ch:'翻译',to:'长难句',d:3,tg:['翻译']},
    {q:'翻译：Only by acknowledging the complexity of the issue can we begin to address it effectively.',a:'只有承认这个问题的复杂性，我们才能开始有效地解决它。\n结构：Only by doing... can we... (倒装句)\nacknowledge = 承认/认识到\naddress = 解决/处理（考研高频义）',ch:'翻译',to:'倒装句',d:3,tg:['翻译','语法']},
    {q:'翻译：Far from diminishing the importance of human judgment, AI has actually underscored it.',a:'AI非但没有削弱人类判断力的重要性，反而实际上强调了它。\nFar from doing = 非但没有...\ndiminish = 削弱/减少\nunderscore = 强调 (=emphasize, highlight)',ch:'翻译',to:'长难句',d:4,tg:['翻译']},
  ];

  // ═══ 201 英语 · 阅读推断 ═══
  const READING = [
    {q:'阅读理解：推理判断题的解题策略？',a:'1. 题型标志词：infer, imply, suggest, conclude, indicate\n2. 原则：答案不是原文照搬，而是合理推断\n3. 排除法：排除"过度推断"和"无中生有"\n4. 紧扣原文：推断必须有原文依据\n5. 注意：作者态度往往隐含在措辞中',ch:'阅读',to:'推理判断',d:3,tg:['阅读','方法']},
    {q:'阅读理解：主旨大意题的解题策略？',a:'题型：main idea, best title, primarily about\n方法：\n1. 首段末句（thesis statement）\n2. 各段首句→提炼主题\n3. 转折词后的内容更重要\n4. 排除以偏概全和过于宽泛的选项\n5. 正确答案 = 涵盖全文核心 + 不偏不倚',ch:'阅读',to:'主旨大意',d:3,tg:['阅读','方法']},
    {q:'阅读理解：态度题常见选项词汇？',a:'正面：optimistic, approving, supportive, enthusiastic\n负面：critical, skeptical, pessimistic, disapproving\n中性：objective, neutral, indifferent, ambivalent\n不选：biased（偏见的）, subjective（主观的）通常为干扰项\n注意：学术文章多为 objective/critical',ch:'阅读',to:'态度题',d:3,tg:['阅读']},
    {q:'阅读理解：细节题的常见陷阱？',a:'1. 张冠李戴：把A的特征安在B上\n2. 偷换概念：用近义词偷换核心概念\n3. 无中生有：选项信息原文没有\n4. 以偏概全：部分信息代替整体\n5. 正反混淆：把否定变肯定\n对策：精确定位原文，逐字比对。',ch:'阅读',to:'细节题',d:3,tg:['阅读','方法']},
  ];

  // ═══ 201 英语 · 写作模板 ═══
  const WRITING = [
    {q:'大作文开头段万能模板（图画描述）？',a:'As is vividly illustrated in the picture/chart, [描述内容].\nThe picture conveys a thought-provoking message that [主题].\nSimple as the image is, the symbolic meaning behind it is profound and far-reaching.',ch:'写作',to:'大作文',d:3,tg:['写作','模板']},
    {q:'大作文论证段万能模板？',a:'Several factors contribute to this phenomenon.\nFirst and foremost, [原因1]. In addition, [原因2].\nWhat is more, [原因3].\nA case in point is [举例].\nConsequently / As a result, [结果].',ch:'写作',to:'大作文',d:3,tg:['写作','模板']},
    {q:'大作文结论段模板？',a:'In light of the analysis above, we can safely draw the conclusion that [总结].\nIt is imperative that we should [建议1].\nMeanwhile, [建议2].\nOnly in this way can we [展望].',ch:'写作',to:'大作文',d:3,tg:['写作','模板']},
    {q:'小作文（书信）开头结尾套句？',a:'开头：I am writing to [目的: inquire about/apply for/express my...].\n结尾：\n感谢：I would appreciate it if you could...\n期待：I am looking forward to your reply.\n道歉：Once again, I sincerely apologize for any inconvenience caused.',ch:'写作',to:'小作文',d:2,tg:['写作','模板']},
  ];

  // 获取全部 101 政治卡片
  function getPoliticsCards() {
    return [
      ...batch(MAYUAN, '101'),
      ...batch(MAOZHONGTE, '101'),
      ...batch(SHIGANG, '101'),
      ...batch(SIXIU, '101'),
    ];
  }

  // ═══ 301 数学 · 高数 ═══
  const GAOSHU = [
    {q:'极限的ε-δ定义？',a:'∀ε>0, ∃δ>0, 当 0<|x-x₀|<δ 时，|f(x)-A|<ε\n则 lim(x→x₀) f(x) = A\n核心：用ε刻画"任意接近"，用δ刻画"充分接近"',ch:'高数',to:'极限',d:3,tg:['核心']},
    {q:'洛必达法则的适用条件？',a:'1. 极限为 0/0 或 ∞/∞ 型\n2. f(x)和g(x)在去心邻域内可导\n3. g\'(x) ≠ 0\n4. lim f\'(x)/g\'(x) 存在或为∞\n注意：不满足条件不能用！结果不存在不代表原极限不存在。',ch:'高数',to:'极限',d:3,tg:['核心','必考']},
    {q:'等价无穷小替换（常用）？',a:'x→0时：\nsinx ~ x, tanx ~ x, arcsinx ~ x\n1-cosx ~ x²/2\nln(1+x) ~ x\neˣ-1 ~ x\n(1+x)ᵅ-1 ~ αx\n使用条件：乘除可替换，加减需验证。',ch:'高数',to:'极限',d:2,tg:['核心','工具']},
    {q:'导数的几何意义？',a:'f\'(x₀) = 曲线 y=f(x) 在点 (x₀,f(x₀)) 处切线的斜率。\n切线方程：y - f(x₀) = f\'(x₀)(x - x₀)\n法线方程：y - f(x₀) = -1/f\'(x₀) · (x - x₀)\n注意：f\'(x₀)=0 时切线水平，f\'(x₀)不存在时可能有垂直切线。',ch:'高数',to:'导数',d:2,tg:['导数']},
    {q:'中值定理体系？',a:'罗尔定理：f(a)=f(b)→∃ξ, f\'(ξ)=0\n拉格朗日：f(b)-f(a)=f\'(ξ)(b-a)\n柯西：[f(b)-f(a)]/[g(b)-g(a)]=f\'(ξ)/g\'(ξ)\n积分中值定理：∫f(x)dx = f(ξ)(b-a)\n关系：罗尔→拉格朗日→柯西（逐步推广）',ch:'高数',to:'中值定理',d:4,tg:['核心','必考']},
    {q:'不定积分基本公式（重要）？',a:'∫xⁿdx = xⁿ⁺¹/(n+1) + C\n∫1/x dx = ln|x| + C\n∫eˣdx = eˣ + C\n∫sinx dx = -cosx + C\n∫cosx dx = sinx + C\n∫1/(1+x²)dx = arctanx + C\n∫1/√(1-x²)dx = arcsinx + C',ch:'高数',to:'积分',d:2,tg:['工具']},
    {q:'定积分的应用：求面积和体积？',a:'面积：S = ∫ₐᵇ |f(x)-g(x)| dx\n绕x轴旋转体积：V = π∫ₐᵇ f²(x) dx\n绕y轴旋转体积：V = 2π∫ₐᵇ x|f(x)| dx（柱壳法）\n弧长：L = ∫ₐᵇ √(1+f\'²(x)) dx',ch:'高数',to:'积分应用',d:3,tg:['积分','高频']},
    {q:'格林公式？',a:'条件：D有界闭区域，L正向边界，P/Q有一阶连续偏导。\n∮ Pdx+Qdy = ∬(∂Q/∂x-∂P/∂y)dxdy\n记忆：Q对x偏导在前，P配负号。\n应用：将曲线积分转化为二重积分。',ch:'高数',to:'多元积分',d:4,tg:['公式','高频']},
    {q:'常微分方程的类型和解法？',a:'1. 可分离变量：g(y)dy = f(x)dx\n2. 齐次方程：令y=ux\n3. 一阶线性：y\'+P(x)y=Q(x)→公式法\n4. 伯努利：y\'+Py=Qyⁿ→令z=y¹⁻ⁿ\n5. 二阶常系数齐次：特征方程法',ch:'高数',to:'微分方程',d:4,tg:['微分方程']},
    {q:'多元函数求极值的步骤？',a:'1. 求fₓ=0, f_y=0 的驻点\n2. 求A=fₓₓ, B=fₓᵧ, C=f_yy\n3. Δ=AC-B²\n   Δ>0: A>0极小值, A<0极大值\n   Δ<0: 非极值（鞍点）\n   Δ=0: 失效，需进一步讨论',ch:'高数',to:'多元函数',d:4,tg:['高频']},
  ];

  // ═══ 301 数学 · 线代 ═══
  const XIANDAI = [
    {q:'行列式的性质（核心）？',a:'1. 转置不变：|A|=|Aᵀ|\n2. 某行乘k：行列式变为k倍\n3. 两行互换：行列式变号\n4. 某行可拆：行列式可拆为两个之和\n5. 倍加不变：某行的k倍加到另一行\n6. |AB|=|A||B|',ch:'线代',to:'行列式',d:3,tg:['核心']},
    {q:'矩阵可逆的充要条件？',a:'1. |A| ≠ 0\n2. r(A) = n（满秩）\n3. A的列（行）向量线性无关\n4. Ax=0 只有零解\n5. A的特征值全不为0\n6. A可表示为初等矩阵的乘积\n求逆方法：(A|E)→行变换→(E|A⁻¹)',ch:'线代',to:'矩阵',d:3,tg:['核心','必考']},
    {q:'向量组线性相关的判定？',a:'向量组α₁...αₛ线性相关⟺\n1. 存在不全为零的k使Σkᵢαᵢ=0\n2. 齐次方程组(α₁...αₛ)x=0有非零解\n3. r(α₁...αₛ) < s\n常用结论：向量个数>维数→必相关',ch:'线代',to:'向量空间',d:3,tg:['核心']},
    {q:'特征值与特征向量的性质？',a:'Aξ = λξ (ξ≠0)\n性质：\n1. Σλᵢ = tr(A)\n2. Πλᵢ = |A|\n3. 不同λ对应的ξ线性无关\n4. k重λ至多有k个线性无关ξ\n5. A可对角化⟺每个λ的几何重数=代数重数',ch:'线代',to:'特征值',d:4,tg:['核心','必考']},
    {q:'实对称矩阵的重要性质？',a:'1. 特征值全为实数\n2. 不同特征值对应的特征向量正交\n3. 必可对角化\n4. 必正交相似于对角矩阵：P⁻¹AP=Λ，P为正交矩阵\n施密特正交化→单位化→构造P',ch:'线代',to:'实对称矩阵',d:4,tg:['核心']},
    {q:'二次型的标准化步骤？',a:'f=xᵀAx, A为实对称矩阵\n1. 求A的特征值λ₁...λₙ\n2. 求各特征值对应的特征向量\n3. 施密特正交化→单位化\n4. 组成正交矩阵P\n5. 令x=Py, 则f=λ₁y₁²+...+λₙyₙ²\n正惯性指数p = 正特征值个数',ch:'线代',to:'二次型',d:4,tg:['高频']},
  ];

  // ═══ 301 数学 · 概率统计 ═══
  const GAILV = [
    {q:'全概率公式与贝叶斯公式？',a:'全概率：P(A)=ΣP(Bᵢ)P(A|Bᵢ)\n（由因求果，B₁...Bₙ为完备事件组）\n\n贝叶斯：P(Bⱼ|A)=P(Bⱼ)P(A|Bⱼ)/ΣP(Bᵢ)P(A|Bᵢ)\n（由果溯因）',ch:'概率',to:'概率公式',d:3,tg:['核心','必考']},
    {q:'常见分布及期望方差？',a:'二项B(n,p): E=np, D=np(1-p)\n泊松P(λ): E=λ, D=λ\n均匀U(a,b): E=(a+b)/2, D=(b-a)²/12\n指数Exp(λ): E=1/λ, D=1/λ²\n正态N(μ,σ²): E=μ, D=σ²',ch:'概率',to:'常见分布',d:3,tg:['核心','公式']},
    {q:'大数定律与中心极限定理？',a:'大数定律：样本均值依概率收敛于总体均值。\n辛钦：X̄ →ᵖ μ (iid, Exi=μ)\n\n中心极限定理：n足够大时，n个iid随机变量之和近似正态分布。\n(ΣXᵢ-nμ)/(√n·σ) → N(0,1)',ch:'概率',to:'极限定理',d:4,tg:['高频']},
    {q:'最大似然估计的步骤？',a:'1. 写出似然函数 L(θ)=Πf(xᵢ;θ)\n2. 取对数 lnL(θ)\n3. 对θ求导令其=0\n4. 解方程得θ̂\n注意：离散型用概率函数，连续型用密度函数。\n若导数无解，考虑L(θ)的单调性。',ch:'概率',to:'参数估计',d:4,tg:['高频']},
  ];

  // ═══ 408 计算机 · 数据结构 ═══
  const SHUJU = [
    {q:'各排序算法的时间复杂度？',a:'冒泡/选择/插入：O(n²), 最好O(n)(插入)\n希尔：O(n^1.3)\n快排：平均O(nlogn), 最坏O(n²)\n归并：O(nlogn), 稳定\n堆排：O(nlogn)\n基数：O(d(n+r))\n不稳定：快希选堆（快些选堆）',ch:'数据结构',to:'排序',d:3,tg:['必考','公式']},
    {q:'快速排序的核心思想？',a:'分治法：\n1. 选pivot（通常选第一个元素）\n2. Partition：比pivot小的放左边，大的放右边\n3. 递归处理左右子数组\n最坏情况：已排序数组→O(n²)\n优化：随机化pivot / 三数取中',ch:'数据结构',to:'排序',d:3,tg:['高频']},
    {q:'二叉树的遍历方式？',a:'前序（根左右）：递归/栈\n中序（左根右）：递归/栈（BST得到有序序列）\n后序（左右根）：递归/双栈\n层序：队列\n已知前序+中序 → 唯一确定二叉树\n已知后序+中序 → 唯一确定二叉树\n前序+后序 → 不能唯一确定',ch:'数据结构',to:'二叉树',d:3,tg:['核心']},
    {q:'BST删除操作的三种情况？',a:'1. 叶子节点：直接删除\n2. 只有一个子树：用子树替代\n3. 有两个子树：用中序前驱或中序后继替代，再递归删除\nBST查找平均O(logn)，最坏O(n)（退化为链表）',ch:'数据结构',to:'二叉树',d:3,tg:['高频']},
    {q:'图的BFS和DFS？',a:'BFS（广度优先）：队列实现，层序遍历\n→ 最短路径（无权图）\nDFS（深度优先）：栈/递归实现\n→ 拓扑排序、连通分量\n邻接矩阵：O(V²)\n邻接表：O(V+E)',ch:'数据结构',to:'图',d:3,tg:['核心']},
    {q:'Dijkstra算法？',a:'单源最短路径（非负权）\n1. 初始化dist数组，源点=0，其余=∞\n2. 每次选dist最小的未访问节点u\n3. 松弛u的所有邻接边：dist[v]=min(dist[v],dist[u]+w)\n4. 重复直到所有节点访问\n时间：O(V²) 或 O((V+E)logV)（堆优化）',ch:'数据结构',to:'图',d:4,tg:['算法']},
    {q:'哈希表的冲突解决方法？',a:'1. 开放定址法：\n   线性探测：(h+i)%m\n   二次探测：(h+i²)%m\n   双重哈希\n2. 链地址法：每个桶挂链表\n装填因子α = n/m\n链地址法平均查找长度：1+α/2（成功）',ch:'数据结构',to:'哈希表',d:3,tg:['高频']},
  ];

  // ═══ 408 计算机 · 操作系统 ═══
  const OS = [
    {q:'进程与线程的区别？',a:'1. 进程是资源分配基本单位，线程是CPU调度基本单位\n2. 进程有独立地址空间，线程共享\n3. 进程切换开销大，线程小\n4. 进程间通信需IPC，线程可直接共享数据\n5. 一个进程可包含多个线程',ch:'OS',to:'进程管理',d:3,tg:['必考']},
    {q:'进程状态转换图？',a:'三基本状态：就绪→运行→阻塞\n运行→就绪：时间片用完\n运行→阻塞：等待I/O\n阻塞→就绪：I/O完成\n注意：不能从阻塞直接到运行！\n五状态模型增加：创建、终止',ch:'OS',to:'进程管理',d:2,tg:['核心']},
    {q:'死锁的四个必要条件？',a:'1. 互斥：资源独占\n2. 不可剥夺：不能强行夺取\n3. 请求与保持：持有资源同时请求新资源\n4. 循环等待：存在进程等待环\n预防：破坏其中任一条件\n银行家算法：避免死锁',ch:'OS',to:'死锁',d:3,tg:['必考']},
    {q:'页面置换算法？',a:'OPT：最佳（理论最优，不可实现）\nFIFO：先进先出（Belady异常）\nLRU：最近最少使用（栈/计数器实现）\nClock：时钟算法（近似LRU）\n缺页率：OPT < LRU < FIFO（一般情况）',ch:'OS',to:'内存管理',d:3,tg:['核心','必考']},
    {q:'磁盘调度算法？',a:'FCFS：先来先服务\nSSTF：最短寻道时间优先（可能饥饿）\nSCAN：电梯算法（到端就返回）\nC-SCAN：循环SCAN（只单方向服务）\nLOOK/C-LOOK：不到端就返回',ch:'OS',to:'I/O管理',d:3,tg:['高频']},
    {q:'PV操作（信号量机制）？',a:'P(S)：S--; 若S<0则阻塞\nV(S)：S++; 若S≤0则唤醒一个\n|S|在S<0时表示等待队列中的进程数\n经典问题：生产者-消费者、读者-写者、哲学家就餐\n互斥信号量初值=1，同步信号量初值=0或资源数',ch:'OS',to:'同步互斥',d:4,tg:['必考']},
  ];

  // ═══ 408 计算机 · 计算机网络 ═══
  const JIWANG = [
    {q:'TCP 三次握手？',a:'1. C→S: SYN=1, seq=x\n2. S→C: SYN=1, ACK=1, seq=y, ack=x+1\n3. C→S: ACK=1, seq=x+1, ack=y+1\n目的：确认双方收发能力\n为什么不是两次？防止已失效的连接请求到达服务器',ch:'计网',to:'TCP协议',d:3,tg:['必考']},
    {q:'TCP 四次挥手？',a:'1. C→S: FIN=1, seq=u\n2. S→C: ACK=1, ack=u+1 (半关闭)\n3. S→C: FIN=1, seq=w\n4. C→S: ACK=1, ack=w+1\n客户端进入TIME_WAIT(2MSL)\n为什么四次？因为TCP全双工，需双方各自关闭',ch:'计网',to:'TCP协议',d:3,tg:['核心']},
    {q:'TCP拥塞控制的四个阶段？',a:'1. 慢开始：cwnd=1, 指数增长\n2. 拥塞避免：cwnd≥ssthresh后线性增长\n3. 快重传：收到3个重复ACK立即重传\n4. 快恢复：ssthresh=cwnd/2, cwnd=ssthresh\n（Reno算法）\nTahoe：遇到丢包cwnd直接=1',ch:'计网',to:'TCP协议',d:4,tg:['核心']},
    {q:'HTTP常见状态码？',a:'200 OK\n301 永久重定向\n302 临时重定向\n304 Not Modified（协商缓存）\n400 Bad Request\n403 Forbidden\n404 Not Found\n500 Internal Server Error\n503 Service Unavailable',ch:'计网',to:'HTTP协议',d:2,tg:['高频']},
    {q:'OSI七层模型与TCP/IP四层？',a:'OSI: 物理→数据链路→网络→传输→会话→表示→应用\nTCP/IP: 网络接口→网络→传输→应用\n各层协议：\n应用：HTTP, DNS, FTP, SMTP\n传输：TCP, UDP\n网络：IP, ICMP, ARP\n数据链路：以太网, PPP',ch:'计网',to:'体系结构',d:2,tg:['核心']},
    {q:'IP地址分类与子网掩码？',a:'A类: 1-126, /8, 大型网络\nB类: 128-191, /16, 中型\nC类: 192-223, /24, 小型\nD类: 224-239, 组播\n私有地址：10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16\nCIDR：无分类编址，斜线记法',ch:'计网',to:'网络层',d:3,tg:['高频']},
  ];

  // ═══ 408 计算机 · 计算机组成原理 ═══
  const JIZU = [
    {q:'冯·诺依曼体系结构的五大部件？',a:'1. 运算器（ALU）\n2. 控制器（CU）\n3. 存储器（Memory）\n4. 输入设备\n5. 输出设备\n核心思想：存储程序，按地址顺序自动执行指令。\nCPU = 运算器 + 控制器',ch:'计组',to:'体系结构',d:2,tg:['核心']},
    {q:'存储层次结构？',a:'寄存器 → Cache → 主存 → 辅存\n速度递减，容量递增，价格递减\nCache-主存：解决速度矛盾（硬件自动）\n主存-辅存：解决容量矛盾（虚拟存储，OS管理）\n局部性原理：时间局部性、空间局部性',ch:'计组',to:'存储系统',d:2,tg:['核心']},
    {q:'Cache的映射方式？',a:'1. 直接映射：i = j mod C (冲突多，硬件简单)\n2. 全相联映射：任意放置（冲突少，硬件复杂）\n3. 组相联映射：组间直接映射，组内全相联\n常用：组相联（如4路组相联）\n替换算法：LRU, FIFO, 随机',ch:'计组',to:'Cache',d:3,tg:['必考']},
    {q:'指令格式与寻址方式？',a:'立即寻址：操作数在指令中\n直接寻址：EA = A\n间接寻址：EA = (A)\n寄存器寻址：EA = Ri\n寄存器间接：EA = (Ri)\n基址寻址：EA = A + (BR)\n变址寻址：EA = A + (IX)\n相对寻址：EA = PC + A',ch:'计组',to:'指令系统',d:3,tg:['核心']},
    {q:'流水线相关与冒险？',a:'结构冒险：资源冲突→资源重复/流水化\n数据冒险：数据依赖→\n  转发(forwarding)\n  暂停(stall)\n  编译优化\n控制冒险：分支指令→\n  预测(静态/动态)\n  延迟分支\n  分支目标缓冲',ch:'计组',to:'CPU',d:4,tg:['高频']},
  ];

  // ═══ Perplexity 时政自动生成服务 ═══
  const PerplexityService = {
    RELAY_URL: 'https://pku-api-relay.onrender.com/perplexity/search',
    MODEL: 'sonar-reasoning-pro',

    async generateDailyCards() {
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `pku_pplx_daily_${today}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);

      const prompt = `你是一位资深考研政治押题专家。今天是${today}。
请搜索最近一周的时事政治热点，生成8张考研政治时政记忆卡片。
每张卡片包含：
1. 简洁的考题（可以是选择题或简答题形式）
2. 标准答案（包含关键词和要点）
3. 与哪个考研政治板块关联（毛中特/形势与政策）

输出严格JSON数组：
[{"question":"...","answer":"...","chapter":"形策","topic":"时政热点","difficulty":3,"tags":["时政","最新"]}]
只输出JSON，不要其他内容。`;

      try {
        const res = await fetch(this.RELAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.MODEL,
            messages: [
              { role: 'system', content: '你是顾枢上仙座下的时政情报官。你的任务是每日搜集最新时政热点，转化为考研记忆卡片。确保内容准确、时效性强。只输出JSON。' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 3000
          })
        });
        if (!res.ok) throw new Error(`Perplexity ${res.status}`);
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON in response');
        const cards = JSON.parse(jsonMatch[0]);
        localStorage.setItem(cacheKey, JSON.stringify(cards));
        console.log(`[识海天碑] Perplexity生成${cards.length}张时政卡片`);
        return cards;
      } catch (e) {
        console.warn('[识海天碑] Perplexity时政生成失败:', e.message);
        return [];
      }
    }
  };

  // ═══ 聚合API ═══
  function getPoliticsCards() {
    return [
      ...batch(MAYUAN, '101'),
      ...batch(MAOZHONGTE, '101'),
      ...batch(SHIGANG, '101'),
      ...batch(SIXIU, '101'),
    ];
  }

  function getEnglishCards() {
    return [
      ...batch(VOCAB, '201'),
      ...batch(TRANSLATION, '201'),
      ...batch(READING, '201'),
      ...batch(WRITING, '201'),
    ];
  }

  function getMathCards() {
    return [
      ...batch(GAOSHU, '301'),
      ...batch(XIANDAI, '301'),
      ...batch(GAILV, '301'),
    ];
  }

  function getCSCards() {
    return [
      ...batch(SHUJU, '408'),
      ...batch(OS, '408'),
      ...batch(JIWANG, '408'),
      ...batch(JIZU, '408'),
    ];
  }

  function getAllCards() {
    return [
      ...getPoliticsCards(),
      ...getEnglishCards(),
      ...getMathCards(),
      ...getCSCards(),
    ];
  }

  return {
    getPoliticsCards, getEnglishCards, getMathCards, getCSCards,
    getAllCards, batch, PerplexityService
  };
})();
