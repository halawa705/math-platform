"use client";

/**
 * @file studio-booklet-generator-tab.tsx
 * @description تبويب إعداد مذكرة شرح الدرس الشاملة بالمراحل الثلاث المتتابعة:
 * يتيح تحديد (عدد الأمثلة المحلولة لكل فكرة، عدد التدريبات لكل فكرة، عدد أسئلة اختر ومقالي في الواجب)،
 * ويعرض برومبت كل مرحلة صريحاً قابلاً للتعديل مع فتح NotebookLM الخاص بالصف بنقرة واحدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useEffect, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import {
  buildBookletStageNotebookLMPrompt,
  type BookletPromptStageNumber,
} from "@/core/prompts/booklet-three-stages-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";
import { copyPromptAndOpenGradeNotebookLmSSOT } from "@/core/ssot/teacher-identity-ssot";

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

const BOOKLET_THREE_STAGES = [
  {
    stageNum: 1 as BookletPromptStageNumber,
    titleAr: "المرحلة ١: الشرح والأمثلة المحلولة",
    descAr: "استخراج الأفكار والقوانين + أمثلة محلولة بالخطوات لكل فكرة.",
  },
  {
    stageNum: 2 as BookletPromptStageNumber,
    titleAr: "المرحلة ٢: تدريبات الفهم (حاول بنفسك)",
    descAr: "تدريبات تطبيقية فورية للطالب تحت كل فكرة من أفكار الدرس.",
  },
  {
    stageNum: 3 as BookletPromptStageNumber,
    titleAr: "المرحلة ٣: الواجب المنزلي الشامل",
    descAr: "أسئلة اختر + مسائل مقالية شاملة للدرس مع نموذج الإجابة.",
  },
] as const;

export default function StudioBookletGeneratorTab({
  gradeId = "prep-3",
  gradeNameAr = "الصف الثالث الإعدادي",
  branchId = "plane_geometry",
  unitTitleAr = "الوحدة الأولى",
  lessonTitle,
  branchNameAr,
  onApplyBookletTitleToSheet,
  onApplyParsedQuestionsToSheet,
}: StudioBookletGeneratorTabProps) {
  const [activeStage, setActiveStage] = useState<BookletPromptStageNumber>(1);
  const [solvedExamplesPerIdea, setSolvedExamplesPerIdea] = useState(2);
  const [drillsPerIdea, setDrillsPerIdea] = useState(2);
  const [homeworkMcqCount, setHomeworkMcqCount] = useState(6);
  const [homeworkEssayCount, setHomeworkEssayCount] = useState(4);
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [notebookReply, setNotebookReply] = useState<string>("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    const generated = buildBookletStageNotebookLMPrompt({
      stageNumber: activeStage,
      gradeNameArabic: gradeNameAr,
      termNumber: 1,
      branchId,
      unitTitleArabic: unitTitleAr,
      lessonTitleArabic: lessonTitle,
      solvedExamplesPerIdea,
      drillsPerIdea,
      homeworkMcqCount,
      homeworkEssayCount,
    });
    setEditablePrompt(generated);
  }, [
    activeStage,
    gradeNameAr,
    branchId,
    unitTitleAr,
    lessonTitle,
    solvedExamplesPerIdea,
    drillsPerIdea,
    homeworkMcqCount,
    homeworkEssayCount,
  ]);

  const handleCopyAndOpenNotebook = () => {
    copyPromptAndOpenGradeNotebookLmSSOT(editablePrompt, gradeId);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const handleRenderBookletReplyToA4 = () => {
    onApplyBookletTitleToSheet(`مذكرة شرح وتدريبات: ${lessonTitle}`);
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
            📘 إعداد مذكرة شرح الدرس الشاملة (المراحل الثلاث المتتابعة)
          </h3>
          <p className="text-xs font-bold text-slate-500">
            {gradeNameAr} — {lessonTitle}
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

      {/* أزرار المراحل الثلاث للمذكرة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {BOOKLET_THREE_STAGES.map((st) => {
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

      {/* تخصيص أعداد الأمثلة والتدريبات والواجب */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            أمثلة محلولة لكل فكرة:
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={solvedExamplesPerIdea}
            onChange={(e) => setSolvedExamplesPerIdea(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            تدريبات لكل فكرة:
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={drillsPerIdea}
            onChange={(e) => setDrillsPerIdea(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            أسئلة اختر في الواجب:
          </label>
          <input
            type="number"
            min={0}
            max={30}
            value={homeworkMcqCount}
            onChange={(e) => setHomeworkMcqCount(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            مقالي وبرهان بالواجب:
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={homeworkEssayCount}
            onChange={(e) => setHomeworkEssayCount(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
      </div>

      {/* نص البرومبت الصريح القابل للتعديل */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
          ✨ نص برومبت المرحلة ({activeStage}) من المذكرة (يمكنك التعديل عليه قبل النسخ):
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
          📥 الصق رد NotebookLM (لمرحلة وحدة أو المراحل مجتمعة) لتصييره في مذكرة الـ A4:
        </label>
        <textarea
          rows={4}
          value={notebookReply}
          onChange={(e) => setNotebookReply(e.target.value)}
          placeholder="الصق رد NotebookLM هنا..."
          className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
        <button
          type="button"
          onClick={handleRenderBookletReplyToA4}
          className="w-full min-h-[44px] py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-sm cursor-pointer"
        >
          ⚡ تصيير محتوى المذكرة في معاينة ورقة الـ A4 الآن ⬅
        </button>
      </div>
    </div>
  );
}
