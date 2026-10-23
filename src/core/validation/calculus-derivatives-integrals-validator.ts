/**
 * @file calculus-derivatives-integrals-validator.ts
 * @description المدقق الحتمي لحساب التفاضل والتكامل:
 * يحسب مشتقة كثيرات الحدود د'(س) وقيمة ميل المماس عند نقطة س = أ للتحقق من النواتج.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { MathPolynomialTerm } from "../ir/math-ast-expression-ir";

export const MODULE_ID_CALCULUS_DERIVATIVES_INTEGRALS_VALIDATOR =
  "calculus_derivatives_integrals_validator" as const;

export function evaluatePolynomialDerivativeAtPoint(
  terms: readonly MathPolynomialTerm[],
  xValue: number
): {
  readonly derivativeTerms: readonly MathPolynomialTerm[];
  readonly slopeAtPoint: number;
} {
  const derivativeTerms: MathPolynomialTerm[] = terms
    .filter((t) => t.power > 0)
    .map((t) => ({
      coefficient: t.coefficient * t.power,
      variableSymbol: t.variableSymbol,
      power: t.power - 1,
    }));

  const slope = derivativeTerms.reduce(
    (acc, t) => acc + t.coefficient * Math.pow(xValue, t.power),
    0
  );

  return {
    derivativeTerms,
    slopeAtPoint: Number(slope.toFixed(3)),
  };
}
