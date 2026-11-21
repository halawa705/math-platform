/**
 * @file route.ts
 * @description نقطة بدء أو استئناف محاولة الاختبار الإلكتروني للطالب (`/api/exams/start`):
 * - تُظهر شاشة اختيار الوضع (`اختبار` أو `تدريب`) قبل بدء المؤقت لأول مرة، وتقفله على الخادم لهذا الاختبار.
 * - تسترجع المسودة المحفوظة والأسئلة المقفولة (في وضع التدريب) عند تحديث الصفحة أو انقطاع الإنترنت.
 * - تعيد المراجعة الكاملة والحلول النموذجية مع إتاحة التدريب المؤقت عند وجود تسليم رسمي أول.
 */

import { NextResponse } from "next/server";
import {
  STUDENT_AUTH_COOKIE_NAME,
  verifyStudentSessionToken,
} from "@/core/auth/student-auth-server-ssot";
import {
  readCookieFromRequest,
  sbInsertIgnore,
  sbSelect,
} from "@/core/auth/exam-server-supabase-helper";
import {
  loadExamAttemptMetaServer,
  saveExamAttemptMetaServer,
  type OnlineExamSessionMode,
} from "@/core/auth/exam-attempt-state-server-store";
import type { OnlineAnswerKeyItem } from "@/core/exam-grading/online-exam-public-key-splitter";

export async function POST(req: Request) {
  try {
    const session = await verifyStudentSessionToken(
      readCookieFromRequest(req, STUDENT_AUTH_COOKIE_NAME)
    );
    if (!session) {
      return NextResponse.json(
        { success: false, error: "يرجى تسجيل دخول الطالب أولاً." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      examCode?: string;
      mode?: OnlineExamSessionMode;
    };
    const examCode = (body.examCode || "").trim();
    if (!examCode) {
      return NextResponse.json(
        { success: false, error: "رمز الاختبار مطلوب." },
        { status: 400 }
      );
    }

    const exams = await sbSelect<{
      exam_code: string;
      grade_id: string;
      status?: string | null;
      is_published?: boolean | null;
      expires_at?: string | null;
      duration_minutes?: number | null;
    }>(
      `electronic_exams?exam_code=eq.${encodeURIComponent(examCode)}&select=exam_code,grade_id,status,is_published,expires_at,duration_minutes`
    );

    const exam = exams?.[0];
    if (
      !exam ||
      exam.grade_id !== session.gradeId ||
      exam.status === "archived" ||
      exam.is_published === false ||
      (exam.expires_at && Date.parse(exam.expires_at) <= Date.now())
    ) {
      return NextResponse.json(
        { success: false, error: "هذا الاختبار غير متاح لصفك حالياً أو انتهت صلاحيته." },
        { status: 403 }
      );
    }

    const durationMinutes = exam.duration_minutes || 60;
    const submissionCode = `${examCode}__${session.studentCode}`;
    const existingSub = await sbSelect<{
      percentage: number;
      result_json?: unknown;
      answers_json?: unknown;
    }>(
      `exam_submissions?submission_code=eq.${encodeURIComponent(submissionCode)}&select=percentage,result_json,answers_json`
    );

    if (existingSub && existingSub.length > 0) {
      const keyRows = await sbSelect<{
        answer_key: readonly OnlineAnswerKeyItem[];
        reveal_answers?: boolean;
      }>(
        `exam_answer_keys?exam_code=eq.${encodeURIComponent(examCode)}&select=answer_key,reveal_answers`
      );
      const keyRow = keyRows?.[0];
      const review =
        keyRow && keyRow.reveal_answers !== false && Array.isArray(keyRow.answer_key)
          ? keyRow.answer_key.map((k) => ({
              questionId: k.questionId,
              correctMcqChoiceIndex: k.correctMcqChoiceIndex,
              finalAnswerArabic: k.finalAnswerArabic,
              modelSolutionStepsArabic: k.modelSolutionStepsArabic,
            }))
          : null;

      return NextResponse.json(
        {
          success: false,
          alreadySubmitted: true,
          canPracticeRetry: true,
          error: "لقد قمت بتسليم المحاولة الرسمية لهذا الاختبار مسبقاً.",
          percentage: existingSub[0].percentage,
          result: existingSub[0].result_json,
          answersJson: existingSub[0].answers_json,
          review,
        },
        { status: 409 }
      );
    }

    const existingMeta = await loadExamAttemptMetaServer(examCode, session.studentCode);
    if (existingMeta) {
      return NextResponse.json({
        success: true,
        startedAtIso: existingMeta.startedAtIso,
        serverNowIso: new Date().toISOString(),
        durationMinutes,
        lockedMode: existingMeta.examMode,
        savedDraftAnswers: existingMeta.draftAnswers,
        lockedQuestionIds: existingMeta.lockedQuestionIds,
        lockedFeedbackByQuestion: existingMeta.lockedFeedbackByQuestion,
      });
    }

    const chosenMode: OnlineExamSessionMode | null =
      body.mode === "exam" || body.mode === "training" ? body.mode : null;

    if (!chosenMode) {
      return NextResponse.json({
        success: true,
        needsModeSelection: true,
        durationMinutes,
        serverNowIso: new Date().toISOString(),
      });
    }

    const nowIso = new Date().toISOString();
    await sbInsertIgnore(
      "exam_attempts",
      {
        exam_code: examCode,
        student_code: session.studentCode,
        started_at: nowIso,
      },
      "exam_code,student_code"
    );

    const attempts = await sbSelect<{ started_at: string }>(
      `exam_attempts?exam_code=eq.${encodeURIComponent(examCode)}&student_code=eq.${encodeURIComponent(session.studentCode)}&select=started_at`
    );

    const startedAtIso = attempts?.[0]?.started_at || nowIso;
    await saveExamAttemptMetaServer({
      examCode,
      studentCode: session.studentCode,
      examMode: chosenMode,
      startedAtIso,
      draftAnswers: {},
      lockedQuestionIds: [],
      lockedFeedbackByQuestion: {},
      updatedAtIso: nowIso,
    });

    return NextResponse.json({
      success: true,
      startedAtIso,
      serverNowIso: new Date().toISOString(),
      durationMinutes,
      lockedMode: chosenMode,
      savedDraftAnswers: {},
      lockedQuestionIds: [],
      lockedFeedbackByQuestion: {},
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "تعذر بدء جلسة الاختبار." },
      { status: 500 }
    );
  }
}
