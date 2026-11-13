"use client";

/**
 * @file exam-question-card.tsx
 * @description بطاقة سؤال واحد في الاختبار الإلكتروني للطالب (نص + شكل متجهي + بدائل أو إجابة قصيرة + حالة المراجعة بعد التسليم).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import { useState } from "react";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import StudentVirtualMathKeypad from "@/features/electronic-exams-hub/student-virtual-math-keypad";
import { renderQuestionFigureSvg } from "@/core/pdf-layout-engine/question-figure-svg-renderer";
import { computeFigureAspectFromVertices } from "@/core/pdf-layout-engine/question-figure-box-size";
import { QuestionGivenRequiredBadges } from "@/core/pdf-layout-engine/question-given-required-badges";
import type { PublishedExamQuestionItem } from "@/features/electronic-exams-hub/published-online-exams-store";
import type { OnlineQuestionResult, StudentAnswerInput } from "@/core/exam-grading/online-exam-grader";
import { ARABIC_CHOICE_LETTERS } from "@/core/ssot/numeral-and-unit-ssot";
import type { ExamQuestionReviewInfo } from "./use-exam-session";
import ExamQuestionFigureZoomModal from "./exam-question-figure-zoom-modal";
import StudentProofPhotoCaptureBox from "./student-proof-photo-capture-box";

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
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

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

  const borderClass = !isSubmitted
    ? "border-slate-200 dark:border-slate-800"
    : resultState?.pendingTeacherReview
      ? "border-2 border-amber-400 bg-amber-50/20 dark:bg-amber-950/15"
      : resultState?.isCorrect
        ? "border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/15"
        : "border-2 border-rose-500 bg-rose-50/20 dark:bg-rose-950/15";

  const figureAspect = question.attachedGeometryFigure
    ? computeFigureAspectFromVertices(question.attachedGeometryFigure.vertices)
    : 1.45;
  const cardWidthPx = 285;
  const cardHeightPx = Math.max(150, Math.min(220, Math.round(cardWidthPx / figureAspect)));
  const modalWidthPx = 310;
  const modalHeightPx = Math.max(170, Math.min(245, Math.round(modalWidthPx / figureAspect)));

  const cardSvg = hasSvgSource
    ? renderQuestionFigureSvg(question, {
        widthPx: cardWidthPx,
        heightPx: cardHeightPx,
        numeralMode,
        notationLanguage,
        backgroundColorHex: "#FFFFFF",
        strokeColorHex: "#0F172A",
        accentColorHex: "#0D9488",
      })
    : null;

  const modalSvg = hasSvgSource
    ? renderQuestionFigureSvg(question, {
        widthPx: modalWidthPx,
        heightPx: modalHeightPx,
        numeralMode,
        notationLanguage,
        backgroundColorHex: "#FFFFFF",
        strokeColorHex: "#0F172A",
        accentColorHex: "#0D9488",
      })
    : null;

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
                resultState.pendingTeacherReview
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                  : resultState.isCorrect
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200"
              }`}
            >
              {resultState.pendingTeacherReview
                ? "⏳ بانتظار تصحيح المعلم"
                : resultState.isCorrect
                  ? "✓ إجابة صحيحة"
                  : "✗ إجابة خاطئة"}
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
        {hasFigure && (cardSvg || question.imageUrl) && (
          <div className="sm:col-span-5 max-w-full flex flex-col items-center">
            {cardSvg ? (
              <div
                onClick={() => setIsZoomModalOpen(true)}
                className="w-full max-w-full overflow-hidden p-2.5 rounded-2xl bg-white text-slate-900 border-2 border-indigo-200 dark:border-teal-400/70 flex justify-center cursor-pointer shadow-sm hover:border-indigo-400 transition [&>svg]:max-w-full [&>svg]:h-auto"
                title="انقر لتكبير الرسم وعرضه بدقة عالية"
                dangerouslySetInnerHTML={{ __html: cardSvg }}
              />
            ) : question.imageUrl ? (
              <div
                onClick={() => setIsZoomModalOpen(true)}
                className="w-full max-w-full overflow-hidden p-2 rounded-2xl bg-white border-2 border-indigo-200 dark:border-teal-400/70 flex justify-center cursor-pointer shadow-sm"
                title="انقر لتكبير الصورة التوضيحية"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={question.imageUrl} alt={`رسم السؤال ${question.displayOrderNumber}`} className="max-h-48 w-auto object-contain rounded-xl" />
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(true)}
              className="mt-1.5 text-[11px] font-black text-indigo-700 dark:text-teal-300 flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span>🔍</span>
              <span>تكبير الرسم الهندسي / البياني</span>
            </button>
          </div>
        )}
      </div>

      {isZoomModalOpen && (modalSvg || question.imageUrl) && (
        <ExamQuestionFigureZoomModal
          questionNumber={question.displayOrderNumber}
          modalSvg={modalSvg}
          fallbackImageUrl={question.imageUrl}
          onClose={() => setIsZoomModalOpen(false)}
        />
      )}

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
              isSubmitted={isSubmitted}
              onUpdatePhoto={(photoPatch) => onChangeAnswer(photoPatch)}
            />
          )}
          <input
            type="text"
            disabled={isSubmitted}
            value={textVal}
            onChange={(e) => onChangeAnswer({ text: e.target.value })}
            placeholder={
              isEssayPhoto
                ? "اكتب ملاحظة أو الناتج النهائي (اختياري مع صورة الحل)..."
                : "اكتب الناتج النهائي أو الإجابة القصيرة هنا..."
            }
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

      {isSubmitted && resultState?.teacherFeedback && (
        <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-950 dark:text-indigo-200">
          📝 تعليق المعلم ({resultState.earnedMarks}/{resultState.allocatedMarks}): {resultState.teacherFeedback}
        </div>
      )}

      {isSubmitted && reviewState && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="font-black text-teal-800 dark:text-teal-300">
            💡 الإجابة النموذجية: <SafeKaTeXBiDiMathRenderer text={reviewState.finalAnswerArabic} numeralMode={numeralMode} notationLanguage={notationLanguage} />
          </div>
          {reviewState.modelSolutionStepsArabic.length > 0 && (
            <div className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
              <SafeKaTeXBiDiMathRenderer text={reviewState.modelSolutionStepsArabic.join(" — ")} numeralMode={numeralMode} notationLanguage={notationLanguage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
