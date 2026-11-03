/**
 * @file published-online-exams-store.ts
 * @description مخزن الاختبارات الإلكترونية المنشورة (يحتفظ بالأسئلة العامة فقط بدون مفاتيح الإجابة):
 * النشر والأرشفة الفعليان يتمان عبر نقاط الخادم الآمنة `/api/exams/publish` و `/api/exams/archive`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import {
  splitExamIntoPublicAndKey,
  type OnlineAnswerKeyItem,
  type OnlinePublicQuestion,
} from "@/core/exam-grading/online-exam-public-key-splitter";
import { pullPublishedExamsFromSupabaseCloud } from "@/core/supabase/supabase-cloud-sync-ssot";
import { notifyRealtimeTableUpdated } from "@/core/supabase/supabase-realtime-submissions-channel";

export type PublishedExamQuestionItem = OnlinePublicQuestion &
  Partial<Omit<QuestionAssessmentIR, "mcqChoicesArabic">>;

export interface PublishedOnlineExam {
  readonly examId: string;
  readonly gradeId: string;
  readonly gradeNameArabic: string;
  readonly titleAr: string;
  readonly durationMinutes: number;
  readonly availabilityDays: number;
  readonly publishedAtIso: string;
  readonly expiresAtIso: string;
  readonly questions: readonly PublishedExamQuestionItem[];
  readonly status: "active" | "archived";
}

const PUBLISHED_EXAMS_STORAGE_KEY = "math_platform_published_exams_v2" as const;
const TEACHER_EXAM_KEYS_STORAGE_KEY = "math_platform_teacher_exam_keys_v1" as const;
export const PUBLISHED_EXAMS_UPDATED_EVENT = "math-platform-exams-updated" as const;

export function saveLocalExamAnswerKeySSOT(
  examId: string,
  answerKey: readonly OnlineAnswerKeyItem[]
): void {
  if (typeof window === "undefined" || !examId) return;
  try {
    const raw = window.localStorage.getItem(TEACHER_EXAM_KEYS_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, readonly OnlineAnswerKeyItem[]>) : {};
    map[examId] = answerKey;
    window.localStorage.setItem(TEACHER_EXAM_KEYS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
}

export function loadLocalExamAnswerKeySSOT(
  examId: string
): readonly OnlineAnswerKeyItem[] | null {
  if (typeof window === "undefined" || !examId) return null;
  try {
    const raw = window.localStorage.getItem(TEACHER_EXAM_KEYS_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, readonly OnlineAnswerKeyItem[]>;
    return Array.isArray(map[examId]) ? map[examId] : null;
  } catch {
    return null;
  }
}

export function buildStudentExamShareUrlSSOT(exam: {
  readonly examId: string;
  readonly gradeId: string;
}): string {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";
  return `${origin}/student?tab=live_exam&gradeId=${encodeURIComponent(exam.gradeId)}&examId=${encodeURIComponent(exam.examId)}`;
}

function normalizeAndAutoExpireExams(rawList: readonly PublishedOnlineExam[]): {
  readonly exams: readonly PublishedOnlineExam[];
  readonly NewlyExpired: readonly PublishedOnlineExam[];
} {
  const nowMs = Date.now();
  const newlyExpired: PublishedOnlineExam[] = [];

  const normalized = rawList.map((item) => {
    const publishedAtIso = item.publishedAtIso || new Date().toISOString();
    const availabilityDays = typeof item.availabilityDays === "number" && item.availabilityDays > 0 ? item.availabilityDays : 7;
    const expiresAtIso = item.expiresAtIso || new Date(Date.parse(publishedAtIso) + availabilityDays * 86_400_000).toISOString();

    if (item.status === "active" && Date.parse(expiresAtIso) <= nowMs) {
      const archivedItem: PublishedOnlineExam = { ...item, availabilityDays, publishedAtIso, expiresAtIso, status: "archived" };
      newlyExpired.push(archivedItem);
      return archivedItem;
    }
    return { ...item, availabilityDays, publishedAtIso, expiresAtIso };
  });

  return { exams: normalized, NewlyExpired: newlyExpired };
}

export function loadAllPublishedExamsSSOT(): readonly PublishedOnlineExam[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PUBLISHED_EXAMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PublishedOnlineExam[];
    if (!Array.isArray(parsed)) return [];
    const { exams, NewlyExpired } = normalizeAndAutoExpireExams(parsed);
    if (NewlyExpired.length > 0) {
      window.localStorage.setItem(PUBLISHED_EXAMS_STORAGE_KEY, JSON.stringify(exams));
    }
    return exams;
  } catch {
    return [];
  }
}

function persistExams(exams: readonly PublishedOnlineExam[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PUBLISHED_EXAMS_STORAGE_KEY, JSON.stringify(exams));
    window.dispatchEvent(new CustomEvent(PUBLISHED_EXAMS_UPDATED_EVENT));
  } catch {
    // ignore storage write error
  }
}

export async function refreshPublishedExamsFromSupabaseSSOT(): Promise<readonly PublishedOnlineExam[]> {
  const local = loadAllPublishedExamsSSOT();
  const cloud = await pullPublishedExamsFromSupabaseCloud();
  if (!cloud) return local;

  const byId = new Map<string, PublishedOnlineExam>();
  for (const e of local) byId.set(e.examId, e);
  for (const c of cloud) {
    const existing = byId.get(c.examId);
    if (existing && Date.parse(existing.expiresAtIso) > Date.parse(c.expiresAtIso)) {
      byId.set(c.examId, existing);
    } else {
      byId.set(c.examId, c);
    }
  }

  const merged = Array.from(byId.values()).sort((a, b) => b.publishedAtIso.localeCompare(a.publishedAtIso));
  const { exams } = normalizeAndAutoExpireExams(merged);
  persistExams(exams);
  return exams;
}

export function loadActiveExamsForGradeSSOT(gradeId: string): readonly PublishedOnlineExam[] {
  return loadAllPublishedExamsSSOT().filter((e) => e.gradeId === gradeId && e.status === "active");
}

export function publishOnlineExamSSOT(input: {
  readonly examId?: string;
  readonly gradeId: string;
  readonly gradeNameArabic: string;
  readonly titleAr: string;
  readonly durationMinutes: number;
  readonly availabilityDays?: number;
  readonly questions: readonly QuestionAssessmentIR[];
}): PublishedOnlineExam {
  const existing = loadAllPublishedExamsSSOT();
  const safeDays = Math.max(1, Math.round(input.availabilityDays ?? 7));
  const nowMs = Date.now();
  const publishedAtIso = new Date(nowMs).toISOString();
  const expiresAtIso = new Date(nowMs + safeDays * 86_400_000).toISOString();
  const { publicQuestions, answerKey } = splitExamIntoPublicAndKey(input.questions);
  const resolvedExamId = input.examId || `exam_${input.gradeId}_${nowMs}`;

  saveLocalExamAnswerKeySSOT(resolvedExamId, answerKey);

  const created: PublishedOnlineExam = {
    examId: resolvedExamId,
    gradeId: input.gradeId,
    gradeNameArabic: input.gradeNameArabic,
    titleAr: input.titleAr,
    durationMinutes: input.durationMinutes,
    availabilityDays: safeDays,
    publishedAtIso,
    expiresAtIso,
    questions: publicQuestions,
    status: "active",
  };

  persistExams([created, ...existing.filter((e) => e.examId !== created.examId)]);
  notifyRealtimeTableUpdated("electronic_exams");
  return created;
}

export function updateOnlineExamSettingsSSOT(params: {
  readonly examId: string;
  readonly titleAr?: string;
  readonly durationMinutes?: number;
  readonly availabilityDays?: number;
  readonly status?: "active" | "archived";
}): PublishedOnlineExam | null {
  let updatedTarget: PublishedOnlineExam | null = null;
  const updatedList = loadAllPublishedExamsSSOT().map((e) => {
    if (e.examId !== params.examId) return e;
    const nextDays =
      params.availabilityDays !== undefined
        ? Math.max(1, Math.min(365, Math.round(params.availabilityDays)))
        : e.availabilityDays;
    const nextStatus = params.status ?? e.status;
    const nextExpires =
      params.availabilityDays !== undefined || params.status === "active"
        ? new Date(Date.now() + nextDays * 86_400_000).toISOString()
        : e.expiresAtIso;
    updatedTarget = {
      ...e,
      titleAr: params.titleAr?.trim() ? params.titleAr.trim() : e.titleAr,
      durationMinutes:
        params.durationMinutes !== undefined
          ? Math.max(5, Math.min(180, Math.round(params.durationMinutes)))
          : e.durationMinutes,
      availabilityDays: nextDays,
      expiresAtIso: nextExpires,
      status: nextStatus,
    };
    return updatedTarget;
  });

  if (updatedTarget) {
    persistExams(updatedList);
    notifyRealtimeTableUpdated("electronic_exams");
    if (typeof window !== "undefined") {
      const target = updatedTarget as PublishedOnlineExam;
      void fetch("/api/exams/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examCode: target.examId,
          action: params.status === "active" ? "reactivate" : "update_settings",
          titleAr: target.titleAr,
          durationMinutes: target.durationMinutes,
          availabilityDays: target.availabilityDays,
          expiresAtIso: target.expiresAtIso,
          status: target.status,
        }),
      });
    }
  }
  return updatedTarget;
}

export function deleteOnlineExamSSOT(examId: string): void {
  const remaining = loadAllPublishedExamsSSOT().filter((e) => e.examId !== examId);
  persistExams(remaining);
  notifyRealtimeTableUpdated("electronic_exams");
  if (typeof window !== "undefined") {
    void fetch("/api/exams/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examCode: examId, action: "archive" }),
    });
  }
}

export function archiveOnlineExamSSOT(examId: string): void {
  const updated = loadAllPublishedExamsSSOT().map((e) =>
    e.examId === examId ? { ...e, status: "archived" as const } : e
  );
  persistExams(updated);
  notifyRealtimeTableUpdated("electronic_exams");
  if (typeof window !== "undefined") {
    void fetch("/api/exams/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examCode: examId }),
    });
  }
}

export function formatExamExpiryRemainingAr(expiresAtIso: string): {
  readonly isExpired: boolean;
  readonly labelAr: string;
} {
  const diffMs = Date.parse(expiresAtIso) - Date.now();
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return { isExpired: true, labelAr: "انتهى المؤقت (مؤرشف تلقائياً)" };
  }
  const totalMinutes = Math.max(1, Math.floor(diffMs / 60_000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return {
      isExpired: false,
      labelAr: hours > 0 ? `متبقي ${days} يوم و ${hours} ساعة قبل الأرشفة` : `متبقي ${days} يوم قبل الأرشفة`,
    };
  }
  if (hours > 0) {
    return { isExpired: false, labelAr: `متبقي ${hours} ساعة و ${minutes} دقيقة قبل الأرشفة` };
  }
  return { isExpired: false, labelAr: `متبقي ${minutes} دقيقة قبل الأرشفة` };
}
