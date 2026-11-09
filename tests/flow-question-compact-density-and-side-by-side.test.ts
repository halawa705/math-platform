/**
 * @file flow-question-compact-density-and-side-by-side.test.ts
 * @description اختبارات التحقق من نظام الكثافة الذكية والتوزيع الأمثل للأسئلة في المذكرات:
 * 1. وضع المثالين المحلولين للفكرة متجاورين جنباً إلى جنب (يمين ويسار) تحت الكبسولة دون انفصال.
 * 2. تكيف أسطر إجابة الطالب (1، 2، 3، صفر لـ MCQ) دون تمدد رأسي يلتهم مساحة الورقة.
 * 3. تصنيف كثافة البطاقة (فائقة الرشاقة، مدمجة، قياسية) لاستيعاب 6 إلى 8 أسئلة بالصفحة بكفاءة عالية.
 */

import { describe, expect, it } from "vitest";
import { resolveQuestionCardDensity } from "../src/core/pdf-layout-engine/question-card-compact-density-resolver";
import { resolveAdaptiveAnswerLinesCount } from "../src/core/pdf-layout-engine/question-answer-lines-adaptive-resolver";
import { buildFlowItems } from "../src/core/pdf-layout-engine/flow-items-builder";
import { buildSegmentsForSlice } from "../src/core/pdf-layout-engine/flow-page-segments-builder";
import { packFlowItemsIntoPages } from "../src/core/pdf-layout-engine/flow-page-packer";
import { FLOW_DENSITY_PROFILES } from "../src/core/pdf-layout-engine/flow-page-geometry-constants";
import type { PrintableMathQuestionItem } from "../src/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import type { FlowItem } from "../src/core/pdf-layout-engine/flow-item-model";

function makeQuestion(id: string, n: number, partial: Partial<PrintableMathQuestionItem> = {}): PrintableMathQuestionItem {
  return {
    id,
    questionNumber: n,
    kind: "essay_algebra",
    branchBadgeAr: "جبر",
    marks: 2,
    promptAr: "احسب قيمة س",
    modelAnswerAr: "س = 5",
    ...partial,
  };
}

describe("Intelligent Question Card Density & Adaptive Lines", () => {
  it("resolves adaptive answer lines correctly based on question complexity", () => {
    // 1. سؤال اختيار من متعدد لا يحتاج أسطر
    const mcqQ = makeQuestion("q-mcq", 1, {
      kind: "mcq",
      mcqChoicesAr: ["1", "2", "3", "4"],
    });
    expect(resolveAdaptiveAnswerLinesCount({ question: mcqQ })).toBe(0);

    // 2. سؤال حساب مباشر قصير يحتاج سطر واحد فقط
    const directQ = makeQuestion("q-direct", 2, {
      promptAr: "في الشكل المقابل، أوجد قياس زاوية ب جـ د.",
    });
    expect(resolveAdaptiveAnswerLinesCount({ question: directQ })).toBe(1);

    // 3. سؤال برهان هندسي يحتاج 3 أسطر
    const proofQ = makeQuestion("q-proof", 3, {
      promptAr: "في الشكل المقابل، أ ب // جـ د، أثبت بالبرهان أن المثلثين متطابقان.",
    });
    expect(resolveAdaptiveAnswerLinesCount({ question: proofQ })).toBe(3);

    // 4. سؤال قياسي عادي بدون برهان
    const stdQ = makeQuestion("q-std", 4, {
      promptAr: "حل المعادلة التالية في ح: ٢س + ٥ = ١٣ واكتب مجموعة الحل م.ح.",
    });
    expect(resolveAdaptiveAnswerLinesCount({ question: stdQ })).toBe(2);
  });

  it("resolves question density grade and compact padding correctly", () => {
    // سؤال فائق الرشاقة (قصير ومباشر)
    const shortQ = makeQuestion("q-short", 1, { promptAr: "أوجد قيمة: ٣ + ٤" });
    const shortDensity = resolveQuestionCardDensity({
      question: shortQ,
      isBookletSolvedExample: false,
      isAnswerCard: false,
      columnsCount: 2,
    });
    expect(shortDensity.grade).toBe("ultra_compact");
    expect(shortDensity.cardPaddingClass).toContain("p-1.5");

    // سؤال مدمج (متوسط أو به شكل)
    const diagQ = makeQuestion("q-diag", 2, {
      promptAr: "في الشكل المقابل أوجد قياس زاوية أ",
      geometryFigure: {} as any,
    });
    const diagDensity = resolveQuestionCardDensity({
      question: diagQ,
      isBookletSolvedExample: false,
      isAnswerCard: false,
      columnsCount: 2,
    });
    expect(diagDensity.grade).toBe("compact");
    expect(diagDensity.figureScaleFactor).toBeLessThanOrEqual(1.0);

    // سؤال قياسي (مثال بخطوات كثيرة أو بطاقة إجابة)
    const longSolvedQ = makeQuestion("q-long", 3, {
      solutionStepsAr: ["خطوة 1", "خطوة 2", "خطوة 3", "خطوة 4", "خطوة 5"],
    });
    const longDensity = resolveQuestionCardDensity({
      question: longSolvedQ,
      isBookletSolvedExample: true,
      isAnswerCard: false,
      columnsCount: 2,
    });
    expect(longDensity.grade).toBe("standard");
  });
});

