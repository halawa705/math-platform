"use client";

/**
 * @file studio-exam-generator-tab.tsx
 * @description تبويب إعداد الاختبار التقييمي الرسمي داخل استوديو التوليد الموحد:
 * يولد برومبت NotebookLM عبر `official-exam-prompt-builder.ts`، ويستقبل رد NotebookLM
 * ليحوله فوراً عبر `notebooklm-exam-questions-parser.ts` إلى أسئلة وأشكال هندسية حية على ورقة الـ A4.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import { useState } from "react";
import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import { buildOfficialExamNotebookLMPrompt } from "@/core/prompts/official-exam-prompt-builder";
import { parseNotebookLMExamQuestionsToIR } from "@/core/ingestion/notebooklm-exam-questions-parser";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";

export const MODULE_ID_STUDIO_EXAM_GENERATOR_TAB =
  "studio_exam_generator_tab" as const;

export interface StudioExamGeneratorTabProps {
  readonly gradeNameAr?: string;
  readonly branchId?: MathBranchId;
  readonly lessonTitle: string;
  readonly branchNameAr: string;
  readonly onApplyExamTitleToSheet: (newTitle: string) => void;
  readonly onApplyParsedQuestionsToSheet?: (
    questions: readonly PrintableMathQuestionItem[]
  ) => void;
}

const SAMPLE_EXAM_NOTEBOOK_RESPONSE = `=== [QUESTION: 1] | النوع: MCQ | الدرس: القطعة الواصلة بين منتصفي ضلعين | الدرجة: 2 ===
النص: في الشكل المقابل: $د$ منتصف $أ ب$، $هـ$ منتصف $أ جـ$، وطول $ب جـ = 12$ سم. فإن طول $د هـ$ يساوي:
الرسم: [رسم هندسي: مثلث فيه قطعة واصلة بين منتصفي ضلعين]
البدائل: (أ) $6$ سم | (ب) $12$ سم | (جـ) $24$ سم | (د) $8$ سم
الإجابة_الصحيحة: $6$ سم
البرهان_والخطوات: بما أن د منتصف أ ب، هـ منتصف أ جـ، إذن د هـ = نصف ب جـ = 6 سم.
=== [QUESTION: 2] | النوع: PROOF | الدرس: نظرية إقليدس | الدرجة: 4 ===
النص: في الشكل المقابل: المثلث $أ ب جـ$ قائم الزاوية في $أ$، سقط $أ د \\perp ب جـ$. إذا كان $ب د = 4.5$ سم، $د جـ = 8$ سم، أوجد بالبرهان طول $أ د$.
الرسم: [رسم هندسي: نظرية إقليدس وعمود ساقط من رأس القائمة على الوتر]
الإجابة_الصحيحة: 6 سم
البرهان_والخطوات: من نظرية إقليدس: $(أ د)^2 = ب د \\times د جـ = 4.5 \\times 8 = 36 \\implies أ د = 6$ سم.`;

export default function StudioExamGeneratorTab({
  gradeNameAr = "الصف الثالث الإعدادي",
  branchId = "plane_geometry",
  lessonTitle,
  branchNameAr,
  onApplyExamTitleToSheet,
  onApplyParsedQuestionsToSheet,
}: StudioExamGeneratorTabProps) {
  const [mcqCount, setMcqCount] = useState(4);
  const [proofCount, setProofCount] = useState(2);
  const [difficulty, setDifficulty] = useState<
    "standard_balanced" | "olympiad_challenge"
  >("standard_balanced");
  const [notebookRawReply, setNotebookRawReply] = useState<string>(
    SAMPLE_EXAM_NOTEBOOK_RESPONSE
  );
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const officialPrompt = buildOfficialExamNotebookLMPrompt({
    gradeNameArabic: gradeNameAr,
    termNumber: 1,
    branchId,
    targetedLessonTitlesArabic: [lessonTitle],
    mcqQuestionsCount: mcqCount,
    essayAndProofQuestionsCount: proofCount,
    totalMarks: mcqCount * 2 + proofCount * 4,
    durationTextArabic: "ساعة ونصف",
    difficultyProfile: difficulty,
  });

  const handleCopyPrompt = () => {
    navigator.clipboard?.writeText(officialPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleConvertReplyToA4Sheet = () => {
    onApplyExamTitleToSheet(`اختبار ${branchNameAr} — ${lessonTitle}`);
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
    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            📄 إعداد الاختبار التقييمي الرسمي ({branchNameAr})
          </h3>
          <p className="text-xs font-bold text-slate-500">
            الدرس النشط: {lessonTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyPrompt}
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black cursor-pointer"
        >
          {copiedPrompt ? "✓ تم نسخ البرومبت" : "📋 ١. نسخ برومبت الاختبار لـ NotebookLM"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            أسئلة اختر (MCQ):
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={mcqCount}
            onChange={(e) => setMcqCount(Number(e.target.value))}
            className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            مسائل البرهان والمقال:
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={proofCount}
            onChange={(e) => setProofCount(Number(e.target.value))}
            className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          />
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            ميزان الصعوبة:
          </label>
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(
                e.target.value as "standard_balanced" | "olympiad_challenge"
              )
            }
            className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black"
          >
            <option value="standard_balanced">متوازن قياسي</option>
            <option value="olympiad_challenge">متفوقين ومستويات عليا</option>
          </select>
        </div>
      </div>

      {/* استقبال رد NotebookLM وتحويله فوراً لورقة الـ A4 */}
      <div className="space-y-2">
        <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
          ٢. الصق رد NotebookLM هنا لتصييره فوراً في ورقة الـ A4 مع الرسوم الهندسية:
        </label>
        <textarea
          rows={4}
          value={notebookRawReply}
          onChange={(e) => setNotebookRawReply(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold leading-relaxed"
        />
        <button
          type="button"
          onClick={handleConvertReplyToA4Sheet}
          className="w-full min-h-[42px] py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black shadow cursor-pointer"
        >
          ⚡ تصيير الأسئلة والأشكال في ورقة الـ A4 الآن ⬅
        </button>
      </div>
    </div>
  );
}
