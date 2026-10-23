"use client";

/**
 * @file two-column-newspaper-packer.tsx
 * @description مكون ذري مستقل لتصيير لوحة ورقة الـ A4 البيضاء الناصعة بالترويسة السيادية المدمجة (42pt)،
 * ونظام العمودين المتوازيين (2-Column Newspaper Packing)، وتذييل الصفحة الرسمي، مع التحجيم التلقائي لشاشة الهاتف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import React, { useState, useEffect, useRef } from "react";
import {
  PRINT_FONT_FAMILIES_SSOT,
  type PDFPrintSettingsStateSSOT,
} from "../ssot/pdf-print-settings-ssot";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  loadTeacherIdentitySSOT,
} from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import {
  resolvePrintThemePalette,
  type PrintableMathQuestionItem,
} from "./a4-vector-html-sheet-renderer";
import SideBySideDiagramDocker from "./side-by-side-diagram-docker";

export const MODULE_ID_TWO_COLUMN_NEWSPAPER_PACKER =
  "two_column_newspaper_packer" as const;

export interface TwoColumnNewspaperPackerProps {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly sheetContainerRef: React.RefObject<HTMLDivElement | null>;
  readonly children?: React.ReactNode;
}

export default function TwoColumnNewspaperPacker({
  settings,
  questions,
  sheetContainerRef,
  children,
}: TwoColumnNewspaperPackerProps) {
  const [mobileZoomScale, setMobileZoomScale] = useState<number>(1);
  const [identity, setIdentity] = useState(DEFAULT_OWNER_TEACHER_IDENTITY_SSOT);
  const viewportWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIdentity(loadTeacherIdentitySSOT());
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const w = viewportWrapperRef.current?.clientWidth || window.innerWidth;
      if (w < 820) {
        const computed = Math.max(0.42, Math.min(1, (w - 16) / 794));
        setMobileZoomScale(Number(computed.toFixed(2)));
      } else {
        setMobileZoomScale(1);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const activeFont = PRINT_FONT_FAMILIES_SSOT[settings.fontFamilyId];
  const themePalette = resolvePrintThemePalette(settings.colorThemeId);

  const densityGapClass =
    settings.densityMode === "ultra_compact"
      ? "gap-2"
      : settings.densityMode === "standard_balanced"
      ? "gap-3.5"
      : "gap-5";

  return (
    <div
      ref={viewportWrapperRef}
      className="w-full overflow-hidden flex flex-col items-center bg-slate-200/70 dark:bg-slate-900/60 rounded-2xl p-2 sm:p-4 border border-slate-300/80 dark:border-slate-800"
    >
      <div
        style={{
          width: "794px",
          transform: `scale(${mobileZoomScale})`,
          transformOrigin: "top center",
          marginBottom:
            mobileZoomScale < 1
              ? `${Math.round((mobileZoomScale - 1) * 1122)}px`
              : "0px",
        }}
        className="transition-transform duration-200"
      >
        <div
          ref={sheetContainerRef}
          dir="rtl"
          className="w-[794px] min-h-[1122px] bg-white text-slate-950 shadow-2xl border border-slate-300 p-[6mm] flex flex-col justify-between"
          style={{
            backgroundColor: "#ffffff",
            color: "#0f172a",
            fontFamily: activeFont.cssFontStack,
            fontSize: `${settings.exactFontSizePt}pt`,
            lineHeight: activeFont.optimalLineHeight,
          }}
        >
          <div>
            {/* الترويسة السيادية المدمجة (Compact 42pt Sovereign Header) */}
            <header
              style={{ borderColor: themePalette.primaryHex }}
              className="h-[46px] px-3 rounded-lg border-2 flex items-center justify-between text-xs font-extrabold mb-2.5"
            >
              <div className="flex items-center gap-2">
                <span
                  style={{
                    backgroundColor: themePalette.primaryHex,
                    color: "#ffffff",
                  }}
                  className="w-6 h-6 rounded-md flex items-center justify-center font-black"
                >
                  ∑
                </span>
                <span>
                  {identity.platformBrandName} • {identity.teacherNickname || identity.teacherFullName}
                </span>
              </div>
              <div
                style={{ color: themePalette.primaryHex }}
                className="text-sm font-black tracking-tight"
              >
                {settings.customDocumentTitle}
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span>
                  الزمن:{" "}
                  {formatNumeralsByModeSSOT(
                    settings.customDurationText,
                    settings.numeralMode
                  )}
                </span>
                <span>
                  الدرجة:{" "}
                  {formatNumeralsByModeSSOT("٢٠", settings.numeralMode)}
                </span>
              </div>
            </header>

            {/* شبكة الأسئلة المعبأة (عمود واحد أو عمودين متوازيين) */}
            <div
              className={`grid ${
                settings.columnsCount === 2 ? "grid-cols-2" : "grid-cols-1"
              } ${densityGapClass} relative`}
            >
              {questions.map((q) => (
                <SideBySideDiagramDocker
                  key={q.id}
                  question={q}
                  settings={settings}
                />
              ))}
            </div>

            {children}
          </div>

          <footer className="pt-2 border-t border-slate-300 flex items-center justify-between text-[9.5pt] font-bold text-slate-600">
            <span>{identity.footerText}</span>
            <span>
              صفحة {formatNumeralsByModeSSOT(1, settings.numeralMode)} من{" "}
              {formatNumeralsByModeSSOT(1, settings.numeralMode)}
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
