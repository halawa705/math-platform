"use client";

/**
 * @file studio-question-solution-lines-controller.tsx
 * @description أداة التحكم التفاعلية الفورية في عدد سطور الحل المخصصة للسؤال والخط المنقط الفاصل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import React from "react";

export interface StudioQuestionSolutionLinesControllerProps {
  readonly answerLinesCount: number;
  readonly hasDottedDivider: boolean;
  readonly onChangeLinesCount: (nextCount: number) => void;
  readonly onChangeHasDottedDivider: (hasDivider: boolean) => void;
}

export default function StudioQuestionSolutionLinesController({
  answerLinesCount,
  hasDottedDivider,
  onChangeLinesCount,
  onChangeHasDottedDivider,
}: StudioQuestionSolutionLinesControllerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-black text-slate-700 dark:text-slate-200 flex items-center gap-1">
          <span>📝</span>
          <span>سطور مساحة الحل:</span>
        </span>

        {/* Stepper buttons - and + مع إدخال رقمي حر */}
        <div className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => onChangeLinesCount(Math.max(0, answerLinesCount - 1))}
            className="w-7 h-7 flex items-center justify-center font-black text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="تقليل سطر"
          >
            -
          </button>
          <input
            type="number"
            min={0}
            max={100}
            value={answerLinesCount}
            onChange={(e) => onChangeLinesCount(Math.max(0, Number(e.target.value) || 0))}
            className="w-12 h-7 text-center font-black text-xs bg-transparent border-x border-slate-300 dark:border-slate-600 focus:outline-none"
            title="اكتب عدد السطور بحرية (0 أو أكثر)"
          />
          <button
            type="button"
            onClick={() => onChangeLinesCount(answerLinesCount + 1)}
            className="w-7 h-7 flex items-center justify-center font-black text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="زيادة سطر"
          >
            +
          </button>
        </div>

        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {answerLinesCount === 0 ? "(بدون سطور)" : `(${answerLinesCount} سطر)`}
        </span>
      </div>

      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-bold">
        <input
          type="checkbox"
          checked={hasDottedDivider}
          onChange={(e) => onChangeHasDottedDivider(e.target.checked)}
          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
        <span>خط منقط فاصل</span>
      </label>
    </div>
  );
}
