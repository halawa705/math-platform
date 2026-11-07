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
import MultiFormNewspaperPacker from "@/core/pdf-layout-engine/multi-form-newspaper-packer";
import type { PrintableExamFormGroup } from "@/core/pdf-layout-engine/printable-exam-forms-model";
import PDFControlsGroupedToolPanel from "./pdf-controls-grouped-tool-panel";
import PDFDocumentEditionSegmentedSwitch from "./pdf-document-edition-segmented-switch";
import PDFExactFontSizeControl from "./pdf-exact-fontsize-control";
import PDFBoldWeightToggles from "./pdf-bold-weight-toggles";
import { triggerIsolatedA4Print } from "./pdf-isolated-print-trigger";
import {
  saveDocumentToOvermathDriveVault,
} from "@/features/curriculum-library-hub/overmath-google-drive-vault";

export interface PDFPreviewOrchestratorProps {
  readonly customTitle?: string;
  readonly customQuestions?: readonly PrintableMathQuestionItem[];
  readonly customForms?: readonly PrintableExamFormGroup[];
  readonly gradeNameAr?: string;
  readonly branchNameAr?: string;
  readonly onClosePreview?: () => void;
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
      customQuestions?.some((q) => q.id.startsWith("booklet-s1-") || q.id.startsWith("rev-"))
  );
  const isExamDoc = Boolean(
    !isBookletOrReview &&
      (customTitle?.includes("اختبار") ||
        customQuestions?.some((q) => q.id.startsWith("q-exam-")))
  );
  return { isBookletOrReview, isExamDoc };
}

export default function PDFPreviewOrchestrator({
  customTitle,
  customQuestions,
  customForms,
  gradeNameAr = "",
  branchNameAr = "",
  onClosePreview,
  children,
}: PDFPreviewOrchestratorProps) {
  const userChangedAutoFitRef = useRef<boolean>(false);
  const [pagesCount, setPagesCount] = useState<number>(1);
  const [selectedFormId, setSelectedFormId] = useState<string>("all");
  const [settings, setSettings] = useState<PDFPrintSettingsStateSSOT>(() => {
    const persisted = loadPersistedPDFPrintSettingsSSOT();
    const { isBookletOrReview, isExamDoc } = resolveDocAutoFitDefaults(customTitle, customQuestions);
    return {
      ...persisted,
      paperTemplateId: isExamDoc
        ? "official_school_exam"
        : isBookletOrReview
          ? "classic_sovereign"
          : (persisted.paperTemplateId ?? "classic_sovereign"),
      columnsCount: isBookletOrReview ? 2 : (persisted.columnsCount ?? 2),
      answerVisibilityMode: isBookletOrReview
        ? "questions_with_answers"
        : isExamDoc
          ? "questions_only"
          : persisted.answerVisibilityMode,
      autoFitMode: isExamDoc
        ? "exam_max_pages"
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
      paperTemplateId: isExamDoc
        ? "official_school_exam"
        : isBookletOrReview
          ? "classic_sovereign"
          : (persisted.paperTemplateId ?? "classic_sovereign"),
      columnsCount: isBookletOrReview ? 2 : (persisted.columnsCount ?? 2),
      answerVisibilityMode: isBookletOrReview
        ? "questions_with_answers"
        : isExamDoc
          ? "questions_only"
          : persisted.answerVisibilityMode,
      autoFitMode: userChangedAutoFitRef.current
        ? prev.autoFitMode
        : isExamDoc
          ? "exam_max_pages"
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
      next.targetMaxPages !== settings.targetMaxPages ||
      next.exactFontSizePt !== settings.exactFontSizePt
    ) {
      userChangedAutoFitRef.current = true;
    }
    setSettings(next);
    savePersistedPDFPrintSettingsSSOT(next);
  };

  const activeFont = PRINT_FONT_FAMILIES_SSOT[settings.fontFamilyId];
  const questions = customQuestions ?? [];

  const handlePrintNow = () => {
    const editionSuffix =
      settings.answerVisibilityMode === "questions_only"
        ? " (نسخة الطالب)"
        : settings.answerVisibilityMode === "questions_with_answers"
          ? " (نسخة ولي الأمر - بالإجابات)"
          : " (نموذج الإجابة)";
    const effectiveTitle = `${settings.customDocumentTitle || customTitle || "مستند رياضيات"}${editionSuffix}`;
    triggerIsolatedA4Print(sheetContainerRef.current?.innerHTML || "", {
      ...settings,
      customDocumentTitle: effectiveTitle,
    });
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
      questions: customQuestions,
      settings,
      htmlContent: sheetContainerRef.current?.innerHTML || "",
    });
    setDriveFeedback("✓ تم الحفظ في خزينة الموقع");
    setTimeout(() => setDriveFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
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
          onChangeMode={(nextMode) => handleUpdateSettings({ ...settings, answerVisibilityMode: nextMode })}
        />

        {/* شريط التحكم الفوري في حجم الخط (تلقائي / يدوي) وأزرار السمك (B للكلام / B للكسور والمعادلات) */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PDFExactFontSizeControl
              currentSizePt={settings.exactFontSizePt}
              onChangeSizePt={(exactFontSizePt) =>
                handleUpdateSettings({ ...settings, exactFontSizePt, autoFitMode: "off" })
              }
            />
            <button
              type="button"
              onClick={() =>
                handleUpdateSettings({
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
            onChangeBoldProse={(boldProseText) => handleUpdateSettings({ ...settings, boldProseText })}
            onChangeBoldMath={(boldMathExpressions) => handleUpdateSettings({ ...settings, boldMathExpressions })}
          />
        </div>

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

      {isToolsOpen && (
        <PDFControlsGroupedToolPanel
          settings={settings}
          onChangeSettings={handleUpdateSettings}
        />
      )}

      {customForms && customForms.length > 1 && (
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedFormId("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 cursor-pointer transition-all ${
              selectedFormId === "all"
                ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            📑 جميع النماذج ({customForms.length})
          </button>
          {customForms.map((f) => (
            <button
              key={f.formId}
              type="button"
              onClick={() => setSelectedFormId(f.formId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 cursor-pointer transition-all ${
                selectedFormId === f.formId
                  ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {f.formTitleAr} ({f.questions.length})
            </button>
          ))}
        </div>
      )}

      {customForms && customForms.length > 0 ? (
        selectedFormId === "all" ? (
          <MultiFormNewspaperPacker
            forms={customForms}
            settings={settings}
            subtitleAr={gradeNameAr}
            sheetContainerRef={sheetContainerRef}
            onPagesCountChange={setPagesCount}
          >
            {children}
          </MultiFormNewspaperPacker>
        ) : (
          (() => {
            const activeForm = customForms.find((f) => f.formId === selectedFormId) || customForms[0];
            return (
              <TwoColumnNewspaperPacker
                settings={{
                  ...settings,
                  customDocumentTitle: activeForm.fullDocumentTitleAr,
                }}
                questions={activeForm.questions}
                subtitleAr={gradeNameAr}
                sheetContainerRef={sheetContainerRef}
                onPagesCountChange={setPagesCount}
              >
                {children}
              </TwoColumnNewspaperPacker>
            );
          })()
        )
      ) : (
        <TwoColumnNewspaperPacker
          settings={settings}
          questions={questions}
          subtitleAr={gradeNameAr}
          sheetContainerRef={sheetContainerRef}
          onPagesCountChange={setPagesCount}
        >
          {children}
        </TwoColumnNewspaperPacker>
      )}
    </div>
  );
}
