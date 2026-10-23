"use client";

/**
 * @file studio-exam-generator-tab.tsx
 * @description تبويب إعداد الاختبار التقييمي الرسمي داخل استوديو التوليد الموحد:
 * يعرض البرومبت كاملاً في صندوق قابل للتعديل، ويفتح دفتر NotebookLM الخاص بالصف بنقرة واحدة،
 * ويستقبل رد NotebookLM ليحوله فوراً إلى أسئلة وأشكال هندسية على ورقة الـ A4.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useEffect, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { buildOfficialExamNotebookLMPrompt } from "@/core/prompts/official-exam-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";

export const MODULE_ID_STUDIO_EXAM_GENERATOR_TAB =
  "studio_exam_generator_tab" as const;

export interface StudioExamGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
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
  lessonTitle,
  branchNameAr,
  onApplyExamTitleToSheet,
  onApplyParsedQuestionsToSheet,
}: StudioExamGeneratorTabProps) {
  const [mcqCount, setMcqCount] = useState(6);
  const [proofCount, setProofCount] = useState(3);
  const [difficulty, setDifficulty] = useState<
    "standard_balanced" | "olympiad_challenge"
  >("standard_balanced");
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [notebookRawReply, setNotebookRawReply] = useState<string>("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    const generated = buildOfficialExamNotebookLMPrompt({
      gradeNameArabic: gradeNameAr,
      termNumber: 1,
      branchId,
      targetedLessonTitlesArabic: [lessonTitle],
      mcqQuestionsCount: mcqCount,
      essayAndProofQuestionsCount: proofCount,
      totalMarks: mcqCount * 1 + proofCount * 3,
      durationTextArabic: "ساعة ونصف",
      difficultyProfile: difficulty,
    });
    setEditablePrompt(generated);
  }, [gradeNameAr, branchId, lessonTitle, mcqCount, proofCount, difficulty]);

  const handleCopyAndOpenNotebook = () => {
    copyPromptAndOpenGradeNotebookLmSSOT(editablePrompt, gradeId);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const handleConvertReplyToA4Sheet = () => {
    onApplyExamTitleToSheet(`اختبار تقييمي — ${lessonTitle}`);
    const parsedIR = parseNotebookLMExamQuestionsToIR(notebookRawReply, {
      defaultBranchId: branchId,
      defaultLessonTitleArabic: lessonTitle,
    });
    if (parsedIR.length > 0 && onApplyParsedQuestionsToSheet) {
      const mapped: PrintableMathQuestionItem[] = parsedIR.map((q) => ({
        id: q.questionId,
        questionNumber: q.displayOrderNumber,
        kind:
          q.patternKind === "mcq"
            ? "mcq"
            : q.attachedGeometryFigure
            ? "essay_geometry"
            : "essay_algebra",
        branchBadgeAr: branchNameAr,
        marks: q.allocatedMarks,
        promptAr: q.promptArabic,
        mcqChoicesAr: q.mcqChoicesArabic,
        modelAnswerAr: q.modelSolutionStepsArabic.join(" "),
        geometryFigure: q.attachedGeometryFigure,
      }));
      onApplyParsedQuestionsToSheet(mapped);
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            📄 إعداد الاختبار التقييمي الرسمي ({gradeNameAr})
          </h3>
          <p className="text-xs font-bold text-slate-500">
            الدرس النشط: {lessonTitle} — اختر عدد الأسئلة وانسخ البرومبت لدفتر NotebookLM
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyAndOpenNotebook}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black shadow-sm cursor-pointer"
        >
          {copiedPrompt
            ? "✓ تم نسخ البرومبت وفتح NotebookLM!"
            : "📋 ١. نسخ البرومبت وفتح NotebookLM لهذا الصف ↗"}
        </button>
      </div>

      {/* تحديد أعداد الأسئلة (اختر + مقالي) ومستوى الصعوبة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            عدد أسئلة اختر (MCQ):
          </label>
          <input
            type="number"
            min={0}
            max={40}
            value={mcqCount}
            onChange={(e) => setMcqCount(Number(e.target.value))}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            عدد الأسئلة المقالية والبرهان:
          </label>
          <input
            type="number"
            min={0}
            max={25}
            value={proofCount}
            onChange={(e) => setProofCount(Number(e.target.value))}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            ميزان الصعوبة:
          </label>
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(
                e.target.value as "standard_balanced" | "olympiad_challenge"
              )
            }
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          >
            <option value="standard_balanced">متوازن قياسي</option>
            <option value="olympiad_challenge">متفوقين ومستويات عليا</option>
          </select>
        </div>
      </div>

      {/* صندوق البرومبت الصريح القابل للتعديل */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
          ✨ نص برومبت الاختبار الموجه إلى NotebookLM (يمكنك قراءته أو تعديله قبل النسخ):
        </label>
        <textarea
          rows={5}
          value={editablePrompt}
          onChange={(e) => setEditablePrompt(e.target.value)}
          className="w-full p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
      </div>

      {/* استقبال رد NotebookLM وتحويله فوراً لورقة الـ A4 */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200">
          📥 ٢. الصق رد NotebookLM هنا لتصيير الاختبار فوراً في ورقة الـ A4:
        </label>
        <textarea
          rows={4}
          value={notebookRawReply}
          onChange={(e) => setNotebookRawReply(e.target.value)}
          placeholder="الصق رد أسئلة الاختبار من NotebookLM هنا..."
          className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
        <button
          type="button"
          onClick={handleConvertReplyToA4Sheet}
          className="w-full min-h-[44px] py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-sm cursor-pointer"
        >
          ⚡ تصيير الأسئلة والأشكال في معاينة ورقة الـ A4 الآن ⬅
        </button>
      </div>
    </div>
  );
}
