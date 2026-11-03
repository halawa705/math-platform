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
    <header className="w-full border-2 border-indigo-950 rounded-xl bg-white p-2.5 mb-2.5 text-slate-900 select-none">
      {/* 1. الشريط العلوي التعريفي */}
      <div className="flex items-center justify-between border-b border-indigo-200/80 pb-1.5 mb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-300 text-indigo-950 font-black text-[11px]">
            {academyName}
          </span>
          <span className="font-bold text-slate-700">
            المادة: <span className="font-black text-indigo-950">الرياضيات</span>
          </span>
        </div>
        <div className="text-slate-700 font-bold text-[11px]">
          <span>{gradeName}</span>
          <span className="mx-1.5 text-slate-400">|</span>
          <span>الوحدة الثالثة: القسمة</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-800">
          <span>المعلم: <strong className="font-black text-indigo-950">{teacherName}</strong></span>
          {teacherPhone && <span>({teacherPhone})</span>}
        </div>
      </div>

      {/* 2. القسم الأوسط: المقرر والدرس | عنوان الاختبار والمدة | الأكاديمية والهاتف */}
      <div className="grid grid-cols-3 items-center text-xs font-bold border-b border-slate-200 pb-2">
        <div className="space-y-0.5 text-right">
          <div className="text-xs text-slate-600 font-semibold">
            المقرر: <span className="font-bold text-slate-900">{gradeName}</span>
          </div>
          <div className="text-xs font-black text-indigo-950">
            الدرس: <span className="font-bold text-slate-800">الوحدة 3</span>
          </div>
        </div>

        <div className="text-center space-y-1 px-1">
          <h1 className="text-sm font-black text-indigo-950 tracking-tight leading-tight">
            {isSolvedMode ? `${documentTitle} (نموذج الإجابة)` : documentTitle}
          </h1>
          <div className="inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-black text-slate-800">
            مدة الاختبار: {duration}
          </div>
        </div>

        <div className="space-y-0.5 text-left" dir="ltr">
          <div className="font-black text-xs text-slate-900 font-mono">
            {academyName}
          </div>
          <div className="text-[11px] font-mono text-slate-600 font-bold">
            {teacherPhone ? `هاتف: ${teacherPhone}` : ""}
          </div>
        </div>
      </div>

      {/* 3. شريط بيانات الطالب مع الخطوط المنقطة */}
      <div className="pt-2 grid grid-cols-12 gap-3 text-xs font-bold text-slate-900 items-center">
        <div className="col-span-6 flex items-center gap-1.5">
          <span className="shrink-0 font-black text-slate-800">اسم الطالب:</span>
          <span className="border-b border-dotted border-slate-400 flex-1 h-3 block" />
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <span className="shrink-0 font-black text-slate-800">رقم الجلوس:</span>
          <span className="border-b border-dotted border-slate-400 flex-1 h-3 block" />
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <span className="shrink-0 font-black text-slate-800">الفصل:</span>
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
    <div className="w-full border-b-2 border-indigo-950 pb-1.5 mb-2.5 flex items-center justify-between text-xs font-bold text-slate-900 select-none">
      <div className="flex items-center gap-2">
        <span className="font-black text-xs sm:text-sm text-indigo-950">{documentTitle}</span>
        <span className="text-slate-600 font-bold">
          (الرياضيات — {gradeName})
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-slate-700 font-semibold">
          الدرس: <span className="font-black text-slate-900">الوحدة 3</span>
        </span>
        <span className="border-r border-slate-400 pr-3 font-bold">
          المعلم: <span className="font-black text-indigo-950">{teacherName}</span>
        </span>
        <span className="border-r border-slate-400 pr-3 font-mono font-black text-slate-900">
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
    <footer className="w-full border-t-2 border-indigo-950 pt-2 pb-0.5 flex items-center justify-between text-xs text-slate-900 select-none break-inside-avoid print:break-inside-avoid">
      <div className="flex items-center gap-1.5 font-bold">
        <span className="text-slate-600">إعداد الأستاذ:</span>
        <span className="font-black text-slate-950">{teacherName}</span>
      </div>

      <div className="flex items-center gap-2">
        {isLastPage && (
          <div className="text-center font-black text-[11px] text-indigo-950 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-400">
            ✨ مع أطيب تمنياتي لكم بالتفوق والدرجة النهائية ✨
          </div>
        )}
        <div className="text-center font-black text-xs text-slate-900 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-400 font-mono">
          صفحة {formatNumeralsByModeSSOT(pageNumber, numeralMode)} من {formatNumeralsByModeSSOT(totalPages, numeralMode)}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-bold">
        {academyName && <span className="text-slate-900 font-black">{academyName}</span>}
        {teacherPhone && (
          <span className="inline-flex items-center gap-1 font-mono font-bold bg-indigo-950 text-white px-2 py-0.5 rounded">
            <span className="text-[10px] font-sans">هاتف:</span>
            <span dir="ltr">{teacherPhone}</span>
          </span>
        )}
      </div>
    </footer>
  );
}

export function OfficialSchoolEndWishBanner() {
  return (
    <div className="w-full my-2 py-1.5 px-3 rounded-lg border border-indigo-950/40 bg-slate-50 text-center text-xs font-bold text-slate-900 flex items-center justify-center gap-2 break-inside-avoid print:break-inside-avoid shadow-2xs">
      <span>✨</span>
      <span>مع أطيب تمنياتي لكم بالتفوق والدرجة النهائية</span>
      <span>✨</span>
    </div>
  );
}
