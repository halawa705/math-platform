/**
 * @file exam-strengths-weaknesses-analyzer.ts
 * @description محرك تحليل نقاط القوة والضعف في الاختبارات الإلكترونية (بدون الحاجة لبنك أسئلة معقد):
 * - يحلل آخر اختبار للصف + جميع اختبارات الصف التراكمية من واقع تسليمات الطلاب (`resultJson` و `answersJson`).
 * - يكتشف نقاط القوة (نسبة إتقان >= 80%) ونقاط الضعف الحرجة (نسبة خطأ >= 40%) وأكثر البدائل الخاطئة تكراراً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

import { loadAllPublishedExamsSSOT } from "@/features/electronic-exams-hub/published-online-exams-store";
import { loadAllExamSubmissionsSSOT } from "./grade-honor-roll-ssot";

export const MODULE_ID_EXAM_STRENGTHS_WEAKNESSES_ANALYZER =
  "exam_strengths_weaknesses_analyzer" as const;

const CHOICE_LETTERS = ["أ", "ب", "جـ", "د"] as const;

export interface QuestionDiagnosticStat {
  readonly questionId: string;
  readonly displayOrderNumber: number;
  readonly promptSnippetAr: string;
  readonly lessonTitleAr: string;
  readonly totalAttempts: number;
  readonly correctCount: number;
  readonly masteryPct: number;
  readonly errorPct: number;
  readonly topWrongChoiceLabelAr?: string;
}

export interface SingleExamDiagnosticReport {
  readonly examId: string;
  readonly examTitleAr: string;
  readonly submissionsCount: number;
  readonly averageScorePct: number;
  readonly questionStats: readonly QuestionDiagnosticStat[];
  readonly strengthQuestions: readonly QuestionDiagnosticStat[];
  readonly weaknessQuestions: readonly QuestionDiagnosticStat[];
}

export interface CumulativeGradeDiagnosticReport {
  readonly gradeId: string;
  readonly totalExamsCount: number;
  readonly totalSubmissionsCount: number;
  readonly overallAveragePct: number;
  readonly examTrendSeries: readonly {
    readonly examId: string;
    readonly examTitleAr: string;
    readonly averagePct: number;
    readonly submissionsCount: number;
  }[];
  readonly topStrengthsAcrossExams: readonly QuestionDiagnosticStat[];
  readonly topWeaknessesAcrossExams: readonly QuestionDiagnosticStat[];
}

function buildQuestionStatsForExam(
  examId: string
): readonly QuestionDiagnosticStat[] {
  const exam = loadAllPublishedExamsSSOT().find((e) => e.examId === examId);
  if (!exam) return [];
  const subs = loadAllExamSubmissionsSSOT().filter(
    (s) => s.examId === examId && s.resultJson?.items
  );
  if (subs.length === 0) return [];

  return exam.questions.map((q) => {
    let correct = 0;
    let total = 0;
    const wrongChoiceCounts = new Map<number, number>();

    for (const sub of subs) {
      const item = sub.resultJson?.items.find(
        (r) => r.questionId === q.questionId
      );
      if (!item) continue;
      total += 1;
      if (item.isCorrect) {
        correct += 1;
      } else {
        const picked = sub.answersJson?.[q.questionId]?.choiceIndex;
        if (typeof picked === "number") {
          wrongChoiceCounts.set(picked, (wrongChoiceCounts.get(picked) || 0) + 1);
        }
      }
    }

    const masteryPct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const errorPct = total > 0 ? 100 - masteryPct : 0;

    let topWrongChoiceLabelAr: string | undefined;
    let maxWrong = 0;
    wrongChoiceCounts.forEach((cnt, choiceIdx) => {
      if (cnt > maxWrong) {
        maxWrong = cnt;
        topWrongChoiceLabelAr = `البديل (${CHOICE_LETTERS[choiceIdx] ?? choiceIdx + 1}) (${Math.round((cnt / Math.max(1, total - correct)) * 100)}٪ من المخطئين)`;
      }
    });

    const cleanPrompt = q.promptArabic.replace(/\$[^$]*\$/g, " [معادلة] ").trim();

    return {
      questionId: q.questionId,
      displayOrderNumber: q.displayOrderNumber,
      promptSnippetAr:
        cleanPrompt.length > 55 ? `${cleanPrompt.slice(0, 55)}…` : cleanPrompt,
      lessonTitleAr: q.lessonTitleArabic || exam.titleAr.replace(/^اختبار\s*—\s*/, ""),
      totalAttempts: total,
      correctCount: correct,
      masteryPct,
      errorPct,
      topWrongChoiceLabelAr,
    };
  });
}

export function analyzeGradeLatestAndCumulativeDiagnostics(gradeId: string): {
  readonly latestExamReport: SingleExamDiagnosticReport | null;
  readonly cumulativeReport: CumulativeGradeDiagnosticReport;
} {
  const gradeExams = loadAllPublishedExamsSSOT()
    .filter((e) => e.gradeId === gradeId)
    .sort((a, b) => b.publishedAtIso.localeCompare(a.publishedAtIso));

  const allSubs = loadAllExamSubmissionsSSOT().filter((s) => s.gradeId === gradeId);

  const latestExam = gradeExams[0] || null;
  let latestExamReport: SingleExamDiagnosticReport | null = null;

  if (latestExam) {
    const lSubs = allSubs.filter((s) => s.examId === latestExam.examId);
    const lAvg =
      lSubs.length > 0
        ? Math.round(lSubs.reduce((a, s) => a + s.percentageScore, 0) / lSubs.length)
        : 0;
    const qStats = buildQuestionStatsForExam(latestExam.examId).filter(
      (q) => q.totalAttempts > 0
    );
    latestExamReport = {
      examId: latestExam.examId,
      examTitleAr: latestExam.titleAr,
      submissionsCount: lSubs.length,
      averageScorePct: lAvg,
      questionStats: qStats,
      strengthQuestions: qStats.filter((q) => q.masteryPct >= 80),
      weaknessQuestions: qStats
        .filter((q) => q.errorPct >= 40)
        .sort((a, b) => b.errorPct - a.errorPct),
    };
  }

  const allQuestionStats = gradeExams
    .flatMap((e) => buildQuestionStatsForExam(e.examId))
    .filter((q) => q.totalAttempts > 0);

  const examTrendSeries = gradeExams
    .slice()
    .reverse()
    .map((e) => {
      const eSubs = allSubs.filter((s) => s.examId === e.examId);
      const avg =
        eSubs.length > 0
          ? Math.round(eSubs.reduce((a, s) => a + s.percentageScore, 0) / eSubs.length)
          : 0;
      return {
        examId: e.examId,
        examTitleAr: e.titleAr,
        averagePct: avg,
        submissionsCount: eSubs.length,
      };
    })
    .filter((item) => item.submissionsCount > 0);

  const overallAveragePct =
    allSubs.length > 0
      ? Math.round(allSubs.reduce((a, s) => a + s.percentageScore, 0) / allSubs.length)
      : 0;

  return {
    latestExamReport,
    cumulativeReport: {
      gradeId,
      totalExamsCount: gradeExams.length,
      totalSubmissionsCount: allSubs.length,
      overallAveragePct,
      examTrendSeries,
      topStrengthsAcrossExams: allQuestionStats
        .filter((q) => q.masteryPct >= 80)
        .sort((a, b) => b.masteryPct - a.masteryPct)
        .slice(0, 5),
      topWeaknessesAcrossExams: allQuestionStats
        .filter((q) => q.errorPct >= 40)
        .sort((a, b) => b.errorPct - a.errorPct)
        .slice(0, 5),
    },
  };
}
