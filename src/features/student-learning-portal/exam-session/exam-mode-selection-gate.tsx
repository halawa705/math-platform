"use client";

/**
 * @file exam-mode-selection-gate.tsx
 * @description شاشة اختيار وضع أداء الاختبار قبل البدء («وضع الاختبار» أو «وضع التدريب باتجاه واحد»):
 * تعرض شرح كل وضع بوضوح، وتثبّت اختيار الطالب لهذا الاختبار فقط دون التأثير على الاختبارات القادمة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { OnlineExamSessionMode } from "@/core/auth/exam-attempt-state-server-store";
import ExamExpiryCountdownPill from "@/features/electronic-exams-hub/exam-expiry-countdown-pill";

export const MODULE_ID_EXAM_MODE_SELECTION_GATE =
  "exam_mode_selection_gate" as const;

export interface ExamModeSelectionGateProps {
  readonly examTitleAr: string;
  readonly questionsCount: number;
  readonly durationMinutes: number;
  readonly expiresAtIso: string;
  readonly startingMode: OnlineExamSessionMode | null;
  readonly onSelectMode: (mode: OnlineExamSessionMode) => void;
}

export default function ExamModeSelectionGate({
  examTitleAr,
  questionsCount,
  durationMinutes,
  expiresAtIso,
  startingMode,
  onSelectMode,
}: ExamModeSelectionGateProps) {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-teal-300 text-xs font-black">
          <span>🎯</span>
          <span>اختر نظام الحل المناسب لك لهذا الاختبار</span>
        </div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          {examTitleAr} ({questionsCount} أسئلة)
        </h2>
        <div className="flex justify-center">
          <ExamExpiryCountdownPill
            durationMinutes={durationMinutes}
            expiresAtIso={expiresAtIso}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <button
          type="button"
          disabled={startingMode !== null}
          onClick={() => onSelectMode("exam")}
          className="text-right p-4 sm:p-5 rounded-3xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/25 hover:border-indigo-500 transition-all space-y-2.5 cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-black text-indigo-950 dark:text-indigo-200">
              📝 وضع الاختبار الرسمي
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-900 text-white text-[10px] font-black">
              مرن بالمراجعة
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
            يمكنك التنقل بحرية بين أرقام الأسئلة وتعديل إجاباتك في أي وقت قبل التسليم النهائي (تظهر الأسئلة المحلولة باللون الأخضر وغير المحلولة باهتة)، وتظهر الإجابات الصحيحة وخطوات الحل كاملة بعد انتهاء الاختبار.
          </p>
          <div className="pt-1 text-xs font-black text-indigo-700 dark:text-teal-300">
            {startingMode === "exam" ? "⏳ جارٍ بدء وضع الاختبار..." : "ابدأ الآن بوضع الاختبار ⬅"}
          </div>
        </button>

        <button
          type="button"
          disabled={startingMode !== null}
          onClick={() => onSelectMode("training")}
          className="text-right p-4 sm:p-5 rounded-3xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/25 hover:border-teal-500 transition-all space-y-2.5 cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-black text-teal-950 dark:text-teal-200">
              ⚡ وضع التدريب الفوري
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-700 text-white text-[10px] font-black">
              اتجاه واحد
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
            تظهر لك الإجابة الصحيحة وخطوات الحل فور تأكيد إجابة كل سؤال (حدود خضراء للصح وحمراء للخطأ)، ولا يمكن الرجوع لتعديل أي سؤال سابق تم تأكيده.
          </p>
          <div className="pt-1 text-xs font-black text-teal-700 dark:text-teal-300">
            {startingMode === "training" ? "⏳ جارٍ بدء وضع التدريب..." : "ابدأ الآن بوضع التدريب ⬅"}
          </div>
        </button>
      </div>

      <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 text-[11px] sm:text-xs font-bold text-amber-950 dark:text-amber-200 leading-relaxed">
        📌 <strong>قواعد المحاولة:</strong> يُثبَّت اختيارك في هذا الاختبار فقط ولا يمكن تغييره بعد البدء، وتظهر لك هذه الشاشة مجدداً في كل اختبار قادم لتجربة ما يناسبك. كما تُحتسب الدرجة الرسمية من <strong>المحاولة الأولى فقط</strong> ويمكنك بعدها إعادة التدرب بأي عدد من المرات دون تغيير درجتك.
      </div>
    </div>
  );
}
