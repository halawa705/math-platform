"use client";

/**
 * @file multi-form-newspaper-packer.tsx
 * @description المحرك السيادي لمعاينة وطباعة حزم النماذج الامتحانية المتعددة (أ/ب/جـ...) بترويسة مستقلة لكل نموذج،
 * مع محرك مسح الملاءمة التلقائية لكل نموذج (AutoFit Sweep ≤ 2 صفحة A4) وفصل معرفات القياس لكل نموذج بلا تداخل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 275 سطراً).
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { PRINT_FONT_FAMILIES_SSOT, type PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import { DEFAULT_OWNER_TEACHER_IDENTITY_SSOT, IDENTITY_UPDATED_EVENT_NAME, loadTeacherIdentitySSOT } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import { resolvePrintThemePalette, type PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import { getLadderForMode } from "./autofit-ladders";
import { decideBestAutoFitRung, type AutoFitProbe } from "./autofit-decision";
import { buildFlowItems } from "./flow-items-builder";
import { FlowItemRenderer } from "./flow-item-renderer";
import { FlowMeasurementStagingPlatform } from "./flow-measurement-staging-platform";
import { resolveFlowPageBudgets } from "./flow-page-budget-resolver";
import { FLOW_DENSITY_PROFILES } from "./flow-page-geometry-constants";
import { packFlowItemsIntoPages } from "./flow-page-packer";
import type { FlowItem, FlowPage } from "./flow-item-model";
import { SovereignDiscretePageView } from "./sovereign-discrete-page-view";
import { useA4MobileZoomScale } from "./use-a4-mobile-zoom-scale";
import { useFlowStagingLiveMeasurer } from "./use-flow-staging-live-measurer";
import type { PrintableExamFormGroup } from "./printable-exam-forms-model";

export const MODULE_ID_MULTI_FORM_NEWSPAPER_PACKER = "multi_form_newspaper_packer" as const;

export interface MultiFormNewspaperPackerProps {
  readonly forms: readonly PrintableExamFormGroup[];
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly subtitleAr?: string;
  readonly sheetContainerRef: React.RefObject<HTMLDivElement | null>;
  readonly onPagesCountChange?: (n: number) => void;
  readonly children?: React.ReactNode;
}

interface CachedFormRungResult {
  readonly effSettings: PDFPrintSettingsStateSSOT;
  readonly pages: readonly FlowPage[];
  readonly probe: AutoFitProbe;
}

export default function MultiFormNewspaperPacker({
  forms, settings, subtitleAr = "", sheetContainerRef, onPagesCountChange, children,
}: MultiFormNewspaperPackerProps) {
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
  const mode = settings.autoFitMode ?? "exam_max_pages";
  const ladder = useMemo(() => getLadderForMode(mode), [mode]);
  const targetMaxPages = settings.targetMaxPages ?? 2;
  const hasManualLines = settings.hasManualEssayLinesLock === true;
  const inputSignature = `${forms.map((f) => `${f.formId}:${f.questions.map((q) => `${q.id}:${hasManualLines || q.hasCustomAnswerLines ? (q.answerLinesCount ?? "") : ""}`).join(",")}`).join("|")}|${settings.paperTemplateId}|${settings.columnsCount}|${settings.densityMode}|${settings.fontFamilyId}|${settings.answerVisibilityMode}|${settings.answerSpaceStyle}|${hasManualLines ? (settings.essayAnswerLinesCount ?? "") : "auto"}|${settings.numeralMode}|${settings.notationLanguage}|${settings.boldProseText ? 1 : 0}|${settings.boldMathExpressions !== false ? 1 : 0}|${mode}|${targetMaxPages}`;

  const [sweepState, setSweepState] = useState<{
    readonly sig: string;
    readonly phase: "idle" | "sweeping" | "done";
    readonly probeRungIndex: number;
    readonly cache: Readonly<Record<string, readonly CachedFormRungResult[]>>;
  }>({ sig: inputSignature, phase: ladder.length > 0 ? "sweeping" : "idle", probeRungIndex: 0, cache: {} });

  useEffect(() => {
    setSweepState({ sig: inputSignature, phase: mode !== "off" && ladder.length > 0 ? "sweeping" : "idle", probeRungIndex: 0, cache: {} });
  }, [inputSignature, mode, ladder.length]);

  const isSweeping = mode !== "off" && ladder.length > 0 && sweepState.phase === "sweeping";
  const activeRungIdx = Math.min(sweepState.probeRungIndex, Math.max(0, ladder.length - 1));
  const activeRung = mode === "off" ? undefined : ladder[activeRungIdx];

  const effSettings = useMemo<PDFPrintSettingsStateSSOT>(
    () => activeRung ? {
      ...settings,
      exactFontSizePt: activeRung.fontPt as PDFPrintSettingsStateSSOT["exactFontSizePt"],
      figureScale: activeRung.figureScale,
      compactHeader: activeRung.compactHeader,
      hideAccreditation: activeRung.hideAccreditation,
      essayAnswerLinesCount: hasManualLines && settings.essayAnswerLinesCount !== undefined ? settings.essayAnswerLinesCount : activeRung.answerLines,
      answerSpaceLines: activeRung.answerLines,
    } : settings,
    [settings, activeRung, hasManualLines]
  );

  const stagingSettings = useMemo<PDFPrintSettingsStateSSOT>(
    () => ({ ...effSettings, customDocumentTitle: forms[0]?.fullDocumentTitleAr || effSettings.customDocumentTitle }),
    [effSettings, forms]
  );

  const palette = resolvePrintThemePalette(effSettings.colorThemeId);
  const isSchoolExam = effSettings.paperTemplateId === "official_school_exam";
  const effectiveColumnsCount = isSchoolExam ? 1 : effSettings.columnsCount;
  const isSolvedMode = effSettings.answerVisibilityMode !== "questions_only";

  const formFlows = useMemo(
    () => forms.map((f) => {
      const { items, totalIdeasCount } = buildFlowItems({
        questions: f.questions, columnsCount: effectiveColumnsCount, includeAnswerKey: isSolvedMode,
        includeAccreditation: !effSettings.hideAccreditation && !isSchoolExam,
        paperTemplateId: effSettings.paperTemplateId, answerVisibilityMode: effSettings.answerVisibilityMode,
      });
      const namespacedItems: readonly FlowItem[] = items.map((it) => ({ ...it, id: `${f.formId}::${it.id}` }));
      const totalMarks = f.questions.reduce((sum, q) => sum + q.marks, 0);
      return { form: f, items: namespacedItems, totalIdeasCount, totalMarks };
    }),
    [forms, effectiveColumnsCount, isSolvedMode, effSettings.hideAccreditation, isSchoolExam, effSettings.paperTemplateId, effSettings.answerVisibilityMode]
  );

  const questionsByFormId = useMemo(
    () => new Map<string, readonly PrintableMathQuestionItem[]>(forms.map((f) => [f.formId, f.questions])),
    [forms]
  );

  const allStagingItems = useMemo(() => formFlows.flatMap((ff) => ff.items), [formFlows]);
  const measureStamp = activeRung ? `rung-${activeRungIdx}` : "off";
  const stagingStamp = `${allStagingItems.length}:${effSettings.paperTemplateId}:${effectiveColumnsCount}:${effSettings.exactFontSizePt}:${effSettings.essayAnswerLinesCount ?? ""}:${effSettings.answerSpaceLines ?? ""}:${measureStamp}:${effSettings.boldProseText ? 1 : 0}:${effSettings.boldMathExpressions !== false ? 1 : 0}:${stagingSettings.customDocumentTitle}`;
  const measured = useFlowStagingLiveMeasurer(stagingRef, stagingStamp, measureStamp);
  const pageBudgets = useMemo(() => resolveFlowPageBudgets(measured.chrome), [measured.chrome]);
  const densityProfile = useMemo(
    () => isSchoolExam ? { gapMinPx: 1, gapMaxPx: 3, maxStretchPerItemPx: 0, maxStretchRatio: 0 } : (FLOW_DENSITY_PROFILES[effSettings.densityMode] ?? FLOW_DENSITY_PROFILES.ultra_compact),
    [isSchoolExam, effSettings.densityMode]
  );

  const currentPackedForms = useMemo(
    () => formFlows.map((ff) => ({
      ...ff,
      pages: packFlowItemsIntoPages(ff.items, measured.heights, {
        budgets: pageBudgets, density: densityProfile, skipSolutionSplits: isSweeping, manualCompactHeader: effSettings.compactHeader,
      }),
    })),
    [formFlows, measured.heights, pageBudgets, densityProfile, isSweeping, effSettings.compactHeader]
  );

  useEffect(() => {
    if (!isSweeping || measured.stamp !== measureStamp || currentPackedForms.length === 0) return;
    const nextCache: Record<string, readonly CachedFormRungResult[]> = { ...sweepState.cache };
    let allMeetTarget = true;
    for (const fp of currentPackedForms) {
      const last = fp.pages[fp.pages.length - 1];
      const avgFill = fp.pages.length > 0 ? fp.pages.reduce((s, p) => s + (p.budgetHeightPx > 0 ? p.usedHeightPx / p.budgetHeightPx : 0), 0) / fp.pages.length : 0;
      const overflow = fp.pages.some((p) => p.overflowsBudget);
      const probe: AutoFitProbe = {
        rungIndex: activeRungIdx, pages: fp.pages.length,
        lastPageFill: last && last.budgetHeightPx > 0 ? last.usedHeightPx / last.budgetHeightPx : 0, avgFill, overflow,
      };
      if (overflow || fp.pages.length > targetMaxPages) allMeetTarget = false;
      nextCache[fp.form.formId] = [...(nextCache[fp.form.formId] ?? []), { effSettings, pages: fp.pages, probe }];
    }
    const finished = allMeetTarget || activeRungIdx + 1 >= ladder.length;
    setSweepState({ sig: inputSignature, phase: finished ? "done" : "sweeping", probeRungIndex: finished ? activeRungIdx : activeRungIdx + 1, cache: nextCache });
  }, [isSweeping, measured.stamp, measureStamp, currentPackedForms, activeRungIdx, targetMaxPages, ladder.length, effSettings, inputSignature]);

  const resolvedForms = useMemo(() => {
    if (mode === "off" || ladder.length === 0 || sweepState.phase !== "done") return currentPackedForms.map((fp) => ({ ...fp, formSettings: effSettings }));
    return formFlows.map((ff) => {
      const results = sweepState.cache[ff.form.formId] ?? [];
      if (results.length === 0) {
        const fallback = currentPackedForms.find((c) => c.form.formId === ff.form.formId);
        return { ...ff, pages: fallback?.pages ?? [], formSettings: effSettings };
      }
      const decision = decideBestAutoFitRung(results.map((r) => r.probe), targetMaxPages);
      const chosen = results.find((r) => r.probe.rungIndex === decision.rungIndex) ?? results[0];
      const liveMergedSettings: PDFPrintSettingsStateSSOT = {
        ...settings,
        exactFontSizePt: chosen.effSettings.exactFontSizePt,
        figureScale: chosen.effSettings.figureScale,
        compactHeader: chosen.effSettings.compactHeader,
        hideAccreditation: chosen.effSettings.hideAccreditation,
        essayAnswerLinesCount:
          hasManualLines && settings.essayAnswerLinesCount !== undefined
            ? settings.essayAnswerLinesCount
            : chosen.effSettings.essayAnswerLinesCount,
        answerSpaceLines: chosen.effSettings.answerSpaceLines,
      };
      return { ...ff, pages: chosen.pages, formSettings: liveMergedSettings };
    });
  }, [mode, ladder.length, sweepState.phase, sweepState.cache, currentPackedForms, formFlows, effSettings, settings, hasManualLines, targetMaxPages]);

  const stableFormsRef = useRef(resolvedForms);
  if (!isSweeping || stableFormsRef.current.length === 0) stableFormsRef.current = resolvedForms;
  const viewForms = isSweeping ? stableFormsRef.current : resolvedForms;
  const totalPagesAllForms = useMemo(() => viewForms.reduce((sum, fp) => sum + fp.pages.length, 0), [viewForms]);
  useEffect(() => { if (!isSweeping) onPagesCountChange?.(totalPagesAllForms); }, [totalPagesAllForms, isSweeping, onPagesCountChange]);

  const renderItem = (
    item: FlowItem,
    itemSettings: PDFPrintSettingsStateSSOT,
    questions: PrintableExamFormGroup["questions"],
    extraStretchPx?: number
  ) => (
    <FlowItemRenderer
      key={item.id}
      item={item}
      settings={itemSettings}
      palette={palette}
      identity={identity}
      questions={questions}
      extraStretchPx={extraStretchPx}
    />
  );

  return (
    <div ref={viewportWrapperRef} className="w-full overflow-hidden flex flex-col items-center bg-slate-200/70 dark:bg-slate-900/60 rounded-3xl p-2 sm:p-5 border border-slate-300/80 dark:border-slate-800 relative">
      {forms.length > 0 && (
        <div className="print:hidden mb-3 px-4 py-1.5 rounded-2xl bg-slate-900 text-white text-xs font-black flex flex-wrap items-center gap-3 shadow-md">
          <span>📑 حزمة النماذج الامتحانية</span>
          <span className="text-amber-300">النماذج: {formatNumeralsByModeSSOT(forms.length, settings.numeralMode)}</span>
          <span className="text-emerald-300">إجمالي الصفحات: {formatNumeralsByModeSSOT(totalPagesAllForms, settings.numeralMode)} صفحة A4</span>
          <span className="text-teal-300">({viewForms.map((vf) => `${vf.form.formLetterAr}: ${formatNumeralsByModeSSOT(vf.pages.length, settings.numeralMode)}ص`).join(" • ")})</span>
          {isSweeping && <span className="text-indigo-300">⏳ جارٍ ضبط الصفحتين تلقائياً…</span>}
        </div>
      )}

      <FlowMeasurementStagingPlatform
        stagingRef={stagingRef} flowItems={allStagingItems}
        renderFlowItem={(it) => renderItem(it, effSettings, questionsByFormId.get(it.id.split("::")[0]) ?? forms[0]?.questions ?? [])}
        settings={stagingSettings} identity={identity} palette={palette} activeFont={activeFont} subtitleAr={subtitleAr}
        isSolvedMode={isSolvedMode} totalIdeasCount={1} totalQuestionsCount={allStagingItems.length} totalMarks={100} skipSplitVariants={isSweeping}
      />

      <div
        style={{
          width: "794px", transform: `scale(${mobileZoomScale})`, transformOrigin: "top center",
          marginBottom: mobileZoomScale < 1 ? `${Math.round((mobileZoomScale - 1) * 1123 * Math.max(1, totalPagesAllForms))}px` : "0px",
        }}
        className="transition-transform duration-200"
      >
        <div ref={sheetContainerRef} dir="rtl" className="flex flex-col gap-8 print:gap-0">
          {viewForms.map((fp) => {
            const formSpecificSettings: PDFPrintSettingsStateSSOT = { ...fp.formSettings, customDocumentTitle: fp.form.fullDocumentTitleAr };
            return (
              <div key={fp.form.formId} className="multi-form-block flex flex-col gap-5 print:gap-0 relative break-after-page">
                {fp.pages.map((page) => (
                  <SovereignDiscretePageView
                    key={`${fp.form.formId}-p-${page.pageNumber}`}
                    page={page} totalPagesCount={fp.pages.length} settings={formSpecificSettings} identity={identity} palette={palette}
                    activeFont={activeFont} subtitleAr={subtitleAr} isSolvedMode={isSolvedMode} totalIdeasCount={fp.totalIdeasCount}
                    totalQuestionsCount={fp.form.questions.length} totalMarks={fp.totalMarks}
                    renderFlowItem={(item, extraStretchPx) =>
                      renderItem(item, formSpecificSettings, fp.form.questions, extraStretchPx)
                    }
                  />
                ))}
              </div>
            );
          })}
          {children}
        </div>
      </div>
    </div>
  );
}
