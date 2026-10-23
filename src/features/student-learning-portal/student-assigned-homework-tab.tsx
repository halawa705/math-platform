"use client";

/**
 * @file student-assigned-homework-tab.tsx
 * @description تبويب الواجب التفاعلي في بوابة الطالب: يعرض أحدث واجب نشره المعلم لصف الطالب فقط.
 */

import StudentHomeworkInteractiveSolver from "@/features/homework-drills-hub/student-homework-interactive-solver";

export const MODULE_ID_STUDENT_ASSIGNED_HOMEWORK_TAB =
  "student_assigned_homework_tab" as const;

export default function StudentAssignedHomeworkTab({
  gradeId,
}: {
  readonly gradeId?: string;
}) {
  return <StudentHomeworkInteractiveSolver gradeId={gradeId} />;
}
