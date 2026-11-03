"use client";

/**
 * @file studio-exam-forms-generator-tab.tsx
 * @description تبويب توليد النماذج الامتحانية المتعددة والمتكافئة (A/B/C) الورقية حصراً مع المعاينة والطباعة المجمعة والمفردة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 285 سطراً).
 */

import { useEffect, useState, useMemo } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import { buildStandardDocumentTitleSSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import { buildExamFormsNotebookLMPrompt } from "@/core/prompts/exam-forms-notebooklm-prompt-builder";
import { parseNotebookLMExamForms, type ParsedExamFormBlock } from "@/core/ingestion/notebooklm-exam-forms-parser";
import { convertQuestionAssessmentIRToPrintableItem, type PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  loadStudioExamFormsSettingsSSOT,
  saveStudioExamFormsSettingsSSOT,
  type ExamFormsScopeKind,
} from "@/core/ssot/studio-state-persistence-ssot";
import type { PrintableExamFormGroup } from "@/core/pdf-layout-engine/printable-exam-forms-model";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioNumberStepperField from "./studio-number-stepper-field";
import StudioCustomDirectivesCard from "./studio-custom-directives-card";
import StudioSingleStagePastePanel from "./studio-single-stage-paste-panel";
import StudioStickyPrimaryActionBar from "./studio-sticky-primary-action-bar";
import StudioExamQuestionsInspectorCard from "./studio-exam-questions-inspector-card";
import StudioFigureDiagnosticsBanner, { type FigureDiagnosticRow } from "./studio-figure-diagnostics-banner";

export const MODULE_ID_STUDIO_EXAM_FORMS_GENERATOR_TAB = "studio_exam_forms_generator_tab" as const;

export interface StudioExamFormsGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly unitTitleAr?: string;
  readonly lessonTitle: string;
  readonly branchNameAr: string;
  readonly onApplyFormsTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (questions: readonly PrintableMathQuestionItem[]) => void;
  readonly onApplyExamFormsToSheet?: (forms: readonly PrintableExamFormGroup[]) => void;
}

const SCOPE_OPTIONS: readonly { readonly id: ExamFormsScopeKind; readonly label: string }[] = [
  { id: "monthly_exam", label: "اختبار شهر (وحدات محددة)" },
  { id: "end_of_term", label: "نهاية ترم (كامل المنهج)" },
  { id: "custom_units_review", label: "مراجعة بنماذج (دروس معينة)" },
];

