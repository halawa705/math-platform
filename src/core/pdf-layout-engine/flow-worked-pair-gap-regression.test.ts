/**
 * @file flow-worked-pair-gap-regression.test.ts
 * @description اختبار تراجع لخطأ «الصفحة 2»: رأس مثال وحيد في عمود والعمود المجاور فارغ بينما شقيقه (المثال التالي)
 * يُرحَّل كاملاً للصفحة التالية. يمسح مئات التوليفات (ارتفاعات تدريبات، عدد خطوات، عدد تدريبات) ويتحقق:
 * لا عمود فارغ بجوار رأس مقطوع، ولا فيض، وكل كائن مرة واحدة بالترتيب، وسلوك «الصفحة 5» (قطع الزوج معاً) محفوظ.
 */

import { describe, expect, it } from "vitest";
import { buildFlowItems } from "./flow-items-builder";
import { FLOW_DENSITY_PROFILES } from "./flow-page-geometry-constants";
import { packFlowItemsIntoPages } from "./flow-page-packer";
import { fullWidthHeightKey, type FlowItem, type FlowPage } from "./flow-item-model";
import { buildSolutionSplitVariants } from "./flow-solution-split-variants-builder";
import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

const STEP_PX = 58;
const HEAD_PX = 170;
const OPTIONS = { budgets: { firstPagePx: 915, nextPagePx: 1020 }, density: FLOW_DENSITY_PROFILES.ultra_compact } as const;

function q(id: string, n: number, extra: Partial<PrintableMathQuestionItem> = {}): PrintableMathQuestionItem {
  return { id, questionNumber: n, kind: "essay_algebra", branchBadgeAr: "", marks: 2, promptAr: "س", modelAnswerAr: "ج", ...extra };
}

const steps = (n: number) => Array.from({ length: n }, (_, i) => `خطوة ${i + 1}`);

function heightsFor(items: readonly FlowItem[], drillPx: number): Map<string, number> {
  const h = new Map<string, number>();
  const put = (it: FlowItem) => {
    if (it.kind === "idea_capsule") h.set(it.id, 120);
    else if (it.kind === "accreditation_footer") h.set(it.id, 95);
    else if (it.kind === "question") {
      const slice = it.solutionSlice;
      const total = it.question.solutionStepsAr?.length ?? 0;
      const base = !it.isWorkedExample
        ? drillPx
        : slice
          ? (slice.isTail ? 30 : HEAD_PX) + STEP_PX * (slice.to - slice.from)
          : HEAD_PX + STEP_PX * total;
      h.set(it.id, base);
      h.set(`${it.id}::col`, base);
      h.set(fullWidthHeightKey(it.id), Math.round(base * 0.7));
    }
  };
  items.forEach(put);
  for (const vs of buildSolutionSplitVariants(items).values()) vs.forEach((v) => { put(v.head); put(v.tail); });
  return h;
}

function bookletCase(drills2: number, steps1: number, steps2: number): readonly FlowItem[] {
  const qs: PrintableMathQuestionItem[] = [
    q("booklet-s1-example-1-1", 1, { isWorkedExample: true, ideaBannerTitleAr: "ف1", conceptExplanationAr: "ش", framedRuleAr: "ق", solutionStepsAr: steps(4) }),
    q("booklet-s1-example-1-2", 2, { isWorkedExample: true, solutionStepsAr: steps(4) }),
    ...Array.from({ length: 10 }, (_, i) => q(`booklet-s1-drill-1-${i + 1}`, 3 + i)),
    q("booklet-s1-example-2-1", 20, { isWorkedExample: true, ideaBannerTitleAr: "ف2", conceptExplanationAr: "ش", framedRuleAr: "ق", solutionStepsAr: steps(steps1) }),
    q("booklet-s1-example-2-2", 21, { isWorkedExample: true, solutionStepsAr: steps(steps2) }),
    ...Array.from({ length: drills2 }, (_, i) => q(`booklet-s1-drill-2-${i + 1}`, 30 + i)),
  ];
  return buildFlowItems({ questions: qs, columnsCount: 2, includeAnswerKey: false, answerVisibilityMode: "questions_only" }).items;
}

const flat = (p: FlowPage) => p.segments.flatMap((s) => (s.kind === "full" ? [s.item] : [...s.rightItems, ...s.leftItems]));

function hasLonelyCutHead(pages: readonly FlowPage[]): boolean {
  return pages.slice(0, -1).some((p) =>
    p.segments.some(
      (s) =>
        s.kind === "columns" &&
        (s.leftItems.length === 0 || s.rightItems.length === 0) &&
        [...s.rightItems, ...s.leftItems].some((i) => i.kind === "question" && i.solutionSlice && !i.solutionSlice.isTail)
    )
  );
}

describe("worked-pair gap regression (page-2 bug)", () => {
  const cases: Array<{ label: string; items: readonly FlowItem[]; heights: Map<string, number> }> = [];
  for (const drillPx of [130, 145, 160, 175, 190, 205, 220, 235, 250]) {
    for (const d2 of [2, 3, 4, 5, 6, 7, 8]) {
      for (const s1 of [4, 5, 6, 7, 8]) {
        for (const s2 of [3, 5, 7, 9]) {
          const items = bookletCase(d2, s1, s2);
          cases.push({ label: `drill=${drillPx} d2=${d2} s1=${s1} s2=${s2}`, items, heights: heightsFor(items, drillPx) });
        }
      }
    }
  }
  const results = cases.map((c) => ({ ...c, pages: packFlowItemsIntoPages(c.items, c.heights, OPTIONS) }));

  it("never leaves a cut example head alone beside an empty column", () => {
    const bad = results.filter((r) => hasLonelyCutHead(r.pages)).map((r) => r.label);
    expect(bad).toEqual([]);
  });

  it("never overflows and never splits head and tail onto the same page", () => {
    results.forEach((r) => {
      expect(r.pages.some((p) => p.overflowsBudget)).toBe(false);
      r.pages.forEach((p) => {
        const qids = flat(p).filter((i) => i.kind === "question" && i.solutionSlice).map((i) => (i.kind === "question" ? i.question.id : ""));
        expect(new Set(qids).size).toBe(qids.length);
      });
    });
  });

  it("keeps every original question exactly once and in reading order", () => {
    results.forEach((r) => {
      const firstSeen: string[] = [];
      const heads = new Set<string>();
      const tails = new Set<string>();
      r.pages.forEach((p) =>
        flat(p).forEach((i) => {
          const id = i.kind === "question" ? i.question.id : i.id;
          if (!firstSeen.includes(id)) firstSeen.push(id);
          if (i.kind === "question" && i.solutionSlice) (i.solutionSlice.isTail ? tails : heads).add(id);
        })
      );
      const expected = r.items.map((i) => (i.kind === "question" ? i.question.id : i.id));
      expect(firstSeen).toEqual(expected);
      expect([...heads].sort()).toEqual([...tails].sort());
    });
  });

  it("never uses more pages than packing with no solution cuts at all", () => {
    results.forEach((r) => {
      const noCuts = packFlowItemsIntoPages(r.items, r.heights, { ...OPTIONS, skipSolutionSplits: true });
      expect(r.pages.length).toBeLessThanOrEqual(noCuts.length);
    });
  });
});
