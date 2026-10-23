"use client";

/**
 * @file math-question-bank-filter-tab.tsx
 * @description تبويب بنك الأسئلة الرياضي المفلتر بالفروع الـ 11 ومهارات البرهان.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import React, { useState } from "react";
import { buildSampleHighDensityMathSheetQuestions } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";

export const MODULE_ID_MATH_QUESTION_BANK_FILTER_TAB =
  "math_question_bank_filter_tab" as const;

export default function MathQuestionBankFilterTab() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const allQuestions = buildSampleHighDensityMathSheetQuestions("arabic");

  const filtered =
    selectedFilter === "all"
      ? allQuestions
      : allQuestions.filter((q) => q.kind === selectedFilter);

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
          🗄️ بنك المسائل والنظريات المحققة ({filtered.length} مسائل جاهزة للطباعة)
        </span>
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "الكل" },
            { id: "mcq", label: "اختيار من متعدد" },
            { id: "essay_geometry", label: "براهين وهندسة" },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setSelectedFilter(btn.id)}
              className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-black cursor-pointer ${
                selectedFilter === btn.id
                  ? "bg-indigo-900 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((q) => (
          <div
            key={q.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-[11px] font-black">
                {q.branchBadgeAr}
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                {q.marks} درجات
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              <SafeKaTeXBiDiMathRenderer text={q.promptAr} />
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-black">الإجابة النموذجية: </span>
              <SafeKaTeXBiDiMathRenderer text={q.modelAnswerAr} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
