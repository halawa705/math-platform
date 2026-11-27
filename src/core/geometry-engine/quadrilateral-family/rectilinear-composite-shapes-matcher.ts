/**
 * @file rectilinear-composite-shapes-matcher.ts
 * @description مطابق الأشكال المركبة المتعامدة (L، T، T مقلوب، U مقلوب، الدرج) من الوصف العربي الطبيعي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 95 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import { toWesternNumeralsSSOT, type ArabicMathUnit } from "../../ssot/numeral-and-unit-ssot";
import { extractArabicLengthUnit } from "./rectangle-square-perimeter-area-builder";
import {
  buildPolygonFromCoords,
  buildRectilinearAdjacentRectanglesFigure,
  buildRectilinearInvertedTShapeFigure,
  buildRectilinearInvertedUShapeFigure,
  buildRectilinearLShapeFigure,
  buildRectilinearTShapeFigure,
  type RectilinearCompositeOptions,
} from "./rectilinear-composite-orthogonal-builders";
import { parseRectilinearLShapeDescription } from "./rectilinear-l-shape-clause-parser";

export const MODULE_ID_RECTILINEAR_COMPOSITE_SHAPES_MATCHER =
  "rectilinear_composite_shapes_matcher" as const;

function hasStandaloneVar(text: string, ch: string): boolean {
  return new RegExp(`(?<![A-Za-z\\u0621-\\u064A])${ch}(?![A-Za-z\\u0621-\\u064A])`, "i").test(text);
}

/**
 * @deprecated مُحْتَفَظ به مؤقتاً للحذف النهائي بعد المراجعة البشرية (Phase 3/4).
 */
export function legacyPositionalLShapeFallback(
  d: string,
  nums: readonly number[],
  unit: ArabicMathUnit,
  opts: RectilinearCompositeOptions
): CanonicalGeometryFigureIR {
  return buildRectilinearLShapeFigure(
    {
      wTotal: nums[0] ?? 8,
      hTotal: nums[1] ?? 9,
      wTop: hasStandaloneVar(d, "a") || hasStandaloneVar(d, "أ") ? "a" : nums[2] ?? 5,
      hBase: nums[3] ?? 1,
      wStep: nums[4] !== undefined ? nums[4] : undefined,
      hStep: hasStandaloneVar(d, "b") || hasStandaloneVar(d, "ب") ? "b" : nums[5],
      unit,
    },
    opts
  );
}

export function matchRectilinearCompositeFigure(
  description: string,
  opts: RectilinearCompositeOptions
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (/مدرج|تكرار|إحصاء|احصاء|بيانات|مخطط|مستوى\s*إحداثي|[A-Z]{2,4}|دائرة|قوس\s*(?!مجوف)[A-Zأ-ي]|زاويتان\s*متجاورتان|\/\/|⊥/i.test(d)) {
    return undefined;
  }
  const western = toWesternNumeralsSSOT(d);
  const unit = extractArabicLengthUnit(d);
  const rawNums = western.match(/(?<![0-9.])\d+(?:\.\d+)?(?![0-9.])/g);
  const nums = rawNums ? rawNums.map(Number).filter((n) => !Number.isNaN(n) && n > 0 && n !== 90) : [];

  if (/قوس\s*مجوف|حرف\s*U\s*مقلوب|u\s*مقلوب|أرش|arch/i.test(d)) {
    return buildRectilinearInvertedUShapeFigure(
      {
        wTop: nums[0] ?? 10,
        hTotal: nums[1] ?? 8,
        wFoot: nums[2] ?? 4,
        hCavity: nums[3] ?? 3,
        wCavity: hasStandaloneVar(d, "b") || hasStandaloneVar(d, "ب") ? "b" : nums[4] ?? 2,
        hLeft: hasStandaloneVar(d, "a") || hasStandaloneVar(d, "أ") ? "a" : nums[1] ?? 8,
        unit,
      },
      opts
    );
  }

  if (/متلاصق|ملتصق|(?:مستطيلين|مربعين)\s*متجاورين|مستطيلان|مربع\s*ومستطيل|(?:تركيب|دمج|إلصاق)\s*(?:شكلين|مستطيلين|مربعين|مربع[\s\S]{0,30}مستطيل|مستطيل[\s\S]{0,30}مربع)|(?:تم\s*تقسيمه|مقسم|مكون|يتكون)\s*(?:إلى|من)\s*(?:مستطيلين|مربع\s*ومستطيل|شكلين)|(?<![أ-ي])(?:ال)?درج(?![أ-ي])/i.test(d)) {
    const squareBeforeRect = /مربع[\s\S]{0,30}مستطيل/i.test(d) && nums.length === 3;
    const rectBeforeSquare = /مستطيل[\s\S]{0,30}مربع/i.test(d) && nums.length === 3;
    const w1 = nums[0] ?? 5;
    const h1 = squareBeforeRect ? (nums[0] ?? 5) : (nums[1] ?? 5);
    const w2 = squareBeforeRect ? (nums[1] ?? 3) : (nums[2] ?? 3);
    const h2 = squareBeforeRect || rectBeforeSquare ? (nums[2] ?? 3) : (nums[3] ?? 3);
    return buildRectilinearAdjacentRectanglesFigure({ w1, h1, w2, h2, unit }, opts);
  }

  if (/T\s*مقلوب|t\s*مقلوب|برج\s*أوسط|قاعدة\s*وعمود/i.test(d)) {
    return buildRectilinearInvertedTShapeFigure(
      { wBase: nums[0] ?? 10, hBase: nums[1] ?? 2, wCol: nums[2] ?? 2, hCol: nums[3] ?? 3, wStep: nums[4] ?? 4, unit },
      opts
    );
  }

  if (/حرف\s*T|حرف\s*t|شكل\s*T|شكل\s*t/i.test(d)) {
    return buildRectilinearTShapeFigure(
      {
        wTop: nums[0] ?? 11,
        hTop: hasStandaloneVar(d, "a") || hasStandaloneVar(d, "أ") ? "a" : nums[1] ?? 2,
        wStem: nums[2] ?? 5,
        hStem: hasStandaloneVar(d, "c") || hasStandaloneVar(d, "ج") ? "c" : nums[3] ?? 5,
        wLeftArm: hasStandaloneVar(d, "b") || hasStandaloneVar(d, "ب") ? "b" : nums[4] ?? 3,
        wRightArm: nums[5] ?? nums[4] ?? 3,
        unit,
      },
      opts
    );
  }

  if (/حرف\s*L|حرف\s*l|شكل\s*L|شكل\s*l|مقتطع|مستطيل\s*مركب|شكل\s*مركب/i.test(d)) {
    const directionalL = parseRectilinearLShapeDescription(d, unit);
    if (directionalL) {
      return buildPolygonFromCoords(
        directionalL.coords,
        directionalL.labels,
        unit,
        opts,
        directionalL.titleSummary,
        "dl"
      );
    }
    return legacyPositionalLShapeFallback(d, nums, unit, opts);
  }

  return undefined;
}
