"use client";

/**
 * @file compact-textbook-mcq-row.tsx
 * @description مصيّر ذري مستقل لأسئلة الاختيار من متعدد (MCQ) بنمط الكتاب المدمج عالي الكثافة (١٢–١٥+ سؤالاً في الصفحة):
 * - يُطبق حصرياً على مسائل الاختيار من متعدد في: (١) الاختبارات، (٢) المراجعات، (٣) أوراق العمل.
 * - لا يمس المذكرات الدراسية (Booklets) ولا الأسئلة المقالية.
 * - يعرض رقم السؤال في شارة مربعة مدمجة ببداية السطر، يليه نص السؤال (مع تحويل نقاط الفراغ إلى مستطيل إجابة مدمج)،
 *   وتحته البدائل الأربعة (أ، ب، جـ، د) بأيقونات دائرية داكنة في سطر أفقي واحد بدون صناديق مزدحمة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
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
 * يفصل نص السؤال خارج كتل `$...$` عند مواضع النقاط (`...` أو `____`) ليرسم مكانها مستطيل فراغ أنيق يحاكي الكتاب المدرسي.
 */
function renderPromptWithInlineBlankBoxes(
  rawPrompt: string,
  numeralMode: NumeralDisplayMode,
  notationLanguage: MathNotationLanguage,
  borderHex: string
): React.ReactNode {
  const cleaned = cleanStudentFacingMathPromptSSOT(rawPrompt)
    // إذا كانت النقاط داخل آخر كتلة رياضة بعد علامة يساوي مثل `$5 + 3 = ...$` نخرج النقاط خارج `$` لترسم كمربع فراغ
    .replace(/=\s*(?:\.{2,}|\\dots|\\ldots)\s*\$/g, "= $ ...");

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
            style={{ borderColor: borderHex }}
            className="inline-flex items-center justify-center min-w-[48px] h-[18px] px-2 mx-1 align-middle rounded-[5px] border bg-slate-50/80 shadow-2xs select-none"
          >
            <span className="w-6 border-b border-dotted border-slate-400" />
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

  // في العرض الكامل (بدون رسم): ٤ أعمدة في سطر واحد ما لم يتجاوز طول البديل ٣٤ حرفاً بصرياً
  const useFourColumns = !hasFigure ? maxChoiceVisualLen <= 34 : maxChoiceVisualLen <= 16;
  const gridColsClass = useFourColumns
    ? "grid-cols-4 gap-x-2.5 gap-y-1"
    : "grid-cols-2 gap-x-4 gap-y-1";

  const renderChoicesStrip = () => {
    if (choices.length === 0) return null;
    return (
      <div dir="rtl" className={`grid ${gridColsClass} items-center pt-1 pr-6 w-full`}>
        {choices.slice(0, 4).map((choiceText, optIdx) => {
          const isCorrect = isSolvedMode && question.correctMcqIndex === optIdx;
          const letter = getChoiceLetterByNotationSSOT(optIdx, notationLanguage);
          return (
            <div
              key={optIdx}
              className={`min-w-0 flex items-center gap-1.5 py-0.5 transition-colors ${
                isCorrect
                  ? "bg-emerald-50/90 px-1.5 rounded-md ring-1 ring-emerald-500 text-emerald-950 font-black"
                  : isSolvedMode
                    ? "text-slate-500 opacity-80"
                    : "text-slate-900"
              }`}
            >
              <span
                style={
                  isCorrect
                    ? { backgroundColor: "#059669", color: "#ffffff" }
                    : { backgroundColor: "#332b28", color: "#ffffff" }
                }
                className="shrink-0 w-[19px] h-[19px] rounded-full flex items-center justify-center text-[0.76em] font-black leading-none shadow-2xs"
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
      style={{ breakInside: "avoid" }}
      className="w-full min-w-0 py-[3px] border-b border-slate-200/75 last:border-b-0 break-inside-avoid print:break-inside-avoid text-slate-950"
    >
      <div className={hasFigure ? "flex flex-row items-start justify-between gap-3 w-full" : "w-full"}>
        <div className="flex-1 min-w-0">
          {/* السطر الأول: شارة رقم السؤال المربعة + نص السؤال بجانبها مباشرة */}
          <div className="flex items-baseline gap-2 w-full min-w-0">
            <span
              style={{ backgroundColor: palette.primaryHex }}
              className="shrink-0 min-w-[23px] h-[20px] px-1.5 rounded-[5px] inline-flex items-center justify-center text-white text-[0.82em] font-black leading-none shadow-2xs select-none"
            >
              {formattedQNum}
            </span>
            <div
              className={`flex-1 min-w-0 text-[0.97em] text-slate-900 break-words leading-[1.35] ${
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
              <span className="shrink-0 text-[0.72em] font-bold text-slate-500 whitespace-nowrap">
                {formatNumeralsByModeSSOT(question.citationBadgeAr, numeralMode)}
              </span>
            )}
          </div>

          {/* السطر الثاني: البدائل الأربعة (أ، ب، جـ، د) بدوائر مصمتة بدون صناديق */}
          {renderChoicesStrip()}
        </div>

        {hasFigure && (
          <div className="shrink-0 max-w-[185px] flex flex-col items-center justify-start self-start pt-0.5">
            <EmbeddedGeometrySVGDocker
              geometryFigure={question.geometryFigure}
              graphSpec={question.graphSpec}
              rawSvgMarkup={question.rawSvgMarkup}
              borderHex={palette.borderHex}
              softSurfaceHex={palette.softSurfaceHex}
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
