"use client";

/**
 * @file grade-deep-diagnostic-analytics-panel.tsx
 * @description لوحة تشخيص نقاط القوة والضعف للصف الدراسي (تحليل آخر اختبار + التحليل التراكمي لجميع الاختبارات)
 * مع مخطط إتقان الأسئلة ورادار نقاط القوة والضعف وأكثر الأخطاء الشائعة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import { useState, useMemo } from "react";
import { analyzeGradeLatestAndCumulativeDiagnostics } from "./exam-strengths-weaknesses-analyzer";

export const MODULE_ID_GRADE_DEEP_DIAGNOSTIC_ANALYTICS_PANEL =
  "grade_deep_diagnostic_analytics_panel" as const;

export interface GradeDeepDiagnosticAnalyticsPanelProps {
  readonly gradeId: string;
  readonly gradeNameAr: string;
  readonly refreshTick: number;
}

export default function GradeDeepDiagnosticAnalyticsPanel({
  gradeId,
  gradeNameAr,
  refreshTick,
}: GradeDeepDiagnosticAnalyticsPanelProps) {
  const [scope, setScope] = useState<"latest" | "cumulative">("latest");

  const { latestExamReport, cumulativeReport } = useMemo(() => {
    void refreshTick;
    return analyzeGradeLatestAndCumulativeDiagnostics(gradeId);
  }, [gradeId, refreshTick]);

  const strengths =
    scope === "latest"
      ? latestExamReport?.strengthQuestions ?? []
      : cumulativeReport.topStrengthsAcrossExams;
  const weaknesses =
    scope === "latest"
      ? latestExamReport?.weaknessQuestions ?? []
      : cumulativeReport.topWeaknessesAcrossExams;

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black">
            🧠 تشخيص نقاط القوة والضعف — {gradeNameAr}
          </h2>
          <p className="text-xs font-bold text-slate-500">
            تحليل ذري لإجابات الطلاب في كل سؤال لتحديد المفاهيم المتقنة والأسئلة التي تحتاج مراجعة
          </p>
        </div>

        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setScope("latest")}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition ${
              scope === "latest"
                ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-xs"
                : "text-slate-500"
            }`}
          >
            🎯 آخر اختبار
          </button>
          <button
            type="button"
            onClick={() => setScope("cumulative")}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition ${
              scope === "cumulative"
                ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-xs"
                : "text-slate-500"
            }`}
          >
            📈 جميع اختبارات الصف ({cumulativeReport.totalExamsCount})
          </button>
        </div>
      </div>

      {scope === "latest" ? (
        !latestExamReport || latestExamReport.questionStats.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-center text-xs font-bold text-slate-400">
            سيظهر التشخيص التفصيلي للأسئلة فور قيام طلاب {gradeNameAr} بتسليم أحدث اختبار إلكتروني.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black text-slate-600 dark:text-slate-300">
              <span>📌 {latestExamReport.examTitleAr}</span>
              <span>
                {latestExamReport.submissionsCount} طالب سلّم • متوسط الاختبار:{" "}
                <strong className="text-indigo-700 dark:text-teal-300">
                  {latestExamReport.averageScorePct}٪
                </strong>
              </span>
            </div>

            {/* مدرج إتقان الأسئلة البصري */}
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold text-slate-500">
                📊 نسبة الإجابة الصحيحة لكل سؤال في الاختبار:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {latestExamReport.questionStats.map((q) => {
                  const tone =
                    q.masteryPct >= 80
                      ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
                      : q.errorPct >= 40
                      ? "border-rose-300 bg-rose-50/60 dark:border-rose-800 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200"
                      : "border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200";
                  return (
                    <div
                      key={q.questionId}
                      className={`p-2.5 rounded-2xl border ${tone} space-y-1`}
                    >
                      <div className="flex items-center justify-between text-xs font-black">
                        <span>سؤال {q.displayOrderNumber}</span>
                        <span className="font-mono">{q.masteryPct}٪ صح</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden">
                        <div
                          className={`h-full ${
                            q.masteryPct >= 80
                              ? "bg-emerald-600"
                              : q.errorPct >= 40
                              ? "bg-rose-600"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${q.masteryPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : cumulativeReport.examTrendSeries.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-center text-xs font-bold text-slate-400">
          لا توجد بيانات تراكمية بعد لطلاب {gradeNameAr}.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-black text-slate-600 dark:text-slate-300">
            📈 تطور متوسط درجات {gradeNameAr} عبر الاختبارات ({cumulativeReport.totalSubmissionsCount} تسليم إجمالي • المتوسط العام {cumulativeReport.overallAveragePct}٪):
          </div>
          <div className="h-40 flex items-end justify-around gap-3 pt-4 border-b border-slate-100 dark:border-slate-800">
            {cumulativeReport.examTrendSeries.map((ex) => (
              <div
                key={ex.examId}
                className="flex-1 max-w-[96px] h-full flex flex-col justify-end items-center gap-1"
              >
                <span className="text-[11px] font-black font-mono text-indigo-700 dark:text-teal-300">
                  {ex.averagePct}٪
                </span>
                <div
                  style={{ height: `${Math.max(8, (ex.averagePct / 100) * 80)}%` }}
                  className="w-full rounded-t-xl bg-gradient-to-t from-indigo-700 to-teal-500"
                />
                <span className="text-[10px] font-bold text-slate-500 truncate max-w-full">
                  {ex.examTitleAr.replace(/^اختبار\s*—\s*/, "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* بطاقات نقاط القوة ونقاط الضعف */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/70 space-y-2.5">
            <h3 className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <span>✅</span>
              <span>نقاط قوة الطلاب (أسئلة متقنة بلا أخطاء تذكر)</span>
            </h3>
            {strengths.length === 0 ? (
              <p className="text-xs font-bold text-emerald-800/70 dark:text-emerald-300/70">
                لم يتجاوز أي سؤال نسبة إتقان ٨٠٪ حتى الآن.
              </p>
            ) : (
              <ul className="space-y-2 text-xs font-bold text-emerald-950 dark:text-emerald-100">
                {strengths.map((q) => (
                  <li
                    key={q.questionId}
                    className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-800/60"
                  >
                    <div className="flex items-center justify-between font-black">
                      <span>
                        سؤال {q.displayOrderNumber} ({q.lessonTitleAr})
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {q.masteryPct}٪ إتقان
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {q.promptSnippetAr}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-800/70 space-y-2.5">
            <h3 className="text-xs font-black text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>نقاط ضعف الطلاب (أسئلة أخطأ فيها معظم الطلاب)</span>
            </h3>
            {weaknesses.length === 0 ? (
              <p className="text-xs font-bold text-rose-800/70 dark:text-rose-300/70">
                ممتاز! لا توجد أسئلة تجاوزت نسبة الخطأ فيها ٤٠٪.
              </p>
            ) : (
              <ul className="space-y-2 text-xs font-bold text-rose-950 dark:text-rose-100">
                {weaknesses.map((q) => (
                  <li
                    key={q.questionId}
                    className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-rose-200/80 dark:border-rose-800/60"
                  >
                    <div className="flex items-center justify-between font-black">
                      <span>
                        سؤال {q.displayOrderNumber} ({q.lessonTitleAr})
                      </span>
                      <span className="text-rose-600 dark:text-rose-400">
                        {q.errorPct}٪ أخطأوا
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {q.promptSnippetAr}
                    </p>
                    {q.topWrongChoiceLabelAr && (
                      <p className="text-[11px] font-black text-amber-700 dark:text-amber-300 mt-1">
                        🔍 الخطأ الشائع: {q.topWrongChoiceLabelAr}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
