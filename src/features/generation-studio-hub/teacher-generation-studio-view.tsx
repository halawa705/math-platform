"use client";

/**
 * @file teacher-generation-studio-view.tsx
 * @description الواجهة الرئيسية لمركز استوديو التوليد والإنتاج الموحد بتبويباته الخمسة ومعاينة الـ PDF الحية.
 * مصممة بأولوية الهاتف المحمول (Mobile-First) مع ربط مباشر بشجرة المنهج وبتحويل ردود NotebookLM إلى ورقة الـ A4.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 205 أسطر).
 */

import { useState } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import {
  MATH_BRANCHES_SSOT,
  type MathBranchId,
} from "@/core/ssot/math-branches-ssot";
import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import PDFPreviewOrchestrator from "@/features/pdf-preview-controls/pdf-preview-orchestrator";
import StudioContextRibbonBar from "./studio-context-ribbon-bar";
import StudioExamGeneratorTab from "./studio-exam-generator-tab";
import StudioBookletGeneratorTab from "./studio-booklet-generator-tab";
import StudioFinalReviewGeneratorTab from "./studio-final-review-generator-tab";
import StudioWorksheetGeneratorTab from "./studio-worksheet-generator-tab";
import StudioVisualGeometryLabTab from "./studio-visual-geometry-lab-tab";

export const MODULE_ID_TEACHER_GENERATION_STUDIO_VIEW =
  "teacher_generation_studio_view" as const;

const STUDIO_SEGMENTED_TABS: readonly SegmentedTabItem[] = [
  {
    id: "exam",
    labelAr: "اختبار تقييمي رسمي",
    subtitleAr: "ورقي وإلكتروني",
    icon: "📄",
    badgeText: "A4",
  },
  {
    id: "booklet",
    labelAr: "مذكرة شرح الدرس",
    subtitleAr: "المراحل الثلاث",
    icon: "📘",
  },
  {
    id: "review",
    labelAr: "مراجعة نهائية وشهرية",
    subtitleAr: "كبسولة القوانين",
    icon: "🏆",
  },
  {
    id: "worksheet",
    labelAr: "ورقة عمل وتطبيق",
    subtitleAr: "صفحة واحدة",
    icon: "⚡",
  },
  {
    id: "geometry_lab",
    labelAr: "معمل الأشكال الهندسية",
    subtitleAr: "الأصل والفروع",
    icon: "📐",
    badgeText: "SVG",
  },
];

export default function TeacherGenerationStudioView() {
  const [activeTabId, setActiveTabId] = useState<string>("exam");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("prep-3");
  const [selectedBranchId, setSelectedBranchId] =
    useState<MathBranchId>("plane_geometry");
  const [selectedUnitTitle, setSelectedUnitTitle] = useState<string>(
    "الوحدة الثانية: نظريات المثلث والتوازي وإقليدس"
  );
  const [selectedLessonTitle, setSelectedLessonTitle] = useState<string>(
    "القطعة الواصلة بين منتصفي ضلعين في مثلث"
  );
  const [sheetCustomTitle, setSheetCustomTitle] = useState<string>(
    "اختبار تقييمي في الهندسة المستوية وحساب المثلثات"
  );
  const [customSheetQuestions, setCustomSheetQuestions] = useState<
    readonly PrintableMathQuestionItem[] | undefined
  >(undefined);
  const [mobileActivePane, setMobileActivePane] = useState<"builder" | "preview">(
    "builder"
  );

  const activeBranch = MATH_BRANCHES_SSOT[selectedBranchId];
  const activeGrade =
    EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === selectedGradeId) ||
    EGYPTIAN_MATH_GRADES_SSOT[5];

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-20 md:pb-10 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="studio" />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        <SegmentedWorkspaceTabsBar
          tabs={STUDIO_SEGMENTED_TABS}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
        />

        <StudioContextRibbonBar
          selectedGradeId={selectedGradeId}
          selectedBranchId={selectedBranchId}
          selectedUnitTitle={selectedUnitTitle}
          selectedLessonTitle={selectedLessonTitle}
          onChangeGrade={setSelectedGradeId}
          onChangeBranch={setSelectedBranchId}
          onChangeUnitTitle={setSelectedUnitTitle}
          onChangeLessonTitle={setSelectedLessonTitle}
        />

        {/* مبدل العرض الذكي للهاتف المحمول */}
        <div className="lg:hidden grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/70 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMobileActivePane("builder")}
            className={`min-h-[42px] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileActivePane === "builder"
                ? "bg-indigo-900 text-white shadow"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            <span>⚙️</span>
            <span>إعداد المحتوى والهندسة</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActivePane("preview")}
            className={`min-h-[42px] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileActivePane === "preview"
                ? "bg-teal-700 text-white shadow"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            <span>📄</span>
            <span>معاينة وطباعة الورقة A4</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div
            className={`lg:col-span-5 space-y-4 ${
              mobileActivePane === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            {activeTabId === "exam" && (
              <StudioExamGeneratorTab
                gradeNameAr={activeGrade.nameArabic}
                branchId={selectedBranchId}
                lessonTitle={selectedLessonTitle}
                branchNameAr={activeBranch.nameArabic}
                onApplyExamTitleToSheet={(t) => {
                  setSheetCustomTitle(t);
                  setMobileActivePane("preview");
                }}
                onApplyParsedQuestionsToSheet={(qs) => {
                  setCustomSheetQuestions(qs);
                  setMobileActivePane("preview");
                }}
              />
            )}

            {activeTabId === "booklet" && (
              <StudioBookletGeneratorTab
                lessonTitle={selectedLessonTitle}
                branchNameAr={activeBranch.nameArabic}
                onApplyBookletTitleToSheet={(t) => {
                  setSheetCustomTitle(t);
                  setMobileActivePane("preview");
                }}
              />
            )}

            {activeTabId === "review" && (
              <StudioFinalReviewGeneratorTab
                branchNameAr={activeBranch.nameArabic}
                onApplyReviewTitleToSheet={(t) => {
                  setSheetCustomTitle(t);
                  setMobileActivePane("preview");
                }}
              />
            )}

            {activeTabId === "worksheet" && (
              <StudioWorksheetGeneratorTab
                lessonTitle={selectedLessonTitle}
                onApplyWorksheetTitleToSheet={(t) => {
                  setSheetCustomTitle(t);
                  setMobileActivePane("preview");
                }}
              />
            )}

            {activeTabId === "geometry_lab" && <StudioVisualGeometryLabTab />}
          </div>

          <div
            className={`lg:col-span-7 ${
              mobileActivePane === "builder" ? "hidden lg:block" : "block"
            }`}
          >
            <PDFPreviewOrchestrator
              key={sheetCustomTitle}
              customTitle={sheetCustomTitle}
              customQuestions={customSheetQuestions}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
