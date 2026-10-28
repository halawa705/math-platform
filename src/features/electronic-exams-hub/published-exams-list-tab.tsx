"use client";

/**
 * @file published-exams-list-tab.tsx
 * @description تبويب الاختبارات الإلكترونية المنشورة: قائمة هادئة بالحالة والتسليمات والمتوسط مع زرّي المراجعة والأرشفة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import { useEffect, useState } from "react";
import CalmEmptyStateCard from "@/components/global-ui/calm-empty-state-card";
import {
  PUBLISHED_EXAMS_UPDATED_EVENT,
  archiveOnlineExamSSOT,
  formatExamExpiryRemainingAr,
  loadAllPublishedExamsSSOT,
  refreshPublishedExamsFromSupabaseSSOT,
  type PublishedOnlineExam,
} from "./published-online-exams-store";
import {
  EXAM_SUBMISSIONS_UPDATED_EVENT,
  loadAllExamSubmissionsSSOT,
  markExamSubmissionsReviewedSSOT,
  refreshExamSubmissionsFromSupabaseSSOT,
  type OnlineExamSubmissionRecord,
} from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import { subscribeToSupabaseRealtimeTables } from "@/core/supabase/supabase-realtime-submissions-channel";

export const MODULE_ID_PUBLISHED_EXAMS_LIST_TAB = "published_exams_list_tab" as const;

export default function PublishedExamsListTab() {
  const [exams, setExams] = useState<readonly PublishedOnlineExam[]>([]);
  const [subs, setSubs] = useState<readonly OnlineExamSubmissionRecord[]>([]);

  useEffect(() => {
    const refresh = () => {
      setExams(loadAllPublishedExamsSSOT());
      setSubs(loadAllExamSubmissionsSSOT());
    };
    refresh();
    void refreshPublishedExamsFromSupabaseSSOT();
    void refreshExamSubmissionsFromSupabaseSSOT();
    const unsubscribeRealtime = subscribeToSupabaseRealtimeTables({
      onExamSubmissionsChanged: () => void refreshExamSubmissionsFromSupabaseSSOT(),
      onPublishedExamsChanged: () => void refreshPublishedExamsFromSupabaseSSOT(),
    });
    window.addEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, refresh);
    window.addEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, refresh);
    return () => {
      unsubscribeRealtime();
      window.removeEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, refresh);
      window.removeEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, refresh);
    };
  }, []);

  if (exams.length === 0) {
    return (
      <CalmEmptyStateCard
        icon="🎯"
        titleAr="لم تنشر أي اختبار إلكتروني بعد"
        hintAr="من الاستوديو: ولّد أسئلة الاختبار، صيّرها، ثم اضغط «نشر كاختبار إلكتروني للطلاب»."
        actionHref="/studio"
        actionLabelAr="الذهاب إلى الاستوديو"
      />
    );
  }

  return (
    <div className="space-y-3">
      {exams.map((exam) => {
        const examSubs = subs.filter((s) => s.examId === exam.examId);
        const avg =
          examSubs.length > 0
            ? Math.round(examSubs.reduce((a, s) => a + s.percentageScore, 0) / examSubs.length)
            : null;
        const pending = examSubs.filter((s) => !s.isReviewedByTeacher).length;
        const isActive = exam.status === "active";
        const expiryInfo = formatExamExpiryRemainingAr(exam.expiresAtIso);
        return (
          <article
            key={exam.examId}
            className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-black truncate">{exam.titleAr}</h3>
                <p className="text-[11px] font-bold text-slate-500">
                  {exam.gradeNameArabic} • {exam.questions.length} أسئلة • {exam.durationMinutes} دقيقة
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {isActive ? "نشط" : "مؤرشف"}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500">
              {isActive ? expiryInfo.labelAr : "أُرشف الاختبار مع حفظ جميع تسليمات ودرجات الطلاب"}
            </p>
            <div className="flex items-center justify-between text-xs font-black pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>التسليمات: {examSubs.length}</span>
              <span className="text-slate-500">المتوسط: {avg === null ? "—" : `${avg}٪`}</span>
            </div>
            {(pending > 0 || isActive) && (
              <div className="flex flex-wrap gap-2">
                {pending > 0 && (
                  <button
                    type="button"
                    onClick={() => markExamSubmissionsReviewedSSOT(exam.examId)}
                    className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black cursor-pointer"
                  >
                    ✓ تمت مراجعة {pending} تسليم
                  </button>
                )}
                {isActive && (
                  <button
                    type="button"
                    onClick={() => archiveOnlineExamSSOT(exam.examId)}
                    className="min-h-[44px] px-4 rounded-xl text-xs font-black text-rose-600 cursor-pointer"
                  >
                    أرشفة الاختبار
                  </button>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
