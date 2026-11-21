"use client";

/**
 * @file grade-diagnostic-psychometric-and-remediation-card.tsx
 * @description بطاقة التحليل السيكومتري (معامل الصعوبة والتمييز والمشتتات) وخطة التوصيات العلاجية للمعلم.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import { useRouter } from "next/navigation";
import type {
  PsychometricQuestionDiagnostic,
  RemediationRecommendationItem,
} from "@/core/exam-grading/exam-diagnostic-metrics-calculator";
import { prepareRemedialWorksheetInStudio } from "./remedial-worksheet-studio-launcher";

export const MODULE_ID_GRADE_DIAGNOSTIC_PSYCHOMETRIC_AND_REMEDIATION_CARD =
  "grade_diagnostic_psychometric_and_remediation_card" as const;

export interface GradeDiagnosticPsychometricAndRemediationCardProps {
  readonly gradeId: string;
  readonly psychometricQuestions: readonly PsychometricQuestionDiagnostic[];
  readonly remediationPlan: readonly RemediationRecommendationItem[];
}

export default function GradeDiagnosticPsychometricAndRemediationCard({
  gradeId,
  psychometricQuestions,
  remediationPlan,
}: GradeDiagnosticPsychometricAndRemediationCardProps) {
  const router = useRouter();
  if (psychometricQuestions.length === 0 && remediationPlan.length === 0) return null;

  const hardestOrFlagged = [...psychometricQuestions]
    .sort((a, b) => Number(b.isFlaggedAmbiguous) - Number(a.isFlaggedAmbiguous) || b.errorPct - a.errorPct)
    .slice(0, 6);
  const hasWeakTargets = psychometricQuestions.some((q) => q.errorPct >= 30 || q.isFlaggedAmbiguous);

  const handleLaunchRemedial = () => {
    prepareRemedialWorksheetInStudio({
      gradeId,
      weakestQuestions: psychometricQuestions,
    });
    router.push("/studio");
  };

  return (
    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
      {remediationPlan.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-black text-indigo-950 dark:text-teal-300">
              🩺 خطة العمل العلاجية والتدريسية المقترحة للمعلم
            </h3>
            {hasWeakTargets && (
              <button
                type="button"
                onClick={handleLaunchRemedial}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 dark:bg-teal-600 text-white text-[11px] font-black shadow-xs cursor-pointer"
              >
                ⚡ توليد شيت واجب علاجي بالاستوديو ⬅
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {remediationPlan.map((rec, idx) => {
              const cardCls =
                rec.priority === "high"
                  ? "bg-rose-50/80 border-rose-200 text-rose-950 dark:bg-rose-950/25 dark:border-rose-800/70 dark:text-rose-100"
                  : rec.priority === "medium"
                    ? "bg-amber-50/80 border-amber-200 text-amber-950 dark:bg-amber-950/25 dark:border-amber-800/70 dark:text-amber-100"
                    : "bg-emerald-50/80 border-emerald-200 text-emerald-950 dark:bg-emerald-950/25 dark:border-emerald-800/70 dark:text-emerald-100";
              return (
                <div key={idx} className={`p-3 rounded-2xl border space-y-1 text-xs ${cardCls}`}>
                  <div className="font-black">{rec.titleAr}</div>
                  <p className="text-[11px] font-bold opacity-85 leading-relaxed">{rec.actionAr}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hardestOrFlagged.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
            🔬 التحليل السيكومتري وجودة الأسئلة (معامل الصعوبة والتمييز ٢٧٪ والمشتتات)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {hardestOrFlagged.map((q) => (
              <div
                key={`${q.examId}-${q.questionId}`}
                className={`p-3 rounded-2xl border space-y-1.5 text-[11px] ${
                  q.isFlaggedAmbiguous
                    ? "bg-amber-50/70 dark:bg-amber-950/25 border-amber-300 dark:border-amber-700"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between font-black">
                  <span>س{q.displayOrderNumber} • {q.branchNameAr}</span>
                  <span className="font-mono text-indigo-700 dark:text-teal-300">{q.masteryPct}٪ إتقان</span>
                </div>
                <p className="text-slate-500 font-bold truncate">{q.promptSnippetAr}</p>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    صعوبة {q.difficultyIndex}: {q.difficultyLabelAr}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg ${
                      q.isFlaggedAmbiguous
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                        : "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
                    }`}
                  >
                    تمييز {q.discriminationIndex ?? "—"} • {q.qualityFlagAr}
                  </span>
                </div>
                {q.distractorBreakdown.length > 0 && (
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    🔍 المشتتات:{" "}
                    {q.distractorBreakdown
                      .slice(0, 2)
                      .map((d) => `${d.choiceLetterAr} ${d.shareOfErrorsPct}٪`)
                      .join(" • ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
