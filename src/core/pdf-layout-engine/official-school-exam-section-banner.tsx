"use client";

/**
 * @file official-school-exam-section-banner.tsx
 * @description شريط عنوان القسم لقالب الامتحان المدرسي الرسمي (السؤال الأول: اختر... / السؤال الثاني: أجب...)
 * بتصميم كتاب مدرسي فاخر (شارة ملونة متدرجة + إطار ملون واضح على أرضية بيضاء ناصعة #ffffff).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 75 سطراً).
 */

import React from "react";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_OFFICIAL_SCHOOL_EXAM_SECTION_BANNER =
  "official_school_exam_section_banner" as const;

export interface OfficialSchoolExamSectionBannerProps {
  readonly sectionOrdinalArabic: string;
  readonly sectionTitleArabic: string;
  readonly questionsCount: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly palette?: PrintThemePaletteTokens;
}

export function OfficialSchoolExamSectionBanner({
  sectionOrdinalArabic,
  sectionTitleArabic,
  questionsCount,
  numeralMode = "western",
  palette,
}: OfficialSchoolExamSectionBannerProps) {
  const countLabel =
    questionsCount > 2 && questionsCount <= 10 ? "أسئلة" : "سؤال";
  const primaryHex = palette?.primaryHex || "#1e3a8a";
  const accentHex = palette?.accentHex || "#0284c7";
  const headerGradient =
    palette?.headerGradientCss || "linear-gradient(135deg, #1E1B4B 0%, #1E3A8A 50%, #2563EB 100%)";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: `1.5px solid ${primaryHex}`,
        borderRight: `5px solid ${primaryHex}`,
        borderRadius: "8px",
        padding: "3px 8px",
        margin: "3px 0",
        boxShadow: `0 1.5px 0 ${primaryHex}22`,
      }}
      className="w-full bg-white text-slate-900 flex items-center justify-between gap-2 break-inside-avoid print:break-inside-avoid"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          style={{
            background: headerGradient,
            color: "#ffffff",
            borderRadius: "6px",
            padding: "1px 8px",
            boxShadow: `0 1.5px 0 ${primaryHex}`,
          }}
          className="text-xs font-black shrink-0"
        >
          ❖ السؤال {sectionOrdinalArabic}
        </span>
        <span style={{ color: primaryHex }} className="text-xs sm:text-sm font-black">
          {sectionTitleArabic}
        </span>
      </div>
      <span
        style={{
          backgroundColor: "#ffffff",
          border: `1.2px solid ${accentHex}`,
          color: primaryHex,
          borderRadius: "9999px",
          padding: "0.5px 8px",
        }}
        className="text-[10.5px] font-black font-mono shrink-0"
      >
        ({formatNumeralsByModeSSOT(questionsCount, numeralMode)} {countLabel})
      </span>
    </div>
  );
}
