"use client";

/**
 * @file studio-sticky-primary-action-bar.tsx
 * @description شريط الإجراء الرئيسي اللاصق أسفل الشاشة (فوق شريط التنقل السفلي في الهاتف):
 * زر أساسي واحد واضح + زر ثانوي اختياري، مع رسالة تنبيه هادئة عند نقص البيانات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

export const MODULE_ID_STUDIO_STICKY_PRIMARY_ACTION_BAR =
  "studio_sticky_primary_action_bar" as const;

export interface StudioStickyPrimaryActionBarProps {
  readonly primaryLabelAr: string;
  readonly onPrimary: () => void;
  readonly secondaryLabelAr?: string;
  readonly onSecondary?: () => void;
  readonly noticeAr?: string | null;
}

export default function StudioStickyPrimaryActionBar({
  primaryLabelAr,
  onPrimary,
  secondaryLabelAr,
  onSecondary,
  noticeAr,
}: StudioStickyPrimaryActionBarProps) {
  return (
    <div className="sticky bottom-20 md:bottom-4 z-30 space-y-2">
      {noticeAr && (
        <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black shadow-sm">
          {noticeAr}
        </div>
      )}
      <div className="p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onPrimary}
          className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-l from-teal-700 to-emerald-600 text-white text-sm font-black cursor-pointer"
        >
          {primaryLabelAr}
        </button>
        {secondaryLabelAr && onSecondary && (
          <button
            type="button"
            onClick={onSecondary}
            className="flex-1 min-h-[48px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black cursor-pointer"
          >
            {secondaryLabelAr}
          </button>
        )}
      </div>
    </div>
  );
}
