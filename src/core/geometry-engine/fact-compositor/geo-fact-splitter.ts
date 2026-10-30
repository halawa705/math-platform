/**
 * @file geo-fact-splitter.ts
 * @description يقسّم وصف الشكل إلى سطور حقائق، ويوحّد الرموز (≈ // ⊥ ∈ °) قبل التحليل.
 */
import { convertGeometryLatexToPlainText } from "../description-intake/geometry-latex-to-plain-normalizer";
import { restructureGeometryClauses } from "../description-intake/geometry-clause-restructurer";

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
  const text = restructureGeometryClauses(normalizeGeometryText(convertGeometryLatexToPlainText(description)));
  const raw = text
    .split(/[;؛\n،]|(?<=\D)\.(?=\s)/)
    .map((s) => { let t = s.trim(); for (let i = 0; i < 2; i++) t = t.replace(LEADING_CONNECTORS, "").trim(); return t; })
    .filter((s) => s.length > 0);
  return orderFactsByDependency(raw.flatMap(splitSimilarityPair).flatMap(expandEqualityChain));
}

const DECLARATION_FACT = /^(?:ال)?(?:مثلث|مستطيل|مربع|معين|متوازي\s*أضلاع|شبه\s*منحرف|رباعي|دائرة)/;
const BASE_POINT_FACT = /(?:∈|منتصف|\sعلى\s|^(?:نمد|مد|امدد)\s)/;
const DERIVED_LINE_FACT = /(?:متوسط|ينصف|منصف|⊥|\/\/)/;
const INTERSECTION_FACT = /(?:∩|×|يتقاطعان)/;

/** يضمن تعريف الأشكال أولاً ثم النقاط المشتقة ثم العلاقات/الأطوال (ترتيب ثابت يحفظ الترتيب الأصلي داخل كل فئة). */
function orderFactsByDependency(facts: string[]): string[] {
  const rank = (f: string) =>
    DECLARATION_FACT.test(f) ? 0 : BASE_POINT_FACT.test(f) ? 1 : DERIVED_LINE_FACT.test(f) ? 2 : INTERSECTION_FACT.test(f) ? 3 : 4;
  return facts.map((f, i) => ({ f, i, r: rank(f) })).sort((a, b) => a.r - b.r || a.i - b.i).map((x) => x.f);
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




