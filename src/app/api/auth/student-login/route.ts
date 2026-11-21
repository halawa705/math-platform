/**
 * @file route.ts
 * @description نقطة مصادقة دخول الطالب على مستوى الخادم (`/api/auth/student-login`):
 * تفحص كود الطالب أو رقم هاتفه (بما في ذلك الإخوة المشتركون في رقم ولي الأمر) وتصدر كوكي `HttpOnly` لمدة ٩٠ يوماً.
 */

import { NextResponse } from "next/server";
import {
  createStudentSessionToken,
  STUDENT_AUTH_COOKIE_MAX_AGE,
  STUDENT_AUTH_COOKIE_NAME,
} from "@/core/auth/student-auth-server-ssot";
import { isStudentCodeSiblingServer } from "@/core/auth/exam-attempt-state-server-store";
import { normalizeStudentPhoneNumber } from "@/core/auth/student-phone-and-name-normalizer";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/core/supabase/supabase-config-ssot";

const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_PUBLIC_KEY;

interface StudentLoginDbRow {
  id: string;
  student_code: string;
  alt_numeric_code?: string | null;
  full_name: string;
  grade_id: string;
  grade_name_ar?: string | null;
  phone?: string | null;
  pin_code?: string | null;
  created_at: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      codeOrPhone?: string;
      passwordPin?: string;
    };

    const trimmed = (body.codeOrPhone || "").trim();
    const normalizedPhone = normalizeStudentPhoneNumber(trimmed);
    const pin = (body.passwordPin || "").trim();

    if (!trimmed) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال كود الطالب أو رقم الهاتف المسجل." },
        { status: 400 }
      );
    }

    const orFilters = [
      `student_code.ilike.${trimmed}`,
      `alt_numeric_code.eq.${trimmed}`,
      `phone.eq.${trimmed}`,
      ...(normalizedPhone && normalizedPhone !== trimmed ? [`phone.eq.${normalizedPhone}`] : []),
    ];

    const query = new URLSearchParams({
      select:
        "id,student_code,alt_numeric_code,full_name,grade_id,grade_name_ar,phone,pin_code,created_at",
      or: `(${orFilters.join(",")})`,
      limit: "5",
    });

    const res = await fetch(`${SUPABASE_URL}/rest/v1/students?${query.toString()}`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "تعذر الاتصال بقاعدة بيانات الطلاب حالياً." },
        { status: 502 }
      );
    }

    const rows = (await res.json()) as StudentLoginDbRow[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "لم يتم العثور على هذا الكود أو الرقم. إذا كنت طالباً جديداً اضغط على تبويب «تسجيل طالب جديد».",
        },
        { status: 404 }
      );
    }

    let studentRow: StudentLoginDbRow = rows[0];
    if (rows.length > 1) {
      if (!pin) {
        return NextResponse.json(
          {
            success: false,
            error:
              "يوجد أكثر من حساب للإخوة على هذا الرقم. يرجى إدخال الرقم السري الخاص بك أو الدخول بكود الطالب الشخصي (MATH-...).",
          },
          { status: 409 }
        );
      }
      const pinMatches = rows.filter((r) => r.pin_code === pin);
      if (pinMatches.length === 0) {
        return NextResponse.json(
          { success: false, error: "الرقم السري غير صحيح لأي من حسابات هذا الرقم." },
          { status: 401 }
        );
      }
      if (pinMatches.length > 1) {
        return NextResponse.json(
          {
            success: false,
            error:
              "يوجد أكثر من أخ بنفس الرقم السري على هذا الهاتف. يرجى الدخول باستخدام كود الطالب الشخصي (MATH-...).",
          },
          { status: 409 }
        );
      }
      studentRow = pinMatches[0];
    } else if (studentRow.pin_code && studentRow.pin_code !== pin) {
      return NextResponse.json(
        { success: false, error: "الرقم السري غير صحيح." },
        { status: 401 }
      );
    }

    const isSibling = await isStudentCodeSiblingServer(studentRow.student_code);
    const safeStudent = {
      id: studentRow.id || `student-${studentRow.student_code}`,
      studentCode: studentRow.student_code,
      altNumericCode:
        studentRow.alt_numeric_code ||
        studentRow.student_code.replace(/^MATH-/i, ""),
      fullNameAr: studentRow.full_name,
      studentPhone: studentRow.phone || "",
      passwordPin: "",
      gradeId: studentRow.grade_id,
      gradeNameAr: studentRow.grade_name_ar || "",
      isSibling,
      createdAtIso: studentRow.created_at || new Date().toISOString(),
    };

    const token = await createStudentSessionToken(
      safeStudent.studentCode,
      safeStudent.gradeId,
      { fullNameAr: safeStudent.fullNameAr, isSibling }
    );

    const response = NextResponse.json({ success: true, student: safeStudent });
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
      { success: false, error: "حدث خطأ غير متوقع أثناء تسجيل دخول الطالب." },
      { status: 500 }
    );
  }
}
