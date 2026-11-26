"use client";

/**
 * @file official-school-exam-frame-and-footer.tsx
 * @description الإطار الهندسي المزدوج وزوايا الصفحة وشريط التذييل وشريط الأمنيات لقالب الامتحان المدرسي الرسمي.
 * مفصول ذرياً عن الترويسة العلوية للالتزام بسقف الـ 300 سطر في دستور المنصة (AGENTS.md).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 220 سطراً).
 */

import React from "react";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import { PdfPhoneIcon, PdfSparkleIcon } from "./pdf-inline-vector-badge-icons";

export const MODULE_ID_OFFICIAL_SCHOOL_EXAM_FRAME_AND_FOOTER =
  "official_school_exam_frame_and_footer" as const;

export function OfficialSchoolCornerCropMarks({
  primaryHex = "#172B5E",
  accentHex = "#4A6FA5",
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
      <svg
        width="776"
        height="1105"
        viewBox="0 0 776 1105"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "3px",
          right: "3px",
          bottom: "3px",
          left: "3px",
          width: "calc(100% - 6px)",
          height: "calc(100% - 6px)",
          pointerEvents: "none",
          display: "block",
        }}
      >
        <rect
          x="0.6"
          y="0.6"
          width="774.8"
          height="1103.8"
          rx="7"
          ry="7"
          fill="none"
          stroke={accentHex}
          strokeOpacity={0.55}
          strokeWidth={1.2}
          strokeDasharray="5 3.5"
        />
      </svg>
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
  const primaryHex = palette?.primaryHex || "#172B5E";
  const softSurfaceHex = palette?.softSurfaceHex || "#F7F9FC";
  const isPhotocopy = primaryHex === "#000000";
  const headerGradient =
    palette?.headerGradientCss || "linear-gradient(135deg, #112046 0%, #1B356B 55%, #284E8F 100%)";

  return (
    <footer
      style={{
        borderTop: `1.5px solid ${primaryHex}`,
        paddingTop: "4px",
      }}
      className="w-full flex items-center justify-between text-[10.5px] text-slate-900 select-none break-inside-avoid print:break-inside-avoid"
    >
      <div
        style={{
          border: `1.4px solid ${primaryHex}`,
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
            className="font-mono font-black text-[10px] inline-flex items-center gap-1"
          >
            <PdfPhoneIcon />
            <span>{formatNumeralsByModeSSOT(teacherPhone, numeralMode)}</span>
          </span>
        )}
        {academyName && (
          <span
            style={{
              backgroundColor: isPhotocopy ? "#FFFFFF" : softSurfaceHex,
              border: `1.2px solid ${primaryHex}`,
              color: primaryHex,
              borderRadius: "6px",
              padding: "1px 8px",
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
  const primaryHex = palette?.primaryHex || "#172B5E";
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
      <span className="inline-flex items-center gap-1.5">
        <PdfSparkleIcon />
        <span>مع أطيب تمنياتي لكم بالتفوق والدرجة النهائية</span>
        <PdfSparkleIcon />
      </span>
    </div>
  );
}
