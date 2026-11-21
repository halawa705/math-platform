/**
 * @file rectilinear-composite-shapes-matcher.ts
 * @description مطابق الأشكال المركبة المتعامدة (L، T، T مقلوب، U مقلوب، الدرج) من الوصف العربي الطبيعي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 95 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import { toWesternNumeralsSSOT } from "../../ssot/numeral-and-unit-ssot";
import { extractArabicLengthUnit } from "./rectangle-square-perimeter-area-builder";
import {
  buildRectilinearAdjacentRectanglesFigure,
  buildRectilinearInvertedTShapeFigure,
  buildRectilinearInvertedUShapeFigure,
  buildRectilinearLShapeFigure,
  buildRectilinearTShapeFigure,
  type RectilinearCompositeOptions,
} from "./rectilinear-composite-orthogonal-builders";

export const MODULE_ID_RECTILINEAR_COMPOSITE_SHAPES_MATCHER =
  "rectilinear_composite_shapes_matcher" as const;

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
        wCavity: /[bBب]/.test(d) ? "b" : nums[4] ?? 2,
        hLeft: /[aAأ]/.test(d) ? "a" : nums[1] ?? 8,
        unit,
      },
      opts
    );
  }

  if (/متلاصق|ملتصق|(?:مستطيلين|مربعين)\s*متجاورين|مستطيلان|مربع\s*ومستطيل|(?<![أ-ي])(?:ال)?درج(?![أ-ي])/i.test(d)) {
    return buildRectilinearAdjacentRectanglesFigure(
      { w1: nums[0] ?? 5, h1: nums[1] ?? 5, w2: nums[2] ?? 3, h2: nums[3] ?? 3, unit },
      opts
    );
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
        hTop: /[aAأ]/.test(d) ? "a" : nums[1] ?? 2,
        wStem: nums[2] ?? 5,
        hStem: /[cCج]/.test(d) ? "c" : nums[3] ?? 5,
        wLeftArm: /[bBب]/.test(d) ? "b" : nums[4] ?? 3,
        wRightArm: nums[5] ?? 3,
        unit,
      },
      opts
    );
  }

  if (/حرف\s*L|حرف\s*l|شكل\s*L|شكل\s*l|مقتطع|مستطيل\s*مركب|شكل\s*مركب/i.test(d)) {
    return buildRectilinearLShapeFigure(
      {
        wTotal: nums[0] ?? 8,
        hTotal: nums[1] ?? 9,
        wTop: /[aAأ]/.test(d) ? "a" : nums[2] ?? 5,
        hBase: nums[3] ?? 1,
        wStep: nums[4] ?? 3,
        hStep: /[bBب]/.test(d) ? "b" : nums[5] ?? 8,
        unit,
      },
      opts
    );
  }

  return undefined;
}
