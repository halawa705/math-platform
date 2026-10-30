/**
 * @file notebooklm-final-review-parser.ts
 * @description محلل ودامج مراحل المراجعة النهائية الشاملة ومراجعات الشهور الثلاث:
 * 1. المرحلة ١ (`stage1Raw`): أسئلة الاختيار من متعدد (MCQ) وإجابتها الصحيحة تحت كل سؤال.
 * 2. المرحلة ٢ (`stage2Raw`): الأسئلة المقالية والبرهان الاستدلالي.
 * 3. المرحلة ٣ (`stage3Raw` - اختيارية): إجابات الأسئلة المقالية الصادرة في المرحلة ٢ وربطها تلقائياً بكل سؤال مقالي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 185 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import {
  convertQuestionAssessmentIRToPrintableItem,
  type PrintableMathQuestionItem,
} from "../pdf-layout-engine/a4-vector-html-sheet-renderer";
import { sanitizeNotebookLMCitationsAndLatex } from "./notebooklm-citation-latex-sanitizer";
import { parseNotebookLMExamQuestionsToIR } from "./notebooklm-exam-questions-parser";

export const MODULE_ID_NOTEBOOKLM_FINAL_REVIEW_PARSER =
  "notebooklm_final_review_parser" as const;

function extractStage3EssaySolutionsByNumber(
  stage3Cleaned: string
): Map<number, readonly string[]> {
  const map = new Map<number, readonly string[]>();
  if (!stage3Cleaned) return map;

  const splits = stage3Cleaned.split(
    /(?:^|\n)\s*(?:حل\s+السؤال\s*\[?(\d+)\]?\s*:?|===\s*\[(?:SOLUTION|حل|QUESTION)\s*:\s*(\d+)\][^\n]*===|\[(\d+)\])/i
  );

  let seq = 1;
  for (let i = 1; i < splits.length; i += 4) {
    const qNum = Number(splits[i] || splits[i + 1] || splits[i + 2]) || seq++;
    const body = splits[i + 3] || "";
    const steps = body
      .split(/\||\r?\n/)
      .map((s) =>
        s
          .replace(
            /^\s*(?:خطوات[_\s]الحل|الناتج[_\s]النهائي(?:\s*المعتمد)?|الإجابة[_\s]النهائية)\s*:\s*/i,
            ""
          )
          .replace(/^\s*(?:[-•*]|\d+[.)-])\s*/, "")
          .trim()
      )
      .filter((s) => s.length > 1);
    if (steps.length > 0) {
      map.set(qNum, steps);
    }
  }
  return map;
}

/**
 * يدمج ردود المراحل الثلاث للمراجعة النهائية:
 * - المرحلة ١: أسئلة الاختيار من متعدد وإجابتها
 * - المرحلة ٢: الأسئلة المقالية والبرهان
 * - المرحلة ٣ (اختيارية): إجابات الأسئلة المقالية (ترتبط تلقائياً بأسئلة المرحلة ٢)
 */
export function mergeFinalReviewThreeStagesToPrintableItems(params: {
  readonly stage1Raw: string;
  readonly stage2Raw?: string;
  readonly stage3Raw?: string;
  readonly branchId: MathBranchId;
  readonly branchNameAr: string;
  readonly titleArabic: string;
}): readonly PrintableMathQuestionItem[] {
  const cleanS1 = sanitizeNotebookLMCitationsAndLatex(params.stage1Raw || "").cleanedText;
  const cleanS2 = sanitizeNotebookLMCitationsAndLatex(params.stage2Raw || "").cleanedText;
  const cleanS3 = sanitizeNotebookLMCitationsAndLatex(params.stage3Raw || "").cleanedText;

  const resultItems: PrintableMathQuestionItem[] = [];

  // ١. المرحلة الأولى: أسئلة الاختيار من متعدد وإجابتها
  if (cleanS1) {
    const s1Questions = parseNotebookLMExamQuestionsToIR({
      rawText: cleanS1,
      branchId: params.branchId,
      unitId: "review-mcq-unit",
      lessonId: "review-mcq",
      lessonTitleArabic: params.titleArabic,
    });

    s1Questions.forEach((q, idx) => {
      const base = convertQuestionAssessmentIRToPrintableItem(q, params.branchNameAr);
      resultItems.push({
        ...base,
        id: `rev-mcq-${idx + 1}`,
        questionNumber: resultItems.length + 1,
        ideaBannerTitleAr:
          idx === 0
            ? `أولاً: أسئلة الاختيار من متعدد (${s1Questions.length} سؤالاً)`
            : undefined,
      });
    });
  }

  // ٢. المرحلة الثانية: الأسئلة المقالية والبرهان + ربطها بإجابات المرحلة الثالثة الاختيارية
  const essaySolutionsMap = extractStage3EssaySolutionsByNumber(cleanS3);
  if (cleanS2) {
    const s2Essays = parseNotebookLMExamQuestionsToIR({
      rawText: cleanS2,
      branchId: params.branchId,
      unitId: "review-essay-unit",
      lessonId: "review-essay",
      lessonTitleArabic: params.titleArabic,
    });

    s2Essays.forEach((q, idx) => {
      const essayOrder = idx + 1;
      const base = convertQuestionAssessmentIRToPrintableItem(q, params.branchNameAr);
      const matchedSteps = essaySolutionsMap.get(essayOrder);

      resultItems.push({
        ...base,
        id: `rev-essay-${essayOrder}`,
        questionNumber: resultItems.length + 1,
        marks: q.allocatedMarks > 1 ? q.allocatedMarks : 3,
        modelAnswerAr: matchedSteps
          ? matchedSteps.join(" ⇐ ")
          : base.modelAnswerAr,
        solutionStepsAr: matchedSteps || base.solutionStepsAr,
        ideaBannerTitleAr:
          idx === 0
            ? `ثانياً: الأسئلة المقالية والبرهان (${s2Essays.length} مسألة)`
            : undefined,
      });
    });
  } else if (cleanS3 && resultItems.length === 0) {
    const s3Fallback = parseNotebookLMExamQuestionsToIR({
      rawText: cleanS3,
      branchId: params.branchId,
      unitId: "review-s3-unit",
      lessonId: "review-s3",
      lessonTitleArabic: params.titleArabic,
    });
    s3Fallback.forEach((q) =>
      resultItems.push(convertQuestionAssessmentIRToPrintableItem(q, params.branchNameAr))
    );
  }

  return resultItems;
}
