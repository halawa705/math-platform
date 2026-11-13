/**
 * @file geometry-figure-constraint-refiner.ts
 * @description يصقل إحداثيات أي شكل (IR) ليطابق معطياته (زوايا/أطوال/تساوٍ/توازٍ) مع الحفاظ على تخطيطه الجمالي،
 * ولا يعتمد النتيجة إلا إذا قلّت أخطاء التحقق. وإلا يُعاد الشكل الأصلي.
 */
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import { buildFigureResidualFunction } from "./figure-constraint-residual-builder";
import { inferFigureInvariants } from "./figure-invariant-inference-helper";
import { measureAngleDegrees } from "../verification/figure-vector-measure-helpers";
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

/** يولّد بذور بداية متعددة (Multi-Start Seeds) حول التخطيط الأولي لكسر النهايات المحلية في التقييدات الزاوية/الطولية. */
function buildMultiStartSeeds(x0: readonly number[]): number[][] {
  const n = x0.length;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < n; i += 2) {
    xs.push(x0[i]);
    ys.push(x0[i + 1]);
  }
  const cx = xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);
  const cy = ys.reduce((a, b) => a + b, 0) / Math.max(ys.length, 1);
  const span = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 10;

  const seed1 = x0.map((v, k) => {
    const isX = k % 2 === 0;
    const idx = Math.floor(k / 2);
    const offset = ((idx * 7 + (isX ? 1 : 3)) % 5 - 2) * 0.06 * span;
    return isX ? cx + (v - cx) * 1.12 + offset : cy + (v - cy) * 0.88 + offset;
  });

  const seed2 = x0.map((v, k) => {
    const isX = k % 2 === 0;
    const idx = Math.floor(k / 2);
    const offset = ((idx * 11 + (isX ? 2 : 1)) % 5 - 2) * -0.07 * span;
    return isX ? cx + (v - cx) * 0.88 + offset : cy + (v - cy) * 1.15 + offset;
  });

  const seed3 = x0.map((v, k) => {
    const isX = k % 2 === 0;
    const dx = x0[2 * Math.floor(k / 2)] - cx;
    const dy = x0[2 * Math.floor(k / 2) + 1] - cy;
    const ang = 0.18; // ~10 degrees rotation + shear
    return isX
      ? cx + dx * Math.cos(ang) - dy * Math.sin(ang)
      : cy + dx * Math.sin(ang) + dy * Math.cos(ang);
  });

  return [[...x0], seed1, seed2, seed3];
}

export function refineFigureToMatchGivens(fig: CanonicalGeometryFigureIR): RefinedFigureResult {
  const before = verifyGeometryFigure(fig);
  if (before.issues.length === 0 || fig.vertices.length === 0) return { figure: fig, report: before, refined: false };
  const { fn, x0 } = buildFigureResidualFunction(fig);
  const { straightExtensions } = inferFigureInvariants(fig);
  const keepsExtensionsStraight = (cand: CanonicalGeometryFigureIR): boolean =>
    straightExtensions
      .filter((ext) => ext.isDashed)
      .every(({ vertices: [end1, mid, end2] }) =>
        measureAngleDegrees(cand.vertices[mid].position, cand.vertices[end1].position, cand.vertices[end2].position) >= 178.5
      );
  const seeds = buildMultiStartSeeds(x0);

  let bestFigure = fig;
  let bestReport = before;
  let bestCost = Infinity;
  let refined = false;

  for (const seed of seeds) {
    const { x, cost } = minimizeResiduals(fn, seed);
    const candidate: CanonicalGeometryFigureIR = {
      ...fig,
      vertices: fig.vertices.map((v, i) => ({ ...v, position: { x: x[2 * i], y: x[2 * i + 1] } })),
    };
    if (!keepsExtensionsStraight(candidate)) continue;
    const report = verifyGeometryFigure(candidate);
    const candidateErrs = errorCount(report);
    const bestErrs = errorCount(bestReport);
    const isBetter =
      candidateErrs < bestErrs ||
      (candidateErrs === bestErrs && report.issues.length < bestReport.issues.length) ||
      (candidateErrs === bestErrs && report.issues.length === bestReport.issues.length && cost < bestCost);

    if (isBetter) {
      bestFigure = candidate;
      bestReport = report;
      bestCost = cost;
      refined = true;
    }
    if (candidateErrs === 0 && report.issues.length === 0) {
      break;
    }
  }

  return refined ? { figure: bestFigure, report: bestReport, refined: true } : { figure: fig, report: before, refined: false };
}
