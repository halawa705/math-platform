"use client";

/**
 * @file teacher-executive-dashboard-view.tsx
 * @description الصفحة الرئيسية الهادئة للمعلم المالك (`/dashboard`):
 * تعرض إحصائيات الطلاب، والاختبارات غير المراجعة، ورسوماً بيانية نظيفة لمقارنة الصفوف ونسبة حضور الاختبارات،
 * وقاعة المتميزين (أفضل ٣ طلاب) مفصولة لكل صف دراسي بدون أي ازدحام بصري.
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  loadTeacherIdentitySSOT,
  loadEnabledGradesSSOT,
  type OwnerTeacherIdentity,
} from "@/core/ssot/teacher-identity-ssot";
import type { CurriculumGradeNode } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  getGradeAnalyticsAndHonorRollSSOT,
  type GradeAnalyticsMetric,
} from "./grade-honor-roll-ssot";

export default function TeacherExecutiveDashboardView() {
  const [identity, setIdentity] = useState<OwnerTeacherIdentity>(
    DEFAULT_OWNER_TEACHER_IDENTITY_SSOT
  );
  const [enabledGrades, setEnabledGrades] = useState<readonly CurriculumGradeNode[]>([]);
  const [selectedHonorGradeId, setSelectedHonorGradeId] = useState<string>("prep-3");

  useEffect(() => {
    setIdentity(loadTeacherIdentitySSOT());
    const grades = loadEnabledGradesSSOT();
    setEnabledGrades(grades);
    if (grades.length > 0) {
      setSelectedHonorGradeId(grades[grades.length - 1].id);
    }
  }, []);

  const gradeMetrics: readonly GradeAnalyticsMetric[] = useMemo(() => {
    return enabledGrades.map((g) =>
      getGradeAnalyticsAndHonorRollSSOT(g.id, g.nameArabic)
    );
  }, [enabledGrades]);

  const totalRegistered = gradeMetrics.reduce((s, m) => s + m.registeredCount, 0);
  const totalCompletedExams = gradeMetrics.reduce((s, m) => s + m.completedExamsCount, 0);
  const totalUnreviewed = gradeMetrics.reduce((s, m) => s + m.unreviewedSubmissionsCount, 0);
  const participationRate =
    totalRegistered > 0 ? Math.round((totalCompletedExams / totalRegistered) * 100) : 0;

  const bestGrade = useMemo(() => {
    if (gradeMetrics.length === 0) return null;
    return [...gradeMetrics].sort(
      (a, b) => b.averageScorePercentage - a.averageScorePercentage
    )[0];
  }, [gradeMetrics]);

  const activeHonorMetric = useMemo(() => {
    return (
      gradeMetrics.find((m) => m.gradeId === selectedHonorGradeId) ||
      gradeMetrics[0] ||
      getGradeAnalyticsAndHonorRollSSOT("prep-3")
    );
  }, [gradeMetrics, selectedHonorGradeId]);

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-24 md:pb-14 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="dashboard" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ١. بطاقة الترحيب الهادئة والوصول السريع */}
        <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-teal-700 dark:text-teal-400">
              مرحباً بك في {identity.platformBrandName}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {identity.teacherFullName}{" "}
              {identity.teacherNickname ? `(${identity.teacherNickname})` : ""}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تعمل حالياً على {enabledGrades.length} صفوف دراسية مفعّلة — يمكنك تعديلها في أي وقت من الإعدادات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/studio"
              className="min-h-[42px] px-4 py-2 rounded-2xl bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              <span>⚡</span>
              <span>استوديو التوليد والطباعة</span>
            </Link>
            <Link
              href="/settings"
              className="min-h-[42px] px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center gap-1.5"
            >
              <span>⚙️</span>
              <span>إعدادات الهوية والصفوف</span>
            </Link>
          </div>
        </section>

        {/* ٢. البطاقات الإحصائية الأربع الهادئة */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>إجمالي الطلاب المسجلين</span>
              <span className="text-lg">👥</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {totalRegistered}
            </div>
            <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
              موزعين على {enabledGrades.length} صفوف دراسية
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>أدوا الاختبارات الجديدة</span>
              <span className="text-lg">✅</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
              {totalCompletedExams}{" "}
              <span className="text-xs font-bold text-slate-400">({participationRate}%)</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500">
              نسبة التزام مرتفعة من المسجلين
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>اختبارات بانتظار المراجعة</span>
              <span className="text-lg">🔔</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {totalUnreviewed}
            </div>
            <Link
              href="/assessments"
              className="inline-block text-[11px] font-black text-amber-700 dark:text-amber-300 hover:underline"
            >
              مراجعة الدرجات الآن ←
            </Link>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>أفضل صف دراسي أداءً</span>
              <span className="text-lg">🏆</span>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 truncate">
              {bestGrade?.gradeNameAr || "الصف الثالث الإعدادي"}
            </div>
            <p className="text-[11px] font-bold text-slate-500">
              بمتوسط درجات {bestGrade?.averageScorePercentage ?? 95}%
            </p>
          </div>
        </section>

        {/* ٣. الرسوم البيانية المتميزة (مقارنة الصفوف + نسبة أداء الاختبارات) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* رسم بياني ١: مقارنة متوسط الدرجات ونسبة حضور الاختبارات بين الصفوف */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  📊 مقارنة أداء الصفوف الدراسية المفعّلة
                </h2>
                <p className="text-xs text-slate-500">
                  متوسط درجات الاختبارات ونسبة الطلاب المؤدين مقارنة بالمسجلين في كل صف
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              {gradeMetrics.map((m) => {
                const attendancePct = Math.round(
                  (m.completedExamsCount / Math.max(1, m.registeredCount)) * 100
                );
                return (
                  <div key={m.gradeId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200">
                        {m.gradeNameAr}
                      </span>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-slate-500">
                          حضور: {m.completedExamsCount}/{m.registeredCount} ({attendancePct}%)
                        </span>
                        <span className="font-black text-teal-700 dark:text-teal-400">
                          متوسط: {m.averageScorePercentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                      <div
                        style={{ width: `${m.averageScorePercentage}%` }}
                        className="h-full rounded-full bg-gradient-to-l from-teal-500 to-indigo-600 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* رسم بياني ٢: دائرة نسبة أداء الاختبارات للمسجلين */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                🎯 مؤشر تفاعل الطلاب في الاختبارات
              </h2>
              <p className="text-xs text-slate-500">
                نسبة الطلاب الذين أدوا الاختبارات مقارنة بإجمالي المسجلين
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 py-2">
              <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(participationRate / 100) * 301.6} 301.6`}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="65"
                  textAnchor="middle"
                  className="fill-slate-900 dark:fill-white font-black text-xl"
                >
                  {participationRate}%
                </text>
              </svg>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60">
                  <div className="font-bold text-slate-500">أدوا الاختبار</div>
                  <div className="font-black text-base text-teal-700 dark:text-teal-300 font-mono">
                    {totalCompletedExams} طالباً
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <div className="font-bold text-slate-500">لم يؤدوا بعد</div>
                  <div className="font-black text-base text-slate-700 dark:text-slate-300 font-mono">
                    {Math.max(0, totalRegistered - totalCompletedExams)} طلاب
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ٤. قاعة المتميزين (أفضل ٣ طلاب في كل صف دراسي على حدة بدون تداخل) */}
        <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                👑 قاعة المتميزين (أفضل ٣ طلاب لكل صف دراسي)
              </h2>
              <p className="text-xs text-slate-500">
                تظهر هذه اللوحة لطلاب كل صف بشكل مستقل تماماً بحيث يرى طلاب كل صف أوائل صفهم فقط
              </p>
            </div>

            {/* شريط اختيار الصف لعرض أوائله */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {enabledGrades.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedHonorGradeId(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                    selectedHonorGradeId === g.id
                      ? "bg-indigo-900 text-white dark:bg-teal-600 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {g.nameArabic}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeHonorMetric.topThreeHonorRoll.map((stu) => {
              const medal = stu.rank === 1 ? "🥇 المركز الأول" : stu.rank === 2 ? "🥈 المركز الثاني" : "🥉 المركز الثالث";
              return (
                <div
                  key={stu.studentCode}
                  className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-900 border border-amber-200/80 dark:border-amber-800/50 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-black">
                      {medal}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      كود: {stu.studentCode}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {stu.studentNameAr}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">
                      {activeHonorMetric.gradeNameAr} • أتمّ {stu.examsCompleted} اختبارات
                    </p>
                  </div>
                  <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">متوسط الدرجات:</span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                      {stu.averagePercentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
