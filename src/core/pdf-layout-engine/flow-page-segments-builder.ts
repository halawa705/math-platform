/**
 * @file flow-page-segments-builder.ts
 * @description يحوّل شريحة متصلة من الكائنات إلى مقاطع صفحة: الكائنات ذات العرض الكامل تُكدَّس رأسياً، والأسئلة المتتالية بعرض العمود
 * تُجمَّع في مقطع أعمدة متوازن (يمين ثم يسار). البطاقة مرنة العرض: السؤال الوحيد في المجموعة، أو مجموعة لا يمتصّ التمديدُ تفاوتَ
 * عمودَيها وتكون أقصر إن عُرضت بعرض الصفحة، تُعرض كبطاقات بعرض كامل بدل أن تترك فراغاً في أحد العمودين.
 */

import { solveBalancedColumnSplit, stackHeightPx } from "./flow-column-balance-solver";
import { fullWidthHeightKey, type FlowItem, type FlowPageSegment } from "./flow-item-model";

export const MODULE_ID_FLOW_PAGE_SEGMENTS_BUILDER = "flow_page_segments_builder" as const;

export type FlowHeightLookup = (item: FlowItem) => number;

/** أقصى تفاوت (px) بين العمودين يُقبل بعد التمديد قبل التحول إلى بطاقات بعرض كامل. */
const UNABSORBED_IMBALANCE_TOLERANCE_PX = 60;

export function buildSegmentsForSlice(
  items: readonly FlowItem[],
  heightOf: FlowHeightLookup,
  fullWidthHeights: ReadonlyMap<string, number>,
  gapPx: number,
  stretchRoomOf: (item: FlowItem) => number
): readonly FlowPageSegment[] {
  const segments: FlowPageSegment[] = [];
  let group: FlowItem[] = [];

  const closeGroup = () => {
    if (group.length === 0) return;
    const fullHeights = group.map((g) => fullWidthHeights.get(fullWidthHeightKey(g.id)));
    const canGoFull = fullHeights.every((h): h is number => h !== undefined);
    const split = solveBalancedColumnSplit(group.map(heightOf), gapPx);
    const right = group.slice(0, split.rightCount);
    const left = group.slice(split.rightCount);

    let useFullStack = false;
    if (canGoFull) {
      if (group.length === 1) {
        useFullStack = true;
      } else {
        const rightH = stackHeightPx(right.map(heightOf), gapPx);
        const leftH = stackHeightPx(left.map(heightOf), gapPx);
        const shorter = rightH < leftH ? right : left;
        const absorbable = shorter.reduce((sum, g) => sum + stretchRoomOf(g), 0);
        const unabsorbed = Math.abs(rightH - leftH) - absorbable;
        const stackH = stackHeightPx(fullHeights as number[], gapPx);
        useFullStack = unabsorbed > UNABSORBED_IMBALANCE_TOLERANCE_PX && stackH <= split.heightPx;
      }
    }

    if (useFullStack) {
      group.forEach((g, i) => segments.push({ kind: "full", item: g, heightPx: fullHeights[i] as number }));
    } else {
      segments.push({ kind: "columns", rightItems: right, leftItems: left, heightPx: split.heightPx });
    }
    group = [];
  };

  for (const item of items) {
    if (item.kind === "question" && item.span === "column") {
      group.push(item);
    } else {
      closeGroup();
      segments.push({ kind: "full", item, heightPx: heightOf(item) });
    }
  }
  closeGroup();
  return segments;
}

export function segmentHeightPx(segment: FlowPageSegment, heightOf: FlowHeightLookup, gapPx: number): number {
  if (segment.kind === "full") return segment.heightPx;
  return Math.max(
    stackHeightPx(segment.rightItems.map(heightOf), gapPx),
    stackHeightPx(segment.leftItems.map(heightOf), gapPx)
  );
}

export function pageContentHeightPx(
  segments: readonly FlowPageSegment[],
  heightOf: FlowHeightLookup,
  gapPx: number
): number {
  return stackHeightPx(segments.map((s) => segmentHeightPx(s, heightOf, gapPx)), gapPx);
}

/** مجموع عدم تساوي الأعمدة (px) في مقاطع الأعمدة — يُستخدم للمفاضلة بين التوزيعات وللتدقيق. */
export function columnsImbalancePx(
  segments: readonly FlowPageSegment[],
  heightOf: FlowHeightLookup,
  gapPx: number
): number {
  return segments.reduce((sum, s) => {
    if (s.kind !== "columns") return sum;
    return sum + Math.abs(stackHeightPx(s.rightItems.map(heightOf), gapPx) - stackHeightPx(s.leftItems.map(heightOf), gapPx));
  }, 0);
}
