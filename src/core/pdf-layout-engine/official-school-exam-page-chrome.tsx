"use client";

/**
 * @file official-school-exam-page-chrome.tsx
 * @description عناصر ترويسة وتذييل والإطار الهندسي المزخرف المزدوج لورقة A4.
 * جميع الإطارات والزوايا الهندسية مرسومة بـ Inline Styles صريحة لضمان ظهورها بنسبة 100% في المعاينة والطباعة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 260 سطراً).
 */

import React from "react";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_OFFICIAL_SCHOOL_EXAM_PAGE_CHROME =
  "official_school_exam_page_chrome" as const;

export function OfficialSchoolCornerCropMarks({
  primaryHex = "#1e3a8a",
  accentHex = "#2563eb",
}: {
  readonly primaryHex?: string;
  readonly accentHex?: string;
}) {
  const cornerBase: React.CSSProperties = {
    position: "absolute",
    width: "22px",
    height: "22px",
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "6px",
        right: "6px",
        bottom: "6px",
        left: "6px",
        border: `2px solid ${primaryHex}`,
        borderRadius: "10px",
        boxShadow: `inset 0 0 0 2px #ffffff, 0 0 0 1px ${accentHex}33`,
        pointerEvents: "none",
        zIndex: 20,
      }}
      className="page-frame"
      aria-hidden="true"
    >
      {/* الإطار الداخلي المتقطع */}
      <div
        style={{
          position: "absolute",
          top: "3px",
          right: "3px",
          bottom: "3px",
          left: "3px",
          border: `1.2px dashed ${accentHex}99`,
          borderRadius: "7px",
          pointerEvents: "none",
        }}
      />
      {/* الزوايا الأربع البارزة */}
      <span
        style={{
          ...cornerBase,
          top: "-2px",
          right: "-2px",
          borderTop: `4px solid ${primaryHex}`,
          borderRight: `4px solid ${primaryHex}`,
          borderTopRightRadius: "9px",
        }}
      />
      <span
        style={{
          ...cornerBase,
          top: "-2px",
          left: "-2px",
          borderTop: `4px solid ${primaryHex}`,
          borderLeft: `4px solid ${primaryHex}`,
          borderTopLeftRadius: "9px",
        }}
      />
      <span
        style={{
          ...cornerBase,
          bottom: "-2px",
          right: "-2px",
          borderBottom: `4px solid ${primaryHex}`,
          borderRight: `4px solid ${primaryHex}`,
          borderBottomRightRadius: "9px",
        }}
      />
      <span
        style={{
          ...cornerBase,
          bottom: "-2px",
          left: "-2px",
          borderBottom: `4px solid ${primaryHex}`,
          borderLeft: `4px solid ${primaryHex}`,
          borderBottomLeftRadius: "9px",
        }}
      />
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
  const primaryHex = palette?.primaryHex || "#1e3a8a";
  const accentHex = palette?.accentHex || "#0284c7";
  const headerGradient =
    palette?.headerGradientCss || "linear-gradient(135deg, #1E1B4B 0%, #1E3A8A 50%, #2563EB 100%)";

  return (
    <header
      style={{
        backgroundColor: "#ffffff",
        border: `2px solid ${primaryHex}`,
        borderRadius: "10px",
        boxShadow: `0 2px 0 ${primaryHex}25`,
        padding: "7px 10px",
        marginBottom: "6px",
      }}
      className="w-full bg-white text-slate-900 select-none"
    >
      {/* 1. الصف الأول: الأكاديمية والمادة (يمين) | عنوان الاختبار داخل كبسولة ملونة (وسط) | المعلم والهاتف (يسار) */}
      <div
        style={{ borderBottom: `1.5px dashed ${accentHex}66`, paddingBottom: "5px", marginBottom: "5px" }}
        className="grid grid-cols-12 items-center text-xs font-bold"
      >
        <div className="col-span-4 flex items-center gap-1.5 text-right">
          <span
            style={{
              background: headerGradient,
              color: "#ffffff",
              borderRadius: "6px",
              padding: "2px 8px",
              boxShadow: `0 1.5px 0 ${primaryHex}`,
            }}
            className="font-black text-[11px]"
          >
            {academyName}
          </span>
          <span className="text-[11px] text-slate-800 font-extrabold">
            <strong style={{ color: primaryHex }} className="font-black">
              الرياضيات — {gradeName}
            </strong>
          </span>
        </div>

        <div className="col-span-4 text-center px-1">
          <div
            style={{
              background: headerGradient,
              color: "#ffffff",
              borderRadius: "8px",
              padding: "2px 10px",
              boxShadow: `0 2px 0 ${primaryHex}`,
              display: "inline-block",
            }}
            className="text-xs sm:text-sm font-black tracking-tight leading-snug"
          >
            {isSolvedMode ? `${documentTitle} (نموذج الإجابة)` : documentTitle}
          </div>
          <div className="mt-1">
            <span
              style={{
                backgroundColor: "#ffffff",
                border: `1.2px solid ${accentHex}`,
                color: primaryHex,
                borderRadius: "9999px",
                padding: "1px 8px",
              }}
              className="inline-block text-[10px] font-black"
            >
              ⏱️ الزمن: {duration}
            </span>
          </div>
        </div>

        <div className="col-span-4 text-left font-mono text-xs font-bold text-slate-800" dir="ltr">
          <span>
            {teacherPhone ? `(${teacherPhone}) ` : ""}
            <strong style={{ color: primaryHex }} className="font-black">
              {teacherName}
            </strong>{" "}
            :المعلم
          </span>
        </div>
      </div>

      {/* 2. الصف الثاني: بيانات الطالب مع كبسولات بيضاء مؤطرة */}
      <div className="grid grid-cols-12 gap-2.5 text-xs font-bold text-slate-900 items-center">
        <div className="col-span-6 flex items-center gap-1.5">
          <span style={{ color: primaryHex }} className="shrink-0 font-black text-[11px]">
            👤 اسم الطالب:
          </span>
          <span
            style={{ borderBottom: `1.5px dotted ${primaryHex}88` }}
            className="flex-1 h-3.5 block"
          />
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <span style={{ color: primaryHex }} className="shrink-0 font-black text-[11px]">
            المجموعة:
          </span>
          <span
            style={{ borderBottom: `1.5px dotted ${primaryHex}88` }}
            className="flex-1 h-3.5 block"
          />
        </div>
        <div className="col-span-3 flex items-center gap-1.5">
          <span style={{ color: primaryHex }} className="shrink-0 font-black text-[11px]">
            الدرجة:
          </span>
          <span
            style={{
              backgroundColor: "#ffffff",
              border: `1.5px solid ${accentHex}`,
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
  const primaryHex = palette?.primaryHex || "#1e3a8a";
  const headerGradient =
    palette?.headerGradientCss || "linear-gradient(135deg, #1E1B4B 0%, #1E3A8A 50%, #2563EB 100%)";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: `1.5px solid ${primaryHex}`,
        borderRadius: "8px",
        padding: "3px 8px",
        marginBottom: "6px",
      }}
      className="w-full flex items-center justify-between text-[11px] font-bold text-slate-900 select-none"
    >
      <div className="flex items-center gap-1.5">
        <span
          style={{
            background: headerGradient,
            color: "#ffffff",
            borderRadius: "5px",
            padding: "1px 6px",
          }}
          className="font-black text-[10.5px]"
        >
          {documentTitle}
        </span>
        <span style={{ color: primaryHex }} className="font-extrabold">
          ({gradeName})
        </span>
      </div>
      <div className="flex items-center gap-2.5 text-[10.5px]">
        <span>
          المعلم: <strong style={{ color: primaryHex }} className="font-black">{teacherName}</strong>
        </span>
        <span
          style={{
            background: headerGradient,
            color: "#ffffff",
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

export interface OfficialSchoolPageFooterBarProps {
  readonly identity: OwnerTeacherIdentity;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly numeralMode?: NumeralDisplayMode;
  readonly palette?: PrintThemePaletteTokens;
}

export function OfficialSchoolPageFooterBar({
  identity,
  pageNumber,
  totalPages,
  numeralMode = "western",
  palette,
}: OfficialSchoolPageFooterBarProps) {
  const teacherName = identity.teacherFullName || "أ/ إسلام محمد";
  const teacherPhone = identity.teacherPhone || "";
  const academyName = identity.platformBrandName || "أكاديمية وسنتر الفارس";
  const primaryHex = palette?.primaryHex || "#1e3a8a";
  const headerGradient =
    palette?.headerGradientCss || "linear-gradient(135deg, #1E1B4B 0%, #1E3A8A 50%, #2563EB 100%)";

  return (
    <footer
      style={{
        borderTop: `1.5px solid ${primaryHex}`,
        paddingTop: "4px",
      }}
      className="w-full flex items-center justify-between text-[10.5px] text-slate-900 select-none break-inside-avoid print:break-inside-avoid"
    >
      {/* يمين التذييل: شارة رقم الصفحة المزدوجة على طراز كتاب سندباد */}
      <div
        style={{
          border: `1.5px solid ${primaryHex}`,
          borderRadius: "6px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
        className="inline-flex items-center"
      >
        <span
          style={{
            background: headerGradient,
            color: "#ffffff",
            padding: "1px 8px",
          }}
          className="font-black text-[10.5px] font-mono"
        >
          {formatNumeralsByModeSSOT(pageNumber, numeralMode)} / {formatNumeralsByModeSSOT(totalPages, numeralMode)}
        </span>
        <span style={{ color: primaryHex, padding: "1px 8px" }} className="font-black text-[10px]">
          إعداد: {teacherName}
        </span>
      </div>

      {/* يسار التذييل: شارة الأكاديمية والهاتف */}
      <div className="inline-flex items-center gap-1.5">
        {teacherPhone && (
          <span
            style={{
              backgroundColor: "#ffffff",
              border: `1.2px solid ${primaryHex}`,
              color: primaryHex,
              borderRadius: "6px",
              padding: "1px 6px",
            }}
            className="font-mono font-black text-[10px]"
          >
            📞 {formatNumeralsByModeSSOT(teacherPhone, numeralMode)}
          </span>
        )}
        {academyName && (
          <span
            style={{
              background: headerGradient,
              color: "#ffffff",
              borderRadius: "6px",
              padding: "1px 8px",
              boxShadow: `0 1.5px 0 ${primaryHex}`,
            }}
            className="font-black text-[10px]"
          >
            {academyName}
          </span>
        )}
      </div>
    </footer>
  );
}

export function OfficialSchoolEndWishBanner({ palette }: { readonly palette?: PrintThemePaletteTokens }) {
  const primaryHex = palette?.primaryHex || "#1e3a8a";
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: `1.5px dashed ${primaryHex}`,
        borderRadius: "8px",
        padding: "3px 10px",
        margin: "4px 0",
        color: primaryHex,
      }}
      className="w-full text-center text-[10.5px] font-black flex items-center justify-center gap-1.5 break-inside-avoid print:break-inside-avoid"
    >
      <span>✨ مع أطيب تمنياتي لكم بالتفوق والدرجة النهائية ✨</span>
    </div>
  );
}
