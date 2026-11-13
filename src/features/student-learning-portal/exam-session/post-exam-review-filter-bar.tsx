"use client";

/**
 * @file post-exam-review-filter-bar.tsx
 * @description شريط فلترة المراجعة بعد تسليم الاختبار الإلكتروني (`الكل` / `الأخطاء فقط` / `الصحيحة فقط` / `بانتظار التصحيح`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 115 سطراً).
 */

import type { OnlineQuestionResult } from "@/core/exam-grading/online-exam-grader";
import type { PublishedExamQuestionItem } from "@/features/electronic-exams-hub/published-online-exams-store";

export const MODULE_ID_POST_EXAM_REVIEW_FILTER_BAR =
  "post_exam_review_filter_bar" as const;

export type ExamPostReviewFilterKind = "all" | "wrong" | "correct" | "pending";

export interface PostExamReviewCounts {
  readonly all: number;
  readonly correct: number;
  readonly wrong: number;
  readonly pending: number;
}

export function computePostExamReviewCounts(
  questions: readonly PublishedExamQuestionItem[],
  resultItems: readonly OnlineQuestionResult[]
): PostExamReviewCounts {
  let correct = 0;
  let wrong = 0;
  let pending = 0;
  for (const q of questions) {
    const r = resultItems.find((item) => item.questionId === q.questionId);
    if (r?.pendingTeacherReview) {
      pending += 1;
    } else if (r?.isCorrect) {
      correct += 1;
    } else {
      wrong += 1;
    }
  }
  return { all: questions.length, correct, wrong, pending };
}

export function doesQuestionMatchReviewFilter(
  resultItem: OnlineQuestionResult | undefined,
  filter: ExamPostReviewFilterKind
): boolean {
  if (filter === "all") return true;
  if (filter === "pending") return Boolean(resultItem?.pendingTeacherReview);
  if (filter === "correct") return Boolean(resultItem?.isCorrect && !resultItem?.pendingTeacherReview);
  return Boolean(!resultItem?.isCorrect && !resultItem?.pendingTeacherReview);
}

export interface PostExamReviewFilterBarProps {
  readonly counts: PostExamReviewCounts;
  readonly activeFilter: ExamPostReviewFilterKind;
  readonly onSelectFilter: (filter: ExamPostReviewFilterKind) => void;
}

export default function PostExamReviewFilterBar({
  counts,
  activeFilter,
  onSelectFilter,
}: PostExamReviewFilterBarProps) {
  const tabs: ReadonlyArray<{
    readonly id: ExamPostReviewFilterKind;
    readonly label: string;
    readonly visible: boolean;
  }> = [
    { id: "all", label: `📋 الكل (${counts.all})`, visible: true },
    { id: "wrong", label: `✗ الأخطاء فقط (${counts.wrong})`, visible: true },
    { id: "correct", label: `✓ الصحيحة فقط (${counts.correct})`, visible: true },
    {
      id: "pending",
      label: `⏳ بانتظار تصحيح المعلم (${counts.pending})`,
      visible: counts.pending > 0,
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {tabs
        .filter((t) => t.visible)
        .map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectFilter(tab.id)}
            className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap cursor-pointer border transition ${
              activeFilter === tab.id
                ? "bg-indigo-900 border-indigo-900 text-white dark:bg-teal-600 dark:border-teal-600 shadow-xs"
                : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
    </div>
  );
}
