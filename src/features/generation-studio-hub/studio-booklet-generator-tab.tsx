"use client";

/**
 * @file studio-booklet-generator-tab.tsx
 * @description تبويب مذكرة الدرس مع استرجاع وحفظ الحالة وتوجيهات المعلم الخاصة وتخصيص نوع وعدد الأسئلة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 185 سطراً).
 */

import { useEffect, useMemo, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { buildStandardDocumentTitleSSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  buildBookletStageNotebookLMPrompt,
  extractIdeasFromBookletStage1Reply,
  extractQuestionsSummaryFromBookletStage2Reply,
  type BookletPromptStageNumber,
} from "@/core/prompts/booklet-three-stages-prompt-builder";
import { mergeBookletThreeStagesRepliesToPrintableItems } from "@/core/ingestion/notebooklm-booklet-stages-merger";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";
import { loadStudioBookletSettingsSSOT, saveStudioBookletSettingsSSOT } from "@/core/ssot/studio-state-persistence-ssot";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioNumberStepperField from "./studio-number-stepper-field";
import StudioCustomDirectivesCard from "./studio-custom-directives-card";
import StudioStageStepperPills from "./studio-stage-stepper-pills";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";
import StudioFigureDiagnosticsBanner, { type FigureDiagnosticRow } from "./studio-figure-diagnostics-banner";

export const MODULE_ID_STUDIO_BOOKLET_GENERATOR_TAB = "studio_booklet_generator_tab" as const;

export interface StudioBookletGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly unitTitleAr?: string;
  readonly lessonTitle: string;
  readonly lessonOrder?: number;
  readonly branchNameAr: string;
  readonly onApplyBookletTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (questions: readonly PrintableMathQuestionItem[]) => void;
}

const STAGE_COPY = {
  1: { short: "الشرح والأمثلة", title: "المرحلة ١ — الأفكار والأمثلة المحلولة", hint: "أفكار الدرس + القاعدة + أمثلة محلولة بالخطوات.", placeholder: "الصق رد المرحلة ١ هنا..." },
  2: { short: "التدريبات والواجب", title: "المرحلة ٢ — تدريبات الدرس والواجب", hint: "تقرأ أفكار المرحلة ١ وتولد التدريبات والواجب بالأعداد التي حددتها.", placeholder: "الصق رد المرحلة ٢ هنا..." },
  3: { short: "الإجابات", title: "المرحلة ٣ (اختيارية) — الإجابات النموذجية", hint: "تقرأ أسئلة المرحلة ٢ وتكتب حلولها النموذجية.", placeholder: "الصق رد المرحلة ٣ هنا..." },
} as const;

