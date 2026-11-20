/**
 * @file flow-page-break-cost-evaluator.ts
 * @description يقيّم صفحة مرشحة واحدة (قائمة كائناتها بالترتيب) ويعيد تكلفتها وفق أوزان SSOT:
 * قيود الأيتام، الفراغ المهدور بالمساحة (سفلي + أعمدة فارغة)، تفاوت الأعمدة، وتكلفة قطع الحلول.
 * لا يتخذ قرار توزيع؛ فاصل الصفحات يقارن التكاليف ويختار.
 */

import { FLOW_LAYOUT_COST_WEIGHTS as W } from "../ssot/flow-layout-cost-weights-ssot";
import { resolveAdaptiveFirstPageHeader } from "./adaptive-page-header-budget-resolver";
import { resolveElasticPageFit } from "./flow-elastic-fit-resolver";
import type { FlowItem, FlowPageSegment } from "./flow-item-model";
import type { FlowDensityProfile } from "./flow-page-geometry-constants";
import type { FlowPageBudgetsPx } from "./flow-page-budget-resolver";
import { pageAreaWastePx } from "./flow-page-area-waste-meter";
import { buildSegmentsForSlice, columnsImbalancePx, pageContentHeightPx } from "./flow-page-segments-builder";

export const MODULE_ID_FLOW_PAGE_BREAK_COST_EVALUATOR = "flow_page_break_cost_evaluator" as const;

export interface PageCostContext {
  readonly heights: ReadonlyMap<string, number>;
  readonly heightOf: (item: FlowItem) => number;
  readonly stretchRoomOf: (item: FlowItem) => number;
  readonly budgets: FlowPageBudgetsPx;
  readonly density: FlowDensityProfile;
  readonly manualCompactHeader?: boolean;
}

export interface PageCandidateFlags {
  readonly isFirstPage: boolean;
  readonly isLastPage: boolean;
  /** الكائن الأصلي الذي يلي الصفحة (لتماسك زوج الأمثلة الكاملة). */
  readonly nextItem?: FlowItem;
  /** خطوات كل ذيل مرحَّل إن انتهت الصفحة بقطع حل. */
  readonly cutTailStepCounts?: readonly number[];
}

export interface PageCandidateEvaluation {
  readonly cost: number;
  readonly oversized: boolean;
}

export function resolvePageBudget(ctx: PageCostContext, isFirstPage: boolean, requiredPx: number) {
  if (!isFirstPage) return { budget: ctx.budgets.nextPagePx, isHeaderCompact: false };
  const decision = resolveAdaptiveFirstPageHeader({
    standardFirstPageBudgetPx: ctx.budgets.firstPagePx,
    compactFirstPageBudgetPx: ctx.budgets.firstPageCompactPx,
    requiredFirstPageHeightPx: requiredPx,
    manualCompactHeaderSetting: ctx.manualCompactHeader,
  });
  return { budget: decision.effectiveFirstPageBudgetPx, isHeaderCompact: decision.isHeaderCompact };
}

export function buildPageSegments(ctx: PageCostContext, pageItems: readonly FlowItem[]): readonly FlowPageSegment[] {
  return buildSegmentsForSlice(pageItems, ctx.heightOf, ctx.heights, ctx.density.gapMinPx, ctx.stretchRoomOf);
}

function isWholeWorkedColumn(item: FlowItem | undefined): item is Extract<FlowItem, { kind: "question" }> {
  return item?.kind === "question" && item.span === "column" && Boolean(item.isWorkedExample) && !item.solutionSlice;
}

export function evaluatePageCandidate(
  ctx: PageCostContext,
  pageItems: readonly FlowItem[],
  flags: PageCandidateFlags
): PageCandidateEvaluation {
  const gap = ctx.density.gapMinPx;
  const segments = buildPageSegments(ctx, pageItems);
  const used = pageContentHeightPx(segments, ctx.heightOf, gap);
  const { budget } = resolvePageBudget(ctx, flags.isFirstPage, used);
  const elastic = resolveElasticPageFit({ segments, usedHeightPx: used, budgetPx: budget, gapPx: gap });
  const oversized = !elastic.fits;
  const effectiveUsed = Math.min(budget, used - elastic.absorbedPx);
  const first = pageItems[0];
  const last = pageItems[pageItems.length - 1];
  const lone = pageItems.length === 1;

  let cost = oversized ? W.oversizedPenalty : 0;
  if (last.kind === "idea_capsule" && !flags.isLastPage) cost += lone ? W.orphanPenalty : W.capsuleAtPageBottomCost;
  if (last.kind === "answer_section_banner" && !flags.isLastPage) cost += W.orphanPenalty;
  if (lone && first.kind === "answer_section_banner" && !flags.isLastPage) cost += W.orphanPenalty;
  if (first.kind === "idea_divider") cost += W.orphanPenalty;
  if (lone && first.kind === "accreditation_footer" && !flags.isFirstPage) cost += W.loneFooterPenalty;

  const next = flags.nextItem;
  if (!flags.isLastPage && isWholeWorkedColumn(last) && isWholeWorkedColumn(next) && last.ideaIndex === next.ideaIndex) {
    cost += W.orphanPenalty;
  }

  if (!flags.isLastPage) {
    const waste = pageAreaWastePx({
      segments, usedHeightPx: effectiveUsed, budgetPx: budget, heightOf: ctx.heightOf, gapPx: gap, stretchRoomOf: ctx.stretchRoomOf,
    });
    cost += (W.areaWasteWeight * waste / budget) ** 2;
  }
  cost += (W.columnImbalanceWeight * columnsImbalancePx(segments, ctx.heightOf, gap) / budget) ** 2;

  for (const steps of flags.cutTailStepCounts ?? []) {
    cost += W.solutionCutCost + (steps === 1 ? W.singleStepTailCost : 0);
  }
  return { cost, oversized };
}
