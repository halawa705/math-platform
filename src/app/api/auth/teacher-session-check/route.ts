/**
 * @file route.ts
 * @description نقطة فحص صلاحية جلسة المعلم المالك الحالية من الخادم:
 * تفحص صلاحية كوكي `math_platform_teacher_session` للتأكد من هوية المعلم الحقيقية.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  TEACHER_AUTH_COOKIE_NAME,
  verifyTeacherSessionToken,
} from "@/core/auth/teacher-auth-server-ssot";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEACHER_AUTH_COOKIE_NAME)?.value;

  const isValid = await verifyTeacherSessionToken(token);
  return NextResponse.json({
    isAuthenticated: isValid,
    role: isValid ? "teacher" : "anonymous",
  });
}
