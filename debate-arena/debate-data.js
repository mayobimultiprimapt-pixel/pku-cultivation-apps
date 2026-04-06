/**
 * 论道殿 · 诸天舌战 — 案件库 + 卡牌系统
 * ========================================
 * 破→立→论证链 三阶段法庭对抗
 * 政治：时政案件 + 原理破局 + 申论对策
 * 英语：段落仲裁 + 谬误击碎 + 逻辑锁定
 */

const CaseDB = (() => {

  // ═══ 破谬卡牌类型 ═══
  const BREAK_CARDS = [
    {id:'absolute',   name:'绝对化击破', icon:'🔨', desc:'选项出现"一切/完全/必然"'},
    {id:'causal',     name:'因果倒置击破', icon:'🔨', desc:'颠倒了因果关系'},
    {id:'partial',    name:'以偏概全击破', icon:'🔨', desc:'个案推广为普遍'},
    {id:'swap',       name:'偷换概念击破', icon:'🔨', desc:'用相似概念替换'},
    {id:'outdated',   name:'过时论据击破', icon:'🔨', desc:'用旧政策解释新问题'},
    {id:'overinfer',  name:'过度推断击破', icon:'🔨', desc:'推断超出原文支持'},
  ];

  // ═══ 政治案件库 ═══
  const POLITICS_CASES = [
    {
      id:'pc01', diff:2,
      title:'《关于"新质生产力"的决策审议》',
      text:'习近平总书记指出要加快发展新质生产力。某地方政府在推进中，出现了两种对立观点。请作为主理官，厘清事实，驳斥谬误。',
      plaintiff: {label:'原告（错误观点）', text:'主张"只要引进AI技术就能自动实现新质生产力，无需改革生产关系"。'},
      defendant: {label:'被告（模糊立场）', text:'主张"应全面暂停传统产业以集中资源发展高科技"。'},
      // ------- 破阶段：识别谬误 -------
      breakPhase: {
        fallacies: [
          {text:'"引进技术就自动实现"——忽视了生产关系的配套调整', type:'partial', hint:'以偏概全：技术只是生产力一个方面'},
          {text:'"全面暂停传统产业"——极端化处理，无视现实', type:'absolute', hint:'绝对化：不能"全面"暂停'},
        ],
        distractors: ['causal','outdated'],  // 干扰选项
      },
      // ------- 立阶段：选原理+政策 -------
      buildPhase: {
        slots: [
          {label:'定性(是什么)', correct:'生产力决定', desc:'新质生产力本质是生产力的跃升'},
          {label:'原理(为什么)', correct:'量变质变', desc:'技术积累(量变)→产业升级(质变)'},
          {label:'对策(怎么办)', correct:'创新驱动', desc:'科技创新+体制改革双轮驱动'},
        ],
        pool: ['生产力决定','量变质变','创新驱动','否定之否定','矛盾同一性','阶级分析','计划经济','平均主义'],
      },
      // ------- 论证链阶段 -------
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
        passage: '共同富裕不是___①___，而是在做大“蛋糕”的基础上，通过___②___、再分配和___③___协调配套，实现全体人民在___④___中共同富裕。',
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
  ];

  // ═══ 英语案件库 ═══
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

  function getCases(mode) {
    const pool = mode === 'english' ? ENGLISH_CASES : POLITICS_CASES;
    return shuffle([...pool]);
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

  return { getCases, getBreakCards, shuffle, BREAK_CARDS, POLITICS_CASES, ENGLISH_CASES };
})();
