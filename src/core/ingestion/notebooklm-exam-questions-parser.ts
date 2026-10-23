/**
 * @file notebooklm-exam-questions-parser.ts
 * @description محلل أسئلة الاختبارات والمراجعات وأوراق العمل الشامل (Universal Multi-Format Exam Parser):
 * - يستخرج البدائل الأربعة (أ، ب، جـ، د) سواء كُتبت في أسطر مستقلة أو مدمجة داخل سطر السؤال، ويحذفها من نص السؤال لمنع التكرار.
 * - يدمج خطوات الحل المنطقية (بحيث لا تنفصل جملة التمهيد المنتهية بـ `:` عن معادلتها في السطر التالي).
 * - يستخدم `matchOptionalGeometryFigureFromArabicDescription` لمنع إرفاق رسوم وهمية للمسائل اللفظية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type {
  QuestionAssessmentIR,
  MathQuestionPatternKind,
} from "../ir/question-assessment-ir";
import type { MathBranchId } from "../ssot/math-branches-ssot";
import { matchOptionalGeometryFigureFromArabicDescription } from "../geometry-engine/natural-arabic-geometry-matcher";
import { sanitizeNotebookLMCitationsAndLatex } from "./notebooklm-citation-latex-sanitizer";

export const MODULE_ID_NOTEBOOKLM_EXAM_QUESTIONS_PARSER =
  "notebooklm_exam_questions_parser" as const;

const INLINE_OPTION_SPLIT_REGEX =
  /(?:^|\n|\s+)(?:\(\s*(?:أ|ا|ب|جـ?|د|A|B|C|D)\s*\)|(?:أ|ب|جـ|د)\s*[)\].:-])\s*([\s\S]*?)(?=(?:\n|\s+)(?:\(\s*(?:أ|ا|ب|جـ?|د|A|B|C|D)\s*\)|(?:أ|ب|جـ|د)\s*[)\].:-])|\n\s*(?:الإجابة|الحل|خطوات|الناتج|\|\s*معرف)|$)/gi;

export function parseChoicesTupleFromBlock(
  rawBlock: string
): readonly [string, string, string, string] | undefined {
  if (!rawBlock) return undefined;
  const cleanChoice = (c: string) =>
    c
      .replace(/^(?:[أابجدABCD1-4][)\].:-]\s*|\([أابجدABCD1-4]\)\s*)/i, "")
      .replace(/\|\s*معرف\s*السؤال.*$/i, "")
      .replace(/\s*---+\s*$/g, "")
      .trim();

  const explicitChoicesLine = rawBlock.match(
    /(?:^|\n)\s*(?:البدائل|الاختيارات)\s*:\s*([^\n]+)/i
  )?.[1];

  if (explicitChoicesLine) {
    const pipeParts = explicitChoicesLine.split("|").map(cleanChoice).filter(Boolean);
    if (pipeParts.length >= 4) {
      return [pipeParts[0], pipeParts[1], pipeParts[2], pipeParts[3]];
    }
  }

  const preAnswerText =
    rawBlock.split(
      /\n\s*(?:الإجابة[_\s]*الصحيحة|الإجابة[_\s]*النهائية|الناتج[_\s]*النهائي|خطوات[_\s]*الحل|البرهان|الحل|الشرح)\s*:/i
    )[0] || rawBlock;

  const optionMatches = Array.from(preAnswerText.matchAll(INLINE_OPTION_SPLIT_REGEX)).map(
    (m) => cleanChoice(m[1] || "")
  );

  if (optionMatches.length >= 4) {
    return [optionMatches[0], optionMatches[1], optionMatches[2], optionMatches[3]];
  }
  return undefined;
}

export function stripInlineChoicesFromPromptText(promptText: string): string {
  if (!promptText) return "";
  const firstOptIdx = promptText.search(
    /(?:^|\n|\s+)(?:\(\s*(?:أ|ا)\s*\)|أ\s*[)\].:-])\s+\S[\s\S]*?(?:\(\s*ب\s*\)|ب\s*[)\].:-])\s+/i
  );
  if (firstOptIdx > 4) {
    return promptText.slice(0, firstOptIdx).trim();
  }
  return promptText;
}

export function mergeLogicalSolutionSteps(rawStepsText: string): string[] {
  if (!rawStepsText) return [];
  const rawLines = rawStepsText
    .split(/\||\r?\n+/)
    .map((s) =>
      s
        .replace(/^\s*(?:[-•*]|\d+[.)-]|\(\d+\)|(?:الخطوة|خطوة)\s*(?:\d+|الأولى|الثانية|الثالثة|الرابعة)\s*[:.-]?)\s*/i, "")
        .replace(/\s*---+\s*$/g, "")
        .trim()
    )
    .filter((s) => s.length > 0 && !/^[-*_]{2,}$/.test(s));

  const merged: string[] = [];
  for (const line of rawLines) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      (/[:：]\s*$/.test(prev) || (line.startsWith("$") && line.endsWith("$") && prev.length < 55))
    ) {
      merged[merged.length - 1] = `${prev} ${line}`.replace(/\s{2,}/g, " ").trim();
    } else {
      merged.push(line);
    }
  }
  return merged;
}

