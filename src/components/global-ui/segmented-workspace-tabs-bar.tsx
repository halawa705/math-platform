"use client";

/**
 * @file segmented-workspace-tabs-bar.tsx
 * @description شريط التبويبات الموحد فائق الأناقة للتنقل بين المهام داخل الصفحة الواحدة دون إعادة تحميل.
 * مصمم بأولوية الهاتف المحمول (Mobile-First Horizontal Snap Scroll + 44px Touch Targets).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */


export const MODULE_ID_SEGMENTED_WORKSPACE_TABS_BAR =
  "segmented_workspace_tabs_bar" as const;

export interface SegmentedTabItem {
  readonly id: string;
  readonly labelAr: string;
  readonly subtitleAr?: string;
  readonly icon: string;
  readonly badgeText?: string;
}

export interface SegmentedWorkspaceTabsBarProps {
  readonly tabs: readonly SegmentedTabItem[];
  readonly activeTabId: string;
  readonly onSelectTab: (tabId: string) => void;
}

export default function SegmentedWorkspaceTabsBar({
  tabs,
  activeTabId,
  onSelectTab,
}: SegmentedWorkspaceTabsBarProps) {
  return (
    <div
      role="tablist"
      aria-label="تبويبات مساحة العمل"
      className="w-full overflow-x-auto no-scrollbar snap-x snap-mandatory p-1.5 rounded-2xl bg-slate-200/75 dark:bg-slate-900/90 border border-slate-300/70 dark:border-slate-800 flex items-center gap-1.5"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectTab(tab.id)}
            className={`snap-start shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              isActive
                ? "bg-gradient-to-l from-indigo-900 to-teal-700 text-white shadow-md scale-[1.01]"
                : "text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70"
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <div className="text-right">
              <div className="leading-tight whitespace-nowrap">{tab.labelAr}</div>
              {tab.subtitleAr && (
                <div
                  className={`text-[10px] font-bold hidden sm:block ${
                    isActive
                      ? "text-teal-100"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.subtitleAr}
                </div>
              )}
            </div>
            {tab.badgeText && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? "bg-amber-400 text-slate-950"
                    : "bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {tab.badgeText}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
