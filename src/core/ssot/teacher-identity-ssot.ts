/**
 * @file teacher-identity-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) القابل للتعديل الحي من صفحة الإعدادات (`/settings`):
 * هوية المعلم المالك، اسم المنصة، اللوجو، الهاتف، التذييل، العلامة المائية، والصفوف المفعّلة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 200 سطر).
 */

import { EGYPTIAN_MATH_GRADES_SSOT, type CurriculumGradeNode } from "./curriculum-hierarchy-ssot";
import { pullTeacherIdentityFromSupabaseCloud, syncTeacherIdentityToSupabaseCloud } from "../supabase/supabase-cloud-sync-ssot";

export const IDENTITY_UPDATED_EVENT_NAME = "math-platform-identity-updated" as const;

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

const TEACHER_SETTINGS_STORAGE_KEY = "math_platform_teacher_settings_ssot_v4" as const;

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
  enabledGradeIds: ["prim-3", "prim-4", "prim-5", "prim-6", "prep-1", "prep-2", "prep-3"],
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

function sanitizeTeacherIdentity(parsed: Partial<OwnerTeacherIdentity>): OwnerTeacherIdentity {
  const cleanBrand = (val: string | undefined, fallback: string) =>
    val && val.trim().length > 0 && !val.includes("الخوارزمي") ? val : fallback;

  return {
    ...DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
    ...parsed,
    teacherFullName: parsed.teacherFullName?.trim() || DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.teacherFullName,
    teacherNickname: parsed.teacherNickname ?? "",
    teacherPhone: parsed.teacherPhone ?? "",
    teacherTitle: parsed.teacherTitle?.trim() || DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.teacherTitle,
    platformBrandName: cleanBrand(parsed.platformBrandName, DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.platformBrandName),
    footerText: cleanBrand(parsed.footerText, DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.footerText),
    watermarkText: cleanBrand(parsed.watermarkText, DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.watermarkText),
    platformLogoUrl: parsed.platformLogoUrl ?? "",
    platformLogoSymbol: parsed.platformLogoSymbol || DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.platformLogoSymbol,
    enabledGradeIds:
      Array.isArray(parsed.enabledGradeIds) && parsed.enabledGradeIds.length > 0
        ? parsed.enabledGradeIds
        : DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.enabledGradeIds,
    notebookLmUrlsByGrade: {
      ...DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.notebookLmUrlsByGrade,
      ...(parsed.notebookLmUrlsByGrade || {}),
    },
    updatedAtMs: typeof parsed.updatedAtMs === "number" ? parsed.updatedAtMs : undefined,
  };
}

export function loadTeacherIdentitySSOT(): OwnerTeacherIdentity {
  if (typeof window === "undefined") return DEFAULT_OWNER_TEACHER_IDENTITY_SSOT;
  try {
    const raw = window.localStorage.getItem(TEACHER_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_OWNER_TEACHER_IDENTITY_SSOT;
    return sanitizeTeacherIdentity(JSON.parse(raw) as Partial<OwnerTeacherIdentity>);
  } catch {
    return DEFAULT_OWNER_TEACHER_IDENTITY_SSOT;
  }
}

export function saveTeacherIdentitySSOT(updated: OwnerTeacherIdentity): boolean {
  if (typeof window === "undefined") return false;
  const stamped: OwnerTeacherIdentity = sanitizeTeacherIdentity({ ...updated, updatedAtMs: Date.now() });
  let savedLocally = false;
  try {
    window.localStorage.setItem(TEACHER_SETTINGS_STORAGE_KEY, JSON.stringify(stamped));
    savedLocally = true;
  } catch {
    try {
      const fallback: OwnerTeacherIdentity = {
        ...stamped,
        platformLogoUrl: stamped.platformLogoUrl.startsWith("data:") ? "" : stamped.platformLogoUrl,
      };
      window.localStorage.setItem(TEACHER_SETTINGS_STORAGE_KEY, JSON.stringify(fallback));
      savedLocally = true;
    } catch {
      savedLocally = false;
    }
  }
  window.dispatchEvent(new CustomEvent(IDENTITY_UPDATED_EVENT_NAME, { detail: stamped }));
  void syncTeacherIdentityToSupabaseCloud(stamped);
  return savedLocally;
}

export async function refreshTeacherIdentityFromSupabaseSSOT(): Promise<OwnerTeacherIdentity> {
  const local = loadTeacherIdentitySSOT();
  const cloud = await pullTeacherIdentityFromSupabaseCloud();
  if (!cloud) return local;
  const localTime = local.updatedAtMs ?? 0;
  const cloudTime = typeof cloud.updatedAtMs === "number" ? cloud.updatedAtMs : 0;
  if (localTime > 0 && localTime >= cloudTime) return local;
  const merged = sanitizeTeacherIdentity({ ...local, ...cloud });
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(TEACHER_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent(IDENTITY_UPDATED_EVENT_NAME, { detail: merged }));
    } catch {
      // ignore storage write error
    }
  }
  return merged;
}

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
  if (settings.customSecretLoginCode && trimmed === settings.customSecretLoginCode.trim().toLowerCase()) return true;
  return settings.stealthTriggerCodes.some((c) => c.toLowerCase() === trimmed);
}

export async function copyPromptAndOpenGradeNotebookLmSSOT(
  arg1: string,
  arg2: string
): Promise<{ copied: boolean; openedUrl: string }> {
  const isArg1Grade = /^(?:prim|prep|sec)-\d$/.test(arg1.trim());
  const gradeId = isArg1Grade ? arg1.trim() : arg2.trim();
  const promptText = isArg1Grade ? arg2 : arg1;
  const settings = loadTeacherIdentitySSOT();
  const targetUrl = settings.notebookLmUrlsByGrade[gradeId]?.trim() || "https://notebooklm.google.com/";

  let copied = false;
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(promptText);
      copied = true;
    } catch {
      copied = false;
    }
  }
  if (typeof window !== "undefined") window.open(targetUrl, "_blank", "noopener,noreferrer");
  return { copied, openedUrl: targetUrl };
}

export {
  STUDENTS_REGISTRY_UPDATED_EVENT,
  type RegisteredStudentRecordSSOT,
  type RememberedUserSessionSSOT,
  loadRegisteredStudentsSSOT,
  refreshRegisteredStudentsFromSupabaseSSOT,
  registerNewStudentSSOT,
  saveRememberedSessionSSOT,
  loadRememberedSessionSSOT,
  clearRememberedSessionSSOT,
} from "./teacher-students-session-registry";