export function resolveCorrectChoiceIndex(
  rawCorrect: string,
  choices: readonly [string, string, string, string] | undefined
): 0 | 1 | 2 | 3 | undefined {
  if (!choices || !rawCorrect) return undefined;
  const trimmed = rawCorrect.trim();
  const letterMatch = trimmed.match(/(?:^|\s)\(?([أابجدABCD1-4]|جـ)\)?(?:\s|$|[).:-])/i);
  const letterMap: Record<string, 0 | 1 | 2 | 3> = {
    أ: 0, ا: 0, A: 0, "1": 0, "١": 0,
    ب: 1, B: 1, "2": 1, "٢": 1,
    ج: 2, "جـ": 2, C: 2, "3": 2, "٣": 2,
    د: 3, D: 3, "4": 3, "٤": 3,
  };
  if (letterMatch?.[1] && letterMatch[1] in letterMap) {
    return letterMap[letterMatch[1]];
  }
  const exactIdx = choices.findIndex(
    (c) => c.length > 0 && (c === trimmed || trimmed.includes(c) || c.includes(trimmed))
  );
  return exactIdx >= 0 && exactIdx <= 3 ? (exactIdx as 0 | 1 | 2 | 3) : 0;
}

function extractFieldMultiline(block: string, fieldPattern: string): string {
  const regex = new RegExp(
    `(?:^|\\n)\\s*(?:${fieldPattern})\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:النمط|النوع|الدرجة|النص|السؤال|المعطيات|المطلوب|البدائل|الاختيارات|الإجابة_الصحيحة|الإجابة الصحيحة|خطوات_الحل|خطوات الحل|البرهان_والخطوات|الحل|الشرح|الإجابة_النهائية|الإجابة النهائية|الناتج النهائي|المحافظة|المصدر)\\s*:|$)`,
    "i"
  );
  return (block.match(regex)?.[1] ?? "").replace(/\s*---+\s*$/g, "").trim();
}

