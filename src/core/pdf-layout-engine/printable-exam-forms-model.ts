/**
 * @file printable-exam-forms-model.ts
 * @description نموذج كتل النماذج الامتحانية المتعددة القابلة للطباعة والمعاينة (Printable Exam Forms Group).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 60 سطراً).
 */

import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_PRINTABLE_EXAM_FORMS_MODEL = "printable_exam_forms_model" as const;

export const ARABIC_FORM_LETTERS = ["أ", "ب", "جـ", "د", "هـ", "و"] as const;
export type ArabicFormLetter = (typeof ARABIC_FORM_LETTERS)[number];

export function getArabicFormLetter(index: number): ArabicFormLetter {
  return ARABIC_FORM_LETTERS[index % ARABIC_FORM_LETTERS.length];
}

export function buildFormTitleArabic(formLetter: string): string {
  return `النموذج (${formLetter})`;
}

export interface PrintableExamFormGroup {
  readonly formId: string;
  readonly formIndex: number;
  readonly formLetterAr: string;
  readonly formTitleAr: string;
  readonly fullDocumentTitleAr: string;
  readonly questions: readonly PrintableMathQuestionItem[];
}
