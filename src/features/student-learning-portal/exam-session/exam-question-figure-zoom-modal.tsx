"use client";

/**
 * @file exam-question-figure-zoom-modal.tsx
 * @description نافذة التكبير المنبثقة لعرض الشكل الهندسي أو الرسم البياني أو الصورة التوضيحية بدقة عالية في الاختبار الإلكتروني.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 70 سطراً).
 */

export const MODULE_ID_EXAM_QUESTION_FIGURE_ZOOM_MODAL =
  "exam_question_figure_zoom_modal" as const;

export interface ExamQuestionFigureZoomModalProps {
  readonly questionNumber: number;
  readonly modalSvg: string | null;
  readonly fallbackImageUrl?: string;
  readonly onClose: () => void;
}

export default function ExamQuestionFigureZoomModal({
  questionNumber,
  modalSvg,
  fallbackImageUrl,
  onClose,
}: ExamQuestionFigureZoomModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xl space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">📐</span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              رسم توضيحي — السؤال {questionNumber}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs flex items-center justify-center hover:bg-slate-200 cursor-pointer"
          >
            ✕
          </button>
        </div>
        {modalSvg ? (
          <div
            className="p-3 sm:p-4 rounded-2xl bg-white text-slate-900 border-2 border-indigo-200 dark:border-teal-400/70 flex items-center justify-center overflow-x-auto min-h-[260px] shadow-sm [&>svg]:w-full [&>svg]:max-w-[520px] [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: modalSvg }}
          />
        ) : fallbackImageUrl ? (
          <div className="p-3 rounded-2xl bg-white border-2 border-indigo-200 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fallbackImageUrl}
              alt={`رسم السؤال ${questionNumber}`}
              className="max-w-full max-h-[65vh] object-contain rounded-xl"
            />
          </div>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black cursor-pointer shadow-sm"
        >
          ✓ العودة لحل السؤال
        </button>
      </div>
    </div>
  );
}
