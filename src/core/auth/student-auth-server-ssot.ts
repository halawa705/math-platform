/**
 * @file student-auth-server-ssot.ts
 * @description المصدر الوحيد لحقيقة مصادقة جلسة الطالب على مستوى الخادم (Server-Side Student Session SSOT):
 * - توقيع وفحص جلسة الطالب عبر HMAC-SHA256 المتوافق مع Edge Runtime و Node.js.
 * - الكوكي الآمن `math_platform_student_session` المشفر بـ HttpOnly لمنع انتحال هوية الطالب عند تسليم الاختبارات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import {
  base64UrlEncode,
  base64UrlDecode,
  getHmacCryptoKey,
} from "./hmac-token-crypto-primitives";

export const MODULE_ID_STUDENT_AUTH_SERVER_SSOT =
  "student_auth_server_ssot" as const;

export const STUDENT_AUTH_COOKIE_NAME = "math_platform_student_session" as const;
export const STUDENT_AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 يوماً بالثواني

const DEFAULT_STUDENT_JWT_SECRET =
  "math_student_secure_hmac_secret_key_2026_halawa_unbreakable";

function getStudentSecretKey(): string {
  return (
    process.env.STUDENT_SESSION_SECRET ||
    process.env.TEACHER_SESSION_SECRET ||
    process.env.NEXT_SERVER_JWT_SECRET ||
    DEFAULT_STUDENT_JWT_SECRET
  );
}

/**
 * إنشاء توكن جلسة موقّع ومحمي بـ HMAC-SHA256 للطالب.
 */
export async function createStudentSessionToken(
  studentCode: string,
  gradeId: string
): Promise<string> {
  const payload = {
    sub: studentCode,
    gradeId,
    role: "student",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + STUDENT_AUTH_COOKIE_MAX_AGE,
  };

  const enc = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(enc.encode(payloadStr));

  const key = await getHmacCryptoKey(getStudentSecretKey());
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadB64)
  );
  const sigB64 = base64UrlEncode(signatureBuffer);

  return `${payloadB64}.${sigB64}`;
}

/**
 * التحقق الحتمي من صحة توكن جلسة الطالب والتأكد من عدم انتهاء صلاحيته أو التلاعب به.
 */
export async function verifyStudentSessionToken(
  token?: string | null
): Promise<{ studentCode: string; gradeId: string } | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getHmacCryptoKey(getStudentSecretKey());
    const enc = new TextEncoder();
    const sigBytes = base64UrlDecode(sigB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as Uint8Array<ArrayBuffer>,
      enc.encode(payloadB64)
    );
    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const dec = new TextDecoder();
    const payloadJson = JSON.parse(dec.decode(payloadBytes)) as {
      sub?: string;
      gradeId?: string;
      role?: string;
      exp?: number;
    };

    if (payloadJson.role !== "student") return null;
    if (!payloadJson.sub || !payloadJson.gradeId) return null;
    if (payloadJson.exp && payloadJson.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      studentCode: payloadJson.sub,
      gradeId: payloadJson.gradeId,
    };
  } catch {
    return null;
  }
}
