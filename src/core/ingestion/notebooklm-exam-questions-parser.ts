/**
 * @file notebooklm-exam-questions-parser.ts
 * @description محلل أسئلة الاختبارات والمراجعات وأوراق العمل الشامل (Universal Multi-Format Exam Parser).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 200 سطر).
 */

import type { QuestionAssessmentIR, MathQuestionPatternKind } from "../ir/question-assessment-ir";
import type { MathBranchId } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage, NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import { sanitizeNotebookLMCitationsAndLatex, healFourRaysHallucination } from "./notebooklm-citation-latex-sanitizer";
import { synthesizeEmptyMcqChoices } from "./mcq-empty-choice-synthesizer";
import type { CurriculumStageKind } from "./unsolicited-diagram-guard";
import {
  extractExamQuestionDiagrams,
  cleanExamStudentPromptArabic,
} from "./exam-question-diagram-extractor";

export const MODULE_ID_NOTEBOOKLM_EXAM_QUESTIONS_PARSER = "notebooklm_exam_questions_parser" as const;

const OPTION_MARKER_REGEX =
  /(?:^|\n|\s+)(\(\s*(?:أ|ا|ب|جـ?|د|A|B|C|D)\s*\)|(?:أ|ب|جـ|د)\s*[)\].:-])(?=\s|$|\n)/gi;

export function parseChoicesTupleFromBlock(
  rawBlock: string,
  rawKind = ""
): readonly [string, string, string, string] | undefined {
  if (!rawBlock) return undefined;
  const cleanChoice = (c: string) =>
    c
      .replace(/^(?:(?:أ|ا|ب|جـ?|د|[ABCD1-4])[)\].:-]\s*|\((?:أ|ا|ب|جـ?|د|[ABCD1-4])\)\s*)/i, "")
      .replace(/\|\s*معرف\s*السؤال.*$/i, "")
      .replace(/^\s*\|\s*|\s*\|\s*$/g, "")
      .replace(/\s*---+\s*$/g, "")
      .replace(/[،,.;]+$/g, "")
      .trim();

  const explicitChoicesLine = rawBlock.match(/(?:^|\n)\s*(?:البدائل|الاختيارات|\[?OPTIONS\]?|\[?CHOICES\]?)\s*:\s*([^\n]+)/i)?.[1];
  if (explicitChoicesLine) {
    const rawPipes = explicitChoicesLine.split("|").map(cleanChoice);
    if (rawPipes.length >= 4) return [rawPipes[0], rawPipes[1], rawPipes[2], rawPipes[3]];
  }

  if (/(?:مقالي|برهان|أكمل|قصيرة|essay|proof|comp|short)/i.test(rawKind)) {
    return undefined;
  }

  const preAnswerText = (
    rawBlock.split(/\n\s*(?:الإجابة[_\s]*الصحيحة|الإجابة[_\s]*النهائية|الناتج[_\s]*النهائي|خطوات[_\s]*الحل|البرهان|الحل|الشرح)\s*:/i)[0] || rawBlock
  ).replace(/^\s*\|.*$/gm, "");
  const markers = Array.from(preAnswerText.matchAll(OPTION_MARKER_REGEX));
  if (markers.length < 4) return undefined;
  const stopTailMatch = preAnswerText.slice((markers[3].index ?? 0) + markers[3][0].length).match(/\n\s*(?:الإجابة|الحل|خطوات|الناتج|\|\s*معرف)/i);
  const hardEnd = stopTailMatch?.index !== undefined ? (markers[3].index ?? 0) + markers[3][0].length + stopTailMatch.index : preAnswerText.length;
  const slots = [0, 1, 2, 3].map((i) => {
    const start = (markers[i].index ?? 0) + markers[i][0].length;
    const end = i < 3 ? (markers[i + 1].index ?? hardEnd) : hardEnd;
    return cleanChoice(preAnswerText.slice(start, Math.max(start, end)));
  });
  return [slots[0], slots[1], slots[2], slots[3]];
}

