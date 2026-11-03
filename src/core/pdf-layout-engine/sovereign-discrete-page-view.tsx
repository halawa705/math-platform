"use client";

/**
 * @file sovereign-discrete-page-view.tsx
 * @description ورقة A4 منفصلة (794×1123px) تعرض مقاطع التدفق: مقاطع بعرض كامل، ومقاطع بعمودين متوازنين (الأيمن ثم الأيسر).
 * حجم الخط ثابت = الحجم المختار بالضبط (لا تصغير)، والفراغ المتبقي يُوزَّع كمسافة مرنة ثم كتمديد محدود لبطاقات الأسئلة (targetHeightPxById).
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
import {
  OfficialSchoolCornerCropMarks,
  OfficialSchoolFirstPageHeader,
  OfficialSchoolPageFooterBar,
  OfficialSchoolRunningPageHeader,
} from "./official-school-exam-page-chrome";

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

/** غلاف الكائن في الصفحة: يمنحه الارتفاع المستهدف (عند التمديد) ويملأ المحتوى هذا الارتفاع بدل ترك فراغ تحت البطاقة. */
function FlowItemSlot({ item, targetHeightPx, renderFlowItem, isSchoolExam = false }: {
  readonly item: FlowItem;
  readonly targetHeightPx: number | undefined;
  readonly renderFlowItem: (item: FlowItem) => React.ReactNode;
  readonly isSchoolExam?: boolean;
}) {
  return (
    <div
      className="w-full min-w-0 flex flex-col"
      style={!isSchoolExam && targetHeightPx ? { minHeight: `${targetHeightPx}px` } : undefined}
    >
      <div className="flex-1 min-w-0 flex flex-col">{renderFlowItem(item)}</div>
    </div>
  );
}

function FlowColumn({ items, gapPx, targets, renderFlowItem, isSchoolExam = false }: {
  readonly items: readonly FlowItem[];
  readonly gapPx: number;
  readonly targets: Readonly<Record<string, number>>;
  readonly renderFlowItem: (item: FlowItem) => React.ReactNode;
  readonly isSchoolExam?: boolean;
}) {
  return (
    <div className="flex flex-col min-w-0" style={{ gap: `${gapPx}px` }}>
      {items.map((item) => (
        <FlowItemSlot
          key={item.id}
          item={item}
          targetHeightPx={targets[item.id]}
          renderFlowItem={renderFlowItem}
          isSchoolExam={isSchoolExam}
        />
      ))}
    </div>
  );
}

export function SovereignDiscretePageView({
  page, totalPagesCount, settings, identity, palette, activeFont, subtitleAr = "",
  isSolvedMode, totalIdeasCount, totalQuestionsCount, totalMarks, renderFlowItem,
}: SovereignDiscretePageViewProps) {
  const isSchoolExam = settings.paperTemplateId === "official_school_exam";

  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily: activeFont.cssFontStack,
        fontSize: `${settings.exactFontSizePt}pt`,
        lineHeight: activeFont.optimalLineHeight,
        boxShadow: isSchoolExam ? undefined : `inset 0 0 0 1px ${palette.borderHex}33`,
        border: isSchoolExam ? "2.5pt solid #1e3a8a" : undefined,
        outline: isSchoolExam ? "1.2pt dashed #93c5fd" : undefined,
        outlineOffset: isSchoolExam ? "-5pt" : undefined,
        borderRadius: isSchoolExam ? "4pt" : undefined,
      }}
      className={`sovereign-a4-page-sheet w-[794px] h-[1123px] bg-white text-slate-950 shadow-2xl ${
        isSchoolExam ? "px-[16px] py-[14px]" : "px-[20px] py-[18px]"
      } flex flex-col justify-between relative overflow-hidden rounded-sm border border-slate-300 print:border-0 print:rounded-none print:shadow-none`}
    >
      {isSchoolExam && <OfficialSchoolCornerCropMarks />}

      <div className="w-full min-w-0 flex-1 flex flex-col relative z-10">
        {isSchoolExam ? (
          page.isFirstPage ? (
            <OfficialSchoolFirstPageHeader
              identity={identity}
              documentTitle={settings.customDocumentTitle}
              subtitleAr={subtitleAr}
              durationText={settings.customDurationText}
              numeralMode={settings.numeralMode}
              isSolvedMode={isSolvedMode}
            />
          ) : (
            <OfficialSchoolRunningPageHeader
              identity={identity}
              documentTitle={settings.customDocumentTitle}
              subtitleAr={subtitleAr}
              pageNumber={page.pageNumber}
              totalPages={totalPagesCount}
              numeralMode={settings.numeralMode}
            />
          )
        ) : page.isFirstPage ? (
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
            compact={settings.compactHeader}
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

        <div className="w-full min-w-0 flex flex-col" style={{ gap: isSchoolExam ? "2px" : `${page.gapPx}px` }}>
          {page.segments.map((segment, index) =>
            segment.kind === "full" ? (
              <FlowItemSlot
                key={segment.item.id}
                item={segment.item}
                targetHeightPx={page.targetHeightPxById[segment.item.id]}
                renderFlowItem={renderFlowItem}
                isSchoolExam={isSchoolExam}
              />
            ) : (
              <div
                key={`columns-${index}`}
                className="grid grid-cols-2 items-start w-full min-w-0"
                style={{ columnGap: `${FLOW_COLUMN_GAP_PX}px` }}
              >
                <FlowColumn
                  items={segment.rightItems}
                  gapPx={isSchoolExam ? 2 : page.gapPx}
                  targets={page.targetHeightPxById}
                  renderFlowItem={renderFlowItem}
                  isSchoolExam={isSchoolExam}
                />
                <FlowColumn
                  items={segment.leftItems}
                  gapPx={isSchoolExam ? 2 : page.gapPx}
                  targets={page.targetHeightPxById}
                  renderFlowItem={renderFlowItem}
                  isSchoolExam={isSchoolExam}
                />
              </div>
            )
          )}
        </div>
      </div>

      <div className="relative z-10 w-full">
        {isSchoolExam ? (
          <OfficialSchoolPageFooterBar
            identity={identity}
            pageNumber={page.pageNumber}
            totalPages={totalPagesCount}
            numeralMode={settings.numeralMode}
          />
        ) : (
          <SovereignPageNumberFooterBar
            identity={identity}
            palette={palette}
            pageNumber={page.pageNumber}
            totalPages={totalPagesCount}
            numeralMode={settings.numeralMode}
          />
        )}
      </div>
    </section>
  );
}
