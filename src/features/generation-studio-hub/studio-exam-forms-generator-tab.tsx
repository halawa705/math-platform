"use client";

/**
 * @file studio-exam-forms-generator-tab.tsx
 * @description تبويب توليد النماذج الامتحانية المتعددة مع التوزيع الديموجرافي للدروس، اختيار الصعوبة المتكافئة/المتدرجة،
 * وتدقيق منع تكرار الأفكار، وملاءمة الورقتين وربط محرك الرسوميات والـ SVG الكامل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 285 سطراً).
 */

import { useEffect, useState, useMemo } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import type { MathNotationLanguage } from "@/core/ssot/numeral-and-unit-ssot";
import { loadPersistedPDFPrintSettingsSSOT } from "@/core/ssot/pdf-print-settings-ssot";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import { buildStandardDocumentTitleSSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import { buildExamFormsNotebookLMPrompt } from "@/core/prompts/exam-forms-notebooklm-prompt-builder";
import { resolveTargetedLessonsForBlueprint } from "@/core/prompts/exam-forms-demographic-blueprint-builder";
import { parseNotebookLMExamForms, type ParsedExamFormBlock } from "@/core/ingestion/notebooklm-exam-forms-parser";
import { auditParsedExamFormsQuality } from "@/core/validation/exam-forms-coverage-and-uniqueness-auditor";
import { convertQuestionAssessmentIRToPrintableItem, type PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  loadStudioExamFormsSettingsSSOT,
  saveStudioExamFormsSettingsSSOT,
  loadStudioGlobalContextSSOT,
  saveStudioGlobalContextSSOT,
  type ExamFormsProgressionMode,
  type ExamFormsScopeKind,
} from "@/core/ssot/studio-state-persistence-ssot";
import type { PrintableExamFormGroup } from "@/core/pdf-layout-engine/printable-exam-forms-model";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioExamFormsScopeCard from "./studio-exam-forms-scope-card";
import StudioNumberStepperField from "./studio-number-stepper-field";
import StudioEssayAnswerLinesStepper from "./studio-essay-answer-lines-stepper";
import StudioCustomDirectivesCard from "./studio-custom-directives-card";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";
import StudioExamQuestionsInspectorCard from "./studio-exam-questions-inspector-card";
import StudioFigureDiagnosticsBanner, { type FigureDiagnosticRow } from "./studio-figure-diagnostics-banner";
import StudioExamFormsDifficultyAndProgressionSelector from "./studio-exam-forms-difficulty-and-progression-selector";
import StudioExamFormsAuditSummaryBanner from "./studio-exam-forms-audit-summary-banner";
import { useStudioExamFormsScopeSelection } from "./use-studio-exam-forms-scope-selection";

export const MODULE_ID_STUDIO_EXAM_FORMS_GENERATOR_TAB = "studio_exam_forms_generator_tab" as const;

export interface StudioExamFormsGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly unitTitleAr?: string;
  readonly lessonTitle: string;
  readonly branchNameAr: string;
  readonly selectedUnitIds?: readonly string[];
  readonly selectedLessonIds?: readonly string[];
  readonly targetedScopeText?: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly essayAnswerLinesCount?: number;
  readonly onChangeEssayAnswerLinesCount?: (cnt: number) => void;
  readonly onChangeScopeSelection?: (unitIds: readonly string[], lessonIds: readonly string[]) => void;
  readonly onApplyFormsTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (questions: readonly PrintableMathQuestionItem[]) => void;
  readonly onApplyExamFormsToSheet?: (forms: readonly PrintableExamFormGroup[]) => void;
}

