"use client";

/**
 * @file studio-worksheet-generator-tab.tsx
 * @description تبويب ورقة العمل والتطبيق السريع (صفحة A4 واحدة) بتصميم هادئ:
 * أعداد الأسئلة وزمن الحل داخل قسم قابل للطي، خطوتان واضحتان (نسخ البرومبت ← لصق الرد)، وزر تصيير لاصق.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useEffect, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { buildWorksheetDrillNotebookLMPrompt } from "@/core/prompts/worksheet-drill-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import {
  convertQuestionAssessmentIRToPrintableItem,
  type PrintableMathQuestionItem,
} from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioNumberStepperField from "./studio-number-stepper-field";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";

export const MODULE_ID_STUDIO_WORKSHEET_GENERATOR_TAB =
  "studio_worksheet_generator_tab" as const;

export interface StudioWorksheetGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly branchNameAr?: string;
  readonly lessonTitle: string;
  readonly onApplyWorksheetTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (
    questions: readonly PrintableMathQuestionItem[]
  ) => void;
}

export default function StudioWorksheetGeneratorTab({
  gradeId = "prep-3",
  gradeNameAr = "الصف الثالث الإعدادي",
  branchId = "plane_geometry",
  branchNameAr = "الرياضيات",
  lessonTitle,
  onApplyWorksheetTitleToSheet,
  onApplyParsedQuestionsToSheet,
}: StudioWorksheetGeneratorTabProps) {
  const [mcqCount, setMcqCount] = useState(5);
  const [essayCount, setEssayCount] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(
      buildWorksheetDrillNotebookLMPrompt({
        gradeNameArabic: gradeNameAr,
        branchId,
        lessonTitleArabic: lessonTitle,
        quickMcqCount: mcqCount,
        quickEssayCount: essayCount,
        durationMinutes,
      })
    );
  }, [gradeNameAr, branchId, lessonTitle, mcqCount, essayCount, durationMinutes]);

  const handleRender = () => {
    const parsed = parseNotebookLMExamQuestionsToIR({
      rawText: reply,
      branchId,
      unitId: "worksheet-unit",
      lessonId: "worksheet-lesson",
      lessonTitleArabic: lessonTitle,
    });
    if (parsed.length === 0) {
      setNotice("⚠️ الصق رد NotebookLM أولاً ثم اضغط تصيير.");
      return;
    }
    setNotice(null);
    onApplyParsedQuestionsToSheet?.(
      parsed.map((q) => convertQuestionAssessmentIRToPrintableItem(q, branchNameAr))
    );
    onApplyWorksheetTitleToSheet(`ورقة عمل تطبيقية: ${lessonTitle}`);
  };

  return (
    <div className="space-y-3">
      <StudioCollapsibleSectionCard
        icon="🔢"
        titleAr="أعداد الأسئلة وزمن الحل"
        summaryAr={`${mcqCount} اختر • ${essayCount} مقالي • ${durationMinutes} دقيقة`}
      >
        <div className="grid grid-cols-3 gap-2 pt-2">
          <StudioNumberStepperField labelAr="اختر" value={mcqCount} max={25} onChange={setMcqCount} />
          <StudioNumberStepperField labelAr="مقالي" value={essayCount} max={15} onChange={setEssayCount} />
          <StudioNumberStepperField labelAr="الزمن (د)" value={durationMinutes} min={5} max={60} onChange={setDurationMinutes} />
        </div>
      </StudioCollapsibleSectionCard>

      <StudioSingleStagePastePanel
        stageTitleAr={`ورقة عمل — ${lessonTitle}`}
        stageHintAr="شيت تطبيقي سريع يُطبع في صفحة A4 واحدة."
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
