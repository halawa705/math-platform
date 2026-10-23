"use client";

/**
 * @file student-mistake-analytics-breakdown.tsx
 * @description محلل أخطاء الطلاب حسب المفاهيم الرياضية والفرع لتوجيه المراجعات العلاجية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import React from "react";

export const MODULE_ID_STUDENT_MISTAKE_ANALYTICS_BREAKDOWN =
  "student_mistake_analytics_breakdown" as const;

export interface ConceptMasteryItem {
  readonly conceptTitleArabic: string;
  readonly branchNameArabic: string;
  readonly masteryPercent: number;
  readonly recommendationArabic: string;
}

const SAMPLE_MASTERY_ITEMS: readonly ConceptMasteryItem[] = [
  {
    conceptTitleArabic: "نظرية القطعة الواصلة بين منتصفي ضلعين في مثلث",
    branchNameArabic: "هندسة مستوية",
    masteryPercent: 96,
    recommendationArabic: "إتقان ممتاز للبرهان الاستدلالي والتوازي.",
  },
  {
    conceptTitleArabic: "علاقات المساقط العمودية ونظرية إقليدس",
    branchNameArabic: "هندسة مستوية",
    masteryPercent: 78,
    recommendationArabic: "يُنصح بمراجعة الفرق بين مربع الارتفاع ومربع ضلع القائمة.",
  },
];

export default function StudentMistakeAnalyticsBreakdown() {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
        📊 تحليل إتقان المفاهيم الرياضية والبرهان:
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SAMPLE_MASTERY_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-indigo-900 dark:text-teal-300">
                {item.branchNameArabic}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400">
                {item.masteryPercent}٪
              </span>
            </div>
            <div className="text-xs font-black text-slate-800 dark:text-slate-100">
              {item.conceptTitleArabic}
            </div>
            <p className="text-[11px] font-bold text-slate-500">
              {item.recommendationArabic}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
