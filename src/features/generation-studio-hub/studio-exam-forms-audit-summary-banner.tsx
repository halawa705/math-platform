"use client";

/**
 * @file studio-exam-forms-audit-summary-banner.tsx
 * @description بطاقة تدقيق آلي فوري للنماذج المستخرجة: تعرض تطابق الأعداد، خلو النماذج من تكرار الأفكار،
 * وتوازن التوزيع الديموجرافي للأسئلة على الدروس.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import React from "react";
import type { ExamFormsAuditReport } from "@/core/validation/exam-forms-coverage-and-uniqueness-auditor";

export const MODULE_ID_STUDIO_EXAM_FORMS_AUDIT_SUMMARY_BANNER =
  "studio_exam_forms_audit_summary_banner" as const;

export interface StudioExamFormsAuditSummaryBannerProps {
  readonly report: ExamFormsAuditReport | null;
}

export default function StudioExamFormsAuditSummaryBanner({
  report,
}: StudioExamFormsAuditSummaryBannerProps) {
  if (!report || report.actualFormsCount === 0) return null;

  const hasIssues =
    !report.formsCountMatches ||
    report.formCountMismatches.length > 0 ||
    report.duplicateFindings.length > 0 ||
    report.neglectedLessons.length > 0 ||
    report.skewedLessons.length > 0;

  return (
    <section
      aria-label="تدقيق التوزيع ومنع التكرار"
      className={`p-3 rounded-2xl border space-y-2 text-xs ${
        hasIssues
          ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
          : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-black text-slate-900 dark:text-slate-100">
          {hasIssues ? "⚠️ نتائج تدقيق النماذج والدروس:" : "✅ تدقيق التوزيع الديموجرافي ومنع التكرار سليم 100%"}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            النماذج: {report.actualFormsCount}/{report.expectedFormsCount}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              report.duplicateFindings.length === 0
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200"
                : "bg-rose-100 text-rose-900 dark:bg-rose-900/50 dark:text-rose-200"
            }`}
          >
            {report.duplicateFindings.length === 0
              ? "0% تكرار أفكار ✓"
              : `${report.duplicateFindings.length} تكرار محتمل`}
          </span>
        </div>
      </div>

      {report.formCountMismatches.length > 0 && (
        <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
          • فروق الأعداد: {report.formCountMismatches.join(" | ")}
        </div>
      )}

      {report.duplicateFindings.length > 0 && (
        <div className="space-y-1 text-[11px] font-bold text-rose-800 dark:text-rose-300">
          {report.duplicateFindings.slice(0, 4).map((dup, i) => (
            <div key={i}>
              • تكرار {dup.kind === "idea_tag" ? "فكرة" : "صياغة"} ({dup.label}) في:{" "}
              {dup.locations.join(" ↔ ")}
            </div>
          ))}
        </div>
      )}

      {report.neglectedLessons.length > 0 && (
        <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
          • دروس مختارة بدون أسئلة: {report.neglectedLessons.join("، ")}
        </div>
      )}

      {report.skewedLessons.length > 0 && (
        <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
          • تركيز زائد على درس: {report.skewedLessons.join("، ")}
        </div>
      )}

      {report.lessonDistribution.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 shrink-0">
            توزيع الدروس:
          </span>
          {report.lessonDistribution.map((row) => (
            <span
              key={row.lessonTitleArabic}
              className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold whitespace-nowrap shrink-0"
            >
              {row.lessonTitleArabic}: {row.count}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
