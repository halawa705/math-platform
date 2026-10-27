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
  | "وحدة طول"
  | "سم²"
  | "م²"
  | "كم²"
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
 * يضمن وجود وحدة القياس العربية بعد العدد دائماً (مثل: "8 سم" بدلاً من "سم 8")،
 * ويخرج الوحدات الإنجليزية/العربية المحبوسة داخل `$...$` لتظهر بالعربية السليمة بعد الرقم.
 */
export function normalizeArabicUnitPlacementSSOT(text: string): string {
  if (!text) return "";
  return text
    .replace(
      /\$\s*(-?\d+(?:\.\d+)?)\s*(?:\\text\{)?\s*(?:cm\^2|cm²|سم\^2|سم²)\s*\}?\s*\$/gi,
      "$$$1$$ سم²"
    )
    .replace(
      /\$\s*(-?\d+(?:\.\d+)?)\s*(?:\\text\{)?\s*(?:cm\^3|cm³|سم\^3|سم³)\s*\}?\s*\$/gi,
      "$$$1$$ سم³"
    )
    .replace(
      /\$\s*(-?\d+(?:\.\d+)?)\s*(?:\\text\{)?\s*(?:m\/s\^2|م\/ث\^2|م\/ث²)\s*\}?\s*\$/gi,
      "$$$1$$ م/ث²"
    )
    .replace(
      /\$\s*(-?\d+(?:\.\d+)?)\s*(?:\\text\{)?\s*(?:m\/s|م\/ث)\s*\}?\s*\$/gi,
      "$$$1$$ م/ث"
    )
    .replace(
      /\$\s*(-?\d+(?:\.\d+)?)\s*(?:\\text\{)?\s*(?:cm|سم)\s*\}?\s*\$/gi,
      "$$$1$$ سم"
    )
    .replace(
      /\b(سم²|سم³|م²|م³|سم|مم|كم|متر|لتر|جم|كجم|درجة|دقيقة|ثانية|جنيه|جنيهاً|قرش|قرشاً|نيوتن|داين|جول|وات|م\/ث²|م\/ث|كم\/س)\s+(\d+(?:\.\d+)?|[٠-٩]+(?:\.[٠-٩]+)?)/g,
      "$2 $1"
    )
    .replace(
      /(?<!\$)\b([A-Za-z]{1,4}\s*=\s*[-+]?[0-9٠-٩]+(?:\.[0-9٠-٩]+)?)\s*(سم²|سم³|م²|م³|سم|مم|كم|متر|لتر|جم|كجم|درجة|دقيقة|ثانية|نيوتن|داين|جول|وات|م\/ث²|م\/ث|كم\/س)(?=$|[\s,،؛:!?.])(?!\$)/g,
      (_m, p1: string, p2: string) => `$${p1}\\text{ ${p2}}$`
    )
    .replace(
      /(?<!\$)\b(m\s*\(\s*(?:∠|\\angle|<)\s*[A-Za-z]\s*\)\s*=\s*[-+]?[0-9٠-٩]+)\s*(?:°|درجة)(?=$|[\s,،؛:!?.])(?!\$)/g,
      (_m, p1: string) => `$${p1}^\\circ$`
    )
    .replace(/\b(\d+(?:\.\d+)?)\s*cm\^2\b/gi, "$1 سم²")
    .replace(/\b(\d+(?:\.\d+)?)\s*cm\^3\b/gi, "$1 سم³")
    .replace(/\b(\d+(?:\.\d+)?)\s*cm\b/gi, "$1 سم");
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
  "ب": "B",
  "جـ": "C",
  "ج": "C",
  "د": "D",
  "هـ": "E",
  "ه": "E",
  "و": "F",
  "م": "M",
  "ن": "N",
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
  M: "م",
  N: "ن",
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
