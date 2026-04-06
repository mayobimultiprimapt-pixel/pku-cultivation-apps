/**
 * 骗子酒馆 · NPC + 发言库
 * ========================================
 * 3位酒客 × 真/假发言 × 微表情
 */
const TavernData = (() => {
  // ═══ NPC 角色 ═══
  const NPCS = [
    {
      id:'fox', name:'狐教授', emoji:'🦊',
      title:'学术圈的老狐狸',
      style:'巧舌如簧，措辞华丽，最擅长把假话包装得像教科书',
      lieRate:0.6,
      tells:['他说谎时左眼会微微眨动','注意他摸酒杯的频率'],
      tellAnim:'eye-twitch', // CSS class
      truePhrases:['哼，这种基础知识还用说？','本教授岂会说谎，品鉴一下——','信不信由你，但事实就是——'],
      liePhrases:['嗯...让我想想...这个嘛——','本教授可以负责任地说——','这是学界公认的，你可以查——'],
      taunts:['啧啧，太嫩了','又上当了？','本教授出手，你挡不住的'],
      scared:['这...你怎么看出来的？','运气好而已！','下次不会这么简单了'],
    },
    {
      id:'owl', name:'枭博士', emoji:'🦉',
      title:'总在推眼镜的学究',
      style:'学术型，动不动引用论文和数据，但紧张时会露馅',
      lieRate:0.3,
      tells:['她紧张时推眼镜的频率会变高','说谎时语速会变慢'],
      tellAnim:'push-glasses',
      truePhrases:['根据教材第X章——','这是基本常识——','学术界早有定论——'],
      liePhrases:['嗯...如果我没记错的话...','这个...大概是这样的——','根据...某篇论文...'],
      taunts:['数据不会说谎，但你会看错','你需要回去多读两本书'],
      scared:['你...你怎么知道我在说谎？','我只是记混了！不是故意的！'],
    },
    {
      id:'tiger', name:'虎掌柜', emoji:'🐯',
      title:'酒馆的主人',
      style:'豪迈直接，说话像拍桌子，但骗你的时候会突然温柔劝酒',
      lieRate:0.5,
      tells:['他说谎时会不自觉地摸脸上的伤疤','骗你时会主动劝你喝酒'],
      tellAnim:'touch-scar',
      truePhrases:['老子跟你说！','这是铁打的事实——','在我酒馆里，没人敢说假话——'],
      liePhrases:['来来来，先喝一杯再说——','兄弟，这事儿吧...','你先别急，听我慢慢说——'],
      taunts:['哈哈哈！你太老实了！','在我的地盘，你玩不过我'],
      scared:['嘶...你小子眼睛挺毒啊','行行行，算你厉害'],
    }
  ];

  // ═══ 发言库 ═══
  const CLAIMS = {
    politics: [
      // ── 假话(精心包装的错误知识) ──
      {speaker:'fox', claim:'共同富裕就是同步富裕，要求所有人同时达到相同的收入水平。', isLie:true,
       truth:'共同富裕不等于同步同等富裕，是分阶段促进、允许差异的。', difficulty:1},
      {speaker:'tiger', claim:'新质生产力的核心标志是GDP增长速度的大幅提升。', isLie:true,
       truth:'新质生产力的核心标志是全要素生产率的大幅提升，不是GDP增速。', difficulty:1},
      {speaker:'owl', claim:'否定之否定规律揭示了事物发展的源泉和动力。', isLie:true,
       truth:'矛盾规律才揭示源泉和动力；否定之否定揭示方向和道路（前进性+曲折性）。', difficulty:2},
      {speaker:'fox', claim:'上层建筑决定经济基础，所以制度改革是根本动力。', isLie:true,
       truth:'经济基础决定上层建筑，不是反过来。上层建筑有反作用但不是决定作用。', difficulty:2},
      {speaker:'tiger', claim:'中国式现代化最本质的特征是全面市场经济体制。', isLie:true,
       truth:'中国式现代化最本质的特征是中国共产党的领导。', difficulty:1},
      {speaker:'owl', claim:'实践是认识的唯一来源，所以书本知识不算真正的认识。', isLie:true,
       truth:'实践是认识的来源，但间接经验（书本知识）也是获取认识的途径，只是归根到底来源于实践。', difficulty:3},
      {speaker:'fox', claim:'量变积累到一定程度就一定会发生质变，这是自动的过程。', isLie:true,
       truth:'量变是质变的必要准备，但质变还需要条件，不是自动的。主观能动性也起作用。', difficulty:3},
      {speaker:'tiger', claim:'社会存在和社会意识是始终同步变化的。', isLie:true,
       truth:'社会意识具有相对独立性，可能超前或落后于社会存在，不一定同步。', difficulty:2},
      // ── 真话 ──
      {speaker:'owl', claim:'实践是检验真理的唯一标准，这是由实践的直接现实性决定的。', isLie:false,
       truth:'', difficulty:1},
      {speaker:'fox', claim:'社会主义的根本任务是解放和发展社会生产力。', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'量变是质变的必要准备，质变是量变的必然结果。', isLie:false, truth:'', difficulty:1},
      {speaker:'owl', claim:'人民群众是历史的创造者，这是历史唯物主义的根本观点。', isLie:false, truth:'', difficulty:1},
      {speaker:'fox', claim:'高质量发展是全面建设社会主义现代化国家的首要任务。', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'社会存在决定社会意识，这是历史观的基本问题。', isLie:false, truth:'', difficulty:2},
      {speaker:'owl', claim:'矛盾的主要方面决定事物的性质。', isLie:false, truth:'', difficulty:2},
      {speaker:'fox', claim:'全面依法治国的总目标是建设中国特色社会主义法治体系。', isLie:false, truth:'', difficulty:2},
      {speaker:'tiger', claim:'我国社会主要矛盾是人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾。', isLie:false, truth:'', difficulty:2},
      {speaker:'owl', claim:'矛盾分析法是唯物辩证法的根本方法。', isLie:false, truth:'', difficulty:3},
    ],
    english: [
      // ── 假话 ──
      {speaker:'fox', claim:'"Ubiquitous" means extremely rare and hard to find.', isLie:true,
       truth:'Ubiquitous means "found everywhere", the exact opposite of rare.', difficulty:1},
      {speaker:'tiger', claim:'"Pragmatic" describes someone who is idealistic and theoretical.', isLie:true,
       truth:'Pragmatic means practical and realistic, the opposite of idealistic.', difficulty:1},
      {speaker:'owl', claim:'"Exacerbate" means to improve or fix a problematic situation.', isLie:true,
       truth:'Exacerbate means to make worse, not improve. (ex+acerb = make more bitter)', difficulty:2},
      {speaker:'fox', claim:'"Mitigate" means to intensify or make something more severe.', isLie:true,
       truth:'Mitigate means to lessen or reduce severity, the opposite of intensify.', difficulty:2},
      {speaker:'tiger', claim:'"Ambivalent" means being absolutely certain about a decision.', isLie:true,
       truth:'Ambivalent means having mixed/conflicting feelings. (ambi = both sides)', difficulty:2},
      {speaker:'owl', claim:'"Refute" and "deny" are completely interchangeable in academic writing.', isLie:true,
       truth:'Refute means to disprove with evidence; deny simply means to reject. They are NOT interchangeable.', difficulty:3},
      // ── 真话 ──
      {speaker:'owl', claim:'"Albeit" is a conjunction meaning "although" or "even though".', isLie:false, truth:'', difficulty:1},
      {speaker:'fox', claim:'"Corroborate" means to support or confirm with evidence.', isLie:false, truth:'', difficulty:1},
      {speaker:'tiger', claim:'"Empirical" refers to evidence based on observation and experiment.', isLie:false, truth:'', difficulty:1},
      {speaker:'owl', claim:'"Sardonic" describes a tone that is mockingly cynical or scornful.', isLie:false, truth:'', difficulty:2},
      {speaker:'fox', claim:'"Notwithstanding" is a formal word meaning "in spite of" or "despite".', isLie:false, truth:'', difficulty:2},
      {speaker:'tiger', claim:'"Comprehensive" means thorough and all-inclusive.', isLie:false, truth:'', difficulty:1},
    ]
  };

  function getNPC(id) { return NPCS.find(n => n.id === id); }
  function getAllNPCs() { return [...NPCS]; }

  /**
   * Build a round set: 6 rounds, ensuring mix of lies and truths
   * Each round picks from the claims pool, difficulty escalating
   */
  function buildRounds(subject, count=6) {
    const pool = [...(CLAIMS[subject] || CLAIMS.politics)];
    // Shuffle
    for(let i=pool.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [pool[i],pool[j]]=[pool[j],pool[i]];
    }
    // Sort by difficulty
    pool.sort((a,b) => a.difficulty - b.difficulty);

    // Ensure at least 2 lies and 2 truths in first 6
    const lies = pool.filter(c => c.isLie);
    const truths = pool.filter(c => !c.isLie);
    const rounds = [];
    // Alternate-ish: guarantee variety
    for(let i=0; i<count; i++) {
      if(i < 2) {
        // Easy rounds: 1 lie, 1 truth
        rounds.push(i%2===0 ? (lies.shift()||truths.shift()) : (truths.shift()||lies.shift()));
      } else if(i < 4) {
        // Medium: biased toward lies
        rounds.push(Math.random()<0.6 ? (lies.shift()||truths.shift()) : (truths.shift()||lies.shift()));
      } else {
        // Hard: anything goes
        rounds.push((Math.random()<0.5 ? lies : truths).shift() || pool.shift());
      }
    }
    // Fill any nulls
    return rounds.filter(Boolean).slice(0, count);
  }

  return { getNPC, getAllNPCs, buildRounds, CLAIMS };
})();
