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
import StudioCustomDirectivesCard from "./studio-custom-directives-card";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";
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
  readonly selectedUnitIds?: readonly string[];
  readonly selectedLessonIds?: readonly string[];
  readonly targetedScopeText?: string;
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
  selectedUnitIds = [],
  selectedLessonIds = [],
  targetedScopeText,
  onApplyWorksheetTitleToSheet,
  onApplyParsedQuestionsToSheet,
}: StudioWorksheetGeneratorTabProps) {
  const [initial] = useState(() => loadStudioWorksheetSettingsSSOT());

  const [mcqCount, setMcqCount] = useState(initial.mcqCount ?? 10);
  const [mcqEnabled, setMcqEnabled] = useState(initial.mcqEnabled ?? true);
  const [essayCount, setEssayCount] = useState(initial.essayCount ?? 5);
  const [essayEnabled, setEssayEnabled] = useState(initial.essayEnabled ?? true);
  const [durationMinutes, setDurationMinutes] = useState(initial.durationMinutes ?? 25);
  const [includeAnswerLines, setIncludeAnswerLines] = useState(initial.includeAnswerLines ?? true);
  const [customDirectives, setCustomDirectives] = useState(initial.customDirectives || "");

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(initial.savedReply || "");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const persist = (p: Partial<ReturnType<typeof loadStudioWorksheetSettingsSSOT>>) =>
    saveStudioWorksheetSettingsSSOT(p);

  const activeScopeDisplay = targetedScopeText?.trim() || lessonTitle;

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

    const allUnits = loadActiveCurriculumUnitsSSOT(gradeId);
    const selectedUnitsList = allUnits.filter((u) => selectedUnitIds.includes(u.id));
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
          persist({ savedReply: v });
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
