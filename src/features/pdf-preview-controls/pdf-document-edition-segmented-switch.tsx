"use client";

/**
 * @file pdf-document-edition-segmented-switch.tsx
 * @description مكون ذري مستقل (Micro-Feature): شريط التبديل السريع والبارز بين إصدار الطالب (أسئلة فقط)
 * وإصدار ولي الأمر / المعلم (الأسئلة بالإجابات النموذجية المميزة بلون مختلف).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import React from "react";
import type { DocumentAnswerVisibilityMode } from "@/core/ssot/pdf-print-settings-ssot";

export interface PDFDocumentEditionSegmentedSwitchProps {
  readonly currentMode: DocumentAnswerVisibilityMode;
  readonly onChangeMode: (nextMode: DocumentAnswerVisibilityMode) => void;
}

export default function PDFDocumentEditionSegmentedSwitch({
  currentMode,
  onChangeMode,
}: PDFDocumentEditionSegmentedSwitchProps) {
  const isStudent = currentMode === "questions_only";
  const isParent = currentMode === "questions_with_answers";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
      <div className="text-xs font-black text-slate-800 dark:text-slate-200 px-1.5 flex items-center gap-1.5 shrink-0">
        <span>📑</span>
        <span>إصدار المستند:</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onChangeMode("questions_only")}
          className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            isStudent
              ? "bg-indigo-900 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60"
          }`}
        >
          <span>👨‍🎓</span>
          <span>نسخة الطالب (أسئلة فقط)</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeMode("questions_with_answers")}
          className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            isParent
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60"
          }`}
        >
          <span>👨‍👩‍👧‍👦</span>
          <span>نسخة ولي الأمر (بالإجابات)</span>
        </button>
      </div>
    </div>
  );
}
