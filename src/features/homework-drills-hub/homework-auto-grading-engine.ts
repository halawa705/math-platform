/**
 * @file homework-auto-grading-engine.ts
 * @description محرك التصحيح الفوري للواجب الإلكتروني وإدارة نشر واسترجاع الواجبات النشطة للطالب أونلاين.
 * يربط الواجب المولد عبر NotebookLM بـ (الصف الدراسي -> الوحدة -> الدرس) من مستكشف المنهج (`curriculum-hierarchy-ssot.ts`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { isStudentShortAnswerCorrect } from "@/core/exam-grading/short-answer-matcher";

export const MODULE_ID_HOMEWORK_AUTO_GRADING_ENGINE =
  "homework_auto_grading_engine" as const;

export interface PublishedOnlineHomeworkAssignment {
  readonly assignmentId: string;
  readonly gradeId: string;
  readonly gradeNameArabic: string;
  readonly unitId: string;
  readonly unitTitleArabic: string;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;
  readonly branchId: MathBranchId;
  readonly createdAtIso: string;
  readonly questions: readonly QuestionAssessmentIR[];
}

const HOMEWORK_STORAGE_KEY = "math_platform_online_homework_v2" as const;

function readHomeworkList(): PublishedOnlineHomeworkAssignment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HOMEWORK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as
      | PublishedOnlineHomeworkAssignment[]
      | PublishedOnlineHomeworkAssignment;
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list.filter((a) => a && Array.isArray(a.questions) && a.questions.length > 0);
  } catch {
    return [];
  }
}

/** أحدث واجب منشور فعلياً للصف المحدد (أو أحدث واجب عموماً)، أو null إن لم ينشر المعلم أي واجب. */
export function loadActiveOnlineHomeworkAssignment(
  gradeId?: string
): PublishedOnlineHomeworkAssignment | null {
  const list = readHomeworkList();
  return (gradeId ? list.find((a) => a.gradeId === gradeId) : list[0]) || null;
}

export function publishOnlineHomeworkAssignment(
  assignment: PublishedOnlineHomeworkAssignment
): void {
  if (typeof window === "undefined") return;
  try {
    const others = readHomeworkList().filter((a) => a.assignmentId !== assignment.assignmentId);
    window.localStorage.setItem(
      HOMEWORK_STORAGE_KEY,
      JSON.stringify([assignment, ...others].slice(0, 30))
    );
  } catch {
    // ignore storage write error
  }
}
export function gradeStudentHomeworkAnswer(params: {
  readonly question: QuestionAssessmentIR;
  readonly selectedChoiceIdx?: number | null;
  readonly writtenStepsText?: string;
}): {
  readonly isCorrect: boolean;
  readonly earnedMarks: number;
  readonly feedbackArabic: string;
} {
  const { question, selectedChoiceIdx, writtenStepsText } = params;

  if (question.patternKind === "mcq") {
    const ok = selectedChoiceIdx === (question.correctMcqChoiceIndex ?? 0);
    return {
      isCorrect: ok,
      earnedMarks: ok ? question.allocatedMarks : 0,
      feedbackArabic: ok
        ? `إجابة صحيحة! ${question.modelSolutionStepsArabic[0] || ""}`
        : `راجع الحل النموذجي: ${question.modelSolutionStepsArabic[0] || ""}`,
    };
  }

  const accepted =
    question.acceptedAnswersArabic && question.acceptedAnswersArabic.length > 0
      ? question.acceptedAnswersArabic
      : [question.finalCanonicalAnswerArabic];

  const ok = isStudentShortAnswerCorrect(writtenStepsText || "", accepted);

  return {
    isCorrect: ok,
    earnedMarks: ok ? question.allocatedMarks : 0,
    feedbackArabic: ok
      ? `أحسنت! خطوات صحيحة والناتج النهائي (${question.finalCanonicalAnswerArabic}) مطابق.`
      : `الحل النموذجي: ${question.modelSolutionStepsArabic.join(" — ")}`,
  };
}
