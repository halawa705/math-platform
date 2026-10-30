"use client";

/**
 * @file saved-booklets-reviews-archive-tab.tsx
 * @description خزينة وعارض المذكرات والاختبارات والمراجعات المحفوظة في Google Drive (overmath.math@gmail.com):
 * - مقسمة إلى تبويبات واضحة (المذكرات، الاختبارات، المراجعات، الكل) بنفس تصميم الموقع.
 * - كل تبويب مقسم حسب الصفوف الدراسية في بطاقات هادئة قابلة للطي مع شريط فلترة سريع للصفوف بدون زحمة.
 * - تتيح فتح المعاينة الحية للورقة (A4) وطباعتها مباشرة أو فتحها في Google Drive.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import CalmEmptyStateCard from "@/components/global-ui/calm-empty-state-card";
import SegmentedWorkspaceTabsBar, {
  type SegmentedTabItem,
} from "@/components/global-ui/segmented-workspace-tabs-bar";
import { EGYPTIAN_MATH_GRADES_SSOT } from "@/core/ssot/curriculum-hierarchy-ssot";
import {
  OVERMATH_DRIVE_UPDATED_EVENT,
  OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL,
  deleteDocumentFromOvermathDriveVault,
  loadOvermathDriveArchive,
  type OvermathDriveArchivedRecord,
} from "./overmath-google-drive-vault";
import DriveArchiveGradeGroupCard from "./drive-archive-grade-group-card";
import DriveArchivePreviewModal from "./drive-archive-preview-modal";

export const MODULE_ID_SAVED_BOOKLETS_REVIEWS_ARCHIVE_TAB =
  "saved_booklets_reviews_archive_tab" as const;

type ArchiveFilterKind = "booklet" | "exam" | "final_review" | "all";

const ARCHIVE_KIND_TABS: readonly SegmentedTabItem[] = [
  { id: "booklet", labelAr: "المذكرات", icon: "📘" },
  { id: "exam", labelAr: "الاختبارات", icon: "📄" },
  { id: "final_review", labelAr: "المراجعات", icon: "🏆" },
  { id: "all", labelAr: "الكل", icon: "🗂️" },
];

export default function SavedBookletsReviewsArchiveTab() {
  const [records, setRecords] = useState<readonly OvermathDriveArchivedRecord[]>([]);
  const [activeKind, setActiveKind] = useState<ArchiveFilterKind>("booklet");
  const [selectedGradeAr, setSelectedGradeAr] = useState<string>("all");
  const [previewRecord, setPreviewRecord] = useState<OvermathDriveArchivedRecord | null>(null);

  useEffect(() => {
    const sync = () => {
      const loaded = loadOvermathDriveArchive();
      setRecords(loaded);
      // إذا لم يكن هناك مذكرات بعد ولكن توجد اختبارات أو مراجعات، نعرض الكل تلقائياً
      if (loaded.length > 0 && !loaded.some((r) => r.docKind === "booklet")) {
        setActiveKind("all");
      }
    };
    sync();
    window.addEventListener(OVERMATH_DRIVE_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(OVERMATH_DRIVE_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const kindFiltered = useMemo(
    () =>
      records.filter((r) =>
        activeKind === "all" ? true : r.docKind === activeKind
      ),
    [records, activeKind]
  );

  // استخراج الصفوف الموجودة فعلياً ومرتبة وفق ترتيب المنهج الرسمي
  const availableGrades = useMemo(() => {
    const orderMap = new Map<string, number>(
      EGYPTIAN_MATH_GRADES_SSOT.map((g, idx) => [g.nameArabic, idx])
    );
    const unique = [...new Set(kindFiltered.map((r) => r.gradeAr || "صفوف عامة"))];
    return unique.sort((a, b) => (orderMap.get(a) ?? 99) - (orderMap.get(b) ?? 99));
  }, [kindFiltered]);

  // إعادة فلتر الصف إلى "الكل" إذا تغير التبويب ولم يعد الصف المختار موجوداً
  const effectiveGradeFilter =
    selectedGradeAr === "all" || availableGrades.includes(selectedGradeAr)
      ? selectedGradeAr
      : "all";

  const visibleGrades =
    effectiveGradeFilter === "all" ? availableGrades : [effectiveGradeFilter];

  const handleDelete = (id: string) => {
    setRecords(deleteDocumentFromOvermathDriveVault(id));
    if (previewRecord?.id === id) setPreviewRecord(null);
  };

  return (
    <div className="space-y-3">
      {/* شريط خزينة Google Drive العلوي */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-lg shrink-0">
            ☁️
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              خزينة Google Drive للمذكرات والاختبارات
            </div>
            <p
              dir="ltr"
              className="text-[11px] font-bold text-teal-700 dark:text-teal-400 truncate text-right"
            >
              {OVERMATH_GOOGLE_DRIVE_ACCOUNT_EMAIL} • {records.length} ملف محفوظ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/studio"
            className="min-h-[40px] px-3 rounded-xl bg-indigo-900 text-white text-xs font-black flex items-center gap-1"
          >
            <span>⚡</span>
            <span className="hidden sm:inline">توليد جديد</span>
          </Link>
          <a
            href="https://drive.google.com/drive/u/0/my-drive"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <span>فتح Drive ↗</span>
          </a>
        </div>
      </div>

      {/* تبويبات الأنواع (المذكرات / الاختبارات / المراجعات / الكل) */}
      <SegmentedWorkspaceTabsBar
        tabs={ARCHIVE_KIND_TABS}
        activeTabId={activeKind}
        onSelectTab={(id) => {
          setActiveKind(id as ArchiveFilterKind);
          setSelectedGradeAr("all");
        }}
      />

      {/* شريط فلترة الصفوف الدراسية بدون زحمة */}
      {availableGrades.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
          <button
            type="button"
            onClick={() => setSelectedGradeAr("all")}
            className={`min-h-[38px] px-3.5 rounded-xl text-xs font-black cursor-pointer transition-colors shrink-0 ${
              effectiveGradeFilter === "all"
                ? "bg-indigo-900 dark:bg-teal-600 text-white shadow-2xs"
                : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            كل الصفوف ({kindFiltered.length})
          </button>
          {availableGrades.map((gradeName) => {
            const count = kindFiltered.filter((r) => (r.gradeAr || "صفوف عامة") === gradeName).length;
            const isActive = effectiveGradeFilter === gradeName;
            return (
              <button
                key={gradeName}
                type="button"
                onClick={() => setSelectedGradeAr(gradeName)}
                className={`min-h-[38px] px-3.5 rounded-xl text-xs font-black cursor-pointer transition-colors shrink-0 ${
                  isActive
                    ? "bg-indigo-900 dark:bg-teal-600 text-white shadow-2xs"
                    : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {gradeName} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* عرض الصفوف ومحتوياتها بهدوء */}
      {kindFiltered.length === 0 ? (
        <CalmEmptyStateCard
          icon="🗂️"
          titleAr="لا توجد ملفات محفوظة في هذا التبويب بعد"
          hintAr="من استوديو التوليد والطباعة، افتح معاينة الورقة واضغط «☁️ حفظ في Drive» لتظهر هنا مقسمة حسب الصف الدراسي."
        />
      ) : (
        <div className="space-y-3">
          {visibleGrades.map((gradeName, idx) => {
            const gradeItems = kindFiltered.filter(
              (r) => (r.gradeAr || "صفوف عامة") === gradeName
            );
            if (gradeItems.length === 0) return null;
            return (
              <DriveArchiveGradeGroupCard
                key={gradeName}
                gradeNameAr={gradeName}
                items={gradeItems}
                defaultOpen={idx === 0 || visibleGrades.length <= 3}
                onPreviewRecord={setPreviewRecord}
                onDeleteRecord={handleDelete}
              />
            );
          })}
        </div>
      )}

      {/* نافذة المعاينة الحية والطباعة لورقة الـ A4 */}
      <DriveArchivePreviewModal
        record={previewRecord}
        onClose={() => setPreviewRecord(null)}
      />
    </div>
  );
}
