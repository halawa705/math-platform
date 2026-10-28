/**
 * @file flow-layout-quality-audit.ts
 * @description مدقق جودة التوزيع (للاختبارات والتشخيص): لكل صفحة يحسب نسبة الامتلاء والفراغ السفلي وعدم تساوي الأعمدة والفيض،
 * فيُثبت بالأرقام أن الصفحات ممتلئة وأن العمودين متساويان بدل الاعتماد على الانطباع البصري.
 */

import { stackHeightPx } from "./flow-column-balance-solver";
import type { FlowItem, FlowPage } from "./flow-item-model";

export const MODULE_ID_FLOW_LAYOUT_QUALITY_AUDIT = "flow_layout_quality_audit" as const;

export interface FlowPageAuditRow {
  readonly pageNumber: number;
  readonly fillRatio: number;
  readonly bottomSlackPx: number;
  readonly worstColumnImbalancePx: number;
  readonly overflowsBudget: boolean;
}

export function auditFlowPages(
  pages: readonly FlowPage[],
  heights: ReadonlyMap<string, number>
): readonly FlowPageAuditRow[] {
  return pages.map((page) => {
    const heightOf = (item: FlowItem) => page.targetHeightPxById[item.id] ?? heights.get(item.id) ?? 0;
    let worst = 0;
    const segmentHeights = page.segments.map((segment) => {
      if (segment.kind === "full") return page.targetHeightPxById[segment.item.id] ?? segment.heightPx;
      const right = stackHeightPx(segment.rightItems.map(heightOf), page.gapPx);
      const left = stackHeightPx(segment.leftItems.map(heightOf), page.gapPx);
      worst = Math.max(worst, Math.abs(right - left));
      return Math.max(right, left);
    });
    const used = stackHeightPx(segmentHeights, page.gapPx);
    return {
      pageNumber: page.pageNumber,
      fillRatio: used / page.budgetHeightPx,
      bottomSlackPx: Math.round(page.budgetHeightPx - used),
      worstColumnImbalancePx: Math.round(worst),
      overflowsBudget: used > page.budgetHeightPx + 1,
    };
  });
}
