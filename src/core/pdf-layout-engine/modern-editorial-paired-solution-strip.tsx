"use client";

/**
 * @file modern-editorial-paired-solution-strip.tsx
 * @description شريط «✍ الحـــــل» العرضي المشترك ومساحة النقاط/الحلول المقسومة عمودياً للقالب المدرسي الحديث.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 115 سطراً).
 */

import React from "react";
import type { PrintableMathQuestionItem, PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";

export const MODULE_ID_MODERN_EDITORIAL_PAIRED_SOLUTION_STRIP =
  "modern_editorial_paired_solution_strip" as const;

export interface EditorialSolutionSlot {
  readonly question: PrintableMathQuestionItem;
  readonly displayNumber: number;
  readonly isSolved: boolean;
}

function resolveSlotAnswerLines(
  question: PrintableMathQuestionItem,
  slotsCount: number,
  hasFigure: boolean,
  settings: PDFPrintSettingsStateSSOT
): number {
  if (question.hasCustomAnswerLines && typeof question.answerLinesCount === "number") {
    return question.answerLinesCount;
  }
  if (settings.hasManualEssayLinesLock && typeof settings.essayAnswerLinesCount === "number") {
    return settings.essayAnswerLinesCount;
  }
  if (typeof settings.answerSpaceLines === "number" && settings.answerSpaceLines > 0) {
    return hasFigure ? Math.max(settings.answerSpaceLines, 3) : settings.answerSpaceLines;
  }
  if (typeof question.answerLinesCount === "number" && question.answerLinesCount > 0) {
    return question.answerLinesCount;
  }
  if (hasFigure) return 3;
  return slotsCount === 3 ? 2 : 3;
}

export function ModernEditorialPairedSolutionStrip({
  slots,
  settings,
  palette,
  extraStretchPx = 0,
  isContinuationTail = false,
}: {
  readonly slots: readonly EditorialSolutionSlot[];
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly palette: PrintThemePaletteTokens;
  readonly extraStretchPx?: number;
  readonly isContinuationTail?: boolean;
}) {
  const anySolved = slots.some((s) => s.isSolved);
  if (!anySolved && settings.answerSpaceStyle === "hidden") return null;

  const isPhotocopy = settings.colorThemeId === "photocopy_black";
  const gridColsStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${slots.length}, minmax(0, 1fr))`,
  };

  const baseLinesCount = anySolved
    ? 0
    : Math.max(
        1,
        ...slots.map((s) =>
          resolveSlotAnswerLines(
            s.question,
            slots.length,
            Boolean(s.question.geometryFigure || s.question.graphSpec || s.question.rawSvgMarkup),
            settings
          )
        )
      );
  const bonusLines = !anySolved && extraStretchPx >= 18 ? Math.min(10, Math.floor(extraStretchPx / 19)) : 0;
  const maxLinesCount = baseLinesCount + bonusLines;

  const lineBorderClass =
    settings.answerSpaceStyle === "lined"
      ? "border-b border-solid border-slate-400"
      : "border-b border-dotted border-slate-400";

  return (
    <>
      <div
        style={{
          backgroundColor: isPhotocopy ? "#F1F5F9" : `${palette.softSurfaceHex}D9`,
          padding: "1px 8px",
        }}
        className="w-full flex items-center justify-center"
      >
        <div className="inline-flex flex-col items-center leading-none">
          <div
            style={{ color: palette.secondaryHex }}
            className="inline-flex items-center gap-1 text-[0.86em] font-black"
          >
            <span aria-hidden="true">✍</span>
            <span>{isContinuationTail ? "تابع الحـــــــل" : "الحـــــــل"}</span>
          </div>
          <svg width="78" height="6" viewBox="0 0 78 6" aria-hidden="true" className="-mt-0.5">
            <path
              d="M 4 2 Q 39 7 74 2"
              fill="none"
              stroke={palette.secondaryHex}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div style={gridColsStyle} className="w-full items-stretch">
        {slots.map((slot, idx) => {
          const steps =
            slot.question.solutionStepsAr && slot.question.solutionStepsAr.length > 0
              ? slot.question.solutionStepsAr
              : slot.question.modelAnswerAr
                ? [slot.question.modelAnswerAr]
                : [];

          return (
            <div
              key={`sol-${slot.question.id || idx}`}
              style={{
                borderRight: idx > 0 ? `1.2px solid ${palette.borderHex}88` : undefined,
              }}
              className="min-w-0 px-2.5 py-1 flex flex-col justify-start"
            >
              {slot.isSolved ? (
                <div className="space-y-0.5 text-[0.86em] font-bold text-slate-900 leading-[1.45]">
                  {steps.map((st, sIdx) => {
                    const isLast = sIdx === steps.length - 1;
                    const cleanStep = st.replace(/(\$)\s*\.\s*$/, "$1");
                    return (
                      <div
                        key={sIdx}
                        style={
                          isLast
                            ? { color: isPhotocopy ? "#000000" : palette.primaryHex }
                            : undefined
                        }
                        className={isLast ? "font-black" : "font-semibold"}
                      >
                        <SafeKaTeXBiDiMathRenderer
                          text={cleanStep}
                          numeralMode={settings.numeralMode}
                          notationLanguage={settings.notationLanguage}
                          className="!leading-[1.42]"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-0.5 w-full">
                  {Array.from({ length: maxLinesCount }).map((_, lIdx) => (
                    <div key={lIdx} className={`w-full h-[18px] ${lineBorderClass}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
