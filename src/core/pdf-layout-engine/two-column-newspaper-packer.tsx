"use client";

/**
 * @file two-column-newspaper-packer.tsx
 * @description مكون ذري مستقل لتصيير لوحة ورقة الـ A4 البيضاء الناصعة بالتصميم الوزاري المصري الفاخر:
 * - إطار ملكي مزدوج محيط بالصفحة.
 * - الترويسة الثلاثية السيادية (الصرح التعليمي | عنوان المذكرة والصف | بيانات المعلم والهاتف) + شريط بيانات الطالب.
 * - شريط الفكرة الملكي + صندوقي (💡 المفهوم الرياضي والشرح | 📐 القاعدة والقانون المعتمد).
 * - شبكة العمودين المتوازيين للأمثلة والأسئلة والرسوم الهندسية المتجهية.
 * - بطاقة اعتماد وإشراف المذكرة التعليمية في ذيل الصفحة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
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
          marginBottom:
            mobileZoomScale < 1
              ? `${Math.round((mobileZoomScale - 1) * 1123)}px`
              : "0px",
        }}
        className="transition-transform duration-200"
      >
        <div
          ref={sheetContainerRef}
          dir="rtl"
          className="w-[794px] min-h-[1123px] bg-white text-slate-950 shadow-2xl p-[5mm] flex flex-col justify-between"
          style={{
            backgroundColor: "#ffffff",
            color: "#0f172a",
            fontFamily: activeFont.cssFontStack,
            fontSize: `${settings.exactFontSizePt}pt`,
            lineHeight: activeFont.optimalLineHeight,
          }}
        >
          {/* الإطار الملكي الخارجي المحيط بورقة الـ A4 */}
          <div
            style={{ borderColor: themePalette.primaryHex }}
            className="w-full flex-1 rounded-2xl border-[2.5px] p-3 flex flex-col justify-between gap-2.5"
          >
            <div className="space-y-2.5">
              {/* ١. الترويسة الثلاثية السيادية (Sovereign 3-Box Ministerial Header) */}
              <header
                style={{ borderColor: themePalette.primaryHex }}
                className="rounded-xl border-2 bg-slate-50/70 overflow-hidden"
              >
                <div className="grid grid-cols-12 items-center p-2.5 gap-2 border-b border-slate-200">
                  {/* اليمين: اللوجو واسم المنصة/السنتر */}
                  <div className="col-span-4 border-l border-slate-200 pl-2 flex items-center gap-2">
                    <div
                      style={{ backgroundColor: themePalette.primaryHex }}
                      className="w-9 h-9 rounded-lg text-white flex items-center justify-center text-sm font-black overflow-hidden shrink-0"
                    >
                      {identity.platformLogoUrl ? (
                        <img
                          src={identity.platformLogoUrl}
                          alt={identity.platformBrandName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{identity.platformLogoSymbol || "🛡️"}</span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div
                        style={{ color: themePalette.primaryHex }}
                        className="text-[11pt] font-black leading-tight"
                      >
                        {identity.platformBrandName}
                      </div>
                      <div className="text-[8pt] font-extrabold text-teal-700">
                        مذكرة الشرح والتأسيس والتقييمات المعتمدة
                      </div>
                    </div>
                  </div>

                  {/* الوسط: عنوان الدرس/الاختبار + كبسولة الصف */}
                  <div className="col-span-4 text-center space-y-1 px-1">
                    <div className="text-[11.5pt] font-black text-slate-950 leading-snug">
                      {settings.customDocumentTitle}
                    </div>
                    {subtitleAr && (
                      <div>
                        <span
                          style={{
                            backgroundColor: themePalette.primaryHex,
                            color: "#ffffff",
                          }}
                          className="inline-block px-3 py-0.5 rounded-full text-[8.5pt] font-black"
                        >
                          {subtitleAr}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* اليسار: اسم المعلم والهاتف وعدد المسائل */}
                  <div className="col-span-4 border-r border-slate-200 pr-2 text-left space-y-0.5 text-[9pt] font-bold">
                    <div className="font-black text-slate-900">
                      المعلم: {identity.teacherFullName}{" "}
                      {identity.teacherNickname
                        ? `(${identity.teacherNickname})`
                        : ""}
                    </div>
                    {identity.teacherPhone && (
                      <div className="text-slate-600 font-mono">
                        هاتف:{" "}
                        {formatNumeralsByModeSSOT(
                          identity.teacherPhone,
                          settings.numeralMode
                        )}
                      </div>
                    )}
                    <div className="text-indigo-800 font-extrabold">
                      المسائل: (
                      {formatNumeralsByModeSSOT(
                        questions.length,
                        settings.numeralMode
                      )}
                      ) | الزمن:{" "}
                      {formatNumeralsByModeSSOT(
                        settings.customDurationText,
                        settings.numeralMode
                      )}
                    </div>
                  </div>
                </div>

                {/* شريط بيانات الطالب المدمج */}
                <div className="px-3 py-1 bg-white flex items-center justify-between text-[9pt] font-extrabold text-slate-700">
                  <span>اسم الطالب: ........................................</span>
                  <span>المجموعة: ......................</span>
                  <span>الفصل: ...............</span>
                  <span style={{ color: themePalette.primaryHex }}>
                    الدرجة: ...... /{" "}
                    {formatNumeralsByModeSSOT(
                      questions.reduce((sum, q) => sum + q.marks, 0),
                      settings.numeralMode
                    )}
                  </span>
                </div>
              </header>

              {/* ٣. شبكة الأمثلة والأسئلة المعبأة (عمودان متوازيان أو عمود واحد) */}
              {questions.length === 0 ? (
                <div className="py-24 text-center space-y-2 rounded-xl border-2 border-dashed border-slate-200">
                  <div className="text-3xl">📄</div>
                  <div className="text-sm font-black text-slate-500">
                    لا توجد أسئلة في الورقة بعد
                  </div>
                  <div className="text-xs font-bold text-slate-400">
                    ولّد المحتوى من الخطوة ١ ثم الصق رد NotebookLM وصيّره لتظهر الأسئلة هنا.
                  </div>
                </div>
              ) : (
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
              )}

              {children}
            </div>

            {/* ٤. بطاقة اعتماد وإشراف المذكرة التعليمية + التذييل الموحد */}
            <footer className="pt-2 border-t-2 border-slate-200 space-y-1.5">
              <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-center text-[8.5pt]">
                <div className="p-1 rounded-lg bg-white border border-slate-200/80">
                  <div className="text-slate-400 font-bold">الصرح التعليمي</div>
                  <div className="font-black text-slate-900">
                    {identity.platformBrandName}
                  </div>
                </div>
                {identity.teacherPhone && (
                  <div className="p-1 rounded-lg bg-white border border-slate-200/80">
                    <div className="text-slate-400 font-bold">للتواصل والواتساب</div>
                    <div className="font-black text-teal-800 font-mono">
                      {formatNumeralsByModeSSOT(
                        identity.teacherPhone,
                        settings.numeralMode
                      )}
                    </div>
                  </div>
                )}
                <div className="p-1 rounded-lg bg-white border border-slate-200/80">
                  <div className="text-slate-400 font-bold">معلم المادة</div>
                  <div className="font-black text-indigo-950">
                    {identity.teacherFullName}{" "}
                    {identity.teacherNickname
                      ? `(${identity.teacherNickname})`
                      : ""}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[8.5pt] font-extrabold text-slate-500 px-1">
                <span>{identity.footerText} 🌟</span>
                <span>
                  صفحة {formatNumeralsByModeSSOT(1, settings.numeralMode)} من{" "}
                  {formatNumeralsByModeSSOT(1, settings.numeralMode)}
                </span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
