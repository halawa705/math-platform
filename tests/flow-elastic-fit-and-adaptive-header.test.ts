/**
 * @file flow-elastic-fit-and-adaptive-header.test.ts
 * @description اختبارات التحقق من نظام المرونة الميكروية والترويسة التكيفية:
 * 1. الترويسة الأمامية المرنة: تصغر للمدمجة عند حاجة الصفحة الأولى للمساحة وتبقى فخمة عند وفرة المساحة.
 * 2. المرونة الميكروية (Elastic Glue): استيعاب الفائض اليسير (حتى 55px) دون انهيار التوزيع عند تغيير حجم الخط.
 * 3. التمهيد المرن للكبسولة عند الفراغات الكبيرة لمنع ظاهرة نصف الصفحة الفارغ.
 */

import { describe, expect, it } from "vitest";
import { resolveAdaptiveFirstPageHeader, COMPACT_HEADER_HEIGHT_SAVING_PX } from "../src/core/pdf-layout-engine/adaptive-page-header-budget-resolver";
import { resolveElasticPageFit, MAX_ELASTIC_ABSORPTION_LIMIT_PX } from "../src/core/pdf-layout-engine/flow-elastic-fit-resolver";
import { buildFlowItems } from "../src/core/pdf-layout-engine/flow-items-builder";
import { packFlowItemsIntoPages } from "../src/core/pdf-layout-engine/flow-page-packer";
import { FLOW_DENSITY_PROFILES } from "../src/core/pdf-layout-engine/flow-page-geometry-constants";
import type { PrintableMathQuestionItem } from "../src/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import type { FlowPageSegment } from "../src/core/pdf-layout-engine/flow-item-model";

function createMockQuestion(id: string, n: number, partial: Partial<PrintableMathQuestionItem> = {}): PrintableMathQuestionItem {
  return {
    id,
    questionNumber: n,
    kind: "essay_algebra",
    branchBadgeAr: "هندسة",
    marks: 2,
    promptAr: "في الشكل المقابل، احسب قيمة س.",
    modelAnswerAr: "س = 10",
    ...partial,
  };
}

describe("Adaptive First Page Header Resolution", () => {
  it("keeps standard majestic header when content fits within standard budget", () => {
    const decision = resolveAdaptiveFirstPageHeader({
      standardFirstPageBudgetPx: 915,
      requiredFirstPageHeightPx: 850,
    });
    expect(decision.isHeaderCompact).toBe(false);
    expect(decision.effectiveFirstPageBudgetPx).toBe(915);
    expect(decision.spaceSavedPx).toBe(0);
  });

  it("automatically switches to compact header when page needs up to 48px to prevent overflow", () => {
    // المحتوى 940px (يفيض عن 915px بـ 25px فقط)
    const decision = resolveAdaptiveFirstPageHeader({
      standardFirstPageBudgetPx: 915,
      requiredFirstPageHeightPx: 940,
    });
    expect(decision.isHeaderCompact).toBe(true);
    expect(decision.effectiveFirstPageBudgetPx).toBe(915 + COMPACT_HEADER_HEIGHT_SAVING_PX);
    expect(decision.spaceSavedPx).toBe(COMPACT_HEADER_HEIGHT_SAVING_PX);
  });

  it("respects manual lock if user explicitly enabled compact header", () => {
    const decision = resolveAdaptiveFirstPageHeader({
      standardFirstPageBudgetPx: 915,
      requiredFirstPageHeightPx: 700,
      manualCompactHeaderSetting: true,
    });
    expect(decision.isHeaderCompact).toBe(true);
    expect(decision.effectiveFirstPageBudgetPx).toBe(915 + COMPACT_HEADER_HEIGHT_SAVING_PX);
  });
});

