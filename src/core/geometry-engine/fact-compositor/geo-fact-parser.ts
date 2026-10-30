/**
 * @file geo-fact-parser.ts
 * @description يحوّل سطر حقيقة واحداً (بعد التطبيع) إلى GeoFact، أو null إن لم يفهمه.
 */
import type { GeoFact, QuadKind, Seg } from "./geo-fact-types";
import { normalizeLabelKey, parseLabelList } from "./geo-label-utils";
import { evaluateSimpleMathExpression } from "@/core/exam-grading/math-simple-expression-evaluator";

export const MODULE_ID_GEO_FACT_PARSER = "geo_fact_parser" as const;

const L = "(?:[A-Za-z]|[أ-ي]ـ?)";
const SEGRX = `(${L}\\s*${L})(?![A-Za-zء-ي])`;
const ONE = `(${L})(?![A-Za-zء-ي])`;
const LIST = `((?:${L}\\s+)+${L}|[A-Z]{2,5})(?![A-Za-zء-ي])`;
const LIST1 = `((?:${L}\\s+)*${L}|[A-Z]{1,5})(?![A-Za-zء-ي])`;
const re = (src: string) => new RegExp(`^${src}$`, "u");

function seg(raw: string): Seg | null { const k = parseLabelList(raw); return k && k.length === 2 ? [k[0], k[1]] : null; }
function one(raw: string): string { return normalizeLabelKey(raw.trim()); }

const QUAD_WORDS: Array<[RegExp, QuadKind]> = [
  [/^مستطيل/, "rectangle"], [/^مربع/, "square"], [/^معين/, "rhombus"], [/^متوازي\s*أضلاع/, "parallelogram"],
  [/^شبه\s*منحرف/, "trapezoid"], [/^رباعي/, "general"],
];

