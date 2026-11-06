/**
 * @file numeral-and-unit-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) لتحويل الأرقام (0-9 <-> ٠-٩)، والرموز الرياضية (x,y <-> س,ص)،
 * ووحدات القياس العربية القياسية. يُمنع كتابة أي Regex لتحويل الأرقام في أي ملف آخر.
 */

export type NumeralDisplayMode = "western" | "eastern";
export type MathNotationLanguage = "arabic" | "english";

export type ArabicMathUnit =
  | "سم"
  | "م"
  | "كم"
  | "مم"
  | "ديسم"
  | "وحدة"
  | "وحدة طول"
  | "سم²"
  | "م²"
  | "كم²"
  | "مم²"
  | "ديسم²"
  | "وحدة مربعة"
  | "سم³"
  | "م³"
  | "لتر"
  | "مللتر"
  | "وحدة مكعبة"
  | "درجة"
  | "دقيقة قوسية"
  | "ثانية قوسية"
  | "راديان"
  | "ثانية"
  | "دقيقة"
  | "ساعة"
  | "جم"
  | "كجم"
  | "طن"
  | "جنيه"
  | "قرش"
  | "نيوتن"
  | "ثقل كجم"
  | "ثقل جم"
  | "داين"
  | "جول"
  | "وات"
  | "م/ث"
  | "كم/س"
  | "م/ث²";

const EASTERN_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

/**
 * يحول أي نص أو رقم إلى الأرقام العربية الغربية القياسية (0-9) للحسابات الداخلية.
 */
export function toWesternNumeralsSSOT(input: string | number): string {
  return String(input).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

/**
 * يحول الأرقام الغربية (0-9) إلى الأرقام الهندية المشرقية (٠-٩) للعرض والطباعة.
 */
export function toEasternNumeralsSSOT(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => EASTERN_DIGITS[Number(d)]);
}

/**
 * ينسق الأرقام وفق النظام المختار (غربي 0-9 أو مشرقي ٠-٩) مع حماية أوامر LaTeX.
 */
export function formatNumeralsByModeSSOT(
  input: string | number,
  mode: NumeralDisplayMode
): string {
  const normalized = toWesternNumeralsSSOT(input);
  if (mode === "western") return normalized;
  return toEasternNumeralsSSOT(normalized);
}

/**
 * يحول الرموز والدوال والمجموعات داخل التعبير الرياضي بين الترميز العربي (س، ص، ح، جا، جتا، ظا)
 * والترميز الإنجليزي (x, y, \mathbb{R}, \sin, \cos, \tan) وفق إعداد المستند.
 */
