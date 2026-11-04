/**
 * @file exam-questions-shuffler.ts
 * @description محرك خلط وترتيب الأسئلة والبدائل الرياضية عشوائياً (Randomized Exam & Choices Shuffler):
 * 1. خلط ترتيب الأسئلة عشوائياً داخل نفس النمط الحاكم (الـ MCQ وحدهم أولاً، والمقالي وحدهم ثانياً).
 * 2. خلط بدائل الاختيار من متعدد (أ، ب، جـ، د) مع التتبع الرياضي التلقائي والدقيق لموقع الإجابة الصحيحة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { QuestionAssessmentIR } from "../ir/question-assessment-ir";

export const MODULE_ID_EXAM_QUESTIONS_SHUFFLER = "exam_questions_shuffler" as const;

/**
 * خوارزمية Fisher-Yates المعتمدة للخلط العشوائي الحقيقي.
 */
function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * يخلط بدائل سؤال اختيار من متعدد واحد عشوائياً مع تحديث فهرس الإجابة الصحيحة.
 */
export function shuffleSingleQuestionMcqChoices(
  question: QuestionAssessmentIR
): QuestionAssessmentIR {
  if (
    question.patternKind !== "mcq" ||
    !question.mcqChoicesArabic ||
    question.mcqChoicesArabic.length !== 4
  ) {
    return question;
  }

  const choices = question.mcqChoicesArabic;
  const currentCorrectIdx = question.correctMcqChoiceIndex ?? 0;
  const correctChoiceText = choices[currentCorrectIdx] ?? choices[0];

  const indices: [0, 1, 2, 3] = [0, 1, 2, 3];
  const permuted = fisherYatesShuffle(indices);

  const newChoices: [string, string, string, string] = [
    choices[permuted[0]],
    choices[permuted[1]],
    choices[permuted[2]],
    choices[permuted[3]],
  ];

  let newCorrectIdx: 0 | 1 | 2 | 3 = 0;
  const foundIdx = newChoices.findIndex((c) => c === correctChoiceText);
  if (foundIdx >= 0 && foundIdx <= 3) {
    newCorrectIdx = foundIdx as 0 | 1 | 2 | 3;
  }

  return {
    ...question,
    mcqChoicesArabic: newChoices,
    correctMcqChoiceIndex: newCorrectIdx,
  };
}

/**
 * يخلط بدائل الاختيار من متعدد لجميع الأسئلة الواردة عشوائياً مع التتبع الدقيق للإجابات الصحيحة.
 */
export function shuffleAllMcqChoicesInQuestions(
  questions: readonly QuestionAssessmentIR[]
): readonly QuestionAssessmentIR[] {
  return questions.map((q) => shuffleSingleQuestionMcqChoices(q));
}

/**
 * يخلط ترتيب الأسئلة عشوائياً داخل نفس النمط الحاكم (الـ MCQ يخلطون فيما بينهم، والأسئلة المقالية فيما بينها).
 */
export function shuffleExamQuestionsByKind(
  questions: readonly QuestionAssessmentIR[]
): readonly QuestionAssessmentIR[] {
  if (questions.length <= 1) return questions;

  const mcqQuestions = questions.filter((q) => q.patternKind === "mcq");
  const essayQuestions = questions.filter((q) => q.patternKind !== "mcq");

  const shuffledMcq = fisherYatesShuffle(mcqQuestions);
  const shuffledEssay = fisherYatesShuffle(essayQuestions);

  const combined = [...shuffledMcq, ...shuffledEssay];
  return combined.map((q, idx) => ({
    ...q,
    displayOrderNumber: idx + 1,
  }));
}

/**
 * خلط شامل لترتيب الأسئلة وبدائل الخيارات معاً في خطوة واحدة.
 */
export function shuffleBothQuestionsAndChoices(
  questions: readonly QuestionAssessmentIR[]
): readonly QuestionAssessmentIR[] {
  const withShuffledChoices = shuffleAllMcqChoicesInQuestions(questions);
  return shuffleExamQuestionsByKind(withShuffledChoices);
}
