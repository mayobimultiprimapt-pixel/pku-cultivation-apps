/* ============================================
   CARDS.JS — 塔罗牌完整数据库 + 渲染系统
   78张牌 = 22大阿尔卡那 + 56小阿尔卡那
   ============================================ */

// ---- 22 Major Arcana ----
const MAJOR_ARCANA = [
    { id: 0, numeral: '0', nameEn: 'The Fool', nameCn: '愚者', icon: '🃏', subject: 408, topic: '入门概论',
      upright: { desc: '闪避+50%, 随机抽题', dmg: 5000, effect: 'dodge' },
      reversed: { desc: '无法查看提示, 但经验×2', dmg: 8000, effect: 'blind' },
      color: '#00d4ff' },
    { id: 1, numeral: 'I', nameEn: 'The Magician', nameCn: '魔术师', icon: '🧙', subject: 408, topic: '数据结构-线性表',
      upright: { desc: '精准攻击, 稳定输出', dmg: 8000, effect: 'precise' },
      reversed: { desc: '消耗双倍理智, 伤害×3', dmg: 24000, effect: 'overload' },
      color: '#b44aff' },
    { id: 2, numeral: 'II', nameEn: 'The High Priestess', nameCn: '女祭司', icon: '🌙', subject: 408, topic: '数据结构-树与二叉树',
      upright: { desc: '揭示Boss弱点科目', dmg: 6000, effect: 'reveal' },
      reversed: { desc: '全揭示但理智-200', dmg: 10000, effect: 'omniscience' },
      color: '#4a6aff' },
    { id: 3, numeral: 'III', nameEn: 'The Empress', nameCn: '女皇', icon: '👑', subject: 201, topic: '英语阅读理解',
      upright: { desc: '回复HP 15%', dmg: 3000, effect: 'heal' },
      reversed: { desc: '过度回复, 理智-100', dmg: 5000, effect: 'overheal' },
      color: '#00ff88' },
    { id: 4, numeral: 'IV', nameEn: 'The Emperor', nameCn: '皇帝', icon: '🏛️', subject: 101, topic: '马克思主义基本原理',
      upright: { desc: '防御+30%, 稳固', dmg: 7000, effect: 'fortify' },
      reversed: { desc: '防御破碎, 反击伤害×2', dmg: 14000, effect: 'counter' },
      color: '#ff6432' },
    { id: 5, numeral: 'V', nameEn: 'The Hierophant', nameCn: '教皇', icon: '⛪', subject: 101, topic: '毛泽东思想概论',
      upright: { desc: '全队增益, 链式+1', dmg: 6000, effect: 'bless' },
      reversed: { desc: '教条束缚, 下回合不能出牌', dmg: 12000, effect: 'dogma' },
      color: '#ffd700' },
    { id: 6, numeral: 'VI', nameEn: 'The Lovers', nameCn: '恋人', icon: '💕', subject: 201, topic: '英语完形填空',
      upright: { desc: '选择正确答案概率+20%', dmg: 5500, effect: 'intuition' },
      reversed: { desc: '犹豫不决, 时间减半', dmg: 9000, effect: 'hesitate' },
      color: '#ff69b4' },
    { id: 7, numeral: 'VII', nameEn: 'The Chariot', nameCn: '战车', icon: '⚔️', subject: 408, topic: '数据结构-图',
      upright: { desc: '连续攻击2次', dmg: 6000, effect: 'rush' },
      reversed: { desc: '失控暴走, 随机3次攻击', dmg: 4000, effect: 'rampage' },
      color: '#ff2d55' },
    { id: 8, numeral: 'VIII', nameEn: 'Strength', nameCn: '力量', icon: '💪', subject: 301, topic: '高等数学-极限与连续',
      upright: { desc: '物理伤害大幅增加', dmg: 12000, effect: 'power' },
      reversed: { desc: '力量失控, 自损10%HP', dmg: 20000, effect: 'berserk' },
      color: '#ff8c00' },
    { id: 9, numeral: 'IX', nameEn: 'The Hermit', nameCn: '隐者', icon: '🏮', subject: 408, topic: '操作系统-进程管理',
      upright: { desc: '发现隐藏弱点/知识点', dmg: 7000, effect: 'search' },
      reversed: { desc: '孤立无援, 无法使用道具', dmg: 11000, effect: 'isolate' },
      color: '#808080' },
    { id: 10, numeral: 'X', nameEn: 'Wheel of Fortune', nameCn: '命运之轮', icon: '🎡', subject: 301, topic: '线性代数-矩阵',
      upright: { desc: '随机大幅增益一项属性', dmg: 0, effect: 'fortune' },
      reversed: { desc: '随机大幅降低一项属性', dmg: 0, effect: 'misfortune' },
      color: '#daa520' },
    { id: 11, numeral: 'XI', nameEn: 'Justice', nameCn: '正义', icon: '⚖️', subject: 101, topic: '思想道德与法治',
      upright: { desc: '答题正确率评判, 全对则暴击', dmg: 9000, effect: 'judge' },
      reversed: { desc: '审判偏差, 答对也可能无效', dmg: 15000, effect: 'misjudge' },
      color: '#4169e1' },
    { id: 12, numeral: 'XII', nameEn: 'The Hanged Man', nameCn: '倒吊人', icon: '🙃', subject: 301, topic: '高等数学-微分',
      upright: { desc: '牺牲本回合, 下回合伤害×2', dmg: 0, effect: 'sacrifice' },
      reversed: { desc: '无法脱离, 连续2回合无法行动', dmg: 0, effect: 'stuck' },
      color: '#6a5acd' },
    { id: 13, numeral: 'XIII', nameEn: 'Death', nameCn: '死神', icon: '💀', subject: 408, topic: '计算机组成原理',
      upright: { desc: '终结当前状态, 重置全部Buff', dmg: 15000, effect: 'reset' },
      reversed: { desc: '不死鸟, HP降至1但无敌1回合', dmg: 25000, effect: 'phoenix' },
      color: '#2f2f2f' },
    { id: 14, numeral: 'XIV', nameEn: 'Temperance', nameCn: '节制', icon: '🏺', subject: 201, topic: '英语翻译与写作',
      upright: { desc: '平衡HP和理智至均值', dmg: 5000, effect: 'balance' },
      reversed: { desc: '失衡, 高属性降低低属性提升', dmg: 8000, effect: 'imbalance' },
      color: '#87ceeb' },
    { id: 15, numeral: 'XV', nameEn: 'The Devil', nameCn: '恶魔', icon: '😈', subject: 408, topic: '计算机网络',
      upright: { desc: '诱惑Boss, 使其本回合不攻击', dmg: 10000, effect: 'tempt' },
      reversed: { desc: '牺牲50%HP, 全屏爆发', dmg: 35000, effect: 'inferno' },
      color: '#8b0000' },
    { id: 16, numeral: 'XVI', nameEn: 'The Tower', nameCn: '高塔', icon: '🗼', subject: 408, topic: '操作系统-死锁',
      upright: { desc: '环境崩塌, 全体受伤含Boss', dmg: 18000, effect: 'collapse' },
      reversed: { desc: '全场AoE, 自损30%HP', dmg: 30000, effect: 'armageddon' },
      color: '#dc143c' },
    { id: 17, numeral: 'XVII', nameEn: 'The Star', nameCn: '星星', icon: '⭐', subject: 301, topic: '概率论与数理统计',
      upright: { desc: '希望之光, 回复所有资源20%', dmg: 4000, effect: 'hope' },
      reversed: { desc: '陨落, 下次答错不扣分', dmg: 6000, effect: 'fallingStar' },
      color: '#fffacd' },
    { id: 18, numeral: 'XVIII', nameEn: 'The Moon', nameCn: '月亮', icon: '🌙', subject: 201, topic: '英语新题型',
      upright: { desc: '迷雾笼罩, Boss命中率-30%', dmg: 5000, effect: 'fog' },
      reversed: { desc: '幻觉, 题目选项随机打乱', dmg: 9000, effect: 'illusion' },
      color: '#c0c0c0' },
    { id: 19, numeral: 'XIX', nameEn: 'The Sun', nameCn: '太阳', icon: '☀️', subject: 301, topic: '高等数学-积分',
      upright: { desc: '全属性+15%, 士气高涨', dmg: 8000, effect: 'radiance' },
      reversed: { desc: '灼烧, 持续掉HP但伤害+50%', dmg: 12000, effect: 'scorch' },
      color: '#ffa500' },
    { id: 20, numeral: 'XX', nameEn: 'Judgement', nameCn: '审判', icon: '📯', subject: 101, topic: '中国近现代史纲要',
      upright: { desc: '终极审判, 根据总正确率成倍伤害', dmg: 20000, effect: 'finalJudge' },
      reversed: { desc: '末日审判, 全体属性归零后重分配', dmg: 0, effect: 'apocalypse' },
      color: '#ffd700' },
    { id: 21, numeral: 'XXI', nameEn: 'The World', nameCn: '世界', icon: '🌍', subject: 408, topic: '综合测试',
      upright: { desc: '世界之力, 全属性+30%', dmg: 25000, effect: 'worldPower' },
      reversed: { desc: '世界崩塌, 触发隐藏Boss', dmg: 40000, effect: 'worldEnd' },
      color: '#00ced1' }
];

