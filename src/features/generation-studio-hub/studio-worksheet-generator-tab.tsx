"use client";

/**
 * @file studio-worksheet-generator-tab.tsx
 * @description تبويب إعداد ورقة العمل والتطبيق السريع في صفحة واحدة (One-Page A4 Drill).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import React from "react";

export const MODULE_ID_STUDIO_WORKSHEET_GENERATOR_TAB =
  "studio_worksheet_generator_tab" as const;

export interface StudioWorksheetGeneratorTabProps {
  readonly lessonTitle: string;
  readonly onApplyWorksheetTitleToSheet: (newTitle: string) => void;
}

export default function StudioWorksheetGeneratorTab({
  lessonTitle,
  onApplyWorksheetTitleToSheet,
}: StudioWorksheetGeneratorTabProps) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white">
          ⚡ شيت تطبيقي سريع (ورقة A4 واحدة — ميزانية صفحة صارمة)
        </h3>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          مصمم للتوزيع السريع في الحصة أو كواجب منزلي مركز لدرس: {lessonTitle}
        </p>
      </div>
      <button
        type="button"
        onClick={() =>
          onApplyWorksheetTitleToSheet(`ورقة عمل تطبيقية: ${lessonTitle}`)
        }
        className="min-h-[40px] shrink-0 px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black cursor-pointer"
      >
        ضبط كورقة عمل (صفحة واحدة) ⬅
      </button>
    </div>
  );
}
