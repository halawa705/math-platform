import { describe, expect, it } from "vitest";
import {
  computeProfessionalExamDiagnostics,
  inferMathBranchIdForQuestion,
} from "./exam-diagnostic-metrics-calculator";
import { computeStudentPersonalDiagnostics } from "./student-personal-diagnostics-calculator";
import { buildRemedialWorksheetDirectives } from "@/features/teacher-home-dashboard/remedial-worksheet-studio-launcher";
import type { PublishedOnlineExam, PublishedExamQuestionItem } from "@/features/electronic-exams-hub/published-online-exams-store";
import type { OnlineExamSubmissionRecord } from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";

function makeQuestion(overrides: Partial<PublishedExamQuestionItem> & { questionId: string; displayOrderNumber: number }): PublishedExamQuestionItem {
  return {
    displayOrderNumber: overrides.displayOrderNumber,
    questionId: overrides.questionId,
    patternKind: "mcq",
    answerMode: "mcq",
    allocatedMarks: 1,
    promptArabic: overrides.promptArabic || "سؤال رياضيات",
    lessonTitleArabic: overrides.lessonTitleArabic || "درس الجبر",
    mcqChoicesArabic: ["أ", "ب", "جـ", "د"],
    numeralMode: "eastern",
    notationLanguage: "arabic",
  };
}

function makeSubmission(params: {
  examId: string;
  studentCode: string;
  studentNameAr: string;
  pct: number;
  items: ReadonlyArray<{ questionId: string; isCorrect: boolean }>;
  answers?: Readonly<Record<string, { choiceIndex?: number }>>;
  submittedAtIso?: string;
}): OnlineExamSubmissionRecord {
  return {
    submissionId: `${params.examId}__${params.studentCode}`,
    examId: params.examId,
    examTitleAr: "اختبار الرياضيات",
    gradeId: "prep-3",
    studentCode: params.studentCode,
    studentNameAr: params.studentNameAr,
    percentageScore: params.pct,
    submittedAtIso: params.submittedAtIso || "2026-11-21T10:00:00.000Z",
    isReviewedByTeacher: false,
    answersJson: params.answers,
    resultJson: {
      items: params.items.map((it) => ({
        questionId: it.questionId,
        isCorrect: it.isCorrect,
        earnedMarks: it.isCorrect ? 1 : 0,
        allocatedMarks: 1,
      })),
      totalEarnedMarks: params.items.filter((i) => i.isCorrect).length,
      totalAllocatedMarks: params.items.length,
      percentage: params.pct,
    },
  };
}

