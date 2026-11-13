/**
 * @file exam-draft-persistent-storage.ts
 * @description حفظ مسودة إجابات الطالب في `localStorage` و `sessionStorage` مع طابع زمني لضمان عدم ضياع الحل عند إغلاق المتصفح أو انقطاع الإنترنت.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 90 سطراً).
 */

import type { StudentAnswerInput } from "@/core/exam-grading/online-exam-grader";

export const MODULE_ID_EXAM_DRAFT_PERSISTENT_STORAGE =
  "exam_draft_persistent_storage" as const;

export interface PersistentExamDraftPayload {
  readonly answers: Readonly<Record<string, StudentAnswerInput>>;
  readonly savedAtIso: string;
}

export function buildExamDraftStorageKey(
  examId: string,
  studentCode?: string
): string {
  return studentCode ? `math_platform_exam_draft_${examId}_${studentCode}` : "";
}

export function loadPersistentExamDraft(
  draftKey: string
): PersistentExamDraftPayload | null {
  if (!draftKey || typeof window === "undefined") return null;
  const parseRaw = (raw: string | null): PersistentExamDraftPayload | null => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<PersistentExamDraftPayload> | Record<string, StudentAnswerInput>;
      if (parsed && typeof parsed === "object" && "answers" in parsed && parsed.answers) {
        return {
          answers: parsed.answers as Readonly<Record<string, StudentAnswerInput>>,
          savedAtIso: typeof parsed.savedAtIso === "string" ? parsed.savedAtIso : new Date().toISOString(),
        };
      }
      if (parsed && typeof parsed === "object") {
        return {
          answers: parsed as Readonly<Record<string, StudentAnswerInput>>,
          savedAtIso: new Date().toISOString(),
        };
      }
    } catch {
      return null;
    }
    return null;
  };

  try {
    const fromLocal = parseRaw(window.localStorage.getItem(draftKey));
    if (fromLocal) return fromLocal;
  } catch {
    // fallback below
  }
  try {
    return parseRaw(window.sessionStorage.getItem(draftKey));
  } catch {
    return null;
  }
}

export function savePersistentExamDraft(
  draftKey: string,
  answers: Readonly<Record<string, StudentAnswerInput>>
): string {
  const savedAtIso = new Date().toISOString();
  if (!draftKey || typeof window === "undefined") return savedAtIso;
  const serialized = JSON.stringify({ answers, savedAtIso });
  try {
    window.localStorage.setItem(draftKey, serialized);
  } catch {
    // ignore storage quota warning
  }
  try {
    window.sessionStorage.setItem(draftKey, serialized);
  } catch {
    // ignore session quota warning
  }
  return savedAtIso;
}

export function clearPersistentExamDraft(draftKey: string): void {
  if (!draftKey || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftKey);
  } catch {
    // ignore
  }
  try {
    window.sessionStorage.removeItem(draftKey);
  } catch {
    // ignore
  }
}
