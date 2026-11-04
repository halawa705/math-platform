"use client";

/**
 * @file studio-exam-generator-tab.tsx
 * @description تبويب الاختبار التقييمي الرسمي والإلكتروني مع المعاينة الفورية للأسئلة المستخرجة وتعديلها ونشرها وطباعتها.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import { useEffect, useState, useMemo } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import {
  buildStandardDocumentTitleSSOT,
  loadActiveCurriculumUnitsSSOT,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import { buildOfficialExamNotebookLMPrompt } from "@/core/prompts/official-exam-prompt-builder";
import { buildOnlineExamNotebookLMPrompt } from "@/core/prompts/online-exam-prompt-builder";
import type { UnitFocusWeightItem } from "./studio-curriculum-units-checklist";
import StudioExamUnitFocusWeightsCard from "./studio-exam-unit-focus-weights-card";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import { convertQuestionAssessmentIRToPrintableItem, type PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  buildStudentExamShareUrlSSOT,
  publishOnlineExamSSOT,
  refreshPublishedExamsFromSupabaseSSOT,
} from "@/features/electronic-exams-hub/published-online-exams-store";
import { loadStudioExamSettingsSSOT, saveStudioExamSettingsSSOT } from "@/core/ssot/studio-state-persistence-ssot";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioNumberStepperField from "./studio-number-stepper-field";
import StudioCustomDirectivesCard from "./studio-custom-directives-card";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";
import StudioExamOnlinePublishPanel, { type PublishedExamSummaryInfo } from "./studio-exam-online-publish-panel";
import StudioExamQuestionsInspectorCard from "./studio-exam-questions-inspector-card";
import StudioFigureDiagnosticsBanner, { type FigureDiagnosticRow } from "./studio-figure-diagnostics-banner";

export const MODULE_ID_STUDIO_EXAM_GENERATOR_TAB = "studio_exam_generator_tab" as const;

export interface StudioExamGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly unitTitleAr?: string;
  readonly lessonTitle: string;
  readonly branchNameAr: string;
  readonly selectedUnitIds?: readonly string[];
  readonly selectedLessonIds?: readonly string[];
  readonly targetedScopeText?: string;
  readonly onApplyExamTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (questions: readonly PrintableMathQuestionItem[]) => void;
}

export default function StudioExamGeneratorTab({
  gradeId = "prep-3", gradeNameAr = "الصف الثالث الإعدادي", branchId = "plane_geometry",
  unitTitleAr = "", lessonTitle, branchNameAr,
  selectedUnitIds = [], selectedLessonIds = [], targetedScopeText,
  onApplyExamTitleToSheet, onApplyParsedQuestionsToSheet,
}: StudioExamGeneratorTabProps) {
  const [initial] = useState(() => loadStudioExamSettingsSSOT());
  const [mcqCount, setMcqCount] = useState(initial.mcqCount);
  const [mcqEnabled, setMcqEnabled] = useState(initial.mcqEnabled);
  const [proofCount, setProofCount] = useState(initial.proofCount);
  const [proofEnabled, setProofEnabled] = useState(initial.proofEnabled);
  const [isOnlineMode, setIsOnlineMode] = useState(initial.isOnlineMode);
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const [customDirectives, setCustomDirectives] = useState(initial.customDirectives || "");
  const [weights, setWeights] = useState<Record<string, number>>(initial.unitFocusWeights || {});
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<readonly QuestionAssessmentIR[]>([]);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [publishedInfo, setPublishedInfo] = useState<PublishedExamSummaryInfo | null>(null);
  const [diagRows, setDiagRows] = useState<readonly FigureDiagnosticRow[]>([]);

  const persist = (p: Partial<ReturnType<typeof loadStudioExamSettingsSSOT>>) => saveStudioExamSettingsSSOT(p);

  const effectiveMcq = mcqEnabled ? mcqCount : 0;
  const effectiveProof = proofEnabled ? proofCount : 0;

  // جلب الوحدات المحددة حالياً من مستكشف المنهج
  const allCurriculumUnits = useMemo(() => loadActiveCurriculumUnitsSSOT(gradeId), [gradeId]);
  const activeSelectedUnits = useMemo(() => {
    if (!selectedUnitIds || selectedUnitIds.length === 0) return [];
    return allCurriculumUnits.filter((u) => selectedUnitIds.includes(u.id));
  }, [allCurriculumUnits, selectedUnitIds]);

  // إعداد أو تحديث الأوزان الافتراضية المتساوية للوحدات المختارة إن لم تكن محددة مسبقاً
  useEffect(() => {
    if (activeSelectedUnits.length > 1) {
      const missing = activeSelectedUnits.some((u) => typeof weights[u.id] !== "number");
      if (missing) {
        const count = activeSelectedUnits.length;
        const base = Math.floor(100 / count);
        const remainder = 100 - base * count;
        const next: Record<string, number> = { ...weights };
        activeSelectedUnits.forEach((u, idx) => {
          if (typeof next[u.id] !== "number") {
            next[u.id] = base + (idx < remainder ? 1 : 0);
          }
        });
        setWeights(next);
        persist({ unitFocusWeights: next });
      }
    }
  }, [activeSelectedUnits]);

  const handleWeightsChange = (newWeights: Record<string, number>) => {
    setWeights(newWeights);
    persist({ unitFocusWeights: newWeights });
  };

  const focusWeightItems: readonly UnitFocusWeightItem[] = useMemo(() => {
    if (activeSelectedUnits.length <= 1) return [];
    const totalQ = effectiveMcq + effectiveProof;
    return activeSelectedUnits.map((u) => {
      const pct = weights[u.id] ?? 0;
      return {
        unitId: u.id,
        unitTitle: `الوحدة ${u.orderIndex} (${u.titleArabic})`,
        unitOrderIndex: u.orderIndex,
        percentage: pct,
        questionCount: Math.round((pct / 100) * totalQ),
      };
    });
  }, [activeSelectedUnits, weights, effectiveMcq, effectiveProof]);

  useEffect(() => {
    const baseCfg = {
      gradeNameArabic: gradeNameAr, termNumber: 1 as const, branchId,
      targetedLessonTitlesArabic: [lessonTitle],
      targetedScopeArabic: targetedScopeText,
      unitFocusWeights: focusWeightItems,
      mcqQuestionsCount: effectiveMcq,
      totalMarks: Math.max(1, effectiveMcq + effectiveProof * 3), durationTextArabic: "ساعة ونصف", difficultyProfile: difficulty,
      customDirectivesArabic: customDirectives,
    };
    setPrompt(
      isOnlineMode
        ? buildOnlineExamNotebookLMPrompt({ ...baseCfg, shortAnswerQuestionsCount: effectiveProof })
        : buildOfficialExamNotebookLMPrompt({ ...baseCfg, essayAndProofQuestionsCount: effectiveProof })
    );
  }, [gradeNameAr, branchId, lessonTitle, targetedScopeText, focusWeightItems, effectiveMcq, effectiveProof, difficulty, isOnlineMode, customDirectives]);

  const handleReplyChange = (raw: string) => {
    setNotice(null);
    setReply(raw);
    if (!raw.trim()) {
      setParsedQuestions([]);
      setDiagRows([]);
      return;
    }
    const extracted = parseNotebookLMExamQuestionsToIR({
      rawText: raw, branchId, unitId: "exam-unit", lessonId: "exam-lesson", lessonTitleArabic: lessonTitle,
    });
    setParsedQuestions(extracted);
    onApplyParsedQuestionsToSheet?.(
      extracted.map((q) => convertQuestionAssessmentIRToPrintableItem(q, branchNameAr))
    );
    setDiagRows(
      extracted
        .filter((q) => q.figureDiagnosticsAr?.length)
        .map((q) => ({ questionNumber: q.displayOrderNumber, warnings: q.figureDiagnosticsAr! }))
    );
  };

  const handleUpdateQuestions = (nextQs: readonly QuestionAssessmentIR[]) => {
    setParsedQuestions(nextQs);
    // مزامنة فورية ولحظية مع ورقة الـ PDF حتى تنعكس أي سطور حل أو خلط للأسئلة أو البدائل فوراً
    onApplyParsedQuestionsToSheet?.(
      nextQs.map((q) => convertQuestionAssessmentIRToPrintableItem(q, branchNameAr))
    );
  };

  const getActiveQuestions = (): readonly QuestionAssessmentIR[] => {
    if (parsedQuestions.length > 0) return parsedQuestions;
    const fresh = parseNotebookLMExamQuestionsToIR({
      rawText: reply, branchId, unitId: "exam-unit", lessonId: "exam-lesson", lessonTitleArabic: lessonTitle,
    });
    if (fresh.length > 0) setParsedQuestions(fresh);
    return fresh;
  };

  const handleRender = () => {
    const qs = getActiveQuestions();
    if (qs.length === 0) { setNotice("⚠️ الصق رد NotebookLM أولاً ثم اضغط تصيير."); return; }
    setNotice(null);
    onApplyParsedQuestionsToSheet?.(qs.map((q) => convertQuestionAssessmentIRToPrintableItem(q, branchNameAr)));
    const activeScope = targetedScopeText || lessonTitle;
    const stdTitle = buildStandardDocumentTitleSSOT({ gradeId, unitTitleInput: unitTitleAr, lessonTitleInput: activeScope, promptText: prompt, rawReplyText: reply });
    onApplyExamTitleToSheet(stdTitle.includes("اختبار") ? stdTitle : `اختبار — ${stdTitle}`);
  };

  const handlePublish = async (p: { customTitleAr: string; durationMinutes: number; availabilityDays: number; revealAnswers: boolean }) => {
    const qs = getActiveQuestions();
    if (qs.length === 0) { setPublishMsg("⚠️ الصق رد NotebookLM أولاً ليتم استخراج الأسئلة."); return; }
    const finalTitle = p.customTitleAr.trim() || `اختبار — ${targetedScopeText || lessonTitle}`;
    let examCode = publishedInfo?.examId;
    let excl: readonly number[] = [];

    try {
      const res = await fetch("/api/exams/publish", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examCode, gradeId, gradeNameArabic: gradeNameAr, titleAr: finalTitle, durationMinutes: p.durationMinutes, availabilityDays: p.availabilityDays, revealAnswers: p.revealAnswers, questions: qs }),
      });
      const data = (await res.json()) as { success: boolean; examCode?: string; excludedQuestionNumbers?: readonly number[]; };
      if (res.ok && data.success && data.examCode) {
        examCode = data.examCode;
        excl = data.excludedQuestionNumbers ?? [];
      }
    } catch {
      // المتابعة بالحفظ المحلي حتى لا يتعطل المعلم
    }

    const created = publishOnlineExamSSOT({
      examId: examCode, gradeId, gradeNameArabic: gradeNameAr, titleAr: finalTitle,
      durationMinutes: p.durationMinutes, availabilityDays: p.availabilityDays, questions: qs,
    });
    void refreshPublishedExamsFromSupabaseSSOT();
    const shareUrl = buildStudentExamShareUrlSSOT({ examId: created.examId, gradeId });
    setPublishedInfo({ examId: created.examId, gradeId, titleAr: finalTitle, shareUrl });
    const exclNote = excl.length > 0 ? ` ⚠️ استُبعدت الأسئلة (${excl.join("، ")}) لعدم قابليتها للتصحيح الآلي.` : "";
    setPublishMsg(`✓ تم نشر «${finalTitle}» (${created.questions.length} سؤالاً) لطلاب ${gradeNameAr} لمدة ${p.availabilityDays} يوم.${exclNote}`);
  };

  const summaryAr = `${effectiveMcq} اختر • ${effectiveProof} ${isOnlineMode ? "إجابة قصيرة" : "مقالي"} • ${difficulty === "standard_balanced" ? "متوازن" : "متفوقين"}`;

  return (
    <div className="space-y-3">
      <StudioCollapsibleSectionCard icon="🔢" titleAr="أعداد الأسئلة ومستوى الصعوبة" summaryAr={summaryAr}>
        <div className="space-y-2.5 pt-2">
          <label className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-slate-800/70 text-xs font-black text-indigo-950 dark:text-teal-300 cursor-pointer">
            <span>⚡ اختبار إلكتروني (تصحيح آلي)</span>
            <input type="checkbox" checked={isOnlineMode} onChange={(e) => { setIsOnlineMode(e.target.checked); persist({ isOnlineMode: e.target.checked }); }} className="w-4 h-4 accent-indigo-700" />
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <StudioNumberStepperField
              labelAr="أسئلة اختر" value={mcqCount} min={0} max={40} enabled={mcqEnabled}
              onToggleEnabled={(v) => { setMcqEnabled(v); persist({ mcqEnabled: v }); }}
              onChange={(v) => { setMcqCount(v); persist({ mcqCount: v }); }}
            />
            <StudioNumberStepperField
              labelAr={isOnlineMode ? "أسئلة إجابة قصيرة" : "مقالي وبرهان"} value={proofCount} min={0} max={25} enabled={proofEnabled}
              onToggleEnabled={(v) => { setProofEnabled(v); persist({ proofEnabled: v }); }}
              onChange={(v) => { setProofCount(v); persist({ proofCount: v }); }}
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900">
            {([{ id: "standard_balanced", label: "متوازن" }, { id: "olympiad_challenge", label: "متفوقين" }] as const).map((o) => (
              <button
                key={o.id} type="button" onClick={() => { setDifficulty(o.id); persist({ difficulty: o.id }); }}
                className={`min-h-[44px] rounded-xl text-xs font-black cursor-pointer ${difficulty === o.id ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-sm" : "text-slate-600 dark:text-slate-400"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </StudioCollapsibleSectionCard>

      <StudioExamUnitFocusWeightsCard
        selectedUnits={activeSelectedUnits}
        totalQuestionsCount={effectiveMcq + effectiveProof}
        weights={weights}
        onChangeWeights={handleWeightsChange}
      />

      <StudioCustomDirectivesCard
        customDirectives={customDirectives}
        onChangeDirectives={(v) => { setCustomDirectives(v); persist({ customDirectives: v }); }}
      />

      <StudioSingleStagePastePanel
        stageTitleAr={`اختبار تقييمي — ${targetedScopeText || lessonTitle}`} stageHintAr="انسخ البرومبت، ثم الصق رد NotebookLM لمعاينة الأسئلة وتعديلها وطباعتها أو نشرها أونلاين."
        promptText={prompt} onChangePrompt={setPrompt}
        onCopyPromptAndOpenNotebook={() => { copyPromptAndOpenGradeNotebookLmSSOT(prompt, gradeId); setCopied(true); setTimeout(() => setCopied(false), 3000); }}
        isPromptCopied={copied} replyValue={reply} onChangeReply={handleReplyChange} replyPlaceholderAr="الصق رد أسئلة الاختبار هنا..."
      />

      <StudioFigureDiagnosticsBanner rows={diagRows} />
      <StudioExamQuestionsInspectorCard questions={parsedQuestions} onChangeQuestions={handleUpdateQuestions} />
      <StudioExamOnlinePublishPanel
        gradeNameAr={gradeNameAr} defaultTitleAr={`اختبار — ${unitTitleAr ? `${unitTitleAr} — ` : ""}${lessonTitle}`}
        statusMessageAr={publishMsg} publishedExamInfo={publishedInfo} onPublish={handlePublish}
      />
      <StudioStickyPrimaryActionBar primaryLabelAr="📄 تصيير الاختبار كـ PDF ومعاينته" onPrimary={handleRender} noticeAr={notice} />
    </div>
  );
}
