/**
 * @file route.ts
 * @description التحقق من جلسة الطالب التلقائية عبر الكوكي المحمي `HttpOnly` على الهاتف (`/api/auth/student-session-check`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 85 سطراً).
 */

import { NextResponse } from "next/server";
import {
  STUDENT_AUTH_COOKIE_NAME,
  verifyStudentSessionToken,
} from "@/core/auth/student-auth-server-ssot";
import { readCookieFromRequest, sbSelect } from "@/core/auth/exam-server-supabase-helper";
import { isStudentCodeSiblingServer } from "@/core/auth/exam-attempt-state-server-store";
import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";

export async function GET(req: Request) {
  const token = readCookieFromRequest(req, STUDENT_AUTH_COOKIE_NAME);
  const claims = await verifyStudentSessionToken(token);
  if (!claims) {
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }

  const rows = await sbSelect<{
    id: string;
    student_code: string;
    alt_numeric_code?: string | null;
    full_name: string;
    grade_id: string;
    grade_name_ar?: string | null;
    created_at?: string;
  }>(
    `students?student_code=eq.${encodeURIComponent(claims.studentCode)}&select=id,student_code,alt_numeric_code,full_name,grade_id,grade_name_ar,created_at&limit=1`
  );

  const row = rows?.[0];
  const isSibling = claims.isSibling || (await isStudentCodeSiblingServer(claims.studentCode));
  const gradeObj = EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === (row?.grade_id || claims.gradeId));

  return NextResponse.json({
    isAuthenticated: true,
    student: {
      id: row?.id || `student-${claims.studentCode}`,
      studentCode: row?.student_code || claims.studentCode,
      altNumericCode:
        row?.alt_numeric_code || claims.studentCode.replace(/^MATH-/i, ""),
      fullNameAr: row?.full_name || claims.fullNameAr || claims.studentCode,
      studentPhone: "",
      passwordPin: "",
      gradeId: row?.grade_id || claims.gradeId,
      gradeNameAr: row?.grade_name_ar || gradeObj?.nameArabic || "",
      isSibling,
      createdAtIso: row?.created_at || new Date().toISOString(),
    },
  });
}
