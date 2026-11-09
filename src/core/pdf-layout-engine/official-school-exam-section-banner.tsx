"use client";

/**
 * @file official-school-exam-section-banner.tsx
 * @description شريط عنوان القسم لقالب الامتحان المدرسي الرسمي (السؤال الأول: اختر... / السؤال الثاني: أجب...).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 60 سطراً).
 */

import React from "react";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_OFFICIAL_SCHOOL_EXAM_SECTION_BANNER =
  "official_school_exam_section_banner" as const;

export interface OfficialSchoolExamSectionBannerProps {
  readonly sectionOrdinalArabic: string;
  readonly sectionTitleArabic: string;
  readonly questionsCount: number;
  readonly numeralMode?: NumeralDisplayMode;
}

export function OfficialSchoolExamSectionBanner({
  sectionOrdinalArabic,
  sectionTitleArabic,
  questionsCount,
  numeralMode = "western",
}: OfficialSchoolExamSectionBannerProps) {
  const countLabel =
    questionsCount > 2 && questionsCount <= 10 ? "أسئلة" : "سؤال";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        boxShadow: "0 1.5px 3px rgba(15, 23, 42, 0.05)",
      }}
      className="w-full my-1 px-2.5 py-1 rounded-md bg-white print:bg-white border border-slate-300 border-r-4 border-r-indigo-950 text-slate-900 flex items-center justify-between break-inside-avoid print:break-inside-avoid"
    >
      <span className="text-xs sm:text-sm font-black italic print:text-[12pt] text-indigo-950">
        السؤال {sectionOrdinalArabic} : {sectionTitleArabic}
      </span>
      <span className="text-[11px] font-bold font-mono text-slate-700">
        ({formatNumeralsByModeSSOT(questionsCount, numeralMode)} {countLabel})
      </span>
    </div>
  );
}
