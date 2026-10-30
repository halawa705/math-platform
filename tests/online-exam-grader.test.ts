import { describe, it, expect } from "vitest";
import { splitExamIntoPublicAndKey } from "@/core/exam-grading/online-exam-public-key-splitter";
import { gradeOnlineExam } from "@/core/exam-grading/online-exam-grader";
import { buildOnlineExamNotebookLMPrompt } from "@/core/prompts/online-exam-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";

const base = { branchId: "algebra" as never, unitId: "u", lessonId: "l", lessonTitleArabic: "t", cognitiveDepth: "direct_application" as const, estimatedSolveMinutes: 2, modelSolutionStepsArabic: ["خطوة"] };
const mcq: QuestionAssessmentIR = { ...base, questionId: "q1", displayOrderNumber: 1, patternKind: "mcq", allocatedMarks: 2, promptArabic: "س؟", mcqChoicesArabic: ["1", "2", "3", "4"], correctMcqChoiceIndex: 2, finalCanonicalAnswerArabic: "3" };
const short: QuestionAssessmentIR = { ...base, questionId: "q2", displayOrderNumber: 2, patternKind: "completion", allocatedMarks: 3, promptArabic: "أكمل", finalCanonicalAnswerArabic: "5", acceptedAnswersArabic: ["5", "خمسة"] };
const proof: QuestionAssessmentIR = { ...base, questionId: "q3", displayOrderNumber: 3, patternKind: "proof_reasoning", allocatedMarks: 4, promptArabic: "أثبت", finalCanonicalAnswerArabic: "بما أن ... إذن ..." };

describe("online exam", () => {
  const sp = splitExamIntoPublicAndKey([mcq, short, proof]);
  it("يستبعد البرهان", () => { expect(sp.publicQuestions.length).toBe(2); expect(sp.excludedQuestionNumbers).toEqual([3]); });
  it("الأسئلة العامة بلا إجابات", () => { const s = JSON.stringify(sp.publicQuestions); expect(s).not.toContain("correctMcq"); expect(s).not.toContain("خمسة"); });
  it("كل صحيح = 100%", () => expect(gradeOnlineExam(sp.answerKey, { q1: { choiceIndex: 2 }, q2: { text: "٥" } }).percentage).toBe(100));
  it("نص عشوائي = صفر", () => expect(gradeOnlineExam(sp.answerKey, { q1: { choiceIndex: 0 }, q2: { text: "15" } }).percentage).toBe(0));
  it("بلا إجابات = صفر", () => expect(gradeOnlineExam(sp.answerKey, {}).percentage).toBe(0));
  it("جزئي", () => expect(gradeOnlineExam(sp.answerKey, { q1: { choiceIndex: 2 } }).percentage).toBe(40));

  it("E-3: برومبت الاختبار الإلكتروني يحتوي الإجابات_المقبولة ويمنع البرهان", () => {
    const promptText = buildOnlineExamNotebookLMPrompt({
      gradeNameArabic: "الصف الثالث الإعدادي",
      termNumber: 1,
      branchId: "plane_geometry",
      targetedLessonTitlesArabic: ["تشابه المثلثات"],
      mcqQuestionsCount: 5,
      shortAnswerQuestionsCount: 3,
      totalMarks: 10,
      durationTextArabic: "٣٠ دقيقة",
      difficultyProfile: "standard_balanced",
    });
    expect(promptText).toContain("الإجابات_المقبولة");
    expect(promptText).toContain("ممنوع أسئلة البرهان والمقالي");
  });

  it("E-4: المحلل يقرأ الإجابات_المقبولة بدقة", () => {
    const raw = `
=== [QUESTION: 1] | النوع: SHORT | الدرس: تشابه المثلثات | الدرجة: 2 ===
النص: أوجد معامل التشابه
الإجابة_الصحيحة: 0.5
الإجابات_المقبولة: 0.5 | 1/2
البرهان_والخطوات: النسبة بين ضلعين متناظرين = 1/2
`;
    const parsed = parseNotebookLMExamQuestionsToIR({
      rawText: raw,
      branchId: "plane_geometry",
      unitId: "u1",
      lessonId: "l1",
      lessonTitleArabic: "تشابه المثلثات",
    });
    expect(parsed.length).toBe(1);
    expect(parsed[0].acceptedAnswersArabic).toEqual(["0.5", "1/2"]);
    expect(parsed[0].patternKind).toBe("direct_answer");
  });
});
