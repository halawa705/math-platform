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
    <article className="w-full min-w-0 py-1.5 border-b border-slate-200/90 break-inside-avoid print:break-inside-avoid text-slate-900">
      {/* 1. سطر نص السؤال الرئيسي + شارات الدرجة والمحافظة */}
      <div className="flex items-start gap-2 text-[0.98em] font-extrabold leading-relaxed">
        {/* الترقيم النقطي: .١ */}
        <span className="shrink-0 font-black text-indigo-950 min-w-[1.6rem] text-right font-mono">
          {qNumStr}
        </span>

        {/* متن السؤال + الأشكال الهندسية */}
        <div className="flex-1 min-w-0">
          <div className="break-words">
            <SafeKaTeXBiDiMathRenderer
              text={cleanStudentFacingMathPromptSSOT(question.promptAr)}
              numeralMode={numeralMode}
              notationLanguage={notationLanguage}
            />
          </div>

          {(question.geometryFigure || question.graphSpec) && (
            <div className="my-2 flex justify-center">
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
        </div>

        {/* يسار السطر: شارة المحافظة ودرجة المسألة */}
        <div className="shrink-0 flex items-center gap-1.5 whitespace-nowrap self-start text-xs font-bold">
          {question.citationBadgeAr && (
            <span className="text-slate-600 font-sans text-[11px]">
              {formatNumeralsByModeSSOT(question.citationBadgeAr, numeralMode)}
            </span>
          )}
          <span className="font-mono text-slate-800 font-black">
            {marksStr}
          </span>
        </div>
      </div>

      {/* 2. صف خيارات الاختيار من متعدد MCQ */}
      {isMcq && choices.length > 0 && (
        <div
          dir="rtl"
          className={`pt-2 pb-0.5 w-full ${
            isComplexChoices
              ? "grid grid-cols-2 gap-2"
              : "grid grid-cols-4 gap-2"
          }`}
        >
          {choices.slice(0, 4).map((choiceText, optIdx) => {
            const isCorrect = isSolvedMode && question.correctMcqIndex === optIdx;
            return (
              <div
                key={optIdx}
                className={`flex items-center gap-2 py-1 px-2.5 rounded-lg border text-xs font-bold text-slate-900 transition-colors ${
                  isCorrect
                    ? "bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600 font-black"
                    : "bg-white border-slate-300"
                }`}
              >
                <span className="shrink-0 w-5 h-5 rounded-sm bg-indigo-950 text-white flex items-center justify-center text-[10px] font-black font-mono">
                  {ARABIC_CHOICE_LETTERS[optIdx] ?? `(${optIdx + 1})`}
                </span>
                <span className="flex-1 text-center break-words">
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

      {/* 3. حل المسألة أو مساحة الإجابة المنقطة للأسئلة المقالية والأكمل */}
      {!isMcq && (
        <div className="pt-2 pb-1 space-y-1">
          {isSolvedMode && question.modelAnswerAr ? (
            <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-300 text-emerald-950 text-xs font-bold space-y-1">
              <div className="font-black text-emerald-800">خطوات الحل والناتج:</div>
              <SafeKaTeXBiDiMathRenderer
                text={question.modelAnswerAr}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
            </div>
          ) : settings.answerSpaceStyle !== "hidden" ? (
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-black text-slate-500">مساحة الحل:</div>
              <div className="w-full h-3.5 border-b border-dotted border-slate-400" />
              <div className="w-full h-3.5 border-b border-dotted border-slate-400" />
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}
