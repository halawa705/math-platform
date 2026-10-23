/**
 * @file grade-honor-roll-ssot.ts
 * @description المصدر الموحد لإحصائيات أداء الصفوف وقاعة المتميزين الديناميكية الحية:
 * 1. تتحدث أوتوماتيكياً فور انتهاء أي طالب من الاختبار الأونلاين (`recordStudentOnlineExamSubmissionSSOT`).
 * 2. شرط صارم: لا يُدرج في قاعة المتميزين إلا من تخطى نسبة 70% (`percentage >= 70`).
 * 3. تظل قاعة المتميزين ظاهرة طوال بقاء الاختبار نشطاً، وبمجرد أرشفة الاختبار (`archiveActiveOnlineExamForGradeSSOT`)
 *    تختفي فوراً وتنتظر الطلاب الجدد الذين يحصلون على أعلى الدرجات (>= 70%) في الاختبار الجديد.
 */

export const MIN_HONOR_ROLL_PERCENTAGE_SSOT = 70 as const;

export interface HonorStudentEntry {
  readonly rank: 1 | 2 | 3;
  readonly studentNameAr: string;
  readonly studentCode: string;
  readonly gradeId: string;
  readonly averagePercentage: number;
  readonly examsCompleted: number;
  readonly submittedAtIso?: string;
}

export interface OnlineExamSubmissionRecord {
  readonly submissionId: string;
  readonly examId: string;
  readonly examTitleAr: string;
  readonly gradeId: string;
  readonly studentCode: string;
  readonly studentNameAr: string;
  readonly percentageScore: number;
  readonly submittedAtIso: string;
  readonly isReviewedByTeacher: boolean;
}

export interface GradeActiveExamState {
  readonly gradeId: string;
  readonly activeExamId: string;
  readonly activeExamTitleAr: string;
  readonly status: "active" | "archived";
}

export interface GradeAnalyticsMetric {
  readonly gradeId: string;
  readonly gradeNameAr: string;
  readonly registeredCount: number;
  readonly completedExamsCount: number;
  readonly unreviewedSubmissionsCount: number;
  readonly averageScorePercentage: number;
  readonly activeExamStatus: "active" | "archived";
  readonly activeExamTitleAr: string;
  readonly topThreeHonorRoll: readonly HonorStudentEntry[];
}

const SUBMISSIONS_STORAGE_KEY = "math_platform_live_exam_submissions_v1" as const;
const EXAM_STATE_STORAGE_KEY = "math_platform_grade_exam_states_v1" as const;

const INITIAL_SEEDED_SUBMISSIONS: readonly OnlineExamSubmissionRecord[] = [
  {
    submissionId: "sub_prep3_1",
    examId: "exam_active_prep-3",
    examTitleAr: "اختبار الهندسة المستوية — نظريات المثلث",
    gradeId: "prep-3",
    studentCode: "1001",
    studentNameAr: "أحمد محمد علي",
    percentageScore: 98,
    submittedAtIso: "2026-10-23T14:10:00Z",
    isReviewedByTeacher: false,
  },
  {
    submissionId: "sub_prep3_2",
    examId: "exam_active_prep-3",
    examTitleAr: "اختبار الهندسة المستوية — نظريات المثلث",
    gradeId: "prep-3",
    studentCode: "1002",
    studentNameAr: "رقية محمد عبد العزيز",
    percentageScore: 95,
    submittedAtIso: "2026-10-23T14:20:00Z",
    isReviewedByTeacher: false,
  },
  {
    submissionId: "sub_prep3_3",
    examId: "exam_active_prep-3",
    examTitleAr: "اختبار الهندسة المستوية — نظريات المثلث",
    gradeId: "prep-3",
    studentCode: "1003",
    studentNameAr: "مازن خالد إبراهيم",
    percentageScore: 91,
    submittedAtIso: "2026-10-23T14:30:00Z",
    isReviewedByTeacher: true,
  },
  {
    submissionId: "sub_prep3_below70",
    examId: "exam_active_prep-3",
    examTitleAr: "اختبار الهندسة المستوية — نظريات المثلث",
    gradeId: "prep-3",
    studentCode: "1009",
    studentNameAr: "طالب تجريبي (أقل من 70%)",
    percentageScore: 65,
    submittedAtIso: "2026-10-23T14:40:00Z",
    isReviewedByTeacher: false,
  },
];

