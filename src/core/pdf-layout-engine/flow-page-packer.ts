/**
 * @file flow-page-packer.ts
 * @description فاصل الصفحات الأمثل الموحَّد: برمجة ديناميكية واحدة تقارن كل حدود الصفحة الممكنة معاً —
 * الكسر بين الكائنات، أو إنهاء الصفحة برأس مثال (السؤال + أول k خطوة) وترحيل ذيله، أو برأسَي زوج أمثلة معاً —
 * وتختار: أولاً أقل قيود مكسورة، ثم أقل عدد أوراق، ثم أقل تكلفة (فراغ بالمساحة، تفاوت أعمدة، قطع حلول).
 * لا مرحلة ترقيع لاحقة ولا قواعد اختيار خاصة: الحالة يحسمها مقياس الفراغ الصادق فقط. لا تصغير للخط ولا تجزئة لخطوة.
 */

import { FLOW_LAYOUT_COST_WEIGHTS as W } from "../ssot/flow-layout-cost-weights-ssot";
import { distributePageSlack } from "./flow-page-slack-distributor";
import { fallbackFlowItemHeightPx, isStretchableFlowItem, type FlowItem, type FlowPage } from "./flow-item-model";
import type { FlowDensityProfile } from "./flow-page-geometry-constants";
import type { FlowPageBudgetsPx } from "./flow-page-budget-resolver";
import { pageContentHeightPx } from "./flow-page-segments-builder";
import { buildInlineSolutionCutLookup, type InlineSolutionCutLookup } from "./flow-dp-inline-solution-cut-options";
import {
  buildPageSegments,
  evaluatePageCandidate,
  resolvePageBudget,
  type PageCostContext,
} from "./flow-page-break-cost-evaluator";

export const MODULE_ID_FLOW_PAGE_PACKER = "flow_page_packer" as const;

export interface FlowPackOptions {
  readonly budgets: FlowPageBudgetsPx;
  readonly density: FlowDensityProfile;
  /** تعطيل خيارات قطع الحلول (أثناء المسح السريع قبل اكتمال قياس نسخ الرأس/الذيل). */
  readonly skipSolutionSplits?: boolean;
  readonly manualCompactHeader?: boolean;
}

interface DpNode {
  readonly pages: number;
  readonly cost: number;
  readonly prevKey: string | undefined;
  readonly pageItems: readonly FlowItem[];
}

const END_KEY = "END";
const NO_CUTS: InlineSolutionCutLookup = () => [];

function nodeKey(index: number, carryKey: string): string {
  return `${index}|${carryKey}`;
}

function isBetter(a: DpNode, b: DpNode | undefined): boolean {
  if (!b) return true;
  const aPenalties = Math.floor(a.cost / W.orphanPenalty);
  const bPenalties = Math.floor(b.cost / W.orphanPenalty);
  if (aPenalties !== bPenalties) return aPenalties < bPenalties;
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
  const heightOf = (item: FlowItem) => heights.get(item.id) ?? fallbackFlowItemHeightPx(item);
  const ctx: PageCostContext = {
    heights,
    heightOf,
    stretchRoomOf: (item) =>
      isStretchableFlowItem(item) ? Math.min(options.density.maxStretchPerItemPx, heightOf(item) * options.density.maxStretchRatio) : 0,
    budgets: options.budgets,
    density: options.density,
    manualCompactHeader: options.manualCompactHeader,
  };
  const cutsAt = options.skipSolutionSplits ? NO_CUTS : buildInlineSolutionCutLookup(items, heights);

  const nodes = new Map<string, DpNode>();
  const carryItems = new Map<string, readonly FlowItem[]>([["", []]]);
  const carryKeysAt: Array<Set<string>> = Array.from({ length: count + 1 }, () => new Set<string>());
  const relax = (key: string, candidate: DpNode) => {
    if (isBetter(candidate, nodes.get(key))) nodes.set(key, candidate);
  };
  nodes.set(nodeKey(0, ""), { pages: 0, cost: 0, prevKey: undefined, pageItems: [] });

  const expand = (start: number, carryKey: string) => {
    const fromKey = nodeKey(start, carryKey);
    const from = nodes.get(fromKey);
    if (!from) return;
    const carry = carryItems.get(carryKey) ?? [];
    const isFirstPage = start === 0 && carry.length === 0;
    for (let end = start; end <= count; end++) {
      const base = [...carry, ...items.slice(start, end)];
      if (base.length > 0) {
        const isLastPage = end === count;
        const ev = evaluatePageCandidate(ctx, base, { isFirstPage, isLastPage, nextItem: items[end] });
        if (!ev.oversized || base.length === 1) {
          relax(isLastPage ? END_KEY : nodeKey(end, ""), { pages: from.pages + 1, cost: from.cost + ev.cost, prevKey: fromKey, pageItems: base });
        }
        if (ev.oversized && base.length > 1) break;
      }
      if (end >= count) continue;
      for (const opt of cutsAt(end)) {
        const pageItems = [...base, ...opt.heads];
        const ev = evaluatePageCandidate(ctx, pageItems, { isFirstPage, isLastPage: false, cutTailStepCounts: opt.tailStepCounts });
        if (ev.oversized) continue;
        const target = end + opt.consumed;
        carryItems.set(opt.carryKey, opt.tails);
        carryKeysAt[target].add(opt.carryKey);
        relax(nodeKey(target, opt.carryKey), { pages: from.pages + 1, cost: from.cost + ev.cost, prevKey: fromKey, pageItems });
      }
    }
  };

  for (let index = 0; index < count; index++) {
    // الصفحات التي تبدأ بذيل مرحَّل أولاً (قد تنتج عقدة بلا ترحيل عند نفس الفهرس)، ثم العقدة بلا ترحيل.
    for (const carryKey of carryKeysAt[index]) expand(index, carryKey);
    expand(index, "");
  }
  // ذيل مرحَّل في نهاية المستند (الكائن الأخير مقطوع) يحتاج صفحة أخيرة خاصة.
  for (const carryKey of carryKeysAt[count]) {
    const from = nodes.get(nodeKey(count, carryKey));
    const carry = carryItems.get(carryKey) ?? [];
    if (!from || carry.length === 0) continue;
    const ev = evaluatePageCandidate(ctx, carry, { isFirstPage: false, isLastPage: true });
    relax(END_KEY, { pages: from.pages + 1, cost: from.cost + ev.cost, prevKey: nodeKey(count, carryKey), pageItems: carry });
  }

  const pageSlices: Array<readonly FlowItem[]> = [];
  for (let node = nodes.get(END_KEY); node && node.prevKey !== undefined; node = nodes.get(node.prevKey)) {
    pageSlices.unshift(node.pageItems);
  }

  return pageSlices.map((slice, pageIdx) => {
    const segments = buildPageSegments(ctx, slice);
    const used = pageContentHeightPx(segments, heightOf, options.density.gapMinPx);
    const { budget, isHeaderCompact } = resolvePageBudget(ctx, pageIdx === 0, used);
    return distributePageSlack({
      pageNumber: pageIdx + 1,
      segments,
      budgetPx: budget,
      heightOf,
      density: options.density,
      isLastPage: pageIdx === pageSlices.length - 1,
      isHeaderCompact,
    });
  });
}
