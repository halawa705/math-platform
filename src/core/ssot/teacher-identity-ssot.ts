/**
 * @file teacher-identity-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) القابل للتعديل الحي من صفحة الإعدادات (`/settings`):
 * ١. هوية المعلم المالك، اسم المنصة/السنتر، اسم الشهرة، الهاتف، التذييل (Footer)، والعلامة المائية.
 * ٢. اسم/رمز الدخول السري للمعلم المالك (قابل للتغيير في الإعدادات) + حفظ الجلسة (تذكرني).
 * ٣. الصفوف الدراسية المفعّلة لهذا العام الدراسي (من الثالث الابتدائي حتى الثالث الثانوي) كمصدر وحيد للحقيقة في الموقع كله.
 * ٤. روابط دفاتر NotebookLM لكل صف دراسي لفتح الدفتر ونسخ البرومبت تلقائياً بضغطة واحدة.
 * ٥. سجل تسجيل الطلاب الذاتي (الاسم، الهاتف، الرقم السري، الكود السريع) مع مزامنة Supabase.
 */

import {
  EGYPTIAN_MATH_GRADES_SSOT,
  type CurriculumGradeNode,
} from "./curriculum-hierarchy-ssot";
import { syncTeacherIdentityToSupabaseCloud } from "../supabase/supabase-cloud-sync-ssot";

export interface OwnerTeacherIdentity {
  readonly teacherFullName: string;
  readonly teacherNickname: string;
  readonly teacherTitle: string;
  readonly teacherPhone: string;
  readonly platformBrandName: string;
  readonly footerText: string;
  readonly watermarkText: string;
  readonly governorateName: string;
  readonly customSecretLoginCode: string;
  readonly stealthTriggerCodes: readonly string[];
  readonly stealthEmblemClicksRequired: number;
  readonly enabledGradeIds: readonly string[];
  readonly notebookLmUrlsByGrade: Readonly<Record<string, string>>;
}

export interface RegisteredStudentRecordSSOT {
  readonly id: string;
  readonly studentCode: string;
  readonly altNumericCode: string;
  readonly fullNameAr: string;
  readonly studentPhone: string;
  readonly passwordPin: string;
  readonly gradeId: string;
  readonly gradeNameAr: string;
  readonly createdAtIso: string;
}

export interface RememberedUserSessionSSOT {
  readonly role: "teacher" | "student";
  readonly studentCode?: string;
  readonly studentNameAr?: string;
  readonly gradeId?: string;
  readonly savedAtIso: string;
}

const TEACHER_SETTINGS_STORAGE_KEY = "math_platform_teacher_settings_ssot_v3" as const;
const REGISTERED_STUDENTS_STORAGE_KEY = "math_platform_students_registry_ssot_v2" as const;
const REMEMBERED_SESSION_STORAGE_KEY = "math_platform_remembered_session_v2" as const;

export const DEFAULT_OWNER_TEACHER_IDENTITY_SSOT: OwnerTeacherIdentity = {
  teacherFullName: "أ/ إسلام حلاوة",
  teacherNickname: "عميد الرياضيات",
  teacherTitle: "خبير تدريس الرياضيات للمرحلتين الابتدائية والإعدادية",
  teacherPhone: "01000000000",
  platformBrandName: "منصة الخوارزمي للرياضيات",
  footerText: "منصة الخوارزمي للرياضيات — أ/ إسلام حلاوة (عميد الرياضيات) • جميع الحقوق محفوظة",
  watermarkText: "منصة الخوارزمي — أ/ إسلام حلاوة",
  governorateName: "جمهورية مصر العربية",
  customSecretLoginCode: "19842026",
  stealthTriggerCodes: ["19842026", "Halawa#77.", "halawa#77", "#MATH-MASTER#"],
  stealthEmblemClicksRequired: 5,
  enabledGradeIds: [
    "prim-3",
    "prim-4",
    "prim-5",
    "prim-6",
    "prep-1",
    "prep-2",
    "prep-3",
  ],
  notebookLmUrlsByGrade: {
    "prim-3": "https://notebooklm.google.com/",
    "prim-4": "https://notebooklm.google.com/",
    "prim-5": "https://notebooklm.google.com/",
    "prim-6": "https://notebooklm.google.com/",
    "prep-1": "https://notebooklm.google.com/",
    "prep-2": "https://notebooklm.google.com/",
    "prep-3": "https://notebooklm.google.com/",
  },
};

export const DEFAULT_DEMO_STUDENT_ACCOUNT_SSOT: RegisteredStudentRecordSSOT = {
  id: "demo-student-1001",
  studentCode: "MATH-1001",
  altNumericCode: "1001",
  fullNameAr: "أحمد محمد علي (طالب تجريبي)",
  studentPhone: "01012345678",
  passwordPin: "1234",
  gradeId: "prep-3",
  gradeNameAr: "الصف الثالث الإعدادي",
  createdAtIso: "2026-10-23T12:00:00.000Z",
};

