"use client";

/**
 * @file studio-geometry-golden-case-exporter.tsx
 * @description مصدّر الحالات المرجعية الذهبية في معمل الأشكال واستوديو التوليد (المهمة 7.3):
 * يحوّل أي مسألة صححها المعلم إلى حالة ذهبية جديدة معتمدة (humanVerdict = 'correct')،
 * يحفظها في التخزين المحلي للمتصفح ويتيح تنزيلها كملف JSON لدمجها تلقائياً مع المجموعة الذهبية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import { useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { buildGoldenCorpusCaseFromCorrection } from "@/core/geometry-engine/baseline-measurement/golden-corpus-correction-converter";

export const MODULE_ID_STUDIO_GEOMETRY_GOLDEN_CASE_EXPORTER =
  "studio_geometry_golden_case_exporter" as const;

export interface StudioGeometryGoldenCaseExporterProps {
  readonly problemText: string;
  readonly description: string;
  readonly gradeId: string;
  readonly branchId: MathBranchId;
}

const LOCAL_STORAGE_KEY = "custom_golden_geometry_cases";

export default function StudioGeometryGoldenCaseExporter({
  problemText,
  description,
  gradeId,
  branchId,
}: StudioGeometryGoldenCaseExporterProps) {
  const [savedCount, setSavedCount] = useState<number>(() => {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      return existing ? JSON.parse(existing).length : 0;
    } catch {
      return 0;
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveToGoldenCorpus = () => {
    const newCase = buildGoldenCorpusCaseFromCorrection({
      problemText,
      correctedDescription: description,
      gradeId,
      branchId,
      teacherNotes: "تم التدقيق والاعتماد بواسطة المعلم المالك من استوديو التوليد",
    });

    try {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [...existingList, newCase];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList, null, 2));
      setSavedCount(updatedList.length);
      setToastMessage("✓ تم حفظ الحالة في السجل الذهبي المحلي بنجاح!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage("⚠ تعذر الحفظ في المتصفح");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDownloadJSON = () => {
    try {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const dataStr = existingRaw || "[]";
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `custom-golden-cases-${gradeId}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <button
        type="button"
        onClick={handleSaveToGoldenCorpus}
        className="min-h-[44px] px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
      >
        <span>⭐ حفظ كحالة ذهبية معتمدة</span>
        {savedCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] font-black">
            {savedCount}
          </span>
        )}
      </button>

      {savedCount > 0 && (
        <button
          type="button"
          onClick={handleDownloadJSON}
          className="min-h-[44px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer flex items-center gap-1"
          title="تصدير الحالات المعتمدة كملف JSON لدمجها تلقائياً"
        >
          <span>📥 تصدير الحالات (JSON)</span>
        </button>
      )}

      {toastMessage && (
        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 animate-fade-in">
          {toastMessage}
        </span>
      )}
    </div>
  );
}
