"use client";

/**
 * @file saved-booklets-reviews-archive-tab.tsx
 * @description تبويب أرشيف المذكرات والمراجعات والاختبارات المربوط بخزينة Google Drive (overmath.math@gmail.com).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import CalmEmptyStateCard from "@/components/global-ui/calm-empty-state-card";
import {
  OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL,
  loadOvermathDriveArchive,
  type OvermathDriveArchivedRecord,
} from "./overmath-google-drive-vault";

export const MODULE_ID_SAVED_BOOKLETS_REVIEWS_ARCHIVE_TAB =
  "saved_booklets_reviews_archive_tab" as const;

type ArchiveFilterKind = "all" | "booklet" | "final_review" | "exam";

const FILTER_PILLS: readonly { readonly id: ArchiveFilterKind; readonly label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "booklet", label: "المذكرات" },
  { id: "final_review", label: "المراجعات" },
  { id: "exam", label: "الاختبارات" },
];

export default function SavedBookletsReviewsArchiveTab() {
  const [records, setRecords] = useState<readonly OvermathDriveArchivedRecord[]>([]);
  const [filterKind, setFilterKind] = useState<ArchiveFilterKind>("all");

  useEffect(() => {
    setRecords(loadOvermathDriveArchive());
  }, []);

  const filteredRecords = records.filter((r) =>
    filterKind === "all" ? true : r.docKind === filterKind
  );

  return (
    <div className="space-y-3">
      {/* حالة الربط المباشر مع Google Drive لحساب overmath.math@gmail.com */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-black">☁️ خزينة Google Drive</div>
          <p
            dir="ltr"
            className="text-[11px] font-bold text-slate-500 truncate text-right"
          >
            {OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL}
          </p>
        </div>
        <a
          href="https://drive.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center shrink-0"
        >
          فتح المجلد ↗
        </a>
      </div>

      {/* فلاتر نوع الملف المحفوظ */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setFilterKind(pill.id)}
            className={`min-h-[44px] px-4 rounded-xl text-xs font-black cursor-pointer transition-colors ${
              filterKind === pill.id
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <CalmEmptyStateCard
          icon="🗂️"
          titleAr="لا توجد ملفات محفوظة بعد"
          hintAr="المذكرات والمراجعات والاختبارات التي تحفظها من الاستوديو تظهر هنا."
        />
      ) : (
        <ul className="space-y-2">
          {filteredRecords.map((doc) => (
            <li
              key={doc.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="space-y-0.5">
                <h4 className="text-sm font-black leading-snug">{doc.titleAr}</h4>
                <p className="text-[11px] font-bold text-slate-500">
                  {doc.branchAr} • {doc.gradeAr} • {doc.pagesCount} ص
                </p>
                <p className="text-[10px] font-bold text-slate-400 truncate" title={doc.driveFolderPathAr}>
                  {doc.driveFolderPathAr}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={doc.driveDownloadUrl}
                  className="min-h-[44px] rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black flex items-center justify-center"
                >
                  معاينة وطباعة
                </Link>
                <a
                  href={doc.driveViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center justify-center"
                >
                  رابط Drive ↗
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
