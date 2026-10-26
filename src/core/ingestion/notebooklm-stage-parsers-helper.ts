/**
 * @file notebooklm-stage-parsers-helper.ts
 * @description محلل وناسج مراحل المذكرة الدراسية بتفنيط حتمي دقيق وفق الهيكل البيداغوجي:
 * - يعزل المفهوم والقاعدة حصراً دون ابتلاع الأمثلة اللاحقة.
 * - يربط كل فكرة بأمثلتها المحلولة وتدريبات "حاول بنفسك" الخاصة بها مباشرة.
 * - يجمع تمارين "الواجب المنزلي" في قسم مستقل بنهاية الدرس.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 245 سطراً).
 */

import { matchOptionalGeometryFigureFromArabicDescription } from "../geometry-engine/natural-arabic-geometry-matcher";
import type { PrintableMathQuestionItem } from "../pdf-layout-engine/a4-vector-html-sheet-renderer";
import {
  mergeLogicalSolutionSteps,
  parseChoicesTupleFromBlock,
  resolveCorrectChoiceIndex,
  stripInlineChoicesFromPromptText,
} from "./notebooklm-exam-questions-parser";

export const MODULE_ID_NOTEBOOKLM_STAGE_PARSERS_HELPER =
  "notebooklm_stage_parsers_helper" as const;

