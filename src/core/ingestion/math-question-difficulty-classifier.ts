/**
 * @file math-question-difficulty-classifier.ts
 * @description مصنف ذري تلقائي لمستوى الصعوبة التربوية (`tأسيسي` / `تطبيقي` / `برهان` / `متفوقين`)
 * أثناء استيراد أسئلة الرياضيات من NotebookLM مع تطهير وسوم المستوى من نص الطالب.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 95 سطراً).
 */

import type { MathQuestionCognitiveDepth, MathQuestionPatternKind } from "../ir/question-assessment-ir";

export const MODULE_ID_MATH_QUESTION_DIFFICULTY_CLASSIFIER =
  "math_question_difficulty_classifier" as const;

export const MATH_COGNITIVE_DEPTH_LABELS_AR: Readonly<Record<MathQuestionCognitiveDepth, string>> = {
  direct_application: "تأسيسي",
  multi_step_analysis: "تطبيقي",
  deductive_proof: "برهان",
  higher_order_olympiad: "متفوقين",
};

const OLYMPIAD_RE =
  /متفوق(?:ين|ون)|مستو(?:ى|يات)\s*عليا|أولمبياد|تحد[يّ]|تمييز\s*عالي|تفكير\s*عليا/i;

const DEDUCTIVE_PROOF_RE = /(?:^|\s)(?:أثبت|اثبت|برهن|بالبرهان)\b/i;

const APPLIED_MULTI_STEP_RE =
  /تطبيقي|متوسط|متقدم|\(\s*1\s*\)[\s\S]*\(\s*2\s*\)|أولاً\s*:[\s\S]*ثانياً\s*:|ثم\s+(?:احسب|أوجد|تحقق|اكتب|مثل|مثّل)/i;

const EXPLICIT_DIFFICULTY_TAG_RE =
  /\|\s*المستوى\s*:\s*\[?\s*(?:تأسيسي|مباشر|تطبيقي|متوسط|متقدم|متفوقين|مستويات\s*عليا|تحد[يّ]|أولمبياد)\s*\]?/gi;

const INLINE_DIFFICULTY_PREFIX_RE =
  /(?:^|\n|\s)\[\s*(?:تأسيسي|مباشر|تطبيقي|متوسط|متقدم|متفوقين|مستويات\s*عليا|تحد[يّ]|أولمبياد)\s*\]\s*/gi;

const LINE_DIFFICULTY_META_RE =
  /^\s*(?:[-•*]\s*)?(?:\*{0,2})المستوى(?:\*{0,2})\s*:\s*(?:تأسيسي|مباشر|تطبيقي|متوسط|متقدم|متفوقين|مستويات\s*عليا|تحد[يّ]|أولمبياد)\s*$/gim;

/** يصنف مستوى التفكير المعرفي للسؤال المستورد استناداً إلى الوسوم وبنية المسألة الرياضية. */
export function classifyMathQuestionDifficulty(params: {
  readonly rawBlock: string;
  readonly promptArabic: string;
  readonly patternKind: MathQuestionPatternKind;
}): MathQuestionCognitiveDepth {
  const combined = `${params.rawBlock}\n${params.promptArabic}`;
  if (OLYMPIAD_RE.test(combined)) return "higher_order_olympiad";
  if (params.patternKind === "proof_reasoning" || DEDUCTIVE_PROOF_RE.test(combined)) {
    return "deductive_proof";
  }
  if (APPLIED_MULTI_STEP_RE.test(combined) || /^\s*\|.*\|\s*$/m.test(combined)) {
    return "multi_step_analysis";
  }
  return "direct_application";
}

/** يزيل وسوم ومحددات المستوى من النص المعروض للطالب داخل الورقة المطبوعة مع إبقاء المعادلات سليمة. */
export function stripDifficultyMarkerFromPrompt(prompt: string): string {
  if (!prompt) return "";
  return prompt
    .replace(EXPLICIT_DIFFICULTY_TAG_RE, "")
    .replace(LINE_DIFFICULTY_META_RE, "")
    .replace(INLINE_DIFFICULTY_PREFIX_RE, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
