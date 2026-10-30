"use client";

/**
 * @file teacher-executive-dashboard-view.tsx
 * @description الصفحة الرئيسية الهادئة للمعلم (`/dashboard`) بتصميم ذري مرتب:
 * ١. شريط مؤشرات واحد (المسجلون، المسلّمون، بانتظار المراجعة، متوسط الدرجات).
 * ٢. قاعة المتميزين (أول ٣ طلاب في كل صف) مع محدد الصفوف.
 * ٣. لوحة تشخيص نقاط القوة والضعف العميقة (لآخر اختبار ولجميع الاختبارات).
 * ٤. لوحة التحليلات العامة (مقارنة الصفوف / المشاركة / توزيع الدرجات).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  IDENTITY_UPDATED_EVENT_NAME,
  STUDENTS_REGISTRY_UPDATED_EVENT,
  loadEnabledGradesSSOT,
  loadTeacherIdentitySSOT,
  refreshRegisteredStudentsFromSupabaseSSOT,
  refreshTeacherIdentityFromSupabaseSSOT,
  type OwnerTeacherIdentity,
} from "@/core/ssot/teacher-identity-ssot";
import type { CurriculumGradeNode } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  PUBLISHED_EXAMS_UPDATED_EVENT,
  refreshPublishedExamsFromSupabaseSSOT,
} from "@/features/electronic-exams-hub/published-online-exams-store";
import {
  EXAM_SUBMISSIONS_UPDATED_EVENT,
  MIN_HONOR_ROLL_PERCENTAGE_SSOT,
  getGradeAnalyticsAndHonorRollSSOT,
  refreshExamSubmissionsFromSupabaseSSOT,
  type GradeAnalyticsMetric,
} from "./grade-honor-roll-ssot";
import { subscribeToSupabaseRealtimeTables } from "@/core/supabase/supabase-realtime-submissions-channel";
import HonorRollPodium from "./honor-roll-podium";
import GradeDeepDiagnosticAnalyticsPanel from "./grade-deep-diagnostic-analytics-panel";
import DashboardOverviewChartsPanel from "./dashboard-overview-charts-panel";

export default function TeacherExecutiveDashboardView() {
  const [identity, setIdentity] = useState<OwnerTeacherIdentity>(
    DEFAULT_OWNER_TEACHER_IDENTITY_SSOT
  );
  const [enabledGrades, setEnabledGrades] = useState<readonly CurriculumGradeNode[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [refreshTick, setRefreshTick] = useState<number>(0);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  useEffect(() => {
    const syncIdentityAndGrades = () => {
      setIdentity(loadTeacherIdentitySSOT());
      const grades = loadEnabledGradesSSOT();
      setEnabledGrades(grades);
      setSelectedGradeId((prev) =>
        grades.some((g) => g.id === prev) ? prev : grades[0]?.id || ""
      );
    };
    const bump = () => setRefreshTick((t) => t + 1);
    const pullCloud = () => {
      void refreshTeacherIdentityFromSupabaseSSOT();
      void refreshRegisteredStudentsFromSupabaseSSOT();
      void refreshPublishedExamsFromSupabaseSSOT();
      void refreshExamSubmissionsFromSupabaseSSOT();
    };
    syncIdentityAndGrades();
    pullCloud();
    const unsubscribeRealtime = subscribeToSupabaseRealtimeTables({
      onExamSubmissionsChanged: () => void refreshExamSubmissionsFromSupabaseSSOT(),
      onPublishedExamsChanged: () => void refreshPublishedExamsFromSupabaseSSOT(),
      onStudentsChanged: () => void refreshRegisteredStudentsFromSupabaseSSOT(),
      onConnectionStatusChange: setIsRealtimeConnected,
    });
    const intervalId = window.setInterval(pullCloud, 15000);
    window.addEventListener(IDENTITY_UPDATED_EVENT_NAME, syncIdentityAndGrades);
    window.addEventListener(STUDENTS_REGISTRY_UPDATED_EVENT, bump);
    window.addEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, bump);
    window.addEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      unsubscribeRealtime();
      window.clearInterval(intervalId);
      window.removeEventListener(IDENTITY_UPDATED_EVENT_NAME, syncIdentityAndGrades);
      window.removeEventListener(STUDENTS_REGISTRY_UPDATED_EVENT, bump);
      window.removeEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, bump);
      window.removeEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const metrics: readonly GradeAnalyticsMetric[] = useMemo(() => {
    void refreshTick;
    return enabledGrades.map((g) => getGradeAnalyticsAndHonorRollSSOT(g.id, g.nameArabic));
  }, [enabledGrades, refreshTick]);

  const totalRegistered = metrics.reduce((s, m) => s + m.registeredCount, 0);
  const totalSubmitted = metrics.reduce((s, m) => s + m.completedExamsCount, 0);
  const totalUnreviewed = metrics.reduce((s, m) => s + m.unreviewedSubmissionsCount, 0);
  const gradesWithScores = metrics.filter((m) => m.completedExamsCount > 0);
  const overallAverage =
    totalSubmitted > 0
      ? Math.round(
          gradesWithScores.reduce(
            (s, m) => s + m.averageScorePercentage * m.completedExamsCount,
            0
          ) / totalSubmitted
        )
      : null;
  const participationRate =
    totalRegistered > 0
      ? Math.min(100, Math.round((totalSubmitted / totalRegistered) * 100))
      : 0;

  const activeMetric = metrics.find((m) => m.gradeId === selectedGradeId) || metrics[0];

  const kpis: readonly { label: string; value: string; tone: string }[] = [
    { label: "الطلاب المسجلون", value: String(totalRegistered), tone: "text-slate-900 dark:text-white" },
    { label: "سلّموا الاختبارات", value: String(totalSubmitted), tone: "text-teal-700 dark:text-teal-400" },
    { label: "بانتظار المراجعة", value: String(totalUnreviewed), tone: "text-amber-600 dark:text-amber-400" },
    { label: "متوسط الدرجات", value: overallAverage === null ? "—" : `${overallAverage}٪`, tone: "text-indigo-700 dark:text-indigo-400" },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-28 md:pb-14 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="dashboard" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black">
              {identity.teacherFullName}
              {identity.teacherNickname ? ` (${identity.teacherNickname})` : ""}
            </h1>
            <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <span>نظرة سريعة على {identity.platformBrandName}</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isRealtimeConnected
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRealtimeConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                {isRealtimeConnected ? "بث لحظي نشط (Realtime)" : "مزامنة دورية"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/assessments"
              className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black"
            >
              الاختبارات
            </Link>
            <Link
              href="/studio"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black"
            >
              الاستوديو
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 divide-x divide-x-reverse divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {kpis.map((k) => (
            <div key={k.label} className="p-5 space-y-1 text-center">
              <div className={`text-3xl font-black font-mono ${k.tone}`}>{k.value}</div>
              <div className="text-[11px] font-bold text-slate-500">{k.label}</div>
            </div>
          ))}
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black">👑 قاعة المتميزين</h2>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {enabledGrades.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGradeId(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer transition ${
                    selectedGradeId === g.id
                      ? "bg-indigo-900 text-white dark:bg-teal-600"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {g.nameArabic}
                </button>
              ))}
            </div>
          </div>
          {activeMetric && (
            <HonorRollPodium
              gradeNameAr={activeMetric.gradeNameAr}
              entries={activeMetric.topThreeHonorRoll}
              hasActiveExam={activeMetric.hasActiveExam}
              activeExamTitleAr={activeMetric.activeExamTitleAr}
              minPercentage={MIN_HONOR_ROLL_PERCENTAGE_SSOT}
              showStudentCodes
            />
          )}
        </section>

        {activeMetric && (
          <GradeDeepDiagnosticAnalyticsPanel
            gradeId={activeMetric.gradeId}
            gradeNameAr={activeMetric.gradeNameAr}
            refreshTick={refreshTick}
          />
        )}

        <DashboardOverviewChartsPanel
          metrics={metrics}
          activeMetric={activeMetric}
          totalRegistered={totalRegistered}
          totalSubmitted={totalSubmitted}
          participationRate={participationRate}
        />
      </main>
    </div>
  );
}
