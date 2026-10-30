/**
 * @file online-exam-grader.ts
 * @description المصحّح النقي للاختبار الإلكتروني (يُستدعى في الخادم فقط): اختيار من متعدد + إجابة قصيرة. درجة كاملة أو صفر.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 80 سطراً).
 */
import type { OnlineAnswerKeyItem } from "./online-exam-public-key-splitter";
import { isStudentShortAnswerCorrect } from "./short-answer-matcher";

export const MODULE_ID_ONLINE_EXAM_GRADER = "online_exam_grader" as const;

export interface StudentAnswerInput { readonly choiceIndex?: number | null; readonly text?: string }

export interface OnlineQuestionResult {
  readonly questionId: string;
  readonly isCorrect: boolean;
  readonly earnedMarks: number;
  readonly allocatedMarks: number;
}

export interface OnlineExamGradeResult {
  readonly items: readonly OnlineQuestionResult[];
  readonly totalEarnedMarks: number;
  readonly totalAllocatedMarks: number;
  readonly percentage: number;
}

export function gradeOnlineExam(
  answerKey: readonly OnlineAnswerKeyItem[],
  answers: Readonly<Record<string, StudentAnswerInput | undefined>>
): OnlineExamGradeResult {
  let earned = 0;
  let total = 0;
  const items = answerKey.map((k): OnlineQuestionResult => {
    const a = answers[k.questionId];
    const isCorrect =
      k.answerMode === "mcq"
        ? a?.choiceIndex !== undefined && a.choiceIndex !== null && a.choiceIndex === k.correctMcqChoiceIndex
        : isStudentShortAnswerCorrect(a?.text ?? "", k.acceptedAnswers);
    const got = isCorrect ? k.allocatedMarks : 0;
    earned += got;
    total += k.allocatedMarks;
    return { questionId: k.questionId, isCorrect, earnedMarks: got, allocatedMarks: k.allocatedMarks };
  });
  return { items, totalEarnedMarks: earned, totalAllocatedMarks: total, percentage: total > 0 ? Math.round((earned / total) * 100) : 0 };
}
