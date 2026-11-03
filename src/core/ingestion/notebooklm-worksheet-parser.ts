/**
 * @file notebooklm-worksheet-parser.ts
 * @description محلل حتمي ذكي لرد NotebookLM الخاص بورقة العمل:
 * يستخرج كبسولة الدرس (الفكرة العامة، القوانين الذكية، سر الحل)، الأمثلة المحلولة لكل فكرة،
 * ويرسم نماذج مساحة المستطيل الحسابية كـ Vector SVG نقي، وبنك أسئلة التدريب (اختر ومقالي).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 285 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import type { PrintableMathQuestionItem } from "../pdf-layout-engine/a4-vector-html-sheet-renderer";
import { cleanStudentFacingMathPromptSSOT } from "./notebooklm-citation-latex-sanitizer";
import { combineProblemAndTagGeometryContext } from "../geometry-engine/description-intake/problem-geometry-context-extractor";
import { matchGeometryWithDiagnostics } from "../geometry-engine/natural-arabic-geometry-matcher";
import { parseCartesianGraphDescription } from "../geometry-engine/graph-compositor/graph-fact-parser";
import { detectAndBuildAreaModelSvg } from "../geometry-engine/arithmetic-area-model/area-model-arithmetic-svg-builder";
import {
  mergeLogicalSolutionSteps,
  parseChoicesTupleFromBlock,
  resolveCorrectChoiceIndex,
  stripInlineChoicesFromPromptText,
} from "./notebooklm-exam-questions-parser";

export const MODULE_ID_NOTEBOOKLM_WORKSHEET_PARSER =
  "notebooklm_worksheet_parser" as const;

export interface ParseNotebookLMWorksheetParams {
  readonly rawText: string;
  readonly branchId: MathBranchId;
  readonly branchNameAr: string;
  readonly lessonTitleArabic: string;
  readonly includeAnswerLines?: boolean;
}

interface ParsedWorksheetCore {
  readonly lessonTitle?: string;
  readonly generalOverview?: string;
  readonly smartRulesCards?: string;
}

interface ParsedConceptExample {
  readonly conceptTitle: string;
  readonly examplePrompt: string;
  readonly diagramDesc?: string;
  readonly quickSolutionSteps: readonly string[];
}

interface ParsedWorksheetQuestion {
  readonly questionNumber: number;
  readonly kind: "mcq" | "essay";
  readonly marks: number;
  readonly promptText: string;
  readonly diagramDesc?: string;
  readonly choices?: readonly [string, string, string, string];
  readonly correctIndex?: 0 | 1 | 2 | 3;
  readonly rawSolution?: string;
  readonly steps: readonly string[];
}

function deriveCleanWorksheetTitle(scopeRaw: string, overview?: string): string {
  const clean = scopeRaw.replace(/\[باستثناء:[^\]]*\]/g, "").trim();
  if (/ضرب.*قسمة|قسمة.*ضرب/i.test(clean) || /ضرب.*قسمة|قسمة.*ضرب/i.test(overview || "")) {
    return "ضرب وقسمة الأعداد والكسور العشرية";
  }
  if (/تشابه/i.test(clean)) return "تشابه المضلعات";
  if (clean.length > 40 && clean.includes("الوحدة")) {
    const uNums = Array.from(clean.matchAll(/الوحدة\s+([0-9٠-٩]+)/g)).map((m) => m[1]);
    if (uNums.length > 1) {
      return `تطبيقات شاملة — الوحدات (${uNums.join("، ")})`;
    }
  }
  return clean.replace(/^ورقة\s*عمل\s*[:\-–]?\s*/i, "").trim();
}

function parseCoreBlock(raw: string): ParsedWorksheetCore {
  const coreMatch = raw.match(/===\s*\[(?:WORKSHEET_CORE|كبسولة_الدرس|لب_الدرس)\]\s*===([\s\S]*?)(?====\s*\[(?:CONCEPT_EXAMPLE|QUESTION|مثال|سؤال)|$)/i);
  if (!coreMatch) return {};

  const body = coreMatch[1];
  const lessonTitle = body.match(/اسم_الدرس\s*:\s*([^\n]+)/i)?.[1]?.trim();
  const overviewMatch = body.match(/الفكرة_العامة\s*:\s*([\s\S]*?)(?=القوانين_الذكية|===|$)/i);
  const generalOverview = overviewMatch?.[1]?.trim();

  const rulesMatch = body.match(/القوانين_الذكية\s*:?\s*([\s\S]*?)(?====|$)/i);
  const rulesLines = rulesMatch?.[1]?.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("-") || l.startsWith("•") || l.startsWith("*")) || [];

  const ruleCards: string[] = [];
  for (const line of rulesLines) {
    const cleanLine = line.replace(/^[-•*]\s*/, "");
    const lawName = cleanLine.match(/القانون\s*:\s*([^|]+)/i)?.[1]?.trim();
    const verbal = cleanLine.match(/المقولة_اللفظية\s*:\s*([^|]+)/i)?.[1]?.trim();
    const mathFormula = cleanLine.match(/الصيغة_الرياضية\s*:\s*([^|]+)/i)?.[1]?.trim();
    const tip = cleanLine.match(/سر_الحل\s*:\s*(.+)$/i)?.[1]?.trim();

    const parts: string[] = [];
    if (lawName) parts.push(`📌 ${lawName}: ${verbal || ""}`.trim());
    else if (verbal) parts.push(`📌 قاعدة: ${verbal}`);
    if (mathFormula) parts.push(mathFormula);
    if (tip) parts.push(`⚡ سر الحل: ${tip}`);
    if (parts.length > 0) ruleCards.push(parts.join("\n"));
  }

  return {
    lessonTitle,
    generalOverview,
    smartRulesCards: ruleCards.length > 0 ? ruleCards.join("\n\n---\n\n") : undefined,
  };
}

