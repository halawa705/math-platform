"use client";

/**
 * @file official-school-exam-page-chrome.tsx
 * @description ترويسات ورقة A4 لقالب الامتحان المدرسي الرسمي بتخطيط عرضي انسيابي هادئ
 * يمنع التكدس الطولي للعناوين ويزيل الخلفيات الداكنة الصارخة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 230 سطراً).
 */

import React from "react";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_OFFICIAL_SCHOOL_EXAM_PAGE_CHROME =
  "official_school_exam_page_chrome" as const;

export interface OfficialSchoolFirstPageHeaderProps {
  readonly identity: OwnerTeacherIdentity;
  readonly documentTitle: string;
  readonly subtitleAr?: string;
  readonly durationText?: string;
  readonly numeralMode?: NumeralDisplayMode;
  readonly isSolvedMode?: boolean;
  readonly palette?: PrintThemePaletteTokens;
}

export function OfficialSchoolFirstPageHeader({
  identity,
  documentTitle,
  subtitleAr = "",
  durationText = "ساعة ونصف",
  numeralMode = "western",
  isSolvedMode = false,
  palette,
}: OfficialSchoolFirstPageHeaderProps) {
  const teacherName = identity.teacherFullName || "أ/ إسلام محمد";
  const teacherPhone = identity.teacherPhone || "";
  const academyName = identity.platformBrandName || "أكاديمية وسنتر الفارس";
  const gradeName = subtitleAr || "الصف الثالث الابتدائي";
  const duration = durationText || "ساعة ونصف";
  const primaryHex = palette?.primaryHex || "#172B5E";
  const borderHex = palette?.borderHex || "#4A6FA5";
  const badgeBgHex = palette?.badgeBgHex || "#EEF3FA";
  const softSurfaceHex = palette?.softSurfaceHex || "#F7F9FC";
  const isPhotocopy = primaryHex === "#000000";

  return (
    <header
      style={{
        backgroundColor: "#ffffff",
        border: `1.6px solid ${primaryHex}`,
        borderRadius: "9px",
        padding: "6px 10px",
        marginBottom: "6px",
      }}
      className="w-full bg-white text-slate-900 select-none"
    >
      {/* ١. الصف الأول: البيانات المؤسسية يميناً ويساراً بدون تكدس */}
      <div
        style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: "4px" }}
        className="flex items-center justify-between gap-2 text-[11px] font-bold"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            style={{
              backgroundColor: isPhotocopy ? "#FFFFFF" : badgeBgHex,
              border: `1px solid ${isPhotocopy ? "#334155" : `${borderHex}66`}`,
              color: primaryHex,
            }}
            className="w-[18px] h-[18px] rounded-sm flex items-center justify-center text-[10px] font-black overflow-hidden shrink-0"
          >
            {identity.platformLogoUrl ? (
              <img
                src={identity.platformLogoUrl}
                alt={academyName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{identity.platformLogoSymbol || "∑"}</span>
            )}
          </span>
          <span style={{ color: primaryHex }} className="font-black truncate">
            {academyName}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-extrabold truncate">
            الرياضيات — {gradeName}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[10.5px]">
          <span className="text-slate-700">
            المعلم:{" "}
            <strong style={{ color: primaryHex }} className="font-black">
              {teacherName}
            </strong>
            {teacherPhone ? ` (${formatNumeralsByModeSSOT(teacherPhone, numeralMode)})` : ""}
          </span>
          <span
            style={{
              backgroundColor: isPhotocopy ? "#ffffff" : badgeBgHex,
              border: `1px solid ${isPhotocopy ? "#334155" : `${borderHex}66`}`,
              color: primaryHex,
              borderRadius: "9999px",
              padding: "0.5px 7px",
            }}
            className="font-black text-[10px] whitespace-nowrap"
          >
            ⏱ الزمن: {formatNumeralsByModeSSOT(duration, numeralMode)}
          </span>
        </div>
      </div>

      {/* ٢. الصف الثاني: شريط عنوان المستند العرضي الكامل بنبرة هادئة متزنة */}
      <div
        style={{
          backgroundColor: isPhotocopy ? "#ffffff" : softSurfaceHex,
          borderTop: `1px solid ${isPhotocopy ? "#CBD5E1" : `${borderHex}45`}`,
          borderBottom: `1px solid ${isPhotocopy ? "#CBD5E1" : `${borderHex}45`}`,
          borderRight: `3.5px solid ${primaryHex}`,
          borderLeft: `3.5px solid ${primaryHex}`,
        }}
        className="w-full my-1 py-1 px-3 rounded-md flex flex-wrap items-center justify-center gap-2 text-center"
      >
        <span style={{ color: primaryHex }} className="text-[12px] font-black tracking-tight leading-snug">
          {documentTitle}
        </span>
        {isSolvedMode && (
          <span
            style={{
              backgroundColor: isPhotocopy ? "#ffffff" : badgeBgHex,
              border: `1px solid ${primaryHex}55`,
              color: primaryHex,
            }}
            className="px-2 py-0.2 rounded-full text-[10px] font-black shrink-0"
          >
            نموذج الإجابة
          </span>
        )}
      </div>

      {/* ٣. الصف الثالث: شريط بيانات الطالب */}
      <div className="grid grid-cols-12 gap-2.5 pt-0.5 text-[11px] font-bold text-slate-900 items-center">
        <div className="col-span-6 flex items-center gap-1.5">
          <span style={{ color: primaryHex }} className="shrink-0 font-black">
            اسم الطالب:
          </span>
          <span style={{ borderBottom: `1.4px dotted ${primaryHex}88` }} className="flex-1 h-3.5 block" />
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <span style={{ color: primaryHex }} className="shrink-0 font-black">
            المجموعة:
          </span>
          <span style={{ borderBottom: `1.4px dotted ${primaryHex}88` }} className="flex-1 h-3.5 block" />
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <span style={{ color: primaryHex }} className="shrink-0 font-black">
            الدرجة:
          </span>
          <span
            style={{
              backgroundColor: "#ffffff",
              border: `1.3px solid ${isPhotocopy ? "#334155" : borderHex}`,
              borderRadius: "6px",
              height: "18px",
            }}
            className="flex-1 block"
          />
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
  readonly palette?: PrintThemePaletteTokens;
}

