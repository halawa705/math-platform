/**
 * @file notebooklm-final-review-parser.ts
 * @description محلل ودامج مراحل المراجعة النهائية الشاملة ومراجعات الشهور إلى حزمة قوانين وأسئلة مهيكلة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { QuestionAssessmentIR } from "../ir/question-assessment-ir";
import type { MathBranchId } from "../ssot/math-branches-ssot";
import { sanitizeNotebookLMCitationsAndLatex } from "./notebooklm-citation-latex-sanitizer";
import { parseNotebookLMExamQuestionsToIR } from "./notebooklm-exam-questions-parser";

export const MODULE_ID_NOTEBOOKLM_FINAL_REVIEW_PARSER =
  "notebooklm_final_review_parser" as const;

export interface ParsedFinalReviewCapsuleIR {
  readonly reviewId: string;
  readonly branchId: MathBranchId;
  readonly titleArabic: string;
  readonly goldenRulesCapsuleArabic: readonly string[];
  readonly reviewQuestions: readonly QuestionAssessmentIR[];
}

export function parseNotebookLMFinalReviewResponse(params: {
  readonly reviewId: string;
  readonly branchId: MathBranchId;
  readonly titleArabic: string;
  readonly rawResponse: string;
}): ParsedFinalReviewCapsuleIR {
  const { cleanedText } = sanitizeNotebookLMCitationsAndLatex(params.rawResponse);

  const extractedRules = cleanedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- القانون:") || line.startsWith("• نظرية:"))
    .map((line) => line.replace(/^[-•]\s*(القانون|نظرية):\s*/, "").trim());

  const reviewQuestions = parseNotebookLMExamQuestionsToIR(cleanedText, {
    defaultBranchId: params.branchId,
    defaultLessonTitleArabic: params.titleArabic,
  });

  return {
    reviewId: params.reviewId,
    branchId: params.branchId,
    titleArabic: params.titleArabic,
    goldenRulesCapsuleArabic:
      extractedRules.length > 0
        ? extractedRules
        : [
            "القطعة المستقيمة الواصلة بين منتصفي ضلعين في مثلث توازي الضلع الثالث وتساوي نصف طوله.",
            "مساحة المربع المنشأ على الوتر في المثلث القائم تساوي مجموع مساحتي المربعين المنشأين على ضلعي القائمة.",
          ],
    reviewQuestions,
  };
}
