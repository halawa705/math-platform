/**
 * @file calm-page-title-header.tsx
 * @description ترويسة عنوان هادئة موحدة لصفحات المراكز (عنوان + سطر توجيهي واحد) بنفس روح استوديو التوليد.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

export const MODULE_ID_CALM_PAGE_TITLE_HEADER = "calm_page_title_header" as const;

export interface CalmPageTitleHeaderProps {
  readonly titleAr: string;
  readonly hintAr?: string;
}

export default function CalmPageTitleHeader({ titleAr, hintAr }: CalmPageTitleHeaderProps) {
  return (
    <header className="px-1">
      <h1 className="text-lg font-black">{titleAr}</h1>
      {hintAr && <p className="text-[11px] font-bold text-slate-500">{hintAr}</p>}
    </header>
  );
}
