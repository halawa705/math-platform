/**
 * @file geometry-figure-constraint-refiner.ts
 * @description يصقل إحداثيات أي شكل (IR) ليطابق معطياته (زوايا/أطوال/تساوٍ/توازٍ) مع الحفاظ على تخطيطه الجمالي،
 * ولا يعتمد النتيجة إلا إذا قلّت أخطاء التحقق. وإلا يُعاد الشكل الأصلي.
 */
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import { buildFigureResidualFunction } from "./figure-constraint-residual-builder";
import { minimizeResiduals } from "./levenberg-marquardt-residual-minimizer";
import { verifyGeometryFigure } from "../verification/geometry-figure-verification-orchestrator";
import type { FigureVerificationReport } from "../verification/verification-report-types-ssot";

export const MODULE_ID_GEOMETRY_FIGURE_CONSTRAINT_REFINER = "geometry_figure_constraint_refiner" as const;

export interface RefinedFigureResult {
  readonly figure: CanonicalGeometryFigureIR;
  readonly report: FigureVerificationReport;
  readonly refined: boolean;
}

const errorCount = (r: FigureVerificationReport) => r.issues.filter((i) => i.severity === "error").length;

export function refineFigureToMatchGivens(fig: CanonicalGeometryFigureIR): RefinedFigureResult {
  const before = verifyGeometryFigure(fig);
  if (before.issues.length === 0 || fig.vertices.length === 0) return { figure: fig, report: before, refined: false };
  const { fn, x0 } = buildFigureResidualFunction(fig);
  const { x } = minimizeResiduals(fn, x0);
  const candidate: CanonicalGeometryFigureIR = {
    ...fig,
    vertices: fig.vertices.map((v, i) => ({ ...v, position: { x: x[2 * i], y: x[2 * i + 1] } })),
  };
  const after = verifyGeometryFigure(candidate);
  const better = errorCount(after) < errorCount(before) || (errorCount(after) === errorCount(before) && after.issues.length < before.issues.length);
  return better ? { figure: candidate, report: after, refined: true } : { figure: fig, report: before, refined: false };
}
