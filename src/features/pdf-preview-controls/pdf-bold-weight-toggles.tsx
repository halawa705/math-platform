"use client";

/**
 * @file pdf-bold-weight-toggles.tsx
 * @description خاصية ذرية مستقلة (Micro-Feature): زران مستقلان بحرف B للتحكم اليدوي في سماكة الخط:
 * 1) زر (B الكلام والشرح): يجعل النصوص العربية والشرح ونصوص المسائل بخط سميك أو عادي مريح للعين.
 * 2) زر (B الكسور والمعادلات): يجعل الكسور والرموز الرياضية والمعادلات فقط بخط سميك أو عادي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 80 سطراً).
 */

export const MODULE_ID_PDF_BOLD_WEIGHT_TOGGLES = "pdf_bold_weight_toggles" as const;

export interface PDFBoldWeightTogglesProps {
  readonly boldProseText: boolean;
  readonly boldMathExpressions: boolean;
  readonly onChangeBoldProse: (next: boolean) => void;
  readonly onChangeBoldMath: (next: boolean) => void;
}

export default function PDFBoldWeightToggles({
  boldProseText,
  boldMathExpressions,
  onChangeBoldProse,
  onChangeBoldMath,
}: PDFBoldWeightTogglesProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChangeBoldProse(!boldProseText)}
        aria-pressed={boldProseText}
        className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer inline-flex items-center gap-2 ${
          boldProseText
            ? "bg-indigo-800 border-indigo-900 text-white shadow-xs"
            : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70"
        }`}
      >
        <span
          className={`w-6 h-6 rounded-md flex items-center justify-center font-serif text-sm font-black border ${
            boldProseText
              ? "bg-white text-indigo-900 border-white"
              : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
          }`}
        >
          B
        </span>
        <span>تسميك الكلام والشرح</span>
        <span className="text-[10px] opacity-80">({boldProseText ? "مفعّل" : "عادي"})</span>
      </button>

      <button
        type="button"
        onClick={() => onChangeBoldMath(!boldMathExpressions)}
        aria-pressed={boldMathExpressions}
        className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer inline-flex items-center gap-2 ${
          boldMathExpressions
            ? "bg-teal-700 border-teal-800 text-white shadow-xs"
            : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70"
        }`}
      >
        <span
          className={`w-6 h-6 rounded-md flex items-center justify-center font-serif text-sm font-black border ${
            boldMathExpressions
              ? "bg-white text-teal-900 border-white"
              : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
          }`}
        >
          B
        </span>
        <span>تسميك الكسور والمعادلات والرموز فقط</span>
        <span className="text-[10px] opacity-80">({boldMathExpressions ? "مفعّل" : "عادي"})</span>
      </button>
    </div>
  );
}
