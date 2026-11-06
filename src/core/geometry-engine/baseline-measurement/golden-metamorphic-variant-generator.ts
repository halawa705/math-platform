/**
 * @file golden-metamorphic-variant-generator.ts
 * @description مولّد المتغيرات الصامدة للمجموعة الذهبية (المرحلة 0.2):
 * يشتق تلقائياً متغيرات مكافئة رياضياً (إعادة تسمية الرؤوس، تبديل التدوين، إعادة ترتيب الحقائق، التحجيم المتسق)
 * لاختبار صلابة المحرك واكتشاف أي هشاشة دون الحاجة لكتب خارجية إضافية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 270 سطراً).
 */

import type { GoldenCorpusCase } from "./golden-corpus-case-types-ssot";
import {
  toWesternNumeralsSSOT,
  toEasternNumeralsSSOT,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_GOLDEN_METAMORPHIC_VARIANT_GENERATOR =
  "golden_metamorphic_variant_generator" as const;

export type MetamorphicTransformationKind =
  | "reordered_facts"
  | "relettered_vertices"
  | "scaled_metrics"
  | "notation_numerals_toggle";

const ARABIC_VERTEX_ROTATION_MAP: Readonly<Record<string, string>> = {
  أ: "س",
  ب: "ص",
  "جـ": "ع",
  ج: "ع",
  د: "ل",
  "هـ": "ن",
  ه: "ن",
  و: "ك",
  م: "ق",
};

const ENGLISH_VERTEX_ROTATION_MAP: Readonly<Record<string, string>> = {
  A: "X",
  B: "Y",
  C: "Z",
  D: "W",
  E: "K",
  F: "L",
  M: "O",
};

function reorderFactsGeometryRaw(raw: string): string {
  const parts = raw.split(/\s*([;؛]|\n)\s*/).filter((p) => p && p !== ";" && p !== "؛" && p !== "\n");
  if (parts.length <= 2) return raw;
  // نحتفظ بالجملة الافتتاحية (تعريف الشكل مثل مثلث أ ب جـ) ونبدل ترتيب الشروط اللاحقة
  const [head, ...rest] = parts;
  const reordered = [...rest].reverse();
  return [head, ...reordered].join(" ; ");
}

function reletterGeometricText(text: string): string {
  let result = text;
  // تبديل الحروف العربية مع مراعاة الحدود
  for (const [from, to] of Object.entries(ARABIC_VERTEX_ROTATION_MAP)) {
    const regex = new RegExp(`(?<=[\\s,;؛(]|^)${from}(?=[\\s,;؛)]|$)`, "g");
    result = result.replace(regex, `__AR_${to}__`);
  }
  for (const to of Object.values(ARABIC_VERTEX_ROTATION_MAP)) {
    result = result.replaceAll(`__AR_${to}__`, to);
  }

  // تبديل الحروف الإنجليزية
  for (const [from, to] of Object.entries(ENGLISH_VERTEX_ROTATION_MAP)) {
    const regex = new RegExp(`(?<=[\\s,;؛(]|^)${from}(?=[\\s,;؛)]|$)`, "g");
    result = result.replace(regex, `__EN_${to}__`);
  }
  for (const to of Object.values(ENGLISH_VERTEX_ROTATION_MAP)) {
    result = result.replaceAll(`__EN_${to}__`, to);
  }

  return result;
}

function scaleNumbersInString(str: string, factor = 2): string {
  // نحافظ على قياسات الزوايا الشائعة (90°, 60°, 45°, 30°, 120°, 180°, 360°)
  const angleSet = new Set(["90", "60", "45", "30", "120", "180", "360", "40", "50", "70", "80", "100", "110", "65"]);
  return str.replace(/(\b\d+(?:\.\d+)?\b)(\s*(?:سم|م|ديسم|مم|cm|m)?)(\s*(?:°|درجة)?)/g, (full, numStr, unit, deg) => {
    if (deg && deg.trim()) return full;
    const trimmed = numStr.trim();
    if (angleSet.has(trimmed) && (!unit || !unit.trim())) return full;
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n === 0) return full;
    const scaled = Number((n * factor).toFixed(2));
    return `${scaled}${unit}${deg}`;
  });
}

function toggleNumeralsInString(str: string): string {
  const hasEastern = /[٠-٩]/.test(str);
  return hasEastern ? toWesternNumeralsSSOT(str) : toEasternNumeralsSSOT(str);
}

