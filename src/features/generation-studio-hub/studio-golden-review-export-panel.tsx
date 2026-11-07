"use client";

/**
 * @file studio-golden-review-export-panel.tsx
 * @description لوحة حفظ المراجعة البشرية: إحصاء الدقة الفعلية + تصدير/استيراد الأحكام بصيغة JSON (المهمة 0.4).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import { useRef } from "react";
import {
  exportVerdictsAsJson,
  parseImportedVerdictsJson,
  type GoldenHumanVerdictMap,
} from "@/core/geometry-engine/baseline-measurement/golden-human-verdicts-local-store";

export const MODULE_ID_STUDIO_GOLDEN_REVIEW_EXPORT_PANEL = "studio_golden_review_export_panel" as const;

export interface StudioGoldenReviewExportPanelProps {
  readonly verdicts: GoldenHumanVerdictMap;
  readonly totalCases: number;
  readonly onImport: (map: GoldenHumanVerdictMap) => void;
}

export default function StudioGoldenReviewExportPanel({ verdicts, totalCases, onImport }: StudioGoldenReviewExportPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const entries = Object.values(verdicts);
  const correct = entries.filter((e) => e.verdict === "correct").length;
  const wrong = entries.filter((e) => e.verdict === "wrong").length;
  const reviewed = correct + wrong;
  const accuracy = reviewed > 0 ? ((correct / reviewed) * 100).toFixed(1) : "—";

  const download = () => {
    const blob = new Blob([exportVerdictsAsJson(verdicts)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "human-verdicts.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const parsed = parseImportedVerdictsJson(await file.text());
    if (parsed) onImport({ ...verdicts, ...parsed });
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-3 space-y-2 text-xs">
      <div className="flex flex-wrap items-center gap-1.5 font-black">
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">صحيح: {correct}</span>
        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">خاطئ: {wrong}</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">المتبقي: {Math.max(0, totalCases - reviewed)}</span>
        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">الدقة المثبتة: {accuracy}{reviewed > 0 ? "%" : ""}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={download} disabled={reviewed === 0}
          className="min-h-[44px] rounded-xl bg-indigo-900 text-white font-black disabled:opacity-40 cursor-pointer">
          📥 تصدير أحكامي (JSON)
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}
          className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 font-black cursor-pointer">
          📤 استيراد أحكام
        </button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
        الأحكام تُحفظ تلقائياً في متصفحك. لتثبيتها في المشروع ضع الملف المصدَّر في
        <span className="font-mono"> tests/golden-corpus/human-verdicts/human-verdicts.json</span> ثم شغّل مقياس خط الأساس.
      </p>
    </div>
  );
}
