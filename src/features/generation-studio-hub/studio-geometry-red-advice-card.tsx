"use client";

/**
 * @file studio-geometry-red-advice-card.tsx
 * @description بطاقة التوجيه التربوي الذكي للأشكال غير القابلة للرسم (القرار الأحمر) (المهمة 7.2):
 * تشرح للمعلم باللغة العربية البسيطة سبب تعذر رسم الشكل دون مصطلحات تقنية،
 * وتوفر زراً واحداً بلمسة إبهام مريحة لنسخ صياغة محسنة ومضبوطة لـ NotebookLM ليعيد توليد السؤال فوراً بدقة تامة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import { useState } from "react";
import { formatGeometryRejectionAdviceArabic } from "@/core/geometry-engine/description-intake/geometry-rejection-advice-formatter";

export const MODULE_ID_STUDIO_GEOMETRY_RED_ADVICE_CARD =
  "studio_geometry_red_advice_card" as const;

export interface StudioGeometryRedAdviceCardProps {
  readonly rawPrompt: string;
  readonly reasons: readonly string[];
}

export default function StudioGeometryRedAdviceCard({
  rawPrompt,
  reasons,
}: StudioGeometryRedAdviceCardProps) {
  const [copied, setCopied] = useState(false);

  if (reasons.length === 0) return null;

  const advice = formatGeometryRejectionAdviceArabic({ rawPrompt, reasons });

  const handleCopySuggestion = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(advice.notebookLMSuggestionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 p-3.5 space-y-2.5 text-xs text-rose-950 dark:text-rose-200">
      <div className="flex items-center gap-2 font-black text-rose-800 dark:text-rose-300">
        <span className="text-sm">💡</span>
        <span>توجيه تربوي لتحسين رسم المسألة</span>
      </div>

      <p className="font-bold leading-relaxed text-[11.5px]">
        {advice.friendlySummaryAr}
      </p>

      {advice.detailedStepsAr.length > 0 && (
        <ul className="list-disc pr-5 space-y-1 text-[11px] font-semibold text-rose-900/90 dark:text-rose-300">
          {advice.detailedStepsAr.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      )}

      {!advice.isTheoretical && (
        <div className="pt-1.5 border-t border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
          <div className="text-[10px] font-extrabold text-rose-700 dark:text-rose-400">
            الصياغة المقترحة لـ NotebookLM (جاهزة للنسخ):
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/60 font-mono text-[10.5px] leading-relaxed break-all select-all text-slate-800 dark:text-slate-200">
            {advice.notebookLMSuggestionText}
          </div>
          <button
            type="button"
            onClick={handleCopySuggestion}
            className="w-full min-h-[44px] rounded-xl bg-rose-700 hover:bg-rose-800 active:scale-[0.99] text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-transform"
          >
            <span>{copied ? "✓ تم نسخ الصياغة المحسنة بنجاح" : "📋 نسخ صياغة محسّنة لـ NotebookLM"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
