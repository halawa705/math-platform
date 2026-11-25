/**
 * @file flow-two-column-booklet-integrity.test.ts
 * @description اختبارات تراجع لسلامة التخطيط الثنائي العمودي وتقسيم الخطوات الآمن رياضياً:
 * ١. بقاء زوج الأمثلة المحلولة في عمودين دائماً حتى عند تفاوت الخطوات أو قص الحل بين صفحتين.
 * ٢. منع سرقة تدريب يتيم بالعرض الكامل في أسفل الصفحة قبل شقيقه عند وجود عدد زوجي من التدريبات.
 * ٣. تدفق التدريب الأول مرناً أسفل المثال الأقصر في العمود الأيسر مع حفظ الترتيب الحرفي للقراءة.
 * ٤. حماية القيمة المطلقة `$|-2| = 2$` من التمزيق عند الفاصل `|` مع استمرار الفصل على ` | ` خارج الرياضيات.
 */

import { describe, expect, it } from "vitest";
import { mergeLogicalSolutionSteps } from "../ingestion/notebooklm-exam-questions-parser";
import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import { fullWidthHeightKey, type FlowItem, type FlowPage } from "./flow-item-model";
import { buildFlowItems } from "./flow-items-builder";
import { FLOW_DENSITY_PROFILES } from "./flow-page-geometry-constants";
import { packFlowItemsIntoPages } from "./flow-page-packer";
import { buildSegmentsForSlice } from "./flow-page-segments-builder";
import { buildSolutionSplitVariants } from "./flow-solution-split-variants-builder";

function makeQ(id: string, n: number, extra: Partial<PrintableMathQuestionItem> = {}): PrintableMathQuestionItem {
  return {
    id,
    questionNumber: n,
    kind: "essay_algebra",
    branchBadgeAr: "",
    marks: 2,
    promptAr: "أوجد معادلة الخط المستقيم",
    modelAnswerAr: "ص = س + ١",
    ...extra,
  };
}

const makeSteps = (count: number) => Array.from({ length: count }, (_, idx) => `خطوة ${idx + 1}`);

function buildHeightsMap(
  items: readonly FlowItem[],
  customColHeight: (item: Extract<FlowItem, { kind: "question" }>) => number
): Map<string, number> {
  const heights = new Map<string, number>();
  const setQ = (it: FlowItem) => {
    if (it.kind === "idea_capsule") {
      heights.set(it.id, 130);
      return;
    }
    if (it.kind === "accreditation_footer") {
      heights.set(it.id, 90);
      return;
    }
    if (it.kind === "question") {
      const h = customColHeight(it);
      heights.set(it.id, h);
      heights.set(`${it.id}::col`, h);
      heights.set(fullWidthHeightKey(it.id), Math.round(h * 0.65));
    }
  };
  items.forEach(setQ);
  for (const vs of buildSolutionSplitVariants(items).values()) {
    vs.forEach((v) => {
      setQ(v.head);
      setQ(v.tail);
    });
  }
  return heights;
}

function flattenPageReadingOrder(page: FlowPage): FlowItem[] {
  return page.segments.flatMap((s) => (s.kind === "full" ? [s.item] : [...s.rightItems, ...s.leftItems]));
}