export function loadTeacherIdentitySSOT(): OwnerTeacherIdentity {
  if (typeof window === "undefined") return DEFAULT_OWNER_TEACHER_IDENTITY_SSOT;
  try {
    const raw = window.localStorage.getItem(TEACHER_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_OWNER_TEACHER_IDENTITY_SSOT;
    const parsed = JSON.parse(raw) as Partial<OwnerTeacherIdentity>;
    return {
      ...DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
      ...parsed,
      enabledGradeIds:
        Array.isArray(parsed.enabledGradeIds) && parsed.enabledGradeIds.length > 0
          ? parsed.enabledGradeIds
          : DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.enabledGradeIds,
      notebookLmUrlsByGrade: {
        ...DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.notebookLmUrlsByGrade,
        ...(parsed.notebookLmUrlsByGrade || {}),
      },
    };
  } catch {
    return DEFAULT_OWNER_TEACHER_IDENTITY_SSOT;
  }
}

export function saveTeacherIdentitySSOT(updated: OwnerTeacherIdentity): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TEACHER_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    void syncTeacherIdentityToSupabaseCloud(updated);
  } catch {
    // ignore
  }
}

/**
 * يرجع فقط الصفوف الدراسية التي فعّلها المعلم في الإعدادات لتكون المصدر الوحيد للحقيقة في كل قوائم الموقع.
 */
export function loadEnabledGradesSSOT(): readonly CurriculumGradeNode[] {
  const settings = loadTeacherIdentitySSOT();
  const enabledSet = new Set(settings.enabledGradeIds);
  const filtered = EGYPTIAN_MATH_GRADES_SSOT.filter((g) => enabledSet.has(g.id));
  return filtered.length > 0 ? filtered : EGYPTIAN_MATH_GRADES_SSOT;
}

export function isStealthTeacherTriggerCodeSSOT(rawInput: string): boolean {
  if (!rawInput) return false;
  const trimmed = rawInput.trim().toLowerCase();
  const settings = loadTeacherIdentitySSOT();
  if (settings.customSecretLoginCode && trimmed === settings.customSecretLoginCode.trim().toLowerCase()) {
    return true;
  }
  return settings.stealthTriggerCodes.some((c) => c.toLowerCase() === trimmed);
}

/**
 * ينسخ البرومبت تلقائياً إلى الحافظة ويفتح صفحة NotebookLM المربوطة بهذا الصف الدراسي في لسان جديد.
 */
export async function copyPromptAndOpenGradeNotebookLmSSOT(
  arg1: string,
  arg2: string
): Promise<{ copied: boolean; openedUrl: string }> {
  const isArg1Grade = /^(?:prim|prep|sec)-\d$/.test(arg1.trim());
  const gradeId = isArg1Grade ? arg1.trim() : arg2.trim();
  const promptText = isArg1Grade ? arg2 : arg1;
  const settings = loadTeacherIdentitySSOT();
  const targetUrl =
    settings.notebookLmUrlsByGrade[gradeId]?.trim() ||
    "https://notebooklm.google.com/";

  let copied = false;
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(promptText);
      copied = true;
    } catch {
      copied = false;
    }
  }
  if (typeof window !== "undefined") {
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }
  return { copied, openedUrl: targetUrl };
}

export function loadRegisteredStudentsSSOT(): readonly RegisteredStudentRecordSSOT[] {
  if (typeof window === "undefined") return [DEFAULT_DEMO_STUDENT_ACCOUNT_SSOT];
  try {
    const raw = window.localStorage.getItem(REGISTERED_STUDENTS_STORAGE_KEY);
    if (!raw) return [DEFAULT_DEMO_STUDENT_ACCOUNT_SSOT];
    const parsed = JSON.parse(raw) as RegisteredStudentRecordSSOT[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [DEFAULT_DEMO_STUDENT_ACCOUNT_SSOT];
  } catch {
    return [DEFAULT_DEMO_STUDENT_ACCOUNT_SSOT];
  }
}

export function registerNewStudentSSOT(input: {
  readonly fullNameAr: string;
  readonly studentPhone: string;
  readonly passwordPin: string;
  readonly gradeId: string;
}): RegisteredStudentRecordSSOT {
  const current = loadRegisteredStudentsSSOT();
  const gradeObj = EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === input.gradeId);
  const nextNumber = 1001 + current.length;
  const newStudent: RegisteredStudentRecordSSOT = {
    id: `stu_${Date.now()}`,
    studentCode: `MATH-${nextNumber}`,
    altNumericCode: String(nextNumber),
    fullNameAr: input.fullNameAr.trim(),
    studentPhone: input.studentPhone.trim(),
    passwordPin: input.passwordPin.trim(),
    gradeId: input.gradeId,
    gradeNameAr: gradeObj?.nameArabic || "الصف الثالث الإعدادي",
    createdAtIso: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      REGISTERED_STUDENTS_STORAGE_KEY,
      JSON.stringify([newStudent, ...current])
    );
  }
  return newStudent;
}

export function saveRememberedSessionSSOT(session: RememberedUserSessionSSOT): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBERED_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function loadRememberedSessionSSOT(): RememberedUserSessionSSOT | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REMEMBERED_SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RememberedUserSessionSSOT) : null;
  } catch {
    return null;
  }
}

export function clearRememberedSessionSSOT(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REMEMBERED_SESSION_STORAGE_KEY);
}
