"use client";

/**
 * @file studio-exam-questions-shuffle-bar.tsx
 * @description شريط أزرار الخلط العشوائي لأسئلة وبدائل الاختبار التقييمي والإلكتروني.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import React from "react";

export interface StudioExamQuestionsShuffleBarProps {
  readonly onShuffleQuestionsOrder: () => void;
  readonly onShuffleMcqChoices: () => void;
  readonly onShuffleBoth: () => void;
  readonly mcqCount: number;
}

export default function StudioExamQuestionsShuffleBar({
  onShuffleQuestionsOrder,
  onShuffleMcqChoices,
  onShuffleBoth,
  mcqCount,
}: StudioExamQuestionsShuffleBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
      <div className="flex items-center gap-1.5 font-black text-slate-700 dark:text-slate-300">
        <span>🎲</span>
        <span>الخلط العشوائي والتنويع:</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onShuffleQuestionsOrder}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1 shadow-2xs"
          title="تغيير أرقام وترتيب الأسئلة عشوائياً مع بقاء أسئلة اختر أولاً والمقالي ثانياً"
        >
          <span>🔀</span>
          <span>خلط ترتيب الأسئلة</span>
        </button>
        {mcqCount > 0 && (
          <button
            type="button"
            onClick={onShuffleMcqChoices}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1 shadow-2xs"
            title="تغيير أماكن البدائل (أ، ب، جـ، د) عشوائياً مع تحديث الإجابة الصحيحة تلقائياً"
          >
            <span>🎲</span>
            <span>خلط أماكن الخيارات</span>
          </button>
        )}
        <button
          type="button"
          onClick={onShuffleBoth}
          className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-black hover:bg-teal-100 cursor-pointer flex items-center gap-1 shadow-2xs"
          title="خلط ترتيب الأسئلة وبدائل الخيارات معاً بنقرة واحدة"
        >
          <span>⚡</span>
          <span>خلط شامل</span>
        </button>
      </div>
    </div>
  );
}