// ---- 56 Minor Arcana ----
const SUIT_CONFIG = {
    wands:     { nameCn: '权杖', icon: '🗡️', subject: 101, subjectName: '政治',   element: '火', color: '#ff6432' },
    cups:      { nameCn: '圣杯', icon: '🏆', subject: 201, subjectName: '英语',   element: '水', color: '#00b4ff' },
    pentacles: { nameCn: '星币', icon: '⭐', subject: 301, subjectName: '数学',   element: '土', color: '#ffd700' },
    swords:    { nameCn: '宝剑', icon: '⚔️', subject: 408, subjectName: '计算机', element: '风', color: '#b44aff' }
};

const MINOR_NUMBERS = [
    { num: 1,  name: 'Ace',   nameCn: '王牌' },
    { num: 2,  name: 'Two',   nameCn: '二' },
    { num: 3,  name: 'Three', nameCn: '三' },
    { num: 4,  name: 'Four',  nameCn: '四' },
    { num: 5,  name: 'Five',  nameCn: '五' },
    { num: 6,  name: 'Six',   nameCn: '六' },
    { num: 7,  name: 'Seven', nameCn: '七' },
    { num: 8,  name: 'Eight', nameCn: '八' },
    { num: 9,  name: 'Nine',  nameCn: '九' },
    { num: 10, name: 'Ten',   nameCn: '十' },
    { num: 11, name: 'Page',  nameCn: '侍从' },
    { num: 12, name: 'Knight',nameCn: '骑士' },
    { num: 13, name: 'Queen', nameCn: '王后' },
    { num: 14, name: 'King',  nameCn: '国王' }
];

