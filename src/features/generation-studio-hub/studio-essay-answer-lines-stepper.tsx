"use client";

/**
 * @file studio-essay-answer-lines-stepper.tsx
 * @description مكون ذري مستقل للتحكم في عدد سطور مساحة إجابة أسئلة المقالي والبرهان
 * (حتمي: تسري حصراً على الأسئلة المقالية وتكون صفراً تلقائياً لأسئلة الاختيار من متعدد).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطور).
 */

import React from "react";

export const MODULE_ID_STUDIO_ESSAY_ANSWER_LINES_STEPPER =
  "studio_essay_answer_lines_stepper" as const;

export interface StudioEssayAnswerLinesStepperProps {
  readonly value: number;
  readonly onChange: (count: number) => void;
  readonly labelAr?: string;
  readonly compact?: boolean;
}

const LINE_PRESETS = [0, 2, 3, 4, 6] as const;

export default function StudioEssayAnswerLinesStepper({
  value,
  onChange,
  labelAr = "سطور إجابة المقالي",
  compact = false,
}: StudioEssayAnswerLinesStepperProps) {
  const safeCount = Math.max(0, Math.min(20, value ?? 3));

  const handleStep = (delta: number) => {
    onChange(Math.max(0, Math.min(20, safeCount + delta)));
  };

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 ${compact ? "p-2 space-y-1.5" : "p-2.5 space-y-2"}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs">📝</span>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
            {labelAr}:
          </span>
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
            safeCount === 0
              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              : "bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300"
          }`}>
            {safeCount === 0 ? "بدون أسطر" : `${safeCount} ${safeCount === 1 ? "سطر" : safeCount === 2 ? "سطران" : "سطور"}`}
          </span>
        </div>

        {/* أزرار الزيادة والنقصان */}
        <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={safeCount <= 0}
            className="w-8 h-8 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
            title="تقليل سطر"
          >
            -
          </button>
          <input
            type="number"
            min={0}
            max={20}
            value={safeCount}
            onChange={(e) => onChange(Math.max(0, Math.min(20, parseInt(e.target.value || "0", 10))))}
            className="w-10 h-8 text-center font-black text-xs bg-transparent border-x border-slate-200 dark:border-slate-700 focus:outline-none"
            title="عدد السطور المباشر"
          />
          <button
            type="button"
            onClick={() => handleStep(1)}
            disabled={safeCount >= 20}
            className="w-8 h-8 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
            title="زيادة سطر"
          >
            +
          </button>
        </div>
      </div>

      {/* خيارات سريعة وتنويه استثناء MCQ */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap pt-0.5">
        <div className="flex items-center gap-1">
          {LINE_PRESETS.map((cnt) => (
            <button
              key={cnt}
              type="button"
              onClick={() => onChange(cnt)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-black cursor-pointer transition-all ${
                safeCount === cnt
                  ? "bg-teal-700 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cnt === 0 ? "بدون" : `${cnt}س`}
            </button>
          ))}
        </div>

        <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500">
          🔒 للمقالي فقط (اختر = 0)
        </span>
      </div>
    </div>
  );
}
