/**
 * ============================================================================
 *  北大考研 · 修仙应用集
 *  EXAM PAPER TEMPLATES — TypeScript Interface Declaration
 * ============================================================================
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 基础类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type SubjectCode = '101' | '201' | '301' | '408';

type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'cloze'
  | 'reading_comprehension'
  | 'new_type'
  | 'translation'
  | 'writing'
  | 'fill_blank'
  | 'essay_solution'
  | 'essay_material'
  | 'essay_comprehensive';

type AnswerFormat =
  | 'single_letter'    // "A" | "B" | "C" | "D"
  | 'multi_letter'     // "AB" | "ACD" etc
  | 'expression'       // 数学表达式
  | 'full_solution';   // 完整解答过程

type Difficulty = 1 | 2 | 3 | 4 | 5;

type QuestionSource = 'raw_inject' | 'vault_sm2_fill' | 'ai_generated' | 'assembled';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Template 结构
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface QuestionSchema {
  required: string[];
  optionCount?: 4;
  answerFormat: AnswerFormat;
  minAnswers?: number;
}

interface SubSection {
  id: string;
  name: string;
  score: number;
  wordCount?: string;
  types?: string[];
}

interface TopicAllocation {
  [topic: string]: {
    range?: [number, number];
    count: number;
    score?: number;
  };
}

interface TopicDistribution {
  [topic: string]: {
    ratio: number;
    score: number;
    note: string;
  };
}

interface SectionTemplate {
  id: string;                      // 'S1' | 'S2' | 'S2A' | 'S2B' | 'S2C' | 'S3'
  name: string;                    // 板块名 e.g. '单项选择题'
  type: QuestionType;              // 严格题型标识
  count: number;                   // 题目数量 (绝对值)
  scorePerItem: number | null;     // 每题分值 (null = 非均分)
  totalScore: number;              // 板块总分 (绝对值)
  instruction: string;             // 作答说明
  topics?: string[];               // 考点范围
  questionSchema: QuestionSchema;  // 题目数据 schema
  subSections?: SubSection[];      // 子板块 (仅写作)
  scoreDistribution?: number[];    // 非均分时各题分值
  topicAllocation?: TopicAllocation; // 各考点题目分配
  passages?: number;               // 文章数 (仅阅读)
  questionsPerPassage?: number;    // 每篇题数 (仅阅读)
  variants?: string[];             // 题型变体 (仅新题型)
}

interface ExamTemplate {
  code: SubjectCode;
  name: string;                        // 科目全称
  fullScore: number;                   // 满分 (100 | 150)
  timeMinutes: 180;                    // 考试时长
  totalQuestions: number;              // 总题目数
  topicDistribution?: TopicDistribution; // 各考点分值比例
  sections: SectionTemplate[];         // 板块定义 (有序)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 题目结构 (运行时)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Question {
  id: string;
  type: QuestionType;
  stem: string;                   // 题干
  options?: [string, string, string, string]; // ABCD (客观题)
  answer: string;                 // "A" | "AB" | 表达式 | 完整解答
  analysis: string;               // 详细解析
  topic: string;                  // 所属章节/考点
  difficulty: Difficulty;
  score: number;
  material?: string;              // 材料 (材料分析题)
  subQuestions?: SubQuestion[];   // 子问题 (材料分析题/综合应用)
  passage?: string;               // 阅读文章
  sourceText?: string;            // 翻译原文
  referenceTranslation?: string;  // 参考译文
  referenceAnswer?: string;       // 参考答案
  prompt?: string;                // 写作提示
  referenceEssay?: string;        // 参考范文
  chapter?: string;               // 章节别名

  // 装配元数据
  _slotIndex?: number;
  _source?: QuestionSource;
  _score?: number;
  _paperId?: string;
}

interface SubQuestion {
  stem: string;
  referenceAnswer: string;
  score: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 装配后试卷结构
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AssembledSection {
  id: string;
  name: string;
  type: QuestionType;
  count: number;
  scorePerItem: number | null;
  totalScore: number;
  instruction: string;
  questions: Question[];
  subSections?: SubSection[];
  scoreDistribution?: number[];
  topicAllocation?: TopicAllocation;
  _filled: number;               // 实际填入数
  _complete: boolean;            // 是否填满
}

interface PaperMetadata {
  rawInjected: number;           // 来自原始注入的题目数
  vaultFilled: number;           // 来自 SM-2 金库补齐的题目数
  totalSlots: number;            // 总坑位数
  completionRate: number;        // 完成率 (0-100)
}

interface AssembledPaper {
  id: string;                    // paper-{code}-{timestamp}
  subject: SubjectCode;
  subjectName: string;
  fullScore: number;
  timeMinutes: number;
  generatedAt: string;           // ISO 8601
  assemblyVersion: string;
  sections: AssembledSection[];
  metadata: PaperMetadata;
}

interface AssemblyResult {
  paper: AssembledPaper;
  warnings: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SM-2 记忆数据
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SM2Item {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReview: string;
  lastQuality: number;
  lastReview: string;
}

interface SM2Data {
  [questionId: string]: SM2Item;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 游戏投喂格式
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface GameQuestion {
  q: string;           // 题干
  o: string[];         // 选项 (已去前缀)
  a: number;           // 答案索引 (0-3)
  type: QuestionType;
  difficulty: Difficulty;
  subject: SubjectCode;
  section: string;
  analysis: string;
  chapter: string;
  score: number;
  _paperId: string;
  _source: QuestionSource;
}

interface VaultPayload {
  subject: SubjectCode;
  paperId: string;
  generatedAt: string;
  questions: GameQuestion[];
  count: number;
  structure: string;   // e.g. "单项选择题(40/40) + 综合应用题(7/7)"
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API 模块接口
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PaperAssemblerInterface {
  assemble(
    subjectCode: SubjectCode,
    rawQuestions?: Question[],
    vaultQuestions?: Question[],
    sm2Data?: SM2Data
  ): AssemblyResult;
}

interface PaperValidatorInterface {
  validate(paper: AssembledPaper): true;
  middleware(): (req: any, res: any, next: any) => void;
}

interface AIPrompt {
  system: string;
  user: string;
}

interface SectionPrompt {
  sectionId: string;
  sectionName: string;
  prompt: AIPrompt;
}

interface AIPromptFactoryInterface {
  buildPrompt(
    subjectCode: SubjectCode,
    sectionId: string,
    opts?: { intelContext?: string; paperNum?: number }
  ): AIPrompt;
  buildFullPaperPrompts(
    subjectCode: SubjectCode,
    opts?: { intelContext?: string; paperNum?: number }
  ): SectionPrompt[];
}

interface GameFeedAdapterInterface {
  toGameFormat(paper: AssembledPaper): GameQuestion[];
  toVaultFormat(paper: AssembledPaper): VaultPayload;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 422 错误
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

declare class AssemblyError extends Error {
  statusCode: number;
  constructor(message: string, statusCode?: number);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 全局暴露
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

declare const EXAM_TEMPLATES: Record<SubjectCode, ExamTemplate>;
declare const PaperAssembler: PaperAssemblerInterface;
declare const PaperValidator: PaperValidatorInterface;
declare const AIPromptFactory: AIPromptFactoryInterface;
declare const GameFeedAdapter: GameFeedAdapterInterface;

export {
  SubjectCode, QuestionType, AnswerFormat, Difficulty, QuestionSource,
  QuestionSchema, SectionTemplate, ExamTemplate,
  Question, SubQuestion, SM2Item, SM2Data,
  AssembledSection, AssembledPaper, PaperMetadata, AssemblyResult,
  GameQuestion, VaultPayload,
  AIPrompt, SectionPrompt,
  AssemblyError,
  EXAM_TEMPLATES, PaperAssembler, PaperValidator, AIPromptFactory, GameFeedAdapter
};
