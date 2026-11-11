"use client";

/**
 * @file structured-step-by-step-solution-box.tsx
 * @description ظ…ظƒظˆظ† ط°ط±ظٹ ظ…ط³طھظ‚ظ„ ظ„طھطµظٹظٹط± ط¬ط¯ظˆظ„ ط®ط·ظˆط§طھ ط§ظ„ط­ظ„ ط§ظ„ظ†ظ…ظˆط°ط¬ظٹ ط§ظ„ظ…ط±ظ‚ظ… ظˆط§ظ„ظ…ط¤ط·ط± ط¯ط§ط®ظ„ ط¨ط·ط§ظ‚ط© ط§ظ„ط³ط¤ط§ظ„ ظپظٹ A4.
 * @invariant ظ…ظ„ظپ ط°ط±ظٹ ظ…ط³طھظ‚ظ„ ط¨ط§ط³ظ… ظپط±ظٹط¯ ط¹ط§ظ„ظ…ظٹط§ظ‹ ظˆظپظ‚ ط¯ط³طھظˆط± ط§ظ„ظ…ظ†طµط© (AGENTS.md) (< 160 ط³ط·ط±ط§ظ‹).
 */

import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import {
  getChoiceLetterByNotationSSOT,
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import type {
  PrintableMathQuestionItem,
  PrintThemePaletteTokens,
} from "./a4-vector-html-sheet-renderer";
import type { FlowSolutionSlice } from "./flow-item-model";
import type { PrintColorThemeId } from "../ssot/pdf-print-settings-ssot";
import { resolveAnswerThemeTokens } from "./question-card-palette-resolver";

export const MODULE_ID_STRUCTURED_STEP_BY_STEP_SOLUTION_BOX =
  "structured_step_by_step_solution_box" as const;

export function StructuredStepByStepSolutionBox({
  item,
  palette,
  themeId,
  numeralMode,
  notationLanguage,
  compactScale = 1,
  slice,
}: {
  readonly item: PrintableMathQuestionItem;
  readonly palette: PrintThemePaletteTokens;
  readonly themeId?: PrintColorThemeId;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
  readonly compactScale?: number;
  /** ط´ط±ظٹط­ط© ط§ظ„ط®ط·ظˆط§طھ ط§ظ„ظ…ط¹ط±ظˆط¶ط© ط¹ظ†ط¯ طھظ‚ط³ظٹظ… ط§ظ„ط­ظ„ ط¨ظٹظ† طµظپط­طھظٹظ† (ط§ظ„ط®ط·ظˆط© طھظڈط¹ط±ط¶ ظƒط§ظ…ظ„ط© ط¯ط§ط¦ظ…ط§ظ‹). */
  readonly slice?: FlowSolutionSlice;
}) {
  const rawSteps =
    item.solutionStepsAr && item.solutionStepsAr.length > 0
      ? item.solutionStepsAr
      : item.modelAnswerAr && item.modelAnswerAr.trim().length > 0
        ? [item.modelAnswerAr]
        : [];
  const allSteps = rawSteps.filter((s) => s && s.trim().length > 0);
  if (allSteps.length === 0) return null;
  const stepOffset = slice ? slice.from : 0;
  const steps = slice ? allSteps.slice(slice.from, slice.to) : allSteps;
  const isContinuation = stepOffset > 0;
  const continuesNextPage = slice !== undefined && slice.to < allSteps.length;

  const effectiveEm = Number((0.86 * compactScale).toFixed(2));
  const isOddQuestion = item.questionNumber % 2 === 1;
  const answerTokens = resolveAnswerThemeTokens(themeId, isOddQuestion);

  return (
    <div
      style={{ fontSize: `${effectiveEm}em` }}
      className="mt-1 pt-0.5 border-t border-slate-200/90 space-y-1 min-w-0"
    >
      {/* رأس قسم خطوات الحل */}
      <div className="font-black flex flex-wrap items-center justify-between gap-1 text-slate-900 text-[0.86em]">
        <span className="inline-flex items-center gap-1">
          <span
            style={{
              background: answerTokens.badgeGradientCss,
              boxShadow: "0 1.5px 4px rgba(0, 0, 0, 0.12)",
            }}
            className="px-1.5 py-0.2 rounded text-white text-[0.82em] font-black shrink-0"
          >
            âœچï¸ڈ {isContinuation ? `طھط§ط¨ط¹ ط­ظ„ ط³ط¤ط§ظ„ ${formatNumeralsByModeSSOT(item.questionNumber, numeralMode)}` : `ط¥ط¬ط§ط¨ط© ط³ط¤ط§ظ„ ${formatNumeralsByModeSSOT(item.questionNumber, numeralMode)}`}
          </span>
          {!isContinuation && (
            <span className="text-slate-600 font-bold text-[0.8em]">
              ط®ط·ظˆط§طھ ط§ظ„ط­ظ„ ظˆط§ظ„ط´ط±ط­:
            </span>
          )}
        </span>
        {!isContinuation && item.kind === "mcq" && item.correctMcqIndex !== undefined && (
          <span
            style={{
              background: answerTokens.badgeGradientCss,
              color: "#ffffff",
              boxShadow: "0 1.5px 4px rgba(0, 0, 0, 0.12)",
            }}
            className="px-2 py-0.2 rounded text-[0.8em] font-black"
          >
            ط§ظ„ط¥ط¬ط§ط¨ط© ط§ظ„طµط­ظٹط­ط©: ({getChoiceLetterByNotationSSOT(item.correctMcqIndex, notationLanguage)})
          </span>
        )}
      </div>

      {/* ط¬ط¯ظˆظ„ ط®ط·ظˆط§طھ ط§ظ„ط­ظ„ ط§ظ„ظˆط§ط³ط¹ ظˆط§ظ„ظ…ط¤ط·ط± */}
      <div className="w-full rounded-lg border border-slate-200/90 overflow-hidden bg-white shadow-2xs divide-y divide-slate-200/80">
        {steps.map((rawStepText, idx) => {
          const isExplicitFinal = /^ط§ظ„ظ†ط§طھط¬\s*ط§ظ„ظ†ظ‡ط§ط¦ظٹ\s*:/i.test(rawStepText);
          const absIdx = idx + stepOffset;
          const isLast = (absIdx === allSteps.length - 1 && allSteps.length > 1) || isExplicitFinal;
          const cleanStepText = rawStepText
            .replace(/^ط§ظ„ظ†ط§طھط¬\s*ط§ظ„ظ†ظ‡ط§ط¦ظٹ\s*:\s*/i, "")
            .replace(/^(?:ط®ط·ظˆط§طھ\s*ط§ظ„ط­ظ„(?:\s*ظˆط§ظ„ط´ط±ط­(?:\s*ط¨ط§ظ„طھظپطµظٹظ„)?)?|ط§ظ„ط­ظ„|ط§ظ„ط¨ط±ظ‡ط§ظ†)\s*[:ï¼ڑ]\s*/i, "")
            .replace(/^\d+[\.\-â€“]\s*/, "")
            .trim();

          // طھط¸ظ„ظٹظ„ ظ‡ط§ط¯ط¦ ط¨ط§ظ„طھط¨ط§ط¯ظ„طŒ ظˆطھظ…ظٹظٹط² ط£ظ†ظٹظ‚ ظ„ظ„ط®ط·ظˆط© ط§ظ„ط£ط®ظٹط±ط©
          const rowBg = isLast
            ? "#F0FDF4"
            : idx % 2 === 1
              ? "#F8FAFC"
              : "#FFFFFF";

          return (
            <div
              key={idx}
              style={{
                backgroundColor: rowBg,
                borderRightWidth: isLast ? "4px" : "1px",
                borderRightColor: isLast ? answerTokens.accentStepBorderHex : undefined,
              }}
              className="px-2 py-1 min-w-0 flex items-start gap-2 text-[0.88em] leading-[1.85] break-inside-avoid"
            >
              {/* ط´ط§ط±ط© ط±ظ‚ظ… ط§ظ„ط®ط·ظˆط© */}
              <span
                style={{
                  background: isLast ? answerTokens.badgeGradientCss : "#FFFFFF",
                  color: isLast ? "#FFFFFF" : answerTokens.badgeBgColorHex,
                  borderColor: isLast ? answerTokens.badgeBgColorHex : "#CBD5E1",
                }}
                className="shrink-0 px-1.5 py-0.2 rounded text-[0.76em] font-black border shadow-2xs mt-0.5 whitespace-nowrap"
              >
                {isLast ? "ط§ظ„ظ†ط§طھط¬ ط§ظ„ظ†ظ‡ط§ط¦ظٹ" : `ط®ط·ظˆط© ${formatNumeralsByModeSSOT(absIdx + 1, numeralMode)}`}
              </span>

              {/* ظ†طµ ظˆظ…ط¹ط§ط¯ظ„ط§طھ ط§ظ„ط®ط·ظˆط© ط¨ظƒط§ظ…ظ„ ط§ظ„ط¹ط±ط¶ ظˆط§ظ„ط±ط§ط­ط© ط§ظ„ط±ظٹط§ط¶ظٹط© */}
              <div className="min-w-0 flex-1 break-words font-medium text-slate-900 [&_.katex-display]:my-0.5 [&_.katex-display]:py-0 [&_.katex]:leading-[1.85]">
                <SafeKaTeXBiDiMathRenderer
                  text={cleanStepText}
                  numeralMode={numeralMode}
                  notationLanguage={notationLanguage}
                />
              </div>
            </div>
          );
        })}
      </div>

      {continuesNextPage && (
        <div className="text-[0.8em] font-black text-slate-500 text-left">ظٹطھط¨ط¹ ط§ظ„ط­ظ„ ظپظٹ ط§ظ„طµظپط­ط© ط§ظ„طھط§ظ„ظٹط© â—‚</div>
      )}
    </div>
  );
}