function parseConceptExamples(raw: string): ParsedConceptExample[] {
  const results: ParsedConceptExample[] = [];
  const splits = raw.split(/===\s*\[(?:CONCEPT_EXAMPLE|مثال_الفكرة|مثال_محلول)\s*:\s*(\d+)\]\s*(?:\|\s*عنوان_الفكرة\s*:\s*([^=]+))?===/i);

  for (let i = 1; i < splits.length; i += 3) {
    const conceptTitle = (splits[i + 1] || `الفكرة ${splits[i]}`).trim();
    const chunk = splits[i + 2] || "";
    const nextBoundary = chunk.search(/===\s*\[/);
    const body = nextBoundary !== -1 ? chunk.slice(0, nextBoundary) : chunk;

    const exMatch = body.match(/المثال\s*:\s*([\s\S]*?)(?=(?:\|?\s*الرسم|\|?\s*الحل_السريع|===|$))/i);
    const prompt = (exMatch?.[1] || body).trim();
    const diagMatch = body.match(/الرسم\s*:\s*(\[رسم هندسي:[^\]]+\])/i);
    const solMatch = body.match(/الحل_السريع\s*:\s*([\s\S]*?)$/i);
    const rawSteps = solMatch?.[1]?.trim() || "";
    const steps = mergeLogicalSolutionSteps(rawSteps);

    if (prompt) {
      results.push({
        conceptTitle,
        examplePrompt: cleanStudentFacingMathPromptSSOT(prompt),
        diagramDesc: diagMatch?.[1],
        quickSolutionSteps: steps,
      });
    }
  }

  return results;
}

function parseQuestionsBlocks(raw: string): ParsedWorksheetQuestion[] {
  const results: ParsedWorksheetQuestion[] = [];
  const splits = raw.split(/===\s*\[(?:QUESTION|سؤال)\s*:\s*(\d+)\]\s*(?:\|\s*النوع\s*:\s*(MCQ|ESSAY|[^\n|]+))?(?:\s*\|\s*الدرجة\s*:\s*(\d+))?[^=]*===/i);

  let seq = 1;
  for (let i = 1; i < splits.length; i += 4) {
    const qNum = parseInt(splits[i], 10) || seq++;
    const typeRaw = (splits[i + 1] || "mcq").trim().toUpperCase();
    const isMcq = typeRaw.includes("MCQ") || typeRaw.includes("اختر");
    const marks = parseInt(splits[i + 2] || "2", 10) || 2;
    const chunk = splits[i + 3] || "";
    const nextBoundary = chunk.search(/===\s*\[/);
    const body = nextBoundary !== -1 ? chunk.slice(0, nextBoundary) : chunk;

    const promptMatch = body.match(/النص\s*:\s*([\s\S]*?)(?=(?:الرسم|البدائل|الإجابة_الصحيحة|البرهان|===|$))/i);
    let promptText = (promptMatch?.[1] || body).trim();
    const diagMatch = body.match(/الرسم\s*:\s*(\[رسم هندسي:[^\]]+\])/i);
    const choices = isMcq ? parseChoicesTupleFromBlock(body) : undefined;
    promptText = stripInlineChoicesFromPromptText(promptText);

    const ansMatch = body.match(/الإجابة_الصحيحة\s*:\s*([^\n|]+)/i);
    const rawCorrect = ansMatch?.[1]?.trim() || "";
    const correctIndex = isMcq && choices ? resolveCorrectChoiceIndex(rawCorrect, choices) : undefined;

    const stepsMatch = body.match(/(?:البرهان_والخطوات|خطوات الحل)\s*:\s*([\s\S]*?)$/i);
    const rawSteps = stepsMatch?.[1]?.trim() || rawCorrect;
    const steps = mergeLogicalSolutionSteps(rawSteps);

    results.push({
      questionNumber: qNum,
      kind: isMcq ? "mcq" : "essay",
      marks,
      promptText: cleanStudentFacingMathPromptSSOT(promptText),
      diagramDesc: diagMatch?.[1],
      choices,
      correctIndex,
      rawSolution: rawCorrect,
      steps,
    });
  }

  return results;
}

