"use client";

/**
 * @file page-fill-report-chip.tsx
 * @description شريحة تقرير امتلاء كل صفحة من صفحات الـ A4 للمعلم (لا تظهر في الطباعة).
 */

import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import type { FlowPage } from "./flow-item-model";
import { auditFlowPages } from "./flow-layout-quality-audit";

export const MODULE_ID_PAGE_FILL_REPORT_CHIP = "page_fill_report_chip" as const;

export interface PageFillReportChipProps {
  readonly pages: readonly FlowPage[];
  readonly heights: ReadonlyMap<string, number>;
  readonly numeralMode: NumeralDisplayMode;
}

export function PageFillReportChip({
  pages,
  heights,
  numeralMode,
}: PageFillReportChipProps) {
  if (pages.length === 0) return null;
  const rows = auditFlowPages(pages, heights);

  return (
    <div className="print:hidden inline-flex flex-wrap items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-black text-slate-200">
      <span>امتلاء الصفحات:</span>
      {rows.map((row) => {
        const pct = Math.min(100, Math.max(0, Math.round(row.fillRatio * 100)));
        const colorClass =
          pct >= 85
            ? "text-emerald-300"
            : pct >= 60
              ? "text-amber-300"
              : "text-rose-300";
        return (
          <span key={row.pageNumber} className={colorClass}>
            {formatNumeralsByModeSSOT(`${pct}%`, numeralMode)}
          </span>
        );
      })}
    </div>
  );
}
