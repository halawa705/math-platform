/**
 * @file route.ts
 * @description نقطة تصحيح التدريب المؤقت بعد المحاولة الرسمية الأولى (`/api/exams/practice-grade`):
 * تحسب الدرجة وتعرض الحلول النموذجية للطالب للمذاكرة فقط ثم تُهمل فوراً بصفر تخزين في قاعدة البيانات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 115 سطراً).
 */

import { NextResponse } from "next/server";
import {
  STUDENT_AUTH_COOKIE_NAME,
  verifyStudentSessionToken,
} from "@/core/auth/student-auth-server-ssot";
import { readCookieFromRequest, sbSelect } from "@/core/auth/exam-server-supabase-helper";
import {
  gradeOnlineExam,
  type StudentAnswerInput,
} from "@/core/exam-grading/online-exam-grader";
import type { OnlineAnswerKeyItem } from "@/core/exam-grading/online-exam-public-key-splitter";

export async function POST(req: Request) {
  try {
    const session = await verifyStudentSessionToken(
      readCookieFromRequest(req, STUDENT_AUTH_COOKIE_NAME)
    );
    if (!session) {
      return NextResponse.json(
        { success: false, error: "يرجى تسجيل دخول الطالب أولاً." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      examCode?: string;
      answers?: Readonly<Record<string, StudentAnswerInput | undefined>>;
    };
    const examCode = (body.examCode || "").trim();
    if (!examCode) {
      return NextResponse.json(
        { success: false, error: "رمز الاختبار مطلوب." },
        { status: 400 }
      );
    }

    const submissionCode = `${examCode}__${session.studentCode}`;
    const officialSub = await sbSelect<{ percentage: number }>(
      `exam_submissions?submission_code=eq.${encodeURIComponent(submissionCode)}&select=percentage`
    );

    if (!officialSub || officialSub.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "التدريب الإضافي متاح فقط بعد تسليم المحاولة الرسمية الأولى.",
        },
        { status: 403 }
      );
    }

    const keyRows = await sbSelect<{ answer_key: readonly OnlineAnswerKeyItem[] }>(
      `exam_answer_keys?exam_code=eq.${encodeURIComponent(examCode)}&select=answer_key`
    );
    const keyRow = keyRows?.[0];
    if (!keyRow || !Array.isArray(keyRow.answer_key)) {
      return NextResponse.json(
        { success: false, error: "مفتاح تصحيح هذا الاختبار غير متوفر." },
        { status: 404 }
      );
    }

    // تصحيح في الذاكرة فقط — صفر كتابة في قاعدة البيانات
    const result = gradeOnlineExam(keyRow.answer_key, body.answers ?? {});
    const review = keyRow.answer_key.map((k) => ({
      questionId: k.questionId,
      correctMcqChoiceIndex: k.correctMcqChoiceIndex,
      finalAnswerArabic: k.finalAnswerArabic,
      modelSolutionStepsArabic: k.modelSolutionStepsArabic,
    }));

    return NextResponse.json({
      success: true,
      isEphemeralPractice: true,
      officialPercentage: officialSub[0].percentage,
      percentage: result.percentage,
      totalEarnedMarks: result.totalEarnedMarks,
      totalAllocatedMarks: result.totalAllocatedMarks,
      items: result.items,
      review,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "تعذر تصحيح المحاولة التدريبية." },
      { status: 500 }
    );
  }
}
