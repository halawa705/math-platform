"use client";

/**
 * @file side-by-side-diagram-docker.tsx
 * @description مكون ذري مستقل لتصيير بطاقة المثال المحلول أو السؤال الرياضي داخل ورقة الـ A4
 * بتصميم يتفوق على المذكرات الوزارية والكتب الخارجية:
 * - ترويسة زمردية/نيلية أنيقة لكل مثال أو سؤال.
 * - دمج الشكل الهندسي المتجهي (SVG) بحجم مضبوط (`150px × 105px`) بجانب نص السؤال دون تضخم.
 * - اختيارات MCQ في شبكة 2x2 مؤطرة بأزرار `(أ) (ب) (جـ) (د)`.
 * - خطوات الحل مقسمة في بطاقات مرقمة (`الخطوة ١`، `الخطوة ٢`) مع إبراز `الناتج النهائي`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md).
 */

import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import {
  resolvePrintThemePalette,
  type PrintableMathQuestionItem,
} from "./a4-vector-html-sheet-renderer";
import { projectGeometryFigureToSVGMarkup } from "../geometry-engine/vector-svg-figure-projector";
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

  const isSolvedMode =
    settings.answerVisibilityMode === "questions_with_answers" ||
    settings.answerVisibilityMode === "answer_key_only";

  const solutionSteps = question.modelAnswerAr
    ? question.modelAnswerAr.split("|").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <article
      style={{
        breakInside: "avoid",
        borderColor: isSolvedMode ? "#059669" : "#CBD5E1",
      }}
      className="rounded-xl border-2 bg-white flex flex-col justify-between overflow-hidden shadow-2xs"
    >
      <div>
        {/* شريط رأس البطاقة الفاخر */}
        <div
          style={{
            backgroundColor: isSolvedMode ? "#ECFDF5" : "#F8FAFC",
            borderBottomColor: isSolvedMode ? "#A7F3D0" : "#E2E8F0",
          }}
          className="px-2.5 py-1.5 border-b flex items-center justify-between gap-1.5"
        >
          <div className="flex items-center gap-1.5">
            <span
              style={{
                backgroundColor: isSolvedMode
                  ? "#047857"
                  : themePalette.primaryHex,
                color: "#ffffff",
              }}
              className="px-2 py-0.5 rounded-md text-[9.5pt] font-black"
            >
              {isSolvedMode
                ? `✍️ مثال توضيحي (${formattedQNum})`
                : `مسألة (${formattedQNum})`}
            </span>
            <span
              style={{
                backgroundColor: themePalette.badgeBgHex,
                color: themePalette.primaryHex,
              }}
              className="px-2 py-0.5 rounded-md text-[8.5pt] font-extrabold"
            >
              {question.branchBadgeAr}
            </span>
          </div>
          <span className="text-[8.5pt] font-black text-slate-500">
            #{formattedQNum} • ({formattedMarks} د)
          </span>
        </div>

        {/* متن السؤال + الشكل الهندسي جنبًا إلى جنب بحجم محكوم بدقة */}
        {settings.answerVisibilityMode !== "answer_key_only" && (
          <div className="p-2.5">
            <div
              className={
                question.geometryFigure
                  ? "flex items-center justify-between gap-2.5"
                  : "block"
              }
            >
              <div className="flex-1 text-[10.5pt] font-extrabold text-slate-900 leading-relaxed">
                <SafeKaTeXBiDiMathRenderer
                  text={question.promptAr}
                  numeralMode={settings.numeralMode}
                  notationLanguage={settings.notationLanguage}
                />
              </div>
              {question.geometryFigure && (
                <div
                  style={{ width: "148px", minWidth: "148px" }}
                  className="border border-indigo-200 rounded-lg p-1 bg-indigo-50/30 flex items-center justify-center shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: projectGeometryFigureToSVGMarkup(
                      question.geometryFigure,
                      {
                        widthPx: 140,
                        heightPx: 98,
                        strokeColorHex: themePalette.primaryHex,
                        accentColorHex: "#0D9488",
                        numeralMode: settings.numeralMode,
                      }
                    ),
                  }}
                />
              )}
            </div>

            {/* اختيارات MCQ في شبكة 2x2 مؤطرة بأناقة */}
            {question.mcqChoicesAr && (
              <div className="grid grid-cols-2 gap-1.5 pt-2 mt-1.5 border-t border-slate-100 text-[10pt]">
                {question.mcqChoicesAr.map((choice, cIdx) => {
                  const letters = ["أ", "ب", "جـ", "د"];
                  return (
                    <div
                      key={cIdx}
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-1.5"
                    >
                      <span
                        style={{
                          backgroundColor: themePalette.primaryHex,
                          color: "#ffffff",
                        }}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[8.5pt] font-black shrink-0"
                      >
                        {letters[cIdx]}
                      </span>
                      <div className="flex-1 text-center font-bold">
                        <SafeKaTeXBiDiMathRenderer
                          text={choice}
                          numeralMode={settings.numeralMode}
                          notationLanguage={settings.notationLanguage}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* مساحة حل الطالب (في وضع الأسئلة فقط) */}
      {settings.answerVisibilityMode === "questions_only" &&
        settings.answerSpaceStyle !== "hidden" && (
          <div className="px-2.5 pb-2 pt-1 bg-slate-50/60 border-t border-dashed border-slate-200 space-y-1.5">
            <div className="text-[8.5pt] font-extrabold text-slate-400">
              مساحة الحل والخطوات:
            </div>
            {[1, 2].map((lineIdx) => (
              <div
                key={lineIdx}
                className={`h-4 w-full ${
                  settings.answerSpaceStyle === "dotted"
                    ? "border-b border-dotted border-slate-300"
                    : settings.answerSpaceStyle === "lined"
                    ? "border-b border-solid border-slate-300"
                    : "bg-white border border-slate-200"
                }`}
              />
            ))}
          </div>
        )}

      {/* خطوات الحل والشرح بالتفصيل (في وضع المذكرة المحلولة / نموذج الإجابة) */}
      {isSolvedMode && (
        <div className="p-2 bg-emerald-50/50 border-t border-emerald-200/80 space-y-1.5">
          <div className="text-[9pt] font-black text-emerald-900">
            خطوات الحل والشرح بالتفصيل:
          </div>
          <div className="space-y-1">
            {solutionSteps.map((stepText, idx) => (
              <div
                key={idx}
                className="p-1.5 rounded-lg bg-white border border-emerald-200/90 text-[9.5pt] font-bold text-slate-800 leading-relaxed"
              >
                <SafeKaTeXBiDiMathRenderer
                  text={stepText}
                  numeralMode={settings.numeralMode}
                  notationLanguage={settings.notationLanguage}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
