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
}: {
  readonly item: PrintableMathQuestionItem;
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
}) {
  const steps =
    item.solutionStepsAr && item.solutionStepsAr.length > 0
      ? item.solutionStepsAr
      : [item.modelAnswerAr];

  // خط الحل مقروء دائماً: 0.94em من خط الصفحة (≈ 11.3pt عند 12pt) بلا أي تصغير تلقائي إضافي.
  const solutionFontEm = 0.94;
  const useTwoColShortSteps = steps.length >= 3;

  return (
    <div
      style={{ fontSize: `${solutionFontEm}em` }}
      className="mt-1 pt-1 border-t border-slate-200/90 space-y-0.5 min-w-0"
    >
      <div className="font-black flex flex-wrap items-center justify-between gap-1 text-slate-900 text-[0.92em]">
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
      <div className={useTwoColShortSteps ? "grid grid-cols-2 gap-x-1 gap-y-0.5 items-stretch" : "space-y-0.5"}>
        {steps.map((rawStepText, idx) => {
          const isExplicitFinal = /^الناتج\s*النهائي\s*:/i.test(rawStepText);
          const isLast = (idx === steps.length - 1 && steps.length > 1) || isExplicitFinal;
          const cleanStepText = rawStepText
            .replace(/^الناتج\s*النهائي\s*:\s*/i, "")
            .replace(/^\d+[\.\-–]\s*/, "")
            .trim();

          const visualLen = cleanStepText.replace(/\$[^$]*\$/g, "______").length;
          const isShortStep = useTwoColShortSteps && !isLast && visualLen <= 46;

          return (
            <div
              key={idx}
              className={`py-0.5 px-1 rounded border min-w-0 flex items-start gap-1 text-[1em] leading-[1.45] break-inside-avoid shadow-2xs ${
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
                className="shrink-0 min-w-[1.35em] text-center px-1 rounded text-[0.78em] font-black border mt-[0.15em]"
              >
                {isLast ? "الناتج" : formatNumeralsByModeSSOT(idx + 1, numeralMode)}
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

