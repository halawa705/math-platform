"use client";

/**
 * @file pdf-preview-orchestrator.tsx
 * @description المنسق المركزي لمعاينة وطباعة الـ A4 PDF بتصميم هادئ:
 * شريط إجراءات واحد (طباعة كبير + حفظ + تخصيص)، ولوحة التخصيص مطوية افتراضياً وتُفتح بنقرة
 * في ٣ مجموعات، ثم ورقة A4 الحية بالتحجيم التلقائي للهاتف.
 */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  DEFAULT_PDF_PRINT_SETTINGS_SSOT,
  loadPersistedPDFPrintSettingsSSOT,
  PRINT_FONT_FAMILIES_SSOT,
  savePersistedPDFPrintSettingsSSOT,
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

function resolveDocAutoFitDefaults(
  customTitle: string | undefined,
  customQuestions: readonly PrintableMathQuestionItem[] | undefined
): {
  readonly isBookletOrReview: boolean;
  readonly isExamDoc: boolean;
} {
  const isBookletOrReview = Boolean(
    customTitle?.includes("مذكرة") ||
      customTitle?.includes("مراجعة") ||
      customQuestions?.some((q) => q.id.startsWith("booklet-s1-"))
  );
  const isExamDoc = Boolean(!isBookletOrReview && customTitle?.includes("اختبار"));
  return { isBookletOrReview, isExamDoc };
}

export default function PDFPreviewOrchestrator({
  customTitle,
  customQuestions,
  gradeNameAr = "",
  branchNameAr = "",
  children,
}: PDFPreviewOrchestratorProps) {
  const userChangedAutoFitRef = useRef<boolean>(false);
  const [pagesCount, setPagesCount] = useState<number>(1);
  const [settings, setSettings] = useState<PDFPrintSettingsStateSSOT>(() => {
    const persisted = loadPersistedPDFPrintSettingsSSOT();
    const { isBookletOrReview, isExamDoc } = resolveDocAutoFitDefaults(customTitle, customQuestions);
    return {
      ...persisted,
      answerVisibilityMode: isBookletOrReview
        ? "questions_with_answers"
        : persisted.answerVisibilityMode,
      autoFitMode: isExamDoc
        ? "exam_max_pages"
        : isBookletOrReview
          ? "booklet_fill"
          : (persisted.autoFitMode ?? "booklet_fill"),
      targetMaxPages: isExamDoc ? 2 : isBookletOrReview ? undefined : persisted.targetMaxPages,
      customDocumentTitle:
        customTitle || DEFAULT_PDF_PRINT_SETTINGS_SSOT.customDocumentTitle,
    };
  });
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [driveFeedback, setDriveFeedback] = useState<string | null>(null);
  const sheetContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const persisted = loadPersistedPDFPrintSettingsSSOT();
    const { isBookletOrReview, isExamDoc } = resolveDocAutoFitDefaults(customTitle, customQuestions);
    setSettings((prev) => ({
      ...prev,
      ...persisted,
      answerVisibilityMode: isBookletOrReview
        ? "questions_with_answers"
        : persisted.answerVisibilityMode,
      autoFitMode: userChangedAutoFitRef.current
        ? prev.autoFitMode
        : isExamDoc
          ? "exam_max_pages"
          : isBookletOrReview
            ? "booklet_fill"
            : (persisted.autoFitMode ?? "booklet_fill"),
      targetMaxPages: userChangedAutoFitRef.current
        ? prev.targetMaxPages
        : isExamDoc
          ? 2
          : isBookletOrReview
            ? undefined
            : persisted.targetMaxPages,
      customDocumentTitle: customTitle || prev.customDocumentTitle,
    }));
  }, [customTitle, customQuestions]);

  const handleUpdateSettings = (next: PDFPrintSettingsStateSSOT) => {
    if (
      next.autoFitMode !== settings.autoFitMode ||
      next.targetMaxPages !== settings.targetMaxPages
    ) {
      userChangedAutoFitRef.current = true;
    }
    setSettings(next);
    savePersistedPDFPrintSettingsSSOT(next);
  };

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
      pagesCount: Math.max(1, pagesCount),
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
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setIsToolsOpen((v) => !v)}
            aria-expanded={isToolsOpen}
            className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black cursor-pointer px-2 truncate"
          >
            🎛️ {isToolsOpen ? "إخفاء التخصيص" : "تخصيص الورقة"}
          </button>
          <button
            type="button"
            onClick={handleSaveToDrive}
            className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black cursor-pointer truncate px-2"
          >
            ☁️ {driveFeedback || "حفظ في Drive"}
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

      {isToolsOpen && (
        <PDFControlsGroupedToolPanel
          settings={settings}
          onChangeSettings={handleUpdateSettings}
        />
      )}

      <TwoColumnNewspaperPacker
        settings={settings}
        questions={questions}
        subtitleAr={gradeNameAr}
        sheetContainerRef={sheetContainerRef}
        onPagesCountChange={setPagesCount}
      >
        {children}
      </TwoColumnNewspaperPacker>
    </div>
  );
}
