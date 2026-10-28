/**
 * @file teacher-identity-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) القابل للتعديل الحي من صفحة الإعدادات (`/settings`):
 * ١. هوية المعلم المالك، اسم المنصة/السنتر (منصة الفارس)، اللوجو (صورة مرفوعة أو رابط أو رمز)، اسم الشهرة، الهاتف، التذييل (Footer)، والعلامة المائية.
 * ٢. اسم/رمز الدخول السري للمعلم المالك (قابل للتغيير في الإعدادات) + حفظ الجلسة (تذكرني).
 * ٣. الصفوف الدراسية المفعّلة لهذا العام الدراسي (من الثالث الابتدائي حتى الثالث الثانوي) كمصدر وحيد للحقيقة في الموقع كله.
 * ٤. روابط دفاتر NotebookLM لكل صف دراسي لفتح الدفتر ونسخ البرومبت تلقائياً بضغطة واحدة.
 * ٥. مزامنة الطلاب المسجلين فعلياً مع جدول `public.students` في سحابة Supabase (بدون أي حسابات تجريبية أو وهمية).
 */

import {
  EGYPTIAN_MATH_GRADES_SSOT,
  type CurriculumGradeNode,
} from "./curriculum-hierarchy-ssot";
import {
  pullStudentsRegistryFromSupabaseCloud,
  pullTeacherIdentityFromSupabaseCloud,
  syncStudentRecordToSupabaseCloud,
  syncTeacherIdentityToSupabaseCloud,
} from "../supabase/supabase-cloud-sync-ssot";

export const IDENTITY_UPDATED_EVENT_NAME = "math-platform-identity-updated" as const;
export const STUDENTS_REGISTRY_UPDATED_EVENT = "math-platform-students-updated" as const;

