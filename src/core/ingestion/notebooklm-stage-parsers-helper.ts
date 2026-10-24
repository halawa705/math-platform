/**
 * @file notebooklm-stage-parsers-helper.ts
 * @description دوال ذرية مساعدة لتحليل حقول ومراحل ردود NotebookLM:
 * - استخراج وتنظيف الحقول النصية المؤطرة بعلامات التنصيص أو الأقواس.
 * - تحليل وربط حلول المرحلة 3 بالمعرفات والأرقام.
 * - تفنيط الأفكار والأمثلة وتدريبات حاول بنفسك وتمارين الواجب بدون ابتلاع أو دمج.
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

export function extractLineField(block: string, labelPattern: string): string {
  const rx = new RegExp(
    `(?:^|\\n)\\s*(?:${labelPattern})\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:الفكرة|مفهوم|المفهوم|القاعدة|القانون|المثال|مثال|معرف|نص|خطوات|الناتج|أولاً|ثانياً|حاول|تمارين|نهاية)\\s*[:|#]|$)`,
    "i"
  );
  return cleanBracketedField(block.match(rx)?.[1] ?? "");
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

export interface ExtractedStage2Item {
  readonly type: "drill" | "homework";
  readonly orderNum: string;
  readonly kindTag: string;
  readonly rawBlock: string;
  readonly qCode?: string;
  readonly promptText: string;
  readonly geometryText?: string;
}

export function extractStage2DrillsAndHomeworkBlocks(cleanS2: string): readonly ExtractedStage2Item[] {
  if (!cleanS2) return [];
  const cleanBody = cleanS2.replace(/^[\s\S]*?(?=(?:حاول\s+بنفسك|تمارين\s+الواجب|\[1\]|#1|الفكرة\s+))/i, "").trim();
  const results: ExtractedStage2Item[] = [];

  const drillMatches = Array.from(
    cleanBody.matchAll(/(?:\[(\d+)\]|تمرين\s*\(?(\d+)\)?|سؤال\s*\(?(\d+)\)?)\s*(?:\|\s*معرف\s*السؤال\s*:\s*(?:try|practice|drill)[\w-]+)?\s*([\s\S]*?)(?=(?:\n\s*(?:\[\d+\]|تمرين\s*\(?\d+\)?|سؤال\s*\(?\d+\)?|#\d+|تمارين\s+الواجب|الواجب\s+المنزلي|الفكرة|نهاية))|$)/gi)
  );
  drillMatches.forEach((m, idx) => {
    const raw = (m[4] || m[0]).trim();
    const qCode = raw.match(/معرف\s*السؤال\s*:\s*((?:practice|drill|try)-\d+-\d+)/i)?.[1]?.toLowerCase();
    const geoMatch = raw.match(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]\n]+)\]/i);
    const promptText = raw.replace(/\|\s*معرف\s*السؤال\s*:\s*[\w-]+/gi, "").replace(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]\n]+\]/gi, "").trim();
    results.push({ type: "drill", orderNum: m[1] || m[2] || m[3] || String(idx + 1), kindTag: "", rawBlock: raw, qCode, promptText, geometryText: geoMatch?.[1] });
  });

  const hwMatches = Array.from(
    cleanBody.matchAll(/(?:#(\d+)|سؤال\s*\(?(\d+)\)?|مسألة\s*\(?(\d+)\)?)\s*(\[(?:اختر|أكمل|مقالي)\])?\s*([\s\S]*?)(?=(?:\n\s*(?:#\d+|سؤال\s*\(?\d+\)?|مسألة\s*\(?\d+\)?|الفكرة|نهاية))|$)/gi)
  );
  hwMatches.forEach((m, idx) => {
    const raw = m[5].trim();
    const qCode = raw.match(/معرف\s*السؤال\s*:\s*((?:homework|hw)-\d+-\d+)/i)?.[1]?.toLowerCase();
    const geoMatch = raw.match(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]\n]+)\]/i);
    const promptText = raw.replace(/\|\s*معرف\s*السؤال\s*:\s*[\w-]+/gi, "").replace(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]\n]+\]/gi, "").trim();
    results.push({ type: "homework", orderNum: m[1] || m[2] || m[3] || String(idx + 1), kindTag: (m[4] || "").toLowerCase(), rawBlock: raw, qCode, promptText, geometryText: geoMatch?.[1] });
  });

  return results;
}

export function parseStage1IdeasToPrintableItems(cleanS1: string, branchNameAr: string): readonly PrintableMathQuestionItem[] {
  const resultItems: PrintableMathQuestionItem[] = [];
  const deferredHomework: PrintableMathQuestionItem[] = [];
  if (!cleanS1) return resultItems;

  const ideaBlocks = cleanS1
    .replace(/^[\s\S]*?(?=(?:###\s*)?(?:الفكرة\s+(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|[0-9٠-٩]+)|===\s*\[(?:STAGE_1_IDEA|IDEA)))/i, "")
    .split(/(?=(?:^|\n)\s*(?:###\s*)?(?:الفكرة\s+[^\n:]+:|===\s*\[(?:STAGE_1_IDEA|IDEA)\s*:\s*\d+\]))/i)
    .map((b) => b.replace(/نهاية\s*الفكرة[^\n]*/gi, "").trim())
    .filter((b) => b.length > 15 && !/^فهرس أفكار الدرس/i.test(b));

  ideaBlocks.forEach((ideaBlock, ideaIdx) => {
    const headerLine = ideaBlock.split(/\r?\n/)[0] || "";
    const rawTitle = headerLine
      .replace(/^(?:###\s*)?(?:الفكرة\s+[^:]+:|===\s*\[[^\]]+\]\s*===)/i, "")
      .replace(/\|\s*نوع\s*المسألة\s*:[^|]+/gi, "")
      .replace(/\|\s*معرف\s*الفكرة\s*:[^|]+/gi, "")
      .replace(/#+/g, "")
      .trim() || extractLineField(ideaBlock, "عنوان_الفكرة|العنوان") || `الفكرة (${ideaIdx + 1})`;
    const ideaTitle = cleanBracketedField(rawTitle);
    const concept = extractLineField(ideaBlock, "مفهوم الفكرة|المفهوم_الرياضي|الشرح");
    const rule = extractLineField(ideaBlock, "القاعدة الرياضية|القانون_أو_القاعدة|صندوق_القاعدة");

    // فصل المناطق الثلاث داخل الفكرة: الأمثلة المحلولة، حاول بنفسك، الواجب المنزلي
    const tryMatch = ideaBlock.match(/(?:أولاً\s*:\s*)?تمارين\s*حاول\s*بنفسك([\s\S]*?)(?=(?:ثانياً\s*:\s*)?تمارين\s*الواجب|نهاية\s*الفكرة|$)/i);
    const tryBody = tryMatch ? tryMatch[1] : "";
    const hwMatch = ideaBlock.match(/(?:ثانياً\s*:\s*)?تمارين\s*الواجب\s*المنزلي([\s\S]*?)(?=نهاية\s*الفكرة|$)/i);
    const hwBody = hwMatch ? hwMatch[1] : "";
    const examplesSection = ideaBlock.split(/(?:أولاً\s*:\s*)?تمارين\s*حاول\s*بنفسك|(?:ثانياً\s*:\s*)?تمارين\s*الواجب/i)[0] || "";

    const exSplits = examplesSection
      .split(/(?:^|\n)\s*(?=(?:###\s*)?(?:المثال\s*(?:الأول|الثاني|الثالث|الرابع|الخامس|[0-9٠-٩]+)|مثال\s*\([0-9٠-٩]+\)|مثال\s*[0-9٠-٩]+|معرف\s*المثال\s*:\s*example-[0-9a-zA-Z_-]+|المثال-[0-9٠-٩]+-[0-9٠-٩]+))/i)
      .filter((b) => /(?:المثال|مثال|نص\s*المسألة|خطوات\s*الحل)/i.test(b));

    // أ) تصيير الأمثلة المحلولة
    exSplits.forEach((exBody, exIdx) => {
      const promptMatch = exBody.match(/(?:نص\s*المسألة|نص\s*المثال|المسألة)\s*:\s*([\s\S]*?)(?=\n\s*(?:خطوات\s*الحل|الحل|الخطوة|الناتج\s*النهائي|$))/i);
      const rawProblem = promptMatch?.[1] || exBody.split(/\n\s*(?:خطوات\s*الحل|الحل|الخطوة)\s*:/i)[0]?.trim() || concept || ideaTitle;
      const cleanProblem = rawProblem.replace(/^(?:###\s*)?(?:المثال\s*\S+|مثال\s*\S+)\s*/i, "").replace(/\|\s*معرف\s*المثال\s*:\s*[\w-]+/gi, "").replace(/\|\s*نوع\s*المسألة\s*:\s*\[?[^|\n\]]+\]?/gi, "").replace(/^(?:نص\s*المسألة|نص\s*المثال|المسألة)\s*:\s*/i, "").replace(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]\n]+\]/gi, "").trim();

      const stepsMatch = exBody.match(/(?:خطوات\s*الحل|خطوات_الحل|الحل)\s*:\s*([\s\S]*?)(?=\n\s*(?:الناتج\s*النهائي|الإجابة\s*النهائية|نهاية\s*الفكرة|نهاية\s*المثال|$))/i);
      const rawFinal = extractLineField(exBody, "الناتج النهائي|الإجابة_النهائية|الناتج_النهائي");
      const steps = mergeLogicalSolutionSteps(stepsMatch?.[1] || "").filter((line) => !/^(?:معرف\s*المثال|نص\s*المسألة|نوع\s*المسألة|المثال\s*\d+|مثال\s*\d+)/i.test(line) && !/example-\d+-\d+/i.test(line));
      if (rawFinal && !steps.some((s) => s.includes(rawFinal))) steps.push(`الناتج النهائي: ${rawFinal}`);

      const geoMatch = exBody.match(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]\n]+)\]/i);
      const geometryFigure = geoMatch?.[1] ? matchOptionalGeometryFigureFromArabicDescription(geoMatch[1], `s1_g_${ideaIdx}_${exIdx}`) : undefined;
      const mcqChoicesAr = parseChoicesTupleFromBlock(cleanProblem);
      const cleanPromptAr = mcqChoicesAr ? stripInlineChoicesFromPromptText(cleanProblem) : cleanProblem;

      resultItems.push({
        id: `booklet-s1-ex-${ideaIdx + 1}-${exIdx + 1}`,
        questionNumber: resultItems.length + 1,
        kind: mcqChoicesAr ? "mcq" : geometryFigure ? "essay_geometry" : "essay_algebra",
        branchBadgeAr: branchNameAr,
        marks: mcqChoicesAr ? 1 : 2,
        promptAr: cleanPromptAr || ideaTitle,
        mcqChoicesAr,
        correctMcqIndex: resolveCorrectChoiceIndex(rawFinal || steps[steps.length - 1] || "", mcqChoicesAr),
        modelAnswerAr: steps.join(" ⇐ ") || rawFinal || "راجع خطوات المثال",
        solutionStepsAr: steps.length > 0 ? steps : undefined,
        geometryFigure,
        ideaBannerTitleAr: exIdx === 0 ? `الفكرة (${ideaIdx + 1}): ${ideaTitle}` : undefined,
        conceptExplanationAr: exIdx === 0 ? concept || undefined : undefined,
        framedRuleAr: exIdx === 0 ? rule || undefined : undefined,
      });
    });

    // ب) تصيير تدريبات حاول بنفسك المستقلة لهذه الفكرة
    if (tryBody) {
      const trySplits = tryBody
        .split(/(?:^|\n|\s*-\s*)(?=(?:سؤال\s*\(?\d+\)?|تمرين\s*\(?\d+\)?|\[\d+\])\s*(?:\|\s*معرف\s*السؤال\s*:\s*(?:try|practice|drill)|:|-))/i)
        .map((s) => s.replace(/#+/g, "").trim())
        .filter((s) => s.length > 10);

      trySplits.forEach((ts, tIdx) => {
        const cleanPrompt = ts.replace(/^(?:سؤال\s*\(?\d+\)?|تمرين\s*\(?\d+\)?|\[\d+\])\s*/i, "").replace(/\|\s*معرف\s*السؤال\s*:\s*[\w-]+/gi, "").replace(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]\n]+\]/gi, "").trim();
        const geoMatch = ts.match(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]\n]+)\]/i);
        const geometryFigure = geoMatch?.[1] ? matchOptionalGeometryFigureFromArabicDescription(geoMatch[1], `s1_td_${ideaIdx}_${tIdx}`) : undefined;
        const mcqChoices = parseChoicesTupleFromBlock(cleanPrompt);
        const promptAr = mcqChoices ? stripInlineChoicesFromPromptText(cleanPrompt) : cleanPrompt;

        resultItems.push({
          id: `booklet-s1-drill-${ideaIdx + 1}-${tIdx + 1}`,
          questionNumber: resultItems.length + 1,
          kind: mcqChoices ? "mcq" : geometryFigure ? "essay_geometry" : "essay_algebra",
          branchBadgeAr: branchNameAr,
          marks: mcqChoices ? 1 : 2,
          promptAr: promptAr || `تمرين حاول بنفسك (${tIdx + 1})`,
          mcqChoicesAr: mcqChoices,
          correctMcqIndex: resolveCorrectChoiceIndex("", mcqChoices),
          modelAnswerAr: "حل الطالب كتطبيق مباشر",
          geometryFigure,
          ideaBannerTitleAr: exSplits.length === 0 && tIdx === 0 ? `الفكرة (${ideaIdx + 1}): ${ideaTitle}` : undefined,
          conceptExplanationAr: exSplits.length === 0 && tIdx === 0 ? concept || undefined : undefined,
          framedRuleAr: exSplits.length === 0 && tIdx === 0 ? rule || undefined : undefined,
        });
      });
    }

    // جـ) استخراج تمارين الواجب لتأجيلها لقسم الواجب الشامل في نهاية المذكرة
    if (hwBody) {
      const hwSplits = hwBody
        .split(/(?:^|\n|\s*-\s*)(?=(?:سؤال\s*\(?\d+\)?|مسألة\s*\(?\d+\)?|#\d+|\[\d+\])\s*(?:\|\s*معرف\s*السؤال\s*:\s*(?:hw|homework)|:|-))/i)
        .map((s) => s.replace(/#+/g, "").trim())
        .filter((s) => s.length > 10);

      hwSplits.forEach((hs, hIdx) => {
        const cleanPrompt = hs.replace(/^(?:سؤال\s*\(?\d+\)?|مسألة\s*\(?\d+\)?|#\d+|\[\d+\])\s*/i, "").replace(/\|\s*معرف\s*السؤال\s*:\s*[\w-]+/gi, "").replace(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]\n]+\]/gi, "").trim();
        const geoMatch = hs.match(/\[?\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]\n]+)\]/i);
        const geometryFigure = geoMatch?.[1] ? matchOptionalGeometryFigureFromArabicDescription(geoMatch[1], `s1_hw_${ideaIdx}_${hIdx}`) : undefined;
        const mcqChoices = parseChoicesTupleFromBlock(cleanPrompt);
        const promptAr = mcqChoices ? stripInlineChoicesFromPromptText(cleanPrompt) : cleanPrompt;

        deferredHomework.push({
          id: `booklet-s2-hw-${ideaIdx + 1}-${hIdx + 1}`,
          questionNumber: 0,
          kind: mcqChoices ? "mcq" : geometryFigure ? "essay_geometry" : "essay_algebra",
          branchBadgeAr: branchNameAr,
          marks: mcqChoices ? 1 : 2,
          promptAr: promptAr || `سؤال واجب (${hIdx + 1})`,
          mcqChoicesAr: mcqChoices,
          correctMcqIndex: resolveCorrectChoiceIndex("", mcqChoices),
          modelAnswerAr: "واجب منزلي للتقييم والتصحيح",
          geometryFigure,
        });
      });
    }
  });

  // دمج تمارين الواجب المؤجلة في النهاية بأرقام تسلسلية صحيحة
  deferredHomework.forEach((hw, idx) => {
    resultItems.push({
      ...hw,
      questionNumber: resultItems.length + 1,
      ideaBannerTitleAr: idx === 0 ? "📚 تمارين الواجب المنزلي الشاملة على الدرس" : undefined,
    });
  });

  return resultItems;
}
