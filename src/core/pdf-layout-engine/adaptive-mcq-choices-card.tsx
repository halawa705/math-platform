"use client";

/**
 * @file adaptive-mcq-choices-card.tsx
 * @description مصير خيارات الأسئلة الموضوعية (MCQ) المتجاوب مع عدد الأعمدة وشبكة البدائل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import { ARABIC_CHOICE_LETTERS, type NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";

export interface AdaptiveMCQChoicesCardProps {
  readonly mcqChoicesAr: readonly string[];
  readonly mcqGridClass: string;
  readonly optionsFontEm: string;
  readonly isSolvedMode: boolean;
  readonly correctMcqIndex?: number;
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
  palette,
  numeralMode,
  notationLanguage,
}: AdaptiveMCQChoicesCardProps) {
  return (
    <div
      style={{ fontSize: optionsFontEm }}
      className={`grid ${mcqGridClass} gap-1.5 pt-1.5 mt-1.5 border-t border-purple-100`}
    >
      {mcqChoicesAr.map((choice, cIdx) => {
        const isCorrect = isSolvedMode && correctMcqIndex === cIdx;
        return (
          <div
            key={cIdx}
            style={{
              borderColor: isCorrect ? palette.primaryHex : palette.solvedBorderHex,
              backgroundColor: isCorrect ? palette.badgeBgHex : "#FAF5FF",
              boxShadow: isCorrect
                ? `0 0 0 1px ${palette.primaryHex} inset`
                : "0 1px 2px rgba(76, 29, 149, 0.04)",
            }}
            className="min-w-0 px-2 py-1 rounded-lg border-2 flex items-center justify-between gap-1.5"
          >
            <span
              style={{
                background: isCorrect ? palette.headerGradientCss : palette.primaryHex,
                color: "#ffffff",
              }}
              className="w-5 h-5 rounded-md flex items-center justify-center text-[0.8em] font-black shrink-0 shadow-2xs"
            >
              {ARABIC_CHOICE_LETTERS[cIdx]}
            </span>
            <div className="flex-1 min-w-0 text-center font-extrabold text-slate-900 break-normal leading-tight">
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
