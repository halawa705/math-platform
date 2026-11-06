/**
 * @file review-table-and-preamble-parser.test.ts
 * @description اختبار معالجة مشاكل المراجعات الثلاث:
 * 1. عدم اقتصاص جدول إجابات الاختيارات وشموله لكافة الأسئلة (حتى 41+ سؤالاً) في 4 أعمدة مضغوطة.
 * 2. عدم فصل الجداول عن نصوص الأسئلة المقالية وتوحيد السؤال وجدوله في بطاقة واحدة دون أسئلة وهمية.
 * 3. استبعاد المقدمات الترحيبية من المرحلة الثالثة حتى لا تشفت الحلول أو تحل محل حل السؤال الأول.
 */

import { describe, expect, it } from "vitest";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import { mergeFinalReviewThreeStagesToPrintableItems } from "@/core/ingestion/notebooklm-final-review-parser";

describe("Review Ingestion & Table Resilience", () => {
  it("joins markdown tables to the preceding question instead of creating orphaned table questions", () => {
    const rawStage2 = `
أكمل جدول المدخلات والمخرجات الآتي بناءً على المعادلة y = 3x - 2:

| x (المدخل) | 1 | 2 | 3 | 4 |
| y (المخرج) | ... | ... | ... | ... |

اكتب المعادلة التي تمثل العلاقة بين x و y الموضحة بالجدول الآتي:

| x | 1 | 2 | 3 | 4 |
| y | 5 | 8 | 11 | 14 |
`;

    const parsed = parseNotebookLMExamQuestionsToIR({
      rawText: rawStage2,
      branchId: "algebra",
      unitId: "u-test",
      lessonId: "l-test",
      lessonTitleArabic: "المتغيرات التابعة والمستقلة",
    });

    // يجب أن ينتج سؤالان اثنان فقط وليس 4 أسئلة مجزأة!
    expect(parsed.length).toBe(2);

    // السؤال الأول يحتوي على متن السؤال وجدوله معاً
    expect(parsed[0].promptArabic).toContain("أكمل جدول المدخلات والمخرجات");
    expect(parsed[0].promptArabic).toContain("(المدخل)");
    expect(parsed[0].promptArabic).toContain("| 4 |");

    // السؤال الثاني يحتوي على متن السؤال وجدوله معاً
    expect(parsed[1].promptArabic).toContain("اكتب المعادلة التي تمثل العلاقة");
    expect(parsed[1].promptArabic).toContain("| 14 |");
  });

  it("filters out conversational preamble in Stage 3 and maps solutions accurately without shift", () => {
    const stage1Raw = `
1. حاصل ضرب 38 في 17 يساوي:
(أ) 546
(ب) 646
(جـ) 656
(د) 556
الإجابة الصحيحة: (ب) 646
`;

    const stage2Raw = `
أوجد عدد الحدود، والحدود المتشابهة، والمعاملات، والثابت في المقدار: 4x + 7 + 2x + 9y + 3

حدد ما إذا كان المقداران 3(2x+4) و 6x+12 متكافئين عند x=1
`;

    const stage3Raw = `
إليك نموذج الإجابة الرسمي والحلول النموذجية الشاملة خطوة بخطوة لجميع المسائل المقالية والتطبيقية الـ (30) الخاصة بمراجعة مقرر الشهر لدروس الجبر والمقادير الجبرية والمعادلات والمتباينات والمتغيرات التابعة والمستقلة:

حل المسألة [1]:
خطوات الحل: عدد الحدود = 5 | الحدود المتشابهة: 4x و 2x | المعاملات: 4 و 2 و 9 | الثابت: 7 و 3
الناتج النهائي: 5 حدود

حل المسألة [2]:
خطوات الحل: التعويض عن x=1 في المقدار الأول 3(2(1)+4)=18 | المقدار الثاني 6(1)+12=18
الناتج النهائي: المقداران متكافئان
`;

    const items = mergeFinalReviewThreeStagesToPrintableItems({
      stage1Raw,
      stage2Raw,
      stage3Raw,
      branchId: "algebra",
      branchNameAr: "الجبر",
      titleArabic: "مراجعة الجبر",
    });

    // سؤال اختيار من متعدد + سؤالان مقاليان = 3 عناصر
    expect(items.length).toBe(3);

    // السؤال الأول (اختيار من متعدد)
    expect(items[0].kind).toBe("mcq");
    expect(items[0].questionNumber).toBe(1);

    // السؤال الثاني (المقالي الأول: س41 في نموذج المعلم)
    expect(items[1].questionNumber).toBe(2);
    expect(items[1].promptAr).toContain("أوجد عدد الحدود");
    // يجب ألا يحتوي الحل على المقدمة الترحيبية إطلاقاً!
    expect(items[1].modelAnswerAr).not.toContain("إليك نموذج الإجابة الرسمي");
    expect(items[1].solutionStepsAr?.[0]).toContain("عدد الحدود = 5");

    // السؤال الثالث (المقالي الثاني: س42 في نموذج المعلم)
    expect(items[2].questionNumber).toBe(3);
    expect(items[2].promptAr).toContain("3(2x+4)");
    expect(items[2].solutionStepsAr?.[0]).toContain("التعويض");
    expect(items[2].solutionStepsAr?.[0]).toContain("18");
  });

  it("handles Stage 3 formatted as numbered list (1., 2.) without losing solutions or treating as intro", () => {
    const stage2Raw = `
أوجد ناتج الجمع 25 + 35

احسب مساحة المربع الذي طول ضلعه 4 سم
`;

    const stage3Raw = `
إليك نموذج الإجابة الرسمي خطوة بخطوة لجميع المسائل:

1. خطوات الحل: جمع الآحاد 5 + 5 = 10 | جمع العشرات 20 + 30 = 50 | المجموع الكلي 60
الناتج النهائي: 60

2. خطوات الحل: قانون المساحة = الضلع في نفسه | 4 * 4 = 16 سم مربع
الناتج النهائي: 16 سم²
`;

    const items = mergeFinalReviewThreeStagesToPrintableItems({
      stage1Raw: "",
      stage2Raw,
      stage3Raw,
      branchId: "numbers",
      branchNameAr: "الأعداد",
      titleArabic: "مراجعة الأعداد",
    });

    expect(items.length).toBe(2);
    expect(items[0].solutionStepsAr?.length).toBeGreaterThanOrEqual(2);
    expect(items[0].solutionStepsAr?.[0]).toContain("جمع الآحاد");
    expect(items[1].solutionStepsAr?.[0]).toContain("قانون المساحة");
  });

  it("handles Stage 3 using global test question numbers (e.g. Question 41, 42) mapped to essay questions", () => {
    const stage1Raw = `
1. حاصل ضرب 5 في 6:
(أ) 30
(ب) 25
(جـ) 20
(د) 15
الإجابة الصحيحة: (أ) 30
`;

    const stage2Raw = `
إذا كان مع أحمد 100 جنيه واشترى كتباً بـ 40 جنيهاً، فكم جنيهاً تبقى معه؟
`;

    const stage3Raw = `
نموذج إجابة الامتحان الرسمي:

حل السؤال [2]: خطوات الحل: حساب المبلغ المتبقي 100 - 40 = 60 جنيهاً
الناتج النهائي: 60 جنيهاً
`;

    const items = mergeFinalReviewThreeStagesToPrintableItems({
      stage1Raw,
      stage2Raw,
      stage3Raw,
      branchId: "algebra",
      branchNameAr: "الجبر",
      titleArabic: "مراجعة",
    });

    expect(items.length).toBe(2);
    // السؤال الثاني وهو المقالي ارتبط بحل السؤال 2 العام
    expect(items[1].solutionStepsAr?.[0]).toContain("حساب المبلغ المتبقي");
    expect(items[1].solutionStepsAr?.[0]).toContain("60");
  });
});
