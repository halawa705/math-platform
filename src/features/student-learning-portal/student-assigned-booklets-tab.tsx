"use client";

/**
 * @file student-assigned-booklets-tab.tsx
 * @description تبويب المذكرات والمراجعات الحقيقية المحفوظة من المعلم لصف الطالب (من أرشيف الخزينة)، بلا أي عناصر وهمية.
 */

import { useEffect, useState } from "react";
import { loadEnabledGradesSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  loadOvermathDriveArchive,
  type OvermathDriveArchivedRecord,
} from "@/features/curriculum-library-hub/overmath-google-drive-vault";

export const MODULE_ID_STUDENT_ASSIGNED_BOOKLETS_TAB =
  "student_assigned_booklets_tab" as const;

export default function StudentAssignedBookletsTab({
  gradeId,
}: {
  readonly gradeId?: string;
}) {
  const [records, setRecords] = useState<readonly OvermathDriveArchivedRecord[]>([]);

  useEffect(() => {
    const gradeName = loadEnabledGradesSSOT().find((g) => g.id === gradeId)?.nameArabic;
    setRecords(
      loadOvermathDriveArchive().filter(
        (r) =>
          r.docKind !== "exam" && (!gradeName || r.gradeAr === gradeName)
      )
    );
  }, [gradeId]);

  if (records.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-1.5">
        <div className="text-2xl">📘</div>
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
          لا توجد مذكرات محفوظة لصفك بعد
        </h3>
        <p className="text-xs font-bold text-slate-500">
          ستظهر المذكرات والمراجعات هنا فور حفظها من المعلم.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {records.map((bk) => (
        <div
          key={bk.id}
          className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3"
        >
          <div>
            <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/15 text-teal-800 dark:text-teal-300 text-[11px] font-black">
              {bk.branchAr}
            </span>
            <h4 className="text-sm font-black mt-1.5 text-slate-900 dark:text-white">
              {bk.titleAr}
            </h4>
          </div>
          <a
            href={bk.driveViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[42px] rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black flex items-center justify-center gap-1.5"
          >
            <span>📄</span>
            <span>فتح المذكرة</span>
          </a>
        </div>
      ))}
    </div>
  );
}
