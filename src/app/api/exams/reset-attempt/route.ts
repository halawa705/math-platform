/**
 * @file route.ts
 * @description نقطة إعادة فتح محاولة اختبار رسمية لطالب محدد للمعلم المالك فقط (`/api/exams/reset-attempt`):
 * تحذف التسليم الرسمي السابق وحالة المحاولة المقفولة حتى يتمكن الطالب (لعذر قهري) من إعادة أداء الاختبار كمحاولة أولى جديدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 65 سطراً).
 */

import { NextResponse } from "next/server";
import {
  TEACHER_AUTH_COOKIE_NAME,
  verifyTeacherSessionToken,
} from "@/core/auth/teacher-auth-server-ssot";
import {
  readCookieFromRequest,
  sbDelete,
} from "@/core/auth/exam-server-supabase-helper";
import { deleteExamAttemptMetaServer } from "@/core/auth/exam-attempt-state-server-store";

export async function POST(req: Request) {
  try {
    const isTeacher = await verifyTeacherSessionToken(
      readCookieFromRequest(req, TEACHER_AUTH_COOKIE_NAME)
    );
    if (!isTeacher) {
      return NextResponse.json(
        { success: false, error: "غير مصرح بإعادة فتح المحاولة إلا للمعلم المالك." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      examCode?: string;
      studentCode?: string;
    };
    const examCode = (body.examCode || "").trim();
    const studentCode = (body.studentCode || "").trim();

    if (!examCode || !studentCode) {
      return NextResponse.json(
        { success: false, error: "رمز الاختبار وكود الطالب مطلوبان." },
        { status: 400 }
      );
    }

    const submissionCode = `${examCode}__${studentCode}`;
    const [subDeleted] = await Promise.all([
      sbDelete(`exam_submissions?submission_code=eq.${encodeURIComponent(submissionCode)}`),
      sbDelete(
        `exam_attempts?exam_code=eq.${encodeURIComponent(examCode)}&student_code=eq.${encodeURIComponent(studentCode)}`
      ),
      deleteExamAttemptMetaServer(examCode, studentCode),
    ]);

    if (!subDeleted) {
      return NextResponse.json(
        {
          success: false,
          error:
            "تعذر حذف التسليم الرسمي من قاعدة البيانات (تحقق من صلاحية الحذف أو SUPABASE_SERVICE_ROLE_KEY).",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      examCode,
      studentCode,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "تعذر إعادة فتح المحاولة حالياً." },
      { status: 500 }
    );
  }
}
