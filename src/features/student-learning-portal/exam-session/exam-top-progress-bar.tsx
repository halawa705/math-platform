"use client";

/**
 * @file exam-top-progress-bar.tsx
 * @description شريط التقدم العلوي الثابت للاختبار الإلكتروني: يعرض «س ٣ من ١٠» وشريط التقدم والمؤقت التنازلي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import { formatNumeralsByModeSSOT } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_EXAM_TOP_PROGRESS_BAR =
  "exam_top_progress_bar" as const;

export interface ExamTopProgressBarProps {
  readonly examTitleAr: string;
  readonly currentIndex: number;
  readonly totalQuestions: number;
  readonly answeredCount: number;
  readonly remainingSeconds: number;
  readonly isSubmitted: boolean;
}

export default function ExamTopProgressBar({
  examTitleAr,
  currentIndex,
  totalQuestions,
  answeredCount,
  remainingSeconds,
  isSubmitted,
}: ExamTopProgressBarProps) {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const isUrgent = remainingSeconds <= 180 && !isSubmitted;
  const progressPct =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="sticky top-2 z-20 p-3.5 rounded-3xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
            {examTitleAr}
          </h3>
          <p className="text-[11px] font-extrabold text-indigo-800 dark:text-teal-300">
            س {formatNumeralsByModeSSOT(currentIndex + 1, "eastern")} من{" "}
            {formatNumeralsByModeSSOT(totalQuestions, "eastern")} • أجبت على{" "}
            {formatNumeralsByModeSSOT(answeredCount, "eastern")}
          </p>
        </div>

        {!isSubmitted && (
          <div
            className={`px-3 py-1.5 rounded-2xl border text-xs font-black flex items-center gap-1.5 ${
              isUrgent
                ? "bg-rose-600 border-rose-500 text-white animate-pulse"
                : "bg-indigo-950 border-indigo-800 text-white"
            }`}
          >
            <span>⏱️</span>
            <span className="font-mono tracking-wider">
              {formatNumeralsByModeSSOT(formattedTime, "eastern")}
            </span>
          </div>
        )}
      </div>

      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-l from-teal-500 to-indigo-600 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
