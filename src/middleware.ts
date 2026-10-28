/**
 * @file middleware.ts
 * @description جدار الحماية الأمني للمسارات الإدارية الخاصة بالمعلم المالك الوحيد للمنصة:
 * يفحص كوكي `math_platform_teacher_session` ويتحقق من توقيع HMAC قبل السماح بدخول:
 * (`/dashboard`, `/settings`, `/studio`, `/assessments`, `/library`).
 * في حال غياب الجلسة أو تزويرها، يتم إعادة التوجيه فوراً إلى صفحة الدخول الموحدة.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  TEACHER_AUTH_COOKIE_NAME,
  verifyTeacherSessionToken,
} from "@/core/auth/teacher-auth-server-ssot";

const PROTECTED_TEACHER_PREFIXES = [
  "/dashboard",
  "/settings",
  "/studio",
  "/assessments",
  "/library",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isTeacherRoute = PROTECTED_TEACHER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isTeacherRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TEACHER_AUTH_COOKIE_NAME)?.value;
  const isAuthorized = await verifyTeacherSessionToken(token);

  if (!isAuthorized) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("unauthorized", "teacher-only");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/settings",
    "/settings/:path*",
    "/studio",
    "/studio/:path*",
    "/assessments",
    "/assessments/:path*",
    "/library",
    "/library/:path*",
  ],
};
