/**
 * @file geometry-figure-verification-orchestrator.ts
 * @description ينسّق قواعد التحقق ويُنتج تقريراً واحداً لأي شكل (IR) قبل إدراجه في المذكرة.
 */
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import type { FigureVerificationReport } from "./verification-report-types-ssot";
import { verifySegmentLengthScaleRule } from "./verify-segment-length-scale-rule";
import { verifyAngleDegreesRule } from "./verify-angle-degrees-rule";
import { verifyTickAndParallelMarksRule } from "./verify-tick-and-parallel-marks-rule";
import { verifyStructuralAndVisualQualityRule } from "./verify-structural-and-visual-quality-rule";

export const MODULE_ID_GEOMETRY_FIGURE_VERIFICATION_ORCHESTRATOR = "geometry_figure_verification_orchestrator" as const;

export function verifyGeometryFigure(fig: CanonicalGeometryFigureIR): FigureVerificationReport {
  const issues = [
    ...verifyStructuralAndVisualQualityRule(fig),
    ...verifyAngleDegreesRule(fig),
    ...verifySegmentLengthScaleRule(fig),
    ...verifyTickAndParallelMarksRule(fig),
  ];
  return { figureId: fig.figureId, passed: !issues.some((i) => i.severity === "error"), issues };
}
