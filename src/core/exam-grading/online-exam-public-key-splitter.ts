/**
 * @file online-exam-public-key-splitter.ts
 * @description يفصل أسئلة الاختبار الإلكتروني إلى (أسئلة عامة بلا إجابات تُرسل للطالب) و(مفتاح إجابات يبقى في الخادم).
 * الأسئلة غير القابلة للتصحيح الآلي (برهان/مقالي بلا إجابة قصيرة أو بدائل مكررة) تُستبعد ويُبلَّغ المعلم بأرقامها.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { auditMCQQuestionIntegrity } from "@/core/validation/question-options-integrity-auditor";

export const MODULE_ID_ONLINE_EXAM_PUBLIC_KEY_SPLITTER = "online_exam_public_key_splitter" as const;

export type OnlineAnswerMode = "mcq" | "short_answer";

export interface OnlinePublicQuestion {
  readonly questionId: string;
  readonly displayOrderNumber: number;
  readonly allocatedMarks: number;
  readonly promptArabic: string;
  readonly answerMode: OnlineAnswerMode;
  readonly mcqChoicesArabic?: readonly string[];
  readonly attachedGeometryFigure?: CanonicalGeometryFigureIR;
  readonly lessonTitleArabic?: string;
  readonly branchId?: MathBranchId;
}

export interface OnlineAnswerKeyItem {
  readonly questionId: string;
  readonly answerMode: OnlineAnswerMode;
  readonly allocatedMarks: number;
  readonly correctMcqChoiceIndex?: number;
  readonly acceptedAnswers: readonly string[];
  readonly modelSolutionStepsArabic: readonly string[];
  readonly finalAnswerArabic: string;
  readonly lessonTitleArabic?: string;
  readonly branchId?: MathBranchId;
}

export interface OnlineExamSplitResult {
  readonly publicQuestions: readonly OnlinePublicQuestion[];
  readonly answerKey: readonly OnlineAnswerKeyItem[];
  readonly excludedQuestionNumbers: readonly number[];
}

const MAX_AUTO_FINAL_ANSWER_CHARS = 40;

export function splitExamIntoPublicAndKey(questions: readonly QuestionAssessmentIR[]): OnlineExamSplitResult {
  const publicQuestions: OnlinePublicQuestion[] = [];
  const answerKey: OnlineAnswerKeyItem[] = [];
  const excluded: number[] = [];

  for (const q of questions) {
    const base = {
      questionId: q.questionId,
      displayOrderNumber: q.displayOrderNumber,
      allocatedMarks: q.allocatedMarks,
      promptArabic: q.promptArabic,
      attachedGeometryFigure: q.attachedGeometryFigure,
      lessonTitleArabic: q.lessonTitleArabic,
      branchId: q.branchId,
    };
    const keyBase = {
      questionId: q.questionId,
      allocatedMarks: q.allocatedMarks,
      modelSolutionStepsArabic: q.modelSolutionStepsArabic,
      finalAnswerArabic: q.finalCanonicalAnswerArabic,
      lessonTitleArabic: q.lessonTitleArabic,
      branchId: q.branchId,
    };

    if (
      q.patternKind === "mcq" &&
      q.mcqChoicesArabic &&
      q.correctMcqChoiceIndex !== undefined &&
      auditMCQQuestionIntegrity(q).isQuestionReadyForExam
    ) {
      publicQuestions.push({ ...base, answerMode: "mcq", mcqChoicesArabic: [...q.mcqChoicesArabic] });
      answerKey.push({ ...keyBase, answerMode: "mcq", correctMcqChoiceIndex: q.correctMcqChoiceIndex, acceptedAnswers: [] });
      continue;
    }
    const explicit = (q.acceptedAnswersArabic ?? []).map((s) => s.trim()).filter(Boolean);
    const finalAns = (q.finalCanonicalAnswerArabic || "").trim();
    const accepted = explicit.length > 0 ? explicit : finalAns && finalAns.length <= MAX_AUTO_FINAL_ANSWER_CHARS ? [finalAns] : [];
    const isShortKind = q.patternKind === "completion" || q.patternKind === "direct_answer";
    if (isShortKind && accepted.length > 0) {
      publicQuestions.push({ ...base, answerMode: "short_answer" });
      answerKey.push({ ...keyBase, answerMode: "short_answer", acceptedAnswers: accepted });
    } else {
      excluded.push(q.displayOrderNumber);
    }
  }
  return { publicQuestions, answerKey, excludedQuestionNumbers: excluded };
}
