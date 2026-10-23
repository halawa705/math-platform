/**
 * @file trigonometry-ratios-identities-validator.ts
 * @description المدقق الحتمي للنسب المثلثية الأساسية والمتطابقات (جا²θ + جتا²θ = 1):
 * يتحقق من صحة النسب المثلثية في المثلث القائم وعدم تجاوز جا أو جتا للقيمة 1.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

export const MODULE_ID_TRIGONOMETRY_RATIOS_IDENTITIES_VALIDATOR =
  "trigonometry_ratios_identities_validator" as const;

export function validatePythagoreanTrigIdentity(params: {
  readonly sinValue: number;
  readonly cosValue: number;
}): {
  readonly isIdentityValid: boolean;
  readonly sumOfSquares: number;
  readonly tanValue: number | null;
} {
  const sumSq = Number(
    (params.sinValue * params.sinValue + params.cosValue * params.cosValue).toFixed(4)
  );
  const isValid =
    Math.abs(params.sinValue) <= 1 &&
    Math.abs(params.cosValue) <= 1 &&
    Math.abs(sumSq - 1) < 1e-2;

  const tanVal =
    Math.abs(params.cosValue) > 1e-6
      ? Number((params.sinValue / params.cosValue).toFixed(4))
      : null;

  return {
    isIdentityValid: isValid,
    sumOfSquares: sumSq,
    tanValue: tanVal,
  };
}
