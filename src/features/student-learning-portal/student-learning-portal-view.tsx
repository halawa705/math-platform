"use client";

/**
 * @file student-learning-portal-view.tsx
 * @description الواجهة الرئيسية الهادئة لبوابة الطالب التفاعلية:
 * تستقبل الطالب بلوحة رئيسية منظمة تعرض الرسم البياني لتطور درجاته في الاختبارات،
 * وقاعة المتميزين (أفضل ٣ طلاب) المعزولة حصرياً لصفه الدراسي فقط دون أي تداخل مع الصفوف الأخرى.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 215 سطراً).
 */

import { useEffect, useState } from "react";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  loadEnabledGradesSSOT,
  loadRememberedSessionSSOT,
  loadTeacherIdentitySSOT,
} from "@/core/ssot/teacher-identity-ssot";
import {
  getGradeAnalyticsAndHonorRollSSOT,
  type HonorStudentEntry,
} from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import StudentAssignedExamsTab from "./student-assigned-exams-tab";
import StudentAssignedVideosTab from "./student-assigned-videos-tab";
import StudentAssignedBookletsTab from "./student-assigned-booklets-tab";
import StudentAssignedHomeworkTab from "./student-assigned-homework-tab";

export const MODULE_ID_STUDENT_LEARNING_PORTAL_VIEW =
  "student_learning_portal_view" as const;

const STUDENT_PORTAL_TABS: readonly SegmentedTabItem[] = [
  {
    id: "overview",
    labelAr: "الرئيسية ودرجاتي",
    subtitleAr: "تحليل الأداء والمتميزون",
    icon: "📊",
    badgeText: "جديد",
  },
  {
    id: "live_exam",
    labelAr: "الاختبار الإلكتروني",
    subtitleAr: "حل فوري بالهاتف",
    icon: "🎯",
  },
  {
    id: "homework",
    labelAr: "الواجب التفاعلي",
    subtitleAr: "تدريب بالخطوات",
    icon: "📝",
  },
  {
    id: "booklets",
    labelAr: "مذكرات الـ PDF",
    subtitleAr: "جاهزة للطباعة",
    icon: "📘",
  },
  {
    id: "videos",
    labelAr: "محاضرات الفيديو",
    subtitleAr: "مقسمة بالنظريات",
    icon: "🎬",
  },
];

const STUDENT_PERSONAL_EXAM_HISTORY = [
  { examTitle: "اختبار ١ (الدرس الأول)", scorePct: 85, classAvgPct: 76 },
  { examTitle: "اختبار ٢ (الدرس الثاني)", scorePct: 92, classAvgPct: 79 },
  { examTitle: "اختبار الوحدة الأولى", scorePct: 96, classAvgPct: 82 },
] as const;

export default function StudentLearningPortalView() {
  const [activeTabId, setActiveTabId] = useState<string>("overview");
  const [studentName, setStudentName] = useState<string>("زياد إسلام حلاوة");
  const [studentGradeId, setStudentGradeId] = useState<string>("prep-3");
  const [enabledGrades, setEnabledGrades] = useState(() =>
    loadEnabledGradesSSOT()
  );
  const [gradeTopThree, setGradeTopThree] = useState<
    readonly HonorStudentEntry[]
  >([]);
  const [footerText, setFooterText] = useState<string>(
    DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.footerText
  );

  useEffect(() => {
    const grades = loadEnabledGradesSSOT();
    setEnabledGrades(grades);
    const session = loadRememberedSessionSSOT();
    if (session?.role === "student") {
      if (session.studentNameAr) setStudentName(session.studentNameAr);
      if (session.gradeId) setStudentGradeId(session.gradeId);
    }
    setFooterText(loadTeacherIdentitySSOT().footerText);
  }, []);

  useEffect(() => {
    const metric = getGradeAnalyticsAndHonorRollSSOT(studentGradeId);
    setGradeTopThree(metric.topThreeHonorRoll);
  }, [studentGradeId]);

  const currentGradeObj =
    enabledGrades.find((g) => g.id === studentGradeId) || enabledGrades[0];

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col justify-between"
    >
      <div>
        <TopFourCentersNavigationBar activeCenter="student" />

        <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-5 space-y-5">
          {/* ترويسة ترحيب الطالب الهادئة */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                👋 أهلاً بك يا {studentName}
              </h1>
              <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                {currentGradeObj?.nameArabic} — تابع تقدمك ودرجاتك وقاعة المتميزين لصفك الدراسي
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">صفك الدراسي:</span>
              <select
                value={studentGradeId}
                onChange={(e) => setStudentGradeId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
              >
                {enabledGrades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nameArabic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <SegmentedWorkspaceTabsBar
            tabs={STUDENT_PORTAL_TABS}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
          />

          {activeTabId === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* الرسم البياني لتطور أداء الطالب ومقارنته بمتوسط الصف */}
              <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    📈 مؤشر تطور درجاتك ومقارنة أدائك في الاختبارات
                  </h2>
                  <p className="text-xs font-bold text-slate-500">
                    الشريط الأخضر يمثل درجتك والشريط الرمادي يمثل متوسط زملائك في نفس الصف
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {STUDENT_PERSONAL_EXAM_HISTORY.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span>{item.examTitle}</span>
                        <span className="text-teal-700 dark:text-teal-400">
                          درجتك: {item.scorePct}% (متوسط الصف: {item.classAvgPct}%)
                        </span>
                      </div>
                      <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                        <div
                          style={{ width: `${item.scorePct}%` }}
                          className="h-full rounded-full bg-gradient-to-l from-teal-500 to-emerald-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* قاعة المتميزين المعزولة حصرياً لصف الطالب فقط */}
              <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    👑 قاعة المتميزين — {currentGradeObj?.nameArabic} فقط
                  </h2>
                  <p className="text-xs font-bold text-slate-500">
                    أفضل ٣ طلاب في صفك الدراسي هذا الشهر
                  </p>
                </div>

                {gradeTopThree.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center text-xs font-bold text-slate-500">
                    سيتم إعلان أوائل ({currentGradeObj?.nameArabic}) فور انتهاء الاختبار القادم.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {gradeTopThree.map((st, idx) => {
                      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
                      const pct = st.averagePercentage;
                      return (
                        <div
                          key={st.studentCode}
                          className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-slate-900 border border-amber-200/70 dark:border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{medal}</span>
                            <div>
                              <div className="text-xs font-black text-slate-900 dark:text-white">
                                {st.studentNameAr}
                              </div>
                              <div className="text-[11px] font-bold text-slate-500">
                                المركز {idx + 1} على {currentGradeObj?.nameArabic}
                              </div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-teal-500/15 text-teal-800 dark:text-teal-300 text-xs font-black">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTabId === "live_exam" && <StudentAssignedExamsTab />}
          {activeTabId === "videos" && <StudentAssignedVideosTab />}
          {activeTabId === "booklets" && <StudentAssignedBookletsTab />}
          {activeTabId === "homework" && <StudentAssignedHomeworkTab />}
        </main>
      </div>

      <footer className="max-w-5xl mx-auto w-full px-4 pt-8 pb-4 text-center text-xs font-bold text-slate-400">
        {footerText}
      </footer>
    </div>
  );
}