export function stripInlineChoicesFromPromptText(promptText: string): string {
  if (!promptText) return "";
  const lines = promptText.split("\n");
  const nonTableLines: string[] = [];
  for (const line of lines) {
    if (/^\s*\|.*\|\s*$/.test(line)) {
      nonTableLines.push(line);
      continue;
    }
    const inlineIdx = line.search(
      /(?:^|\s+)(?:\(\s*(?:أ|ا)\s*\)|أ\s*[)\].:-])(?:\s|$)[\s\S]*?(?:\(\s*ب\s*\)|ب\s*[)\].:-])(?:\s|$)/i
    );
    if (inlineIdx >= 0) {
      if (inlineIdx > 2) nonTableLines.push(line.slice(0, inlineIdx).trim());
      break;
    }
    nonTableLines.push(line);
  }
  const joined = nonTableLines.join("\n").trim();
  const multiLineOptIdx = joined.search(
    /\n\s*(?:\(\s*(?:أ|ا)\s*\)|أ\s*[)\].:-])[^\n|]*\n\s*(?:\(\s*ب\s*\)|ب\s*[)\].:-])(?:\s|$)/i
  );
  return multiLineOptIdx > 4 ? joined.slice(0, multiLineOptIdx).trim() : joined;
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
    if (prev && (/[:：]\s*$/.test(prev) || (line.startsWith("$") && line.endsWith("$") && prev.length < 55))) {
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
    أ: 0, ا: 0, A: 0, "1": 0, "١": 0, ب: 1, B: 1, "2": 1, "٢": 1,
    ج: 2, "جـ": 2, C: 2, "3": 2, "٣": 2, د: 3, D: 3, "4": 3, "٤": 3,
  };
  if (letterMatch?.[1] && letterMatch[1] in letterMap) return letterMap[letterMatch[1]];
  const exactIdx = choices.findIndex((c) => c.length > 0 && (c === trimmed || trimmed.includes(c) || c.includes(trimmed)));
  return exactIdx >= 0 && exactIdx <= 3 ? (exactIdx as 0 | 1 | 2 | 3) : 0;
}

