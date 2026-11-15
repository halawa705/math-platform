import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PageFillReportChip } from "../src/core/pdf-layout-engine/page-fill-report-chip";
import { buildSolutionSplitVariants } from "../src/core/pdf-layout-engine/flow-solution-split-variants-builder";
import { optimizePagesWithSolutionSplits } from "../src/core/pdf-layout-engine/flow-page-solution-split-optimizer";
import { packFlowItemsIntoPages } from "../src/core/pdf-layout-engine/flow-page-packer";
import { auditFlowPages } from "../src/core/pdf-layout-engine/flow-layout-quality-audit";
import { FLOW_DENSITY_PROFILES } from "../src/core/pdf-layout-engine/flow-page-geometry-constants";
import type { FlowItem, FlowPage } from "../src/core/pdf-layout-engine/flow-item-model";
import type { GeneratedMathQuestion } from "../src/core/ssot/pdf-print-settings-ssot";

function makeQuestion(id: string, stepsCount: number, isWorkedExample: boolean): GeneratedMathQuestion {
  return {
    id,
    branchId: "plane_geometry",
    questionType: "essay_proof",
    difficulty: "medium",
    marks: 3,
    promptAr: `في الشكل المقابل، أثبت أن القطعة المتوسطة توازي الضلع الثالث (${id}).`,
    answerSpaceLines: 2,
    isWorkedExample,
    ideaIndex: 1,
    ideaTitleAr: "الفكرة الأولى",
    correctAnswerAr: "البرهان مكتمل",
    solutionStepsAr: Array.from({ length: stepsCount }, (_, i) => `الخطوة (${i + 1}): بما أن المنتصف محقق إذن التوازي ثابت.`),
  };
}

describe("Flow Booklet Page Count & Honest Raw Fill Regression (Track A)", () => {
  it("PageFillReportChip displays rawFillRatio (honest pre-stretch occupancy) instead of post-stretch fillRatio", () => {
    const qItem: FlowItem = {
      id: "q-1",
      kind: "question",
      span: "full",
      question: makeQuestion("q-1", 0, false),
      displayNumber: 1,
      isWorkedExample: false,
      ideaIndex: 1,
    };

    const pages: FlowPage[] = [
      {
        pageNumber: 1,
        isFirstPage: true,
        budgetHeightPx: 1000,
        usedHeightPx: 850,
        gapPx: 6,
        overflowsBudget: false,
        segments: [{ kind: "full", item: qItem, heightPx: 630 }],
        targetHeightPxById: { "q-1": 850 },
      },
      {
        pageNumber: 2,
        isFirstPage: false,
        budgetHeightPx: 1000,
        usedHeightPx: 950,
        gapPx: 6,
        overflowsBudget: false,
        segments: [{ kind: "full", item: { ...qItem, id: "q-2" }, heightPx: 950 }],
        targetHeightPxById: { "q-2": 950 },
      },
    ];
    const heights = new Map<string, number>([
      ["q-1", 630], // raw 63%
      ["q-2", 950], // raw 95%
    ]);

    const html = renderToStaticMarkup(
      React.createElement(PageFillReportChip, {
        pages,
        heights,
        numeralMode: "western",
      }),
    );

    expect(html).toContain("63%");
    expect(html).not.toContain("85%");
    expect(html).toContain("95%");
  });

  it("buildSolutionSplitVariants allows 1-step heads (MIN_HEAD_STEPS = 1) so tight pages can pack prompt + step 1", () => {
    const exItem: FlowItem = {
      id: "ex-1",
      kind: "question",
      span: "column",
      question: makeQuestion("ex-1", 4, true),
      displayNumber: 1,
      isWorkedExample: true,
      ideaIndex: 1,
    };

    const map = buildSolutionSplitVariants([exItem]);
    const variants = map.get("ex-1");
    expect(variants).toBeDefined();
    expect(variants![0].k).toBe(1);
    expect(variants![0].head.solutionSlice).toEqual({ from: 0, to: 1, total: 4 });
    expect(variants![0].tail.solutionSlice).toEqual({ from: 1, to: 4, total: 4 });
  });

  it("optimizePagesWithSolutionSplits splits a worked-example pair across page boundary when prior page rawFill < 72%", () => {
    const items: FlowItem[] = [
      {
        id: "drill-1",
        kind: "question",
        span: "column",
        question: makeQuestion("drill-1", 0, false),
        displayNumber: 1,
        isWorkedExample: false,
        ideaIndex: 1,
      },
      {
        id: "drill-2",
        kind: "question",
        span: "column",
        question: makeQuestion("drill-2", 0, false),
        displayNumber: 2,
        isWorkedExample: false,
        ideaIndex: 1,
      },
      {
        id: "banner-2",
        kind: "idea_divider",
        span: "full",
        ideaIndex: 2,
        titleText: "الفكرة الثانية",
      },
      {
        id: "ex-2-1",
        kind: "question",
        span: "column",
        question: makeQuestion("ex-2-1", 4, true),
        displayNumber: 1,
        isWorkedExample: true,
        ideaIndex: 2,
      },
      {
        id: "ex-2-2",
        kind: "question",
        span: "column",
        question: makeQuestion("ex-2-2", 4, true),
        displayNumber: 2,
        isWorkedExample: true,
        ideaIndex: 2,
      },
      {
        id: "drill-2-1",
        kind: "question",
        span: "column",
        question: makeQuestion("drill-2-1", 0, false),
        displayNumber: 3,
        isWorkedExample: false,
        ideaIndex: 2,
      },
      {
        id: "drill-2-2",
        kind: "question",
        span: "column",
        question: makeQuestion("drill-2-2", 0, false),
        displayNumber: 4,
        isWorkedExample: false,
        ideaIndex: 2,
      },
    ];

    const heights = new Map<string, number>([
      ["drill-1", 580],
      ["drill-2", 580],
      ["banner-2", 44],
      ["ex-2-1", 460],
      ["ex-2-2", 460],
      ["drill-2-1", 520],
      ["drill-2-2", 520],
      ["ex-2-1~head1", 260],
      ["ex-2-1~tail1", 220],
      ["ex-2-1~head2", 310],
      ["ex-2-1~tail2", 170],
      ["ex-2-2~head1", 260],
      ["ex-2-2~tail1", 220],
      ["ex-2-2~head2", 310],
      ["ex-2-2~tail2", 170],
    ]);

    const packOnce = (cand: readonly FlowItem[]) =>
      packFlowItemsIntoPages(cand, heights, {
        budgets: { firstPagePx: 960, firstPageCompactPx: 960, nextPagePx: 960 },
        density: FLOW_DENSITY_PROFILES.standard_balanced,
      });

    const basePages = packOnce(items);
    const optimized = optimizePagesWithSolutionSplits(items, heights, basePages, packOnce);

    const audit = auditFlowPages(optimized.pages, heights);
    expect(optimized.pages.length).toBe(2);
    expect(audit[0].rawFillRatio).toBeGreaterThanOrEqual(0.88);
  });
});
