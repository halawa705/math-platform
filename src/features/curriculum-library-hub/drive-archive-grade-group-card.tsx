"use client";

/**
 * @file drive-archive-grade-group-card.tsx
 * @description بطاقة مجموعة الصف الدراسي داخل خزينة المنصة السحابية:
 * تعرض الوثائق المحفوظة الخاصة بصف دراسي واحد بتصميم هادئ قابل للطي لمنع التكدس والزحمة،
 * مع إتاحة فتح المعاينة الفورية للطباعة داخل الموقع أو نسخ رابط المذكرة الداخلي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import { useState } from "react";
import type { OvermathDriveArchivedRecord } from "./overmath-google-drive-vault";

export const MODULE_ID_DRIVE_ARCHIVE_GRADE_GROUP_CARD =
  "drive_archive_grade_group_card" as const;

export interface DriveArchiveGradeGroupCardProps {
  readonly gradeNameAr: string;
  readonly items: readonly OvermathDriveArchivedRecord[];
  readonly defaultOpen?: boolean;
  readonly onPreviewRecord: (record: OvermathDriveArchivedRecord) => void;
  readonly onDeleteRecord: (recordId: string) => void;
}

const DOC_KIND_BADGE: Record<
  OvermathDriveArchivedRecord["docKind"],
  { readonly label: string; readonly icon: string; readonly colorClass: string }
> = {
  booklet: {
    label: "مذكرة درس",
    icon: "📘",
    colorClass: "bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-800",
  },
  exam: {
    label: "اختبار",
    icon: "📄",
    colorClass: "bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-950/50 dark:text-teal-200 dark:border-teal-800",
  },
  final_review: {
    label: "مراجعة نهائية",
    icon: "🏆",
    colorClass: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800",
  },
};

export default function DriveArchiveGradeGroupCard({
  gradeNameAr,
  items,
  defaultOpen = true,
  onPreviewRecord,
  onDeleteRecord,
}: DriveArchiveGradeGroupCardProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyDocLink = (docId: string) => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/library?tab=archive&doc=${encodeURIComponent(docId)}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(docId);
    setTimeout(() => setCopiedId((prev) => (prev === docId ? null : prev)), 2500);
  };

  return (
    <section className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full min-h-[52px] px-4 py-3 flex items-center justify-between gap-3 text-right hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-indigo-900/10 dark:bg-teal-500/15 text-indigo-900 dark:text-teal-300 flex items-center justify-center text-sm font-black shrink-0">
            🎓
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {gradeNameAr}
            </h3>
            <p className="text-[11px] font-bold text-slate-500">
              {items.length} {items.length === 1 ? "ملف محفوظ" : "ملفات محفوظة"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300">
            {items.length}
          </span>
          <span className="text-xs font-black text-slate-400">
            {isOpen ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {isOpen && (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 border-t border-slate-100 dark:border-slate-800">
          {items.map((doc) => {
            const badge = DOC_KIND_BADGE[doc.docKind] || DOC_KIND_BADGE.booklet;
            const dateStr = doc.syncedAtIso
              ? new Date(doc.syncedAtIso).toLocaleDateString("ar-EG", {
                  month: "short",
                  day: "numeric",
                })
              : "";
            return (
              <li
                key={doc.id}
                className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <div className="min-w-0 space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${badge.colorClass}`}
                    >
                      {badge.icon} {badge.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {doc.branchAr}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {doc.pagesCount} ص • {doc.fontUsed} {dateStr ? `• ${dateStr}` : ""}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug truncate">
                    {doc.titleAr}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onPreviewRecord(doc)}
                    className="min-h-[42px] flex-1 sm:flex-initial px-3.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <span>👁️</span>
                    <span>معاينة وطباعة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyDocLink(doc.id)}
                    className="min-h-[42px] flex-1 sm:flex-initial px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>🔗</span>
                    <span>{copiedId === doc.id ? "✓ تم النسخ" : "رابط المذكرة"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(doc.id)}
                    title="حذف من القائمة"
                    className="min-h-[42px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-900 text-xs font-black cursor-pointer transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
