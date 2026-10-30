"use client";

/**
 * @file studio-number-stepper-field.tsx
 * @description حقل رقمي ذكي يتيح الكتابة المباشرة بالكيبورد + أزرار (+ / −) للمس + تشيك بوكس اختياري لتضمين/استبعاد نوع السؤال.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 95 سطراً).
 */

export const MODULE_ID_STUDIO_NUMBER_STEPPER_FIELD =
  "studio_number_stepper_field" as const;

export interface StudioNumberStepperFieldProps {
  readonly labelAr: string;
  readonly value: number;
  readonly min?: number;
  readonly max?: number;
  readonly onChange: (next: number) => void;
  readonly enabled?: boolean;
  readonly onToggleEnabled?: (nextEnabled: boolean) => void;
}

export default function StudioNumberStepperField({
  labelAr,
  value,
  min = 0,
  max = 99,
  onChange,
  enabled = true,
  onToggleEnabled,
}: StudioNumberStepperFieldProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const handleInputChange = (raw: string) => {
    if (raw === "") {
      onChange(min);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  };

  return (
    <div
      className={`rounded-2xl border p-2.5 transition-all ${
        enabled
          ? "bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
          : "bg-slate-100/60 dark:bg-slate-950/40 border-slate-200/40 dark:border-slate-800/40 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1.5 leading-tight">
        <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 truncate">
          {labelAr}
        </span>
        {onToggleEnabled !== undefined && (
          <label className="inline-flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggleEnabled(e.target.checked)}
              className="w-3.5 h-3.5 accent-indigo-700 dark:accent-teal-500 rounded cursor-pointer"
              title={enabled ? "مفعّل: اضغط للاستبعاد" : "مستبعد: اضغط للتضمين"}
            />
          </label>
        )}
      </div>

      <div className="flex items-center justify-between gap-1.5">
        <button
          type="button"
          aria-label="زيادة"
          disabled={!enabled}
          onClick={() => onChange(clamp(value + 1))}
          className={`w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-black text-indigo-900 dark:text-teal-300 ${
            enabled ? "cursor-pointer active:scale-95 shadow-xs" : "opacity-30 cursor-not-allowed"
          }`}
        >
          +
        </button>
        <input
          type="number"
          min={min}
          max={max}
          disabled={!enabled}
          value={isNaN(value) ? min : value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              onChange(clamp(value + 1));
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              onChange(clamp(value - 1));
            }
          }}
          className={`flex-1 min-w-0 text-center text-lg font-black font-mono bg-transparent text-slate-900 dark:text-white border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            !enabled ? "cursor-not-allowed" : "cursor-text"
          }`}
        />
        <button
          type="button"
          aria-label="إنقاص"
          disabled={!enabled}
          onClick={() => onChange(clamp(value - 1))}
          className={`w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-black text-indigo-900 dark:text-teal-300 ${
            enabled ? "cursor-pointer active:scale-95 shadow-xs" : "opacity-30 cursor-not-allowed"
          }`}
        >
          −
        </button>
      </div>
    </div>
  );
}
