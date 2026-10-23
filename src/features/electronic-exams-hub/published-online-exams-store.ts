/**
 * @file published-online-exams-store.ts
 * @description مخزن الاختبارات الإلكترونية المنشورة فعلياً من المعلم (لا توجد أي اختبارات وهمية):
 * - الاختبار النشط الوحيد لكل صف دراسي هو الذي يراه الطلاب ويُحسب في قاعة المتميزين.
 * - نشر اختبار جديد لنفس الصف يؤرشف السابق تلقائياً، ويمكن للمعلم أرشفته يدوياً في أي وقت.
 */

import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";

export interface PublishedOnlineExam {
  readonly examId: string;
  readonly gradeId: string;
  readonly gradeNameArabic: string;
  readonly titleAr: string;
  readonly durationMinutes: number;
  readonly questions: readonly QuestionAssessmentIR[];
  readonly status: "active" | "archived";
  readonly publishedAtIso: string;
}

const PUBLISHED_EXAMS_STORAGE_KEY = "math_platform_published_exams_v1" as const;

export const PUBLISHED_EXAMS_UPDATED_EVENT = "math-platform-exams-updated" as const;

export function loadAllPublishedExamsSSOT(): readonly PublishedOnlineExam[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PUBLISHED_EXAMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PublishedOnlineExam[];
    return Array.isArray(parsed) ? parsed : [];
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

export function loadActiveExamForGradeSSOT(
  gradeId: string
): PublishedOnlineExam | null {
  return (
    loadAllPublishedExamsSSOT().find(
      (e) => e.gradeId === gradeId && e.status === "active"
    ) || null
  );
}

export function publishOnlineExamSSOT(input: {
  readonly gradeId: string;
  readonly gradeNameArabic: string;
  readonly titleAr: string;
  readonly durationMinutes: number;
  readonly questions: readonly QuestionAssessmentIR[];
}): PublishedOnlineExam {
  const archivedPrevious = loadAllPublishedExamsSSOT().map((e) =>
    e.gradeId === input.gradeId && e.status === "active"
      ? { ...e, status: "archived" as const }
      : e
  );
  const created: PublishedOnlineExam = {
    examId: `exam_${input.gradeId}_${Date.now()}`,
    gradeId: input.gradeId,
    gradeNameArabic: input.gradeNameArabic,
    titleAr: input.titleAr,
    durationMinutes: input.durationMinutes,
    questions: input.questions,
    status: "active",
    publishedAtIso: new Date().toISOString(),
  };
  persistExams([created, ...archivedPrevious]);
  return created;
}

export function archiveOnlineExamSSOT(examId: string): void {
  persistExams(
    loadAllPublishedExamsSSOT().map((e) =>
      e.examId === examId ? { ...e, status: "archived" as const } : e
    )
  );
}
