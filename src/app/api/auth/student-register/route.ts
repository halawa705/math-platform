/**
 * @file route.ts
 * @description نقطة تسجيل طالب جديد على الخادم (`/api/auth/student-register`):
 * - تمنع تكرار رقم الهاتف نهائياً إلا لحسابات الإخوة بأسماء مختلفة مع وسمهم بشارة «إخوة» (حد أقصى ٣ إخوة).
 * - تولّد كوداً فريداً من ٦ أرقام بعد فحص عدم تعارضه بدلاً من الكتابة فوق الحسابات السابقة.
 * - تصدر كوكي `HttpOnly` محمياً على الهاتف لمدة ٩٠ يوماً للدخول التلقائي الآمن.
 */

import { NextResponse } from "next/server";
import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  createStudentSessionToken,
  STUDENT_AUTH_COOKIE_MAX_AGE,
  STUDENT_AUTH_COOKIE_NAME,
} from "@/core/auth/student-auth-server-ssot";
import { markStudentsAsSiblingsServer } from "@/core/auth/exam-attempt-state-server-store";
import {
  normalizeArabicFullNameForComparison,
  normalizeStudentPhoneNumber,
} from "@/core/auth/student-phone-and-name-normalizer";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/core/supabase/supabase-config-ssot";

const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_PUBLIC_KEY;
const MAX_SIBLINGS_PER_PHONE = 3;

function sbHeaders(prefer?: string): Record<string, string> {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function generateUniqueSixDigitCode(): Promise<{
  readonly altNumericCode: string;
  readonly studentCode: string;
}> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const num = Math.floor(100000 + Math.random() * 900000);
    const altNumericCode = String(num);
    const studentCode = `MATH-${altNumericCode}`;
    try {
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/students?student_code=eq.${encodeURIComponent(studentCode)}&select=student_code&limit=1`,
        { headers: sbHeaders(), cache: "no-store" }
      );
      if (checkRes.ok) {
        const rows = (await checkRes.json()) as Array<{ student_code: string }>;
        if (!Array.isArray(rows) || rows.length === 0) {
          return { altNumericCode, studentCode };
        }
      } else {
        return { altNumericCode, studentCode };
      }
    } catch {
      return { altNumericCode, studentCode };
    }
  }
  const fallbackNum = String(Date.now()).slice(-6);
  return { altNumericCode: fallbackNum, studentCode: `MATH-${fallbackNum}` };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullNameAr?: string;
      studentPhone?: string;
      passwordPin?: string;
      gradeId?: string;
      isSiblingAccount?: boolean;
    };

    const fullName = (body.fullNameAr || "").trim();
    const rawPhone = (body.studentPhone || "").trim();
    const phone = normalizeStudentPhoneNumber(rawPhone);
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

    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/students?phone=eq.${encodeURIComponent(phone)}&select=student_code,full_name,grade_id`,
      { headers: sbHeaders(), cache: "no-store" }
    );
    const existingByPhone = existingRes.ok
      ? ((await existingRes.json()) as Array<{
          student_code: string;
          full_name: string;
          grade_id: string;
        }>)
      : [];

    const isSibling = existingByPhone.length > 0;
    if (isSibling) {
      if (!body.isSiblingAccount) {
        return NextResponse.json(
          {
            success: false,
            code: "DUPLICATE_PHONE_NEEDS_SIBLING_FLAG",
            existingCount: existingByPhone.length,
            error:
              "رقم الهاتف مسجل لطالب آخر بالفعل. إذا كنتما إخوة على نفس رقم ولي الأمر، فعّل خيار «تسجيل أخ / أخت على نفس الرقم» واكتب اسمك الثلاثي المختلف.",
          },
          { status: 409 }
        );
      }
      if (existingByPhone.length >= MAX_SIBLINGS_PER_PHONE) {
        return NextResponse.json(
          {
            success: false,
            error: `تم الوصول للحد الأقصى لحسابات الإخوة على نفس رقم الهاتف (${MAX_SIBLINGS_PER_PHONE} إخوة).`,
          },
          { status: 409 }
        );
      }
      const normalizedNewName = normalizeArabicFullNameForComparison(fullName);
      const duplicateSamePerson = existingByPhone.some(
        (s) => normalizeArabicFullNameForComparison(s.full_name) === normalizedNewName
      );
      if (duplicateSamePerson) {
        return NextResponse.json(
          {
            success: false,
            error:
              "هذا الاسم مسجل بالفعل على نفس رقم الهاتف. يرجى تسجيل الدخول بحسابك الموجود.",
          },
          { status: 409 }
        );
      }
    }

    const { altNumericCode, studentCode } = await generateUniqueSixDigitCode();
    const gradeObj = EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === gradeId);
    const gradeNameAr = gradeObj?.nameArabic || "الصف الثالث الإعدادي";
    const nowIso = new Date().toISOString();

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
      method: "POST",
      headers: sbHeaders("return=minimal"),
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
    });

    if (!insertRes.ok) {
      return NextResponse.json(
        { success: false, error: "تعذر تسجيل الطالب في السحابة حالياً." },
        { status: 502 }
      );
    }

    if (isSibling) {
      await markStudentsAsSiblingsServer([
        studentCode,
        ...existingByPhone.map((s) => s.student_code),
      ]);
    }

    const createdStudent = {
      id: `student-${Date.now()}`,
      studentCode,
      altNumericCode,
      fullNameAr: fullName,
      studentPhone: phone,
      passwordPin: "",
      gradeId,
      gradeNameAr,
      isSibling,
      createdAtIso: nowIso,
    };

    const token = await createStudentSessionToken(
      createdStudent.studentCode,
      createdStudent.gradeId,
      { fullNameAr: fullName, isSibling }
    );

    const response = NextResponse.json({ success: true, student: createdStudent });
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
