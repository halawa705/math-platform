/**
 * @file geometry-figure-constraint-refiner.ts
 * @description يصقل إحداثيات أي شكل (IR) ليطابق معطياته (زوايا/أطوال/تساوٍ/توازٍ) مع الحفاظ على تخطيطه الجمالي،
 * ولا يعتمد النتيجة إلا إذا قلّت أخطاء التحقق. وإلا يُعاد الشكل الأصلي.
 */
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import { buildFigureResidualFunction } from "./figure-constraint-residual-builder";
import { inferFigureInvariants } from "./figure-invariant-inference-helper";
import { measureAngleDegrees, median, parseNumericLabel } from "../verification/figure-vector-measure-helpers";
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
  const idxMap = new Map(fig.vertices.map((v, i) => [v.id, i] as const));
  const hasAnyLengthLabel = fig.segments.some((s) => parseNumericLabel(s.lengthLabel?.value) !== null);
  const origSegLengths = fig.segments.map((s) => {
    const a = idxMap.get(s.fromVertexId); const b = idxMap.get(s.toVertexId);
    if (a === undefined || b === undefined) return null;
    const len = Math.hypot(fig.vertices[b].position.x - fig.vertices[a].position.x, fig.vertices[b].position.y - fig.vertices[a].position.y);
    return len > 1e-4 ? { a, b, len } : null;
  }).filter((e): e is { a: number; b: number; len: number } => e !== null);

  const preservesEdgeScale = (cand: CanonicalGeometryFigureIR): boolean => {
    if (hasAnyLengthLabel || origSegLengths.length === 0) return true;
    const ratios = origSegLengths.map(({ a, b, len }) =>
      Math.hypot(cand.vertices[b].position.x - cand.vertices[a].position.x, cand.vertices[b].position.y - cand.vertices[a].position.y) / len
    );
    const refRatio = median(ratios) || 1;
    return ratios.every((r) => r / refRatio >= 0.42 && r / refRatio <= 2.4);
  };

  const keepsExtensionsStraight = (cand: CanonicalGeometryFigureIR, requireSolid: boolean): boolean =>
    straightExtensions
      .filter((ext) => requireSolid || ext.isDashed)
      .every(({ vertices: [end1, mid, end2] }) =>
        measureAngleDegrees(cand.vertices[mid].position, cand.vertices[end1].position, cand.vertices[end2].position) >= 178.5
      );

  const seeds = buildMultiStartSeeds(x0);
  const minimized = seeds.map((seed) => minimizeResiduals(fn, seed));

  let bestFigure = fig;
  let bestReport = before;
  let bestCost = Infinity;
  let refined = false;

  const tryPass = (requireSolid: boolean) => {
    for (const { x, cost } of minimized) {
      const candidate: CanonicalGeometryFigureIR = {
        ...fig,
        vertices: fig.vertices.map((v, i) => ({ ...v, position: { x: x[2 * i], y: x[2 * i + 1] } })),
      };
      if (!keepsExtensionsStraight(candidate, requireSolid) || !preservesEdgeScale(candidate)) continue;
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
      if (candidateErrs === 0 && report.issues.length === 0) break;
    }
  };

  tryPass(true);
  if (!refined) tryPass(false);

  return refined ? { figure: bestFigure, report: bestReport, refined: true } : { figure: fig, report: before, refined: false };
}
