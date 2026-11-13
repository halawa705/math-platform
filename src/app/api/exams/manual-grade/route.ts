/**
 * @file route.ts
 * @description نقطة تصحيح الأسئلة المقالية يدوياً للمعلم المالك (`/api/exams/manual-grade`):
 * تحدّث الدرجات في `exam_submissions` وتحذف صور الحل المرفوعة تلقائياً فور حفظ التصحيح لتوفير مساحة التخزين.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 115 سطراً).
 */

import { NextResponse } from "next/server";
import {
  TEACHER_AUTH_COOKIE_NAME,
  verifyTeacherSessionToken,
} from "@/core/auth/teacher-auth-server-ssot";
import {
  readCookieFromRequest,
  sbPatch,
  sbSelect,
} from "@/core/auth/exam-server-supabase-helper";
import {
  applyManualGradesAndWipePhotos,
  type ManualQuestionGradeInput,
} from "@/core/exam-grading/manual-essay-grading-and-wipe";
import type {
  OnlineExamGradeResult,
  StudentAnswerInput,
} from "@/core/exam-grading/online-exam-grader";

export async function POST(req: Request) {
  try {
    const teacherToken = readCookieFromRequest(req, TEACHER_AUTH_COOKIE_NAME);
    const isTeacher = await verifyTeacherSessionToken(teacherToken);
    if (!isTeacher) {
      return NextResponse.json(
        { success: false, error: "التصحيح اليدوي متاح للمعلم المالك فقط." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      submissionId?: string;
      examCode?: string;
      studentCode?: string;
      gradesByQuestionId?: Readonly<Record<string, ManualQuestionGradeInput>>;
    };

    const examCode = (body.examCode || "").trim();
    const studentCode = (body.studentCode || "").trim().toUpperCase();
    const submissionCode = (body.submissionId || `${examCode}__${studentCode}`).trim();
    if (!submissionCode) {
      return NextResponse.json(
        { success: false, error: "معرف التسليم مطلوب." },
        { status: 400 }
      );
    }

    const rows = await sbSelect<{
      submission_code?: string;
      answers_json?: Readonly<Record<string, StudentAnswerInput | undefined>> | null;
      result_json?: OnlineExamGradeResult | null;
    }>(
      `exam_submissions?submission_code=eq.${encodeURIComponent(submissionCode)}&select=submission_code,answers_json,result_json&limit=1`
    );
    const existing = rows?.[0];

    const graded = applyManualGradesAndWipePhotos({
      answersJson: existing?.answers_json ?? undefined,
      resultJson: existing?.result_json ?? undefined,
      gradesByQuestionId: body.gradesByQuestionId ?? {},
    });

    await sbPatch(
      `exam_submissions?submission_code=eq.${encodeURIComponent(submissionCode)}`,
      {
        percentage: graded.updatedResultJson.percentage,
        score: graded.updatedResultJson.totalEarnedMarks,
        total_marks: graded.updatedResultJson.totalAllocatedMarks,
        is_reviewed_by_teacher: true,
        answers_json: graded.updatedAnswersJson,
        result_json: graded.updatedResultJson,
      }
    );

    return NextResponse.json({
      success: true,
      percentage: graded.updatedResultJson.percentage,
      totalEarnedMarks: graded.updatedResultJson.totalEarnedMarks,
      totalAllocatedMarks: graded.updatedResultJson.totalAllocatedMarks,
      wipedImagesCount: graded.wipedImagesCount,
      updatedAnswersJson: graded.updatedAnswersJson,
      updatedResultJson: graded.updatedResultJson,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "تعذر حفظ التصحيح اليدوي على الخادم." },
      { status: 500 }
    );
  }
}
