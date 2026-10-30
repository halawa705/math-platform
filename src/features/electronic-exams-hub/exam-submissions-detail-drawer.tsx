"use client";

/**
 * @file exam-submissions-detail-drawer.tsx
 * @description عارض تفاصيل تسليمات الطلاب لكل اختبار إلكتروني للمعلم (اسم الطالب، الدرجة، الوقت، وإجابة كل سؤال ✓/✗).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import { useState } from "react";
import type { PublishedOnlineExam } from "./published-online-exams-store";
import type { OnlineExamSubmissionRecord } from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";

export const MODULE_ID_EXAM_SUBMISSIONS_DETAIL_DRAWER =
  "exam_submissions_detail_drawer" as const;

const CHOICE_LETTERS = ["أ", "ب", "جـ", "د"] as const;

export interface ExamSubmissionsDetailDrawerProps {
  readonly exam: PublishedOnlineExam;
  readonly submissions: readonly OnlineExamSubmissionRecord[];
}

export default function ExamSubmissionsDetailDrawer({
  exam,
  submissions,
}: ExamSubmissionsDetailDrawerProps) {
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  if (submissions.length === 0) {
    return (
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-500 text-center">
        لا توجد تسليمات لهذا الاختبار حتى الآن.
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      {submissions.map((sub) => {
        const isOpen = selectedSubId === sub.submissionId;
        const durationMs = (exam.durationMinutes || 30) * 60_000;
        const isLate =
          Boolean(sub.startedAtIso) &&
          Date.parse(sub.submittedAtIso) - Date.parse(sub.startedAtIso!) >
            durationMs;

        return (
          <div
            key={sub.submissionId}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3 space-y-2"
          >
            <button
              type="button"
              onClick={() =>
                setSelectedSubId((prev) =>
                  prev === sub.submissionId ? null : sub.submissionId
                )
              }
              className="w-full flex items-center justify-between gap-2 text-xs font-black cursor-pointer text-right"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">{sub.studentNameAr}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({sub.studentCode})
                </span>
                {isLate && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                    متأخر
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-lg ${
                    sub.percentageScore >= 70
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {sub.percentageScore}٪
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(sub.submittedAtIso).toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-bold">
                {exam.questions.map((q) => {
                  const ans = sub.answersJson?.[q.questionId];
                  const res = sub.resultJson?.items.find(
                    (i) => i.questionId === q.questionId
                  );
                  const ansLabel =
                    ans?.choiceIndex !== undefined && ans.choiceIndex !== null
                      ? `البديل (${CHOICE_LETTERS[ans.choiceIndex] ?? ans.choiceIndex + 1})`
                      : ans?.text
                      ? ans.text
                      : "بدون إجابة";

                  return (
                    <div
                      key={q.questionId}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800"
                    >
                      <span className="truncate">
                        س{q.displayOrderNumber}: {ansLabel}
                      </span>
                      {res ? (
                        <span
                          className={
                            res.isCorrect
                              ? "text-emerald-600 font-black"
                              : "text-rose-600 font-black"
                          }
                        >
                          {res.isCorrect ? "✓ صح" : "✗ خطأ"}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
