/**
 * @file geo-fact-splitter.ts
 * @description يقسّم وصف الشكل إلى سطور حقائق، ويوحّد الرموز (≈ // ⊥ ∈ °) قبل التحليل.
 */
export const MODULE_ID_GEO_FACT_SPLITTER = "geo_fact_splitter" as const;

const EASTERN = "٠١٢٣٤٥٦٧٨٩";

export function normalizeGeometryText(raw: string): string {
  return String(raw ?? "")
    .replace(/[٠-٩]/g, (d) => String(EASTERN.indexOf(d)))
    .replace(/٫/g, ".")
    .replace(/[ΔΔ△∆▵]/g, " مثلث ")
    .replace(/∥|\\parallel|يوازي|موازٍ|موازي|متوازيان/g, " // ")
    .replace(/⊥|\\perp|عمودي\s*على|عمودية\s*على|يعامد|عمود\s*على/g, " ⊥ ")
    .replace(/تنتمي\s*إلى|ينتمي\s*إلى|تقع\s*على|يقع\s*على|∈/g, " ∈ ")
    .replace(/\bدرجة\b|\bدرجات\b/g, "°")
    .replace(/[−–—]/g, "-")
    .replace(/[∠]|\\angle/g, " ∠ ")
    .replace(/∼|\\sim|~|يشابه|تشابه/g, " ~ ")
    .replace(/\s+/g, " ")
    .trim();
}

const LEADING_CONNECTORS = /^(?:فيه|فيها|حيث|بحيث|إذا\s*كان|لتكن|ليكن|لتكن|ثم|و(?=\s+(?![أ-ي]ـ?\s*=)))\s*/;

export function splitDescriptionIntoFactStrings(description: string): string[] {
  const text = normalizeGeometryText(description);
  const raw = text
    .split(/[;؛\n،]|(?<=\D)\.(?=\s)/)
    .map((s) => { let t = s.trim(); for (let i = 0; i < 2; i++) t = t.replace(LEADING_CONNECTORS, "").trim(); return t; })
    .filter((s) => s.length > 0);
  return raw.flatMap(splitSimilarityPair).flatMap(expandEqualityChain);
}

const SHAPE_WORD = /^(?:ال)?(?:مثلث|مستطيل|مربع|معين|متوازي\s*أضلاع|شبه\s*منحرف|رباعي)/;

/** «مثلث ABC ~ DEF» ← «مثلث ABC» و«مثلث DEF» (يرث كلمة الشكل من الجزء الأول). */
function splitSimilarityPair(fact: string): string[] {
  if (!fact.includes(" ~ ")) return [fact];
  const parts = fact.split(" ~ ").map((p) => p.trim()).filter(Boolean);
  const word = parts[0].match(SHAPE_WORD)?.[0];
  if (!word) return parts;
  return parts.map((p, i) => (i > 0 && !SHAPE_WORD.test(p) ? `${word} ${p}` : p));
}

const SEG_TOKEN = "(?:[A-Z]{2}|[أ-ي]ـ?\\s*[أ-ي]ـ?)";
const CHAIN = new RegExp(`^(${SEG_TOKEN})\\s*=\\s*(${SEG_TOKEN})\\s*=\\s*(.+)$`, "u");

/** «أ ب = أ جـ = 7» ← «أ ب = أ جـ» و«أ ب = 7» و«أ جـ = 7». */
function expandEqualityChain(fact: string): string[] {
  const m = fact.match(CHAIN);
  return m ? [`${m[1]} = ${m[2]}`, `${m[1]} = ${m[3]}`, `${m[2]} = ${m[3]}`] : [fact];
}
