"use client";

/**
 * @file exam-question-figure-panel.tsx
 * @description عارض الرسم الهندسي/البياني أو الصورة التوضيحية داخل بطاقة السؤال مع نافذة التكبير.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 80 سطراً).
 */

import { useState } from "react";
import ExamQuestionFigureZoomModal from "./exam-question-figure-zoom-modal";

export const MODULE_ID_EXAM_QUESTION_FIGURE_PANEL = "exam_question_figure_panel" as const;

export interface ExamQuestionFigurePanelProps {
  readonly questionNumber: number;
  readonly cardSvg: string | null;
  readonly modalSvg: string | null;
  readonly imageUrl?: string;
}

export default function ExamQuestionFigurePanel({
  questionNumber,
  cardSvg,
  modalSvg,
  imageUrl,
}: ExamQuestionFigurePanelProps) {
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  if (!cardSvg && !imageUrl) return null;

  return (
    <>
      <div className="sm:col-span-5 max-w-full flex flex-col items-center">
        {cardSvg ? (
          <div
            onClick={() => setIsZoomModalOpen(true)}
            className="w-full max-w-full overflow-hidden p-2.5 rounded-2xl bg-white text-slate-900 border-2 border-indigo-200 dark:border-teal-400/70 flex justify-center cursor-pointer shadow-sm hover:border-indigo-400 transition [&>svg]:max-w-full [&>svg]:h-auto"
            title="انقر لتكبير الرسم وعرضه بدقة عالية"
            dangerouslySetInnerHTML={{ __html: cardSvg }}
          />
        ) : imageUrl ? (
          <div
            onClick={() => setIsZoomModalOpen(true)}
            className="w-full max-w-full overflow-hidden p-2 rounded-2xl bg-white border-2 border-indigo-200 dark:border-teal-400/70 flex justify-center cursor-pointer shadow-sm"
            title="انقر لتكبير الصورة التوضيحية"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`رسم السؤال ${questionNumber}`}
              className="max-h-48 w-auto object-contain rounded-xl"
            />
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

      {isZoomModalOpen && (modalSvg || imageUrl) && (
        <ExamQuestionFigureZoomModal
          questionNumber={questionNumber}
          modalSvg={modalSvg}
          fallbackImageUrl={imageUrl}
          onClose={() => setIsZoomModalOpen(false)}
        />
      )}
    </>
  );
}
