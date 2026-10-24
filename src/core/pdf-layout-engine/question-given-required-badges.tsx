"use client";

/**
 * @file question-given-required-badges.tsx
 * @description شارات المعطيات والمطلوب لبطاقة المسألة الهندسية أو الجبرية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import React from "react";
import type { NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";

export interface QuestionGivenRequiredBadgesProps {
  readonly givenDataAr?: string;
  readonly requiredToFindAr?: string;
  readonly primaryHex: string;
  readonly secondaryHex: string;
  readonly softSurfaceHex: string;
  readonly solvedBorderHex: string;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage?: "arabic" | "english";
}

export function QuestionGivenRequiredBadges({
  givenDataAr,
  requiredToFindAr,
  primaryHex,
  secondaryHex,
  softSurfaceHex,
  solvedBorderHex,
  numeralMode,
  notationLanguage,
}: QuestionGivenRequiredBadgesProps) {
  if (!givenDataAr && !requiredToFindAr) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-0.5 text-[0.84em]">
      {givenDataAr && (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
          <strong style={{ color: primaryHex }}>المعطيات: </strong>
          <SafeKaTeXBiDiMathRenderer
            text={givenDataAr}
            numeralMode={numeralMode}
            notationLanguage={notationLanguage}
          />
        </span>
      )}
      {requiredToFindAr && (
        <span
          style={{ backgroundColor: softSurfaceHex, borderColor: solvedBorderHex }}
          className="px-2 py-0.5 rounded text-slate-900 font-bold border"
        >
          <strong style={{ color: secondaryHex }}>المطلوب: </strong>
          <SafeKaTeXBiDiMathRenderer
            text={requiredToFindAr}
            numeralMode={numeralMode}
            notationLanguage={notationLanguage}
          />
        </span>
      )}
    </div>
  );
}
