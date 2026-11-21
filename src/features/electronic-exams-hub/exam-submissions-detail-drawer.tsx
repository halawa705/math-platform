"use client";

/**
 * @file exam-submissions-detail-drawer.tsx
 * @description عارض تفاصيل تسليمات الطلاب لكل اختبار إلكتروني للمعلم (اسم الطالب، الدرجة، الوقت، وإجابة كل سؤال ✓/✗).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import { useState, useMemo } from "react";
import type { PublishedOnlineExam } from "./published-online-exams-store";
import {
  removeStudentSubmissionLocalSSOT,
  type OnlineExamSubmissionRecord,
} from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import { loadRegisteredStudentsSSOT } from "@/core/ssot/teacher-identity-ssot";
import TeacherManualEssayGradingBox from "./teacher-manual-essay-grading-box";

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
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const siblingCodeSet = useMemo(() => {
    const students = loadRegisteredStudentsSSOT();
    const set = new Set<string>();
    const phoneCounts = new Map<string, number>();
    for (const st of students) {
      if (st.isSibling) set.add(st.studentCode.toUpperCase());
      if (st.studentPhone) {
        phoneCounts.set(st.studentPhone, (phoneCounts.get(st.studentPhone) || 0) + 1);
      }
    }
    for (const st of students) {
      if (st.studentPhone && (phoneCounts.get(st.studentPhone) || 0) > 1) {
        set.add(st.studentCode.toUpperCase());
      }
    }
    return set;
  }, [submissions.length]);

  const handleResetStudentAttempt = async (sub: OnlineExamSubmissionRecord) => {
    setResettingId(sub.submissionId);
    setResetNotice(null);
    try {
      const res = await fetch("/api/exams/reset-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examCode: exam.examId, studentCode: sub.studentCode }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setResetNotice(data.error || "تعذر إعادة فتح المحاولة.");
        return;
      }
      removeStudentSubmissionLocalSSOT(exam.examId, sub.studentCode);
      setConfirmResetId(null);
      setSelectedSubId(null);
      setResetNotice(`✓ تم إعادة فتح الاختبار للطالب ${sub.studentNameAr} (${sub.studentCode}).`);
    } catch {
      setResetNotice("تعذر الاتصال بالخادم لإعادة فتح المحاولة.");
    } finally {
      setResettingId(null);
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="space-y-2">
        {resetNotice && (
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-900 text-xs font-black text-center">
            {resetNotice}
          </div>
        )}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-500 text-center">
          لا توجد تسليمات لهذا الاختبار حتى الآن.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      {resetNotice && (
        <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 text-xs font-black">
          {resetNotice}
        </div>
      )}
      {submissions.map((sub) => {
        const isOpen = selectedSubId === sub.submissionId;
        const durationMs = (exam.durationMinutes || 60) * 60_000;
        const isLate =
          Boolean(sub.startedAtIso) &&
          Date.parse(sub.submittedAtIso) - Date.parse(sub.startedAtIso!) >
            durationMs;
        const isSibling = siblingCodeSet.has(sub.studentCode.toUpperCase());

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
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <span className="truncate">{sub.studentNameAr}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({sub.studentCode})
                </span>
                {isSibling && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 text-[10px]">
                    👨‍👧‍👦 إخوة
                  </span>
                )}
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
              <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-bold">
                  {exam.questions.map((q) => {
                    const ans = sub.answersJson?.[q.questionId];
                    const res = sub.resultJson?.items.find(
                      (i) => i.questionId === q.questionId
                    );
                    const ansLabel =
                      ans?.choiceIndex !== undefined && ans.choiceIndex !== null
                        ? `البديل (${CHOICE_LETTERS[ans.choiceIndex] ?? ans.choiceIndex + 1})`
                        : ans?.proofImageDataUrl
                          ? `📷 صورة حل${ans.text ? ` + ${ans.text}` : ""}`
                          : ans?.proofImageDeletedAfterGrading
                            ? "✓ صورة حل (تم تصحيحها وحذفها)"
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
                              res.pendingTeacherReview
                                ? "text-amber-600 font-black"
                                : res.isCorrect
                                  ? "text-emerald-600 font-black"
                                  : "text-rose-600 font-black"
                            }
                          >
                            {res.pendingTeacherReview
                              ? "⏳ قيد التصحيح"
                              : res.isCorrect
                                ? "✓ صح"
                                : "✗ خطأ"}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <TeacherManualEssayGradingBox
                  examQuestions={exam.questions}
                  submission={sub}
                />
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  {confirmResetId === sub.submissionId ? (
                    <>
                      <span className="text-[11px] font-black text-rose-700 dark:text-rose-300">
                        سيُحذف تسليم الطالب الحالي ليتمكن من الإعادة كمحاولة أولى:
                      </span>
                      <button
                        type="button"
                        disabled={resettingId === sub.submissionId}
                        onClick={() => void handleResetStudentAttempt(sub)}
                        className="min-h-[38px] px-3 rounded-xl bg-rose-600 text-white text-[11px] font-black cursor-pointer"
                      >
                        {resettingId === sub.submissionId ? "جارٍ الفتح..." : "تأكيد إعادة الفتح ✓"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmResetId(null)}
                        className="min-h-[38px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-[11px] font-black cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmResetId(sub.submissionId)}
                      className="min-h-[38px] px-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] font-black cursor-pointer"
                    >
                      🔓 إعادة فتح المحاولة للطالب (عذر قهري)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
