"use client";

/**
 * @file pdf-controls-grouped-tool-panel.tsx
 * @description لوحة أدوات الطباعة مجمعة في ٣ مجموعات هادئة بدلاً من ١٠ أدوات متراصة:
 * 🎨 المظهر (الخط، الحجم، السمة اللونية، الأرقام، الرموز) | 📑 المحتوى (الإجابات، الكثافة، الأعمدة، مساحة الحل) | 🏷️ الترويسة.
 * مجموعة واحدة ظاهرة في كل مرة، وكل أداة في سطر بعنوان واضح وبشريط قابل للسحب أفقياً على الهاتف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useState, type ReactNode } from "react";
import type { PDFPrintSettingsStateSSOT } from "@/core/ssot/pdf-print-settings-ssot";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import PDFNumeralSystemSwitch from "./pdf-numeral-system-switch";
import PDFFontFamilySelector from "./pdf-font-family-selector";
import PDFAnswerVisibilityMode from "./pdf-answer-visibility-mode";
import PDFExactFontSizeControl from "./pdf-exact-fontsize-control";
import PDFDensityBudgetSelector from "./pdf-density-budget-selector";
import PDFColumnsLayoutToggle from "./pdf-columns-layout-toggle";
import PDFAnswerSpaceStyleSelector from "./pdf-answer-space-style-selector";
import PDFEssayAnswerLinesControl from "./pdf-essay-answer-lines-control";
import PDFColorThemeSelector from "./pdf-color-theme-selector";
import PDFNotationDirectionSwitch from "./pdf-notation-direction-switch";
import PDFHeaderBrandingEditor from "./pdf-header-branding-editor";
import PDFAutoFitModeSelector from "./pdf-autofit-mode-selector";
import PDFPaperTemplateSelector from "./pdf-paper-template-selector";
import PDFBoldWeightToggles from "./pdf-bold-weight-toggles";

export const MODULE_ID_PDF_CONTROLS_GROUPED_TOOL_PANEL =
  "pdf_controls_grouped_tool_panel" as const;

export interface PDFControlsGroupedToolPanelProps {
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly onChangeSettings: (next: PDFPrintSettingsStateSSOT) => void;
}

const GROUP_TABS: readonly SegmentedTabItem[] = [
  { id: "look", labelAr: "المظهر", icon: "🎨" },
  { id: "content", labelAr: "المحتوى", icon: "📑" },
  { id: "header", labelAr: "الترويسة", icon: "🏷️" },
];

function ToolRow({ labelAr, children }: { readonly labelAr: string; readonly children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">{labelAr}</div>
      <div className="overflow-x-auto no-scrollbar whitespace-nowrap pb-0.5">{children}</div>
    </div>
  );
}

export default function PDFControlsGroupedToolPanel({
  settings,
  onChangeSettings,
}: PDFControlsGroupedToolPanelProps) {
  const [activeGroup, setActiveGroup] = useState<string>("look");
  const set = (patch: Partial<PDFPrintSettingsStateSSOT>) =>
    onChangeSettings({ ...settings, ...patch });

  return (
    <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        {/* اختصارات سريعة دائمة الظهور في أعلى التخصيص: حجم الخط + أزرار B للسمك */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PDFExactFontSizeControl
              currentSizePt={settings.exactFontSizePt}
              onChangeSizePt={(exactFontSizePt) =>
                set({ exactFontSizePt, autoFitMode: "off" })
              }
            />
            <button
              type="button"
              onClick={() =>
                set({
                  autoFitMode:
                    settings.autoFitMode === "off" ? "booklet_fill" : "off",
                })
              }
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-all ${
                settings.autoFitMode !== "off"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              }`}
            >
              {settings.autoFitMode !== "off"
                ? "✨ حجم الخط: تلقائي ذكي (مفعّل)"
                : "✋ حجم الخط: يدوي (اضغط لتفعيل التلقائي)"}
            </button>
          </div>
          <PDFBoldWeightToggles
            boldProseText={settings.boldProseText ?? false}
            boldMathExpressions={settings.boldMathExpressions ?? true}
            onChangeBoldProse={(boldProseText) => set({ boldProseText })}
            onChangeBoldMath={(boldMathExpressions) => set({ boldMathExpressions })}
          />
        </div>

      <SegmentedWorkspaceTabsBar tabs={GROUP_TABS} activeTabId={activeGroup} onSelectTab={setActiveGroup} />

      {activeGroup === "look" && (
        <div className="space-y-3">
          <ToolRow labelAr="قالب الورقة">
            <PDFPaperTemplateSelector
              selectedTemplateId={settings.paperTemplateId ?? "classic_sovereign"}
              onSelectTemplate={(paperTemplateId) => set({ paperTemplateId })}
            />
          </ToolRow>
          <ToolRow labelAr="نوع الخط">
            <PDFFontFamilySelector
              selectedFontId={settings.fontFamilyId}
              onSelectFont={(fontFamilyId) => set({ fontFamilyId })}
            />
          </ToolRow>
          <ToolRow labelAr="السمة اللونية">
            <PDFColorThemeSelector
              currentThemeId={settings.colorThemeId}
              onChangeThemeId={(colorThemeId) => set({ colorThemeId })}
            />
          </ToolRow>
          <ToolRow labelAr="الأرقام">
            <PDFNumeralSystemSwitch
              currentMode={settings.numeralMode}
              onChangeMode={(numeralMode) => set({ numeralMode })}
            />
          </ToolRow>
          <ToolRow labelAr="رموز الرياضيات">
            <PDFNotationDirectionSwitch
              currentNotation={settings.notationLanguage}
              onChangeNotation={(notationLanguage) => set({ notationLanguage })}
            />
          </ToolRow>
        </div>
      )}

      {activeGroup === "content" && (
        <div className="space-y-3">
          <ToolRow labelAr="الملاءمة التلقائية للصفحات">
            <PDFAutoFitModeSelector
              settings={settings}
              onChange={(patch) => set(patch)}
            />
          </ToolRow>
          <ToolRow labelAr="إظهار الإجابات">
            <PDFAnswerVisibilityMode
              currentVisibility={settings.answerVisibilityMode}
              onChangeVisibility={(answerVisibilityMode) => set({ answerVisibilityMode })}
            />
          </ToolRow>
          <ToolRow labelAr="كثافة الصفحة">
            <PDFDensityBudgetSelector
              currentDensity={settings.densityMode}
              onChangeDensity={(densityMode) => set({ densityMode })}
            />
          </ToolRow>
          {settings.paperTemplateId !== "official_school_exam" && (
            <ToolRow labelAr="الأعمدة">
              <PDFColumnsLayoutToggle
                columnsCount={settings.columnsCount}
                showDivider={settings.showColumnDivider}
                onChangeColumns={(columnsCount) => set({ columnsCount })}
                onToggleDivider={(showColumnDivider) => set({ showColumnDivider })}
              />
            </ToolRow>
          )}
          <ToolRow labelAr="مساحة حل الطالب">
            <PDFAnswerSpaceStyleSelector
              currentStyle={settings.answerSpaceStyle}
              onChangeStyle={(answerSpaceStyle) => set({ answerSpaceStyle })}
            />
          </ToolRow>
          {settings.answerSpaceStyle !== "hidden" && (
            <ToolRow labelAr="عدد سطور المقالي والبرهان">
              <PDFEssayAnswerLinesControl
                currentCount={settings.essayAnswerLinesCount ?? 3}
                onChangeCount={(essayAnswerLinesCount) => set({ essayAnswerLinesCount })}
              />
            </ToolRow>
          )}
        </div>
      )}

      {activeGroup === "header" && (
        <PDFHeaderBrandingEditor
          documentTitle={settings.customDocumentTitle}
          durationText={settings.customDurationText}
          onChangeTitle={(customDocumentTitle) => set({ customDocumentTitle })}
          onChangeDuration={(customDurationText) => set({ customDurationText })}
        />
      )}
    </div>
  );
}
