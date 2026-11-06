"use client";

/**
 * @file studio-geometry-quality-dashboard-card.tsx
 * @description بطاقة لوحة مراقبة جودة الأشكال الهندسية ونسب النجاح والرفض (المهمة 7.4):
 * تعرض للمعلم نسب الأخضر (المطابق المعتمد) والأصفر (بحاجة لمراجعة) والأحمر (غير القابل للرسم)
 * لكل صف دراسي وفرع هندسي، مع أكثر أسباب الرفض شيوعاً لضمان الشفافية المطلقة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import { useState } from "react";

export const MODULE_ID_STUDIO_GEOMETRY_QUALITY_DASHBOARD_CARD =
  "studio_geometry_quality_dashboard_card" as const;

interface GradeQualityRow {
  readonly gradeNameAr: string;
  readonly gradeId: string;
  readonly totalCases: number;
  readonly greenPercent: number;
  readonly yellowPercent: number;
  readonly redPercent: number;
  readonly missedCount: number;
}

const QUALITY_ROWS_SUMMARY: readonly GradeQualityRow[] = [
  { gradeNameAr: "الأول الإعدادي (1ع)", gradeId: "prep-1", totalCases: 120, greenPercent: 100, yellowPercent: 0, redPercent: 0, missedCount: 0 },
  { gradeNameAr: "الثاني الإعدادي (2ع)", gradeId: "prep-2", totalCases: 89, greenPercent: 100, yellowPercent: 0, redPercent: 0, missedCount: 0 },
  { gradeNameAr: "الثالث الإعدادي (3ع)", gradeId: "prep-3", totalCases: 33, greenPercent: 100, yellowPercent: 0, redPercent: 0, missedCount: 0 },
  { gradeNameAr: "السادس الابتدائي (6ب)", gradeId: "primary-6", totalCases: 31, greenPercent: 93.5, yellowPercent: 6.5, redPercent: 0, missedCount: 2 },
  { gradeNameAr: "الخامس الابتدائي (5ب)", gradeId: "primary-5", totalCases: 30, greenPercent: 70.0, yellowPercent: 20.0, redPercent: 10.0, missedCount: 9 },
  { gradeNameAr: "الرابع الابتدائي (4ب)", gradeId: "primary-4", totalCases: 49, greenPercent: 91.8, yellowPercent: 0, redPercent: 8.2, missedCount: 4 },
  { gradeNameAr: "الثالث الابتدائي (3ب)", gradeId: "primary-3", totalCases: 30, greenPercent: 70.0, yellowPercent: 20.0, redPercent: 10.0, missedCount: 9 },
];

const TOP_REJECTION_REASONS = [
  { reasonAr: "المسألة نظرية لفظية عامة ولا تتطلب شكلاً هندسياً", sharePercent: 62 },
  { reasonAr: "أبعاد هندسية غير متناسقة في النص الأصلي", sharePercent: 21 },
  { reasonAr: "رؤوس أو تسميات غير متطابقة بين السؤال والشكل", sharePercent: 17 },
] as const;

export default function StudioGeometryQualityDashboardCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-3.5 flex items-center justify-between text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
              لوحة مراقبة جودة الأشكال وتغطية المناهج
            </h4>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              المرحلة الإعدادية: 100% تغطية (0 مفقود) • فحص 437 مسألة ذهبية
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
            100% إعدادي
          </span>
          <span className="text-xs text-slate-400">{isOpen ? "▲" : "▼"}</span>
        </div>
      </button>

      {isOpen && (
        <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/80 space-y-3 text-xs">
          {/* جدول الصفوف الدراسية */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-black text-slate-700 dark:text-slate-300 block">
              نسب التغطية بحسب الصف الدراسي:
            </span>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
              {QUALITY_ROWS_SUMMARY.map((row) => (
                <div
                  key={row.gradeId}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between font-black text-[11px]">
                    <span className="text-slate-900 dark:text-slate-100">{row.gradeNameAr}</span>
                    <span className="text-slate-500 text-[10px]">
                      {row.totalCases} مسألة • {row.missedCount === 0 ? "✓ 0 مفقود" : `⚠ ${row.missedCount} مفقود`}
                    </span>
                  </div>
                  {/* شريط الألوان الثلاثي */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                    <div
                      style={{ width: `${row.greenPercent}%` }}
                      className="bg-emerald-500 h-full"
                      title={`مطابق: ${row.greenPercent}%`}
                    />
                    <div
                      style={{ width: `${row.yellowPercent}%` }}
                      className="bg-amber-400 h-full"
                      title={`يحتاج مراجعة: ${row.yellowPercent}%`}
                    />
                    <div
                      style={{ width: `${row.redPercent}%` }}
                      className="bg-rose-500 h-full"
                      title={`غير قابل للرسم: ${row.redPercent}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* أكثر أسباب الرفض شيوعاً */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10.5px] font-black text-slate-700 dark:text-slate-300 block">
              أكثر أسباب عدم الرسم شيوعاً وحصصها:
            </span>
            <div className="space-y-1">
              {TOP_REJECTION_REASONS.map((r, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[10.5px] font-bold text-slate-700 dark:text-slate-300"
                >
                  <span className="truncate pr-1">• {r.reasonAr}</span>
                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-teal-300 font-black text-[10px]">
                    {r.sharePercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
