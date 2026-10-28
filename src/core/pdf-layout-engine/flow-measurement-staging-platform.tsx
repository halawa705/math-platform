"use client";

/**
 * @file flow-measurement-staging-platform.tsx
 * @description منصة القياس الخفية: تعرض كل كائن تدفق بعرضه الحقيقي (عمود أو كامل)، والأسئلة ذات عرض العمود تُقاس أيضاً بعرض الصفحة
 * الكامل (مفتاح ::full) لأن البطاقة مرنة العرض، كما تقيس الترويسة الأولى والجارية والتذييل لاشتقاق ميزانية الصفحة الفعلية.
 * كل غلاف `display: flow-root` ليحتوي هوامش الأبناء (my-1 في الكبسولة) تماماً كما تفعل عناصر flex في الصفحة الحقيقية؛
 * كان غيابه يجعل القياس أقل من الواقع بـ 8px لكل كبسولة فتفيض الصفحة ويُقصّ تذييلها.
 */

import React from "react";
import type { PrintFontFamilySpecification, PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import { fullWidthHeightKey, type FlowItem } from "./flow-item-model";
import { FLOW_COLUMN_WIDTH_PX, FLOW_PAGE_INNER_WIDTH_PX } from "./flow-page-geometry-constants";
import {
  SovereignFirstPageHeader,
  SovereignPageNumberFooterBar,
  SovereignRunningPageHeader,
} from "./sovereign-a4-page-chrome-elements";

export const MODULE_ID_FLOW_MEASUREMENT_STAGING_PLATFORM = "flow_measurement_staging_platform" as const;

export interface FlowMeasurementStagingPlatformProps {
  readonly stagingRef: React.RefObject<HTMLDivElement | null>;
  readonly flowItems: readonly FlowItem[];
  readonly renderFlowItem: (item: FlowItem) => React.ReactNode;
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly identity: OwnerTeacherIdentity;
  readonly palette: PrintThemePaletteTokens;
  readonly activeFont: PrintFontFamilySpecification;
  readonly subtitleAr: string;
  readonly isSolvedMode: boolean;
  readonly totalIdeasCount: number;
  readonly totalQuestionsCount: number;
  readonly totalMarks: number;
}

const WRAPPER_BASE_STYLE: React.CSSProperties = { display: "flow-root" };

export function FlowMeasurementStagingPlatform(props: FlowMeasurementStagingPlatformProps) {
  const { stagingRef, flowItems, renderFlowItem, settings, identity, palette, activeFont } = props;
  const numeralMode = settings.numeralMode;
  return (
    <div
      ref={stagingRef}
      dir="rtl"
      aria-hidden="true"
      style={{
        width: `${FLOW_PAGE_INNER_WIDTH_PX}px`,
        position: "absolute",
        top: "-99999px",
        left: "-99999px",
        visibility: "hidden",
        pointerEvents: "none",
        fontFamily: activeFont.cssFontStack,
        fontSize: `${settings.exactFontSizePt}pt`,
        lineHeight: activeFont.optimalLineHeight,
      }}
    >
      <div data-flow-chrome="first" style={WRAPPER_BASE_STYLE}>
        <SovereignFirstPageHeader
          identity={identity} palette={palette} documentTitle={settings.customDocumentTitle} subtitleAr={props.subtitleAr}
          isSolvedMode={props.isSolvedMode} totalIdeasCount={props.totalIdeasCount}
          totalQuestionsCount={props.totalQuestionsCount} totalMarks={props.totalMarks} numeralMode={numeralMode}
        />
      </div>
      <div data-flow-chrome="running" style={WRAPPER_BASE_STYLE}>
        <SovereignRunningPageHeader
          identity={identity} palette={palette} documentTitle={settings.customDocumentTitle}
          subtitleAr={props.subtitleAr} pageNumber={88} totalPages={88} numeralMode={numeralMode}
        />
      </div>
      <div data-flow-chrome="footer" style={WRAPPER_BASE_STYLE}>
        <SovereignPageNumberFooterBar identity={identity} palette={palette} pageNumber={88} totalPages={88} numeralMode={numeralMode} />
      </div>

      {flowItems.map((item) => (
        <React.Fragment key={item.id}>
          <div
            data-flow-item-id={item.id}
            className="min-w-0"
            style={{ ...WRAPPER_BASE_STYLE, width: item.span === "column" ? `${FLOW_COLUMN_WIDTH_PX}px` : `${FLOW_PAGE_INNER_WIDTH_PX}px` }}
          >
            {renderFlowItem(item)}
          </div>
          {item.kind === "question" && item.span === "column" && (
            <div
              data-flow-item-id={fullWidthHeightKey(item.id)}
              className="min-w-0"
              style={{ ...WRAPPER_BASE_STYLE, width: `${FLOW_PAGE_INNER_WIDTH_PX}px` }}
            >
              {renderFlowItem(item)}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
