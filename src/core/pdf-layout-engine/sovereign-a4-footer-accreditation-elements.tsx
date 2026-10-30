"use client";

/**
 * @file sovereign-a4-footer-accreditation-elements.tsx
 * @description شريط التذييل السفلي المرقم لكل صفحة (`SovereignPageNumberFooterBar`) وخاتمة الاعتماد (`SovereignDocumentAccreditationBox`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 115 سطراً).
 */

import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_SOVEREIGN_A4_FOOTER_ACCREDITATION_ELEMENTS =
  "sovereign_a4_footer_accreditation_elements" as const;

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
