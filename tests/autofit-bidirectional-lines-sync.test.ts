import { describe, it, expect } from "vitest";
import {
  getLadderForMode,
  MODULE_ID_AUTOFIT_LADDERS,
} from "@/core/pdf-layout-engine/autofit-ladders";
import { resolveAdaptiveAnswerLinesCount } from "@/core/pdf-layout-engine/question-answer-lines-adaptive-resolver";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";

describe("AutoFit Bidirectional Lines & Adaptive Sync Engine", () => {
  it("verifies ladders define dynamic answerLines (1, 2, 3) across rungs", () => {
    expect(MODULE_ID_AUTOFIT_LADDERS).toBe("autofit_ladders");
    const examLadder = getLadderForMode("exam_max_pages");
    const bookletLadder = getLadderForMode("booklet_fill");

    expect(examLadder.length).toBeGreaterThan(0);
    expect(bookletLadder.length).toBeGreaterThan(0);

    // Exam ladder starts roomier with 3 lines, moves to 2, and compresses to 1
    expect(examLadder[0].answerLines).toBe(3);
    expect(examLadder[2].answerLines).toBe(2);
    expect(examLadder[examLadder.length - 1].answerLines).toBe(1);

    // Booklet ladder tests 3 and 2 lines
    expect(bookletLadder[0].answerLines).toBe(3);
    expect(bookletLadder[bookletLadder.length - 1].answerLines).toBe(2);
  });

  it("strictly enforces 0 answer lines for MCQ questions regardless of settings", () => {
    const mcqQuestion: PrintableMathQuestionItem = {
      id: "q-mcq-1",
      questionNumber: 1,
      kind: "mcq",
      branchBadgeAr: "الجبر",
      marks: 1,
      promptAr: "اختر الإجابة الصحيحة من بين الإجابات المعطاة:",
      mcqChoicesAr: ["1", "2", "3", "4"],
      correctMcqIndex: 0,
    };

    expect(resolveAdaptiveAnswerLinesCount({ question: mcqQuestion, defaultSettingsLines: 3 })).toBe(0);
    expect(resolveAdaptiveAnswerLinesCount({ question: mcqQuestion, defaultSettingsLines: 5 })).toBe(0);
    expect(resolveAdaptiveAnswerLinesCount({ question: mcqQuestion, defaultSettingsLines: 0 })).toBe(0);
  });

  it("honors defaultSettingsLines dynamically for essay questions when provided", () => {
    const essayQuestion: PrintableMathQuestionItem = {
      id: "q-essay-1",
      questionNumber: 2,
      kind: "essay_geometry",
      branchBadgeAr: "الهندسة المستوية",
      marks: 3,
      promptAr: "في الشكل المقابل أثبت أن المثلث أ ب جـ قائم الزاوية في ب.",
      answerLinesCount: 0, // stale default from parser
    };

    // When defaultSettingsLines is passed (e.g. from AutoFit or user counter), it overrides stale parser 0
    expect(resolveAdaptiveAnswerLinesCount({ question: essayQuestion, defaultSettingsLines: 4 })).toBe(4);
    expect(resolveAdaptiveAnswerLinesCount({ question: essayQuestion, defaultSettingsLines: 2 })).toBe(2);
    expect(resolveAdaptiveAnswerLinesCount({ question: essayQuestion, defaultSettingsLines: 0 })).toBe(0);
  });

  it("respects individual question override when hasCustomAnswerLines is true", () => {
    const customEssayQuestion: PrintableMathQuestionItem = {
      id: "q-essay-custom",
      questionNumber: 3,
      kind: "essay_algebra",
      branchBadgeAr: "الجبر",
      marks: 3,
      promptAr: "أوجد مجموعة حل المعادلة س² - ٥س + ٦ = ٠ في ح.",
      answerLinesCount: 6,
      hasCustomAnswerLines: true, // Teacher explicitly customized this specific question in inspector
    };

    // Even if defaultSettingsLines is 2, the question's individual 6 lines are preserved
    expect(resolveAdaptiveAnswerLinesCount({ question: customEssayQuestion, defaultSettingsLines: 2 })).toBe(6);
  });
});
