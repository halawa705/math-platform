/**
 * @file route.ts
 * @description نقطة تسليم وتصحيح الاختبار الإلكتروني على الخادم (`/api/exams/submit`):
 * تتحقق من جلسة الطالب ومؤقت الخادم، وتصحح الإجابات عبر مفتاح الخادم السري، وتحفظ النتيجة التفصيلية لتحليلات المعلم.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

import { NextResponse } from "next/server";
import {
  STUDENT_AUTH_COOKIE_NAME,
  verifyStudentSessionToken,
} from "@/core/auth/student-auth-server-ssot";
import {
  readCookieFromRequest,
  sbInsert,
  sbSelect,
} from "@/core/auth/exam-server-supabase-helper";
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
      studentNameAr?: string;
      answers?: Readonly<Record<string, StudentAnswerInput | undefined>>;
    };
    const examCode = (body.examCode || "").trim();
    if (!examCode) {
      return NextResponse.json(
        { success: false, error: "رمز الاختبار مفقود." },
        { status: 400 }
      );
    }

    const exams = await sbSelect<{
      grade_id: string;
      status?: string | null;
      is_published?: boolean | null;
      expires_at?: string | null;
      duration_minutes?: number | null;
      title_ar: string;
    }>(
      `electronic_exams?exam_code=eq.${encodeURIComponent(examCode)}&select=grade_id,status,is_published,expires_at,duration_minutes,title_ar`
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
        { success: false, error: "هذا الاختبار غير متاح أو انتهت صلاحيته." },
        { status: 403 }
      );
    }

    const submissionCode = `${examCode}__${session.studentCode}`;
    const existing = await sbSelect<{
      percentage: number;
      result_json?: unknown;
    }>(
      `exam_submissions?submission_code=eq.${encodeURIComponent(submissionCode)}&select=percentage,result_json`
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "سلّمت هذا الاختبار من قبل",
          percentage: existing[0].percentage,
        },
        { status: 409 }
      );
    }

    const attempts = await sbSelect<{ started_at: string }>(
      `exam_attempts?exam_code=eq.${encodeURIComponent(examCode)}&student_code=eq.${encodeURIComponent(session.studentCode)}&select=started_at`
    );
    const attempt = attempts?.[0];
    if (!attempt) {
      return NextResponse.json(
        { success: false, error: "ابدأ الاختبار أولاً" },
        { status: 400 }
      );
    }

    const nowMs = Date.now();
    const startedMs = Date.parse(attempt.started_at);
    const durationMin = exam.duration_minutes || 30;
    if (nowMs > startedMs + durationMin * 60_000 + 90_000) {
      return NextResponse.json(
        { success: false, error: "انتهى وقت الاختبار" },
        { status: 403 }
      );
    }

    const keyRows = await sbSelect<{
      answer_key: readonly OnlineAnswerKeyItem[];
      reveal_answers?: boolean;
    }>(
      `exam_answer_keys?exam_code=eq.${encodeURIComponent(examCode)}&select=answer_key,reveal_answers`
    );
    const keyRow = keyRows?.[0];
    if (!keyRow || !Array.isArray(keyRow.answer_key)) {
      return NextResponse.json(
        { success: false, error: "مفتاح تصحيح هذا الاختبار غير متوفر على الخادم." },
        { status: 404 }
      );
    }

    const result = gradeOnlineExam(keyRow.answer_key, body.answers ?? {});

    const studentRows = await sbSelect<{ full_name: string }>(
      `students?student_code=eq.${encodeURIComponent(session.studentCode)}&select=full_name&limit=1`
    );
    const studentName =
      studentRows?.[0]?.full_name || body.studentNameAr || session.studentCode;
    const nowIso = new Date(nowMs).toISOString();

    const baseRow = {
      submission_code: submissionCode,
      exam_code: examCode,
      exam_title_ar: exam.title_ar,
      grade_id: session.gradeId,
      student_code: session.studentCode,
      student_name: studentName,
      percentage: result.percentage,
      score: result.totalEarnedMarks,
      total_marks: result.totalAllocatedMarks,
      is_reviewed_by_teacher: false,
      submitted_at: nowIso,
    };

    const insertedFull = await sbInsert(
      "exam_submissions",
      {
        ...baseRow,
        started_at: attempt.started_at,
        answers_json: body.answers ?? {},
        result_json: result,
      },
      "submission_code"
    );
    if (!insertedFull) {
      await sbInsert("exam_submissions", baseRow, "submission_code");
    }

    const review = keyRow.reveal_answers
      ? keyRow.answer_key.map((k) => ({
          questionId: k.questionId,
          correctMcqChoiceIndex: k.correctMcqChoiceIndex,
          finalAnswerArabic: k.finalAnswerArabic,
          modelSolutionStepsArabic: k.modelSolutionStepsArabic,
        }))
      : null;

    return NextResponse.json({
      success: true,
      percentage: result.percentage,
      totalEarnedMarks: result.totalEarnedMarks,
      totalAllocatedMarks: result.totalAllocatedMarks,
      items: result.items,
      review,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء تصحيح وتسليم الاختبار." },
      { status: 500 }
    );
  }
}