export default function StudioBookletGeneratorTab({
  gradeId = "prep-3", gradeNameAr = "الصف الثالث الإعدادي", branchId = "plane_geometry",
  unitTitleAr = "الوحدة الثالثة", lessonTitle, lessonOrder = 15, branchNameAr,
  onApplyBookletTitleToSheet, onApplyParsedQuestionsToSheet,
}: StudioBookletGeneratorTabProps) {
  const [initial] = useState(() => loadStudioBookletSettingsSSOT());
  const [activeStage, setActiveStage] = useState<BookletPromptStageNumber>(initial.activeStage);
  const [examplesPerIdea, setExamplesPerIdea] = useState(initial.examplesPerIdea);
  const [examplesEnabled, setExamplesEnabled] = useState(initial.examplesEnabled);
  const [drillsPerIdea, setDrillsPerIdea] = useState(initial.drillsPerIdea);
  const [drillsEnabled, setDrillsEnabled] = useState(initial.drillsEnabled);
  const [hwMcq, setHwMcq] = useState(initial.hwMcq);
  const [hwMcqEnabled, setHwMcqEnabled] = useState(initial.hwMcqEnabled);
  const [hwEssay, setHwEssay] = useState(initial.hwEssay);
  const [hwEssayEnabled, setHwEssayEnabled] = useState(initial.hwEssayEnabled);
  const [customDirectives, setCustomDirectives] = useState(initial.customDirectives || "");
  const [prompt, setPrompt] = useState("");
  const [replies, setReplies] = useState<Record<BookletPromptStageNumber, string>>({ 1: "", 2: "", 3: "" });
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [diagRows, setDiagRows] = useState<readonly FigureDiagnosticRow[]>([]);

  const ideas = useMemo(() => extractIdeasFromBookletStage1Reply(replies[1]), [replies]);
  const questions = useMemo(() => extractQuestionsSummaryFromBookletStage2Reply(replies[2]), [replies]);

  const effectiveExamples = examplesEnabled ? examplesPerIdea : 1;
  const effectiveDrills = drillsEnabled ? drillsPerIdea : 0;
  const effectiveHwMcq = hwMcqEnabled ? hwMcq : 0;
  const effectiveHwEssay = hwEssayEnabled ? hwEssay : 0;

  useEffect(() => {
    setPrompt(
      buildBookletStageNotebookLMPrompt({
        stageNumber: activeStage, gradeNameArabic: gradeNameAr, termNumber: 1, branchId,
        unitTitleArabic: unitTitleAr, lessonTitleArabic: lessonTitle,
        solvedExamplesPerIdea: effectiveExamples, drillsPerIdea: effectiveDrills,
        homeworkMcqCount: effectiveHwMcq, homeworkEssayCount: effectiveHwEssay,
        extractedStage1Ideas: ideas, extractedStage2Questions: questions,
        customDirectivesArabic: customDirectives,
      })
    );
  }, [activeStage, gradeNameAr, branchId, unitTitleAr, lessonTitle, effectiveExamples, effectiveDrills, effectiveHwMcq, effectiveHwEssay, ideas, questions, customDirectives]);

  const persist = (p: Partial<ReturnType<typeof loadStudioBookletSettingsSSOT>>) => saveStudioBookletSettingsSSOT(p);

  const buildPdf = (withStage3: boolean) => {
    const items = mergeBookletThreeStagesRepliesToPrintableItems({
      stage1Raw: replies[1], stage2Raw: replies[2], stage3Raw: withStage3 ? replies[3] : "",
      branchId, branchNameAr, unitId: "booklet-unit", lessonId: "booklet-lesson", lessonTitleArabic: lessonTitle,
    });
    if (items.length === 0) { setNotice("⚠️ الصق رد المرحلة ١ أو ٢ أولاً ثم اضغط إنشاء."); return; }
    setNotice(null);
    setDiagRows(items.filter((q) => q.figureDiagnosticsAr?.length).map((q) => ({ questionNumber: q.questionNumber, warnings: q.figureDiagnosticsAr! })));
    onApplyParsedQuestionsToSheet?.(items);
    onApplyBookletTitleToSheet(
      buildStandardDocumentTitleSSOT({
        gradeId, unitTitleInput: unitTitleAr, lessonTitleInput: lessonTitle, lessonOrderIndex: lessonOrder,
        promptText: prompt, rawReplyText: replies[1] || replies[2], totalIdeasCount: ideas.length > 0 ? ideas.length : undefined,
      })
    );
  };

  const stage = STAGE_COPY[activeStage];
  const summaryAr = `${examplesEnabled ? `${examplesPerIdea} أمثلة` : "بلا أمثلة"} • ${drillsEnabled ? `${drillsPerIdea} تدريبات` : "بلا تدريبات"} • واجب ${effectiveHwMcq + effectiveHwEssay} أسئلة`;

  return (
    <div className="space-y-3">
      <StudioStageStepperPills
        steps={([1, 2, 3] as const).map((n) => ({
          stageNum: n, shortTitleAr: STAGE_COPY[n].short, isFilled: replies[n].trim().length > 5, isOptional: n === 3,
        }))}
        activeStageNum={activeStage}
        onSelectStage={(n) => { const next = n as BookletPromptStageNumber; setActiveStage(next); persist({ activeStage: next }); }}
      />

      <StudioCollapsibleSectionCard icon="🔢" titleAr="أعداد الأمثلة والتدريبات والواجب" summaryAr={summaryAr}>
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <StudioNumberStepperField
            labelAr="أمثلة لكل فكرة" value={examplesPerIdea} min={1} max={10} enabled={examplesEnabled}
            onToggleEnabled={(v) => { setExamplesEnabled(v); persist({ examplesEnabled: v }); }}
            onChange={(v) => { setExamplesPerIdea(v); persist({ examplesPerIdea: v }); }}
          />
          <StudioNumberStepperField
            labelAr="تدريبات لكل فكرة" value={drillsPerIdea} min={0} max={15} enabled={drillsEnabled}
            onToggleEnabled={(v) => { setDrillsEnabled(v); persist({ drillsEnabled: v }); }}
            onChange={(v) => { setDrillsPerIdea(v); persist({ drillsPerIdea: v }); }}
          />
          <StudioNumberStepperField
            labelAr="واجب: اختر" value={hwMcq} min={0} max={30} enabled={hwMcqEnabled}
            onToggleEnabled={(v) => { setHwMcqEnabled(v); persist({ hwMcqEnabled: v }); }}
            onChange={(v) => { setHwMcq(v); persist({ hwMcq: v }); }}
          />
          <StudioNumberStepperField
            labelAr="واجب: مقالي" value={hwEssay} min={0} max={20} enabled={hwEssayEnabled}
            onToggleEnabled={(v) => { setHwEssayEnabled(v); persist({ hwEssayEnabled: v }); }}
            onChange={(v) => { setHwEssay(v); persist({ hwEssay: v }); }}
          />
        </div>
      </StudioCollapsibleSectionCard>

      <StudioCustomDirectivesCard
        customDirectives={customDirectives}
        onChangeDirectives={(v) => { setCustomDirectives(v); persist({ customDirectives: v }); }}
      />

      <StudioSingleStagePastePanel
        stageTitleAr={stage.title} stageHintAr={stage.hint} promptText={prompt} onChangePrompt={setPrompt}
        opensNotebook={activeStage === 1}
        onCopyPromptAndOpenNotebook={() => { copyPromptAndOpenGradeNotebookLmSSOT(prompt, gradeId, { openNotebook: activeStage === 1 }); setCopied(true); setTimeout(() => setCopied(false), 3000); }}
        isPromptCopied={copied} replyValue={replies[activeStage]}
        onChangeReply={(v) => { setNotice(null); setReplies((prev) => ({ ...prev, [activeStage]: v })); }}
        replyPlaceholderAr={stage.placeholder}
        contextNoteAr={activeStage === 2 && ideas.length > 0 ? `تمت قراءة ${ideas.length} أفكار من المرحلة ١` : activeStage === 3 && questions.length > 0 ? `تمت قراءة ${questions.length} سؤالاً من المرحلة ٢` : undefined}
      />

      <StudioFigureDiagnosticsBanner rows={diagRows} />
      <StudioStickyPrimaryActionBar
        primaryLabelAr="📄 إنشاء المذكرة ومعاينتها" onPrimary={() => buildPdf(replies[3].trim().length > 5)}
        secondaryLabelAr="بدون إجابات المرحلة ٣" onSecondary={() => buildPdf(false)} noticeAr={notice}
      />
    </div>
  );
}
