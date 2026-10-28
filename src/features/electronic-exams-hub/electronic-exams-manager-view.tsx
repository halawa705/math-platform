"use client";

/**
 * @file electronic-exams-manager-view.tsx
 * @description مركز الاختبارات والواجبات بتصميم هادئ: ترويسة + تبويبات (الاختبارات المنشورة، محاضرات الفيديو، الواجبات)
 * في عمود واحد مريح. كل تبويب في ملف ذري مستقل؛ الحالات الفارغة تشرح الخطوة التالية.
 */

import { useState } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import CalmPageTitleHeader from "@/components/global-ui/calm-page-title-header";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import HomeworkDrillsManagerView from "@/features/homework-drills-hub/homework-drills-manager-view";
import PublishedExamsListTab from "./published-exams-list-tab";
import VideoLecturesQuickManagerTab from "./video-lectures-quick-manager-tab";

export const MODULE_ID_ELECTRONIC_EXAMS_MANAGER_VIEW =
  "electronic_exams_manager_view" as const;

const ASSESSMENTS_TABS: readonly SegmentedTabItem[] = [
  { id: "live_exams", labelAr: "الاختبارات", icon: "🎯" },
  { id: "videos_hub", labelAr: "الفيديو", icon: "🎬" },
  { id: "homework_hub", labelAr: "الواجبات", icon: "📝" },
];

export default function ElectronicExamsManagerView() {
  const [activeTabId, setActiveTabId] = useState<string>("live_exams");

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden pb-28 md:pb-12 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="assessments" />

      <main className="max-w-3xl mx-auto px-3 sm:px-5 pt-4 space-y-3">
        <CalmPageTitleHeader
          titleAr="الاختبارات والواجبات"
          hintAr="تابع الاختبارات المنشورة ← أضف المحاضرات ← انشر الواجبات"
        />

        <SegmentedWorkspaceTabsBar
          tabs={ASSESSMENTS_TABS}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
        />

        {activeTabId === "live_exams" && <PublishedExamsListTab />}
        {activeTabId === "videos_hub" && <VideoLecturesQuickManagerTab />}
        {activeTabId === "homework_hub" && <HomeworkDrillsManagerView />}
      </main>
    </div>
  );
}