export function localizeMathExpressionNotationSSOT(
  latex: string,
  notation: MathNotationLanguage
): string {
  if (!latex) return "";
  let out = latex
    .replace(/\\setminus|\\smallsetminus/g, " - ")
    .replace(/\\varnothing|\\emptyset/g, "\\phi");

  if (notation === "arabic") {
    out = out
      .replace(/\\mathbb\{R\}\_\{\+\}/g, "ح_{+}")
      .replace(/\\mathbb\{R\}\_\{\-\}/g, "ح_{-}")
      .replace(/\\mathbb\{R\}\^\{\*\}/g, "ح^{*}")
      .replace(/\\mathbb\{R\}/g, "ح")
      .replace(/\\mathbb\{Z\}/g, "ص")
      .replace(/\\mathbb\{N\}/g, "ط")
      .replace(/\\mathbb\{Q\}/g, "ن")
      .replace(/\\csc\b/g, "\\text{قتا}")
      .replace(/\\sec\b/g, "\\text{قا}")
      .replace(/\\cot\b/g, "\\text{ظتا}")
      .replace(/\\tan\b/g, "\\text{ظا}")
      .replace(/\\cos\b/g, "\\text{جتا}")
      .replace(/\\sin\b/g, "\\text{جا}")
      .replace(/\bsign\s*\(/gi, "\\text{إشارة}(");
  } else {
    out = out
      .replace(/\\text\{قتا\}|\bقتا\b/g, "\\csc ")
      .replace(/\\text\{قا\}|\bقا\b/g, "\\sec ")
      .replace(/\\text\{ظتا\}|\bظتا\b/g, "\\cot ")
      .replace(/\\text\{ظا\}|\bظا\b/g, "\\tan ")
      .replace(/\\text\{جتا\}|\bجتا\b/g, "\\cos ")
      .replace(/\\text\{جا\}|\bجا\b/g, "\\sin ");
  }
  return out;
}

const ARABIC_TO_ENGLISH_VERTEX_MAP: Record<string, string> = {
  "أ": "A",
  "ا": "A",
  "إ": "A",
  "ب": "B",
  "جـ": "C",
  "ج": "C",
  "د": "D",
  "هـ": "E",
  "ه": "E",
  "و": "F",
  "ز": "G",
  "ح": "H",
  "خ": "I",
  "ي": "J",
  "ك": "K",
  "ل": "L",
  "م": "M",
  "ن": "N",
  "ف": "P",
  "ق": "Q",
  "ر": "R",
  "ش": "S",
  "ط": "T",
  "ت": "U",
  "ث": "V",
  "غ": "W",
  "س": "X",
  "ص": "Y",
  "ع": "Z",
};

const ENGLISH_TO_ARABIC_VERTEX_MAP: Record<string, string> = {
  A: "أ",
  B: "ب",
  C: "جـ",
  D: "د",
  E: "هـ",
  F: "و",
  G: "ز",
  H: "ح",
  I: "خ",
  J: "ي",
  K: "ك",
  L: "ل",
  M: "م",
  N: "ن",
  O: "و",
  P: "ف",
  Q: "ق",
  R: "ر",
  S: "ش",
  T: "ط",
  U: "ت",
  V: "ث",
  W: "غ",
  X: "س",
  Y: "ص",
  Z: "ع",
};

/**
 * يحول تسمية الرأس الهندسي بين العربية (أ، ب، جـ) والإنجليزية (A, B, C) وفق إعداد المستند.
 */
export function localizeGeometricVertexLabelSSOT(
  label: string,
  notation: MathNotationLanguage
): string {
  const clean = label.trim();
  if (notation === "english") {
    return ARABIC_TO_ENGLISH_VERTEX_MAP[clean] || clean;
  }
  return ENGLISH_TO_ARABIC_VERTEX_MAP[clean.toUpperCase()] || clean;
}

export const ARABIC_CHOICE_LETTERS = ["أ", "ب", "جـ", "د"] as const;
export const ENGLISH_CHOICE_LETTERS = ["A", "B", "C", "D"] as const;

export function getChoiceLetterByNotationSSOT(
  index: number,
  notation?: MathNotationLanguage
): string {
  if (notation === "english") {
    return ENGLISH_CHOICE_LETTERS[index] || String(index + 1);
  }
  return ARABIC_CHOICE_LETTERS[index] || String(index + 1);
}

const GEOMETRY_UNIT_NORMALIZATION_MAP: Readonly<Record<string, ArabicMathUnit>> = {
  "سم": "سم",
  "سنتيمتر": "سم",
  "سنتيمترات": "سم",
  cm: "سم",
  "م": "م",
  "متر": "م",
  "أمتار": "م",
  "امتار": "م",
  m: "م",
  "كم": "كم",
  "كيلومتر": "كم",
  km: "كم",
  "مم": "مم",
  "ملليمتر": "مم",
  "مليمتر": "مم",
  mm: "مم",
  "ديسم": "ديسم",
  "ديسيمتر": "ديسم",
  dm: "ديسم",
  "وحدة": "وحدة",
  "وحدات": "وحدة",
  "وحدة طول": "وحدة طول",
  unit: "وحدة",
  units: "وحدة",
  "سم²": "سم²",
  "م²": "م²",
  "درجة": "درجة",
};

/**
 * يوحد وحدة القياس الهندسية الواردة في النص إلى الوحدة العربية المعتمدة في الدستور (مثل سم، م، كم، مم، ديسم، وحدة).
 */
export function normalizeArabicGeometryUnitSSOT(rawUnit?: string): ArabicMathUnit | undefined {
  if (!rawUnit) return undefined;
  const key = rawUnit.trim().replace(/\s+/g, " ").toLowerCase();
  return GEOMETRY_UNIT_NORMALIZATION_MAP[key];
}


