"use client";

/**
 * @file two-column-newspaper-packer.tsx
 * @description المحرك السيادي لصفحات A4 المنفصلة والمقاسة حياً مع مسح الملاءمة التلقائية (Auto-Fit Sweep).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 195 سطراً).
 */

import React, { useState, useEffect, useRef } from "react";
import { PRINT_FONT_FAMILIES_SSOT, type PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import { DEFAULT_OWNER_TEACHER_IDENTITY_SSOT, IDENTITY_UPDATED_EVENT_NAME, loadTeacherIdentitySSOT } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import { resolvePrintThemePalette, type PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import { getLadderForMode } from "./autofit-ladders";
import { AutoFitStatusBadge } from "./autofit-status-badge";
import { buildFlowItems } from "./flow-items-builder";
import { FlowItemRenderer } from "./flow-item-renderer";
import { FlowMeasurementStagingPlatform } from "./flow-measurement-staging-platform";
import { resolveFlowPageBudgets } from "./flow-page-budget-resolver";
import { FLOW_DENSITY_PROFILES } from "./flow-page-geometry-constants";
import { packFlowItemsIntoPages } from "./flow-page-packer";
import type { FlowItem } from "./flow-item-model";
import { PageFillReportChip } from "./page-fill-report-chip";
import { SovereignDiscretePageView } from "./sovereign-discrete-page-view";
import { useA4MobileZoomScale } from "./use-a4-mobile-zoom-scale";
import { useAutoFitSweepController } from "./use-autofit-sweep-controller";
import { useFlowStagingLiveMeasurer } from "./use-flow-staging-live-measurer";

export const MODULE_ID_TWO_COLUMN_NEWSPAPER_PACKER = "two_column_newspaper_packer" as const;

export interface TwoColumnNewspaperPackerProps {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly subtitleAr?: string;
  readonly sheetContainerRef: React.RefObject<HTMLDivElement | null>;
  readonly onPagesCountChange?: (n: number) => void;
  readonly children?: React.ReactNode;
}

export default function TwoColumnNewspaperPacker({
  settings,
  questions,
  subtitleAr = "",
  sheetContainerRef,
  onPagesCountChange,
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
  const mode = settings.autoFitMode ?? "off";
  const ladder = React.useMemo(() => getLadderForMode(mode), [mode]);
  const [activeRung, setActiveRung] = React.useState(0);
  const rung = mode === "off" ? undefined : ladder[Math.min(activeRung, Math.max(0, ladder.length - 1))];
  const effSettings = React.useMemo(
    () =>
      rung
        ? {
            ...settings,
            exactFontSizePt: rung.fontPt as PDFPrintSettingsStateSSOT["exactFontSizePt"],
            figureScale: rung.figureScale,
            answerSpaceLines: rung.answerLines,
            compactHeader: rung.compactHeader,
            hideAccreditation: rung.hideAccreditation,
          }
        : settings,
    [settings, rung]
  );
  const measureStamp = rung ? `rung-${activeRung}` : "off";

  const palette = resolvePrintThemePalette(effSettings.colorThemeId);
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const isSolvedMode = effSettings.answerVisibilityMode !== "questions_only" || questions.some((q) => q.id.startsWith("booklet-s1-"));

  const { items: flowItems, totalIdeasCount } = React.useMemo(
    () =>
      buildFlowItems({
        questions,
        columnsCount: effSettings.columnsCount,
        includeAnswerKey: isSolvedMode,
        includeAccreditation: !effSettings.hideAccreditation,
      }),
    [questions, effSettings.columnsCount, isSolvedMode, effSettings.hideAccreditation]
  );

  const measured = useFlowStagingLiveMeasurer(stagingRef, `${flowItems.length}:${effSettings.exactFontSizePt}:${measureStamp}`, measureStamp);
  const pageBudgets = React.useMemo(() => resolveFlowPageBudgets(measured.chrome), [measured.chrome]);
  const densityProfile = FLOW_DENSITY_PROFILES[effSettings.densityMode] ?? FLOW_DENSITY_PROFILES.ultra_compact;
  const discretePages = React.useMemo(
    () => packFlowItemsIntoPages(flowItems, measured.heights, { budgets: pageBudgets, density: densityProfile }),
    [flowItems, measured.heights, pageBudgets, densityProfile]
  );

  const inputSignature = `${questions.map((q) => q.id).join(",")}|${settings.columnsCount}|${settings.densityMode}|${settings.fontFamilyId}|${settings.answerVisibilityMode}|${settings.answerSpaceStyle}|${settings.numeralMode}|${settings.notationLanguage}|${settings.customDocumentTitle}`;
  const sweep = useAutoFitSweepController({
    mode, rungCount: ladder.length, targetMaxPages: settings.targetMaxPages, inputSignature, measureStamp: measured.stamp, pages: discretePages,
  });

  useEffect(() => { setActiveRung(sweep.phase === "idle" ? 0 : sweep.probeRungIndex); }, [sweep.phase, sweep.probeRungIndex]);
  useEffect(() => { if (sweep.phase !== "sweeping") onPagesCountChange?.(discretePages.length); }, [discretePages.length, sweep.phase, onPagesCountChange]);

  const stableRef = useRef({ pages: discretePages, settings: effSettings, heights: measured.heights });
  if (sweep.phase !== "sweeping" || stableRef.current.pages.length === 0) {
    stableRef.current = { pages: discretePages, settings: effSettings, heights: measured.heights };
  }
  const viewPages = sweep.phase === "sweeping" ? stableRef.current.pages : discretePages;
  const viewSettings = sweep.phase === "sweeping" ? stableRef.current.settings : effSettings;
  const viewHeights = sweep.phase === "sweeping" ? stableRef.current.heights : measured.heights;

  const renderStagingItem = (item: FlowItem) => (
    <FlowItemRenderer key={item.id} item={item} settings={effSettings} palette={palette} identity={identity} questions={questions} />
  );
  const renderViewItem = (item: FlowItem) => (
    <FlowItemRenderer key={item.id} item={item} settings={viewSettings} palette={palette} identity={identity} questions={questions} />
  );

  return (
    <div ref={viewportWrapperRef} className="w-full overflow-hidden flex flex-col items-center bg-slate-200/70 dark:bg-slate-900/60 rounded-3xl p-2 sm:p-5 border border-slate-300/80 dark:border-slate-800 relative">
      {questions.length > 0 && (
        <div className="print:hidden mb-3 px-4 py-1.5 rounded-2xl bg-slate-900 text-white text-xs font-black flex flex-wrap items-center gap-3 shadow-md">
          <span>📄 نظام إنتاج صفحات A4 السيادي المستقل</span>
          <span className="text-amber-300">إجمالي الورق: {formatNumeralsByModeSSOT(viewPages.length, viewSettings.numeralMode)} صفحة A4</span>
          <span className="text-emerald-300">المسائل: {formatNumeralsByModeSSOT(questions.length, viewSettings.numeralMode)}</span>
          <AutoFitStatusBadge sweep={sweep} fontPt={viewSettings.exactFontSizePt} targetMaxPages={settings.targetMaxPages} questionsCount={questions.length} numeralMode={viewSettings.numeralMode} />
          <PageFillReportChip pages={viewPages} heights={viewHeights} numeralMode={viewSettings.numeralMode} />
          {viewPages.some((page) => page.overflowsBudget) && <span className="text-rose-300">⚠️ يوجد عنصر أطول من الصفحة (قد يُقصّ)</span>}
        </div>
      )}

      <FlowMeasurementStagingPlatform
        stagingRef={stagingRef} flowItems={flowItems} renderFlowItem={renderStagingItem} settings={effSettings}
        identity={identity} palette={palette} activeFont={activeFont} subtitleAr={subtitleAr} isSolvedMode={isSolvedMode}
        totalIdeasCount={totalIdeasCount} totalQuestionsCount={questions.length} totalMarks={totalMarks}
      />

      {sweep.phase === "sweeping" && (
        <div className="print:hidden mb-2 px-3 py-1 rounded-full bg-indigo-900/80 text-white text-xs font-black">⏳ جارٍ ضبط الصفحات تلقائياً…</div>
      )}

      <div
        style={{
          width: "794px", transform: `scale(${mobileZoomScale})`, transformOrigin: "top center",
          marginBottom: mobileZoomScale < 1 ? `${Math.round((mobileZoomScale - 1) * 1123 * Math.max(1, viewPages.length))}px` : "0px",
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
            viewPages.map((page) => (
              <SovereignDiscretePageView
                key={page.pageNumber} page={page} totalPagesCount={viewPages.length} settings={viewSettings}
                identity={identity} palette={palette} activeFont={activeFont} subtitleAr={subtitleAr} isSolvedMode={isSolvedMode}
                totalIdeasCount={totalIdeasCount} totalQuestionsCount={questions.length} totalMarks={totalMarks} renderFlowItem={renderViewItem}
              />
            ))
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
