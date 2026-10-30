/**
 * @file teacher-auth-server-ssot.ts
 * @description المصدر الوحيد لحقيقة مصادقة المعلم المالك الوحيد على مستوى الخادم (Server-Side SSOT):
 * - بيانات اعتماد المعلم الوحيد: المستخدم `halawa` وكلمة المرور `123451` (قابلة للضبط عبر متغيرات البيئة).
 * - توقيع وفحص جلسة المعلم عبر Web Crypto API المتوافق مع Edge Runtime و Node.js (بدون مكتبات خارجية).
 * - الكوكي الآمن `math_platform_teacher_session` المشفر بـ HttpOnly لمنع وصول أي طالب أو سكربت إليه.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import {
  base64UrlEncode,
  base64UrlDecode,
  getHmacCryptoKey,
} from "./hmac-token-crypto-primitives";

export { base64UrlEncode, base64UrlDecode, getHmacCryptoKey };

export const TEACHER_ADMIN_DEFAULT_USER = "halawa" as const;
export const TEACHER_ADMIN_DEFAULT_PASS = "123451" as const;
export const TEACHER_AUTH_COOKIE_NAME = "math_platform_teacher_session" as const;
export const TEACHER_AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 يوماً بالثواني

const DEFAULT_JWT_SECRET = "math_teacher_secure_hmac_secret_key_2026_halawa_unbreakable";

function getSecretKey(): string {
  return (
    process.env.TEACHER_SESSION_SECRET ||
    process.env.NEXT_SERVER_JWT_SECRET ||
    DEFAULT_JWT_SECRET
  );
}

export function getTeacherMasterCredentials(): {
  readonly username: string;
  readonly password: string;
} {
  return {
    username: (
      process.env.TEACHER_ADMIN_USERNAME || TEACHER_ADMIN_DEFAULT_USER
    ).trim(),
    password: (
      process.env.TEACHER_ADMIN_PASSWORD || TEACHER_ADMIN_DEFAULT_PASS
    ).trim(),
  };
}

/**
 * فحص بيانات دخول المعلم المالك الحصري:
 * يدعم إدخال (اسم المستخدم halawa + كلمة المرور 123451)
 * أو إدخال الرمز السري 123451 مباشرة في خانة البوابة الخفية.
 */
export function verifyTeacherCredentials(
  inputUsername?: string | null,
  inputPassword?: string | null
): boolean {
  const master = getTeacherMasterCredentials();
  const pass = (inputPassword || "").trim();
  if (!pass) return false;

  // كلمة المرور يجب أن تطابق بدقة
  if (pass !== master.password) {
    return false;
  }

  // إذا تم إرسال اسم المستخدم، يجب أن يطابق "halawa" (غير حساس لحالة الأحرف)
  const user = (inputUsername || "").trim();
  if (user && user.toLowerCase() !== master.username.toLowerCase()) {
    return false;
  }

  return true;
}

/**
 * إنشاء توكن جلسة موقّع ومحمي بـ HMAC-SHA256 للمعلم المالك.
 */
export async function createTeacherSessionToken(
  teacherId: string = "teacher_halawa"
): Promise<string> {
  const payload = {
    sub: teacherId,
    role: "teacher",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TEACHER_AUTH_COOKIE_MAX_AGE,
  };

  const enc = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(enc.encode(payloadStr));

  const key = await getHmacCryptoKey(getSecretKey());
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadB64)
  );
  const sigB64 = base64UrlEncode(signatureBuffer);

  return `${payloadB64}.${sigB64}`;
}

/**
 * التحقق الحتمي من صحة توكن جلسة المعلم والتأكد من عدم انتهاء صلاحيته.
 */
export async function verifyTeacherSessionToken(
  token?: string | null
): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return false;

  try {
    const key = await getHmacCryptoKey(getSecretKey());
    const enc = new TextEncoder();
    const sigBytes = base64UrlDecode(sigB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as Uint8Array<ArrayBuffer>,
      enc.encode(payloadB64)
    );
    if (!isValid) return false;

    const payloadBytes = base64UrlDecode(payloadB64);
    const dec = new TextDecoder();
    const payloadJson = JSON.parse(dec.decode(payloadBytes)) as {
      sub?: string;
      role?: string;
      exp?: number;
    };

    if (payloadJson.role !== "teacher") return false;
    if (payloadJson.exp && payloadJson.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
