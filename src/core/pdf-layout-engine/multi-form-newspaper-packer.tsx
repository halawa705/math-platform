"use client";

/**
 * @file multi-form-newspaper-packer.tsx
 * @description المحرك السيادي لمعاينة وطباعة حزم النماذج الامتحانية المتعددة (A/B/C) مع ترويسة مستقلة لكل نموذج.
 * يضمن بدء كل نموذج بترويسته الرسمية الكاملة المخصصة برقم النموذج ونمطه، وتقسيم كل نموذج لصفحاته المنفصلة بدقة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { PRINT_FONT_FAMILIES_SSOT, type PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import { DEFAULT_OWNER_TEACHER_IDENTITY_SSOT, IDENTITY_UPDATED_EVENT_NAME, loadTeacherIdentitySSOT } from "../ssot/teacher-identity-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import { resolvePrintThemePalette } from "./a4-vector-html-sheet-renderer";
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

export default function MultiFormNewspaperPacker({
  forms,
  settings,
  subtitleAr = "",
  sheetContainerRef,
  onPagesCountChange,
  children,
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
  const palette = resolvePrintThemePalette(settings.colorThemeId);
  const isSchoolExam = settings.paperTemplateId === "official_school_exam";
  const effectiveColumnsCount = isSchoolExam ? 1 : settings.columnsCount;
  const isSolvedMode = settings.answerVisibilityMode !== "questions_only";

  // استخراج كائنات التدفق لكل نموذج على حدة
  const formFlows = useMemo(
    () =>
      forms.map((f) => {
        const { items, totalIdeasCount } = buildFlowItems({
          questions: f.questions,
          columnsCount: effectiveColumnsCount,
          includeAnswerKey: isSolvedMode,
          includeAccreditation: !settings.hideAccreditation && !isSchoolExam,
          paperTemplateId: settings.paperTemplateId,
        });
        const totalMarks = f.questions.reduce((sum, q) => sum + q.marks, 0);
        return { form: f, items, totalIdeasCount, totalMarks };
      }),
    [forms, effectiveColumnsCount, isSolvedMode, settings.hideAccreditation, isSchoolExam, settings.paperTemplateId]
  );

  // دمج كائنات القياس للمنصة الخفية
  const allStagingItems = useMemo(
    () => formFlows.flatMap((ff) => ff.items),
    [formFlows]
  );

  const measured = useFlowStagingLiveMeasurer(
    stagingRef,
    `${allStagingItems.length}:${settings.exactFontSizePt}:${settings.fontFamilyId}`,
    "multi-forms"
  );

  const pageBudgets = useMemo(() => resolveFlowPageBudgets(measured.chrome), [measured.chrome]);
  const densityProfile = useMemo(
    () =>
      isSchoolExam
        ? { gapMinPx: 1, gapMaxPx: 3, maxStretchPerItemPx: 0, maxStretchRatio: 0 }
        : (FLOW_DENSITY_PROFILES[settings.densityMode] ?? FLOW_DENSITY_PROFILES.ultra_compact),
    [isSchoolExam, settings.densityMode]
  );

  // تقسيم صفحات كل نموذج على حدة لضمان استقلالية الترويسة والترقيم
  const formPagesMap = useMemo(
    () =>
      formFlows.map((ff) => {
        const pages = packFlowItemsIntoPages(ff.items, measured.heights, {
          budgets: pageBudgets,
          density: densityProfile,
        });
        return { ...ff, pages };
      }),
    [formFlows, measured.heights, pageBudgets, densityProfile]
  );

  const totalPagesAllForms = useMemo(
    () => formPagesMap.reduce((sum, fp) => sum + fp.pages.length, 0),
    [formPagesMap]
  );

  useEffect(() => {
    onPagesCountChange?.(totalPagesAllForms);
  }, [totalPagesAllForms, onPagesCountChange]);

  const renderItem = (item: FlowItem, questions: PrintableExamFormGroup["questions"]) => (
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
      {forms.length > 0 && (
        <div className="print:hidden mb-3 px-4 py-1.5 rounded-2xl bg-slate-900 text-white text-xs font-black flex flex-wrap items-center gap-3 shadow-md">
          <span>📑 حزمة النماذج الامتحانية المتعددة</span>
          <span className="text-amber-300">
            النماذج: {formatNumeralsByModeSSOT(forms.length, settings.numeralMode)}
          </span>
          <span className="text-emerald-300">
            إجمالي الصفحات: {formatNumeralsByModeSSOT(totalPagesAllForms, settings.numeralMode)} صفحة A4
          </span>
          <span className="text-indigo-300">
            {isSchoolExam ? "🏫 قالب الامتحان المدرسي" : "🏛️ القالب السيادي"}
          </span>
        </div>
      )}

      {/* منصة القياس الخفية */}
      <FlowMeasurementStagingPlatform
        stagingRef={stagingRef}
        flowItems={allStagingItems}
        renderFlowItem={(it) => renderItem(it, forms[0]?.questions ?? [])}
        settings={settings}
        identity={identity}
        palette={palette}
        activeFont={activeFont}
        subtitleAr={subtitleAr}
        isSolvedMode={isSolvedMode}
        totalIdeasCount={1}
        totalQuestionsCount={allStagingItems.length}
        totalMarks={100}
      />

      <div
        style={{
          width: "794px",
          transform: `scale(${mobileZoomScale})`,
          transformOrigin: "top center",
          marginBottom:
            mobileZoomScale < 1
              ? `${Math.round((mobileZoomScale - 1) * 1123 * Math.max(1, totalPagesAllForms))}px`
              : "0px",
        }}
        className="transition-transform duration-200"
      >
        <div ref={sheetContainerRef} dir="rtl" className="flex flex-col gap-8 print:gap-0">
          {formPagesMap.map((fp) => {
            const formSpecificSettings: PDFPrintSettingsStateSSOT = {
              ...settings,
              customDocumentTitle: fp.form.fullDocumentTitleAr,
            };

            return (
              <div
                key={fp.form.formId}
                className="multi-form-block flex flex-col gap-5 print:gap-0 relative break-after-page"
              >
                {fp.pages.map((page) => (
                  <SovereignDiscretePageView
                    key={`${fp.form.formId}-p-${page.pageNumber}`}
                    page={page}
                    totalPagesCount={fp.pages.length}
                    settings={formSpecificSettings}
                    identity={identity}
                    palette={palette}
                    activeFont={activeFont}
                    subtitleAr={subtitleAr}
                    isSolvedMode={isSolvedMode}
                    totalIdeasCount={fp.totalIdeasCount}
                    totalQuestionsCount={fp.form.questions.length}
                    totalMarks={fp.totalMarks}
                    renderFlowItem={(item) => renderItem(item, fp.form.questions)}
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
