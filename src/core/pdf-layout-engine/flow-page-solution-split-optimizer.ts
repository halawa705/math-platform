/**
 * @file flow-page-solution-split-optimizer.ts
 * @description يملأ الفراغ أسفل الصفحات غير الأخيرة بتقسيم صندوق حل المثال التالي بين صفحتين:
 * الصفحة الأولى تأخذ أول k خطوة (k ≥ 2) والصفحة الثانية تأخذ الباقي. لا تُجزَّأ الخطوة نفسها أبداً.
 * يُقبل التقسيم فقط إن لم يزد عدد الصفحات، وانفصل الرأس عن الذيل فعلاً، وقلّ مجموع الفراغ السفلي؛ وإلا يبقى المثال كاملاً.
 */

import type { FlowItem, FlowPage } from "./flow-item-model";
import { buildSolutionSplitVariants } from "./flow-solution-split-variants-builder";

export const MODULE_ID_FLOW_PAGE_SOLUTION_SPLIT_OPTIMIZER = "flow_page_solution_split_optimizer" as const;

/** أقل نسبة فراغ سفلي في الصفحة تستحق محاولة التقسيم. */
const MIN_SLACK_RATIO_TO_TRY_SPLIT = 0.12;
const MAX_ACCEPTED_SPLITS = 80;

export type FlowPackOnce = (items: readonly FlowItem[]) => readonly FlowPage[];

export interface SplitOptimizationResult {
  readonly items: readonly FlowItem[];
  readonly pages: readonly FlowPage[];
}

function flattenPageItems(page: FlowPage): FlowItem[] {
  return page.segments.flatMap((s) => (s.kind === "full" ? [s.item] : [...s.rightItems, ...s.leftItems]));
}

/** مجموع مربعات الفراغ السفلي للصفحات غير الأخيرة (أصغر = توزيع أفضل). */
function slackScore(pages: readonly FlowPage[]): number {
  return pages.slice(0, -1).reduce((sum, p) => {
    const slack = Math.max(0, 1 - p.usedHeightPx / Math.max(1, p.budgetHeightPx));
    return sum + slack * slack;
  }, 0);
}

function pageIndexOfItem(pages: readonly FlowPage[], itemId: string): number {
  return pages.findIndex((p) => flattenPageItems(p).some((i) => i.id === itemId));
}

export function optimizePagesWithSolutionSplits(
  items: readonly FlowItem[],
  heights: ReadonlyMap<string, number>,
  basePages: readonly FlowPage[],
  packOnce: FlowPackOnce
): SplitOptimizationResult {
  const variantsById = buildSolutionSplitVariants(items);
  if (variantsById.size === 0) return { items, pages: basePages };

  let currentItems = items;
  let pages = basePages;
  const tried = new Set<string>();

  for (let accepted = 0; accepted < MAX_ACCEPTED_SPLITS; accepted++) {
    let progressed = false;

    for (let p = 0; p < pages.length - 1 && !progressed; p++) {
      const page = pages[p];
      if (1 - page.usedHeightPx / Math.max(1, page.budgetHeightPx) < MIN_SLACK_RATIO_TO_TRY_SPLIT) continue;
      const next = flattenPageItems(pages[p + 1])[0];
      if (!next || tried.has(next.id)) continue;
      const variants = variantsById.get(next.id);
      if (!variants) continue;
      tried.add(next.id);

      const baseScore = slackScore(pages);
      let best: SplitOptimizationResult | undefined;
      let bestScore = baseScore - 1e-9;

      for (const v of variants) {
        if (!heights.has(v.head.id) || !heights.has(v.tail.id)) continue;
        const candidateItems = currentItems.flatMap((i) => (i.id === next.id ? [v.head, v.tail] : [i]));
        const candidatePages = packOnce(candidateItems);
        if (candidatePages.length > pages.length) continue;
        if (candidatePages.some((cp) => cp.overflowsBudget)) continue;
        const headPage = pageIndexOfItem(candidatePages, v.head.id);
        const tailPage = pageIndexOfItem(candidatePages, v.tail.id);
        if (headPage < 0 || tailPage <= headPage) continue;
        const score = slackScore(candidatePages);
        if (score < bestScore) {
          bestScore = score;
          best = { items: candidateItems, pages: candidatePages };
        }
      }

      if (best) {
        currentItems = best.items;
        pages = best.pages;
        progressed = true;
      }
    }

    if (!progressed) break;
  }

  return { items: currentItems, pages };
}
