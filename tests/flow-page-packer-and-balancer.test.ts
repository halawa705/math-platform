import { describe, it, expect } from "vitest";
import { solveBalancedColumnSplit } from "../src/core/pdf-layout-engine/flow-column-balance-solver";
import { packFlowItemsIntoPages } from "../src/core/pdf-layout-engine/flow-page-packer";
import { packFlowItemsWithPageBalance } from "../src/core/pdf-layout-engine/flow-last-page-balancer";
import type { FlowItem } from "../src/core/pdf-layout-engine/flow-item-model";
import type { PrintableMathQuestionItem } from "../src/core/pdf-layout-engine/a4-vector-html-sheet-renderer";

const fakeQuestion = (id: string) => ({ id }) as unknown as PrintableMathQuestionItem;
const q = (id: string): FlowItem => ({ id, kind: "question", span: "column", question: fakeQuestion(id) });
const capsule = (n: number): FlowItem => ({ id: `cap${n}`, kind: "idea_capsule", span: "full", ideaIndex: n, anchorQuestion: fakeQuestion(`cap${n}`) });
const divider = (n: number): FlowItem => ({ id: `div${n}`, kind: "idea_divider", span: "full", ideaIndex: n });

describe("M4 — column balance solver", () => {
  it("splits equal items evenly and keeps order (right first)", () => {
    expect(solveBalancedColumnSplit([100, 100, 100, 100], 2)).toEqual({ rightCount: 2, heightPx: 202 });
  });
  it("balances uneven heights", () => {
    const split = solveBalancedColumnSplit([200, 60, 60, 60], 2);
    expect(split.rightCount).toBe(1);
    expect(split.heightPx).toBe(200);
  });
  it("single item stays right", () => {
    expect(solveBalancedColumnSplit([90], 2)).toEqual({ rightCount: 1, heightPx: 90 });
  });
});

describe("M4 — flow page packer", () => {
  it("keeps every item exactly once and in reading order", () => {
    const items = [capsule(1), q("a"), q("b"), q("c"), q("d"), divider(1), capsule(2), q("e"), q("f")];
    const heights = new Map(items.map((i) => [i.id, i.kind === "question" ? 150 : 60]));
    const pages = packFlowItemsIntoPages(items, heights, { budgetFactor: 1 });
    const flat = pages.flatMap((p) =>
      p.segments.flatMap((s) => (s.kind === "full" ? [s.item.id] : [...s.rightItems, ...s.leftItems].map((i) => i.id)))
    );
    expect(flat).toEqual(items.map((i) => i.id));
  });

  it("never leaves a capsule alone at the bottom of a page", () => {
    const items = [capsule(1), ...Array.from({ length: 11 }, (_, i) => q(`x${i}`)), capsule(2), q("last")];
    const heights = new Map(items.map((i) => [i.id, i.kind === "question" ? 190 : 100]));
    const pages = packFlowItemsIntoPages(items, heights, { budgetFactor: 1 });
    for (const page of pages) {
      const lastSeg = page.segments[page.segments.length - 1];
      if (lastSeg.kind === "full" && lastSeg.item.kind === "idea_capsule") {
        throw new Error(`capsule orphaned at page ${page.pageNumber}`);
      }
    }
  });

  it("fills pages using two columns (fewer pages than one-column stacking)", () => {
    const items = Array.from({ length: 16 }, (_, i) => q(`m${i}`));
    const heights = new Map(items.map((i) => [i.id, 180]));
    const pages = packFlowItemsIntoPages(items, heights, { budgetFactor: 1 });
    expect(pages.length).toBe(2);
    expect(pages[0].segments[0].kind).toBe("columns");
  });

  it("balances a nearly-empty last page", () => {
    const items = Array.from({ length: 17 }, (_, i) => q(`m${i}`));
    const heights = new Map(items.map((i) => [i.id, 180]));
    const raw = packFlowItemsIntoPages(items, heights, { budgetFactor: 1 });
    const balanced = packFlowItemsWithPageBalance(items, heights);
    expect(balanced.length).toBe(raw.length);
    const loads = balanced.map((p) => p.usedHeightPx / p.budgetHeightPx);
    expect(Math.min(...loads)).toBeGreaterThan(0.45);
  });

  it("page gap stays within 2..10px", () => {
    const items = [q("a"), q("b")];
    const pages = packFlowItemsIntoPages(items, new Map([["a", 100], ["b", 100]]), { budgetFactor: 1 });
    expect(pages[0].gapPx).toBeGreaterThanOrEqual(2);
    expect(pages[0].gapPx).toBeLessThanOrEqual(10);
  });
});
