/**
 * @file exam-session-api-client.ts
 * @description عميل نقاط خادم جلسة الاختبار الإلكتروني (البدء وقفل الوضع، التحقق الفوري باتجاه واحد،
 * الحفظ التلقائي للمسودة، التسليم الرسمي، وإعادة التدريب المؤقتة بلا تخزين).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

import type {
  LockedTrainingQuestionFeedback,
  OnlineExamSessionMode,
} from "@/core/auth/exam-attempt-state-server-store";
import type {
  OnlineExamGradeResult,
  OnlineQuestionResult,
  StudentAnswerInput,
} from "@/core/exam-grading/online-exam-grader";
import type { ExamQuestionReviewInfo } from "./use-exam-session";

export const MODULE_ID_EXAM_SESSION_API_CLIENT =
  "exam_session_api_client" as const;

export interface StartExamApiResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly needsModeSelection?: boolean;
  readonly alreadySubmitted?: boolean;
  readonly canPracticeRetry?: boolean;
  readonly startedAtIso?: string;
  readonly serverNowIso?: string;
  readonly durationMinutes?: number;
  readonly lockedMode?: OnlineExamSessionMode;
  readonly savedDraftAnswers?: Record<string, StudentAnswerInput | undefined>;
  readonly lockedQuestionIds?: readonly string[];
  readonly lockedFeedbackByQuestion?: Record<string, LockedTrainingQuestionFeedback>;
  readonly percentage?: number;
  readonly result?: OnlineExamGradeResult;
  readonly answersJson?: Record<string, StudentAnswerInput | undefined>;
  readonly review?: readonly ExamQuestionReviewInfo[] | null;
  readonly error?: string;
}

export async function startExamSessionApi(
  examCode: string,
  mode?: OnlineExamSessionMode
): Promise<StartExamApiResponse> {
  const res = await fetch("/api/exams/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examCode, ...(mode ? { mode } : {}) }),
  });
  const data = (await res.json()) as Omit<StartExamApiResponse, "ok" | "status">;
  return { ...data, ok: res.ok, status: res.status };
}

export async function checkTrainingQuestionApi(params: {
  readonly examCode: string;
  readonly questionId: string;
  readonly answer: StudentAnswerInput;
}): Promise<{
  readonly ok: boolean;
  readonly status: number;
  readonly alreadyLocked?: boolean;
  readonly feedback?: LockedTrainingQuestionFeedback;
  readonly error?: string;
}> {
  const res = await fetch("/api/exams/check-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as {
    alreadyLocked?: boolean;
    feedback?: LockedTrainingQuestionFeedback;
    error?: string;
  };
  return { ...data, ok: res.ok, status: res.status };
}

export async function saveExamDraftApi(
  examCode: string,
  answers: Readonly<Record<string, StudentAnswerInput | undefined>>,
  keepalive = false
): Promise<{ readonly ok: boolean; readonly savedAtIso?: string; readonly expired?: boolean }> {
  const res = await fetch("/api/exams/save-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examCode, answers }),
    ...(keepalive ? { keepalive: true } : {}),
  });
  if (!res.ok) return { ok: false };
  const data = (await res.json()) as {
    success?: boolean;
    savedAtIso?: string;
    expired?: boolean;
  };
  return { ok: Boolean(data.success), savedAtIso: data.savedAtIso, expired: data.expired };
}

export interface SubmitOrPracticeResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly autoSubmittedFromDraft?: boolean;
  readonly isEphemeralPractice?: boolean;
  readonly percentage?: number;
  readonly totalEarnedMarks?: number;
  readonly totalAllocatedMarks?: number;
  readonly items?: readonly OnlineQuestionResult[];
  readonly answersUsed?: Record<string, StudentAnswerInput | undefined>;
  readonly review?: readonly ExamQuestionReviewInfo[] | null;
  readonly error?: string;
}

export async function submitOfficialExamApi(params: {
  readonly examCode: string;
  readonly studentNameAr: string;
  readonly answers: Readonly<Record<string, StudentAnswerInput | undefined>>;
  readonly isTeacherSimulation: boolean;
}): Promise<SubmitOrPracticeResponse> {
  const res = await fetch("/api/exams/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as Omit<SubmitOrPracticeResponse, "ok" | "status">;
  return { ...data, ok: res.ok, status: res.status };
}

export async function gradeEphemeralPracticeApi(params: {
  readonly examCode: string;
  readonly answers: Readonly<Record<string, StudentAnswerInput | undefined>>;
}): Promise<SubmitOrPracticeResponse> {
  const res = await fetch("/api/exams/practice-grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as Omit<SubmitOrPracticeResponse, "ok" | "status">;
  return { ...data, ok: res.ok, status: res.status };
}
