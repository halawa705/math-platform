"use client";

/**
 * @file adaptive-mcq-choices-card.tsx
 * @description مصير خيارات الأسئلة الموضوعية (MCQ) المتجاوب مع عدد الأعمدة وشبكة البدائل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import {
  getChoiceLetterByNotationSSOT,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";

export interface AdaptiveMCQChoicesCardProps {
  readonly mcqChoicesAr: readonly string[];
  readonly mcqGridClass: string;
  readonly optionsFontEm: string;
  readonly isSolvedMode: boolean;
  readonly correctMcqIndex?: number;
  readonly synthesizedMcqIndices?: readonly number[];
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage?: "arabic" | "english";
}

export function AdaptiveMCQChoicesCard({
  mcqChoicesAr,
  mcqGridClass,
  optionsFontEm,
  isSolvedMode,
  correctMcqIndex,
  synthesizedMcqIndices,
  palette,
  numeralMode,
  notationLanguage,
}: AdaptiveMCQChoicesCardProps) {
  return (
    <div
      style={{ fontSize: optionsFontEm }}
      className={`grid ${mcqGridClass} gap-1 pt-1 mt-1 border-t border-purple-100`}
    >
      {mcqChoicesAr.map((choice, cIdx) => {
        const isCorrect = isSolvedMode && correctMcqIndex === cIdx;
        const isSynthesized = Boolean(synthesizedMcqIndices?.includes(cIdx));
        return (
          <div
            key={cIdx}
            title={isSynthesized ? "خيار فارغ في المصدر — تم ملؤه تلقائياً" : undefined}
            style={{
              borderColor: isSynthesized
                ? "#16A34A"
                : isCorrect
                  ? palette.primaryHex
                  : palette.solvedBorderHex,
              backgroundColor: isSynthesized ? "#F0FDF4" : "#FFFFFF",
              boxShadow: isCorrect
                ? `0 0 0 1px ${palette.primaryHex} inset`
                : "0 1px 2px rgba(76, 29, 149, 0.04)",
            }}
            className="min-w-0 px-1.5 py-0.5 rounded-lg border-2 flex items-center justify-between gap-1 min-h-[2rem]"
          >
            <span
              style={{
                background: isSynthesized
                  ? "#16A34A"
                  : isCorrect
                    ? palette.headerGradientCss
                    : palette.primaryHex,
                color: "#ffffff",
              }}
              className="w-5 h-5 rounded-md flex items-center justify-center text-[0.8em] font-black shrink-0 shadow-2xs"
            >
              {getChoiceLetterByNotationSSOT(cIdx, notationLanguage)}
            </span>
            <div
              style={isSynthesized ? { color: "#15803D" } : undefined}
              className={`flex-1 min-w-0 flex items-center justify-center text-center font-extrabold break-normal leading-normal py-0.5 ${
                isSynthesized ? "" : "text-slate-900"
              }`}
            >
              <SafeKaTeXBiDiMathRenderer
                text={choice}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
