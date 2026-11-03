"use client";

/**
 * @file studio-exam-online-publish-panel.tsx
 * @description لوحة نشر الاختبار كاختبار إلكتروني للطلاب (عنوان مخصص + زمن الإجابة + مدة البقاء + رابط المشاركة الفوري + تجربة كطالب).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioNumberStepperField from "./studio-number-stepper-field";

export const MODULE_ID_STUDIO_EXAM_ONLINE_PUBLISH_PANEL =
  "studio_exam_online_publish_panel" as const;

export interface PublishedExamSummaryInfo {
  readonly examId: string;
  readonly gradeId: string;
  readonly titleAr: string;
  readonly shareUrl: string;
}

export interface StudioExamOnlinePublishPanelProps {
  readonly gradeNameAr: string;
  readonly defaultTitleAr: string;
  readonly statusMessageAr: string | null;
  readonly publishedExamInfo?: PublishedExamSummaryInfo | null;
  readonly onPublish: (params: {
    readonly customTitleAr: string;
    readonly durationMinutes: number;
    readonly availabilityDays: number;
    readonly revealAnswers: boolean;
  }) => void;
}

const PRESETS = [
  { id: "3", label: "٣ أيام" },
  { id: "7", label: "٧ أيام" },
  { id: "14", label: "١٤ يوماً" },
  { id: "custom", label: "مخصص" },
] as const;

export default function StudioExamOnlinePublishPanel({
  gradeNameAr,
  defaultTitleAr,
  statusMessageAr,
  publishedExamInfo,
  onPublish,
}: StudioExamOnlinePublishPanelProps) {
  const [customTitleAr, setCustomTitleAr] = useState(defaultTitleAr);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [preset, setPreset] = useState<"3" | "7" | "14" | "custom">("7");
  const [customDays, setCustomDays] = useState(5);
  const [revealAnswers, setRevealAnswers] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setCustomTitleAr(defaultTitleAr);
  }, [defaultTitleAr]);

  const days = preset === "custom" ? Math.max(1, customDays) : Number(preset);

  const handleCopyLink = () => {
    if (!publishedExamInfo?.shareUrl || typeof navigator === "undefined") return;
    void navigator.clipboard.writeText(publishedExamInfo.shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <StudioCollapsibleSectionCard
      icon="🚀"
      titleAr="نشر كاختبار إلكتروني للطلاب (تصحيح آلي)"
      summaryAr={`${gradeNameAr} • ${durationMinutes} دقيقة • يؤرشف بعد ${days} يوم`}
      defaultOpen
    >
      <div className="space-y-3 pt-2">
        <label className="block space-y-1">
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
            🏷️ عنوان الاختبار الإلكتروني الظاهر للطلاب
          </span>
          <input
            type="text"
            value={customTitleAr}
            onChange={(e) => setCustomTitleAr(e.target.value)}
            placeholder="مثال: اختبار الوحدة الثالثة — المقادير الجبرية"
            className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black"
          />
        </label>

        <StudioNumberStepperField
          labelAr="زمن إجابة الطالب (دقيقة)"
          value={durationMinutes}
          min={5}
          max={180}
          onChange={setDurationMinutes}
        />

        <div>
          <div className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1.5">
            ⏳ مدة عرض وبقاء الاختبار قبل انتقاله للأرشيف تلقائياً
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={`min-h-[44px] rounded-xl text-[11px] font-black cursor-pointer ${
                  preset === p.id
                    ? "bg-teal-700 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {preset === "custom" && (
          <StudioNumberStepperField
            labelAr="عدد أيام عرض الاختبار"
            value={customDays}
            min={1}
            max={365}
            onChange={setCustomDays}
          />
        )}

        <label className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-xs font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer">
          <span>إظهار التصحيح التفصيلي والحل النموذجي للطالب فور التسليم</span>
          <input
            type="checkbox"
            checked={revealAnswers}
            onChange={(e) => setRevealAnswers(e.target.checked)}
            className="w-4 h-4 accent-teal-600"
          />
        </label>

        <button
          type="button"
          onClick={() =>
            onPublish({
              customTitleAr: customTitleAr.trim() || defaultTitleAr,
              durationMinutes,
              availabilityDays: days,
              revealAnswers,
            })
          }
          className="w-full min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black cursor-pointer shadow-sm"
        >
          🚀 نشر / تحديث الاختبار للطلاب الآن
        </button>

        {statusMessageAr && (
          <p className="text-xs font-black text-teal-900 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/50 p-2.5 rounded-xl border border-teal-200 dark:border-teal-800">
            {statusMessageAr}
          </p>
        )}

        {publishedExamInfo && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-slate-900 border-2 border-indigo-200 dark:border-teal-700/70 space-y-2.5">
            <div className="text-xs font-black text-indigo-950 dark:text-teal-300">
              🎉 الاختبار جاهز ومنشور! يمكنك مشاركة الرابط مع طلابك أو تجربته بنفسك الآن:
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                dir="ltr"
                value={publishedExamInfo.shareUrl}
                className="flex-1 min-h-[40px] px-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="min-h-[40px] px-3.5 rounded-xl bg-indigo-900 dark:bg-teal-600 text-white text-xs font-black cursor-pointer shrink-0"
              >
                {copiedLink ? "✓ تم النسخ" : "📋 نسخ الرابط"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                href={`/student?tab=live_exam&gradeId=${encodeURIComponent(publishedExamInfo.gradeId)}&examId=${encodeURIComponent(publishedExamInfo.examId)}`}
                className="min-h-[42px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5"
              >
                <span>🧑‍🎓</span>
                <span>تجربة الحل كطالب والتصحيح التلقائي</span>
              </Link>
              <Link
                href="/assessments"
                className="min-h-[42px] px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <span>🗂️</span>
                <span>إدارة الاختبارات والأرشيف والتسليمات</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </StudioCollapsibleSectionCard>
  );
}
