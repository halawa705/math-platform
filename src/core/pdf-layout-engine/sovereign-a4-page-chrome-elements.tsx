"use client";

/**
 * @file sovereign-a4-page-chrome-elements.tsx
 * @description العناصر الزخرفية والهيكلية السيادية لورقة الـ A4 الوزارية:
 * 1. الترويسة الوزارية الكاملة للصفحة الأولى (`SovereignFirstPageHeader`).
 * 2. الترويسة الجارية الرشيقة للصفحات التالية (`SovereignRunningPageHeader`).
 * 3. شريط التذييل السفلي المرقم لكل صفحة (`SovereignPageNumberFooterBar`).
 * 4. خاتمة اعتماد المذكرة في نهاية المستند (`SovereignDocumentAccreditationBox`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import React from "react";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_SOVEREIGN_A4_PAGE_CHROME_ELEMENTS =
  "sovereign_a4_page_chrome_elements" as const;

export function SovereignFirstPageHeader({
  identity,
  palette,
  documentTitle,
  subtitleAr,
  isSolvedMode,
  totalIdeasCount,
  totalQuestionsCount,
  totalMarks,
  numeralMode,
  compact = false,
}: {
  readonly identity: OwnerTeacherIdentity;
  readonly palette: PrintThemePaletteTokens;
  readonly documentTitle: string;
  readonly subtitleAr?: string;
  readonly isSolvedMode: boolean;
  readonly totalIdeasCount: number;
  readonly totalQuestionsCount: number;
  readonly totalMarks: number;
  readonly numeralMode: NumeralDisplayMode;
  readonly compact?: boolean;
}) {
  return (
    <header
      style={{
        borderColor: palette.primaryHex,
        boxShadow: "0 2px 8px rgba(30, 58, 138, 0.07)",
      }}
      className={`rounded-xl border-2 bg-white overflow-hidden ${compact ? "mb-1" : "mb-2"} shrink-0`}
    >
      <div
        style={{ backgroundColor: "#F8FAFC" }}
        className={`grid grid-cols-12 items-center ${compact ? "p-1" : "p-2"} gap-2 border-b border-slate-200`}
      >
        <div className="col-span-4 border-l border-slate-200 pl-2 flex items-center gap-2 min-w-0">
          <div
            style={{ background: palette.headerGradientCss }}
            className="w-9 h-9 rounded-xl text-white flex items-center justify-center text-sm font-black overflow-hidden shrink-0 shadow-xs"
          >
            {identity.platformLogoUrl ? (
              <img
                src={identity.platformLogoUrl}
                alt={identity.platformBrandName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{identity.platformLogoSymbol || "∑"}</span>
            )}
          </div>
          <div className="min-w-0 space-y-0.5">
            <div
              style={{ color: palette.primaryHex }}
              className="text-[10pt] font-black leading-tight truncate"
            >
              {identity.platformBrandName}
            </div>
            <div className="text-[7.2pt] font-extrabold text-slate-600 truncate">
              إدارة التربية والتعليم
            </div>
            <div
              style={{ color: palette.accentHex }}
              className="text-[7.2pt] font-black truncate"
            >
              {isSolvedMode
                ? "مذكرة الشرح والتأسيس والتطبيقات"
                : "ورقة تقييم واختبار رسمي معتمد"}
            </div>
          </div>
        </div>

        <div className="col-span-4 text-center space-y-1 px-1 min-w-0">
          <div className="text-[10.8pt] font-black text-slate-950 leading-snug break-words">
            {documentTitle}
          </div>
          {!compact && subtitleAr && (
            <span
              style={{ background: palette.headerGradientCss }}
              className="inline-block px-3 py-0.5 rounded-full text-white text-[7.8pt] font-black shadow-2xs"
            >
              {subtitleAr}
            </span>
          )}
        </div>

        <div className="col-span-4 border-r border-slate-200 pr-2 text-left space-y-0.5 text-[8pt] font-bold min-w-0">
          <div
            style={{ color: palette.primaryHex }}
            className="text-[9pt] font-black truncate"
          >
            المعلم: {identity.teacherFullName}
            {identity.teacherNickname ? ` (${identity.teacherNickname})` : ""}
          </div>
          {identity.teacherPhone && (
            <div className="text-slate-700 font-mono font-extrabold text-[7.8pt]">
              هاتف: {formatNumeralsByModeSSOT(identity.teacherPhone, numeralMode)}
            </div>
          )}
          {!compact && (
            <div className="text-slate-500 font-extrabold text-[7.5pt]">
              الأفكار: ({formatNumeralsByModeSSOT(totalIdeasCount, numeralMode)}) | المسائل: (
              {formatNumeralsByModeSSOT(totalQuestionsCount, numeralMode)})
            </div>
          )}
        </div>
      </div>

      <div
        style={{ backgroundColor: palette.badgeBgHex }}
        className="px-3 py-1 flex flex-wrap items-center justify-between gap-2 text-[8pt] font-black text-slate-800"
      >
        <span>اسم الطالب: ....................................</span>
        <span>المجموعة: ...................</span>
        <span>الفصل: ...........</span>
        <span style={{ color: palette.primaryHex }}>
          الدرجة الكلية: ...... / {formatNumeralsByModeSSOT(totalMarks, numeralMode)}
        </span>
      </div>
    </header>
  );
}

export function SovereignRunningPageHeader({
  identity,
  palette,
  documentTitle,
  subtitleAr,
  pageNumber,
  totalPages,
  numeralMode,
}: {
  readonly identity: OwnerTeacherIdentity;
  readonly palette: PrintThemePaletteTokens;
  readonly documentTitle: string;
  readonly subtitleAr?: string;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly numeralMode: NumeralDisplayMode;
}) {
  return (
    <div
      style={{
        borderColor: palette.primaryHex,
        backgroundColor: "#F8FAFC",
      }}
      className="rounded-lg border px-2.5 py-1 mb-1.5 flex items-center justify-between gap-2 text-[7.8pt] font-black text-slate-700 shrink-0"
    >
      <div className="flex items-center gap-1.5 min-w-0 truncate">
        <span
          style={{ background: palette.headerGradientCss }}
          className="w-4 h-4 rounded text-white flex items-center justify-center text-[7pt] font-black shrink-0"
        >
          ∑
        </span>
        <span style={{ color: palette.primaryHex }} className="truncate">
          {identity.platformBrandName}
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-900 truncate">{documentTitle}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {subtitleAr && <span className="text-slate-500">{subtitleAr}</span>}
        <span
          style={{
            backgroundColor: palette.badgeBgHex,
            color: palette.primaryHex,
            borderColor: palette.borderHex,
          }}
          className="px-2 py-0.5 rounded border text-[7.4pt] font-black"
        >
          صفحة {formatNumeralsByModeSSOT(pageNumber, numeralMode)} من{" "}
          {formatNumeralsByModeSSOT(totalPages, numeralMode)}
        </span>
      </div>
    </div>
  );
}

export function SovereignPageNumberFooterBar({
  identity,
  palette,
  pageNumber,
  totalPages,
  numeralMode,
}: {
  readonly identity: OwnerTeacherIdentity;
  readonly palette: PrintThemePaletteTokens;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly numeralMode: NumeralDisplayMode;
}) {
  return (
    <div
      style={{ borderColor: "#CBD5E1", backgroundColor: "#F8FAFC" }}
      className="mt-auto pt-1 border-t flex items-center justify-between px-2 py-0.5 rounded-md text-[7.5pt] font-black text-slate-600 shrink-0"
    >
      <span>
        إعداد: {identity.teacherFullName}
        {identity.teacherPhone
          ? ` • ${formatNumeralsByModeSSOT(identity.teacherPhone, numeralMode)}`
          : ""}
      </span>
      <span
        style={{ background: palette.headerGradientCss }}
        className="px-2.5 py-0.5 rounded-full text-white text-[7.4pt] font-black shadow-2xs"
      >
        صفحة ({formatNumeralsByModeSSOT(pageNumber, numeralMode)}) من (
        {formatNumeralsByModeSSOT(totalPages, numeralMode)})
      </span>
      <span style={{ color: palette.primaryHex }}>{identity.platformBrandName}</span>
    </div>
  );
}

export function SovereignDocumentAccreditationBox({
  identity,
  palette,
  numeralMode,
}: {
  readonly identity: OwnerTeacherIdentity;
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
}) {
  return (
    <div
      style={{
        borderColor: palette.primaryHex,
        backgroundColor: "#FAF8FF",
      }}
      className="p-1.5 rounded-xl border-2 break-inside-avoid"
    >
      <div
        style={{ borderColor: palette.solvedBorderHex }}
        className="p-1.5 rounded-lg border bg-white text-center space-y-1"
      >
        <div
          style={{ background: palette.headerGradientCss }}
          className="mx-auto max-w-xs py-0.5 px-3 rounded-full text-white text-[8.2pt] font-black shadow-2xs"
        >
          اعتماد وإشراف المذكرة التعليمية
        </div>
        <div className="flex flex-wrap items-center justify-around gap-2 text-[8pt] font-black text-slate-900">
          <span>
            <span style={{ color: palette.secondaryHex }}>معلم المادة: </span>
            {identity.teacherFullName}
          </span>
          {identity.teacherPhone && (
            <span>
              <span style={{ color: palette.secondaryHex }}>للتواصل: </span>
              <span className="font-mono">
                {formatNumeralsByModeSSOT(identity.teacherPhone, numeralMode)}
              </span>
            </span>
          )}
          <span>
            <span style={{ color: palette.secondaryHex }}>الصرح التعليمي: </span>
            {identity.platformBrandName}
          </span>
        </div>
      </div>
    </div>
  );
}
