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
import type { CurriculumStageKind } from "./unsolicited-diagram-guard";

/**
 * @deprecated مُحْتَفَظ به مؤقتاً للحذف النهائي بعد المراجعة البشرية (Phase 3/4).
 */
export const legacyEveryLineStage3PrefixStripRegex =
  /^(?:(?:حل|إجابة)\s*(?:السؤال|المسألة|التمرين)?\s*[:.-]?\s*(?:\[\d+\]|\(\d+\)|#?\d+)?|(?:السؤال|المسألة|سؤال|س)\s*(?:\[\d+\]|\(\d+\)|#?\d+)?|===\s*\[[^\n\]]+\]|\[\d+\]|\(\d+\)|#\d+\b|\d+[.)-]\s*)\s*[:.-]?\s*/i;

const STAGE3_HEADER_LINE_PREFIX_REGEX =
  /^(?:(?:حل|إجابة)\s*(?:السؤال|المسألة|التمرين)?\s*[:.-]?\s*(?:\[\d+\]|\(\d+\)|#?\d+)?|(?:السؤال|المسألة|سؤال|س)\s*(?:\[\d+\]|\(\d+\)|#?\d+)?|===\s*\[[^\n\]]+\]|\[\d+\]|\(\d+\)|#\d+(?=\s|\[|:|$))\s*[:.-]?\s*/i;

const STAGE3_STEP_NUMBERED_PREFIX_REGEX =
  /^(?:(?:حل|إجابة)\s+(?:السؤال|المسألة|التمرين)\s*(?:\[\d+\]|\(\d+\)|#?\d+)\s*[:.-]?|(?:السؤال|سؤال|س)\s*(?:\[\d+\]|\(\d+\)|#\d+|\d+)\s*[:.-]|===\s*\[[^\n\]]+\]|\[\d+\]\s*|\(\d+\)\s*|#\d+\b\s*|\d+[.)-]\s*)\s*/i;

export const MODULE_ID_NOTEBOOKLM_FINAL_REVIEW_PARSER =
  "notebooklm_final_review_parser" as const;

const ARABIC_ORDINAL_INDEX_MAP: Record<string, number> = {
  "الأولى": 1, "الأول": 1,
  "الثانية": 2, "الثاني": 2,
  "الثالثة": 3, "الثالث": 3,
  "الرابعة": 4, "الرابع": 4,
  "الخامسة": 5, "الخامس": 5,
  "السادسة": 6, "السادس": 6,
  "السابعة": 7, "السابع": 7,
  "الثامنة": 8, "الثامن": 8,
  "التاسعة": 9, "التاسع": 9,
  "العاشرة": 10, "العاشر": 10,
  "الحادية عشرة": 11, "الحادي عشر": 11,
  "الثانية عشرة": 12, "الثاني عشر": 12,
  "الثالثة عشرة": 13, "الثالث عشر": 13,
  "الرابعة عشرة": 14, "الرابع عشر": 14,
  "الخامسة عشرة": 15, "الخامس عشر": 15,
  "السادسة عشرة": 16, "السادس عشر": 16,
  "السابعة عشرة": 17, "السابع عشر": 17,
  "الثامنة عشرة": 18, "الثامن عشر": 18,
  "التاسعة عشرة": 19, "التاسع عشر": 19,
  "العشرون": 20, "العشرين": 20,
  "الثلاثون": 30, "الثلاثين": 30,
};

function cleanConversationalIntro(text: string): string {
  return text.trim().replace(
    /^(?:(?:إليك|فيما\s+يلي|مرحباً|أهلاً|نقدم|نموذج\s+(?:إجابة|الإجابة)|كراسة\s+الإجابة|حلول\s+المسائل|المرحلة\s+الثالثة|إجابات\s+المسائل)[^\n:]*[:\n]+)+/i,
    ""
  ).trim();
}

const QUESTION_HEADER_REGEX =
  /(?:^|\n)\s*(?=(?:#{1,6}\s+|[-•*]\s+)?(?:(?:حل|إجابة)\s+(?:السؤال|المسألة|التمرين)(?:\s*[:.-]?\s*(?:\[\d+\]|\(\d+\)|#?\d+|الأولى?|الثاني?ة?|الثالثة?|الرابعة?|الخامسة?|السادسة?|السابعة?|الثامنة?|التاسعة?|العاشرة?|الحادي\s*عشر|الثاني\s*عشر)?)?|(?:حل|إجابة)\s*[:.-]?\s*(?:\[\d+\]|\(\d+\)|#?\d+)|(?:السؤال|المسألة|سؤال|س)\s+(?:\[\d+\]|\(\d+\)|#?\d+|الأولى?|الثاني?ة?|الثالثة?|الرابعة?|الخامسة?|السادسة?|السابعة?|الثامنة?|التاسعة?|العاشرة?|الحادي\s*عشر|الثاني\s*عشر)|===\s*\[(?:SOLUTION|حل|QUESTION|إجابة)|\[\d+\]|\(\d+\)|#\d+\s*[:.-]?\s+|\d+[.)-]\s+))/i;

function splitStage3Blocks(cleaned: string): readonly string[] {
  let blocks = cleaned.split(QUESTION_HEADER_REGEX).map((b) => b.trim()).filter((b) => b.length > 5);
  if (blocks.length <= 1) {
    const stepSplits = cleaned.split(/(?:^|\n)\s*(?=خطوات[_\s]الحل\s*:)/i).map((b) => b.trim()).filter((b) => b.length > 5);
    if (stepSplits.length > 1) {
      blocks = stepSplits;
    } else {
      const dblSplits = cleaned.split(/\n{2,}/).map((b) => b.trim()).filter((b) => b.length > 5);
      if (dblSplits.length > 1) {
        blocks = dblSplits;
      }
    }
  }
  return blocks;
}

function extractStage3EssaySolutionsByNumber(
  stage3Cleaned: string,
  mcqOffset: number = 0
): Map<number, readonly string[]> {
  const map = new Map<number, readonly string[]>();
  if (!stage3Cleaned) return map;

  const sanitized = stage3Cleaned.replace(/^[\s"“«]+|[\s"”»]+$/g, "").trim();
  const cleaned = cleanConversationalIntro(sanitized);
  const rawBlocks = splitStage3Blocks(cleaned);

  const seqMap = new Map<number, readonly string[]>();
  let seq = 1;
  for (const block of rawBlocks) {
    const hasMathOrSolutionTags =
      /(?:خطوات[_\s]الحل|الناتج[_\s]النهائي|الحل\s*:|[=\-+$\times\div\le\ge])/i.test(block);
    if (!hasMathOrSolutionTags) {
      continue;
    }

    const digitMatch = block.match(
      /^(?:#{1,6}\s+|[-•*]\s+)?(?:(?:حل|إجابة)\s*(?:السؤال|المسألة|التمرين)?\s*[:.-]?\s*(?:\[(\d+)\]|\((\d+)\)|#?(\d+))|(?:السؤال|المسألة|سؤال|س)\s*(?:\[(\d+)\]|\((\d+)\)|#?(\d+))|===\s*\[(?:SOLUTION|حل|QUESTION|إجابة)\s*:\s*(\d+)\]|\[(\d+)\]|\((\d+)\)|#(\d+)\b|(\d+)[.)-]\s+)/i
    );
    const matchedDigit =
      digitMatch?.[1] || digitMatch?.[2] || digitMatch?.[3] ||
      digitMatch?.[4] || digitMatch?.[5] || digitMatch?.[6] ||
      digitMatch?.[7] || digitMatch?.[8] || digitMatch?.[9] ||
      digitMatch?.[10] || digitMatch?.[11];

    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const steps: string[] = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      let line = lines[lineIdx]
        .replace(/^(?:#{1,6}\s+|[-•*]\s+)/, "")
        .replace(
          lineIdx === 0 ? STAGE3_HEADER_LINE_PREFIX_REGEX : STAGE3_STEP_NUMBERED_PREFIX_REGEX,
          ""
        )
        .trim();

      if (!line || /^[-*_]{3,}$/.test(line) || /^(?:💡|📄)?\s*هل\s+(?:ننتقل|ترغب|تود)\b/i.test(line)) continue;

      if (/^خطوات[_\s]الحل\s*:\s*/i.test(line)) {
        const afterColon = line.replace(/^خطوات[_\s]الحل\s*:\s*/i, "").trim();
        if (afterColon) {
          steps.push(...afterColon.split(/\s*\|\s*/).map((s) => s.trim()).filter(Boolean));
        }
      } else if (/^(?:الناتج[_\s]النهائي|الإجابة[_\s]النهائية)/i.test(line)) {
        steps.push(line);
      } else {
        const parts = line.split(/\s*\|\s*/).map((s) => s.trim()).filter(Boolean);
        steps.push(...parts);
      }
    }

    if (steps.length > 0) {
      const currentSeq = seq++;
      seqMap.set(currentSeq, steps);
      if (matchedDigit) {
        map.set(Number(matchedDigit), steps);
      } else {
        const ordinalMatch = block.match(
          /^(?:(?:حل|إجابة)?\s*(?:السؤال|المسألة)\s+(الأولى|الأول|الثانية|الثاني|الثالثة|الثالث|الرابعة|الرابع|الخامسة|الخامس|السادسة|السادس|السابعة|السابع|الثامنة|الثامن|التاسعة|التاسع|العاشرة|العاشر))/i
        );
        const ordinalKey = ordinalMatch?.[1];
        if (ordinalKey && ARABIC_ORDINAL_INDEX_MAP[ordinalKey]) {
          map.set(ARABIC_ORDINAL_INDEX_MAP[ordinalKey], steps);
        }
      }
    }
  }
  for (const [k, v] of seqMap) {
    if (!map.has(k)) map.set(k, v);
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
  readonly gradeId?: string;
  readonly stage?: CurriculumStageKind;
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
      gradeId: params.gradeId,
      stage: params.stage,
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
  const s1Count = resultItems.length;
  const essaySolutionsMap = extractStage3EssaySolutionsByNumber(cleanS3, s1Count);
  if (cleanS2) {
    const s2Essays = parseNotebookLMExamQuestionsToIR({
      rawText: cleanS2,
      branchId: params.branchId,
      unitId: "review-essay-unit",
      lessonId: "review-essay",
      lessonTitleArabic: params.titleArabic,
      gradeId: params.gradeId,
      stage: params.stage,
    });

    s2Essays.forEach((q, idx) => {
      const essayOrder = idx + 1;
      const globalQuestionNum = resultItems.length + 1;
      const base = convertQuestionAssessmentIRToPrintableItem(q, params.branchNameAr);
      const matchedSteps =
        essaySolutionsMap.get(essayOrder) ??
        essaySolutionsMap.get(s1Count + essayOrder) ??
        essaySolutionsMap.get(globalQuestionNum);

      const finalSteps =
        matchedSteps && matchedSteps.length > 0
          ? matchedSteps
          : base.solutionStepsAr && base.solutionStepsAr.some((s) => s.trim().length > 0)
            ? base.solutionStepsAr.filter((s) => s.trim().length > 0)
            : undefined;

      resultItems.push({
        ...base,
        id: `rev-essay-${essayOrder}`,
        questionNumber: resultItems.length + 1,
        marks: q.allocatedMarks > 1 ? q.allocatedMarks : 3,
        modelAnswerAr: finalSteps && finalSteps.length > 0
          ? finalSteps.join(" ⇐ ")
          : base.modelAnswerAr,
        solutionStepsAr: finalSteps,
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
