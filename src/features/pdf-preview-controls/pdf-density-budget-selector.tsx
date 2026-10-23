"use client";

/**
 * @file pdf-density-budget-selector.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): التحكم في كثافة استغلال المساحة وتوفير عدد الأوراق
 * (`ultra_compact` ضغط أقصى 92%+، `standard_balanced` متوازن، `booklet_relaxed` مريح للمذكرات).
 */

import React from "react";
import type { PageDensityBudgetMode } from "@/core/ssot/pdf-print-settings-ssot";

export interface PDFDensityBudgetSelectorProps {
  readonly currentDensity: PageDensityBudgetMode;
  readonly onChangeDensity: (density: PageDensityBudgetMode) => void;
}

const DENSITY_OPTIONS: readonly {
  readonly id: PageDensityBudgetMode;
  readonly label: string;
}[] = [
  { id: "ultra_compact", label: "⚡ ضغط أقصى (أقل عدد أوراق)" },
  { id: "standard_balanced", label: "⚖️ قياسي متوازن" },
  { id: "booklet_relaxed", label: "📖 مريح لمذكرات الشرح" },
];

export default function PDFDensityBudgetSelector({
  currentDensity,
  onChangeDensity,
}: PDFDensityBudgetSelectorProps) {
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-0.5 text-xs font-bold">
      {DENSITY_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChangeDensity(opt.id)}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            currentDensity === opt.id
              ? "bg-amber-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
