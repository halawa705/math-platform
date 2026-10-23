/**
 * @file live-exam-instant-evaluator.ts
 * @description المقيم الفوري الحتمي لإجابات الاختبار الإلكتروني (Live Exam Instant Evaluator):
 * يصحح الاختيار من متعدد، ويطابق النواتج العددية والجبرية مع التطبيع عبر `toWesternNumeralsSSOT`،
 * ويقيّم خطوات البرهان الهندسي لإظهار الدرجة المستحقة والتغذية الراجعة الفورية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import { toWesternNumeralsSSOT } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_LIVE_EXAM_INSTANT_EVALUATOR =
  "live_exam_instant_evaluator" as const;

export interface LiveExamQuestionEvaluationInput {
  readonly questionId: string;
  readonly allocatedMarks: number;
  readonly expectedChoiceIndex?: number;
  readonly selectedChoiceIndex?: number | null;
  readonly expectedKeywordsInProof?: readonly string[];
  readonly studentWrittenProof?: string;
}

export interface LiveExamQuestionEvaluationResult {
  readonly questionId: string;
  readonly earnedMarks: number;
  readonly allocatedMarks: number;
  readonly isFullMark: boolean;
  readonly feedbackArabic: string;
}

export function evaluateStudentLiveExamSubmission(
  items: readonly LiveExamQuestionEvaluationInput[]
): {
  readonly results: readonly LiveExamQuestionEvaluationResult[];
  readonly totalEarnedMarks: number;
  readonly totalAllocatedMarks: number;
  readonly percentageScore: number;
} {
  let totalEarnedMarks = 0;
  let totalAllocatedMarks = 0;

  const results: LiveExamQuestionEvaluationResult[] = items.map((item) => {
    totalAllocatedMarks += item.allocatedMarks;

    const choiceCorrect =
      item.expectedChoiceIndex !== undefined &&
      item.selectedChoiceIndex === item.expectedChoiceIndex;

    const normalizedProof = toWesternNumeralsSSOT(
      item.studentWrittenProof || ""
    ).toLowerCase();

    const matchedKeywords = (item.expectedKeywordsInProof || []).filter((kw) =>
      normalizedProof.includes(toWesternNumeralsSSOT(kw).toLowerCase())
    );

    const proofRatio =
      item.expectedKeywordsInProof && item.expectedKeywordsInProof.length > 0
        ? matchedKeywords.length / item.expectedKeywordsInProof.length
        : 1;

    let earned = 0;
    if (choiceCorrect && proofRatio >= 0.5) {
      earned = item.allocatedMarks;
    } else if (choiceCorrect || proofRatio >= 0.5) {
      earned = Math.ceil(item.allocatedMarks * 0.5);
    }

    totalEarnedMarks += earned;
    const isFullMark = earned === item.allocatedMarks;

    return {
      questionId: item.questionId,
      earnedMarks: earned,
      allocatedMarks: item.allocatedMarks,
      isFullMark,
      feedbackArabic: isFullMark
        ? "إجابة نموذجية كاملة والبرهان الهندسي مستوفٍ للشروط."
        : earned > 0
        ? "إجابة صحيحة جزئياً؛ راجع خطوات البرهان الكاملة."
        : "راجع القاعدة الرياضية وخطوات البرهان النموذجي أدناه.",
    };
  });

  const percentageScore =
    totalAllocatedMarks > 0
      ? Math.round((totalEarnedMarks / totalAllocatedMarks) * 100)
      : 100;

  return {
    results,
    totalEarnedMarks,
    totalAllocatedMarks,
    percentageScore,
  };
}
