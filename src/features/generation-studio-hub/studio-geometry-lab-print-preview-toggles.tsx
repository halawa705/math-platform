"use client";

/**
 * @file studio-geometry-lab-print-preview-toggles.tsx
 * @description أزرار تبديل ذرية مستقلة لمعاينة الطباعة الليزرية (أبيض وأسود + نقوش التهشير)
 * وسُمك خطوط المرحلة الابتدائية داخل معمل الأشكال الهندسية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 60 سطراً).
 */

export const MODULE_ID_STUDIO_GEOMETRY_LAB_PRINT_PREVIEW_TOGGLES =
  "studio_geometry_lab_print_preview_toggles" as const;

export interface StudioGeometryLabPrintPreviewTogglesProps {
  readonly monochromePrintSafe: boolean;
  readonly primaryStrokeBoost: boolean;
  readonly onToggleMonochrome: () => void;
  readonly onTogglePrimaryStroke: () => void;
}

export default function StudioGeometryLabPrintPreviewToggles({
  monochromePrintSafe,
  primaryStrokeBoost,
  onToggleMonochrome,
  onTogglePrimaryStroke,
}: StudioGeometryLabPrintPreviewTogglesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggleMonochrome}
        aria-pressed={monochromePrintSafe}
        className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-black cursor-pointer transition-colors ${
          monochromePrintSafe
            ? "bg-slate-900 border-slate-900 text-white shadow-xs"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
        }`}
      >
        🖨️ معاينة ليزرية (أبيض وأسود + نقوش التهشير)
      </button>
      <button
        type="button"
        onClick={onTogglePrimaryStroke}
        aria-pressed={primaryStrokeBoost}
        className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-black cursor-pointer transition-colors ${
          primaryStrokeBoost
            ? "bg-teal-700 border-teal-700 text-white shadow-xs"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
        }`}
      >
        ✏️ سُمك خطوط الابتدائي (15pt / 1.35×)
      </button>
    </div>
  );
}
