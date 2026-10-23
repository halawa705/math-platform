/**
 * @file real-intervals-operations-validator.ts
 * @description المدقق الحتمي للفترات الحقيقية والعمليات عليها (الاتحاد ∪، التقاطع ∩، الفرق -):
 * يتحقق من ترتيب حدي الفترة (الحد الأصغر يميناً في العربية والحد الأكبر يساراً) وصحة انتماء عنصر للفترة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

export const MODULE_ID_REAL_INTERVALS_OPERATIONS_VALIDATOR =
  "real_intervals_operations_validator" as const;

export interface RealIntervalBounds {
  readonly lower: number;
  readonly upper: number;
  readonly isLowerClosed: boolean;
  readonly isUpperClosed: boolean;
}

export function isPointInsideRealInterval(
  x: number,
  interval: RealIntervalBounds
): boolean {
  const aboveLower = interval.isLowerClosed
    ? x >= interval.lower
    : x > interval.lower;
  const belowUpper = interval.isUpperClosed
    ? x <= interval.upper
    : x < interval.upper;
  return aboveLower && belowUpper;
}

export function validateIntervalBoundsOrder(interval: RealIntervalBounds): {
  readonly isValidOrder: boolean;
  readonly correctedInterval: RealIntervalBounds;
} {
  if (interval.lower <= interval.upper) {
    return { isValidOrder: true, correctedInterval: interval };
  }
  return {
    isValidOrder: false,
    correctedInterval: {
      lower: interval.upper,
      upper: interval.lower,
      isLowerClosed: interval.isUpperClosed,
      isUpperClosed: interval.isLowerClosed,
    },
  };
}
