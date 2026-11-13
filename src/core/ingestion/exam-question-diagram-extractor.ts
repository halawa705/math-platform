/**
 * @file exam-question-diagram-extractor.ts
 * @description مستخرج ومُنظف الرسوم الهندسية والبيانية والإحصائية ونماذج المساحة لأسئلة الاختبارات الإلكترونية والورقية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { CartesianGraphSpec } from "../ssot/cartesian-graph-spec-ssot";
import type { MathBranchId } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage, NumeralDisplayMode } from "../ssot/numeral-and-unit-ssot";
import { detectAndBuildAreaModelSvg } from "../geometry-engine/arithmetic-area-model/area-model-arithmetic-svg-builder";
import { combineProblemAndTagGeometryContext } from "../geometry-engine/description-intake/problem-geometry-context-extractor";
import { parseCartesianGraphDescription } from "../geometry-engine/graph-compositor/graph-fact-parser";
import { matchGeometryWithDiagnostics } from "../geometry-engine/natural-arabic-geometry-matcher";
import { cleanStudentFacingMathPromptSSOT } from "./notebooklm-citation-latex-sanitizer";
import {
  isDiagramJustifiedForQuestion,
  shouldTriggerGeometryDiagramForPrompt,
  type CurriculumStageKind,
} from "./unsolicited-diagram-guard";

export const MODULE_ID_EXAM_QUESTION_DIAGRAM_EXTRACTOR =
  "exam_question_diagram_extractor" as const;

export interface ExtractedExamQuestionDiagrams {
  readonly rawSvgMarkup?: string;
  readonly attachedGeometryFigure?: CanonicalGeometryFigureIR;
  readonly graphSpec?: CartesianGraphSpec;
  readonly figureDiagnosticsAr?: readonly string[];
}

export function extractExamQuestionDiagrams(params: {
  readonly block: string;
  readonly basePrompt: string;
  readonly rawDrawing: string;
  readonly branchId: MathBranchId;
  readonly lessonId: string;
  readonly lessonTitleArabic: string;
  readonly orderNumber: number;
  readonly gradeId?: string;
  readonly stage?: CurriculumStageKind;
  readonly notationLanguage?: MathNotationLanguage;
  readonly numeralMode?: NumeralDisplayMode;
}): ExtractedExamQuestionDiagrams {
  const {
    block,
    basePrompt,
    rawDrawing,
    branchId,
    lessonId,
    lessonTitleArabic,
    orderNumber,
    gradeId,
    stage,
    notationLanguage = "english",
    numeralMode = "western",
  } = params;

  const fullDrawingContext = `${basePrompt} ${rawDrawing}`.trim();
  const areaModelSvg = detectAndBuildAreaModelSvg(fullDrawingContext, {
    numeralMode,
    notationLanguage,
  });
  if (areaModelSvg) {
    return { rawSvgMarkup: areaModelSvg };
  }

  const graphMatch = block.match(/\[?\s*رسم\s*بياني\s*:\s*([^\]\n]+)\]/i);
  const graphSpec = graphMatch?.[1]
    ? parseCartesianGraphDescription(graphMatch[1]) ?? undefined
    : undefined;

  const tagMatch = !graphSpec
    ? block.match(
        /\[?\s*(?:رسم\s*(?:هندسي|توضيحي|بياني|إحصائي|احصائي)|نموذج\s*بصري)\s*:\s*([^\]\n]+)\]/i
      )
    : null;

  const explicitTagText = rawDrawing || graphMatch?.[1] || tagMatch?.[1] || "";
  const hasExplicitTag = Boolean(explicitTagText.trim());
  const shouldTryGeo =
    !graphSpec &&
    (hasExplicitTag ||
      shouldTriggerGeometryDiagramForPrompt({
        promptArabic: basePrompt,
        hasExplicitTag: false,
        branchId,
        gradeId,
        stage,
        lessonTitleArabic,
      }));

  const combinedGeo = shouldTryGeo
    ? combineProblemAndTagGeometryContext(explicitTagText, basePrompt)
    : "";

  const diagramAllowed = isDiagramJustifiedForQuestion({
    promptArabic: basePrompt,
    rawDiagramTagText: combinedGeo || explicitTagText,
    hasExplicitTag,
    branchId,
    gradeId,
    stage,
    lessonTitleArabic,
  });

  if (!diagramAllowed) {
    return {};
  }

  if (graphSpec) {
    return { graphSpec };
  }

  const geoDiag = combinedGeo
    ? matchGeometryWithDiagnostics(combinedGeo, `geom_${lessonId}_${orderNumber}`, notationLanguage)
    : undefined;

  return {
    attachedGeometryFigure: geoDiag?.figure,
    figureDiagnosticsAr:
      geoDiag && (!geoDiag.figure || geoDiag.warnings.length > 0)
        ? geoDiag.warnings
        : undefined,
  };
}

export function cleanExamStudentPromptArabic(basePrompt: string): string {
  const stripped = basePrompt
    .replace(
      /\[?\s*(?:رسم\s*(?:هندسي|توضيحي|بياني|إحصائي|احصائي)|نموذج\s*بصري)\s*:\s*[^\]\n]+\]/gi,
      ""
    )
    .replace(
      /(?:^|\n)\s*(?:الرسم|رسم|الشكل)(?:\s*(?:المقابل|الهندسي|البياني|الإحصائي|الاحصائي|التوضيحي|التخطيطي))?\s*:[^\n]*/gi,
      ""
    )
    .replace(/(?:^|\n)\s*(?:الرسم|رسم|الشكل)\s*$/gim, "")
    .replace(/(?:^|\n)\s*(?:لا يوجد رسم|بدون رسم|لا رسم)[^\n]*/gi, "")
    .replace(
      /(?:^|\n)\s*(?:الإجابة_الصحيحة|الإجابة الصحيحة|إجابة_الصحيحة|إجابة الصحيحة|الإجابة|الحل|خطوات الحل|خطوات_الحل)\s*:[^\n]*/gi,
      ""
    )
    .replace(
      /(?:\{\s*محافظة\s+[^}\n]+\s*\}|\[\s*(محافظة\s+[^\]\n]+)\s*\]|\(\s*(محافظة\s+[^)\n]+)\s*\))/gi,
      ""
    )
    .trim();
  return cleanStudentFacingMathPromptSSOT(stripped);
}
