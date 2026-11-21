"use client";

/**
 * @file compact-textbook-mcq-row.tsx
 * @description مصيّر ذري مستقل لأسئلة الاختيار من متعدد (MCQ) بنمط الكتاب المدرسي المزخرف عالي الكثافة (١٢–١٥+ سؤالاً في الصفحة):
 * - يُطبق حصرياً على مسائل الاختيار من متعدد في: (١) الاختبارات، (٢) المراجعات، (٣) أوراق العمل.
 * - لا يمس المذكرات الدراسية (Booklets) ولا الأسئلة المقالية.
 * - يجمع بين الأرضية البيضاء الناصعة (#ffffff) للتصوير الليزري، والإطارات الملونة الواضحة والشارات ثلاثية الأبعاد (Inline Styles) التي لا تختفي أبداً.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 250 سطراً).
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
import { EmbeddedGeometrySVGDocker } from "./embedded-geometry-svg-docker";
import { PdfPinIcon } from "./pdf-inline-vector-badge-icons";
import {
  estimateVisualChoiceLength,
  renderPromptWithInlineBlankBoxes,
} from "./compact-mcq-inline-prompt-renderer";

export const MODULE_ID_COMPACT_TEXTBOOK_MCQ_ROW = "compact_textbook_mcq_row" as const;

export interface CompactTextbookMcqRowProps {
  readonly question: PrintableMathQuestionItem;
  readonly displayQuestionNumber?: number;
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly palette: PrintThemePaletteTokens;
  readonly isSolvedMode?: boolean;
}

export function isCompactTextbookMcqQuestion(
  question: PrintableMathQuestionItem,
  isAnswerCard = false
): boolean {
  if (isAnswerCard) return false;
  if (question.isWorkedExample || question.id.startsWith("ws-concept-")) return false;
  if (question.id.startsWith("booklet-") || question.id.includes("booklet")) return false;
  return (
    question.kind === "mcq" ||
    (Array.isArray(question.mcqChoicesAr) && question.mcqChoicesAr.length >= 2)
  );
}

export function CompactTextbookMcqRow({
  question,
  displayQuestionNumber,
  settings,
  palette,
  isSolvedMode = false,
}: CompactTextbookMcqRowProps) {
  const numeralMode = settings.numeralMode;
  const notationLanguage = settings.notationLanguage;
  const qNum = displayQuestionNumber ?? question.questionNumber;
  const formattedQNum = formatNumeralsByModeSSOT(qNum, numeralMode);

  const choices = question.mcqChoicesAr ?? [];
  const hasFigure = Boolean(question.geometryFigure || question.graphSpec || question.rawSvgMarkup);
  const maxChoiceVisualLen = choices.length > 0 ? Math.max(...choices.map(estimateVisualChoiceLength)) : 0;

  const useFourColumns = !hasFigure ? maxChoiceVisualLen <= 34 : maxChoiceVisualLen <= 16;
  const gridColsClass = useFourColumns
    ? "grid-cols-4 gap-x-2 gap-y-1"
    : "grid-cols-2 gap-x-3 gap-y-1";

  const renderChoicesStrip = () => {
    if (choices.length === 0) return null;
    const isRedChoicesMode =
      settings.colorThemeId === "amber_gold" ||
      settings.colorThemeId === "navy_gold" ||
      settings.colorThemeId === "photocopy_black";

    // القاعدة اللونية المتقابلة:
    // ١) خط الاختيارات أزرق فاتح (#0284c7) ← خلفية دائرة الحرف (أ، ب، جـ، د) حمراء (#dc2626)
    // ٢) خط الاختيارات أحمر (#dc2626) ← خلفية دائرة الحرف (أ، ب، جـ، د) سوداء غامقة (#111827)
    const choiceTextHex = isRedChoicesMode ? "#dc2626" : "#0284c7";
    const choiceBorderHex = isRedChoicesMode ? "#dc2626" : "#0284c7";
    const choiceCircleBg = isRedChoicesMode ? "#111827" : "#dc2626";
    const choiceCircleBorder = isRedChoicesMode ? "#000000" : "#991b1b";
    const choiceCircleShadow = isRedChoicesMode ? "0 1.5px 0 #000000" : "0 1.5px 0 #7f1d1d";

    return (
      <div
        dir="rtl"
        style={{ paddingTop: "3px", paddingRight: "4px" }}
        className={`grid ${gridColsClass} items-center w-full`}
      >
        {choices.slice(0, 4).map((choiceText, optIdx) => {
          const isCorrect = isSolvedMode && question.correctMcqIndex === optIdx;
          const isSynthesized = Boolean(question.synthesizedMcqIndices?.includes(optIdx));
          const letter = getChoiceLetterByNotationSSOT(optIdx, notationLanguage);
          return (
            <div
              key={optIdx}
              title={isSynthesized ? "خيار فارغ في المصدر — تم ملؤه تلقائياً" : undefined}
              style={{
                backgroundColor: isSynthesized ? "#F0FDF4" : "#ffffff",
                border: isSynthesized
                  ? "1.5px solid #16A34A"
                  : isCorrect
                    ? "1.8px solid #059669"
                    : `1.1px solid ${choiceBorderHex}55`,
                borderRadius: "6px",
                padding: "1.5px 5px",
                boxShadow: isCorrect
                  ? "0 1.5px 0 #05966955"
                  : `0 1px 0 ${choiceBorderHex}28`,
              }}
              className="min-w-0 flex items-center gap-1.5"
            >
              <span
                style={{
                  backgroundColor: isSynthesized ? "#16A34A" : isCorrect ? "#059669" : choiceCircleBg,
                  color: "#ffffff",
                  border: `1px solid ${isSynthesized ? "#15803D" : isCorrect ? "#047857" : choiceCircleBorder}`,
                  boxShadow: isCorrect ? "0 1.5px 0 #064e3b" : choiceCircleShadow,
                  width: "18px",
                  height: "18px",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75em",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
                className="shrink-0 select-none"
              >
                {letter}
              </span>
              <div
                style={{ color: isSynthesized ? "#15803D" : isCorrect ? "#064e3b" : choiceTextHex }}
                className="flex-1 min-w-0 text-right font-extrabold text-[0.92em] break-words leading-tight"
              >
                <SafeKaTeXBiDiMathRenderer
                  text={choiceText}
                  numeralMode={numeralMode}
                  notationLanguage={notationLanguage}
                  className="!leading-[1.28]"
                />
              </div>
              {isCorrect && (
                <span style={{ color: "#059669" }} className="font-black text-[0.82em] shrink-0">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <article
      style={{
        backgroundColor: "#ffffff",
        border: `1.2px solid ${palette.borderHex}66`,
        borderRight: `4px solid ${palette.primaryHex}`,
        borderRadius: "8px",
        boxShadow: `0 1.5px 3px ${palette.primaryHex}12`,
        padding: "3.5px 7px 3.5px 6px",
        breakInside: "avoid",
      }}
      className="w-full min-w-0 break-inside-avoid print:break-inside-avoid text-slate-950 relative"
    >
      <div className={hasFigure ? "flex flex-row items-start justify-between gap-3 w-full" : "w-full"}>
        <div className="flex-1 min-w-0">
          {/* السطر الأول: شارة رقم السؤال المربعة ثلاثية الأبعاد + نص السؤال بجانبها مباشرة */}
          <div className="flex items-baseline gap-2 w-full min-w-0">
            <span
              style={{
                background: palette.headerGradientCss,
                color: "#ffffff",
                border: `1.2px solid ${palette.primaryHex}`,
                borderRadius: "6px",
                boxShadow: `0 2px 0 ${palette.primaryHex}, inset 0 1px 0 rgba(255, 255, 255, 0.35)`,
                minWidth: "24px",
                height: "19px",
                padding: "0 5px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.80em",
                fontWeight: 900,
                lineHeight: 1,
              }}
              className="shrink-0 select-none"
            >
              {formattedQNum}
            </span>
            <div
              className={`flex-1 min-w-0 text-[0.96em] text-slate-950 break-words leading-[1.32] ${
                settings.boldProseText !== false ? "font-extrabold" : "font-bold"
              }`}
            >
              {renderPromptWithInlineBlankBoxes(
                question.promptAr,
                numeralMode,
                notationLanguage,
                palette
              )}
            </div>
            {question.citationBadgeAr && (
              <span
                style={{
                  backgroundColor: "#ffffff",
                  border: `1px solid ${palette.borderHex}88`,
                  color: palette.secondaryHex,
                  borderRadius: "5px",
                  padding: "0 5px",
                }}
                className="shrink-0 text-[0.70em] font-black whitespace-nowrap inline-flex items-center gap-1"
              >
                <PdfPinIcon />
                <span>{formatNumeralsByModeSSOT(question.citationBadgeAr, numeralMode)}</span>
              </span>
            )}
          </div>

          {/* السطر الثاني: البدائل الأربعة (أ، ب، جـ، د) بكبسولات ودوائر ملونة ثلاثية الأبعاد */}
          {renderChoicesStrip()}
        </div>

        {hasFigure && (
          <div className="shrink-0 max-w-[185px] flex flex-col items-center justify-start self-start pt-0.5">
            <EmbeddedGeometrySVGDocker
              geometryFigure={question.geometryFigure}
              graphSpec={question.graphSpec}
              rawSvgMarkup={question.rawSvgMarkup}
              borderHex={palette.borderHex}
              softSurfaceHex="#ffffff"
              primaryHex={palette.primaryHex}
              accentHex={palette.accentHex}
              numeralMode={numeralMode}
              notationLanguage={notationLanguage}
              figureScale={settings.figureScale ?? 0.8}
              columnsCount={1}
              monochromePrintSafe={settings.colorThemeId === "photocopy_black"}
              strokeWidthMultiplier={settings.exactFontSizePt >= 15 ? 1.35 : settings.exactFontSizePt >= 14 ? 1.2 : 1}
            />
          </div>
        )}
      </div>
    </article>
  );
}
