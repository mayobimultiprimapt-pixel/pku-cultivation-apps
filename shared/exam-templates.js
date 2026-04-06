/**
 * ============================================================================
 *  北大考研 · 修仙应用集
 *  EXAM PAPER TEMPLATES v1.0 — ABSOLUTE STRUCTURE AUTHORITY
 * ============================================================================
 *  全国硕士研究生招生考试 · 四科标准试卷结构硬编码
 *  此文件为整个生态系统的【单一真相源 (Single Source of Truth)】
 *  任何试卷生成、校验、投喂行为必须严格遵守此结构
 * ============================================================================
 */

// ============================================================================
// 1. TEMPLATE DEFINITIONS — 绝对结构硬编码
// ============================================================================

const EXAM_TEMPLATES = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 101 思想政治理论 — 满分100 · 时长180min
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  '101': {
    code: '101',
    name: '思想政治理论',
    fullScore: 100,
    timeMinutes: 180,
    totalQuestions: 38,
    sections: [
      {
        id: 'S1',
        name: '单项选择题',
        type: 'single_choice',
        count: 16,
        scorePerItem: 1,
        totalScore: 16,
        instruction: '下列每题给出的四个选项中，只有一个选项是最符合题意的。',
        topics: ['马克思主义基本原理', '毛泽东思想和中国特色社会主义理论体系概论', '中国近现代史纲要', '思想道德与法治', '形势与政策和当代世界经济与政治'],
        questionSchema: {
          required: ['stem', 'options', 'answer', 'analysis'],
          optionCount: 4,      // 严格4选1
          answerFormat: 'single_letter',  // "A" | "B" | "C" | "D"
        }
      },
      {
        id: 'S2',
        name: '多项选择题',
        type: 'multi_choice',
        count: 17,
        scorePerItem: 2,
        totalScore: 34,
        instruction: '下列每题给出的四个选项中，至少有两个选项是符合题意的。多选或少选均不得分。',
        topics: ['马克思主义基本原理', '毛泽东思想和中国特色社会主义理论体系概论', '中国近现代史纲要', '思想道德与法治', '形势与政策和当代世界经济与政治'],
        questionSchema: {
          required: ['stem', 'options', 'answer', 'analysis'],
          optionCount: 4,
          answerFormat: 'multi_letter',  // "AB" | "ACD" | "ABCD" etc, >=2
          minAnswers: 2,
        }
      },
      {
        id: 'S3',
        name: '材料分析题',
        type: 'essay_material',
        count: 5,
        scorePerItem: 10,
        totalScore: 50,
        instruction: '结合材料回答问题。',
        topics: ['马克思主义基本原理(2题)', '毛泽东思想和中国特色社会主义理论体系概论(1题)', '中国近现代史纲要(1题)', '思想道德与法治(1题)'],
        questionSchema: {
          required: ['material', 'subQuestions', 'referenceAnswer'],
          // 每道大题含材料+2-3个子问题
        }
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 201 英语一 — 满分100 · 时长180min
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  '201': {
    code: '201',
    name: '英语一',
    fullScore: 100,
    timeMinutes: 180,
    totalQuestions: 52,  // 客观题50 + 写作2
    sections: [
      {
        id: 'S1',
        name: '完形填空 (Section I: Use of English)',
        type: 'cloze',
        count: 20,
        scorePerItem: 0.5,
        totalScore: 10,
        instruction: 'Read the following text. Choose the best word(s) for each numbered blank.',
        questionSchema: {
          required: ['passage', 'blanks', 'options', 'answers'],
          optionCount: 4,
          answerFormat: 'single_letter',
          // 整篇文章约350词，20个空
        }
      },
      {
        id: 'S2A',
        name: '传统阅读 (Section II Part A: Reading Comprehension)',
        type: 'reading_comprehension',
        count: 20,   // 4篇文章 × 5题
        scorePerItem: 2,
        totalScore: 40,
        instruction: 'Read the following four texts. Answer the questions below each text.',
        passages: 4,
        questionsPerPassage: 5,
        questionSchema: {
          required: ['passage', 'questions'],
          optionCount: 4,
          answerFormat: 'single_letter',
        }
      },
      {
        id: 'S2B',
        name: '新题型 (Section II Part B)',
        type: 'new_type',
        count: 5,
        scorePerItem: 2,
        totalScore: 10,
        instruction: 'Read the following text and answer the questions. (七选五/排序/小标题匹配)',
        variants: ['seven_choose_five', 'paragraph_ordering', 'heading_matching'],
        questionSchema: {
          required: ['passage', 'questions', 'answers'],
          answerFormat: 'single_letter',
        }
      },
      {
        id: 'S2C',
        name: '翻译 (Section II Part C: Translation)',
        type: 'translation',
        count: 5,
        scorePerItem: 2,
        totalScore: 10,
        instruction: 'Translate the following text into Chinese. (英译汉)',
        questionSchema: {
          required: ['sourceText', 'referenceTranslation'],
          // 一篇约400词文章中5个划线句子
        }
      },
      {
        id: 'S3',
        name: '写作 (Section III: Writing)',
        type: 'writing',
        count: 2,
        scorePerItem: null,  // 非均分
        totalScore: 30,
        subSections: [
          { id: 'S3a', name: '小作文 (应用文)', score: 10, wordCount: '100-120 words', types: ['书信', '通知', '备忘录'] },
          { id: 'S3b', name: '大作文 (图画/图表)', score: 20, wordCount: '160-200 words', types: ['图画作文', '图表作文'] }
        ],
        questionSchema: {
          required: ['prompt', 'type', 'referenceEssay'],
        }
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 301 数学一 — 满分150 · 时长180min
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  '301': {
    code: '301',
    name: '数学一',
    fullScore: 150,
    timeMinutes: 180,
    totalQuestions: 22,
    topicDistribution: {
      '高等数学': { ratio: 0.6, score: 90, note: '极限/导数/积分/微分方程/多元函数/级数/曲面积分' },
      '线性代数': { ratio: 0.2, score: 30, note: '行列式/矩阵/向量/线性方程组/特征值/二次型' },
      '概率论与数理统计': { ratio: 0.2, score: 30, note: '随机变量/数字特征/大数定律/假设检验/参数估计' }
    },
    sections: [
      {
        id: 'S1',
        name: '选择题',
        type: 'single_choice',
        count: 10,
        scorePerItem: 5,
        totalScore: 50,
        instruction: '下列每题给出的四个选项中，只有一个选项是正确的。',
        questionSchema: {
          required: ['stem', 'options', 'answer', 'analysis', 'topic'],
          optionCount: 4,
          answerFormat: 'single_letter',
        }
      },
      {
        id: 'S2',
        name: '填空题',
        type: 'fill_blank',
        count: 6,
        scorePerItem: 5,
        totalScore: 30,
        instruction: '请将答案填写在答题纸指定位置。',
        questionSchema: {
          required: ['stem', 'answer', 'analysis', 'topic'],
          answerFormat: 'expression',  // 数学表达式
        }
      },
      {
        id: 'S3',
        name: '解答题',
        type: 'essay_solution',
        count: 6,
        scorePerItem: null,  // 非均分: 每题10-12分不等
        totalScore: 70,
        scoreDistribution: [12, 12, 12, 12, 11, 11],  // 参考分值分配
        instruction: '解答应写出文字说明、证明过程或演算步骤。',
        questionSchema: {
          required: ['stem', 'solution', 'score', 'topic'],
          answerFormat: 'full_solution',
        }
      }
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 408 计算机学科专业基础 — 满分150 · 时长180min
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  '408': {
    code: '408',
    name: '计算机学科专业基础',
    fullScore: 150,
    timeMinutes: 180,
    totalQuestions: 47,
    topicDistribution: {
      '数据结构': { ratio: 0.3, score: 45, note: '线性表/栈/队列/树/图/排序/查找/哈希' },
      '计算机组成原理': { ratio: 0.3, score: 45, note: 'CPU/存储器/总线/IO/指令系统/运算器' },
      '操作系统': { ratio: 0.23, score: 35, note: '进程管理/内存管理/文件系统/IO管理' },
      '计算机网络': { ratio: 0.17, score: 25, note: 'OSI/TCP-IP/路由/HTTP/DNS/传输层' }
    },
    sections: [
      {
        id: 'S1',
        name: '单项选择题',
        type: 'single_choice',
        count: 40,
        scorePerItem: 2,
        totalScore: 80,
        instruction: '下列每题给出的四个选项中，只有一个选项最符合题目要求。',
        topicAllocation: {
          '数据结构': { range: [1, 10], count: 10 },
          '计算机组成原理': { range: [11, 22], count: 12 },
          '操作系统': { range: [23, 32], count: 10 },
          '计算机网络': { range: [33, 40], count: 8 }
        },
        questionSchema: {
          required: ['stem', 'options', 'answer', 'analysis', 'topic'],
          optionCount: 4,
          answerFormat: 'single_letter',
        }
      },
      {
        id: 'S2',
        name: '综合应用题',
        type: 'essay_comprehensive',
        count: 7,
        scorePerItem: 10,
        totalScore: 70,
        scoreDistribution: [10, 10, 10, 10, 10, 10, 10],
        instruction: '解答问题应写出必要的文字说明、算法描述或计算步骤。',
        topicAllocation: {
          '数据结构': { count: 2, score: 20 },
          '计算机组成原理': { count: 2, score: 20 },
          '操作系统': { count: 2, score: 15 },
          '计算机网络': { count: 1, score: 15 }
        },
        questionSchema: {
          required: ['stem', 'solution', 'score', 'topic'],
          answerFormat: 'full_solution',
        }
      }
    ]
  }
};


// ============================================================================
// 2. PAPER ASSEMBLER — 试卷装配引擎
// ============================================================================

const PaperAssembler = {

  /**
   * 从散装题包 + 历史题库 → 装配成完整标准试卷
   * @param {string} subjectCode - '101' | '201' | '301' | '408'
   * @param {Array} rawQuestions - 外部传入的散装题目
   * @param {Array} vaultQuestions - Question_Vault 历史题库 (用于补齐)
   * @param {Object} sm2Data - SM-2 用户记忆数据 (用于薄弱点优先抽取)
   * @returns {{ paper: Object, warnings: string[] }}
   */
  assemble(subjectCode, rawQuestions = [], vaultQuestions = [], sm2Data = {}) {
    const template = EXAM_TEMPLATES[subjectCode];
    if (!template) throw new AssemblyError(`未知科目代码: ${subjectCode}`, 400);

    const warnings = [];
    const paper = {
      id: `paper-${subjectCode}-${Date.now()}`,
      subject: subjectCode,
      subjectName: template.name,
      fullScore: template.fullScore,
      timeMinutes: template.timeMinutes,
      generatedAt: new Date().toISOString(),
      assemblyVersion: '1.0',
      sections: [],
      metadata: {
        rawInjected: 0,
        vaultFilled: 0,
        totalSlots: template.totalQuestions,
        completionRate: 0
      }
    };

    // 按 type 分桶原始题目
    const buckets = {};
    rawQuestions.forEach(q => {
      const t = this._normalizeType(q.type);
      if (!buckets[t]) buckets[t] = [];
      buckets[t].push(q);
    });

    // 按 type 分桶历史题库
    const vaultBuckets = {};
    vaultQuestions.forEach(q => {
      const t = this._normalizeType(q.type);
      if (!vaultBuckets[t]) vaultBuckets[t] = [];
      vaultBuckets[t].push(q);
    });

    // 对历史题库按 SM-2 遗忘优先级排序（easeFactor 低 + interval 短 = 薄弱项优先）
    for (const type in vaultBuckets) {
      vaultBuckets[type] = this._sortBySM2Weakness(vaultBuckets[type], sm2Data);
    }

    let totalFilled = 0;
    let totalFromRaw = 0;
    let totalFromVault = 0;

    // 逐 section 填充坑位
    for (const sectionDef of template.sections) {
      const sectionResult = {
        id: sectionDef.id,
        name: sectionDef.name,
        type: sectionDef.type,
        count: sectionDef.count,
        scorePerItem: sectionDef.scorePerItem,
        totalScore: sectionDef.totalScore,
        instruction: sectionDef.instruction,
        questions: []
      };

      // 复制额外属性
      if (sectionDef.subSections) sectionResult.subSections = sectionDef.subSections;
      if (sectionDef.scoreDistribution) sectionResult.scoreDistribution = sectionDef.scoreDistribution;
      if (sectionDef.topicAllocation) sectionResult.topicAllocation = sectionDef.topicAllocation;

      const needed = sectionDef.count;
      const sType = sectionDef.type;

      // 1. 从原始题包中取
      const fromRaw = (buckets[sType] || []).splice(0, needed);
      sectionResult.questions.push(...fromRaw.map((q, i) => ({
        ...q,
        _slotIndex: i + 1,
        _source: 'raw_inject',
        _score: sectionDef.scorePerItem || (sectionDef.scoreDistribution ? sectionDef.scoreDistribution[i] : null)
      })));

      // 2. 不足的部分从 vault 补齐 (SM-2 薄弱优先)
      const gap = needed - fromRaw.length;
      if (gap > 0) {
        const fromVault = (vaultBuckets[sType] || []).splice(0, gap);
        if (fromVault.length < gap) {
          warnings.push(`[${sectionDef.id}] ${sectionDef.name}: 需要${needed}题，实际填入${fromRaw.length + fromVault.length}题，缺口${gap - fromVault.length}题`);
        }
        sectionResult.questions.push(...fromVault.map((q, i) => ({
          ...q,
          _slotIndex: fromRaw.length + i + 1,
          _source: 'vault_sm2_fill',
          _score: sectionDef.scorePerItem || (sectionDef.scoreDistribution ? sectionDef.scoreDistribution[fromRaw.length + i] : null)
        })));
        totalFromVault += fromVault.length;
      }

      totalFromRaw += fromRaw.length;
      totalFilled += sectionResult.questions.length;

      // 标注填充完整性
      sectionResult._filled = sectionResult.questions.length;
      sectionResult._complete = sectionResult.questions.length >= needed;

      paper.sections.push(sectionResult);
    }

    paper.metadata.rawInjected = totalFromRaw;
    paper.metadata.vaultFilled = totalFromVault;
    paper.metadata.completionRate = parseFloat((totalFilled / template.totalQuestions * 100).toFixed(1));

    return { paper, warnings };
  },

  /** 标准化题型名称 → 内部 section type */
  _normalizeType(raw) {
    const map = {
      'single': 'single_choice', 'single_choice': 'single_choice', '单选': 'single_choice',
      'multi': 'multi_choice', 'multi_choice': 'multi_choice', '多选': 'multi_choice',
      'cloze': 'cloze', '完形填空': 'cloze', '完形': 'cloze',
      'reading': 'reading_comprehension', 'reading_comprehension': 'reading_comprehension', '阅读': 'reading_comprehension',
      'newtype': 'new_type', 'new_type': 'new_type', '新题型': 'new_type',
      'translation': 'translation', '翻译': 'translation',
      'writing': 'writing', '写作': 'writing',
      'blank': 'fill_blank', 'fill_blank': 'fill_blank', '填空': 'fill_blank',
      'essay': 'essay_solution', 'essay_solution': 'essay_solution', 'essay_material': 'essay_material',
      'essay_comprehensive': 'essay_comprehensive', 'comprehensive': 'essay_comprehensive',
      '解答': 'essay_solution', '材料分析': 'essay_material', '综合应用': 'essay_comprehensive'
    };
    return map[(raw || '').toLowerCase()] || map[raw] || 'single_choice';
  },

  /** 按 SM-2 薄弱度降序排序 (易遗忘的排前面) */
  _sortBySM2Weakness(questions, sm2Data) {
    return questions.sort((a, b) => {
      const sa = sm2Data[a.id] || { easeFactor: 2.5, interval: 999 };
      const sb = sm2Data[b.id] || { easeFactor: 2.5, interval: 999 };
      // 复合权重: easeFactor越低越薄弱, interval越短越该复习
      const wa = sa.easeFactor * 0.6 + Math.min(sa.interval, 30) * 0.4;
      const wb = sb.easeFactor * 0.6 + Math.min(sb.interval, 30) * 0.4;
      return wa - wb;  // 升序 = 最薄弱在前
    });
  }
};


// ============================================================================
// 3. VALIDATION INTERCEPTOR — 数据校验拦截器 (422 Guard)
// ============================================================================

class AssemblyError extends Error {
  constructor(message, statusCode = 422) {
    super(message);
    this.name = 'AssemblyError';
    this.statusCode = statusCode;
  }
}

const PaperValidator = {

  /**
   * 严格校验一份试卷是否符合标准模板
   * 不符合 → 抛出 AssemblyError (422)
   * @param {Object} paper - 待校验的试卷对象
   * @returns {true} 校验通过返回 true
   */
  validate(paper) {
    if (!paper || typeof paper !== 'object') {
      throw new AssemblyError('试卷对象无效: null or non-object');
    }

    const code = paper.subject;
    const template = EXAM_TEMPLATES[code];
    if (!template) {
      throw new AssemblyError(`未知科目代码 [${code}]，仅接受 101/201/301/408`);
    }

    // 1. 满分校验
    if (paper.fullScore !== template.fullScore) {
      throw new AssemblyError(
        `[${code}] 满分结构违规: 声明${paper.fullScore}分, 标准必须${template.fullScore}分`,
        422
      );
    }

    // 2. Section 数量校验
    if (!paper.sections || paper.sections.length !== template.sections.length) {
      throw new AssemblyError(
        `[${code}] 试卷板块数量违规: ${paper.sections?.length || 0}个, 标准必须${template.sections.length}个`,
        422
      );
    }

    // 3. 逐 Section 深度校验
    let actualTotalScore = 0;

    for (let i = 0; i < template.sections.length; i++) {
      const tSec = template.sections[i];
      const pSec = paper.sections[i];

      // 3a. Section 类型匹配
      if (pSec.type !== tSec.type) {
        throw new AssemblyError(
          `[${code}][${tSec.id}] 题型违规: "${pSec.type}", 必须为 "${tSec.type}"`,
          422
        );
      }

      // 3b. 题目数量严格匹配
      const qCount = pSec.questions?.length || 0;
      if (qCount !== tSec.count) {
        throw new AssemblyError(
          `[${code}][${tSec.id}] ${tSec.name}: 题目数${qCount}, 标准必须${tSec.count}题`,
          422
        );
      }

      // 3c. Section 分值校验
      if (pSec.totalScore !== tSec.totalScore) {
        throw new AssemblyError(
          `[${code}][${tSec.id}] ${tSec.name}: 声明${pSec.totalScore}分, 标准必须${tSec.totalScore}分`,
          422
        );
      }

      actualTotalScore += tSec.totalScore;

      // 3d. 逐题 schema 检查 (客观题)
      if (tSec.questionSchema?.required) {
        pSec.questions.forEach((q, qi) => {
          // 选项数校验
          if (tSec.questionSchema.optionCount && q.options) {
            if (q.options.length !== tSec.questionSchema.optionCount) {
              throw new AssemblyError(
                `[${code}][${tSec.id}] 第${qi + 1}题: 选项数${q.options.length}, 标准必须${tSec.questionSchema.optionCount}个`,
                422
              );
            }
          }

          // 多选题最少答案数
          if (tSec.questionSchema.minAnswers && typeof q.answer === 'string') {
            if (q.answer.length < tSec.questionSchema.minAnswers) {
              throw new AssemblyError(
                `[${code}][${tSec.id}] 第${qi + 1}题: 多选答案"${q.answer}"不足${tSec.questionSchema.minAnswers}个`,
                422
              );
            }
          }
        });
      }
    }

    // 4. 总分校验
    if (actualTotalScore !== template.fullScore) {
      throw new AssemblyError(
        `[${code}] 分值完整性违规: 各板块累计${actualTotalScore}分, 标准必须${template.fullScore}分`,
        422
      );
    }

    return true;
  },

  /**
   * 中间件形式的拦截器 (可用于 Express/Koa)
   * 拦截请求体中的试卷数据进行校验
   */
  middleware() {
    return (req, res, next) => {
      try {
        const paper = req.body?.paper;
        if (paper) {
          PaperValidator.validate(paper);
        }
        next();
      } catch (err) {
        if (err instanceof AssemblyError) {
          res.status(err.statusCode).json({
            success: false,
            error: 'TEMPLATE_VIOLATION',
            message: err.message,
            code: err.statusCode
          });
        } else {
          next(err);
        }
      }
    };
  }
};


// ============================================================================
// 4. AI GENERATION PROMPTS — Gemini 3.1 Pro / Claude 4.6 出题指令
// ============================================================================

const AIPromptFactory = {

  /**
   * 生成严格适配模板的 AI 出题 prompt
   * @param {string} subjectCode
   * @param {string} sectionId - e.g. 'S1', 'S2', 'S3'
   * @param {Object} opts - { intelContext: 天机阁情报, paperNum: 第几套 }
   * @returns {string} 完整 system+user prompt
   */
  buildPrompt(subjectCode, sectionId, opts = {}) {
    const template = EXAM_TEMPLATES[subjectCode];
    if (!template) throw new Error(`未知科目: ${subjectCode}`);

    const section = template.sections.find(s => s.id === sectionId);
    if (!section) throw new Error(`未知板块: ${sectionId}`);

    const intelSnippet = opts.intelContext
      ? `\n\n【天机阁情报注入】以下是近期窃取的命题风向情报，生成题目时必须融入这些方向：\n${opts.intelContext}\n`
      : '';

    return {
      system: `你是全国硕士研究生招生考试(${template.name})命题组核心专家。你必须严格按照以下结构输出。任何偏离都是不可接受的。`,
      user: `生成 ${template.name}(${subjectCode}) 的 [${section.name}] 板块，要求如下：

【结构约束 — 绝对不可违反】
- 板块ID: ${section.id}
- 题型: ${section.type}
- 题目数量: 严格 ${section.count} 题 (不多不少)
- 每题分值: ${section.scorePerItem || '见分值分配'}分
- 板块总分: ${section.totalScore}分
${section.questionSchema?.optionCount ? `- 每题选项: 严格 ${section.questionSchema.optionCount} 个 (A/B/C/D)` : ''}
${section.questionSchema?.minAnswers ? `- 多选题: 每题至少 ${section.questionSchema.minAnswers} 个正确答案` : ''}

【考点覆盖】
${(section.topics || []).join('\n')}
${template.topicDistribution ? '\n【分值比例】\n' + Object.entries(template.topicDistribution).map(([k, v]) => `${k}: ${v.score}分 (${(v.ratio*100).toFixed(0)}%) — ${v.note}`).join('\n') : ''}
${intelSnippet}
【难度分布】基础30% + 中等45% + 拔高25%

【输出格式】纯JSON数组，第一个字符[最后一个字符]，禁止多余文字。
每题结构: {"id":"q001", "type":"${section.type}", "stem":"题干", ${section.questionSchema?.optionCount ? '"options":["A. ...","B. ...","C. ...","D. ..."], ' : ''}"answer":"答案", "analysis":"详细解析含考点出处", "topic":"所属章节", "difficulty":3, "score":${section.scorePerItem || 10}}`
    };
  },

  /**
   * 生成完整一套试卷的所有 prompts (用于批量调用)
   */
  buildFullPaperPrompts(subjectCode, opts = {}) {
    const template = EXAM_TEMPLATES[subjectCode];
    return template.sections.map(sec => ({
      sectionId: sec.id,
      sectionName: sec.name,
      prompt: this.buildPrompt(subjectCode, sec.id, opts)
    }));
  }
};


// ============================================================================
// 5. GAME FEED ADAPTER — 游戏投喂适配器
// ============================================================================

const GameFeedAdapter = {

  /**
   * 将标准试卷转换为各游戏可消费的格式
   */
  
  /** 消消乐 / 刺激战场 / 猛鬼宿舍 — 客观题投喂格式 */
  toGameFormat(paper) {
    const questions = [];
    for (const section of paper.sections) {
      // 游戏只消费客观题 (有options的)
      for (const q of section.questions || []) {
        if (!q.options || q.options.length === 0) continue;

        // 标准化选项 (去掉 "A. " 前缀)
        const opts = q.options.map(o => o.replace(/^[A-D][\\.、\s]+/, ''));
        
        // 答案 → 数字索引
        let ansIdx = 0;
        if (typeof q.answer === 'string') {
          const letter = q.answer.trim().toUpperCase()[0];
          ansIdx = Math.max(0, ['A', 'B', 'C', 'D'].indexOf(letter));
        }

        questions.push({
          q: q.stem || q.question || '',
          o: opts,
          a: ansIdx,
          type: section.type,
          difficulty: q.difficulty || 2,
          subject: paper.subject,
          section: section.id,
          analysis: q.analysis || '',
          chapter: q.topic || q.chapter || '',
          score: q._score || section.scorePerItem || 0,
          _paperId: paper.id,
          _source: q._source || 'assembled'
        });
      }
    }
    return questions;
  },

  /** 全局金库格式 (写入 localStorage Global_Vault_XXX) */
  toVaultFormat(paper) {
    const gameQuestions = this.toGameFormat(paper);
    return {
      subject: paper.subject,
      paperId: paper.id,
      generatedAt: paper.generatedAt,
      questions: gameQuestions,
      count: gameQuestions.length,
      structure: paper.sections.map(s => `${s.name}(${s._filled}/${s.count})`).join(' + ')
    };
  }
};


// ============================================================================
// 6. EXPORTS — 公开暴露
// ============================================================================

if (typeof window !== 'undefined') {
  window.EXAM_TEMPLATES = EXAM_TEMPLATES;
  window.PaperAssembler = PaperAssembler;
  window.PaperValidator = PaperValidator;
  window.AIPromptFactory = AIPromptFactory;
  window.GameFeedAdapter = GameFeedAdapter;
  window.AssemblyError = AssemblyError;
}

// Node.js / CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EXAM_TEMPLATES,
    PaperAssembler,
    PaperValidator,
    AIPromptFactory,
    GameFeedAdapter,
    AssemblyError
  };
}
