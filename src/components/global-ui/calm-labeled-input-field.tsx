/**
 * @file calm-labeled-input-field.tsx
 * @description حقل إدخال نصي هادئ موحد (تسمية صغيرة + حقل بارتفاع لمس 44px) يُستخدم في النماذج.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

export const MODULE_ID_CALM_LABELED_INPUT_FIELD = "calm_labeled_input_field" as const;

export interface CalmLabeledInputFieldProps {
  readonly labelAr: string;
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly placeholder?: string;
  readonly isLtr?: boolean;
  readonly inputType?: "text" | "url";
}

export default function CalmLabeledInputField({
  labelAr,
  value,
  onChange,
  placeholder,
  isLtr = false,
  inputType = "text",
}: CalmLabeledInputFieldProps) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
        {labelAr}
      </span>
      <input
        type={inputType}
        dir={isLtr ? "ltr" : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none focus:border-slate-400 dark:focus:border-slate-500"
      />
    </label>
  );
}