export default function StudioExamFormsGeneratorTab({
  gradeId = "prep-3",
  gradeNameAr = "الصف الثالث الإعدادي",
  branchId = "plane_geometry",
  unitTitleAr = "",
  lessonTitle,
  branchNameAr,
  onApplyFormsTitleToSheet,
  onApplyParsedQuestionsToSheet,
  onApplyExamFormsToSheet,
}: StudioExamFormsGeneratorTabProps) {
  const [initial] = useState(() => loadStudioExamFormsSettingsSSOT());
  const [formsCount, setFormsCount] = useState(initial.formsCount);
  const [scopeKind, setScopeKind] = useState<ExamFormsScopeKind>(initial.scopeKind);
  const [scopeDesc, setScopeDesc] = useState(initial.targetedUnitsOrLessons || unitTitleAr || lessonTitle);
  const [mcqCount, setMcqCount] = useState(initial.mcqCount);
  const [mcqEnabled, setMcqEnabled] = useState(initial.mcqEnabled);
  const [proofCount, setProofCount] = useState(initial.proofCount);
  const [proofEnabled, setProofEnabled] = useState(initial.proofEnabled);
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const [customDirectives, setCustomDirectives] = useState(initial.customDirectives || "");

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [parsedForms, setParsedForms] = useState<readonly ParsedExamFormBlock[]>([]);
  const [selectedInspectorFormIndex, setSelectedInspectorFormIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [diagRows, setDiagRows] = useState<readonly FigureDiagnosticRow[]>([]);

  const persist = (p: Partial<ReturnType<typeof loadStudioExamFormsSettingsSSOT>>) =>
    saveStudioExamFormsSettingsSSOT(p);

  const effectiveMcq = mcqEnabled ? mcqCount : 0;
  const effectiveProof = proofEnabled ? proofCount : 0;
  const totalMarksPerForm = Math.max(1, effectiveMcq + effectiveProof * 3);

  useEffect(() => {
    const finalScope = scopeDesc.trim() || unitTitleAr || lessonTitle || "الوحدات المقررة";
    const built = buildExamFormsNotebookLMPrompt({
      gradeNameArabic: gradeNameAr,
      termNumber: 1,
      branchId,
      scopeKind,
      scopeDescriptionArabic: finalScope,
      formsCount,
      mcqQuestionsCount: effectiveMcq,
      essayAndProofQuestionsCount: effectiveProof,
      totalMarksPerForm,
      durationTextArabic: "ساعة ونصف",
      difficultyProfile: difficulty,
      customDirectivesArabic: customDirectives,
    });
    setPrompt(built);
  }, [gradeNameAr, branchId, scopeKind, scopeDesc, unitTitleAr, lessonTitle, formsCount, effectiveMcq, effectiveProof, totalMarksPerForm, difficulty, customDirectives]);

  const handleReplyChange = (raw: string) => {
    setNotice(null);
    setReply(raw);
    if (!raw.trim()) {
      setParsedForms([]);
      setDiagRows([]);
      return;
    }

    const forms = parseNotebookLMExamForms({
      rawText: raw,
      branchId,
      unitId: "forms-unit",
      lessonId: "forms-lesson",
      lessonTitleArabic: scopeDesc || lessonTitle,
      expectedFormsCount: formsCount,
    });
    setParsedForms(forms);

    const allQs = forms.flatMap((f) => f.questions);
    setDiagRows(
      allQs
        .filter((q) => q.figureDiagnosticsAr?.length)
        .map((q) => ({ questionNumber: q.displayOrderNumber, warnings: q.figureDiagnosticsAr! }))
    );
  };

  const activeInspectorQuestions = useMemo(() => {
    if (parsedForms.length === 0) return [];
    const targetForm = parsedForms[selectedInspectorFormIndex] || parsedForms[0];
    return targetForm?.questions ?? [];
  }, [parsedForms, selectedInspectorFormIndex]);

  const handleUpdateInspectorQuestions = (updated: readonly QuestionAssessmentIR[]) => {
    setParsedForms((prev) =>
      prev.map((f, idx) => (idx === selectedInspectorFormIndex ? { ...f, questions: updated } : f))
    );
  };

  const handleRender = () => {
    if (parsedForms.length === 0 || parsedForms.every((f) => f.questions.length === 0)) {
      setNotice("⚠️ الصق رد NotebookLM أولاً ثم اضغط تصيير.");
      return;
    }
    setNotice(null);

    const scopeTitle =
      scopeKind === "end_of_term"
        ? "اختبار نهاية الترم"
        : scopeKind === "monthly_exam"
          ? "اختبار شهر"
          : "مراجعة تدريبية";

    const baseStdTitle = buildStandardDocumentTitleSSOT({
      gradeId,
      unitTitleInput: unitTitleAr,
      lessonTitleInput: scopeDesc || lessonTitle,
      promptText: prompt,
      rawReplyText: reply,
    });

    const finalBaseTitle = `${scopeTitle} — ${baseStdTitle}`;

    const printableForms: PrintableExamFormGroup[] = parsedForms.map((f) => ({
      formId: f.formId,
      formIndex: f.formIndex,
      formLetterAr: f.formLetterAr,
      formTitleAr: f.formTitleAr,
      fullDocumentTitleAr: `${finalBaseTitle} — ${f.formTitleAr}`,
      questions: f.questions.map((q) => convertQuestionAssessmentIRToPrintableItem(q, branchNameAr)),
    }));

    const allFlatQuestions = printableForms.flatMap((f) => f.questions);
    onApplyParsedQuestionsToSheet?.(allFlatQuestions);
    onApplyExamFormsToSheet?.(printableForms);
    onApplyFormsTitleToSheet(finalBaseTitle);
  };

  const summaryAr = `${formsCount} نماذج • ${effectiveMcq} اختر • ${effectiveProof} مقالي • ${difficulty === "standard_balanced" ? "متوازن" : "متفوقين"}`;

  return (
    <div className="space-y-3">
      <StudioCollapsibleSectionCard icon="📑" titleAr="نطاق النماذج وعددها وتركيب الأسئلة" summaryAr={summaryAr}>
        <div className="space-y-2.5 pt-2">
          {/* اختيار نوع التقييم والهدف من النماذج */}
          <div className="space-y-1">
            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">🎯 الغرض من النماذج:</span>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900">
              {SCOPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setScopeKind(opt.id); persist({ scopeKind: opt.id }); }}
                  className={`min-h-[40px] px-2 rounded-xl text-[11px] font-black cursor-pointer transition-all ${
                    scopeKind === opt.id
                      ? "bg-white dark:bg-slate-800 text-indigo-950 dark:text-teal-300 shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* تحديد الوحدات والدروس المستهدفة */}
          <div className="space-y-1">
            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">📖 الوحدات والدروس المستهدفة في النماذج:</span>
            <input
              type="text"
              value={scopeDesc}
              onChange={(e) => { setScopeDesc(e.target.value); persist({ targetedUnitsOrLessons: e.target.value }); }}
              placeholder="مثال: الوحدة الأولى والثانية (أو اتركها لكامل المنهج)"
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* أعداد النماذج والأسئلة */}
          <div className="grid grid-cols-3 gap-2">
            <StudioNumberStepperField
              labelAr="عدد النماذج"
              value={formsCount}
              min={2}
              max={6}
              onChange={(v) => { setFormsCount(v); persist({ formsCount: v }); }}
            />
            <StudioNumberStepperField
              labelAr="اختر لكل نموذج"
              value={mcqCount}
              min={0}
              max={30}
              enabled={mcqEnabled}
              onToggleEnabled={(v) => { setMcqEnabled(v); persist({ mcqEnabled: v }); }}
              onChange={(v) => { setMcqCount(v); persist({ mcqCount: v }); }}
            />
            <StudioNumberStepperField
              labelAr="مقالي لكل نموذج"
              value={proofCount}
              min={0}
              max={20}
              enabled={proofEnabled}
              onToggleEnabled={(v) => { setProofEnabled(v); persist({ proofEnabled: v }); }}
              onChange={(v) => { setProofCount(v); persist({ proofCount: v }); }}
            />
          </div>

          {/* مستوى الصعوبة */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900">
            {([{ id: "standard_balanced", label: "متوازن رسمي (تدرج وزاري)" }, { id: "olympiad_challenge", label: "تحدي وتمايز (مستويات عليا)" }] as const).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => { setDifficulty(o.id); persist({ difficulty: o.id }); }}
                className={`min-h-[40px] rounded-xl text-xs font-black cursor-pointer ${
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

      <StudioCustomDirectivesCard
        customDirectives={customDirectives}
        onChangeDirectives={(v) => { setCustomDirectives(v); persist({ customDirectives: v }); }}
      />

      <StudioSingleStagePastePanel
        stageTitleAr={`نماذج امتحانية متكافئة (${formsCount} نماذج)`}
        stageHintAr="انسخ البرومبت وافتحه في NotebookLM، ثم الصق الرد لمعاينة كل نموذج بترويسته وطباعة النماذج مجتمعة أو منفردة."
        promptText={prompt}
        onChangePrompt={setPrompt}
        onCopyPromptAndOpenNotebook={() => {
          copyPromptAndOpenGradeNotebookLmSSOT(prompt, gradeId);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }}
        isPromptCopied={copied}
        replyValue={reply}
        onChangeReply={handleReplyChange}
        replyPlaceholderAr="الصق رد النماذج المستخرجة من NotebookLM هنا..."
      />

      <StudioFigureDiagnosticsBanner rows={diagRows} />

      {parsedForms.length > 0 && (
        <div className="space-y-2">
          {/* شريط اختيار النموذج للمعاينة وتعديل الأسئلة */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-black px-2 text-slate-700 dark:text-slate-300 shrink-0">معاينة النموذج:</span>
            {parsedForms.map((f, idx) => (
              <button
                key={f.formId}
                type="button"
                onClick={() => setSelectedInspectorFormIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 cursor-pointer transition-all ${
                  selectedInspectorFormIndex === idx
                    ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {f.formTitleAr} ({f.questions.length} سؤالاً)
              </button>
            ))}
          </div>

          <StudioExamQuestionsInspectorCard
            questions={activeInspectorQuestions}
            onChangeQuestions={handleUpdateInspectorQuestions}
          />
        </div>
      )}

      <StudioStickyPrimaryActionBar
        primaryLabelAr="📄 تصيير النماذج كـ PDF ومعاينتها"
        onPrimary={handleRender}
        noticeAr={notice}
      />
    </div>
  );
}
