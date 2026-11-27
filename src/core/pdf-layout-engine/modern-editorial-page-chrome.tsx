"use client";

/**
 * @file modern-editorial-page-chrome.tsx
 * @description عناصر الترويسة والتذييل والإطار الجانبي المهشّر وأشرطة الأقسام للقالب المدرسي الحديث (المذكرة والمراجعة)
 * مستجيبة بالكامل لجميع السمات اللونية السبع في المنصة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 245 سطراً).
 */

import React from "react";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_MODERN_EDITORIAL_PAGE_CHROME =
  "modern_editorial_page_chrome" as const;

export function parseGradeRibbonInfo(
  subtitleAr: string,
  documentTitle: string
): { readonly gradeNumber: string; readonly stageLabelAr: string } {
  const tryDetect = (src: string): { grade?: string; stage?: string } => {
    let grade: string | undefined;
    if (/سادس|(?:^|[\s\-•])6\s*ب(?=$|[\s\-•])/i.test(src)) grade = "6";
    else if (/خامس|(?:^|[\s\-•])5\s*ب(?=$|[\s\-•])/i.test(src)) grade = "5";
    else if (/رابع|(?:^|[\s\-•])4\s*ب(?=$|[\s\-•])/i.test(src)) grade = "4";
    else if (/(?:الصف\s+ال)?ثالث\s+(?:ال)?(?:ابتدائي|إعدادي|اعدادي|ثانوي)|(?:^|[\s\-•])3\s*[بعث](?=$|[\s\-•])/i.test(src)) grade = "3";
    else if (/(?:الصف\s+ال)?ثان[ي|ى]\s+(?:ال)?(?:ابتدائي|إعدادي|اعدادي|ثانوي)|(?:^|[\s\-•])2\s*[بعث](?=$|[\s\-•])/i.test(src)) grade = "2";
    else if (/(?:الصف\s+ال)?أول\s+(?:ال)?(?:ابتدائي|إعدادي|اعدادي|ثانوي)|(?:^|[\s\-•])1\s*[بعث](?=$|[\s\-•])/i.test(src)) grade = "1";

    let stage: string | undefined;
    if (/ابتدائي|(?:^|[\s\-•])\d\s*ب(?=$|[\s\-•])/i.test(src)) stage = "ابتدائي";
    else if (/ثانوي|(?:^|[\s\-•])\d\s*ث(?=$|[\s\-•])/i.test(src)) stage = "ثانوي";
    else if (/إعدادي|اعدادي|(?:^|[\s\-•])\d\s*ع(?=$|[\s\-•])/i.test(src)) stage = "إعدادي";

    return { grade, stage };
  };

  const fromSub = tryDetect(subtitleAr);
  const fromDoc = tryDetect(documentTitle);
  return {
    gradeNumber: fromSub.grade ?? fromDoc.grade ?? "1",
    stageLabelAr: fromSub.stage ?? fromDoc.stage ?? "إعدادي",
  };
}

export function ModernEditorialPageHeader({
  identity,
  palette,
  documentTitle,
  subtitleAr = "",
  isSolvedMode,
  numeralMode,
}: {
  readonly identity: OwnerTeacherIdentity;
  readonly palette: PrintThemePaletteTokens;
  readonly documentTitle: string;
  readonly subtitleAr?: string;
  readonly isSolvedMode: boolean;
  readonly numeralMode: NumeralDisplayMode;
}) {
  const isPhotocopy = palette.primaryHex === "#000000";
  const { gradeNumber, stageLabelAr } = parseGradeRibbonInfo(subtitleAr, documentTitle);
  const brandName = identity.platformBrandName || "منصة الفارس";
  const editionLabel = isSolvedMode ? "نسخة الإجابات النموذجية" : "نسخة الطالب";

  return (
    <header
      style={{
        backgroundColor: isPhotocopy ? "#F8FAFC" : palette.badgeBgHex,
        borderBottom: `1.5px solid ${palette.borderHex}66`,
        borderRadius: "4px 4px 0 0",
        marginBottom: "6px",
        minHeight: "46px",
        overflow: "hidden",
      }}
      className="w-full flex items-stretch justify-between gap-2 select-none shrink-0"
    >
      {/* اليمين: اسم المنصة في الرياضيات + عنوان المستند ونسخة الطالب */}
      <div className="px-3 py-1 flex items-center gap-2.5 min-w-0 flex-1">
        {identity.platformLogoUrl && (
          <img
            src={identity.platformLogoUrl}
            alt={brandName}
            className="w-8 h-8 rounded-md object-contain shrink-0"
          />
        )}
        <div className="min-w-0 text-right space-y-0.5">
          <div className="leading-tight flex items-baseline gap-1.5 flex-wrap">
            <span style={{ color: palette.primaryHex }} className="text-[13pt] font-black">
              {brandName}
            </span>
            <span style={{ color: palette.secondaryHex }} className="text-[9.5pt] font-extrabold">
              في الرياضيات
            </span>
          </div>
          <div
            style={{ color: isPhotocopy ? "#0F172A" : palette.accentHex }}
            className="text-[8.8pt] font-black leading-tight truncate"
          >
            {documentTitle} | {editionLabel}
          </div>
        </div>
      </div>

      {/* اليسار: شارة الصف المصمتة المميزة (رقم مؤطر بالأبيض + المرحلة) */}
      <div
        style={{
          backgroundColor: palette.primaryHex,
          color: "#FFFFFF",
        }}
        className="shrink-0 flex items-center gap-2 px-3.5 py-1.5"
      >
        <span
          style={{
            border: "1.8px solid rgba(255, 255, 255, 0.92)",
            borderRadius: "3px",
            minWidth: "24px",
            height: "24px",
          }}
          className="inline-flex items-center justify-center text-[13pt] font-black leading-none px-1"
        >
          {formatNumeralsByModeSSOT(gradeNumber, numeralMode)}
        </span>
        <span className="text-[12.5pt] font-black tracking-tight">{stageLabelAr}</span>
      </div>
    </header>
  );
}

