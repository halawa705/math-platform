/**
 * @file flow-page-packer.ts
 * @description موزّع التدفق الحتمي: يضع كائنات المذكرة المقاسة (بعرضها الحقيقي) على صفحات A4.
 * - الكائنات بعرض كامل (كبسولة الفكرة، الفواصل، الجداول) تُكدَّس رأسياً، والأسئلة المتتالية تُجمّع في مقطع أعمدة متوازن.
 * - يُضاف الكائن للصفحة إن اتسعت (بعد إعادة موازنة العمودين)، وإلا تبدأ صفحة جديدة؛ وكبسولة الفكرة لا تُترك دون أول مثال لها.
 * - المسافة بين الكائنات (2px–10px) تُوزَّع على الفراغ المتبقي في كل صفحة. لا يوجد أي تصغير للخط.
 */

import {
  FLOW_DIVIDER_OVERFLOW_TOLERANCE_PX,
  FLOW_FIRST_PAGE_BUDGET_PX,
  FLOW_GAP_MAX_PX,
  FLOW_GAP_MIN_PX,
  FLOW_SUBSEQUENT_PAGE_BUDGET_PX,
} from "./flow-page-geometry-constants";
import { solveBalancedColumnSplit, stackHeightPx } from "./flow-column-balance-solver";
import {
  fallbackFlowItemHeightPx,
  type FlowItem,
  type FlowPage,
  type FlowPageSegment,
} from "./flow-item-model";

export const MODULE_ID_FLOW_PAGE_PACKER = "flow_page_packer" as const;

export interface FlowPackOptions {
  readonly budgetFactor: number;
}

function segmentHeightAtGap(
  segment: FlowPageSegment,
  heightOf: (item: FlowItem) => number,
  gapPx: number
): number {
  if (segment.kind === "full") return heightOf(segment.item);
  return Math.max(
    stackHeightPx(segment.rightItems.map(heightOf), gapPx),
    stackHeightPx(segment.leftItems.map(heightOf), gapPx)
  );
}

function pageHeightAtGap(
  segments: readonly FlowPageSegment[],
  heightOf: (item: FlowItem) => number,
  gapPx: number
): number {
  return stackHeightPx(segments.map((s) => segmentHeightAtGap(s, heightOf, gapPx)), gapPx);
}

function chooseGapPx(
  segments: readonly FlowPageSegment[],
  heightOf: (item: FlowItem) => number,
  budgetPx: number
): number {
  for (let gap = FLOW_GAP_MAX_PX; gap > FLOW_GAP_MIN_PX; gap--) {
    if (pageHeightAtGap(segments, heightOf, gap) <= budgetPx) return gap;
  }
  return FLOW_GAP_MIN_PX;
}

export function packFlowItemsIntoPages(
  items: readonly FlowItem[],
  heights: ReadonlyMap<string, number>,
  options: FlowPackOptions
): readonly FlowPage[] {
  const heightOf = (item: FlowItem) => heights.get(item.id) ?? fallbackFlowItemHeightPx(item);
  const pages: FlowPage[] = [];
  let segments: FlowPageSegment[] = [];
  let openGroup: FlowItem[] = [];

  const pageNumber = () => pages.length + 1;
  const rawBudget = () => (pageNumber() === 1 ? FLOW_FIRST_PAGE_BUDGET_PX : FLOW_SUBSEQUENT_PAGE_BUDGET_PX);
  const effectiveBudget = () => rawBudget() * options.budgetFactor;
  const groupHeight = (group: readonly FlowItem[]) =>
    solveBalancedColumnSplit(group.map(heightOf), FLOW_GAP_MIN_PX).heightPx;
  const fixedHeight = () => pageHeightAtGap(segments, heightOf, FLOW_GAP_MIN_PX);
  const usedWith = (group: readonly FlowItem[]) =>
    segments.length === 0 && group.length === 0
      ? 0
      : stackHeightPx(
          [...segments.map((s) => segmentHeightAtGap(s, heightOf, FLOW_GAP_MIN_PX)), ...(group.length ? [groupHeight(group)] : [])],
          FLOW_GAP_MIN_PX
        );

  const closeGroup = () => {
    if (openGroup.length === 0) return;
    const split = solveBalancedColumnSplit(openGroup.map(heightOf), FLOW_GAP_MIN_PX);
    segments.push({
      kind: "columns",
      rightItems: openGroup.slice(0, split.rightCount),
      leftItems: openGroup.slice(split.rightCount),
      heightPx: split.heightPx,
    });
    openGroup = [];
  };

  const flushPage = () => {
    closeGroup();
    if (segments.length === 0) return;
    const budget = rawBudget();
    pages.push({
      pageNumber: pageNumber(),
      isFirstPage: pageNumber() === 1,
      segments,
      usedHeightPx: Math.round(fixedHeight()),
      budgetHeightPx: budget,
      gapPx: chooseGapPx(segments, heightOf, budget),
    });
    segments = [];
  };

  items.forEach((item, index) => {
    const hasContent = segments.length > 0 || openGroup.length > 0;
    if (item.kind === "question" && item.span === "column") {
      const candidate = [...openGroup, item];
      const candidateUsed = fixedHeight() + (segments.length > 0 ? FLOW_GAP_MIN_PX : 0) + groupHeight(candidate);
      if (hasContent && candidateUsed > effectiveBudget()) {
        flushPage();
        openGroup = [item];
      } else {
        openGroup = candidate;
      }
      return;
    }

    const next = items[index + 1];
    const needed =
      item.kind === "idea_capsule" && next
        ? heightOf(item) + FLOW_GAP_MIN_PX + heightOf(next)
        : heightOf(item);
    const tolerance = item.kind === "idea_divider" ? FLOW_DIVIDER_OVERFLOW_TOLERANCE_PX : 0;
    if (hasContent && usedWith(openGroup) + FLOW_GAP_MIN_PX + needed > effectiveBudget() + tolerance) {
      flushPage();
    }
    closeGroup();
    segments.push({ kind: "full", item, heightPx: heightOf(item) });
  });

  flushPage();
  return pages;
}
