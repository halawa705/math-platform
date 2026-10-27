"use client";

/**
 * @file sovereign-discrete-page-view.tsx
 * @description مصير ورقة A4 السيادية المنفصلة بنظام النوابض المتجاوبة (Responsive Spring-Box Sheet):
 * - يوزع الكائنات بمرونة عالية لمنع الفراغات الميتة في الصفحات المريحة (utilization < 72%).
 * - يطبق معامل الضغط التناسبي الدقيق (contentScale) في الصفحات الكثيفة لمنع ترحيل الأسئلة الزائد.
 * - يضمن استقلال كل صفحة كوثيقة Vector A4 رسمية ومحمية من التكسير أو التراكب.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import React from "react";
import type { PDFPrintSettingsStateSSOT, PrintFontFamilySpecification } from "../ssot/pdf-print-settings-ssot";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import type { DiscreteMeasuredA4Page, SovereignA4RowBlock } from "./sovereign-a4-page-blocks-builder";
import {
  SovereignFirstPageHeader,
  SovereignPageNumberFooterBar,
  SovereignRunningPageHeader,
} from "./sovereign-a4-page-chrome-elements";

export const MODULE_ID_SOVEREIGN_DISCRETE_PAGE_VIEW =
  "sovereign_discrete_page_view" as const;

export interface SovereignDiscretePageViewProps {
  readonly page: DiscreteMeasuredA4Page;
  readonly totalPagesCount: number;
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly identity: OwnerTeacherIdentity;
  readonly palette: PrintThemePaletteTokens;
  readonly activeFont: PrintFontFamilySpecification;
  readonly subtitleAr?: string;
  readonly isSolvedMode: boolean;
  readonly totalIdeasCount: number;
  readonly totalQuestionsCount: number;
  readonly totalMarks: number;
  readonly renderBlockContent: (block: SovereignA4RowBlock) => React.ReactNode;
}

export function SovereignDiscretePageView({
  page,
  totalPagesCount,
  settings,
  identity,
  palette,
  activeFont,
  subtitleAr = "",
  isSolvedMode,
  totalIdeasCount,
  totalQuestionsCount,
  totalMarks,
  renderBlockContent,
}: SovereignDiscretePageViewProps) {
  const isRelaxed = page.usedHeightPx < page.budgetHeightPx * 0.72;
  const computedFontSizePt = Number(
    (settings.exactFontSizePt * page.contentScale).toFixed(2)
  );

  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily: activeFont.cssFontStack,
        fontSize: `${computedFontSizePt}pt`,
        lineHeight: activeFont.optimalLineHeight,
      }}
      className="sovereign-a4-page-sheet w-[794px] h-[1123px] bg-white text-slate-950 shadow-2xl px-[20px] py-[18px] flex flex-col justify-between relative overflow-hidden rounded-sm border border-slate-300 print:border-0 print:rounded-none print:shadow-none"
    >
      <div className="w-full min-w-0 flex-1 flex flex-col">
        {page.isFirstPage ? (
          <SovereignFirstPageHeader
            identity={identity}
            palette={palette}
            documentTitle={settings.customDocumentTitle}
            subtitleAr={subtitleAr}
            isSolvedMode={isSolvedMode}
            totalIdeasCount={totalIdeasCount}
            totalQuestionsCount={totalQuestionsCount}
            totalMarks={totalMarks}
            numeralMode={settings.numeralMode}
          />
        ) : (
          <SovereignRunningPageHeader
            identity={identity}
            palette={palette}
            documentTitle={settings.customDocumentTitle}
            subtitleAr={subtitleAr}
            pageNumber={page.pageNumber}
            totalPages={totalPagesCount}
            numeralMode={settings.numeralMode}
          />
        )}

        {/* الحاوية الذكية المرنة التي توزع الكائنات رأسياً لمنع الفراغ السفلي الميت */}
        <div
          className={`${
            isRelaxed
              ? "flex-1 flex flex-col justify-around py-1"
              : "space-y-1.5"
          } w-full min-w-0`}
        >
          {page.blocks.map((block) => (
            <div key={block.id} className="w-full min-w-0">
              {renderBlockContent(block)}
            </div>
          ))}
        </div>
      </div>

      <SovereignPageNumberFooterBar
        identity={identity}
        palette={palette}
        pageNumber={page.pageNumber}
        totalPages={totalPagesCount}
        numeralMode={settings.numeralMode}
      />
    </section>
  );
}
