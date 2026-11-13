import { describe, expect, it } from "vitest";
import { buildFlowItems } from "@/core/pdf-layout-engine/flow-items-builder";
import { FLOW_DENSITY_PROFILES } from "@/core/pdf-layout-engine/flow-page-geometry-constants";
import { packFlowItemsIntoPages } from "@/core/pdf-layout-engine/flow-page-packer";
import { buildSolutionSplitVariants } from "@/core/pdf-layout-engine/flow-solution-split-variants-builder";
import type { FlowItem, FlowPage } from "@/core/pdf-layout-engine/flow-item-model";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";

const BUDGETS = { firstPagePx: 1000, nextPagePx: 1000 } as const;
const STEPS = ["1", "2", "3", "4", "5"];

function q(id: string, n: number, extra: Partial<PrintableMathQuestionItem> = {}): PrintableMathQuestionItem {
  return { id, questionNumber: n, kind: "essay_algebra", branchBadgeAr: "", marks: 2, promptAr: "س", modelAnswerAr: "ج", solutionStepsAr: STEPS, ...extra };
}

function flat(page: FlowPage): FlowItem[] {
  return page.segments.flatMap((s) => (s.kind === "full" ? [s.item] : [...s.rightItems, ...s.leftItems]));
}

function scenario() {
  const questions = [
    q("booklet-s1-example-1-1", 1, { ideaBannerTitleAr: "الفكرة 1", conceptExplanationAr: "ش", framedRuleAr: "ق" }),
    q("booklet-s1-example-1-2", 2),
    q("booklet-s1-example-1-3", 3),
    q("booklet-s1-example-1-4", 4),
  ];
  const { items } = buildFlowItems({ questions, columnsCount: 1, includeAnswerKey: false, includeAccreditation: false });
  const heights = new Map<string, number>();
  for (const it of items) heights.set(it.id, it.kind === "idea_capsule" ? 120 : it.kind === "idea_divider" ? 22 : it.id.endsWith("-2") ? 700 : 300);
  for (const vs of buildSolutionSplitVariants(items).values()) {
    for (const v of vs) {
      heights.set(v.head.id, 200 + 60 * v.k);
      heights.set(v.tail.id, 80 + 60 * (STEPS.length - v.k));
    }
  }
  return { items, heights };
}

describe("solution split optimizer", () => {
  const { items, heights } = scenario();
  const density = FLOW_DENSITY_PROFILES.ultra_compact;
  const noVariantHeights = new Map([...heights].filter(([id]) => !id.includes("~")));
  const baseline = packFlowItemsIntoPages(items, noVariantHeights, { budgets: BUDGETS, density });
  const pages = packFlowItemsIntoPages(items, heights, { budgets: BUDGETS, density });

  it("without variant measurements nothing is split", () => {
    expect(baseline.flatMap(flat).some((i) => i.kind === "question" && i.solutionSlice)).toBe(false);
  });

  it("splits a solved example so page 1 takes >= 2 whole steps and the rest continues, never more pages", () => {
    const all = pages.flatMap(flat);
    const head = all.find((i) => i.kind === "question" && i.solutionSlice?.from === 0);
    const tail = all.find((i) => i.kind === "question" && i.solutionSlice && i.solutionSlice.from > 0);
    expect(head && head.kind === "question" && head.solutionSlice!.to).toBeGreaterThanOrEqual(2);
    expect(tail).toBeDefined();
    if (head?.kind === "question" && tail?.kind === "question") {
      expect(tail.solutionSlice!.from).toBe(head.solutionSlice!.to);
      expect(tail.solutionSlice!.to).toBe(STEPS.length);
      const pageOf = (id: string) => pages.findIndex((p) => flat(p).some((i) => i.id === id));
      expect(pageOf(tail.id)).toBeGreaterThan(pageOf(head.id));
    }
    expect(pages.length).toBeLessThanOrEqual(baseline.length);
    expect(pages.every((p) => !p.overflowsBudget)).toBe(true);
  });

  it("reduces bottom slack of non-last pages", () => {
    const slack = (ps: readonly FlowPage[]) => ps.slice(0, -1).reduce((s, p) => s + (1 - p.usedHeightPx / p.budgetHeightPx), 0);
    expect(slack(pages)).toBeLessThan(slack(baseline));
  });

  it("never leaves a 1-step orphan tail when >= 4 steps and never splits an item without pulling head onto the slack page", () => {
    const allVariants = [...buildSolutionSplitVariants(items).values()].flat();
    expect(allVariants.every((v) => STEPS.length - v.k >= 2)).toBe(true);

    // صفحة 0 بها فراغ لكن رأس المثال التالي لا يسعه فراغ صفحة 0: يمنع تقسيمه على صفحة 1 وترك رأس يتيم بها
    const tightItems = [
      q("booklet-s1-example-1-1", 1, { ideaBannerTitleAr: "الفكرة 1", conceptExplanationAr: "ش", framedRuleAr: "ق" }),
      q("booklet-s1-example-1-2", 2),
    ];
    const built = buildFlowItems({ questions: tightItems, columnsCount: 1, includeAnswerKey: false, includeAccreditation: false });
    const h2 = new Map<string, number>();
    for (const it of built.items) h2.set(it.id, it.kind === "idea_capsule" ? 120 : it.kind === "idea_divider" ? 22 : it.id.endsWith("-1") ? 720 : 860);
    for (const vs of buildSolutionSplitVariants(built.items).values()) {
      for (const v of vs) {
        h2.set(v.head.id, 450); // أكبر من الفراغ المتبقي في صفحة 0 (~100px)
        h2.set(v.tail.id, 420);
      }
    }
    const tightPages = packFlowItemsIntoPages(built.items, h2, { budgets: BUDGETS, density });
    expect(tightPages.flatMap(flat).some((i) => i.kind === "question" && i.solutionSlice)).toBe(false);
  });
});
