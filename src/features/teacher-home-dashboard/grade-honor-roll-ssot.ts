/**
 * @file grade-honor-roll-ssot.ts
 * @description المصدر الموحد لإحصائيات أداء الصفوف وقاعة المتميزين (أفضل ٣ طلاب في كل صف دراسي على حدة بدون تداخل).
 * يُقرأ منه في الصفحة الرئيسية للمعلم (مع إمكانية استعراض كل صف)، وفي الصفحة الرئيسية للطالب (يعرض صف الطالب فقط).
 */

export interface HonorStudentEntry {
  readonly rank: 1 | 2 | 3;
  readonly studentNameAr: string;
  readonly studentCode: string;
  readonly gradeId: string;
  readonly averagePercentage: number;
  readonly examsCompleted: number;
}

export interface GradeAnalyticsMetric {
  readonly gradeId: string;
  readonly gradeNameAr: string;
  readonly registeredCount: number;
  readonly completedExamsCount: number;
  readonly unreviewedSubmissionsCount: number;
  readonly averageScorePercentage: number;
  readonly topThreeHonorRoll: readonly HonorStudentEntry[];
}

export const GRADE_ANALYTICS_AND_HONOR_ROLL_SSOT: Readonly<
  Record<string, GradeAnalyticsMetric>
