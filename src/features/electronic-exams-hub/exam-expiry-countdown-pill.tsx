"use client";

/**
 * @file exam-expiry-countdown-pill.tsx
 * @description شارة العدّاد الوامض لمدة الاختبار والوقت المتبقي لصلاحية النشر (للمعلم وللطالب):
 * تتحول تلقائياً لعرض الساعات والدقائق عندما يقل المتبقي عن يوم واحد (< 24 ساعة).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import { useEffect, useState } from "react";
import { formatNumeralsByModeSSOT } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_EXAM_EXPIRY_COUNTDOWN_PILL =
  "exam_expiry_countdown_pill" as const;

export interface ExamCountdownParts {
  readonly isExpired: boolean;
  readonly isUnderOneDay: boolean;
  readonly hoursRemaining: number;
  readonly minutesRemaining: number;
  readonly labelAr: string;
}

export function formatExamCountdownParts(
  expiresAtIso: string,
  nowMs: number = Date.now()
): ExamCountdownParts {
  const diffMs = Date.parse(expiresAtIso) - nowMs;
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return {
      isExpired: true,
      isUnderOneDay: true,
      hoursRemaining: 0,
      minutesRemaining: 0,
      labelAr: "انتهت مدة النشر (مؤرشف)",
    };
  }

  const totalMinutes = Math.max(1, Math.floor(diffMs / 60_000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days >= 1) {
    const raw =
      hours > 0
        ? `متبقي ${days} يوم و ${hours} ساعة`
        : `متبقي ${days} يوم`;
    return {
      isExpired: false,
      isUnderOneDay: false,
      hoursRemaining: days * 24 + hours,
      minutesRemaining: minutes,
      labelAr: formatNumeralsByModeSSOT(raw, "eastern"),
    };
  }

  const rawUnderDay =
    hours > 0
      ? `متبقي ${hours} ساعة و ${minutes} دقيقة`
      : `متبقي ${minutes} دقيقة`;
  return {
    isExpired: false,
    isUnderOneDay: true,
    hoursRemaining: hours,
    minutesRemaining: minutes,
    labelAr: formatNumeralsByModeSSOT(rawUnderDay, "eastern"),
  };
}

export interface ExamExpiryCountdownPillProps {
  readonly durationMinutes: number;
  readonly expiresAtIso: string;
  readonly isArchived?: boolean;
}

export default function ExamExpiryCountdownPill({
  durationMinutes,
  expiresAtIso,
  isArchived = false,
}: ExamExpiryCountdownPillProps) {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const parts = formatExamCountdownParts(expiresAtIso, nowMs);
  const durationAr = formatNumeralsByModeSSOT(String(durationMinutes || 60), "eastern");

  if (isArchived || parts.isExpired) {
    return (
      <div className="inline-flex flex-wrap items-center gap-2 text-[11px] font-black text-slate-500">
        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          ⏱️ مدة الحل: {durationAr} دقيقة
        </span>
        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          🗄️ {parts.labelAr}
        </span>
      </div>
    );
  }

  const urgentTone = parts.isUnderOneDay
    ? "bg-amber-500/15 border-amber-400 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
    : "bg-teal-500/10 border-teal-400/50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-200";
  const dotTone = parts.isUnderOneDay ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="inline-flex flex-wrap items-center gap-2 text-[11px] font-black">
      <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200">
        ⏱️ مدة الاختبار: {durationAr} دقيقة
      </span>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${urgentTone} animate-pulse`}>
        <span className={`w-2 h-2 rounded-full ${dotTone} animate-ping`} />
        <span>⏳ {parts.labelAr}</span>
      </span>
    </div>
  );
}
