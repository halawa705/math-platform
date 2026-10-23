"use client";

/**
 * @file pdf-columns-layout-toggle.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): التبديل بين تخطيط العمود الواحد وتخطيط العمودين المتوازيين
 * (Newspaper 2-Column Flow) الذي يضاعف سعة الصفحة الواحدة في الامتحانات والمراجعات.
 */

import type { PageColumnsLayoutMode } from "@/core/ssot/pdf-print-settings-ssot";

export interface PDFColumnsLayoutToggleProps {
  readonly columnsCount: PageColumnsLayoutMode;
  readonly showDivider: boolean;
  readonly onChangeColumns: (cols: PageColumnsLayoutMode) => void;
  readonly onToggleDivider: (show: boolean) => void;
}

export default function PDFColumnsLayoutToggle({
  columnsCount,
  showDivider,
  onChangeColumns,
  onToggleDivider,
}: PDFColumnsLayoutToggleProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-0.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => onChangeColumns(2)}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            columnsCount === 2
              ? "bg-indigo-700 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          عمودان (توفير مضاعف)
        </button>
        <button
          type="button"
          onClick={() => onChangeColumns(1)}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            columnsCount === 1
              ? "bg-indigo-700 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          عمود واحد
        </button>
      </div>
      {columnsCount === 2 && (
        <label className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={showDivider}
            onChange={(e) => onToggleDivider(e.target.checked)}
            className="rounded border-slate-300"
          />
          <span>خط فاصل</span>
        </label>
      )}
    </div>
  );
}
