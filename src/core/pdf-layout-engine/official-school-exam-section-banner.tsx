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
    <div className="w-full my-1.5 px-3 py-1.5 rounded-lg bg-slate-100 print:bg-slate-100 border-r-4 border-indigo-950 text-slate-900 flex items-center justify-between break-inside-avoid print:break-inside-avoid shadow-2xs">
      <span className="text-xs sm:text-sm font-black italic print:text-[13pt] text-indigo-950">
        السؤال {sectionOrdinalArabic} : {sectionTitleArabic}
      </span>
      <span className="text-xs font-bold font-mono text-slate-700">
        ({formatNumeralsByModeSSOT(questionsCount, numeralMode)} {countLabel})
      </span>
    </div>
  );
}
