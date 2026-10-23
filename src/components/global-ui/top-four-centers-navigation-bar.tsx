"use client";

/**
 * @file top-four-centers-navigation-bar.tsx
 * @description شريط التنقل الموحد للمنصة مع التذييل الموحد (Footer SSOT):
 * - يقرأ اسم المنصة، اسم المعلم، اللقب، ونص التذييل ديناميكياً من `teacher-identity-ssot.ts`.
 * - يفصل بين شريط تنقل المعلم (الرئيسية، الاستوديو، المنهج، الاختبارات، الإعدادات) وبين شريط بوابة الطالب.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEFAULT_OWNER_TEACHER_IDENTITY_SSOT,
  IDENTITY_UPDATED_EVENT_NAME,
  loadTeacherIdentitySSOT,
  clearRememberedSessionSSOT,
  type OwnerTeacherIdentity,
} from "@/core/ssot/teacher-identity-ssot";
import GlobalThemeModeToggleButton from "./global-theme-mode-toggle-button";

export const MODULE_ID_TOP_FOUR_CENTERS_NAVIGATION_BAR =
  "top_four_centers_navigation_bar" as const;

export type PlatformCenterRouteId =
  | "dashboard"
  | "studio"
  | "library"
  | "assessments"
  | "settings"
  | "student";

export interface TopFourCentersNavigationBarProps {
  readonly activeCenter: PlatformCenterRouteId;
}

const TEACHER_NAV_ITEMS: readonly {
  readonly id: PlatformCenterRouteId;
  readonly href: string;
  readonly titleAr: string;
  readonly shortMobileAr: string;
  readonly icon: string;
}[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    titleAr: "الرئيسية والتحليلات",
    shortMobileAr: "الرئيسية",
    icon: "📊",
  },
  {
    id: "studio",
    href: "/studio",
    titleAr: "استوديو التوليد والطباعة",
    shortMobileAr: "الاستوديو",
    icon: "⚡",
  },
  {
    id: "library",
    href: "/library",
    titleAr: "مستكشف المنهج والأرشيف",
    shortMobileAr: "المنهج",
    icon: "📐",
  },
  {
    id: "assessments",
    href: "/assessments",
    titleAr: "الاختبارات والواجبات",
    shortMobileAr: "التقييمات",
    icon: "🎯",
  },
  {
    id: "settings",
    href: "/settings",
    titleAr: "الإعدادات والصفوف",
    shortMobileAr: "الإعدادات",
    icon: "⚙️",
  },
];

export default function TopFourCentersNavigationBar({
  activeCenter,
}: TopFourCentersNavigationBarProps) {
  const router = useRouter();
  const [identity, setIdentity] = useState<OwnerTeacherIdentity>(
    DEFAULT_OWNER_TEACHER_IDENTITY_SSOT
  );

  useEffect(() => {
    setIdentity(loadTeacherIdentitySSOT());
    const handleIdentityUpdated = () => {
      setIdentity(loadTeacherIdentitySSOT());
    };
    window.addEventListener(IDENTITY_UPDATED_EVENT_NAME, handleIdentityUpdated);
    window.addEventListener("storage", handleIdentityUpdated);
    return () => {
      window.removeEventListener(IDENTITY_UPDATED_EVENT_NAME, handleIdentityUpdated);
      window.removeEventListener("storage", handleIdentityUpdated);
    };
  }, []);

  const isStudentMode = activeCenter === "student";

  const handleLogout = () => {
    clearRememberedSessionSSOT();
    router.push("/");
  };

  return (
    <>
      {/* الشريط العلوي الهادئ */}
      <header className="no-print sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-[#090D16]/90 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* الهوية الرياضية للمعلم المالك */}
          <Link
            href={isStudentMode ? "/student" : "/dashboard"}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-teal-600 text-white flex items-center justify-center text-lg font-black shadow-sm overflow-hidden">
              {identity.platformLogoUrl ? (
                <img
                  src={identity.platformLogoUrl}
                  alt={identity.platformBrandName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{identity.platformLogoSymbol || "🛡️"}</span>
              )}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                {identity.platformBrandName}
              </div>
              <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                {identity.teacherFullName}
                {identity.teacherNickname ? ` (${identity.teacherNickname})` : ""}
              </div>
            </div>
          </Link>

          {/* تنقل الحاسوب للمعلم (يختفي في وضع الطالب) */}
          {!isStudentMode && (
            <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
              {TEACHER_NAV_ITEMS.map((item) => {
                const isActive = item.id === activeCenter;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      isActive
                        ? "bg-indigo-900 dark:bg-teal-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.titleAr}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* أزرار الوضع اللوني ومعاينة الطالب والخروج */}
          <div className="flex items-center gap-2">
            {!isStudentMode && (
              <Link
                href="/student"
                className="hidden sm:flex min-h-[38px] px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs font-black text-teal-800 dark:text-teal-300 items-center gap-1"
              >
                <span>🎓</span>
                <span>معاينة شاشة الطالب</span>
              </Link>
            )}
            <GlobalThemeModeToggleButton />
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              title="تسجيل الخروج"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* شريط التذييل الموحد للمنصة (Dynamic Footer SSOT) */}
      <div className="no-print fixed bottom-14 md:bottom-0 inset-x-0 z-20 pointer-events-none flex justify-center pb-1">
        <span className="px-3 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
          {identity.footerText}
        </span>
      </div>

      {/* شريط التنقل السفلي العائم للهواتف المحمولة */}
      {!isStudentMode && (
        <nav
          aria-label="التنقل السريع للهاتف"
          className="no-print lg:hidden fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-[#090D16]/95 border-t border-slate-200 dark:border-slate-800 px-1.5 py-1 flex items-center justify-around shadow-2xl"
        >
          {TEACHER_NAV_ITEMS.map((item) => {
            const isActive = item.id === activeCenter;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`min-h-[46px] flex-1 py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-black transition-all ${
                  isActive
                    ? "bg-indigo-900/10 dark:bg-teal-500/15 text-indigo-900 dark:text-teal-300"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <span className="text-sm leading-none">{item.icon}</span>
                <span className="truncate max-w-[64px]">{item.shortMobileAr}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
