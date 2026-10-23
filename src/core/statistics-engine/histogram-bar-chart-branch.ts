/**
 * @file histogram-bar-chart-branch.ts
 * @description فرع منبثق من أصل الإحصاء (`statistics-dataset-root-core.ts`):
 * يبني المدرج التكراري والأعمدة البيانية المتلاصقة لإيجاد الدرجة المنوالية بيانياً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalStatisticsDatasetIR } from "../ssot/statistics-archetype-ssot";
import { createStatisticsDatasetRootCore } from "./statistics-dataset-root-core";

export const MODULE_ID_HISTOGRAM_BAR_CHART_BRANCH =
  "histogram_bar_chart_branch" as const;

export function buildHistogramColumnsChartIR(
  datasetId: string
): CanonicalStatisticsDatasetIR {
  return createStatisticsDatasetRootCore({
    datasetId,
    branchId: "stats_histogram_columns",
    titleArabic: "المدرج التكراري وتعيين القيمة المنوالية بيانياً",
  });
}
