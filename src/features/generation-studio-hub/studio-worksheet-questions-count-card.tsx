"use client";

/**
 * @file studio-worksheet-questions-count-card.tsx
 * @description بطاقة التحكم الذرية في أعداد أسئلة ورقة العمل (اختر ومقالي) وزمن الحل ومساحات الإجابة المنقطة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";

export const MODULE_ID_STUDIO_WORKSHEET_QUESTIONS_COUNT_CARD =
  "studio_worksheet_questions_count_card" as const;

export interface StudioWorksheetQuestionsCountCardProps {
  readonly mcqCount: number;
  readonly mcqEnabled: boolean;
  readonly essayCount: number;
  readonly essayEnabled: boolean;
  readonly durationMinutes: number;
  readonly includeAnswerLines: boolean;
  readonly onToggleMcq: (enabled: boolean) => void;
  readonly onChangeMcqCount: (count: number) => void;
  readonly onToggleEssay: (enabled: boolean) => void;
  readonly onChangeEssayCount: (count: number) => void;
  readonly onChangeDuration: (duration: number) => void;
  readonly onToggleAnswerLines: (include: boolean) => void;
}

export default function StudioWorksheetQuestionsCountCard({
  mcqCount,
  mcqEnabled,
  essayCount,
  essayEnabled,
  durationMinutes,
  includeAnswerLines,
  onToggleMcq,
  onChangeMcqCount,
  onToggleEssay,
  onChangeEssayCount,
  onChangeDuration,
  onToggleAnswerLines,
}: StudioWorksheetQuestionsCountCardProps) {
  const effectiveMcq = mcqEnabled ? mcqCount : 0;
  const effectiveEssay = essayEnabled ? essayCount : 0;
  const summaryAr = `${effectiveMcq} اختر • ${effectiveEssay} مقالي • ${durationMinutes} دقيقة`;

  return (
    <StudioCollapsibleSectionCard icon="🔢" titleAr="أعداد الأسئلة ومساحات الحل" summaryAr={summaryAr}>
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-black text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={mcqEnabled}
                onChange={(e) => onToggleMcq(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span>اختر من متعدد (MCQ)</span>
            </label>
            <input
              type="number"
              min={0}
              disabled={!mcqEnabled}
              value={mcqCount}
              onChange={(e) => onChangeMcqCount(Math.max(0, parseInt(e.target.value || "0", 10)))}
              className="w-full min-h-[40px] px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-center disabled:opacity-40"
            />
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-black text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={essayEnabled}
                onChange={(e) => onToggleEssay(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span>أسئلة مقالية وبرهان</span>
            </label>
            <input
              type="number"
              min={0}
              disabled={!essayEnabled}
              value={essayCount}
              onChange={(e) => onChangeEssayCount(Math.max(0, parseInt(e.target.value || "0", 10)))}
              className="w-full min-h-[40px] px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-center disabled:opacity-40"
            />
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
            <div className="text-xs font-black text-slate-700 dark:text-slate-300">
              <span>الزمن المقترح للحل (د)</span>
            </div>
            <input
              type="number"
              min={5}
              value={durationMinutes}
              onChange={(e) => onChangeDuration(Math.max(5, parseInt(e.target.value || "25", 10)))}
              className="w-full min-h-[40px] px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-center"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={includeAnswerLines}
              onChange={(e) => onToggleAnswerLines(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>✍️ تضمين مساحات أسطر منقطة للحل داخل الورقة المطبوعة (Answer Lines)</span>
          </label>
        </div>
      </div>
    </StudioCollapsibleSectionCard>
  );
}
