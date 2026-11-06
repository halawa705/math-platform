/**
 * @file primary-grade4-composite-shapes-builder.ts
 * @description محلل ومطابق الأشكال المركبة (Composite / Rectilinear Figures) للصف الرابع الابتدائي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import { toWesternNumeralsSSOT } from "../../../../ssot/numeral-and-unit-ssot";
import { extractGrade4Unit } from "./primary-grade4-perimeter-area-builder";
import {
  buildGrade4AdjacentRectanglesFigure,
  buildGrade4InvertedTShapeFigure,
  buildGrade4InvertedUShapeFigure,
  buildGrade4LShapeFigure,
  buildGrade4TShapeFigure,
  type Grade4CompositeShapesOptions,
} from "./primary-grade4-composite-orthogonal-builders";

export const MODULE_ID_PRIMARY_GRADE4_COMPOSITE_SHAPES_BUILDER =
  "primary_grade4_composite_shapes_builder" as const;

export {
  buildGrade4AdjacentRectanglesFigure,
  buildGrade4InvertedTShapeFigure,
  buildGrade4InvertedUShapeFigure,
  buildGrade4LShapeFigure,
  buildGrade4TShapeFigure,
  type Grade4CompositeShapesOptions,
} from "./primary-grade4-composite-orthogonal-builders";

/**
 * يطابق ويبني الأشكال المركبة من الوصف العربي الطبيعي
 */
export function matchGrade4CompositeFigure(
  description: string,
  opts: Grade4CompositeShapesOptions
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (/مدرج|تكرار|إحصاء|احصاء|بيانات|مخطط/i.test(d)) return undefined;
  const western = toWesternNumeralsSSOT(d);
  const unit = extractGrade4Unit(d);

  // استخراج الأرقام الواردة
  const rawNums = western.match(/(?<![0-9.])\d+(?:\.\d+)?(?![0-9.])/g);
  const nums = rawNums ? rawNums.map(Number).filter((n) => !Number.isNaN(n) && n > 0 && n !== 90) : [];

  // 1. قوس مجوف U مقلوب
  if (/قوس|مجوف|حرف\s*U\s*مقلوب|u\s*مقلوب|أرش|arch/i.test(d)) {
    const wTop = nums[0] ?? 10;
    const hTotal = nums[1] ?? 8;
    const wFoot = nums[2] ?? 4;
    const hCavity = nums[3] ?? 3;
    const wCavity = /[bBب]/.test(d) ? "b" : nums[4] ?? 2;
    const hLeft = /[aAأ]/.test(d) ? "a" : hTotal;
    return buildGrade4InvertedUShapeFigure(
      { wTop, hTotal, wFoot, hCavity, wCavity, hLeft, unit },
      opts
    );
  }

  // 2. مستطيلان ملتصقان / شكل الدرج
  if (/ملتصق|متجاور|مستطيلان|مربع\s*ومستطيل|درج/i.test(d)) {
    const w1 = nums[0] ?? 5;
    const h1 = nums[1] ?? 5;
    const w2 = nums[2] ?? 3;
    const h2 = nums[3] ?? 3;
    return buildGrade4AdjacentRectanglesFigure({ w1, h1, w2, h2, unit }, opts);
  }

  // 3. شكل حرف T مقلوب
  if (/T\s*مقلوب|t\s*مقلوب|برج\s*أوسط|قاعدة\s*وعمود/i.test(d)) {
    const wBase = nums[0] ?? 10;
    const hBase = nums[1] ?? 2;
    const wCol = nums[2] ?? 2;
    const hCol = nums[3] ?? 3;
    const wStep = nums[4] ?? 4;
    return buildGrade4InvertedTShapeFigure({ wBase, hBase, wCol, hCol, wStep, unit }, opts);
  }

  // 4. شكل حرف T
  if (/حرف\s*T|حرف\s*t|شكل\s*T|شكل\s*t/i.test(d)) {
    const wTop = nums[0] ?? 11;
    const hTop = /[aAأ]/.test(d) ? "a" : nums[1] ?? 2;
    const wStem = nums[2] ?? 5;
    const hStem = /[cCج]/.test(d) ? "c" : nums[3] ?? 5;
    const wLeftArm = /[bBب]/.test(d) ? "b" : nums[4] ?? 3;
    const wRightArm = nums[5] ?? 3;
    return buildGrade4TShapeFigure({ wTop, hTop, wStem, hStem, wLeftArm, wRightArm, unit }, opts);
  }

  // 5. شكل حرف L أو مستطيل مقتطع الزاوية
  if (/حرف\s*L|حرف\s*l|شكل\s*L|شكل\s*l|مقتطع|مركب/i.test(d)) {
    const wTotal = nums[0] ?? 8;
    const hTotal = nums[1] ?? 9;
    const wTop = /[aAأ]/.test(d) ? "a" : nums[2] ?? 5;
    const hBase = nums[3] ?? 1;
    const wStep = nums[4] ?? 3;
    const hStep = /[bBب]/.test(d) ? "b" : nums[5] ?? 8;
    return buildGrade4LShapeFigure({ wTotal, hTotal, wTop, hBase, wStep, hStep, unit }, opts);
  }

  return undefined;
}
