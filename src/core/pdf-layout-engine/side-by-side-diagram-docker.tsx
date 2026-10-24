"use client";

/**
 * @file side-by-side-diagram-docker.tsx
 * @description مكون ذري مستقل لتصيير بطاقة المثال المحلول أو السؤال الرياضي داخل ورقة الـ A4
 * بتصميم عصري متوازن (المعاصر / الفارس المطوّر) مع شارة المثال المحلول (`مثال ١`، `مثال ٢`) أو السؤال (`س ١`)،
 * الشكل الهندسي المتجهي، وشبكة بدائل MCQ التكيفية (4 أو 2 أو 1 عمود) مع حماية `min-w-0` لمنع التمدد الأفقي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import { formatNumeralsByModeSSOT } from "../ssot/numeral-and-unit-ssot";
import {
  resolvePrintThemePalette,
  type PrintableMathQuestionItem,
} from "./a4-vector-html-sheet-renderer";
import {
  resolveAdaptiveMCQColumnsCount,
  resolveMCQGridTailwindClass,
} from "./adaptive-mcq-options-grid-solver";
import { StructuredStepByStepSolutionBox } from "./a4-pedagogical-capsule-and-key-table";
import { projectGeometryFigureToSVGMarkup } from "../geometry-engine/vector-svg-figure-projector";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";

export const MODULE_ID_SIDE_BY_SIDE_DIAGRAM_DOCKER =
  "side_by_side_diagram_docker" as const;

export interface SideBySideDiagramDockerProps {
  readonly question: PrintableMathQuestionItem;
  readonly settings: PDFPrintSettingsStateSSOT;
}

const CHOICE_LETTERS = ["أ", "ب", "جـ", "د"] as const;

export default function SideBySideDiagramDocker({
  question,
  settings,
}: SideBySideDiagramDockerProps) {
  const palette = resolvePrintThemePalette(settings.colorThemeId);
  const formattedQNum = formatNumeralsByModeSSOT(question.questionNumber, settings.numeralMode);
  const formattedMarks = formatNumeralsByModeSSOT(question.marks, settings.numeralMode);
  const isBookletSolvedExample = question.id.startsWith("booklet-s1-");
  const isBookletDrillOrHomework = question.id.startsWith("booklet-s2-");
  const isSolvedMode =
    isBookletSolvedExample ||
    settings.answerVisibilityMode === "questions_with_answers" ||
    settings.answerVisibilityMode === "answer_key_only";

  // ألوان خلفية وحدود متميزة لكل مثال كما في الموقع الأصلي تماماً (المثال الفردي تطبيقي بخلفيه زمردية ناعمة، والمثال الزوجي متقدم بخلفيه سماوية/بنفسجية ناعمة)
  const isOddQuestion = question.questionNumber % 2 === 1;
  const cardSurfaceBgHex = isBookletSolvedExample
    ? isOddQuestion
      ? "#F2FBF7"
      : "#F0F9FF"
    : isBookletDrillOrHomework
      ? "#FFFFFF"
      : "#FFFFFF";
  const cardBorderColorHex = isBookletSolvedExample
    ? isOddQuestion
      ? "#10B981"
      : "#0E7490"
    : isBookletDrillOrHomework
      ? "#9D174D"
      : palette.borderHex;
  const badgeBgColorHex = isBookletSolvedExample
    ? isOddQuestion
      ? "#065F46"
      : "#155E75"
    : palette.primaryHex;
  const exampleRoleLabel = isOddQuestion ? "تطبيقي" : "متقدم";

  const mcqCols = resolveAdaptiveMCQColumnsCount(question.mcqChoicesAr, settings.columnsCount === 2);
  const mcqGridClass = resolveMCQGridTailwindClass(mcqCols);

  // الذكاء التلقائي لحجم خط الحل والبدائل لتوفير المساحة عندما تكون الخطوات كثيرة (Smart Micro-Squeeze)
  const stepsCount = question.solutionStepsAr?.length ?? 0;
  const totalStepsLength = (question.solutionStepsAr ?? []).reduce((sum, s) => sum + s.length, 0);
  const autoCompactScale =
    stepsCount >= 5 || totalStepsLength > 260
      ? 0.9
      : stepsCount >= 3 || totalStepsLength > 150
        ? 0.95
        : 1;
  const optionsFontEm = question.mcqChoicesAr && question.mcqChoicesAr.some((c) => c.length > 22) ? "0.85em" : "0.9em";

  return (
    <article
      style={{
        backgroundColor: cardSurfaceBgHex,
        borderColor: cardBorderColorHex,
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)",
      }}
      className="min-w-0 w-full rounded-xl border-2 flex flex-col justify-between overflow-hidden"
    >
      <div className="p-2.5 pb-2 min-w-0">
        {isBookletSolvedExample ? (
          <div style={{ breakAfter: "avoid" }} className="mb-2 flex items-center justify-between gap-2">
            <span
              style={{ backgroundColor: badgeBgColorHex }}
              className="px-3 py-1 rounded-lg text-white text-[0.86em] font-black inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>✍️</span>
              <span>
                مثال توضيحي {formattedQNum} ({exampleRoleLabel})
              </span>
            </span>
            {question.citationBadgeAr && (
              <span
                style={{ color: palette.secondaryHex, borderColor: cardBorderColorHex }}
                className="px-2 py-0.5 rounded bg-white border text-[0.75em] font-black truncate"
              >
                📍 {formatNumeralsByModeSSOT(question.citationBadgeAr, settings.numeralMode)}
              </span>
            )}
          </div>
        ) : (
          <div
            style={{
              background: `linear-gradient(90deg, ${palette.softSurfaceHex} 0%, ${palette.badgeBgHex} 100%)`,
              borderColor: cardBorderColorHex,
              breakAfter: "avoid",
            }}
            className="px-2.5 py-1 mb-2 rounded-lg border-r-4 border flex flex-wrap items-center justify-between gap-1.5"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                style={{ backgroundColor: isBookletDrillOrHomework ? "#4338CA" : palette.primaryHex }}
                className="px-2 py-0.5 rounded-md text-white text-[0.84em] font-black shrink-0 shadow-2xs"
              >
                {isBookletDrillOrHomework ? `#${formattedQNum}` : `س (${formattedQNum})`}
              </span>
              {question.citationBadgeAr && (
                <span
                  style={{ color: palette.secondaryHex, borderColor: palette.borderHex }}
                  className="px-1.5 py-0.2 rounded bg-white border text-[0.75em] font-black truncate"
                >
                  📍 {formatNumeralsByModeSSOT(question.citationBadgeAr, settings.numeralMode)}
                </span>
              )}
            </div>
            <span
              style={{ color: isBookletDrillOrHomework ? "#9D174D" : palette.primaryHex }}
              className="text-[0.78em] font-black bg-white px-2 py-0.2 rounded-md border border-slate-200 shrink-0 shadow-2xs"
            >
              {isBookletDrillOrHomework
                ? `مسألة تدريب / واجب (${formattedQNum})`
                : `${formattedMarks} ${question.marks === 1 ? "درجة" : "درجات"}`}
            </span>
          </div>
        )}

        {settings.answerVisibilityMode !== "answer_key_only" && (
          <div className="min-w-0" style={{ breakInside: "avoid" }}>
            <div className={question.geometryFigure ? "flex items-start justify-between gap-2.5 min-w-0" : "block min-w-0"}>
              <div className="flex-1 min-w-0 space-y-1 text-[0.96em] font-extrabold text-slate-900 leading-relaxed break-words">
                <div>
                  <SafeKaTeXBiDiMathRenderer
                    text={question.promptAr}
                    numeralMode={settings.numeralMode}
                    notationLanguage={settings.notationLanguage}
                  />
                </div>
                {(question.givenDataAr || question.requiredToFindAr) && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5 text-[0.84em]">
                    {question.givenDataAr && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                        <strong style={{ color: palette.primaryHex }}>المعطيات: </strong>
                        <SafeKaTeXBiDiMathRenderer
                          text={question.givenDataAr}
                          numeralMode={settings.numeralMode}
                          notationLanguage={settings.notationLanguage}
                        />
                      </span>
                    )}
                    {question.requiredToFindAr && (
                      <span
                        style={{ backgroundColor: palette.softSurfaceHex, borderColor: palette.solvedBorderHex }}
                        className="px-2 py-0.5 rounded text-slate-900 font-bold border"
                      >
                        <strong style={{ color: palette.secondaryHex }}>المطلوب: </strong>
                        <SafeKaTeXBiDiMathRenderer
                          text={question.requiredToFindAr}
                          numeralMode={settings.numeralMode}
                          notationLanguage={settings.notationLanguage}
                        />
                      </span>
                    )}
                  </div>
                )}
              </div>

              {question.geometryFigure && (
                <div
                  style={{
                    width: "132px",
                    minWidth: "132px",
                    borderColor: palette.borderHex,
                    backgroundColor: palette.softSurfaceHex,
                  }}
                  className="border-2 rounded-lg p-1 flex items-center justify-center shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: projectGeometryFigureToSVGMarkup(question.geometryFigure, {
                      widthPx: 124,
                      heightPx: 88,
                      strokeColorHex: palette.primaryHex,
                      accentColorHex: palette.accentHex,
                      numeralMode: settings.numeralMode,
                    }),
                  }}
                />
              )}
            </div>

            {question.mcqChoicesAr && (
              <div
                style={{ fontSize: optionsFontEm }}
                className={`grid ${mcqGridClass} gap-1.5 pt-1.5 mt-1.5 border-t border-purple-100`}
              >
                {question.mcqChoicesAr.map((choice, cIdx) => {
                  const isCorrect = isSolvedMode && question.correctMcqIndex === cIdx;
                  return (
                    <div
                      key={cIdx}
                      style={{
                        borderColor: isCorrect ? palette.primaryHex : palette.solvedBorderHex,
                        backgroundColor: isCorrect ? palette.badgeBgHex : "#FAF5FF",
                        boxShadow: isCorrect
                          ? `0 0 0 1px ${palette.primaryHex} inset`
                          : "0 1px 2px rgba(76, 29, 149, 0.04)",
                      }}
                      className="min-w-0 px-2 py-1 rounded-lg border-2 flex items-center justify-between gap-1.5"
                    >
                      <span
                        style={{
                          background: isCorrect ? palette.headerGradientCss : palette.primaryHex,
                          color: "#ffffff",
                        }}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[0.8em] font-black shrink-0 shadow-2xs"
                      >
                        {CHOICE_LETTERS[cIdx]}
                      </span>
                      <div className="flex-1 min-w-0 text-center font-extrabold text-slate-900 break-words">
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

        {isSolvedMode && (
          <StructuredStepByStepSolutionBox
            item={question}
            palette={palette}
            numeralMode={settings.numeralMode}
            notationLanguage={settings.notationLanguage}
            compactScale={autoCompactScale}
          />
        )}

        {question.studentDrillPromptAr && (
          <div
            style={{ backgroundColor: palette.ruleBgHex, borderColor: palette.ruleBorderHex }}
            className="mt-2 px-2.5 py-1.5 rounded-lg border text-[0.86em] font-bold text-slate-900"
          >
            <span style={{ color: palette.accentHex }} className="font-black ml-1.5">
              ✍️ حاول بنفسك:
            </span>
            <SafeKaTeXBiDiMathRenderer
              text={question.studentDrillPromptAr}
              numeralMode={settings.numeralMode}
              notationLanguage={settings.notationLanguage}
            />
          </div>
        )}
      </div>

      {(settings.answerVisibilityMode === "questions_only" || isBookletDrillOrHomework) &&
        settings.answerSpaceStyle !== "hidden" &&
        !isBookletSolvedExample && (
          <div className="px-2.5 pb-2.5 pt-1.5 bg-slate-50/70 border-t border-dashed border-slate-300 space-y-1.5">
            <div
              style={{ color: isBookletDrillOrHomework ? "#9D174D" : palette.primaryHex }}
              className="text-[0.8em] font-black text-left"
            >
              {isBookletDrillOrHomework ? "إجابة الواجب / مساحة الحل:" : "مساحة الحل:"}
            </div>
            {[1, 2].map((lineIdx) => (
              <div
                key={lineIdx}
                className={`h-3.5 w-full ${
                  settings.answerSpaceStyle === "dotted"
                    ? "border-b border-dotted border-slate-400"
                    : settings.answerSpaceStyle === "lined"
                      ? "border-b border-solid border-slate-400"
                      : "bg-white border border-slate-200"
                }`}
              />
            ))}
          </div>
        )}
    </article>
  );
}
