/**
 * @file grade-honor-roll-ssot.ts
 * @description المصدر الموحد لإحصائيات الصفوف وقاعة المتميزين، مبني بالكامل على بيانات حقيقية:
 * - عدد المسجلين = الطلاب الذين سجلوا فعلاً في المنصة (بدون الحساب التجريبي).
 * - المسلّمون والدرجات = تسليمات الطلاب الفعلية للاختبار النشط لكل صف.
 * - قاعة المتميزين = أعلى ٣ درجات في الاختبار النشط بشرط ≥ ٧٠٪، وتختفي بمجرد أرشفة الاختبار.
 */

import {
  DEFAULT_DEMO_STUDENT_ACCOUNT_SSOT,
  loadRegisteredStudentsSSOT,
} from "@/core/ssot/teacher-identity-ssot";
import {
  loadActiveExamForGradeSSOT,
  loadAllPublishedExamsSSOT,
  type PublishedOnlineExam,
} from "@/features/electronic-exams-hub/published-online-exams-store";

export const MIN_HONOR_ROLL_PERCENTAGE_SSOT = 70 as const;

export const EXAM_SUBMISSIONS_UPDATED_EVENT = "math-platform-submissions-updated" as const;

export interface HonorStudentEntry {
  readonly rank: 1 | 2 | 3;
  readonly studentNameAr: string;
  readonly studentCode: string;
  readonly gradeId: string;
  readonly averagePercentage: number;
}

export interface OnlineExamSubmissionRecord {
  readonly submissionId: string;
  readonly examId: string;
  readonly examTitleAr: string;
  readonly gradeId: string;
  readonly studentCode: string;
  readonly studentNameAr: string;
  readonly percentageScore: number;
  readonly submittedAtIso: string;
  readonly isReviewedByTeacher: boolean;
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

const SUBMISSIONS_STORAGE_KEY = "math_platform_exam_submissions_v2" as const;

export function loadAllExamSubmissionsSSOT(): readonly OnlineExamSubmissionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OnlineExamSubmissionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSubmissions(list: readonly OnlineExamSubmissionRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EXAM_SUBMISSIONS_UPDATED_EVENT));
  } catch {
    // ignore storage write error
  }
}

/** تسجيل تسليم طالب (تسليم واحد لكل طالب في كل اختبار) وتحديث قاعة المتميزين فوراً. */
export function recordStudentOnlineExamSubmissionSSOT(input: {
  readonly exam: PublishedOnlineExam;
  readonly studentCode: string;
  readonly studentNameAr: string;
  readonly percentageScore: number;
}): OnlineExamSubmissionRecord {
  const record: OnlineExamSubmissionRecord = {
    submissionId: `sub_${Date.now()}`,
    examId: input.exam.examId,
    examTitleAr: input.exam.titleAr,
    gradeId: input.exam.gradeId,
    studentCode: input.studentCode,
    studentNameAr: input.studentNameAr,
    percentageScore: Math.round(input.percentageScore),
    submittedAtIso: new Date().toISOString(),
    isReviewedByTeacher: false,
  };
  const others = loadAllExamSubmissionsSSOT().filter(
    (s) => !(s.examId === input.exam.examId && s.studentCode === input.studentCode)
  );
  persistSubmissions([record, ...others]);
  return record;
}

export function findStudentSubmissionForExamSSOT(
  examId: string,
  studentCode: string
): OnlineExamSubmissionRecord | null {
  return (
    loadAllExamSubmissionsSSOT().find(
      (s) => s.examId === examId && s.studentCode === studentCode
    ) || null
  );
}

export function markExamSubmissionsReviewedSSOT(examId: string): void {
  persistSubmissions(
    loadAllExamSubmissionsSSOT().map((s) =>
      s.examId === examId ? { ...s, isReviewedByTeacher: true } : s
    )
  );
}

export function getGradeAnalyticsAndHonorRollSSOT(
  gradeId: string,
  gradeNameAr: string
): GradeAnalyticsMetric {
  const registeredCount = loadRegisteredStudentsSSOT().filter(
    (s) => s.gradeId === gradeId && s.id !== DEFAULT_DEMO_STUDENT_ACCOUNT_SSOT.id
  ).length;

  const activeExam = loadActiveExamForGradeSSOT(gradeId);
  const submissions = activeExam
    ? loadAllExamSubmissionsSSOT().filter((s) => s.examId === activeExam.examId)
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

  const topThreeHonorRoll: HonorStudentEntry[] = submissions
    .filter((s) => s.percentageScore >= MIN_HONOR_ROLL_PERCENTAGE_SSOT)
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
    unreviewedSubmissionsCount: submissions.filter((s) => !s.isReviewedByTeacher)
      .length,
    averageScorePercentage,
    hasActiveExam: Boolean(activeExam),
    activeExamTitleAr: activeExam?.titleAr || "",
    scoreBuckets: buckets,
    topThreeHonorRoll,
  };
}

/** سجل اختبارات الطالب الحقيقي مع متوسط زملائه في كل اختبار. */
export function loadStudentExamHistorySSOT(
  studentCode: string
): readonly StudentExamHistoryItem[] {
  const all = loadAllExamSubmissionsSSOT();
  const titles = new Map(
    loadAllPublishedExamsSSOT().map((e) => [e.examId, e.titleAr])
  );
  return all
    .filter((s) => s.studentCode === studentCode)
    .sort((a, b) => a.submittedAtIso.localeCompare(b.submittedAtIso))
    .map((mine) => {
      const peers = all.filter((s) => s.examId === mine.examId);
      const avg = Math.round(
        peers.reduce((acc, s) => acc + s.percentageScore, 0) /
          Math.max(1, peers.length)
      );
      return {
        examTitleAr: titles.get(mine.examId) || mine.examTitleAr,
        studentPercentage: mine.percentageScore,
        classAveragePercentage: avg,
      };
    });
}