function extractFieldMultiline(block: string, fieldPattern: string): string {
  const regex = new RegExp(
    `(?:^|\\n)\\s*(?:${fieldPattern})\\s*:[ \\t]*([\\s\\S]*?)(?=\\n\\s*(?:النمط|النوع|الدرجة|النص|السؤال|المعطيات|المطلوب|البدائل|الاختيارات|الخيارات|الإجابة_الصحيحة|الإجابة الصحيحة|إجابة_الصحيحة|إجابة الصحيحة|الإجابة|إجابة|الإجابات_المقبولة|الإجابات المقبولة|خطوات_الحل|خطوات الحل|خطوات|البرهان_والخطوات|الحل|البرهان|الشرح|الإجابة_النهائية|الإجابة النهائية|الناتج_النهائي|الناتج النهائي|الرسم|رسم|الشكل|شكل|المحافظة|المصدر)\\s*:|$)`,
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
  readonly gradeId?: string;
  readonly stage?: CurriculumStageKind;
  readonly notationLanguage?: MathNotationLanguage;
  readonly numeralMode?: NumeralDisplayMode;
}): readonly QuestionAssessmentIR[] {
  let { cleanedText } = sanitizeNotebookLMCitationsAndLatex(params.rawText);
  if (!cleanedText) return [];

  // إزالة علامات الاقتباس الافتتاحية والختامية إذا نسخ المستخدم الرد كاملاً بين تنصيص
  cleanedText = cleanedText.replace(/^[\s"“«]+|[\s"”»]+$/g, "").trim();

  let rawBlocks: string[] = [];
  if (/===\s*\[(?:QUESTION|سؤال|Q)\s*:\s*\d+\]/i.test(cleanedText)) {
    rawBlocks = cleanedText.split(/===\s*\[(?:QUESTION|سؤال|Q)\s*:\s*\d+\][^\n]*===/i).map((b) => b.trim()).filter((b) => b.length > 6);
  } else if (/(?:^|\n)\s*(?:\[\d+\]|#\d+|\(\d+\))\s*[:.-]?\s+/m.test(cleanedText)) {
    rawBlocks = cleanedText
      .split(/(?:^|\n)\s*(?=(?:\[\d+\]|#\d+|\(\d+\))\s*[:.-]?\s+)/m)
      .map((b) => b.replace(/^\s*(?:\[\d+\]|#\d+|\(\d+\))\s*[:.-]?\s*/, "").trim())
      .filter((b) => b.length > 6 && !/^(?:المراجعة|التعليمات|الهيكل)/i.test(b));
  } else {
    rawBlocks = cleanedText
      .split(/(?:^|\n)\s*(?=(?:(?:السؤال|سؤال)\s+(?:\[\d+\]|\(\d+\)|\d+|الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|[1-9]\d*)\s*[:.-]?|\d+[.)-]\s+))/m)
      .map((b) => b.replace(/^\s*(?:(?:السؤال|سؤال)\s+(?:\[\d+\]|\(\d+\)|\d+|الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|[1-9]\d*)\s*[:.-]?|\d+[.)-]\s+)/, "").trim())
      .filter((b) => b.length > 8);
  }

  // معالجة ذكية حاسمة في حال عدم وجود أرقام صريحة بالرد أو اندماج الأسئلة في كتلة واحدة
  if (rawBlocks.length <= 1) {
    const mcqAnswerMatches = cleanedText.match(/(?:^|\n)\s*(?:الإجابة[_\s]*الصحيحة|إجابة[_\s]*الصحيحة|الإجابة[_\s]*النهائية)\s*:/gi);
    if (mcqAnswerMatches && mcqAnswerMatches.length > 1) {
      const mcqSplits = cleanedText
        .split(/(?<=(?:^|\n)\s*(?:الإجابة[_\s]*الصحيحة|إجابة[_\s]*الصحيحة|الإجابة[_\s]*النهائية)\s*:[^\n]*)(?:\r?\n)+/i)
        .map((b) => b.trim())
        .filter((b) => b.length > 8);
      if (mcqSplits.length > 1) rawBlocks = mcqSplits;
    }
  }

  if (rawBlocks.length <= 1) {
    const paragraphBlocks = cleanedText
      .split(/(?:\r?\n)\s*(?:\r?\n)+/)
      .map((b) => b.trim())
      .filter((b) => b.length > 8 && !/^(?:المرحلة|التعليمات|الهيكل|ملاحظات|المراجعة\s+النهائية)/i.test(b));
    if (paragraphBlocks.length > 1) rawBlocks = paragraphBlocks;
  }

  if (rawBlocks.length === 0) rawBlocks = cleanedText.split(/\n{2,}/).map((b) => b.trim()).filter((b) => b.length > 5);

  // دمج الجداول المنفصلة أو الكتل الناقصة الملحقة بالمسألة السابقة لمنع تحول الجدول لسؤال مستقل بدون رأس
  const consolidated: string[] = [];
  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const isTable = trimmed.startsWith("|") || (/^\s*\|.*\|\s*$/m.test(trimmed) && !/(?:أوجد|احسب|اكتب|حدد|ما|هل|إذا|كم)/i.test(trimmed));
    if (isTable && consolidated.length > 0) {
      consolidated[consolidated.length - 1] = `${consolidated[consolidated.length - 1]}\n\n${trimmed}`;
    } else {
      consolidated.push(trimmed);
    }
  }
  rawBlocks = consolidated;

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
    const rawAccepted = extractFieldMultiline(block, "الإجابات_المقبولة|الإجابات المقبولة");
    const rawGov = extractFieldMultiline(block, "المحافظة|المصدر");
    const rawDrawing = extractFieldMultiline(block, "الرسم|رسم|الشكل|شكل");

    const fallbackPrompt = block
      .split(/\n\s*(?:الرسم|رسم|الشكل|شكل|البدائل|الاختيارات|الخيارات|الإجابة[_\s]*الصحيحة|إجابة[_\s]*الصحيحة|الإجابة[_\s]*النهائية|الناتج[_\s]*النهائي|خطوات[_\s]*الحل|البرهان|الحل|الشرح)\s*:/i)[0]
      ?.replace(/^(?:النمط|النوع|الدرجة)\s*:.*$/gm, "")
      .replace(/\|\s*معرف\s*السؤال\s*:\s*[^\n|]+/gi, "")
      .replace(/^\[(?:اختر|أكمل|مقالي)\]\s*/i, "")
      .trim();

    const basePrompt = healFourRaysHallucination(explicitPrompt || fallbackPrompt || block);
    const extractedDiagrams = extractExamQuestionDiagrams({
      block,
      basePrompt,
      rawDrawing,
      branchId: params.branchId,
      lessonId: params.lessonId,
      lessonTitleArabic: params.lessonTitleArabic,
      orderNumber,
      gradeId: params.gradeId,
      stage: params.stage,
      notationLanguage: params.notationLanguage,
      numeralMode: params.numeralMode,
    });

    const rawChoices = parseChoicesTupleFromBlock(block, rawKind);
    const modelSolutionStepsArabic = rawSteps ? mergeLogicalSolutionSteps(rawSteps) : rawCorrect ? [rawCorrect] : [];
    const finalCanonicalAnswerArabic = rawFinalAnswer || rawCorrect || modelSolutionStepsArabic[modelSolutionStepsArabic.length - 1] || "";
    const synthResult = rawChoices
      ? synthesizeEmptyMcqChoices({ choices: rawChoices, solutionText: `${rawCorrect} ${finalCanonicalAnswerArabic}` })
      : undefined;
    const mcqChoicesArabic = synthResult?.choices;
    const synthesizedMcqIndices = synthResult && synthResult.synthesizedIndices.length > 0 ? synthResult.synthesizedIndices : undefined;
    const correctMcqChoiceIndex = resolveCorrectChoiceIndex(rawCorrect || rawFinalAnswer, mcqChoicesArabic);
    const inlineGovMatch = basePrompt.match(/(?:\{\s*(محافظة\s+[^}\n]+)\s*\}|\[\s*(محافظة\s+[^\]\n]+)\s*\]|\(\s*(محافظة\s+[^)\n]+)\s*\))/i);
    const resolvedGov = (rawGov || inlineGovMatch?.[1] || inlineGovMatch?.[2] || inlineGovMatch?.[3] || "").trim();
    const rawCleanPrompt = cleanExamStudentPromptArabic(basePrompt);
    const cleanPrompt = mcqChoicesArabic ? stripInlineChoicesFromPromptText(rawCleanPrompt) : rawCleanPrompt;

    const patternKind: MathQuestionPatternKind =
      rawKind.includes("mcq") || rawKind.includes("اختر") || rawKind.includes("multiple") || mcqChoicesArabic !== undefined ? "mcq"
        : rawKind.includes("short") || rawKind.includes("قصيرة") ? "direct_answer"
        : rawKind.includes("proof") || rawKind.includes("برهان") || rawKind.includes("مقالي") || rawKind.includes("essay") ? "proof_reasoning"
        : rawKind.includes("comp") || rawKind.includes("أكمل") ? "completion" : "direct_answer";

    return {
      questionId: `q_${params.lessonId}_${orderNumber}`, displayOrderNumber: orderNumber,
      branchId: params.branchId, unitId: params.unitId, lessonId: params.lessonId, lessonTitleArabic: params.lessonTitleArabic,
      patternKind, cognitiveDepth: patternKind === "proof_reasoning" ? "deductive_proof" : "direct_application",
      allocatedMarks: Number.isFinite(rawMarks) && rawMarks > 0 ? rawMarks : 2,
      estimatedSolveMinutes: patternKind === "proof_reasoning" ? 5 : 2,
      promptArabic: cleanPrompt || basePrompt,
      givenDataArabic: rawGiven ? rawGiven.split("|").map((s) => s.trim()).filter(Boolean) : undefined,
      requiredToProveOrFindArabic: rawRequired || undefined,
      mcqChoicesArabic, correctMcqChoiceIndex, synthesizedMcqIndices, modelSolutionStepsArabic, finalCanonicalAnswerArabic,
      acceptedAnswersArabic: rawAccepted ? rawAccepted.split("|").map((s) => s.trim()).filter(Boolean) : undefined,
      figureDiagnosticsAr: extractedDiagrams.figureDiagnosticsAr,
      attachedGeometryFigure: extractedDiagrams.attachedGeometryFigure,
      graphSpec: extractedDiagrams.graphSpec,
      rawSvgMarkup: extractedDiagrams.rawSvgMarkup,
      notationLanguage: params.notationLanguage,
      numeralMode: params.numeralMode,
      authenticCitation: resolvedGov && !resolvedGov.includes("غير مذكور") ? { governorateNameArabic: resolvedGov } : undefined,
      answerLinesCount: 0, hasDottedDivider: true,
    };
  });
}
