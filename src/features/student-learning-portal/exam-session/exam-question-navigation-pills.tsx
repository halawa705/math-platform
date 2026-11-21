"use client";

/**
 * @file exam-question-navigation-pills.tsx
 * @description شريط أرقام الأسئلة مع تمييز الأسئلة المحلولة باللون الأخضر وغير المحلولة باللون الباهت،
 * وتطبيق قفل الاتجاه الواحد في وضع التدريب.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import type { LockedTrainingQuestionFeedback, OnlineExamSessionMode } from "@/core/auth/exam-attempt-state-server-store";
import type { OnlineQuestionResult, StudentAnswerInput } from "@/core/exam-grading/online-exam-grader";
import type { PublishedExamQuestionItem } from "@/features/electronic-exams-hub/published-online-exams-store";
import {
  doesQuestionMatchReviewFilter,
  type ExamPostReviewFilterKind,
} from "./post-exam-review-filter-bar";

export const MODULE_ID_EXAM_QUESTION_NAVIGATION_PILLS =
  "exam_question_navigation_pills" as const;

export interface ExamQuestionNavigationPillsProps {
  readonly questions: readonly PublishedExamQuestionItem[];
  readonly answers: Readonly<Record<string, StudentAnswerInput | undefined>>;
  readonly flaggedIds: Readonly<Record<string, boolean>>;
  readonly lockedMode: OnlineExamSessionMode | null;
  readonly lockedQuestionIds: readonly string[];
  readonly lockedFeedbackByQuestion: Readonly<Record<string, LockedTrainingQuestionFeedback>>;
  readonly currentIdx: number;
  readonly isSubmitted: boolean;
  readonly resultItems: readonly OnlineQuestionResult[];
  readonly reviewFilter: ExamPostReviewFilterKind;
  readonly onSelectIndex: (idx: number) => void;
}

export default function ExamQuestionNavigationPills({
  questions,
  answers,
  flaggedIds,
  lockedMode,
  lockedQuestionIds,
  lockedFeedbackByQuestion,
  currentIdx,
  isSubmitted,
  resultItems,
  reviewFilter,
  onSelectIndex,
}: ExamQuestionNavigationPillsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {questions.map((q, idx) => {
        const a = answers[q.questionId];
        const isAns = Boolean(a && (a.choiceIndex !== undefined || a.text?.trim() || a.proofImageDataUrl));
        const resItem = resultItems.find((r) => r.questionId === q.questionId);
        if (isSubmitted && !doesQuestionMatchReviewFilter(resItem, reviewFilter)) return null;

        const isTrainingLocked = lockedMode === "training" && lockedQuestionIds.includes(q.questionId);
        const trainingRes = lockedFeedbackByQuestion[q.questionId];

        let dotStyle =
          "bg-slate-100/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60";
        if (isSubmitted && resItem) {
          dotStyle = resItem.pendingTeacherReview
            ? "bg-amber-500 border-amber-500 text-slate-950"
            : resItem.isCorrect
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-rose-600 border-rose-600 text-white";
        } else if (isTrainingLocked && trainingRes) {
          dotStyle = trainingRes.isCorrect
            ? "bg-emerald-600 border-emerald-600 text-white"
            : "bg-rose-600 border-rose-600 text-white";
        } else if (flaggedIds[q.questionId]) {
          dotStyle = "bg-amber-400 border-amber-500 text-slate-950";
        } else if (isAns) {
          dotStyle = "bg-emerald-600 border-emerald-600 text-white shadow-xs";
        }

        return (
          <button
            key={q.questionId}
            type="button"
            onClick={() => onSelectIndex(idx)}
            className={`min-w-[40px] min-h-[40px] rounded-xl border text-xs font-black cursor-pointer transition shrink-0 ${dotStyle} ${
              currentIdx === idx ? "ring-2 ring-indigo-600 dark:ring-teal-400 scale-105" : ""
            }`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}
