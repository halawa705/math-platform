/**
 * @file geo-label-utils.ts
 * @description توحيد أسماء النقاط (عربي/لاتيني) وتحليل قوائم الأسماء مثل «أ ب جـ» أو «ABC».
 */
export const MODULE_ID_GEO_LABEL_UTILS = "geo_label_utils" as const;

const ARABIC_TO_LATIN: Record<string, string> = {
  أ: "A", ب: "B", ج: "C", د: "D", ه: "E", و: "F", ز: "G", ح: "H",
  خ: "I", ي: "J", ك: "K", ل: "L", م: "M", ن: "N", ف: "P", ق: "Q",
  ر: "R", ش: "S", ط: "T", ت: "U", ث: "V", غ: "W", س: "X", ص: "Y", ع: "Z",
};
const LATIN_TO_ARABIC: Record<string, string> = {
  ...Object.fromEntries(Object.entries(ARABIC_TO_LATIN).map(([ar, la]) => [la, ar])),
  O: "و",
};
const ARABIC_DISPLAY: Record<string, string> = { ج: "جـ", ه: "هـ" };
const POINT_LETTERS = "أبجدهوزحخيكلمنفقرشطتثغسصع";
const STOP_WORDS = new Set(["في", "من", "هو", "هي", "مع", "ثم", "أو", "لا", "ما", "عن", "إذا", "كل", "أي", "به", "له"]);

/** مفتاح داخلي موحّد: حرف لاتيني كبير دائماً إن وُجد له مقابل، وإلا الحرف العربي نفسه. */
export function normalizeLabelKey(raw: string): string {
  const ch = raw.replace(/ـ/g, "").replace(/[إآا]/g, "أ").trim();
  if (/^[a-zA-Z]$/.test(ch)) return ch.toUpperCase();
  return ARABIC_TO_LATIN[ch] ?? ch;
}

export function toDisplayLabel(key: string, notation: "english" | "arabic"): string {
  if (notation === "english") return key;
  const ar = LATIN_TO_ARABIC[key] ?? key;
  return ARABIC_DISPLAY[ar] ?? ar;
}

/** يحلل «أ ب جـ» أو «ABC» أو «أب» إلى مفاتيح. يعيد null إن لم يكن النص قائمة أسماء نقاط صالحة. */
export function parseLabelList(text: string): string[] | null {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const keys: string[] = [];
  for (const tk of tokens) {
    const bare = tk.replace(/ـ/g, "");
    if (/^[A-Z]{1,4}$/.test(bare)) { for (const c of bare) keys.push(c); continue; }
    if (/^[a-z]$/.test(bare)) { keys.push(bare.toUpperCase()); continue; }
    if (STOP_WORDS.has(bare)) return null;
    const chars = [...bare].map((c) => c.replace(/[إآا]/g, "أ"));
    if (chars.length >= 1 && chars.length <= 2 && chars.every((c) => POINT_LETTERS.includes(c))) { for (const c of chars) keys.push(normalizeLabelKey(c)); continue; }
    return null;
  }
  return keys;
}

export const pairKey = (a: string, b: string): string => (a < b ? `${a}${b}` : `${b}${a}`);
