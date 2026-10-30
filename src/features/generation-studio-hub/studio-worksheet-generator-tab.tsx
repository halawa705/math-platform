"use client";

/**
 * @file studio-worksheet-generator-tab.tsx
 * @description تبويب ورقة العمل والتطبيق السريع مع استرجاع وحفظ الحالة وتوجيهات المعلم الخاصة وتخصيص نوع وعدد الأسئلة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 165 سطراً).
 */

import { useEffect, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { buildStandardDocumentTitleSSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import { buildWorksheetDrillNotebookLMPrompt } from "@/core/prompts/worksheet-drill-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import { convertQuestionAssessmentIRToPrintableItem, type PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";
import { loadStudioWorksheetSettingsSSOT, saveStudioWorksheetSettingsSSOT } from "@/core/ssot/studio-state-persistence-ssot";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioNumberStepperField from "./studio-number-stepper-field";
import StudioCustomDirectivesCard from "./studio-custom-directives-card";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";

export const MODULE_ID_STUDIO_WORKSHEET_GENERATOR_TAB = "studio_worksheet_generator_tab" as const;

export interface StudioWorksheetGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly branchNameAr?: string;
  readonly unitTitleAr?: string;
  readonly lessonTitle: string;
  readonly onApplyWorksheetTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (questions: readonly PrintableMathQuestionItem[]) => void;
}

export default function StudioWorksheetGeneratorTab({
  gradeId = "prep-3", gradeNameAr = "الصف الثالث الإعدادي", branchId = "plane_geometry",
  branchNameAr = "الرياضيات", unitTitleAr = "", lessonTitle,
  onApplyWorksheetTitleToSheet, onApplyParsedQuestionsToSheet,
}: StudioWorksheetGeneratorTabProps) {
  const [initial] = useState(() => loadStudioWorksheetSettingsSSOT());
  const [mcqCount, setMcqCount] = useState(initial.mcqCount);
  const [mcqEnabled, setMcqEnabled] = useState(initial.mcqEnabled);
  const [essayCount, setEssayCount] = useState(initial.essayCount);
  const [essayEnabled, setEssayEnabled] = useState(initial.essayEnabled);
  const [durationMinutes, setDurationMinutes] = useState(initial.durationMinutes);
  const [customDirectives, setCustomDirectives] = useState(initial.customDirectives || "");
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const persist = (p: Partial<ReturnType<typeof loadStudioWorksheetSettingsSSOT>>) => saveStudioWorksheetSettingsSSOT(p);

  const effectiveMcq = mcqEnabled ? mcqCount : 0;
  const effectiveEssay = essayEnabled ? essayCount : 0;

  useEffect(() => {
    setPrompt(
      buildWorksheetDrillNotebookLMPrompt({
        gradeNameArabic: gradeNameAr, branchId, lessonTitleArabic: lessonTitle,
        quickMcqCount: effectiveMcq, quickEssayCount: effectiveEssay, durationMinutes,
        customDirectivesArabic: customDirectives,
      })
    );
  }, [gradeNameAr, branchId, lessonTitle, effectiveMcq, effectiveEssay, durationMinutes, customDirectives]);

  const handleRender = () => {
    const parsed = parseNotebookLMExamQuestionsToIR({
      rawText: reply, branchId, unitId: "worksheet-unit", lessonId: "worksheet-lesson", lessonTitleArabic: lessonTitle,
    });
    if (parsed.length === 0) { setNotice("⚠️ الصق رد NotebookLM أولاً ثم اضغط تصيير."); return; }
    setNotice(null);
    onApplyParsedQuestionsToSheet?.(parsed.map((q) => convertQuestionAssessmentIRToPrintableItem(q, branchNameAr)));
    onApplyWorksheetTitleToSheet(buildStandardDocumentTitleSSOT({
      gradeId, unitTitleInput: unitTitleAr, lessonTitleInput: lessonTitle, promptText: prompt, rawReplyText: reply,
    }));
  };

  const summaryAr = `${effectiveMcq} اختر • ${effectiveEssay} مقالي • ${durationMinutes} دقيقة`;

  return (
    <div className="space-y-3">
      <StudioCollapsibleSectionCard icon="🔢" titleAr="أعداد الأسئلة وزمن الحل" summaryAr={summaryAr}>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <StudioNumberStepperField
            labelAr="اختر" value={mcqCount} min={0} max={25} enabled={mcqEnabled}
            onToggleEnabled={(v) => { setMcqEnabled(v); persist({ mcqEnabled: v }); }}
            onChange={(v) => { setMcqCount(v); persist({ mcqCount: v }); }}
          />
          <StudioNumberStepperField
            labelAr="مقالي" value={essayCount} min={0} max={15} enabled={essayEnabled}
            onToggleEnabled={(v) => { setEssayEnabled(v); persist({ essayEnabled: v }); }}
            onChange={(v) => { setEssayCount(v); persist({ essayCount: v }); }}
          />
          <StudioNumberStepperField
            labelAr="الزمن (د)" value={durationMinutes} min={5} max={60}
            onChange={(v) => { setDurationMinutes(v); persist({ durationMinutes: v }); }}
          />
        </div>
      </StudioCollapsibleSectionCard>

      <StudioCustomDirectivesCard
        customDirectives={customDirectives}
        onChangeDirectives={(v) => { setCustomDirectives(v); persist({ customDirectives: v }); }}
      />

      <StudioSingleStagePastePanel
        stageTitleAr={`ورقة عمل — ${lessonTitle}`} stageHintAr="شيت تطبيقي سريع يُطبع في صفحة A4 واحدة."
        promptText={prompt} onChangePrompt={setPrompt}
        onCopyPromptAndOpenNotebook={() => { copyPromptAndOpenGradeNotebookLmSSOT(prompt, gradeId); setCopied(true); setTimeout(() => setCopied(false), 3000); }}
        isPromptCopied={copied} replyValue={reply} onChangeReply={(v) => { setNotice(null); setReply(v); }}
        replyPlaceholderAr="الصق رد ورقة العمل هنا..."
      />

      <StudioStickyPrimaryActionBar primaryLabelAr="⚡ تصيير ورقة العمل ومعاينتها" onPrimary={handleRender} noticeAr={notice} />
    </div>
  );
}
