/**
 * @file flow-elastic-fit-resolver.ts
 * @description محلل المرونة الحقيقية للمسافات البينية للصفحات (Real Gap Elasticity):
 * يحسب فقط الوفورات الفعلية القابلة للتطبيق في الـ DOM عبر تقليص المسافات البينية بين المقاطع
 * حتى `minSafeGapPx = 2px` دون أي امتصاص وهمي، لضمان عدم فيض الصفحة أو قصّ تذييلها مطلقاً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import type { FlowPageSegment } from "./flow-item-model";

export const MODULE_ID_FLOW_ELASTIC_FIT_RESOLVER = "flow_elastic_fit_resolver" as const;

/** أقل مسافة آمنة بين المقاطع في المرونة الحقيقية (تُطبَّق فعلياً في موزع الفراغ). */
export const MIN_SAFE_ELASTIC_GAP_PX = 2;

export interface ElasticFitResult {
  readonly fits: boolean;
  readonly absorbedPx: number;
  readonly adjustedGapPx: number;
  readonly totalElasticCapacityPx: number;
}

/**
 * يفحص قابلية مقطع الصفحة لامتصاص فائض يسير عبر تقليص المسافات البينية الفعلي فقط.
 */
export function resolveElasticPageFit(params: {
  readonly segments: readonly FlowPageSegment[];
  readonly usedHeightPx: number;
  readonly budgetPx: number;
  readonly gapPx: number;
}): ElasticFitResult {
  const { segments, usedHeightPx, budgetPx, gapPx } = params;

  if (usedHeightPx <= budgetPx) {
    return {
      fits: true,
      absorbedPx: 0,
      adjustedGapPx: gapPx,
      totalElasticCapacityPx: 0,
    };
  }

  const overflowPx = usedHeightPx - budgetPx;
  const gapsCount = Math.max(0, segments.length - 1);
  const gapSavings = gapsCount * Math.max(0, gapPx - MIN_SAFE_ELASTIC_GAP_PX);

  if (overflowPx <= gapSavings) {
    const gapDeduction = gapsCount > 0 ? Math.min(gapPx - MIN_SAFE_ELASTIC_GAP_PX, Math.ceil(overflowPx / gapsCount)) : 0;
    const adjustedGapPx = Math.max(MIN_SAFE_ELASTIC_GAP_PX, gapPx - gapDeduction);

    return {
      fits: true,
      absorbedPx: overflowPx,
      adjustedGapPx,
      totalElasticCapacityPx: gapSavings,
    };
  }

  return {
    fits: false,
    absorbedPx: 0,
    adjustedGapPx: gapPx,
    totalElasticCapacityPx: gapSavings,
  };
}
