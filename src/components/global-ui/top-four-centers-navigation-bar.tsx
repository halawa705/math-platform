"use client";

/**
 * @file top-four-centers-navigation-bar.tsx
 * @description شريط التنقل الموحد للمراكز الأربعة:
 * يعرض شريطاً علوياً زجاجياً على الحاسوب، وشريطاً سفلياً عائماً (Bottom Glass Dock) في الهواتف المحمولة
 * لضمان وصول إبهام المستخدم بيد واحدة لـ 99% من مستخدمي الهواتف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import Link from "next/link";
import { DEFAULT_OWNER_TEACHER_IDENTITY_SSOT } from "@/core/ssot/teacher-identity-ssot";
import GlobalThemeModeToggleButton from "./global-theme-mode-toggle-button";

export const MODULE_ID_TOP_FOUR_CENTERS_NAVIGATION_BAR =
  "top_four_centers_navigation_bar" as const;

export type PlatformCenterRouteId =
  | "studio"
  | "library"
  | "assessments"
  | "student";

export interface TopFourCentersNavigationBarProps {
  readonly activeCenter: PlatformCenterRouteId;
}

const FOUR_CENTERS_ITEMS: readonly {
  readonly id: PlatformCenterRouteId;
  readonly href: string;
  readonly titleAr: string;
  readonly shortMobileAr: string;
  readonly icon: string;
}[] = [
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
    titleAr: "مكتبة الرياضيات والمنهج",
    shortMobileAr: "المكتبة",
    icon: "📐",
  },
  {
    id: "assessments",
    href: "/assessments",
    titleAr: "التقييمات والاختبارات",
    shortMobileAr: "الاختبارات",
    icon: "🎯",
  },
  {
    id: "student",
    href: "/student",
    titleAr: "بوابة الطالب التفاعلية",
    shortMobileAr: "بوابة الطالب",
    icon: "🎓",
  },
];

export default function TopFourCentersNavigationBar({
  activeCenter,
}: TopFourCentersNavigationBarProps) {
  return (
    <>
      {/* الشريط العلوي الزجاجي */}
      <header className="no-print sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-[#090D16]/85 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* الهوية الرياضية للمعلم المالك */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-teal-600 text-white flex items-center justify-center text-lg font-black shadow-md group-hover:scale-105 transition">
              ∑
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                {DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.platformBrandName}
              </div>
              <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                {DEFAULT_OWNER_TEACHER_IDENTITY_SSOT.teacherFullName}
              </div>
            </div>
          </Link>

          {/* تنقل الحاسوب والتابلت */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            {FOUR_CENTERS_ITEMS.map((item) => {
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

          {/* أزرار الوضع اللوني وبوابة الدخول */}
          <div className="flex items-center gap-2">
            <GlobalThemeModeToggleButton />
            <Link
              href="/"
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
            >
              <span>🔐</span>
              <span className="hidden sm:inline">بوابة الدخول</span>
            </Link>
          </div>
        </div>
      </header>

      {/* شريط التنقل السفلي العائم للهواتف المحمولة (Mobile Bottom Glass Dock) */}
      <nav
        aria-label="التنقل السريع للهاتف"
        className="no-print md:hidden fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-[#090D16]/95 border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl"
      >
        {FOUR_CENTERS_ITEMS.map((item) => {
          const isActive = item.id === activeCenter;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`min-h-[48px] flex-1 py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-black transition-all ${
                isActive
                  ? "bg-indigo-900/10 dark:bg-teal-500/15 text-indigo-900 dark:text-teal-300"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="truncate max-w-[76px]">{item.shortMobileAr}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