export function parseNotebookLMWorksheetResponse(
  params: ParseNotebookLMWorksheetParams
): readonly PrintableMathQuestionItem[] {
  const { rawText, branchId, branchNameAr, lessonTitleArabic, includeAnswerLines } = params;
  if (!rawText || !rawText.trim()) return [];

  const core = parseCoreBlock(rawText);
  const conceptExamples = parseConceptExamples(rawText);
  const questions = parseQuestionsBlocks(rawText);

  const output: PrintableMathQuestionItem[] = [];

  // ١. تجهيز كبسولة الفكرة العامة والقوانين الذكية (إذا وجدت)
  const cleanTitle = deriveCleanWorksheetTitle(core.lessonTitle || lessonTitleArabic, core.generalOverview);
  const explanationText = core.generalOverview ? core.generalOverview : undefined;
  const framedRuleText = core.smartRulesCards || undefined;

  // ٢. تحويل الأمثلة المحلولة لكل فكرة
  conceptExamples.forEach((ex, idx) => {
    const isFirst = idx === 0;
    const fullPrompt = `${ex.examplePrompt} ${ex.diagramDesc || ""}`;

    // فحص نموذج مساحة المستطيل أولاً لتفادي الأشكال الإقليدية الخاطئة
    const areaModelSvg = detectAndBuildAreaModelSvg(fullPrompt);

    let geoMatch;
    let graphSpec;
    if (!areaModelSvg) {
      const diagCombined = ex.diagramDesc
        ? combineProblemAndTagGeometryContext(ex.examplePrompt, ex.diagramDesc)
        : undefined;
      geoMatch = diagCombined ? matchGeometryWithDiagnostics(diagCombined, branchId) : undefined;
      graphSpec = ex.diagramDesc ? parseCartesianGraphDescription(ex.diagramDesc) : undefined;
    }

    output.push({
      id: `ws-concept-${idx + 1}`,
      questionNumber: idx + 1,
      kind: "essay_algebra",
      branchBadgeAr: branchNameAr,
      marks: 0,
      promptAr: ex.examplePrompt,
      modelAnswerAr: ex.quickSolutionSteps.join(" ⇐ "),
      solutionStepsAr: ex.quickSolutionSteps,
      citationBadgeAr: `💡 مثال محلول: ${ex.conceptTitle}`,
      isWorkedExample: true,
      rawSvgMarkup: areaModelSvg ?? undefined,
      geometryFigure: geoMatch?.figure,
      graphSpec: graphSpec ?? undefined,
      ideaBannerTitleAr: isFirst ? cleanTitle : undefined,
      conceptExplanationAr: isFirst ? explanationText : undefined,
      framedRuleAr: isFirst ? framedRuleText : undefined,
    });
  });

  // ٣. تحويل بنك تدريبات ورقة العمل (اختر ومقالي)
  questions.forEach((q, idx) => {
    const isFirstQuestion = conceptExamples.length === 0 && idx === 0;
    const fullPrompt = `${q.promptText} ${q.diagramDesc || ""}`;

    // فحص نموذج مساحة المستطيل
    const areaModelSvg = detectAndBuildAreaModelSvg(fullPrompt);

    let geoMatch;
    let graphSpec;
    if (!areaModelSvg) {
      const diagCombined = q.diagramDesc
        ? combineProblemAndTagGeometryContext(q.promptText, q.diagramDesc)
        : undefined;
      geoMatch = diagCombined ? matchGeometryWithDiagnostics(diagCombined, branchId) : undefined;
      graphSpec = q.diagramDesc ? parseCartesianGraphDescription(q.diagramDesc) : undefined;
    }

    const isEssay = q.kind === "essay";

    output.push({
      id: `ws-q-${q.questionNumber || idx + 1}`,
      questionNumber: q.questionNumber || idx + 1,
      kind: q.kind === "mcq" ? "mcq" : "essay_algebra",
      branchBadgeAr: branchNameAr,
      marks: q.marks,
      promptAr: q.promptText,
      mcqChoicesAr: q.choices,
      correctMcqIndex: q.correctIndex,
      modelAnswerAr: q.rawSolution || q.steps.join(" ⇐ "),
      solutionStepsAr: q.steps,
      studentDrillPromptAr: isEssay && includeAnswerLines ? "مساحة إجابة الطالب:" : undefined,
      rawSvgMarkup: areaModelSvg ?? undefined,
      geometryFigure: geoMatch?.figure,
      graphSpec: graphSpec ?? undefined,
      ideaBannerTitleAr: isFirstQuestion ? cleanTitle : undefined,
      conceptExplanationAr: isFirstQuestion ? explanationText : undefined,
      framedRuleAr: isFirstQuestion ? framedRuleText : undefined,
    });
  });

  return output;
}
