"use client";

/**
 * @file dashboard-overview-charts-panel.tsx
 * @description لوحة الرسوم البيانية العامة للمنصة (مقارنة الصفوف / نسبة المشاركة / توزيع الدرجات).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import { useState } from "react";
import type { GradeAnalyticsMetric } from "./grade-honor-roll-ssot";

export const MODULE_ID_DASHBOARD_OVERVIEW_CHARTS_PANEL = "dashboard_overview_charts_panel" as const;

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

export interface DashboardOverviewChartsPanelProps {
  readonly metrics: readonly GradeAnalyticsMetric[];
  readonly activeMetric?: GradeAnalyticsMetric;
  readonly totalRegistered: number;
  readonly totalSubmitted: number;
  readonly participationRate: number;
}

export default function DashboardOverviewChartsPanel({
  metrics,
  activeMetric,
  totalRegistered,
  totalSubmitted,
  participationRate,
}: DashboardOverviewChartsPanelProps) {
  const [chartKind, setChartKind] = useState<ChartKind>("grades");
  const maxBar = Math.max(1, ...metrics.map((m) => Math.max(m.registeredCount, m.completedExamsCount)));

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-black">📊 التحليلات العامة</h2>
        <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
          {CHART_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setChartKind(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition ${
                chartKind === t.id ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-xs" : "text-slate-500"
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
                strokeDasharray={`${(participationRate / 100) * 301.6} 301.6`} transform="rotate(-90 60 60)"
              />
              <text x="60" y="67" textAnchor="middle" className="fill-slate-900 dark:fill-white font-black" fontSize="22">
                {participationRate}٪
              </text>
            </svg>
            <div className="space-y-3 text-xs font-bold">
              <div>
                <span className="text-slate-400">سلّموا:</span>{" "}
                <span className="font-black text-teal-700 text-base font-mono">{totalSubmitted}</span>
              </div>
              <div>
                <span className="text-slate-400">لم يسلّموا:</span>{" "}
                <span className="font-black text-slate-700 dark:text-slate-300 text-base font-mono">{Math.max(0, totalRegistered - totalSubmitted)}</span>
              </div>
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
                    <div style={{ height: `${(count / top) * 80}%`, backgroundColor: BUCKET_COLORS[i] }} className="w-full rounded-t-lg min-h-[3px]" />
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
  );
}
