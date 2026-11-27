"use client";

/**
 * @file modern-editorial-mcq-row.tsx
 * @description مصيّر الاختيار من متعدد المسطح عالي الكثافة للقالب المدرسي الحديث (مطابق للملفات المرفقة):
 * شارة رقم دائرية مزدوجة، إبراز كلمات السؤال المحورية، وبدائل دوائر مفرغة بإطار لوني مستجيب للسمة،
 * مع أرضية شفافة لظهور العلامة المائية بسلاسة خلف الأسئلة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 210 سطراً).
 */

import React from "react";
import type { PrintableMathQuestionItem, PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import {
  formatNumeralsByModeSSOT,
  getChoiceLetterByNotationSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import { estimateVisualChoiceLength } from "./compact-mcq-inline-prompt-renderer";
import { EmbeddedGeometrySVGDocker } from "./embedded-geometry-svg-docker";
import { renderEditorialHighlightedPrompt } from "./editorial-highlighted-prompt-renderer";

export { renderEditorialHighlightedPrompt };

export const MODULE_ID_MODERN_EDITORIAL_MCQ_ROW = "modern_editorial_mcq_row" as const;

export function ModernEditorialDoubleRingNumberBadge({
  formattedNumber,
  primaryHex,
}: {
  readonly formattedNumber: string;
  readonly primaryHex: string;
}) {
  return (
    <span
      style={{
        width: "21px",
        height: "21px",
        borderRadius: "9999px",
        border: `1.2px solid ${primaryHex}`,
        padding: "1.2px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="shrink-0 select-none"
    >
      <span
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "9999px",
          backgroundColor: primaryHex,
          color: "#FFFFFF",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.74em",
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {formattedNumber}
      </span>
    </span>
  );
}

export interface ModernEditorialMcqRowProps {
  readonly question: PrintableMathQuestionItem;
  readonly displayQuestionNumber?: number;
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly palette: PrintThemePaletteTokens;
  readonly isSolvedMode?: boolean;
}

export function ModernEditorialMcqRow({
  question,
  displayQuestionNumber,
  settings,
  palette,
  isSolvedMode = false,
}: ModernEditorialMcqRowProps) {
  const numeralMode = settings.numeralMode;
  const notationLanguage = settings.notationLanguage;
  const isPhotocopy = settings.colorThemeId === "photocopy_black";
  const qNum = displayQuestionNumber ?? question.questionNumber;
  const formattedQNum = formatNumeralsByModeSSOT(qNum, numeralMode);
  const choices = question.mcqChoicesAr ?? [];
  const hasFigure = Boolean(question.geometryFigure || question.graphSpec || question.rawSvgMarkup);
  const maxLen = choices.length > 0 ? Math.max(...choices.map(estimateVisualChoiceLength)) : 0;
  const hasCompoundMath = choices.some((c) => /[×÷+=<>]|\\times|\\div/.test(c));
  const fourColLimit = hasFigure ? (hasCompoundMath ? 10 : 14) : hasCompoundMath ? 14 : 18;
  const twoColLimit = hasFigure ? (hasCompoundMath ? 28 : 34) : hasCompoundMath ? 34 : 46;
  const gridColsClass =
    maxLen <= fourColLimit
      ? "grid-cols-4 gap-x-2 gap-y-0.5"
      : maxLen <= twoColLimit
        ? "grid-cols-2 gap-x-3 gap-y-0.5"
        : "grid-cols-1 gap-y-0.5";

  return (
    <article
      style={{
        backgroundColor: "transparent",
        borderBottom: `1px solid ${palette.borderHex}66`,
        padding: "2px 4px 2.5px 4px",
        breakInside: "avoid",
      }}
      className="w-full min-w-0 break-inside-avoid print:break-inside-avoid text-slate-950"
    >
      <div className={hasFigure ? "flex flex-row items-start justify-between gap-3 w-full" : "w-full"}>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 w-full min-w-0">
            <ModernEditorialDoubleRingNumberBadge
              formattedNumber={formattedQNum}
              primaryHex={palette.primaryHex}
            />
            <div
              className={`flex-1 min-w-0 text-[0.95em] text-slate-950 break-words leading-[1.34] ${
                settings.boldProseText ? "font-extrabold" : "font-bold"
              }`}
            >
              {renderEditorialHighlightedPrompt(
                question.promptAr,
                numeralMode,
                notationLanguage,
                palette,
                isPhotocopy
              )}
            </div>
          </div>

          {choices.length > 0 && (
            <div dir="rtl" className={`grid ${gridColsClass} items-center w-full pt-0.5 pr-6`}>
              {choices.slice(0, 4).map((choiceText, optIdx) => {
                const isCorrect = isSolvedMode && question.correctMcqIndex === optIdx;
                const isSynthesized = Boolean(question.synthesizedMcqIndices?.includes(optIdx));
                const letter = getChoiceLetterByNotationSSOT(optIdx, notationLanguage);
                return (
                  <div key={optIdx} className="min-w-0 flex items-center gap-1.5">
                    <span
                      style={{
                        backgroundColor: isSynthesized
                          ? "#16A34A"
                          : isCorrect
                            ? isPhotocopy
                              ? "#000000"
                              : "#15803D"
                            : "rgba(255, 255, 255, 0.85)",
                        color: isSynthesized || isCorrect ? "#FFFFFF" : palette.primaryHex,
                        border: `1.5px solid ${
                          isSynthesized
                            ? "#15803D"
                            : isCorrect
                              ? isPhotocopy
                                ? "#000000"
                                : "#15803D"
                              : palette.primaryHex
                        }`,
                        width: "18px",
                        height: "18px",
                        borderRadius: "9999px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.76em",
                        fontWeight: 900,
                        lineHeight: 1,
                      }}
                      className="shrink-0 select-none"
                    >
                      {letter}
                    </span>
                    <div
                      style={{
                        color: isSynthesized ? "#15803D" : isCorrect ? "#064E3B" : "#0F172A",
                      }}
                      className="flex-1 min-w-0 text-right font-extrabold text-[0.91em] break-words leading-tight"
                    >
                      <SafeKaTeXBiDiMathRenderer
                        text={choiceText}
                        numeralMode={numeralMode}
                        notationLanguage={notationLanguage}
                        className="!leading-[1.28]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hasFigure && (
          <div className="shrink-0 max-w-[240px] flex items-center justify-center pt-0.5">
            <EmbeddedGeometrySVGDocker
              geometryFigure={question.geometryFigure}
              graphSpec={question.graphSpec}
              rawSvgMarkup={question.rawSvgMarkup}
              borderHex={palette.borderHex}
              softSurfaceHex="transparent"
              primaryHex={palette.primaryHex}
              accentHex={palette.accentHex}
              numeralMode={numeralMode}
              notationLanguage={notationLanguage}
              figureScale={Math.max(0.92, settings.figureScale ?? 0.92)}
              columnsCount={1}
              monochromePrintSafe={isPhotocopy}
              editorialFrameless={true}
            />
          </div>
        )}
      </div>
    </article>
  );
}
