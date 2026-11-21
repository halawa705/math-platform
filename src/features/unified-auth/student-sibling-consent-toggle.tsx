"use client";

/**
 * @file student-sibling-consent-toggle.tsx
 * @description خيار ذري لتسجيل حساب أخ / أخت على نفس رقم هاتف ولي الأمر بأسماء مختلفة ووسم «إخوة».
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 65 سطراً).
 */

export const MODULE_ID_STUDENT_SIBLING_CONSENT_TOGGLE =
  "student_sibling_consent_toggle" as const;

export interface StudentSiblingConsentToggleProps {
  readonly checked: boolean;
  readonly highlighted: boolean;
  readonly onChange: (checked: boolean) => void;
}

export default function StudentSiblingConsentToggle({
  checked,
  highlighted,
  onChange,
}: StudentSiblingConsentToggleProps) {
  return (
    <label
      className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all select-none ${
        highlighted
          ? "bg-amber-50 dark:bg-amber-950/35 border-amber-400 ring-2 ring-amber-400/40"
          : checked
            ? "bg-teal-50/70 dark:bg-teal-950/30 border-teal-400"
            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 mt-0.5 rounded accent-teal-600 shrink-0"
      />
      <div className="space-y-0.5 text-xs">
        <div className="font-black text-slate-900 dark:text-slate-100">
          👨‍👧‍👦 تسجيل أخ / أخت على نفس رقم ولي الأمر
        </div>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
          يُمنع تكرار الرقم لطالب واحد. إذا كنتما إخوة فعّل هذا الخيار واكتب اسمك الثلاثي المختلف وسيُوسَم الحساب بـ «إخوة» لدى المعلم.
        </p>
      </div>
    </label>
  );
}
