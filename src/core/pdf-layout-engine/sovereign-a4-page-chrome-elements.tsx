"use client";

/**
 * @file sovereign-a4-page-chrome-elements.tsx
 * @description العناصر الزخرفية والهيكلية السيادية لورقة الـ A4 الوزارية:
 * 1. الترويسة الوزارية الكاملة للصفحة الأولى (`SovereignFirstPageHeader`).
 * 2. الترويسة الجارية الرشيقة للصفحات التالية (`SovereignRunningPageHeader`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

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
  const isPhotocopy = palette.primaryHex === "#000000";
  return (
    <header
      style={{
        borderColor: palette.primaryHex,
        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.05)",
      }}
      className={`rounded-xl border-[1.6px] bg-white overflow-hidden ${compact ? "mb-1" : "mb-1.5"} shrink-0`}
    >
      {/* ١. الصف الأول: الهوية المؤسسية يميناً وبيانات المعلم والإحصائيات يساراً */}
      <div
        style={{ backgroundColor: isPhotocopy ? "#FFFFFF" : "#F8FAFC" }}
        className={`flex items-center justify-between ${compact ? "px-2.5 py-0.5" : "px-2.5 py-1"} gap-2 border-b border-slate-200`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            style={{ background: palette.headerGradientCss }}
            className="w-7 h-7 rounded-md text-white flex items-center justify-center text-xs font-black overflow-hidden shrink-0"
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
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span style={{ color: palette.primaryHex }} className="text-[9.5pt] font-black leading-tight truncate">
              {identity.platformBrandName}
            </span>
            <span className="text-slate-300">|</span>
            <span style={{ color: palette.secondaryHex }} className="text-[7.5pt] font-extrabold truncate">
              {/اختبار|امتحان|تقييم/i.test(documentTitle)
                ? isSolvedMode
                  ? "نموذج إجابة الاختبار الرسمي"
                  : "ورقة تقييم واختبار رسمي"
                : isSolvedMode
                  ? "مذكرة الشرح والتأسيس والتطبيقات"
                  : "ورقة تقييم وتدريب"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[7.8pt] font-bold shrink-0">
          <span style={{ color: palette.primaryHex }} className="font-black">
            المعلم: {identity.teacherFullName}
            {identity.teacherNickname ? ` (${identity.teacherNickname})` : ""}
          </span>
          {identity.teacherPhone && (
            <span className="text-slate-700 font-mono font-extrabold">
              • {formatNumeralsByModeSSOT(identity.teacherPhone, numeralMode)}
            </span>
          )}
          {!compact && (
            <span className="text-slate-500 font-extrabold">
              • الأفكار ({formatNumeralsByModeSSOT(totalIdeasCount, numeralMode)}) | المسائل (
              {formatNumeralsByModeSSOT(totalQuestionsCount, numeralMode)})
            </span>
          )}
        </div>
      </div>

      {/* ٢. الصف الثاني: شريط عنوان المستند العرضي الكامل بخلفية هادئة غير صارخة */}
      <div
        style={{
          backgroundColor: isPhotocopy ? "#FFFFFF" : palette.softSurfaceHex,
          borderRight: `3.5px solid ${palette.primaryHex}`,
          borderLeft: `3.5px solid ${palette.primaryHex}`,
        }}
        className={`w-full ${compact ? "px-3 py-0.5" : "px-3 py-1"} flex flex-wrap items-center justify-center gap-2 text-center border-b border-slate-200`}
      >
        <span style={{ color: palette.primaryHex }} className="text-[10.8pt] font-black leading-snug">
          {documentTitle}
        </span>
        {!compact && subtitleAr && (
          <span
            style={{
              backgroundColor: isPhotocopy ? "#FFFFFF" : palette.badgeBgHex,
              color: palette.secondaryHex,
              border: `1px solid ${isPhotocopy ? "#334155" : `${palette.borderHex}66`}`,
            }}
            className="inline-block px-2.5 py-0.2 rounded-full text-[7.6pt] font-black shrink-0"
          >
            {subtitleAr}
          </span>
        )}
      </div>

      {/* ٣. الصف الثالث: شريط بيانات الطالب */}
      <div
        style={{ backgroundColor: isPhotocopy ? "#FFFFFF" : palette.badgeBgHex }}
        className="px-3 py-0.5 flex flex-wrap items-center justify-between gap-2 text-[7.8pt] font-black text-slate-800"
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
  const isPhotocopy = palette.primaryHex === "#000000";
  return (
    <div
      style={{
        borderColor: palette.primaryHex,
        backgroundColor: isPhotocopy ? "#FFFFFF" : "#F8FAFC",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
      }}
      className="rounded-lg border px-2.5 py-0.5 mb-1 flex items-center justify-between gap-2 text-[7.8pt] font-black text-slate-700 shrink-0"
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

export {
  SovereignPageNumberFooterBar,
  SovereignDocumentAccreditationBox,
} from "./sovereign-a4-footer-accreditation-elements";
