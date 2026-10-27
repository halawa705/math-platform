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
  buildStage2PrintableItem,
  extractConceptAndRule,
  parseSolvedExamplesFromSection,
  parseStage2ByIdeas,
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

  const solutionsMap = parseStage3SolutionsMap(cleanS3);
  const { drillsByIdea, allHomework } = parseStage2ByIdeas(cleanS2);

  // 1. معالجة المرحلة 1 (الأفكار والمفاهيم والقواعد والأمثلة) مع ربط تدريبات حاول بنفسك بكل فكرة مباشرة
  if (cleanS1) {
    const cleanBlocksText = cleanS1
      .replace(/\s*(?:---|___|\*\*\*)\s*/g, "\n\n")
      .replace(/(?:^|[^\n])\s*(?=(?:###?\s*)?الفكرة\s+(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية|الثانية|[0-9٠-٩]+))/gi, "\n\n");

    const rawBlocks = cleanBlocksText
      .replace(/^[\s\S]*?(?=(?:###?\s*)?الفكرة\s+(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية|الثانية|[0-9٠-٩]+))/i, "")
      .split(/(?=(?:^|\n)\s*(?:###?\s*)?الفكرة\s+(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية|الثانية|[0-9٠-٩]+))/i)
      .map((b) => b.trim())
      .filter((b) => b.length > 20);

    const mergedBlocks: string[] = [];
    rawBlocks.forEach((block) => {
      const titleMatch = block.match(/(?:###?\s*)?الفكرة\s+([^:\n|]+)/i);
      const ideaTitle = titleMatch?.[1]?.trim() || "";
      const lastBlock = mergedBlocks[mergedBlocks.length - 1];
      const lastTitleMatch = lastBlock ? lastBlock.match(/(?:###?\s*)?الفكرة\s+([^:\n|]+)/i) : null;
      const lastIdeaTitle = lastTitleMatch?.[1]?.trim() || "";

      if (lastBlock && ideaTitle && ideaTitle === lastIdeaTitle) {
        // دمج أجزاء نفس الفكرة عند تكرار عنوان الفكرة لنفس الأمثلة
        mergedBlocks[mergedBlocks.length - 1] = `${lastBlock}\n\n${block}`;
      } else {
        mergedBlocks.push(block);
      }
    });

    mergedBlocks.forEach((block, ideaIdx) => {
      const titleMatch = block.match(/(?:###?\s*)?الفكرة\s+([^:\n|]+)(?:[:|]\s*\[?([^\]\n|]+)\]?)?/i);
      const ideaNumAr = titleMatch?.[1]?.trim() || `${ideaIdx + 1}`;
      const ideaNameAr = titleMatch?.[2]?.trim() || "";
      const fullTitle = `الفكرة ${ideaNumAr}${ideaNameAr ? `: ${ideaNameAr}` : ""}`;

      const codeMatch = block.match(/معرف\s*الفكرة\s*:\s*(idea-\d+)/i);
      const ideaKey = codeMatch ? codeMatch[1].toLowerCase() : `idea-${ideaIdx + 1}`;

      const { concept, rule } = extractConceptAndRule(block);

      const examplesPart = block.replace(
        /^[\s\S]*?(?=(?:###\s*)?(?:المثال\s*(?:الأول|الثاني|الثالث|الرابع|الخامس|[0-9٠-٩]+)|مثال\s*\([0-9٠-٩]+\)|مثال\s*[0-9٠-٩]+|معرف\s*المثال|المثال-[0-9٠-٩]+-[0-9٠-٩]+))/i,
        ""
      );
      const examples = parseSolvedExamplesFromSection(examplesPart, fullTitle, concept);

      // تجاهل أي كتلة فارغة ناجمة عن أسطر نهاية الفكرة
      if (
        !concept &&
        !rule &&
        examples.every((e) => e.promptAr === fullTitle || e.steps.length === 0)
      ) {
        return;
      }

      // إضافة الأمثلة المحلولة للفكرة
      examples.forEach((ex, exIdx) => {
        const geoMatch = ex.geometryRaw
          ? matchOptionalGeometryFigureFromArabicDescription(ex.geometryRaw, `s1_g_${ideaIdx + 1}_${exIdx + 1}`)
          : undefined;

        resultItems.push({
          id: `booklet-s1-example-${ideaIdx + 1}-${exIdx + 1}`,
          questionNumber: resultItems.length + 1,
          kind: ex.mcqChoicesAr ? "mcq" : geoMatch ? "essay_geometry" : "essay_algebra",
          branchBadgeAr: params.branchNameAr,
          marks: 2,
          promptAr: ex.promptAr,
          mcqChoicesAr: ex.mcqChoicesAr,
          correctMcqIndex: resolveCorrectChoiceIndex(ex.rawFinal || ex.steps.join(" "), ex.mcqChoicesAr),
          modelAnswerAr: ex.steps.join(" ⇐ ") || ex.rawFinal || "تطبيق مباشر",
          solutionStepsAr: ex.steps.length > 0 ? ex.steps : undefined,
          geometryFigure: geoMatch,
          ideaBannerTitleAr: exIdx === 0 ? fullTitle : undefined,
          conceptExplanationAr: exIdx === 0 ? concept : undefined,
          framedRuleAr: exIdx === 0 ? rule : undefined,
        });
      });

      // إضافة تدريبات حاول بنفسك الخاصة بهذه الفكرة مباشرة تحت أمثلتها
      const matchingDrills = drillsByIdea.get(ideaKey) || drillsByIdea.get(`idx-${ideaIdx + 1}`) || [];
      matchingDrills.forEach((drill, dIdx) => {
        resultItems.push(
          buildStage2PrintableItem({
            id: `booklet-s1-drill-${ideaIdx + 1}-${dIdx + 1}`,
            questionNumber: resultItems.length + 1,
            block: drill,
            branchNameAr: params.branchNameAr,
            defaultPrompt: `تمرين حاول بنفسك (${dIdx + 1})`,
            defaultAnswer: "حل الطالب كتطبيق مباشر على الفكرة",
            solutionsMap,
          })
        );
      });
    });

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

  // 2. إضافة تمارين الواجب المنزلي الشاملة في نهاية الدرس
  if (allHomework.length > 0) {
    allHomework.forEach((hw, hIdx) => {
      resultItems.push(
        buildStage2PrintableItem({
          id: `booklet-s2-hw-${hIdx + 1}`,
          questionNumber: resultItems.length + 1,
          block: hw,
          branchNameAr: params.branchNameAr,
          defaultPrompt: `سؤال واجب (${hIdx + 1})`,
          defaultAnswer: "واجب منزلي للتقييم والتصحيح",
          bannerTitleAr: hIdx === 0 ? "📚 تمارين الواجب المنزلي الشاملة على الدرس" : undefined,
          solutionsMap,
        })
      );
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
