/**
 * @file question-options-integrity-auditor.ts
 * @description مدقق سلامة بدائل أسئلة الاختيار من متعدد (MCQ Options Integrity Auditor):
 * يضمن وجود 4 بدائل غير فارغة، وعدم تكرار أي بديلين، وتطابق الإجابة الصحيحة مع أحد البدائل الأربعة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { QuestionAssessmentIR } from "../ir/question-assessment-ir";

export const MODULE_ID_QUESTION_OPTIONS_INTEGRITY_AUDITOR =
  "question_options_integrity_auditor" as const;

export interface MCQIntegrityAuditReport {
  readonly questionId: string;
  readonly hasFourDistinctChoices: boolean;
  readonly hasValidCorrectIndex: boolean;
  readonly isQuestionReadyForExam: boolean;
}

export function auditMCQQuestionIntegrity(
  question: QuestionAssessmentIR
): MCQIntegrityAuditReport {
  if (question.patternKind !== "mcq") {
    return {
      questionId: question.questionId,
      hasFourDistinctChoices: true,
      hasValidCorrectIndex: true,
      isQuestionReadyForExam: Boolean(question.promptArabic.trim()),
    };
  }

  const choices = question.mcqChoicesArabic || ["", "", "", ""];
  const trimmed = choices.map((c) => c.trim()).filter(Boolean);
  const uniqueSet = new Set(trimmed);

  const hasFourDistinctChoices = trimmed.length === 4 && uniqueSet.size === 4;
  const idx = question.correctMcqChoiceIndex ?? 0;
  const hasValidCorrectIndex = idx >= 0 && idx <= 3;

  return {
    questionId: question.questionId,
    hasFourDistinctChoices,
    hasValidCorrectIndex,
    isQuestionReadyForExam: hasFourDistinctChoices && hasValidCorrectIndex,
  };
}
