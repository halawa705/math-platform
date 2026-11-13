/**
 * @file flow-layout-quality-audit.ts
 * @description مدقق جودة التوزيع (للاختبارات والتشخيص): لكل صفحة يحسب نسبة الامتلاء (بعد التمديد) والامتلاء الخام (قبل أي تمديد
 * للبطاقات أو الفراغات = المحتوى الحقيقي)، والفراغ السفلي وعدم تساوي الأعمدة والفيض، فيُثبت بالأرقام بدل الانطباع البصري.
 */

import { stackHeightPx } from "./flow-column-balance-solver";
import type { FlowItem, FlowPage } from "./flow-item-model";
import { isPageBelowOccupancyTarget } from "../ssot/page-occupancy-target-ssot";

export const MODULE_ID_FLOW_LAYOUT_QUALITY_AUDIT = "flow_layout_quality_audit" as const;

const RAW_GAP_PX = 2;

export interface FlowPageAuditRow {
  readonly pageNumber: number;
  readonly fillRatio: number;
  /** الامتلاء الحقيقي بالمحتوى المقيس فقط (بدون تمديد بطاقات وبأدنى مسافات). */
  readonly rawFillRatio: number;
  readonly belowOccupancyTarget: boolean;
  readonly bottomSlackPx: number;
  readonly worstColumnImbalancePx: number;
  readonly overflowsBudget: boolean;
}

export function auditFlowPages(
  pages: readonly FlowPage[],
  heights: ReadonlyMap<string, number>
): readonly FlowPageAuditRow[] {
  return pages.map((page, pageIdx) => {
    const heightOf = (item: FlowItem) => page.targetHeightPxById[item.id] ?? heights.get(item.id) ?? 0;
    const rawHeightOf = (item: FlowItem) => heights.get(item.id) ?? 0;
    let worst = 0;
    const segmentHeights = page.segments.map((segment) => {
      if (segment.kind === "full") return page.targetHeightPxById[segment.item.id] ?? segment.heightPx;
      const right = stackHeightPx(segment.rightItems.map(heightOf), page.gapPx);
      const left = stackHeightPx(segment.leftItems.map(heightOf), page.gapPx);
      worst = Math.max(worst, Math.abs(right - left));
      return Math.max(right, left);
    });
    const rawSegmentHeights = page.segments.map((segment) => {
      if (segment.kind === "full") return segment.heightPx;
      return Math.max(
        stackHeightPx(segment.rightItems.map(rawHeightOf), RAW_GAP_PX),
        stackHeightPx(segment.leftItems.map(rawHeightOf), RAW_GAP_PX)
      );
    });
    const used = stackHeightPx(segmentHeights, page.gapPx);
    const rawUsed = stackHeightPx(rawSegmentHeights, RAW_GAP_PX);
    const rawFillRatio = rawUsed / page.budgetHeightPx;
    return {
      pageNumber: page.pageNumber,
      fillRatio: used / page.budgetHeightPx,
      rawFillRatio,
      belowOccupancyTarget: isPageBelowOccupancyTarget(rawFillRatio, pageIdx === pages.length - 1),
      bottomSlackPx: Math.round(page.budgetHeightPx - used),
      worstColumnImbalancePx: Math.round(worst),
      overflowsBudget: used > page.budgetHeightPx + 1,
    };
  });
}
