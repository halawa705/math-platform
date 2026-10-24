"use client";

/**
 * @file pdf-preview-orchestrator.tsx
 * @description المنسق المركزي لمعاينة وطباعة الـ A4 PDF بتصميم هادئ:
 * شريط إجراءات واحد (طباعة كبير + حفظ + تخصيص)، ولوحة التخصيص مطوية افتراضياً وتُفتح بنقرة
 * في ٣ مجموعات، ثم ورقة A4 الحية بالتحجيم التلقائي للهاتف.
 */

import React, { useState, useRef } from "react";
import {
  DEFAULT_PDF_PRINT_SETTINGS_SSOT,
  PRINT_FONT_FAMILIES_SSOT,
  type PDFPrintSettingsStateSSOT,
} from "@/core/ssot/pdf-print-settings-ssot";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import TwoColumnNewspaperPacker from "@/core/pdf-layout-engine/two-column-newspaper-packer";
import PDFControlsGroupedToolPanel from "./pdf-controls-grouped-tool-panel";
import { triggerIsolatedA4Print } from "./pdf-isolated-print-trigger";
import {
  OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL,
  saveDocumentToOvermathDriveVault,
} from "@/features/curriculum-library-hub/overmath-google-drive-vault";

export interface PDFPreviewOrchestratorProps {
  readonly customTitle?: string;
  readonly customQuestions?: readonly PrintableMathQuestionItem[];
  readonly gradeNameAr?: string;
  readonly branchNameAr?: string;
  readonly children?: React.ReactNode;
}

export default function PDFPreviewOrchestrator({
  customTitle,
  customQuestions,
  gradeNameAr = "",
  branchNameAr = "",
  children,
}: PDFPreviewOrchestratorProps) {
  const [settings, setSettings] = useState<PDFPrintSettingsStateSSOT>(() => ({
    ...DEFAULT_PDF_PRINT_SETTINGS_SSOT,
    answerVisibilityMode:
      customTitle?.includes("مذكرة") ||
      customTitle?.includes("مراجعة") ||
      customQuestions?.some((q) => q.id.startsWith("booklet-s1-"))
        ? "questions_with_answers"
        : DEFAULT_PDF_PRINT_SETTINGS_SSOT.answerVisibilityMode,
    customDocumentTitle: customTitle || DEFAULT_PDF_PRINT_SETTINGS_SSOT.customDocumentTitle,
  }));
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [driveFeedback, setDriveFeedback] = useState<string | null>(null);
  const sheetContainerRef = useRef<HTMLDivElement>(null);

  const activeFont = PRINT_FONT_FAMILIES_SSOT[settings.fontFamilyId];
  const questions = customQuestions ?? [];

  const handlePrintNow = () => {
    triggerIsolatedA4Print(sheetContainerRef.current?.innerHTML || "", settings);
  };

  const handleSaveToDrive = () => {
    const title = settings.customDocumentTitle || customTitle || "مذكرة رياضيات رسمية";
    saveDocumentToOvermathDriveVault({
      titleAr: title,
      docKind: title.includes("مراجعة") ? "final_review" : title.includes("اختبار") ? "exam" : "booklet",
      branchAr: branchNameAr || "الرياضيات",
      gradeAr: gradeNameAr || "غير محدد",
      pagesCount: 1,
      fontUsed: `${activeFont.nameArabic.split("—")[0].trim()} ${settings.exactFontSizePt}pt`,
      htmlContent: sheetContainerRef.current?.innerHTML || "",
    });
    setDriveFeedback(`✓ تم الحفظ (${OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL})`);
    setTimeout(() => setDriveFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <button
          type="button"
          onClick={handlePrintNow}
          className="w-full min-h-[50px] rounded-xl bg-gradient-to-l from-purple-800 via-violet-700 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-black cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          <span>🖨️</span>
          <span>طباعة / تصدير A4 PDF</span>
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsToolsOpen((v) => !v)}
            aria-expanded={isToolsOpen}
            className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black cursor-pointer"
          >
            🎛️ {isToolsOpen ? "إخفاء التخصيص" : "تخصيص الورقة"}
          </button>
          <button
            type="button"
            onClick={handleSaveToDrive}
            className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black cursor-pointer truncate px-2"
          >
            ☁️ {driveFeedback || "حفظ في Google Drive"}
          </button>
        </div>
      </div>

      {isToolsOpen && (
        <PDFControlsGroupedToolPanel settings={settings} onChangeSettings={setSettings} />
      )}

      <TwoColumnNewspaperPacker
        settings={settings}
        questions={questions}
        subtitleAr={gradeNameAr}
        sheetContainerRef={sheetContainerRef}
      >
        {children}
      </TwoColumnNewspaperPacker>
    </div>
  );
}
