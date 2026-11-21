/**
 * @file route.ts
 * @description نقطة الحفظ التلقائي لمسودة الطالب على الخادم (`/api/exams/save-draft`) لحماية الإجابات من انقطاع النت أو الكهرباء.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 95 سطراً).
 */

import { NextResponse } from "next/server";
import {
  STUDENT_AUTH_COOKIE_NAME,
  verifyStudentSessionToken,
} from "@/core/auth/student-auth-server-ssot";
import { readCookieFromRequest, sbSelect } from "@/core/auth/exam-server-supabase-helper";
import {
  loadExamAttemptMetaServer,
  mergeDraftPreservingLockedQuestions,
  saveExamAttemptMetaServer,
} from "@/core/auth/exam-attempt-state-server-store";
import type { StudentAnswerInput } from "@/core/exam-grading/online-exam-grader";

export async function POST(req: Request) {
  try {
    const session = await verifyStudentSessionToken(
      readCookieFromRequest(req, STUDENT_AUTH_COOKIE_NAME)
    );
    if (!session) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = (await req.json()) as {
      examCode?: string;
      answers?: Readonly<Record<string, StudentAnswerInput | undefined>>;
    };
    const examCode = (body.examCode || "").trim();
    if (!examCode || !body.answers) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const meta = await loadExamAttemptMetaServer(examCode, session.studentCode);
    if (!meta) {
      return NextResponse.json({ success: false, notStarted: true }, { status: 200 });
    }

    const exams = await sbSelect<{ duration_minutes?: number | null }>(
      `electronic_exams?exam_code=eq.${encodeURIComponent(examCode)}&select=duration_minutes`
    );
    const durationMin = exams?.[0]?.duration_minutes || 60;
    if (Date.now() > Date.parse(meta.startedAtIso) + durationMin * 60_000 + 90_000) {
      return NextResponse.json({ success: false, expired: true }, { status: 200 });
    }

    const mergedDraft = mergeDraftPreservingLockedQuestions({
      existingDraft: meta.draftAnswers,
      incomingDraft: body.answers,
      lockedQuestionIds: meta.lockedQuestionIds,
    });

    const saved = await saveExamAttemptMetaServer({
      ...meta,
      draftAnswers: mergedDraft,
      updatedAtIso: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      savedAtIso: saved.updatedAtIso,
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
