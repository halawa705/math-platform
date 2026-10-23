"use client";

/**
 * @file student-assigned-booklets-tab.tsx
 * @description تبويب مذكرات الشرح وكبسولات المراجعة النهائية المخصصة للطالب بصيغة A4 PDF.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import React from "react";
import Link from "next/link";

export const MODULE_ID_STUDENT_ASSIGNED_BOOKLETS_TAB =
  "student_assigned_booklets_tab" as const;

const STUDENT_BOOKLETS = [
  {
    id: "bk_1",
    titleAr: "مذكرة الهندسة المستوية — نظريات المثلث والتوازي",
    branchAr: "هندسة مستوية",
    pagesAr: "٢ صفحة A4 مضغوطة",
  },
  {
    id: "bk_2",
    titleAr: "كبسولة قوانين حساب المثلثات والنسب الأساسية",
    branchAr: "حساب مثلثات",
    pagesAr: "١ صفحة A4 مركزة",
  },
] as const;

export default function StudentAssignedBookletsTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {STUDENT_BOOKLETS.map((bk) => (
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
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              {bk.pagesAr} • خط المراعي واضح للهاتف والطباعة
            </p>
          </div>
          <Link
            href="/studio"
            className="min-h-[42px] rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black flex items-center justify-center gap-1.5"
          >
            <span>📄</span>
            <span>معاينة وتحميل المذكرة A4</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
