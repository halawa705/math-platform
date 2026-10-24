/**
 * @file notebooklm-booklet-stages-merger.ts
 * @description دامج ومحلل ردود المراحل الثلاث للمذكرة الدراسية بتفنيط صارم يمنع تسرب الأفكار أو دمج الأمثلة:
 * - المرحلة 1: يفصل كل فكرة وقاعدتها، ويفصل الأمثلة المتعددة ولا يبتلع الأمثلة اللاحقة في خطوات المثال الأول.
 * - المرحلة 2: يطهر المقدمات الترويسية، ويفصل تدريبات حاول بنفسك وتمارين الواجب المنزلي بدقة متناهية.
 * - المرحلة 3: يربط خطوات الحلول بالمعرفات والأرقام بدقة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import type {
  BookletLessonContentIR,
  IdeaPedagogicalNode,
} from "../ir/booklet-lesson-content-ir";
import type { MathBranchId } from "../ssot/math-branches-ssot";
import { matchOptionalGeometryFigureFromArabicDescription } from "../geometry-engine/natural-arabic-geometry-matcher";
import {
  convertQuestionAssessmentIRToPrintableItem,
  type PrintableMathQuestionItem,
} from "../pdf-layout-engine/a4-vector-html-sheet-renderer";
import { sanitizeNotebookLMCitationsAndLatex } from "./notebooklm-citation-latex-sanitizer";
import {
  parseChoicesTupleFromBlock,
  parseNotebookLMExamQuestionsToIR,
  resolveCorrectChoiceIndex,
  stripInlineChoicesFromPromptText,
} from "./notebooklm-exam-questions-parser";
import {
  extractStage2DrillsAndHomeworkBlocks,
  parseStage1IdeasToPrintableItems,
  parseStage3SolutionsMap,
} from "./notebooklm-stage-parsers-helper";

export const MODULE_ID_NOTEBOOKLM_BOOKLET_STAGES_MERGER =
  "notebooklm_booklet_stages_merger" as const;

export interface MergeBookletThreeStagesInput {
  readonly bookletId: string;
  readonly gradeId: string;
  readonly gradeNameArabic: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly unitId: string;
  readonly unitTitleArabic: string;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;
  readonly stage1RawResponse: string;
  readonly stage2RawResponse?: string;
  readonly stage3RawResponse?: string;
}

export function mergeBookletThreeStagesRepliesToPrintableItems(params: {
  readonly stage1Raw: string;
  readonly stage2Raw?: string;
  readonly stage3Raw?: string;
  readonly branchId: MathBranchId;
  readonly branchNameAr: string;
  readonly unitId: string;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;
}): readonly PrintableMathQuestionItem[] {
  const cleanS1 = sanitizeNotebookLMCitationsAndLatex(params.stage1Raw || "").cleanedText;
  const cleanS2 = sanitizeNotebookLMCitationsAndLatex(params.stage2Raw || "").cleanedText;
  const cleanS3 = sanitizeNotebookLMCitationsAndLatex(params.stage3Raw || "").cleanedText;
  const resultItems: PrintableMathQuestionItem[] = [];

  // 1. المرحلة الأولى: استخراج الأفكار والأمثلة المحلولة
  if (cleanS1) {
    const s1Items = parseStage1IdeasToPrintableItems(cleanS1, params.branchNameAr);
    resultItems.push(...s1Items);

    if (resultItems.length === 0) {
      const fallbackQs = parseNotebookLMExamQuestionsToIR({
        rawText: cleanS1,
        branchId: params.branchId,
        unitId: params.unitId,
        lessonId: params.lessonId,
        lessonTitleArabic: params.lessonTitleArabic,
      });
      fallbackQs.forEach((q, idx) => {
        const item = convertQuestionAssessmentIRToPrintableItem(q, params.branchNameAr);
        resultItems.push({
          ...item,
          questionNumber: resultItems.length + 1,
          ideaBannerTitleAr: idx === 0 ? `أولاً: شرح الأفكار والأمثلة المحلولة — ${params.lessonTitleArabic}` : undefined,
        });
      });
    }
  }

  // 2. المرحلة الثانية: استخراج تدريبات حاول بنفسك والواجب
  const solutionsMap = parseStage3SolutionsMap(cleanS3);
  if (cleanS2) {
    const s2Items = extractStage2DrillsAndHomeworkBlocks(cleanS2);
    let drillCount = 0;
    let hwCount = 0;

    s2Items.forEach((it) => {
      const isDrill = it.type === "drill";
      if (isDrill) drillCount++;
      else hwCount++;

      const geoMatch = it.geometryText
        ? matchOptionalGeometryFigureFromArabicDescription(it.geometryText, `s2_g_${resultItems.length + 1}`)
        : undefined;

      const mcqChoices = parseChoicesTupleFromBlock(it.promptText);
      const promptAr = mcqChoices ? stripInlineChoicesFromPromptText(it.promptText) : it.promptText;
      const isMcq = it.kindTag.includes("اختر") || mcqChoices !== undefined;
      const matchedSteps = (it.qCode ? solutionsMap.byCode.get(it.qCode) : undefined) || solutionsMap.byIndex.get(resultItems.length + 1);

      resultItems.push({
        id: `booklet-s2-${it.type}-${resultItems.length + 1}`,
        questionNumber: resultItems.length + 1,
        kind: isMcq ? "mcq" : geoMatch ? "essay_geometry" : "essay_algebra",
        branchBadgeAr: params.branchNameAr,
        marks: isMcq ? 1 : 2,
        promptAr: promptAr || (isDrill ? `تمرين حاول بنفسك (${drillCount})` : `سؤال واجب (${hwCount})`),
        mcqChoicesAr: mcqChoices,
        correctMcqIndex: resolveCorrectChoiceIndex(matchedSteps?.[matchedSteps.length - 1] || "", mcqChoices),
        modelAnswerAr: matchedSteps ? matchedSteps.join(" ⇐ ") : isDrill ? "حل الطالب كتطبيق مباشر" : "واجب منزلي للتقييم والتصحيح",
        solutionStepsAr: matchedSteps,
        geometryFigure: geoMatch,
        ideaBannerTitleAr:
          isDrill && drillCount === 1
            ? "✍️ أولاً: تدريبات الفهم المباشر (حاول بنفسك)"
            : !isDrill && hwCount === 1
              ? "📚 ثانياً: تمارين الواجب المنزلي على الدرس"
              : undefined,
      });
    });
  }

  return resultItems;
}

export function parseBookletResponseToPrintableItems(params: {
  readonly rawText: string;
  readonly branchId: MathBranchId;
  readonly branchNameAr: string;
  readonly unitId: string;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;
}): readonly PrintableMathQuestionItem[] {
  return mergeBookletThreeStagesRepliesToPrintableItems({
    stage1Raw: params.rawText,
    branchId: params.branchId,
    branchNameAr: params.branchNameAr,
    unitId: params.unitId,
    lessonId: params.lessonId,
    lessonTitleArabic: params.lessonTitleArabic,
  });
}

export function mergeNotebookLMBookletThreeStagesToIR(
  input: MergeBookletThreeStagesInput
): BookletLessonContentIR {
  const items = mergeBookletThreeStagesRepliesToPrintableItems({
    stage1Raw: input.stage1RawResponse,
    stage2Raw: input.stage2RawResponse,
    stage3Raw: input.stage3RawResponse,
    branchId: input.branchId,
    branchNameAr: input.unitTitleArabic,
    unitId: input.unitId,
    lessonId: input.lessonId,
    lessonTitleArabic: input.lessonTitleArabic,
  });
  const pedagogicalIdeas: IdeaPedagogicalNode[] = items.map((item, idx) => ({
    ideaId: `idea_${idx + 1}`,
    ideaOrderNumber: idx + 1,
    ideaTitleArabic: item.ideaBannerTitleAr || `الفكرة ${idx + 1}`,
    conceptualExplanationArabic: item.conceptExplanationAr || item.promptAr,
    boxedRuleOrTheoremArabic: item.framedRuleAr || "",
    workedExamples: [],
    immediateStudentDrills: [],
  }));
  return {
    bookletId: input.bookletId,
    gradeId: input.gradeId,
    gradeNameArabic: input.gradeNameArabic,
    termNumber: input.termNumber,
    branchId: input.branchId,
    unitId: input.unitId,
    unitTitleArabic: input.unitTitleArabic,
    lessonId: input.lessonId,
    lessonTitleArabic: input.lessonTitleArabic,
    executiveSummaryRulesArabic: pedagogicalIdeas.map((i) => i.boxedRuleOrTheoremArabic).filter(Boolean),
    pedagogicalIdeas,
    comprehensiveExercises: [],
    homeworkAssignmentQuestions: [],
  };
}
