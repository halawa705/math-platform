"use client";

/**
 * @file student-personal-diagnostics-card.tsx
 * @description بطاقة تشخيص نقاط القوة والضعف الشخصية للطالب من واقع اختباراته مع نصيحة المذاكرة القادمة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { StudentPersonalDiagnosticSummary } from "@/core/exam-grading/student-personal-diagnostics-calculator";

export const MODULE_ID_STUDENT_PERSONAL_DIAGNOSTICS_CARD =
  "student_personal_diagnostics_card" as const;

export interface StudentPersonalDiagnosticsCardProps {
  readonly summary: StudentPersonalDiagnosticSummary;
}

const TREND_BADGE: Record<
  StudentPersonalDiagnosticSummary["trendStatus"],
  { readonly label: string; readonly cls: string }
> = {
  improving: {
    label: "📈 مستوى متصاعد",
    cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  stable: {
    label: "⚖️ أداء مستقر",
    cls: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  },
  declining: {
    label: "⚠️ يحتاج انتباهاً",
    cls: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  },
  single: {
    label: "🎯 بداية المشوار",
    cls: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200",
  },
};

export default function StudentPersonalDiagnosticsCard({
  summary,
}: StudentPersonalDiagnosticsCardProps) {
  if (summary.totalExamsTaken === 0) return null;
  const badge = TREND_BADGE[summary.trendStatus];

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black">🧭 تحليلي الشخصي: نقاط قوتي وما أحتاج لمراجعته</h2>
          <p className="text-xs font-bold text-slate-500">
            متوسطك العام عبر {summary.totalExamsTaken} اختبارات: {summary.personalAveragePct}٪
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {summary.branchMasteries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {summary.branchMasteries.map((b) => (
            <div key={b.branchId} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span>
                  <span className="font-mono text-indigo-700 dark:text-teal-300 ml-1">{b.symbolBadge}</span>
                  {b.branchNameAr}
                </span>
                <span className="font-mono">{b.masteryPct}٪</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    b.tone === "strong" ? "bg-emerald-600" : b.tone === "moderate" ? "bg-amber-500" : "bg-rose-600"
                  }`}
                  style={{ width: `${b.masteryPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/70 space-y-1.5">
          <div className="font-black text-emerald-900 dark:text-emerald-200">✅ دروس أتقنتها جيداً</div>
          {summary.strengthLessons.length === 0 ? (
            <p className="font-bold text-emerald-800/70">واصل الحل لتصل لدروس فوق ٨٠٪ إتقان.</p>
          ) : (
            summary.strengthLessons.map((l) => (
              <div key={l.lessonTitleAr} className="flex items-center justify-between font-bold">
                <span className="truncate">{l.lessonTitleAr}</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-300">{l.masteryPct}٪</span>
              </div>
            ))
          )}
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-800/70 space-y-1.5">
          <div className="font-black text-rose-900 dark:text-rose-200">📚 دروس تحتاج مراجعة إضافية</div>
          {summary.weaknessLessons.length === 0 ? (
            <p className="font-bold text-rose-800/70">ممتاز! لا توجد دروس دون ٧٠٪.</p>
          ) : (
            summary.weaknessLessons.map((l) => (
              <div key={l.lessonTitleAr} className="flex items-center justify-between font-bold">
                <span className="truncate">{l.lessonTitleAr}</span>
                <span className="font-mono text-rose-600 dark:text-rose-300">{l.masteryPct}٪</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs font-black text-indigo-950 dark:text-indigo-200">
        💡 خطوتك القادمة: {summary.nextFocusTipAr}
      </div>
    </section>
  );
}
