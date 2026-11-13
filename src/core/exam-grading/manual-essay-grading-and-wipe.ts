/**
 * @file manual-essay-grading-and-wipe.ts
 * @description منطق تصحيح المعلم اليدوي للأسئلة المقالية وصور البرهان مع حذف بيانات الصورة فوراً بعد اعتماد الدرجة لمنع تضخم التخزين.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 115 سطراً).
 */

import type {
  OnlineExamGradeResult,
  OnlineQuestionResult,
  StudentAnswerInput,
} from "./online-exam-grader";

export const MODULE_ID_MANUAL_ESSAY_GRADING_AND_WIPE =
  "manual_essay_grading_and_wipe" as const;

export interface ManualQuestionGradeInput {
  readonly earnedMarks: number;
  readonly teacherFeedback?: string;
}

export interface ManualGradeAndWipeOutput {
  readonly updatedAnswersJson: Readonly<Record<string, StudentAnswerInput | undefined>>;
  readonly updatedResultJson: OnlineExamGradeResult;
  readonly wipedImagesCount: number;
}

export function applyManualGradesAndWipePhotos(params: {
  readonly answersJson?: Readonly<Record<string, StudentAnswerInput | undefined>>;
  readonly resultJson?: OnlineExamGradeResult;
  readonly gradesByQuestionId: Readonly<Record<string, ManualQuestionGradeInput>>;
}): ManualGradeAndWipeOutput {
  const sourceAnswers = params.answersJson ?? {};
  const sourceItems = params.resultJson?.items ?? [];

  const updatedAnswers: Record<string, StudentAnswerInput | undefined> = { ...sourceAnswers };
  let wipedImagesCount = 0;

  const updatedItems: OnlineQuestionResult[] = sourceItems.map((item) => {
    const manual = params.gradesByQuestionId[item.questionId];
    if (!manual) return item;

    const clampedEarned = Math.max(
      0,
      Math.min(item.allocatedMarks, Number(manual.earnedMarks) || 0)
    );
    const existingAns = updatedAnswers[item.questionId];
    if (existingAns?.proofImageDataUrl) {
      wipedImagesCount += 1;
      updatedAnswers[item.questionId] = {
        choiceIndex: existingAns.choiceIndex,
        text: existingAns.text,
        proofImageDeletedAfterGrading: true,
      };
    }

    return {
      questionId: item.questionId,
      allocatedMarks: item.allocatedMarks,
      earnedMarks: clampedEarned,
      isCorrect: clampedEarned >= item.allocatedMarks * 0.5,
      pendingTeacherReview: false,
      teacherFeedback: manual.teacherFeedback?.trim() || item.teacherFeedback,
    };
  });

  // تنظيف أي صور متبقية لأسئلة تم تصحيحها يدوياً من قبل المعلم
  for (const [qId, ans] of Object.entries(updatedAnswers)) {
    if (ans?.proofImageDataUrl && params.gradesByQuestionId[qId]) {
      wipedImagesCount += 1;
      updatedAnswers[qId] = {
        choiceIndex: ans.choiceIndex,
        text: ans.text,
        proofImageDeletedAfterGrading: true,
      };
    }
  }

  const totalEarnedMarks = updatedItems.reduce((sum, i) => sum + i.earnedMarks, 0);
  const totalAllocatedMarks = updatedItems.reduce((sum, i) => sum + i.allocatedMarks, 0);
  const percentage =
    totalAllocatedMarks > 0 ? Math.round((totalEarnedMarks / totalAllocatedMarks) * 100) : 0;

  return {
    updatedAnswersJson: updatedAnswers,
    updatedResultJson: {
      items: updatedItems,
      totalEarnedMarks,
      totalAllocatedMarks,
      percentage,
    },
    wipedImagesCount,
  };
}
