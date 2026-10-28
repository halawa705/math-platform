"use client";

/**
 * @file two-column-newspaper-packer.tsx
 * @description المحرك السيادي لصفحات A4 المنفصلة والمقاسة حياً (Sovereign Measured Discrete A4 Pages Engine):
 * - يقيس الارتفاع الفعلي بالبيكسل لكل كبسولة فكرة ولكل صف ثنائي من الأمثلة/التدريبات بعد تحميل الخطوط ومعادلات KaTeX.
 * - يوزع المحتوى حتمياً على أوراق A4 مستقلة (`794px × 1123px` = `210mm × 297mm`) مرقمة (`صفحة X من Y`).
 * - يمنع تماماً انفصال كبسولة الفكرة عن أمثلتها، ويمنع انقسام خطوات المثال أفقياً، ويقضي على الفراغات البيضاء.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 198 سطراً).
 */

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
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
import { buildFlowItems } from "./flow-items-builder";
import { FlowItemRenderer } from "./flow-item-renderer";
import { packFlowItemsWithPageBalance } from "./flow-last-page-balancer";
import { FLOW_COLUMN_WIDTH_PX, FLOW_PAGE_INNER_WIDTH_PX } from "./flow-page-geometry-constants";
import type { FlowItem } from "./flow-item-model";
import { SovereignDiscretePageView } from "./sovereign-discrete-page-view";
import { useA4MobileZoomScale } from "./use-a4-mobile-zoom-scale";

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
  const [identity, setIdentity] = useState(DEFAULT_OWNER_TEACHER_IDENTITY_SSOT);
  const [heightsMap, setHeightsMap] = useState<ReadonlyMap<string, number>>(
    () => new Map()
  );
  const viewportWrapperRef = useRef<HTMLDivElement>(null);
  const stagingRef = useRef<HTMLDivElement>(null);
  const mobileZoomScale = useA4MobileZoomScale(viewportWrapperRef);

  useEffect(() => {
    setIdentity(loadTeacherIdentitySSOT());
    const sync = () => setIdentity(loadTeacherIdentitySSOT());
    window.addEventListener(IDENTITY_UPDATED_EVENT_NAME, sync);
    return () => window.removeEventListener(IDENTITY_UPDATED_EVENT_NAME, sync);
  }, []);

  const activeFont = PRINT_FONT_FAMILIES_SSOT[settings.fontFamilyId];
  const palette = resolvePrintThemePalette(settings.colorThemeId);
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const isSolvedMode = settings.answerVisibilityMode !== "questions_only" || questions.some((q) => q.id.startsWith("booklet-s1-"));

  const { items: flowItems, totalIdeasCount } = React.useMemo(
    () => buildFlowItems({ questions, columnsCount: settings.columnsCount, includeAnswerKey: isSolvedMode }),
    [questions, settings.columnsCount, isSolvedMode]
  );

  // قياس الارتفاع الحي لكل كائن بعرضه الحقيقي (عمود أو كامل) بعد تصيير الخطوط ومعادلات KaTeX
  useLayoutEffect(() => {
    const measureAll = () => {
      const container = stagingRef.current;
      if (!container) return;
      const nextMap = new Map<string, number>();
      container.querySelectorAll<HTMLElement>("[data-flow-item-id]").forEach((node) => {
        const id = node.getAttribute("data-flow-item-id");
        if (id) nextMap.set(id, Math.ceil(node.offsetHeight));
      });
      setHeightsMap(nextMap);
    };

    measureAll();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measureAll).catch(() => {});
    }
    const timer = setTimeout(measureAll, 180);
    return () => clearTimeout(timer);
  }, [flowItems, settings.fontFamilyId, settings.exactFontSizePt, settings.densityMode, settings.numeralMode, settings.notationLanguage]);

  const discretePages = React.useMemo(
    () => packFlowItemsWithPageBalance(flowItems, heightsMap),
    [flowItems, heightsMap]
  );

  const renderFlowItem = (item: FlowItem) => (
    <FlowItemRenderer
      key={item.id}
      item={item}
      settings={settings}
      palette={palette}
      identity={identity}
      questions={questions}
    />
  );

  return (
    <div
      ref={viewportWrapperRef}
      className="w-full overflow-hidden flex flex-col items-center bg-slate-200/70 dark:bg-slate-900/60 rounded-3xl p-2 sm:p-5 border border-slate-300/80 dark:border-slate-800 relative"
    >
      {questions.length > 0 && (
        <div className="mb-3 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-black flex flex-wrap items-center gap-3 shadow-md">
          <span>📄 نظام إنتاج صفحات A4 السيادي المستقل</span>
          <span className="text-amber-300">
            إجمالي الورق: {formatNumeralsByModeSSOT(discretePages.length, settings.numeralMode)} صفحة A4
          </span>
          <span className="text-emerald-300">
            المسائل: {formatNumeralsByModeSSOT(questions.length, settings.numeralMode)}
          </span>
        </div>
      )}

      {/* منصة القياس الخفية: كل كائن يُقاس بعرضه الحقيقي (عمود أو كامل) لا بعرض الصفحة كلها */}
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
        {flowItems.map((item) => (
          <div
            key={item.id}
            data-flow-item-id={item.id}
            className="min-w-0"
            style={{ width: item.span === "column" ? `${FLOW_COLUMN_WIDTH_PX}px` : `${FLOW_PAGE_INNER_WIDTH_PX}px` }}
          >
            {renderFlowItem(item)}
          </div>
        ))}
      </div>

      {/* عرض وتصدير صفحات A4 المنفصلة والمضبوطة */}
      <div
        style={{
          width: "794px",
          transform: `scale(${mobileZoomScale})`,
          transformOrigin: "top center",
          marginBottom:
            mobileZoomScale < 1
              ? `${Math.round((mobileZoomScale - 1) * 1123 * Math.max(1, discretePages.length))}px`
              : "0px",
        }}
        className="transition-transform duration-200"
      >
        <div ref={sheetContainerRef} dir="rtl" className="flex flex-col gap-5 print:gap-0">
          {questions.length === 0 ? (
            <div className="w-[794px] min-h-[500px] bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300">
              <div className="text-3xl">📄</div>
              <div className="text-sm font-black text-slate-600">لا توجد أسئلة في الورقة بعد</div>
            </div>
          ) : (
            discretePages.map((page) => (
              <SovereignDiscretePageView
                key={page.pageNumber}
                page={page}
                totalPagesCount={discretePages.length}
                settings={settings}
                identity={identity}
                palette={palette}
                activeFont={activeFont}
                subtitleAr={subtitleAr}
                isSolvedMode={isSolvedMode}
                totalIdeasCount={totalIdeasCount}
                totalQuestionsCount={questions.length}
                totalMarks={totalMarks}
                renderFlowItem={renderFlowItem}
              />
            ))
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
