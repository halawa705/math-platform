"use client";

/**
 * @file studio-worksheet-generator-tab.tsx
 * @description تبويب إعداد ورقة العمل والتطبيق السريع في صفحة واحدة (One-Page A4 Drill):
 * يتيح تحديد عدد أسئلة اختر وعدد الأسئلة المقالية، ويعرض البرومبت قابلاً للتعديل مع فتح NotebookLM بنقرة واحدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useEffect, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { buildWorksheetDrillNotebookLMPrompt } from "@/core/prompts/worksheet-drill-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";

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
  const [quickMcqCount, setQuickMcqCount] = useState(5);
  const [quickEssayCount, setQuickEssayCount] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [notebookReply, setNotebookReply] = useState<string>("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    const generated = buildWorksheetDrillNotebookLMPrompt({
      gradeNameArabic: gradeNameAr,
      branchId,
      lessonTitleArabic: lessonTitle,
      quickMcqCount,
      quickEssayCount,
      durationMinutes,
    });
    setEditablePrompt(generated);
  }, [gradeNameAr, branchId, lessonTitle, quickMcqCount, quickEssayCount, durationMinutes]);

  const handleCopyAndOpenNotebook = () => {
    copyPromptAndOpenGradeNotebookLmSSOT(editablePrompt, gradeId);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const handleRenderWorksheetToA4 = () => {
    onApplyWorksheetTitleToSheet(`ورقة عمل تطبيقية: ${lessonTitle}`);
    const parsedIR = parseNotebookLMExamQuestionsToIR(notebookReply, {
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
            ⚡ إعداد شيت تطبيقي سريع (ورقة A4 واحدة — ميزانية صفحة)
          </h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            لدرس: {lessonTitle} — حدد عدد أسئلة اختر والمقالي للتوزيع السريع في الحصة
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyAndOpenNotebook}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black shadow-sm cursor-pointer"
        >
          {copiedPrompt
            ? "✓ تم نسخ البرومبت وفتح NotebookLM!"
            : "📋 ١. نسخ برومبت ورقة العمل وفتح NotebookLM ↗"}
        </button>
      </div>

      {/* تحديد عدد أسئلة اختر والمقالي وزمن الحل */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            عدد أسئلة اختر (MCQ):
          </label>
          <input
            type="number"
            min={0}
            max={25}
            value={quickMcqCount}
            onChange={(e) => setQuickMcqCount(Number(e.target.value))}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            عدد المسائل المقالية:
          </label>
          <input
            type="number"
            min={0}
            max={15}
            value={quickEssayCount}
            onChange={(e) => setQuickEssayCount(Number(e.target.value))}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            زمن الشيت (بالدقائق):
          </label>
          <input
            type="number"
            min={5}
            max={60}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
      </div>

      {/* نص البرومبت الصريح القابل للتعديل */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
          ✨ نص برومبت ورقة العمل (قابل للتعديل قبل النسخ):
        </label>
        <textarea
          rows={5}
          value={editablePrompt}
          onChange={(e) => setEditablePrompt(e.target.value)}
          className="w-full p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
      </div>

      {/* لصق رد NotebookLM وتصييره في ورقة الـ A4 */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200">
          📥 ٢. الصق رد NotebookLM هنا لتصيير ورقة العمل في معاينة الـ A4:
        </label>
        <textarea
          rows={4}
          value={notebookReply}
          onChange={(e) => setNotebookReply(e.target.value)}
          placeholder="الصق رد ورقة العمل من NotebookLM هنا..."
          className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
        <button
          type="button"
          onClick={handleRenderWorksheetToA4}
          className="w-full min-h-[44px] py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-sm cursor-pointer"
        >
          ⚡ تصيير ورقة العمل في معاينة الـ A4 الآن ⬅
        </button>
      </div>
    </div>
  );
}
