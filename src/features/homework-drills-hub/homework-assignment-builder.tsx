"use client";

/**
 * @file homework-assignment-builder.tsx
 * @description باني الواجب المنزلي الإلكتروني للمعلم:
 * مربوط حصرياً بالصفوف المفعلة (`loadEnabledGradesSSOT`) والوحدات الحقيقية (`loadActiveCurriculumUnitsSSOT`),
 * ويتيح تحديد عدد أسئلة اختر والمقالي، ويعرض البرومبت كاملاً قابلاً للتعديل مع فتح NotebookLM بنقرة واحدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  loadActiveCurriculumUnitsSSOT,
  type CurriculumUnitNode,
} from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  copyPromptAndOpenGradeNotebookLmSSOT,
  loadEnabledGradesSSOT,
} from "@/core/ssot/teacher-identity-ssot";
import { buildWorksheetDrillNotebookLMPrompt } from "@/core/prompts/worksheet-drill-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import {
  publishOnlineHomeworkAssignment,
  type PublishedOnlineHomeworkAssignment,
} from "./homework-auto-grading-engine";

export const MODULE_ID_HOMEWORK_ASSIGNMENT_BUILDER =
  "homework_assignment_builder" as const;

export interface HomeworkAssignmentBuilderProps {
  readonly onHomeworkPublished?: (hw: PublishedOnlineHomeworkAssignment) => void;
}

export default function HomeworkAssignmentBuilder({
  onHomeworkPublished,
}: HomeworkAssignmentBuilderProps) {
  const [enabledGrades, setEnabledGrades] = useState(() =>
    loadEnabledGradesSSOT()
  );
  const [gradeId, setGradeId] = useState<string>("prep-3");
  const [units, setUnits] = useState<readonly CurriculumUnitNode[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [mcqCount, setMcqCount] = useState<number>(5);
  const [essayCount, setEssayCount] = useState<number>(2);
  const [editablePrompt, setEditablePrompt] = useState<string>("");
  const [notebookReply, setNotebookReply] = useState<string>("");
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [publishedSuccess, setPublishedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const activeGrades = loadEnabledGradesSSOT();
    setEnabledGrades(activeGrades);
    const loaded = loadActiveCurriculumUnitsSSOT(gradeId);
    setUnits(loaded);
    const firstUnit = loaded[0];
    if (firstUnit) {
      setSelectedUnitId(firstUnit.id);
      setSelectedLessonId(firstUnit.lessons[0]?.id || "");
    } else {
      setSelectedUnitId("");
      setSelectedLessonId("");
    }
  }, [gradeId]);

  const activeGrade =
    enabledGrades.find((g) => g.id === gradeId) || enabledGrades[0];
  const activeUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const activeLesson =
    activeUnit?.lessons.find((l) => l.id === selectedLessonId) ||
    activeUnit?.lessons[0];
  const branchId = activeUnit?.branchId || "plane_geometry";

  useEffect(() => {
    const generated = buildWorksheetDrillNotebookLMPrompt({
      gradeNameArabic: activeGrade?.nameArabic || "الصف الثالث الإعدادي",
      branchId,
      lessonTitleArabic: activeLesson?.titleArabic || "الدرس الأول",
      quickMcqCount: mcqCount,
      quickEssayCount: essayCount,
      durationMinutes: 25,
    });
    setEditablePrompt(generated);
  }, [activeGrade, branchId, activeLesson, mcqCount, essayCount]);

  const handlePublishOnlineHomework = () => {
    const parsedQuestions = parseNotebookLMExamQuestionsToIR(notebookReply, {
      defaultBranchId: branchId,
      defaultUnitId: activeUnit?.id || "u1",
      defaultLessonId: activeLesson?.id || "l1",
      defaultLessonTitleArabic: activeLesson?.titleArabic || "الدرس الأول",
    });

    const newAssignment: PublishedOnlineHomeworkAssignment = {
      assignmentId: `hw_${Date.now()}`,
      gradeId: activeGrade?.id || gradeId,
      gradeNameArabic: activeGrade?.nameArabic || "الصف الثالث الإعدادي",
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
    <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            📝 إعداد ونشر الواجب التفاعلي للطالب أونلاين (مربوط بمستكشف المنهج)
          </h3>
          <p className="text-xs font-bold text-slate-500">
            اختر الصف والوحدة والدرس وعدد الأسئلة، ثم انسخ البرومبت لدفتر NotebookLM الخاص بالصف
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
            ? "✓ تم نسخ البرومبت وفتح NotebookLM!"
            : "📋 ١. نسخ برومبت الواجب وفتح NotebookLM لهذا الصف ↗"}
        </button>
      </div>

      {/* القوائم الثلاث المربوطة بشجرة مستكشف المنهج + تحديد أعداد الأسئلة */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            ١. الصف الدراسي:
          </label>
          <select
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
            className="w-full min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          >
            {enabledGrades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameArabic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            ٢. الوحدة {activeUnit ? `(${activeUnit.branchNameArabic})` : ""}:
          </label>
          <select
            value={selectedUnitId}
            onChange={(e) => {
              const nextU = units.find((u) => u.id === e.target.value);
              setSelectedUnitId(e.target.value);
              if (nextU?.lessons[0]) setSelectedLessonId(nextU.lessons[0].id);
            }}
            className="w-full min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          >
            {units.length === 0 ? (
              <option value="">لم يتم تقسيم هذا الصف بعد</option>
            ) : (
              units.map((u) => (
                <option key={u.id} value={u.id}>
                  [{u.branchNameArabic}] {u.titleArabic}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            ٣. الدرس المستهدف:
          </label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="w-full min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          >
            {(activeUnit?.lessons || []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.orderIndex}. {l.titleArabic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            أسئلة اختر (MCQ):
          </label>
          <input
            type="number"
            min={0}
            max={30}
            value={mcqCount}
            onChange={(e) => setMcqCount(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1">
            مسائل مقالية:
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={essayCount}
            onChange={(e) => setEssayCount(Number(e.target.value))}
            className="w-full min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
          />
        </div>
      </div>

      {units.length === 0 && (
        <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between">
          <span>لم تقم بتقسيم وحدات هذا الصف بعد في مستكشف المنهج.</span>
          <Link
            href="/library"
            className="px-3 py-1 rounded-xl bg-amber-600 text-white font-black"
          >
            تقسيم المنهج الآن ↗
          </Link>
        </div>
      )}

      {/* نص برومبت الواجب القابل للتعديل */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
          ✨ نص برومبت الواجب الموجه إلى NotebookLM (يمكنك قراءته أو تعديله):
        </label>
        <textarea
          rows={4}
          value={editablePrompt}
          onChange={(e) => setEditablePrompt(e.target.value)}
          className="w-full p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
      </div>

      {/* صندوق لصق رد NotebookLM ونشره أونلاين */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200">
          📥 ٢. الصق رد NotebookLM هنا لتحويله إلى واجب تفاعلي أونلاين للطالب:
        </label>
        <textarea
          rows={4}
          value={notebookReply}
          onChange={(e) => setNotebookReply(e.target.value)}
          placeholder="الصق رد أسئلة الواجب من NotebookLM هنا..."
          className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
        <button
          type="button"
          onClick={handlePublishOnlineHomework}
          className="w-full min-h-[46px] py-2.5 rounded-2xl bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-black shadow-sm cursor-pointer"
        >
          {publishedSuccess
            ? "✓ تم نشر الواجب فوراً في بوابة الطالب أونلاين!"
            : "🚀 نشر الواجب الآن ليظهر للطالب أونلاين في بوابته"}
        </button>
      </div>
    </div>
  );
}
