"use client";

/**
 * @file drive-archive-preview-modal.tsx
 * @description نافذة معاينة وطباعة الوثيقة المحفوظة في خزينة Google Drive (مذكرة / اختبار / مراجعة نهائية).
 * تعرض صفحات الـ A4 المحفوظة مع التحجيم الذكي للهاتف، وتتيح الطباعة الفورية بصيغة Vector PDF أو الفتح في Google Drive.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import Link from "next/link";
import { loadPersistedPDFPrintSettingsSSOT } from "@/core/ssot/pdf-print-settings-ssot";
import { triggerIsolatedA4Print } from "@/features/pdf-preview-controls/pdf-isolated-print-trigger";
import type { OvermathDriveArchivedRecord } from "./overmath-google-drive-vault";

export const MODULE_ID_DRIVE_ARCHIVE_PREVIEW_MODAL =
  "drive_archive_preview_modal" as const;

export interface DriveArchivePreviewModalProps {
  readonly record: OvermathDriveArchivedRecord | null;
  readonly onClose: () => void;
}

export default function DriveArchivePreviewModal({
  record,
  onClose,
}: DriveArchivePreviewModalProps) {
  if (!record) return null;

  const handlePrintSavedDoc = () => {
    if (!record.htmlContent) return;
    const settings = loadPersistedPDFPrintSettingsSSOT();
    triggerIsolatedA4Print(record.htmlContent, {
      ...settings,
      customDocumentTitle: record.titleAr,
    });
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* شريط علوي هادئ مع أزرار الطباعة وفتح Google Drive */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {record.titleAr}
            </h3>
            <p className="text-[11px] font-bold text-slate-500 truncate">
              {record.gradeAr} • {record.branchAr} • {record.pagesCount} صفحة • {record.fontUsed}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {record.htmlContent && (
              <button
                type="button"
                onClick={handlePrintSavedDoc}
                className="min-h-[42px] px-3.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>🖨️</span>
                <span>طباعة / PDF</span>
              </button>
            )}
            <a
              href={record.driveViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[42px] px-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-300 text-xs font-black flex items-center gap-1"
            >
              <span>☁️</span>
              <span>فتح في Drive ↗</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              ✕ إغلاق
            </button>
          </div>
        </div>

        {/* جسم المعاينة الحية لصفحات A4 */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col items-center">
          {record.htmlContent ? (
            <div
              className="w-full overflow-x-auto flex flex-col items-center gap-4"
              dangerouslySetInnerHTML={{ __html: record.htmlContent }}
            />
          ) : (
            <div className="my-10 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center max-w-md space-y-3">
              <div className="text-3xl">☁️</div>
              <h4 className="text-sm font-black">الوثيقة محفوظة في سجل Google Drive</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                يمكنك فتح الوثيقة مباشرة من Google Drive أو الانتقال إلى استوديو التوليد والطباعة لإعادة تحريرها.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <a
                  href={record.driveViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-4 rounded-xl bg-indigo-900 text-white text-xs font-black flex items-center"
                >
                  فتح من Google Drive ↗
                </a>
                <Link
                  href="/studio"
                  className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center"
                >
                  فتح الاستوديو
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
