/**
 * @file route.ts
 * @description نقطة أرشفة وإغلاق الاختبار الإلكتروني على الخادم للمعلم المالك فقط (`/api/exams/archive`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 60 سطراً).
 */

import { NextResponse } from "next/server";
import {
  TEACHER_AUTH_COOKIE_NAME,
  verifyTeacherSessionToken,
} from "@/core/auth/teacher-auth-server-ssot";
import {
  readCookieFromRequest,
  sbPatch,
} from "@/core/auth/exam-server-supabase-helper";

export async function POST(req: Request) {
  try {
    const teacherToken = readCookieFromRequest(req, TEACHER_AUTH_COOKIE_NAME);
    const isTeacher = await verifyTeacherSessionToken(teacherToken);
    if (!isTeacher) {
      return NextResponse.json(
        { success: false, error: "غير مصرح إلا للمعلم المالك." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as { examCode?: string };
    const examCode = (body.examCode || "").trim();
    if (!examCode) {
      return NextResponse.json(
        { success: false, error: "معرف الاختبار مفقود." },
        { status: 400 }
      );
    }

    await sbPatch(`electronic_exams?exam_code=eq.${encodeURIComponent(examCode)}`, {
      status: "archived",
      is_published: false,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "تعذر أرشفة الاختبار." },
      { status: 500 }
    );
  }
}
