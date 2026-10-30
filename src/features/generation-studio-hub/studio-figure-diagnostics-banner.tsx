"use client";

/**
 * @file studio-figure-diagnostics-banner.tsx
 * @description صندوق تنبيه المعلم في الاستوديو عند وجود سطر رسم غير مفهوم في رد NotebookLM (G-5).
 */

export const MODULE_ID_STUDIO_FIGURE_DIAGNOSTICS_BANNER =
  "studio_figure_diagnostics_banner" as const;

export interface FigureDiagnosticRow {
  readonly questionNumber: number;
  readonly warnings: readonly string[];
}

export default function StudioFigureDiagnosticsBanner({
  rows,
}: {
  readonly rows: readonly FigureDiagnosticRow[];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="print:hidden p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
      {rows.map((r) => (
        <div key={r.questionNumber}>
          ⚠️ السؤال {r.questionNumber}: لم يُرسم الشكل كاملاً — {r.warnings.join(" ، ")}. عدّل سطر الرسم في رد NotebookLM ثم أعد التصيير.
        </div>
      ))}
    </div>
  );
}
