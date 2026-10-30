"use client";

/**
 * @file studio-exam-online-publish-panel.tsx
 * @description لوحة نشر الاختبار كاختبار إلكتروني للطلاب (زمن الإجابة + مؤقت البقاء + خيار إظهار الحل بعد التسليم).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 130 سطراً).
 */

import { useState } from "react";
import StudioCollapsibleSectionCard from "./studio-collapsible-section-card";
import StudioNumberStepperField from "./studio-number-stepper-field";

export const MODULE_ID_STUDIO_EXAM_ONLINE_PUBLISH_PANEL =
  "studio_exam_online_publish_panel" as const;

export interface StudioExamOnlinePublishPanelProps {
  readonly gradeNameAr: string;
  readonly statusMessageAr: string | null;
  readonly onPublish: (params: {
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
  statusMessageAr,
  onPublish,
}: StudioExamOnlinePublishPanelProps) {
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [preset, setPreset] = useState<"3" | "7" | "14" | "custom">("7");
  const [customDays, setCustomDays] = useState(5);
  const [revealAnswers, setRevealAnswers] = useState(true);
  const days = preset === "custom" ? Math.max(1, customDays) : Number(preset);

  return (
    <StudioCollapsibleSectionCard
      icon="🚀"
      titleAr="نشر كاختبار إلكتروني للطلاب"
      summaryAr={`${gradeNameAr} • ${durationMinutes} دقيقة • يؤرشف بعد ${days} يوم`}
    >
      <div className="space-y-3 pt-2">
        <StudioNumberStepperField
          labelAr="زمن إجابة الطالب (دقيقة)"
          value={durationMinutes}
          min={5}
          max={180}
          onChange={setDurationMinutes}
        />
        <div>
          <div className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mb-1.5">
            ⏳ مدة بقاء الاختبار قبل الأرشفة التلقائية
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
            labelAr="عدد الأيام"
            value={customDays}
            min={1}
            max={365}
            onChange={setCustomDays}
          />
        )}
        <label className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-xs font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer">
          <span>إظهار الحل النموذجي للطالب بعد التسليم</span>
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
              durationMinutes,
              availabilityDays: days,
              revealAnswers,
            })
          }
          className="w-full min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black cursor-pointer"
        >
          🚀 نشر الاختبار للطلاب الآن
        </button>
        {statusMessageAr && (
          <p className="text-xs font-black text-teal-900 dark:text-teal-200">
            {statusMessageAr}
          </p>
        )}
      </div>
    </StudioCollapsibleSectionCard>
  );
}
