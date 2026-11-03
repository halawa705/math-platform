"use client";

/**
 * @file teacher-curriculum-library-view.tsx
 * @description الواجهة الرئيسية لمركز مكتبة الرياضيات والمنهج (المركز الثاني من المراكز الأربعة).
 * تضم ثلاثة تبويبات ذرية:
 * 1. مستكشف المنهج المعتمد (Explorer): استعراض شجرة المنهج المعزولة لكل صف دراسي على حدة.
 * 2. تقسيم واستيراد المنهج (Splitter): ربط NotebookLM واستيراد الوحدات والدروس الحقيقية.
 * 3. خزينة المذكرات والاختبارات (Drive Archive): أرشيف ملفات المعلم على Google Drive.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import { useState, useEffect } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import CalmPageTitleHeader from "@/components/global-ui/calm-page-title-header";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import CurriculumExplorerTreeTab from "./curriculum-explorer-tree-tab";
import CurriculumNotebooklmSplitterTab from "./curriculum-notebooklm-splitter-tab";
import SavedBookletsReviewsArchiveTab from "./saved-booklets-reviews-archive-tab";

export const MODULE_ID_TEACHER_CURRICULUM_LIBRARY_VIEW =
  "teacher_curriculum_library_view" as const;

const LIBRARY_TABS: readonly SegmentedTabItem[] = [
  { id: "explorer", labelAr: "مستكشف المنهج المعتمد", icon: "🧭" },
  { id: "splitter", labelAr: "تقسيم واستيراد المنهج", icon: "📥" },
  { id: "archive", labelAr: "خزينة المذكرات والاختبارات (Drive)", icon: "☁️" },
];

export default function TeacherCurriculumLibraryView() {
  const [activeTabId, setActiveTabId] = useState<string>("explorer");
  const [splitterTargetGradeId, setSplitterTargetGradeId] = useState<string>("prep-3");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "explorer" || tab === "splitter" || tab === "archive") {
      setActiveTabId(tab);
    }
  }, []);

  const handleOpenSplitterForGrade = (gradeId: string) => {
    setSplitterTargetGradeId(gradeId);
    setActiveTabId("splitter");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden pb-28 md:pb-12 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="library" />

      <main className="max-w-3xl mx-auto px-3 sm:px-5 pt-4 space-y-3">
        <CalmPageTitleHeader
          titleAr="مستكشف المنهج وخزينة الرياضيات"
          hintAr="استعرض وحدات ودروس كل صف دراسي على حدة، أو قسّم المنهج عبر NotebookLM، أو استعرض الخزينة"
        />
        <SegmentedWorkspaceTabsBar
          tabs={LIBRARY_TABS}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
        />

        {activeTabId === "explorer" && (
          <CurriculumExplorerTreeTab
            onOpenSplitterForGrade={handleOpenSplitterForGrade}
          />
        )}
        {activeTabId === "splitter" && (
          <CurriculumNotebooklmSplitterTab
            initialGradeId={splitterTargetGradeId}
          />
        )}
        {activeTabId === "archive" && <SavedBookletsReviewsArchiveTab />}
      </main>
    </div>
  );
}