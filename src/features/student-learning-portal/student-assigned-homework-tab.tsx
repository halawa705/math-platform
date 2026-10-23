"use client";

/**
 * @file student-assigned-homework-tab.tsx
 * @description تبويب الواجب التفاعلي في بوابة الطالب: يستدعي `student-homework-interactive-solver.tsx`
 * ليعرض أحدث واجب قام المعلم بتوليده ونشره عبر NotebookLM ومستكشف المنهج.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 50 سطراً).
 */

import StudentHomeworkInteractiveSolver from "@/features/homework-drills-hub/student-homework-interactive-solver";

export const MODULE_ID_STUDENT_ASSIGNED_HOMEWORK_TAB =
  "student_assigned_homework_tab" as const;

export default function StudentAssignedHomeworkTab() {
  return <StudentHomeworkInteractiveSolver />;
}
