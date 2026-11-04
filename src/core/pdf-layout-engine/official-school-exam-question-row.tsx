"use client";

/**
 * @file official-school-exam-question-row.tsx
 * @description مصير ذري مستقل لسؤال الامتحان المدرسي الرسمي:
 * يرص السؤال بنمطه المدرسي التقليدي الفاخر بدون كروت ضخمة متباعدة:
 * - ترقيم بالسوابق النقطية (.١، .٢).
 * - نص السؤال مع كتل الرياضيات والجداول المضمنة والأشكال الهندسية.
 * - شارة الدرجة والمحافظة يسار السطر.
 * - خيارات MCQ في صناديق مستطيلة مع شارات أحرف سوداء (أ)، (ب)، (جـ)، (د).
 * - مساحة حل منقطة للأسئلة المقالية تتمدد تلقائياً لملء الصفحة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 250 سطراً).
 */

import React from "react";
import type { PrintableMathQuestionItem, PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";
import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import { EmbeddedGeometrySVGDocker } from "./embedded-geometry-svg-docker";
import { cleanStudentFacingMathPromptSSOT } from "../ingestion/notebooklm-citation-latex-sanitizer";

export const MODULE_ID_OFFICIAL_SCHOOL_EXAM_QUESTION_ROW =
  "official_school_exam_question_row" as const;

export interface OfficialSchoolExamQuestionRowProps {
  readonly question: PrintableMathQuestionItem;
  readonly sectionLocalNumber?: number;
  readonly settings: PDFPrintSettingsStateSSOT;
  readonly palette: PrintThemePaletteTokens;
  readonly isSolvedMode?: boolean;
}

const ARABIC_CHOICE_LETTERS = ["(أ)", "(ب)", "(جـ)", "(د)"] as const;

export function OfficialSchoolExamQuestionRow({
  question,
  sectionLocalNumber,
  settings,
  palette,
  isSolvedMode = false,
}: OfficialSchoolExamQuestionRowProps) {
  const numeralMode = settings.numeralMode;
  const notationLanguage = settings.notationLanguage;
  const qNum = sectionLocalNumber ?? question.questionNumber;
  const qNumStr = `${formatNumeralsByModeSSOT(qNum, numeralMode)} .`;

  const marksNum = question.marks || 1;
  const marksStr = `[${formatNumeralsByModeSSOT(marksNum, numeralMode)} ${marksNum > 2 ? "درجات" : "درجة"}]`;

  const isMcq = Boolean(
    question.kind === "mcq" ||
      (Array.isArray(question.mcqChoicesAr) && question.mcqChoicesAr.length >= 2)
  );

  const choices = question.mcqChoicesAr ?? [];
  const isComplexChoices = choices.some((c) => c.length > 22);
  const hasFigure = Boolean(question.geometryFigure || question.graphSpec);
  const answerLinesCount = question.answerLinesCount ?? 0;
  const hasDottedDivider = question.hasDottedDivider !== false;

  const renderChoicesGrid = (colsClass: string) => (
    <div dir="rtl" className={`pt-1.5 pb-0.5 w-full ${colsClass}`}>
      {choices.slice(0, 4).map((choiceText, optIdx) => {
        const isCorrect = isSolvedMode && question.correctMcqIndex === optIdx;
        return (
          <div
            key={optIdx}
            className={`flex items-center gap-1.5 py-1 px-2 rounded-md border text-xs font-bold transition-colors ${
              isCorrect
                ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600 text-emerald-950 font-black shadow-xs"
                : isSolvedMode
                  ? "bg-slate-50/70 border-slate-200 text-slate-500 opacity-75"
                  : "bg-white border-slate-300 text-slate-900"
            }`}
          >
            <span
              className={`shrink-0 w-4 h-4 rounded-xs flex items-center justify-center text-[9.5px] font-black font-mono ${
                isCorrect
                  ? "bg-emerald-700 text-white"
                  : isSolvedMode
                    ? "bg-slate-400 text-white"
                    : "bg-indigo-950 text-white"
              }`}
            >
              {ARABIC_CHOICE_LETTERS[optIdx] ?? `(${optIdx + 1})`}
            </span>
            <span className="flex-1 text-center break-words text-[11px]">
              <SafeKaTeXBiDiMathRenderer
                text={choiceText}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
            </span>
            {isCorrect && <span className="text-emerald-700 font-black text-xs mr-0.5">✓</span>}
          </div>
        );
      })}
    </div>
  );

  const renderEssayAnswerLines = () => {
    if (isMcq || isSolvedMode || answerLinesCount <= 0) return null;
    return (
      <div className="space-y-1.5 pt-2 pb-1 w-full" aria-label="سطور مساحة الحل">
        {Array.from({ length: answerLinesCount }).map((_, lineIdx) => (
          <div
            key={lineIdx}
            className="w-full border-b border-dotted border-slate-400 h-6 print:border-slate-500"
          />
        ))}
      </div>
    );
  };

  const renderEssaySolvedModelAnswer = () => {
    if (isMcq || !isSolvedMode || !question.modelAnswerAr) return null;
    return (
      <div className="mt-1.5 p-2 rounded-lg bg-emerald-50/90 border border-emerald-400 text-emerald-950 text-xs font-bold shadow-xs">
        <span className="font-black text-emerald-800 ml-1.5">الحل النموذجي:</span>
        <SafeKaTeXBiDiMathRenderer
          text={question.modelAnswerAr}
          numeralMode={numeralMode}
          notationLanguage={notationLanguage}
        />
      </div>
    );
  };

  return (
    <article
      className={`w-full min-w-0 break-inside-avoid print:break-inside-avoid text-slate-900 ${
        hasDottedDivider ? "py-1.5 border-b border-dotted border-slate-300" : "py-0.5 border-b-0"
      }`}
    >
      {hasFigure ? (
        /* عند وجود رسم هندسي أو بياني: السؤال جهة اليمين والرسم جهة اليسار بنفس السطور تماماً لحفظ المساحة */
        <div>
          <div className="flex flex-row items-start justify-between gap-3 w-full">
            {/* العمود الأيمن: نص السؤال + خيارات الاختيار من متعدد */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-1.5 text-[0.92em] font-extrabold leading-snug">
                <span className="shrink-0 font-black text-indigo-950 min-w-[1.4rem] text-right font-mono">
                  {qNumStr}
                </span>
                <div className="flex-1 min-w-0 break-words">
                  <SafeKaTeXBiDiMathRenderer
                    text={cleanStudentFacingMathPromptSSOT(question.promptAr)}
                    numeralMode={numeralMode}
                    notationLanguage={notationLanguage}
                  />
                </div>
              </div>

              {isMcq && choices.length > 0 && renderChoicesGrid("grid grid-cols-2 gap-1.5")}
            </div>

            {/* العمود الأيسر: الرسم المتجهي مدمج على اليسار بنفس السطور */}
            <div className="shrink-0 max-w-[210px] sm:max-w-[240px] flex flex-col items-center justify-start self-start pt-0.5">
              <EmbeddedGeometrySVGDocker
                geometryFigure={question.geometryFigure}
                graphSpec={question.graphSpec}
                borderHex={palette.borderHex}
                softSurfaceHex={palette.softSurfaceHex}
                primaryHex={palette.primaryHex}
                accentHex={palette.accentHex}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
                figureScale={settings.figureScale ?? 0.85}
                columnsCount={settings.columnsCount}
              />
              <div className="flex items-center gap-1.5 pt-1 text-xs font-bold text-slate-700">
                {question.citationBadgeAr && (
                  <span className="text-[10px] text-slate-500 font-sans">
                    {formatNumeralsByModeSSOT(question.citationBadgeAr, numeralMode)}
                  </span>
                )}
                <span className="font-mono font-black text-[10.5px] text-slate-800">
                  {marksStr}
                </span>
              </div>
            </div>
          </div>

          {/* مساحة الحل بعرض الصفحة تحت السؤال والرسم */}
          {renderEssayAnswerLines()}
          {renderEssaySolvedModelAnswer()}
        </div>
      ) : (
        /* عند عدم وجود رسم: نص السؤال بالعرض الكامل */
        <div>
          <div className="flex items-start gap-1.5 text-[0.92em] font-extrabold leading-snug">
            <span className="shrink-0 font-black text-indigo-950 min-w-[1.4rem] text-right font-mono">
              {qNumStr}
            </span>
            <div className="flex-1 min-w-0 break-words">
              <SafeKaTeXBiDiMathRenderer
                text={cleanStudentFacingMathPromptSSOT(question.promptAr)}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
              {!isMcq && !isSolvedMode && answerLinesCount === 0 && settings.answerSpaceStyle !== "hidden" && (
                <span
                  className="inline-block border-b border-dotted border-slate-400 min-w-[80px] w-24 mr-2 h-3.5 align-middle print:border-slate-500"
                  aria-label="مساحة الحل"
                />
              )}
            </div>
            <div className="shrink-0 flex items-center gap-1.5 whitespace-nowrap self-start text-xs font-bold">
              {question.citationBadgeAr && (
                <span className="text-slate-600 font-sans text-[10.5px]">
                  {formatNumeralsByModeSSOT(question.citationBadgeAr, numeralMode)}
                </span>
              )}
              <span className="font-mono text-slate-800 font-black text-[11px]">
                {marksStr}
              </span>
            </div>
          </div>

          {isMcq && choices.length > 0 && renderChoicesGrid(isComplexChoices ? "grid grid-cols-2 gap-1.5" : "grid grid-cols-4 gap-1.5")}
          {renderEssayAnswerLines()}
          {renderEssaySolvedModelAnswer()}
        </div>
      )}
    </article>
  );
}
