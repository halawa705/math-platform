/**
 * @file pie-sector-chart-branch.ts
 * @description فرع منبثق من أصل الإحصاء (`statistics-dataset-root-core.ts`):
 * يبني التمثيل البياني بالقطاعات الدائرية وحساب قياس الزاوية المركزية لكل قطاع بالدرجات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalStatisticsDatasetIR } from "../ssot/statistics-archetype-ssot";
import { createStatisticsDatasetRootCore } from "./statistics-dataset-root-core";

export const MODULE_ID_PIE_SECTOR_CHART_BRANCH =
  "pie_sector_chart_branch" as const;

export function buildPieCircularSectorsChartIR(
  datasetId: string
): CanonicalStatisticsDatasetIR {
  return createStatisticsDatasetRootCore({
    datasetId,
    branchId: "stats_pie_circular_sectors",
    titleArabic: "التمثيل البياني بالقطاعات الدائرية والزوايا المركزية",
  });
}
