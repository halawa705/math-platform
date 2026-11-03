"use client";

/**
 * @file official-school-exam-page-chrome.tsx
 * @description عناصر ترويسة وتذييل وعلامات زوايا قالب الامتحان المدرسي الرسمي لورقة A4.
 * يطابق الترويسة ثلاثية الصفوف وبيانات الطالب (الاسم، الجلوس، الفصل) والتذييل الدقيق مع علامات الزوايا.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import React from "react";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_OFFICIAL_SCHOOL_EXAM_PAGE_CHROME =
  "official_school_exam_page_chrome" as const;

export function OfficialSchoolCornerCropMarks() {
  return (
    <div
      className="page-frame pointer-events-none absolute inset-[12px] border border-indigo-200/60 print:border-indigo-300"
      aria-hidden="true"
    >
      <span className="frame-corner absolute -top-[1px] -right-[1px] w-[16px] h-[16px] border-t-2 border-r-2 border-indigo-800" />
      <span className="frame-corner absolute -top-[1px] -left-[1px] w-[16px] h-[16px] border-t-2 border-l-2 border-indigo-800" />
      <span className="frame-corner absolute -bottom-[1px] -right-[1px] w-[16px] h-[16px] border-b-2 border-r-2 border-indigo-800" />
      <span className="frame-corner absolute -bottom-[1px] -left-[1px] w-[16px] h-[16px] border-b-2 border-l-2 border-indigo-800" />
    </div>
  );
}

export interface OfficialSchoolFirstPageHeaderProps {
  readonly identity: OwnerTeacherIdentity;
  readonly documentTitle: string;
  readonly subtitleAr?: string;
  readonly durationText?: string;
  readonly numeralMode?: NumeralDisplayMode;
  readonly isSolvedMode?: boolean;
}

export function OfficialSchoolFirstPageHeader({
  identity,
  documentTitle,
  subtitleAr = "",
  durationText = "ساعة ونصف",
  numeralMode = "western",
  isSolvedMode = false,
}: OfficialSchoolFirstPageHeaderProps) {
  const teacherName = identity.teacherFullName || "أ/ إسلام محمد";
  const teacherPhone = identity.teacherPhone || "";
  const academyName = identity.platformBrandName || "أكاديمية وسنتر الفارس";
  const gradeName = subtitleAr || "الصف الثالث الابتدائي";
  const duration = durationText || "ساعة ونصف";

  return (
    <header className="w-full border-2 border-indigo-950 rounded-lg bg-white p-2 mb-1.5 text-slate-900 select-none">
      {/* 1. الصف الأول: الأكاديمية والمادة (يمين) | عنوان الاختبار والمدة (وسط) | المعلم والهاتف (يسار) */}
      <div className="grid grid-cols-12 items-center text-xs font-bold border-b border-indigo-200/80 pb-1.5 mb-1.5">
        <div className="col-span-4 flex items-center gap-1.5 text-right">
          <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-300 text-indigo-950 font-black text-[11px]">
            {academyName}
          </span>
          <span className="text-[11px] text-slate-700 font-bold">
            المادة: <strong className="text-indigo-950 font-black">الرياضيات — {gradeName}</strong>
          </span>
        </div>

        <div className="col-span-4 text-center px-1">
          <h1 className="text-xs sm:text-sm font-black text-indigo-950 tracking-tight leading-tight">
            {isSolvedMode ? `${documentTitle} (نموذج الإجابة)` : documentTitle}
          </h1>
          <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-slate-100 border border-slate-300 text-[10px] font-black text-slate-700">
            مدة الاختبار: {duration}
          </span>
        </div>

        <div className="col-span-4 text-left font-mono text-xs font-bold text-slate-800" dir="ltr">
          <span>{teacherPhone ? `(${teacherPhone}) ` : ""}<strong className="font-black text-indigo-950">{teacherName}</strong> :المعلم</span>
        </div>
      </div>

      {/* 2. الصف الثاني: بيانات الطالب مع خطوط منقطة رفيعة */}
      <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-900 items-center">
        <div className="col-span-6 flex items-center gap-1.5">
          <span className="shrink-0 font-black text-slate-800 text-[11px]">اسم الطالب:</span>
          <span className="border-b border-dotted border-slate-400 flex-1 h-3 block" />
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <span className="shrink-0 font-black text-slate-800 text-[11px]">رقم الجلوس:</span>
          <span className="border-b border-dotted border-slate-400 flex-1 h-3 block" />
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <span className="shrink-0 font-black text-slate-800 text-[11px]">الفصل:</span>
          <span className="border-b border-dotted border-slate-400 flex-1 h-3 block" />
        </div>
      </div>
    </header>
  );
}

