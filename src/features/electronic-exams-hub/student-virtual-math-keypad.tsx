"use client";

/**
 * @file student-virtual-math-keypad.tsx
 * @description لوحة المفاتيح الرياضية الافتراضية المخصصة لشاشات اللمس والهاتف المحمول
 * لإدخال الجذور والكسور والأسس والرموز الهندسية بضغطة إبهام واحدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import React from "react";

export const MODULE_ID_STUDENT_VIRTUAL_MATH_KEYPAD =
  "student_virtual_math_keypad" as const;

export interface StudentVirtualMathKeypadProps {
  readonly onInsertSymbol: (symbol: string) => void;
  readonly onClear?: () => void;
}

const MATH_TOUCH_KEYS = [
  { label: "س²", insert: "س^2" },
  { label: "√", insert: "√(" },
  { label: "÷", insert: " ÷ " },
  { label: "×", insert: " × " },
  { label: "π", insert: "π" },
  { label: "θ", insert: "θ" },
  { label: "△", insert: "△" },
  { label: "∠", insert: "∠" },
  { label: "∥", insert: " ∥ " },
  { label: "⊥", insert: " ⊥ " },
  { label: "≥", insert: " ≥ " },
  { label: "≤", insert: " ≤ " },
] as const;

export default function StudentVirtualMathKeypad({
  onInsertSymbol,
  onClear,
}: StudentVirtualMathKeypadProps) {
  return (
    <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">
          ⌨️ لوحة الرموز الرياضية السريعة للهاتف:
        </span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-black text-rose-600 dark:text-rose-400 cursor-pointer"
          >
            مسح الحقل
          </button>
        )}
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
        {MATH_TOUCH_KEYS.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={() => onInsertSymbol(k.insert)}
            className="min-h-[42px] rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-teal-950/50 border border-slate-200/90 dark:border-slate-700 text-xs font-black text-indigo-950 dark:text-teal-300 shadow-sm active:scale-95 transition cursor-pointer"
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
