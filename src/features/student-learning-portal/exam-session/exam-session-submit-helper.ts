/**
 * @file exam-session-submit-helper.ts
 * @description مساعد تسليم وتصحيح الاختبار (التدريب المؤقت، تجربة المعلم، والتسليم الرسمي الأول).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 130 سطراً).
 */

import {
  gradeOnlineExam,
  type OnlineQuestionResult,
  type StudentAnswerInput,
} from "@/core/exam-grading/online-exam-grader";
import {
  loadLocalExamAnswerKeySSOT,
  type PublishedOnlineExam,
} from "@/features/electronic-exams-hub/published-online-exams-store";
import { recordStudentOnlineExamSubmissionSSOT } from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import { clearPersistentExamDraft } from "./exam-draft-persistent-storage";
import {
  gradeEphemeralPracticeApi,
  submitOfficialExamApi,
} from "./exam-session-api-client";
import type { ExamQuestionReviewInfo } from "./use-exam-session";

export const MODULE_ID_EXAM_SESSION_SUBMIT_HELPER =
  "exam_session_submit_helper" as const;

export interface ExecuteSubmitOutcome {
  readonly ok: boolean;
  readonly error?: string;
  readonly percentage?: number;
  readonly items?: readonly OnlineQuestionResult[];
  readonly review?: readonly ExamQuestionReviewInfo[] | null;
  readonly answersUsed?: Record<string, StudentAnswerInput | undefined>;
  readonly autoSubmittedFromDraft?: boolean;
  readonly isOfficialSaved?: boolean;
}

export async function executeExamSubmitAction(params: {
  readonly exam: PublishedOnlineExam;
  readonly studentCode?: string;
  readonly studentNameAr: string;
  readonly isTeacherPreview: boolean;
  readonly isEphemeralPracticeMode: boolean;
  readonly answers: Readonly<Record<string, StudentAnswerInput>>;
  readonly startedAtIso: string;
  readonly draftKey: string;
}): Promise<ExecuteSubmitOutcome> {
  const { exam, studentCode, studentNameAr, isTeacherPreview, isEphemeralPracticeMode, answers, startedAtIso, draftKey } = params;

  if (isEphemeralPracticeMode) {
    try {
      const res = await gradeEphemeralPracticeApi({ examCode: exam.examId, answers });
      if (!res.ok) return { ok: false, error: res.error || "تعذر تصحيح المحاولة التدريبية." };
      return { ok: true, percentage: res.percentage ?? 0, items: res.items ?? [], review: res.review ?? null };
    } catch {
      return { ok: false, error: "تعذر الاتصال بالخادم لتصحيح المحاولة التدريبية." };
    }
  }

  if (isTeacherPreview) {
    try {
      const res = await submitOfficialExamApi({
        examCode: exam.examId, studentNameAr, answers, isTeacherSimulation: true,
      });
      if (res.ok) return { ok: true, percentage: res.percentage ?? 0, items: res.items ?? [], review: res.review ?? null };
    } catch { /* fallback local key */ }

    const localKey = loadLocalExamAnswerKeySSOT(exam.examId);
    if (localKey && localKey.length > 0) {
      const localRes = gradeOnlineExam(localKey, answers);
      return {
        ok: true,
        percentage: localRes.percentage,
        items: localRes.items,
        review: localKey.map((k) => ({
          questionId: k.questionId,
          correctMcqChoiceIndex: k.correctMcqChoiceIndex,
          finalAnswerArabic: k.finalAnswerArabic,
          modelSolutionStepsArabic: k.modelSolutionStepsArabic,
        })),
      };
    }
    return { ok: false, error: "تعذر العثور على مفتاح إجابة هذا الاختبار للتصحيح التجريبي." };
  }

  try {
    const res = await submitOfficialExamApi({
      examCode: exam.examId, studentNameAr, answers, isTeacherSimulation: false,
    });
    if (!res.ok && res.status !== 409) return { ok: false, error: res.error || "تعذر تسليم الاختبار." };
    const pct = res.percentage ?? 0;
    const items = res.items ?? [];
    const usedAnswers = res.answersUsed ?? answers;
    recordStudentOnlineExamSubmissionSSOT({
      exam,
      studentCode: studentCode!,
      studentNameAr,
      percentageScore: pct,
      startedAtIso: startedAtIso || new Date().toISOString(),
      answersJson: usedAnswers,
      resultJson: {
        items,
        totalEarnedMarks: res.totalEarnedMarks ?? 0,
        totalAllocatedMarks: res.totalAllocatedMarks ?? 0,
        percentage: pct,
      },
      skipCloudSync: true,
    });
    if (draftKey) clearPersistentExamDraft(draftKey);
    return {
      ok: true,
      percentage: pct,
      items,
      review: res.review,
      answersUsed: res.answersUsed,
      autoSubmittedFromDraft: res.autoSubmittedFromDraft,
      isOfficialSaved: true,
    };
  } catch {
    return { ok: false, error: "تعذر الاتصال بالخادم لتسليم الاختبار." };
  }
}
