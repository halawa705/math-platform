/**
 * @file studio-exam-flow-choice-banner.tsx
 * @description بطاقة ذرية تتيح للمعلم الاختيار بين مسار تصيير الـ PDF ومسار نشر الاختبار أونلاين بعد استخراج الأسئلة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

"use client";

import React from "react";

export interface StudioExamFlowChoiceBannerProps {
  readonly questionsCount: number;
  readonly onRenderPdf: () => void;
  readonly targetAnchorId?: string;
}

export default function StudioExamFlowChoiceBanner({
  questionsCount,
  onRenderPdf,
  targetAnchorId = "online-publish-section",
}: StudioExamFlowChoiceBannerProps) {
  if (questionsCount <= 0) return null;

  return (
    <div className="p-3.5 rounded-2xl bg-indigo-50/95 dark:bg-slate-800/95 border border-indigo-200 dark:border-indigo-800 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between gap-2 text-xs font-black text-indigo-950 dark:text-teal-200">
        <span>✨ تم استخراج {questionsCount} أسئلة بنجاح! اختر نوع ومسار الاختبار:</span>
        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
          {questionsCount} سؤال
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onRenderPdf}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black shadow-sm cursor-pointer transition-colors"
        >
          <span>📄 تصيير كـ PDF ومعاينة ورقة الاختبار</span>
        </button>
        <a
          href={`#${targetAnchorId}`}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-sm cursor-pointer transition-colors text-center"
        >
          <span>⚡ نشر كاختبار أونلاين للطلاب</span>
        </a>
      </div>
    </div>
  );
}
