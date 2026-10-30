import { describe, it, expect } from "vitest";
import {
  buildBookletStageNotebookLMPrompt,
  extractIdeasFromBookletStage1Reply,
} from "@/core/prompts/booklet-three-stages-prompt-builder";
import { buildOfficialExamNotebookLMPrompt } from "@/core/prompts/official-exam-prompt-builder";
import { buildOnlineExamNotebookLMPrompt } from "@/core/prompts/online-exam-prompt-builder";
import { buildFinalReviewNotebookLMPrompt } from "@/core/prompts/final-review-prompt-builder";
import { buildWorksheetDrillNotebookLMPrompt } from "@/core/prompts/worksheet-drill-prompt-builder";
import { buildCurriculumSplitterPrompt } from "@/core/ssot/curriculum-hierarchy-ssot";

const NOTEBOOKLM_MAX_CHARS_BUDGET = 2400;

describe("NotebookLM Prompts — Compact Size Budget & Strict Pedagogical Rules", () => {
  const promptsMap: Record<string, string> = {
    curriculum: buildCurriculumSplitterPrompt({
      gradeName: "الصف الثالث الإعدادي",
      termNumber: 1,
    }),
    bookletStage1: buildBookletStageNotebookLMPrompt({
      stageNumber: 1,
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      unitTitleArabic: "الوحدة الثالثة: الهندسة",
      lessonTitleArabic: "تشابه المضلعات",
      solvedExamplesPerIdea: 2,
    }),
    bookletStage2: buildBookletStageNotebookLMPrompt({
      stageNumber: 2,
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      unitTitleArabic: "الوحدة الثالثة: الهندسة",
      lessonTitleArabic: "تشابه المضلعات",
      drillsPerIdea: 2,
      homeworkMcqCount: 4,
      homeworkEssayCount: 2,
      extractedStage1Ideas: ["مفهوم التشابه", "معامل التشابه", "تشابه المضلعات المنتظمة"],
    }),
    bookletStage3: buildBookletStageNotebookLMPrompt({
      stageNumber: 3,
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      unitTitleArabic: "الوحدة الثالثة: الهندسة",
      lessonTitleArabic: "تشابه المضلعات",
      extractedStage1Ideas: ["مفهوم التشابه", "معامل التشابه"],
      extractedStage2Questions: ["practice-01-01", "practice-01-02", "homework-01-01", "homework-01-02"],
    }),
    officialExam: buildOfficialExamNotebookLMPrompt({
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      targetedLessonTitlesArabic: ["تشابه المضلعات", "تشابه المثلثات"],
      mcqQuestionsCount: 6,
      essayAndProofQuestionsCount: 3,
      totalMarks: 15,
      durationTextArabic: "ساعة ونصف",
      difficultyProfile: "standard_balanced",
    }),
    onlineExam: buildOnlineExamNotebookLMPrompt({
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      targetedLessonTitlesArabic: ["تشابه المضلعات"],
      mcqQuestionsCount: 6,
      shortAnswerQuestionsCount: 3,
      totalMarks: 15,
      durationTextArabic: "ساعة",
      difficultyProfile: "standard_balanced",
    }),
    reviewStage1: buildFinalReviewNotebookLMPrompt({
      reviewScope: "final_exam_night_capsule",
      stageNumber: 1,
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      coveredUnitsTitlesArabic: ["الوحدة الثالثة: التشابه", "الوحدة الرابعة: الدائرة"],
      totalReviewQuestionsCount: 23,
      mcqCount: 15,
      essayCount: 8,
    }),
    reviewStage2: buildFinalReviewNotebookLMPrompt({
      reviewScope: "final_exam_night_capsule",
      stageNumber: 2,
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      coveredUnitsTitlesArabic: ["الوحدة الثالثة: التشابه"],
      totalReviewQuestionsCount: 23,
      mcqCount: 15,
      essayCount: 8,
    }),
    reviewStage3: buildFinalReviewNotebookLMPrompt({
      reviewScope: "final_exam_night_capsule",
      stageNumber: 3,
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      coveredUnitsTitlesArabic: ["الوحدة الثالثة: التشابه"],
      totalReviewQuestionsCount: 23,
      mcqCount: 15,
      essayCount: 8,
      extractedStage2EssayQuestions: ["[1] أثبت تشابه المثلثين", "[2] أوجد طول القطعة"],
    }),
    worksheet: buildWorksheetDrillNotebookLMPrompt({
      gradeNameArabic: "الصف الثالث الإعدادي",
      branchId: "plane_geometry",
      lessonTitleArabic: "تشابه المضلعات",
      quickMcqCount: 5,
      quickEssayCount: 2,
      durationMinutes: 25,
    }),
  };

  it("keeps every single prompt strictly within NotebookLM's character budget (<= 2,400 chars)", () => {
    for (const [name, text] of Object.entries(promptsMap)) {
      expect(text.length, `${name} length (${text.length}) exceeded budget`).toBeLessThanOrEqual(
        NOTEBOOKLM_MAX_CHARS_BUDGET
      );
    }
  });

  it("enforces the 4-tier source priority hierarchy across all content generation prompts", () => {
    for (const [name, text] of Object.entries(promptsMap)) {
      if (name === "curriculum") {
        expect(text).toContain("كتاب التقييمات");
        expect(text).toContain("كتاب المدرسة");
        expect(text).toContain("الكتب الخارجية");
        continue;
      }
      expect(text, `${name} missing كتاب التقييمات`).toContain("كتاب التقييمات");
      expect(text, `${name} missing كتاب المدرسة`).toContain("كتاب المدرسة");
      expect(text, `${name} missing الكتب الخارجية`).toContain("الكتب الخارجية");
      expect(text, `${name} missing المحافظات`).toContain("المحافظات");
      expect(text, `${name} missing آخر حل`).toContain("آخر حل");
    }
  });

  it("enforces intelligent exhaustive idea mapping without artificial min/max caps and without padding or omission", () => {
    for (const [name, text] of Object.entries(promptsMap)) {
      if (name === "curriculum") continue;
      expect(text, `${name} missing exhaustive spectrum rule`).toContain(
        "الاختبارات الشهرية والنهائية"
      );
      expect(text, `${name} missing progression from basic to gifted`).toContain(
        "البسيط التأسيسي"
      );
      expect(text, `${name} missing no-omission/no-padding rule`).toContain(
        "بدون إهمال أي فكرة في المصادر، وبدون حشو"
      );
    }
    expect(promptsMap.bookletStage1).toContain("فهرس أفكار الدرس:");
  });

  it("deduplicates ideas by ID when Stage 1 contains both فهرس أفكار الدرس and الفكرة الأولى headers", () => {
    const sampleStage1 = [
      "فهرس أفكار الدرس:",
      "- idea-01: [اختر] - [مفهوم التشابه ومعامل التشابه - مستوى تأسيسي]",
      "- idea-02: [مقالي] - [إيجاد أطوال الأضلاع المجهولة - مستوى متوسط]",
      "---",
      "الفكرة الأولى: مفهوم التشابه ومعامل التشابه | المستوى: تأسيسي | نوع المسألة: اختر | معرف الفكرة: idea-01",
      "الفكرة الثانية: إيجاد أطوال الأضلاع المجهولة | المستوى: متوسط | نوع المسألة: مقالي | معرف الفكرة: idea-02",
    ].join("\n");
    const ideas = extractIdeasFromBookletStage1Reply(sampleStage1);
    expect(ideas).toHaveLength(2);
  });

  it("enforces anti-repetition of ideas and mathematically unique MCQ answers with reasonable distractors", () => {
    for (const [name, text] of Object.entries(promptsMap)) {
      if (name === "curriculum") continue;
      expect(text, `${name} missing anti-repetition rule`).toContain("فكرة رياضية مستقلة ومختلفة");
      expect(text, `${name} missing MCQ mathematical accuracy rule`).toContain(
        "إجابة واحدة فقط صحيحة رياضياً"
      );
      expect(text, `${name} missing reasonable distractors rule`).toContain(
        "مشتتات ذكية ومعقولة رياضياً"
      );
    }
  });
});
