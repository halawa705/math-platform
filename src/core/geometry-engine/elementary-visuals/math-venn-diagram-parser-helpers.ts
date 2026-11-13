/**
 * @file math-venn-diagram-parser-helpers.ts
 * @description محلل الأوصاف العربية لمخطط فن (مجموعات الأعداد المتداخلة، نظرية المجموعات الشاملة U، وتحليل العوامل الأولية).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 220 سطراً).
 */

import { toWesternNumeralsSSOT } from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MATH_VENN_DIAGRAM_PARSER_HELPERS =
  "math_venn_diagram_parser_helpers" as const;

export interface NestedVennLayerSpec {
  readonly name: string;
  readonly symbol: string;
  readonly elements: readonly (number | string)[];
}

export interface MathVennDiagramData {
  readonly labelA: string;
  readonly labelB: string;
  readonly labelU?: string;
  readonly setA: readonly string[];
  readonly setB: readonly string[];
  readonly intersection: readonly string[];
  readonly universalSet?: readonly string[];
  readonly complement?: readonly string[];
  readonly isSetTheory?: boolean;
  readonly isNestedSets?: boolean;
  readonly nestedLayers?: readonly NestedVennLayerSpec[];
  readonly title?: string;
}

function getPrimeFactorsList(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  let temp = Math.abs(Math.round(n));
  if (temp <= 1) return [temp];
  while (temp >= 2) {
    if (temp % d === 0) {
      factors.push(d);
      temp /= d;
    } else {
      d += 1;
      if (d * d > temp && temp > 1) {
        factors.push(temp);
        break;
      }
    }
  }
  return factors;
}

function extractNumericTokens(str: string): string[] {
  if (!str) return [];
  const matches = toWesternNumeralsSSOT(str).match(/(?:[-+]?[0-9]+(?:\.[0-9]+)?|[0-9]+\/[0-9]+)/g);
  return matches ? matches.map((m) => m.trim()) : [];
}

