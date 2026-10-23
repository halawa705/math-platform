"use client";

/**
 * @file pdf-numeral-system-switch.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): التبديل اللحظي بين الأرقام العربية الغربية (0-9)
 * والأرقام الهندية المشرقية (٠-٩) داخل معاينة وطباعة الـ PDF.
 * ترتبط حصرياً بـ `pdf-print-settings-ssot.ts` و `numeral-and-unit-ssot.ts`.
 */

import React from "react";
import type { NumeralDisplayMode } from "@/core/ssot/numeral-and-unit-ssot";

export interface PDFNumeralSystemSwitchProps {
  readonly currentMode: NumeralDisplayMode;
  readonly onChangeMode: (nextMode: NumeralDisplayMode) => void;
}

export default function PDFNumeralSystemSwitch({
  currentMode,
  onChangeMode,
}: PDFNumeralSystemSwitchProps) {
  return (
    <div
      className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-0.5 text-xs font-bold"
      title="تبديل نظام الأرقام في المذكرة أو الامتحان المطبوع"
    >
      <button
        type="button"
        onClick={() => onChangeMode("eastern")}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          currentMode === "eastern"
            ? "bg-indigo-700 text-white shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        أرقام مشرقية (١٢٣)
      </button>
      <button
        type="button"
        onClick={() => onChangeMode("western")}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          currentMode === "western"
            ? "bg-indigo-700 text-white shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        أرقام غربية (123)
      </button>
    </div>
  );
}
