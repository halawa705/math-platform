/**
 * @file question-card-compact-density-resolver.ts
 * @description محلل كثافة بطاقة السؤال الرياضي: يحدد درجة الكثافة (فائقة الرشاقة، مدمجة، قياسية)
 * وهوامش الحشو الداخلية ومقاسات الشارات بناءً على طول نص السؤال ووجود الأشكال الهندسية أو خطوات الحل،
 * لتفادي تضخيم البطاقات القصيرة وضمان استيعاب أكبر عدد من الأسئلة في الصفحة دون هدر.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_QUESTION_CARD_COMPACT_DENSITY_RESOLVER =
  "question_card_compact_density_resolver" as const;

export type QuestionCardDensityGrade = "ultra_compact" | "compact" | "standard";

export interface QuestionCardDensityMetrics {
  readonly grade: QuestionCardDensityGrade;
  readonly cardPaddingClass: string;
  readonly badgeSizeClass: string;
  readonly figureScaleFactor: number;
}

/**
 * يحلل محتوى السؤال ويعيد مواصفات الكثافة المثالية له.
 */
export function resolveQuestionCardDensity(params: {
  readonly question: PrintableMathQuestionItem;
  readonly isBookletSolvedExample: boolean;
  readonly isAnswerCard: boolean;
  readonly columnsCount: 1 | 2;
}): QuestionCardDensityMetrics {
  const { question, isBookletSolvedExample, isAnswerCard, columnsCount } = params;
  const promptLen = question.promptAr?.length ?? 0;
  const hasFigure = Boolean(question.geometryFigure || question.graphSpec || question.rawSvgMarkup);
  const hasMcq = Boolean(question.mcqChoicesAr && question.mcqChoicesAr.length > 0);
  const stepsCount = question.solutionStepsAr?.length ?? 0;

  // الأسئلة ذات الخطوات المتعددة أو بطاقات الحل الكاملة
  if (isAnswerCard || (isBookletSolvedExample && stepsCount >= 4) || promptLen > 220) {
    return {
      grade: "standard",
      cardPaddingClass: "p-2 pb-2",
      badgeSizeClass: "px-2.5 py-0.5 text-[0.82em]",
      figureScaleFactor: columnsCount === 2 ? 0.92 : 1.0,
    };
  }

  // الأسئلة المتوسطة أو ذات الأشكال الهندسية
  if (hasFigure || hasMcq || stepsCount >= 2 || promptLen > 90) {
    return {
      grade: "compact",
      cardPaddingClass: columnsCount === 2 ? "p-2 pb-1.5" : "p-2 pb-2",
      badgeSizeClass: "px-2 py-0.5 text-[0.80em]",
      figureScaleFactor: columnsCount === 2 ? 0.88 : 1.0,
    };
  }

  // الأسئلة القصيرة المباشرة (حساب، جبر سريع، تدريب خطوة واحدة)
  return {
    grade: "ultra_compact",
    cardPaddingClass: "p-1.5 pb-1",
    badgeSizeClass: "px-1.5 py-0.2 text-[0.76em]",
    figureScaleFactor: columnsCount === 2 ? 0.82 : 0.90,
  };
}
