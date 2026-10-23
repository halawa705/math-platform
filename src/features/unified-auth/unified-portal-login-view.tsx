"use client";

/**
 * @file unified-portal-login-view.tsx
 * @description الصفحة الموحدة لتسجيل الدخول (Mobile-First):
 * تظهر للجميع كبوابة دخول طلاب فقط، بينما يدخل المعلم المالك (الأدمن) بطريقتين سريتين:
 * 1) كتابة الرمز السري (`19842026` أو `Halawa#77.`) مباشرة في خانة كود الطالب والضغط على دخول.
 * 2) أو النقر 5 مرات على شعار `∑` في أعلى البطاقة.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_OWNER_TEACHER_IDENTITY_SSOT } from "@/core/ssot/teacher-identity-ssot";
import { ALL_MATH_BRANCHES_LIST } from "@/core/ssot/math-branches-ssot";
import GlobalThemeModeToggleButton from "@/components/global-ui/global-theme-mode-toggle-button";
import StudentCodeLoginForm from "./student-code-login-form";
import StealthTeacherUnlockTrigger from "./stealth-teacher-unlock-trigger";

export default function UnifiedPortalLoginView() {
  const router = useRouter();
  const [isTeacherStealthOpen, setIsTeacherStealthOpen] = useState(false);

  return (
    <main
      dir="rtl"
      className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 relative overflow-hidden"
    >
      {/* شريط علوي رشيق لتبديل الوضع اللوني */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between z-10">
        <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-[11px] font-black">
          منصة تخصصية حصرية للرياضيات ({ALL_MATH_BRANCHES_LIST.length} فرعاً)
        </span>
        <GlobalThemeModeToggleButton />
      </div>

      {/* بطاقة الدخول المركزية الموحدة */}
      <div className="my-auto max-w-md w-full mx-auto p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl space-y-6 z-10">
        <div className="text-center space-y-1.5">
          <StealthTeacherUnlockTrigger
            isUnlocked={isTeacherStealthOpen}
            onUnlockSuccess={() => setIsTeacherStealthOpen((prev) => !prev)}
            onTeacherAuthenticated={() => router.push("/studio")}
          />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.platformBrandName}
          </h1>
          <p className="text-xs font-extrabold text-teal-700 dark:text-teal-400">
            {DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.teacherFullName} —{" "}
            {DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.teacherTitle}
          </p>
        </div>

        <StudentCodeLoginForm
          onStudentSubmit={() => router.push("/student")}
          onStealthCodeDetected={() => setIsTeacherStealthOpen(true)}
          onDirectTeacherLogin={() => router.push("/studio")}
        />

        {/* شريط الفروع الرياضية الـ 11 القابل للسحب باللمس على الهاتف */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-2 text-center">
            الفروع الرياضية المعتمدة في المنصة:
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {ALL_MATH_BRANCHES_LIST.map((b) => (
              <span
                key={b.id}
                className="shrink-0 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
              >
                <span className="font-black text-indigo-700 dark:text-teal-400">
                  {b.symbolBadge}
                </span>
                <span>{b.nameArabic}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <footer className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-600 z-10">
        جميع الحقوق محفوظة © {DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.platformBrandName}
      </footer>
    </main>
  );
}
