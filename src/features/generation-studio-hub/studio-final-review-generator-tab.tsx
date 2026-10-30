"use client";

/**
 * @file studio-final-review-generator-tab.tsx
 * @description تبويب المراجعة النهائية والشهرية مع استرجاع وحفظ الحالة وتخصيص نوع وعدد الأسئلة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import { useEffect, useMemo, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { buildStandardDocumentTitleSSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  buildFinalReviewNotebookLMPrompt,
  extractEssayQuestionsFromReviewStage2Reply,
  type FinalReviewScopeKind,
  type FinalReviewStageNumber,
} from "@/core/prompts/final-review-prompt-builder";
import { mergeFinalReviewThreeStagesToPrintableItems } from "@/core/ingestion/notebooklm-final-review-parser";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  loadStudioReviewSettingsSSOT,
  saveStudioReviewSettingsSSOT,
} from "@/core/ssot/studio-state-persistence-ssot";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioNumberStepperField from "./studio-number-stepper-field";
import StudioStageStepperPills from "./studio-stage-stepper-pills";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";
import StudioFigureDiagnosticsBanner, { type FigureDiagnosticRow } from "./studio-figure-diagnostics-banner";

export const MODULE_ID_STUDIO_FINAL_REVIEW_GENERATOR_TAB = "studio_final_review_generator_tab" as const;

export interface StudioFinalReviewGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly unitTitleAr?: string;
  readonly branchNameAr: string;
  readonly onApplyReviewTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (questions: readonly PrintableMathQuestionItem[]) => void;
}

const STAGE_COPY = {
  1: { short: "أسئلة اختر", title: "المرحلة ١ — أسئلة الاختيار من متعدد وإجابتها", hint: "كل سؤال بأربعة بدائل والإجابة الصحيحة تحته مباشرة.", placeholder: "الصق رد المرحلة ١ هنا..." },
  2: { short: "الأسئلة المقالية", title: "المرحلة ٢ — الأسئلة المقالية والبرهان", hint: "نصوص المسائل فقط بدون حلول لضمان عدم بتر الرد.", placeholder: "الصق رد المرحلة ٢ هنا..." },
  3: { short: "إجابات المقالي", title: "المرحلة ٣ (اختيارية) — إجابات الأسئلة المقالية", hint: "تقرأ مسائل المرحلة ٢ وتكتب حلها النموذجي بالخطوات.", placeholder: "الصق رد المرحلة ٣ هنا..." },
} as const;

export default function StudioFinalReviewGeneratorTab({
  gradeId = "prep-3",
  gradeNameAr = "الصف الثالث الإعدادي",
  branchId = "plane_geometry",
  unitTitleAr = "جميع وحدات المنهج",
  branchNameAr,
  onApplyReviewTitleToSheet,
  onApplyParsedQuestionsToSheet,
}: StudioFinalReviewGeneratorTabProps) {
  const [initial] = useState(() => loadStudioReviewSettingsSSOT());
  const [scope, setScope] = useState<FinalReviewScopeKind>(initial.scope);
  const [activeStage, setActiveStage] = useState<FinalReviewStageNumber>(initial.activeStage);
  const [mcqCount, setMcqCount] = useState(initial.mcqCount);
  const [mcqEnabled, setMcqEnabled] = useState(initial.mcqEnabled);
  const [essayCount, setEssayCount] = useState(initial.essayCount);
  const [essayEnabled, setEssayEnabled] = useState(initial.essayEnabled);
  const [prompt, setPrompt] = useState("");
  const [replies, setReplies] = useState<Record<FinalReviewStageNumber, string>>({ 1: "", 2: "", 3: "" });
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [diagRows, setDiagRows] = useState<readonly FigureDiagnosticRow[]>([]);

  const essays = useMemo(() => extractEssayQuestionsFromReviewStage2Reply(replies[2]), [replies]);

  const persist = (partial: Partial<ReturnType<typeof loadStudioReviewSettingsSSOT>>) => {
    saveStudioReviewSettingsSSOT(partial);
  };

  const effectiveMcq = mcqEnabled ? mcqCount : 0;
  const effectiveEssay = essayEnabled ? essayCount : 0;

  useEffect(() => {
    setPrompt(
      buildFinalReviewNotebookLMPrompt({
        reviewScope: scope, stageNumber: activeStage, gradeNameArabic: gradeNameAr, termNumber: 1, branchId,
        coveredUnitsTitlesArabic: unitTitleAr ? [unitTitleAr] : [],
        totalReviewQuestionsCount: Math.max(1, effectiveMcq + effectiveEssay),
        mcqCount: effectiveMcq, essayCount: effectiveEssay, extractedStage2EssayQuestions: essays,
      })
    );
  }, [scope, activeStage, gradeNameAr, branchId, unitTitleAr, effectiveMcq, effectiveEssay, essays]);

  const buildPdf = (withStage3: boolean) => {
    const items = mergeFinalReviewThreeStagesToPrintableItems({
      stage1Raw: replies[1], stage2Raw: replies[2], stage3Raw: withStage3 ? replies[3] : "",
      branchId, branchNameAr,
      titleArabic: scope === "final_exam_night_capsule" ? "المراجعة النهائية الشاملة" : "مراجعة اختبار الشهر",
    });
    if (items.length === 0) {
      setNotice("⚠️ الصق رد المرحلة ١ أو ٢ أولاً ثم اضغط إنشاء.");
      return;
    }
    setNotice(null);
    setDiagRows(
      items
        .filter((q) => q.figureDiagnosticsAr && q.figureDiagnosticsAr.length > 0)
        .map((q) => ({ questionNumber: q.questionNumber, warnings: q.figureDiagnosticsAr! }))
    );
    onApplyParsedQuestionsToSheet?.(items);
    onApplyReviewTitleToSheet(
      buildStandardDocumentTitleSSOT({
        gradeId, unitTitleInput: unitTitleAr,
        lessonTitleInput: scope === "final_exam_night_capsule" ? "المراجعة النهائية الشاملة" : "مراجعة اختبار الشهر",
        promptText: prompt, rawReplyText: replies[1] || replies[2],
      })
    );
  };

  const stage = STAGE_COPY[activeStage];
  const summaryAr = `${effectiveMcq} اختر • ${effectiveEssay} مقالي`;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900">
        {([
          { id: "final_exam_night_capsule", label: "🌟 ليلة الامتحان" },
          { id: "monthly_revision", label: "📅 مراجعة الشهر" },
        ] as const).map((opt) => (
          <button
            key={opt.id} type="button"
            onClick={() => { setScope(opt.id); persist({ scope: opt.id }); }}
            className={`min-h-[44px] rounded-xl text-xs font-black cursor-pointer ${
              scope === opt.id ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <StudioStageStepperPills
        steps={([1, 2, 3] as const).map((n) => ({
          stageNum: n, shortTitleAr: STAGE_COPY[n].short, isFilled: replies[n].trim().length > 5, isOptional: n === 3,
        }))}
        activeStageNum={activeStage}
        onSelectStage={(n) => {
          const next = n as FinalReviewStageNumber;
          setActiveStage(next);
          persist({ activeStage: next });
        }}
      />

      <StudioCollapsibleSectionCard icon="🔢" titleAr="أعداد الأسئلة" summaryAr={summaryAr}>
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <StudioNumberStepperField
            labelAr="أسئلة اختر" value={mcqCount} min={0} max={60}
            enabled={mcqEnabled} onToggleEnabled={(v) => { setMcqEnabled(v); persist({ mcqEnabled: v }); }}
            onChange={(v) => { setMcqCount(v); persist({ mcqCount: v }); }}
          />
          <StudioNumberStepperField
            labelAr="أسئلة مقالية" value={essayCount} min={0} max={40}
            enabled={essayEnabled} onToggleEnabled={(v) => { setEssayEnabled(v); persist({ essayEnabled: v }); }}
            onChange={(v) => { setEssayCount(v); persist({ essayCount: v }); }}
          />
        </div>
      </StudioCollapsibleSectionCard>

      <StudioSingleStagePastePanel
        stageTitleAr={stage.title} stageHintAr={stage.hint}
        promptText={prompt} onChangePrompt={setPrompt}
        onCopyPromptAndOpenNotebook={() => { copyPromptAndOpenGradeNotebookLmSSOT(prompt, gradeId); setCopied(true); setTimeout(() => setCopied(false), 3000); }}
        isPromptCopied={copied} replyValue={replies[activeStage]}
        onChangeReply={(v) => { setNotice(null); setReplies((prev) => ({ ...prev, [activeStage]: v })); }}
        replyPlaceholderAr={stage.placeholder}
        contextNoteAr={activeStage === 3 && essays.length > 0 ? `تمت قراءة ${essays.length} مسألة مقالية من المرحلة ٢ وإدراجها في البرومبت` : undefined}
      />

      <StudioFigureDiagnosticsBanner rows={diagRows} />
      <StudioStickyPrimaryActionBar
        primaryLabelAr="📄 إنشاء المراجعة ومعاينتها"
        onPrimary={() => buildPdf(replies[3].trim().length > 5)}
        secondaryLabelAr="بدون إجابات المرحلة ٣"
        onSecondary={() => buildPdf(false)}
        noticeAr={notice}
      />
    </div>
  );
}
