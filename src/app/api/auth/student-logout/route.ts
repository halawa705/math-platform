/**
 * @file route.ts
 * @description تسجيل خروج الطالب بمسح الكوكي المحمي على الهاتف (`/api/auth/student-logout`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 30 سطراً).
 */

import { NextResponse } from "next/server";
import { STUDENT_AUTH_COOKIE_NAME } from "@/core/auth/student-auth-server-ssot";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: STUDENT_AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
