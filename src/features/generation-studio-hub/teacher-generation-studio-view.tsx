"use client";

/**
 * @file teacher-generation-studio-view.tsx
 * @description الواجهة الرئيسية الهادئة لمركز استوديو التوليد والإنتاج الموحد:
 * تفصل بين خطوة إعداد البرومبت ودمج رد NotebookLM وبين خطوة معاينة وتنسيق ورقة الـ A4
 * للقضاء التام على الزحام البصري، وتربط كل صف بدفتر NotebookLM الخاص به.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 215 سطراً).
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
    subtitleAr: "المراحل الثلاث",
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
    subtitleAr: "الرسم بالوصف العربي",
    icon: "📐",
    badgeText: "SVG",
  },
];

export default function TeacherGenerationStudioView() {
  const [activeTabId, setActiveTabId] = useState<string>("exam");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("prep-3");
  const [selectedBranchId, setSelectedBranchId] =
    useState<MathBranchId>("plane_geometry");
  const [selectedUnitTitle, setSelectedUnitTitle] = useState<string>("");
  const [selectedLessonTitle, setSelectedLessonTitle] =
    useState<string>("الدرس الأول");
  const [sheetCustomTitle, setSheetCustomTitle] = useState<string>(
    "اختبار تقييمي في الرياضيات"
  );
  const [customSheetQuestions, setCustomSheetQuestions] = useState<
    readonly PrintableMathQuestionItem[] | undefined
  >(undefined);
  const [activeStepPane, setActiveStepPane] = useState<"builder" | "preview">(
    "builder"
  );

  const activeBranch = MATH_BRANCHES_SSOT[selectedBranchId];
  const activeGrade =
    EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === selectedGradeId) ||
    EGYPTIAN_MATH_GRADES_SSOT[6];

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="studio" />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-5 space-y-5">
        <SegmentedWorkspaceTabsBar
          tabs={STUDIO_SEGMENTED_TABS}
          activeTabId={activeTabId}
          onSelectTab={(id) => {
            setActiveTabId(id);
            setActiveStepPane("builder");
          }}
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

        {/* مبدل الخطوتين الهادئ لمنع تكدس الإعدادات مع ورقة الـ A4 في شاشة واحدة */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/70 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveStepPane("builder")}
            className={`min-h-[46px] rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer ${
              activeStepPane === "builder"
                ? "bg-indigo-900 text-white shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:bg-white/60"
            }`}
          >
            <span>١.</span>
            <span>إعداد البرومبت ودمج رد NotebookLM</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStepPane("preview")}
            className={`min-h-[46px] rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer ${
              activeStepPane === "preview"
                ? "bg-teal-700 text-white shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:bg-white/60"
            }`}
          >
            <span>٢.</span>
            <span>معاينة وتنسيق وطباعة ورقة الـ A4 📄</span>
          </button>
        </div>

        {activeStepPane === "builder" ? (
          <div className="space-y-4">
            {activeTabId === "exam" && (
              <StudioExamGeneratorTab
                gradeId={selectedGradeId}
                gradeNameAr={activeGrade.nameArabic}
                branchId={selectedBranchId}
                lessonTitle={selectedLessonTitle}
                branchNameAr={activeBranch.nameArabic}
                onApplyExamTitleToSheet={(t) => {
                  setSheetCustomTitle(t);
                  setActiveStepPane("preview");
                }}
                onApplyParsedQuestionsToSheet={(qs) => {
                  setCustomSheetQuestions(qs);
                  setActiveStepPane("preview");
                }}
              />
            )}

            {activeTabId === "booklet" && (
              <StudioBookletGeneratorTab
                gradeId={selectedGradeId}
                gradeNameAr={activeGrade.nameArabic}
                branchId={selectedBranchId}
                unitTitleAr={selectedUnitTitle || "الوحدة الأولى"}
                lessonTitle={selectedLessonTitle}
                branchNameAr={activeBranch.nameArabic}
                onApplyBookletTitleToSheet={(t) => {
                  setSheetCustomTitle(t);
                  setActiveStepPane("preview");
                }}
                onApplyParsedQuestionsToSheet={(qs) => {
                  setCustomSheetQuestions(qs);
                  setActiveStepPane("preview");
                }}
              />
            )}

            {activeTabId === "review" && (
              <StudioFinalReviewGeneratorTab
                gradeId={selectedGradeId}
                gradeNameAr={activeGrade.nameArabic}
                branchId={selectedBranchId}
                unitTitleAr={selectedUnitTitle || "جميع وحدات المنهج"}
                branchNameAr={activeBranch.nameArabic}
                onApplyReviewTitleToSheet={(t) => {
                  setSheetCustomTitle(t);
                  setActiveStepPane("preview");
                }}
                onApplyParsedQuestionsToSheet={(qs) => {
                  setCustomSheetQuestions(qs);
                  setActiveStepPane("preview");
                }}
              />
            )}

            {activeTabId === "worksheet" && (
              <StudioWorksheetGeneratorTab
                gradeId={selectedGradeId}
                gradeNameAr={activeGrade.nameArabic}
                branchId={selectedBranchId}
                branchNameAr={activeBranch.nameArabic}
                lessonTitle={selectedLessonTitle}
                onApplyWorksheetTitleToSheet={(t) => {
                  setSheetCustomTitle(t);
                  setActiveStepPane("preview");
                }}
                onApplyParsedQuestionsToSheet={(qs) => {
                  setCustomSheetQuestions(qs);
                  setActiveStepPane("preview");
                }}
              />
            )}

            {activeTabId === "geometry_lab" && <StudioVisualGeometryLabTab />}
          </div>
        ) : (
          <PDFPreviewOrchestrator
            key={sheetCustomTitle}
            customTitle={sheetCustomTitle}
            customQuestions={customSheetQuestions}
          />
        )}
      </main>
    </div>
  );
}
