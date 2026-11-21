"use client";

/**
 * @file student-assigned-homework-tab.tsx
 * @description تبويب الواجب التفاعلي في بوابة الطالب: يعرض أحدث واجب نشره المعلم لصف الطالب فقط،
 * مع شريط تركيز ذكي يبرز الدرس الأضعف لدى الطالب من واقع اختباراته ليركز عليه أثناء الحل.
 */

import { useMemo } from "react";
import StudentHomeworkInteractiveSolver from "@/features/homework-drills-hub/student-homework-interactive-solver";
import { analyzeStudentPersonalDiagnosticsSSOT } from "@/features/teacher-home-dashboard/exam-strengths-weaknesses-analyzer";

export const MODULE_ID_STUDENT_ASSIGNED_HOMEWORK_TAB =
  "student_assigned_homework_tab" as const;

export default function StudentAssignedHomeworkTab({
  gradeId,
  studentCode,
}: {
  readonly gradeId?: string;
  readonly studentCode?: string;
}) {
  const topWeakLesson = useMemo(() => {
    if (!studentCode) return null;
    const summary = analyzeStudentPersonalDiagnosticsSSOT(studentCode, gradeId || "");
    return summary.weaknessLessons[0] ?? null;
  }, [studentCode, gradeId]);

  return (
    <div className="space-y-3">
      {topWeakLesson && (
        <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/70 text-xs font-black text-amber-950 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2">
          <span>
            🎯 تركيز مقترح لك قبل الحل: درس «{topWeakLesson.lessonTitleAr}» (إتقانك الحالي{" "}
            {topWeakLesson.masteryPct}٪)
          </span>
          <span className="text-[11px] font-bold opacity-85">
            راجع خطوات الحل أسفل كل سؤال لرفع مستواك 📈
          </span>
        </div>
      )}
      <StudentHomeworkInteractiveSolver gradeId={gradeId} />
    </div>
  );
}
