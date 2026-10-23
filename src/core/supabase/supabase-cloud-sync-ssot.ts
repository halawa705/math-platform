/**
 * @file supabase-cloud-sync-ssot.ts
 * @description محرك المزامنة السحابية التلقائية بين المتصفح (`localStorage`) وقاعدة بيانات Supabase (`ribcyosvoiwtrpynyzjp`)
 * لضمان انتقال إعدادات هوية المعلم (`TeacherIdentitySSOT`) وشجرة الوحدات والدروس (`curriculum_units`)
 * تلقائياً بين هاتف المعلم وجهاز الكمبيوتر الخاص به.
 */

import type { OwnerTeacherIdentity } from "../ssot/teacher-identity-ssot";
import type { CurriculumUnitNode } from "../ssot/curriculum-hierarchy-ssot";

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
 * مزامنة كائن هوية المعلم والإعدادات والصفوف وروابط NotebookLM إلى سحابة Supabase.
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

/**
 * جلب أحدث نسخة من إعدادات المعلم من سحابة Supabase عند فتح المنصة من جهاز جديد أو هاتف.
 */
export async function pullTeacherIdentityFromSupabaseCloud(): Promise<OwnerTeacherIdentity | null> {
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
    const rows = (await res.json()) as Array<{ identity_json?: OwnerTeacherIdentity }>;
    return rows[0]?.identity_json || null;
  } catch {
    return null;
  }
}

/**
 * مزامنة شجرة الوحدات والدروس المستخرجة من مستكشف المنهج إلى جدول `curriculum_units` في Supabase.
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

/**
 * سحب شجرة الوحدات والدروس المحفوظة في Supabase لمزامنتها مع المتصفح المحلي.
 */
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