describe("two-column booklet integrity & math-safe step splitting", () => {
  it("keeps worked-example pairs in vertical 2-column segments even when heights differ or solution splits occur", () => {
    const qs: PrintableMathQuestionItem[] = [
      makeQ("booklet-s1-example-1-1", 1, {
        isWorkedExample: true,
        ideaBannerTitleAr: "الفكرة الأولى",
        conceptExplanationAr: "شرح ١",
        framedRuleAr: "قاعدة ١",
        solutionStepsAr: makeSteps(6),
      }),
      makeQ("booklet-s1-example-1-2", 2, {
        isWorkedExample: true,
        solutionStepsAr: makeSteps(3),
      }),
      ...Array.from({ length: 4 }, (_, i) => makeQ(`booklet-s1-drill-1-${i + 1}`, 3 + i)),
      makeQ("booklet-s1-example-2-1", 7, {
        isWorkedExample: true,
        ideaBannerTitleAr: "الفكرة الثانية",
        conceptExplanationAr: "شرح ٢",
        framedRuleAr: "قاعدة ٢",
        solutionStepsAr: makeSteps(6),
      }),
      makeQ("booklet-s1-example-2-2", 8, {
        isWorkedExample: true,
        solutionStepsAr: makeSteps(3),
      }),
      ...Array.from({ length: 4 }, (_, i) => makeQ(`booklet-s1-drill-2-${i + 1}`, 9 + i)),
    ];

    const { items } = buildFlowItems({
      questions: qs,
      columnsCount: 2,
      includeAnswerKey: false,
      answerVisibilityMode: "questions_only",
    });

    const heights = buildHeightsMap(items, (it) => {
      if (it.solutionSlice) {
        const count = it.solutionSlice.to - it.solutionSlice.from;
        return (it.solutionSlice.isTail ? 34 : 150) + count * 52;
      }
      if (it.isWorkedExample) {
        return 150 + (it.question.solutionStepsAr?.length ?? 0) * 52;
      }
      return 185;
    });

    const pages = packFlowItemsIntoPages(items, heights, {
      budgets: { firstPagePx: 915, firstPageCompactPx: 955, nextPagePx: 1020 },
      density: FLOW_DENSITY_PROFILES.ultra_compact,
    });

    expect(pages.some((p) => p.overflowsBudget)).toBe(false);
    // لا يجوز أبداً تحويل أي مثال محلول (أو جزء منه) إلى عرض كامل في وضع العمودين
    for (const page of pages) {
      for (const seg of page.segments) {
        if (seg.kind === "full" && seg.item.kind === "question") {
          expect(seg.item.isWorkedExample).toBeFalsy();
          expect(seg.item.solutionSlice).toBeUndefined();
        }
      }
    }
  });

  it("never steals a lone drill as a full-width slab before its sibling on the next page", () => {
    const qs: PrintableMathQuestionItem[] = [
      makeQ("booklet-s1-example-1-1", 1, {
        isWorkedExample: true,
        ideaBannerTitleAr: "الفكرة الأولى",
        conceptExplanationAr: "شرح",
        framedRuleAr: "قاعدة",
        solutionStepsAr: makeSteps(3),
      }),
      makeQ("booklet-s1-example-1-2", 2, {
        isWorkedExample: true,
        solutionStepsAr: makeSteps(3),
      }),
      ...Array.from({ length: 4 }, (_, i) => makeQ(`booklet-s1-drill-1-${i + 1}`, 3 + i)),
    ];

    const { items } = buildFlowItems({
      questions: qs,
      columnsCount: 2,
      includeAnswerKey: false,
      answerVisibilityMode: "questions_only",
    });

    const heights = buildHeightsMap(items, (it) => (it.isWorkedExample ? 360 : 250));
    const pages = packFlowItemsIntoPages(items, heights, {
      budgets: { firstPagePx: 820, firstPageCompactPx: 850, nextPagePx: 1020 },
      density: FLOW_DENSITY_PROFILES.ultra_compact,
    });

    for (const page of pages) {
      for (const seg of page.segments) {
        if (seg.kind === "full" && seg.item.kind === "question") {
          throw new Error(`Unexpected full-width drill ${seg.item.id} for an even-count drill set`);
        }
      }
    }
  });

  it("absorbs the first drill under a much shorter left worked example while preserving exact reading order", () => {
    const qs: PrintableMathQuestionItem[] = [
      makeQ("booklet-s1-example-1-1", 1, {
        isWorkedExample: true,
        ideaBannerTitleAr: "الفكرة الأولى",
        conceptExplanationAr: "شرح",
        framedRuleAr: "قاعدة",
        solutionStepsAr: makeSteps(7),
      }),
      makeQ("booklet-s1-example-1-2", 2, {
        isWorkedExample: true,
        solutionStepsAr: makeSteps(2),
      }),
      makeQ("booklet-s1-drill-1-1", 3),
      makeQ("booklet-s1-drill-1-2", 4),
    ];

    const { items } = buildFlowItems({
      questions: qs,
      columnsCount: 2,
      includeAnswerKey: false,
      answerVisibilityMode: "questions_only",
    });
    const qOnly = items.filter((i): i is Extract<FlowItem, { kind: "question" }> => i.kind === "question");
    const heights = new Map<string, number>([
      [qOnly[0].id, 510],
      [qOnly[1].id, 240],
      [qOnly[2].id, 190],
      [qOnly[3].id, 190],
    ]);

    const segs = buildSegmentsForSlice(
      qOnly,
      (it) => heights.get(it.id) ?? 200,
      heights,
      2,
      () => 40
    );

    expect(segs[0].kind).toBe("columns");
    if (segs[0].kind === "columns") {
      expect(segs[0].rightItems.map((i) => i.id)).toEqual([qOnly[0].id]);
      expect(segs[0].leftItems.map((i) => i.id)).toEqual([qOnly[1].id, qOnly[2].id]);
    }
    const order = flattenPageReadingOrder({
      pageNumber: 1,
      isFirstPage: true,
      segments: segs,
      usedHeightPx: 510,
      budgetHeightPx: 900,
      gapPx: 2,
      targetHeightPxById: {},
      overflowsBudget: false,
    }).map((i) => i.id);
    expect(order).toEqual(qOnly.map((q) => q.id));
  });

  it("preserves absolute value pipe delimiters inside $...$ while still splitting outside math", () => {
    const raw =
      "خطوة 1: طول الجزء المقطوع هو $|-2| = 2$ وحدة طول.\n" +
      "خطوة 2: حساب القيمة $|a| \\times |b| = 6$ | خطوة 3: الناتج النهائي $x = 3$";
    const steps = mergeLogicalSolutionSteps(raw);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toContain("$|-2| = 2$");
    expect(steps[1]).toContain("$|a| \\times |b| = 6$");
    expect(steps[2]).toContain("$x = 3$");
  });
});
