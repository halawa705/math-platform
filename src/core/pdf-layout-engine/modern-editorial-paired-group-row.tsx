"use client";

/**
 * @file modern-editorial-paired-group-row.tsx
 * @description مصيّر الأسئلة والأمثلة المتجاورة (1 أو 2 أو 3 أعمدة) في القالب المدرسي الحديث:
 * عمودان للأمثلة المحلولة ومسائل الهندسة، و3 أعمدة لمسائل الجبر القصيرة، وعرض كامل للمسائل الطويلة،
 * مع تفويض شريط «✍ الحـــــل» ومساحة الكتابة/الحلول إلى `modern-editorial-paired-solution-strip.tsx`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 240 سطراً).
 */

import React from "react";
import type { PrintableMathQuestionItem, PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import { EmbeddedGeometrySVGDocker } from "./embedded-geometry-svg-docker";
import {
  ModernEditorialDoubleRingNumberBadge,
  renderEditorialHighlightedPrompt,
} from "./modern-editorial-mcq-row";
import {
  ModernEditorialPairedSolutionStrip,
  type EditorialSolutionSlot,
} from "./modern-editorial-paired-solution-strip";

export const MODULE_ID_MODERN_EDITORIAL_PAIRED_GROUP_ROW =
  "modern_editorial_paired_group_row" as const;

export type EditorialQuestionSlot = EditorialSolutionSlot;

export interface ModernEditorialPairedGroupRowProps {
  readonly slots: readonly EditorialQuestionSlot[];
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly palette: PrintThemePaletteTokens;
}

function stripLeadingFigurePrefix(promptAr: string): string {
  return promptAr.replace(/^\s*(?:\[?\s*في\s+الشكل\s+المقابل\s*\]?\s*[:\-–،]*\s*)/i, "").trim();
}

export function ModernEditorialPairedGroupRow({
  slots,
  settings,
  palette,
}: ModernEditorialPairedGroupRowProps) {
  if (slots.length === 0) return null;
  const numeralMode = settings.numeralMode;
  const notationLanguage = settings.notationLanguage;
  const isPhotocopy = settings.colorThemeId === "photocopy_black";
  const gridColsStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${slots.length}, minmax(0, 1fr))`,
  };

  return (
    <article
      style={{
        backgroundColor: "transparent",
        borderBottom: `1.4px solid ${palette.primaryHex}66`,
        breakInside: "avoid",
      }}
      className="w-full min-w-0 break-inside-avoid print:break-inside-avoid text-slate-950"
    >
      {/* ١. شبكة الأسئلة / الأمثلة المتجاورة */}
      <div style={gridColsStyle} className="w-full items-stretch">
        {slots.map((slot, idx) => {
          const { question, displayNumber } = slot;
          const formattedNum = formatNumeralsByModeSSOT(displayNumber, numeralMode);
          const hasFigure = Boolean(question.geometryFigure || question.graphSpec || question.rawSvgMarkup);
          const cleanPrompt = hasFigure ? stripLeadingFigurePrefix(question.promptAr) : question.promptAr;

          return (
            <div
              key={question.id || idx}
              style={{
                borderRight: idx > 0 ? `1.2px solid ${palette.borderHex}88` : undefined,
              }}
              className="min-w-0 px-2 py-1.5 flex flex-col justify-between gap-1"
            >
              {hasFigure && slots.length === 1 ? (
                <div className="flex flex-row items-start justify-between gap-3 w-full">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ModernEditorialDoubleRingNumberBadge
                        formattedNumber={formattedNum}
                        primaryHex={palette.primaryHex}
                      />
                      <span
                        style={{
                          border: `1.2px solid ${palette.primaryHex}`,
                          color: palette.primaryHex,
                          backgroundColor: "rgba(255,255,255,0.85)",
                          borderRadius: "9999px",
                          padding: "0px 7px",
                        }}
                        className="text-[0.76em] font-black"
                      >
                        في الشكل المقابل
                      </span>
                      {question.isWorkedExample && (
                        <span
                          style={{
                            backgroundColor: isPhotocopy ? "#F1F5F9" : palette.badgeBgHex,
                            color: palette.primaryHex,
                          }}
                          className="px-1.5 py-0.2 rounded text-[0.74em] font-black"
                        >
                          مثال توضيحي
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[0.94em] text-slate-950 break-words leading-[1.38] ${
                        settings.boldProseText ? "font-extrabold" : "font-bold"
                      }`}
                    >
                      {renderEditorialHighlightedPrompt(
                        cleanPrompt,
                        numeralMode,
                        notationLanguage,
                        palette,
                        isPhotocopy
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 max-w-[210px] flex items-center justify-center">
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
                      figureScale={(settings.figureScale ?? 0.85) * 0.95}
                      columnsCount={1}
                      monochromePrintSafe={isPhotocopy}
                    />
                  </div>
                </div>
              ) : hasFigure ? (
                <>
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ModernEditorialDoubleRingNumberBadge
                        formattedNumber={formattedNum}
                        primaryHex={palette.primaryHex}
                      />
                      <span
                        style={{
                          border: `1.2px solid ${palette.primaryHex}`,
                          color: palette.primaryHex,
                          backgroundColor: "rgba(255,255,255,0.85)",
                          borderRadius: "9999px",
                          padding: "0px 7px",
                        }}
                        className="text-[0.76em] font-black"
                      >
                        في الشكل المقابل
                      </span>
                    </div>
                    {question.isWorkedExample && (
                      <span
                        style={{
                          backgroundColor: isPhotocopy ? "#F1F5F9" : palette.badgeBgHex,
                          color: palette.primaryHex,
                        }}
                        className="px-1.5 py-0.2 rounded text-[0.72em] font-black shrink-0"
                      >
                        مثال
                      </span>
                    )}
                  </div>
                  <div className="w-full flex items-center justify-center py-0.5">
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
                      figureScale={(settings.figureScale ?? 0.85) * 0.88}
                      columnsCount={2}
                      monochromePrintSafe={isPhotocopy}
                    />
                  </div>
                  <div
                    className={`text-[0.93em] text-slate-950 break-words leading-[1.36] ${
                      settings.boldProseText ? "font-extrabold" : "font-bold"
                    }`}
                  >
                    {renderEditorialHighlightedPrompt(
                      cleanPrompt,
                      numeralMode,
                      notationLanguage,
                      palette,
                      isPhotocopy
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-1.5 w-full min-w-0">
                  <ModernEditorialDoubleRingNumberBadge
                    formattedNumber={formattedNum}
                    primaryHex={palette.primaryHex}
                  />
                  <div
                    className={`flex-1 min-w-0 text-[0.94em] text-slate-950 break-words leading-[1.38] ${
                      settings.boldProseText ? "font-extrabold" : "font-bold"
                    }`}
                  >
                    {question.isWorkedExample && (
                      <span
                        style={{
                          backgroundColor: isPhotocopy ? "#F1F5F9" : palette.badgeBgHex,
                          color: palette.primaryHex,
                        }}
                        className="px-1.5 py-0.2 rounded text-[0.74em] font-black ml-1.5"
                      >
                        مثال:
                      </span>
                    )}
                    {renderEditorialHighlightedPrompt(
                      question.promptAr,
                      numeralMode,
                      notationLanguage,
                      palette,
                      isPhotocopy
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ٢. شريط «✍ الحـــــل» ومساحة الكتابة / الحلول المقسومة عمودياً */}
      <ModernEditorialPairedSolutionStrip
        slots={slots}
        settings={settings}
        palette={palette}
      />
    </article>
  );
}
