"use client";

/**
 * @file autofit-status-badge.tsx
 * @description شارة حالة الملاءمة التلقائية لصفحات الـ A4 (P-8 + X-4).
 */

import React from "react";
import { formatNumeralsByModeSSOT, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import type { AutoFitSweepState } from "./autofit-sweep-reducer";

export const MODULE_ID_AUTOFIT_STATUS_BADGE = "autofit_status_badge" as const;

export interface AutoFitStatusBadgeProps {
  readonly sweep: AutoFitSweepState;
  readonly fontPt: number;
  readonly targetMaxPages?: number;
  readonly questionsCount: number;
  readonly numeralMode: NumeralDisplayMode;
}

export function AutoFitStatusBadge({
  sweep,
  fontPt,
  targetMaxPages,
  questionsCount,
  numeralMode,
}: AutoFitStatusBadgeProps) {
  if (sweep.phase === "idle") return null;

  if (sweep.phase === "sweeping") {
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 text-[11px] font-black">
        ⏳ جارٍ ضبط الصفحات…
      </span>
    );
  }

  const decision = sweep.decision;
  if (!decision || decision.status === "no_data") return null;

  if (decision.status === "cannot_fit") {
    const target = targetMaxPages ?? 2;
    const suggestedDrop = Math.max(
      1,
      Math.ceil((decision.overBy * questionsCount) / Math.max(1, decision.pages))
    );
    return (
      <div className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/40 text-[11px] font-black leading-snug">
        <div>
          ⚠️ لا يتسع في {formatNumeralsByModeSSOT(target, numeralMode)} صفحة (يزيد{" "}
          {formatNumeralsByModeSSOT(decision.overBy, numeralMode)}) — قلّل عدد الأسئلة أو اجعل الأسئلة أقصر.
        </div>
        <div className="text-amber-100">
          اقتراح: احذف ≈ {formatNumeralsByModeSSOT(suggestedDrop, numeralMode)} سؤال/أسئلة
        </div>
      </div>
    );
  }

  return (
    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[11px] font-black">
      ✓ {formatNumeralsByModeSSOT(decision.pages, numeralMode)} صفحة — خط{" "}
      {formatNumeralsByModeSSOT(fontPt, numeralMode)}pt
    </span>
  );
}
