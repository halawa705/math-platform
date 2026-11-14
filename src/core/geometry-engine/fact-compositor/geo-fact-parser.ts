/**
 * @file geo-fact-parser.ts
 * @description يحوّل سطر حقيقة واحداً (بعد التطبيع) إلى GeoFact، أو null إن لم يفهمه.
 */
import type { GeoFact, QuadKind, Seg } from "./geo-fact-types";
import { normalizeLabelKey, parseLabelList } from "./geo-label-utils";
import { evaluateSimpleMathExpression } from "@/core/exam-grading/math-simple-expression-evaluator";
import { normalizeArabicGeometryUnitSSOT } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_GEO_FACT_PARSER = "geo_fact_parser" as const;

const UNIT_RX = "(?:(سم²|م²|سم\\^2|م\\^2|سم|متر|أمتار|متراً|مترا|أمتاراً|أمتارا|امتاراً|امتار|قدماً|أقدام|قدم|بوصة|بوصات|م|كم|مم|ديسم|وحدة\\s*طول|وحدة|وحدات|cm|mm|km|dm|m))?";

const L = "(?:[A-Za-z]|[أ-ي]ـ?)";
const SEGRX = `(${L}\\s*${L})(?![A-Za-zء-ي])`;
const ONE = `(${L})(?![A-Za-zء-ي])`;
const LIST = `((?:${L}\\s+)+${L}|[A-Z]{2,5})(?![A-Za-zء-ي])`;
const LIST1 = `((?:${L}\\s+)*${L}|[A-Z]{1,5})(?![A-Za-zء-ي])`;
const re = (src: string) => new RegExp(`^${src}$`, "u");

function seg(raw?: string): Seg | null { if (!raw) return null; const k = parseLabelList(raw); return k && k.length === 2 ? [k[0], k[1]] : null; }
function one(raw: string): string { return normalizeLabelKey(raw.trim()); }

const QUAD_WORDS: Array<[RegExp, QuadKind]> = [
  [/^مستطيل/, "rectangle"], [/^مربع/, "square"], [/^معين/, "rhombus"], [/^متوازي\s*أضلاع/, "parallelogram"],
  [/^شبه\s*منحرف/, "trapezoid"], [/^(?:شكل\s*)?رباعي/, "general"],
];

