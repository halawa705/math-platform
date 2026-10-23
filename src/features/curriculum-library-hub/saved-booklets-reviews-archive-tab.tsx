"use client";

/**
 * @file saved-booklets-reviews-archive-tab.tsx
 * @description تبويب أرشيف المذكرات والمراجعات والاختبارات المحفوظة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import React from "react";
import Link from "next/link";

export const MODULE_ID_SAVED_BOOKLETS_REVIEWS_ARCHIVE_TAB =
  "saved_booklets_reviews_archive_tab" as const;

const ARCHIVED_DOCUMENTS = [
  {
    id: "arch_1",
    titleAr: "مذكرة الهندسة المستوية — القطعة الواصلة بين منتصفي ضلعين",
    branchAr: "هندسة مستوية",
    gradeAr: "الصف الثالث الإعدادي",
    pagesCount: 2,
    fontUsed: "خط المراعي 12.5pt",
  },
  {
    id: "arch_2",
    titleAr: "اختبار تقييمي رسمي — العلاقات والدوال التربيعية",
    branchAr: "جبر ودوال",
    gradeAr: "الصف الثالث الإعدادي",
    pagesCount: 1,
    fontUsed: "خط كايرو 12pt",
  },
  {
    id: "arch_3",
    titleAr: "كبسولة المراجعة النهائية — حساب المثلثات ونظرية إقليدس",
    branchAr: "حساب مثلثات",
    gradeAr: "الصف الأول الثانوي",
    pagesCount: 2,
    fontUsed: "خط المراعي 12pt",
  },
] as const;

export default function SavedBookletsReviewsArchiveTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {ARCHIVED_DOCUMENTS.map((doc) => (
        <div
          key={doc.id}
          className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300">
                {doc.branchAr}
              </span>
              <span className="text-slate-400">{doc.pagesCount} صفحة A4</span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
              {doc.titleAr}
            </h4>
            <p className="text-xs font-bold text-slate-500">
              {doc.gradeAr} • {doc.fontUsed}
            </p>
          </div>

          <Link
            href="/studio"
            className="min-h-[40px] w-full rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-200 text-xs font-black flex items-center justify-center gap-1"
          >
            <span>🖨️</span>
            <span>فتح في استوديو المعاينة والطباعة</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
