"use client";

/**
 * @file exam-question-card.tsx
 * @description بطاقة سؤال واحد في الاختبار الإلكتروني للطالب (نص + شكل متجهي + بدائل أو إجابة قصيرة + حالة المراجعة بعد التسليم).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import StudentVirtualMathKeypad from "@/features/electronic-exams-hub/student-virtual-math-keypad";
import { renderQuestionFigureSvg } from "@/core/pdf-layout-engine/question-figure-svg-renderer";
import { computeFigureAspectFromVertices } from "@/core/pdf-layout-engine/question-figure-box-size";
import { QuestionGivenRequiredBadges } from "@/core/pdf-layout-engine/question-given-required-badges";
import type { PublishedExamQuestionItem } from "@/features/electronic-exams-hub/published-online-exams-store";
import type { OnlineQuestionResult, StudentAnswerInput } from "@/core/exam-grading/online-exam-grader";
import type { LockedTrainingQuestionFeedback } from "@/core/auth/exam-attempt-state-server-store";
import { ARABIC_CHOICE_LETTERS } from "@/core/ssot/numeral-and-unit-ssot";
import type { ExamQuestionReviewInfo } from "./use-exam-session";
import ExamQuestionFigurePanel from "./exam-question-figure-panel";
import StudentProofPhotoCaptureBox from "./student-proof-photo-capture-box";
import ExamCoordinateAnswerDrawer from "./exam-coordinate-answer-drawer";
import ExamQuestionTrainingFeedbackBox from "./exam-question-training-feedback-box";

export const MODULE_ID_EXAM_QUESTION_CARD = "exam_question_card" as const;

export interface ExamQuestionCardProps {
  readonly question: PublishedExamQuestionItem;
  readonly answer?: StudentAnswerInput;
  readonly isFlagged: boolean;
  readonly isSubmitted: boolean;
  readonly isTrainingMode?: boolean;
  readonly isQuestionLocked?: boolean;
  readonly isCheckingTrainingAnswer?: boolean;
  readonly trainingFeedback?: LockedTrainingQuestionFeedback;
  readonly resultState?: OnlineQuestionResult;
  readonly reviewState?: ExamQuestionReviewInfo;
  readonly onChangeAnswer: (patch: StudentAnswerInput) => void;
  readonly onToggleFlag: () => void;
  readonly onConfirmTrainingAnswer?: () => void;
}

export default function ExamQuestionCard({
  question,
  answer,
  isFlagged,
  isSubmitted,
  isTrainingMode = false,
  isQuestionLocked = false,
  isCheckingTrainingAnswer = false,
  trainingFeedback,
  resultState,
  reviewState,
  onChangeAnswer,
  onToggleFlag,
  onConfirmTrainingAnswer,
}: ExamQuestionCardProps) {
  const notationLanguage = question.notationLanguage ?? "english";
  const numeralMode =
    question.numeralMode ?? (notationLanguage === "arabic" ? "eastern" : "western");

  const hasSvgSource = Boolean(
    question.attachedGeometryFigure || question.graphSpec || question.rawSvgMarkup
  );
  const hasFigure = hasSvgSource || Boolean(question.imageUrl);

  const isMcq =
    (question.answerMode === "mcq" || question.patternKind === "mcq") &&
    Array.isArray(question.mcqChoicesArabic) &&
    question.mcqChoicesArabic.length > 0;
  const isEssayPhoto =
    question.answerMode === "essay_photo" ||
    question.allowPhotoUpload === true;

  const pickedChoice = answer?.choiceIndex;
  const textVal = answer?.text ?? "";
  const isReadOnly = isSubmitted || (isTrainingMode && isQuestionLocked);
  const hasAnswer =
    pickedChoice !== undefined || Boolean(textVal.trim()) || Boolean(answer?.proofImageDataUrl);
  const effectiveIsCorrect = isSubmitted ? resultState?.isCorrect : trainingFeedback?.isCorrect;
  const effectiveCorrectIdx = isSubmitted
    ? reviewState?.correctMcqChoiceIndex
    : trainingFeedback?.correctMcqChoiceIndex;
  const showInstantResult = isSubmitted || (isTrainingMode && isQuestionLocked && Boolean(trainingFeedback));

  const borderClass = !showInstantResult
    ? "border-slate-200 dark:border-slate-800"
    : resultState?.pendingTeacherReview
      ? "border-2 border-amber-400 bg-amber-50/20 dark:bg-amber-950/15"
      : effectiveIsCorrect
        ? "border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/15"
        : "border-2 border-rose-500 bg-rose-50/20 dark:bg-rose-950/15";

  const figureAspect = question.attachedGeometryFigure
    ? computeFigureAspectFromVertices(question.attachedGeometryFigure.vertices)
    : 1.45;
  const cardWidthPx = 285;
  const cardHeightPx = Math.max(150, Math.min(220, Math.round(cardWidthPx / figureAspect)));
  const modalWidthPx = 310;
  const modalHeightPx = Math.max(170, Math.min(245, Math.round(modalWidthPx / figureAspect)));

  const renderSvgBox = (widthPx: number, heightPx: number) =>
    hasSvgSource
      ? renderQuestionFigureSvg(question, { widthPx, heightPx, numeralMode, notationLanguage, backgroundColorHex: "#FFFFFF", strokeColorHex: "#0F172A", accentColorHex: "#0D9488" })
      : null;
  const cardSvg = renderSvgBox(cardWidthPx, cardHeightPx);
  const modalSvg = renderSvgBox(modalWidthPx, modalHeightPx);

  return (
    <div key={question.questionId} className={`exam-pop p-5 rounded-3xl bg-white dark:bg-[#111827] border ${borderClass} shadow-sm space-y-4`}>
      <div className="flex items-center justify-between gap-2 text-xs font-black">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200">
            السؤال {question.displayOrderNumber}
          </span>
          {showInstantResult && (
            <span
              className={`px-2.5 py-1 rounded-xl ${
                resultState?.pendingTeacherReview
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                  : effectiveIsCorrect
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200"
              }`}
            >
              {resultState?.pendingTeacherReview
                ? "⏳ بانتظار تصحيح المعلم"
                : effectiveIsCorrect
                  ? "✓ إجابة صحيحة"
                  : "✗ إجابة خاطئة"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">{question.allocatedMarks} درجات</span>
          {!isReadOnly && (
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

      <div className={hasFigure ? "grid grid-cols-1 sm:grid-cols-12 gap-3 items-center" : "block"}>
        <div className={hasFigure ? "sm:col-span-7 space-y-2 text-sm font-bold leading-relaxed text-slate-900 dark:text-slate-100" : "space-y-2 text-sm font-bold leading-relaxed text-slate-900 dark:text-slate-100"}>
          <SafeKaTeXBiDiMathRenderer text={question.promptArabic} numeralMode={numeralMode} notationLanguage={notationLanguage} />
          {(question.givenDataArabic?.length || question.requiredToProveOrFindArabic) && (
            <QuestionGivenRequiredBadges
              givenDataAr={question.givenDataArabic?.join(" ، ")}
              requiredToFindAr={question.requiredToProveOrFindArabic}
              primaryHex="#312E81"
              secondaryHex="#0D9488"
              softSurfaceHex="#F8FAFC"
              solvedBorderHex="#99F6E4"
              numeralMode={numeralMode}
              notationLanguage={notationLanguage}
            />
          )}
        </div>
        {hasFigure && (
          <ExamQuestionFigurePanel
            questionNumber={question.displayOrderNumber}
            cardSvg={cardSvg}
            modalSvg={modalSvg}
            imageUrl={question.imageUrl}
          />
        )}
      </div>

      {isMcq && question.mcqChoicesArabic ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.mcqChoicesArabic.map((choice, cIdx) => {
            const isPicked = pickedChoice === cIdx;
            const isCorrectChoice = showInstantResult && effectiveCorrectIdx === cIdx;
            const isWrongPicked = showInstantResult && isPicked && !effectiveIsCorrect;

            let btnStyle = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200";
            if (!showInstantResult && isPicked) {
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
                disabled={isReadOnly}
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);
                  onChangeAnswer({ choiceIndex: cIdx });
                }}
                className={`min-h-[48px] px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-black transition-all flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${btnStyle}`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center text-[11px]">
                    {ARABIC_CHOICE_LETTERS[cIdx] ?? cIdx + 1}
                  </span>
                  <SafeKaTeXBiDiMathRenderer text={choice} numeralMode={numeralMode} notationLanguage={notationLanguage} />
                </span>
                {isCorrectChoice && <span>✓</span>}
                {isWrongPicked && <span>✗</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2.5">
          {isEssayPhoto && (
            <StudentProofPhotoCaptureBox
              imageDataUrl={answer?.proofImageDataUrl}
              rotationDeg={answer?.proofImageRotationDeg}
              deletedAfterGrading={answer?.proofImageDeletedAfterGrading}
              isSubmitted={isReadOnly}
              onUpdatePhoto={(photoPatch) => onChangeAnswer(photoPatch)}
            />
          )}
          <input
            type="text"
            disabled={isReadOnly}
            value={textVal}
            onChange={(e) => onChangeAnswer({ text: e.target.value })}
            placeholder={
              isEssayPhoto
                ? "اكتب ملاحظة أو الناتج النهائي (اختياري مع صورة الحل)..."
                : "اكتب الناتج النهائي أو الإجابة القصيرة هنا..."
            }
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 disabled:opacity-80"
          />
          {!isReadOnly && question.attachedGeometryFigure?.coordinateGrid?.enabled && (
            <ExamCoordinateAnswerDrawer
              quadrantMode={question.attachedGeometryFigure.coordinateGrid.quadrantMode}
              notationLanguage={notationLanguage}
              numeralMode={numeralMode}
              onInsertAnswerText={(coords) => onChangeAnswer({ text: (textVal ? `${textVal} ` : "") + coords })}
            />
          )}
          {!isReadOnly && (
            <StudentVirtualMathKeypad
              onInsertSymbol={(sym) => onChangeAnswer({ text: textVal + sym })}
              onClear={() => onChangeAnswer({ text: "" })}
            />
          )}
        </div>
      )}

      <ExamQuestionTrainingFeedbackBox
        isTrainingMode={isTrainingMode}
        isQuestionLocked={isQuestionLocked}
        isSubmitted={isSubmitted}
        hasAnswer={hasAnswer}
        isCheckingTrainingAnswer={isCheckingTrainingAnswer}
        trainingFeedback={trainingFeedback}
        resultState={resultState}
        reviewState={reviewState}
        numeralMode={numeralMode}
        notationLanguage={notationLanguage}
        onConfirmTrainingAnswer={onConfirmTrainingAnswer}
      />
    </div>
  );
}
