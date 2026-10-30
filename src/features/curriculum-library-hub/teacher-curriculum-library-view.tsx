"use client";

/**
 * @file teacher-curriculum-library-view.tsx
 * @description الواجهة الرئيسية لمركز مكتبة الرياضيات والمنهج (المركز الثاني من المراكز الأربعة).
 * تضم تبويبين ذريين بعد استئصال بنك الأسئلة: مستكشف وتقسيم المنهج (SSOT)، وأرشيف خزينة Google Drive (overmath.math@gmail.com).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useState, useEffect } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import CalmPageTitleHeader from "@/components/global-ui/calm-page-title-header";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import CurriculumNotebooklmSplitterTab from "./curriculum-notebooklm-splitter-tab";
import SavedBookletsReviewsArchiveTab from "./saved-booklets-reviews-archive-tab";

export const MODULE_ID_TEACHER_CURRICULUM_LIBRARY_VIEW =
  "teacher_curriculum_library_view" as const;

const LIBRARY_TABS: readonly SegmentedTabItem[] = [
  { id: "archive", labelAr: "خزينة المذكرات والاختبارات (Drive)", icon: "☁️" },
  { id: "splitter", labelAr: "تقسيم المنهج", icon: "🧭" },
];

export default function TeacherCurriculumLibraryView() {
  const [activeTabId, setActiveTabId] = useState<string>("archive");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "splitter" || tab === "archive") {
      setActiveTabId(tab);
    }
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden pb-28 md:pb-12 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="library" />

      <main className="max-w-3xl mx-auto px-3 sm:px-5 pt-4 space-y-3">
        <CalmPageTitleHeader
          titleAr="خزينة المذكرات ومستكشف المنهج"
          hintAr="استعرض المذكرات والاختبارات المحفوظة حسب الصف الدراسي أو قسّم وحدات المنهج"
        />
        <SegmentedWorkspaceTabsBar
          tabs={LIBRARY_TABS}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
        />

        {activeTabId === "archive" && <SavedBookletsReviewsArchiveTab />}
        {activeTabId === "splitter" && <CurriculumNotebooklmSplitterTab />}
      </main>
    </div>
  );
}
