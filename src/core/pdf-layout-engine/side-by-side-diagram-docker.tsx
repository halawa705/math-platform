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
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import { QuestionCardBadgeHeader } from "./question-card-badge-header";
import { AdaptiveMCQChoicesCard } from "./adaptive-mcq-choices-card";
import { StudentAnswerSpaceDocker } from "./student-answer-space-docker";
import { QuestionGivenRequiredBadges } from "./question-given-required-badges";
import { EmbeddedGeometrySVGDocker } from "./embedded-geometry-svg-docker";
import { resolveQuestionCardColorScheme } from "./question-card-palette-resolver";

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
  const palette = resolvePrintThemePalette(settings.colorThemeId);
  const formattedQNum = formatNumeralsByModeSSOT(question.questionNumber, settings.numeralMode);
  const isBookletDrill = question.id.includes("-drill-");
  const isBookletSolvedExample = question.id.startsWith("booklet-s1-") && !isBookletDrill;
  const isBookletHomework = question.id.includes("-hw-") || question.id.startsWith("booklet-s2-");
  const isBookletDrillOrHomework = isBookletDrill || isBookletHomework;
  const isSolvedMode =
    isBookletSolvedExample ||
    (!isBookletDrillOrHomework &&
      (settings.answerVisibilityMode === "questions_with_answers" ||
        settings.answerVisibilityMode === "answer_key_only")) ||
    (isBookletDrillOrHomework && settings.answerVisibilityMode === "answer_key_only");

  const isOddQuestion = question.questionNumber % 2 === 1;
  const { cardSurfaceBgHex, cardBorderColorHex, badgeBgColorHex, exampleRoleLabel } =
    resolveQuestionCardColorScheme({
      isBookletSolvedExample,
      isBookletDrill,
      isBookletHomework,
      isOddQuestion,
      palette,
    });

  const mcqCols = resolveAdaptiveMCQColumnsCount(question.mcqChoicesAr, settings.columnsCount === 2);
  const mcqGridClass = resolveMCQGridTailwindClass(mcqCols);

  const stepsCount = question.solutionStepsAr?.length ?? 0;
  const totalStepsLength = (question.solutionStepsAr ?? []).reduce((sum, s) => sum + s.length, 0);
  const autoCompactScale =
    stepsCount >= 5 || totalStepsLength > 240
      ? 0.86
      : stepsCount >= 3 || totalStepsLength > 130
        ? 0.92
        : 1;
  const optionsFontEm = question.mcqChoicesAr && question.mcqChoicesAr.some((c) => c.length > 18) ? "0.82em" : "0.88em";

  return (
    <article
      style={{
        backgroundColor: cardSurfaceBgHex,
        borderColor: cardBorderColorHex,
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)",
        breakInside: "avoid",
      }}
      className="min-w-0 w-full rounded-xl border-2 flex flex-col justify-between break-inside-avoid print:break-inside-avoid"
    >
      <div className="p-2.5 pb-2 min-w-0">
        <QuestionCardBadgeHeader
          isBookletSolvedExample={isBookletSolvedExample}
          isBookletDrill={isBookletDrill}
          formattedQNum={formattedQNum}
          exampleRoleLabel={exampleRoleLabel}
          badgeBgColorHex={badgeBgColorHex}
          cardBorderColorHex={cardBorderColorHex}
          palette={palette}
          citationBadgeAr={
            question.citationBadgeAr
              ? formatNumeralsByModeSSOT(question.citationBadgeAr, settings.numeralMode)
              : undefined
          }
        />

        {settings.answerVisibilityMode !== "answer_key_only" && (
          <div className="min-w-0" style={{ breakAfter: "avoid" }}>
            <div className={question.geometryFigure ? "flex items-start justify-between gap-2.5 min-w-0" : "block min-w-0"}>
              <div className="flex-1 min-w-0 space-y-1 text-[0.96em] font-extrabold text-slate-900 leading-relaxed break-words">
                <div>
                  <SafeKaTeXBiDiMathRenderer
                    text={question.promptAr}
                    numeralMode={settings.numeralMode}
                    notationLanguage={settings.notationLanguage}
                  />
                </div>
                <QuestionGivenRequiredBadges
                  givenDataAr={question.givenDataAr}
                  requiredToFindAr={question.requiredToFindAr}
                  primaryHex={palette.primaryHex}
                  secondaryHex={palette.secondaryHex}
                  softSurfaceHex={palette.softSurfaceHex}
                  solvedBorderHex={palette.solvedBorderHex}
                  numeralMode={settings.numeralMode}
                  notationLanguage={settings.notationLanguage}
                />
              </div>

              <EmbeddedGeometrySVGDocker
                geometryFigure={question.geometryFigure}
                borderHex={palette.borderHex}
                softSurfaceHex={palette.softSurfaceHex}
                primaryHex={palette.primaryHex}
                accentHex={palette.accentHex}
                numeralMode={settings.numeralMode}
              />
            </div>

            {question.mcqChoicesAr && (
              <AdaptiveMCQChoicesCard
                mcqChoicesAr={question.mcqChoicesAr}
                mcqGridClass={mcqGridClass}
                optionsFontEm={optionsFontEm}
                isSolvedMode={isSolvedMode}
                correctMcqIndex={question.correctMcqIndex}
                palette={palette}
                numeralMode={settings.numeralMode}
                notationLanguage={settings.notationLanguage}
              />
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
        !isBookletSolvedExample && (
          <StudentAnswerSpaceDocker
            isBookletDrill={isBookletDrill}
            isBookletHomework={isBookletHomework}
            primaryHex={palette.primaryHex}
            answerSpaceStyle={settings.answerSpaceStyle}
          />
        )}
    </article>
  );
}