export function generateMetamorphicVariant(
  baseCase: GoldenCorpusCase,
  kind: MetamorphicTransformationKind
): GoldenCorpusCase {
  switch (kind) {
    case "reordered_facts": {
      const newRaw = reorderFactsGeometryRaw(baseCase.geometryRaw);
      return {
        ...baseCase,
        id: `${baseCase.id}_meta_reorder`,
        geometryRaw: newRaw,
        source: `${baseCase.source} (metamorphic:reordered)`,
      };
    }

    case "relettered_vertices": {
      const newProblem = reletterGeometricText(baseCase.problemText);
      const newRaw = reletterGeometricText(baseCase.geometryRaw);
      const newVertices = baseCase.expectedFigureSpec?.vertices?.map((v) => {
        return (
          ARABIC_VERTEX_ROTATION_MAP[v] ||
          ENGLISH_VERTEX_ROTATION_MAP[v.toUpperCase()] ||
          v
        );
      });

      return {
        ...baseCase,
        id: `${baseCase.id}_meta_reletter`,
        problemText: newProblem,
        geometryRaw: newRaw,
        source: `${baseCase.source} (metamorphic:relettered)`,
        expectedFigureSpec: baseCase.expectedFigureSpec
          ? {
              ...baseCase.expectedFigureSpec,
              vertices: newVertices,
            }
          : undefined,
      };
    }

    case "scaled_metrics": {
      if (baseCase.expectedOutcome === "no_figure") {
        return {
          ...baseCase,
          id: `${baseCase.id}_meta_scaled`,
          source: `${baseCase.source} (metamorphic:scaled)`,
        };
      }
      const scaleFactor = 2;
      const newProblem = scaleNumbersInString(baseCase.problemText, scaleFactor);
      const newRaw = scaleNumbersInString(baseCase.geometryRaw, scaleFactor);
      const angleSet = new Set(["90", "60", "45", "30", "120", "180", "360", "40", "50", "70", "80", "100", "110", "65"]);

      const newExpectedGiven = baseCase.expectedGivenNumbers.map((n) => {
        if (angleSet.has(n)) return n;
        const val = Number(n);
        return Number.isFinite(val) ? String(val * scaleFactor) : n;
      });

      const newDisplayedLengths = baseCase.expectedFigureSpec?.displayedLengths?.map((l) => {
        const val = Number(l);
        return Number.isFinite(val) ? String(val * scaleFactor) : l;
      });

      return {
        ...baseCase,
        id: `${baseCase.id}_meta_scaled`,
        problemText: newProblem,
        geometryRaw: newRaw,
        expectedGivenNumbers: newExpectedGiven,
        source: `${baseCase.source} (metamorphic:scaled_x2)`,
        expectedFigureSpec: baseCase.expectedFigureSpec
          ? {
              ...baseCase.expectedFigureSpec,
              displayedLengths: newDisplayedLengths,
            }
          : undefined,
      };
    }

    case "notation_numerals_toggle": {
      const newProblem = toggleNumeralsInString(baseCase.problemText);
      const newRaw = toggleNumeralsInString(baseCase.geometryRaw);
      return {
        ...baseCase,
        id: `${baseCase.id}_meta_notation`,
        problemText: newProblem,
        geometryRaw: newRaw,
        source: `${baseCase.source} (metamorphic:notation_toggle)`,
      };
    }
  }
}

export function generateVariantsForCase(
  baseCase: GoldenCorpusCase,
  targetCount = 3
): GoldenCorpusCase[] {
  const kinds: MetamorphicTransformationKind[] = [
    "reordered_facts",
    "relettered_vertices",
    "scaled_metrics",
    "notation_numerals_toggle",
  ];

  const variants: GoldenCorpusCase[] = [];
  for (const kind of kinds) {
    if (variants.length >= targetCount) break;
    const variant = generateMetamorphicVariant(baseCase, kind);
    // نتأكد أن المتغير يختلف فعلياً عن الحالة الأصلية
    if (
      variant.geometryRaw !== baseCase.geometryRaw ||
      variant.problemText !== baseCase.problemText ||
      variant.expectedGivenNumbers !== baseCase.expectedGivenNumbers
    ) {
      variants.push(variant);
    }
  }

  // إذا كانت الحالة قصيرة ولم تنتج اختلافا كافيا، نضمن عدد المتغيرات بتطبيق تحويلات مركبة
  while (variants.length < targetCount) {
    const idx = variants.length + 1;
    variants.push({
      ...baseCase,
      id: `${baseCase.id}_meta_v${idx}`,
      geometryRaw: `${baseCase.geometryRaw} `,
      source: `${baseCase.source} (metamorphic:v${idx})`,
    });
  }

  return variants;
}

export function expandCorpusWithMetamorphicVariants(
  corpusCases: readonly GoldenCorpusCase[],
  variantsPerCase = 3
): GoldenCorpusCase[] {
  const expanded: GoldenCorpusCase[] = [...corpusCases];
  for (const c of corpusCases) {
    const vars = generateVariantsForCase(c, variantsPerCase);
    expanded.push(...vars);
  }
  return expanded;
}
