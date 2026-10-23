"use client";

/**
 * @file unified-portal-login-view.tsx
 * @description الصفحة الموحدة لتسجيل الدخول وإنشاء حساب الطالب (Mobile-First):
 * - تتحقق تلقائياً من جلسة «تذكرني» (`loadRememberedSessionSSOT`) لتوجيه المعلم إلى `/dashboard` أو الطالب إلى `/student` فوراً دون طلب الكود كل مرة.
 * - تقرأ الهوية والتذييل من مصدر الحقيقة الموحد `loadTeacherIdentitySSOT`.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  loadTeacherIdentitySSOT,
  loadRememberedSessionSSOT,
  saveRememberedSessionSSOT,
  type OwnerTeacherIdentity,
} from "@/core/ssot/teacher-identity-ssot";
import GlobalThemeModeToggleButton from "@/components/global-ui/global-theme-mode-toggle-button";
import StudentCodeLoginForm from "./student-code-login-form";
import StealthTeacherUnlockTrigger from "./stealth-teacher-unlock-trigger";

export default function UnifiedPortalLoginView() {
  const router = useRouter();
  const [isTeacherStealthOpen, setIsTeacherStealthOpen] = useState(false);
  const [identity, setIdentity] = useState<OwnerTeacherIdentity>(
    DEFAULT_OWNER_TEACHER_IDENTITY_SSOT
  );

  useEffect(() => {
    setIdentity(loadTeacherIdentitySSOT());
    const remembered = loadRememberedSessionSSOT();
    if (remembered?.role === "teacher") {
      router.replace("/dashboard");
    } else if (remembered?.role === "student") {
      router.replace("/student");
    }
  }, [router]);

  return (
    <main
      dir="rtl"
      className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 relative overflow-hidden"
    >
      {/* شريط علوي هادئ */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between z-10">
        <span className="px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-black">
          {identity.platformBrandName}
        </span>
        <GlobalThemeModeToggleButton />
      </div>

      {/* بطاقة الدخول والتسجيل المركزية الهادئة */}
      <div className="my-auto max-w-md w-full mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6 z-10">
        <div className="text-center space-y-1.5">
          <StealthTeacherUnlockTrigger
            isUnlocked={isTeacherStealthOpen}
            onUnlockSuccess={() => setIsTeacherStealthOpen((prev) => !prev)}
            onTeacherAuthenticated={() => {
              saveRememberedSessionSSOT({
                role: "teacher",
                savedAtIso: new Date().toISOString(),
              });
              router.push("/dashboard");
            }}
          />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {identity.platformBrandName}
          </h1>
          <p className="text-xs font-extrabold text-teal-700 dark:text-teal-400">
            {identity.teacherFullName}
            {identity.teacherNickname ? ` (${identity.teacherNickname})` : ""} —{" "}
            {identity.teacherTitle}
          </p>
        </div>

        <StudentCodeLoginForm
          onStudentSubmit={() => router.push("/student")}
          onStealthCodeDetected={() => setIsTeacherStealthOpen(true)}
          onDirectTeacherLogin={() => router.push("/dashboard")}
        />
      </div>

      <footer className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 z-10">
        {identity.footerText}
      </footer>
    </main>
  );
}
