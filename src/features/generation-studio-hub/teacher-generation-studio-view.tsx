"use client";

/**
 * @file teacher-generation-studio-view.tsx
 * @description واجهة استوديو التوليد والطباعة مع الحفظ التلقائي الفوري للحالة الأخيرة (الصف، الوحدة، الدرس، التبويب).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 185 سطراً).
 */

import { useState, useMemo } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import SegmentedWorkspaceTabsBar, { type SegmentedTabItem } from "@/components/global-ui/segmented-workspace-tabs-bar";
import { MATH_BRANCHES_SSOT, type MathBranchId } from "@/core/ssot/math-branches-ssot";
import {
  EGYPTIAN_MATH_GRADES_SSOT,
  loadActiveCurriculumUnitsSSOT,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import { formatSelectedCurriculumScopeArabic } from "./studio-curriculum-units-checklist";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import type { PrintableExamFormGroup } from "@/core/pdf-layout-engine/printable-exam-forms-model";
import PDFPreviewOrchestrator from "@/features/pdf-preview-controls/pdf-preview-orchestrator";
import { loadStudioGlobalContextSSOT, saveStudioGlobalContextSSOT } from "@/core/ssot/studio-state-persistence-ssot";
import { loadPersistedPDFPrintSettingsSSOT, savePersistedPDFPrintSettingsSSOT } from "@/core/ssot/pdf-print-settings-ssot";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import StudioContextRibbonBar from "./studio-context-ribbon-bar";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioMobilePaneFloatingSwitch, { type StudioActivePane } from "./studio-mobile-pane-floating-switch";
import StudioExamGeneratorTab from "./studio-exam-generator-tab";
import StudioExamFormsGeneratorTab from "./studio-exam-forms-generator-tab";
import StudioBookletGeneratorTab from "./studio-booklet-generator-tab";
import StudioFinalReviewGeneratorTab from "./studio-final-review-generator-tab";
import StudioWorksheetGeneratorTab from "./studio-worksheet-generator-tab";
import StudioVisualGeometryLabTab from "./studio-visual-geometry-lab-tab";

export const MODULE_ID_TEACHER_GENERATION_STUDIO_VIEW = "teacher_generation_studio_view" as const;

const STUDIO_TABS: readonly SegmentedTabItem[] = [
  { id: "exam", labelAr: "اختبار", icon: "📄" },
  { id: "forms", labelAr: "النماذج", icon: "📑" },
  { id: "booklet", labelAr: "مذكرة", icon: "📘" },
  { id: "review", labelAr: "مراجعة", icon: "🏆" },
  { id: "worksheet", labelAr: "ورقة عمل", icon: "⚡" },
  { id: "geometry_lab", labelAr: "معمل الأشكال", icon: "📐" },
];

export default function TeacherGenerationStudioView() {
  const [initial] = useState(() => loadStudioGlobalContextSSOT());
  const [activeTabId, setActiveTabId] = useState<string>(initial.activeTabId);
  const [gradeId, setGradeId] = useState<string>(initial.gradeId);
  const [branchId, setBranchId] = useState<MathBranchId>(initial.branchId);
  const [lessonOrder, setLessonOrder] = useState<number>(initial.lessonOrder);
  const [unitTitle, setUnitTitle] = useState<string>(initial.unitTitle);
  const [lessonTitle, setLessonTitle] = useState<string>(initial.lessonTitle);
  const [sheetTitle, setSheetTitle] = useState<string>(initial.sheetTitle);
  const [selectedUnitIds, setSelectedUnitIds] = useState<readonly string[]>(initial.selectedUnitIds || []);
  const [selectedLessonIds, setSelectedLessonIds] = useState<readonly string[]>(initial.selectedLessonIds || []);
  const [sheetQuestions, setSheetQuestions] = useState<readonly PrintableMathQuestionItem[] | undefined>(undefined);
  const [sheetForms, setSheetForms] = useState<readonly PrintableExamFormGroup[] | undefined>(undefined);
  const [pane, setPane] = useState<StudioActivePane>("builder");
  const [notationLanguage, setNotationLanguage] = useState<MathNotationLanguage>(() => {
    return loadPersistedPDFPrintSettingsSSOT().notationLanguage ?? "english";
  });

  const updateNotationLanguage = (lang: MathNotationLanguage) => {
    setNotationLanguage(lang);
    const curr = loadPersistedPDFPrintSettingsSSOT();
    savePersistedPDFPrintSettingsSSOT({ ...curr, notationLanguage: lang });
  };

  const branch = MATH_BRANCHES_SSOT[branchId] || MATH_BRANCHES_SSOT.plane_geometry;
  const grade = EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === gradeId) || EGYPTIAN_MATH_GRADES_SSOT[6];

  const gradeUnits = useMemo(() => loadActiveCurriculumUnitsSSOT(gradeId), [gradeId]);
  const targetedScopeText = useMemo(() => {
    return formatSelectedCurriculumScopeArabic(gradeUnits, selectedUnitIds, selectedLessonIds);
  }, [gradeUnits, selectedUnitIds, selectedLessonIds]);

  const updateTab = (id: string) => { setActiveTabId(id); setPane("builder"); saveStudioGlobalContextSSOT({ activeTabId: id }); };
  const updateGrade = (id: string) => { setGradeId(id); saveStudioGlobalContextSSOT({ gradeId: id }); };
  const updateBranch = (b: MathBranchId) => { setBranchId(b); saveStudioGlobalContextSSOT({ branchId: b }); };
  const updateUnit = (u: string) => { setUnitTitle(u); saveStudioGlobalContextSSOT({ unitTitle: u }); };
  const updateLesson = (l: string) => { setLessonTitle(l); saveStudioGlobalContextSSOT({ lessonTitle: l }); };
  const updateOrder = (o: number) => { setLessonOrder(o); saveStudioGlobalContextSSOT({ lessonOrder: o }); };
  const handleScopeSelection = (unitIds: readonly string[], lessonIds: readonly string[]) => {
    setSelectedUnitIds(unitIds);
    setSelectedLessonIds(lessonIds);
    saveStudioGlobalContextSSOT({ selectedUnitIds: unitIds, selectedLessonIds: lessonIds });
  };

  const applyTitle = (t: string) => { setSheetTitle(t); setPane("preview"); saveStudioGlobalContextSSOT({ sheetTitle: t }); };
  const applyQuestions = (qs: readonly PrintableMathQuestionItem[]) => { setSheetQuestions(qs); setSheetForms(undefined); setPane("preview"); };
  const applyForms = (forms: readonly PrintableExamFormGroup[]) => { setSheetForms(forms); setPane("preview"); };

  const contextSummary = `${grade.nameArabic} • ${targetedScopeText || `${unitTitle || "الوحدة"} • ${lessonTitle}`}`;

  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden pb-28 md:pb-12 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
      <TopFourCentersNavigationBar activeCenter="studio" />
      <main className="max-w-3xl mx-auto px-3 sm:px-5 pt-4 space-y-3">
        <header className="px-1">
          <h1 className="text-lg font-black">استوديو التوليد والطباعة</h1>
          <p className="text-[11px] font-bold text-slate-500">اختر النوع ← جهّز المحتوى ← عاين الورقة واطبعها</p>
        </header>

        <SegmentedWorkspaceTabsBar tabs={STUDIO_TABS} activeTabId={activeTabId} onSelectTab={updateTab} />

        <StudioCollapsibleSectionCard icon="🎯" titleAr="النطاق والدروس المستهدفة" summaryAr={contextSummary}>
          <StudioContextRibbonBar
            selectedGradeId={gradeId} selectedBranchId={branchId} selectedUnitTitle={unitTitle}
            selectedLessonTitle={lessonTitle} selectedLessonOrder={lessonOrder}
            notationLanguage={notationLanguage} onChangeNotationLanguage={updateNotationLanguage}
            selectedUnitIds={selectedUnitIds} selectedLessonIds={selectedLessonIds}
            onChangeGrade={updateGrade} onChangeBranch={updateBranch} onChangeUnitTitle={updateUnit}
            onChangeLessonTitle={updateLesson} onChangeLessonOrder={updateOrder}
            onChangeScopeSelection={handleScopeSelection}
          />
        </StudioCollapsibleSectionCard>

        {pane === "builder" ? (
          <div>
            {activeTabId === "exam" && (
              <StudioExamGeneratorTab
                gradeId={gradeId} gradeNameAr={grade.nameArabic} branchId={branchId}
                unitTitleAr={unitTitle || "الوحدة الأولى"} lessonTitle={lessonTitle}
                branchNameAr={branch.nameArabic}
                selectedUnitIds={selectedUnitIds} selectedLessonIds={selectedLessonIds}
                targetedScopeText={targetedScopeText}
                onApplyExamTitleToSheet={applyTitle}
                onApplyParsedQuestionsToSheet={applyQuestions}
              />
            )}
            {activeTabId === "forms" && (
              <StudioExamFormsGeneratorTab
                gradeId={gradeId} gradeNameAr={grade.nameArabic} branchId={branchId}
                unitTitleAr={unitTitle || "الوحدة الأولى"} lessonTitle={lessonTitle}
                branchNameAr={branch.nameArabic}
                selectedUnitIds={selectedUnitIds} selectedLessonIds={selectedLessonIds}
                targetedScopeText={targetedScopeText}
                onApplyFormsTitleToSheet={applyTitle}
                onApplyParsedQuestionsToSheet={setSheetQuestions}
                onApplyExamFormsToSheet={applyForms}
              />
            )}
            {activeTabId === "booklet" && (
              <StudioBookletGeneratorTab
                gradeId={gradeId} gradeNameAr={grade.nameArabic} branchId={branchId}
                unitTitleAr={unitTitle || "الوحدة الثالثة"} lessonTitle={lessonTitle}
                lessonOrder={lessonOrder} branchNameAr={branch.nameArabic}
                targetedScopeText={targetedScopeText}
                onApplyBookletTitleToSheet={applyTitle} onApplyParsedQuestionsToSheet={applyQuestions}
              />
            )}
            {activeTabId === "review" && (
              <StudioFinalReviewGeneratorTab
                gradeId={gradeId} gradeNameAr={grade.nameArabic} branchId={branchId}
                unitTitleAr={unitTitle || "جميع وحدات المنهج"} branchNameAr={branch.nameArabic}
                targetedScopeText={targetedScopeText}
                onApplyReviewTitleToSheet={applyTitle} onApplyParsedQuestionsToSheet={applyQuestions}
              />
            )}
            {activeTabId === "worksheet" && (
              <StudioWorksheetGeneratorTab
                gradeId={gradeId} gradeNameAr={grade.nameArabic} branchId={branchId}
                branchNameAr={branch.nameArabic} unitTitleAr={unitTitle || "الوحدة الأولى"}
                lessonTitle={lessonTitle} notationLanguage={notationLanguage}
                selectedUnitIds={selectedUnitIds} selectedLessonIds={selectedLessonIds}
                targetedScopeText={targetedScopeText}
                onApplyWorksheetTitleToSheet={applyTitle}
                onApplyParsedQuestionsToSheet={applyQuestions}
              />
            )}
            {activeTabId === "geometry_lab" && <StudioVisualGeometryLabTab />}
          </div>
        ) : (
          <PDFPreviewOrchestrator
            key={sheetTitle} customTitle={sheetTitle} customQuestions={sheetQuestions}
            customForms={sheetForms} gradeNameAr={grade.nameArabic} branchNameAr={branch.nameArabic}
          />
        )}
      </main>

      {activeTabId !== "geometry_lab" && (
        <StudioMobilePaneFloatingSwitch activePane={pane} onChangePane={setPane} />
      )}
    </div>
  );
}