export function parseNotebookLMExamQuestionsToIR(params: {
  readonly rawText: string;
  readonly branchId: MathBranchId;
  readonly unitId: string;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;
}): readonly QuestionAssessmentIR[] {
  const { cleanedText } = sanitizeNotebookLMCitationsAndLatex(params.rawText);
  if (!cleanedText) return [];

  let rawBlocks: string[] = [];
  if (/===\s*\[(?:QUESTION|سؤال|Q)\s*:\s*\d+\]/i.test(cleanedText)) {
    rawBlocks = cleanedText
      .split(/===\s*\[(?:QUESTION|سؤال|Q)\s*:\s*\d+\][^\n]*===/i)
      .map((b) => b.trim())
      .filter((b) => b.length > 6);
  } else if (/(?:^|\n)\s*(?:\[\d+\]|#\d+)\s+/m.test(cleanedText)) {
    rawBlocks = cleanedText
      .split(/(?:^|\n)\s*(?=(?:\[\d+\]|#\d+)\s+)/m)
      .map((b) => b.replace(/^\s*(?:\[\d+\]|#\d+)\s*/, "").trim())
      .filter((b) => b.length > 6 && !/^(?:المراجعة|التعليمات|الهيكل)/i.test(b));
  } else {
    rawBlocks = cleanedText
      .split(/(?:^|\n)\s*(?:السؤال\s+(?:الأول|الثاني|الثالث|الرابع|الخامس|\d+)\s*[:.-]|\d+[.)-]\s+)/m)
      .map((b) => b.trim())
      .filter((b) => b.length > 8);
  }

  if (rawBlocks.length === 0) {
    rawBlocks = cleanedText
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter((b) => b.length > 5);
  }

  return rawBlocks.map((block, idx): QuestionAssessmentIR => {
    const orderNumber = idx + 1;
    const rawKind = extractFieldMultiline(block, "النمط|النوع").toLowerCase();
    const rawMarks = Number(extractFieldMultiline(block, "الدرجة"));
    const explicitPrompt = extractFieldMultiline(block, "النص|السؤال|نص المسألة");
    const rawGiven = extractFieldMultiline(block, "المعطيات");
    const rawRequired = extractFieldMultiline(block, "المطلوب");
    const rawCorrect = extractFieldMultiline(block, "الإجابة_الصحيحة|الإجابة الصحيحة");
    const rawSteps = extractFieldMultiline(block, "خطوات_الحل|خطوات الحل|البرهان_والخطوات|الحل|الشرح");
    const rawFinalAnswer = extractFieldMultiline(block, "الإجابة_النهائية|الإجابة النهائية|الناتج النهائي");
    const rawGov = extractFieldMultiline(block, "المحافظة|المصدر");

    const fallbackPrompt = block
      .split(/\n\s*(?:البدائل|الاختيارات|الإجابة|خطوات|البرهان|الحل|الشرح|\(\s*[أابجدABCD]\s*\)|[أابجد][)\].:-]\s+)/i)[0]
      ?.replace(/^(?:النمط|النوع|الدرجة)\s*:.*$/gm, "")
      .replace(/\|\s*معرف\s*السؤال\s*:\s*[\w-]+/gi, "")
      .replace(/^\[(?:اختر|أكمل|مقالي)\]\s*/i, "")
      .trim();

    const basePrompt = explicitPrompt || fallbackPrompt || block;
    const geoMatch = block.match(/\[رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*([^\]]+)\]/i);
    const attachedGeometryFigure = geoMatch?.[1]
      ? matchOptionalGeometryFigureFromArabicDescription(geoMatch[1], `geom_${params.lessonId}_${orderNumber}`)
      : undefined;

    const mcqChoicesArabic = parseChoicesTupleFromBlock(block);
    const rawCleanPrompt = basePrompt.replace(/\[رسم\s*(?:هندسي|توضيحي|بياني)\s*:\s*[^\]]+\]/gi, "").trim();
    const cleanPrompt = mcqChoicesArabic ? stripInlineChoicesFromPromptText(rawCleanPrompt) : rawCleanPrompt;

    const patternKind: MathQuestionPatternKind =
      rawKind.includes("mcq") || rawKind.includes("اختر") || mcqChoicesArabic !== undefined
        ? "mcq"
        : rawKind.includes("proof") || rawKind.includes("برهان")
          ? "proof_reasoning"
          : rawKind.includes("comp") || rawKind.includes("أكمل")
            ? "completion"
            : "direct_answer";

    const correctMcqChoiceIndex = resolveCorrectChoiceIndex(rawCorrect || rawFinalAnswer, mcqChoicesArabic);
    const modelSolutionStepsArabic = rawSteps
      ? mergeLogicalSolutionSteps(rawSteps)
      : rawCorrect
        ? [rawCorrect]
        : [];
    const finalCanonicalAnswerArabic =
      rawFinalAnswer || rawCorrect || modelSolutionStepsArabic[modelSolutionStepsArabic.length - 1] || "";

    return {
      questionId: `q-${params.lessonId}-${orderNumber}`,
      displayOrderNumber: orderNumber,
      branchId: params.branchId,
      unitId: params.unitId,
      lessonId: params.lessonId,
      lessonTitleArabic: params.lessonTitleArabic,
      patternKind,
      cognitiveDepth: patternKind === "proof_reasoning" ? "deductive_proof" : "multi_step_analysis",
      allocatedMarks: Number.isFinite(rawMarks) && rawMarks > 0 ? rawMarks : patternKind === "mcq" ? 1 : 3,
      estimatedSolveMinutes: patternKind === "mcq" ? 2 : 5,
      promptArabic: cleanPrompt,
      givenDataArabic: rawGiven ? rawGiven.split(/[،|]/).map((s) => s.trim()).filter(Boolean) : undefined,
      requiredToProveOrFindArabic: rawRequired || undefined,
      mcqChoicesArabic,
      correctMcqChoiceIndex,
      modelSolutionStepsArabic,
      finalCanonicalAnswerArabic,
      attachedGeometryFigure,
      authenticCitation: rawGov && !rawGov.includes("غير مذكور") ? { governorateNameArabic: rawGov } : undefined,
    };
  });
}
