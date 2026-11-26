"use client";

/**
 * @file adaptive-mcq-choices-card.tsx
 * @description مصير خيارات الأسئلة الموضوعية (MCQ) المتجاوب مع عدد الأعمدة وشبكة البدائل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import type { PrintColorThemeId } from "../ssot/pdf-print-settings-ssot";
import {
  getChoiceLetterByNotationSSOT,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import { resolveMcqChoiceVisualTokens } from "./pdf-mcq-choice-palette-resolver";

export interface AdaptiveMCQChoicesCardProps {
  readonly mcqChoicesAr: readonly string[];
  readonly mcqGridClass: string;
  readonly optionsFontEm: string;
  readonly isSolvedMode: boolean;
  readonly correctMcqIndex?: number;
  readonly synthesizedMcqIndices?: readonly number[];
  readonly palette: PrintThemePaletteTokens;
  readonly themeId?: PrintColorThemeId;
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
  themeId,
  numeralMode,
  notationLanguage,
}: AdaptiveMCQChoicesCardProps) {
  const mcqTokens = resolveMcqChoiceVisualTokens(themeId, palette);

  return (
    <div
      style={{
        fontSize: optionsFontEm,
        borderTopColor: mcqTokens.dividerBorderHex,
      }}
      className={`grid ${mcqGridClass} gap-1 pt-1 mt-1 border-t`}
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
                  ? mcqTokens.correctBorderHex
                  : mcqTokens.capsuleBorderHex,
              backgroundColor: isSynthesized
                ? "#F0FDF4"
                : isCorrect
                  ? mcqTokens.correctBgHex
                  : mcqTokens.capsuleBgHex,
              boxShadow: isCorrect ? "none" : mcqTokens.capsuleShadowCss,
            }}
            className="min-w-0 px-1.5 py-0.5 rounded-lg border-[1.5px] flex items-center justify-between gap-1 min-h-[2rem]"
          >
            <span
              style={{
                backgroundColor: isSynthesized
                  ? "#16A34A"
                  : isCorrect
                    ? mcqTokens.correctBadgeBgHex
                    : mcqTokens.letterBadgeBgHex,
                color: mcqTokens.letterBadgeTextHex,
                border: `1px solid ${
                  isSynthesized
                    ? "#15803D"
                    : isCorrect
                      ? mcqTokens.correctBorderHex
                      : mcqTokens.letterBadgeBorderHex
                }`,
              }}
              className="w-5 h-5 rounded-md flex items-center justify-center text-[0.8em] font-black shrink-0"
            >
              {getChoiceLetterByNotationSSOT(cIdx, notationLanguage)}
            </span>
            <div
              style={{
                color: isSynthesized
                  ? "#15803D"
                  : isCorrect
                    ? mcqTokens.correctTextHex
                    : mcqTokens.choiceTextHex,
              }}
              className="flex-1 min-w-0 flex items-center justify-center text-center font-extrabold break-normal leading-normal py-0.5"
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
