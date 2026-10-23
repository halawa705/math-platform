"use client";

/**
 * @file electronic-exams-manager-view.tsx
 * @description الواجهة الرئيسية لمركز التقييمات والاختبارات والوسائط (المركز الثالث من المراكز الأربعة).
 * تضم ٣ تبويبات: إدارة الاختبارات الإلكترونية الحية، إدارة محاضرات الفيديو، وإدارة الواجبات التفاعلية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useState } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import HomeworkDrillsManagerView from "@/features/homework-drills-hub/homework-drills-manager-view";

export const MODULE_ID_ELECTRONIC_EXAMS_MANAGER_VIEW =
  "electronic_exams_manager_view" as const;

const ASSESSMENTS_TABS: readonly SegmentedTabItem[] = [
  {
    id: "live_exams",
    labelAr: "الاختبارات الإلكترونية",
    subtitleAr: "تصحيح فوري وشهادات",
    icon: "🎯",
    badgeText: "حي",
  },
  {
    id: "videos_hub",
    labelAr: "محاضرات الفيديو المسجلة",
    subtitleAr: "فصول زمنية للنظريات",
    icon: "🎬",
  },
  {
    id: "homework_hub",
    labelAr: "الواجبات والتدريبات",
    subtitleAr: "متابعة حلول الطلاب",
    icon: "📝",
  },
];

export default function ElectronicExamsManagerView() {
  const [activeTabId, setActiveTabId] = useState<string>("live_exams");

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-20 md:pb-10 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="assessments" />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        <SegmentedWorkspaceTabsBar
          tabs={ASSESSMENTS_TABS}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
        />

        {activeTabId === "live_exams" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: "اختبار الهندسة المستوية — منتصفا ضلعين في مثلث",
                grade: "الصف الثالث الإعدادي",
                duration: "٣٠ دقيقة",
                submissions: "٤٨ طالباً",
                avgScore: "٩٤٪",
              },
              {
                title: "اختبار الجبر والدوال — المعادلة التربيعية",
                grade: "الصف الأول الثانوي",
                duration: "٤٥ دقيقة",
                submissions: "٦٢ طالباً",
                avgScore: "٨٩٪",
              },
              {
                title: "اختبار حساب المثلثات — النسب المثلثية للزاوية الحادة",
                grade: "الصف الثالث الإعدادي",
                duration: "٣٠ دقيقة",
                submissions: "٥١ طالباً",
                avgScore: "٩٢٪",
              },
            ].map((exam, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between text-[11px] font-black">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    نشط للطلاب
                  </span>
                  <span className="text-slate-400">{exam.duration}</span>
                </div>
                <h3 className="text-sm font-black">{exam.title}</h3>
                <p className="text-xs font-bold text-slate-500">{exam.grade}</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black">
                  <span>تسليمات: {exam.submissions}</span>
                  <span className="text-teal-700 dark:text-teal-400">
                    متوسط الدرجات: {exam.avgScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTabId === "videos_hub" && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-black">
              🎬 إدارة محاضرات الفيديو الرياضية المقسمة زمنياً (Timestamped Math Chapters)
            </h3>
            <p className="text-xs font-bold text-slate-500">
              اربط كل محاضرة فيديو بالدرس المقابل لها في شجرة المنهج (`curriculum-hierarchy-ssot.ts`) مع مذكرة الـ PDF والواجب التطبيقي.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-black">
                  ١. شرح نظرية القطعة الواصلة بين منتصفي ضلعين في مثلث
                </div>
                <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400 mt-1">
                  ٤ فصول زمنية • مرفق مذكرة A4 + تدريب تفاعلي
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-black">
                  ٢. شرح نظرية إقليدس والمساقط العمودية بالبرهان
                </div>
                <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400 mt-1">
                  ٥ فصول زمنية • مرفق مذكرة A4 + اختبار قصير
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTabId === "homework_hub" && <HomeworkDrillsManagerView />}
      </main>
    </div>
  );
}
