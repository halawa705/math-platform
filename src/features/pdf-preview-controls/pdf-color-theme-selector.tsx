"use client";

/**
 * @file pdf-color-theme-selector.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): اختيار السمة اللونية للورقة المطبوعة
 * (`royal_indigo` نيلي ملكي، `emerald_moasser` زمردي المعاصر، `math_teal` فيروزي أكاديمي،
 * `amber_gold` ذهبي المراجعات، `photocopy_black` أسود حاد لماكينات التصوير الليزرية).
 */

import type { PrintColorThemeId } from "@/core/ssot/pdf-print-settings-ssot";

export interface PDFColorThemeSelectorProps {
  readonly currentThemeId: PrintColorThemeId;
  readonly onChangeThemeId: (themeId: PrintColorThemeId) => void;
}

const PRINT_THEMES: readonly {
  readonly id: PrintColorThemeId;
  readonly label: string;
  readonly swatchHex: string;
}[] = [
  { id: "royal_indigo", label: "موف ملكي فاخر", swatchHex: "#4C1D95" },
  { id: "emerald_moasser", label: "أرجواني المعاصر", swatchHex: "#7E22CE" },
  { id: "math_teal", label: "ياقوتي أكاديمي", swatchHex: "#0369A1" },
  { id: "amber_gold", label: "ذهبي المراجعات", swatchHex: "#92400E" },
  { id: "photocopy_black", label: "أسود نقي (تصوير)", swatchHex: "#0F172A" },
];

export default function PDFColorThemeSelector({
  currentThemeId,
  onChangeThemeId,
}: PDFColorThemeSelectorProps) {
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-0.5 text-xs font-bold gap-0.5">
      {PRINT_THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onChangeThemeId(theme.id)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            currentThemeId === theme.id
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40"
            style={{ backgroundColor: theme.swatchHex }}
          />
          {theme.label}
        </button>
      ))}
    </div>
  );
}