export function cleanBracketedField(val: string): string {
  return val.replace(/\s*---+\s*$/g, "").replace(/^[\s\[*#]+|[\s\]*#]+$/g, "").trim();
}

export function extractConceptAndRule(block: string): { concept: string; rule: string } {
  const conceptMatch = block.match(
    /(?:مفهوم\s*الفكرة|المفهوم_الرياضي|المفهوم\s*الرياضي|الشرح)\s*:\s*([\s\S]*?)(?=\n\s*(?:القاعدة|القانون|المثال|مثال|نص|أولاً|ثانياً|حاول|تمارين|نهاية|الفكرة|$))/i
  );
  const ruleMatch = block.match(
    /(?:القاعدة\s*الرياضية|القانون_أو_القاعدة|القانون\s*أو\s*القاعدة|صندوق_القاعدة|القانون)\s*:\s*([\s\S]*?)(?=\n\s*(?:المثال|مثال|نص|أولاً|ثانياً|حاول|تمارين|نهاية|الفكرة|$))/i
  );
  return {
    concept: cleanBracketedField(conceptMatch?.[1] ?? ""),
    rule: cleanBracketedField(ruleMatch?.[1] ?? ""),
  };
}

export function parseStage3SolutionsMap(stage3Cleaned: string): {
  readonly byCode: Map<string, readonly string[]>;
  readonly byIndex: Map<number, readonly string[]>;
} {
  const byCode = new Map<string, readonly string[]>();
  const byIndex = new Map<number, readonly string[]>();
  if (!stage3Cleaned) return { byCode, byIndex };

  const codeSplits = stage3Cleaned.split(/معرف\s*السؤال\s*:\s*((?:practice|homework|drill|try|hw)-\d+-\d+)/i);
  for (let i = 1; i < codeSplits.length; i += 2) {
    const code = codeSplits[i].trim().toLowerCase();
    const rawBody = (codeSplits[i + 1] || "").split(/نموذج إجابة|معرف الفكرة/i)[0] || "";
    const steps = mergeLogicalSolutionSteps(
      rawBody.replace(/^\s*(?:خطوات الحل|الناتج النهائي المعتمد|سلم التصحيح)\s*:\s*/gim, "")
    ).filter((l) => !/^درج/i.test(l));
    if (steps.length > 0) byCode.set(code, steps);
  }

  const numSplits = stage3Cleaned.split(/(?:===\s*\[(?:SOLUTION|حل|QUESTION)\s*:\s*(\d+)\][^\n]*===|حل\s+السؤال\s*\[?(\d+)\]?\s*:)/i);
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

export interface ExtractedQuestionBlock {
  readonly rawText: string;
  readonly promptText: string;
  readonly qCode?: string;
  readonly kindTag?: string;
}

export function parseStage2ByIdeas(s2Raw: string): {
  readonly drillsByIdea: Map<string, ExtractedQuestionBlock[]>;
  readonly allHomework: ExtractedQuestionBlock[];
} {
  const drillsByIdea = new Map<string, ExtractedQuestionBlock[]>();
  const allHomework: ExtractedQuestionBlock[] = [];
  if (!s2Raw) return { drillsByIdea, allHomework };

  const ideaBlocks = s2Raw
    .replace(/^[\s\S]*?(?=(?:###?\s*)?الفكرة\s+(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|[0-9٠-٩]+))/i, "")
    .split(/(?=(?:^|\n)\s*(?:###?\s*)?الفكرة\s+(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية|الثانية|[0-9٠-٩]+))/i)
    .filter((b) => b.length > 20);

  ideaBlocks.forEach((block, idx) => {
    const codeMatch = block.match(/معرف\s*الفكرة\s*:\s*(idea-\d+)/i);
    const key = codeMatch ? codeMatch[1].toLowerCase() : `idea-${idx + 1}`;

    const tryMatch = block.match(/(?:أولاً\s*:\s*)?تمارين\s*حاول\s*بنفسك([\s\S]*?)(?=(?:ثانياً\s*:\s*)?تمارين\s*الواجب|نهاية\s*الفكرة|###|$)/i);
    const tryBody = tryMatch ? tryMatch[1] : "";

    const hwMatch = block.match(/(?:ثانياً\s*:\s*)?تمارين\s*الواجب\s*المنزلي([\s\S]*?)(?=نهاية\s*الفكرة|###|$)/i);
    const hwBody = hwMatch ? hwMatch[1] : "";

    const drills: ExtractedQuestionBlock[] = [];
    if (tryBody) {
      const splits = tryBody
        .split(/(?:^|\n)\s*(?:[-•*]\s*)?(?=(?:\*\*)?(?:سؤال\s*\(?\d+\)?|تمرين\s*\(?\d+\)?|\[\d+\]))/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 10);

      splits.forEach((s) => {
        const qCode = s.match(/معرف\s*السؤال\s*:\s*((?:try|practice|drill)-\d+-\d+)/i)?.[1]?.toLowerCase();
        const cleanPrompt = s
          .replace(/^(?:[-•*]\s*)?(?:\*\*)?(?:سؤال\s*\(?\d+\)?|تمرين\s*\(?\d+\)?|\[\d+\])\s*(?:\|\s*معرف\s*السؤال\s*:\s*[\w-]+)?(?:\*\*)?\s*/i, "")
          .replace(/\|\s*معرف\s*السؤال\s*:\s*[\w-]+/gi, "")
          .replace(/(?:💡\s*)?(?:خطوة\s+تالية\s+اقتراحية|اقتراح\s+الخطوة\s+التالية|خطوة\s+اقتراحية)[\s\S]*$/gi, "")
          .trim();
        drills.push({ rawText: s, promptText: cleanPrompt, qCode });
      });
    }

    if (hwBody) {
      const splits = hwBody
        .split(/(?:^|\n)\s*(?:[-•*]\s*)?(?=(?:\*\*)?(?:سؤال\s*\(?\d+\)?|مسألة\s*\(?\d+\)?|#\d+|\[\d+\]))/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 10);

      splits.forEach((s) => {
        const qCode = s.match(/معرف\s*السؤال\s*:\s*((?:hw|homework)-\d+-\d+)/i)?.[1]?.toLowerCase();
        const cleanPrompt = s
          .replace(/^(?:[-•*]\s*)?(?:\*\*)?(?:سؤال\s*\(?\d+\)?|مسألة\s*\(?\d+\)?|#\d+|\[\d+\])\s*(?:\|\s*معرف\s*السؤال\s*:\s*[\w-]+)?(?:\*\*)?\s*/i, "")
          .replace(/\|\s*معرف\s*السؤال\s*:\s*[\w-]+/gi, "")
          .replace(/(?:💡\s*)?(?:خطوة\s+تالية\s+اقتراحية|اقتراح\s+الخطوة\s+التالية|خطوة\s+اقتراحية)[\s\S]*$/gi, "")
          .trim();
        allHomework.push({ rawText: s, promptText: cleanPrompt, qCode });
      });
    }

    drillsByIdea.set(key, drills);
    drillsByIdea.set(`idx-${idx + 1}`, drills);
  });

  return { drillsByIdea, allHomework };
}

export function parseSolvedExamplesFromSection(
  examplesSection: string,
  ideaTitle: string,
  concept: string
): Array<{ promptAr: string; steps: string[]; rawFinal: string; geometryRaw?: string }> {
  // عزل قسم الأمثلة وبتر أي نص يخص الفكرة التالية أو نهايتها
  const cleanSection = examplesSection.split(
    /(?:^|\n)\s*(?:نهاية\s*الفكرة|(?:###?\s*)?الفكرة\s+(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية|الثانية|[0-9٠-٩]+))/i
  )[0] || "";

  const exSplits = cleanSection
    .split(/(?:^|\n)\s*(?=(?:###\s*)?(?:المثال\s*(?:الأول|الثاني|الثالث|الرابع|الخامس|[0-9٠-٩]+)|مثال\s*\([0-9٠-٩]+\)|مثال\s*[0-9٠-٩]+|معرف\s*المثال\s*:\s*example-[0-9a-zA-Z_-]+|المثال-[0-9٠-٩]+-[0-9٠-٩]+))/i)
    .filter((b) => /(?:المثال|مثال|نص\s*المسألة|خطوات\s*الحل)/i.test(b));

  const list = exSplits.length > 0 ? exSplits : [cleanSection];
  const results: Array<{ promptAr: string; steps: string[]; rawFinal: string; geometryRaw?: string }> = [];

  list.forEach((exBody) => {
    const promptMatch = exBody.match(/(?:نص\s*المسألة|نص\s*المثال|المسألة)\s*:\s*([\s\S]*?)(?=\n\s*(?:خطوات\s*الحل|الحل|الخطوة|الناتج\s*النهائي|$))/i);
    const rawProblem = promptMatch?.[1] || exBody.split(/\n\s*(?:خطوات\s*الحل|الحل|الخطوة)\s*:/i)[0]?.trim() || concept || ideaTitle;
    const cleanProblem = rawProblem
      .replace(/^(?:###\s*)?(?:المثال\s*\S+|مثال\s*\S+)\s*/i, "")
      .replace(/\|\s*معرف\s*المثال\s*:\s*[\w-]+/gi, "")
      .replace(/\|\s*نوع\s*المسألة\s*:\s*\[?[^|\n\]]+\]?/gi, "")
      .replace(/^(?:نص\s*المسألة|نص\s*المثال|المسألة)\s*:\s*/i, "")
      .replace(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]\n]+\]/gi, "")
      .trim();

    const stepsMatch = exBody.match(
      /(?:خطوات\s*الحل|خطوات_الحل|الحل)\s*:\s*([\s\S]*?)(?=\n\s*(?:الناتج\s*النهائي|الإجابة\s*النهائية|نهاية\s*الفكرة|نهاية\s*المثال|المثال|الفكرة|$))/i
    );
    const rawFinal = exBody.match(/(?:الناتج\s*النهائي|الإجابة\s*النهائية)\s*:\s*([^\n]+)/i)?.[1]?.trim() || "";
    const steps = mergeLogicalSolutionSteps(stepsMatch?.[1] || "").filter(
      (line) =>
        !/^(?:معرف\s*المثال|معرف\s*الفكرة|نص\s*المسألة|نوع\s*المسألة|المثال\s*\d+|مثال\s*\d+|الفكرة\s*\S+)/i.test(line) &&
        !/example-\d+-\d+/i.test(line) &&
        !/(?:مفهوم\s*الفكرة|القاعدة\s*الرياضية|حاول\s*بنفسك|الواجب\s*المنزلي)/i.test(line)
    );
    if (rawFinal && !steps.some((s) => s.includes(rawFinal))) steps.push(`الناتج النهائي: ${rawFinal}`);

    const geoMatch = exBody.match(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]\n]+)\]/i);
    results.push({ promptAr: cleanProblem || ideaTitle, steps, rawFinal, geometryRaw: geoMatch?.[1] });
  });

  return results;
}

export function buildStage2PrintableItem(params: {
  readonly id: string;
  readonly questionNumber: number;
  readonly block: ExtractedQuestionBlock;
  readonly branchNameAr: string;
  readonly defaultPrompt: string;
  readonly defaultAnswer: string;
  readonly bannerTitleAr?: string;
  readonly solutionsMap: {
    readonly byCode: Map<string, readonly string[]>;
    readonly byIndex: Map<number, readonly string[]>;
  };
}): PrintableMathQuestionItem {
  const mcqChoices = parseChoicesTupleFromBlock(params.block.promptText);
  let promptAr = mcqChoices ? stripInlineChoicesFromPromptText(params.block.promptText) : params.block.promptText;

  // تطهير نصوص الأسئلة من أي وسوم نظام أو رسوم هندسية أو عبارات اقتراحية
  promptAr = promptAr
    .replace(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]\n]+\]?/gi, "")
    .replace(/(?:^|\s+)رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\n.,؛]+/gi, "")
    .replace(/(?:💡\s*)?(?:خطوة\s+تالية\s+اقتراحية|اقتراح\s+الخطوة\s+التالية|خطوة\s+اقتراحية)[\s\S]*$/gi, "")
    .replace(/\|\s*نوع\s*المسألة\s*:\s*\[?[^|\n\]]+\]?/gi, "")
    .replace(/\[\s*(?:أكمل|اختر|مقالي|مسألة|تطبيق|متقدم)\s*\]/gi, "")
    .trim();

  const isMcq = (params.block.rawText || "").includes("اختر") || mcqChoices !== undefined;
  const matchedSteps = (params.block.qCode ? params.solutionsMap.byCode.get(params.block.qCode) : undefined) ||
    params.solutionsMap.byIndex.get(params.questionNumber);

  const geoMatch = params.block.rawText.match(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]\n]+)\]/i);
  const geometryFigure = geoMatch?.[1]
    ? matchOptionalGeometryFigureFromArabicDescription(geoMatch[1], `${params.id}_geo`)
    : undefined;

  return {
    id: params.id,
    questionNumber: params.questionNumber,
    kind: isMcq ? "mcq" : geometryFigure ? "essay_geometry" : "essay_algebra",
    branchBadgeAr: params.branchNameAr,
    marks: isMcq ? 1 : 2,
    promptAr: promptAr || params.defaultPrompt,
    mcqChoicesAr: mcqChoices,
    correctMcqIndex: resolveCorrectChoiceIndex(matchedSteps?.[matchedSteps.length - 1] || "", mcqChoices),
    modelAnswerAr: matchedSteps ? matchedSteps.join(" ⇐ ") : params.defaultAnswer,
    solutionStepsAr: matchedSteps,
    geometryFigure,
    ideaBannerTitleAr: params.bannerTitleAr,
  };
}
