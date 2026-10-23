"use client";

/**
 * @file studio-final-review-generator-tab.tsx
 * @description تبويب إعداد المراجعة النهائية ومراجعة الشهر بالمراحل الثلاث مع تحديد عدد أسئلة اختر والمقالي
 * وعرض البرومبت صريحاً قابلاً للتعديل وفتح NotebookLM الخاص بالصف بنقرة واحدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useEffect, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import {
  buildFinalReviewNotebookLMPrompt,
  type FinalReviewStageNumber,
} from "@/core/prompts/final-review-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";

export const MODULE_ID_STUDIO_FINAL_REVIEW_GENERATOR_TAB =
  "studio_final_review_generator_tab" as const;

export interface StudioFinalReviewGeneratorTabProps {
  readonly gradeId?: string;
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly unitTitleAr?: string;
  readonly branchNameAr: string;
  readonly onApplyReviewTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (
    questions: readonly PrintableMathQuestionItem[]
  ) => void;
}

const FINAL_REVIEW_THREE_STAGES = [
  {
    stageNum: 1 as FinalReviewStageNumber,
    titleAr: "المرحلة ١: كبسولة القوانين والنظريات",
    descAr: "تجميع مركز لجميع قوانين ونظريات الوحدات المقررة مع مثال لكل قانون.",
  },
  {
    stageNum: 2 as FinalReviewStageNumber,
    titleAr: "المرحلة ٢: بنك أسئلة اختر (MCQ)",
    descAr: "أهم أسئلة الاختيار من متعدد المتكررة في امتحانات المحافظات.",
  },
  {
    stageNum: 3 as FinalReviewStageNumber,
    titleAr: "المرحلة ٣: المسائل المقالية والبرهان",
    descAr: "المسائل الحاسمة المتوقعة في الامتحان مع خطوات الحل والبرهان الكاملة.",
  },
] as const;

export default function StudioFinalReviewGeneratorTab({
  gradeId = "prep-3",
  gradeNameAr = "الصف الثالث الإعدادي",
  branchId = "plane_geometry",
  unitTitleAr = "جميع وحدات المنهج",
  branchNameAr,
  onApplyReviewTitleToSheet,
  onApplyParsedQuestionsToSheet,
}: StudioFinalReviewGeneratorTabProps) {
  const [reviewScope, setReviewScope] = useState<
    "monthly_revision" | "final_exam_night_capsule"
  >("final_exam_night_capsule");
  const [activeStage, setActiveStage] = useState<FinalReviewStageNumber>(1);
  const [mcqCount, setMcqCount] = useState(15);
  const [essayCount, setEssayCount] = useState(8);
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [notebookReply, setNotebookReply] = useState<string>("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    const generated = buildFinalReviewNotebookLMPrompt({
      reviewScope,
      stageNumber: activeStage,
      gradeNameArabic: gradeNameAr,
      termNumber: 1,
      branchId,
      coveredUnitsTitlesArabic: unitTitleAr ? [unitTitleAr] : [],
      totalReviewQuestionsCount: mcqCount + essayCount,
      mcqCount,
      essayCount,
    });
    setEditablePrompt(generated);
  }, [reviewScope, activeStage, gradeNameAr, branchId, unitTitleAr, mcqCount, essayCount]);

  const handleCopyAndOpenNotebook = () => {
    copyPromptAndOpenGradeNotebookLmSSOT(editablePrompt, gradeId);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const handleRenderReviewToA4 = () => {
    onApplyReviewTitleToSheet(
      reviewScope === "final_exam_night_capsule"
        ? `المراجعة النهائية الشاملة — ${gradeNameAr}`
        : `مراجعة اختبار الشهر — ${gradeNameAr}`
    );
    const parsedIR = parseNotebookLMExamQuestionsToIR(notebookReply, {
      defaultBranchId: branchId,
      defaultLessonTitleArabic: unitTitleAr,
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
            🏆 إعداد المراجعة النهائية ومراجعة الشهر (المراحل الثلاث)
          </h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {gradeNameAr} — حدد عدد أسئلة اختر والمقالي وانسخ البرومبت لدفتر NotebookLM
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyAndOpenNotebook}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black shadow-sm cursor-pointer"
        >
          {copiedPrompt
            ? `✓ تم نسخ برومبت المرحلة (${activeStage}) وفتح NotebookLM!`
            : `📋 نسخ برومبت المرحلة (${activeStage}) وفتح NotebookLM ↗`}
        </button>
      </div>

      {/* نوع المراجعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setReviewScope("final_exam_night_capsule")}
          className={`p-3.5 rounded-2xl border text-right cursor-pointer ${
            reviewScope === "final_exam_night_capsule"
              ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30"
              : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="text-xs font-black">🌟 مراجعة ليلة الامتحان الشاملة</div>
          <div className="text-[11px] font-bold text-slate-500 mt-0.5">
            ملخص النظريات + بنك أسئلة اختر + أهم مسائل البرهان المتوقعة
          </div>
        </button>
        <button
          type="button"
          onClick={() => setReviewScope("monthly_revision")}
          className={`p-3.5 rounded-2xl border text-right cursor-pointer ${
            reviewScope === "monthly_revision"
              ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30"
              : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="text-xs font-black">📅 مراجعة مقرر الشهر المركزة</div>
          <div className="text-[11px] font-bold text-slate-500 mt-0.5">
            تغطية مركزة لوحدات الشهر في أقل عدد من الأوراق
          </div>
        </button>
      </div>

      {/* المراحل الثلاث للمراجعة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {FINAL_REVIEW_THREE_STAGES.map((st) => {
          const isSelected = st.stageNum === activeStage;
          return (
            <button
              key={st.stageNum}
              type="button"
              onClick={() => setActiveStage(st.stageNum)}
              className={`p-3.5 rounded-2xl border text-right transition cursor-pointer ${
                isSelected
                  ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/30 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              }`}
            >
              <div className="text-xs font-black text-slate-900 dark:text-white mb-1">
                {st.titleAr}
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                {st.descAr}
              </p>
            </button>
          );
        })}
      </div>

      {/* عدد أسئلة اختر وعدد المسائل المقالية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            عدد أسئلة اختر (MCQ) في المراجعة:
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={mcqCount}
            onChange={(e) => setMcqCount(Number(e.target.value))}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            عدد المسائل المقالية والبرهان في المراجعة:
          </label>
          <input
            type="number"
            min={1}
            max={40}
            value={essayCount}
            onChange={(e) => setEssayCount(Number(e.target.value))}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
      </div>

      {/* نص البرومبت الصريح القابل للتعديل */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
          ✨ نص برومبت المرحلة ({activeStage}) للمراجعة (يمكنك التعديل عليه قبل النسخ):
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
          📥 الصق رد المراجعة من NotebookLM هنا لتصييره في ورقة الـ A4:
        </label>
        <textarea
          rows={4}
          value={notebookReply}
          onChange={(e) => setNotebookReply(e.target.value)}
          placeholder="الصق رد المراجعة من NotebookLM هنا..."
          className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
        <button
          type="button"
          onClick={handleRenderReviewToA4}
          className="w-full min-h-[44px] py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-sm cursor-pointer"
        >
          ⚡ تصيير المراجعة في معاينة ورقة الـ A4 الآن ⬅
        </button>
      </div>
    </div>
  );
}
