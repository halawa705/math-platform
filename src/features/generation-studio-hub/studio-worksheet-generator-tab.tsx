"use client";

/**
 * @file studio-worksheet-generator-tab.tsx
 * @description تبويب ورقة العمل وبطاقة التعلم والتطبيق السريع المربوط بحقائق مستكشف المنهج،
 * مع كبسولة القوانين الذكية، والأمثلة المحلولة، وحرية كتابة أعداد الأسئلة، ومساحات الحل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 260 سطراً).
 */

import { useEffect, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import {
  buildStandardDocumentTitleSSOT,
  loadActiveCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import { buildWorksheetDrillNotebookLMPrompt } from "@/core/prompts/worksheet-drill-prompt-builder";
import { parseNotebookLMWorksheetResponse } from "@/core/ingestion/notebooklm-worksheet-parser";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  loadStudioWorksheetSettingsSSOT,
  saveStudioWorksheetSettingsSSOT,
} from "@/core/ssot/studio-state-persistence-ssot";
import {
  loadPersistedPDFPrintSettingsSSOT,
  savePersistedPDFPrintSettingsSSOT,
} from "@/core/ssot/pdf-print-settings-ssot";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioCustomDirectivesCard from "./studio-custom-directives-card";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";
import StudioCurriculumUnitsChecklist, {
  formatSelectedCurriculumScopeArabic,
} from "./studio-curriculum-units-checklist";

export const MODULE_ID_STUDIO_WORKSHEET_GENERATOR_TAB =
  "studio_worksheet_generator_tab" as const;

export interface StudioWorksheetGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly branchNameAr?: string;
  readonly unitTitleAr?: string;
  readonly lessonTitle: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly onApplyWorksheetTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (questions: readonly PrintableMathQuestionItem[]) => void;
}

