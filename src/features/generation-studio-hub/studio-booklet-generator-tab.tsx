"use client";

/**
 * @file studio-booklet-generator-tab.tsx
 * @description تبويب مذكرة شرح الدرس بتصميم هادئ: شريط مراحل (١ ← ٢ ← ٣) يعرض مرحلة واحدة فقط في كل مرة
 * (برومبت + صندوق لصق خاص بها)، وأعداد الأسئلة داخل قسم قابل للطي، وزر إنشاء لاصق أسفل الشاشة.
 * المرحلة ٢ تقرأ أفكار المرحلة ١، والمرحلة ٣ (اختيارية) تقرأ أسئلة المرحلة ٢.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 200 سطر).
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
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioNumberStepperField from "./studio-number-stepper-field";
import StudioStageStepperPills from "./studio-stage-stepper-pills";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";

export const MODULE_ID_STUDIO_BOOKLET_GENERATOR_TAB =
  "studio_booklet_generator_tab" as const;

export interface StudioBookletGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly unitTitleAr?: string;
  readonly lessonTitle: string;
  readonly branchNameAr: string;
  readonly onApplyBookletTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (
    questions: readonly PrintableMathQuestionItem[]
  ) => void;
}

const STAGE_COPY = {
  1: {
    short: "الشرح والأمثلة",
    title: "المرحلة ١ — الأفكار والأمثلة المحلولة",
    hint: "أفكار الدرس + القاعدة + أمثلة محلولة بالخطوات.",
    placeholder: "الصق رد المرحلة ١ هنا...",
  },
  2: {
    short: "التدريبات والواجب",
    title: "المرحلة ٢ — تدريبات الدرس والواجب",
    hint: "تقرأ أفكار المرحلة ١ وتولد التدريبات والواجب بالأعداد التي حددتها.",
    placeholder: "الصق رد المرحلة ٢ هنا...",
  },
  3: {
    short: "الإجابات",
    title: "المرحلة ٣ (اختيارية) — الإجابات النموذجية",
    hint: "تقرأ أسئلة المرحلة ٢ وتكتب حلولها النموذجية.",
    placeholder: "الصق رد المرحلة ٣ هنا...",
  },
} as const;

export default function StudioBookletGeneratorTab({
  gradeId = "prep-3",
  gradeNameAr = "الصف الثالث الإعدادي",
  branchId = "plane_geometry",
  unitTitleAr = "الوحدة الثالثة",
  lessonTitle,
  branchNameAr,
  onApplyBookletTitleToSheet,
  onApplyParsedQuestionsToSheet,
}: StudioBookletGeneratorTabProps) {
  const [activeStage, setActiveStage] = useState<BookletPromptStageNumber>(1);
  const [examplesPerIdea, setExamplesPerIdea] = useState(2);
  const [drillsPerIdea, setDrillsPerIdea] = useState(2);
  const [hwMcq, setHwMcq] = useState(4);
  const [hwEssay, setHwEssay] = useState(2);
  const [prompt, setPrompt] = useState("");
  const [replies, setReplies] = useState<Record<BookletPromptStageNumber, string>>({ 1: "", 2: "", 3: "" });
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const ideas = useMemo(() => extractIdeasFromBookletStage1Reply(replies[1]), [replies]);
  const questions = useMemo(() => extractQuestionsSummaryFromBookletStage2Reply(replies[2]), [replies]);

  useEffect(() => {
    setPrompt(
      buildBookletStageNotebookLMPrompt({
        stageNumber: activeStage,
        gradeNameArabic: gradeNameAr,
        termNumber: 1,
        branchId,
        unitTitleArabic: unitTitleAr,
        lessonTitleArabic: lessonTitle,
        solvedExamplesPerIdea: examplesPerIdea,
        drillsPerIdea,
        homeworkMcqCount: hwMcq,
        homeworkEssayCount: hwEssay,
        extractedStage1Ideas: ideas,
        extractedStage2Questions: questions,
      })
    );
  }, [activeStage, gradeNameAr, branchId, unitTitleAr, lessonTitle, examplesPerIdea, drillsPerIdea, hwMcq, hwEssay, ideas, questions]);

  const buildPdf = (withStage3: boolean) => {
    const items = mergeBookletThreeStagesRepliesToPrintableItems({
      stage1Raw: replies[1],
      stage2Raw: replies[2],
      stage3Raw: withStage3 ? replies[3] : "",
      branchId,
      branchNameAr,
      unitId: "booklet-unit",
      lessonId: "booklet-lesson",
      lessonTitleArabic: lessonTitle,
    });
    if (items.length === 0) {
      setNotice("⚠️ الصق رد المرحلة ١ أو ٢ أولاً ثم اضغط إنشاء.");
      return;
    }
    setNotice(null);
    onApplyParsedQuestionsToSheet?.(items);
    const ideasCount = ideas.length > 0 ? ideas.length : undefined;
    onApplyBookletTitleToSheet(
      buildStandardDocumentTitleSSOT({
        gradeId,
        unitTitleInput: unitTitleAr,
        lessonTitleInput: lessonTitle,
        promptText: prompt,
        rawReplyText: replies[1] || replies[2],
        totalIdeasCount: ideasCount,
      })
    );
  };

  const stage = STAGE_COPY[activeStage];

  return (
    <div className="space-y-3">
      <StudioStageStepperPills
        steps={([1, 2, 3] as const).map((n) => ({
          stageNum: n,
          shortTitleAr: STAGE_COPY[n].short,
          isFilled: replies[n].trim().length > 5,
          isOptional: n === 3,
        }))}
        activeStageNum={activeStage}
        onSelectStage={(n) => setActiveStage(n as BookletPromptStageNumber)}
      />

      <StudioCollapsibleSectionCard
        icon="🔢"
        titleAr="أعداد الأمثلة والتدريبات والواجب"
        summaryAr={`${examplesPerIdea} أمثلة • ${drillsPerIdea} تدريبات • واجب ${hwMcq + hwEssay} أسئلة`}
      >
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <StudioNumberStepperField labelAr="أمثلة لكل فكرة" value={examplesPerIdea} min={1} max={10} onChange={setExamplesPerIdea} />
          <StudioNumberStepperField labelAr="تدريبات لكل فكرة" value={drillsPerIdea} min={0} max={15} onChange={setDrillsPerIdea} />
          <StudioNumberStepperField labelAr="واجب: اختر" value={hwMcq} max={30} onChange={setHwMcq} />
          <StudioNumberStepperField labelAr="واجب: مقالي" value={hwEssay} max={20} onChange={setHwEssay} />
        </div>
      </StudioCollapsibleSectionCard>

      <StudioSingleStagePastePanel
        stageTitleAr={stage.title}
        stageHintAr={stage.hint}
        promptText={prompt}
        onChangePrompt={setPrompt}
        onCopyPromptAndOpenNotebook={() => {
          copyPromptAndOpenGradeNotebookLmSSOT(prompt, gradeId);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }}
        isPromptCopied={copied}
        replyValue={replies[activeStage]}
        onChangeReply={(v) => {
          setNotice(null);
          setReplies((prev) => ({ ...prev, [activeStage]: v }));
        }}
        replyPlaceholderAr={stage.placeholder}
        contextNoteAr={
          activeStage === 2 && ideas.length > 0
            ? `تمت قراءة ${ideas.length} أفكار من المرحلة ١ وإدراجها في البرومبت`
            : activeStage === 3 && questions.length > 0
              ? `تمت قراءة ${questions.length} سؤالاً من المرحلة ٢ وإدراجها في البرومبت`
              : undefined
        }
      />

      <StudioStickyPrimaryActionBar
        primaryLabelAr="📄 إنشاء المذكرة ومعاينتها"
        onPrimary={() => buildPdf(replies[3].trim().length > 5)}
        secondaryLabelAr="بدون إجابات المرحلة ٣"
        onSecondary={() => buildPdf(false)}
        noticeAr={notice}
      />
    </div>
  );
}
