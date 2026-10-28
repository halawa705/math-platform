/**
 * @file flow-page-packer.ts
 * @description فاصل الصفحات الأمثل (Optimal Page Breaker): بدل التعبئة الجشعة التي ترمي الكائن الذي لا يتسع إلى صفحة جديدة وتترك فراغاً،
 * يبحث بالبرمجة الديناميكية عن أفضل مواضع كسر الصفحات: أولاً أقل عدد أوراق، ثم أقل فراغ سفلي وأقل عدم تساوٍ بين الأعمدة.
 * قيود الأيتام: كبسولة الفكرة لا تنتهي بها صفحة (تبقى مع أول أمثلتها)، والفاصل لا يبدأ به صفحة، وخاتمة الاعتماد لا تنفرد بصفحة.
 * بعد اختيار الكسر تُوزَّع الفراغات بواسطة flow-page-slack-distributor (مسافات ثم تمديد بطاقات)، ولا يوجد أي تصغير للخط.
 */

import {
  buildSegmentsForSlice,
  columnsImbalancePx,
  pageContentHeightPx,
} from "./flow-page-segments-builder";
import { distributePageSlack } from "./flow-page-slack-distributor";
import { fallbackFlowItemHeightPx, isStretchableFlowItem, type FlowItem, type FlowPage } from "./flow-item-model";
import type { FlowDensityProfile } from "./flow-page-geometry-constants";
import type { FlowPageBudgetsPx } from "./flow-page-budget-resolver";

export const MODULE_ID_FLOW_PAGE_PACKER = "flow_page_packer" as const;

export interface FlowPackOptions {
  readonly budgets: FlowPageBudgetsPx;
  readonly density: FlowDensityProfile;
}

interface BreakNode {
  readonly pages: number;
  readonly cost: number;
  readonly from: number;
}

const ORPHAN_PENALTY = 1e5;
const LONE_FOOTER_PENALTY = 30;
const SLACK_WEIGHT = 10;
const IMBALANCE_WEIGHT = 8;
const OVERSIZED_PENALTY = 1e7;

function isBetter(a: BreakNode, b: BreakNode | undefined): boolean {
  if (!b) return true;
  if (a.pages !== b.pages) return a.pages < b.pages;
  return a.cost < b.cost - 1e-9;
}

export function packFlowItemsIntoPages(
  items: readonly FlowItem[],
  heights: ReadonlyMap<string, number>,
  options: FlowPackOptions
): readonly FlowPage[] {
  const count = items.length;
  if (count === 0) return [];
  const { gapMinPx } = options.density;
  const heightOf = (item: FlowItem) => heights.get(item.id) ?? fallbackFlowItemHeightPx(item);
  const stretchRoomOf = (item: FlowItem) =>
    isStretchableFlowItem(item) ? Math.min(options.density.maxStretchPerItemPx, heightOf(item) * options.density.maxStretchRatio) : 0;
  const budgetFor = (startIndex: number) => (startIndex === 0 ? options.budgets.firstPagePx : options.budgets.nextPagePx);

  const best: Array<BreakNode | undefined> = new Array(count + 1).fill(undefined);
  best[0] = { pages: 0, cost: 0, from: -1 };

  for (let start = 0; start < count; start++) {
    const base = best[start];
    if (!base) continue;
    const budget = budgetFor(start);

    for (let end = start + 1; end <= count; end++) {
      const slice = items.slice(start, end);
      const segments = buildSegmentsForSlice(slice, heightOf, heights, gapMinPx, stretchRoomOf);
      const used = pageContentHeightPx(segments, heightOf, gapMinPx);
      const oversized = used > budget;
      if (oversized && end > start + 1) break;

      const last = slice[slice.length - 1];
      const isLastPage = end === count;
      let cost = 0;
      if (oversized) cost += OVERSIZED_PENALTY;
      if (last.kind === "idea_capsule" && !isLastPage) cost += ORPHAN_PENALTY;
      if (slice[0].kind === "idea_divider") cost += ORPHAN_PENALTY;
      if (slice.length === 1 && slice[0].kind === "accreditation_footer" && start > 0) cost += LONE_FOOTER_PENALTY;
      if (!isLastPage) cost += (SLACK_WEIGHT * Math.max(0, budget - used) / budget) ** 2;
      cost += (IMBALANCE_WEIGHT * columnsImbalancePx(segments, heightOf, gapMinPx) / budget) ** 2;

      const candidate: BreakNode = { pages: base.pages + 1, cost: base.cost + cost, from: start };
      if (isBetter(candidate, best[end])) best[end] = candidate;
    }
  }

  const cuts: number[] = [];
  for (let cursor = count; cursor > 0; cursor = best[cursor]!.from) cuts.unshift(cursor);

  const pages: FlowPage[] = [];
  let startIndex = 0;
  cuts.forEach((endIndex, pageIdx) => {
    const budget = budgetFor(startIndex);
    const segments = buildSegmentsForSlice(items.slice(startIndex, endIndex), heightOf, heights, gapMinPx, stretchRoomOf);
    pages.push(
      distributePageSlack({
        pageNumber: pageIdx + 1,
        segments,
        budgetPx: budget,
        heightOf,
        density: options.density,
        isLastPage: endIndex === count,
      })
    );
    startIndex = endIndex;
  });
  return pages;
}
