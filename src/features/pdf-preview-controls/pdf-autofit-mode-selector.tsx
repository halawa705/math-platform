"use client";

/**
 * @file pdf-autofit-mode-selector.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): اختيار وضع الملاءمة التلقائية للصفحات
 * (`booklet_fill` ملء الورقة تلقائياً، `exam_max_pages` حد أقصى لصفحات الاختبار، `off` يدوي).
 */

import type { PDFPrintSettingsStateSSOT } from "@/core/ssot/pdf-print-settings-ssot";
import type { AutoFitModeId } from "@/core/pdf-layout-engine/autofit-ladders";

export const MODULE_ID_PDF_AUTOFIT_MODE_SELECTOR =
  "pdf_autofit_mode_selector" as const;

export interface PDFAutoFitModeSelectorProps {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly onChange: (patch: Partial<PDFPrintSettingsStateSSOT>) => void;
}

const AUTOFIT_OPTIONS: readonly {
  readonly id: AutoFitModeId;
  readonly labelAr: string;
}[] = [
  { id: "booklet_fill", labelAr: "تلقائي — ملء الورقة" },
  { id: "exam_max_pages", labelAr: "اختبار — حد أقصى للصفحات" },
  { id: "off", labelAr: "يدوي" },
];

export default function PDFAutoFitModeSelector({
  settings,
  onChange,
}: PDFAutoFitModeSelectorProps) {
  const activeMode: AutoFitModeId = settings.autoFitMode ?? "booklet_fill";
  const targetMax = settings.targetMaxPages ?? 2;

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-0.5 text-xs font-bold gap-0.5">
        {AUTOFIT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() =>
              onChange({
                autoFitMode: opt.id,
                targetMaxPages: opt.id === "exam_max_pages" ? targetMax : undefined,
              })
            }
            className={`min-h-[44px] px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeMode === opt.id
                ? "bg-indigo-700 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {opt.labelAr}
          </button>
        ))}
      </div>

      {activeMode === "exam_max_pages" && (
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-xs font-black">
          <span className="text-slate-500">الحد الأقصى:</span>
          {([1, 2, 3] as const).map((pagesNum) => (
            <button
              key={pagesNum}
              type="button"
              onClick={() => onChange({ targetMaxPages: pagesNum })}
              className={`min-h-[44px] min-w-[36px] px-2 rounded-lg transition-all cursor-pointer ${
                targetMax === pagesNum
                  ? "bg-amber-600 text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {pagesNum} ص
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