export interface OwnerTeacherIdentity {
  readonly teacherFullName: string;
  readonly teacherNickname: string;
  readonly teacherTitle: string;
  readonly teacherPhone: string;
  readonly platformBrandName: string;
  readonly platformLogoUrl: string;
  readonly platformLogoSymbol: string;
  readonly footerText: string;
  readonly watermarkText: string;
  readonly governorateName: string;
  readonly customSecretLoginCode: string;
  readonly stealthTriggerCodes: readonly string[];
  readonly stealthEmblemClicksRequired: number;
  readonly enabledGradeIds: readonly string[];
  readonly notebookLmUrlsByGrade: Readonly<Record<string, string>>;
  readonly updatedAtMs?: number;
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

const TEACHER_SETTINGS_STORAGE_KEY = "math_platform_teacher_settings_ssot_v4" as const;
const REGISTERED_STUDENTS_STORAGE_KEY = "math_platform_students_registry_ssot_v3" as const;
const REMEMBERED_SESSION_STORAGE_KEY = "math_platform_remembered_session_v2" as const;

export const DEFAULT_OWNER_TEACHER_IDENTITY_SSOT: OwnerTeacherIdentity = {
  teacherFullName: "أ/ إسلام حلاوة",
  teacherNickname: "",
  teacherTitle: "معلم الرياضيات",
  teacherPhone: "",
  platformBrandName: "منصة الفارس",
  platformLogoUrl: "",
  platformLogoSymbol: "🛡️",
  footerText: "منصة الفارس — أ/ إسلام حلاوة • جميع الحقوق محفوظة",
  watermarkText: "منصة الفارس — أ/ إسلام حلاوة",
  governorateName: "جمهورية مصر العربية",
  customSecretLoginCode: "",
  stealthTriggerCodes: [],
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

function sanitizeTeacherIdentity(
  parsed: Partial<OwnerTeacherIdentity>
): OwnerTeacherIdentity {
  const resolvedBrand =
    parsed.platformBrandName &&
    parsed.platformBrandName.trim().length > 0 &&
    !parsed.platformBrandName.includes("الخوارزمي")
      ? parsed.platformBrandName
      : DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.platformBrandName;
  const resolvedFooter =
    parsed.footerText &&
    parsed.footerText.trim().length > 0 &&
    !parsed.footerText.includes("الخوارزمي")
      ? parsed.footerText
      : DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.footerText;
  const resolvedWatermark =
    parsed.watermarkText &&
    parsed.watermarkText.trim().length > 0 &&
    !parsed.watermarkText.includes("الخوارزمي")
      ? parsed.watermarkText
      : DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.watermarkText;

  return {
    ...DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
    ...parsed,
    teacherFullName:
      parsed.teacherFullName && parsed.teacherFullName.trim().length > 0
        ? parsed.teacherFullName
        : DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.teacherFullName,
    teacherNickname: parsed.teacherNickname ?? "",
    teacherPhone: parsed.teacherPhone ?? "",
    teacherTitle:
      parsed.teacherTitle && parsed.teacherTitle.trim().length > 0
        ? parsed.teacherTitle
        : DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.teacherTitle,
    platformBrandName: resolvedBrand,
    footerText: resolvedFooter,
    watermarkText: resolvedWatermark,
    platformLogoUrl: parsed.platformLogoUrl ?? "",
    platformLogoSymbol:
      parsed.platformLogoSymbol ||
      DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.platformLogoSymbol,
    enabledGradeIds:
      Array.isArray(parsed.enabledGradeIds) && parsed.enabledGradeIds.length > 0
        ? parsed.enabledGradeIds
        : DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.enabledGradeIds,
    notebookLmUrlsByGrade: {
      ...DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.notebookLmUrlsByGrade,
      ...(parsed.notebookLmUrlsByGrade || {}),
    },
    updatedAtMs:
      typeof parsed.updatedAtMs === "number" ? parsed.updatedAtMs : undefined,
  };
}

export function loadTeacherIdentitySSOT(): OwnerTeacherIdentity {
  if (typeof window === "undefined") return DEFAULT_OWNER_TEACHER_IDENTITY_SSOT;
  try {
    const raw = window.localStorage.getItem(TEACHER_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_OWNER_TEACHER_IDENTITY_SSOT;
    const parsed = JSON.parse(raw) as Partial<OwnerTeacherIdentity>;
    return sanitizeTeacherIdentity(parsed);
  } catch {
    return DEFAULT_OWNER_TEACHER_IDENTITY_SSOT;
  }
}

export function saveTeacherIdentitySSOT(updated: OwnerTeacherIdentity): boolean {
  if (typeof window === "undefined") return false;
  const stamped: OwnerTeacherIdentity = sanitizeTeacherIdentity({
    ...updated,
    updatedAtMs: Date.now(),
  });
  let savedLocally = false;
  try {
    window.localStorage.setItem(
      TEACHER_SETTINGS_STORAGE_KEY,
      JSON.stringify(stamped)
    );
    savedLocally = true;
  } catch {
    // في حال تجاوز حجم صورة اللوجو سعة localStorage نضغطها أو نحفظ البيانات النصية كاملة
    try {
      const fallbackWithoutHeavyDataUrl: OwnerTeacherIdentity = {
        ...stamped,
        platformLogoUrl: stamped.platformLogoUrl.startsWith("data:")
          ? ""
          : stamped.platformLogoUrl,
      };
      window.localStorage.setItem(
        TEACHER_SETTINGS_STORAGE_KEY,
        JSON.stringify(fallbackWithoutHeavyDataUrl)
      );
      savedLocally = true;
    } catch {
      savedLocally = false;
    }
  }
  window.dispatchEvent(
    new CustomEvent(IDENTITY_UPDATED_EVENT_NAME, { detail: stamped })
  );
  void syncTeacherIdentityToSupabaseCloud(stamped);
  return savedLocally;
}

export async function refreshTeacherIdentityFromSupabaseSSOT(): Promise<OwnerTeacherIdentity> {
  const local = loadTeacherIdentitySSOT();
  const cloud = await pullTeacherIdentityFromSupabaseCloud();
  if (!cloud) return local;
  const localTime = local.updatedAtMs ?? 0;
  const cloudTime = typeof cloud.updatedAtMs === "number" ? cloud.updatedAtMs : 0;
  // إذا كان الحفظ المحلي أحدث أو مساوياً للسحابي، لا نطمس التعديلات المحلية أبداً
  if (localTime > 0 && localTime >= cloudTime) {
    return local;
  }
  const merged = sanitizeTeacherIdentity({
    ...local,
    ...cloud,
  });
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        TEACHER_SETTINGS_STORAGE_KEY,
        JSON.stringify(merged)
      );
      window.dispatchEvent(
        new CustomEvent(IDENTITY_UPDATED_EVENT_NAME, { detail: merged })
      );
    } catch {
      // ignore storage write error
    }
  }
  return merged;
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
  if (
    settings.customSecretLoginCode &&
    trimmed === settings.customSecretLoginCode.trim().toLowerCase()
  ) {
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

/**
 * سحب سجل الطلاب من سحابة Supabase ودمجه مع السجل المحلي لضمان رؤية الطلاب المسجلين من هواتفهم.
 */
export async function refreshRegisteredStudentsFromSupabaseSSOT(): Promise<
  readonly RegisteredStudentRecordSSOT[]
> {
  const local = loadRegisteredStudentsSSOT();
  const cloud = await pullStudentsRegistryFromSupabaseCloud();
  if (!cloud) return local;

  const byCode = new Map<string, RegisteredStudentRecordSSOT>();
  for (const s of local) {
    byCode.set(s.studentCode.toUpperCase(), s);
  }
  for (const c of cloud) {
    byCode.set(c.studentCode.toUpperCase(), c);
  }
  const merged = Array.from(byCode.values());
  persistStudentsList(merged);
  return merged;
}

export function registerNewStudentSSOT(input: {
  readonly fullNameAr: string;
  readonly studentPhone: string;
  readonly passwordPin: string;
  readonly gradeId: string;
}): RegisteredStudentRecordSSOT {
  const existing = loadRegisteredStudentsSSOT();
  const maxExistingCode = existing.reduce((max, s) => {
    const num = Number(s.altNumericCode || s.studentCode.replace(/^MATH-/i, ""));
    return Number.isFinite(num) && num > max ? num : max;
  }, 1000);
  const nextNumber = maxExistingCode + 1;
  const gradeObj = EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === input.gradeId);

  const newStudent: RegisteredStudentRecordSSOT = {
    id: `student-${Date.now()}`,
    studentCode: `MATH-${nextNumber}`,
    altNumericCode: String(nextNumber),
    fullNameAr: input.fullNameAr.trim(),
    studentPhone: input.studentPhone.trim(),
    passwordPin: input.passwordPin.trim(),
    gradeId: input.gradeId,
    gradeNameAr: gradeObj?.nameArabic || "الصف الثالث الإعدادي",
    createdAtIso: new Date().toISOString(),
  };

  persistStudentsList([...existing, newStudent]);
  void syncStudentRecordToSupabaseCloud(newStudent);
  return newStudent;
}

export function authenticateStudentCodeOrPhoneSSOT(
  identifier: string,
  passwordPin?: string
): RegisteredStudentRecordSSOT | null {
  const clean = identifier.trim().toUpperCase();
  const students = loadRegisteredStudentsSSOT();
  const found = students.find(
    (s) =>
      s.studentCode.toUpperCase() === clean ||
      s.altNumericCode === clean ||
      s.studentPhone === clean
  );
  if (!found) return null;
  if (
    passwordPin &&
    passwordPin.trim().length > 0 &&
    found.passwordPin &&
    found.passwordPin !== passwordPin.trim()
  ) {
    return null;
  }
  return found;
}

/**
 * يحفظ هوية المستخدم الحالي دائماً: في `localStorage` عند اختيار «تذكرني» (دائم)،
 * وإلا في `sessionStorage` (حتى إغلاق المتصفح) ليعرف النظام هوية الطالب أثناء الجلسة.
 */
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
