"use client";

/**
 * @file pdf-preview-orchestrator.tsx
 * @description المنسق المركزي لمعاينة وطباعة الـ A4 PDF بتصميم هادئ:
 * يربط الاختبارات الفردية وحزم النماذج تلقائياً بقالب الامتحان الرسمي وهدف الصفحتين مع احترام قفل سطور المعلم اليدوي فقط.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 275 سطراً).
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  loadPersistedPDFPrintSettingsSSOT,
  PRINT_FONT_FAMILIES_SSOT,
  savePersistedPDFPrintSettingsSSOT,
  type PDFPrintSettingsStateSSOT,
} from "@/core/ssot/pdf-print-settings-ssot";
import { saveStudioGlobalContextSSOT } from "@/core/ssot/studio-state-persistence-ssot";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import TwoColumnNewspaperPacker from "@/core/pdf-layout-engine/two-column-newspaper-packer";
import MultiFormNewspaperPacker from "@/core/pdf-layout-engine/multi-form-newspaper-packer";
import type { PrintableExamFormGroup } from "@/core/pdf-layout-engine/printable-exam-forms-model";
import { resolveExamAwarePDFSettings } from "@/core/pdf-layout-engine/pdf-doc-autofit-defaults-resolver";
import PDFPreviewTopActionBar from "./pdf-preview-top-action-bar";
import PDFControlsGroupedToolPanel from "./pdf-controls-grouped-tool-panel";
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
  readonly essayAnswerLinesCount?: number;
  readonly hasManualEssayLinesLock?: boolean;
  readonly onAutoFitResolvedLines?: (lines: number) => void;
  readonly onClosePreview?: () => void;
  readonly children?: React.ReactNode;
}

export default function PDFPreviewOrchestrator({
  customTitle,
  customQuestions,
  customForms,
  gradeNameAr = "",
  branchNameAr = "",
  essayAnswerLinesCount,
  hasManualEssayLinesLock = false,
  onAutoFitResolvedLines,
  onClosePreview,
  children,
}: PDFPreviewOrchestratorProps) {
  const userChangedAutoFitRef = useRef<boolean>(false);
  const userChangedTemplateRef = useRef<boolean>(false);
  const [pagesCount, setPagesCount] = useState<number>(1);
  const [selectedFormId, setSelectedFormId] = useState<string>("all");
  const [settings, setSettings] = useState<PDFPrintSettingsStateSSOT>(() =>
    resolveExamAwarePDFSettings({
      persisted: loadPersistedPDFPrintSettingsSSOT(),
      customTitle,
      customQuestions,
      customForms,
    })
  );
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [driveFeedback, setDriveFeedback] = useState<string | null>(null);
  const sheetContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings((prev) =>
      resolveExamAwarePDFSettings({
        persisted: loadPersistedPDFPrintSettingsSSOT(),
        customTitle,
        customQuestions,
        customForms,
        preserveAutoFit: userChangedAutoFitRef.current,
        preserveTemplate: userChangedTemplateRef.current,
        prevSettings: prev,
      })
    );
  }, [customTitle, customQuestions, customForms]);

  useEffect(() => {
    if (typeof essayAnswerLinesCount === "number") {
      setSettings((prev) => {
        const nextLock = hasManualEssayLinesLock ? true : prev.hasManualEssayLinesLock;
        if (
          prev.essayAnswerLinesCount === essayAnswerLinesCount &&
          prev.hasManualEssayLinesLock === nextLock
        ) {
          return prev;
        }
        return {
          ...prev,
          essayAnswerLinesCount,
          hasManualEssayLinesLock: nextLock,
        };
      });
    }
  }, [essayAnswerLinesCount, hasManualEssayLinesLock]);

  const handleAutoFitResolvedLines = useCallback(
    (resolvedLines: number) => {
      setSettings((prev) => {
        if (prev.hasManualEssayLinesLock || prev.essayAnswerLinesCount === resolvedLines) return prev;
        const updated = { ...prev, essayAnswerLinesCount: resolvedLines };
        savePersistedPDFPrintSettingsSSOT(updated);
        saveStudioGlobalContextSSOT({ essayAnswerLinesCount: resolvedLines });
        onAutoFitResolvedLines?.(resolvedLines);
        return updated;
      });
    },
    [onAutoFitResolvedLines]
  );

  const handleUpdateSettings = (next: PDFPrintSettingsStateSSOT) => {
    if (
      next.autoFitMode !== settings.autoFitMode ||
      next.targetMaxPages !== settings.targetMaxPages ||
      next.exactFontSizePt !== settings.exactFontSizePt
    ) {
      userChangedAutoFitRef.current = true;
    }
    if (next.paperTemplateId !== settings.paperTemplateId) {
      userChangedTemplateRef.current = true;
    }
    const withLock =
      next.essayAnswerLinesCount !== settings.essayAnswerLinesCount
        ? { ...next, hasManualEssayLinesLock: true }
        : next;
    setSettings(withLock);
    savePersistedPDFPrintSettingsSSOT(withLock);
    if (next.essayAnswerLinesCount !== undefined) {
      saveStudioGlobalContextSSOT({
        essayAnswerLinesCount: next.essayAnswerLinesCount,
        hasManualEssayLinesLock: withLock.hasManualEssayLinesLock,
      });
    }
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
      docKind: title.includes("مراجعة") ? "final_review" : title.includes("اختبار") || (customForms && customForms.length > 0) ? "exam" : "booklet",
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
      <PDFPreviewTopActionBar
        settings={settings}
        isToolsOpen={isToolsOpen}
        driveFeedback={driveFeedback}
        onClosePreview={onClosePreview}
        onUpdateSettings={handleUpdateSettings}
        onPrintNow={handlePrintNow}
        onSaveToDrive={handleSaveToDrive}
        onToggleTools={() => setIsToolsOpen((v) => !v)}
      />

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
                onAutoFitResolvedLines={handleAutoFitResolvedLines}
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
          onAutoFitResolvedLines={handleAutoFitResolvedLines}
        >
          {children}
        </TwoColumnNewspaperPacker>
      )}
    </div>
  );
}
