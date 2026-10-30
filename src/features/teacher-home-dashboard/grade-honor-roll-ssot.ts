/**
 * @file grade-honor-roll-ssot.ts
 * @description المصدر الموحد لتسليمات الاختبارات وقاعة المتميزين، مبني بالكامل على بيانات حقيقية ومزامنة Supabase.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 200 سطر).
 */

import type {
  OnlineExamGradeResult,
  StudentAnswerInput,
} from "@/core/exam-grading/online-exam-grader";
import {
  pullExamSubmissionsFromSupabaseCloud,
  syncExamSubmissionToSupabaseCloud,
} from "@/core/supabase/supabase-cloud-sync-ssot";
import { notifyRealtimeTableUpdated } from "@/core/supabase/supabase-realtime-submissions-channel";
import type { PublishedOnlineExam } from "@/features/electronic-exams-hub/published-online-exams-store";

export const MIN_HONOR_ROLL_PERCENTAGE_SSOT = 70 as const;

export const EXAM_SUBMISSIONS_UPDATED_EVENT = "math-platform-submissions-updated" as const;

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
      isReviewedByTeacher: Boolean(existing?.isReviewedByTeacher || c.isReviewedByTeacher),
    });
  }

  const merged = Array.from(byKey.values()).sort((a, b) =>
    b.submittedAtIso.localeCompare(a.submittedAtIso)
  );
  persistSubmissions(merged);
  return merged;
}

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

export {
  type HonorStudentEntry,
  type GradeAnalyticsMetric,
  type StudentExamHistoryItem,
  getGradeAnalyticsAndHonorRollSSOT,
  loadStudentExamHistorySSOT,
} from "./grade-honor-roll-calculator";
