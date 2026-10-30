"use client";

/**
 * @file exam-question-card.tsx
 * @description بطاقة سؤال واحد في الاختبار الإلكتروني للطالب (نص + شكل متجهي + بدائل أو إجابة قصيرة + حالة المراجعة بعد التسليم).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import StudentVirtualMathKeypad from "@/features/electronic-exams-hub/student-virtual-math-keypad";
import { renderQuestionFigureSvg } from "@/core/pdf-layout-engine/question-figure-svg-renderer";
import type { PublishedExamQuestionItem } from "@/features/electronic-exams-hub/published-online-exams-store";
import type { OnlineQuestionResult, StudentAnswerInput } from "@/core/exam-grading/online-exam-grader";
import { ARABIC_CHOICE_LETTERS } from "@/core/ssot/numeral-and-unit-ssot";
import type { ExamQuestionReviewInfo } from "./use-exam-session";

export const MODULE_ID_EXAM_QUESTION_CARD = "exam_question_card" as const;

export interface ExamQuestionCardProps {
  readonly question: PublishedExamQuestionItem;
  readonly answer?: StudentAnswerInput;
  readonly isFlagged: boolean;
  readonly isSubmitted: boolean;
  readonly resultState?: OnlineQuestionResult;
  readonly reviewState?: ExamQuestionReviewInfo;
  readonly onChangeAnswer: (patch: StudentAnswerInput) => void;
  readonly onToggleFlag: () => void;
}

export default function ExamQuestionCard({
  question,
  answer,
  isFlagged,
  isSubmitted,
  resultState,
  reviewState,
  onChangeAnswer,
  onToggleFlag,
}: ExamQuestionCardProps) {
  const isMcq =
    (question.answerMode === "mcq" || question.patternKind === "mcq") &&
    Array.isArray(question.mcqChoicesArabic) &&
    question.mcqChoicesArabic.length > 0;

  const pickedChoice = answer?.choiceIndex;
  const textVal = answer?.text ?? "";

  const borderClass = !isSubmitted
    ? "border-slate-200 dark:border-slate-800"
    : resultState?.isCorrect
      ? "border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/15"
      : "border-2 border-rose-500 bg-rose-50/20 dark:bg-rose-950/15";

  return (
    <div key={question.questionId} className={`exam-pop p-5 rounded-3xl bg-white dark:bg-[#111827] border ${borderClass} shadow-sm space-y-4`}>
      <div className="flex items-center justify-between gap-2 text-xs font-black">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200">
            السؤال {question.displayOrderNumber}
          </span>
          {isSubmitted && resultState && (
            <span
              className={`px-2.5 py-1 rounded-xl ${
                resultState.isCorrect
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200"
              }`}
            >
              {resultState.isCorrect ? "✓ إجابة صحيحة" : "✗ إجابة خاطئة"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">{question.allocatedMarks} درجات</span>
          {!isSubmitted && (
            <button
              type="button"
              onClick={onToggleFlag}
              className={`min-h-[44px] px-3 rounded-xl text-xs font-black border cursor-pointer transition ${
                isFlagged
                  ? "bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200"
                  : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              🚩 {isFlagged ? "معلّم للمراجعة" : "علّم للمراجعة"}
            </button>
          )}
        </div>
      </div>

      <div className={question.attachedGeometryFigure || question.graphSpec ? "grid grid-cols-1 sm:grid-cols-12 gap-3 items-center" : "block"}>
        <div className="sm:col-span-7 text-sm font-bold leading-relaxed text-slate-900 dark:text-slate-100">
          <SafeKaTeXBiDiMathRenderer text={question.promptArabic} />
        </div>
        {(question.attachedGeometryFigure || question.graphSpec) && (
          <div
            className="sm:col-span-5 max-w-full overflow-hidden p-2 rounded-xl bg-white border border-slate-200 flex justify-center"
            dangerouslySetInnerHTML={{
              __html: renderQuestionFigureSvg(question, { widthPx: 230, heightPx: 155, numeralMode: "eastern" }) || "",
            }}
          />
        )}
      </div>

      {isMcq && question.mcqChoicesArabic ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.mcqChoicesArabic.map((choice, cIdx) => {
            const isPicked = pickedChoice === cIdx;
            const isCorrectChoice = isSubmitted && reviewState?.correctMcqChoiceIndex === cIdx;
            const isWrongPicked = isSubmitted && isPicked && !resultState?.isCorrect;

            let btnStyle = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200";
            if (!isSubmitted && isPicked) {
              btnStyle = "border-teal-600 bg-teal-600 text-white ring-2 ring-teal-400/50 scale-[1.02] shadow-md";
            } else if (isCorrectChoice) {
              btnStyle = "border-emerald-600 bg-emerald-600 text-white shadow-md";
            } else if (isWrongPicked) {
              btnStyle = "border-rose-600 bg-rose-600 text-white exam-shake shadow-md";
            }

            return (
              <button
                key={cIdx}
                type="button"
                disabled={isSubmitted}
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);
                  onChangeAnswer({ choiceIndex: cIdx });
                }}
                className={`min-h-[48px] px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-black transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center text-[11px]">
                    {ARABIC_CHOICE_LETTERS[cIdx] ?? cIdx + 1}
                  </span>
                  <SafeKaTeXBiDiMathRenderer text={choice} />
                </span>
                {isCorrectChoice && <span>✓</span>}
                {isWrongPicked && <span>✗</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2.5">
          <input
            type="text"
            disabled={isSubmitted}
            value={textVal}
            onChange={(e) => onChangeAnswer({ text: e.target.value })}
            placeholder="اكتب الناتج النهائي أو الإجابة القصيرة هنا..."
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
          />
          {!isSubmitted && (
            <StudentVirtualMathKeypad
              onInsertSymbol={(sym) => onChangeAnswer({ text: textVal + sym })}
              onClear={() => onChangeAnswer({ text: "" })}
            />
          )}
        </div>
      )}

      {isSubmitted && reviewState && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="font-black text-teal-800 dark:text-teal-300">
            💡 الإجابة النموذجية: <SafeKaTeXBiDiMathRenderer text={reviewState.finalAnswerArabic} />
          </div>
          {reviewState.modelSolutionStepsArabic.length > 0 && (
            <div className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
              <SafeKaTeXBiDiMathRenderer text={reviewState.modelSolutionStepsArabic.join(" — ")} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
