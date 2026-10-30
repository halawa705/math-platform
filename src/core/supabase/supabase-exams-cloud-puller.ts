/**
 * @file supabase-exams-cloud-puller.ts
 * @description سحب الاختبارات المنشورة وتسليمات الطلاب من جداول Supabase (`electronic_exams` و`exam_submissions`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import type { PublishedOnlineExam } from "@/features/electronic-exams-hub/published-online-exams-store";
import type { OnlineExamSubmissionRecord } from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "./supabase-config-ssot";

export const MODULE_ID_SUPABASE_EXAMS_CLOUD_PULLER =
  "supabase_exams_cloud_puller" as const;

function buildReadHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_PUBLIC_KEY,
    Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function pullPublishedExamsFromSupabaseCloud(): Promise<
  readonly PublishedOnlineExam[] | null
> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/electronic_exams?select=*&order=created_at.desc`,
      { method: "GET", headers: buildReadHeaders() }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{
      exam_code: string;
      title_ar: string;
      grade_id: string;
      grade_name_ar?: string | null;
      duration_minutes: number;
      availability_days?: number | null;
      expires_at?: string | null;
      questions_json: PublishedOnlineExam["questions"];
      status?: string | null;
      is_published?: boolean | null;
      created_at: string;
    }>;
    if (!Array.isArray(rows)) return null;
    const nowMs = Date.now();
    return rows.map((r) => {
      const publishedAtIso = r.created_at || new Date().toISOString();
      const availabilityDays =
        typeof r.availability_days === "number" && r.availability_days > 0
          ? r.availability_days
          : 7;
      const expiresAtIso =
        r.expires_at ||
        new Date(Date.parse(publishedAtIso) + availabilityDays * 86_400_000).toISOString();
      const isExpiredByTimer = Date.parse(expiresAtIso) <= nowMs;
      const rawStatus =
        r.status === "archived" || r.is_published === false ? "archived" : "active";
      return {
        examId: r.exam_code,
        gradeId: r.grade_id,
        gradeNameArabic: r.grade_name_ar || "",
        titleAr: r.title_ar,
        durationMinutes: r.duration_minutes || 30,
        availabilityDays,
        publishedAtIso,
        expiresAtIso,
        questions: Array.isArray(r.questions_json) ? r.questions_json : [],
        status: isExpiredByTimer ? "archived" : rawStatus,
      };
    });
  } catch {
    return null;
  }
}

export async function syncExamSubmissionToSupabaseCloud(
  _submission: OnlineExamSubmissionRecord
): Promise<boolean> {
  void _submission;
  return false;
}

export async function pullExamSubmissionsFromSupabaseCloud(): Promise<
  readonly OnlineExamSubmissionRecord[] | null
> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/exam_submissions?select=*&order=submitted_at.desc`,
      { method: "GET", headers: buildReadHeaders() }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{
      id: string;
      submission_code?: string | null;
      exam_code?: string | null;
      exam_title_ar?: string | null;
      grade_id?: string | null;
      student_code: string;
      student_name: string;
      percentage: number;
      is_reviewed_by_teacher?: boolean | null;
      submitted_at: string;
      started_at?: string | null;
      answers_json?: OnlineExamSubmissionRecord["answersJson"] | null;
      result_json?: OnlineExamSubmissionRecord["resultJson"] | null;
    }>;
    if (!Array.isArray(rows)) return null;
    return rows
      .filter((r) => Boolean(r.exam_code && r.student_code))
      .map((r) => ({
        submissionId: r.submission_code || r.id || `${r.exam_code}__${r.student_code}`,
        examId: r.exam_code || "",
        examTitleAr: r.exam_title_ar || "",
        gradeId: r.grade_id || "",
        studentCode: r.student_code,
        studentNameAr: r.student_name,
        percentageScore: Math.round(Number(r.percentage) || 0),
        submittedAtIso: r.submitted_at || new Date().toISOString(),
        startedAtIso: r.started_at || undefined,
        isReviewedByTeacher: Boolean(r.is_reviewed_by_teacher),
        answersJson: r.answers_json || undefined,
        resultJson: r.result_json || undefined,
      }));
  } catch {
    return null;
  }
}
