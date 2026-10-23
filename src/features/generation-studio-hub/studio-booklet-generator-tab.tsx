"use client";

/**
 * @file studio-booklet-generator-tab.tsx
 * @description تبويب إعداد مذكرة شرح الدرس الشاملة بالمراحل الثلاث داخل استوديو التوليد الموحد.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import React, { useState } from "react";

export const MODULE_ID_STUDIO_BOOKLET_GENERATOR_TAB =
  "studio_booklet_generator_tab" as const;

export interface StudioBookletGeneratorTabProps {
  readonly lessonTitle: string;
  readonly branchNameAr: string;
  readonly onApplyBookletTitleToSheet: (newTitle: string) => void;
}

const BOOKLET_THREE_STAGES = [
  {
    stageNum: 1,
    titleAr: "المرحلة ١: التأسيس والمفاهيم والنظريات",
    descAr: "تعريف المصطلحات، القوانين المؤطرة، وشروط تطبيق النظرية الهندسية أو الجبرية.",
  },
  {
    stageNum: 2,
    titleAr: "المرحلة ٢: الأمثلة المحلولة المتدرجة + حاول بنفسك",
    descAr: "أمثلة محلولة بالخطوات الكاملة يلي كل مثال تدريب فوري موازٍ للطالب.",
  },
  {
    stageNum: 3,
    titleAr: "المرحلة ٣: بنك التدريبات المتدرج والواجب المنزلي",
    descAr: "أسئلة اختر، أكمل، ومسائل برهان مرتبة من المباشر إلى المستويات العليا.",
  },
] as const;

export default function StudioBookletGeneratorTab({
  lessonTitle,
  branchNameAr,
  onApplyBookletTitleToSheet,
}: StudioBookletGeneratorTabProps) {
  const [activeStage, setActiveStage] = useState<number>(1);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            📘 إعداد مذكرة شرح الدرس (نظام المراحل الثلاث)
          </h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {branchNameAr} — {lessonTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onApplyBookletTitleToSheet(`مذكرة شرح وتدريبات: ${lessonTitle}`)
          }
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black cursor-pointer"
        >
          معاينة كمذكرة شرح في A4 ⬅
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {BOOKLET_THREE_STAGES.map((st) => {
          const isSelected = st.stageNum === activeStage;
          return (
            <button
              key={st.stageNum}
              type="button"
              onClick={() => setActiveStage(st.stageNum)}
              className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                isSelected
                  ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/30"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              }`}
            >
              <div className="text-xs font-black text-slate-900 dark:text-white mb-1">
                {st.titleAr}
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                {st.descAr}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
