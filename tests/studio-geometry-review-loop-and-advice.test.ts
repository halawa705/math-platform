/**
 * @file studio-geometry-review-loop-and-advice.test.ts
 * @description اختبارات وحدة حلقة المراجعة والتحسين والرسائل التوجيهية وتصدير الحالات الذهبية (المرحلة 7).
 */

import { describe, it, expect } from "vitest";
import { formatGeometryRejectionAdviceArabic } from "../src/core/geometry-engine/description-intake/geometry-rejection-advice-formatter";
import { recomposeFactsToGeometricDescription } from "../src/core/geometry-engine/fact-compositor/geo-facts-recomposer";
import { buildGoldenCorpusCaseFromCorrection } from "../src/core/geometry-engine/baseline-measurement/golden-corpus-correction-converter";

describe("Studio Geometry Review Loop & Advice Engine (Phase 7)", () => {
  describe("7.2 formatGeometryRejectionAdviceArabic", () => {
    it("converts alien vertices warning into polite actionable Arabic advice", () => {
      const rawWarnings = ["الشكل يحتوي على رؤوس دخيلة غير مذكورة في السؤال: (D، E)"];
      const advice = formatGeometryRejectionAdviceArabic({
        rawPrompt: "أ ب جـ مثلث قائم في ب",
        reasons: rawWarnings,
      });

      expect(advice.friendlySummaryAr).toContain("رؤوس أو حروف غير مذكورة");
      expect(advice.suggestedPromptPromptAr).toBeDefined();
      expect(advice.suggestedPromptPromptAr).not.toContain("alien");
      expect(advice.suggestedPromptPromptAr).not.toContain("D، E");
    });

    it("converts theoretical problem warning into clear non-diagram explanation", () => {
      const rawWarnings = ["المسألة نظرية لفظية عامة ولا تتطلب شكلاً هندسياً."];
      const advice = formatGeometryRejectionAdviceArabic({
        rawPrompt: "مجموع قياسات الزوايا الداخلة للمثلث = 180°",
        reasons: rawWarnings,
      });

      expect(advice.friendlySummaryAr).toContain("نظرية عامة");
      expect(advice.isTheoretical).toBe(true);
    });

    it("provides NotebookLM enhanced formulation snippet without code or DSL", () => {
      const advice = formatGeometryRejectionAdviceArabic({
        rawPrompt: "مثلث ABC فيه زاوية A = 50 وزاوية B = 60",
        reasons: ["تعذر التحقق الكامل من مطابقة الشكل للمعطيات."],
      });

      expect(advice.notebookLMSuggestionText).toBeDefined();
      expect(advice.notebookLMSuggestionText).not.toContain("<svg");
      expect(advice.notebookLMSuggestionText).not.toContain("[GEOMETRY:");
      expect(advice.notebookLMSuggestionText).toContain("في الشكل المقابل");
    });
  });

  describe("7.1 recomposeFactsToGeometricDescription", () => {
    it("recomposes modified fact list into clean semicolon-separated Arabic geometry description", () => {
      const facts = [
        "مثلث أ ب جـ قائم في ب",
        "أ ب = 6 سم",
        "ب جـ = 8 سم",
      ];
      const result = recomposeFactsToGeometricDescription(facts);

      expect(result).toBe("مثلث أ ب جـ قائم في ب ؛ أ ب = 6 سم ؛ ب جـ = 8 سم");
    });

    it("filters out empty or blank facts gracefully", () => {
      const facts = ["مربع طول ضلعه 5 سم", "   ", "أوجد محيطه"];
      const result = recomposeFactsToGeometricDescription(facts);

      expect(result).toBe("مربع طول ضلعه 5 سم ؛ أوجد محيطه");
    });
  });

  describe("7.3 buildGoldenCorpusCaseFromCorrection", () => {
    it("creates a valid GoldenCorpusCase from teacher correction in the lab", () => {
      const goldenCase = buildGoldenCorpusCaseFromCorrection({
        problemText: "في الشكل المقابل: أ ب جـ مثلث قائم في ب، أ ب = 3 سم، ب جـ = 4 سم. أوجد أ جـ",
        correctedDescription: "مثلث أ ب جـ قائم في ب ؛ أ ب = 3 سم ؛ ب جـ = 4 سم",
        gradeId: "prep-1",
        branchId: "plane_geometry",
        teacherNotes: "تم تعديل تسمية الرؤوس لتطابق المسألة",
      });

      expect(goldenCase.id).toMatch(/^custom_case_/);
      expect(goldenCase.gradeId).toBe("prep-1");
      expect(goldenCase.branchId).toBe("plane_geometry");
      expect(goldenCase.expectedOutcome).toBe("figure");
      expect(goldenCase.humanVerdict).toBe("correct");
      expect(goldenCase.humanNotes).toBe("تم تعديل تسمية الرؤوس لتطابق المسألة");
    });
  });
});