export function parseGeoFactString(s: string): GeoFact | null {
  let m: RegExpMatchArray | null;
  // دائرة (G-7)
  if ((m = s.match(new RegExp(`^(?:ال)?دائرة\\s*(?:التي\\s*)?مركزها\\s*${ONE}(?:\\s*(?:وطول\\s*)?نصف\\s*قطرها\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*${UNIT_RX})?`, "u")))) {
    const r = m[2] ? Number(m[2]) : undefined;
    return { k: "circle", center: one(m[1]), radius: r && Number.isFinite(r) ? r : undefined, unit: normalizeArabicGeometryUnitSSOT(m[3]) };
  }
  if ((m = s.match(new RegExp(`^(?:نق|نصف\\s*القطر|طول\\s*نصف\\s*القطر|نصف\\s*قطرها)\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*${UNIT_RX}$`, "u")))) {
    return { k: "radius", r: Number(m[1]), unit: normalizeArabicGeometryUnitSSOT(m[2]) };
  }
  if ((m = s.match(new RegExp(`^${LIST1}\\s*(?:على|∈)\\s*(?:محيط\\s*)?الدائرة$`, "u")))) {
    const labels = parseLabelList(m[1]);
    if (labels && labels.length >= 1) return { k: "onCircle", labels };
  }
  if ((m = s.match(re(`${SEGRX}\\s*وتر(?:\\s*في\\s*الدائرة)?`)))) { const a = seg(m[1]); if (a) return { k: "chord", seg: a }; }
  if ((m = s.match(re(`${SEGRX}\\s*قطر(?:\\s*في\\s*الدائرة)?`)))) { const a = seg(m[1]); if (a) return { k: "diameter", seg: a }; }
  if ((m = s.match(re(`${SEGRX}\\s*مماس(?:\\s*للدائرة)?\\s*(?:عند|في)\\s*${ONE}`)))) { const a = seg(m[1]); if (a) return { k: "tangent", seg: a, at: one(m[2]) }; }
  // تشابه وتطابق مثلثين (قبل فحص المثلث الفردي)
  if ((m = s.match(/^(?:ال)?مثلث\s*([A-Za-z]{3}|(?:[أ-ي]ـ?\s*){3})\s*~\s*(?:(?:ال)?مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s*){3})(?:\s*(?:نسبة|معامل)\s*التشابه\s*=?\s*(\d+(?:\.\d+)?))?/u))) {
    const t1 = parseLabelList(m[1]); const t2 = parseLabelList(m[2]);
    const ratio = m[3] ? Number(m[3]) : undefined;
    if (t1 && t1.length === 3 && t2 && t2.length === 3) {
      return { k: "similarity", tri1: [t1[0], t1[1], t1[2]], tri2: [t2[0], t2[1], t2[2]], ratio: ratio && Number.isFinite(ratio) ? ratio : undefined };
    }
  }
  if ((m = s.match(/^(?:ال)?مثلث\s*([A-Za-z]{3}|(?:[أ-ي]ـ?\s*){3})\s*≅\s*(?:(?:ال)?مثلث\s*)?([A-Za-z]{3}|(?:[أ-ي]ـ?\s*){3})/u))) {
    const t1 = parseLabelList(m[1]); const t2 = parseLabelList(m[2]);
    if (t1 && t1.length === 3 && t2 && t2.length === 3) {
      return { k: "congruence", tri1: [t1[0], t1[1], t1[2]], tri2: [t2[0], t2[1], t2[2]] };
    }
  }
  // مثلث
  if ((m = s.match(new RegExp(`^(?:ال)?مثلث\\s*${LIST}\\s*(.*)$`, "u")))) {
    const labels = parseLabelList(m[1]); const rest = m[2] || "";
    if (labels && labels.length === 3) {
      const rightVertexMatch = rest.match(new RegExp(`قائم(?:\\s*الزاوية)?\\s*(?:في|عند)\\s*${ONE}`, "u"));
      const isRightGeneral = !rightVertexMatch && /قائم(?:\s*الزاوية)?/.test(rest);
      const iso = rest.match(new RegExp(`متساوي\\s*الساقين(?:.*?(?:رأسه|رأس)\\s*(?:هو|عند|في)?\\s*${ONE})?`, "u"));
      return {
        k: "triangle",
        labels,
        right: rightVertexMatch ? one(rightVertexMatch[1]) : isRightGeneral ? labels[1] : undefined,
        isoApex: iso ? (iso[1] ? one(iso[1]) : labels[0]) : undefined,
        equilateral: /متساوي\s*الأضلاع/.test(rest) || undefined,
      };
    }
  }
  // رباعي (يدعم الصيغ المؤهلة مثل «شبه منحرف متساوي الساقين ABCD» و«رباعي ABCD دائري» و«شكل رباعي ABCD»)
  for (const [word, kind] of QUAD_WORDS) {
    const q = s.match(
      new RegExp(
        `^${word.source.slice(1)}(?:\\s+(?:متساوي\\s*الساقين|دائري|قائم(?:\\s*الزاوية)?(?:\\s*(?:في|عند)\\s*${ONE})?))?\\s*${LIST}(?:\\s+(?:متساوي\\s*الساقين|دائري|قائم(?:\\s*الزاوية)?(?:\\s*(?:في|عند)\\s*${ONE})?))?(?:\\s+متجاوران)?$`,
        "u"
      )
    );
    if (q) {
      const labels = parseLabelList(q[2]);
      if (labels && labels.length === 4) {
        const rightVertex = q[1] || q[3];
        return {
          k: "quad",
          kind,
          labels,
          isoLegs: /متساوي\s*الساقين/.test(s) || undefined,
          rightAt: rightVertex ? one(rightVertex) : undefined,
        };
      }
    }
  }
  // مساحة المربع المنشأ على ضلع
  if ((m = s.match(new RegExp(`^مساحة\\s*(?:ال)?مربع\\s*(?:المنشأ\\s*)?على\\s*(?:الضلع\\s*|الوتر\\s*)?${SEGRX}\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*${UNIT_RX}$`, "u")))) {
    const a = seg(m[1]);
    const area = Number(m[2]);
    if (a && Number.isFinite(area) && area > 0) {
      const unitRaw = (m[3] || "سم²").replace(/\^2/g, "²");
      const unit = normalizeArabicGeometryUnitSSOT(unitRaw.includes("²") ? unitRaw : `${unitRaw}²`);
      return { k: "areaOnSide", seg: a, area, text: `${area}`, unit };
    }
  }
  // قياس زاوية
  if ((m = s.match(new RegExp(`^ق\\s*\\(\\s*∠?\\s*${LIST1}\\s*\\)\\s*=\\s*(.+)$`, "u"))) || (m = s.match(new RegExp(`^∠\\s*${LIST1}\\s*=\\s*(.+)$`, "u")))) {
    const labels = parseLabelList(m[1]); const rawVal = m[2].trim();
    const hasDeg = /°|درجة/.test(rawVal);
    const val = rawVal.replace(/°|درجة/g, "").trim();
    if (labels && (labels.length === 1 || labels.length === 3)) {
      const num = Number(val);
      const isUnknown = val === "؟" || val === "?";
      const displayText = hasDeg && !isUnknown && !val.includes("°") ? `${val}°` : val;
      return { k: "angle", arms: labels.length === 3 ? [labels[0], labels[1], labels[2]] : undefined, vertex: labels.length === 3 ? labels[1] : labels[0], deg: Number.isFinite(num) ? num : undefined, text: Number.isFinite(num) ? undefined : displayText, right: num === 90 || undefined };
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
  if ((m = s.match(re(`${SEGRX}\\s*(?:و|،|,)?\\s*${SEGRX}\\s*يتقاطعان\\s*(?:في|عند)\\s*(?:النقطة\\s+)?${ONE}`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "intersect", a, b, p: one(m[3]) }; }
  if ((m = s.match(re(`${SEGRX}\\s+يتقاطع\\s+(?:مع|و)\\s+${SEGRX}\\s*(?:في|عند)\\s*(?:النقطة\\s+)?${ONE}`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "intersect", a, b, p: one(m[3]) }; }
  if ((m = s.match(re(`(?:إذا\\s+)?تقاطع\\s+(?:المستقيمان\\s+|المستقيم\\s+|القطعتان\\s+)?${SEGRX}\\s*(?:و|،|مع)\\s*(?:المستقيم\\s+)?${SEGRX}\\s*(?:في|عند)\\s*(?:النقطة\\s+)?${ONE}`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "intersect", a, b, p: one(m[3]) }; }
  // نقطة على قطعة / منتصف / امتداد
  if ((m = s.match(re(`${ONE}\\s*منتصف\\s*(?:القطعة\\s*)?${SEGRX}`)))) { const a = seg(m[2]); if (a) return { k: "midpoint", p: one(m[1]), seg: a }; }
  if ((m = s.match(re(`${ONE}\\s*(?:∈|على)\\s*امتداد\\s*(?:القطعة\\s*|الشعاع\\s*|المستقيم\\s*|الضلع\\s*)?${SEGRX}`)))) { const a = seg(m[2]); if (a) return { k: "extend", from: a[0], through: a[1], to: one(m[1]) }; }
  if ((m = s.match(re(`${ONE}\\s*∈\\s*(?:القطعة\\s*|الضلع\\s*|ال?وتر\\s*)?${SEGRX}`)))) { const a = seg(m[2]); if (a) return { k: "pointOn", p: one(m[1]), seg: a }; }
  if ((m = s.match(re(`${ONE}\\s*على\\s*(?:القطعة\\s*|الضلع\\s*)?${SEGRX}`)))) { const a = seg(m[2]); if (a) return { k: "pointOn", p: one(m[1]), seg: a }; }
  // مد وتوصيل
  if ((m = s.match(re(`(?:نمد|مد|امدد)\\s*${SEGRX}\\s*(?:إلى|حتى)\\s*${ONE}`)))) { const a = seg(m[1]); if (a) return { k: "extend", from: a[0], through: a[1], to: one(m[2]) }; }
  if ((m = s.match(re(`(?:نصل|ارسم|نرسم|وصل)\\s*${SEGRX}`)))) { const a = seg(m[1]); if (a) return { k: "draw", seg: a }; }
  // نسب أطوال
  if ((m = s.match(re(`${SEGRX}\\s*(?::|/)\\s*${SEGRX}\\s*=\\s*(?:(\\d+(?:\\.\\d+)?)\\s*(?::|/)\\s*(\\d+(?:\\.\\d+)?)|\\((\\d+)\\)/\\((\\d+)\\)|(\\d+(?:\\.\\d+)?))`)))) {
    const a = seg(m[1]); const b = seg(m[2]);
    const num = Number(m[3] || m[5] || m[7]); const den = Number(m[4] || m[6] || 1);
    if (a && b && Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
      return { k: "ratio", a, b, num, den };
    }
  }
  // تساوي أضلاع / طول
  if ((m = s.match(re(`${SEGRX}\\s*=\\s*${SEGRX}`)))) { const a = seg(m[1]); const b = seg(m[2]); if (a && b) return { k: "equal", a, b }; }
  if ((m = s.match(/^محيط\s*=\s*(\d+(?:\.\d+)?)\s*(سم|م|متراً|مترا|متر)?$/))) {
    return { k: "perimeter", value: Number(m[1]), unit: normalizeArabicGeometryUnitSSOT(m[2]) ?? "سم" };
  }
  if ((m = s.match(/^مساحة\s*=\s*(\d+(?:\.\d+)?)\s*(سم²|سم\^2|م²)?$/))) {
    return { k: "area", value: Number(m[1]), unit: (m[2] || "سم²").replace(/\^2/g, "²") };
  }
  if ((m = s.match(re(`${SEGRX}\\s*=\\s*(\\d+)\\s*/\\s*(\\d+)\\s*${SEGRX}`)))) {
    const a = seg(m[1]); const b = seg(m[4]);
    const num = Number(m[2]); const den = Number(m[3]);
    if (a && b && den > 0) return { k: "segmentRatio", part: a, whole: b, num, den };
  }
  if ((m = s.match(re(`${SEGRX}\\s*=\\s*(.+?)\\s*${UNIT_RX}`)))) {
    const a = seg(m[1]);
    const text = m[2].trim().replace(/\*?\s*جذر\s*\(?\s*(\d+(?:\.\d+)?)\s*\)?/g, "√$1");
    const unit = normalizeArabicGeometryUnitSSOT(m[3]);
    if (a && text && !/^[A-Z]{2}(?:\s*=\s*[A-Z]{2})*$/.test(text) && !/^[A-Z]{2}\s*=/.test(text)) {
      const hasVar = /[a-zA-Zسصع]/.test(text);
      const hasRad = /√/.test(text);
      const evalExpr = text
        .replace(/(\d)\s*√/g, "$1*√")
        .replace(/√\s*(\d+(?:\.\d+)?)/g, "sqrt($1)")
        .replace(/\s+/g, "");
      let n = hasVar ? null : evaluateSimpleMathExpression(evalExpr);
      if (n === null && hasVar) {
        const mockExpr = evalExpr.replace(/[a-zA-Zسصع]/g, "(4)");
        const mockVal = evaluateSimpleMathExpression(mockExpr);
        n = mockVal !== null && mockVal > 0 ? mockVal : 5;
      }
      return {
        k: "length",
        seg: a,
        text,
        numeric: n === null ? undefined : n,
        symbolic: hasVar || hasRad || undefined,
        unit,
      };
    }
  }
  return null;
}

