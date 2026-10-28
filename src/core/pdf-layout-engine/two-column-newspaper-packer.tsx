"use client";

/**
 * @file two-column-newspaper-packer.tsx
 * @description المحرك السيادي لصفحات A4 المنفصلة والمقاسة حياً (Sovereign Measured Discrete A4 Pages Engine).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 195 سطراً).
 */

import React, { useState, useEffect, useRef } from "react";
import { PRINT_FONT_FAMILIES_SSOT, type PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import { DEFAULT_OWNER_TEACHER_IDENTITY_SSOT, IDENTITY_UPDATED_EVENT_NAME, loadTeacherIdentitySSOT } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import { resolvePrintThemePalette, type PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import { buildFlowItems } from "./flow-items-builder";
import { FlowItemRenderer } from "./flow-item-renderer";
import { FlowMeasurementStagingPlatform } from "./flow-measurement-staging-platform";
import { resolveFlowPageBudgets } from "./flow-page-budget-resolver";
import { FLOW_DENSITY_PROFILES } from "./flow-page-geometry-constants";
import { packFlowItemsIntoPages } from "./flow-page-packer";
import type { FlowItem } from "./flow-item-model";
import { SovereignDiscretePageView } from "./sovereign-discrete-page-view";
import { useA4MobileZoomScale } from "./use-a4-mobile-zoom-scale";
import { useFlowStagingLiveMeasurer } from "./use-flow-staging-live-measurer";

export const MODULE_ID_TWO_COLUMN_NEWSPAPER_PACKER = "two_column_newspaper_packer" as const;

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

  const measured = useFlowStagingLiveMeasurer(stagingRef, flowItems);
  const pageBudgets = React.useMemo(() => resolveFlowPageBudgets(measured.chrome), [measured.chrome]);
  const densityProfile = FLOW_DENSITY_PROFILES[settings.densityMode] ?? FLOW_DENSITY_PROFILES.ultra_compact;
  const discretePages = React.useMemo(
    () => packFlowItemsIntoPages(flowItems, measured.heights, { budgets: pageBudgets, density: densityProfile }),
    [flowItems, measured.heights, pageBudgets, densityProfile]
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
          <span className="text-amber-300">إجمالي الورق: {formatNumeralsByModeSSOT(discretePages.length, settings.numeralMode)} صفحة A4</span>
          <span className="text-emerald-300">المسائل: {formatNumeralsByModeSSOT(questions.length, settings.numeralMode)}</span>
          {discretePages.some((page) => page.overflowsBudget) && (
            <span className="text-rose-300">⚠️ يوجد عنصر أطول من الصفحة (قد يُقصّ)</span>
          )}
        </div>
      )}

      <FlowMeasurementStagingPlatform
        stagingRef={stagingRef}
        flowItems={flowItems}
        renderFlowItem={renderFlowItem}
        settings={settings}
        identity={identity}
        palette={palette}
        activeFont={activeFont}
        subtitleAr={subtitleAr}
        isSolvedMode={isSolvedMode}
        totalIdeasCount={totalIdeasCount}
        totalQuestionsCount={questions.length}
        totalMarks={totalMarks}
      />

      {/* عرض وتصدير صفحات A4 المنفصلة والمضبوطة */}
      <div
        style={{
          width: "794px",
          transform: `scale(${mobileZoomScale})`,
          transformOrigin: "top center",
          marginBottom:
            mobileZoomScale < 1 ? `${Math.round((mobileZoomScale - 1) * 1123 * Math.max(1, discretePages.length))}px` : "0px",
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
