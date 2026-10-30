/**
 * @file supabase-cloud-sync-ssot.ts
 * @description محرك المزامنة السحابية التلقائية عبر الصفوف المستقلة (Row-Level Cloud Persistence)
 * بين المتصفح (`localStorage`) وقاعدة بيانات Supabase (`ribcyosvoiwtrpynyzjp`) مع سياسات RLS:
 * ١. `platform_ssot_state`: إعدادات هوية المعلم وصفوفه وروابط NotebookLM.
 * ٢. `curriculum_units`: شجرة الوحدات والدروس.
 * ٣. `students`: تسجيل الطلاب الذاتي من هواتفهم ودخولهم من أي جهاز دون تداخل.
 * ٤. `electronic_exams`: الاختبارات الإلكترونية المنشورة ومؤقت أرشفتها التلقائية (`expires_at`).
 * ٥. `exam_submissions`: تسليمات الطلاب الفورية وتحديث قاعة المتميزين حياً عبر جميع الأجهزة.
 */

import type {
  OwnerTeacherIdentity,
  RegisteredStudentRecordSSOT,
} from "../ssot/teacher-identity-ssot";
import type { CurriculumUnitNode } from "../ssot/curriculum-hierarchy-ssot";
import type { PublishedOnlineExam } from "@/features/electronic-exams-hub/published-online-exams-store";
import type { OnlineExamSubmissionRecord } from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ribcyosvoiwtrpynyzjp.supabase.co";

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_-_NDzAmrswsChgitYYrIKw_iEmWYIqD";

function buildSupabaseHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates",
  };
}

/**
 * ١. مزامنة كائن هوية المعلم والإعدادات والصفوف وروابط NotebookLM إلى سحابة Supabase.
 */
export async function syncTeacherIdentityToSupabaseCloud(
  identity: OwnerTeacherIdentity
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/platform_ssot_state?on_conflict=id`,
      {
        method: "POST",
        headers: buildSupabaseHeaders(),
        body: JSON.stringify({
          id: "owner_ssot",
          identity_json: identity,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullTeacherIdentityFromSupabaseCloud(): Promise<Partial<OwnerTeacherIdentity> | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/platform_ssot_state?id=eq.owner_ssot&select=identity_json`,
      {
        method: "GET",
        headers: buildSupabaseHeaders(),
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{
      identity_json?: Partial<OwnerTeacherIdentity>;
    }>;
    const candidate = rows[0]?.identity_json;
    if (!candidate || !candidate.platformBrandName) return null;
    return candidate;
  } catch {
    return null;
  }
}

/**
 * ٢. مزامنة شجرة الوحدات والدروس المستخرجة من مستكشف المنهج إلى جدول `curriculum_units` في Supabase.
 */