export function loadAllExamSubmissionsSSOT(): readonly OnlineExamSubmissionRecord[] {
  if (typeof window === "undefined") return INITIAL_SEEDED_SUBMISSIONS;
  try {
    const raw = window.localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) return INITIAL_SEEDED_SUBMISSIONS;
    const parsed = JSON.parse(raw) as OnlineExamSubmissionRecord[];
    return Array.isArray(parsed) ? parsed : INITIAL_SEEDED_SUBMISSIONS;
  } catch {
    return INITIAL_SEEDED_SUBMISSIONS;
  }
}

export function loadGradeExamStatesSSOT(): Readonly<Record<string, GradeActiveExamState>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(EXAM_STATE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, GradeActiveExamState>;
  } catch {
    return {};
  }
}

/**
 * تُستدعى أوتوماتيكياً فور انتهاء الطالب من الاختبار الأونلاين لتحديث قاعة المتميزين فوراً.
 * إذا كان الطالب قد حصل على >= 70% يدخل في المنافسة على المراكز الثلاثة الأولى؛ وإذا كان أقل من 70% يُستبعد تماماً.
 */
export function recordStudentOnlineExamSubmissionSSOT(input: {
  readonly gradeId: string;
  readonly studentCode: string;
  readonly studentNameAr: string;
  readonly percentageScore: number;
  readonly examTitleAr?: string;
}): OnlineExamSubmissionRecord {
  const states = loadGradeExamStatesSSOT();
  const currentState = states[input.gradeId];
  const activeExamId =
    currentState?.status === "active"
      ? currentState.activeExamId
      : `exam_active_${input.gradeId}`;
  const activeExamTitle =
    input.examTitleAr ||
    currentState?.activeExamTitleAr ||
    "الاختبار الإلكتروني النشط";

  // تأكيد أن حالة الاختبار لهذا الصف نشطة عند استلام إجابة جديدة
  if (typeof window !== "undefined") {
    const nextStates: Record<string, GradeActiveExamState> = {
      ...states,
      [input.gradeId]: {
        gradeId: input.gradeId,
        activeExamId,
        activeExamTitleAr: activeExamTitle,
        status: "active",
      },
    };
    window.localStorage.setItem(EXAM_STATE_STORAGE_KEY, JSON.stringify(nextStates));
  }

  const existing = loadAllExamSubmissionsSSOT().filter(
    (s) =>
      !(
        s.gradeId === input.gradeId &&
        s.examId === activeExamId &&
        s.studentCode === input.studentCode
      )
  );

  const newRecord: OnlineExamSubmissionRecord = {
    submissionId: `sub_${Date.now()}`,
    examId: activeExamId,
    examTitleAr: activeExamTitle,
    gradeId: input.gradeId,
    studentCode: input.studentCode,
    studentNameAr: input.studentNameAr,
    percentageScore: Math.round(input.percentageScore),
    submittedAtIso: new Date().toISOString(),
    isReviewedByTeacher: false,
  };

  const updated = [newRecord, ...existing];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
  }
  return newRecord;
}

/**
 * أرشفة الاختبار الحالي لصف معين: تختفي قاعة المتميزين فوراً وتنتظر طلاب الاختبار الجديد (>= 70%).
 */
export function archiveActiveOnlineExamForGradeSSOT(gradeId: string): void {
  if (typeof window === "undefined") return;
  const states = loadGradeExamStatesSSOT();
  const nextStates: Record<string, GradeActiveExamState> = {
    ...states,
    [gradeId]: {
      gradeId,
      activeExamId: `exam_archived_${Date.now()}`,
      activeExamTitleAr: "لا يوجد اختبار نشط (تمت الأرشفة)",
      status: "archived",
    },
  };
  window.localStorage.setItem(EXAM_STATE_STORAGE_KEY, JSON.stringify(nextStates));
}

