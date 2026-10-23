"use client";

/**
 * @file pdf-preview-orchestrator.tsx
 * @description المنسق المركزي لمعاينة وطباعة الـ A4 PDF.
 * يربط جميع الملفات الذرية الـ 11 لأدوات التحكم ومصدر الحقيقة `pdf-print-settings-ssot.ts`
 * مع محرك تعبئة الورقة `two-column-newspaper-packer.tsx` دون تجاوز سقف 200 سطر.
 */

import React, { useState, useRef } from "react";
import {
  DEFAULT_PDF_PRINT_SETTINGS_SSOT,
  PRINT_FONT_FAMILIES_SSOT,
  type PDFPrintSettingsStateSSOT,
} from "@/core/ssot/pdf-print-settings-ssot";
import { formatNumeralsByModeSSOT } from "@/core/ssot/numeral-and-unit-ssot";
import {
  buildSampleHighDensityMathSheetQuestions,
  type PrintableMathQuestionItem,
} from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import TwoColumnNewspaperPacker from "@/core/pdf-layout-engine/two-column-newspaper-packer";
import PDFNumeralSystemSwitch from "./pdf-numeral-system-switch";
import PDFFontFamilySelector from "./pdf-font-family-selector";
import PDFAnswerVisibilityMode from "./pdf-answer-visibility-mode";
import PDFExactFontSizeControl from "./pdf-exact-fontsize-control";
import PDFDensityBudgetSelector from "./pdf-density-budget-selector";
import PDFColumnsLayoutToggle from "./pdf-columns-layout-toggle";
import PDFAnswerSpaceStyleSelector from "./pdf-answer-space-style-selector";
import PDFColorThemeSelector from "./pdf-color-theme-selector";
import PDFNotationDirectionSwitch from "./pdf-notation-direction-switch";
import PDFHeaderBrandingEditor from "./pdf-header-branding-editor";
import { triggerIsolatedA4Print } from "./pdf-isolated-print-trigger";
import {
  OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL,
  saveDocumentToOvermathDriveVault,
} from "@/features/curriculum-library-hub/overmath-google-drive-vault";

export interface PDFPreviewOrchestratorProps {
  readonly customTitle?: string;
  readonly customQuestions?: readonly PrintableMathQuestionItem[];
  readonly children?: React.ReactNode;
}

