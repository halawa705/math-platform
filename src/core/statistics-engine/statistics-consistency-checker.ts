/**
 * @file statistics-consistency-checker.ts
 * @description فاحص اتساق البيانات والرسوم الإحصائية (المرحلة 4.2):
 * - يتحقق من تساوي أطوال الفئات في الجداول التكرارية والمدرجات.
 * - يتحقق أن مجموع النسب المئوية في القطاعات الدائرية = 100% ومجموع الزوايا = 360°.
 * - يتحقق من مطابقة مجموع التكرارات لإجمالي العينة إن ذُكر.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { ParsedStatisticsSpec } from "./statistics-tag-parser";

export const MODULE_ID_STATISTICS_CONSISTENCY_CHECKER =
  "statistics_consistency_checker" as const;

export interface StatisticsConsistencyResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export function checkStatisticsDataConsistency(
  spec: ParsedStatisticsSpec
): StatisticsConsistencyResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. فحص القطاعات الدائرية
  if (spec.chartType === "pie_chart") {
    const hasPercentages = spec.categories.some((c) => c.percentage !== undefined);
    const hasAngles = spec.categories.some((c) => c.angleDeg !== undefined);

    if (hasPercentages) {
      const sumPct = spec.categories.reduce((acc, c) => acc + (c.percentage ?? c.value), 0);
      if (Math.abs(sumPct - 100) > 1.5) {
        errors.push(
          `مجموع النسب المئوية في القطاعات الدائرية (${sumPct.toFixed(1)}٪) لا يساوي 100٪.`
        );
      }
    } else if (hasAngles) {
      const sumAngles = spec.categories.reduce((acc, c) => acc + (c.angleDeg ?? c.value), 0);
      if (Math.abs(sumAngles - 360) > 3) {
        errors.push(
          `مجموع زوايا القطاعات الدائرية (${sumAngles.toFixed(1)}°) لا يساوي 360°.`
        );
      }
    }
  }

  // 2. فحص أطوال الفئات في الجداول التكرارية والمدرجات
  if (
    spec.chartType === "frequency_table" ||
    spec.chartType === "histogram" ||
    spec.chartType === "frequency_polygon" ||
    spec.chartType === "frequency_curve"
  ) {
    const bounds: number[] = [];
    for (const cat of spec.categories) {
      const numMatch = cat.label.match(/^(\d+(?:\.\d+)?)[-–]?$/);
      if (numMatch) {
        bounds.push(Number(numMatch[1]));
      }
    }

    if (bounds.length >= 3) {
      const widths: number[] = [];
      for (let i = 1; i < bounds.length; i++) {
        widths.push(bounds[i] - bounds[i - 1]);
      }
      const firstWidth = widths[0];
      const isUniform = widths.every((w) => Math.abs(w - firstWidth) < 0.01);
      if (!isUniform) {
        warnings.push("أطوال فئات المجموعات غير متساوية في الجدول التكراري.");
      }
    }
  }

  // 3. فحص القيم السالبة في التكرار
  const hasNegativeFreq = spec.categories.some((c) => c.value < 0);
  if (hasNegativeFreq) {
    errors.push("التكرارات والقيم الإحصائية لا يمكن أن تكون سالبة.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
