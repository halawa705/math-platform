/**
 * @file booklet-page-economy-baseline-report.test.ts
 * @description قياس اقتصاد الورق على مذكرة اصطناعية بارتفاعات متباينة: عدد الصفحات والإشغال الخام لكل صفحة،
 * ويثبت أن بحث ترتيب التدريبات لا يزيد الصفحات ولا يكسر الترقيم ولا يفقد عنصراً.
 */

import { describe, expect, it } from "vitest";
import { buildFlowItems } from "./flow-items-builder";
import { auditFlowPages } from "./flow-layout-quality-audit";
import { FLOW_DENSITY_PROFILES } from "./flow-page-geometry-constants";
import { packFlowItemsIntoPages } from "./flow-page-packer";
import { packFlowItemsWithBestPracticeOrder } from "./flow-practice-items-reorder-search";
import { fullWidthHeightKey, type FlowItem } from "./flow-item-model";
import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

const OPTIONS = { budgets: { firstPagePx: 915, nextPagePx: 1020 }, density: FLOW_DENSITY_PROFILES.ultra_compact } as const;

function q(id: string, n: number, extra: Partial<PrintableMathQuestionItem> = {}): PrintableMathQuestionItem {
  return { id, questionNumber: n, kind: "essay_algebra", branchBadgeAr: "", marks: 2, promptAr: "س", modelAnswerAr: "ج", solutionStepsAr: ["أ", "ب"], ...extra };
}

function booklet(ideas: number): PrintableMathQuestionItem[] {
  const out: PrintableMathQuestionItem[] = [];
  let n = 0;
  for (let i = 1; i <= ideas; i++) {
    out.push(q(`booklet-s1-example-${i}-1`, ++n, { ideaBannerTitleAr: `الفكرة ${i}`, conceptExplanationAr: "ش", framedRuleAr: "ق", isWorkedExample: true }));
    out.push(q(`booklet-s1-example-${i}-2`, ++n, { isWorkedExample: true }));
    for (let d = 1; d <= 5; d++) out.push(q(`booklet-s1-drill-${i}-${d}`, ++n));
  }
  return out;
}

function heightsFor(items: readonly FlowItem[]): Map<string, number> {
  const heights = new Map<string, number>();
  items.forEach((item, idx) => {
    const h = item.kind === "idea_capsule" ? 120 : item.kind === "idea_divider" ? 22 : item.kind === "accreditation_footer" ? 95 : 90 + ((idx * 97) % 260);
    heights.set(item.id, h);
    if (item.kind === "question" && item.span === "column") heights.set(fullWidthHeightKey(item.id), Math.round(h * 0.62));
  });
  return heights;
}

describe("booklet page economy", () => {
  const { items } = buildFlowItems({ questions: booklet(8), columnsCount: 2, includeAnswerKey: true });
  const heights = heightsFor(items);
  const base = packFlowItemsIntoPages(items, heights, OPTIONS);
  const best = packFlowItemsWithBestPracticeOrder(items, heights, OPTIONS);

  it("reports baseline vs optimised (informational)", () => {
    const rows = (pages: typeof base) => auditFlowPages(pages, heights).map((r) => r.rawFillRatio.toFixed(2)).join(" ");
    console.log(`BASE pages=${base.length} raw=[${rows(base)}]`);
    console.log(`BEST pages=${best.length} raw=[${rows(best)}]`);
    expect(best.length).toBeLessThanOrEqual(base.length);
  });

  it("never overflows and keeps every item exactly once", () => {
    expect(best.every((p) => !p.overflowsBudget)).toBe(true);
    const ids = (pages: typeof base) => pages.flatMap((p) => p.segments.flatMap((s) => (s.kind === "full" ? [s.item.id] : [...s.rightItems, ...s.leftItems].map((i) => i.id)))).sort();
    expect(ids(best)).toEqual(ids(base));
  });

  it("keeps the set of question numbers unchanged (renumbering is a permutation)", () => {
    const nums = (pages: typeof base) =>
      pages.flatMap((p) => p.segments.flatMap((s) => (s.kind === "full" ? [s.item] : [...s.rightItems, ...s.leftItems])))
        .flatMap((i) => (i.kind === "question" && !i.isAnswerCard ? [i.question.questionNumber] : []))
        .sort((a, b) => a - b);
    expect(nums(best)).toEqual(nums(base));
  });
});