export function ModernEditorialSideHatchedRails({
  palette,
  pageKey,
}: {
  readonly palette: PrintThemePaletteTokens;
  readonly pageKey: string | number;
}) {
  const patternId = `editorial-hatch-${String(pageKey).replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const strokeColor = palette.primaryHex === "#000000" ? "#475569" : palette.borderHex;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "64px",
        bottom: "44px",
        right: "7px",
        left: "7px",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <pattern
            id={patternId}
            width="6"
            height="6"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeOpacity="0.62"
            />
          </pattern>
        </defs>
        <rect x="0" y="0" width="3.5" height="100%" fill={`url(#${patternId})`} />
        <rect x="calc(100% - 3.5px)" y="0" width="3.5" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

export function ModernEditorialPageFooter({
  identity,
  palette,
  pageNumber,
  numeralMode,
}: {
  readonly identity: OwnerTeacherIdentity;
  readonly palette: PrintThemePaletteTokens;
  readonly pageNumber: number;
  readonly numeralMode: NumeralDisplayMode;
}) {
  const isPhotocopy = palette.primaryHex === "#000000";
  const teacherName = identity.teacherFullName || "أ/ إسلام محمد";
  const teacherPhone = identity.teacherPhone || "";

  return (
    <footer
      style={{
        backgroundColor: isPhotocopy ? "#F8FAFC" : palette.badgeBgHex,
        borderTop: `1px solid ${palette.borderHex}55`,
        minHeight: "28px",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "stretch",
      }}
      className="w-full text-[9.8pt] font-black select-none shrink-0"
    >
      <div className="px-3.5 flex items-center justify-start truncate">
        <span style={{ color: palette.primaryHex }}>{teacherName}</span>
      </div>
      <div
        style={{
          backgroundColor: palette.primaryHex,
          color: "#FFFFFF",
          minWidth: "36px",
        }}
        className="px-3 flex items-center justify-center font-mono text-[10.5pt] font-black"
      >
        {formatNumeralsByModeSSOT(pageNumber, numeralMode)}
      </div>
      <div className="px-3.5 flex items-center justify-end font-mono truncate">
        <span dir="ltr" style={{ color: palette.primaryHex }}>
          {teacherPhone ? formatNumeralsByModeSSOT(teacherPhone, numeralMode) : ""}
        </span>
      </div>
    </footer>
  );
}

export function ModernEditorialSectionRibbonBar({
  titleArabic,
  palette,
}: {
  readonly titleArabic: string;
  readonly palette: PrintThemePaletteTokens;
}) {
  return (
    <div
      style={{
        backgroundColor: palette.primaryHex,
        color: "#FFFFFF",
        borderRadius: "3px",
        padding: "3px 12px",
      }}
      className="w-full text-center font-black text-[1.08em] tracking-tight break-inside-avoid print:break-inside-avoid"
    >
      {titleArabic}
    </div>
  );
}

export function ModernEditorialSubQuestionBanner({
  badgeLabelAr,
  instructionAr,
  palette,
}: {
  readonly badgeLabelAr: string;
  readonly instructionAr?: string;
  readonly palette: PrintThemePaletteTokens;
}) {
  const isPhotocopy = palette.primaryHex === "#000000";
  return (
    <div
      style={{
        backgroundColor: isPhotocopy ? "#F8FAFC" : palette.softSurfaceHex,
        borderRight: `9px solid ${palette.secondaryHex}`,
        padding: "2.5px 8px",
      }}
      className="w-full flex flex-wrap items-center gap-2 break-inside-avoid print:break-inside-avoid"
    >
      <span
        style={{
          border: `1.3px solid ${palette.primaryHex}`,
          color: palette.primaryHex,
          backgroundColor: "#FFFFFF",
          borderRadius: "9999px",
          padding: "0px 8px",
        }}
        className="text-[0.84em] font-black shrink-0"
      >
        {badgeLabelAr}
      </span>
      {instructionAr && (
        <span
          style={{ color: isPhotocopy ? "#0F172A" : palette.accentHex }}
          className="text-[0.88em] font-black"
        >
          {instructionAr}
        </span>
      )}
    </div>
  );
}