describe("Side-by-Side Worked Examples Pairing", () => {
  it("strictly places the two worked examples side-by-side in columns under the idea capsule", () => {
    const questions: PrintableMathQuestionItem[] = [
      makeQuestion("booklet-s1-example-1-1", 1, {
        isWorkedExample: true,
        ideaBannerTitleAr: "الفكرة الأولى: التوازي والتبادل",
        conceptExplanationAr: "كل زاويتين متبادلتين متساويتان في القياس",
        framedRuleAr: "إذا توازى مستقيمان وقطعهما قاطع...",
        solutionStepsAr: ["الخطوة الأولى: أ ب // جـ د", "الناتج = 55°"],
      }),
      makeQuestion("booklet-s1-example-1-2", 2, {
        isWorkedExample: true,
        solutionStepsAr: ["الخطوة الأولى: هـ و قاطع لهما", "الناتج = 125°"],
      }),
      makeQuestion("booklet-s1-drill-1-1", 3, { promptAr: "تدريب حاول بنفسك 1" }),
      makeQuestion("booklet-s1-drill-1-2", 4, { promptAr: "تدريب حاول بنفسك 2" }),
    ];

    const { items } = buildFlowItems({
      questions,
      columnsCount: 2,
      includeAnswerKey: false,
    });

    const heights = new Map<string, number>();
    items.forEach((item) => {
      heights.set(item.id, item.kind === "idea_capsule" ? 95 : 160);
    });

    const segments = buildSegmentsForSlice(
      items,
      (item) => heights.get(item.id) ?? 150,
      new Map(),
      6,
      () => 15
    );

    // يجب أن تكون الكبسولة أولاً بعرض كامل
    expect(segments[0].kind).toBe("full");
    expect(segments[0].item.kind).toBe("idea_capsule");

    // ثم المقطع الثاني هو مقطع عمودين يحتوي المثال الأول يميناً والمثال الثاني يساراً
    expect(segments[1].kind).toBe("columns");
    if (segments[1].kind === "columns") {
      expect(segments[1].rightItems.length).toBe(1);
      expect(segments[1].leftItems.length).toBe(1);
      expect(segments[1].rightItems[0].id).toBe("flow-q-1-booklet-s1-example-1-1");
      expect(segments[1].leftItems[0].id).toBe("flow-q-1-booklet-s1-example-1-2");
    }

    // ثم مقطع التدريبات بعدهما
    expect(segments[2].kind).toBe("columns");
    if (segments[2].kind === "columns") {
      const allDrills = [...segments[2].rightItems, ...segments[2].leftItems].map((i) => i.id);
      expect(allDrills).toContain("flow-q-1-booklet-s1-drill-1-1");
      expect(allDrills).toContain("flow-q-1-booklet-s1-drill-1-2");
    }
  });

  it("never splits the two worked examples of an idea across a page break", () => {
    // سنختبر ميزانية تضغط الصفحة بحيث نتحقق أن فاصل الصفحات لا يقسم بين المثالين
    const questions: PrintableMathQuestionItem[] = [
      makeQuestion("booklet-s1-example-1-1", 1, { isWorkedExample: true, ideaBannerTitleAr: "الفكرة 1" }),
      makeQuestion("booklet-s1-example-1-2", 2, { isWorkedExample: true }),
      makeQuestion("booklet-s1-drill-1-1", 3),
      makeQuestion("booklet-s1-drill-1-2", 4),
      makeQuestion("booklet-s1-example-2-1", 5, { isWorkedExample: true, ideaBannerTitleAr: "الفكرة 2" }),
      makeQuestion("booklet-s1-example-2-2", 6, { isWorkedExample: true }),
    ];

    const { items } = buildFlowItems({
      questions,
      columnsCount: 2,
      includeAnswerKey: false,
    });

    const heights = new Map<string, number>();
    items.forEach((it) => heights.set(it.id, it.kind === "idea_capsule" ? 100 : 200));

    // ميزانية كافية للفكرة الأولى فقط، وتجبر الفكرة الثانية على صفحة جديدة
    const pages = packFlowItemsIntoPages(items, heights, {
      budgets: { firstPagePx: 450, nextPagePx: 450 },
      density: FLOW_DENSITY_PROFILES.standard_balanced,
    });

    // يجب ألا تنفصل أي ثنائية أمثلة بين صفحتين
    pages.forEach((page) => {
      const pageQuestionIds = page.segments
        .flatMap((s) => (s.kind === "full" ? [s.item.id] : [...s.rightItems, ...s.leftItems].map((i) => i.id)));

      // إذا تواجد المثال الأول، يجب أن يتواجد المثال الثاني معه في نفس الصفحة
      const hasEx1_1 = pageQuestionIds.includes("flow-q-1-booklet-s1-example-1-1");
      const hasEx1_2 = pageQuestionIds.includes("flow-q-1-booklet-s1-example-1-2");
      expect(hasEx1_1).toBe(hasEx1_2);

      const hasEx2_1 = pageQuestionIds.includes("flow-q-2-booklet-s1-example-2-1");
      const hasEx2_2 = pageQuestionIds.includes("flow-q-2-booklet-s1-example-2-2");
      expect(hasEx2_1).toBe(hasEx2_2);
    });
  });
});
