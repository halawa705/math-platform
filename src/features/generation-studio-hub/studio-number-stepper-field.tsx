"use client";

/**
 * @file studio-number-stepper-field.tsx
 * @description حقل رقمي بأزرار (+ / −) كبيرة سهلة اللمس (≥ 44px) بدلاً من خانات الأرقام الصغيرة على الهاتف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

export const MODULE_ID_STUDIO_NUMBER_STEPPER_FIELD =
  "studio_number_stepper_field" as const;

export interface StudioNumberStepperFieldProps {
  readonly labelAr: string;
  readonly value: number;
  readonly min?: number;
  readonly max?: number;
  readonly onChange: (next: number) => void;
}

export default function StudioNumberStepperField({
  labelAr,
  value,
  min = 0,
  max = 99,
  onChange,
}: StudioNumberStepperFieldProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5">
      <div className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1.5 leading-tight">
        {labelAr}
      </div>
      <div className="flex items-center justify-between gap-1.5">
        <button
          type="button"
          aria-label="زيادة"
          onClick={() => onChange(clamp(value + 1))}
          className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-black text-indigo-900 dark:text-teal-300 cursor-pointer active:scale-95"
        >
          +
        </button>
        <span className="flex-1 text-center text-lg font-black font-mono text-slate-900 dark:text-white">
          {value}
        </span>
        <button
          type="button"
          aria-label="إنقاص"
          onClick={() => onChange(clamp(value - 1))}
          className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-black text-indigo-900 dark:text-teal-300 cursor-pointer active:scale-95"
        >
          −
        </button>
      </div>
    </div>
  );
}
