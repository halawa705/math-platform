"use client";

/**
 * @file student-learning-portal-view.tsx
 * @description بوابة الطالب: تعتمد على هوية الطالب المسجل فعلياً (جلسة الدخول)، وتعرض صفحة رئيسية هادئة
 * تبدأ بقاعة المتميزين لصفه فقط ثم رسماً بيانياً لدرجاته الفعلية. لا توجد أي بيانات وهمية.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopFourCentersNavigationBar from "@/components/global-ui/top-four-centers-navigation-bar";
import SegmentedWorkspaceTabsBar, { type SegmentedTabItem } from "@/components/global-ui/segmented-workspace-tabs-bar";
import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  STUDENTS_REGISTRY_UPDATED_EVENT,
  clearRememberedSessionSSOT,
  loadEnabledGradesSSOT,
  loadRememberedSessionSSOT,
  loadTeacherIdentitySSOT,
  refreshRegisteredStudentsFromSupabaseSSOT,
  refreshTeacherIdentityFromSupabaseSSOT,
  saveRememberedSessionSSOT,
} from "@/core/ssot/teacher-identity-ssot";
import {
  PUBLISHED_EXAMS_UPDATED_EVENT,
  refreshPublishedExamsFromSupabaseSSOT,
} from "@/features/electronic-exams-hub/published-online-exams-store";
import {
  EXAM_SUBMISSIONS_UPDATED_EVENT,
  MIN_HONOR_ROLL_PERCENTAGE_SSOT,
  getGradeAnalyticsAndHonorRollSSOT,
  loadStudentExamHistorySSOT,
  refreshExamSubmissionsFromSupabaseSSOT,
  type GradeAnalyticsMetric,
  type StudentExamHistoryItem,
} from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import { analyzeStudentPersonalDiagnosticsSSOT } from "@/features/teacher-home-dashboard/exam-strengths-weaknesses-analyzer";
import type { StudentPersonalDiagnosticSummary } from "@/core/exam-grading/student-personal-diagnostics-calculator";
import HonorRollPodium from "@/features/teacher-home-dashboard/honor-roll-podium";
import StudentAssignedExamsTab from "./student-assigned-exams-tab";
import StudentAssignedVideosTab from "./student-assigned-videos-tab";
import StudentAssignedBookletsTab from "./student-assigned-booklets-tab";
import StudentAssignedHomeworkTab from "./student-assigned-homework-tab";
import StudentPersonalDiagnosticsCard from "./student-personal-diagnostics-card";

export const MODULE_ID_STUDENT_LEARNING_PORTAL_VIEW = "student_learning_portal_view" as const;

const STUDENT_PORTAL_TABS: readonly SegmentedTabItem[] = [
  { id: "overview", labelAr: "الرئيسية", subtitleAr: "المتميزون ودرجاتي", icon: "📊" },
  { id: "live_exam", labelAr: "الاختبار", subtitleAr: "حل فوري", icon: "🎯" },
  { id: "homework", labelAr: "الواجب", subtitleAr: "تدريب بالخطوات", icon: "📝" },
  { id: "booklets", labelAr: "المذكرات", subtitleAr: "ملفات الدروس", icon: "📘" },
  { id: "videos", labelAr: "المحاضرات", subtitleAr: "فيديو الشرح", icon: "🎬" },
];

export default function StudentLearningPortalView() {
  const router = useRouter();
  const [activeTabId, setActiveTabId] = useState<string>("overview");
  const [ready, setReady] = useState<boolean>(false);
  const [isTeacherPreview, setIsTeacherPreview] = useState<boolean>(false);
  const [studentCode, setStudentCode] = useState<string | undefined>(undefined);
  const [studentName, setStudentName] = useState<string>("");
  const [studentGradeId, setStudentGradeId] = useState<string>("");
  const [targetExamId, setTargetExamId] = useState<string>("");
  const [enabledGrades, setEnabledGrades] = useState(() => loadEnabledGradesSSOT());
  const [metric, setMetric] = useState<GradeAnalyticsMetric | null>(null);
  const [history, setHistory] = useState<readonly StudentExamHistoryItem[]>([]);
  const [personalDiagnostics, setPersonalDiagnostics] = useState<StudentPersonalDiagnosticSummary | null>(null);
  const [footerText, setFooterText] = useState<string>(DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.footerText);

  useEffect(() => {
    const grades = loadEnabledGradesSSOT();
    setEnabledGrades(grades);
    setFooterText(loadTeacherIdentitySSOT().footerText);
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const urlTab = params?.get("tab") || "";
    const urlGradeId = params?.get("gradeId") || "";
    const urlExamId = params?.get("examId") || "";

    const applyTabFromUrl = () => {
      if (urlTab && STUDENT_PORTAL_TABS.some((t) => t.id === urlTab)) setActiveTabId(urlTab);
      else if (urlExamId) setActiveTabId("live_exam");
      if (urlExamId) setTargetExamId(urlExamId);
    };

    const session = loadRememberedSessionSSOT();
    if (!session) {
      fetch("/api/auth/student-session-check")
        .then((res) => res.json())
        .then((data: {
          isAuthenticated?: boolean;
          student?: { studentCode: string; fullNameAr: string; gradeId: string; isSibling?: boolean };
        }) => {
          if (data?.isAuthenticated && data.student) {
            saveRememberedSessionSSOT({
              role: "student",
              studentCode: data.student.studentCode,
              studentNameAr: data.student.fullNameAr,
              gradeId: data.student.gradeId,
              isSibling: Boolean(data.student.isSibling),
              savedAtIso: new Date().toISOString(),
            });
            applyTabFromUrl();
            setStudentCode(data.student.studentCode);
            setStudentName(data.student.fullNameAr);
            setStudentGradeId(data.student.gradeId || urlGradeId || grades[0]?.id || "");
            setReady(true);
            return;
          }
          if (typeof window !== "undefined" && (urlTab || urlExamId)) {
            try {
              window.sessionStorage.setItem(
                "math_platform_pending_redirect",
                window.location.pathname + window.location.search
              );
            } catch { /* ignore */ }
          }
          router.replace("/");
        })
        .catch(() => router.replace("/"));
      return;
    }

    applyTabFromUrl();
    if (session.role === "teacher") {
      setIsTeacherPreview(true);
      setStudentGradeId(urlGradeId || grades[0]?.id || "prep-3");
      if (urlGradeId && !grades.some((g) => g.id === urlGradeId)) {
        const extraGrade = EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === urlGradeId);
        if (extraGrade) setEnabledGrades([...grades, extraGrade]);
      }
    } else {
      setStudentCode(session.studentCode);
      setStudentName(session.studentNameAr || "");
      setStudentGradeId(session.gradeId || urlGradeId || grades[0]?.id || "");
    }
    setReady(true);
  }, [router]);

  const gradeObj =
    enabledGrades.find((g) => g.id === studentGradeId) ||
    EGYPTIAN_MATH_GRADES_SSOT.find((g) => g.id === studentGradeId);
  const gradeName = gradeObj?.nameArabic || "";

  useEffect(() => {
    if (!ready) return;
    const refresh = () => {
      setMetric(getGradeAnalyticsAndHonorRollSSOT(studentGradeId, gradeName));
      setHistory(studentCode ? loadStudentExamHistorySSOT(studentCode) : []);
      setPersonalDiagnostics(
        studentCode ? analyzeStudentPersonalDiagnosticsSSOT(studentCode, studentGradeId) : null
      );
    };
    const pullCloud = () => {
      void refreshTeacherIdentityFromSupabaseSSOT();
      void refreshRegisteredStudentsFromSupabaseSSOT();
      void refreshPublishedExamsFromSupabaseSSOT();
      void refreshExamSubmissionsFromSupabaseSSOT();
    };
    refresh();
    pullCloud();
    const intervalId = window.setInterval(pullCloud, 15000);
    window.addEventListener(STUDENTS_REGISTRY_UPDATED_EVENT, refresh);
    window.addEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, refresh);
    window.addEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(STUDENTS_REGISTRY_UPDATED_EVENT, refresh);
      window.removeEventListener(PUBLISHED_EXAMS_UPDATED_EVENT, refresh);
      window.removeEventListener(EXAM_SUBMISSIONS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [ready, studentGradeId, gradeName, studentCode, activeTabId]);

  if (!ready) return null;

  return (
    <div dir="rtl" className="min-h-screen pb-28 md:pb-14 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
      <TopFourCentersNavigationBar activeCenter="student" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black">{isTeacherPreview ? "معاينة شاشة الطالب" : `أهلاً ${studentName}`}</h1>
            <p className="text-xs font-bold text-teal-700 dark:text-teal-400">{gradeName}</p>
          </div>
          {isTeacherPreview ? (
            <select
              value={studentGradeId}
              onChange={(e) => setStudentGradeId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black"
            >
              {enabledGrades.map((g) => (
                <option key={g.id} value={g.id}>{g.nameArabic}</option>
              ))}
            </select>
          ) : (
            <button
              type="button"
              onClick={() => {
                clearRememberedSessionSSOT();
                void fetch("/api/auth/student-logout", { method: "POST" }).finally(() => router.replace("/"));
              }}
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-black text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              🚪 تبديل الحساب
            </button>
          )}
        </div>

        <SegmentedWorkspaceTabsBar tabs={STUDENT_PORTAL_TABS} activeTabId={activeTabId} onSelectTab={setActiveTabId} />

        {activeTabId === "overview" && metric && (
          <div className="space-y-6">
            <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h2 className="text-base font-black">👑 قاعة المتميزين</h2>
              <HonorRollPodium
                gradeNameAr={gradeName}
                entries={metric.topThreeHonorRoll}
                hasActiveExam={metric.hasActiveExam}
                activeExamTitleAr={metric.activeExamTitleAr}
                minPercentage={MIN_HONOR_ROLL_PERCENTAGE_SSOT}
              />
            </section>

            <section className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h2 className="text-base font-black">📈 درجاتي مقارنة بمتوسط صفي</h2>
              {history.length === 0 ? (
                <p className="text-xs font-bold text-slate-500 py-4 text-center">
                  {isTeacherPreview ? "تظهر هنا درجات الطالب الفعلية بعد أدائه للاختبارات." : "لم تؤدِّ أي اختبار بعد. ستظهر درجاتك هنا بعد أول اختبار."}
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="truncate">{item.examTitleAr}</span>
                        <span className="text-teal-700 dark:text-teal-400 shrink-0">
                          {item.studentPercentage}٪ <span className="text-slate-400">/ متوسط الصف {item.classAveragePercentage}٪</span>
                        </span>
                      </div>
                      <div className="relative h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div style={{ width: `${item.studentPercentage}%` }} className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-teal-500 to-emerald-600" />
                        <div style={{ right: `${item.classAveragePercentage}%` }} className="absolute inset-y-0 w-0.5 bg-slate-500" title="متوسط الصف" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {personalDiagnostics && (
              <StudentPersonalDiagnosticsCard summary={personalDiagnostics} />
            )}
          </div>
        )}

        {activeTabId === "live_exam" && (
          <StudentAssignedExamsTab
            studentCode={studentCode}
            studentNameAr={studentName}
            gradeId={studentGradeId}
            initialExamId={targetExamId}
            isTeacherPreview={isTeacherPreview}
          />
        )}
        {activeTabId === "videos" && <StudentAssignedVideosTab gradeId={studentGradeId} />}
        {activeTabId === "booklets" && <StudentAssignedBookletsTab gradeId={studentGradeId} />}
        {activeTabId === "homework" && (
          <StudentAssignedHomeworkTab gradeId={studentGradeId} studentCode={studentCode} />
        )}
      </main>

      <footer className="max-w-4xl mx-auto w-full px-4 pt-10 text-center text-xs font-bold text-slate-400">{footerText}</footer>
    </div>
  );
}
