"use client";

/**
 * @file pdf-exact-fontsize-control.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): التحكم الدقيق في حجم الخط الحقيقي بالـ Point الطباعي
 * (`12pt`, `12.5pt`, `13pt`, `13.5pt`, `14pt`, `15pt`, `16pt`) مع ضمان عدم النزول عن 12pt لراحة عين الطالب.
 */

import React from "react";
import type { ExactPrintFontSizePt } from "@/core/ssot/pdf-print-settings-ssot";

export interface PDFExactFontSizeControlProps {
  readonly currentSizePt: ExactPrintFontSizePt;
  readonly onChangeSizePt: (sizePt: ExactPrintFontSizePt) => void;
}

const ALLOWED_FONT_SIZES_PT: readonly ExactPrintFontSizePt[] = [
  12, 12.5, 13, 13.5, 14, 15, 16,
];

export default function PDFExactFontSizeControl({
  currentSizePt,
  onChangeSizePt,
}: PDFExactFontSizeControlProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
        حجم الخط الحقيقي:
      </span>
      <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-0.5 text-xs font-bold">
        {ALLOWED_FONT_SIZES_PT.map((pt) => (
          <button
            key={pt}
            type="button"
            onClick={() => onChangeSizePt(pt)}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              currentSizePt === pt
                ? "bg-indigo-700 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {pt}pt
          </button>
        ))}
      </div>
    </div>
  );
}
