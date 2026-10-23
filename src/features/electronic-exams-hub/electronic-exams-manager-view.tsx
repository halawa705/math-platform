"use client";

/**
 * @file electronic-exams-manager-view.tsx
 * @description مركز التقييمات الحقيقي: الاختبارات المنشورة فعلياً (مع التسليمات وزر الأرشفة والمراجعة)،
 * إدارة محاضرات الفيديو لكل صف، والواجبات. لا توجد أي بطاقات وهمية؛ الحالات الفارغة تشرح الخطوة التالية.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import HomeworkDrillsManagerView from "@/features/homework-drills-hub/homework-drills-manager-view";
import { loadEnabledGradesSSOT } from "@/core/ssot/teacher-identity-ssot";
import {
  PUBLISHED_EXAMS_UPDATED_EVENT,
  archiveOnlineExamSSOT,
  formatExamExpiryRemainingAr,
  loadAllPublishedExamsSSOT,
  refreshPublishedExamsFromSupabaseSSOT,
  type PublishedOnlineExam,
} from "./published-online-exams-store";
import {
  addVideoLectureSSOT,
  loadVideoLecturesSSOT,
  removeVideoLectureSSOT,
  type PublishedVideoLecture,
} from "./published-video-lectures-store";
import {
  EXAM_SUBMISSIONS_UPDATED_EVENT,
  loadAllExamSubmissionsSSOT,
  markExamSubmissionsReviewedSSOT,
  refreshExamSubmissionsFromSupabaseSSOT,
  type OnlineExamSubmissionRecord,
} from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";

export const MODULE_ID_ELECTRONIC_EXAMS_MANAGER_VIEW =
  "electronic_exams_manager_view" as const;

const ASSESSMENTS_TABS: readonly SegmentedTabItem[] = [
  { id: "live_exams", labelAr: "الاختبارات الإلكترونية", subtitleAr: "المنشورة والمؤرشفة", icon: "🎯" },
  { id: "videos_hub", labelAr: "محاضرات الفيديو", subtitleAr: "لكل صف", icon: "🎬" },
  { id: "homework_hub", labelAr: "الواجبات", subtitleAr: "نشر ومتابعة", icon: "📝" },
];

export default function ElectronicExamsManagerView() {
  const [activeTabId, setActiveTabId] = useState<string>("live_exams");
  const [exams, setExams] = useState<readonly PublishedOnlineExam[]>([]);
  const [subs, setSubs] = useState<readonly OnlineExamSubmissionRecord[]>([]);
  const [videos, setVideos] = useState<readonly PublishedVideoLecture[]>([]);
  const [grades, setGrades] = useState(() => loadEnabledGradesSSOT());
  const [videoGradeId, setVideoGradeId] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    const refresh = () => {
      setExams(loadAllPublishedExamsSSOT());
      setSubs(loadAllExamSubmissionsSSOT());
      setVideos(loadVideoLecturesSSOT());
    };
    const g = loadEnabledGradesSSOT();
    setGrades(g);
    setVideoGradeId(g[0]?.id || "");
    refresh();
    void refreshPublishedExamsFromSupabaseSSOT();
    void refreshExamSubmissionsFromSupabaseSSOT();
    window.addEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, refresh);
    window.addEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, refresh);
      window.removeEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, refresh);
    };
  }, []);

  const refreshVideos = () => setVideos(loadVideoLecturesSSOT());

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-28 md:pb-14 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
    >
      <TopFourCentersNavigationBar activeCenter="assessments" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <SegmentedWorkspaceTabsBar
          tabs={ASSESSMENTS_TABS}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
        />

        {activeTabId === "live_exams" &&
          (exams.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white dark:bg-[#111827] border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <div className="text-3xl">🎯</div>
              <h3 className="text-sm font-black">لم تنشر أي اختبار إلكتروني بعد</h3>
              <p className="text-xs font-bold text-slate-500">
                من الاستوديو: ولّد أسئلة الاختبار، صيّرها، ثم اضغط «نشر كاختبار إلكتروني للطلاب».
              </p>
              <Link
                href="/studio"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-900 text-white text-xs font-black"
              >
                الذهاب إلى الاستوديو
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam) => {
                const examSubs = subs.filter((s) => s.examId === exam.examId);
                const avg =
                  examSubs.length > 0
                    ? Math.round(
                        examSubs.reduce((a, s) => a + s.percentageScore, 0) / examSubs.length
                      )
                    : null;
                const pending = examSubs.filter((s) => !s.isReviewedByTeacher).length;
                const isActive = exam.status === "active";
                const expiryInfo = formatExamExpiryRemainingAr(exam.expiresAtIso);
                return (
                  <div
                    key={exam.examId}
                    className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-black">
                      <span
                        className={`px-2.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isActive ? `نشط (${exam.availabilityDays} يوم)` : "مؤرشف بكامل بياناته"}
                      </span>
                      <span className="text-slate-400">زمن الحل: {exam.durationMinutes} دقيقة</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black">{exam.titleAr}</h3>
                      <p className="text-xs font-bold text-slate-500">
                        {exam.gradeNameArabic} • {exam.questions.length} أسئلة
                      </p>
                      <p className="text-[11px] font-bold text-teal-700 dark:text-teal-400 mt-1">
                        ⏳ {isActive ? expiryInfo.labelAr : "أُرشف الاختبار مع حفظ جميع تسليمات ودرجات الطلاب"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs font-black pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>تسليمات: {examSubs.length}</span>
                      <span className="text-teal-700 dark:text-teal-400">
                        المتوسط: {avg === null ? "—" : `${avg}٪`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pending > 0 && (
                        <button
                          type="button"
                          onClick={() => markExamSubmissionsReviewedSSOT(exam.examId)}
                          className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-black cursor-pointer"
                        >
                          ✓ تمت مراجعة {pending} تسليم
                        </button>
                      )}
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => archiveOnlineExamSSOT(exam.examId)}
                          className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-black cursor-pointer"
                        >
                          📦 أرشفة الاختبار (تخفي قاعة المتميزين)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {activeTabId === "videos_hub" && (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!videoGradeId || !videoTitle.trim() || !videoUrl.trim()) return;
                addVideoLectureSSOT({
                  gradeId: videoGradeId,
                  titleAr: videoTitle,
                  videoUrl,
                });
                setVideoTitle("");
                setVideoUrl("");
                refreshVideos();
              }}
              className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الصف</label>
                <select
                  value={videoGradeId}
                  onChange={(e) => setVideoGradeId(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black"
                >
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>{g.nameArabic}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">عنوان المحاضرة</label>
                <input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">رابط الفيديو</label>
                <input
                  dir="ltr"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>
              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black cursor-pointer"
              >
                ➕ إضافة المحاضرة
              </button>
            </form>

            {videos.length === 0 ? (
              <p className="text-center text-xs font-bold text-slate-400 py-6">
                لم تُضف أي محاضرة بعد.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {videos.map((v) => (
                  <div
                    key={v.lectureId}
                    className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate">{v.titleAr}</div>
                      <div className="text-[11px] font-bold text-slate-500">
                        {grades.find((g) => g.id === v.gradeId)?.nameArabic || v.gradeId}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeVideoLectureSSOT(v.lectureId);
                        refreshVideos();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-black cursor-pointer shrink-0"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTabId === "homework_hub" && <HomeworkDrillsManagerView />}
      </main>
    </div>
  );
}
