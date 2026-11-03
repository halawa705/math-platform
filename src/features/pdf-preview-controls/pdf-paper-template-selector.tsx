"use client";

/**
 * @file pdf-paper-template-selector.tsx
 * @description خاصية ذرية مستقلة: التبديل بين القالب السيادي (المعاصر/الفارس) وقالب الامتحان المدرسي الرسمي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import React from "react";
import type { PrintPaperTemplateId } from "@/core/ssot/pdf-print-settings-ssot";

export const MODULE_ID_PDF_PAPER_TEMPLATE_SELECTOR =
  "pdf_paper_template_selector" as const;

export interface PDFPaperTemplateSelectorProps {
  readonly selectedTemplateId: PrintPaperTemplateId;
  readonly onSelectTemplate: (templateId: PrintPaperTemplateId) => void;
}

interface TemplateOption {
  readonly id: PrintPaperTemplateId;
  readonly labelAr: string;
  readonly icon: string;
}

const TEMPLATE_OPTIONS: readonly TemplateOption[] = [
  { id: "classic_sovereign", labelAr: "القالب السيادي (المعاصر)", icon: "🏛️" },
  { id: "official_school_exam", labelAr: "قالب الامتحان المدرسي الرسمي", icon: "🏫" },
];

export default function PDFPaperTemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
}: PDFPaperTemplateSelectorProps) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-0.5 text-xs font-bold"
      title="اختيار نمط وقالب ورقة الطباعة A4"
    >
      {TEMPLATE_OPTIONS.map((opt) => {
        const isSelected = selectedTemplateId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectTemplate(opt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isSelected
                ? "bg-indigo-700 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.labelAr}</span>
          </button>
        );
      })}
    </div>
  );
}
