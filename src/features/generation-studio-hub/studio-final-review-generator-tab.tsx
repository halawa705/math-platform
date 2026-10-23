"use client";

/**
 * @file studio-final-review-generator-tab.tsx
 * @description تبويب إعداد المراجعة النهائية ومراجعة الشهر داخل استوديو التوليد الموحد.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useState } from "react";

export const MODULE_ID_STUDIO_FINAL_REVIEW_GENERATOR_TAB =
  "studio_final_review_generator_tab" as const;

export interface StudioFinalReviewGeneratorTabProps {
  readonly branchNameAr: string;
  readonly onApplyReviewTitleToSheet: (newTitle: string) => void;
}

export default function StudioFinalReviewGeneratorTab({
  branchNameAr,
  onApplyReviewTitleToSheet,
}: StudioFinalReviewGeneratorTabProps) {
  const [reviewScope, setReviewScope] = useState<"monthly" | "final_night">(
    "final_night"
  );

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            🏆 كبسولة المراجعة النهائية ومراجعة الشهر ({branchNameAr})
          </h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            تجميع القوانين والنظريات وأهم مسائل الامتحانات في أقل عدد من الأوراق
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onApplyReviewTitleToSheet(
              reviewScope === "final_night"
                ? `المراجعة النهائية الشاملة — ${branchNameAr}`
                : `مراجعة اختبار الشهر — ${branchNameAr}`
            )
          }
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black cursor-pointer"
        >
          تطبيق قالب المراجعة على الورقة ⬅
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setReviewScope("final_night")}
          className={`p-3 rounded-xl border text-right cursor-pointer ${
            reviewScope === "final_night"
              ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30"
              : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="text-xs font-black">🌟 مراجعة ليلة الامتحان الشاملة</div>
          <div className="text-[11px] font-bold text-slate-500 mt-0.5">
            ملخص النظريات + أهم مسائل البرهان المتوقعة بنظام العمودين المضغوط
          </div>
        </button>
        <button
          type="button"
          onClick={() => setReviewScope("monthly")}
          className={`p-3 rounded-xl border text-right cursor-pointer ${
            reviewScope === "monthly"
              ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30"
              : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="text-xs font-black">📅 مراجعة مقرر الشهر السريعة</div>
          <div className="text-[11px] font-bold text-slate-500 mt-0.5">
            تغطية مركزة لوحدات الشهر في ورقة A4 واحدة وجه وظهر
          </div>
        </button>
      </div>
    </div>
  );
}
