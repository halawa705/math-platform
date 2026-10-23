/**
 * @file frequency-polygon-ogive-branch.ts
 * @description فرع منبثق من أصل الإحصاء (`statistics-dataset-root-core.ts`):
 * يبني المضلع التكراري والمنحنى التكراري المتجمع الصاعد والهابط لتعيين الوسيط بيانياً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalStatisticsDatasetIR } from "../ssot/statistics-archetype-ssot";
import { createStatisticsDatasetRootCore } from "./statistics-dataset-root-core";

export const MODULE_ID_FREQUENCY_POLYGON_OGIVE_BRANCH =
  "frequency_polygon_ogive_branch" as const;

export function buildFrequencyPolygonAndOgiveIR(
  datasetId: string
): CanonicalStatisticsDatasetIR {
  return createStatisticsDatasetRootCore({
    datasetId,
    branchId: "stats_ascending_descending_ogive",
    titleArabic: "المنحنى التكراري المتجمع الصاعد والهابط وتعيين الوسيط",
  });
}
