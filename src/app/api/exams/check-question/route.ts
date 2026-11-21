/**
 * @file route.ts
 * @description نقطة تأكيد وتصحيح السؤال الفردي باتجاه واحد في «وضع التدريب» (`/api/exams/check-question`):
 * تقفل السؤال على الخادم نهائياً بعد إظهار الإجابة الصحيحة وخطوات الحل، وتمنع تعديله.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 165 سطراً).
 */

import { NextResponse } from "next/server";
import {
  STUDENT_AUTH_COOKIE_NAME,
  verifyStudentSessionToken,
} from "@/core/auth/student-auth-server-ssot";
import { readCookieFromRequest, sbSelect } from "@/core/auth/exam-server-supabase-helper";
import {
  loadExamAttemptMetaServer,
  saveExamAttemptMetaServer,
  type LockedTrainingQuestionFeedback,
} from "@/core/auth/exam-attempt-state-server-store";
import {
  gradeOnlineExam,
  type StudentAnswerInput,
} from "@/core/exam-grading/online-exam-grader";
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
      questionId?: string;
      answer?: StudentAnswerInput;
    };
    const examCode = (body.examCode || "").trim();
    const questionId = (body.questionId || "").trim();
    if (!examCode || !questionId) {
      return NextResponse.json(
        { success: false, error: "بيانات السؤال أو الاختبار ناقصة." },
        { status: 400 }
      );
    }

    const meta = await loadExamAttemptMetaServer(examCode, session.studentCode);
    if (!meta || meta.examMode !== "training") {
      return NextResponse.json(
        { success: false, error: "التحقق الفوري متاح في وضع التدريب فقط." },
        { status: 400 }
      );
    }

    if (meta.lockedQuestionIds.includes(questionId)) {
      return NextResponse.json(
        {
          success: false,
          alreadyLocked: true,
          feedback: meta.lockedFeedbackByQuestion[questionId],
          error: "تم تأكيد إجابة هذا السؤال مسبقاً ولا يمكن تعديله في وضع التدريب.",
        },
        { status: 409 }
      );
    }

    const exams = await sbSelect<{
      duration_minutes?: number | null;
      status?: string | null;
      expires_at?: string | null;
    }>(
      `electronic_exams?exam_code=eq.${encodeURIComponent(examCode)}&select=duration_minutes,status,expires_at`
    );
    const exam = exams?.[0];
    const durationMin = exam?.duration_minutes || 60;
    if (Date.now() > Date.parse(meta.startedAtIso) + durationMin * 60_000 + 90_000) {
      return NextResponse.json(
        { success: false, error: "انتهى وقت الاختبار، سيتم اعتماد إجاباتك المحفوظة." },
        { status: 403 }
      );
    }

    const keyRows = await sbSelect<{
      answer_key: readonly OnlineAnswerKeyItem[];
    }>(
      `exam_answer_keys?exam_code=eq.${encodeURIComponent(examCode)}&select=answer_key`
    );
    const keyItem = keyRows?.[0]?.answer_key?.find((k) => k.questionId === questionId);
    if (!keyItem) {
      return NextResponse.json(
        { success: false, error: "تعذر العثور على نموذج إجابة هذا السؤال." },
        { status: 404 }
      );
    }

    const safeAnswer = body.answer ?? {};
    const graded = gradeOnlineExam([keyItem], { [questionId]: safeAnswer });
    const item = graded.items[0];

    const feedback: LockedTrainingQuestionFeedback = {
      isCorrect: Boolean(item?.isCorrect),
      earnedMarks: item?.earnedMarks ?? 0,
      allocatedMarks: item?.allocatedMarks ?? keyItem.allocatedMarks,
      correctMcqChoiceIndex: keyItem.correctMcqChoiceIndex,
      finalAnswerArabic: keyItem.finalAnswerArabic,
      modelSolutionStepsArabic: keyItem.modelSolutionStepsArabic,
    };

    await saveExamAttemptMetaServer({
      ...meta,
      draftAnswers: { ...meta.draftAnswers, [questionId]: safeAnswer },
      lockedQuestionIds: [...meta.lockedQuestionIds, questionId],
      lockedFeedbackByQuestion: {
        ...meta.lockedFeedbackByQuestion,
        [questionId]: feedback,
      },
      updatedAtIso: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      questionId,
      feedback,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "تعذر التحقق من إجابة السؤال حالياً." },
      { status: 500 }
    );
  }
}
