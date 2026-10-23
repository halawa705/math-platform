"use client";

/**
 * @file teacher-executive-dashboard-view.tsx
 * @description الصفحة الرئيسية الهادئة للمعلم (`/dashboard`) بتصميم مرتب في ٣ كتل فقط:
 * ١. شريط مؤشرات واحد (المسجلون، المسلّمون، بانتظار المراجعة، متوسط الدرجات).
 * ٢. قاعة المتميزين (أول ٣ طلاب في كل صف) ظاهرة مباشرة تحت المؤشرات.
 * ٣. لوحة تحليلات برسم بياني واحد يتبدل بنقرة (مقارنة الصفوف / المشاركة / توزيع الدرجات).
 * كل الأرقام حقيقية من تسجيلات وتسليمات الطلاب الفعلية، وتظهر حالات فارغة نظيفة قبل وجود بيانات.
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
import HonorRollPodium from "./honor-roll-podium";

type ChartKind = "grades" | "participation" | "distribution";

const CHART_TABS: readonly { id: ChartKind; label: string }[] = [
  { id: "grades", label: "مقارنة الصفوف" },
  { id: "participation", label: "المشاركة" },
  { id: "distribution", label: "توزيع الدرجات" },
];

const BUCKET_LABELS = ["أقل من ٥٠", "٥٠ – ٦٩", "٧٠ – ٨٤", "٨٥ فأكثر"] as const;
const BUCKET_COLORS = ["#F43F5E", "#F59E0B", "#14B8A6", "#4F46E5"] as const;

function EmptyChartNote({ text }: { readonly text: string }) {
  return (
    <div className="h-48 flex items-center justify-center text-center text-xs font-bold text-slate-400 px-6">
      {text}
    </div>
  );
}

export default function TeacherExecutiveDashboardView() {
  const [identity, setIdentity] = useState<OwnerTeacherIdentity>(
    DEFAULT_OWNER_TEACHER_IDENTITY_SSOT
  );
  const [enabledGrades, setEnabledGrades] = useState<readonly CurriculumGradeNode[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [chartKind, setChartKind] = useState<ChartKind>("grades");
  const [refreshTick, setRefreshTick] = useState<number>(0);

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
    const intervalId = window.setInterval(pullCloud, 15000);
    window.addEventListener(IDENTITY_UPDATED_EVENT_NAME, syncIdentityAndGrades);
    window.addEventListener(STUDENTS_REGISTRY_UPDATED_EVENT, bump);
    window.addEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, bump);
    window.addEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
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
  const maxBar = Math.max(1, ...metrics.map((m) => Math.max(m.registeredCount, m.completedExamsCount)));

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
        {/* ترحيب مضغوط وروابط سريعة */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black">
              {identity.teacherFullName}
              {identity.teacherNickname ? ` (${identity.teacherNickname})` : ""}
            </h1>
            <p className="text-xs font-bold text-slate-500">
              نظرة سريعة على {identity.platformBrandName}
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

        {/* ١. شريط المؤشرات الواحد */}
        <section className="grid grid-cols-2 lg:grid-cols-4 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 divide-x divide-x-reverse divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {kpis.map((k) => (
            <div key={k.label} className="p-5 space-y-1 text-center">
              <div className={`text-3xl font-black font-mono ${k.tone}`}>{k.value}</div>
              <div className="text-[11px] font-bold text-slate-500">{k.label}</div>
            </div>
          ))}
        </section>

        {/* ٢. قاعة المتميزين */}
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

        {/* ٣. التحليلات: رسم بياني واحد يتبدل بنقرة */}
        <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black">📊 التحليلات</h2>
            <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
              {CHART_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setChartKind(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition ${
                    chartKind === t.id
                      ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-xs"
                      : "text-slate-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {chartKind === "grades" &&
            (totalRegistered === 0 && totalSubmitted === 0 ? (
              <EmptyChartNote text="ستظهر مقارنة الصفوف بعد تسجيل الطلاب وأداء الاختبارات." />
            ) : (
              <div>
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 mb-3">
                  <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block" /> مسجلون</span>
                  <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" /> سلّموا</span>
                </div>
                <div className="h-52 flex items-end justify-around gap-3 border-b border-slate-100 dark:border-slate-800">
                  {metrics.map((m) => (
                    <div key={m.gradeId} className="flex-1 max-w-[88px] h-full flex flex-col justify-end items-center gap-1.5">
                      <div className="w-full flex items-end justify-center gap-1.5 h-[calc(100%-1.5rem)]">
                        <div
                          title={`مسجلون: ${m.registeredCount}`}
                          style={{ height: `${(m.registeredCount / maxBar) * 100}%` }}
                          className="w-1/2 rounded-t-lg bg-slate-300 dark:bg-slate-700 min-h-[2px]"
                        />
                        <div
                          title={`سلّموا: ${m.completedExamsCount}`}
                          style={{ height: `${(m.completedExamsCount / maxBar) * 100}%` }}
                          className="w-1/2 rounded-t-lg bg-teal-500 min-h-[2px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-around gap-3 pt-2">
                  {metrics.map((m) => (
                    <div key={m.gradeId} className="flex-1 max-w-[88px] text-center text-[10px] font-bold text-slate-500 leading-tight">
                      {m.gradeNameAr.replace("الصف ", "")}
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {chartKind === "participation" &&
            (totalRegistered === 0 ? (
              <EmptyChartNote text="ستظهر نسبة المشاركة بعد تسجيل الطلاب." />
            ) : (
              <div className="flex items-center justify-center gap-8 py-2">
                <svg viewBox="0 0 120 120" className="w-40 h-40 shrink-0">
                  <circle cx="60" cy="60" r="48" fill="none" strokeWidth="12" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                  <circle
                    cx="60" cy="60" r="48" fill="none" strokeWidth="12" strokeLinecap="round" stroke="#14B8A6"
                    strokeDasharray={`${(participationRate / 100) * 301.6} 301.6`}
                    transform="rotate(-90 60 60)"
                  />
                  <text x="60" y="67" textAnchor="middle" className="fill-slate-900 dark:fill-white font-black" fontSize="22">
                    {participationRate}٪
                  </text>
                </svg>
                <div className="space-y-3 text-xs font-bold">
                  <div><span className="text-slate-400">سلّموا:</span> <span className="font-black text-teal-700 text-base font-mono">{totalSubmitted}</span></div>
                  <div><span className="text-slate-400">لم يسلّموا:</span> <span className="font-black text-slate-700 dark:text-slate-300 text-base font-mono">{Math.max(0, totalRegistered - totalSubmitted)}</span></div>
                </div>
              </div>
            ))}

          {chartKind === "distribution" &&
            activeMetric &&
            (activeMetric.completedExamsCount === 0 ? (
              <EmptyChartNote text={`لا توجد تسليمات بعد في ${activeMetric.gradeNameAr}. اختر صفاً آخر من قاعة المتميزين بالأعلى أو انتظر أول تسليم.`} />
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-500 mb-3">{activeMetric.gradeNameAr} — {activeMetric.activeExamTitleAr}</p>
                <div className="h-44 flex items-end justify-around gap-4 border-b border-slate-100 dark:border-slate-800">
                  {activeMetric.scoreBuckets.map((count, i) => {
                    const top = Math.max(1, ...activeMetric.scoreBuckets);
                    return (
                      <div key={i} className="flex-1 max-w-[80px] h-full flex flex-col justify-end items-center gap-1">
                        <span className="text-xs font-black font-mono">{count}</span>
                        <div
                          style={{ height: `${(count / top) * 80}%`, backgroundColor: BUCKET_COLORS[i] }}
                          className="w-full rounded-t-lg min-h-[3px]"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-around gap-4 pt-2">
                  {BUCKET_LABELS.map((l) => (
                    <div key={l} className="flex-1 max-w-[80px] text-center text-[10px] font-bold text-slate-500">{l}</div>
                  ))}
                </div>
              </div>
            ))}
        </section>
      </main>
    </div>
  );
}
