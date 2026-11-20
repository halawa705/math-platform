/**
 * @file flow-page-area-waste-meter.ts
 * @description مقياس الفراغ المهدور بالمساحة كما تراه العين: الفراغ السفلي + الفراغ داخل كل عمود أقصر من شقيقه
 * (بعد خصم ما يمتصه تمديد بطاقاته). العمود الفارغ بعرض نصف الصفحة يُحتسب بنصف ارتفاعه كمكافئ ارتفاع كامل.
 * كان المقياس القديم يأخذ أطول العمودين فقط فيرى صفحةً عمودها الأيسر فارغ «ممتلئة 100%».
 */

import { stackHeightPx } from "./flow-column-balance-solver";
import type { FlowItem, FlowPageSegment } from "./flow-item-model";

export const MODULE_ID_FLOW_PAGE_AREA_WASTE_METER = "flow_page_area_waste_meter" as const;

/** الفراغ غير الممتص داخل مقاطع الأعمدة، مُحوَّلاً إلى مكافئ ارتفاع بعرض الصفحة الكامل (px). */
export function columnsAreaWastePx(
  segments: readonly FlowPageSegment[],
  heightOf: (item: FlowItem) => number,
  gapPx: number,
  stretchRoomOf: (item: FlowItem) => number
): number {
  return segments.reduce((sum, s) => {
    if (s.kind !== "columns") return sum;
    const rightH = stackHeightPx(s.rightItems.map(heightOf), gapPx);
    const leftH = stackHeightPx(s.leftItems.map(heightOf), gapPx);
    const shorter = rightH < leftH ? s.rightItems : s.leftItems;
    const absorbable = shorter.reduce((acc, item) => acc + stretchRoomOf(item), 0);
    const unabsorbed = Math.max(0, Math.abs(rightH - leftH) - absorbable);
    return sum + unabsorbed / 2;
  }, 0);
}

/** إجمالي الفراغ المهدور في الصفحة (px مكافئ): سفلي + أعمدة. */
export function pageAreaWastePx(params: {
  readonly segments: readonly FlowPageSegment[];
  readonly usedHeightPx: number;
  readonly budgetPx: number;
  readonly heightOf: (item: FlowItem) => number;
  readonly gapPx: number;
  readonly stretchRoomOf: (item: FlowItem) => number;
}): number {
  const bottom = Math.max(0, params.budgetPx - params.usedHeightPx);
  return bottom + columnsAreaWastePx(params.segments, params.heightOf, params.gapPx, params.stretchRoomOf);
}
