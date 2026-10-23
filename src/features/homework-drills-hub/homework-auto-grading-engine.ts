/**
 * @file homework-auto-grading-engine.ts
 * @description محرك التصحيح الفوري للواجب الإلكتروني وإدارة نشر واسترجاع الواجبات النشطة للطالب أونلاين.
 * يربط الواجب المولد عبر NotebookLM بـ (الصف الدراسي -> الوحدة -> الدرس) من مستكشف المنهج (`curriculum-hierarchy-ssot.ts`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { toWesternNumeralsSSOT } from "@/core/ssot/numeral-and-unit-ssot";
import { buildTriangleMidsegmentFigure } from "@/core/geometry-engine/triangle-family/triangle-midsegment-branch";

export const MODULE_ID_HOMEWORK_AUTO_GRADING_ENGINE =
  "homework_auto_grading_engine" as const;

export interface PublishedOnlineHomeworkAssignment {
  readonly assignmentId: string;
  readonly gradeId: string;
  readonly gradeNameArabic: string;
  readonly unitId: string;
  readonly unitTitleArabic: string;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;
  readonly branchId: MathBranchId;
  readonly createdAtIso: string;
  readonly questions: readonly QuestionAssessmentIR[];
}

const HOMEWORK_STORAGE_KEY = "math_platform_online_homework_v1" as const;

export const DEFAULT_ONLINE_HOMEWORK_ASSIGNMENT: PublishedOnlineHomeworkAssignment = {
  assignmentId: "hw_default_prep3_u2_l1",
  gradeId: "prep-3",
  gradeNameArabic: "الصف الثالث الإعدادي",
  unitId: "prep-3-t1-u2",
  unitTitleArabic: "الوحدة الثانية: نظريات المثلث والتوازي وإقليدس",
  lessonId: "prep-3-t1-u2-l1",
  lessonTitleArabic: "القطعة الواصلة بين منتصفي ضلعين في مثلث",
  branchId: "plane_geometry",
  createdAtIso: "2026-10-23",
  questions: [
    {
      questionId: "hw_q_1",
      displayOrderNumber: 1,
      branchId: "plane_geometry",
      unitId: "prep-3-t1-u2",
      lessonId: "prep-3-t1-u2-l1",
      lessonTitleArabic: "القطعة الواصلة بين منتصفي ضلعين في مثلث",
      patternKind: "mcq",
      cognitiveDepth: "direct_application",
      allocatedMarks: 2,
      estimatedSolveMinutes: 2,
      promptArabic:
        "في الشكل المقابل: $د$ منتصف $أ ب$، $هـ$ منتصف $أ جـ$، وطول $ب جـ = 14$ سم. فإن طول القطعة $د هـ$ يساوي:",
      mcqChoicesArabic: ["$7$ سم", "$14$ سم", "$28$ سم", "$5$ سم"],
      correctMcqChoiceIndex: 0,
      modelSolutionStepsArabic: [
        "بما أن د منتصف أ ب، هـ منتصف أ جـ، إذن د هـ = نصف ب جـ = 14 ÷ 2 = 7 سم.",
      ],
      finalCanonicalAnswerArabic: "7 سم",
      attachedGeometryFigure: buildTriangleMidsegmentFigure({
        figureId: "hw_fig_1",
        thirdSideLengthCm: 14,
        notationLanguage: "arabic",
      }),
    },
    {
      questionId: "hw_q_2",
      displayOrderNumber: 2,
      branchId: "algebra",
      unitId: "prep-3-t1-u1",
      lessonId: "prep-3-t1-u1-l2",
      lessonTitleArabic: "دوال كثيرات الحدود والدالة التربيعية",
      patternKind: "direct_answer",
      cognitiveDepth: "multi_step_analysis",
      allocatedMarks: 3,
      estimatedSolveMinutes: 4,
      promptArabic:
        "إذا كان $س = 2$ أحد جذري المعادلة $س^2 - 5س + ك = 0$، فأوجد بالخطوات قيمة الثابت $ك$.",
      modelSolutionStepsArabic: [
        "بالتعويض عن س = 2 في المعادلة: (2)² - 5(2) + ك = 0 ومنها 4 - 10 + ك = 0 إذن ك = 6.",
      ],
      finalCanonicalAnswerArabic: "6",
    },
  ],
};

export function loadActiveOnlineHomeworkAssignment(): PublishedOnlineHomeworkAssignment {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(HOMEWORK_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PublishedOnlineHomeworkAssignment;
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage read error
    }
  }
  return DEFAULT_ONLINE_HOMEWORK_ASSIGNMENT;
}

export function publishOnlineHomeworkAssignment(
  assignment: PublishedOnlineHomeworkAssignment
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(assignment));
  } catch {
    // ignore storage write error
  }
}

export function gradeStudentHomeworkAnswer(params: {
  readonly question: QuestionAssessmentIR;
  readonly selectedChoiceIdx?: number | null;
  readonly writtenStepsText?: string;
}): {
  readonly isCorrect: boolean;
  readonly earnedMarks: number;
  readonly feedbackArabic: string;
} {
  const { question, selectedChoiceIdx, writtenStepsText } = params;

  if (question.patternKind === "mcq") {
    const ok = selectedChoiceIdx === (question.correctMcqChoiceIndex ?? 0);
    return {
      isCorrect: ok,
      earnedMarks: ok ? question.allocatedMarks : 0,
      feedbackArabic: ok
        ? `إجابة صحيحة! ${question.modelSolutionStepsArabic[0] || ""}`
        : `راجع الحل النموذجي: ${question.modelSolutionStepsArabic[0] || ""}`,
    };
  }

  const cleanStudent = toWesternNumeralsSSOT(writtenStepsText || "").trim();
  const cleanExpected = toWesternNumeralsSSOT(
    question.finalCanonicalAnswerArabic
  )
    .replace(/[^\d.-]/g, "")
    .trim();

  const ok =
    cleanStudent.length > 0 &&
    (cleanExpected ? cleanStudent.includes(cleanExpected) : true);

  return {
    isCorrect: ok,
    earnedMarks: ok ? question.allocatedMarks : 0,
    feedbackArabic: ok
      ? `أحسنت! خطوات صحيحة والناتج النهائي (${question.finalCanonicalAnswerArabic}) مطابق.`
      : `الحل النموذجي: ${question.modelSolutionStepsArabic.join(" — ")}`,
  };
}
