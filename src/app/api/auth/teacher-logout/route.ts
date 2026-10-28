/**
 * @file route.ts
 * @description نقطة تسجيل خروج المعلم المالك (Server-Side Teacher Logout):
 * تحذف كوكي الجلسة المشفر `math_platform_teacher_session` نهائياً من المتصفح.
 */

import { NextResponse } from "next/server";
import { TEACHER_AUTH_COOKIE_NAME } from "@/core/auth/teacher-auth-server-ssot";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "تم تسجيل الخروج بنجاح.",
  });

  response.cookies.set({
    name: TEACHER_AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
