/**
 * @file notebooklm-worksheet-diagram-matcher.ts
 * @description مساعد ذري موحد لمطابقة الأشكال الهندسية والرسوم البيانية في أوراق عمل NotebookLM عبر الإدخال المزدوج.
 */
import type { MathBranchId } from "../ssot/math-branches-ssot";
import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { CartesianGraphSpec } from "../ssot/cartesian-graph-spec-ssot";
import { combineProblemAndTagGeometryContext } from "../geometry-engine/description-intake/problem-geometry-context-extractor";
import { matchGeometryWithDiagnostics } from "../geometry-engine/natural-arabic-geometry-matcher";
import { parseCartesianGraphDescription } from "../geometry-engine/graph-compositor/graph-fact-parser";
import {
  isDiagramJustifiedForQuestion,
  shouldTriggerGeometryDiagramForPrompt,
  type CurriculumStageKind,
} from "./unsolicited-diagram-guard";

export const MODULE_ID_NOTEBOOKLM_WORKSHEET_DIAGRAM_MATCHER = "notebooklm_worksheet_diagram_matcher" as const;

export function resolveWorksheetItemDiagram(params: {
  readonly promptText: string;
  readonly diagramDesc?: string;
  readonly branchId: MathBranchId;
  readonly gradeId?: string;
  readonly stage?: CurriculumStageKind;
  readonly lessonTitleArabic?: string;
}): { readonly geometryFigure?: CanonicalGeometryFigureIR; readonly graphSpec?: CartesianGraphSpec } {
  const hasExplicitTag = Boolean(params.diagramDesc);
  const shouldTryGeo =
    hasExplicitTag ||
    shouldTriggerGeometryDiagramForPrompt({
      promptArabic: params.promptText,
      hasExplicitTag: false,
      branchId: params.branchId,
      gradeId: params.gradeId,
      stage: params.stage,
      lessonTitleArabic: params.lessonTitleArabic,
    });
  const diagCombined = shouldTryGeo ? combineProblemAndTagGeometryContext(params.diagramDesc, params.promptText) : undefined;
  const diagramAllowed = isDiagramJustifiedForQuestion({
    promptArabic: params.promptText,
    rawDiagramTagText: diagCombined || params.diagramDesc,
    hasExplicitTag,
    branchId: params.branchId,
    gradeId: params.gradeId,
    stage: params.stage,
    lessonTitleArabic: params.lessonTitleArabic,
  });
  const geoMatch =
    diagramAllowed && diagCombined
      ? matchGeometryWithDiagnostics({ geometryTag: params.diagramDesc || undefined, problemPrompt: params.promptText }, params.branchId)
      : undefined;
  const graphSpec = diagramAllowed && params.diagramDesc ? (parseCartesianGraphDescription(params.diagramDesc) ?? undefined) : undefined;
  return { geometryFigure: geoMatch?.figure, graphSpec };
}