export default function PDFPreviewOrchestrator({
  customTitle,
  customQuestions,
  children,
}: PDFPreviewOrchestratorProps) {
  const [settings, setSettings] = useState<PDFPrintSettingsStateSSOT>(() => ({
    ...DEFAULT_PDF_PRINT_SETTINGS_SSOT,
    customDocumentTitle:
      customTitle || DEFAULT_PDF_PRINT_SETTINGS_SSOT.customDocumentTitle,
  }));
  const [isMobileControlsExpanded, setIsMobileControlsExpanded] =
    useState<boolean>(false);
  const [driveSyncFeedback, setDriveSyncFeedback] = useState<string | null>(null);
  const sheetContainerRef = useRef<HTMLDivElement>(null);

  const activeFont = PRINT_FONT_FAMILIES_SSOT[settings.fontFamilyId];
  const questions =
    customQuestions ??
    buildSampleHighDensityMathSheetQuestions(settings.notationLanguage);

  const handlePrintNow = () => {
    const html = sheetContainerRef.current?.innerHTML || "";
    triggerIsolatedA4Print(html, settings);
  };

  const handleSaveToOvermathDrive = () => {
    const html = sheetContainerRef.current?.innerHTML || "";
    const title = settings.customDocumentTitle || customTitle || "مذكرة رياضيات رسمية";
    const docKind = title.includes("مراجعة")
      ? "final_review"
      : title.includes("اختبار")
      ? "exam"
      : "booklet";
    saveDocumentToOvermathDriveVault({
      titleAr: title,
      docKind,
      branchAr: "الرياضيات",
      gradeAr: "المرحلة الإعدادية والثانوية",
      pagesCount: 2,
      fontUsed: `${activeFont.nameArabic.split("—")[0].trim()} ${settings.exactFontSizePt}pt`,
      htmlContent: html,
    });
    setDriveSyncFeedback(`✓ تم الحفظ في Google Drive (${OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL})`);
    setTimeout(() => setDriveSyncFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* شريط إجراءات سريع للهاتف المحمول + زر طي/فتح الأدوات الذرية الـ 10 */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-indigo-950 text-white shadow-md">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[11px] font-black">
            استغلال الورقة: {formatNumeralsByModeSSOT("93%", settings.numeralMode)}
          </span>
          <span className="text-xs font-bold text-slate-200 hidden sm:inline">
            {activeFont.nameArabic.split("—")[0]} •{" "}
            {formatNumeralsByModeSSOT(settings.exactFontSizePt, settings.numeralMode)}pt
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileControlsExpanded((prev) => !prev)}
            className="md:hidden min-h-[40px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <span>🎛️</span>
            <span>
              {isMobileControlsExpanded ? "إخفاء الأدوات" : "تخصيص الورقة (10)"}
            </span>
          </button>
          <button
            type="button"
            onClick={handleSaveToOvermathDrive}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-indigo-800 hover:bg-indigo-700 border border-indigo-400/30 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer"
            title={`حفظ وأرشفة مباشرة في Google Drive (${OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL})`}
          >
            <span>☁️</span>
            <span>{driveSyncFeedback || "حفظ في Google Drive"}</span>
          </button>
          <button
            type="button"
            onClick={handlePrintNow}
            className="min-h-[40px] px-4 py-1.5 rounded-xl bg-gradient-to-l from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>🖨️</span>
            <span>طباعة / تصدير A4 PDF</span>
          </button>
        </div>
      </div>

      {/* لوحة الأدوات الذرية الـ 10 */}
      <div
        className={`${
          isMobileControlsExpanded ? "flex" : "hidden md:flex"
        } p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-sm flex-wrap items-center justify-between gap-2.5`}
      >
        <PDFFontFamilySelector
          selectedFontId={settings.fontFamilyId}
          onSelectFont={(fontFamilyId) => setSettings({ ...settings, fontFamilyId })}
        />
        <PDFExactFontSizeControl
          currentSizePt={settings.exactFontSizePt}
          onChangeSizePt={(exactFontSizePt) =>
            setSettings({ ...settings, exactFontSizePt })
          }
        />
        <PDFNumeralSystemSwitch
          currentMode={settings.numeralMode}
          onChangeMode={(numeralMode) => setSettings({ ...settings, numeralMode })}
        />
        <PDFNotationDirectionSwitch
          currentNotation={settings.notationLanguage}
          onChangeNotation={(notationLanguage) =>
            setSettings({ ...settings, notationLanguage })
          }
        />
        <PDFAnswerVisibilityMode
          currentVisibility={settings.answerVisibilityMode}
          onChangeVisibility={(answerVisibilityMode) =>
            setSettings({ ...settings, answerVisibilityMode })
          }
        />
        <PDFDensityBudgetSelector
          currentDensity={settings.densityMode}
          onChangeDensity={(densityMode) => setSettings({ ...settings, densityMode })}
        />
        <PDFColumnsLayoutToggle
          columnsCount={settings.columnsCount}
          showDivider={settings.showColumnDivider}
          onChangeColumns={(columnsCount) => setSettings({ ...settings, columnsCount })}
          onToggleDivider={(showColumnDivider) =>
            setSettings({ ...settings, showColumnDivider })
          }
        />
        <PDFAnswerSpaceStyleSelector
          currentStyle={settings.answerSpaceStyle}
          onChangeStyle={(answerSpaceStyle) =>
            setSettings({ ...settings, answerSpaceStyle })
          }
        />
        <PDFColorThemeSelector
          currentThemeId={settings.colorThemeId}
          onChangeThemeId={(colorThemeId) => setSettings({ ...settings, colorThemeId })}
        />
        <PDFHeaderBrandingEditor
          documentTitle={settings.customDocumentTitle}
          durationText={settings.customDurationText}
          onChangeTitle={(customDocumentTitle) =>
            setSettings({ ...settings, customDocumentTitle })
          }
          onChangeDuration={(customDurationText) =>
            setSettings({ ...settings, customDurationText })
          }
        />
      </div>

      {/* لوحة الورقة A4 الحية بتعبئة العمودين والتحجيم التلقائي للهاتف */}
      <TwoColumnNewspaperPacker
        settings={settings}
        questions={questions}
        sheetContainerRef={sheetContainerRef}
      >
        {children}
      </TwoColumnNewspaperPacker>
    </div>
  );
}
