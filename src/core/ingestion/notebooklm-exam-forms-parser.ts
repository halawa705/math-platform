/**
 * @file notebooklm-exam-forms-parser.ts
 * @description محلل ردود النماذج الامتحانية المتعددة من NotebookLM واستخراجها في كتل مستقلة لكل نموذج مع أسئلته.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import type { QuestionAssessmentIR } from "../ir/question-assessment-ir";
import type { MathBranchId } from "../ssot/math-branches-ssot";
import { parseNotebookLMExamQuestionsToIR } from "./notebooklm-exam-questions-parser";
import { getArabicFormLetter } from "../pdf-layout-engine/printable-exam-forms-model";

export const MODULE_ID_NOTEBOOKLM_EXAM_FORMS_PARSER =
  "notebooklm_exam_forms_parser" as const;

export interface ParsedExamFormBlock {
  readonly formId: string;
  readonly formIndex: number;
  readonly formLetterAr: string;
  readonly formTitleAr: string;
  readonly questions: readonly QuestionAssessmentIR[];
}

const FORM_SPLIT_REGEX =
  /(?:^|\n)\s*(?:===\s*\[(?:FORM|نموذج|MODEL)\s*:\s*(?:\d+|[أابجد])\][^\n]*===|النموذج\s*(?:الأول|الثاني|الثالث|الرابع|الخامس|السادس|\([أابجد]\)|[أابجد]|\d+)\s*[:.-]?)/gi;

function extractFormLetterFromHeader(headerText: string, fallbackIndex: number): string {
  const match = headerText.match(/\((?:أ|ا|ب|جـ?|د|هـ|و)\)|(?:النموذج|MODEL|FORM)\s*[:\s]*([أابجدABCD1-6])/i);
  if (match?.[1]) {
    const raw = match[1].trim();
    if (raw === "ا" || raw === "A" || raw === "1") return "أ";
    if (raw === "B" || raw === "2") return "ب";
    if (raw === "C" || raw === "3") return "جـ";
    if (raw === "D" || raw === "4") return "د";
    return raw;
  }
  return getArabicFormLetter(fallbackIndex);
}

export function parseNotebookLMExamForms(params: {
  readonly rawText: string;
  readonly branchId: MathBranchId;
  readonly unitId: string;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;
  readonly expectedFormsCount?: number;
}): readonly ParsedExamFormBlock[] {
  const raw = params.rawText.trim();
  if (!raw) return [];

  const expectedCount = Math.max(1, params.expectedFormsCount ?? 3);

  // 1. محاولة تقسيم النص عبر علامات بداية النماذج الصريحة
  const matches = Array.from(raw.matchAll(FORM_SPLIT_REGEX));
  if (matches.length >= 2) {
    const forms: ParsedExamFormBlock[] = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const startIdx = match.index! + match[0].length;
      const endIdx = i + 1 < matches.length ? matches[i + 1].index! : raw.length;
      const blockText = raw.slice(startIdx, endIdx).trim();
      const formLetter = extractFormLetterFromHeader(match[0], i);
      const questions = parseNotebookLMExamQuestionsToIR({
        rawText: blockText,
        branchId: params.branchId,
        unitId: `${params.unitId}-form-${i + 1}`,
        lessonId: `${params.lessonId}-form-${i + 1}`,
        lessonTitleArabic: params.lessonTitleArabic,
      });

      forms.push({
        formId: `form-${i + 1}`,
        formIndex: i,
        formLetterAr: formLetter,
        formTitleAr: `النموذج (${formLetter})`,
        questions: questions.map((q, qIdx) => ({
          ...q,
          displayOrderNumber: qIdx + 1,
          questionId: `q-form-${i + 1}-${qIdx + 1}`,
        })),
      });
    }

    if (forms.some((f) => f.questions.length > 0)) {
      return forms;
    }
  }

  // 2. محاولة استخراج كافة الأسئلة والتحقق من وجود وسم النموذج داخل كل سؤال
  const allQuestions = parseNotebookLMExamQuestionsToIR({
    rawText: raw,
    branchId: params.branchId,
    unitId: params.unitId,
    lessonId: params.lessonId,
    lessonTitleArabic: params.lessonTitleArabic,
  });

  if (allQuestions.length === 0) return [];

  // فحص ما إذا كان هناك تقسيم داخلي في النص بذكر رمز النموذج
  const taggedFormsMap = new Map<string, QuestionAssessmentIR[]>();
  const formQuestionRegex = /النموذج\s*:\s*\[?([أابجدABCD1-6])\]?/i;

  const rawBlocks = raw.split(/===\s*\[(?:QUESTION|سؤال|Q)\s*:\s*\d+\]/i);
  if (rawBlocks.length > 1 && rawBlocks.length - 1 === allQuestions.length) {
    allQuestions.forEach((q, idx) => {
      const block = rawBlocks[idx + 1] || "";
      const match = block.match(formQuestionRegex);
      const letter = match ? extractFormLetterFromHeader(match[0], 0) : "";
      if (letter) {
        if (!taggedFormsMap.has(letter)) taggedFormsMap.set(letter, []);
        taggedFormsMap.get(letter)!.push(q);
      }
    });
  }

  if (taggedFormsMap.size >= 2) {
    const sortedKeys = Array.from(taggedFormsMap.keys());
    return sortedKeys.map((letter, idx) => ({
      formId: `form-${idx + 1}`,
      formIndex: idx,
      formLetterAr: letter,
      formTitleAr: `النموذج (${letter})`,
      questions: taggedFormsMap.get(letter)!.map((q, qIdx) => ({
        ...q,
        displayOrderNumber: qIdx + 1,
        questionId: `q-form-${idx + 1}-${qIdx + 1}`,
      })),
    }));
  }

  // 3. التوزيع التناسبي التلقائي للأسئلة على عدد النماذج المتوقع في حال وردت الأسئلة مجمعة
  const questionsPerForm = Math.max(1, Math.floor(allQuestions.length / expectedCount));
  const fallbackForms: ParsedExamFormBlock[] = [];

  for (let i = 0; i < expectedCount; i++) {
    const start = i * questionsPerForm;
    const end = i === expectedCount - 1 ? allQuestions.length : (i + 1) * questionsPerForm;
    const slice = allQuestions.slice(start, end);
    const formLetter = getArabicFormLetter(i);
    fallbackForms.push({
      formId: `form-${i + 1}`,
      formIndex: i,
      formLetterAr: formLetter,
      formTitleAr: `النموذج (${formLetter})`,
      questions: slice.map((q, qIdx) => ({
        ...q,
        displayOrderNumber: qIdx + 1,
        questionId: `q-form-${i + 1}-${qIdx + 1}`,
      })),
    });
  }

  return fallbackForms;
}