export function parseGeoFactString(s: string): GeoFact | null {
  let m: RegExpMatchArray | null;
  // دائرة (G-7)
  if ((m = s.match(new RegExp(`^(?:ال)?دائرة\\s*(?:التي\\s*)?مركزها\\s*${ONE}(?:\\s*(?:وطول\\s*)?نصف\\s*قطرها\\s*=\\s*(\\d+(?:\\.\\d+)?))?`, "u")))) {
    const r = m[2] ? Number(m[2]) : undefined;
    return { k: "circle", center: one(m[1]), radius: r && Number.isFinite(r) ? r : undefined };
  }
  if ((m = s.match(/^(?:نق|نصف\s*القطر|طول\s*نصف\s*القطر)\s*=\s*(\d+(?:\.\d+)?)\s*(?:سم|م|وحدة)?$/u))) {
    return { k: "radius", r: Number(m[1]) };
  }
  if ((m = s.match(new RegExp(`^${LIST1}\\s*(?:على|∈)\\s*(?:محيط\\s*)?الدائرة$`, "u")))) {
    const labels = parseLabelList(m[1]);
    if (labels && labels.length >= 1) return { k: "onCircle", labels };
  }
  if ((m = s.match(re(`${SEGRX}\\s*وتر(?:\\s*في\\s*الدائرة)?`)))) { const a = seg(m[1]); if (a) return { k: "chord", seg: a }; }
  if ((m = s.match(re(`${SEGRX}\\s*قطر(?:\\s*في\\s*الدائرة)?`)))) { const a = seg(m[1]); if (a) return { k: "diameter", seg: a }; }
  if ((m = s.match(re(`${SEGRX}\\s*مماس(?:\\s*للدائرة)?\\s*(?:عند|في)\\s*${ONE}`)))) { const a = seg(m[1]); if (a) return { k: "tangent", seg: a, at: one(m[2]) }; }
  // مثلث
  if ((m = s.match(new RegExp(`^(?:ال)?مثلث\\s*${LIST}\\s*(.*)$`, "u")))) {
    const labels = parseLabelList(m[1]); const rest = m[2] || "";
    if (labels && labels.length === 3) {
      const right = rest.match(new RegExp(`قائم(?:\\s*الزاوية)?\\s*(?:في|عند)\\s*${ONE}`, "u"));
      const iso = rest.match(new RegExp(`متساوي\\s*الساقين(?:.*?(?:رأسه|رأس)\\s*(?:هو|عند|في)?\\s*${ONE})?`, "u"));
      return { k: "triangle", labels, right: right ? one(right[1]) : undefined, isoApex: iso ? (iso[1] ? one(iso[1]) : labels[0]) : undefined, equilateral: /متساوي\s*الأضلاع/.test(rest) || undefined };
    }
  }
  // رباعي
  for (const [word, kind] of QUAD_WORDS) {
    const q = s.match(new RegExp(`^${word.source.slice(1)}\\s*${LIST}`, "u"));
    if (q) { const labels = parseLabelList(q[1]); if (labels && labels.length === 4) return { k: "quad", kind, labels }; }
  }
  // قياس زاوية
  if ((m = s.match(new RegExp(`^ق\\s*\\(\\s*∠?\\s*${LIST1}\\s*\\)\\s*=\\s*(.+)$`, "u"))) || (m = s.match(new RegExp(`^∠\\s*${LIST1}\\s*=\\s*(.+)$`, "u")))) {
    const labels = parseLabelList(m[1]); const val = m[2].replace(/°/g, "").trim();
    if (labels && (labels.length === 1 || labels.length === 3)) {
      const num = Number(val);
      return { k: "angle", arms: labels.length === 3 ? [labels[0], labels[1], labels[2]] : undefined, vertex: labels.length === 3 ? labels[1] : labels[0], deg: Number.isFinite(num) ? num : undefined, text: Number.isFinite(num) ? undefined : val, right: num === 90 || undefined };
    }
  }
  if ((m = s.match(new RegExp(`^∠\\s*${LIST1}\\s*قائمة$`, "u"))) || (m = s.match(new RegExp(`^(?:زاوية\\s*)?${LIST1}\\s*قائمة$`, "u")))) {
    const labels = parseLabelList(m[1]);
    if (labels && (labels.length === 1 || labels.length === 3)) return { k: "angle", arms: labels.length === 3 ? [labels[0], labels[1], labels[2]] : undefined, vertex: labels.length === 3 ? labels[1] : labels[0], deg: 90, right: true };
  }
  // توازي / تعامد
  if ((m = s.match(re(`${SEGRX}\\s*//\\s*${SEGRX}`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "parallel", a, b }; }
  if ((m = s.match(re(`${SEGRX}\\s*⊥\\s*${SEGRX}(?:\\s*(?:في|عند)\\s*${ONE})?`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "perp", a, b, foot: m[3] ? one(m[3]) : undefined }; }
  // منصف / متوسط
  if ((m = s.match(re(`${SEGRX}\\s*(?:ينصف|منصف|منصفاً)\\s*(?:∠\\s*)?${LIST1}`)))) { const a = seg(m[1]); const v = parseLabelList(m[2]); if (a && v) return { k: "bisector", seg: a, vertex: v.length === 3 ? v[1] : v[0] }; }
  if ((m = s.match(re(`${SEGRX}\\s*متوسط(?:\\s*في\\s*المثلث.*)?`)))) { const a = seg(m[1]); if (a) return { k: "median", seg: a }; }
  // تقاطع
  if ((m = s.match(re(`${SEGRX}\\s*(?:∩|×)\\s*${SEGRX}\\s*=\\s*\\{?\\s*${ONE}\\s*\\}?`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "intersect", a, b, p: one(m[3]) }; }
  if ((m = s.match(new RegExp(`قطرا.*يتقاطعان\\s*(?:في|عند)\\s*${ONE}`, "u")))) return { k: "diagonalsMeet", p: one(m[1]) };
  if ((m = s.match(re(`${SEGRX}\\s*(?:و|،|,)?\\s*${SEGRX}\\s*يتقاطعان\\s*(?:في|عند)\\s*${ONE}`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "intersect", a, b, p: one(m[3]) }; }
  // نقطة على قطعة / منتصف
  if ((m = s.match(re(`${ONE}\\s*منتصف\\s*(?:القطعة\\s*)?${SEGRX}`)))) { const a = seg(m[2]); if (a) return { k: "midpoint", p: one(m[1]), seg: a }; }
  if ((m = s.match(re(`${ONE}\\s*∈\\s*(?:القطعة\\s*|الضلع\\s*|ال?وتر\\s*)?${SEGRX}`)))) { const a = seg(m[2]); if (a) return { k: "pointOn", p: one(m[1]), seg: a }; }
  if ((m = s.match(re(`${ONE}\\s*على\\s*(?:القطعة\\s*|الضلع\\s*)?${SEGRX}`)))) { const a = seg(m[2]); if (a) return { k: "pointOn", p: one(m[1]), seg: a }; }
  // مد وتوصيل
  if ((m = s.match(re(`(?:نمد|مد|امدد)\\s*${SEGRX}\\s*(?:إلى|حتى)\\s*${ONE}`)))) { const a = seg(m[1]); if (a) return { k: "extend", from: a[0], through: a[1], to: one(m[2]) }; }
  if ((m = s.match(re(`(?:نصل|ارسم|نرسم|وصل)\\s*${SEGRX}`)))) { const a = seg(m[1]); if (a) return { k: "draw", seg: a }; }
  // تساوي أضلاع / طول
  if ((m = s.match(re(`${SEGRX}\\s*=\\s*${SEGRX}`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "equal", a, b }; }
  if ((m = s.match(re(`${SEGRX}\\s*=\\s*(.+?)\\s*(?:سم|م|وحدة|وحدات)?`)))) {
    const a = seg(m[1]); const text = m[2].trim();
    if (a && text) { const n = evaluateSimpleMathExpression(text.replace(/√\s*(\d+)/g, "sqrt($1)").replace(/\s+/g, "")); return { k: "length", seg: a, text, numeric: n === null ? undefined : n }; }
  }
  return null;
}

