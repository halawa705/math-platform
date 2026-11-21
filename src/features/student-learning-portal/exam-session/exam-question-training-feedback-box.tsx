"use client";

/**
 * @file exam-question-training-feedback-box.tsx
 * @description صندوق التغذية الراجعة الفورية لوضع التدريب ذي الاتجاه الواحد + مراجعة الإجابة النموذجية بعد التسليم.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 105 سطراً).
 */

import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import type { LockedTrainingQuestionFeedback } from "@/core/auth/exam-attempt-state-server-store";
import type { OnlineQuestionResult } from "@/core/exam-grading/online-exam-grader";
import type { MathNotationLanguage, NumeralDisplayMode } from "@/core/ssot/numeral-and-unit-ssot";
import type { ExamQuestionReviewInfo } from "./use-exam-session";

export const MODULE_ID_EXAM_QUESTION_TRAINING_FEEDBACK_BOX =
  "exam_question_training_feedback_box" as const;

export interface ExamQuestionTrainingFeedbackBoxProps {
  readonly isTrainingMode?: boolean;
  readonly isQuestionLocked?: boolean;
  readonly isSubmitted: boolean;
  readonly hasAnswer: boolean;
  readonly isCheckingTrainingAnswer?: boolean;
  readonly trainingFeedback?: LockedTrainingQuestionFeedback;
  readonly resultState?: OnlineQuestionResult;
  readonly reviewState?: ExamQuestionReviewInfo;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
  readonly onConfirmTrainingAnswer?: () => void;
}

export default function ExamQuestionTrainingFeedbackBox({
  isTrainingMode = false,
  isQuestionLocked = false,
  isSubmitted,
  hasAnswer,
  isCheckingTrainingAnswer = false,
  trainingFeedback,
  resultState,
  reviewState,
  numeralMode,
  notationLanguage,
  onConfirmTrainingAnswer,
}: ExamQuestionTrainingFeedbackBoxProps) {
  const showTrainingConfirm =
    isTrainingMode && !isQuestionLocked && !isSubmitted && onConfirmTrainingAnswer;

  const activeReview =
    isSubmitted && reviewState
      ? reviewState
      : isQuestionLocked && trainingFeedback
        ? {
            finalAnswerArabic: trainingFeedback.finalAnswerArabic,
            modelSolutionStepsArabic: trainingFeedback.modelSolutionStepsArabic,
          }
        : null;

  return (
    <div className="space-y-2.5">
      {showTrainingConfirm && (
        <button
          type="button"
          disabled={!hasAnswer || isCheckingTrainingAnswer}
          onClick={onConfirmTrainingAnswer}
          className="w-full min-h-[46px] px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-45 text-white text-xs sm:text-sm font-black shadow-sm transition cursor-pointer"
        >
          {isCheckingTrainingAnswer
            ? "⏳ جارٍ التحقق من الإجابة..."
            : "✓ تأكيد الإجابة وعرض الحل الآن (اتجاه واحد — لا يمكن التراجع)"}
        </button>
      )}

      {isSubmitted && resultState?.teacherFeedback && (
        <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-950 dark:text-indigo-200">
          📝 تعليق المعلم ({resultState.earnedMarks}/{resultState.allocatedMarks}):{" "}
          {resultState.teacherFeedback}
        </div>
      )}

      {activeReview && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="font-black text-teal-800 dark:text-teal-300">
            💡 الإجابة النموذجية:{" "}
            <SafeKaTeXBiDiMathRenderer
              text={activeReview.finalAnswerArabic}
              numeralMode={numeralMode}
              notationLanguage={notationLanguage}
            />
          </div>
          {activeReview.modelSolutionStepsArabic.length > 0 && (
            <div className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
              <SafeKaTeXBiDiMathRenderer
                text={activeReview.modelSolutionStepsArabic.join(" — ")}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
