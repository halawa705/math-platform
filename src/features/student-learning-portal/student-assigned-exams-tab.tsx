"use client";

/**
 * @file student-assigned-exams-tab.tsx
 * @description تبويب الاختبارات الإلكترونية للطالب (منسّق ذري خفيف):
 * يعرض سؤالاً واحداً في الشاشة مع شريط تنقل ونقاط حالة، ويصحح حصرياً عبر الخادم (`/api/exams/submit`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import { useEffect, useState } from "react";
import {
  PUBLISHED_EXAMS_UPDATED_EVENT,
  loadActiveExamsForGradeSSOT,
  refreshPublishedExamsFromSupabaseSSOT,
  type PublishedOnlineExam,
} from "@/features/electronic-exams-hub/published-online-exams-store";
import {
  EXAM_SUBMISSIONS_UPDATED_EVENT,
  refreshExamSubmissionsFromSupabaseSSOT,
} from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import { useExamSession } from "./exam-session/use-exam-session";
import ExamTopProgressBar from "./exam-session/exam-top-progress-bar";
import ExamQuestionCard from "./exam-session/exam-question-card";
import ExamResultScreen from "./exam-session/exam-result-screen";

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
  const [currentIdx, setCurrentIdx] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    setCurrentIdx(0);
    setConfirmOpen(false);
  }, [exam?.examId]);

  const {
    answers,
    flaggedIds,
    remainingSeconds,
    submitting,
    errorMsg,
    resultPct,
    resultItems,
    reviewList,
    updateAnswer,
    toggleFlag,
    submitExam,
  } = useExamSession({
    exam,
    studentCode,
    studentNameAr,
    isTeacherPreview,
    onExamSubmitted,
  });

  if (!exam || exam.questions.length === 0) {
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
  const totalQ = exam.questions.length;
  const safeIdx = Math.min(currentIdx, totalQ - 1);
  const currentQ = exam.questions[safeIdx];
  const answeredCount = exam.questions.filter((q) => {
    const a = answers[q.questionId];
    return a && (a.choiceIndex !== undefined || (a.text && a.text.trim().length > 0));
  }).length;

  return (
    <div className="space-y-4">
      {activeExams.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {activeExams.map((e) => (
            <button
              key={e.examId}
              type="button"
              onClick={() => setSelectedExamId(e.examId)}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap cursor-pointer transition ${
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

      <ExamTopProgressBar
        examTitleAr={exam.titleAr}
        currentIndex={safeIdx}
        totalQuestions={totalQ}
        answeredCount={answeredCount}
        remainingSeconds={remainingSeconds}
        isSubmitted={submitted}
      />

      {isTeacherPreview && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-black text-amber-900">
          👁️ وضع المعاينة: هكذا يرى الطالب الاختبار، ولا يمكن التسليم من حساب المعلم.
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-black text-rose-800">
          ⚠️ {errorMsg}
        </div>
      )}

      {submitted && resultPct !== null && (
        <ExamResultScreen
          studentNameAr={studentNameAr}
          examTitleAr={exam.titleAr}
          percentageScore={resultPct}
        />
      )}

      {/* نقاط التنقل السريع بين الأسئلة */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {exam.questions.map((q, idx) => {
          const a = answers[q.questionId];
          const isAns = Boolean(a && (a.choiceIndex !== undefined || (a.text && a.text.trim())));
          const resItem = resultItems.find((r) => r.questionId === q.questionId);
          let dotStyle = "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600";
          if (submitted && resItem) {
            dotStyle = resItem.isCorrect
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-rose-600 border-rose-600 text-white";
          } else if (flaggedIds[q.questionId]) {
            dotStyle = "bg-amber-400 border-amber-500 text-slate-950";
          } else if (isAns) {
            dotStyle = "bg-teal-600 border-teal-600 text-white";
          }
          return (
            <button
              key={q.questionId}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={`min-w-[40px] min-h-[40px] rounded-xl border text-xs font-black cursor-pointer transition ${dotStyle} ${
                safeIdx === idx ? "ring-2 ring-indigo-600 dark:ring-teal-400 scale-105" : ""
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {currentQ && (
        <ExamQuestionCard
          question={currentQ}
          answer={answers[currentQ.questionId]}
          isFlagged={Boolean(flaggedIds[currentQ.questionId])}
          isSubmitted={submitted}
          resultState={resultItems.find((r) => r.questionId === currentQ.questionId)}
          reviewState={reviewList?.find((r) => r.questionId === currentQ.questionId)}
          onChangeAnswer={(patch) => updateAnswer(currentQ.questionId, patch)}
          onToggleFlag={() => toggleFlag(currentQ.questionId)}
        />
      )}

      <div className="flex items-center justify-between gap-2.5">
        <button
          type="button"
          disabled={safeIdx === 0}
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          className="min-h-[46px] px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-black disabled:opacity-40 cursor-pointer"
        >
          ➡ السؤال السابق
        </button>

        {safeIdx < totalQ - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIdx((i) => Math.min(totalQ - 1, i + 1))}
            className="min-h-[46px] px-5 rounded-2xl bg-indigo-900 dark:bg-teal-600 text-white text-xs font-black cursor-pointer"
          >
            السؤال التالي ⬅
          </button>
        ) : (
          !submitted &&
          !isTeacherPreview && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="min-h-[46px] px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
            >
              تسليم الاختبار الآن ✓
            </button>
          )
        )}
      </div>

      {confirmOpen && !submitted && (
        <div className="p-4 rounded-3xl bg-indigo-950 text-white space-y-3 text-center">
          <p className="text-xs sm:text-sm font-black">
            أجبت على {answeredCount} من {totalQ} أسئلة — هل أنت متأكد من تسليم الاختبار؟
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setConfirmOpen(false);
                void submitExam();
              }}
              className="min-h-[44px] px-6 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-black cursor-pointer"
            >
              {submitting ? "جارٍ التصحيح..." : "نعم، سلّم وصحّح الآن"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="min-h-[44px] px-5 rounded-2xl bg-white/10 text-white text-xs font-black cursor-pointer"
            >
              مراجعة إجاباتي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
