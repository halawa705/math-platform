"use client";

/**
 * @file student-assigned-exams-tab.tsx
 * @description الاختبار الإلكتروني الحقيقي للطالب: يعرض الاختبار النشط المنشور من المعلم لصف الطالب فقط،
 * ويصححه فوراً عبر محرك التصحيح، ويسجل النتيجة تلقائياً في قاعة المتميزين (≥ 70٪).
 * لا توجد أي أسئلة مدمجة أو وهمية؛ وإن لم يُنشر اختبار تظهر حالة انتظار.
 */

import { useEffect, useState } from "react";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import StudentVirtualMathKeypad from "@/features/electronic-exams-hub/student-virtual-math-keypad";
import LiveExamCountdownTimer from "@/features/electronic-exams-hub/live-exam-countdown-timer";
import StudentHonorCertificateGenerator from "@/features/electronic-exams-hub/student-honor-certificate-generator";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import { gradeStudentHomeworkAnswer } from "@/features/homework-drills-hub/homework-auto-grading-engine";
import {
  PUBLISHED_EXAMS_UPDATED_EVENT,
  formatExamExpiryRemainingAr,
  loadActiveExamsForGradeSSOT,
  refreshPublishedExamsFromSupabaseSSOT,
  type PublishedOnlineExam,
} from "@/features/electronic-exams-hub/published-online-exams-store";
import {
  EXAM_SUBMISSIONS_UPDATED_EVENT,
  MIN_HONOR_ROLL_PERCENTAGE_SSOT,
  findStudentSubmissionForExamSSOT,
  recordStudentOnlineExamSubmissionSSOT,
  refreshExamSubmissionsFromSupabaseSSOT,
} from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";

export const MODULE_ID_STUDENT_ASSIGNED_EXAMS_TAB =
  "student_assigned_exams_tab" as const;

export interface StudentAssignedExamsTabProps {
  readonly studentCode?: string;
  readonly studentNameAr?: string;
  readonly gradeId?: string;
  readonly isTeacherPreview?: boolean;
  readonly onExamSubmitted?: () => void;
}

