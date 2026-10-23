"use client";

/**
 * @file studio-final-review-generator-tab.tsx
 * @description تبويب إعداد المراجعة النهائية ومراجعة الشهر بالمراحل الثلاث الحقيقية المترابطة:
 * 1. المرحلة ١: أسئلة الاختيار من متعدد (MCQ) وإجابتها (`stage1Reply`).
 * 2. المرحلة ٢: الأسئلة المقالية والبرهان (`stage2Reply`) — ويمكن إنشاء المراجعة بعدها مباشرة.
 * 3. المرحلة ٣ (اختيارية): تقرأ أسئلة المرحلة ٢ المقالية وتولد إجاباتها النموذجية الكاملة (`stage3Reply`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 198 سطراً).
 */

import { useEffect, useMemo, useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import {
  buildFinalReviewNotebookLMPrompt,
  extractEssayQuestionsFromReviewStage2Reply,
  type FinalReviewStageNumber,
} from "@/core/prompts/final-review-prompt-builder";
import { mergeFinalReviewThreeStagesToPrintableItems } from "@/core/ingestion/notebooklm-final-review-parser";
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
    titleAr: "المرحلة ١: أسئلة اختر وإجابتها",
    descAr: "بنك أسئلة الاختيار من متعدد (MCQ) مع الإجابة الصحيحة تحت كل سؤال.",
    placeholderAr: "الصق هنا رد المرحلة ١ (أسئلة الاختيار من متعدد وإجابتها)...",
  },
  {
    stageNum: 2 as FinalReviewStageNumber,
    titleAr: "المرحلة ٢: الأسئلة المقالية",
    descAr: "المسائل المقالية والبرهان الاستدلالي (يمكن إنشاء ملف المراجعة بعدها فوراً).",
    placeholderAr: "الصق هنا رد المرحلة ٢ (الأسئلة المقالية والبرهان)...",
  },
  {
    stageNum: 3 as FinalReviewStageNumber,
    titleAr: "المرحلة ٣ (اختيارية): إجابات المقالي",
    descAr: "تقرأ أسئلة المرحلة ٢ المقالية وتولد خطوات حلها وإجاباتها النموذجية.",
    placeholderAr: "الصق هنا رد المرحلة ٣ الاختياري (إجابات الأسئلة المقالية)...",
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
  const [stage1Reply, setStage1Reply] = useState<string>("");
  const [stage2Reply, setStage2Reply] = useState<string>("");
  const [stage3Reply, setStage3Reply] = useState<string>("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const extractedStage2Essays = useMemo(
    () => extractEssayQuestionsFromReviewStage2Reply(stage2Reply),
    [stage2Reply]
  );

  useEffect(() => {
    setEditablePrompt(
      buildFinalReviewNotebookLMPrompt({
        reviewScope,
        stageNumber: activeStage,
        gradeNameArabic: gradeNameAr,
        termNumber: 1,
        branchId,
        coveredUnitsTitlesArabic: unitTitleAr ? [unitTitleAr] : [],
        totalReviewQuestionsCount: mcqCount + essayCount,
        mcqCount,
        essayCount,
        extractedStage2EssayQuestions: extractedStage2Essays,
      })
    );
  }, [
    reviewScope,
    activeStage,
    gradeNameAr,
    branchId,
    unitTitleAr,
    mcqCount,
    essayCount,
    extractedStage2Essays,
  ]);

  const getReply = (st: FinalReviewStageNumber) =>
    st === 1 ? stage1Reply : st === 2 ? stage2Reply : stage3Reply;

  const setReply = (st: FinalReviewStageNumber, val: string) => {
    setFeedbackMsg(null);
    if (st === 1) setStage1Reply(val);
    else if (st === 2) setStage2Reply(val);
    else setStage3Reply(val);
  };

  const handleBuildReviewPDF = (includeStage3EssayAnswers: boolean) => {
    if (!stage1Reply.trim() && !stage2Reply.trim() && !stage3Reply.trim()) {
      setFeedbackMsg("⚠️ يرجى لصق رد المرحلة ١ أو ٢ على الأقل في الصندوق المخصص أدناه قبل إنشاء المراجعة.");
      return;
    }
    const mapped = mergeFinalReviewThreeStagesToPrintableItems({
      stage1Raw: stage1Reply,
      stage2Raw: stage2Reply,
      stage3Raw: includeStage3EssayAnswers ? stage3Reply : "",
      branchId,
      branchNameAr,
      titleArabic: unitTitleAr,
    });
    if (mapped.length === 0) {
      setFeedbackMsg("⚠️ لم يتم العثور على أسئلة في النص الملصق؛ تأكد من لصق رد NotebookLM كاملاً.");
      return;
    }
    onApplyParsedQuestionsToSheet?.(mapped);
    onApplyReviewTitleToSheet(
      reviewScope === "final_exam_night_capsule"
        ? `المراجعة النهائية الشاملة — ${gradeNameAr}`
        : `مراجعة اختبار الشهر — ${gradeNameAr}`
    );
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            🏆 إعداد المراجعة النهائية ومراجعة الشهر (٣ مراحل: ١- اختر وإجابتها، ٢- المقالي، ٣- إجابات المقالي)
          </h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {gradeNameAr}
            {extractedStage2Essays.length > 0 &&
              ` • ✓ تم قراءة (${extractedStage2Essays.length}) مسألة مقالية من المرحلة ٢ وتضمينها في برومبت المرحلة ٣`}
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

      {/* نوع المراجعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setReviewScope("final_exam_night_capsule")}
          className={`p-3 rounded-2xl border text-right cursor-pointer ${
            reviewScope === "final_exam_night_capsule"
              ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30"
              : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="text-xs font-black">🌟 مراجعة ليلة الامتحان الشاملة</div>
          <div className="text-[11px] font-bold text-slate-500 mt-0.5">
            أسئلة اختر وإجابتها + المسائل المقالية والبرهان + نموذج إجابات المقالي
          </div>
        </button>
        <button
          type="button"
          onClick={() => setReviewScope("monthly_revision")}
          className={`p-3 rounded-2xl border text-right cursor-pointer ${
            reviewScope === "monthly_revision"
              ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30"
              : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="text-xs font-black">📅 مراجعة مقرر الشهر المركزة</div>
          <div className="text-[11px] font-bold text-slate-500 mt-0.5">
            تغطية شاملة لوحدات الشهر في أقل عدد من الأوراق
          </div>
        </button>
      </div>

      {/* بطاقات المراحل الثلاث للمراجعة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {FINAL_REVIEW_THREE_STAGES.map((st) => {
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

      {/* عدد أسئلة اختر وعدد المسائل المقالية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            عدد أسئلة اختر وإجابتها (المرحلة ١):
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={mcqCount}
            onChange={(e) => setMcqCount(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            عدد الأسئلة المقالية والبرهان (المرحلة ٢ و ٣):
          </label>
          <input
            type="number"
            min={1}
            max={40}
            value={essayCount}
            onChange={(e) => setEssayCount(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
      </div>

      {/* نص برومبت المرحلة المختارة */}
      <div className="space-y-1">
        <label className="block text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
          ✨ برومبت المرحلة ({activeStage}) للمراجعة (المرحلة ٣ تقرأ تلقائياً أسئلة المرحلة ٢ المقالية):
        </label>
        <textarea
          rows={4}
          value={editablePrompt}
          onChange={(e) => setEditablePrompt(e.target.value)}
          className="w-full p-3 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
      </div>

      {/* الصناديق الثلاثة المستقلة للصق ردود المراجعة */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="text-xs font-black text-slate-800 dark:text-slate-200">
          📥 ٢. أماكن لصق ردود NotebookLM لكل مرحلة على حدة:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FINAL_REVIEW_THREE_STAGES.map((st) => {
            const isCurrent = st.stageNum === activeStage;
            const val = getReply(st.stageNum);
            return (
              <div
                key={st.stageNum}
                onClick={() => setActiveStage(st.stageNum)}
                className={`p-3 rounded-2xl border transition ${
                  isCurrent
                    ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/20"
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
            onClick={() => handleBuildReviewPDF(false)}
            className="min-h-[46px] py-2.5 px-4 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black shadow-sm cursor-pointer"
          >
            📄 إنشاء المراجعة بعد المرحلة ١ أو ٢ (بدون إجابات المقالي) ⬅
          </button>
          <button
            type="button"
            onClick={() => handleBuildReviewPDF(true)}
            className="min-h-[46px] py-2.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-sm cursor-pointer"
          >
            ✅ إنشاء المراجعة الكاملة شاملة المرحلة ٣ (مع إجابات المقالي) ⬅
          </button>
        </div>
      </div>
    </div>
  );
}
