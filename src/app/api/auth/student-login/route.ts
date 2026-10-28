/**
 * @file route.ts
 * @description نقطة مصادقة دخول الطالب على مستوى الخادم (Server-Side Student Login):
 * تفحص كود الطالب أو رقم هاتفه والرقم السري مباشرة في Supabase على الخادم،
 * وترجع بيانات هذا الطالب الفردي فقط دون تسريب أي بيانات أو أرقام سرية لباقي الطلاب.
 */

import { NextResponse } from "next/server";

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
      codeOrPhone?: string;
      passwordPin?: string;
    };

    const trimmed = (body.codeOrPhone || "").trim();
    const pin = (body.passwordPin || "").trim();

    if (!trimmed) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال كود الطالب أو رقم الهاتف المسجل." },
        { status: 400 }
      );
    }

    // استعلام محدد بالخادم للطالب المعني فقط
    const query = new URLSearchParams({
      select:
        "id,student_code,alt_numeric_code,full_name,grade_id,grade_name_ar,phone,pin_code,created_at",
      or: `(student_code.ilike.${trimmed},alt_numeric_code.eq.${trimmed},phone.eq.${trimmed})`,
      limit: "1",
    });

    const res = await fetch(`${SUPABASE_URL}/rest/v1/students?${query.toString()}`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "تعذر الاتصال بقاعدة بيانات الطلاب حالياً." },
        { status: 502 }
      );
    }

    const rows = (await res.json()) as Array<{
      id: string;
      student_code: string;
      alt_numeric_code?: string | null;
      full_name: string;
      grade_id: string;
      grade_name_ar?: string | null;
      phone?: string | null;
      pin_code?: string | null;
      created_at: string;
    }>;

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

    const studentRow = rows[0];

    // مطابقة الرقم السري إن وجد
    if (studentRow.pin_code && pin && studentRow.pin_code !== pin) {
      return NextResponse.json(
        { success: false, error: "الرقم السري غير صحيح." },
        { status: 401 }
      );
    }

    // إرجاع كائن الطالب الآمن بدون كلمة المرور
    const safeStudent = {
      id: studentRow.id || `student-${studentRow.student_code}`,
      studentCode: studentRow.student_code,
      altNumericCode:
        studentRow.alt_numeric_code ||
        studentRow.student_code.replace(/^MATH-/i, ""),
      fullNameAr: studentRow.full_name,
      studentPhone: studentRow.phone || "",
      passwordPin: "", // تعمية تامة للرقم السري لمنع ظهوره
      gradeId: studentRow.grade_id,
      gradeNameAr: studentRow.grade_name_ar || "",
      createdAtIso: studentRow.created_at || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      student: safeStudent,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع أثناء تسجيل دخول الطالب." },
      { status: 500 }
    );
  }
}
