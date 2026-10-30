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

export const MODULE_ID_STRUCTURED_STEP_BY_STEP_SOLUTION_BOX =
  "structured_step_by_step_solution_box" as const;

export function StructuredStepByStepSolutionBox({
  item,
  palette,
  numeralMode,
  notationLanguage,
  compactScale = 1,
}: {
  readonly item: PrintableMathQuestionItem;
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
  readonly compactScale?: number;
}) {
  const steps =
    item.solutionStepsAr && item.solutionStepsAr.length > 0
      ? item.solutionStepsAr
      : [item.modelAnswerAr];

  const effectiveEm = Number((0.84 * compactScale).toFixed(2));
  const useTwoColShortSteps = steps.length >= 4;

  return (
    <div
      style={{ fontSize: `${effectiveEm}em` }}
      className="mt-1.5 pt-1.5 border-t border-slate-200/90 space-y-1 min-w-0"
    >
      <div className="font-black flex flex-wrap items-center justify-between gap-1 text-slate-900 text-[0.9em]">
        <span>خطوات الحل والشرح بالتفصيل:</span>
        {item.kind === "mcq" && item.correctMcqIndex !== undefined && (
          <span
            style={{
              backgroundColor: palette.primaryHex,
              color: "#ffffff",
              borderColor: palette.borderHex,
            }}
            className="px-2 py-0.5 rounded-md border text-[0.82em] font-black shadow-2xs"
          >
            الإجابة الصحيحة: ({getChoiceLetterByNotationSSOT(item.correctMcqIndex, notationLanguage)})
          </span>
        )}
      </div>
      <div className={useTwoColShortSteps ? "grid grid-cols-2 gap-1 items-stretch" : "space-y-0.5"}>
        {steps.map((rawStepText, idx) => {
          const isExplicitFinal = /^الناتج\s*النهائي\s*:/i.test(rawStepText);
          const isLast = (idx === steps.length - 1 && steps.length > 1) || isExplicitFinal;
          const cleanStepText = rawStepText
            .replace(/^الناتج\s*النهائي\s*:\s*/i, "")
            .replace(/^\d+[\.\-–]\s*/, "")
            .trim();

          const visualLen = cleanStepText.replace(/\$[^$]*\$/g, "______").length;
          const isShortStep = useTwoColShortSteps && !isLast && visualLen <= 38;

          return (
            <div
              key={idx}
              className={`p-1 px-1.5 rounded border min-w-0 flex items-start gap-1 text-[0.88em] leading-snug break-inside-avoid shadow-2xs ${
                useTwoColShortSteps ? (isShortStep ? "col-span-1" : "col-span-2") : ""
              } ${
                isLast
                  ? "bg-emerald-50/70 border-emerald-300 font-black text-slate-950"
                  : "bg-slate-50/70 border-slate-200 font-bold text-slate-900"
              }`}
            >
              <span
                style={{
                  backgroundColor: isLast ? palette.primaryHex : "#ffffff",
                  color: isLast ? "#ffffff" : palette.primaryHex,
                  borderColor: isLast ? palette.primaryHex : "#CBD5E1",
                }}
                className="shrink-0 px-1 py-0.2 rounded text-[0.74em] font-black border shadow-2xs mt-0.5"
              >
                {isLast ? "الناتج" : `خطوة ${formatNumeralsByModeSSOT(idx + 1, numeralMode)}`}
              </span>
              <div className="min-w-0 flex-1 break-words">
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
    </div>
  );
}
