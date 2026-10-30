/**
 * @file route.ts
 * @description نقطة نشر الاختبار الإلكتروني على الخادم للمعلم المالك فقط (`/api/exams/publish`):
 * تفصل الأسئلة العامة عن مفتاح الإجابات، وتخزن المفتاح سرياً في `exam_answer_keys` والأسئلة العامة فقط في `electronic_exams`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import { NextResponse } from "next/server";
import {
  TEACHER_AUTH_COOKIE_NAME,
  verifyTeacherSessionToken,
} from "@/core/auth/teacher-auth-server-ssot";
import {
  readCookieFromRequest,
  sbInsert,
} from "@/core/auth/exam-server-supabase-helper";
import { splitExamIntoPublicAndKey } from "@/core/exam-grading/online-exam-public-key-splitter";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";

export async function POST(req: Request) {
  try {
    const teacherToken = readCookieFromRequest(req, TEACHER_AUTH_COOKIE_NAME);
    const isTeacher = await verifyTeacherSessionToken(teacherToken);
    if (!isTeacher) {
      return NextResponse.json(
        { success: false, error: "غير مصرح بنشر الاختبار إلا للمعلم المالك." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      gradeId?: string;
      gradeNameArabic?: string;
      titleAr?: string;
      durationMinutes?: number;
      availabilityDays?: number;
      revealAnswers?: boolean;
      questions?: readonly QuestionAssessmentIR[];
    };

    const rawQuestions = Array.isArray(body.questions) ? body.questions : [];
    const { publicQuestions, answerKey, excludedQuestionNumbers } =
      splitExamIntoPublicAndKey(rawQuestions);

    if (publicQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "لا توجد أسئلة قابلة للتصحيح الآلي (اختر أو إجابة قصيرة).",
          excludedQuestionNumbers,
        },
        { status: 400 }
      );
    }

    const gradeId = (body.gradeId || "prep-3").trim();
    const gradeNameArabic = (body.gradeNameArabic || "").trim();
    const titleAr = (body.titleAr || "اختبار إلكتروني").trim();
    const durationMinutes = Math.max(5, Math.min(180, Number(body.durationMinutes) || 30));
    const availabilityDays = Math.max(1, Math.min(60, Number(body.availabilityDays) || 7));
    const revealAnswers = body.revealAnswers !== false;

    const nowMs = Date.now();
    const publishedAtIso = new Date(nowMs).toISOString();
    const expiresAtIso = new Date(nowMs + availabilityDays * 86_400_000).toISOString();
    const examCode = `exam_${gradeId}_${nowMs}`;

    await sbInsert(
      "exam_answer_keys",
      {
        exam_code: examCode,
        answer_key: answerKey,
        reveal_answers: revealAnswers,
        created_at: publishedAtIso,
      },
      "exam_code"
    );

    await sbInsert(
      "electronic_exams",
      {
        exam_code: examCode,
        title_ar: titleAr,
        grade_id: gradeId,
        grade_name_ar: gradeNameArabic,
        branch_id: "general",
        duration_minutes: durationMinutes,
        availability_days: availabilityDays,
        expires_at: expiresAtIso,
        pass_percentage: 70,
        questions_json: publicQuestions,
        status: "active",
        is_published: true,
        created_at: publishedAtIso,
      },
      "exam_code"
    );

    return NextResponse.json({
      success: true,
      examCode,
      publishedCount: publicQuestions.length,
      excludedQuestionNumbers,
      publicQuestions,
      publishedAtIso,
      expiresAtIso,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع أثناء نشر الاختبار." },
      { status: 500 }
    );
  }
}
