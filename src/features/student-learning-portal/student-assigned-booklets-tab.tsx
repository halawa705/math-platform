"use client";

/**
 * @file student-assigned-booklets-tab.tsx
 * @description تبويب المذكرات والمراجعات الحقيقية المحفوظة من المعلم لصف الطالب (من خزينة المنصة السحابية)،
 * مع فتح المذكرة ومعاينتها وطباعتها مباشرة داخل الموقع دون مغادرة المنصة.
 */

import { useEffect, useState } from "react";
import { loadEnabledGradesSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  loadOvermathDriveArchive,
  pullVaultArchiveFromSupabaseCloud,
  type OvermathDriveArchivedRecord,
} from "@/features/curriculum-library-hub/overmath-google-drive-vault";
import DriveArchivePreviewModal from "@/features/curriculum-library-hub/drive-archive-preview-modal";

export const MODULE_ID_STUDENT_ASSIGNED_BOOKLETS_TAB =
  "student_assigned_booklets_tab" as const;

export default function StudentAssignedBookletsTab({
  gradeId,
}: {
  readonly gradeId?: string;
}) {
  const [records, setRecords] = useState<readonly OvermathDriveArchivedRecord[]>([]);
  const [previewRecord, setPreviewRecord] = useState<OvermathDriveArchivedRecord | null>(null);

  useEffect(() => {
    const gradeName = loadEnabledGradesSSOT().find((g) => g.id === gradeId)?.nameArabic;
    const filterForStudent = (all: readonly OvermathDriveArchivedRecord[]) =>
      all.filter(
        (r) =>
          r.docKind !== "exam" && (!gradeName || r.gradeAr === gradeName)
      );

    setRecords(filterForStudent(loadOvermathDriveArchive()));
    void pullVaultArchiveFromSupabaseCloud().then((merged) => {
      setRecords(filterForStudent(merged));
    });
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {records.map((bk) => (
          <div
            key={bk.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/15 text-teal-800 dark:text-teal-300 text-[11px] font-black">
                  {bk.branchAr}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {bk.pagesCount} صفحة
                </span>
              </div>
              <h4 className="text-sm font-black mt-1.5 text-slate-900 dark:text-white">
                {bk.titleAr}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setPreviewRecord(bk)}
              className="min-h-[42px] rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>📄</span>
              <span>فتح ومعاينة المذكرة</span>
            </button>
          </div>
        ))}
      </div>

      <DriveArchivePreviewModal
        record={previewRecord}
        onClose={() => setPreviewRecord(null)}
      />
    </>
  );
}
