"use client";

/**
 * @file pdf-notation-direction-switch.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): التبديل بين الرموز الرياضية العربية (س، ص، د(س)، أ ب جـ)
 * والرموز الإنجليزية (x, y, f(x), A B C) للمدارس الرسمية واللغات.
 */

import React from "react";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";

export interface PDFNotationDirectionSwitchProps {
  readonly currentNotation: MathNotationLanguage;
  readonly onChangeNotation: (notation: MathNotationLanguage) => void;
}

export default function PDFNotationDirectionSwitch({
  currentNotation,
  onChangeNotation,
}: PDFNotationDirectionSwitchProps) {
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-0.5 text-xs font-bold">
      <button
        type="button"
        onClick={() => onChangeNotation("arabic")}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          currentNotation === "arabic"
            ? "bg-indigo-700 text-white shadow-xs"
            : "text-slate-600 dark:text-slate-400"
        }`}
      >
        رموز عربية (س، ص، أ ب جـ)
      </button>
      <button
        type="button"
        onClick={() => onChangeNotation("english")}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          currentNotation === "english"
            ? "bg-indigo-700 text-white shadow-xs"
            : "text-slate-600 dark:text-slate-400"
        }`}
      >
        رموز لغات (x, y, ABC)
      </button>
    </div>
  );
}