export async function syncCurriculumUnitsToSupabaseCloud(
  units: readonly CurriculumUnitNode[]
): Promise<boolean> {
  if (typeof window === "undefined" || units.length === 0) return false;
  try {
    const payload = units.map((u) => ({
      id: u.id,
      grade_id: u.gradeId,
      term_number: u.termNumber,
      branch_id: u.branchId,
      branch_name_ar: u.branchNameArabic,
      title_ar: u.titleArabic,
      order_index: u.orderIndex,
      lessons_json: u.lessons,
      updated_at: new Date().toISOString(),
    }));
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/curriculum_units?on_conflict=id`,
      {
        method: "POST",
        headers: buildSupabaseHeaders(),
        body: JSON.stringify(payload),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullCurriculumUnitsFromSupabaseCloud(): Promise<
  readonly CurriculumUnitNode[] | null
> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/curriculum_units?select=*&order=order_index.asc`,
      {
        method: "GET",
        headers: buildSupabaseHeaders(),
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{
      id: string;
      grade_id: string;
      term_number: 1 | 2;
      branch_id: CurriculumUnitNode["branchId"];
      branch_name_ar: string;
      title_ar: string;
      order_index: number;
      lessons_json: CurriculumUnitNode["lessons"];
    }>;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map((r) => ({
      id: r.id,
      gradeId: r.grade_id,
      termNumber: r.term_number,
      branchId: r.branch_id,
      branchNameArabic: r.branch_name_ar,
      titleArabic: r.title_ar,
      orderIndex: r.order_index,
      lessons: Array.isArray(r.lessons_json) ? r.lessons_json : [],
    }));
  } catch {
    return null;
  }
}

/**
 * ٣. مزامنة بيانات الطلاب المسجلين عبر جدول `public.students` (صف مستقل لكل طالب لمنع التداخل بين الهواتف).
 */
export async function syncStudentRecordToSupabaseCloud(
  student: RegisteredStudentRecordSSOT
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/students?on_conflict=student_code`,
      {
        method: "POST",
        headers: buildSupabaseHeaders(),
        body: JSON.stringify({
          student_code: student.studentCode,
          alt_numeric_code: student.altNumericCode,
          full_name: student.fullNameAr,
          grade_id: student.gradeId,
          grade_name_ar: student.gradeNameAr,
          phone: student.studentPhone,
          pin_code: student.passwordPin,
          is_active: true,
          created_at: student.createdAtIso,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullStudentsRegistryFromSupabaseCloud(): Promise<
  readonly RegisteredStudentRecordSSOT[] | null
> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/students?select=id,student_code,alt_numeric_code,full_name,grade_id,grade_name_ar,created_at&order=created_at.asc`,
      {
        method: "GET",
        headers: buildSupabaseHeaders(),
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{
      id: string;
      student_code: string;
      alt_numeric_code?: string | null;
      full_name: string;
      grade_id: string;
      grade_name_ar?: string | null;
      created_at: string;
    }>;
    if (!Array.isArray(rows)) return null;
    return rows
      .filter((r) => r.full_name && !r.full_name.includes("تجريبي"))
      .map((r) => ({
        id: r.id || `student-${r.student_code}`,
        studentCode: r.student_code,
        altNumericCode:
          r.alt_numeric_code || r.student_code.replace(/^MATH-/i, ""),
        fullNameAr: r.full_name,
        studentPhone: "",
        passwordPin: "",
        gradeId: r.grade_id,
        gradeNameAr: r.grade_name_ar || "",
        createdAtIso: r.created_at || new Date().toISOString(),
      }));
  } catch {
    return null;
  }
}

/**
 * ٤. النشر والتسليم يتم عبر نقاط الخادم الآمنة `/api/exams/*` فقط.
 */
export async function syncPublishedExamToSupabaseCloud(
  _exam: PublishedOnlineExam
): Promise<boolean> {
  // النشر والتسليم عبر /api/exams فقط
  void _exam;
  return false;
}

export async function pullPublishedExamsFromSupabaseCloud(): Promise<
  readonly PublishedOnlineExam[] | null
> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/electronic_exams?select=*&order=created_at.desc`,
      {
        method: "GET",
        headers: buildSupabaseHeaders(),
      }
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
        new Date(
          Date.parse(publishedAtIso) + availabilityDays * 86_400_000
        ).toISOString();
      const isExpiredByTimer = Date.parse(expiresAtIso) <= nowMs;
      const rawStatus =
        r.status === "archived" || r.is_published === false
          ? "archived"
          : "active";
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

/**
 * ٥. النشر والتسليم يتم عبر نقاط الخادم الآمنة `/api/exams/submit` فقط.
 */
export async function syncExamSubmissionToSupabaseCloud(
  _submission: OnlineExamSubmissionRecord
): Promise<boolean> {
  // النشر والتسليم عبر /api/exams فقط
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
      {
        method: "GET",
        headers: buildSupabaseHeaders(),
      }
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
        submissionId:
          r.submission_code || r.id || `${r.exam_code}__${r.student_code}`,
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
