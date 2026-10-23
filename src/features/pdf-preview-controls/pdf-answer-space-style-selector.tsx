"use client";

/**
 * @file pdf-answer-space-style-selector.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): اختيار شكل مساحة حل الطالب تحت الأسئلة المقالية والبرهان
 * (أسطر مسطرة، نقاط، شبكة تربيعية للرسم البياني، فارغة، أو إخفاء مساحة الحل لتوفير الورق).
 */

import type { AnswerSpaceStyleMode } from "@/core/ssot/pdf-print-settings-ssot";

export interface PDFAnswerSpaceStyleSelectorProps {
  readonly currentStyle: AnswerSpaceStyleMode;
  readonly onChangeStyle: (style: AnswerSpaceStyleMode) => void;
}

const SPACE_STYLES: readonly { readonly id: AnswerSpaceStyleMode; readonly label: string }[] = [
  { id: "dotted", label: "نقاط للحل" },
  { id: "lined", label: "أسطر مسطرة" },
  { id: "grid", label: "شبكة تربيعية" },
  { id: "blank", label: "مساحة بيضاء" },
  { id: "hidden", label: "بدون مساحة (توفير ورق)" },
];

export default function PDFAnswerSpaceStyleSelector({
  currentStyle,
  onChangeStyle,
}: PDFAnswerSpaceStyleSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
        مساحة الحل:
      </span>
      <select
        value={currentStyle}
        onChange={(e) => onChangeStyle(e.target.value as AnswerSpaceStyleMode)}
        className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
      >
        {SPACE_STYLES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
