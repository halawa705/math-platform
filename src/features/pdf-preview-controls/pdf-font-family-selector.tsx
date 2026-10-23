"use client";

/**
 * @file pdf-font-family-selector.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): اختيار نوع الخط المطبعي لورقة الـ A4 PDF
 * (خط المراعي Almarai، خط كايرو Cairo، آي بي إم بلكس IBM Plex، ريدكس برو Readex Pro، تجوال Tajawal).
 * ترتبط حصرياً بـ `PRINT_FONT_FAMILIES_SSOT` في `pdf-print-settings-ssot.ts`.
 */

import React from "react";
import {
  PRINT_FONT_FAMILIES_SSOT,
  type PrintFontFamilyId,
} from "@/core/ssot/pdf-print-settings-ssot";

export interface PDFFontFamilySelectorProps {
  readonly selectedFontId: PrintFontFamilyId;
  readonly onSelectFont: (fontId: PrintFontFamilyId) => void;
}

export default function PDFFontFamilySelector({
  selectedFontId,
  onSelectFont,
}: PDFFontFamilySelectorProps) {
  const fontsList = Object.values(PRINT_FONT_FAMILIES_SSOT);

  return (
    <div className="inline-flex items-center gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
        نوع الخط:
      </label>
      <select
        value={selectedFontId}
        onChange={(e) => onSelectFont(e.target.value as PrintFontFamilyId)}
        className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 cursor-pointer"
      >
        {fontsList.map((font) => (
          <option key={font.id} value={font.id}>
            {font.nameArabic}
          </option>
        ))}
      </select>
    </div>
  );
}
