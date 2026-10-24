"use client";

/**
 * @file teacher-generation-studio-view.tsx
 * @description واجهة استوديو التوليد والطباعة بتصميم هادئ وصديق للهاتف:
 * - شريط تبويبات أفقي قابل للسحب.
 * - سياق (الصف/الوحدة/الدرس) في بطاقة واحدة مطوية تعرض ملخصاً سطرياً.
 * - لوح واحد ظاهر في كل مرة (إعداد وتوليد | معاينة الورقة A4) مع زر عائم للتبديل على الهاتف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import { useState } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import { MATH_BRANCHES_SSOT, type MathBranchId } from "@/core/ssot/math-branches-ssot";
import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import PDFPreviewOrchestrator from "@/features/pdf-preview-controls/pdf-preview-orchestrator";
import StudioContextRibbonBar from "./studio-context-ribbon-bar";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioMobilePaneFloatingSwitch, { type StudioActivePane } from "./studio-mobile-pane-floating-switch";
import StudioExamGeneratorTab from "./studio-exam-generator-tab";
import StudioBookletGeneratorTab from "./studio-booklet-generator-tab";
import StudioFinalReviewGeneratorTab from "./studio-final-review-generator-tab";
import StudioWorksheetGeneratorTab from "./studio-worksheet-generator-tab";
import StudioVisualGeometryLabTab from "./studio-visual-geometry-lab-tab";

export const MODULE_ID_TEACHER_GENERATION_STUDIO_VIEW =
  "teacher_generation_studio_view" as const;

const STUDIO_TABS: readonly SegmentedTabItem[] = [
  { id: "exam", labelAr: "اختبار", icon: "📄" },
  { id: "booklet", labelAr: "مذكرة", icon: "📘" },
  { id: "review", labelAr: "مراجعة", icon: "🏆" },
  { id: "worksheet", labelAr: "ورقة عمل", icon: "⚡" },
  { id: "geometry_lab", labelAr: "معمل الأشكال", icon: "📐" },
];

export default function TeacherGenerationStudioView() {
  const [activeTabId, setActiveTabId] = useState<string>("exam");
  const [gradeId, setGradeId] = useState<string>("prep-3");
  const [branchId, setBranchId] = useState<MathBranchId>("plane_geometry");
  const [unitTitle, setUnitTitle] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("الدرس الأول");
  const [sheetTitle, setSheetTitle] = useState<string>("اختبار تقييمي في الرياضيات");
  const [sheetQuestions, setSheetQuestions] = useState<
    readonly PrintableMathQuestionItem[] | undefined
  >(undefined);
  const [pane, setPane] = useState<StudioActivePane>("builder");

  const branch = MATH_BRANCHES_SSOT[branchId];
  const grade =
    EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === gradeId) || EGYPTIAN_MATH_GRADES_SSOT[6];

  const applyTitle = (t: string) => {
    setSheetTitle(t);
    setPane("preview");
  };
  const applyQuestions = (qs: readonly PrintableMathQuestionItem[]) => {
    setSheetQuestions(qs);
    setPane("preview");
  };

  const contextSummary = `${grade.nameArabic} • ${unitTitle || "الوحدة"} • ${lessonTitle}`;

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden pb-28 md:pb-12 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="studio" />

      <main className="max-w-3xl mx-auto px-3 sm:px-5 pt-4 space-y-3">
        <header className="px-1">
          <h1 className="text-lg font-black">استوديو التوليد والطباعة</h1>
          <p className="text-[11px] font-bold text-slate-500">
            اختر النوع ← جهّز المحتوى ← عاين الورقة واطبعها
          </p>
        </header>

        <SegmentedWorkspaceTabsBar
          tabs={STUDIO_TABS}
          activeTabId={activeTabId}
          onSelectTab={(id) => {
            setActiveTabId(id);
            setPane("builder");
          }}
        />

        <StudioCollapsibleSectionCard icon="🎯" titleAr="الدرس المستهدف" summaryAr={contextSummary}>
          <StudioContextRibbonBar
            selectedGradeId={gradeId}
            selectedBranchId={branchId}
            selectedUnitTitle={unitTitle}
            selectedLessonTitle={lessonTitle}
            onChangeGrade={setGradeId}
            onChangeBranch={setBranchId}
            onChangeUnitTitle={setUnitTitle}
            onChangeLessonTitle={setLessonTitle}
          />
        </StudioCollapsibleSectionCard>

        {pane === "builder" ? (
          <div>
            {activeTabId === "exam" && (
              <StudioExamGeneratorTab
                gradeId={gradeId}
                gradeNameAr={grade.nameArabic}
                branchId={branchId}
                unitTitleAr={unitTitle || "الوحدة الأولى"}
                lessonTitle={lessonTitle}
                branchNameAr={branch.nameArabic}
                onApplyExamTitleToSheet={applyTitle}
                onApplyParsedQuestionsToSheet={applyQuestions}
              />
            )}
            {activeTabId === "booklet" && (
              <StudioBookletGeneratorTab
                gradeId={gradeId}
                gradeNameAr={grade.nameArabic}
                branchId={branchId}
                unitTitleAr={unitTitle || "الوحدة الأولى"}
                lessonTitle={lessonTitle}
                branchNameAr={branch.nameArabic}
                onApplyBookletTitleToSheet={applyTitle}
                onApplyParsedQuestionsToSheet={applyQuestions}
              />
            )}
            {activeTabId === "review" && (
              <StudioFinalReviewGeneratorTab
                gradeId={gradeId}
                gradeNameAr={grade.nameArabic}
                branchId={branchId}
                unitTitleAr={unitTitle || "جميع وحدات المنهج"}
                branchNameAr={branch.nameArabic}
                onApplyReviewTitleToSheet={applyTitle}
                onApplyParsedQuestionsToSheet={applyQuestions}
              />
            )}
            {activeTabId === "worksheet" && (
              <StudioWorksheetGeneratorTab
                gradeId={gradeId}
                gradeNameAr={grade.nameArabic}
                branchId={branchId}
                branchNameAr={branch.nameArabic}
                unitTitleAr={unitTitle || "الوحدة الأولى"}
                lessonTitle={lessonTitle}
                onApplyWorksheetTitleToSheet={applyTitle}
                onApplyParsedQuestionsToSheet={applyQuestions}
              />
            )}
            {activeTabId === "geometry_lab" && <StudioVisualGeometryLabTab />}
          </div>
        ) : (
          <PDFPreviewOrchestrator
            key={sheetTitle}
            customTitle={sheetTitle}
            customQuestions={sheetQuestions}
            gradeNameAr={grade.nameArabic}
            branchNameAr={branch.nameArabic}
          />
        )}
      </main>

      {activeTabId !== "geometry_lab" && (
        <StudioMobilePaneFloatingSwitch activePane={pane} onChangePane={setPane} />
      )}
    </div>
  );
}
