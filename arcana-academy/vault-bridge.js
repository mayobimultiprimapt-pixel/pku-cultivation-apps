/* ============================================
   VAULT-BRIDGE.JS — 消消乐题库 → 奥秘学院转换桥
   将消消乐的 2000+ 填空题自动转为选择题格式
   并注入 QUESTION_BANK
   ============================================ */

(function VaultBridge() {
    'use strict';

    const SUBJECT_MAP = {
        'english': 201,
        'math': 301,
        'politics': 101,
        'cs': 408
    };

    let convertedCount = { 101: 0, 201: 0, 301: 0, 408: 0 };
    let idCounter = 5000;

    /**
     * 将消消乐格式的填空题转为奥秘学院的选择题格式
     * 消消乐: { sentence, answer, meaning, distractors[] }
     * 奥秘学院: { id, topic, difficulty, text, options:{A,B,C,D}, answer:'X', explain }
     */
    function convertCrushQuestion(q, subjectCode) {
        if (!q || !q.sentence || !q.answer || !q.distractors) return null;

        // 题干: sentence 保留 _____
        const text = q.sentence;

        // 从 distractors 中随机选3个作为干扰项
        const validDistractors = q.distractors.filter(d => d && d !== '???' && d !== q.answer);
        const shuffled = [...validDistractors].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);

        // 不足3个干扰项则补位
        while (selected.length < 3) {
            selected.push('(无)');
        }

        // 将正确答案随机插入
        const allOptions = [...selected];
        const correctPos = Math.floor(Math.random() * 4);
        allOptions.splice(correctPos, 0, q.answer);

        const letters = ['A', 'B', 'C', 'D'];
        const options = {};
        letters.forEach((l, i) => { options[l] = allOptions[i]; });

        const correctLetter = letters[correctPos];

        // 难度随机 2-4
        const difficulty = Math.floor(Math.random() * 3) + 2;

        // topic 从 meaning 中提取
        const topic = q.meaning ? q.meaning.split('=')[0].trim() : '综合';

        return {
            id: `crush_${subjectCode}_${idCounter++}`,
            topic,
            difficulty,
            text,
            options,
            answer: correctLetter,
            explain: q.meaning || '详见教材'
        };
    }

    /**
     * 从金库 (Global_Vault) 加载题目 — 分桶+混合池
     */
    function loadFromVault() {
        const vaultConfig = {
            101: { types: ['single_choice','multi_choice'], legacy: 'Global_Vault_101' },
            201: { types: ['single_choice','cloze','reading'], legacy: 'Global_Vault_201' },
            301: { types: ['single_choice','fill_blank'], legacy: 'Global_Vault_301' },
            408: { types: ['single_choice','comprehensive'], legacy: 'Global_Vault_408' }
        };

        for (const [subjectCode, config] of Object.entries(vaultConfig)) {
            const code = parseInt(subjectCode);
            let count = 0;

            // 1. 分桶金库优先
            for (const type of config.types) {
                try {
                    const raw = localStorage.getItem('Global_Vault_' + subjectCode + '_' + type);
                    if (!raw) continue;
                    const data = JSON.parse(raw);
                    if (!Array.isArray(data)) continue;

                    for (const q of data) {
                        const converted = convertVaultQuestion(q, code);
                        if (converted && !QUESTION_BANK[code].find(eq => eq.text === converted.text)) {
                            QUESTION_BANK[code].push(converted);
                            count++;
                        }
                    }
                } catch(e) { /* skip */ }
            }

            // 2. 混合池兜底
            try {
                const raw = localStorage.getItem(config.legacy);
                if (!raw) continue;
                const data = JSON.parse(raw);
                if (!Array.isArray(data)) continue;

                for (const q of data) {
                    const converted = convertVaultQuestion(q, code);
                    if (converted && !QUESTION_BANK[code].find(eq => eq.text === converted.text)) {
                        QUESTION_BANK[code].push(converted);
                        count++;
                    }
                }
            } catch(e) { /* skip */ }

            if (count > 0) {
                console.log(`[VaultBridge] 🏦 金库 ${subjectCode}: +${count} 题`);
                convertedCount[code] += count;
            }
        }
    }

    /**
     * 统一转换金库题目为奥秘学院格式
     * 支持新格式(stem/options/answer)和旧格式(text/options/answer)和消消乐格式(sentence/answer)
     */
    function convertVaultQuestion(q, subjectCode) {
        if (!q) return null;

        // 新格式: stem + options数组 + answer字母
        if ((q.stem || q.q) && (q.options || q.o)) {
            const stem = q.stem || q.q;
            const opts = q.options || q.o || [];
            if (opts.length < 2) return null;

            const letters = ['A','B','C','D'];
            const options = {};
            opts.forEach((o, i) => {
                if (i < 4) {
                    // 去掉"A."前缀
                    const clean = String(o).replace(/^[A-D]\.\s*/, '');
                    options[letters[i]] = clean;
                }
            });

            let ansLetter = 'A';
            if (typeof q.a === 'number') ansLetter = letters[q.a] || 'A';
            else if (q.answer) ansLetter = String(q.answer).charAt(0).toUpperCase();

            return {
                id: `vault_${subjectCode}_${idCounter++}`,
                topic: q.chapter || '金库题',
                difficulty: q.difficulty || 3,
                text: stem,
                options,
                answer: ansLetter,
                explain: q.analysis || q.hint || '详见解析'
            };
        }

        // 旧格式: text + options对象 + answer
        if (q.text && q.options && q.answer) {
            if (!q.id) q.id = `vault_${subjectCode}_${idCounter++}`;
            if (!q.difficulty) q.difficulty = 3;
            if (!q.explain) q.explain = q.analysis || '';
            if (!q.topic) q.topic = q.chapter || '金库题';
            return q;
        }

        // 消消乐格式: sentence + answer + distractors
        if (q.sentence && q.answer && q.distractors) {
            return convertCrushQuestion(q, subjectCode);
        }

        return null;
    }

    /**
     * 从 Siege_Levels 每日题加载
     */
    function loadFromSiegeLevels() {
        const siegeKeys = {
            201: 'Siege_Levels_english',
            301: 'Siege_Levels_math',
            101: 'Siege_Levels_politics',
            408: 'Siege_Levels_cs'
        };

        for (const [subjectCode, key] of Object.entries(siegeKeys)) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) continue;
                const data = JSON.parse(raw);
                if (!Array.isArray(data)) continue;

                const code = parseInt(subjectCode);
                let count = 0;

                for (const q of data) {
                    if (q.sentence && q.answer && q.distractors) {
                        const converted = convertCrushQuestion(q, code);
                        if (converted) {
                            // 去重
                            const exists = QUESTION_BANK[code].find(
                                eq => eq.text === converted.text || eq.id === converted.id
                            );
                            if (!exists) {
                                QUESTION_BANK[code].push(converted);
                                count++;
                            }
                        }
                    }
                }

                if (count > 0) {
                    console.log(`[VaultBridge] 📡 每日题 ${key}: +${count} 题`);
                    convertedCount[code] += count;
                }
            } catch (e) {
                console.warn(`[VaultBridge] 每日题 ${key} 加载失败:`, e);
            }
        }
    }

    /**
     * 内嵌消消乐核心题库 (从 crush-data.js + extra1/2/3 中提取)
     * 这是最大的题库来源，约 2000+ 道
     */
    function injectCrushCoreLevels() {
        // ═══ 201 英语 核心题库 ═══
        const ENG=[
{sentence:'The committee _____ the proposal after lengthy debate.',answer:'endorsed',meaning:'endorsed = 认可',distractors:['rejected','ignored','postponed','revised','withdrew','opposed']},
{sentence:'Urban sprawl has _____ environmental degradation.',answer:'exacerbated',meaning:'exacerbated = 加剧',distractors:['reduced','prevented','resolved','reversed','halted','contained']},
{sentence:'The treaty aims to _____ peaceful relations between nations.',answer:'foster',meaning:'foster = 促进',distractors:['sever','disrupt','undermine','terminate','compromise','abandon']},
{sentence:'Scientists must _____ their findings through peer review.',answer:'substantiate',meaning:'substantiate = 证实',distractors:['fabricate','conceal','distort','suppress','retract','negate']},
{sentence:'Her _____ contribution to science earned her the Nobel Prize.',answer:'outstanding',meaning:'outstanding = 杰出的',distractors:['mediocre','negligible','trivial','modest','average','minimal']},
{sentence:'Economic sanctions can _____ a country\'s development.',answer:'hamper',meaning:'hamper = 阻碍',distractors:['boost','accelerate','promote','facilitate','enhance','enable']},
{sentence:'The results were _____ across multiple experiments.',answer:'replicated',meaning:'replicated = 重复验证',distractors:['contradicted','fabricated','disproved','ignored','rejected','falsified']},
{sentence:'Globalization has _____ interconnectedness among nations.',answer:'heightened',meaning:'heightened = 增强',distractors:['diminished','severed','weakened','reduced','limited','restricted']},
{sentence:'Researchers _____ a new method for treating the disease.',answer:'devised',meaning:'devised = 设计出',distractors:['abandoned','rejected','copied','borrowed','inherited','destroyed']},
{sentence:'The merger will _____ the two companies into one entity.',answer:'consolidate',meaning:'consolidate = 合并',distractors:['divide','separate','dissolve','fragment','scatter','disperse']},
{sentence:'The discovery _____ our understanding of the universe.',answer:'revolutionized',meaning:'revolutionized = 彻底改变',distractors:['confirmed','preserved','maintained','retained','sustained','repeated']},
{sentence:'The gap between rich and poor continues to _____.',answer:'widen',meaning:'widen = 扩大',distractors:['narrow','close','shrink','diminish','disappear','stabilize']},
{sentence:'The law was _____ to protect children from exploitation.',answer:'enacted',meaning:'enacted = 颁布',distractors:['repealed','ignored','violated','abolished','suspended','withdrawn']},
{sentence:'The artist\'s work _____ a wide range of emotions.',answer:'evokes',meaning:'evokes = 唤起',distractors:['suppresses','conceals','inhibits','represses','blocks','restrains']},
{sentence:'The scandal _____ the politician\'s career.',answer:'ruined',meaning:'ruined = 毁掉',distractors:['enhanced','boosted','promoted','advanced','elevated','improved']},
{sentence:'The decline in biodiversity _____ serious ecological risks.',answer:'poses',meaning:'poses = 构成',distractors:['eliminates','prevents','resolves','avoids','removes','reduces']},
{sentence:'Historical evidence _____ the claim that trade promotes peace.',answer:'corroborates',meaning:'corroborates = 证实',distractors:['contradicts','refutes','undermines','disproves','weakens','challenges']},
{sentence:'Renewable energy sources are _____ replacing fossil fuels.',answer:'gradually',meaning:'gradually = 逐渐地',distractors:['instantly','immediately','suddenly','abruptly','never','rarely']},
{sentence:'The novel _____ the struggles of working-class families.',answer:'depicts',meaning:'depicts = 描绘',distractors:['ignores','conceals','avoids','overlooks','dismisses','neglects']},
{sentence:'The research _____ a breakthrough in cancer treatment.',answer:'yielded',meaning:'yielded = 产出了',distractors:['prevented','blocked','hindered','failed','missed','wasted']},
{sentence:'The strategy proved _____ in reducing poverty rates.',answer:'effective',meaning:'effective = 有效的',distractors:['futile','useless','ineffective','pointless','wasteful','harmful']},
{sentence:'The scholar _____ a theory about the origins of language.',answer:'proposed',meaning:'proposed = 提出',distractors:['rejected','abandoned','disproved','dismissed','retracted','withdrew']},
{sentence:'Climate change has _____ the frequency of extreme weather.',answer:'increased',meaning:'increased = 增加了',distractors:['reduced','decreased','minimized','eliminated','prevented','halted']},
{sentence:'The _____ of artificial intelligence raises ethical questions.',answer:'emergence',meaning:'emergence = 出现',distractors:['absence','disappearance','decline','loss','removal','extinction']},
{sentence:'Social media has _____ the way people communicate globally.',answer:'transformed',meaning:'transformed = 变革了',distractors:['preserved','maintained','retained','continued','sustained','fixed']},
        ];

        // ═══ 301 数学 核心题库 ═══
        const MATH=[
{sentence:'∫sin(x)dx = _____',answer:'-cos(x)+C',meaning:'sin(x)的不定积分',distractors:['cos(x)','sin(x)','tan(x)','-sin(x)','1','0']},
{sentence:'d/dx[x^n] = _____',answer:'nx^(n-1)',meaning:'幂函数求导法则',distractors:['x^n','nx^n','(n+1)x^n','x^(n-1)','n','1']},
{sentence:'lim(x→0) (e^x-1)/x = _____',answer:'1',meaning:'重要极限公式',distractors:['0','e','∞','-1','1/2','2']},
{sentence:'两个事件A,B独立时P(AB)= _____',answer:'P(A)P(B)',meaning:'独立事件联合概率',distractors:['P(A)+P(B)','P(A|B)','P(A∪B)','0','1','P(A)-P(B)']},
{sentence:'矩阵乘法满足结合律但不满足 _____',answer:'交换律',meaning:'AB≠BA',distractors:['分配律','结合律','等价律','传递律','反身律','对称律']},
{sentence:'f(x)=x²的二阶导数f″(x)= _____',answer:'2',meaning:'x²→2x→2',distractors:['2x','0','x','1','x²','4x']},
{sentence:'X~B(n,p)的期望E(X)= _____',answer:'np',meaning:'二项分布期望',distractors:['n','p','npq','n/p','p/n','n+p']},
{sentence:'∫₋₁^1 x³dx = _____',answer:'0',meaning:'奇函数在对称区间上积分为零',distractors:['1','-1','2','1/4','1/2','-1/4']},
{sentence:'正定矩阵的特征值都 _____ 0',answer:'>',meaning:'正定⟹所有特征值>0',distractors:['<','=','≥','≤','≠','→']},
{sentence:'∂/∂x[xy²] = _____',answer:'y²',meaning:'偏导数：对x求导y为常数',distractors:['2xy','xy','x','2y','y','x²']},
{sentence:'d/dx[sin²(x)] = _____',answer:'2sin(x)cos(x)',meaning:'链式法则+倍角公式=sin(2x)',distractors:['cos²(x)','2sin(x)','sin(2x)','cos(x)','-2cos(x)','2cos²(x)']},
{sentence:'向量a和b正交的条件是a·b= _____',answer:'0',meaning:'内积为零⟺正交',distractors:['1','-1','|a||b|','∞','a+b','a-b']},
{sentence:'∫dx/(1+x²) = _____',answer:'arctan(x)+C',meaning:'反三角函数积分',distractors:['arcsin(x)','ln(1+x²)','1/x','x/(1+x²)','arccos(x)','tan(x)']},
{sentence:'高斯分布的概率密度函数是 _____ 形',answer:'钟',meaning:'正态分布=钟形曲线',distractors:['U','V','W','J','S','L']},
{sentence:'∫tan(x)dx = _____',answer:'-ln|cos(x)|+C',meaning:'∫tanx=-ln|cosx|+C',distractors:['ln|sin(x)|','sec²(x)','1/cos(x)','-cos(x)','sin(x)','sec(x)']},
{sentence:'二项分布B(n,p)的方差D(X)= _____',answer:'np(1-p)',meaning:'npq, q=1-p',distractors:['np','n(1-p)','p(1-p)','n²p','np²','n/p']},
{sentence:'正交矩阵Q满足Q^TQ = _____',answer:'E',meaning:'正交矩阵的转置=逆',distractors:['Q','0','Q²','2E','Q^T','-E']},
{sentence:'概率密度函数f(x)对全体实数积分= _____',answer:'1',meaning:'归一化条件',distractors:['0','∞','f(0)','E(X)','D(X)','p']},
{sentence:'矩阵A的伴随矩阵A*满足AA*= _____',answer:'|A|E',meaning:'AA*=|A|E',distractors:['A','E','0','A²','|A|','A^T']},
{sentence:'幂级数∑xⁿ/n!的收敛半径R= _____',answer:'∞',meaning:'e^x展开收敛域=(-∞,∞)',distractors:['1','0','e','π','2','n']},
        ];

        // ═══ 101 政治 核心题库 ═══
        const POL=[
{sentence:'物质的唯一特性是 _____',answer:'客观实在性',meaning:'物质=客观实在性',distractors:['运动性','可知性','永恒性','统一性','多样性']},
{sentence:'运动是物质的 _____ 属性',answer:'根本',meaning:'物质和运动不可分',distractors:['唯一','特殊','偶然','次要','外在']},
{sentence:'意识是人脑的机能和对客观世界的 _____',answer:'主观映像',meaning:'意识的本质',distractors:['客观反映','直接复制','机械反映','被动接受','感性认识']},
{sentence:'认识发展的动力是 _____',answer:'实践',meaning:'实践是认识发展的动力',distractors:['理论','思维','感觉','经验','逻辑']},
{sentence:'社会主义初级阶段以 _____ 为中心',answer:'经济建设',meaning:'一个中心=经济建设',distractors:['政治建设','文化建设','社会建设','军事建设','生态建设']},
{sentence:'中国梦的本质是国家富强、民族振兴和 _____',answer:'人民幸福',meaning:'中国梦三个层面',distractors:['社会和谐','文化繁荣','生态文明','科技进步','国防强大']},
{sentence:'"两山论"指绿水青山就是 _____',answer:'金山银山',meaning:'生态文明建设理念',distractors:['人民财富','社会资本','国家利益','发展动力','民生保障']},
{sentence:'人类命运共同体的核心理念是 _____',answer:'合作共赢',meaning:'构建人类命运共同体',distractors:['独立自主','和平共处','互不干涉','平等互利','求同存异']},
{sentence:'社会主义市场经济以 _____ 为主体',answer:'公有制',meaning:'公有制主体+多种所有制',distractors:['私有制','混合制','股份制','集体制','国有制']},
{sentence:'文化自信是更基础更广泛更 _____ 的自信',answer:'深厚',meaning:'文化自信最深厚',distractors:['全面','重要','关键','核心','根本']},
{sentence:'新时代经济由高速增长转向 _____',answer:'高质量发展',meaning:'经济新常态',distractors:['中速增长','低速增长','稳定增长','均衡增长','创新增长']},
{sentence:'中国式现代化是 _____ 领导的社会主义现代化',answer:'中国共产党',meaning:'中国式现代化本质特征',distractors:['人民','政府','国家','社会','全体公民']},
{sentence:'实践是检验真理的 _____ 标准',answer:'唯一',meaning:'实践=唯一检验真理标准',distractors:['重要','主要','基本','根本','首要']},
{sentence:'对立统一规律是唯物辩证法的 _____',answer:'实质和核心',meaning:'对立统一=辩证法核心',distractors:['基础','补充','表现','形式','手段']},
{sentence:'中国特色社会主义最大优势是 _____',answer:'中国共产党领导',meaning:'最大优势=党领导',distractors:['公有制经济','人民代表大会','政协制度','民族区域自治','基层自治']},
{sentence:'社会主义核心价值观社会层面：自由平等公正 _____',answer:'法治',meaning:'社会层面四个词',distractors:['民主','文明','和谐','富强','诚信']},
        ];

        // ═══ 408 计算机 核心题库 ═══
        const CS=[
{sentence:'归并排序时间复杂度始终为O(_____)',answer:'nlogn',meaning:'归并排序=稳定O(nlogn)',distractors:['n','n²','logn','n³','2^n','1']},
{sentence:'二叉搜索树中序遍历结果是 _____',answer:'有序序列',meaning:'BST中序=升序',distractors:['逆序','随机序','层序','前序','后序','无序']},
{sentence:'UDP协议特点是无连接和 _____',answer:'不可靠',meaning:'UDP=无连接不可靠',distractors:['可靠','有序','面向流','慢速','安全','加密']},
{sentence:'页表实现 _____ 到物理地址的转换',answer:'虚拟地址',meaning:'页表=虚拟→物理',distractors:['逻辑地址','端口号','MAC地址','IP地址','设备号','文件名']},
{sentence:'ARP协议将IP地址解析为 _____',answer:'MAC地址',meaning:'ARP=IP→MAC',distractors:['端口号','域名','URL','子网掩码','网关','路由']},
{sentence:'银行家算法用于避免 _____',answer:'死锁',meaning:'银行家算法=死锁避免',distractors:['饥饿','活锁','竞争','溢出','泄漏','崩溃']},
{sentence:'IPv6地址长度为 _____ 位',answer:'128',meaning:'IPv6=128位',distractors:['32','64','256','48','96','16']},
{sentence:'哈希表平均查找时间复杂度O(_____)',answer:'1',meaning:'哈希表平均O(1)',distractors:['n','logn','n²','nlogn','√n','n/2']},
{sentence:'操作系统四大功能：处理机管理、存储管理、设备管理和 _____',answer:'文件管理',meaning:'OS四大管理功能',distractors:['网络管理','安全管理','电源管理','用户管理','日志管理','配置管理']},
{sentence:'SQL查询数据的关键字是 _____',answer:'SELECT',meaning:'SQL查询语句',distractors:['INSERT','UPDATE','DELETE','CREATE','DROP','ALTER']},
{sentence:'TCP首部最小长度为 _____ 字节',answer:'20',meaning:'TCP首部=20字节(无选项)',distractors:['8','16','32','64','12','24']},
{sentence:'进程基本状态：就绪、运行和 _____',answer:'阻塞',meaning:'进程三态模型',distractors:['挂起','创建','终止','等待','睡眠','停止']},
{sentence:'数据库第三范式要求消除 _____ 依赖',answer:'传递',meaning:'3NF=消除传递函数依赖',distractors:['部分','全部','直接','间接','多值','复合']},
{sentence:'TCP拥塞控制包括慢启动、拥塞避免、快重传和 _____',answer:'快恢复',meaning:'TCP四种拥塞控制',distractors:['慢恢复','快启动','拥塞检测','流量控制','差错控制','超时重传']},
{sentence:'RAID5至少需要 _____ 块磁盘',answer:'3',meaning:'RAID5=分布式奇偶校验',distractors:['2','4','5','1','6','8']},
{sentence:'Floyd算法求解 _____ 最短路径',answer:'全源',meaning:'Floyd=所有顶点间最短路',distractors:['单源','两点','最长','关键','最宽']},
{sentence:'数据库ACID特性中I代表 _____',answer:'隔离性',meaning:'ACID=原子+一致+隔离+持久',distractors:['完整性','独立性','不变性','继承性','标识性','一致性']},
{sentence:'路由器工作在OSI模型第 _____ 层',answer:'三',meaning:'路由器=网络层设备',distractors:['一','二','四','五','六','七']},
{sentence:'AVL树平衡因子取值范围 _____',answer:'-1,0,1',meaning:'AVL平衡因子∈{-1,0,1}',distractors:['-2到2','0到2','-1到2','0和1','任意整数','-3到3']},
{sentence:'HTTP/1.1默认使用 _____ 连接',answer:'持久',meaning:'HTTP/1.1=Keep-Alive',distractors:['非持久','短','UDP','加密','压缩','异步']},
{sentence:'Wi-Fi使用的IEEE标准是 _____',answer:'802.11',meaning:'Wi-Fi=IEEE 802.11',distractors:['802.3','802.15','802.16','802.1','802.5','802.2']},
        ];

        // 转换并注入
        const pools = { english: ENG, math: MATH, politics: POL, cs: CS };
        for (const [mode, questions] of Object.entries(pools)) {
            const subjectCode = SUBJECT_MAP[mode];
            let count = 0;
            for (const q of questions) {
                const converted = convertCrushQuestion(q, subjectCode);
                if (converted) {
                    // 去重
                    const exists = QUESTION_BANK[subjectCode].find(eq => eq.text === converted.text);
                    if (!exists) {
                        QUESTION_BANK[subjectCode].push(converted);
                        count++;
                    }
                }
            }
            convertedCount[subjectCode] += count;
            console.log(`[VaultBridge] 📦 消消乐核心 ${mode}: +${count} 题`);
        }
    }

    /**
     * 初始化：执行全部加载
     */
    function init() {
        console.log('[VaultBridge] ═══ 开始题库大灌注 ═══');

        // 1. 注入消消乐内嵌核心题库
        injectCrushCoreLevels();

        // 2. 从金库加载
        loadFromVault();

        // 3. 从每日题加载
        loadFromSiegeLevels();

        // 汇总
        const total = Object.values(convertedCount).reduce((a, b) => a + b, 0);
        const bankTotal = Object.values(QUESTION_BANK).reduce((sum, arr) => sum + arr.length, 0);

        console.log(`[VaultBridge] ═══ 题库灌注完毕 ═══`);
        console.log(`[VaultBridge] 转换注入: ${total} 题`);
        console.log(`[VaultBridge] 总题库: ${bankTotal} 题`);
        console.log(`[VaultBridge]   101政治: ${QUESTION_BANK[101].length} 题`);
        console.log(`[VaultBridge]   201英语: ${QUESTION_BANK[201].length} 题`);
        console.log(`[VaultBridge]   301数学: ${QUESTION_BANK[301].length} 题`);
        console.log(`[VaultBridge]   408计算机: ${QUESTION_BANK[408].length} 题`);

        // 更新标题屏版本号
        const versionEl = document.querySelector('.title-version');
        if (versionEl) {
            versionEl.textContent = `v1.0.0 | 78 ARCANA + ${bankTotal} QUESTIONS LOADED`;
        }
    }

    // 延迟执行确保 QUESTION_BANK 已加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
    } else {
        setTimeout(init, 100);
    }

})();
