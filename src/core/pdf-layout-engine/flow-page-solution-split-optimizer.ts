/**
 * @file flow-page-solution-split-optimizer.ts
 * @description يملأ الفراغ أسفل الصفحات غير الأخيرة بتقسيم صندوق حل المثال التالي بين صفحتين:
 * الصفحة الأولى تأخذ أول k خطوة (k ≥ 2) والصفحة الثانية تأخذ الباقي. لا تُجزَّأ الخطوة نفسها أبداً.
 * يُقبل التقسيم فقط إن لم يزد عدد الصفحات، وانفصل الرأس عن الذيل فعلاً، وقلّ مجموع الفراغ السفلي؛ وإلا يبقى المثال كاملاً.
 */

import type { FlowItem, FlowPage } from "./flow-item-model";
import { pageContentHeightPx } from "./flow-page-segments-builder";
import { buildSolutionSplitVariants } from "./flow-solution-split-variants-builder";

export const MODULE_ID_FLOW_PAGE_SOLUTION_SPLIT_OPTIMIZER = "flow_page_solution_split_optimizer" as const;

/** أقل نسبة فراغ فعلي (قبل التمديد الصناعي للبطاقات) في الصفحة تستحق محاولة التقسيم لملء الصفحة بالمعلومات. */
const MIN_RAW_SLACK_RATIO_TO_TRY_SPLIT = 0.06;
const MAX_ACCEPTED_SPLITS = 80;

export type FlowPackOnce = (items: readonly FlowItem[]) => readonly FlowPage[];

export interface SplitOptimizationResult {
  readonly items: readonly FlowItem[];
  readonly pages: readonly FlowPage[];
}

function flattenPageItems(page: FlowPage): FlowItem[] {
  return page.segments.flatMap((s) => (s.kind === "full" ? [s.item] : [...s.rightItems, ...s.leftItems]));
}

/** الارتفاع الفعلي للمحتوى في الصفحة قبل أي تمديد صناعي للبطاقات. */
function rawPageContentHeightPx(page: FlowPage, heights: ReadonlyMap<string, number>): number {
  const rawHeightOf = (item: FlowItem) => heights.get(item.id) ?? 0;
  return pageContentHeightPx(page.segments, rawHeightOf, Math.min(page.gapPx, 4));
}

/** مجموع مربعات الفراغ الفعلي (قبل التمديد) والفراغ النهائي للصفحات غير الأخيرة (أصغر = معلومات أكثر وفراغ أقل). */
function slackScore(pages: readonly FlowPage[], heights: ReadonlyMap<string, number>): number {
  return pages.slice(0, -1).reduce((sum, p) => {
    const budget = Math.max(1, p.budgetHeightPx);
    const rawSlack = Math.max(0, 1 - rawPageContentHeightPx(p, heights) / budget);
    const finalSlack = Math.max(0, 1 - p.usedHeightPx / budget);
    return sum + rawSlack * rawSlack + finalSlack * finalSlack * 0.5;
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
      const rawFill = rawPageContentHeightPx(page, heights) / Math.max(1, page.budgetHeightPx);
      if (1 - rawFill < MIN_RAW_SLACK_RATIO_TO_TRY_SPLIT) continue;
      const nextPageItems = flattenPageItems(pages[p + 1]);
      const firstOnNext = nextPageItems[0];
      const next =
        firstOnNext &&
        (firstOnNext.kind === "idea_capsule" ||
          firstOnNext.kind === "answer_section_banner" ||
          firstOnNext.kind === "exam_section_banner")
          ? nextPageItems[1]
          : firstOnNext;
      if (!next || tried.has(next.id)) continue;
      const variants = variantsById.get(next.id);
      if (!variants) continue;
      tried.add(next.id);

      const baseScore = slackScore(pages, heights);
      let best: SplitOptimizationResult | undefined;
      let bestPagesCount = pages.length;
      let bestScore = baseScore - 1e-9;

      for (const v of variants) {
        if (!heights.has(v.head.id) || !heights.has(v.tail.id)) continue;
        const candidateItems = currentItems.flatMap((i) => (i.id === next.id ? [v.head, v.tail] : [i]));
        const candidatePages = packOnce(candidateItems);
        if (candidatePages.length > bestPagesCount) continue;
        if (candidatePages.some((cp) => cp.overflowsBudget)) continue;
        const headPage = pageIndexOfItem(candidatePages, v.head.id);
        const tailPage = pageIndexOfItem(candidatePages, v.tail.id);
        if (headPage < 0 || tailPage <= headPage) continue;
        const score = slackScore(candidatePages, heights);
        if (candidatePages.length < bestPagesCount || score < bestScore) {
          bestPagesCount = candidatePages.length;
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