> = {
  "prim-3": {
    gradeId: "prim-3",
    gradeNameAr: "الصف الثالث الابتدائي",
    registeredCount: 28,
    completedExamsCount: 24,
    unreviewedSubmissionsCount: 2,
    averageScorePercentage: 91,
    topThreeHonorRoll: [
      { rank: 1, studentNameAr: "مريم طارق عبد الله", studentCode: "1101", gradeId: "prim-3", averagePercentage: 99, examsCompleted: 5 },
      { rank: 2, studentNameAr: "عمر خالد محمود", studentCode: "1102", gradeId: "prim-3", averagePercentage: 96, examsCompleted: 5 },
      { rank: 3, studentNameAr: "جنى أحمد سعيد", studentCode: "1103", gradeId: "prim-3", averagePercentage: 94, examsCompleted: 4 },
    ],
  },
  "prim-4": {
    gradeId: "prim-4",
    gradeNameAr: "الصف الرابع الابتدائي",
    registeredCount: 34,
    completedExamsCount: 29,
    unreviewedSubmissionsCount: 1,
    averageScorePercentage: 88,
    topThreeHonorRoll: [
      { rank: 1, studentNameAr: "يوسف وائل حسن", studentCode: "1201", gradeId: "prim-4", averagePercentage: 98, examsCompleted: 6 },
      { rank: 2, studentNameAr: "سلمى هشام كمال", studentCode: "1202", gradeId: "prim-4", averagePercentage: 95, examsCompleted: 6 },
      { rank: 3, studentNameAr: "آدم سامح فؤاد", studentCode: "1203", gradeId: "prim-4", averagePercentage: 92, examsCompleted: 5 },
    ],
  },
  "prim-5": {
    gradeId: "prim-5",
    gradeNameAr: "الصف الخامس الابتدائي",
    registeredCount: 31,
    completedExamsCount: 27,
    unreviewedSubmissionsCount: 0,
    averageScorePercentage: 89,
    topThreeHonorRoll: [
      { rank: 1, studentNameAr: "نور الدين محمد", studentCode: "1301", gradeId: "prim-5", averagePercentage: 97, examsCompleted: 5 },
      { rank: 2, studentNameAr: "حبيبة علاء الدين", studentCode: "1302", gradeId: "prim-5", averagePercentage: 95, examsCompleted: 5 },
      { rank: 3, studentNameAr: "كريم تامر نبيل", studentCode: "1303", gradeId: "prim-5", averagePercentage: 91, examsCompleted: 5 },
    ],
  },
  "prim-6": {
    gradeId: "prim-6",
    gradeNameAr: "الصف السادس الابتدائي",
    registeredCount: 40,
    completedExamsCount: 37,
    unreviewedSubmissionsCount: 3,
    averageScorePercentage: 93,
    topThreeHonorRoll: [
      { rank: 1, studentNameAr: "فريدة أيمن الشافعي", studentCode: "1401", gradeId: "prim-6", averagePercentage: 100, examsCompleted: 7 },
      { rank: 2, studentNameAr: "حمزة مصطفى كامل", studentCode: "1402", gradeId: "prim-6", averagePercentage: 98, examsCompleted: 7 },
      { rank: 3, studentNameAr: "ملك شريف عادل", studentCode: "1403", gradeId: "prim-6", averagePercentage: 96, examsCompleted: 6 },
    ],
  },
  "prep-1": {
    gradeId: "prep-1",
    gradeNameAr: "الصف الأول الإعدادي",
    registeredCount: 45,
    completedExamsCount: 41,
    unreviewedSubmissionsCount: 2,
    averageScorePercentage: 87,
    topThreeHonorRoll: [
      { rank: 1, studentNameAr: "عبد الرحمن ياسر", studentCode: "1501", gradeId: "prep-1", averagePercentage: 98, examsCompleted: 6 },
      { rank: 2, studentNameAr: "لجين حسام الدين", studentCode: "1502", gradeId: "prep-1", averagePercentage: 95, examsCompleted: 6 },
      { rank: 3, studentNameAr: "زياد أشرف منصور", studentCode: "1503", gradeId: "prep-1", averagePercentage: 93, examsCompleted: 6 },
    ],
  },
  "prep-2": {
    gradeId: "prep-2",
    gradeNameAr: "الصف الثاني الإعدادي",
    registeredCount: 38,
    completedExamsCount: 33,
    unreviewedSubmissionsCount: 1,
    averageScorePercentage: 86,
    topThreeHonorRoll: [
      { rank: 1, studentNameAr: "سارة محمود الجندي", studentCode: "1601", gradeId: "prep-2", averagePercentage: 97, examsCompleted: 6 },
      { rank: 2, studentNameAr: "مروان حازم سليم", studentCode: "1602", gradeId: "prep-2", averagePercentage: 94, examsCompleted: 5 },
      { rank: 3, studentNameAr: "ندى إيهاب جلال", studentCode: "1603", gradeId: "prep-2", averagePercentage: 91, examsCompleted: 5 },
    ],
  },
  "prep-3": {
    gradeId: "prep-3",
    gradeNameAr: "الصف الثالث الإعدادي",
    registeredCount: 52,
    completedExamsCount: 49,
    unreviewedSubmissionsCount: 4,
    averageScorePercentage: 95,
    topThreeHonorRoll: [
      { rank: 1, studentNameAr: "أحمد محمد علي", studentCode: "1001", gradeId: "prep-3", averagePercentage: 99, examsCompleted: 8 },
      { rank: 2, studentNameAr: "رقية محمد عبد العزيز", studentCode: "1002", gradeId: "prep-3", averagePercentage: 98, examsCompleted: 8 },
      { rank: 3, studentNameAr: "مازن خالد إبراهيم", studentCode: "1003", gradeId: "prep-3", averagePercentage: 96, examsCompleted: 8 },
    ],
  },
};

export function getGradeAnalyticsAndHonorRollSSOT(
  gradeId: string,
  gradeNameFallback = "الصف الثالث الإعدادي"
): GradeAnalyticsMetric {
  return (
    GRADE_ANALYTICS_AND_HONOR_ROLL_SSOT[gradeId] || {
      gradeId,
      gradeNameAr: gradeNameFallback,
      registeredCount: 25,
      completedExamsCount: 22,
      unreviewedSubmissionsCount: 0,
      averageScorePercentage: 90,
      topThreeHonorRoll: [
        { rank: 1, studentNameAr: "طالب متميز ١", studentCode: "2001", gradeId, averagePercentage: 98, examsCompleted: 4 },
        { rank: 2, studentNameAr: "طالب متميز ٢", studentCode: "2002", gradeId, averagePercentage: 95, examsCompleted: 4 },
        { rank: 3, studentNameAr: "طالب متميز ٣", studentCode: "2003", gradeId, averagePercentage: 92, examsCompleted: 4 },
      ],
    }
  );
}
