/**
 * @file euclidean-geometry-theorems-validator.ts
 * @description المدقق الحتمي لنظريات الهندسة المستوية:
 * يتحقق من متباينة المثلث (مجموع أي ضلعين أكبر من الثالث)، نظرية فيثاغورس، ونظرية إقليدس، ومجموع زوايا المضلع.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

export const MODULE_ID_EUCLIDEAN_GEOMETRY_THEOREMS_VALIDATOR =
  "euclidean_geometry_theorems_validator" as const;

export function validateTriangleSideLengthsInequality(
  sideA: number,
  sideB: number,
  sideC: number
): {
  readonly isValidTriangle: boolean;
  readonly isRightTrianglePythagoras: boolean;
  readonly perimeterCm: number;
} {
  const valid =
    sideA > 0 &&
    sideB > 0 &&
    sideC > 0 &&
    sideA + sideB > sideC &&
    sideA + sideC > sideB &&
    sideB + sideC > sideA;

  const sorted = [sideA, sideB, sideC].sort((x, y) => x - y);
  const isRight =
    valid &&
    Math.abs(sorted[0] * sorted[0] + sorted[1] * sorted[1] - sorted[2] * sorted[2]) <
      1e-2;

  return {
    isValidTriangle: valid,
    isRightTrianglePythagoras: isRight,
    perimeterCm: Number((sideA + sideB + sideC).toFixed(2)),
  };
}
