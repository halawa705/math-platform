"use client";

/**
 * @file homework-drills-manager-view.tsx
 * @description واجهة إدارة ومعاينة الواجبات التفاعلية للمعلم:
 * تجمع باني الواجب المربوط بمستكشف المنهج وNotebookLM (`homework-assignment-builder.tsx`)
 * مع معاينة حية لما يراه الطالب في بوابته (`student-homework-interactive-solver.tsx`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import { useState } from "react";
import StudioCollapsibleSectionCard from "@/features/generation-studio-hub/studio-collapsible-section-card";
import HomeworkAssignmentBuilder from "./homework-assignment-builder";
import StudentHomeworkInteractiveSolver from "./student-homework-interactive-solver";

export const MODULE_ID_HOMEWORK_DRILLS_MANAGER_VIEW =
  "homework_drills_manager_view" as const;

export default function HomeworkDrillsManagerView() {
  const [refreshKey, setRefreshKey] = useState<number>(1);

  return (
    <div className="space-y-3">
      <HomeworkAssignmentBuilder
        onHomeworkPublished={() => setRefreshKey((prev) => prev + 1)}
      />
      <StudioCollapsibleSectionCard
        icon="👁️"
        titleAr="معاينة ما يراه الطالب"
        summaryAr="الواجبات المنشورة كما تظهر على هاتف الطالب"
      >
        <StudentHomeworkInteractiveSolver key={refreshKey} />
      </StudioCollapsibleSectionCard>
    </div>
  );
}
