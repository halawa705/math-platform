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

    const body = (await req.json()) as {
      examCode?: string;
      action?: "archive" | "reactivate" | "update_settings";
      titleAr?: string;
      durationMinutes?: number;
      availabilityDays?: number;
      expiresAtIso?: string;
      status?: "active" | "archived";
    };
    const examCode = (body.examCode || "").trim();
    if (!examCode) {
      return NextResponse.json(
        { success: false, error: "معرف الاختبار مفقود." },
        { status: 400 }
      );
    }

    if (body.action === "reactivate" || body.action === "update_settings") {
      const safeDays = Math.max(1, Math.min(365, Number(body.availabilityDays) || 7));
      const nextStatus = body.action === "reactivate" ? "active" : (body.status || "active");
      const expiresAt =
        body.expiresAtIso ||
        new Date(Date.now() + safeDays * 86_400_000).toISOString();
      const patchObj: Record<string, unknown> = {
        status: nextStatus,
        is_published: nextStatus === "active",
        availability_days: safeDays,
        expires_at: expiresAt,
      };
      if (body.titleAr?.trim()) patchObj.title_ar = body.titleAr.trim();
      if (body.durationMinutes && Number(body.durationMinutes) >= 5) {
        patchObj.duration_minutes = Math.min(180, Math.round(Number(body.durationMinutes)));
      }
      await sbPatch(`electronic_exams?exam_code=eq.${encodeURIComponent(examCode)}`, patchObj);
      return NextResponse.json({ success: true, status: nextStatus, expiresAtIso: expiresAt });
    }

    await sbPatch(`electronic_exams?exam_code=eq.${encodeURIComponent(examCode)}`, {
      status: "archived",
      is_published: false,
    });

    return NextResponse.json({ success: true, status: "archived" });
  } catch {
    return NextResponse.json(
      { success: false, error: "تعذر أرشفة الاختبار." },
      { status: 500 }
    );
  }
}
