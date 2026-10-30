/**
 * @file grade-honor-roll-calculator.ts
 * @description حاسب مؤشرات الصف الدراسي وقاعة المتميزين وسجل اختبارات الطالب من التسليمات الفعلية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import { loadRegisteredStudentsSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  loadActiveExamsForGradeSSOT,
  loadAllPublishedExamsSSOT,
} from "@/features/electronic-exams-hub/published-online-exams-store";
import {
  loadAllExamSubmissionsSSOT,
  MIN_HONOR_ROLL_PERCENTAGE_SSOT,
  type OnlineExamSubmissionRecord,
} from "./grade-honor-roll-ssot";

export const MODULE_ID_GRADE_HONOR_ROLL_CALCULATOR =
  "grade_honor_roll_calculator" as const;

export interface HonorStudentEntry {
  readonly rank: 1 | 2 | 3;
  readonly studentNameAr: string;
  readonly studentCode: string;
  readonly gradeId: string;
  readonly averagePercentage: number;
}

export interface GradeAnalyticsMetric {
  readonly gradeId: string;
  readonly gradeNameAr: string;
  readonly registeredCount: number;
  readonly completedExamsCount: number;
  readonly unreviewedSubmissionsCount: number;
  readonly averageScorePercentage: number;
  readonly hasActiveExam: boolean;
  readonly activeExamTitleAr: string;
  /** توزيع الدرجات: أقل من 50 / 50–69 / 70–84 / 85 فأكثر */
  readonly scoreBuckets: readonly [number, number, number, number];
  readonly topThreeHonorRoll: readonly HonorStudentEntry[];
}

export interface StudentExamHistoryItem {
  readonly examTitleAr: string;
  readonly studentPercentage: number;
  readonly classAveragePercentage: number;
}

export function getGradeAnalyticsAndHonorRollSSOT(
  gradeId: string,
  gradeNameAr: string
): GradeAnalyticsMetric {
  const registeredCount = loadRegisteredStudentsSSOT().filter(
    (s) => s.gradeId === gradeId
  ).length;

  const activeExams = loadActiveExamsForGradeSSOT(gradeId);
  const activeExamIds = new Set(activeExams.map((e) => e.examId));
  const submissions =
    activeExamIds.size > 0
      ? loadAllExamSubmissionsSSOT().filter((s) => activeExamIds.has(s.examId))
      : [];

  const completedExamsCount = submissions.length;
  const averageScorePercentage =
    completedExamsCount > 0
      ? Math.round(
          submissions.reduce((acc, s) => acc + s.percentageScore, 0) /
            completedExamsCount
        )
      : 0;

  const buckets: [number, number, number, number] = [0, 0, 0, 0];
  submissions.forEach((s) => {
    if (s.percentageScore < 50) buckets[0] += 1;
    else if (s.percentageScore < MIN_HONOR_ROLL_PERCENTAGE_SSOT) buckets[1] += 1;
    else if (s.percentageScore < 85) buckets[2] += 1;
    else buckets[3] += 1;
  });

  const bestByStudent = new Map<string, OnlineExamSubmissionRecord>();
  for (const s of submissions) {
    if (s.percentageScore < MIN_HONOR_ROLL_PERCENTAGE_SSOT) continue;
    const key = s.studentCode.toUpperCase();
    const prev = bestByStudent.get(key);
    if (!prev || s.percentageScore > prev.percentageScore) {
      bestByStudent.set(key, s);
    }
  }

  const topThreeHonorRoll: HonorStudentEntry[] = Array.from(bestByStudent.values())
    .sort(
      (a, b) =>
        b.percentageScore - a.percentageScore ||
        a.submittedAtIso.localeCompare(b.submittedAtIso)
    )
    .slice(0, 3)
    .map((s, idx) => ({
      rank: (idx + 1) as 1 | 2 | 3,
      studentNameAr: s.studentNameAr,
      studentCode: s.studentCode,
      gradeId: s.gradeId,
      averagePercentage: s.percentageScore,
    }));

  return {
    gradeId,
    gradeNameAr,
    registeredCount,
    completedExamsCount,
    unreviewedSubmissionsCount: submissions.filter((s) => !s.isReviewedByTeacher).length,
    averageScorePercentage,
    hasActiveExam: activeExams.length > 0,
    activeExamTitleAr: activeExams.map((e) => e.titleAr).join(" • "),
    scoreBuckets: buckets,
    topThreeHonorRoll,
  };
}

export function loadStudentExamHistorySSOT(
  studentCode: string
): readonly StudentExamHistoryItem[] {
  const cleanCode = studentCode.trim().toUpperCase();
  const all = loadAllExamSubmissionsSSOT();
  const titles = new Map(loadAllPublishedExamsSSOT().map((e) => [e.examId, e.titleAr]));
  return all
    .filter((s) => s.studentCode.toUpperCase() === cleanCode)
    .sort((a, b) => a.submittedAtIso.localeCompare(b.submittedAtIso))
    .map((mine) => {
      const peers = all.filter((s) => s.examId === mine.examId);
      const avg = Math.round(
        peers.reduce((acc, s) => acc + s.percentageScore, 0) / Math.max(1, peers.length)
      );
      return {
        examTitleAr: titles.get(mine.examId) || mine.examTitleAr,
        studentPercentage: mine.percentageScore,
        classAveragePercentage: avg,
      };
    });
}
