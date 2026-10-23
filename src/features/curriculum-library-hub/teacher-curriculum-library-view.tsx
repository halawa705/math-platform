"use client";

/**
 * @file teacher-curriculum-library-view.tsx
 * @description الواجهة الرئيسية لمركز مكتبة الرياضيات والمنهج (المركز الثاني من المراكز الأربعة).
 * تضم ٣ تبويبات ذرية: مستكشف وتقسيم المنهج (SSOT)، بنك المسائل والنظريات، وأرشيف المذكرات والاختبارات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import React, { useState } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import CurriculumNotebooklmSplitterTab from "./curriculum-notebooklm-splitter-tab";
import MathQuestionBankFilterTab from "./math-question-bank-filter-tab";
import SavedBookletsReviewsArchiveTab from "./saved-booklets-reviews-archive-tab";

export const MODULE_ID_TEACHER_CURRICULUM_LIBRARY_VIEW =
  "teacher_curriculum_library_view" as const;

const LIBRARY_TABS: readonly SegmentedTabItem[] = [
  {
    id: "splitter",
    labelAr: "مستكشف وتقسيم المنهج",
    subtitleAr: "مصدر الحقيقة SSOT",
    icon: "🧭",
    badgeText: "SSOT",
  },
  {
    id: "qbank",
    labelAr: "بنك المسائل والبراهين",
    subtitleAr: "مفلتر بالفروع الـ ١١",
    icon: "🗄️",
  },
  {
    id: "archive",
    labelAr: "أرشيف المذكرات والاختبارات",
    subtitleAr: "جاهز للطباعة الفورية",
    icon: "📚",
  },
];

export default function TeacherCurriculumLibraryView() {
  const [activeTabId, setActiveTabId] = useState<string>("splitter");

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-20 md:pb-10 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="library" />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        <SegmentedWorkspaceTabsBar
          tabs={LIBRARY_TABS}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
        />

        {activeTabId === "splitter" && <CurriculumNotebooklmSplitterTab />}
        {activeTabId === "qbank" && <MathQuestionBankFilterTab />}
        {activeTabId === "archive" && <SavedBookletsReviewsArchiveTab />}
      </main>
    </div>
  );
}
