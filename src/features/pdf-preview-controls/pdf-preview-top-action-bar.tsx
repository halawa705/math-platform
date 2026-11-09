"use client";

/**
 * @file pdf-preview-top-action-bar.tsx
 * @description شريط الإجراءات والتحكم العلوي لمعاينة الـ A4 PDF:
 * التبديل بين نسخة الطالب ونسخة الإجابة، ضبط حجم الخط، زر الطباعة الرئيسي، حفظ الخزينة، وفتح أدوات التخصيص.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 130 سطراً).
 */

import React from "react";
import Link from "next/link";
import type { PDFPrintSettingsStateSSOT } from "@/core/ssot/pdf-print-settings-ssot";
import PDFDocumentEditionSegmentedSwitch from "./pdf-document-edition-segmented-switch";
import PDFExactFontSizeControl from "./pdf-exact-fontsize-control";
import PDFBoldWeightToggles from "./pdf-bold-weight-toggles";

export const MODULE_ID_PDF_PREVIEW_TOP_ACTION_BAR = "pdf_preview_top_action_bar" as const;

export interface PDFPreviewTopActionBarProps {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly isToolsOpen: boolean;
  readonly driveFeedback: string | null;
  readonly onClosePreview?: () => void;
  readonly onUpdateSettings: (next: PDFPrintSettingsStateSSOT) => void;
  readonly onPrintNow: () => void;
  readonly onSaveToDrive: () => void;
  readonly onToggleTools: () => void;
}

export default function PDFPreviewTopActionBar({
  settings,
  isToolsOpen,
  driveFeedback,
  onClosePreview,
  onUpdateSettings,
  onPrintNow,
  onSaveToDrive,
  onToggleTools,
}: PDFPreviewTopActionBarProps) {
  return (
    <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
      {onClosePreview && (
        <button
          type="button"
          onClick={onClosePreview}
          className="w-full min-h-[44px] rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border-2 border-amber-300 dark:border-amber-700/70 text-amber-950 dark:text-amber-200 text-xs font-black cursor-pointer flex items-center justify-between px-3 shadow-2xs transition-all"
        >
          <span className="flex items-center gap-1.5">
            <span>↩️</span>
            <span>العودة إلى المراحل وتعديل الردود المحفوظة</span>
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-200/80 dark:bg-amber-900/60 text-[11px] font-black">
            ✕ إغلاق المعاينة
          </span>
        </button>
      )}

      {/* شريط التبديل السريع بين نسخة الطالب (أسئلة فقط) ونسخة ولي الأمر (الأسئلة بالإجابات) */}
      <PDFDocumentEditionSegmentedSwitch
        currentMode={settings.answerVisibilityMode}
        onChangeMode={(nextMode) => onUpdateSettings({ ...settings, answerVisibilityMode: nextMode })}
      />

      {/* شريط التحكم الفوري في حجم الخط وأزرار السمك */}
      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PDFExactFontSizeControl
            currentSizePt={settings.exactFontSizePt}
            onChangeSizePt={(exactFontSizePt) =>
              onUpdateSettings({ ...settings, exactFontSizePt, autoFitMode: "off" })
            }
          />
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                autoFitMode: settings.autoFitMode === "off" ? "booklet_fill" : "off",
              })
            }
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-all ${
              settings.autoFitMode !== "off"
                ? "bg-emerald-700 text-white shadow-2xs"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
            }`}
          >
            {settings.autoFitMode !== "off"
              ? "✨ حجم الخط: تلقائي ذكي (مفعّل)"
              : "✋ يدوي — اضغط لإعادة الضبط التلقائي"}
          </button>
        </div>
        <PDFBoldWeightToggles
          boldProseText={settings.boldProseText ?? false}
          boldMathExpressions={settings.boldMathExpressions ?? true}
          onChangeBoldProse={(boldProseText) => onUpdateSettings({ ...settings, boldProseText })}
          onChangeBoldMath={(boldMathExpressions) => onUpdateSettings({ ...settings, boldMathExpressions })}
        />
      </div>

      <button
        type="button"
        onClick={onPrintNow}
        className="w-full min-h-[50px] rounded-xl bg-gradient-to-l from-purple-800 via-violet-700 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-black cursor-pointer flex items-center justify-center gap-2 shadow-sm"
      >
        <span>🖨️</span>
        <span>طباعة / تصدير A4 PDF</span>
      </button>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onToggleTools}
          aria-expanded={isToolsOpen}
          className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black cursor-pointer px-2 truncate"
        >
          🎛️ {isToolsOpen ? "إخفاء التخصيص" : "تخصيص الورقة"}
        </button>
        <button
          type="button"
          onClick={onSaveToDrive}
          className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black cursor-pointer truncate px-2"
        >
          💾 {driveFeedback || "حفظ في الخزينة"}
        </button>
        <Link
          href="/library?tab=archive"
          className="min-h-[44px] rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-300 text-xs font-black flex items-center justify-center gap-1 px-2 truncate"
        >
          <span>🗂️</span>
          <span>عرض المحفوظات</span>
        </Link>
      </div>
    </div>
  );
}