export default function StudentAssignedExamsTab({
  studentCode,
  studentNameAr = "",
  gradeId = "",
  isTeacherPreview = false,
  onExamSubmitted,
}: StudentAssignedExamsTabProps) {
  const [activeExams, setActiveExams] = useState<readonly PublishedOnlineExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [written, setWritten] = useState<Record<string, string>>({});
  const [keypadQId, setKeypadQId] = useState<string | null>(null);
  const [resultPct, setResultPct] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    const syncLocal = () => {
      const list = gradeId ? loadActiveExamsForGradeSSOT(gradeId) : [];
      setActiveExams(list);
      setSelectedExamId((prev) =>
        list.some((e) => e.examId === prev) ? prev : list[0]?.examId || ""
      );
    };
    syncLocal();
    void refreshPublishedExamsFromSupabaseSSOT();
    void refreshExamSubmissionsFromSupabaseSSOT();
    window.addEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, syncLocal);
    window.addEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, syncLocal);
    return () => {
      window.removeEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, syncLocal);
      window.removeEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, syncLocal);
    };
  }, [gradeId]);

  const exam =
    activeExams.find((e) => e.examId === selectedExamId) || activeExams[0] || null;

  useEffect(() => {
    setResultPct(null);
    setChoices({});
    setWritten({});
    setFeedback({});
    if (exam && studentCode) {
      const previous = findStudentSubmissionForExamSSOT(exam.examId, studentCode);
      if (previous) setResultPct(previous.percentageScore);
    }
  }, [exam, studentCode]);

  if (!exam) {
    return (
      <div className="p-10 rounded-3xl bg-white dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-1.5">
        <div className="text-3xl">🎯</div>
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
          لا يوجد اختبار نشط لصفك الآن
        </h3>
        <p className="text-xs font-bold text-slate-500">
          سيظهر الاختبار هنا فور نشره من المعلم.
        </p>
      </div>
    );
  }

  const submitted = resultPct !== null;

  const handleSubmit = () => {
    if (!studentCode || isTeacherPreview) return;
    let earned = 0;
    let total = 0;
    const fb: Record<string, string> = {};
    exam.questions.forEach((q) => {
      const report = gradeStudentHomeworkAnswer({
        question: q,
        selectedChoiceIdx: choices[q.questionId],
        writtenStepsText: written[q.questionId],
      });
      earned += report.earnedMarks;
      total += q.allocatedMarks;
      fb[q.questionId] = report.feedbackArabic;
    });
    const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
    recordStudentOnlineExamSubmissionSSOT({
      exam,
      studentCode,
      studentNameAr,
      percentageScore: pct,
    });
    setFeedback(fb);
    setResultPct(pct);
    onExamSubmitted?.();
  };

  return (
    <div className="space-y-4">
      {activeExams.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {activeExams.map((e) => (
            <button
              key={e.examId}
              type="button"
              onClick={() => setSelectedExamId(e.examId)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap cursor-pointer transition ${
                exam.examId === e.examId
                  ? "bg-indigo-900 text-white dark:bg-teal-600 shadow-xs"
                  : "bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              🎯 {e.titleAr}
            </button>
          ))}
        </div>
      )}

      <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-black">{exam.titleAr}</h3>
          <p className="text-xs font-bold text-slate-500">
            {exam.questions.length} أسئلة • للدخول في قاعة المتميزين تحتاج {MIN_HONOR_ROLL_PERCENTAGE_SSOT}٪ فأكثر
          </p>
          <p className="text-[11px] font-bold text-teal-700 dark:text-teal-400 mt-0.5">
            ⏳ {formatExamExpiryRemainingAr(exam.expiresAtIso).labelAr}
          </p>
        </div>
        {!submitted && !isTeacherPreview && (
          <LiveExamCountdownTimer
            initialDurationSeconds={exam.durationMinutes * 60}
            onTimeExpired={handleSubmit}
          />
        )}
      </div>

      {isTeacherPreview && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-black text-amber-900">
          👁️ وضع المعاينة: هكذا يرى الطالب الاختبار، ولا يمكن التسليم من حساب المعلم.
        </div>
      )}

      {exam.questions.map((q) => {
        const pickedChoice = choices[q.questionId];
        return (
          <div
            key={q.questionId}
            className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
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
              <div className="sm:col-span-7 text-sm font-bold leading-relaxed">
                <SafeKaTeXBiDiMathRenderer text={q.promptArabic} />
              </div>
              {q.attachedGeometryFigure && (
                <div
                  className="sm:col-span-5 p-2 rounded-xl bg-white border border-slate-200 flex justify-center"
                  dangerouslySetInnerHTML={{
                    __html: projectGeometryFigureToSVGMarkup(q.attachedGeometryFigure, {
                      widthPx: 230,
                      heightPx: 155,
                      numeralMode: "eastern",
                    }),
                  }}
                />
              )}
            </div>

            {q.patternKind === "mcq" && q.mcqChoicesArabic ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {q.mcqChoicesArabic.map((choice, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setChoices((prev) => ({ ...prev, [q.questionId]: cIdx }))
                    }
                    className={`min-h-[46px] px-3 py-2 rounded-xl border text-xs font-black transition cursor-pointer ${
                      pickedChoice === cIdx
                        ? "border-teal-600 bg-teal-600 text-white shadow"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    }`}
                  >
                    <SafeKaTeXBiDiMathRenderer text={choice} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  disabled={submitted}
                  value={written[q.questionId] || ""}
                  onFocus={() => setKeypadQId(q.questionId)}
                  onChange={(e) =>
                    setWritten((prev) => ({ ...prev, [q.questionId]: e.target.value }))
                  }
                  placeholder="اكتب خطوات الحل والناتج النهائي هنا..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-bold"
                />
                {keypadQId === q.questionId && !submitted && (
                  <StudentVirtualMathKeypad
                    onInsertSymbol={(sym) =>
                      setWritten((prev) => ({
                        ...prev,
                        [q.questionId]: (prev[q.questionId] || "") + sym,
                      }))
                    }
                    onClear={() =>
                      setWritten((prev) => ({ ...prev, [q.questionId]: "" }))
                    }
                  />
                )}
              </div>
            )}

            {feedback[q.questionId] && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                {feedback[q.questionId]}
              </div>
            )}
          </div>
        );
      })}

      {!submitted && !isTeacherPreview && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full min-h-[50px] py-3 rounded-2xl bg-gradient-to-l from-indigo-900 to-teal-700 text-white text-sm font-black shadow-lg cursor-pointer"
        >
          تسليم الاختبار وتصحيحه فوراً ✓
        </button>
      )}

      {submitted && resultPct !== null && (
        <div className="space-y-3">
          <div
            className={`p-5 rounded-3xl border text-sm font-black text-center ${
              resultPct >= MIN_HONOR_ROLL_PERCENTAGE_SSOT
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-amber-50 border-amber-300 text-amber-900"
            }`}
          >
            {resultPct >= MIN_HONOR_ROLL_PERCENTAGE_SSOT
              ? `🎉 درجتك ${resultPct}٪ — أنت مؤهل لقاعة المتميزين!`
              : `درجتك ${resultPct}٪ — قاعة المتميزين تبدأ من ${MIN_HONOR_ROLL_PERCENTAGE_SSOT}٪، حاول في الاختبار القادم.`}
          </div>
          {resultPct >= MIN_HONOR_ROLL_PERCENTAGE_SSOT && (
            <StudentHonorCertificateGenerator
              studentNameArabic={studentNameAr}
              examTitleArabic={exam.titleAr}
              percentageScore={resultPct}
            />
          )}
        </div>
      )}
    </div>
  );
}