export function parseMathVennDescriptor(rawText: string): MathVennDiagramData {
  const text = rawText
    .replace(/^\[?(?:رسم هندسي|شكل هندسي|رسم بياني|GEOMETRY|DIAGRAM|مخطط فن|مخطط_فن|شكل فن|مخطط الفن|مخطط فاين|شكل فاين|فاين):\s*/i, "")
    .replace(/\]\s*$/, "")
    .trim();

  const isNestedIntent =
    text.includes("دوائر متداخلة") ||
    text.includes("دائرتين متداخلتين") ||
    text.includes("مجموعات الأعداد") ||
    text.includes("مجموعة الأعداد") ||
    ((text.includes("أعداد العد") || text.includes("الأعداد الصحيحة") || text.includes("الأعداد النسبية") || text.includes("الأعداد الطبيعية") || text.includes("الأعداد الحقيقية")) &&
      (text.includes("فن") || text.includes("فاين") || text.includes("متداخلة") || text.includes("دوائر") || text.includes("دائرة")));

  if (isNestedIntent) {
    const layers: NestedVennLayerSpec[] = [];
    const pickElems = (re: RegExp) => {
      const m = text.match(re);
      return m ? extractNumericTokens(m[1]) : [];
    };
    if (text.includes("أعداد العد") || /\\mathbb\{C\}|\bC\b|𝕮/i.test(text)) {
      layers.push({ name: "أعداد العد", symbol: "C", elements: pickElems(/(?:أعداد\s*العد|\\mathbb\{C\}|\bC\b)[^:=]*[:=]\s*\\?\{?([^}\]\n]+)/i) });
    }
    if (text.includes("الطبيعية") || /\\mathbb\{N\}|\bN\b|ℕ/i.test(text)) {
      layers.push({ name: "الأعداد الطبيعية", symbol: "N", elements: pickElems(/(?:الأعداد\s*الطبيعية|\\mathbb\{N\}|\bN\b)[^:=]*[:=]\s*\\?\{?([^}\]\n]+)/i) });
    }
    if (text.includes("الصحيحة") || /\\mathbb\{Z\}|\bZ\b|ℤ/i.test(text) || layers.length === 0) {
      layers.push({ name: "الأعداد الصحيحة", symbol: "Z", elements: pickElems(/(?:الأعداد\s*الصحيحة|\\mathbb\{Z\}|\bZ\b)[^:=]*[:=]\s*\\?\{?([^}\]\n]+)/i) });
    }
    if (text.includes("النسبية") || /\\mathbb\{Q\}|\bQ\b|ℚ/i.test(text) || layers.length <= 1) {
      layers.push({ name: "الأعداد النسبية", symbol: "Q", elements: pickElems(/(?:الأعداد\s*النسبية|\\mathbb\{Q\}|\bQ\b)[^:=]*[:=]\s*\\?\{?([^}\]\n]+)/i) });
    }
    if (text.includes("الحقيقية") || /\\mathbb\{R\}|\bR\b|ℝ/i.test(text)) {
      layers.push({ name: "الأعداد الحقيقية", symbol: "R", elements: pickElems(/(?:الأعداد\s*الحقيقية|\\mathbb\{R\}|\bR\b)[^:=]*[:=]\s*\\?\{?([^}\]\n]+)/i) });
    }
    return {
      labelA: layers[0]?.name ?? "المجموعة 1",
      labelB: layers[1]?.name ?? "المجموعة 2",
      setA: (layers[0]?.elements ?? []).map(String),
      setB: (layers[1]?.elements ?? []).map(String),
      intersection: [],
      isNestedSets: true,
      nestedLayers: layers,
      title: "مخطط فن لمجموعات الأعداد",
    };
  }

  let labelA = "العدد A";
  let labelB = "العدد B";
  let labelU: string | undefined;

  const isSetTheoryIntent =
    text.includes("المجموعة الشاملة") ||
    text.includes("مجموعة شاملة") ||
    text.includes("المجموعتين") ||
    /\b[Uuش]\s*=/.test(text) ||
    (/\b[Aaس]\s*=/.test(text) && /\b[Bbص]\s*=/.test(text));

  if (isSetTheoryIntent) {
    const usesArabicLabels = text.includes("س =") || text.includes("المجموعة س") || text.includes("ص =");
    labelA = usesArabicLabels ? "س" : "A";
    labelB = usesArabicLabels ? "ص" : "B";
    labelU = usesArabicLabels ? "ش" : "U";

    const uMatch = text.match(/(?:المجموعة\s*الشاملة|شاملة|\b[Uuش]\b)[^:=]*[:=]\s*\\?\{?([\s\S]*?)(?=(?:\s*(?:و?المجموع|\b[Aaس]\b\s*[:=]|\b[Bbص]\b\s*[:=]|\]|$)))/i);
    let rawU: string[] = [];
    if (uMatch) {
      const rangeM = toWesternNumeralsSSOT(uMatch[1]).match(/(\d+)\s*(?:\\+le|<=|≤|<)\s*[a-zA-Zس]\s*(?:\\+le|<=|≤|<)\s*(\d+)/);
      if (rangeM) {
        const min = parseInt(rangeM[1], 10);
        const max = parseInt(rangeM[2], 10);
        if (max >= min && max - min <= 30) {
          rawU = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
        }
      } else {
        rawU = extractNumericTokens(uMatch[1]);
      }
    }
    const aM = text.match(/(?:(?<=[^a-zA-Z\\]|^)(?:المجموعة\s*(?:الفرعية\s*)?)?[Aaس]\b)[^:=]*[:=]\s*\\?\{?([^}\]\n]+)/i);
    const bM = text.match(/(?:(?<=[^a-zA-Z\\]|^)(?:المجموعة\s*(?:الفرعية\s*)?)?[Bbص]\b)[^:=]*[:=]\s*\\?\{?([^}\]\n]+)/i);
    const rawA = aM ? extractNumericTokens(aM[1]) : [];
    const rawB = bM ? extractNumericTokens(bM[1]) : [];
    if (rawA.length > 0 && rawB.length > 0) {
      const inter = Array.from(new Set(rawA.filter((x) => rawB.includes(x))));
      const onlyA = Array.from(new Set(rawA.filter((x) => !rawB.includes(x))));
      const onlyB = Array.from(new Set(rawB.filter((x) => !rawA.includes(x))));
      const uUnique = rawU.length > 0 ? Array.from(new Set(rawU)) : undefined;
      const union = new Set([...rawA, ...rawB]);
      const comp = uUnique ? uUnique.filter((x) => !union.has(x)) : undefined;
      return { labelA, labelB, labelU, setA: onlyA, setB: onlyB, intersection: inter, universalSet: uUnique, complement: comp, isSetTheory: true, title: "مخطط فن للمجموعات" };
    }
  }

  const interM = text.match(/(?:منطقة\s+التقاطع|التقاطع)\s*(?:تحتوي\s+على|تتضمن|هي|:|=)?\s*(?:العوامل\s+الأولية|العوامل|الأعداد)?\s*([0-9٠-٩\s,،و]+)/i);
  const aM = text.match(/(?:الخاصة\s+بالعدد\s*A|العدد\s*A|المجموعة\s*A|الخاصة\s+بـ?\s*س|المجموعة\s*س)[^0-9٠-٩]*([0-9٠-٩\s,،و]+)/i);
  const bM = text.match(/(?:الخاصة\s+بالعدد\s*B|العدد\s*B|المجموعة\s*B|الخاصة\s+بـ?\s*ص|المجموعة\s*ص)[^0-9٠-٩]*([0-9٠-٩\s,،و]+)/i);

  let intersection = interM ? extractNumericTokens(interM[1]) : [];
  let setA = aM ? extractNumericTokens(aM[1]) : [];
  let setB = bM ? extractNumericTokens(bM[1]) : [];

  if (intersection.length === 0 && setA.length === 0 && setB.length === 0) {
    const nums = toWesternNumeralsSSOT(text).match(/\b(\d+)\b/g);
    if (nums && nums.length >= 2) {
      const n1 = parseInt(nums[0], 10);
      const n2 = parseInt(nums[1], 10);
      if (n1 > 1 && n2 > 1) {
        labelA = `العدد (${n1})`;
        labelB = `العدد (${n2})`;
        const rem2 = [...getPrimeFactorsList(n2)];
        const common: string[] = [];
        const rem1: string[] = [];
        for (const f of getPrimeFactorsList(n1)) {
          const idx = rem2.indexOf(f);
          if (idx !== -1) {
            common.push(String(f));
            rem2.splice(idx, 1);
          } else {
            rem1.push(String(f));
          }
        }
        intersection = common;
        setA = rem1;
        setB = rem2.map(String);
      }
    }
  }

  return {
    labelA,
    labelB,
    setA: setA.length > 0 ? setA : ["2"],
    setB: setB.length > 0 ? setB : ["5"],
    intersection: intersection.length > 0 ? intersection : ["2", "3"],
    title: "مخطط فن للعوامل الأولية",
  };
}
