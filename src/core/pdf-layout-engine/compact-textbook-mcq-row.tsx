"use client";

/**
 * @file compact-textbook-mcq-row.tsx
 * @description مصيّر ذري مستقل لأسئلة الاختيار من متعدد (MCQ) بنمط الكتاب المدمج عالي الكثافة (١٢–١٥+ سؤالاً في الصفحة):
 * - يُطبق حصرياً على مسائل الاختيار من متعدد في: (١) الاختبارات، (٢) المراجعات، (٣) أوراق العمل.
 * - لا يمس المذكرات الدراسية (Booklets) ولا الأسئلة المقالية.
 * - خلفية بيضاء ناصعة (#ffffff) مثالية للتصوير الليزري مع لمسات رسومية وتظليل ثلاثي الأبعاد خفيف للشارات والفواصل.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 240 سطراً).
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
import { cleanStudentFacingMathPromptSSOT } from "../ingestion/notebooklm-citation-latex-sanitizer";

export const MODULE_ID_COMPACT_TEXTBOOK_MCQ_ROW = "compact_textbook_mcq_row" as const;

export interface CompactTextbookMcqRowProps {
  readonly question: PrintableMathQuestionItem;
  readonly displayQuestionNumber?: number;
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly palette: PrintThemePaletteTokens;
  readonly isSolvedMode?: boolean;
}

/**
 * يحدد ما إذا كان السؤال سؤال اختيار من متعدد (MCQ) تابعاً للاختبارات أو المراجعات أو أوراق العمل
 * (مع استثناء المذكرات الدراسية `booklet-*` والأمثلة المحلولة وبطاقات الحل التفصيلي في نهاية المستند).
 */
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

function estimateVisualChoiceLength(choiceText: string): number {
  if (!choiceText) return 0;
  return choiceText
    .replace(/\$/g, "")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]+)\}/g, "√$1")
    .replace(/\\[a-zA-Z]+/g, "X")
    .replace(/[{}]/g, "")
    .trim().length;
}

/**
 * يفصل نص السؤال خارج كتل `$...$` عند مواضع النقاط (`...` أو `____`) ليرسم مكانها مستطيل فراغ مزدوج الإطار بخلفية بيضاء ناصعة.
 */