export function OfficialSchoolRunningPageHeader({
  identity,
  documentTitle,
  subtitleAr = "",
  pageNumber,
  totalPages,
  numeralMode = "western",
  palette,
}: OfficialSchoolRunningPageHeaderProps) {
  const teacherName = identity.teacherFullName || "أ/ إسلام محمد";
  const gradeName = subtitleAr || "الصف الثالث الابتدائي";
  const primaryHex = palette?.primaryHex || "#172B5E";
  const borderHex = palette?.borderHex || "#4A6FA5";
  const badgeBgHex = palette?.badgeBgHex || "#EEF3FA";
  const isPhotocopy = primaryHex === "#000000";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: `1.3px solid ${primaryHex}`,
        borderRadius: "8px",
        padding: "3px 8px",
        marginBottom: "6px",
      }}
      className="w-full flex items-center justify-between gap-2 text-[11px] font-bold text-slate-900 select-none"
    >
      <div className="flex items-center gap-1.5 min-w-0 truncate">
        <span style={{ color: primaryHex }} className="font-black text-[10.5px] truncate">
          {documentTitle}
        </span>
        <span className="text-slate-600 font-bold text-[10px] shrink-0">
          ({gradeName})
        </span>
      </div>
      <div className="flex items-center gap-2.5 text-[10.5px] shrink-0">
        <span>
          المعلم: <strong style={{ color: primaryHex }} className="font-black">{teacherName}</strong>
        </span>
        <span
          style={{
            backgroundColor: isPhotocopy ? "#ffffff" : badgeBgHex,
            color: primaryHex,
            border: `1px solid ${isPhotocopy ? "#334155" : `${borderHex}77`}`,
            borderRadius: "9999px",
            padding: "1px 8px",
          }}
          className="font-mono font-black text-[10px]"
        >
          صفحة {formatNumeralsByModeSSOT(pageNumber, numeralMode)} من{" "}
          {formatNumeralsByModeSSOT(totalPages, numeralMode)}
        </span>
      </div>
    </div>
  );
}
