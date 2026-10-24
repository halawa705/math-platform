"use client";

/**
 * @file studio-exam-generator-tab.tsx
 * @description تبويب الاختبار التقييمي الرسمي بتصميم هادئ: أعداد الأسئلة داخل قسم قابل للطي، خطوتان واضحتان
 * (نسخ البرومبت ← لصق الرد)، زر تصيير لاصق، ونشر إلكتروني داخل قسم مستقل قابل للطي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
 */

import { useEffect, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { buildStandardDocumentTitleSSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import { buildOfficialExamNotebookLMPrompt } from "@/core/prompts/official-exam-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import {
  convertQuestionAssessmentIRToPrintableItem,
  type PrintableMathQuestionItem,
} from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";
import { publishOnlineExamSSOT } from "@/features/electronic-exams-hub/published-online-exams-store";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioNumberStepperField from "./studio-number-stepper-field";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";
import StudioExamOnlinePublishPanel from "./studio-exam-online-publish-panel";

export const MODULE_ID_STUDIO_EXAM_GENERATOR_TAB =
  "studio_exam_generator_tab" as const;

export interface StudioExamGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly unitTitleAr?: string;
  readonly lessonTitle: string;
  readonly branchNameAr: string;
  readonly onApplyExamTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (
    questions: readonly PrintableMathQuestionItem[]
  ) => void;
}

export default function StudioExamGeneratorTab({
  gradeId = "prep-3",
  gradeNameAr = "الصف الثالث الإعدادي",
  branchId = "plane_geometry",
  unitTitleAr = "",
  lessonTitle,
  branchNameAr,
  onApplyExamTitleToSheet,
  onApplyParsedQuestionsToSheet,
}: StudioExamGeneratorTabProps) {
  const [mcqCount, setMcqCount] = useState(6);
  const [proofCount, setProofCount] = useState(3);
  const [difficulty, setDifficulty] = useState<"standard_balanced" | "olympiad_challenge">("standard_balanced");
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(
      buildOfficialExamNotebookLMPrompt({
        gradeNameArabic: gradeNameAr,
        termNumber: 1,
        branchId,
        targetedLessonTitlesArabic: [lessonTitle],
        mcqQuestionsCount: mcqCount,
        essayAndProofQuestionsCount: proofCount,
        totalMarks: mcqCount + proofCount * 3,
        durationTextArabic: "ساعة ونصف",
        difficultyProfile: difficulty,
      })
    );
  }, [gradeNameAr, branchId, lessonTitle, mcqCount, proofCount, difficulty]);

  const parseReply = () =>
    parseNotebookLMExamQuestionsToIR({
      rawText: reply,
      branchId,
      unitId: "exam-unit",
      lessonId: "exam-lesson",
      lessonTitleArabic: lessonTitle,
    });

  const handleRender = () => {
    const parsed = parseReply();
    if (parsed.length === 0) {
      setNotice("⚠️ الصق رد NotebookLM أولاً ثم اضغط تصيير.");
      return;
    }
    setNotice(null);
    onApplyParsedQuestionsToSheet?.(
      parsed.map((q) => convertQuestionAssessmentIRToPrintableItem(q, branchNameAr))
    );
    onApplyExamTitleToSheet(
      buildStandardDocumentTitleSSOT({
        gradeId,
        unitTitleInput: unitTitleAr,
        lessonTitleInput: lessonTitle,
        promptText: prompt,
        rawReplyText: reply,
      })
    );
  };

  const handlePublish = (p: { durationMinutes: number; availabilityDays: number }) => {
    const parsed = parseReply();
    if (parsed.length === 0) {
      setPublishMsg("⚠️ الصق رد NotebookLM أولاً ليتم استخراج الأسئلة.");
      return;
    }
    publishOnlineExamSSOT({
      gradeId,
      gradeNameArabic: gradeNameAr,
      titleAr: `اختبار — ${lessonTitle}`,
      durationMinutes: p.durationMinutes,
      availabilityDays: p.availabilityDays,
      questions: parsed,
    });
    setPublishMsg(`✓ تم نشر الاختبار (${parsed.length} أسئلة) لطلاب ${gradeNameAr} لمدة ${p.availabilityDays} يوم.`);
  };

  return (
    <div className="space-y-3">
      <StudioCollapsibleSectionCard
        icon="🔢"
        titleAr="أعداد الأسئلة ومستوى الصعوبة"
        summaryAr={`${mcqCount} اختر • ${proofCount} مقالي • ${difficulty === "standard_balanced" ? "متوازن" : "متفوقين"}`}
      >
        <div className="space-y-2.5 pt-2">
          <div className="grid grid-cols-2 gap-2.5">
            <StudioNumberStepperField labelAr="أسئلة اختر" value={mcqCount} max={40} onChange={setMcqCount} />
            <StudioNumberStepperField labelAr="مقالي وبرهان" value={proofCount} max={25} onChange={setProofCount} />
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900">
            {(
              [
                { id: "standard_balanced", label: "متوازن" },
                { id: "olympiad_challenge", label: "متفوقين" },
              ] as const
            ).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setDifficulty(o.id)}
                className={`min-h-[44px] rounded-xl text-xs font-black cursor-pointer ${
                  difficulty === o.id
                    ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </StudioCollapsibleSectionCard>

      <StudioSingleStagePastePanel
        stageTitleAr={`اختبار تقييمي — ${lessonTitle}`}
        stageHintAr="انسخ البرومبت، ثم الصق رد NotebookLM لتحويله إلى ورقة اختبار."
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
        replyPlaceholderAr="الصق رد أسئلة الاختبار هنا..."
      />

      <StudioExamOnlinePublishPanel
        gradeNameAr={gradeNameAr}
        statusMessageAr={publishMsg}
        onPublish={handlePublish}
      />

      <StudioStickyPrimaryActionBar
        primaryLabelAr="📄 تصيير الاختبار ومعاينته"
        onPrimary={handleRender}
        noticeAr={notice}
      />
    </div>
  );
}
