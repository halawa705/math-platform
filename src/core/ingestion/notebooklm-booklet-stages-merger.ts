/**
 * @file notebooklm-booklet-stages-merger.ts
 * @description دامج ومحلل ردود المراحل الثلاث للمذكرة الدراسية بتفنيط صارم يمنع تسرب الأفكار أو دمج الأمثلة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 195 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { matchGeometryWithDiagnostics } from "../geometry-engine/natural-arabic-geometry-matcher";
import { combineProblemAndTagGeometryContext } from "../geometry-engine/description-intake/problem-geometry-context-extractor";
import { parseCartesianGraphDescription } from "../geometry-engine/graph-compositor/graph-fact-parser";
import { convertQuestionAssessmentIRToPrintableItem, type PrintableMathQuestionItem } from "../pdf-layout-engine/a4-vector-html-sheet-renderer";
import { sanitizeNotebookLMCitationsAndLatex } from "./notebooklm-citation-latex-sanitizer";
import { parseNotebookLMExamQuestionsToIR, resolveCorrectChoiceIndex } from "./notebooklm-exam-questions-parser";
import {
  IDEA_HEADER_SPLIT_REGEX,
  buildStage2PrintableItem,
  extractConceptAndRule,
  parseSolvedExamplesFromSection,
  parseStage2ByIdeas,
  parseStage3SolutionsMap,
} from "./notebooklm-stage-parsers-helper";

export const MODULE_ID_NOTEBOOKLM_BOOKLET_STAGES_MERGER = "notebooklm_booklet_stages_merger" as const;

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
  let rawS1 = params.stage1Raw || "";
  let rawS2 = params.stage2Raw || "";
  if (!rawS2) {
    const s2MarkerMatch =
      rawS1.match(/(?:^|\n)\s*(?:##?\s*)?(?:مذكرة\s*الطالب|تمارين\s*وواجبات\s*بدون\s*حلول)/i) ??
      rawS1.match(/(?:^|\n)\s*(?=(?:###?\s*)?الفكرة\s+(?:الأولى|الاولى|1|١)[^\n]*\n\s*(?:أولاً\s*:\s*)?(?:تمارين\s*)?\(?حاول\s*بنفسك\)?)/i);
    if (s2MarkerMatch?.index !== undefined) {
      rawS2 = rawS1.slice(s2MarkerMatch.index);
      rawS1 = rawS1.slice(0, s2MarkerMatch.index);
    }
  }

  const cleanS1 = sanitizeNotebookLMCitationsAndLatex(rawS1).cleanedText;
  const cleanS2 = sanitizeNotebookLMCitationsAndLatex(rawS2).cleanedText;
  const cleanS3 = sanitizeNotebookLMCitationsAndLatex(params.stage3Raw || "").cleanedText;
  const solutionsMap = parseStage3SolutionsMap(cleanS3);
  const { drillsByIdea, allHomework } = parseStage2ByIdeas(cleanS2);
  const resultItems: PrintableMathQuestionItem[] = [];

  if (cleanS1) {
    const cleanBlocksText = cleanS1.replace(/(?:^|\n)\s*نهاية\s*الفكرة[^\n]*/gi, "").replace(/\s*(?:---|___|\*\*\*)\s*/g, "\n\n");
    const firstIdeaIdx = cleanBlocksText.search(IDEA_HEADER_SPLIT_REGEX);
    const rawBlocks = (firstIdeaIdx !== -1 ? cleanBlocksText.slice(firstIdeaIdx) : cleanBlocksText)
      .split(IDEA_HEADER_SPLIT_REGEX)
      .map((b) => b.trim())
      .filter((b) => b.length > 20);

    const mergedBlocks: string[] = [];
    rawBlocks.forEach((block) => {
      const ideaTitle = block.match(/(?:###?\s*)?الفكرة\s+([^:\n|]+)/i)?.[1]?.trim() || "";
      const lastBlock = mergedBlocks[mergedBlocks.length - 1];
      const lastIdeaTitle = lastBlock?.match(/(?:###?\s*)?الفكرة\s+([^:\n|]+)/i)?.[1]?.trim() || "";
      if (lastBlock && ideaTitle && ideaTitle === lastIdeaTitle) {
        mergedBlocks[mergedBlocks.length - 1] = `${lastBlock}\n\n${block}`;
      } else {
        mergedBlocks.push(block);
      }
    });

    mergedBlocks.forEach((block, ideaIdx) => {
      const titleMatch = block.match(/(?:###?\s*)?الفكرة\s+([^:\n|]+)(?:[:|]\s*([^\n|]+))?/i);
      const ideaNumAr = titleMatch?.[1]?.trim() || `${ideaIdx + 1}`;
      const ideaNameAr = (titleMatch?.[2] || "").replace(/^\[|\]$/g, "").trim();
      const fullTitle = `الفكرة ${ideaNumAr}${ideaNameAr ? `: ${ideaNameAr}` : ""}`;
      const ideaKey = block.match(/معرف\s*الفكرة\s*:\s*(idea-\d+)/i)?.[1]?.toLowerCase() || `idea-${ideaIdx + 1}`;

      const { concept, rule, examplesPart } = extractConceptAndRule(block);
      const examples = parseSolvedExamplesFromSection(examplesPart, fullTitle, concept);
      if (!concept && !rule && examples.every((e) => e.promptAr === fullTitle || e.steps.length === 0)) return;

      examples.forEach((ex, exIdx) => {
        const graphSpec = ex.geometryRaw ? parseCartesianGraphDescription(ex.geometryRaw) ?? undefined : undefined;
        const combinedGeo = !graphSpec
          ? combineProblemAndTagGeometryContext(ex.geometryRaw, ex.promptAr)
          : "";
        const geoDiag =
          combinedGeo
            ? matchGeometryWithDiagnostics(combinedGeo, `s1_g_${ideaIdx + 1}_${exIdx + 1}`)
            : undefined;
        const geoMatch = geoDiag?.figure;
        const figureDiagnosticsAr =
          geoDiag && (!geoDiag.figure || geoDiag.warnings.length > 0) ? geoDiag.warnings : undefined;
        resultItems.push({
          id: `booklet-s1-example-${ideaIdx + 1}-${exIdx + 1}`,
          questionNumber: resultItems.length + 1,
          ideaIndex: ideaIdx + 1,
          kind: ex.mcqChoicesAr ? "mcq" : geoMatch || graphSpec ? "essay_geometry" : "essay_algebra",
          branchBadgeAr: params.branchNameAr,
          marks: 2,
          promptAr: ex.promptAr,
          mcqChoicesAr: ex.mcqChoicesAr,
          correctMcqIndex: resolveCorrectChoiceIndex(ex.rawFinal || ex.steps.join(" "), ex.mcqChoicesAr),
          modelAnswerAr: ex.steps.join(" ⇐ ") || ex.rawFinal || "تطبيق مباشر",
          solutionStepsAr: ex.steps.length > 0 ? ex.steps : undefined,
          geometryFigure: geoMatch,
          graphSpec,
          figureDiagnosticsAr,
          ideaBannerTitleAr: exIdx === 0 ? fullTitle : undefined,
          conceptExplanationAr: exIdx === 0 ? concept : undefined,
          framedRuleAr: exIdx === 0 ? rule : undefined,
        });
      });

      const matchingDrills = drillsByIdea.get(ideaKey) || drillsByIdea.get(`idx-${ideaIdx + 1}`) || [];
      matchingDrills.forEach((drill, dIdx) => {
        resultItems.push(
          buildStage2PrintableItem({
            id: `booklet-s1-drill-${ideaIdx + 1}-${dIdx + 1}`,
            questionNumber: resultItems.length + 1,
            block: { ...drill, ideaIndex: ideaIdx + 1 },
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
          ideaIndex: 1,
          ideaBannerTitleAr: idx === 0 ? `أولاً: شرح الأفكار والأمثلة المحلولة — ${params.lessonTitleArabic}` : undefined,
        });
      });
    }
  } else if (drillsByIdea.size > 0) {
    let seenIdx = 0;
    for (const [key, drills] of drillsByIdea.entries()) {
      if (!key.startsWith("idea-")) continue;
      seenIdx += 1;
      drills.forEach((drill, dIdx) => {
        resultItems.push(
          buildStage2PrintableItem({
            id: `booklet-s2-only-drill-${seenIdx}-${dIdx + 1}`,
            questionNumber: resultItems.length + 1,
            block: { ...drill, ideaIndex: seenIdx },
            branchNameAr: params.branchNameAr,
            defaultPrompt: `تمرين حاول بنفسك (${dIdx + 1})`,
            defaultAnswer: "حل الطالب كتطبيق مباشر على الفكرة",
            bannerTitleAr: dIdx === 0 ? `الفكرة (${seenIdx}) — تمارين حاول بنفسك` : undefined,
            solutionsMap,
          })
        );
      });
    }
  }

  allHomework.forEach((hw, hIdx) => {
    resultItems.push(
      buildStage2PrintableItem({
        id: `booklet-s2-hw-${hIdx + 1}`,
        questionNumber: hIdx + 1,
        block: hw,
        branchNameAr: params.branchNameAr,
        defaultPrompt: `سؤال واجب (${hIdx + 1})`,
        defaultAnswer: "واجب منزلي للتقييم والتصحيح",
        bannerTitleAr: hIdx === 0 ? "📚 تمارين الواجب المنزلي الشاملة على الدرس" : undefined,
        solutionsMap,
      })
    );
  });

  return resultItems;
}
