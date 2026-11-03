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

  return (
    <article className="w-full min-w-0 py-1 border-b border-slate-200/70 break-inside-avoid print:break-inside-avoid text-slate-900">
      {/* 1. سطر نص السؤال الرئيسي + شارات الدرجة والمحافظة */}
      <div className="flex items-start gap-1.5 text-[0.92em] font-extrabold leading-snug">
        {/* الترقيم النقطي: .١ */}
        <span className="shrink-0 font-black text-indigo-950 min-w-[1.4rem] text-right font-mono">
          {qNumStr}
        </span>

        {/* متن السؤال + الأشكال الهندسية + مساحة الحل بجوار السطور */}
        <div className="flex-1 min-w-0">
          <div className="break-words">
            <SafeKaTeXBiDiMathRenderer
              text={cleanStudentFacingMathPromptSSOT(question.promptAr)}
              numeralMode={numeralMode}
              notationLanguage={notationLanguage}
            />
            {/* مساحة الحل بجوار السطر مباشرة للأسئلة المقالية وليست سطراً منفصلاً */}
            {!isMcq && !isSolvedMode && settings.answerSpaceStyle !== "hidden" && (
              <span
                className="inline-block border-b border-dotted border-slate-400 min-w-[80px] w-24 mr-2 h-3.5 align-middle print:border-slate-500"
                aria-label="مساحة الحل"
              />
            )}
          </div>

          {(question.geometryFigure || question.graphSpec) && (
            <div className="my-1.5 flex justify-center">
              <EmbeddedGeometrySVGDocker
                geometryFigure={question.geometryFigure}
                graphSpec={question.graphSpec}
                borderHex={palette.borderHex}
                softSurfaceHex={palette.softSurfaceHex}
                primaryHex={palette.primaryHex}
                accentHex={palette.accentHex}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
                figureScale={settings.figureScale ?? 1}
                columnsCount={settings.columnsCount}
              />
            </div>
          )}

          {/* في وضع الإجابات النموذجية فقط: عرض الحل بشكل مضغوط */}
          {!isMcq && isSolvedMode && question.modelAnswerAr && (
            <div className="mt-1 p-1 rounded bg-emerald-50/80 border border-emerald-300 text-emerald-950 text-xs font-bold">
              <span className="font-black text-emerald-800 ml-1">الحل:</span>
              <SafeKaTeXBiDiMathRenderer
                text={question.modelAnswerAr}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
            </div>
          )}
        </div>

        {/* يسار السطر: شارة المحافظة ودرجة المسألة */}
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

      {/* 2. صف خيارات الاختيار من متعدد MCQ */}
      {isMcq && choices.length > 0 && (
        <div
          dir="rtl"
          className={`pt-1 pb-0.5 w-full ${
            isComplexChoices
              ? "grid grid-cols-2 gap-1.5"
              : "grid grid-cols-4 gap-1.5"
          }`}
        >
          {choices.slice(0, 4).map((choiceText, optIdx) => {
            const isCorrect = isSolvedMode && question.correctMcqIndex === optIdx;
            return (
              <div
                key={optIdx}
                className={`flex items-center gap-1.5 py-0.5 px-2 rounded-md border text-xs font-bold text-slate-900 transition-colors ${
                  isCorrect
                    ? "bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600 font-black"
                    : "bg-white border-slate-300"
                }`}
              >
                <span className="shrink-0 w-4 h-4 rounded-xs bg-indigo-950 text-white flex items-center justify-center text-[9.5px] font-black font-mono">
                  {ARABIC_CHOICE_LETTERS[optIdx] ?? `(${optIdx + 1})`}
                </span>
                <span className="flex-1 text-center break-words text-[11px]">
                  <SafeKaTeXBiDiMathRenderer
                    text={choiceText}
                    numeralMode={numeralMode}
                    notationLanguage={notationLanguage}
                  />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
