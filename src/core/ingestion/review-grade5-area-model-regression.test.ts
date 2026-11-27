import { describe, expect, it } from "vitest";
import {
  detectAndBuildAreaModelSvg,
  parseAreaModelSpecFromText,
} from "../geometry-engine/arithmetic-area-model/area-model-arithmetic-svg-builder";
import {
  detectAndBuildPartialQuotientsDivisionSvg,
  parsePartialQuotientsDivisionFromText,
} from "../geometry-engine/arithmetic-area-model/partial-quotients-division-svg-builder";
import { mergeFinalReviewThreeStagesToPrintableItems } from "./notebooklm-final-review-parser";
import { extractExamQuestionDiagrams, cleanExamStudentPromptArabic } from "./exam-question-diagram-extractor";
import { buildModernEditorialFlowItems } from "../pdf-layout-engine/modern-editorial-flow-builder";

describe("Grade 5 Area Model, Partial Quotients & Review Merge Regression", () => {
  it("parses Q2 (38 x 24 with 2x2 and unknown x at bottom-right) without hardcoded fallback numbers", () => {
    const prompt =
      "في نموذج مساحة المستطيل المقابل لعملية الضرب $38 \\times 24$:\n" +
      "`[رسم هندسي: المستطيل مقسم 2x2 ; الأبعاد الرأسية 20 و 4 ; الأبعاد الأفقية 30 و 8 ; مساحات الأجزاء: أعلى يسار = 600 ; أعلى يمين = 160 ; أسفل يسار = 120 ; أسفل يمين = x ; المطلوب: قيمة x]`";
    const spec = parseAreaModelSpecFromText(prompt);
    expect(spec?.kind).toBe("multiplication");
    if (spec?.kind === "multiplication") {
      expect(spec.sideRows).toEqual(["20", "4"]);
      expect(spec.topColumns).toEqual(["30", "8"]);
      expect(spec.cellValues).toEqual([
        ["600", "160"],
        ["120", "x"],
      ]);
    }
    const svg = detectAndBuildAreaModelSvg(prompt);
    expect(svg).toContain('direction="ltr"');
    expect(svg).toContain(">20<");
    expect(svg).not.toContain("210");
  });

  it("parses Q22 (272 ÷ 17 two-column division area model with subtraction steps)", () => {
    const prompt =
      "من نموذج مساحة المستطيل المقابل لعملية القسمة:\n" +
      "`[رسم هندسي: المستطيل مقسم إلى عمودين ; العرض الأيسر = 17 ; الجزء الأول: المقسوم الجزئي 272 ; مطروحاً منه 170 ; المتبقي أسفله 102 ; القيمة بالأعلى = 10 ; الجزء الثاني: المقسوم الجزئي 102 ; مطروحاً منه 102 ; المتبقي أسفله 0 ; القيمة بالأعلى = 6 ; المطلوب: خارج القسمة]`";
    const spec = parseAreaModelSpecFromText(prompt);
    expect(spec?.kind).toBe("division");
    if (spec?.kind === "division") {
      expect(spec.divisor).toBe("17");
      expect(spec.topQuotients).toEqual(["10", "6"]);
      expect(spec.columns?.[0]).toEqual({
        topQuotient: "10",
        partialDividend: "272",
        subtractedProduct: "170",
        bottomRemainder: "102",
      });
      expect(spec.columns?.[1]).toEqual({
        topQuotient: "6",
        partialDividend: "102",
        subtractedProduct: "102",
        bottomRemainder: "0",
      });
    }
    const svg = detectAndBuildAreaModelSvg(prompt);
    expect(svg).toContain("17");
    expect(svg).toContain("272");
    expect(svg).toContain("− 170");
    expect(svg).not.toContain("1440");
  });

  it("parses Q40 (2.5 x 0.34 decimal) and Essay #32 (0.53 x 4.2 with M, N) ignoring 2x2 grid marker", () => {
    const q40 =
      "في نموذج مساحة المستطيل المقابل لعملية الضرب $2.5 \\times 0.34$:\n" +
      "`[رسم هندسي: المستطيل مقسم 2x2 ; الأبعاد الرأسية 0.3 و 0.04 ; الأبعاد الأفقية 2 و 0.5 ; مساحات الأجزاء: أعلى يسار = 0.6 ; أعلى يمين = 0.15 ; أسفل يسار = 0.08 ; أسفل يمين = y ; المطلوب: قيمة y]`";
    const spec40 = parseAreaModelSpecFromText(q40);
    expect(spec40?.kind).toBe("multiplication");
    if (spec40?.kind === "multiplication") {
      expect(spec40.sideRows).toEqual(["0.3", "0.04"]);
      expect(spec40.topColumns).toEqual(["2", "0.5"]);
      expect(spec40.cellValues).toEqual([
        ["0.6", "0.15"],
        ["0.08", "y"],
      ]);
    }

    const essay32 =
      "في نموذج مساحة المستطيل لضرب كسرين عشريين:\n" +
      "`[رسم هندسي: المستطيل مقسم 2x2 ; الأبعاد الرأسية 0.5 و 0.03 ; الأبعاد الأفقية 4 و 0.2 ; مساحات الأجزاء: أعلى يسار = 2.0 ; أعلى يمين = M ; أسفل يسار = 0.12 ; أسفل يمين = N ; المطلوب: حساب قيمتي M و N ثم إيجاد المجموع الكلي]`";
    const spec32 = parseAreaModelSpecFromText(essay32);
    expect(spec32?.kind).toBe("multiplication");
    if (spec32?.kind === "multiplication") {
      expect(spec32.sideRows).toEqual(["0.5", "0.03"]);
      expect(spec32.topColumns).toEqual(["4", "0.2"]);
      expect(spec32.cellValues).toEqual([
        ["2.0", "M"],
        ["0.12", "N"],
      ]);
    }
  });

  it("keeps A and B hidden in Essay #4 (53 x 47)", () => {
    const essay4 =
      "في نموذج مساحة المستطيل المقابل لعملية الضرب $53 \\times 47$:\n" +
      "`[رسم هندسي: المستطيل مقسم 2x2 ; الأبعاد الرأسية 40 و 7 ; الأبعاد الأفقية 50 و 3 ; مساحات الأجزاء: أعلى يسار = 2,000 ; أعلى يمين = A ; أسفل يسار = B ; أسفل يمين = 21 ; المطلوب: إيجاد قيمتي A و B ثم حساب حاصل الضرب الكلي]`";
    const spec = parseAreaModelSpecFromText(essay4);
    expect(spec?.kind).toBe("multiplication");
    if (spec?.kind === "multiplication") {
      expect(spec.cellValues).toEqual([
        ["2000", "A"],
        ["B", "21"],
      ]);
    }
  });

  it("does not generate unsolicited or answer-leaking diagrams for Q12, Q18, and student-solve essays", () => {
    const prompts = [
      "في نموذج مساحة المستطيل التالي: $(70 \\times 30) + (70 \\times 5) + (4 \\times 30) + (4 \\times 5)$، ما هي مسألة الضرب الأصلية؟",
      "في نموذج مساحة المستطيل المستخدم لإجراء عملية القسمة، يُكتب المقسوم عليه دائماً:",
      "استخدم استراتيجية نموذج مساحة المستطيل لإيجاد حاصل ضرب $48 \\times 26$، موضحاً خطوات تحليل العددين إلى الصيغة الممتدة.",
      "استخدم نموذج مساحة المستطيل لإيجاد خارج قسمة وباقي العملية: $485 \\div 12$.",
      "استخدم نموذج مساحة المستطيل لإيجاد حاصل ضرب الكسرين العشريين: $2.4 \\times 1.6$.",
    ];
    prompts.forEach((p, idx) => {
      const res = extractExamQuestionDiagrams({
        block: p,
        basePrompt: p,
        rawDrawing: "",
        branchId: "numbers",
        lessonId: "l1",
        lessonTitleArabic: "ضرب وقسمة الأعداد",
        orderNumber: idx + 1,
        gradeId: "prim-5",
      });
      expect(res.rawSvgMarkup).toBeUndefined();
      expect(res.attachedGeometryFigure).toBeUndefined();
    });
  });

  it("parses and renders Partial Quotients Division SVG (Essay #18: 3,456 ÷ 16) and cleans backticked tags", () => {
    const block =
      "في عملية القسمة المقابلة باستخدام نموذج التجزئة:\n" +
      "`[رسم هندسي: المقسوم = 3,456 ; المقسوم عليه = 16 ; النواتج الجزئية جهة اليمين: الخطوة الأولى = 200 والباقي مطروحاً 3,200 فيتبقى 256 ; الخطوة الثانية = x ; الخطوة الثالثة = y ; الباقي النهائي = 0 ; المطلوب: قيمتي x و y وخارج القسمة النهائي]`\n" +
      "أوجد قيمتي المجهولين $x$ و $y$، ثم استنتج خارج القسمة النهائي.";
    const spec = parsePartialQuotientsDivisionFromText(block);
    expect(spec?.dividend).toBe("3456");
    expect(spec?.divisor).toBe("16");
    expect(spec?.steps.map((s) => s.partialQuotient)).toEqual(["200", "x", "y"]);

    const svg = detectAndBuildPartialQuotientsDivisionSvg(block);
    expect(svg).toContain("<svg");
    expect(svg).toContain("3456");
    expect(svg).toContain("16");
    expect(svg).toContain("200");
    expect(svg).toContain("− 3200");
    expect(svg).toContain(">x<");
    expect(svg).toContain(">y<");

    const cleanedPrompt = cleanExamStudentPromptArabic(block, true);
    expect(cleanedPrompt).not.toContain("`");
    expect(cleanedPrompt).not.toContain("رسم هندسي");
  });

  it("strips stage transition chatter and keeps 100% question-to-answer-key numbering sync with no geometry mislabelling", () => {
    const stage1 = [
      '" أيّ التعبيرات التالية يُعبر عن خاصية التوزيع لإيجاد ناتج ضرب $45 \\times 23$؟',
      "(أ) $(40 \\times 20) + (5 \\times 3)$",
      "(ب) $(40 \\times 20) + (40 \\times 3) + (5 \\times 20) + (5 \\times 3)$",
      "(جـ) $(40 + 20) \\times (5 + 3)$",
      "(د) $(45 \\times 20) + (45 \\times 30)$",
      "الإجابة الصحيحة: (ب) $(40 \\times 20) + (40 \\times 3) + (5 \\times 20) + (5 \\times 3)$",
      "",
      "---",
      '🎯 جاهزون للانتقال إلى المرحلة ٢: أسئلة أكمل، أجب، والمسائل المقالية على نفس الوحدات والمقرر حينما تطلب ذلك!"',
    ].join("\n");

    const stage2 = [
      '"🎯 جاهزون للانتقال إلى المرحلة ٢: أسئلة أكمل، أجب، والمسائل المقالية على نفس الوحدات والمقرر حينما تطلب ذلك!"',
      "",
      "اشترى تاجر 35 صندوقاً من البرتقال، فإذا كان كل صندوق يحتوي على 24 كجم؛ احسب الإجمالي.",
      "",
      "في نموذج مساحة المستطيل المقابل لعملية الضرب $53 \\times 47$:",
      "`[رسم هندسي: المستطيل مقسم 2x2 ; الأبعاد الرأسية 40 و 7 ; الأبعاد الأفقية 50 و 3 ; مساحات الأجزاء: أعلى يسار = 2,000 ; أعلى يمين = A ; أسفل يسار = B ; أسفل يمين = 21]`",
      "أوجد قيمة $A$ و $B$.",
      "",
      "---",
      '🎯 جاهزون للانتقال إلى المرحلة ٣: نموذج الإجابة النموذجي والبرهان بالتفصيل والخطوات الكاملة للمسائل المقالية حتى متى شئت!"',
    ].join("\n");

    const stage3 = [
      '"حل السؤال:',
      "خطوات الحل:",
      "- الخطوة ١: $35 \\times 24 = 840$.",
      "الناتج النهائي: $840$",
      "",
      "---",
      "",
      "حل السؤال:",
      "خطوات الحل:",
      "- الخطوة ١: $A = 40 \\times 3 = 120$.",
      "- الخطوة ٢: $B = 7 \\times 50 = 350$.",
      'الناتج النهائي: $A = 120, B = 350$"',
    ].join("\n");

    const items = mergeFinalReviewThreeStagesToPrintableItems({
      stage1Raw: stage1,
      stage2Raw: stage2,
      stage3Raw: stage3,
      branchId: "numbers",
      branchNameAr: "الأعداد والعمليات",
      titleArabic: "مراجعة شهر 1",
    });

    expect(items).toHaveLength(3);
    expect(items.some((q) => q.promptAr.includes("جاهزون للانتقال"))).toBe(false);

    const flow = buildModernEditorialFlowItems({
      questions: items,
      columnsCount: 2,
      includeAnswerKey: true,
      answerVisibilityMode: "questions_with_answers",
    });

    expect(flow.items.some((i) => i.kind === "editorial_sub_banner" && i.instructionAr?.includes("الهندسة"))).toBe(false);

    const qGroupNums = flow.items
      .filter((i): i is Extract<typeof i, { kind: "editorial_question_group" }> => i.kind === "editorial_question_group" && !i.slots[0].isSolved)
      .flatMap((g) => g.slots.map((s) => s.displayNumber));
    const ansGroupNums = flow.items
      .filter((i): i is Extract<typeof i, { kind: "editorial_question_group" }> => i.kind === "editorial_question_group" && i.slots[0].isSolved)
      .flatMap((g) => g.slots.map((s) => s.displayNumber));

    expect(qGroupNums).toEqual([1, 2]);
    expect(ansGroupNums).toEqual([1, 2]);
  });
});
