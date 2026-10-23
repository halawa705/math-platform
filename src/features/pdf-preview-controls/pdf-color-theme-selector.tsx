"use client";

/**
 * @file pdf-color-theme-selector.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): اختيار السمة اللونية للورقة المطبوعة
 * (`royal_indigo` نيلي ملكي، `math_teal` فيروزي أكاديمي، `photocopy_black` أسود حاد لماكينات التصوير الليزرية).
 */

import type { PrintColorThemeId } from "@/core/ssot/pdf-print-settings-ssot";

export interface PDFColorThemeSelectorProps {
  readonly currentThemeId: PrintColorThemeId;
  readonly onChangeThemeId: (themeId: PrintColorThemeId) => void;
}

const PRINT_THEMES: readonly { readonly id: PrintColorThemeId; readonly label: string }[] = [
  { id: "royal_indigo", label: "نيلي ملكي" },
  { id: "math_teal", label: "فيروزي أكاديمي" },
  { id: "photocopy_black", label: "أسود نقي (تصوير سناتر)" },
];

export default function PDFColorThemeSelector({
  currentThemeId,
  onChangeThemeId,
}: PDFColorThemeSelectorProps) {
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-0.5 text-xs font-bold">
      {PRINT_THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onChangeThemeId(theme.id)}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            currentThemeId === theme.id
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          {theme.label}
        </button>
      ))}
    </div>
  );
}
