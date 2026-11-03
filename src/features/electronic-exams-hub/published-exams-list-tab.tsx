"use client";

/**
 * @file published-exams-list-tab.tsx
 * @description تبويب الاختبارات الإلكترونية المنشورة والأرشيف: فلترة (النشطة / الأرشيف / الكل)،
 * نسخ رابط المشاركة للطلاب، تجربة الحل كطالب، تعديل الوقت والمدة والأسئلة، وإعادة التفعيل من الأرشيف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import CalmEmptyStateCard from "@/components/global-ui/calm-empty-state-card";
import {
  PUBLISHED_EXAMS_UPDATED_EVENT,
  archiveOnlineExamSSOT,
  buildStudentExamShareUrlSSOT,
  deleteOnlineExamSSOT,
  formatExamExpiryRemainingAr,
  loadAllPublishedExamsSSOT,
  refreshPublishedExamsFromSupabaseSSOT,
  updateOnlineExamSettingsSSOT,
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
import ExamSubmissionsDetailDrawer from "./exam-submissions-detail-drawer";
import PublishedExamSettingsEditorModal from "./published-exam-settings-editor-modal";

export const MODULE_ID_PUBLISHED_EXAMS_LIST_TAB = "published_exams_list_tab" as const;

type ExamFilterStatus = "active" | "archived" | "all";

export default function PublishedExamsListTab() {
  const [exams, setExams] = useState<readonly PublishedOnlineExam[]>([]);
  const [subs, setSubs] = useState<readonly OnlineExamSubmissionRecord[]>([]);
  const [filter, setFilter] = useState<ExamFilterStatus>("all");
  const [openExamId, setOpenExamId] = useState<string | null>(null);
  const [editingExam, setEditingExam] = useState<PublishedOnlineExam | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refresh = () => {
    setExams(loadAllPublishedExamsSSOT());
    setSubs(loadAllExamSubmissionsSSOT());
  };

  useEffect(() => {
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
        hintAr="من الاستوديو: ولّد أسئلة الاختبار، عاينها، ثم اضغط «نشر كاختبار إلكتروني للطلاب»."
        actionHref="/studio"
        actionLabelAr="الذهاب إلى الاستوديو"
      />
    );
  }

  const activeCount = exams.filter((e) => e.status === "active").length;
  const archivedCount = exams.filter((e) => e.status === "archived").length;
  const visibleExams = exams.filter((e) => (filter === "all" ? true : e.status === filter));

  const copyShareUrl = (exam: PublishedOnlineExam) => {
    if (typeof navigator === "undefined") return;
    void navigator.clipboard.writeText(buildStudentExamShareUrlSSOT(exam));
    setCopiedId(exam.examId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {([
            { id: "all", label: `📋 الكل (${exams.length})` },
            { id: "active", label: `🟢 النشطة حالياً (${activeCount})` },
            { id: "archived", label: `🗄️ أرشيف المنتهية (${archivedCount})` },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer ${
                filter === tab.id
                  ? "bg-indigo-900 dark:bg-teal-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Link
          href="/studio"
          className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1"
        >
          <span>➕</span>
          <span>إنشاء اختبار جديد</span>
        </Link>
      </div>

      {visibleExams.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center text-xs font-black text-slate-500">
          {filter === "archived"
            ? "لا توجد اختبارات في الأرشيف حالياً. عندما ينتهي مؤقت عرض أي اختبار ينتقل إلى هنا تلقائياً."
            : "لا توجد اختبارات نشطة حالياً. يمكنك إعادة تفعيل أي اختبار من تبويب الأرشيف أو نشر اختبار جديد."}
        </div>
      ) : (
        visibleExams.map((exam) => {
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
                    {exam.gradeNameArabic} • {exam.questions.length} أسئلة • زمن الحل: {exam.durationMinutes} دقيقة
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {isActive ? "🟢 نشط للطلاب" : "🗄️ في الأرشيف"}
                </span>
              </div>

              <p className="text-[11px] font-bold text-slate-500">
                {isActive
                  ? `⏳ ${expiryInfo.labelAr}`
                  : "🗄️ أُرشف الاختبار (تُحفظ جميع تسليمات ودرجات الطلاب ويمكنك إعادة فتحه في أي وقت)"}
              </p>

              <div className="flex items-center justify-between text-xs font-black pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>التسليمات: {examSubs.length}</span>
                <span className="text-slate-500">متوسط الدرجات: {avg === null ? "—" : `${avg}٪`}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyShareUrl(exam)}
                  className="min-h-[42px] px-3.5 rounded-xl bg-indigo-900 dark:bg-teal-600 text-white text-xs font-black cursor-pointer"
                >
                  {copiedId === exam.examId ? "✓ تم نسخ رابط الطلاب" : "🔗 نسخ رابط الاختبار للطلاب"}
                </button>

                <Link
                  href={`/student?tab=live_exam&gradeId=${encodeURIComponent(exam.gradeId)}&examId=${encodeURIComponent(exam.examId)}`}
                  className="min-h-[42px] px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-black flex items-center gap-1"
                >
                  <span>🧑‍🎓</span>
                  <span>تجربة ومعاينة كطالب</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setEditingExam(exam)}
                  className="min-h-[42px] px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black cursor-pointer"
                >
                  ⚙️ تعديل الوقت / المدة / الأسئلة
                </button>

                <button
                  type="button"
                  onClick={() => setOpenExamId((prev) => (prev === exam.examId ? null : exam.examId))}
                  className="min-h-[42px] px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black cursor-pointer"
                >
                  📋 التسليمات ({examSubs.length})
                </button>

                {pending > 0 && (
                  <button
                    type="button"
                    onClick={() => markExamSubmissionsReviewedSSOT(exam.examId)}
                    className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black cursor-pointer"
                  >
                    ✓ اعتماد مراجعة {pending} تسليم
                  </button>
                )}

                {isActive ? (
                  <button
                    type="button"
                    onClick={() => archiveOnlineExamSSOT(exam.examId)}
                    className="min-h-[42px] px-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-xs font-black text-rose-600 dark:text-rose-300 cursor-pointer"
                  >
                    🗄️ نقل للأرشيف
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        updateOnlineExamSettingsSSOT({
                          examId: exam.examId,
                          availabilityDays: 7,
                          status: "active",
                        });
                        refresh();
                      }}
                      className="min-h-[42px] px-3.5 rounded-xl bg-teal-600 text-white text-xs font-black cursor-pointer"
                    >
                      🔄 إعادة فتح وتفعيل (٧ أيام)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteOnlineExamSSOT(exam.examId);
                        refresh();
                      }}
                      className="min-h-[42px] px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-xs font-black text-rose-600 cursor-pointer"
                    >
                      🗑️ حذف
                    </button>
                  </>
                )}
              </div>

              {openExamId === exam.examId && (
                <ExamSubmissionsDetailDrawer exam={exam} submissions={examSubs} />
              )}
            </article>
          );
        })
      )}

      {editingExam && (
        <PublishedExamSettingsEditorModal
          exam={editingExam}
          onClose={() => setEditingExam(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
