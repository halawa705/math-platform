/**
 * @file calm-empty-state-card.tsx
 * @description بطاقة حالة فارغة هادئة موحدة: أيقونة صغيرة + عنوان + توجيه + رابط اختياري للخطوة التالية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import Link from "next/link";

export const MODULE_ID_CALM_EMPTY_STATE_CARD = "calm_empty_state_card" as const;

export interface CalmEmptyStateCardProps {
  readonly icon: string;
  readonly titleAr: string;
  readonly hintAr?: string;
  readonly actionHref?: string;
  readonly actionLabelAr?: string;
}

export default function CalmEmptyStateCard({
  icon,
  titleAr,
  hintAr,
  actionHref,
  actionLabelAr,
}: CalmEmptyStateCardProps) {
  return (
    <div className="px-5 py-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-1.5">
      <div className="text-2xl leading-none">{icon}</div>
      <h3 className="text-sm font-black">{titleAr}</h3>
      {hintAr && <p className="text-[11px] font-bold text-slate-500 max-w-sm mx-auto">{hintAr}</p>}
      {actionHref && actionLabelAr && (
        <Link
          href={actionHref}
          className="inline-flex items-center min-h-[44px] mt-2 px-5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black"
        >
          {actionLabelAr}
        </Link>
      )}
    </div>
  );
}
