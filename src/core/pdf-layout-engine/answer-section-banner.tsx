"use client";

/**
 * @file answer-section-banner.tsx
 * @description شريط عنوان فاصل رسمي لبداية كراسة الإجابة ونماذج الحل (لولي الأمر والمعلم) في الـ PDF.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 60 سطراً).
 */

import React from "react";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_ANSWER_SECTION_BANNER = "answer_section_banner" as const;

export interface AnswerSectionBannerProps {
  readonly titleArabic: string;
  readonly subtitleArabic?: string;
  readonly palette: PrintThemePaletteTokens;
}

export function AnswerSectionBanner({
  titleArabic,
  subtitleArabic,
  palette,
}: AnswerSectionBannerProps) {
  return (
    <div
      style={{
        background: palette.headerGradientCss,
        borderColor: palette.accentHex,
      }}
      className="w-full my-2 px-3 py-2 rounded-xl text-white flex flex-col items-center justify-center text-center shadow-xs break-inside-avoid print:break-inside-avoid border-2"
    >
      <div className="flex items-center justify-center gap-2 text-[1.05em] font-black tracking-wide">
        <span className="text-amber-300 select-none">★★★</span>
        <span>{titleArabic}</span>
        <span className="text-amber-300 select-none">★★★</span>
      </div>
      {subtitleArabic && (
        <span className="text-[0.78em] font-bold text-amber-100 opacity-95 mt-0.5">
          {subtitleArabic}
        </span>
      )}
    </div>
  );
}
