/**
 * @file question-answer-lines-adaptive-resolver.ts
 * @description محلل أسطر إجابة الطالب التكيفية: يحدد عدد الأسطر المثالي (0، 1، 2، 3)
 * حسب طبيعة المسألة (اختيار من متعدد = صفر، حساب مباشر = سطر واحد، برهان هندسي = 3 أسطر)
 * بدل فرض عدد ثابت يبتلع الفراغ ويُهدر مساحة الورقة بلا فائدة تعليمية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_QUESTION_ANSWER_LINES_ADAPTIVE_RESOLVER =
  "question_answer_lines_adaptive_resolver" as const;

const PROOF_KEYWORDS_REGEX = /(?:بالبرهان|أثبت\s*أن|برهن|بين\s*أن|علل|فسر)/i;
const MULTI_STEP_EQ_REGEX = /(?:حل\s*المعادلة|حل\s*المتباينة|مجموعة\s*الحل|أوجد\s*م\.ح)/i;
const DIRECT_CALC_KEYWORDS_REGEX = /(?:أوجد\s*قياس|أوجد\s*قيمة|احسب\s*قيمة|كم\s*يساوي|ما\s*قيمة)/i;

/**
 * يحسب عدد أسطر الإجابة المخصصة لتدريب الطالب تكيفياً.
 */
export function resolveAdaptiveAnswerLinesCount(params: {
  readonly question: PrintableMathQuestionItem;
  readonly defaultSettingsLines?: number;
  readonly hasManualEssayLinesLock?: boolean;
}): number {
  const { question, defaultSettingsLines, hasManualEssayLinesLock } = params;

  // أسئلة الاختيار من متعدد لا تحتاج أسطر كتابة نهائياً (حتمي: 0)
  if (question.kind === "mcq" || (question.mcqChoicesAr && question.mcqChoicesAr.length > 0)) {
    return 0;
  }

  // إذا تم تخصيص عدد الأسطر صراحة لهذا السؤال بعينه من المعلم
  if (question.hasCustomAnswerLines && typeof question.answerLinesCount === "number") {
    return question.answerLinesCount;
  }

  // إذا تم تحديد عدد سطور المقالي صراحة (من قفل المعلم أو محرك AutoFit)
  if (typeof defaultSettingsLines === "number") {
    return defaultSettingsLines;
  }

  // إذا حُدد عدد الأسطر سابقاً في السؤال
  if (typeof question.answerLinesCount === "number" && question.answerLinesCount >= 0) {
    return question.answerLinesCount;
  }

  const prompt = question.promptAr || "";
  const isProofQuestion = PROOF_KEYWORDS_REGEX.test(prompt);

  // مسائل البراهين الهندسية أو الأسئلة الطويلة المركبة
  if (isProofQuestion || prompt.length > 150) {
    return 3;
  }

  // مسائل حل المعادلات والمتباينات تتطلب سطرين للخطوات ومجموعة الحل
  if (MULTI_STEP_EQ_REGEX.test(prompt)) {
    return 2;
  }

  // المسائل الحسابية المباشرة السريعة (سطر واحد لكتابة الناتج والوحدة)
  const isDirectCalc = DIRECT_CALC_KEYWORDS_REGEX.test(prompt) || prompt.length <= 65;
  if (isDirectCalc) {
    return 1;
  }

  // الوضع القياسي المتوازن
  return 2;
}
