/**
 * @file boxplot-scatter-normal-branch.ts
 * @description فرع منبثق من أصل الإحصاء (`statistics-dataset-root-core.ts`):
 * يبني مخطط الصندوق والربيعيات، شكل الانتشار وخط الانحدار، ومنحنى التوزيع الطبيعي المعياري.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalStatisticsDatasetIR } from "../ssot/statistics-archetype-ssot";
import { createStatisticsDatasetRootCore } from "./statistics-dataset-root-core";

export const MODULE_ID_BOXPLOT_SCATTER_NORMAL_BRANCH =
  "boxplot_scatter_normal_branch" as const;

export function buildBoxplotAndNormalCurveIR(
  datasetId: string
): CanonicalStatisticsDatasetIR {
  return createStatisticsDatasetRootCore({
    datasetId,
    branchId: "stats_normal_bell_curve",
    titleArabic: "منحنى التوزيع الطبيعي المعياري ومخطط الصندوق والربيعيات",
  });
}
