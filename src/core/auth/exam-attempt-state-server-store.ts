/**
 * @file exam-attempt-state-server-store.ts
 * @description مخزن حالة محاولة الاختبار ووسوم الإخوة على الخادم (`platform_ssot_state` + ذاكرة احتياطية):
 * يضمن قفل وضع الاختبار المختار، قفل الأسئلة في وضع التدريب باتجاه واحد، حفظ مسودة انقطاع الإنترنت،
 * وحفظ وسم الإخوة للحسابات المشتركة في رقم الهاتف دون الحاجة لتعديل جداول SQL يدوياً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 170 سطراً).
 */

import type { StudentAnswerInput } from "@/core/exam-grading/online-exam-grader";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "@/core/supabase/supabase-config-ssot";

export const MODULE_ID_EXAM_ATTEMPT_STATE_SERVER_STORE =
  "exam_attempt_state_server_store" as const;

export type OnlineExamSessionMode = "exam" | "training";

export interface LockedTrainingQuestionFeedback {
  readonly isCorrect: boolean;
  readonly earnedMarks: number;
  readonly allocatedMarks: number;
  readonly correctMcqChoiceIndex?: number;
  readonly finalAnswerArabic: string;
  readonly modelSolutionStepsArabic: readonly string[];
}

export interface ExamAttemptServerMeta {
  readonly examCode: string;
  readonly studentCode: string;
  readonly examMode: OnlineExamSessionMode;
  readonly startedAtIso: string;
  readonly draftAnswers: Record<string, StudentAnswerInput | undefined>;
  readonly lockedQuestionIds: readonly string[];
  readonly lockedFeedbackByQuestion: Record<string, LockedTrainingQuestionFeedback>;
  readonly updatedAtIso: string;
}

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_PUBLIC_KEY;
const SIBLING_TAGS_STATE_ID = "student_sibling_tags_v1" as const;

const memoryAttemptMeta = new Map<string, ExamAttemptServerMeta>();
const memorySiblingCodes: Record<string, boolean> = {};

function buildHeaders(prefer?: string): Record<string, string> {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function buildAttemptStateId(examCode: string, studentCode: string): string {
  return `exam_attempt_meta__${examCode.trim()}__${studentCode.trim().toUpperCase()}`;
}

async function readStateJson<T>(stateId: string): Promise<T | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/platform_ssot_state?id=eq.${encodeURIComponent(stateId)}&select=identity_json`,
      { headers: buildHeaders(), cache: "no-store" }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ identity_json?: T }>;
    return rows[0]?.identity_json ?? null;
  } catch {
    return null;
  }
}

async function writeStateJson(stateId: string, payload: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/platform_ssot_state?on_conflict=id`, {
      method: "POST",
      headers: buildHeaders("resolution=merge-duplicates,return=minimal"),
      body: JSON.stringify({
        id: stateId,
        identity_json: payload,
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadExamAttemptMetaServer(
  examCode: string,
  studentCode: string
): Promise<ExamAttemptServerMeta | null> {
  const key = buildAttemptStateId(examCode, studentCode);
  const cloud = await readStateJson<ExamAttemptServerMeta & { deleted?: boolean }>(key);
  if (cloud?.deleted) {
    memoryAttemptMeta.delete(key);
    return null;
  }
  if (cloud && cloud.examCode && cloud.studentCode) {
    memoryAttemptMeta.set(key, cloud);
    return cloud;
  }
  return memoryAttemptMeta.get(key) ?? null;
}

export async function saveExamAttemptMetaServer(
  meta: ExamAttemptServerMeta
): Promise<ExamAttemptServerMeta> {
  const key = buildAttemptStateId(meta.examCode, meta.studentCode);
  const normalized: ExamAttemptServerMeta = {
    ...meta,
    updatedAtIso: new Date().toISOString(),
  };
  memoryAttemptMeta.set(key, normalized);
  await writeStateJson(key, normalized);
  return normalized;
}

export async function deleteExamAttemptMetaServer(
  examCode: string,
  studentCode: string
): Promise<void> {
  const key = buildAttemptStateId(examCode, studentCode);
  memoryAttemptMeta.delete(key);
  // كتابة علامة الحذف أولاً لضمان التعطيل حتى إذا منعت سياسات RLS الحذف المباشر، ثم إرسال DELETE
  await writeStateJson(key, { deleted: true, deletedAtIso: new Date().toISOString() });
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/platform_ssot_state?id=eq.${encodeURIComponent(key)}`,
      {
        method: "DELETE",
        headers: buildHeaders("return=minimal"),
      }
    );
  } catch {
    // fallback tombstone and in-memory cleanup already succeeded
  }
}

export function mergeDraftPreservingLockedQuestions(params: {
  readonly existingDraft: Readonly<Record<string, StudentAnswerInput | undefined>>;
  readonly incomingDraft: Readonly<Record<string, StudentAnswerInput | undefined>>;
  readonly lockedQuestionIds: readonly string[];
}): Record<string, StudentAnswerInput | undefined> {
  const lockedSet = new Set(params.lockedQuestionIds);
  const merged: Record<string, StudentAnswerInput | undefined> = { ...params.existingDraft };
  for (const [qId, ans] of Object.entries(params.incomingDraft)) {
    if (lockedSet.has(qId)) continue;
    merged[qId] = ans;
  }
  return merged;
}

export async function loadSiblingStudentCodesServer(): Promise<Record<string, boolean>> {
  const cloud = await readStateJson<{ siblingCodes?: Record<string, boolean> }>(
    SIBLING_TAGS_STATE_ID
  );
  if (cloud?.siblingCodes && typeof cloud.siblingCodes === "object") {
    for (const [code, flag] of Object.entries(cloud.siblingCodes)) {
      if (flag) memorySiblingCodes[code.toUpperCase()] = true;
    }
  }
  return { ...memorySiblingCodes };
}

export async function markStudentsAsSiblingsServer(
  studentCodes: readonly string[]
): Promise<void> {
  const current = await loadSiblingStudentCodesServer();
  for (const raw of studentCodes) {
    const clean = raw.trim().toUpperCase();
    if (!clean) continue;
    current[clean] = true;
    memorySiblingCodes[clean] = true;
  }
  await writeStateJson(SIBLING_TAGS_STATE_ID, { siblingCodes: current });
}

export async function isStudentCodeSiblingServer(studentCode: string): Promise<boolean> {
  const map = await loadSiblingStudentCodesServer();
  return Boolean(map[studentCode.trim().toUpperCase()]);
}
