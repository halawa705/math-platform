"use client";

/**
 * @file student-auth-submission-helper.tsx
 * @description دوال الاتصال بالخادم (تسجيل دخول/تسجيل طالب جديد مع احتياطي محلي) وبطاقة نجاح التسجيل لبوابة الدخول الموحدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import {
  isStealthTeacherTriggerCodeSSOT,
  loadRegisteredStudentsSSOT,
  registerNewStudentSSOT,
  saveRememberedSessionSSOT,
  type RegisteredStudentRecordSSOT,
} from "@/core/ssot/teacher-identity-ssot";

export const MODULE_ID_STUDENT_AUTH_SUBMISSION_HELPER =
  "student_auth_submission_helper" as const;

export type LoginAttemptOutcome =
  | { readonly kind: "teacher" }
  | { readonly kind: "student"; readonly student: RegisteredStudentRecordSSOT }
  | { readonly kind: "error"; readonly message: string };

export async function attemptStudentOrTeacherLogin(params: {
  readonly codeOrPhone: string;
  readonly passwordPin: string;
  readonly rememberMe: boolean;
}): Promise<LoginAttemptOutcome> {
  const trimmed = params.codeOrPhone.trim();
  const pin = params.passwordPin.trim();
  if (!trimmed) {
    return { kind: "error", message: "يرجى إدخال كود الطالب أو رقم الهاتف المسجل" };
  }

  if (
    trimmed.toLowerCase() === "halawa" ||
    trimmed === "123451" ||
    pin === "123451" ||
    isStealthTeacherTriggerCodeSSOT(trimmed)
  ) {
    try {
      const teacherRes = await fetch("/api/auth/teacher-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmed.toLowerCase() === "halawa" ? trimmed : "halawa",
          password: pin || trimmed,
        }),
      });
      if (teacherRes.ok) {
        if (params.rememberMe) {
          saveRememberedSessionSSOT({
            role: "teacher",
            savedAtIso: new Date().toISOString(),
          });
        }
        return { kind: "teacher" };
      }
    } catch {
      // Continue to student login
    }
  }

  try {
    const studentRes = await fetch("/api/auth/student-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codeOrPhone: trimmed, passwordPin: pin }),
    });
    const data = (await studentRes.json()) as {
      success: boolean;
      student?: RegisteredStudentRecordSSOT;
      error?: string;
    };
    if (studentRes.ok && data.success && data.student) {
      saveRememberedSessionSSOT(
        {
          role: "student",
          studentCode: data.student.studentCode,
          studentNameAr: data.student.fullNameAr,
          gradeId: data.student.gradeId,
          savedAtIso: new Date().toISOString(),
        },
        params.rememberMe
      );
      return { kind: "student", student: data.student };
    }
    if (data.error) return { kind: "error", message: data.error };
  } catch {
    // احتياطي محلي في حال انقطاع الشبكة
  }

  const matched = loadRegisteredStudentsSSOT().find(
    (s) =>
      s.studentCode.toLowerCase() === trimmed.toLowerCase() ||
      s.altNumericCode === trimmed ||
      s.studentPhone === trimmed
  );
  if (!matched) {
    return {
      kind: "error",
      message:
        "لم يتم العثور على هذا الكود أو الرقم. إذا كنت طالباً جديداً اضغط على تبويب «تسجيل طالب جديد».",
    };
  }
  if (matched.passwordPin && matched.passwordPin !== pin) {
    return { kind: "error", message: "الرقم السري غير صحيح" };
  }

  saveRememberedSessionSSOT(
    {
      role: "student",
      studentCode: matched.studentCode,
      studentNameAr: matched.fullNameAr,
      gradeId: matched.gradeId,
      savedAtIso: new Date().toISOString(),
    },
    params.rememberMe
  );
  return { kind: "student", student: matched };
}

export async function attemptNewStudentRegistration(params: {
  readonly fullNameAr: string;
  readonly studentPhone: string;
  readonly passwordPin: string;
  readonly gradeId: string;
  readonly rememberMe: boolean;
}): Promise<
  | { readonly ok: true; readonly student: RegisteredStudentRecordSSOT }
  | { readonly ok: false; readonly message: string }
> {
  if (!params.fullNameAr.trim() || params.fullNameAr.trim().length < 5) {
    return { ok: false, message: "يرجى كتابة اسم الطالب الثلاثي بوضوح" };
  }
  if (!params.studentPhone.trim() || params.studentPhone.trim().length < 10) {
    return { ok: false, message: "يرجى كتابة رقم الهاتف بشكل صحيح" };
  }
  if (!params.passwordPin.trim() || params.passwordPin.trim().length < 4) {
    return { ok: false, message: "يرجى اختيار رقم سري لا يقل عن ٤ أرقام لحماية حسابك" };
  }

  try {
    const regRes = await fetch("/api/auth/student-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullNameAr: params.fullNameAr.trim(),
        studentPhone: params.studentPhone.trim(),
        passwordPin: params.passwordPin.trim(),
        gradeId: params.gradeId,
      }),
    });
    const data = (await regRes.json()) as {
      success: boolean;
      student?: RegisteredStudentRecordSSOT;
      error?: string;
    };
    if (regRes.ok && data.success && data.student) {
      saveRememberedSessionSSOT(
        {
          role: "student",
          studentCode: data.student.studentCode,
          studentNameAr: data.student.fullNameAr,
          gradeId: data.student.gradeId,
          savedAtIso: new Date().toISOString(),
        },
        params.rememberMe
      );
      return { ok: true, student: data.student };
    }
    if (data.error) return { ok: false, message: data.error };
  } catch {
    // احتياطي محلي
  }

  const created = registerNewStudentSSOT({
    fullNameAr: params.fullNameAr,
    studentPhone: params.studentPhone,
    passwordPin: params.passwordPin,
    gradeId: params.gradeId,
  });
  saveRememberedSessionSSOT(
    {
      role: "student",
      studentCode: created.studentCode,
      studentNameAr: created.fullNameAr,
      gradeId: created.gradeId,
      savedAtIso: new Date().toISOString(),
    },
    params.rememberMe
  );
  return { ok: true, student: created };
}
