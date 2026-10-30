/**
 * @file route.ts
 * @description نقطة تسجيل طالب جديد على مستوى الخادم (Server-Side Student Registration):
 * تستقبل بيانات الطالب، وتحسب كوده الفريد، وتخزنه في جدول `public.students` في Supabase.
 */

import { NextResponse } from "next/server";
import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  createStudentSessionToken,
  STUDENT_AUTH_COOKIE_MAX_AGE,
  STUDENT_AUTH_COOKIE_NAME,
} from "@/core/auth/student-auth-server-ssot";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ribcyosvoiwtrpynyzjp.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_-_NDzAmrswsChgitYYrIKw_iEmWYIqD";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullNameAr?: string;
      studentPhone?: string;
      passwordPin?: string;
      gradeId?: string;
    };

    const fullName = (body.fullNameAr || "").trim();
    const phone = (body.studentPhone || "").trim();
    const pin = (body.passwordPin || "").trim();
    const gradeId = (body.gradeId || "prep-3").trim();

    if (!fullName || fullName.length < 5) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة اسم الطالب الثلاثي بوضوح." },
        { status: 400 }
      );
    }
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة رقم الهاتف بشكل صحيح." },
        { status: 400 }
      );
    }
    if (!pin || pin.length < 4) {
      return NextResponse.json(
        { success: false, error: "يرجى اختيار رقم سري لا يقل عن ٤ أرقام." },
        { status: 400 }
      );
    }

    // توليد كود تسلسلي عشوائي متين لا يتعارض
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const altNumericCode = `${randomSuffix}`;
    const studentCode = `MATH-${altNumericCode}`;
    const gradeObj = EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === gradeId);
    const gradeNameAr = gradeObj?.nameArabic || "الصف الثالث الإعدادي";
    const nowIso = new Date().toISOString();

    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/students?on_conflict=student_code`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          student_code: studentCode,
          alt_numeric_code: altNumericCode,
          full_name: fullName,
          grade_id: gradeId,
          grade_name_ar: gradeNameAr,
          phone,
          pin_code: pin,
          is_active: true,
          created_at: nowIso,
        }),
      }
    );

    if (!insertRes.ok) {
      return NextResponse.json(
        { success: false, error: "تعذر تسجيل الطالب في السحابة حالياً." },
        { status: 502 }
      );
    }

    const createdStudent = {
      id: `student-${Date.now()}`,
      studentCode,
      altNumericCode,
      fullNameAr: fullName,
      studentPhone: phone,
      passwordPin: "", // تعمية تامة
      gradeId,
      gradeNameAr,
      createdAtIso: nowIso,
    };

    const token = await createStudentSessionToken(
      createdStudent.studentCode,
      createdStudent.gradeId
    );

    const response = NextResponse.json({
      success: true,
      student: createdStudent,
    });

    response.cookies.set({
      name: STUDENT_AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: STUDENT_AUTH_COOKIE_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع أثناء تسجيل الطالب." },
      { status: 500 }
    );
  }
}
