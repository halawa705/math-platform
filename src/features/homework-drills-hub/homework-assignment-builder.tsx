"use client";

/**
 * @file homework-assignment-builder.tsx
 * @description باني الواجب المنزلي الإلكتروني للمعلم:
 * مربوط مباشرة بمستكشف المنهج (`curriculum-hierarchy-ssot.ts`) لاختيار (الصف الدراسي -> الوحدة -> الدرس)،
 * ثم توليد برومبت الواجب لـ NotebookLM، ثم استقبال رد NotebookLM وتحويله فوراً إلى واجب تفاعلي يظهر للطالب أونلاين.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import React, { useState, useEffect } from "react";
import {
  EGYPTIAN_MATH_GRADES_SSOT,
  loadActiveCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import { MATH_BRANCHES_SSOT } from "@/core/ssot/math-branches-ssot";
import { buildWorksheetDrillNotebookLMPrompt } from "@/core/prompts/worksheet-drill-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import {
  publishOnlineHomeworkAssignment,
  type PublishedOnlineHomeworkAssignment,
} from "./homework-auto-grading-engine";

export const MODULE_ID_HOMEWORK_ASSIGNMENT_BUILDER =
  "homework_assignment_builder" as const;

const SAMPLE_HOMEWORK_NOTEBOOKLM_REPLY = `=== [QUESTION: 1] | النوع: MCQ | الدرس: القطعة الواصلة بين منتصفي ضلعين في مثلث | الدرجة: 2 ===
النص: في الشكل المقابل: $د$ منتصف $أ ب$، $هـ$ منتصف $أ جـ$، وطول $ب جـ = 16$ سم. فإن طول القطعة $د هـ$ يساوي:
الرسم: [رسم هندسي: مثلث أ ب جـ فيه د منتصف أ ب و هـ منتصف أ جـ]
البدائل: (أ) $8$ سم | (ب) $16$ سم | (جـ) $32$ سم | (د) $4$ سم
الإجابة_الصحيحة: $8$ سم
البرهان_والخطوات: بما أن د منتصف أ ب، هـ منتصف أ جـ، إذن د هـ يوازي ب جـ ويساوي نصف طوله = 16 ÷ 2 = 8 سم.
=== [QUESTION: 2] | النوع: ESSAY | الدرس: القطعة الواصلة بين منتصفي ضلعين في مثلث | الدرجة: 3 ===
النص: مثلث أ ب جـ محيطه $24$ سم، $د، هـ، و$ منتصفات أضلاعه الثلاثة. أوجد بالخطوات محيط المثلث $د هـ و$.
الرسم: 
الإجابة_الصحيحة: 12 سم
البرهان_والخطوات: محيط المثلث الناشئ من توصيل منتصفات أضلاع مثلث يساوي نصف محيط المثلث الأصلي = 24 ÷ 2 = 12 سم.`;

export interface HomeworkAssignmentBuilderProps {
  readonly onHomeworkPublished?: (hw: PublishedOnlineHomeworkAssignment) => void;
}

export default function HomeworkAssignmentBuilder({
  onHomeworkPublished,
}: HomeworkAssignmentBuilderProps) {
  const [gradeId, setGradeId] = useState<string>("prep-3");
  const [units, setUnits] = useState<readonly CurriculumUnitNode[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [notebookReply, setNotebookReply] = useState<string>(
    SAMPLE_HOMEWORK_NOTEBOOKLM_REPLY
  );
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [publishedSuccess, setPublishedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const loaded = loadActiveCurriculumUnitsSSOT(gradeId);
    setUnits(loaded);
    const firstUnit = loaded[0];
    if (firstUnit) {
      setSelectedUnitId(firstUnit.id);
      setSelectedLessonId(firstUnit.lessons[0]?.id || "");
    }
  }, [gradeId]);

  const activeGrade =
    EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === gradeId) ||
    EGYPTIAN_MATH_GRADES_SSOT[5];
  const activeUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const activeLesson =
    activeUnit?.lessons.find((l) => l.id === selectedLessonId) ||
    activeUnit?.lessons[0];
  const branchId = activeUnit?.branchId || "plane_geometry";

  const promptText = buildWorksheetDrillNotebookLMPrompt({
    gradeNameArabic: activeGrade.nameArabic,
    branchId,
    lessonTitleArabic: activeLesson?.titleArabic || "الدرس الأول",
    quickMcqCount: 3,
    quickEssayCount: 2,
    durationMinutes: 20,
  });

  const handlePublishOnlineHomework = () => {
    const parsedQuestions = parseNotebookLMExamQuestionsToIR(notebookReply, {
      defaultBranchId: branchId,
      defaultUnitId: activeUnit?.id || "u1",
      defaultLessonId: activeLesson?.id || "l1",
      defaultLessonTitleArabic: activeLesson?.titleArabic || "الدرس الأول",
    });

    const newAssignment: PublishedOnlineHomeworkAssignment = {
      assignmentId: `hw_${Date.now()}`,
      gradeId: activeGrade.id,
      gradeNameArabic: activeGrade.nameArabic,
      unitId: activeUnit?.id || "u1",
      unitTitleArabic: activeUnit?.titleArabic || "الوحدة الأولى",
      lessonId: activeLesson?.id || "l1",
      lessonTitleArabic: activeLesson?.titleArabic || "الدرس الأول",
      branchId,
      createdAtIso: new Date().toISOString().slice(0, 10),
      questions: parsedQuestions,
    };

    publishOnlineHomeworkAssignment(newAssignment);
    onHomeworkPublished?.(newAssignment);
    setPublishedSuccess(true);
    setTimeout(() => setPublishedSuccess(false), 3000);
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            📝 إعداد ونشر الواجب التفاعلي للطالب أونلاين (مربوط بمستكشف المنهج SSOT)
          </h3>
          <p className="text-xs font-bold text-slate-500">
            اختر الصف والوحدة والدرس، انسخ برومبت الواجب إلى NotebookLM، ثم الصق الرد لنشره فوراً في بوابة الطالب
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(promptText);
            setCopiedPrompt(true);
            setTimeout(() => setCopiedPrompt(false), 2000);
          }}
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black cursor-pointer"
        >
          {copiedPrompt ? "✓ تم نسخ برومبت الواجب" : "📋 ١. نسخ برومبت الواجب لـ NotebookLM"}
        </button>
      </div>

      {/* القوائم الثلاث المربوطة بشجرة مستكشف المنهج (الصف -> الوحدة -> الدرس) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block text-[11px] font-extrabold text-slate-500 mb-1">
            ١. الصف الدراسي:
          </label>
          <select
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            className="w-full min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          >
            {EGYPTIAN_MATH_GRADES_SSOT.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameArabic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-slate-500 mb-1">
            ٢. الوحدة الدراسية ({MATH_BRANCHES_SSOT[branchId].nameArabic}):
          </label>
          <select
            value={selectedUnitId}
            onChange={(e) => {
              const nextU = units.find((u) => u.id === e.target.value);
              setSelectedUnitId(e.target.value);
              if (nextU?.lessons[0]) setSelectedLessonId(nextU.lessons[0].id);
            }}
            className="w-full min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.titleArabic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-slate-500 mb-1">
            ٣. الدرس المستهدف:
          </label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="w-full min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          >
            {(activeUnit?.lessons || []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.orderIndex}. {l.titleArabic}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* صندوق لصق رد NotebookLM ونشره أونلاين */}
      <div className="space-y-2">
        <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
          ٢. الصق رد NotebookLM هنا لتحويله إلى واجب تفاعلي أونلاين للطالب:
        </label>
        <textarea
          rows={5}
          value={notebookReply}
          onChange={(e) => setNotebookReply(e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
        <button
          type="button"
          onClick={handlePublishOnlineHomework}
          className="w-full min-h-[44px] py-2.5 rounded-xl bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-black shadow-md cursor-pointer"
        >
          {publishedSuccess
            ? "✓ تم نشر الواجب فوراً في بوابة الطالب أونلاين!"
            : "🚀 نشر الواجب الآن ليظهر للطالب أونلاين في بوابته"}
        </button>
      </div>
    </div>
  );
}
