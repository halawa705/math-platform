/**
 * @file arabic-measurement-units-ssot.ts
 * @description مصدر الحقيقة الوحيد لوحدات القياس العربية (قائمة واحدة بدل 4 قوائم متفرقة):
 * الوحدة تأتي دائماً بعد العدد، وهذا الملف يعرّف قائمتها وأنماط التعرف عليها وتحويل الوحدات الإنجليزية.
 */

export const MODULE_ID_ARABIC_MEASUREMENT_UNITS_SSOT =
  "arabic_measurement_units_ssot" as const;

/** مرتبة من الأطول للأقصر كي تتطابق `سم²` قبل `سم` و`م/ث²` قبل `م`. */
export const ARABIC_UNIT_WORDS_LONGEST_FIRST: readonly string[] = [
  "كم/س", "م/ث²", "م/ث", "سم²", "سم³", "كم²", "كم³", "مم²", "م²", "م³",
  "سم", "مم", "كم", "كجم", "جم", "طن", "مللتر", "لتر", "متر",
  "درجة", "دقيقة", "ثانية", "ساعة", "نيوتن", "داين", "جول", "وات", "جنيه", "قرش", "م",
];

/** وحدات الطول والوزن والحجم فقط، تُقلب إذا سبقت العدد (`سم 8` ← `8 سم`). وتستثنى الكلمات الملتبسة (درجة، م). */
export const ARABIC_UNIT_WORDS_SAFE_TO_SWAP: readonly string[] = [
  "سم²", "سم³", "م²", "م³", "سم", "مم", "كم", "متر", "لتر", "كجم", "جم",
];

export const ARABIC_UNIT_ALTERNATION_SRC = ARABIC_UNIT_WORDS_LONGEST_FIRST.join("|");
export const ARABIC_SWAPPABLE_UNIT_ALTERNATION_SRC =
  ARABIC_UNIT_WORDS_SAFE_TO_SWAP.join("|");

/** يمنع التقاط الوحدة كبداية كلمة عربية أطول (مثل `سمك`). */
export const NOT_FOLLOWED_BY_ARABIC_LETTER_SRC = "(?![\\u0600-\\u06FF])";
export const NOT_PRECEDED_BY_ARABIC_LETTER_SRC = "(?<![\\u0600-\\u06FF])";

const UNIT_SET: ReadonlySet<string> = new Set(ARABIC_UNIT_WORDS_LONGEST_FIRST);

export function isArabicMeasurementUnit(phrase: string): boolean {
  return UNIT_SET.has(phrase.trim().replace(/^\\+/, ""));
}

/** مفتاح الوحدة الإنجليزية بعد حذف المسافات و`^` و`{}` ← الوحدة العربية. */
export const ENGLISH_UNIT_KEY_TO_ARABIC: Readonly<Record<string, string>> = {
  cm2: "سم²", "cm²": "سم²", cm3: "سم³", "cm³": "سم³", cm: "سم", mm: "مم", km: "كم",
  kg: "كجم", "m/s2": "م/ث²", "m/s²": "م/ث²", "m/s": "م/ث",
};

export const SUPERSCRIPT_DIGIT_TO_UNICODE: Readonly<Record<string, string>> = {
  "2": "²", "3": "³",
};