export default function StudioWorksheetGeneratorTab({
  gradeId = "prep-3",
  gradeNameAr = "الصف الثالث الإعدادي",
  branchId = "plane_geometry",
  branchNameAr = "الرياضيات",
  unitTitleAr = "",
  lessonTitle,
  notationLanguage = "english",
  onApplyWorksheetTitleToSheet,
  onApplyParsedQuestionsToSheet,
}: StudioWorksheetGeneratorTabProps) {
  const [initial] = useState(() => loadStudioWorksheetSettingsSSOT());
  const [units, setUnits] = useState<readonly CurriculumUnitNode[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<readonly string[]>(initial.selectedUnitIds || []);
  const [selectedLessonIds, setSelectedLessonIds] = useState<readonly string[]>(initial.selectedLessonIds || []);

  const [mcqCount, setMcqCount] = useState(initial.mcqCount ?? 10);
  const [mcqEnabled, setMcqEnabled] = useState(initial.mcqEnabled ?? true);
  const [essayCount, setEssayCount] = useState(initial.essayCount ?? 5);
  const [essayEnabled, setEssayEnabled] = useState(initial.essayEnabled ?? true);
  const [durationMinutes, setDurationMinutes] = useState(initial.durationMinutes ?? 25);
  const [includeAnswerLines, setIncludeAnswerLines] = useState(initial.includeAnswerLines ?? true);
  const [customDirectives, setCustomDirectives] = useState(initial.customDirectives || "");

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const persist = (p: Partial<ReturnType<typeof loadStudioWorksheetSettingsSSOT>>) =>
    saveStudioWorksheetSettingsSSOT(p);

  // تحميل وحدات المنهج المعتمدة لهذا الصف
  useEffect(() => {
    const loaded = loadActiveCurriculumUnitsSSOT(gradeId);
    setUnits(loaded);
  }, [gradeId]);

  const handleToggleUnit = (unitId: string) => {
    const target = units.find((u) => u.id === unitId);
    if (!target) return;
    const isChecked = selectedUnitIds.includes(unitId);
    const unitLessonIds = target.lessons.map((l) => l.id);
    const nextUnitIds = isChecked ? selectedUnitIds.filter((id) => id !== unitId) : [...selectedUnitIds, unitId];
    const nextLessonIds = isChecked
      ? selectedLessonIds.filter((id) => !unitLessonIds.includes(id))
      : Array.from(new Set([...selectedLessonIds, ...unitLessonIds]));

    setSelectedUnitIds(nextUnitIds);
    setSelectedLessonIds(nextLessonIds);
    persist({ selectedUnitIds: nextUnitIds, selectedLessonIds: nextLessonIds });
  };

  const handleToggleLesson = (lessonId: string, unitId: string) => {
    const isChecked = selectedLessonIds.includes(lessonId);
    const nextLessonIds = isChecked ? selectedLessonIds.filter((id) => id !== lessonId) : [...selectedLessonIds, lessonId];
    const targetUnit = units.find((u) => u.id === unitId);
    let nextUnitIds = [...selectedUnitIds];
    if (targetUnit) {
      const allLessonsChecked = targetUnit.lessons.length > 0 && targetUnit.lessons.every((l) => nextLessonIds.includes(l.id));
      if (allLessonsChecked && !nextUnitIds.includes(unitId)) nextUnitIds.push(unitId);
      if (!allLessonsChecked && nextUnitIds.includes(unitId)) nextUnitIds = nextUnitIds.filter((id) => id !== unitId);
    }
    setSelectedLessonIds(nextLessonIds);
    setSelectedUnitIds(nextUnitIds);
    persist({ selectedUnitIds: nextUnitIds, selectedLessonIds: nextLessonIds });
  };

  const handleSelectAll = () => {
    const allU = units.map((u) => u.id);
    const allL = units.flatMap((u) => u.lessons.map((l) => l.id));
    setSelectedUnitIds(allU);
    setSelectedLessonIds(allL);
    persist({ selectedUnitIds: allU, selectedLessonIds: allL });
  };

  const handleDeselectAll = () => {
    setSelectedUnitIds([]);
    setSelectedLessonIds([]);
    persist({ selectedUnitIds: [], selectedLessonIds: [] });
  };

  const targetedScopeText = formatSelectedCurriculumScopeArabic(units, selectedUnitIds, selectedLessonIds);
  const activeScopeDisplay = targetedScopeText || lessonTitle;

  const effectiveMcq = mcqEnabled ? mcqCount : 0;
  const effectiveEssay = essayEnabled ? essayCount : 0;

  useEffect(() => {
    setPrompt(
      buildWorksheetDrillNotebookLMPrompt({
        gradeNameArabic: gradeNameAr,
        branchId,
        lessonTitleArabic: lessonTitle,
        targetedScopeArabic: targetedScopeText,
        quickMcqCount: effectiveMcq,
        quickEssayCount: effectiveEssay,
        durationMinutes,
        includeAnswerLines,
        notationLanguage,
        customDirectivesArabic: customDirectives,
      })
    );
  }, [
    gradeNameAr,
    branchId,
    lessonTitle,
    targetedScopeText,
    effectiveMcq,
    effectiveEssay,
    durationMinutes,
    includeAnswerLines,
    notationLanguage,
    customDirectives,
  ]);

  const handleRender = () => {
    const parsed = parseNotebookLMWorksheetResponse({
      rawText: reply,
      branchId,
      branchNameAr,
      lessonTitleArabic: activeScopeDisplay,
      includeAnswerLines,
    });

    if (parsed.length === 0) {
      setNotice("⚠️ الصق رد ورقة العمل من NotebookLM أولاً ثم اضغط تصيير.");
      return;
    }

    setNotice(null);
    onApplyParsedQuestionsToSheet?.(parsed);

    // مزامنة نمط مساحات الحل مع إعدادات الطباعة للـ A4
    const currentPrint = loadPersistedPDFPrintSettingsSSOT();
    savePersistedPDFPrintSettingsSSOT({
      ...currentPrint,
      answerSpaceStyle: includeAnswerLines ? "dotted" : "hidden",
    });

    onApplyWorksheetTitleToSheet(
      buildStandardDocumentTitleSSOT({
        gradeId,
        unitTitleInput: unitTitleAr,
        lessonTitleInput: activeScopeDisplay,
        promptText: prompt,
        rawReplyText: reply,
      })
    );
  };

  const summaryAr = `${effectiveMcq} اختر • ${effectiveEssay} مقالي • ${durationMinutes} دقيقة`;

  return (
    <div className="space-y-3">
      {/* نطاق ورقة العمل من مستكشف المنهج بالشيك بوكس */}
      <StudioCollapsibleSectionCard
        icon="📑"
        titleAr="نطاق ورقة العمل (الوحدات والدروس من مستكشف المنهج)"
        summaryAr={activeScopeDisplay}
      >
        <div className="pt-2">
          <StudioCurriculumUnitsChecklist
            units={units}
            selectedUnitIds={selectedUnitIds}
            selectedLessonIds={selectedLessonIds}
            onToggleUnit={handleToggleUnit}
            onToggleLesson={handleToggleLesson}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </div>
      </StudioCollapsibleSectionCard>

      {/* أعداد الأسئلة وزمن الحل كتابة حرة ومساحات الإجابة */}
      <StudioCollapsibleSectionCard icon="🔢" titleAr="أعداد الأسئلة ومساحات الحل" summaryAr={summaryAr}>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-black text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={mcqEnabled}
                  onChange={(e) => {
                    setMcqEnabled(e.target.checked);
                    persist({ mcqEnabled: e.target.checked });
                  }}
                  className="rounded text-indigo-600"
                />
                <span>اختر من متعدد (MCQ)</span>
              </label>
              <input
                type="number"
                min={0}
                disabled={!mcqEnabled}
                value={mcqCount}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value || "0", 10));
                  setMcqCount(val);
                  persist({ mcqCount: val });
                }}
                className="w-full min-h-[40px] px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-center disabled:opacity-40"
              />
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-black text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={essayEnabled}
                  onChange={(e) => {
                    setEssayEnabled(e.target.checked);
                    persist({ essayEnabled: e.target.checked });
                  }}
                  className="rounded text-indigo-600"
                />
                <span>أسئلة مقالية وبرهان</span>
              </label>
              <input
                type="number"
                min={0}
                disabled={!essayEnabled}
                value={essayCount}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value || "0", 10));
                  setEssayCount(val);
                  persist({ essayCount: val });
                }}
                className="w-full min-h-[40px] px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-center disabled:opacity-40"
              />
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
              <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                <span>الزمن المقترح للحل (د)</span>
              </div>
              <input
                type="number"
                min={5}
                value={durationMinutes}
                onChange={(e) => {
                  const val = Math.max(5, parseInt(e.target.value || "25", 10));
                  setDurationMinutes(val);
                  persist({ durationMinutes: val });
                }}
                className="w-full min-h-[40px] px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-center"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={includeAnswerLines}
                onChange={(e) => {
                  setIncludeAnswerLines(e.target.checked);
                  persist({ includeAnswerLines: e.target.checked });
                  const cur = loadPersistedPDFPrintSettingsSSOT();
                  savePersistedPDFPrintSettingsSSOT({
                    ...cur,
                    answerSpaceStyle: e.target.checked ? "dotted" : "hidden",
                  });
                }}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>✍️ تضمين مساحات أسطر منقطة للحل داخل الورقة المطبوعة (Answer Lines)</span>
            </label>
          </div>
        </div>
      </StudioCollapsibleSectionCard>

      <StudioCustomDirectivesCard
        customDirectives={customDirectives}
        onChangeDirectives={(v) => {
          setCustomDirectives(v);
          persist({ customDirectives: v });
        }}
      />

      <StudioSingleStagePastePanel
        stageTitleAr={`ورقة عمل وبطاقة تعلم — ${activeScopeDisplay}`}
        stageHintAr="تشمل الفكرة العامة، القوانين الذكية، الأمثلة المحلولة، والتدريبات."
        promptText={prompt}
        onChangePrompt={setPrompt}
        onCopyPromptAndOpenNotebook={() => {
          copyPromptAndOpenGradeNotebookLmSSOT(prompt, gradeId);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }}
        isPromptCopied={copied}
        replyValue={reply}
        onChangeReply={(v) => {
          setNotice(null);
          setReply(v);
        }}
        replyPlaceholderAr="الصق رد ورقة العمل هنا..."
      />

      <StudioStickyPrimaryActionBar
        primaryLabelAr="⚡ تصيير ورقة العمل ومعاينتها"
        onPrimary={handleRender}
        noticeAr={notice}
      />
    </div>
  );
}
