/**
 * @file published-online-exams-store.ts
 * @description مخزن الاختبارات الإلكترونية المنشورة (يحتفظ بالأسئلة العامة فقط بدون مفاتيح الإجابة):
 * النشر والأرشفة الفعليان يتمان عبر نقاط الخادم الآمنة `/api/exams/publish` و `/api/exams/archive`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import {
  splitExamIntoPublicAndKey,
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
export const PUBLISHED_EXAMS_UPDATED_EVENT = "math-platform-exams-updated" as const;

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
    const finalStatus = existing?.status === "archived" || c.status === "archived" ? "archived" : "active";
    byId.set(c.examId, { ...c, status: finalStatus });
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
  const { publicQuestions } = splitExamIntoPublicAndKey(input.questions);

  const created: PublishedOnlineExam = {
    examId: input.examId || `exam_${input.gradeId}_${nowMs}`,
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
