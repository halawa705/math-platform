/**
 * @file student-phone-and-name-normalizer.ts
 * @description تطبيع رقم الهاتف والاسم الثلاثي العربي لمنع التحايل عند فحص تكرار أرقام الهواتف وتسجيل الإخوة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 60 سطراً).
 */

export const MODULE_ID_STUDENT_PHONE_AND_NAME_NORMALIZER =
  "student_phone_and_name_normalizer" as const;

const EASTERN_TO_WESTERN_MAP: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

export function normalizeStudentPhoneNumber(rawPhone: string): string {
  const western = rawPhone
    .trim()
    .replace(/[٠-٩]/g, (d) => EASTERN_TO_WESTERN_MAP[d] ?? d)
    .replace(/[\s\-().+]/g, "");
  if (western.startsWith("201") && western.length === 12) {
    return `0${western.slice(2)}`;
  }
  return western;
}

export function normalizeArabicFullNameForComparison(rawName: string): string {
  return rawName
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");
}
