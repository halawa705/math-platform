/**
 * @file frequency-distribution-table-branch.ts
 * @description فرع منبثق من أصل الإحصاء (`statistics-dataset-root-core.ts`):
 * يبني الجدول التكراري ذي المجموعات ومراكز الفئات (م × ك) لحساب الوسط والانحراف المعياري.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalStatisticsDatasetIR } from "../ssot/statistics-archetype-ssot";
import { createStatisticsDatasetRootCore } from "./statistics-dataset-root-core";

export const MODULE_ID_FREQUENCY_DISTRIBUTION_TABLE_BRANCH =
  "frequency_distribution_table_branch" as const;

export function buildFrequencyDistributionTableIR(
  datasetId: string
): CanonicalStatisticsDatasetIR {
  return createStatisticsDatasetRootCore({
    datasetId,
    branchId: "stats_frequency_distribution_table",
    titleArabic: "الجدول التكراري ذو المجموعات وحساب الوسط الحسابي والانحراف المعياري",
  });
}