function renderPromptWithInlineBlankBoxes(
  rawPrompt: string,
  numeralMode: NumeralDisplayMode,
  notationLanguage: MathNotationLanguage,
  borderHex: string
): React.ReactNode {
  const cleaned = cleanStudentFacingMathPromptSSOT(rawPrompt).replace(
    /=\s*(?:\.{2,}|\\dots|\\ldots)\s*\$/g,
    "= $ ..."
  );

  const mathAndTextTokens = cleaned.split(/(\$[^$]+\$)/g);
  const nodes: React.ReactNode[] = [];
  let keySeq = 0;

  for (const token of mathAndTextTokens) {
    if (!token) continue;
    if (token.startsWith("$") && token.endsWith("$")) {
      nodes.push(
        <SafeKaTeXBiDiMathRenderer
          key={`m-${keySeq++}`}
          text={token}
          numeralMode={numeralMode}
          notationLanguage={notationLanguage}
          className="!leading-[1.35]"
        />
      );
      continue;
    }

    const blankParts = token.split(/(\.{2,}|_{2,}|…+)/g);
    for (const part of blankParts) {
      if (!part) continue;
      if (/^(?:\.{2,}|_{2,}|…+)$/.test(part)) {
        nodes.push(
          <span
            key={`b-${keySeq++}`}
            aria-label="فراغ الإجابة"
            style={{
              borderColor: borderHex,
              backgroundColor: "#ffffff",
              boxShadow: "0 1.5px 0 rgba(15, 23, 42, 0.10), inset 0 1px 2px rgba(15, 23, 42, 0.05)",
            }}
            className="inline-flex items-center justify-center min-w-[50px] h-[19px] px-2 mx-1 align-middle rounded-[6px] border-[1.5px] select-none"
          >
            <span className="w-7 border-b border-dotted border-slate-400" />
          </span>
        );
      } else {
        nodes.push(
          <SafeKaTeXBiDiMathRenderer
            key={`t-${keySeq++}`}
            text={part}
            numeralMode={numeralMode}
            notationLanguage={notationLanguage}
            className="!leading-[1.35]"
          />
        );
      }
    }
  }

  return nodes;
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
    ? "grid-cols-4 gap-x-2.5 gap-y-1"
    : "grid-cols-2 gap-x-4 gap-y-1";

  const renderChoicesStrip = () => {
    if (choices.length === 0) return null;
    return (
      <div dir="rtl" className={`grid ${gridColsClass} items-center pt-1 pr-7 w-full`}>
        {choices.slice(0, 4).map((choiceText, optIdx) => {
          const isCorrect = isSolvedMode && question.correctMcqIndex === optIdx;
          const letter = getChoiceLetterByNotationSSOT(optIdx, notationLanguage);
          return (
            <div
              key={optIdx}
              style={
                isCorrect
                  ? {
                      backgroundColor: "#ffffff",
                      borderColor: "#059669",
                      boxShadow: "0 1px 2px rgba(5, 150, 105, 0.14)",
                    }
                  : undefined
              }
              className={`min-w-0 flex items-center gap-1.5 py-0.5 transition-colors ${
                isCorrect
                  ? "px-1.5 rounded-md border-[1.5px] text-emerald-950 font-black"
                  : isSolvedMode
                    ? "text-slate-500 opacity-80"
                    : "text-slate-900"
              }`}
            >
              <span
                style={
                  isCorrect
                    ? {
                        backgroundColor: "#059669",
                        color: "#ffffff",
                        boxShadow: "0 1.5px 0 #064e3b",
                      }
                    : {
                        backgroundColor: "#2d2623",
                        color: "#ffffff",
                        boxShadow: `0 1.5px 0 ${palette.primaryHex}66`,
                      }
                }
                className="shrink-0 w-[19px] h-[19px] rounded-full ring-1 ring-slate-300 flex items-center justify-center text-[0.76em] font-black leading-none select-none"
              >
                {letter}
              </span>
              <div
                style={{ color: isCorrect ? "#064e3b" : palette.primaryHex }}
                className="flex-1 min-w-0 text-right font-extrabold text-[0.93em] break-words leading-tight"
              >
                <SafeKaTeXBiDiMathRenderer
                  text={choiceText}
                  numeralMode={numeralMode}
                  notationLanguage={notationLanguage}
                  className="!leading-[1.3]"
                />
              </div>
              {isCorrect && <span className="text-emerald-700 font-black text-[0.8em] shrink-0">✓</span>}
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
        borderRightColor: `${palette.primaryHex}40`,
        breakInside: "avoid",
      }}
      className="w-full min-w-0 py-[3.5px] pr-1.5 border-r-2 border-b border-dashed border-slate-200/90 last:border-b-0 break-inside-avoid print:break-inside-avoid text-slate-950 relative"
    >
      <div className={hasFigure ? "flex flex-row items-start justify-between gap-3 w-full" : "w-full"}>
        <div className="flex-1 min-w-0">
          {/* السطر الأول: شارة رقم السؤال المربعة ثلاثية الأبعاد + نص السؤال بجانبها مباشرة */}
          <div className="flex items-baseline gap-2 w-full min-w-0">
            <span
              style={{
                background: palette.headerGradientCss,
                borderColor: palette.primaryHex,
                boxShadow: "0 2px 0 rgba(15, 23, 42, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.30)",
              }}
              className="shrink-0 min-w-[24px] h-[20px] px-1.5 rounded-[5px] border inline-flex items-center justify-center text-white text-[0.82em] font-black leading-none select-none"
            >
              {formattedQNum}
            </span>
            <div
              className={`flex-1 min-w-0 text-[0.97em] text-slate-950 break-words leading-[1.35] ${
                settings.boldProseText !== false ? "font-extrabold" : "font-bold"
              }`}
            >
              {renderPromptWithInlineBlankBoxes(
                question.promptAr,
                numeralMode,
                notationLanguage,
                palette.borderHex
              )}
            </div>
            {question.citationBadgeAr && (
              <span
                style={{ borderColor: `${palette.borderHex}66`, color: palette.secondaryHex }}
                className="shrink-0 px-1.5 py-0.2 rounded border bg-white text-[0.70em] font-black whitespace-nowrap shadow-2xs"
              >
                📍 {formatNumeralsByModeSSOT(question.citationBadgeAr, numeralMode)}
              </span>
            )}
          </div>

          {/* السطر الثاني: البدائل الأربعة (أ، ب، جـ، د) بدوائر ثلاثية الأبعاد وبدون صناديق مزدحمة */}
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
            />
          </div>
        )}
      </div>
    </article>
  );
}