describe("exam-diagnostic-metrics-calculator", () => {
  it("infers canonical math branch from Arabic lesson/prompt keywords", () => {
    expect(inferMathBranchIdForQuestion(makeQuestion({ questionId: "1", displayOrderNumber: 1, lessonTitleArabic: "تطابق المثلثات" }), "هندسة")).toBe("plane_geometry");
    expect(inferMathBranchIdForQuestion(makeQuestion({ questionId: "2", displayOrderNumber: 2, promptArabic: "أوجد ميل الخط المستقيم والبعد بين نقطتين" }), "تحليلية")).toBe("analytic_geometry");
    expect(inferMathBranchIdForQuestion(makeQuestion({ questionId: "3", displayOrderNumber: 3, promptArabic: "أوجد قيمة جا ٣٠ + جتا ٦٠" }), "مثلثات")).toBe("trigonometry");
    expect(inferMathBranchIdForQuestion(makeQuestion({ questionId: "4", displayOrderNumber: 4, lessonTitleArabic: "الوسيط والمنوال" }), "إحصاء")).toBe("statistics_probability");
    expect(inferMathBranchIdForQuestion(makeQuestion({ questionId: "5", displayOrderNumber: 5, lessonTitleArabic: "حل المعادلات التربيعية" }), "جبر")).toBe("algebra");
  });

  it("computes branch mastery, Kelley 27% discrimination, distractor errors, tiers, and remediation plan", () => {
    const q1 = makeQuestion({ questionId: "q1", displayOrderNumber: 1, lessonTitleArabic: "معادلات جبرية", promptArabic: "حل المعادلة ٢س = ٦" });
    const q2 = makeQuestion({ questionId: "q2", displayOrderNumber: 2, lessonTitleArabic: "نظرية فيثاغورس", promptArabic: "مثلث قائم الزاوية" });

    const exam: PublishedOnlineExam = {
      examId: "ex1",
      gradeId: "prep-3",
      gradeNameArabic: "الثالث الإعدادي",
      titleAr: "اختبار شامل",
      durationMinutes: 60,
      availabilityDays: 7,
      publishedAtIso: "2026-11-20T08:00:00.000Z",
      expiresAtIso: "2026-11-27T08:00:00.000Z",
      questions: [q1, q2],
      status: "active",
    };

    const subs: OnlineExamSubmissionRecord[] = [
      makeSubmission({ examId: "ex1", studentCode: "MATH-100001", studentNameAr: "سارة أحمد", pct: 100, items: [{ questionId: "q1", isCorrect: true }, { questionId: "q2", isCorrect: true }] }),
      makeSubmission({ examId: "ex1", studentCode: "MATH-100002", studentNameAr: "عمر طارق", pct: 75, items: [{ questionId: "q1", isCorrect: true }, { questionId: "q2", isCorrect: false }], answers: { q2: { choiceIndex: 2 } } }),
      makeSubmission({ examId: "ex1", studentCode: "MATH-100003", studentNameAr: "يوسف علي", pct: 55, items: [{ questionId: "q1", isCorrect: true }, { questionId: "q2", isCorrect: false }], answers: { q2: { choiceIndex: 2 } } }),
      makeSubmission({ examId: "ex1", studentCode: "MATH-100004", studentNameAr: "كريم خالد", pct: 35, items: [{ questionId: "q1", isCorrect: false }, { questionId: "q2", isCorrect: false }], answers: { q1: { choiceIndex: 1 }, q2: { choiceIndex: 2 } } }),
    ];

    const diagnostics = computeProfessionalExamDiagnostics({
      exams: [exam],
      submissions: subs,
      siblingCodes: new Set(["MATH-100004"]),
    });

    const algebraBranch = diagnostics.branchStats.find((b) => b.branchId === "algebra");
    const geomBranch = diagnostics.branchStats.find((b) => b.branchId === "plane_geometry");
    expect(algebraBranch?.masteryPct).toBe(75);
    expect(geomBranch?.masteryPct).toBe(25);

    const q2Diag = diagnostics.psychometricQuestions.find((q) => q.questionId === "q2")!;
    expect(q2Diag.difficultyIndex).toBe(0.25);
    expect(q2Diag.discriminationIndex).toBe(1);
    expect(q2Diag.distractorBreakdown[0]?.choiceLetterAr).toBe("البديل (جـ)");
    expect(q2Diag.distractorBreakdown[0]?.shareOfErrorsPct).toBe(100);

    expect(diagnostics.studentTiers.excellentCount).toBe(1);
    expect(diagnostics.studentTiers.goodCount).toBe(1);
    expect(diagnostics.studentTiers.needsSupportCount).toBe(1);
    expect(diagnostics.studentTiers.urgentInterventionCount).toBe(1);
    expect(diagnostics.studentTiers.atRiskStudents[0]?.isSibling).toBe(true);
    expect(diagnostics.remediationPlan.some((r) => r.priority === "high")).toBe(true);

    const remedial = buildRemedialWorksheetDirectives({
      weakestQuestions: diagnostics.psychometricQuestions,
    });
    expect(remedial.branchId).toBe("plane_geometry");
    expect(remedial.lessonTitle).toContain("نظرية فيثاغورس");
    expect(remedial.customDirectives).toContain("البديل (جـ)");
  });

  it("computes personal student diagnostics and detects improving performance trend", () => {
    const q1 = makeQuestion({ questionId: "q1", displayOrderNumber: 1, lessonTitleArabic: "التشابه" });
    const exam1: PublishedOnlineExam = {
      examId: "ex1", gradeId: "prep-3", gradeNameArabic: "الثالث الإعدادي", titleAr: "اختبار ١",
      durationMinutes: 60, availabilityDays: 7, publishedAtIso: "2026-11-10T08:00:00.000Z", expiresAtIso: "2026-11-17T08:00:00.000Z",
      questions: [q1], status: "active",
    };
    const exam2: PublishedOnlineExam = { ...exam1, examId: "ex2", titleAr: "اختبار ٢" };

    const subs = [
      makeSubmission({ examId: "ex1", studentCode: "MATH-555555", studentNameAr: "منى حسن", pct: 60, items: [{ questionId: "q1", isCorrect: false }], submittedAtIso: "2026-11-11T08:00:00.000Z" }),
      makeSubmission({ examId: "ex2", studentCode: "MATH-555555", studentNameAr: "منى حسن", pct: 90, items: [{ questionId: "q1", isCorrect: true }], submittedAtIso: "2026-11-15T08:00:00.000Z" }),
    ];

    const summary = computeStudentPersonalDiagnostics({
      studentCode: "MATH-555555",
      exams: [exam1, exam2],
      submissions: subs,
    });

    expect(summary.totalExamsTaken).toBe(2);
    expect(summary.personalAveragePct).toBe(75);
    expect(summary.trendStatus).toBe("improving");
  });
});
