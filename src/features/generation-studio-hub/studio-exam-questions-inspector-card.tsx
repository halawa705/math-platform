"use client";

/**
 * @file studio-exam-questions-inspector-card.tsx
 * @description بطاقة معاينة وتدقيق وتعديل أسئلة الاختبار المستخرجة في استوديو التوليد قبل الطباعة أو النشر الإلكتروني.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 210 أسطر).
 */

import { useState } from "react";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";

export const MODULE_ID_STUDIO_EXAM_QUESTIONS_INSPECTOR_CARD =
  "studio_exam_questions_inspector_card" as const;

const CHOICE_LABELS = ["أ", "ب", "جـ", "د"] as const;

export interface StudioExamQuestionsInspectorCardProps {
  readonly questions: readonly QuestionAssessmentIR[];
  readonly onChangeQuestions: (next: readonly QuestionAssessmentIR[]) => void;
}

export default function StudioExamQuestionsInspectorCard({
  questions,
  onChangeQuestions,
}: StudioExamQuestionsInspectorCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (questions.length === 0) return null;

  const mcqCount = questions.filter((q) => q.patternKind === "mcq").length;
  const otherCount = questions.length - mcqCount;
  const totalMarks = questions.reduce((sum, q) => sum + (q.allocatedMarks || 1), 0);
  const summaryAr = `${questions.length} سؤال (${mcqCount} اختر${otherCount > 0 ? ` • ${otherCount} مقالي/قصير` : ""}) • ${totalMarks} درجة`;

  const updateQuestion = (questionId: string, patch: Partial<QuestionAssessmentIR>) => {
    onChangeQuestions(
      questions.map((q) => (q.questionId === questionId ? { ...q, ...patch } : q))
    );
  };

  const deleteQuestion = (questionId: string) => {
    const filtered = questions
      .filter((q) => q.questionId !== questionId)
      .map((q, idx) => ({ ...q, displayOrderNumber: idx + 1 }));
    onChangeQuestions(filtered);
  };

  return (
    <StudioCollapsibleSectionCard
      icon="👁️"
      titleAr="معاينة وتعديل الأسئلة المستخرجة"
      summaryAr={summaryAr}
      defaultOpen
    >
      <div className="space-y-2.5 pt-2 max-h-[520px] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isEditing = editingId === q.questionId;
          const choices = q.mcqChoicesArabic ?? ["", "", "", ""];

          return (
            <div
              key={q.questionId}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-900 dark:bg-teal-600 text-white">
                    س{idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                    {q.patternKind === "mcq" ? "اختر من متعدد" : "إجابة قصيرة / مقالي"}
                  </span>
                  <span className="text-[11px] text-teal-700 dark:text-teal-300">
                    ({q.allocatedMarks} درجة)
                  </span>
                  {q.authenticCitation?.governorateNameArabic && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[10px]">
                      📍 {q.authenticCitation.governorateNameArabic}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingId(isEditing ? null : q.questionId)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-black text-indigo-800 dark:text-teal-300 cursor-pointer"
                  >
                    {isEditing ? "✓ تم" : "✏️ تعديل"}
                  </button>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteQuestion(q.questionId)}
                      className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-[11px] font-black cursor-pointer"
                      title="حذف السؤال"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-500">نص السؤال:</span>
                    <textarea
                      rows={2}
                      value={q.promptArabic}
                      onChange={(e) => updateQuestion(q.questionId, { promptArabic: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">الدرجة:</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={q.allocatedMarks}
                      onChange={(e) =>
                        updateQuestion(q.questionId, {
                          allocatedMarks: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="w-20 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-black text-center"
                    />
                  </div>

                  {q.patternKind === "mcq" && (
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-500 block">
                        البدائل (اضغط على الحرف لتحديده كإجابة صحيحة ✓):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {([0, 1, 2, 3] as const).map((cIdx) => {
                          const isCorrect = q.correctMcqChoiceIndex === cIdx;
                          return (
                            <div key={cIdx} className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(q.questionId, { correctMcqChoiceIndex: cIdx })
                                }
                                className={`min-w-[34px] h-8 rounded-lg font-black text-xs cursor-pointer ${
                                  isCorrect
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {CHOICE_LABELS[cIdx]} {isCorrect ? "✓" : ""}
                              </button>
                              <input
                                type="text"
                                value={choices[cIdx] || ""}
                                onChange={(e) => {
                                  const next: [string, string, string, string] = [
                                    choices[0] || "",
                                    choices[1] || "",
                                    choices[2] || "",
                                    choices[3] || "",
                                  ];
                                  next[cIdx] = e.target.value;
                                  updateQuestion(q.questionId, { mcqChoicesArabic: next });
                                }}
                                className="flex-1 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <label className="block space-y-1">
                    <span className="font-bold text-slate-500">خطوات الحل / الشرح:</span>
                    <input
                      type="text"
                      value={q.modelSolutionStepsArabic.join(" | ")}
                      onChange={(e) =>
                        updateQuestion(q.questionId, {
                          modelSolutionStepsArabic: e.target.value
                            .split("|")
                            .map((s) => s.trim())
                            .filter(Boolean),
                          finalCanonicalAnswerArabic: e.target.value.trim(),
                        })
                      }
                      className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    />
                  </label>

                  {q.patternKind !== "mcq" && (
                    <div className="flex flex-wrap items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-700 dark:text-slate-200">سطور الحل:</span>
                        <input
                          type="number"
                          min={0}
                          max={12}
                          value={q.answerLinesCount ?? 0}
                          onChange={(e) =>
                            updateQuestion(q.questionId, {
                              answerLinesCount: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className="w-16 p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-black text-center"
                        />
                        <span className="text-[10px] text-slate-500">(0 = بدون سطور)</span>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.hasDottedDivider !== false}
                          onChange={(e) =>
                            updateQuestion(q.questionId, {
                              hasDottedDivider: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          خط منقط فاصل (إلغاؤه يوفر سطر)
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 leading-relaxed">
                    <SafeKaTeXBiDiMathRenderer text={q.promptArabic} />
                  </div>

                  {q.patternKind !== "mcq" && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold">
                        سطور الحل: {q.answerLinesCount ?? 0}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold">
                        {q.hasDottedDivider !== false ? "✓ خط فاصل" : "✕ بدون خط فاصل"}
                      </span>
                    </div>
                  )}

                  {q.mcqChoicesArabic && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {q.mcqChoicesArabic.map((ch, cIdx) => {
                        const isCorrect = q.correctMcqChoiceIndex === cIdx;
                        return (
                          <div
                            key={cIdx}
                            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 ${
                              isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-black"
                                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="font-black">({CHOICE_LABELS[cIdx]})</span>
                            <span className="truncate">
                              <SafeKaTeXBiDiMathRenderer text={ch} />
                            </span>
                            {isCorrect && <span className="mr-auto text-emerald-600 font-black">✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.modelSolutionStepsArabic.length > 0 && (
                    <div className="px-2.5 py-1.5 rounded-xl bg-teal-50/70 dark:bg-slate-800/60 border border-teal-200/60 dark:border-slate-700 text-[11px] font-bold text-teal-950 dark:text-teal-200">
                      <span className="font-black ml-1">💡 الحل:</span>
                      <SafeKaTeXBiDiMathRenderer text={q.modelSolutionStepsArabic.join(" ⇐ ")} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </StudioCollapsibleSectionCard>
  );
}
