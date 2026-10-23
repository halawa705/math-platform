/**
 * @file statistics-metrics-validator.ts
 * @description المدقق الحتمي لمقاييس الإحصاء والاحتمالات:
 * يتحقق من أن مجموع زوايا القطاعات الدائرية = 360 درجة، وأن أي احتمال يقع في الفترة [0، 1].
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

export const MODULE_ID_STATISTICS_METRICS_VALIDATOR =
  "statistics_metrics_validator" as const;

export function validatePieSectorsAndProbability(params: {
  readonly sectorAnglesDegrees?: readonly number[];
  readonly probabilityValue?: number;
}): {
  readonly isSectorsSum360: boolean;
  readonly isProbabilityInRangeZeroToOne: boolean;
} {
  const sumAngles = (params.sectorAnglesDegrees || []).reduce(
    (acc, a) => acc + a,
    0
  );
  const isSectorsValid =
    !params.sectorAnglesDegrees ||
    params.sectorAnglesDegrees.length === 0 ||
    Math.abs(sumAngles - 360) <= 1;

  const prob = params.probabilityValue ?? 0.5;
  const isProbValid = prob >= 0 && prob <= 1;

  return {
    isSectorsSum360: isSectorsValid,
    isProbabilityInRangeZeroToOne: isProbValid,
  };
}
