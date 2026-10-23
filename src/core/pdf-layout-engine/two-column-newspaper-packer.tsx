"use client";

/**
 * @file two-column-newspaper-packer.tsx
 * @description مكون ذري مستقل لتصيير لوحة ورقة الـ A4 البيضاء الناصعة بالتصميم الوزاري المصري العصري الفاخر:
 * - إطار ملكي مزدوج مع علامة مائية قطرية شفافة في خلفية الورقة.
 * - الترويسة السيادية ذات الشريط المتدرج (`headerGradientCss`) وشريط بيانات الطالب والدرجة الكلية.
 * - شبكة العمودين المتوازيين (أو العمود الواحد) للأمثلة والأسئلة والرسوم الهندسية المتجهية.
 * - جدول مفتاح إجابات الاختيار من متعدد السريع (`OfficialMcqAnswerKeySummaryTable`) في وضع الحلول.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import React, { useState, useEffect, useRef } from "react";
import {
  PRINT_FONT_FAMILIES_SSOT,
  type PDFPrintSettingsStateSSOT,
} from "../ssot/pdf-print-settings-ssot";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  IDENTITY_UPDATED_EVENT_NAME,
  loadTeacherIdentitySSOT,
} from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import {
  resolvePrintThemePalette,
  type PrintableMathQuestionItem,
} from "./a4-vector-html-sheet-renderer";
import { OfficialMcqAnswerKeySummaryTable } from "./a4-pedagogical-capsule-and-key-table";
import SideBySideDiagramDocker from "./side-by-side-diagram-docker";

export const MODULE_ID_TWO_COLUMN_NEWSPAPER_PACKER =
  "two_column_newspaper_packer" as const;

export interface TwoColumnNewspaperPackerProps {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly subtitleAr?: string;
  readonly sheetContainerRef: React.RefObject<HTMLDivElement | null>;
  readonly children?: React.ReactNode;
}

export default function TwoColumnNewspaperPacker({
  settings,
  questions,
  subtitleAr = "",
  sheetContainerRef,
  children,
}: TwoColumnNewspaperPackerProps) {
  const [mobileZoomScale, setMobileZoomScale] = useState<number>(1);
  const [identity, setIdentity] = useState(DEFAULT_OWNER_TEACHER_IDENTITY_SSOT);
  const viewportWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIdentity(loadTeacherIdentitySSOT());
    const sync = () => setIdentity(loadTeacherIdentitySSOT());
    window.addEventListener(IDENTITY_UPDATED_EVENT_NAME, sync);
    return () => window.removeEventListener(IDENTITY_UPDATED_EVENT_NAME, sync);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const w = viewportWrapperRef.current?.clientWidth || window.innerWidth;
      setMobileZoomScale(w < 820 ? Number(Math.max(0.42, Math.min(1, (w - 16) / 794)).toFixed(2)) : 1);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const activeFont = PRINT_FONT_FAMILIES_SSOT[settings.fontFamilyId];
  const palette = resolvePrintThemePalette(settings.colorThemeId);
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const isSolvedMode = settings.answerVisibilityMode !== "questions_only";
  const densityGap =
    settings.densityMode === "ultra_compact"
      ? "gap-2"
      : settings.densityMode === "standard_balanced"
        ? "gap-2.5"
        : "gap-3.5";

  return (
    <div
      ref={viewportWrapperRef}
      className="w-full overflow-hidden flex flex-col items-center bg-slate-200/70 dark:bg-slate-900/60 rounded-3xl p-2 sm:p-5 border border-slate-300/80 dark:border-slate-800"
    >
      <div
        style={{
          width: "794px",
          transform: `scale(${mobileZoomScale})`,
          transformOrigin: "top center",
          marginBottom: mobileZoomScale < 1 ? `${Math.round((mobileZoomScale - 1) * 1123)}px` : "0px",
        }}
        className="transition-transform duration-200"
      >
        <div
          ref={sheetContainerRef}
          dir="rtl"
          className="w-[794px] min-h-[1123px] bg-white text-slate-950 shadow-2xl p-[5mm] flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            color: "#0f172a",
            fontFamily: activeFont.cssFontStack,
            fontSize: `${settings.exactFontSizePt}pt`,
            lineHeight: activeFont.optimalLineHeight,
          }}
        >
          <div
            style={{ color: palette.primaryHex }}
            className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.035] -rotate-24 text-[44pt] font-black whitespace-nowrap"
          >
            {identity.watermarkText || identity.platformBrandName}
          </div>

          <div
            style={{ borderColor: palette.primaryHex }}
            className="w-full flex-1 rounded-2xl border-[2.5px] p-3 flex flex-col justify-between gap-2.5 relative z-10"
          >
            <div className="space-y-2.5">
              <header
                style={{ borderColor: palette.primaryHex }}
                className="rounded-xl border-2 bg-white overflow-hidden shadow-2xs"
              >
                <div
                  style={{ background: palette.headerGradientCss }}
                  className="px-3 py-1.5 text-white flex items-center justify-between text-[8.5pt] font-black"
                >
                  <span>📐 {identity.platformBrandName} — سلسلة الرياضيات المعتمدة</span>
                  <span>{isSolvedMode ? "✓ نسخة محلولة ومعتمدة" : "📄 ورقة أسئلة وتقييم"}</span>
                </div>

                <div
                  style={{ backgroundColor: palette.softSurfaceHex }}
                  className="grid grid-cols-12 items-center p-2.5 gap-2 border-b border-slate-200"
                >
                  <div className="col-span-4 border-l border-slate-200 pl-2 flex items-center gap-2">
                    <div
                      style={{ backgroundColor: palette.primaryHex }}
                      className="w-9 h-9 rounded-lg text-white flex items-center justify-center text-sm font-black overflow-hidden shrink-0"
                    >
                      {identity.platformLogoUrl ? (
                        <img src={identity.platformLogoUrl} alt={identity.platformBrandName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{identity.platformLogoSymbol || "∑"}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ color: palette.primaryHex }} className="text-[10.5pt] font-black leading-tight">
                        {identity.teacherFullName}
                      </div>
                      <div className="text-[8pt] font-bold text-slate-600">
                        {identity.teacherNickname || "خبير تدريس الرياضيات"}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 text-center space-y-1 px-1">
                    <div className="text-[11.5pt] font-black text-slate-950 leading-snug">
                      {settings.customDocumentTitle}
                    </div>
                    {subtitleAr && (
                      <span
                        style={{ backgroundColor: palette.primaryHex }}
                        className="inline-block px-3 py-0.5 rounded-full text-white text-[8pt] font-black"
                      >
                        {subtitleAr}
                      </span>
                    )}
                  </div>

                  <div className="col-span-4 border-r border-slate-200 pr-2 text-left space-y-0.5 text-[8.5pt] font-bold">
                    {identity.teacherPhone && (
                      <div className="text-slate-700 font-mono">
                        هاتف: {formatNumeralsByModeSSOT(identity.teacherPhone, settings.numeralMode)}
                      </div>
                    )}
                    <div style={{ color: palette.secondaryHex }} className="font-black">
                      الأسئلة: ({formatNumeralsByModeSSOT(questions.length, settings.numeralMode)}) | الزمن:{" "}
                      {formatNumeralsByModeSSOT(settings.customDurationText, settings.numeralMode)}
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1 bg-white flex items-center justify-between text-[8.5pt] font-extrabold text-slate-700">
                  <span>اسم الطالب: ........................................</span>
                  <span>الكود / المجموعة: ......................</span>
                  <span style={{ color: palette.primaryHex }} className="font-black">
                    الدرجة الكلية: ...... / {formatNumeralsByModeSSOT(totalMarks, settings.numeralMode)}
                  </span>
                </div>
              </header>

              {questions.length === 0 ? (
                <div className="py-24 text-center space-y-2 rounded-xl border-2 border-dashed border-slate-200">
                  <div className="text-3xl">📄</div>
                  <div className="text-sm font-black text-slate-500">لا توجد أسئلة في الورقة بعد</div>
                  <div className="text-xs font-bold text-slate-400">
                    ولّد البرومبت ثم الصق رد NotebookLM وصيّره لتظهر الأسئلة هنا بتصميم وزاري فاخر.
                  </div>
                </div>
              ) : (
                <div className={`grid ${settings.columnsCount === 2 ? "grid-cols-2" : "grid-cols-1"} ${densityGap}`}>
                  {questions.map((q) => (
                    <SideBySideDiagramDocker key={q.id} question={q} settings={settings} />
                  ))}
                </div>
              )}

              {isSolvedMode && questions.length > 0 && (
                <OfficialMcqAnswerKeySummaryTable
                  questions={questions}
                  palette={palette}
                  numeralMode={settings.numeralMode}
                  notationLanguage={settings.notationLanguage}
                />
              )}

              {children}
            </div>

            <footer
              style={{ borderColor: palette.primaryHex }}
              className="pt-1.5 border-t-2 flex items-center justify-between text-[8.5pt] font-black text-slate-600 px-1"
            >
              <span>{identity.platformBrandName} • {identity.teacherFullName}</span>
              <span style={{ color: palette.secondaryHex }}>{identity.footerText} 🌟</span>
              <span>صفحة {formatNumeralsByModeSSOT(1, settings.numeralMode)}</span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
