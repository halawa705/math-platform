"use client";

/**
 * @file sovereign-discrete-page-view.tsx
 * @description ورقة A4 منفصلة (794×1123px) تعرض مقاطع التدفق: مقاطع بعرض كامل، ومقاطع بعمودين متوازنين (الأيمن ثم الأيسر).
 * حجم الخط ثابت = الحجم المختار بالضبط (لا تصغير)، والفراغ المتبقي يُوزَّع كمسافة مرنة بين الكائنات.
 */

import React from "react";
import type { PDFPrintSettingsStateSSOT, PrintFontFamilySpecification } from "../ssot/pdf-print-settings-ssot";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import type { FlowItem, FlowPage } from "./flow-item-model";
import { FLOW_COLUMN_GAP_PX } from "./flow-page-geometry-constants";
import {
  SovereignFirstPageHeader,
  SovereignPageNumberFooterBar,
  SovereignRunningPageHeader,
} from "./sovereign-a4-page-chrome-elements";

export const MODULE_ID_SOVEREIGN_DISCRETE_PAGE_VIEW =
  "sovereign_discrete_page_view" as const;

export interface SovereignDiscretePageViewProps {
  readonly page: FlowPage;
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
  readonly renderFlowItem: (item: FlowItem) => React.ReactNode;
}

function FlowColumn({ items, gapPx, renderFlowItem }: {
  readonly items: readonly FlowItem[];
  readonly gapPx: number;
  readonly renderFlowItem: (item: FlowItem) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-w-0" style={{ gap: `${gapPx}px` }}>
      {items.map((item) => (
        <div key={item.id} className="w-full min-w-0">{renderFlowItem(item)}</div>
      ))}
    </div>
  );
}

export function SovereignDiscretePageView({
  page, totalPagesCount, settings, identity, palette, activeFont, subtitleAr = "",
  isSolvedMode, totalIdeasCount, totalQuestionsCount, totalMarks, renderFlowItem,
}: SovereignDiscretePageViewProps) {
  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily: activeFont.cssFontStack,
        fontSize: `${settings.exactFontSizePt}pt`,
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

        <div className="w-full min-w-0 flex flex-col" style={{ gap: `${page.gapPx}px` }}>
          {page.segments.map((segment, index) =>
            segment.kind === "full" ? (
              <div key={segment.item.id} className="w-full min-w-0">{renderFlowItem(segment.item)}</div>
            ) : (
              <div
                key={`columns-${index}`}
                className="grid grid-cols-2 items-start w-full min-w-0"
                style={{ columnGap: `${FLOW_COLUMN_GAP_PX}px` }}
              >
                <FlowColumn items={segment.rightItems} gapPx={page.gapPx} renderFlowItem={renderFlowItem} />
                <FlowColumn items={segment.leftItems} gapPx={page.gapPx} renderFlowItem={renderFlowItem} />
              </div>
            )
          )}
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
