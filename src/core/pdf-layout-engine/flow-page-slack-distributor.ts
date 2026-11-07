/**
 * @file flow-page-slack-distributor.ts
 * @description يوزّع فراغ الصفحة بعد اختيار الكسر: (١) يساوي العمودين داخل كل مقطع أعمدة بتمديد بطاقات العمود الأقصر،
 * (٢) يوسّع المسافة بين الكائنات حتى حدّ الكثافة، (٣) يمدّد بطاقات الأسئلة بالتساوي بين المقاطع لتلامس الصفحة تذييلها.
 * التمديد محدود لكل بطاقة (px ونسبة) فلا تتضخم بطاقة صغيرة؛ وما لا يمكن امتصاصه يبقى أسفل الصفحة بدل أن يشوّه البطاقات.
 */

import { stackHeightPx } from "./flow-column-balance-solver";
import { pageContentHeightPx } from "./flow-page-segments-builder";
import {
  FLOW_MIN_FILL_RATIO_FOR_STRETCH,
  type FlowDensityProfile,
} from "./flow-page-geometry-constants";
import { isStretchableFlowItem, type FlowItem, type FlowPage, type FlowPageSegment } from "./flow-item-model";

export const MODULE_ID_FLOW_PAGE_SLACK_DISTRIBUTOR = "flow_page_slack_distributor" as const;

interface DistributeParams {
  readonly pageNumber: number;
  readonly segments: readonly FlowPageSegment[];
  readonly budgetPx: number;
  readonly heightOf: (item: FlowItem) => number;
  readonly density: FlowDensityProfile;
  readonly isLastPage: boolean;
}

/** يضيف `deltaPx` إلى عمود بتقاسمه بين بطاقاته القابلة للتمديد (ملء بالماء مع سقف لكل بطاقة). يعيد ما أُضيف فعلاً. */
function stretchColumn(
  items: readonly FlowItem[],
  deltaPx: number,
  heightOf: (item: FlowItem) => number,
  density: FlowDensityProfile,
  extra: Map<string, number>
): number {
  const open = items.filter(isStretchableFlowItem).map((item) => ({
    id: item.id,
    room: Math.max(0, Math.min(density.maxStretchPerItemPx, heightOf(item) * density.maxStretchRatio) - (extra.get(item.id) ?? 0)),
  }));
  let remaining = deltaPx;
  let added = 0;
  let active = open.filter((o) => o.room > 0.5);
  while (remaining > 0.5 && active.length > 0) {
    const share = remaining / active.length;
    for (const slot of active) {
      const give = Math.min(share, slot.room);
      extra.set(slot.id, (extra.get(slot.id) ?? 0) + give);
      slot.room -= give;
      remaining -= give;
      added += give;
    }
    active = active.filter((o) => o.room > 0.5);
  }
  return added;
}

function columnRoomPx(items: readonly FlowItem[], heightOf: (i: FlowItem) => number, d: FlowDensityProfile, extra: Map<string, number>): number {
  return items.filter(isStretchableFlowItem).reduce(
    (sum, item) => sum + Math.max(0, Math.min(d.maxStretchPerItemPx, heightOf(item) * d.maxStretchRatio) - (extra.get(item.id) ?? 0)),
    0
  );
}

export function distributePageSlack(p: DistributeParams): FlowPage {
  const { segments, budgetPx, heightOf, density } = p;
  const extra = new Map<string, number>();
  const gapMin = density.gapMinPx;

  // (١) مساواة العمودين في كل مقطع أعمدة.
  for (const segment of segments) {
    if (segment.kind !== "columns") continue;
    const right = stackHeightPx(segment.rightItems.map(heightOf), gapMin);
    const left = stackHeightPx(segment.leftItems.map(heightOf), gapMin);
    const shorter = right < left ? segment.rightItems : segment.leftItems;
    stretchColumn(shorter, Math.abs(right - left), heightOf, density, extra);
  }

  const heightWithExtra = (item: FlowItem) => heightOf(item) + (extra.get(item.id) ?? 0);
  const contentAt = (gap: number) => pageContentHeightPx(segments, heightWithExtra, gap);
  const fitsAt = (gap: number) => contentAt(gap) <= budgetPx;

  // (٢) أكبر مسافة ≤ حدّ الكثافة تتسع في الميزانية.
  let gapPx = gapMin;
  for (let g = density.gapMaxPx; g > gapMin; g--) {
    if (fitsAt(g)) { gapPx = g; break; }
  }

  // (٣) تمديد البطاقات بالتساوي بين المقاطع لملء ما تبقى (إن كانت الصفحة ممتلئة بما يكفي).
  const usedAfterGap = contentAt(gapPx);
  const fillRatio = usedAfterGap / budgetPx;
  const minFill = p.isLastPage ? FLOW_MIN_FILL_RATIO_FOR_STRETCH + 0.13 : FLOW_MIN_FILL_RATIO_FOR_STRETCH;
  if (fillRatio >= minFill && usedAfterGap < budgetPx) {
    let slack = budgetPx - usedAfterGap;
    const stretchable = segments.filter((s) => (s.kind === "full" ? isStretchableFlowItem(s.item) : true));
    for (let round = 0; round < 4 && slack > 0.5 && stretchable.length > 0; round++) {
      const share = slack / stretchable.length;
      let used = 0;
      for (const segment of stretchable) {
        if (segment.kind === "full") {
          used += stretchColumn([segment.item], share, () => segment.heightPx, density, extra);
        } else {
          const room = Math.min(
            columnRoomPx(segment.rightItems, heightOf, density, extra),
            columnRoomPx(segment.leftItems, heightOf, density, extra)
          );
          const delta = Math.min(share, room);
          stretchColumn(segment.rightItems, delta, heightOf, density, extra);
          stretchColumn(segment.leftItems, delta, heightOf, density, extra);
          used += delta;
        }
      }
      slack -= used;
      if (used < 0.5) break;
    }
  }

  const targetHeightPxById: Record<string, number> = {};
  const baseHeight = (item: FlowItem, segment: FlowPageSegment) => (segment.kind === "full" ? segment.heightPx : heightOf(item));
  for (const segment of segments) {
    const members = segment.kind === "full" ? [segment.item] : [...segment.rightItems, ...segment.leftItems];
    for (const item of members) {
      const add = extra.get(item.id) ?? 0;
      if (add > 0.5) targetHeightPxById[item.id] = Math.floor(baseHeight(item, segment) + add);
    }
  }

  const finalHeight = pageContentHeightPx(
    segments.map((s) => (s.kind === "full" ? { ...s, heightPx: s.heightPx + (extra.get(s.item.id) ?? 0) } : s)),
    heightWithExtra,
    gapPx
  );
  return {
    pageNumber: p.pageNumber,
    isFirstPage: p.pageNumber === 1,
    segments,
    usedHeightPx: Math.round(finalHeight),
    budgetHeightPx: budgetPx,
    gapPx,
    targetHeightPxById,
    overflowsBudget: finalHeight > budgetPx + 1,
  };
}