export default function StudioExamFormsGeneratorTab({
  gradeId = "prep-3",
  gradeNameAr = "الصف الثالث الإعدادي",
  branchId = "plane_geometry",
  unitTitleAr = "",
  lessonTitle,
  branchNameAr,
  selectedUnitIds = [],
  selectedLessonIds = [],
  targetedScopeText,
  notationLanguage = "english",
  essayAnswerLinesCount,
  onChangeEssayAnswerLinesCount,
  onChangeScopeSelection,
  onApplyFormsTitleToSheet,
  onApplyParsedQuestionsToSheet,
  onApplyExamFormsToSheet,
}: StudioExamFormsGeneratorTabProps) {
  const [initial] = useState(() => loadStudioExamFormsSettingsSSOT());
  const [formsCount, setFormsCount] = useState(initial.formsCount);
  const [scopeKind, setScopeKind] = useState<ExamFormsScopeKind>(initial.scopeKind);
  const [scopeDesc, setScopeDesc] = useState(targetedScopeText || initial.targetedUnitsOrLessons || unitTitleAr || lessonTitle);
  const [mcqCount, setMcqCount] = useState(initial.mcqCount);
  const [mcqEnabled, setMcqEnabled] = useState(initial.mcqEnabled);
  const [proofCount, setProofCount] = useState(initial.proofCount);
  const [proofEnabled, setProofEnabled] = useState(initial.proofEnabled);
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const [progressionMode, setProgressionMode] = useState<ExamFormsProgressionMode>(initial.progressionMode ?? "uniform_equivalent");
  const [customDirectives, setCustomDirectives] = useState(initial.customDirectives || "");
  const [localLines, setLocalLines] = useState<number>(() => loadStudioGlobalContextSSOT().essayAnswerLinesCount ?? 2);
  const effectiveEssayLines = essayAnswerLinesCount ?? localLines;

  const persist = (p: Partial<ReturnType<typeof loadStudioExamFormsSettingsSSOT>>) => saveStudioExamFormsSettingsSSOT(p);

  const scopeSelection = useStudioExamFormsScopeSelection({
    gradeId,
    unitTitleAr,
    scopeKind,
    initialUnitIds: selectedUnitIds.length > 0 ? selectedUnitIds : initial.selectedUnitIds,
    initialLessonIds: selectedLessonIds.length > 0 ? selectedLessonIds : initial.selectedLessonIds,
    onScopeDescChanged: (d) => setScopeDesc(d),
    onScopeSelectionChanged: onChangeScopeSelection,
  });

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(initial.savedReply || "");
  const [parsedForms, setParsedForms] = useState<readonly ParsedExamFormBlock[]>([]);
  const [selectedInspectorFormIndex, setSelectedInspectorFormIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [diagRows, setDiagRows] = useState<readonly FigureDiagnosticRow[]>([]);
  const effectiveMcq = mcqEnabled ? mcqCount : 0;
  const effectiveProof = proofEnabled ? proofCount : 0;
  const totalMarksPerForm = Math.max(1, effectiveMcq + effectiveProof * 3);

  useEffect(() => {
    const finalScope = scopeDesc.trim() || unitTitleAr || lessonTitle || "الوحدات المقررة";
    setPrompt(
      buildExamFormsNotebookLMPrompt({
        gradeId, gradeNameArabic: gradeNameAr, termNumber: 1, branchId, scopeKind,
        scopeDescriptionArabic: finalScope, units: scopeSelection.units,
        selectedUnitIds: scopeSelection.selectedUnitIds, selectedLessonIds: scopeSelection.selectedLessonIds,
        formsCount, mcqQuestionsCount: effectiveMcq, essayAndProofQuestionsCount: effectiveProof,
        totalMarksPerForm, durationTextArabic: "ساعة ونصف", difficultyProfile: difficulty,
        progressionMode, notationLanguage, customDirectivesArabic: customDirectives,
      })
    );
  }, [gradeId, gradeNameAr, branchId, scopeKind, scopeDesc, unitTitleAr, lessonTitle, scopeSelection.units, scopeSelection.selectedUnitIds, scopeSelection.selectedLessonIds, formsCount, effectiveMcq, effectiveProof, totalMarksPerForm, difficulty, progressionMode, notationLanguage, customDirectives]);

  const targetedLessonsList = useMemo(
    () =>
      resolveTargetedLessonsForBlueprint({
        units: scopeSelection.units,
        selectedUnitIds: scopeSelection.selectedUnitIds,
        selectedLessonIds: scopeSelection.selectedLessonIds,
        scopeDescriptionArabic: scopeDesc,
      }).map((l) => l.lessonTitleArabic),
    [scopeSelection.units, scopeSelection.selectedUnitIds, scopeSelection.selectedLessonIds, scopeDesc]
  );

  const auditReport = useMemo(() => {
    if (parsedForms.length === 0) return null;
    return auditParsedExamFormsQuality({
      forms: parsedForms,
      expectedFormsCount: formsCount,
      expectedMcqPerForm: effectiveMcq,
      expectedEssayPerForm: effectiveProof,
      targetedLessonTitles: targetedLessonsList,
    });
  }, [parsedForms, formsCount, effectiveMcq, effectiveProof, targetedLessonsList]);

  const refreshDiagnostics = (forms: readonly ParsedExamFormBlock[]) => {
    const rows: FigureDiagnosticRow[] = [];
    for (const f of forms) {
      for (const q of f.questions) {
        if (q.figureDiagnosticsAr?.length) {
          rows.push({
            questionNumber: q.displayOrderNumber,
            warnings: q.figureDiagnosticsAr.map((w) => `[${f.formTitleAr}] ${w}`),
          });
        }
      }
    }
    setDiagRows(rows);
  };

  const handleReplyChange = (raw: string) => {
    setNotice(null);
    setReply(raw);
    persist({ savedReply: raw });
    if (!raw.trim()) { setParsedForms([]); setDiagRows([]); return; }
    const numeralMode = loadPersistedPDFPrintSettingsSSOT().numeralMode ?? "western";
    const forms = parseNotebookLMExamForms({
      rawText: raw,
      branchId,
      unitId: "forms-unit",
      lessonId: "forms-lesson",
      lessonTitleArabic: scopeDesc || lessonTitle,
      expectedFormsCount: formsCount,
      gradeId,
      notationLanguage,
      numeralMode,
    });
    setParsedForms(forms);
    refreshDiagnostics(forms);
  };

  const activeInspectorQuestions = useMemo(() => {
    if (parsedForms.length === 0) return [];
    return (parsedForms[selectedInspectorFormIndex] || parsedForms[0])?.questions ?? [];
  }, [parsedForms, selectedInspectorFormIndex]);

  const handleUpdateInspectorQuestions = (updated: readonly QuestionAssessmentIR[]) => {
    const nextForms = parsedForms.map((f, idx) => (idx === selectedInspectorFormIndex ? { ...f, questions: updated } : f));
    setParsedForms(nextForms);
    refreshDiagnostics(nextForms);
  };

  const handleRender = () => {
    if (parsedForms.length === 0 || parsedForms.every((f) => f.questions.length === 0)) {
      setNotice("⚠️ الصق رد NotebookLM أولاً ثم اضغط تصيير.");
      return;
    }
    setNotice(null);
    const scopeTitle = scopeKind === "end_of_term" ? "اختبار نهاية الترم" : scopeKind === "monthly_exam" ? "اختبار شهر" : "مراجعة تدريبية";
    const baseStdTitle = buildStandardDocumentTitleSSOT({ gradeId, unitTitleInput: unitTitleAr, lessonTitleInput: scopeDesc || lessonTitle, promptText: prompt, rawReplyText: reply });
    const finalBaseTitle = `${scopeTitle} — ${baseStdTitle}`;
    const printableForms: PrintableExamFormGroup[] = parsedForms.map((f) => ({
      formId: f.formId,
      formIndex: f.formIndex,
      formLetterAr: f.formLetterAr,
      formTitleAr: f.formTitleAr,
      fullDocumentTitleAr: `${finalBaseTitle} — ${f.formTitleAr}`,
      questions: f.questions.map((q) => {
        const item = convertQuestionAssessmentIRToPrintableItem(q, branchNameAr);
        const isMcq = q.patternKind === "mcq" || (item.mcqChoicesAr && item.mcqChoicesAr.length > 0);
        return {
          ...item,
          answerLinesCount: isMcq ? 0 : (typeof q.answerLinesCount === "number" && q.answerLinesCount > 0 ? q.answerLinesCount : effectiveEssayLines),
        };
      }),
    }));
    onApplyParsedQuestionsToSheet?.(printableForms.flatMap((f) => f.questions));
    onApplyExamFormsToSheet?.(printableForms);
    onApplyFormsTitleToSheet(finalBaseTitle);
  };

  const summaryAr = `${formsCount} نماذج • ${effectiveMcq} اختر + ${effectiveProof} مقالي • ${progressionMode === "progressive_escalating" ? "متدرج" : "متكافئ"}`;

  return (
    <div className="space-y-3">
      <StudioCollapsibleSectionCard icon="📑" titleAr="نطاق النماذج واختيار الوحدات والدروس" summaryAr={summaryAr} defaultOpen>
        <div className="space-y-2.5 pt-2">
          <StudioExamFormsScopeCard
            scopeKind={scopeKind}
            scopeDescription={scopeDesc}
            units={scopeSelection.units}
            selectedUnitIds={scopeSelection.selectedUnitIds}
            selectedLessonIds={scopeSelection.selectedLessonIds}
            onSelectScopeKind={(k) => { setScopeKind(k); persist({ scopeKind: k }); if (k === "end_of_term") scopeSelection.handleSelectAll(); }}
            onChangeScopeDescription={(d) => { setScopeDesc(d); persist({ targetedUnitsOrLessons: d }); }}
            onToggleUnit={scopeSelection.handleToggleUnit}
            onToggleLesson={scopeSelection.handleToggleLesson}
            onSelectAll={scopeSelection.handleSelectAll}
            onDeselectAll={scopeSelection.handleDeselectAll}
          />
          <div className="grid grid-cols-3 gap-2">
            <StudioNumberStepperField labelAr="عدد النماذج" value={formsCount} min={1} max={999} onChange={(v) => { setFormsCount(v); persist({ formsCount: v }); }} />
            <StudioNumberStepperField labelAr="اختر لكل نموذج" value={mcqCount} min={0} max={999} enabled={mcqEnabled} onToggleEnabled={(v) => { setMcqEnabled(v); persist({ mcqEnabled: v }); }} onChange={(v) => { setMcqCount(v); persist({ mcqCount: v }); }} />
            <StudioNumberStepperField labelAr="مقالي لكل نموذج" value={proofCount} min={0} max={999} enabled={proofEnabled} onToggleEnabled={(v) => { setProofEnabled(v); persist({ proofEnabled: v }); }} onChange={(v) => { setProofCount(v); persist({ proofCount: v }); }} />
          </div>
          <StudioEssayAnswerLinesStepper
            value={effectiveEssayLines}
            onChange={(cnt) => { setLocalLines(cnt); onChangeEssayAnswerLinesCount?.(cnt); saveStudioGlobalContextSSOT({ essayAnswerLinesCount: cnt }); }}
            compact
          />
          <StudioExamFormsDifficultyAndProgressionSelector
            formsCount={formsCount}
            difficulty={difficulty}
            progressionMode={progressionMode}
            onChangeDifficulty={(d) => { setDifficulty(d); persist({ difficulty: d }); }}
            onChangeProgressionMode={(m) => { setProgressionMode(m); persist({ progressionMode: m }); }}
          />
        </div>
      </StudioCollapsibleSectionCard>

      <StudioCustomDirectivesCard customDirectives={customDirectives} onChangeDirectives={(v) => { setCustomDirectives(v); persist({ customDirectives: v }); }} />

      <StudioSingleStagePastePanel
        stageTitleAr={`نماذج امتحانية (${formsCount} نماذج)`}
        stageHintAr="انسخ البرومبت وافتحه في NotebookLM، ثم الصق الرد لتدقيق التوزيع ومنع التكرار ومعاينة الورقتين وطباعتها."
        promptText={prompt}
        onChangePrompt={setPrompt}
        onCopyPromptAndOpenNotebook={() => { copyPromptAndOpenGradeNotebookLmSSOT(prompt, gradeId); setCopied(true); setTimeout(() => setCopied(false), 3000); }}
        isPromptCopied={copied}
        replyValue={reply}
        onChangeReply={handleReplyChange}
        replyPlaceholderAr="الصق رد النماذج المستخرجة من NotebookLM هنا..."
      />

      <StudioExamFormsAuditSummaryBanner report={auditReport} />
      <StudioFigureDiagnosticsBanner rows={diagRows} />

      {parsedForms.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-black px-2 text-slate-700 dark:text-slate-300 shrink-0">معاينة النموذج:</span>
            {parsedForms.map((f, idx) => (
              <button
                key={f.formId}
                type="button"
                onClick={() => setSelectedInspectorFormIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 cursor-pointer transition-all ${
                  selectedInspectorFormIndex === idx ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-sm" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {f.formTitleAr} ({f.questions.length} سؤالاً)
              </button>
            ))}
          </div>
          <StudioExamQuestionsInspectorCard questions={activeInspectorQuestions} gradeId={gradeId} onChangeQuestions={handleUpdateInspectorQuestions} />
        </div>
      )}

      <StudioStickyPrimaryActionBar primaryLabelAr="📄 تصيير النماذج كـ PDF ومعاينتها" onPrimary={handleRender} noticeAr={notice} />
    </div>
  );
}
