/**
 * @file teacher-students-session-registry.ts
 * @description سجل الطلاب المسجلين وحفظ جلسة المستخدم (تذكرني) ومزامنتها مع Supabase.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import { pullStudentsRegistryFromSupabaseCloud } from "../supabase/supabase-cloud-sync-ssot";

export const MODULE_ID_TEACHER_STUDENTS_SESSION_REGISTRY =
  "teacher_students_session_registry" as const;

export const STUDENTS_REGISTRY_UPDATED_EVENT =
  "math-platform-students-updated" as const;

export interface RegisteredStudentRecordSSOT {
  readonly id: string;
  readonly studentCode: string;
  readonly altNumericCode: string;
  readonly fullNameAr: string;
  readonly studentPhone: string;
  readonly passwordPin: string;
  readonly gradeId: string;
  readonly gradeNameAr: string;
  readonly isSibling?: boolean;
  readonly createdAtIso: string;
}

export interface RememberedUserSessionSSOT {
  readonly role: "teacher" | "student";
  readonly studentCode?: string;
  readonly studentNameAr?: string;
  readonly gradeId?: string;
  readonly isSibling?: boolean;
  readonly savedAtIso: string;
}

const REGISTERED_STUDENTS_STORAGE_KEY =
  "math_platform_students_registry_ssot_v3" as const;
const REMEMBERED_SESSION_STORAGE_KEY =
  "math_platform_remembered_session_v2" as const;

export function loadRegisteredStudentsSSOT(): readonly RegisteredStudentRecordSSOT[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REGISTERED_STUDENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RegisteredStudentRecordSSOT[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s) => s && s.fullNameAr && !s.fullNameAr.includes("تجريبي")
    );
  } catch {
    return [];
  }
}

function persistStudentsList(
  students: readonly RegisteredStudentRecordSSOT[]
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      REGISTERED_STUDENTS_STORAGE_KEY,
      JSON.stringify(students)
    );
    window.dispatchEvent(new CustomEvent(STUDENTS_REGISTRY_UPDATED_EVENT));
  } catch {
    // ignore storage write error
  }
}

export async function refreshRegisteredStudentsFromSupabaseSSOT(): Promise<
  readonly RegisteredStudentRecordSSOT[]
> {
  const local = loadRegisteredStudentsSSOT();
  const cloud = await pullStudentsRegistryFromSupabaseCloud();
  if (!cloud) return local;

  const byCode = new Map<string, RegisteredStudentRecordSSOT>();
  for (const s of local) byCode.set(s.studentCode.toUpperCase(), s);
  for (const c of cloud) byCode.set(c.studentCode.toUpperCase(), c);
  const merged = Array.from(byCode.values());
  persistStudentsList(merged);
  return merged;
}

export function saveRememberedSessionSSOT(
  session: RememberedUserSessionSSOT,
  persistent = true
): void {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify(session);
    window.localStorage.removeItem(REMEMBERED_SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(REMEMBERED_SESSION_STORAGE_KEY);
    (persistent ? window.localStorage : window.sessionStorage).setItem(
      REMEMBERED_SESSION_STORAGE_KEY,
      payload
    );
  } catch {
    // ignore
  }
}

export function loadRememberedSessionSSOT(): RememberedUserSessionSSOT | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.sessionStorage.getItem(REMEMBERED_SESSION_STORAGE_KEY) ||
      window.localStorage.getItem(REMEMBERED_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RememberedUserSessionSSOT;
  } catch {
    return null;
  }
}

export function clearRememberedSessionSSOT(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REMEMBERED_SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(REMEMBERED_SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}
