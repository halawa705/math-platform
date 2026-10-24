/**
 * @file notebooklm-booklet-stages-merger.ts
 * @description دامج ومحلل ردود المراحل الثلاث للمذكرة الدراسية (يدعم هيكل النظام المرجعي والهيكل الحديث):
 * - المرحلة 1 (`stage1Raw`): يستخرج كل فكرة (`الفكرة الأولى:` / `idea-01`)، يزيل الأقواس المربعة الزائدة عن عنوان الفكرة،
 *   يفصل بدائل الاختيار من متعدد المدمجة في الأمثلة، ويدمج خطوات الحل المنطقية مع معادلاتها.
 * - المرحلة 2 (`stage2Raw`): يستخرج تدريبات `حاول بنفسك` (`practice-01-01`) وتمارين `الواجب المنزلي` (`homework-01-01`).
 * - المرحلة 3 (`stage3Raw` - اختيارية): يربط الحلول بمعرف السؤال أو رقمه التسلسلي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 198 سطراً).
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
  mergeLogicalSolutionSteps,
  parseChoicesTupleFromBlock,
  parseNotebookLMExamQuestionsToIR,
  resolveCorrectChoiceIndex,
  stripInlineChoicesFromPromptText,
} from "./notebooklm-exam-questions-parser";

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

function cleanBracketedField(val: string): string {
  return val
    .replace(/\s*---+\s*$/g, "")
    .replace(/^[\s\[*]+|[\s\]*]+$/g, "")
    .trim();
}

function extractLineField(block: string, labelPattern: string): string {
  const rx = new RegExp(
    `(?:^|\\n)\\s*(?:${labelPattern})\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:الفكرة|مفهوم[\\s_]الفكرة|المفهوم_الرياضي|القاعدة[\\s_]الرياضية|القانون_أو_القاعدة|المثال\\s*\\d+|نص[\\s_]المسألة|نص_المثال|خطوات[\\s_]الحل|الناتج[\\s_]النهائي|الإجابة_النهائية|حاول بنفسك|تمارين الواجب|نهاية الفكرة)\\s*[:|]|$)`,
    "i"
  );
  return cleanBracketedField(block.match(rx)?.[1] ?? "");
}

function parseStage3SolutionsMap(stage3Cleaned: string): {
  readonly byCode: Map<string, readonly string[]>;
  readonly byIndex: Map<number, readonly string[]>;
} {
  const byCode = new Map<string, readonly string[]>();
  const byIndex = new Map<number, readonly string[]>();
  if (!stage3Cleaned) return { byCode, byIndex };

  const codeSplits = stage3Cleaned.split(
    /معرف\s*السؤال\s*:\s*((?:practice|homework|drill)-\d+-\d+)/i
  );
  for (let i = 1; i < codeSplits.length; i += 2) {
    const code = codeSplits[i].trim().toLowerCase();
    const rawBody = (codeSplits[i + 1] || "").split(/نموذج إجابة|معرف الفكرة/i)[0] || "";
    const steps = mergeLogicalSolutionSteps(
      rawBody.replace(/^\s*(?:خطوات الحل|الناتج النهائي المعتمد|سلم التصحيح)\s*:\s*/gim, "")
    ).filter((l) => !/^درج/i.test(l));
    if (steps.length > 0) byCode.set(code, steps);
  }

  const numSplits = stage3Cleaned.split(
    /(?:===\s*\[(?:SOLUTION|حل|QUESTION)\s*:\s*(\d+)\][^\n]*===|حل\s+السؤال\s*\[?(\d+)\]?\s*:)/i
  );
  let seq = 1;
  for (let i = 1; i < numSplits.length; i += 3) {
    const qNum = Number(numSplits[i] || numSplits[i + 1]) || seq++;
    const body = numSplits[i + 2] || "";
    const steps = mergeLogicalSolutionSteps(
      body.replace(/^\s*(?:خطوات[_\s]الحل|الإجابة[_\s]الصحيحة|الناتج[_\s]النهائي)\s*:\s*/gim, "")
    );
    if (steps.length > 0) byIndex.set(qNum, steps);
  }
  return { byCode, byIndex };
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

  if (cleanS1) {
    const ideaBlocks = cleanS1
      .replace(/^[\s\S]*?(?=(?:الفكرة\s+(?:الأولى|الثانية|الثالثة|\d+)|===\s*\[(?:STAGE_1_IDEA|IDEA)))/i, "")
      .split(/(?=(?:^|\n)\s*(?:الفكرة\s+[^\n:]+:|===\s*\[(?:STAGE_1_IDEA|IDEA)\s*:\s*\d+\]))/i)
      .map((b) => b.replace(/نهاية الفكرة[^\n]*/gi, "").trim())
      .filter((b) => b.length > 15 && !/^فهرس أفكار الدرس/i.test(b));

    if (ideaBlocks.length > 0 && /(?:الفكرة|STAGE_1_IDEA|IDEA|مفهوم|القاعدة)/i.test(cleanS1)) {
      ideaBlocks.forEach((ideaBlock, ideaIdx) => {
        const headerLine = ideaBlock.split(/\r?\n/)[0] || "";
        const rawTitle =
          headerLine
            .replace(/^(?:الفكرة\s+[^:]+:|===\s*\[[^\]]+\]\s*===)/i, "")
            .split("|")[0]
            ?.trim() ||
          extractLineField(ideaBlock, "عنوان_الفكرة|العنوان") ||
          `الفكرة (${ideaIdx + 1})`;
        const ideaTitle = cleanBracketedField(rawTitle);
        const concept = extractLineField(ideaBlock, "مفهوم الفكرة|المفهوم_الرياضي|الشرح");
        const rule = extractLineField(ideaBlock, "القاعدة الرياضية|القانون_أو_القاعدة|صندوق_القاعدة");

        const exSplits = ideaBlock
          .split(/(?:^|\n)\s*(?:المثال\s*\d+[^\n]*|مثال\s*\(\d+\)[^\n]*)/i)
          .slice(1);
        const examplesList = exSplits.length > 0 ? exSplits : [ideaBlock];

        examplesList.forEach((exBody, exIdx) => {
          const problem =
            extractLineField(exBody, "نص المسألة|نص_المثال|المسألة|النص") ||
            exBody.split(/\n\s*خطوات/i)[0]?.trim() ||
            concept ||
            ideaTitle;
          const rawSteps = extractLineField(exBody, "خطوات الحل|خطوات_الحل|الحل");
          const rawFinal = extractLineField(exBody, "الناتج النهائي|الإجابة_النهائية");
          const steps = mergeLogicalSolutionSteps(rawSteps);
          if (rawFinal && !steps.some((s) => s.includes(rawFinal))) {
            steps.push(`الناتج النهائي: ${rawFinal}`);
          }

          const geoMatch = exBody.match(
            /\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]\n]+)\]/i
          );
          const geometryFigure = geoMatch?.[1]
            ? matchOptionalGeometryFigureFromArabicDescription(geoMatch[1], `s1_g_${ideaIdx}_${exIdx}`)
            : undefined;

          const basePrompt = problem
            .replace(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]\n]+\]/gi, "")
            .trim();
          const mcqChoicesAr = parseChoicesTupleFromBlock(basePrompt);
          const cleanPromptAr = mcqChoicesAr ? stripInlineChoicesFromPromptText(basePrompt) : basePrompt;
          const correctMcqIndex = resolveCorrectChoiceIndex(rawFinal || steps[steps.length - 1] || "", mcqChoicesAr);

          resultItems.push({
            id: `booklet-s1-${ideaIdx + 1}-${exIdx + 1}`,
            questionNumber: resultItems.length + 1,
            kind: mcqChoicesAr ? "mcq" : geometryFigure ? "essay_geometry" : "essay_algebra",
            branchBadgeAr: params.branchNameAr,
            marks: mcqChoicesAr ? 1 : 2,
            promptAr: cleanPromptAr,
            mcqChoicesAr,
            correctMcqIndex,
            modelAnswerAr: steps.join(" ⇐ ") || rawFinal || "راجع خطوات المثال",
            solutionStepsAr: steps.length > 0 ? steps : undefined,
            geometryFigure,
            ideaBannerTitleAr: exIdx === 0 ? `الفكرة (${ideaIdx + 1}): ${ideaTitle}` : undefined,
            conceptExplanationAr: exIdx === 0 ? concept || undefined : undefined,
            framedRuleAr: exIdx === 0 ? rule || undefined : undefined,
          });
        });
      });
    }

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

  const { byCode, byIndex } = parseStage3SolutionsMap(cleanS3);
  if (cleanS2) {
    const codeLines = Array.from(
      cleanS2.matchAll(/معرف\s*السؤال\s*:\s*((?:practice|homework|drill)-\d+-\d+)/gi)
    ).map((m) => m[1].toLowerCase());
    const s2CleanedForQ = cleanS2
      .replace(/^(?:الفكرة\s+[^\n]+|حاول بنفسك\s*:?|تمارين الواجب[^\n]*|نهاية الفكرة[^\n]*)$/gim, "")
      .trim();
    const s2Questions = parseNotebookLMExamQuestionsToIR({
      rawText: s2CleanedForQ || cleanS2,
      branchId: params.branchId,
      unitId: params.unitId,
      lessonId: params.lessonId,
      lessonTitleArabic: params.lessonTitleArabic,
    });

    s2Questions.forEach((q, idx) => {
      const qCode = codeLines[idx];
      const matchedSteps = (qCode ? byCode.get(qCode) : undefined) || byIndex.get(idx + 1);
      const baseItem = convertQuestionAssessmentIRToPrintableItem(q, params.branchNameAr);
      resultItems.push({
        ...baseItem,
        id: `booklet-s2-${idx + 1}`,
        questionNumber: resultItems.length + 1,
        modelAnswerAr: matchedSteps ? matchedSteps.join(" ⇐ ") : baseItem.modelAnswerAr,
        solutionStepsAr: matchedSteps || baseItem.solutionStepsAr,
        ideaBannerTitleAr:
          idx === 0 ? `✍️ ثانياً: تدريبات الدرس (حاول بنفسك) والواجب المنزلي (${s2Questions.length} مسألة)` : undefined,
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
