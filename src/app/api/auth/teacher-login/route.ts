/**
 * @file route.ts
 * @description نقطة مصادقة المعلم المالك الوحيد على الخادم (Server-Side Teacher Login Endpoint):
 * تتحقق من صحة بيانات الدخول (halawa / 123451)، وتصدر كوكي `math_platform_teacher_session` محمي ومشفر بـ HttpOnly.
 */

import { NextResponse } from "next/server";
import {
  verifyTeacherCredentials,
  createTeacherSessionToken,
  TEACHER_AUTH_COOKIE_NAME,
  TEACHER_AUTH_COOKIE_MAX_AGE,
} from "@/core/auth/teacher-auth-server-ssot";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      passkey?: string;
    };

    const inputUser = body.username?.trim() || "";
    const inputPass = (body.password || body.passkey || "").trim();

    const isAuthorized = verifyTeacherCredentials(inputUser, inputPass);
    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: "بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور.",
        },
        { status: 401 }
      );
    }

    const token = await createTeacherSessionToken("teacher_halawa");

    const response = NextResponse.json({
      success: true,
      role: "teacher",
      teacherFullName: "أ/ إسلام حلاوة",
      message: "تم التحقق بنجاح وتوثيق جلسة المعلم المالك.",
    });

    response.cookies.set({
      name: TEACHER_AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TEACHER_AUTH_COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ غير متوقع أثناء المصادقة.",
      },
      { status: 500 }
    );
  }
}
