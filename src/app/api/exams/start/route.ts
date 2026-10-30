/**
 * @file route.ts
 * @description نقطة بدء محاولة الاختبار الإلكتروني للطالب (`/api/exams/start`):
 * تسجل وقت البدء الفعلي بالخادم (`exam_attempts`) بدون إعادة ضبطه عند تحديث الصفحة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
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

    const body = (await req.json()) as { examCode?: string };
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

    const submissionCode = `${examCode}__${session.studentCode}`;
    const existingSub = await sbSelect<{
      percentage: number;
      result_json?: unknown;
    }>(
      `exam_submissions?submission_code=eq.${encodeURIComponent(submissionCode)}&select=percentage,result_json`
    );

    if (existingSub && existingSub.length > 0) {
      return NextResponse.json(
        {
          success: false,
          alreadySubmitted: true,
          error: "لقد قمت بتسليم هذا الاختبار مسبقاً.",
          percentage: existingSub[0].percentage,
          result: existingSub[0].result_json,
        },
        { status: 409 }
      );
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

    return NextResponse.json({
      success: true,
      startedAtIso,
      serverNowIso: new Date().toISOString(),
      durationMinutes: exam.duration_minutes || 30,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "تعذر بدء جلسة الاختبار." },
      { status: 500 }
    );
  }
}