export interface OfficialSchoolRunningPageHeaderProps {
  readonly identity: OwnerTeacherIdentity;
  readonly documentTitle: string;
  readonly subtitleAr?: string;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly numeralMode?: NumeralDisplayMode;
}

export function OfficialSchoolRunningPageHeader({
  identity,
  documentTitle,
  subtitleAr = "",
  pageNumber,
  totalPages,
  numeralMode = "western",
}: OfficialSchoolRunningPageHeaderProps) {
  const teacherName = identity.teacherFullName || "أ/ إسلام محمد";
  const gradeName = subtitleAr || "الصف الثالث الابتدائي";

  return (
    <div className="w-full border-b border-indigo-950 pb-1 mb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-900 select-none">
      <div className="flex items-center gap-1.5">
        <span className="font-black text-xs text-indigo-950">{documentTitle}</span>
        <span className="text-slate-600 font-bold">({gradeName})</span>
      </div>
      <div className="flex items-center gap-2.5 text-[10.5px]">
        <span>المعلم: <strong className="font-black text-indigo-950">{teacherName}</strong></span>
        <span className="border-r border-slate-400 pr-2 font-mono font-black text-slate-900">
          صفحة {formatNumeralsByModeSSOT(pageNumber, numeralMode)} من {formatNumeralsByModeSSOT(totalPages, numeralMode)}
        </span>
      </div>
    </div>
  );
}

export interface OfficialSchoolPageFooterBarProps {
  readonly identity: OwnerTeacherIdentity;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly numeralMode?: NumeralDisplayMode;
}

export function OfficialSchoolPageFooterBar({
  identity,
  pageNumber,
  totalPages,
  numeralMode = "western",
}: OfficialSchoolPageFooterBarProps) {
  const teacherName = identity.teacherFullName || "أ/ إسلام محمد";
  const teacherPhone = identity.teacherPhone || "";
  const academyName = identity.platformBrandName || "أكاديمية وسنتر الفارس";
  const isLastPage = pageNumber === totalPages;

  return (
    <footer className="w-full border-t border-indigo-950 pt-1 pb-0 flex items-center justify-between text-[10.5px] text-slate-800 select-none break-inside-avoid print:break-inside-avoid">
      <div className="flex items-center gap-1 font-bold">
        <span className="text-slate-600">إعداد الأستاذ:</span>
        <span className="font-black text-slate-950">{teacherName}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {isLastPage && (
          <span className="text-center font-black text-[10px] text-indigo-950 px-2 py-0.2 rounded bg-slate-100 border border-slate-300">
            ✨ مع أطيب تمنياتي لكم بالتفوق والدرجة النهائية ✨
          </span>
        )}
        <span className="font-black text-[10px] text-slate-800 px-2 py-0.2 rounded bg-slate-100 border border-slate-300 font-mono">
          صفحة {formatNumeralsByModeSSOT(pageNumber, numeralMode)} من {formatNumeralsByModeSSOT(totalPages, numeralMode)}
        </span>
      </div>

      <div className="flex items-center gap-1 text-[10.5px] font-bold">
        {academyName && <span className="text-slate-900 font-black">{academyName}</span>}
        {teacherPhone && (
          <span className="font-mono text-slate-700 mr-1">
            ({teacherPhone})
          </span>
        )}
      </div>
    </footer>
  );
}

export function OfficialSchoolEndWishBanner() {
  return (
    <div className="w-full my-1 py-1 px-2.5 rounded border border-indigo-950/30 bg-slate-50 text-center text-[10.5px] font-bold text-slate-900 flex items-center justify-center gap-1.5 break-inside-avoid print:break-inside-avoid">
      <span>✨ مع أطيب تمنياتي لكم بالتفوق والدرجة النهائية ✨</span>
    </div>
  );
}
