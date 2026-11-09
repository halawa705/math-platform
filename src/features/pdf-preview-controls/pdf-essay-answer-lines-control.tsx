"use client";

/**
 * @file pdf-essay-answer-lines-control.tsx
 * @description خاصية ذرية مستقلة لاختيار عدد سطور إجابة المقالي والبرهان بحرية تامة (+ / - أو كتابة مباشرة)
 * دون خيارات مسبقة حاصرة، مع التنظيم التلقائي للمساحة في ورقة الـ A4 المطبوعة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 95 سطراً).
 */

import React from "react";

export const MODULE_ID_PDF_ESSAY_ANSWER_LINES_CONTROL =
  "pdf_essay_answer_lines_control" as const;

export interface PDFEssayAnswerLinesControlProps {
  readonly currentCount?: number;
  readonly onChangeCount: (count: number) => void;
  readonly disabled?: boolean;
}

export default function PDFEssayAnswerLinesControl({
  currentCount = 3,
  onChangeCount,
  disabled = false,
}: PDFEssayAnswerLinesControlProps) {
  const safeVal = Math.max(0, currentCount);

  const handleStep = (delta: number) => {
    onChangeCount(Math.max(0, safeVal + delta));
  };

  const labelText =
    safeVal === 0
      ? "بدون أسطر (توفير ورق)"
      : safeVal === 1
        ? "سطر إجابة واحد"
        : safeVal === 2
          ? "سطران للإجابة"
          : `${safeVal} أسطر إجابة`;

  return (
    <div className="inline-flex items-center gap-2 flex-wrap text-xs">
      <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
        <span>📝</span>
        <span>سطور المقالي:</span>
      </span>

      <div className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={disabled || safeVal <= 0}
          className="w-8 h-8 flex items-center justify-center font-black text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
          title="إنقاص سطر"
        >
          -
        </button>

        <input
          type="number"
          min={0}
          max={100}
          disabled={disabled}
          value={safeVal}
          onChange={(e) => onChangeCount(Math.max(0, parseInt(e.target.value || "0", 10)))}
          className="w-12 h-8 text-center font-black text-xs bg-transparent border-x border-slate-200 dark:border-slate-700 focus:outline-none disabled:opacity-40"
          title="اكتب عدد السطور بحرية (0 أو أكثر)"
        />

        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={disabled}
          className="w-8 h-8 flex items-center justify-center font-black text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
          title="زيادة سطر"
        >
          +
        </button>
      </div>

      <span className="text-[10.5px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 px-2 py-0.5 rounded-lg">
        {labelText}
      </span>

      <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500">
        (MCQ = صفر تلقائياً)
      </span>
    </div>
  );
}
