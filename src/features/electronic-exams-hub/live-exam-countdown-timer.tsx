"use client";

/**
 * @file live-exam-countdown-timer.tsx
 * @description المؤقت الزمني للاختبار الإلكتروني الحي مع تنبيه الوقت المتبقي المتوافق مع شاشة الهاتف.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import { useState, useEffect } from "react";
import { toEasternNumeralsSSOT } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_LIVE_EXAM_COUNTDOWN_TIMER =
  "live_exam_countdown_timer" as const;

export interface LiveExamCountdownTimerProps {
  readonly initialDurationSeconds: number;
  readonly isPaused?: boolean;
  readonly onTimeExpired?: () => void;
}

export default function LiveExamCountdownTimer({
  initialDurationSeconds,
  isPaused = false,
  onTimeExpired,
}: LiveExamCountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialDurationSeconds);

  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, secondsLeft, onTimeExpired]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = toEasternNumeralsSSOT(
    `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  );
  const isUrgent = secondsLeft < 180;

  return (
    <div
      className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${
        isUrgent
          ? "bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-700 dark:text-rose-300 animate-pulse"
          : "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200"
      }`}
    >
      <span>⏱️</span>
      <span>الوقت المتبقي: {formattedTime}</span>
    </div>
  );
}
