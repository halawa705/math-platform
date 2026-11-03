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
import StudioWorksheetQuestionsCountCard from "./studio-worksheet-questions-count-card";

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
  }, [gradeNameAr, branchId, lessonTitle, targetedScopeText, effectiveMcq, effectiveEssay, durationMinutes, includeAnswerLines, notationLanguage, customDirectives]);

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

    // مزامنة نمط مساحات الحل وقالب الورقة السيادي لورقة العمل
    const currentPrint = loadPersistedPDFPrintSettingsSSOT();
    savePersistedPDFPrintSettingsSSOT({
      ...currentPrint,
      paperTemplateId: "classic_sovereign",
      answerSpaceStyle: includeAnswerLines ? "dotted" : "hidden",
    });

    const selectedUnitsList = units.filter((u) => selectedUnitIds.includes(u.id));
    let derivedUnitTitle = unitTitleAr;
    if (selectedUnitsList.length > 1) {
      const uNums = selectedUnitsList
        .map((u) => u.orderIndex || u.titleArabic.match(/\d+/)?.[0])
        .filter(Boolean);
      derivedUnitTitle = uNums.length > 0 ? `الوحدات (${uNums.join("، ")})` : "الوحدات المختارة";
    } else if (selectedUnitsList.length === 1) {
      derivedUnitTitle = selectedUnitsList[0].titleArabic;
    }

    onApplyWorksheetTitleToSheet(
      buildStandardDocumentTitleSSOT({
        gradeId,
        unitTitleInput: derivedUnitTitle,
        lessonTitleInput: activeScopeDisplay,
        promptText: prompt,
        rawReplyText: reply,
      })
    );
  };

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
      <StudioWorksheetQuestionsCountCard
        mcqCount={mcqCount}
        mcqEnabled={mcqEnabled}
        essayCount={essayCount}
        essayEnabled={essayEnabled}
        durationMinutes={durationMinutes}
        includeAnswerLines={includeAnswerLines}
        onToggleMcq={(v) => {
          setMcqEnabled(v);
          persist({ mcqEnabled: v });
        }}
        onChangeMcqCount={(v) => {
          setMcqCount(v);
          persist({ mcqCount: v });
        }}
        onToggleEssay={(v) => {
          setEssayEnabled(v);
          persist({ essayEnabled: v });
        }}
        onChangeEssayCount={(v) => {
          setEssayCount(v);
          persist({ essayCount: v });
        }}
        onChangeDuration={(v) => {
          setDurationMinutes(v);
          persist({ durationMinutes: v });
        }}
        onToggleAnswerLines={(v) => {
          setIncludeAnswerLines(v);
          persist({ includeAnswerLines: v });
          const cur = loadPersistedPDFPrintSettingsSSOT();
          savePersistedPDFPrintSettingsSSOT({
            ...cur,
            answerSpaceStyle: v ? "dotted" : "hidden",
          });
        }}
      />

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
