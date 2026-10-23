"use client";

/**
 * @file pdf-answer-visibility-mode.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): التحكم في شكل المذكرة أو الامتحان المطبوع:
 * 1. `questions_only`: أسئلة فقط للطالب بدون حلول.
 * 2. `questions_with_answers`: أسئلة مع الحلول والبرهان تحت كل سؤال مباشرة.
 * 3. `answer_key_only`: نموذج الإجابة الرسمي المنفصل فقط.
 */

import type { DocumentAnswerVisibilityMode } from "@/core/ssot/pdf-print-settings-ssot";

export interface PDFAnswerVisibilityModeProps {
  readonly currentVisibility: DocumentAnswerVisibilityMode;
  readonly onChangeVisibility: (mode: DocumentAnswerVisibilityMode) => void;
}

const VISIBILITY_OPTIONS: readonly {
  readonly id: DocumentAnswerVisibilityMode;
  readonly label: string;
}[] = [
  { id: "questions_only", label: "نسخة الطالب (أسئلة فقط)" },
  { id: "questions_with_answers", label: "محلولة (أسئلة بأجوبة)" },
  { id: "answer_key_only", label: "نموذج الإجابة فقط" },
];

export default function PDFAnswerVisibilityMode({
  currentVisibility,
  onChangeVisibility,
}: PDFAnswerVisibilityModeProps) {
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-0.5 text-xs font-bold">
      {VISIBILITY_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChangeVisibility(opt.id)}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            currentVisibility === opt.id
              ? "bg-teal-700 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