describe("Knuth-Plass Micro-Elasticity Resolver", () => {
  it("accepts content immediately when within budget without elasticity", () => {
    const dummySegments: FlowPageSegment[] = [];
    const result = resolveElasticPageFit({
      segments: dummySegments,
      usedHeightPx: 900,
      budgetPx: 915,
      gapPx: 6,
    });
    expect(result.fits).toBe(true);
    expect(result.absorbedPx).toBe(0);
  });

  it("absorbs small font-scaling overflow (up to 55px) through gap, padding, and diagram elasticity", () => {
    const q1 = createMockQuestion("q1", 1, { geometryFigure: {} as any });
    const q2 = createMockQuestion("q2", 2, { geometryFigure: {} as any });
    const segments: FlowPageSegment[] = [
      { kind: "full", item: { id: "cap1", kind: "idea_capsule", span: "full", anchorQuestion: q1, ideaIndex: 1 }, heightPx: 100 },
      { kind: "columns", rightItems: [{ id: "q1", kind: "question", span: "column", question: q1 }], leftItems: [{ id: "q2", kind: "question", span: "column", question: q2 }], heightPx: 350 },
      { kind: "full", item: { id: "foot", kind: "accreditation_footer", span: "full" }, heightPx: 90 },
    ];

    // الفائض 25px فقط (نتيجة تكبير الخط مثلاً إلى 12.5pt)
    const result = resolveElasticPageFit({
      segments,
      usedHeightPx: 1025,
      budgetPx: 1000,
      gapPx: 8,
    });

    expect(result.fits).toBe(true);
    expect(result.absorbedPx).toBe(25);
    expect(result.adjustedGapPx).toBeLessThan(8);
  });

  it("rejects overflow that exceeds the safe elastic limit (> 55px)", () => {
    const segments: FlowPageSegment[] = [];
    const result = resolveElasticPageFit({
      segments,
      usedHeightPx: 1100,
      budgetPx: 1000,
      gapPx: 4,
    });
    expect(result.fits).toBe(false);
    expect(result.absorbedPx).toBe(0);
  });
});

describe("Page Packer Integration with Flexible Introductory Capsule", () => {
  it("allows idea capsule to serve as introductory concept at page bottom when large void would otherwise occur", () => {
    // 4 تدريبات من الفكرة 1 تملأ حوالي 400px، ثم تأتي كبسولة الفكرة 2 (~120px)
    // ومثالا الفكرة 2 طويلان جداً (لا يتسعان معاً في الصفحة)
    const questions: PrintableMathQuestionItem[] = [
      createMockQuestion("booklet-s1-drill-1-1", 1),
      createMockQuestion("booklet-s1-drill-1-2", 2),
      createMockQuestion("booklet-s1-drill-1-3", 3),
      createMockQuestion("booklet-s1-drill-1-4", 4),
      createMockQuestion("booklet-s1-example-2-1", 5, { isWorkedExample: true, ideaBannerTitleAr: "الفكرة 2: التوازي المركب" }),
      createMockQuestion("booklet-s1-example-2-2", 6, { isWorkedExample: true }),
    ];

    const { items } = buildFlowItems({
      questions,
      columnsCount: 2,
      includeAnswerKey: false,
    });

    const heights = new Map<string, number>();
    items.forEach((it) => {
      // التدريبات تأخذ 200px، الكبسولة 100px، بينما الأمثلة ضخمة جداً (500px لكل مثال)
      if (it.kind === "idea_capsule") heights.set(it.id, 100);
      else if (it.kind === "question" && it.isWorkedExample) heights.set(it.id, 500);
      else heights.set(it.id, 180);
    });

    const pages = packFlowItemsIntoPages(items, heights, {
      budgets: { firstPagePx: 600, nextPagePx: 600 },
      density: FLOW_DENSITY_PROFILES.standard_balanced,
    });

    // بدلاً من ترك الصفحة الأولى فارغة تماماً بالتدريبات فقط ورمي الكبسولة للصفحة التالية،
    // تُقبل الكبسولة في أسفل الصفحة الأولى كتمهيد نظري راقٍ
    const firstPageItems = pages[0].segments.flatMap((s) => s.kind === "full" ? [s.item] : [...s.rightItems, ...s.leftItems]);
    const hasIntroductoryCapsule = firstPageItems.some((it) => it.kind === "idea_capsule" && (it as any).ideaIndex === 2);
    expect(hasIntroductoryCapsule).toBe(true);
  });
});
