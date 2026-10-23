"use client";

/**
 * @file studio-booklet-generator-tab.tsx
 * @description تبويب إعداد مذكرة شرح الدرس بالمراحل الثلاث الحقيقية المترابطة (التي تقرأ ما قبلها):
 * - المرحلة ١: الأفكار والشرح والأمثلة المحلولة وحلها (`stage1Reply`).
 * - المرحلة ٢: تقرأ أفكار المرحلة ١ وتولد تدريبات الدرس والواجب بالأعداد المختارة (`stage2Reply`) — ويمكن إنشاء المذكرة بعدها فوراً.
 * - المرحلة ٣ (اختيارية): تقرأ أسئلة المرحلة ٢ وتولد الإجابات النموذجية للتدريبات والواجب (`stage3Reply`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 198 سطراً).
 */

import { useEffect, useMemo, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import {
  buildBookletStageNotebookLMPrompt,
  extractIdeasFromBookletStage1Reply,
  extractQuestionsSummaryFromBookletStage2Reply,
  type BookletPromptStageNumber,
} from "@/core/prompts/booklet-three-stages-prompt-builder";
import { mergeBookletThreeStagesRepliesToPrintableItems } from "@/core/ingestion/notebooklm-booklet-stages-merger";
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

const BOOKLET_STAGES_META = [
  {
    stageNum: 1 as BookletPromptStageNumber,
    titleAr: "المرحلة ١: الأفكار والأمثلة المحلولة",
    descAr: "استخراج أفكار الدرس + القوانين المؤطرة + الأمثلة المحلولة وخطوات حلها.",
    placeholderAr: "الصق هنا رد المرحلة ١ (شرح الأفكار والأمثلة المحلولة)...",
  },
  {
    stageNum: 2 as BookletPromptStageNumber,
    titleAr: "المرحلة ٢: تدريبات الدرس والواجب",
    descAr: "تقرأ أفكار المرحلة ١ وتولد تدريبات الدرس والواجب (يمكن إنشاء المذكرة بعدها).",
    placeholderAr: "الصق هنا رد المرحلة ٢ (تدريبات حاول بنفسك وأسئلة الواجب)...",
  },
  {
    stageNum: 3 as BookletPromptStageNumber,
    titleAr: "المرحلة ٣ (اختيارية): إجابات التدريبات",
    descAr: "تقرأ أسئلة المرحلة ٢ وتولد الإجابات النموذجية التفصيلية للتدريبات والواجب.",
    placeholderAr: "الصق هنا رد المرحلة ٣ الاختياري (إجابات التدريبات والواجب)...",
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
  const [homeworkMcqCount, setHomeworkMcqCount] = useState(4);
  const [homeworkEssayCount, setHomeworkEssayCount] = useState(2);
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [stage1Reply, setStage1Reply] = useState<string>("");
  const [stage2Reply, setStage2Reply] = useState<string>("");
  const [stage3Reply, setStage3Reply] = useState<string>("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const extractedStage1Ideas = useMemo(
    () => extractIdeasFromBookletStage1Reply(stage1Reply),
    [stage1Reply]
  );
  const extractedStage2Questions = useMemo(
    () => extractQuestionsSummaryFromBookletStage2Reply(stage2Reply),
    [stage2Reply]
  );

  useEffect(() => {
    setEditablePrompt(
      buildBookletStageNotebookLMPrompt({
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
        extractedStage1Ideas,
        extractedStage2Questions,
      })
    );
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
    extractedStage1Ideas,
    extractedStage2Questions,
  ]);

  const getReply = (st: BookletPromptStageNumber) =>
    st === 1 ? stage1Reply : st === 2 ? stage2Reply : stage3Reply;

  const setReply = (st: BookletPromptStageNumber, val: string) => {
    setFeedbackMsg(null);
    if (st === 1) setStage1Reply(val);
    else if (st === 2) setStage2Reply(val);
    else setStage3Reply(val);
  };

  const handleBuildBookletPDF = (includeStage3Answers: boolean) => {
    if (!stage1Reply.trim() && !stage2Reply.trim() && !stage3Reply.trim()) {
      setFeedbackMsg("⚠️ يرجى لصق رد المرحلة ١ على الأقل في الصندوق المخصص أدناه قبل إنشاء ملف الـ PDF.");
      return;
    }
    const mergedItems = mergeBookletThreeStagesRepliesToPrintableItems({
      stage1Raw: stage1Reply,
      stage2Raw: stage2Reply,
      stage3Raw: includeStage3Answers ? stage3Reply : "",
      branchId,
      branchNameAr,
      unitId: "booklet-unit",
      lessonId: "booklet-lesson",
      lessonTitleArabic: lessonTitle,
    });
    if (mergedItems.length === 0) {
      setFeedbackMsg("⚠️ لم يتم العثور على محتوى كافٍ في الصناديق؛ تأكد من لصق رد NotebookLM كاملاً.");
      return;
    }
    onApplyParsedQuestionsToSheet?.(mergedItems);
    onApplyBookletTitleToSheet(
      includeStage3Answers && stage3Reply.trim()
        ? `مذكرة الشرح والتدريبات بالإجابات النموذجية: ${lessonTitle}`
        : `مذكرة شرح وتدريبات: ${lessonTitle}`
    );
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            📘 إعداد مذكرة شرح الدرس الشاملة (٣ مراحل مترابطة تقرأ ما قبلها)
          </h3>
          <p className="text-xs font-bold text-slate-500">
            {gradeNameAr} — {lessonTitle}
            {extractedStage1Ideas.length > 0 &&
              ` • ✓ تم استخراج (${extractedStage1Ideas.length}) أفكار من المرحلة ١ وتغذيتها في المرحلة ٢ و ٣`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            copyPromptAndOpenGradeNotebookLmSSOT(editablePrompt, gradeId);
            setCopiedPrompt(true);
            setTimeout(() => setCopiedPrompt(false), 3000);
          }}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black shadow-sm cursor-pointer"
        >
          {copiedPrompt
            ? `✓ تم نسخ برومبت المرحلة (${activeStage}) وفتح NotebookLM!`
            : `📋 ١. نسخ برومبت المرحلة (${activeStage}) وفتح NotebookLM ↗`}
        </button>
      </div>

      {/* بطاقات المراحل الثلاث */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {BOOKLET_STAGES_META.map((st) => {
          const isSelected = st.stageNum === activeStage;
          const hasReply = getReply(st.stageNum).trim().length > 5;
          return (
            <button
              key={st.stageNum}
              type="button"
              onClick={() => setActiveStage(st.stageNum)}
              className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                isSelected
                  ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/30 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-black text-slate-900 dark:text-white">{st.titleAr}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    hasReply
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {hasReply ? "✓ تم اللصق" : st.stageNum === 3 ? "اختياري" : "بانتظار الرد"}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-snug">
                {st.descAr}
              </p>
            </button>
          );
        })}
      </div>

      {/* التحكم في أعداد الأمثلة والتدريبات والواجب */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: "أمثلة محلولة لكل فكرة (مرحلة ١):", val: solvedExamplesPerIdea, set: setSolvedExamplesPerIdea, max: 10 },
          { label: "تدريبات لكل فكرة (مرحلة ٢):", val: drillsPerIdea, set: setDrillsPerIdea, max: 15 },
          { label: "أسئلة اختر بالواجب (مرحلة ٢):", val: homeworkMcqCount, set: setHomeworkMcqCount, max: 30 },
          { label: "مقالي بالواجب (مرحلة ٢):", val: homeworkEssayCount, set: setHomeworkEssayCount, max: 20 },
        ].map((item, idx) => (
          <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1">
              {item.label}
            </label>
            <input
              type="number"
              min={0}
              max={item.max}
              value={item.val}
              onChange={(e) => item.set(Math.max(0, Number(e.target.value)))}
              className="w-full px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
            />
          </div>
        ))}
      </div>

      {/* برومبت المرحلة المختارة */}
      <div className="space-y-1">
        <label className="block text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
          ✨ برومبت المرحلة ({activeStage}) (يقرأ تلقائياً ما تم لصقه في المرحلة السابقة):
        </label>
        <textarea
          rows={4}
          value={editablePrompt}
          onChange={(e) => setEditablePrompt(e.target.value)}
          className="w-full p-3 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
      </div>

      {/* الصناديق الثلاثة المستقلة للصق ردود NotebookLM + أزرار الإنشاء بعد المرحلة ٢ أو ٣ */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="text-xs font-black text-slate-800 dark:text-slate-200">
          📥 ٢. أماكن لصق ردود NotebookLM لكل مرحلة على حدة:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BOOKLET_STAGES_META.map((st) => {
            const isCurrent = st.stageNum === activeStage;
            const val = getReply(st.stageNum);
            return (
              <div
                key={st.stageNum}
                onClick={() => setActiveStage(st.stageNum)}
                className={`p-3 rounded-2xl border transition ${
                  isCurrent
                    ? "border-teal-600 bg-teal-50/30 dark:bg-teal-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black text-slate-900 dark:text-white">
                    📥 رد {st.titleAr}
                  </span>
                  {val.trim().length > 5 && (
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                      ✓ جاهز للدمج
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={val}
                  onChange={(e) => setReply(st.stageNum, e.target.value)}
                  placeholder={st.placeholderAr}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold leading-relaxed"
                />
              </div>
            );
          })}
        </div>

        {feedbackMsg && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black">
            {feedbackMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleBuildBookletPDF(false)}
            className="min-h-[46px] py-2.5 px-4 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black shadow-sm cursor-pointer"
          >
            📄 إنشاء المذكرة بعد المرحلة ١ أو ٢ (بدون إجابات التدريبات) ⬅
          </button>
          <button
            type="button"
            onClick={() => handleBuildBookletPDF(true)}
            className="min-h-[46px] py-2.5 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-sm cursor-pointer"
          >
            ✅ إنشاء المذكرة الكاملة شاملة المرحلة ٣ (مع الإجابات النموذجية) ⬅
          </button>
        </div>
      </div>
    </div>
  );
}
