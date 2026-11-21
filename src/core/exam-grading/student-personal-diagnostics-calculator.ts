/**
 * @file student-personal-diagnostics-calculator.ts
 * @description حاسبة التشخيص الشخصي لنقاط القوة والضعف واتجاه الأداء لكل طالب عبر اختباراته.
 * @invariant ملف نقي مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 105 سطراً).
 */

import { MATH_BRANCHES_SSOT, type MathBranchId } from "@/core/ssot/math-branches-ssot";
import type { PublishedOnlineExam } from "@/features/electronic-exams-hub/published-online-exams-store";
import type { OnlineExamSubmissionRecord } from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import {
  inferMathBranchIdForQuestion,
  type BranchMasteryStat,
} from "./exam-diagnostic-metrics-calculator";

export const MODULE_ID_STUDENT_PERSONAL_DIAGNOSTICS_CALCULATOR =
  "student_personal_diagnostics_calculator" as const;

export interface StudentPersonalDiagnosticSummary {
  readonly totalExamsTaken: number;
  readonly personalAveragePct: number;
  readonly trendStatus: "improving" | "stable" | "declining" | "single";
  readonly branchMasteries: readonly BranchMasteryStat[];
  readonly strengthLessons: readonly { readonly lessonTitleAr: string; readonly masteryPct: number }[];
  readonly weaknessLessons: readonly { readonly lessonTitleAr: string; readonly masteryPct: number }[];
  readonly nextFocusTipAr: string;
}

export function computeStudentPersonalDiagnostics(params: {
  readonly studentCode: string;
  readonly exams: readonly PublishedOnlineExam[];
  readonly submissions: readonly OnlineExamSubmissionRecord[];
}): StudentPersonalDiagnosticSummary {
  const cleanCode = params.studentCode.trim().toUpperCase();
  const mine = params.submissions
    .filter((s) => s.studentCode.toUpperCase() === cleanCode)
    .sort((a, b) => a.submittedAtIso.localeCompare(b.submittedAtIso));

  if (mine.length === 0) {
    return {
      totalExamsTaken: 0,
      personalAveragePct: 0,
      trendStatus: "single",
      branchMasteries: [],
      strengthLessons: [],
      weaknessLessons: [],
      nextFocusTipAr:
        "ابدأ أول اختبار إلكتروني ليقوم النظام بتحليل نقاط قوتك والدروس التي تحتاج لمراجعتها.",
    };
  }

  const avg = Math.round(mine.reduce((a, s) => a + s.percentageScore, 0) / mine.length);
  const prevScore = mine.length >= 2 ? mine[mine.length - 2].percentageScore : mine[0].percentageScore;
  const latestScore = mine[mine.length - 1].percentageScore;
  const trendStatus: StudentPersonalDiagnosticSummary["trendStatus"] =
    mine.length === 1
      ? "single"
      : latestScore - prevScore >= 5
        ? "improving"
        : prevScore - latestScore >= 5
          ? "declining"
          : "stable";

  const branchAgg = new Map<MathBranchId, { qIds: Set<string>; correct: number; total: number }>();
  const lessonAgg = new Map<string, { correct: number; total: number }>();
  const examMap = new Map(params.exams.map((e) => [e.examId, e]));

  for (const sub of mine) {
    const exam = examMap.get(sub.examId);
    for (const it of sub.resultJson?.items ?? []) {
      const q = exam?.questions.find((qq) => qq.questionId === it.questionId);
      const lesson = q?.lessonTitleArabic || sub.examTitleAr.replace(/^اختبار\s*—\s*/, "");
      const lCur = lessonAgg.get(lesson) ?? { correct: 0, total: 0 };
      lCur.total += 1;
      if (it.isCorrect) lCur.correct += 1;
      lessonAgg.set(lesson, lCur);
      if (q) {
        const bId = inferMathBranchIdForQuestion(q, sub.examTitleAr);
        const bCur = branchAgg.get(bId) ?? { qIds: new Set<string>(), correct: 0, total: 0 };
        bCur.qIds.add(q.questionId);
        bCur.total += 1;
        if (it.isCorrect) bCur.correct += 1;
        branchAgg.set(bId, bCur);
      }
    }
  }

  const branchMasteries: BranchMasteryStat[] = Array.from(branchAgg.entries())
    .map(([branchId, agg]) => {
      const masteryPct = agg.total > 0 ? Math.round((agg.correct / agg.total) * 100) : 0;
      return {
        branchId,
        branchNameAr: MATH_BRANCHES_SSOT[branchId].nameArabic,
        symbolBadge: MATH_BRANCHES_SSOT[branchId].symbolBadge,
        questionsCount: agg.qIds.size,
        totalAttempts: agg.total,
        masteryPct,
        tone: masteryPct >= 75 ? ("strong" as const) : masteryPct >= 55 ? ("moderate" as const) : ("weak" as const),
      };
    })
    .sort((a, b) => b.masteryPct - a.masteryPct);

  const lessons = Array.from(lessonAgg.entries()).map(([lessonTitleAr, l]) => ({
    lessonTitleAr,
    masteryPct: l.total > 0 ? Math.round((l.correct / l.total) * 100) : 0,
  }));
  const strengthLessons = lessons.filter((l) => l.masteryPct >= 80).sort((a, b) => b.masteryPct - a.masteryPct).slice(0, 4);
  const weaknessLessons = lessons.filter((l) => l.masteryPct < 70).sort((a, b) => a.masteryPct - b.masteryPct).slice(0, 4);

  const nextFocusTipAr = weaknessLessons[0]
    ? `ركّز اليوم على مراجعة «${weaknessLessons[0].lessonTitleAr}» وحل تدريب إضافي في وضع التدريب الفوري لرفع إتقانك من ${weaknessLessons[0].masteryPct}٪ إلى فوق ٨٥٪.`
    : "أداؤك رائع عبر كل الدروس! حافظ على هذا المستوى وحل تدريباً إضافياً لتثبيت القوانين.";

  return {
    totalExamsTaken: mine.length,
    personalAveragePct: avg,
    trendStatus,
    branchMasteries,
    strengthLessons,
    weaknessLessons,
    nextFocusTipAr,
  };
}
