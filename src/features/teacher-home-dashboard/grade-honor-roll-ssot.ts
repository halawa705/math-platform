/**
 * @file grade-honor-roll-ssot.ts
 * @description المصدر الموحد لإحصائيات الصفوف وقاعة المتميزين، مبني بالكامل على بيانات حقيقية ومزامنة Supabase:
 * - عدد المسجلين = الطلاب الذين سجلوا فعلاً في المنصة عبر جدول `public.students`.
 * - المسلّمون والدرجات = تسليمات الطلاب الفعلية للاختبارات النشطة (التي لم ينتهِ مؤقتها) لكل صف عبر جدول `public.exam_submissions`.
 * - قاعة المتميزين = أعلى ٣ طلاب في الاختبارات النشطة بشرط ≥ ٧٠٪، وتختفي تلقائياً فور انتهاء مؤقت الاختبار وأرشفته.
 */

import type {
  OnlineExamGradeResult,
  StudentAnswerInput,
} from "@/core/exam-grading/online-exam-grader";
import { loadRegisteredStudentsSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  pullExamSubmissionsFromSupabaseCloud,
  syncExamSubmissionToSupabaseCloud,
} from "@/core/supabase/supabase-cloud-sync-ssot";
import { notifyRealtimeTableUpdated } from "@/core/supabase/supabase-realtime-submissions-channel";
import {
  loadActiveExamsForGradeSSOT,
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
  readonly startedAtIso?: string;
  readonly isReviewedByTeacher: boolean;
  readonly answersJson?: Readonly<Record<string, StudentAnswerInput | undefined>>;
  readonly resultJson?: OnlineExamGradeResult;
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

const SUBMISSIONS_STORAGE_KEY = "math_platform_exam_submissions_v3" as const;

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

/**
 * سحب تسليمات الطلاب من سحابة Supabase ودمجها مع السجل المحلي لتحديث لوحة المعلم وقاعة المتميزين حياً.
 */
export async function refreshExamSubmissionsFromSupabaseSSOT(): Promise<
  readonly OnlineExamSubmissionRecord[]
> {
  const local = loadAllExamSubmissionsSSOT();
  const cloud = await pullExamSubmissionsFromSupabaseCloud();
  if (!cloud) return local;

  const byKey = new Map<string, OnlineExamSubmissionRecord>();
  for (const s of local) {
    byKey.set(`${s.examId}__${s.studentCode.toUpperCase()}`, s);
  }
  for (const c of cloud) {
    const key = `${c.examId}__${c.studentCode.toUpperCase()}`;
    const existing = byKey.get(key);
    byKey.set(key, {
      ...c,
      isReviewedByTeacher: Boolean(
        existing?.isReviewedByTeacher || c.isReviewedByTeacher
      ),
    });
  }

  const merged = Array.from(byKey.values()).sort((a, b) =>
    b.submittedAtIso.localeCompare(a.submittedAtIso)
  );
  persistSubmissions(merged);
  return merged;
}

/** تسجيل تسليم طالب محلياً بعد تصحيحه في الخادم (`/api/exams/submit`) لتحديث قاعة المتميزين والتحليلات فوراً. */
export function recordStudentOnlineExamSubmissionSSOT(input: {
  readonly exam: PublishedOnlineExam;
  readonly studentCode: string;
  readonly studentNameAr: string;
  readonly percentageScore: number;
  readonly startedAtIso?: string;
  readonly answersJson?: Readonly<Record<string, StudentAnswerInput | undefined>>;
  readonly resultJson?: OnlineExamGradeResult;
}): OnlineExamSubmissionRecord {
  const record: OnlineExamSubmissionRecord = {
    submissionId: `${input.exam.examId}__${input.studentCode}`,
    examId: input.exam.examId,
    examTitleAr: input.exam.titleAr,
    gradeId: input.exam.gradeId,
    studentCode: input.studentCode,
    studentNameAr: input.studentNameAr,
    percentageScore: Math.round(input.percentageScore),
    submittedAtIso: new Date().toISOString(),
    startedAtIso: input.startedAtIso,
    isReviewedByTeacher: false,
    answersJson: input.answersJson,
    resultJson: input.resultJson,
  };
  const others = loadAllExamSubmissionsSSOT().filter(
    (s) =>
      !(
        s.examId === input.exam.examId &&
        s.studentCode.toUpperCase() === input.studentCode.toUpperCase()
      )
  );
  persistSubmissions([record, ...others]);
  notifyRealtimeTableUpdated("exam_submissions");
  void syncExamSubmissionToSupabaseCloud(record);
  return record;
}

export function findStudentSubmissionForExamSSOT(
  examId: string,
  studentCode: string
): OnlineExamSubmissionRecord | null {
  const cleanCode = studentCode.trim().toUpperCase();
  return (
    loadAllExamSubmissionsSSOT().find(
      (s) => s.examId === examId && s.studentCode.toUpperCase() === cleanCode
    ) || null
  );
}

export function markExamSubmissionsReviewedSSOT(examId: string): void {
  const updated = loadAllExamSubmissionsSSOT().map((s) =>
    s.examId === examId ? { ...s, isReviewedByTeacher: true } : s
  );
  persistSubmissions(updated);
  for (const s of updated) {
    if (s.examId === examId) {
      void syncExamSubmissionToSupabaseCloud(s);
    }
  }
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

  // تجميع أعلى درجة لكل طالب في الاختبارات النشطة للصف حتى لا يتكرر نفس الطالب في قاعة المتميزين
  const bestByStudent = new Map<string, OnlineExamSubmissionRecord>();
  for (const s of submissions) {
    if (s.percentageScore < MIN_HONOR_ROLL_PERCENTAGE_SSOT) continue;
    const key = s.studentCode.toUpperCase();
    const prev = bestByStudent.get(key);
    if (!prev || s.percentageScore > prev.percentageScore) {
      bestByStudent.set(key, s);
    }
  }

  const topThreeHonorRoll: HonorStudentEntry[] = Array.from(
    bestByStudent.values()
  )
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

  const activeTitles = activeExams.map((e) => e.titleAr).join(" • ");

  return {
    gradeId,
    gradeNameAr,
    registeredCount,
    completedExamsCount,
    unreviewedSubmissionsCount: submissions.filter((s) => !s.isReviewedByTeacher)
      .length,
    averageScorePercentage,
    hasActiveExam: activeExams.length > 0,
    activeExamTitleAr: activeTitles,
    scoreBuckets: buckets,
    topThreeHonorRoll,
  };
}

/** سجل اختبارات الطالب الحقيقي مع متوسط زملائه في كل اختبار. */
export function loadStudentExamHistorySSOT(
  studentCode: string
): readonly StudentExamHistoryItem[] {
  const cleanCode = studentCode.trim().toUpperCase();
  const all = loadAllExamSubmissionsSSOT();
  const titles = new Map(
    loadAllPublishedExamsSSOT().map((e) => [e.examId, e.titleAr])
  );
  return all
    .filter((s) => s.studentCode.toUpperCase() === cleanCode)
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
