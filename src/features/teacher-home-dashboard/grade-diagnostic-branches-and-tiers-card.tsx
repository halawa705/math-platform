"use client";

/**
 * @file grade-diagnostic-branches-and-tiers-card.tsx
 * @description بطاقة تشخيص إتقان الفروع الرياضية وتوزيع مستويات الطلاب الأربعة وقائمة التدخل العاجل (مع وسم الإخوة).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 145 سطراً).
 */

import type {
  BranchMasteryStat,
  StudentMasteryTierBreakdown,
} from "@/core/exam-grading/exam-diagnostic-metrics-calculator";

export const MODULE_ID_GRADE_DIAGNOSTIC_BRANCHES_AND_TIERS_CARD =
  "grade_diagnostic_branches_and_tiers_card" as const;

export interface GradeDiagnosticBranchesAndTiersCardProps {
  readonly branchStats: readonly BranchMasteryStat[];
  readonly studentTiers: StudentMasteryTierBreakdown;
}

export default function GradeDiagnosticBranchesAndTiersCard({
  branchStats,
  studentTiers,
}: GradeDiagnosticBranchesAndTiersCardProps) {
  if (branchStats.length === 0 && studentTiers.totalUniqueStudents === 0) return null;

  const tiers = [
    { label: "متفوق (≥ ٨٥٪)", count: studentTiers.excellentCount, tone: "bg-emerald-600 text-white" },
    { label: "جيد (٧٠–٨٤٪)", count: studentTiers.goodCount, tone: "bg-teal-600 text-white" },
    { label: "يحتاج دعم (٥٠–٦٩٪)", count: studentTiers.needsSupportCount, tone: "bg-amber-500 text-slate-950" },
    { label: "تدخل عاجل (< ٥٠٪)", count: studentTiers.urgentInterventionCount, tone: "bg-rose-600 text-white" },
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
      {branchStats.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
            📐 مصفوفة إتقان الفروع الرياضية
          </h3>
          <div className="space-y-2.5">
            {branchStats.map((b) => {
              const barCls =
                b.tone === "strong"
                  ? "bg-emerald-600"
                  : b.tone === "moderate"
                    ? "bg-amber-500"
                    : "bg-rose-600";
              return (
                <div key={b.branchId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="truncate">
                      <span className="font-mono text-indigo-700 dark:text-teal-300 ml-1">{b.symbolBadge}</span>
                      {b.branchNameAr}
                    </span>
                    <span className="font-mono shrink-0">{b.masteryPct}٪</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${barCls}`} style={{ width: `${b.masteryPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {studentTiers.totalUniqueStudents > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
            👥 شرائح مستويات الطلاب ({studentTiers.totalUniqueStudents} طالب)
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {tiers.map((t) => (
              <div key={t.label} className={`px-3 py-2 rounded-xl text-[11px] font-black flex items-center justify-between ${t.tone}`}>
                <span className="truncate">{t.label}</span>
                <span className="font-mono text-sm">{t.count}</span>
              </div>
            ))}
          </div>

          {studentTiers.atRiskStudents.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-black text-rose-700 dark:text-rose-300">
                🚨 طلاب بحاجة لمتابعة أو واجب علاجي (&lt; ٧٠٪):
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {studentTiers.atRiskStudents.map((st) => (
                  <div
                    key={st.studentCode}
                    className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-rose-200/70 dark:border-rose-900/50 flex items-center justify-between gap-2 text-[11px]"
                  >
                    <div className="min-w-0">
                      <div className="font-black truncate flex items-center gap-1">
                        <span>{st.studentNameAr}</span>
                        {st.isSibling && (
                          <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[9px]">
                            👨‍👧‍👦 إخوة
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 truncate">
                        أضعف درس: {st.weakestLessonAr}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-black font-mono shrink-0">
                      {st.averagePct}٪
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