/**
 * فتح اختبار جديد لصف معين لتبدأ قاعة المتميزين باستقبال الطلاب الجدد الحاصلين على >= 70%.
 */
export function startNewOnlineExamForGradeSSOT(
  gradeId: string,
  examTitleAr: string
): void {
  if (typeof window === "undefined") return;
  const states = loadGradeExamStatesSSOT();
  const nextStates: Record<string, GradeActiveExamState> = {
    ...states,
    [gradeId]: {
      gradeId,
      activeExamId: `exam_active_${gradeId}_${Date.now()}`,
      activeExamTitleAr: examTitleAr,
      status: "active",
    },
  };
  window.localStorage.setItem(EXAM_STATE_STORAGE_KEY, JSON.stringify(nextStates));
}

const BASE_REGISTERED_COUNTS: Readonly<Record<string, number>> = {
  "prim-3": 28,
  "prim-4": 34,
  "prim-5": 31,
  "prim-6": 40,
  "prep-1": 45,
  "prep-2": 38,
  "prep-3": 52,
};

export function getGradeAnalyticsAndHonorRollSSOT(
  gradeId: string,
  gradeNameFallback = "الصف الثالث الإعدادي"
): GradeAnalyticsMetric {
  const states = loadGradeExamStatesSSOT();
  const stateForGrade = states[gradeId] || {
    gradeId,
    activeExamId: `exam_active_${gradeId}`,
    activeExamTitleAr: "اختبار الوحدة النشط",
    status: "active" as const,
  };

  const allGradeSubmissions = loadAllExamSubmissionsSSOT().filter(
    (s) =>
      s.gradeId === gradeId &&
      s.examId === stateForGrade.activeExamId
  );

  const registeredCount = BASE_REGISTERED_COUNTS[gradeId] ?? 30;
  const completedExamsCount = allGradeSubmissions.length;
  const unreviewedSubmissionsCount = allGradeSubmissions.filter(
    (s) => !s.isReviewedByTeacher
  ).length;

  const averageScorePercentage =
    completedExamsCount > 0
      ? Math.round(
          allGradeSubmissions.reduce((acc, s) => acc + s.percentageScore, 0) /
            completedExamsCount
        )
      : 0;

  // إذا كان الاختبار مؤرشفاً، تختفي قاعة المتميزين فوراً وتنتظر الاختبار الجديد
  if (stateForGrade.status === "archived") {
    return {
      gradeId,
      gradeNameAr: gradeNameFallback,
      registeredCount,
      completedExamsCount: 0,
      unreviewedSubmissionsCount: 0,
      averageScorePercentage: 0,
      activeExamStatus: "archived",
      activeExamTitleAr: stateForGrade.activeExamTitleAr,
      topThreeHonorRoll: [],
    };
  }

  // فلترة صارمة: فقط الطلاب الذين حصلوا على نسبة > 70% (أو >= 70%)
  const eligibleAbove70 = allGradeSubmissions
    .filter((s) => s.percentageScore >= MIN_HONOR_ROLL_PERCENTAGE_SSOT)
    .sort((a, b) => b.percentageScore - a.percentageScore)
    .slice(0, 3);

  const topThreeHonorRoll: HonorStudentEntry[] = eligibleAbove70.map(
    (sub, idx) => ({
      rank: (idx + 1) as 1 | 2 | 3,
      studentNameAr: sub.studentNameAr,
      studentCode: sub.studentCode,
      gradeId: sub.gradeId,
      averagePercentage: sub.percentageScore,
      examsCompleted: 1,
      submittedAtIso: sub.submittedAtIso,
    })
  );

  return {
    gradeId,
    gradeNameAr: gradeNameFallback,
    registeredCount,
    completedExamsCount,
    unreviewedSubmissionsCount,
    averageScorePercentage,
    activeExamStatus: "active",
    activeExamTitleAr: stateForGrade.activeExamTitleAr,
    topThreeHonorRoll,
  };
}
