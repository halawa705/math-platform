import { describe, it, expect } from "vitest";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import { cleanStudentFacingMathPromptSSOT } from "@/core/ingestion/notebooklm-citation-latex-sanitizer";
import { convertQuestionAssessmentIRToPrintableItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";

describe("Studio Exam Dual Editions, Figure Docking & Question Sanitizer", () => {
  it("strictly cleanses 'الرسم:' and leaked answers from Algebra questions", () => {
    const rawAlgebraResponse = `
=== [سؤال: 1] ===
النوع: اختر
الدرجة: 1
النص: إذا كان س + 3 = 7 فإن قيمة س =
الرسم:
البدائل: 2 | 3 | 4 | 5
الإجابة_الصحيحة: 4
`;
    const irs = parseNotebookLMExamQuestionsToIR({
      rawText: rawAlgebraResponse,
      branchId: "algebra",
      unitId: "u1",
      lessonId: "l1",
      lessonTitleArabic: "المعادلات",
    });

    expect(irs).toHaveLength(1);
    const q = irs[0];
    expect(q.promptArabic).not.toContain("الرسم");
    expect(q.promptArabic).not.toContain("الإجابة");
    expect(cleanStudentFacingMathPromptSSOT(q.promptArabic)).not.toContain("الرسم");
    expect(q.attachedGeometryFigure).toBeUndefined();
  });

  it("extracts geometric figure description properly while removing 'الرسم:' from prompt text", () => {
    const rawGeoResponse = `
=== [سؤال: 1] ===
النوع: مقالي
الدرجة: 3
النص: في الشكل المقابل: أ ب جـ مثلث، د منتصف أ ب ، هـ منتصف أ جـ . أثبت أن د هـ // ب جـ
الرسم: [رسم هندسي: مثلث أ ب جـ قائم في ب، د منتصف أ ب، هـ منتصف أ جـ]
خطوات_الحل: بما أن د منتصف أ ب ، وهـ منتصف أ جـ إذن د هـ // ب جـ وطول د هـ = نصف ب جـ
`;
    const irs = parseNotebookLMExamQuestionsToIR({
      rawText: rawGeoResponse,
      branchId: "plane_geometry",
      unitId: "u2",
      lessonId: "l2",
      lessonTitleArabic: "القطعة المستقيمة الواصلة بين منتصفي ضلعين في مثلث",
    });

    expect(irs).toHaveLength(1);
    const q = irs[0];
    expect(q.promptArabic).not.toContain("الرسم:");
    expect(q.promptArabic).not.toContain("[رسم هندسي:");
    expect(cleanStudentFacingMathPromptSSOT(q.promptArabic)).not.toContain("الرسم:");
    expect(q.attachedGeometryFigure).toBeDefined();
  });

  it("supports per-essay question custom solution lines and dotted divider toggle", () => {
    const rawEssayResponse = `
=== [سؤال: 1] ===
النوع: مقالي
الدرجة: 4
النص: أوجد مجموعة حل المعادلة في ح: 2س - 5 = 11
الإجابة_الصحيحة: 8
خطوات_الحل: 2س = 16 إذن س = 8
`;
    const irs = parseNotebookLMExamQuestionsToIR({
      rawText: rawEssayResponse,
      branchId: "algebra",
      unitId: "u1",
      lessonId: "l1",
      lessonTitleArabic: "حل المعادلات",
    });

    expect(irs).toHaveLength(1);
    const q = irs[0];
    // Default values
    expect(q.answerLinesCount).toBe(0);
    expect(q.hasDottedDivider).toBe(true);

    // Custom teacher modification
    const modifiedQ = {
      ...q,
      answerLinesCount: 4,
      hasDottedDivider: false, // Saves 1 line!
    };

    const printable = convertQuestionAssessmentIRToPrintableItem(modifiedQ, "الجبر");
    expect(printable.answerLinesCount).toBe(4);
    expect(printable.hasDottedDivider).toBe(false);
  });

  it("cleanStudentFacingMathPromptSSOT eliminates all variants of empty and populated drawing tags", () => {
    const testCases = [
      "إذا كانت الزاوية 60° فإن المتممة لها = ...\nالرسم:",
      "في الشكل المقابل أوجد قياس زاوية أ\nالرسم: لا يوجد",
      "مسألة حسابية\nرسم توضيحي: [رسم هندسي: مثلث]",
      "أوجد قيمة المقدار\nالإجابة_الصحيحة: 15",
      "سؤال بدون شكل\nالشكل:",
    ];

    for (const testText of testCases) {
      const cleaned = cleanStudentFacingMathPromptSSOT(testText);
      expect(cleaned).not.toMatch(/(?:^|\n)\s*(?:الرسم|رسم|الشكل)\s*:/);
      expect(cleaned).not.toMatch(/(?:^|\n)\s*(?:الرسم|الشكل)\s*$/);
      expect(cleaned).not.toMatch(/الإجابة_الصحيحة/);
    }
  });
});
