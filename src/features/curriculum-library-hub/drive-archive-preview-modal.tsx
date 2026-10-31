"use client";

/**
 * @file drive-archive-preview-modal.tsx
 * @description عارض المذكرة / الاختبار المدمج داخل المنصة (In-Site A4 Document Viewer):
 * يعرض صفحات الـ A4 المحفوظة مباشرة داخل الموقع عبر `TwoColumnNewspaperPacker` مع التبديل الفوري
 * بين نسخة الطالب (أسئلة فقط) ونسخة المعلم (بالحلول)، والطباعة الفورية بصيغة Vector PDF، ونسخ رابط المذكرة الداخلي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 175 سطراً).
 */

import { useState, useRef } from "react";
import Link from "next/link";
import {
  loadPersistedPDFPrintSettingsSSOT,
  type DocumentAnswerVisibilityMode,
} from "@/core/ssot/pdf-print-settings-ssot";
import TwoColumnNewspaperPacker from "@/core/pdf-layout-engine/two-column-newspaper-packer";
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [answerMode, setAnswerMode] = useState<DocumentAnswerVisibilityMode>(
    record?.settings?.answerVisibilityMode ?? "questions_with_answers"
  );

  if (!record) return null;

  const hasLiveQuestions = Boolean(record.questions && record.questions.length > 0);
  const hasHtmlSnapshot = Boolean(record.htmlContent && record.htmlContent.trim().length > 0);
  const baseSettings = record.settings ?? loadPersistedPDFPrintSettingsSSOT();
  const effectiveSettings = {
    ...baseSettings,
    customDocumentTitle: record.titleAr,
    answerVisibilityMode: answerMode,
  };

  const handlePrintSavedDoc = () => {
    const htmlToPrint = sheetRef.current?.innerHTML || record.htmlContent || "";
    if (!htmlToPrint) return;
    triggerIsolatedA4Print(htmlToPrint, effectiveSettings);
  };

  const handleCopyInSiteLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/library?tab=archive&doc=${encodeURIComponent(record.id)}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[94vh] flex flex-col rounded-2xl bg-[#F8FAFC] dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* شريط علوي للتحكم والطباعة ونسخ رابط المذكرة داخل الموقع */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {record.titleAr}
            </h3>
            <p className="text-[11px] font-bold text-slate-500 truncate">
              {record.gradeAr} • {record.branchAr} • {record.pagesCount} صفحة • {record.fontUsed}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {hasLiveQuestions && (
              <button
                type="button"
                onClick={() =>
                  setAnswerMode((m) =>
                    m === "questions_with_answers" ? "questions_only" : "questions_with_answers"
                  )
                }
                className="min-h-[40px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black cursor-pointer"
              >
                {answerMode === "questions_with_answers" ? "👁️ بالحلول" : "📝 أسئلة فقط"}
              </button>
            )}

            {(hasLiveQuestions || hasHtmlSnapshot) && (
              <button
                type="button"
                onClick={handlePrintSavedDoc}
                className="min-h-[40px] px-3.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>🖨️</span>
                <span>طباعة / PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyInSiteLink}
              className="min-h-[40px] px-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-300 text-xs font-black cursor-pointer flex items-center gap-1"
            >
              <span>🔗</span>
              <span>{copiedLink ? "✓ تم نسخ الرابط" : "نسخ رابط المذكرة"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              ✕ إغلاق
            </button>
          </div>
        </div>

        {/* عارض ورق الـ A4 الفعلي داخل الموقع */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col items-center">
          {hasLiveQuestions ? (
            <TwoColumnNewspaperPacker
              settings={effectiveSettings}
              questions={record.questions!}
              subtitleAr={record.gradeAr}
              sheetContainerRef={sheetRef}
            />
          ) : hasHtmlSnapshot ? (
            <div
              ref={sheetRef}
              className="w-full overflow-x-auto flex flex-col items-center gap-4"
              dangerouslySetInnerHTML={{ __html: record.htmlContent! }}
            />
          ) : (
            <div className="my-10 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center max-w-md space-y-3">
              <div className="text-3xl">📄</div>
              <h4 className="text-sm font-black">هذا السجل قديم وتم حفظه كعنوان فقط قبل تفعيل حفظ الصفحات</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                عند حفظ أي مذكرة أو اختبار جديد من الاستوديو الآن، يتم حفظ صفحات الـ A4 كاملة داخل الموقع لتفتح هنا مباشرة مع رابطها الداخلي.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Link
                  href="/studio"
                  className="min-h-[42px] px-4 rounded-xl bg-indigo-900 text-white text-xs font-black flex items-center"
                >
                  ⚡ الذهاب إلى الاستوديو
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
