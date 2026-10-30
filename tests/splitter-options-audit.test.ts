import { describe, it, expect } from "vitest";
import { splitExamIntoPublicAndKey } from "@/core/exam-grading/online-exam-public-key-splitter";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";

describe("splitter + مدقق البدائل", () => {
  const q = { questionId: "m", displayOrderNumber: 1, patternKind: "mcq", allocatedMarks: 1, promptArabic: "س؟", mcqChoicesArabic: ["1", "1", "2", "3"], correctMcqChoiceIndex: 0, finalCanonicalAnswerArabic: "1", modelSolutionStepsArabic: [], branchId: "algebra", unitId: "u", lessonId: "l", lessonTitleArabic: "t", cognitiveDepth: "direct_application", estimatedSolveMinutes: 1 } as unknown as QuestionAssessmentIR;
  it("بديلان مكرران = مستبعد", () => expect(splitExamIntoPublicAndKey([q]).excludedQuestionNumbers).toEqual([1]));
});
