"use client";

/**
 * @file student-learning-portal-view.tsx
 * @description الواجهة الرئيسية لبوابة الطالب التفاعلية (المركز الرابع من المراكز الأربعة).
 * تجمع التبويبات الذرية الأربعة (`student-assigned-exams-tab.tsx`, `student-assigned-videos-tab.tsx`,
 * `student-assigned-booklets-tab.tsx`, `student-assigned-homework-tab.tsx`) في شاشة واحدة صديقة للهاتف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import React, { useState } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import StudentAssignedExamsTab from "./student-assigned-exams-tab";
import StudentAssignedVideosTab from "./student-assigned-videos-tab";
import StudentAssignedBookletsTab from "./student-assigned-booklets-tab";
import StudentAssignedHomeworkTab from "./student-assigned-homework-tab";

export const MODULE_ID_STUDENT_LEARNING_PORTAL_VIEW =
  "student_learning_portal_view" as const;

const STUDENT_PORTAL_TABS: readonly SegmentedTabItem[] = [
  {
    id: "live_exam",
    labelAr: "الاختبار الإلكتروني الحي",
    subtitleAr: "حل فوري بالهاتف",
    icon: "🎯",
    badgeText: "نشط",
  },
  {
    id: "videos",
    labelAr: "محاضرات الفيديو",
    subtitleAr: "مقسمة بالنظريات",
    icon: "🎬",
  },
  {
    id: "booklets",
    labelAr: "مذكرات الـ PDF",
    subtitleAr: "جاهزة للطباعة",
    icon: "📘",
  },
  {
    id: "homework",
    labelAr: "الواجب التفاعلي",
    subtitleAr: "تدريب بالخطوات",
    icon: "📝",
  },
];

export default function StudentLearningPortalView() {
  const [activeTabId, setActiveTabId] = useState<string>("live_exam");

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-24 md:pb-10 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="student" />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        <SegmentedWorkspaceTabsBar
          tabs={STUDENT_PORTAL_TABS}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
        />

        {activeTabId === "live_exam" && <StudentAssignedExamsTab />}
        {activeTabId === "videos" && <StudentAssignedVideosTab />}
        {activeTabId === "booklets" && <StudentAssignedBookletsTab />}
        {activeTabId === "homework" && <StudentAssignedHomeworkTab />}
      </main>
    </div>
  );
}
