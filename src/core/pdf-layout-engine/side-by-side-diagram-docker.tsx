"use client";

/**
 * @file side-by-side-diagram-docker.tsx
 * @description مكون ذري مستقل لتصيير بطاقة السؤال الرياضي الواحد داخل ورقة الـ A4
 * مع دمج الشكل الهندسي المتجهي (SVG) بجانب نص السؤال (Side-by-Side Geometry Docking)
 * وتصيير اختيارات الـ MCQ الأفقية ومساحة الإجابة ونموذج البرهان.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import React from "react";
import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import {
  resolvePrintThemePalette,
  type PrintableMathQuestionItem,
} from "./a4-vector-html-sheet-renderer";
import { projectGeometryFigureToSVGMarkup } from "../geometry-engine/vector-svg-figure-projector";
import {
  resolveAdaptiveMCQColumnsCount,
  resolveMCQGridTailwindClass,
} from "./adaptive-mcq-options-grid-solver";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";

export const MODULE_ID_SIDE_BY_SIDE_DIAGRAM_DOCKER =
  "side_by_side_diagram_docker" as const;

export interface SideBySideDiagramDockerProps {
  readonly question: PrintableMathQuestionItem;
  readonly settings: PDFPrintSettingsStateSSOT;
}

export default function SideBySideDiagramDocker({
  question,
  settings,
}: SideBySideDiagramDockerProps) {
  const themePalette = resolvePrintThemePalette(settings.colorThemeId);
  const formattedQNum = formatNumeralsByModeSSOT(
    question.questionNumber,
    settings.numeralMode
  );
  const formattedMarks = formatNumeralsByModeSSOT(
    question.marks,
    settings.numeralMode
  );

  return (
    <article
      style={{ breakInside: "avoid" }}
      className="p-2.5 rounded-lg border border-slate-300/90 bg-white flex flex-col gap-1.5"
    >
      {/* رأس السؤال المدمج */}
      <div className="flex items-center justify-between gap-1 border-b border-slate-200 pb-1">
        <div className="flex items-center gap-1.5">
          <span
            style={{
              backgroundColor: themePalette.primaryHex,
              color: "#ffffff",
            }}
            className="px-2 py-0.5 rounded text-[10pt] font-black"
          >
            س{formattedQNum}
          </span>
          <span
            style={{
              backgroundColor: themePalette.badgeBgHex,
              color: themePalette.primaryHex,
            }}
            className="px-1.5 py-0.5 rounded text-[9pt] font-bold"
          >
            {question.branchBadgeAr}
          </span>
        </div>
        <span className="text-[9.5pt] font-extrabold text-slate-600">
          ({formattedMarks} د)
        </span>
      </div>

      {/* متن السؤال + الشكل الهندسي جنبًا إلى جنب (Side-by-Side Geometry Docking) */}
      {settings.answerVisibilityMode !== "answer_key_only" && (
        <div
          className={
            question.geometryFigure
              ? "grid grid-cols-12 gap-2 items-center"
              : "block"
          }
        >
          <div className={question.geometryFigure ? "col-span-7" : "w-full"}>
            <SafeKaTeXBiDiMathRenderer
              text={question.promptAr}
              numeralMode={settings.numeralMode}
              notationLanguage={settings.notationLanguage}
            />
          </div>
          {question.geometryFigure && (
            <div
              className="col-span-5 border border-slate-200 rounded-md p-1 bg-slate-50/50"
              dangerouslySetInnerHTML={{
                __html: projectGeometryFigureToSVGMarkup(
                  question.geometryFigure,
                  {
                    strokeColorHex: themePalette.secondaryHex,
                    accentColorHex: themePalette.borderHex,
                    numeralMode: settings.numeralMode,
                  }
                ),
              }}
            />
          )}
        </div>
      )}

      {/* اختيارات MCQ الأفقية المتكيفة (4 أعمدة أو عمودان أو عمود واحد حسب طول البديل) */}
      {question.mcqChoicesAr &&
        settings.answerVisibilityMode !== "answer_key_only" && (
          <div
            className={`grid ${resolveMCQGridTailwindClass(
              resolveAdaptiveMCQColumnsCount(
                question.mcqChoicesAr,
                settings.columnsCount === 2
              )
            )} gap-1 pt-1 text-[10.5pt]`}
          >
            {question.mcqChoicesAr.map((choice, cIdx) => {
              const letters = ["أ", "ب", "جـ", "د"];
              return (
                <div
                  key={cIdx}
                  className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50/60 flex items-center gap-1"
                >
                  <span className="font-black text-slate-700">
                    ({letters[cIdx]})
                  </span>
                  <SafeKaTeXBiDiMathRenderer
                    text={choice}
                    numeralMode={settings.numeralMode}
                    notationLanguage={settings.notationLanguage}
                  />
                </div>
              );
            })}
          </div>
        )}

      {/* مساحة حل الطالب حسب النمط المختار */}
      {settings.answerVisibilityMode === "questions_only" &&
        question.kind !== "mcq" &&
        settings.answerSpaceStyle !== "hidden" && (
          <div className="mt-1 pt-1 space-y-2">
            {[1, 2].map((lineIdx) => (
              <div
                key={lineIdx}
                className={`h-4 w-full ${
                  settings.answerSpaceStyle === "dotted"
                    ? "border-b border-dotted border-slate-400"
                    : settings.answerSpaceStyle === "lined"
                    ? "border-b border-solid border-slate-300"
                    : settings.answerSpaceStyle === "grid"
                    ? "bg-slate-100/70 border border-slate-300"
                    : ""
                }`}
              />
            ))}
          </div>
        )}

      {/* نموذج الإجابة والبرهان الرياضي */}
      {(settings.answerVisibilityMode === "questions_with_answers" ||
        settings.answerVisibilityMode === "answer_key_only") && (
        <div className="mt-1 p-1.5 rounded bg-emerald-50/90 border border-emerald-300 text-[10.5pt] text-emerald-950">
          <span className="font-black">البرهان الجذري: </span>
          <SafeKaTeXBiDiMathRenderer
            text={question.modelAnswerAr}
            numeralMode={settings.numeralMode}
            notationLanguage={settings.notationLanguage}
          />
        </div>
      )}
    </article>
  );
}
