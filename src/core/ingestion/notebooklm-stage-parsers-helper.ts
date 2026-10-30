/**
 * @file notebooklm-stage-parsers-helper.ts
 * @description محلل وناسج مراحل المذكرة الدراسية بتفنيط حتمي دقيق وفق الهيكل البيداغوجي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 195 سطراً).
 */

import { matchGeometryWithDiagnostics } from "../geometry-engine/natural-arabic-geometry-matcher";
import { parseCartesianGraphDescription } from "../geometry-engine/graph-compositor/graph-fact-parser";
import type { PrintableMathQuestionItem } from "../pdf-layout-engine/a4-vector-html-sheet-renderer";
import { cleanStudentFacingMathPromptSSOT } from "./notebooklm-citation-latex-sanitizer";
import {
  mergeLogicalSolutionSteps,
  parseChoicesTupleFromBlock,
  resolveCorrectChoiceIndex,
  stripInlineChoicesFromPromptText,
} from "./notebooklm-exam-questions-parser";

export const MODULE_ID_NOTEBOOKLM_STAGE_PARSERS_HELPER = "notebooklm_stage_parsers_helper" as const;

export const IDEA_HEADER_SPLIT_REGEX =
  /(?=(?:^|\n)\s*(?:###?\s*)?الفكرة\s+(?:الأولى|الاولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية\s*عشر[ةه]|الثانية\s*عشر[ةه]|الثالثة\s*عشر[ةه]|الرابعة\s*عشر[ةه]|الخامسة\s*عشر[ةه]|السادسة\s*عشر[ةه]|السابعة\s*عشر[ةه]|الثامنة\s*عشر[ةه]|التاسعة\s*عشر[ةه]|العشرون|[0-9٠-٩]+))/i;

function cleanBracketedField(val: string): string {
  return val.replace(/\s*---+\s*$/g, "").replace(/^[\s\[*#]+|[\s\]*#]+$/g, "").trim();
}

export function extractConceptAndRule(block: string): { concept: string; rule: string; examplesPart: string } {
  let splitIdx = block.search(/(?=(?:^|\n|\s{2,}|\.\s+)(?:###?\s*)?(?:المثال\s*(?:[0-9٠-٩]+|[أ-ي]+)?|مثال\s*(?:[0-9٠-٩]+|[أ-ي]+|\([0-9٠-٩]+\))?|المثال\s*\||معرف\s*المثال|نص\s*(?:المسألة|المثال))(?:\s*[:|]|\s+[0-9٠-٩]|\s*$))/i);
  if (splitIdx === -1) {
    const fallbackMatch = block.match(/(?:^|\n|\s+)(?:###?\s*)?(?:المثال\s*[0-9٠-٩]+|المثال\s*\||معرف\s*المثال|نص\s*المسألة)/i);
    if (fallbackMatch?.index !== undefined) splitIdx = fallbackMatch.index;
  }
  const headerPart = splitIdx !== -1 ? block.slice(0, splitIdx) : block;
  const examplesPart = splitIdx !== -1 ? block.slice(splitIdx) : "";
  const conceptMatch = headerPart.match(
    /(?:مفهوم\s*الفكرة|المفهوم_الرياضي|المفهوم\s*الرياضي|الشرح)\s*:\s*([\s\S]*?)(?=(?:\n|\s{2,}|\.\s+)(?:القاعدة|القانون|صندوق|$))/i
  );
  const ruleMatch = headerPart.match(
    /(?:القاعدة\s*والقانون(?:\s*المعتمد)?|القاعدة\s*الرياضية|القاعدة|القانون_أو_القاعدة|القانون\s*أو\s*القاعدة|صندوق_القاعدة|القانون)\s*:\s*([\s\S]*?)(?=(?:\n|\s+)(?:المثال|مثال|معرف\s*المثال|نص\s*المسألة)|$)/i
  );
  return { concept: cleanBracketedField(conceptMatch?.[1] ?? ""), rule: cleanBracketedField(ruleMatch?.[1] ?? ""), examplesPart };
}

export function parseStage3SolutionsMap(stage3Cleaned: string): {
  readonly byCode: Map<string, readonly string[]>;
  readonly byIndex: Map<number, readonly string[]>;
} {
  const byCode = new Map<string, readonly string[]>();
  const byIndex = new Map<number, readonly string[]>();
  if (!stage3Cleaned) return { byCode, byIndex };

  const codeSplits = stage3Cleaned.split(/معرف\s*السؤال\s*:\s*((?:practice|homework|drill|try|hw|m|w|q|s)-\d+-\d+)/i);
  for (let i = 1; i < codeSplits.length; i += 2) {
    const rawBody = (codeSplits[i + 1] || "").split(/نموذج إجابة|معرف الفكرة/i)[0] || "";
    const steps = mergeLogicalSolutionSteps(rawBody.replace(/^\s*(?:خطوات الحل|الناتج النهائي المعتمد|سلم التصحيح)\s*:\s*/gim, "")).filter((l) => !/^درج/i.test(l));
    if (steps.length > 0) byCode.set(codeSplits[i].trim().toLowerCase(), steps);
  }

  const numSplits = stage3Cleaned.split(/(?:===\s*\[(?:SOLUTION|حل|QUESTION)\s*:\s*(\d+)\][^\n]*===|حل\s+السؤال\s*\[?(\d+)\]?\s*:)/i);
  let seq = 1;
  for (let i = 1; i < numSplits.length; i += 3) {
    const qNum = Number(numSplits[i] || numSplits[i + 1]) || seq++;
    const steps = mergeLogicalSolutionSteps((numSplits[i + 2] || "").replace(/^\s*(?:خطوات[_\s]الحل|الإجابة[_\s]الصحيحة|الناتج[_\s]النهائي)\s*:\s*/gim, ""));
    if (steps.length > 0) byIndex.set(qNum, steps);
  }
  return { byCode, byIndex };
}

export interface ExtractedQuestionBlock {
  readonly rawText: string;
  readonly promptText: string;
  readonly qCode?: string;
  readonly kindTag?: string;
}

const QUESTION_PREFIX_RE =
  /^(?:[-•*]\s*)?(?:\*\*)?(?:(?:ال)?سؤال(?:\s+الواجب)?\s*\(?[0-9٠-٩]*\)?|(?:ال)?تمرين\s*\(?[0-9٠-٩]*\)?|(?:ال)?مسألة\s*\(?[0-9٠-٩]*\)?|#\d+|\[\d+\])\s*(?:\|\s*نوع\s*المسألة\s*:\s*[^\n|]+)?\s*(?:\|\s*معرف\s*السؤال\s*:\s*[^\n|]+)?(?:\*\*)?[:\s]*/i;

export function parseStage2ByIdeas(s2Raw: string): {
  readonly drillsByIdea: Map<string, ExtractedQuestionBlock[]>;
  readonly allHomework: ExtractedQuestionBlock[];
} {
  const drillsByIdea = new Map<string, ExtractedQuestionBlock[]>();
  const allHomework: ExtractedQuestionBlock[] = [];
  if (!s2Raw) return { drillsByIdea, allHomework };

  const firstIdeaIdx = s2Raw.search(IDEA_HEADER_SPLIT_REGEX);
  const ideaBlocks = (firstIdeaIdx !== -1 ? s2Raw.slice(firstIdeaIdx) : s2Raw).split(IDEA_HEADER_SPLIT_REGEX).filter((b) => b.length > 20);

  ideaBlocks.forEach((block, idx) => {
    const key = block.match(/معرف\s*الفكرة\s*:\s*(idea-\d+)/i)?.[1]?.toLowerCase() || `idea-${idx + 1}`;
    const ideaKind = block.match(/نوع\s*المسألة\s*:\s*\[?([^\]|\n]+)\]?/i)?.[1]?.trim();

    const tryMatch = block.match(/(?:أولاً\s*:\s*)?(?:تمارين\s*)?\(?حاول\s*بنفسك\)?([\s\S]*?)(?=(?:^|\n)\s*(?:####?\s*)?(?:[-•*]\s*)?(?:\*\*)?(?:ثانياً\s*:\s*)?(?:تمارين\s*)?(?:الواجب\s*المنزلي|واجبات\s*منزلية|سؤال\s+الواجب)|نهاية\s*الفكرة|###\s*الفكرة|$)/i);
    const hwSecMatch = block.match(/(?:^|\n)\s*(?:####?\s*)?(?:ثانياً\s*:\s*)?(?:تمارين\s*)?(?:الواجب\s*المنزلي|واجبات\s*منزلية)\s*:?\s*\n([\s\S]*?)(?=نهاية\s*الفكرة|###\s*الفكرة|$)/i);
    const hwInlineMatch = !hwSecMatch ? block.match(/((?:^|\n)\s*(?:[-•*]\s*)?(?:\*\*)?سؤال\s+الواجب[\s\S]*?)(?=نهاية\s*الفكرة|###\s*الفكرة|$)/i) : null;
    const hwBody = hwSecMatch?.[1] ?? hwInlineMatch?.[1] ?? "";

    const parseSplits = (body: string, codeRe: RegExp): ExtractedQuestionBlock[] =>
      body
        .split(/(?:^|\n)\s*(?:[-•*]\s*)?(?=(?:\*\*)?(?:(?:ال)?سؤال(?:\s+الواجب|\s*\(?[0-9٠-٩]+\)?|\s*\|)|(?:ال)?تمرين\s*\(?[0-9٠-٩]+\)?|(?:ال)?مسألة\s*\(?[0-9٠-٩]+\)?|#\d+|\[\d+\]))/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 10)
        .map((s) => ({
          rawText: s,
          promptText: cleanStudentFacingMathPromptSSOT(s.replace(QUESTION_PREFIX_RE, "").trim()),
          qCode: s.match(codeRe)?.[1]?.toLowerCase(),
          kindTag: ideaKind,
        }));

    const drills = tryMatch?.[1] ? parseSplits(tryMatch[1], /معرف\s*السؤال\s*:\s*((?:try|practice|drill|m|q|s)-\d+-\d+)/i) : [];
    if (hwBody) allHomework.push(...parseSplits(hwBody, /معرف\s*السؤال\s*:\s*((?:hw|homework|w)-\d+-\d+)/i));
    drillsByIdea.set(key, drills);
    drillsByIdea.set(`idx-${idx + 1}`, drills);
  });

  return { drillsByIdea, allHomework };
}

export function parseSolvedExamplesFromSection(
  examplesSection: string,
  ideaTitle: string,
  concept: string
): Array<{
  promptAr: string;
  steps: string[];
  rawFinal: string;
  geometryRaw?: string;
  mcqChoicesAr?: readonly [string, string, string, string];
}> {
  const cleanSection = examplesSection.split(/(?:^|\n)\s*نهاية\s*الفكرة/i)[0] || "";
  const exSplits = cleanSection
    .split(/(?=(?:^|\n|\s{2,}|\.\s+)(?:###?\s*)?(?:المثال\s*(?:الأول|الثاني|الثالث|الرابع|الخامس|[0-9٠-٩]+)?|مثال\s*(?:[0-9٠-٩]+|[أ-ي]+|\([0-9٠-٩]+\))|المثال\s*\||معرف\s*المثال|المثال-[0-9٠-٩]+-[0-9٠-٩]+)(?:\s*[:|]|\s+[0-9٠-٩]|\s*\||\s*$))/i)
    .filter((b) => /(?:المثال|مثال|نص\s*المسألة|خطوات\s*الحل)/i.test(b));

  return (exSplits.length > 0 ? exSplits : [cleanSection]).map((exBody) => {
    const promptMatch = exBody.match(/(?:نص\s*المسألة|نص\s*المثال|المسألة)\s*:\s*([\s\S]*?)(?=(?:\n|\s+)(?:خطوات\s*الحل|خطوات_الحل|الحل\s*:|الخطوة\s*[0-9٠-٩:]|الناتج\s*النهائي|المثال|$))/i);
    const rawProblem = promptMatch?.[1] ||
      exBody.split(/(?=(?:\n|\s+)(?:خطوات\s*الحل|خطوات_الحل|الحل\s*:|الخطوة\s*[0-9٠-٩:]))/i)[0]?.trim() || concept || ideaTitle;
    const baseProblem = rawProblem
      .replace(/^(?:###\s*)?(?:المثال\s*\S+|مثال\s*\S+)\s*/i, "")
      .replace(/^(?:\|\s*)?معرف\s*المثال\s*:\s*\S+\s*/i, "")
      .replace(/^(?:نص\s*المسألة|نص\s*المثال|المسألة)\s*:\s*/i, "")
      .split(/(?=(?:المثال|مثال|معرف\s*المثال))/i)[0].trim();
    const cleanProblem = cleanStudentFacingMathPromptSSOT(baseProblem);
    const mcqChoices = parseChoicesTupleFromBlock(cleanProblem);
    const finalPrompt = mcqChoices ? stripInlineChoicesFromPromptText(cleanProblem) : cleanProblem;

    const stepsMatch = exBody.match(/(?:خطوات\s*الحل|خطوات_الحل|الحل)\s*:\s*([\s\S]*?)(?=(?:\n|\s+)(?:الناتج\s*النهائي|الإجابة\s*النهائية|نهاية\s*الفكرة|نهاية\s*المثال|المثال|الفكرة|$))/i);
    const rawFinal = exBody.match(/(?:الناتج\s*النهائي|الإجابة\s*النهائية)\s*:\s*([^\r\n]+)/i)?.[1]?.trim() || "";
    const steps = mergeLogicalSolutionSteps(stepsMatch?.[1] || "").filter(
      (l) => !/^(?:معرف\s*المثال|معرف\s*الفكرة|نص\s*المسألة|نوع\s*المسألة|المثال\s*\d+|مثال\s*\d+|الفكرة\s*\S+)/i.test(l) &&
        !/example-\d+-\d+/i.test(l) && !/(?:مفهوم\s*الفكرة|القاعدة\s*الرياضية|حاول\s*بنفسك|الواجب\s*المنزلي)/i.test(l)
    );
    if (rawFinal && !steps.some((s) => s.includes(rawFinal))) steps.push(`الناتج النهائي: ${rawFinal}`);
    const geoMatch = exBody.match(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]\n]+)\]/i);
    return { promptAr: finalPrompt || ideaTitle, steps, rawFinal, geometryRaw: geoMatch?.[1], mcqChoicesAr: mcqChoices };
  });
}

export function buildStage2PrintableItem(params: {
  readonly id: string;
  readonly questionNumber: number;
  readonly block: ExtractedQuestionBlock;
  readonly branchNameAr: string;
  readonly defaultPrompt: string;
  readonly defaultAnswer: string;
  readonly bannerTitleAr?: string;
  readonly solutionsMap: { readonly byCode: Map<string, readonly string[]>; readonly byIndex: Map<number, readonly string[]> };
}): PrintableMathQuestionItem {
  const mcqChoices = parseChoicesTupleFromBlock(params.block.promptText);
  const rawPrompt = mcqChoices ? stripInlineChoicesFromPromptText(params.block.promptText) : params.block.promptText;
  const isMcq = (params.block.rawText || "").includes("اختر") || (params.block.kindTag || "").includes("اختر") || mcqChoices !== undefined;
  const matchedSteps = (params.block.qCode ? params.solutionsMap.byCode.get(params.block.qCode) : undefined) || params.solutionsMap.byIndex.get(params.questionNumber);
  const graphMatch = params.block.rawText.match(/\[?\s*رسم\s*بياني\s*:\s*([^\]\n]+)\]/i);
  const graphSpec = graphMatch?.[1] ? parseCartesianGraphDescription(graphMatch[1]) ?? undefined : undefined;
  const geoMatch = !graphMatch ? params.block.rawText.match(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]\n]+)\]/i) : null;
  const geoDiag = geoMatch?.[1] ? matchGeometryWithDiagnostics(geoMatch[1], `${params.id}_geo`) : undefined;
  const geometryFigure = geoDiag?.figure;
  const figureDiagnosticsAr = geoDiag && (!geoDiag.figure || geoDiag.warnings.length > 0) ? geoDiag.warnings : undefined;

  return {
    id: params.id,
    questionNumber: params.questionNumber,
    kind: isMcq ? "mcq" : geometryFigure || graphSpec ? "essay_geometry" : "essay_algebra",
    branchBadgeAr: params.branchNameAr,
    marks: isMcq ? 1 : 2,
    promptAr: cleanStudentFacingMathPromptSSOT(rawPrompt) || params.defaultPrompt,
    mcqChoicesAr: mcqChoices,
    correctMcqIndex: resolveCorrectChoiceIndex(matchedSteps?.[matchedSteps.length - 1] || "", mcqChoices),
    modelAnswerAr: matchedSteps ? matchedSteps.join(" ⇐ ") : params.defaultAnswer,
    solutionStepsAr: matchedSteps,
    geometryFigure,
    graphSpec,
    figureDiagnosticsAr,
    ideaBannerTitleAr: params.bannerTitleAr,
  };
}
