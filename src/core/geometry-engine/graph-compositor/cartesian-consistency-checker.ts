/**
 * @file cartesian-consistency-checker.ts
 * @description فاحص اتساق الرسم البياني للدوال (المرحلة 3.7):
 * - يتحقق أن النقاط المعطاة تقع فعلياً على المنحنى المعلن دون تناقض رياضي.
 * - يتحقق أن نقطة تقاطع مستقيمين تحقق معادلتي المستقيمين معاً.
 * - يتحقق أن مدى المحاور كافٍ لعرض جميع النقاط الحرجة (الرؤوس ونقاط التقاطع).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { CartesianGraphSpec, GraphFunctionSpec } from "@/core/ssot/cartesian-graph-spec-ssot";

export const MODULE_ID_CARTESIAN_CONSISTENCY_CHECKER =
  "cartesian_consistency_checker" as const;

export interface CartesianConsistencyResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export function evaluateFunctionAtX(fn: GraphFunctionSpec, x: number): number {
  if (fn.kind === "linear") return fn.a * x + fn.b;
  if (fn.kind === "quadratic") return fn.a * x * x + fn.b * x + fn.c;
  if (fn.kind === "absolute") return fn.a * Math.abs(x - fn.b) + fn.c;
  if (fn.kind === "horizontal_line") return fn.a;
  return fn.a;
}

export function checkCartesianGraphConsistency(
  spec: CartesianGraphSpec
): CartesianConsistencyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. التحقق من وجود دوال أو نقاط
  if (spec.functions.length === 0 && spec.points.length === 0) {
    errors.push("الرسم البياني فارغ: لا يحتوي على دوال أو نقاط.");
    return { isValid: false, errors, warnings };
  }

  // 2. التحقق من اتساق النقاط مع الدوال
  for (const pt of spec.points) {
    if (pt.label && /(?:تقاطع|intersection)/i.test(pt.label)) {
      // نقطة تقاطع: يجب أن تحقق على الأقل دالتين من الدوال الموجودة
      const satisfyingCount = spec.functions.filter((fn) => {
        if (fn.kind === "vertical_line") return Math.abs(pt.x - fn.a) < 0.05;
        const expectedY = evaluateFunctionAtX(fn, pt.x);
        return Math.abs(pt.y - expectedY) < 0.05;
      }).length;

      if (spec.functions.length >= 2 && satisfyingCount < 2) {
        errors.push(
          `نقطة التقاطع (${pt.x}، ${pt.y}) لا تحقق معادلتي المستقيمين معاً (تناقض رياضي).`
        );
      }
    } else if (pt.label && /(?:تقع|تنتمي|على\s*المنحنى)/i.test(pt.label)) {
      const onCurve = spec.functions.some((fn) => {
        if (fn.kind === "vertical_line") return Math.abs(pt.x - fn.a) < 0.05;
        const expectedY = evaluateFunctionAtX(fn, pt.x);
        return Math.abs(pt.y - expectedY) < 0.05;
      });
      if (!onCurve) {
        errors.push(`النقطة (${pt.x}، ${pt.y}) معلنة على المنحنى ولكنها لا تقع عليه رياضياً.`);
      }
    }
  }

  // 3. التحقق من كفاية المدى للنقاط الحرجة
  for (const pt of spec.points) {
    if (pt.x < spec.xMin || pt.x > spec.xMax || pt.y < spec.yMin || pt.y > spec.yMax) {
      warnings.push(`النقطة (${pt.x}، ${pt.y}) تقع خارج حدود المدى المعروض.`);
    }
  }

  for (const fn of spec.functions) {
    if (fn.vertexPoint) {
      const v = fn.vertexPoint;
      if (v.x < spec.xMin || v.x > spec.xMax || v.y < spec.yMin || v.y > spec.yMax) {
        warnings.push(`رأس المنحنى (${v.x}، ${v.y}) يقع خارج حدود المدى المعروض.`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
