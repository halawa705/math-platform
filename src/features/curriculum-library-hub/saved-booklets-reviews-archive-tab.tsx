"use client";

/**
 * @file saved-booklets-reviews-archive-tab.tsx
 * @description تبويب أرشيف المذكرات والمراجعات والاختبارات المربوط بخزينة Google Drive (overmath.math@gmail.com).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL,
  loadOvermathDriveArchive,
  type OvermathDriveArchivedRecord,
} from "./overmath-google-drive-vault";

export const MODULE_ID_SAVED_BOOKLETS_REVIEWS_ARCHIVE_TAB =
  "saved_booklets_reviews_archive_tab" as const;

export default function SavedBookletsReviewsArchiveTab() {
  const [records, setRecords] = useState<readonly OvermathDriveArchivedRecord[]>([]);
  const [filterKind, setFilterKind] = useState<"all" | "booklet" | "final_review" | "exam">("all");

  useEffect(() => {
    setRecords(loadOvermathDriveArchive());
  }, []);

  const filteredRecords = records.filter((r) =>
    filterKind === "all" ? true : r.docKind === filterKind
  );

  return (
    <div className="space-y-4">
      {/* شريط حالة الربط المباشر مع Google Drive لحساب overmath.math@gmail.com */}
      <div className="p-4 rounded-2xl bg-gradient-to-l from-indigo-950 via-slate-900 to-teal-950 text-white border border-teal-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[11px] font-black">
              ☁️ متصل بخزينة Google Drive السحابية
            </span>
            <span className="font-mono text-xs font-bold text-amber-300">
              {OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            جميع المذكرات والمراجعات النهائية والاختبارات المحفوظة تُرفع وتُؤرشف مباشرة في حساب Google Drive المعتمد لتوفير 100% من مساحة Supabase لبيانات ودرجات الطلاب.
          </p>
        </div>

        <a
          href="https://drive.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[42px] px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
        >
          <span>📂</span>
          <span>فتح مجلد Google Drive</span>
        </a>
      </div>

      {/* فلاتر نوع الملف المحفوظ */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "all", label: "الكل" },
          { id: "booklet", label: "📚 المذكرات الدراسية" },
          { id: "final_review", label: "🎯 المراجعات النهائية" },
          { id: "exam", label: "📝 الاختبارات المطبوعة" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterKind(tab.id as any)}
            className={`min-h-[38px] px-3.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              filterKind === tab.id
                ? "bg-indigo-900 text-white dark:bg-teal-600"
                : "bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* شبكة البطاقات المحفوظة في Google Drive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {filteredRecords.map((doc) => (
          <div
            key={doc.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300">
                  {doc.branchAr}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ محفوظ في Drive ({doc.pagesCount} ص)
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                {doc.titleAr}
              </h4>
              <p className="text-xs font-bold text-slate-500">
                {doc.gradeAr} • {doc.fontUsed}
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate" title={doc.driveFolderPathAr}>
                📁 {doc.driveFolderPathAr}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href={doc.driveDownloadUrl}
                className="min-h-[40px] rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-200 text-xs font-black flex items-center justify-center gap-1"
              >
                <span>🖨️</span>
                <span>معاينة وطباعة</span>
              </Link>
              <a
                href={doc.driveViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-800 dark:text-teal-300 text-xs font-black flex items-center justify-center gap-1"
              >
                <span>☁️</span>
                <span>رابط Drive</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