const MINOR_TOPICS = {
    wands: ['唯物论', '辩证法', '认识论', '历史唯物主义', '资本主义论', '社会主义论', '共产主义', '政治经济学', '科学社会主义', '时事政治', '党史', '改革开放', '新时代思想', '政治制度'],
    cups: ['阅读A节', '阅读B节', '完形填空', '翻译技巧', '写作模板', '词汇辨析', '长难句分析', '语法要点', '作文审题', '新题型策略', '听力技巧', '同义替换', '段落排序', '信息匹配'],
    pentacles: ['极限', '导数', '微分方程', '重积分', '级数', '向量代数', '行列式', '矩阵运算', '向量空间', '特征值', '二次型', '概率基础', '随机变量', '假设检验'],
    swords: ['线性表', '栈与队列', '树与森林', '图算法', '排序算法', '查找算法', 'CPU组成', '指令系统', '存储系统', '总线与IO', '进程与线程', '内存管理', '网络模型', '传输控制']
};

function generateMinorArcana() {
    const minor = [];
    let id = 22;
    for (const [suit, config] of Object.entries(SUIT_CONFIG)) {
        const topics = MINOR_TOPICS[suit];
        MINOR_NUMBERS.forEach((num, idx) => {
            minor.push({
                id: id++,
                numeral: num.num <= 10 ? String(num.num) : num.name[0],
                nameEn: `${num.name} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
                nameCn: `${config.nameCn}${num.nameCn}`,
                icon: config.icon,
                suit,
                subject: config.subject,
                topic: topics[idx] || config.subjectName,
                upright: {
                    desc: `${config.element}元素攻击 (${config.subjectName})`,
                    dmg: 3000 + num.num * 800,
                    effect: 'attack'
                },
                reversed: {
                    desc: `${config.element}元素反噬`,
                    dmg: (3000 + num.num * 800) * 1.8,
                    effect: 'backfire'
                },
                color: config.color
            });
        });
    }
    return minor;
}

const MINOR_ARCANA = generateMinorArcana();
const ALL_CARDS = [...MAJOR_ARCANA, ...MINOR_ARCANA];

/* ---- Card Rendering ---- */
class CardRenderer {
    static createCardElement(cardData, index) {
        const isMajor = cardData.id < 22;
        const suit = isMajor ? 'major' : cardData.suit;
        const suitConfig = isMajor ? null : SUIT_CONFIG[cardData.suit];

        const card = document.createElement('div');
        card.className = 'tarot-card';
        card.dataset.cardId = cardData.id;
        card.dataset.suit = suit;
        card.dataset.index = index;

        const bgGrad = `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, ${cardData.color}15 100%)`;

        card.innerHTML = `
            <div class="card-number">${cardData.numeral}</div>
            <div class="card-suit-icon">${isMajor ? '✦' : suitConfig.icon}</div>
            <div class="card-image" style="background: ${bgGrad}">
                <span style="position:relative;z-index:1">${cardData.icon}</span>
            </div>
            <div class="card-name-en">${cardData.nameEn}</div>
            <div class="card-name-cn">${cardData.nameCn}</div>
            <div class="card-type-bar">${isMajor ? 'MAJOR ARCANA' : suitConfig.nameCn.toUpperCase()}</div>
        `;

        card.addEventListener('click', () => {
            if (typeof game !== 'undefined') {
                game.selectCard(cardData, card);
            }
        });

        return card;
    }

    static renderHand(cards, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        cards.forEach((card, index) => {
            const el = CardRenderer.createCardElement(card, index);
            el.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(el);
        });
    }
}

function drawCards(pool, count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function getOrientation() {
    return Math.random() > 0.35 ? 'upright' : 'reversed';
}
