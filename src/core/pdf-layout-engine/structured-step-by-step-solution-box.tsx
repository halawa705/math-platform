"use client";

/**
 * @file structured-step-by-step-solution-box.tsx
 * @description مكون ذري مستقل لتصيير صندوق خطوات الحل النموذجي المرقم داخل بطاقة السؤال في A4.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
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
  /** شريحة الخطوات المعروضة عند تقسيم الحل بين صفحتين (الخطوة تُعرض كاملة دائماً). */
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
  const useTwoColShortSteps = steps.length >= 2;
  const isOddQuestion = item.questionNumber % 2 === 1;
  const answerTokens = resolveAnswerThemeTokens(themeId, isOddQuestion);

  return (
    <div
      style={{ fontSize: `${effectiveEm}em` }}
      className="mt-1 pt-0.5 border-t border-slate-200/90 space-y-0.5 min-w-0"
    >
      <div className="font-black flex flex-wrap items-center justify-between gap-1 text-slate-900 text-[0.86em]">
        <span className="inline-flex items-center gap-1">
          <span
            style={{
              background: answerTokens.badgeGradientCss,
              boxShadow: "0 1.5px 4px rgba(0, 0, 0, 0.12)",
            }}
            className="px-1.5 py-0.2 rounded text-white text-[0.82em] font-black shrink-0"
          >
            ✍️ {isContinuation ? `تابع حل سؤال ${formatNumeralsByModeSSOT(item.questionNumber, numeralMode)}` : `إجابة سؤال ${formatNumeralsByModeSSOT(item.questionNumber, numeralMode)}`}
          </span>
          {!isContinuation && (
            <span className="text-slate-600 font-bold text-[0.8em]">
              خطوات الحل والشرح:
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
            الإجابة الصحيحة: ({getChoiceLetterByNotationSSOT(item.correctMcqIndex, notationLanguage)})
          </span>
        )}
      </div>
      <div className={useTwoColShortSteps ? "grid grid-cols-2 gap-1 items-stretch" : "space-y-0.5"}>
        {steps.map((rawStepText, idx) => {
          const isExplicitFinal = /^الناتج\s*النهائي\s*:/i.test(rawStepText);
          const absIdx = idx + stepOffset;
          const isLast = (absIdx === allSteps.length - 1 && allSteps.length > 1) || isExplicitFinal;
          const cleanStepText = rawStepText
            .replace(/^الناتج\s*النهائي\s*:\s*/i, "")
            .replace(/^(?:خطوات\s*الحل(?:\s*والشرح(?:\s*بالتفصيل)?)?|الحل|البرهان)\s*[:：]\s*/i, "")
            .replace(/^\d+[\.\-–]\s*/, "")
            .trim();

          const visualLen = cleanStepText.replace(/\$[^$]*\$/g, "______").length;
          const isShortStep = useTwoColShortSteps && !isLast && visualLen <= 54;

          return (
            <div
              key={idx}
              style={{
                borderColor: isLast ? answerTokens.accentStepBorderHex : undefined,
                borderRightColor: isLast ? answerTokens.accentStepBorderHex : undefined,
              }}
              className={`py-0.5 px-1.5 rounded border min-w-0 flex items-start gap-1 text-[0.88em] leading-[1.75] break-inside-avoid shadow-2xs bg-white ${
                useTwoColShortSteps ? (isShortStep ? "col-span-1" : "col-span-2") : ""
              } ${
                isLast
                  ? "border-r-4 font-black text-slate-950"
                  : "border-slate-200 font-bold text-slate-900"
              }`}
            >
              <span
                style={{
                  background: isLast ? answerTokens.badgeGradientCss : "#ffffff",
                  color: isLast ? "#ffffff" : answerTokens.badgeBgColorHex,
                  borderColor: isLast ? answerTokens.badgeBgColorHex : "#CBD5E1",
                }}
                className="shrink-0 px-1 py-0.2 rounded text-[0.74em] font-black border shadow-2xs mt-0.5"
              >
                {isLast ? "الناتج" : `خطوة ${formatNumeralsByModeSSOT(absIdx + 1, numeralMode)}`}
              </span>
              <div className="min-w-0 flex-1 break-words font-normal [&_.katex-display]:my-0.5 [&_.katex-display]:py-0 [&_.katex]:leading-[1.75]">
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
        <div className="text-[0.8em] font-black text-slate-500 text-left">يتبع الحل في الصفحة التالية ◂</div>
      )}
    </div>
  );
}


