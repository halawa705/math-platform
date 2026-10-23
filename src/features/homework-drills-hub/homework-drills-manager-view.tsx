"use client";

/**
 * @file homework-drills-manager-view.tsx
 * @description واجهة إدارة ومعاينة الواجبات التفاعلية للمعلم:
 * تجمع باني الواجب المربوط بمستكشف المنهج وNotebookLM (`homework-assignment-builder.tsx`)
 * مع معاينة حية لما يراه الطالب في بوابته (`student-homework-interactive-solver.tsx`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import { useState } from "react";
import HomeworkAssignmentBuilder from "./homework-assignment-builder";
import StudentHomeworkInteractiveSolver from "./student-homework-interactive-solver";

export const MODULE_ID_HOMEWORK_DRILLS_MANAGER_VIEW =
  "homework_drills_manager_view" as const;

export default function HomeworkDrillsManagerView() {
  const [refreshKey, setRefreshKey] = useState<number>(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <div className="lg:col-span-6">
        <HomeworkAssignmentBuilder
          onHomeworkPublished={() => setRefreshKey((prev) => prev + 1)}
        />
      </div>
      <div className="lg:col-span-6">
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-xs font-black text-teal-800 dark:text-teal-300 px-1">
            👁️ معاينة حية لما يراه الطالب أونلاين على هاتفه فور النشر:
          </div>
          <StudentHomeworkInteractiveSolver key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
