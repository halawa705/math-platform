"use client";

/**
 * @file student-homework-interactive-solver.tsx
 * @description حلال الواجب التفاعلي للطالب أونلاين (Mobile-First):
 * يعرض الواجب المنشور من المعلم مع بيانات (الصف -> الوحدة -> الدرس)، الشكل الهندسي المتجهي SVG،
 * لوحة الرموز الرياضية الافتراضية للهاتف، والتصحيح التلقائي الفوري لكل سؤال.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import { useState, useEffect } from "react";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import StudentVirtualMathKeypad from "@/features/electronic-exams-hub/student-virtual-math-keypad";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import {
  loadActiveOnlineHomeworkAssignment,
  gradeStudentHomeworkAnswer,
  type PublishedOnlineHomeworkAssignment,
} from "./homework-auto-grading-engine";

export const MODULE_ID_STUDENT_HOMEWORK_INTERACTIVE_SOLVER =
  "student_homework_interactive_solver" as const;

export interface StudentHomeworkInteractiveSolverProps {
  readonly gradeId?: string;
}

export default function StudentHomeworkInteractiveSolver({
  gradeId,
}: StudentHomeworkInteractiveSolverProps = {}) {
  const [assignment, setAssignment] =
    useState<PublishedOnlineHomeworkAssignment | null>(null);
  const [mcqSelections, setMcqSelections] = useState<Record<string, number>>({});
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, string>>({});
  const [activeKeypadQId, setActiveKeypadQId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    setAssignment(loadActiveOnlineHomeworkAssignment(gradeId));
  }, [gradeId]);

  if (!assignment) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-1.5">
        <div className="text-2xl">📝</div>
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
          لا يوجد واجب منشور حالياً
        </h3>
        <p className="text-xs font-bold text-slate-500">
          سيظهر الواجب هنا فور نشره من المعلم.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* بطاقة تعريف الواجب المربوط بالصف والوحدة والدرس */}
      <div className="p-4 rounded-2xl bg-gradient-to-l from-indigo-950 to-teal-900 text-white shadow-md space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-black text-teal-300">
          <span>{assignment.gradeNameArabic}</span>
          <span>{assignment.unitTitleArabic}</span>
        </div>
        <h3 className="text-sm sm:text-base font-black">
          📝 واجب درس: {assignment.lessonTitleArabic}
        </h3>
      </div>

      {/* قائمة أسئلة الواجب التفاعلية */}
      {assignment.questions.map((q) => {
        const pickedChoice = mcqSelections[q.questionId];
        const writtenText = writtenAnswers[q.questionId] || "";
        const gradeReport = isSubmitted
          ? gradeStudentHomeworkAnswer({
              question: q,
              selectedChoiceIdx: pickedChoice,
              writtenStepsText: writtenText,
            })
          : null;

        return (
          <div
            key={q.questionId}
            className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-black">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200">
                السؤال {q.displayOrderNumber}
              </span>
              <span className="text-slate-400">{q.allocatedMarks} درجات</span>
            </div>

            <div
              className={
                q.attachedGeometryFigure
                  ? "grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  : "block"
              }
            >
              <div
                className={
                  q.attachedGeometryFigure
                    ? "sm:col-span-7 text-sm font-bold leading-relaxed"
                    : "text-sm font-bold leading-relaxed"
                }
              >
                <SafeKaTeXBiDiMathRenderer text={q.promptArabic} />
              </div>
              {q.attachedGeometryFigure && (
                <div
                  className="sm:col-span-5 p-2 rounded-xl bg-white border border-slate-200 flex justify-center"
                  dangerouslySetInnerHTML={{
                    __html: projectGeometryFigureToSVGMarkup(
                      q.attachedGeometryFigure,
                      {
                        widthPx: 230,
                        heightPx: 155,
                        numeralMode: "eastern",
                      }
                    ),
                  }}
                />
              )}
            </div>

            {q.patternKind === "mcq" && q.mcqChoicesArabic ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {q.mcqChoicesArabic.map((choice, cIdx) => {
                  const isSelected = pickedChoice === cIdx;
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() =>
                        setMcqSelections((prev) => ({
                          ...prev,
                          [q.questionId]: cIdx,
                        }))
                      }
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-black transition cursor-pointer ${
                        isSelected
                          ? "border-teal-600 bg-teal-600 text-white shadow"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      }`}
                    >
                      <SafeKaTeXBiDiMathRenderer text={choice} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={writtenText}
                  onFocus={() => setActiveKeypadQId(q.questionId)}
                  onChange={(e) =>
                    setWrittenAnswers((prev) => ({
                      ...prev,
                      [q.questionId]: e.target.value,
                    }))
                  }
                  placeholder="اكتب خطوات الحل والناتج النهائي هنا..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-bold"
                />
                {activeKeypadQId === q.questionId && (
                  <StudentVirtualMathKeypad
                    onInsertSymbol={(sym) =>
                      setWrittenAnswers((prev) => ({
                        ...prev,
                        [q.questionId]: (prev[q.questionId] || "") + sym,
                      }))
                    }
                    onClear={() =>
                      setWrittenAnswers((prev) => ({
                        ...prev,
                        [q.questionId]: "",
                      }))
                    }
                  />
                )}
              </div>
            )}

            {gradeReport && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold ${
                  gradeReport.isCorrect
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200"
                    : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200"
                }`}
              >
                {gradeReport.feedbackArabic}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => setIsSubmitted(true)}
        className="w-full min-h-[48px] py-3 rounded-2xl bg-gradient-to-l from-indigo-900 to-teal-700 text-white text-sm font-black shadow-lg cursor-pointer"
      >
        تسليم الواجب التفاعلي وتصحيح الإجابات فوراً ✓
      </button>
    </div>
  );
}
