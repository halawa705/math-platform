/**
 * @file levenberg-marquardt-residual-minimizer.ts
 * @description مُصغِّر عددي عام لمجموع مربعات المتبقيات (Levenberg–Marquardt) بمشتقات عددية.
 */
import { solveDenseLinearSystem } from "./dense-normal-equations-solver";

export const MODULE_ID_LEVENBERG_MARQUARDT_RESIDUAL_MINIMIZER = "levenberg_marquardt_residual_minimizer" as const;

export type ResidualFunction = (x: readonly number[]) => number[];

const sumSq = (r: readonly number[]) => r.reduce((s, v) => s + v * v, 0);

export function minimizeResiduals(fn: ResidualFunction, x0: readonly number[], maxIterations = 120, step = 1e-6): { x: number[]; cost: number } {
  let x = [...x0];
  let r = fn(x);
  let cost = sumSq(r);
  let lambda = 1e-3;
  const n = x.length;
  for (let iter = 0; iter < maxIterations && cost > 1e-16; iter++) {
    const J: number[][] = r.map(() => new Array<number>(n).fill(0));
    for (let j = 0; j < n; j++) {
      const xp = [...x]; xp[j] += step;
      const rp = fn(xp);
      for (let i = 0; i < r.length; i++) J[i][j] = (rp[i] - r[i]) / step;
    }
    const JtJ = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => J.reduce((s, row) => s + row[a] * row[b], 0)));
    const g = Array.from({ length: n }, (_, a) => -J.reduce((s, row, i) => s + row[a] * r[i], 0));
    let improved = false;
    for (let tries = 0; tries < 8 && !improved; tries++) {
      const damped = JtJ.map((row, a) => row.map((v, b) => (a === b ? v + lambda * (v + 1e-9) : v)));
      const d = solveDenseLinearSystem(damped, g);
      if (d) {
        const xn = x.map((v, k) => v + d[k]);
        const rn = fn(xn); const cn = sumSq(rn);
        if (Number.isFinite(cn) && cn < cost) { x = xn; r = rn; improved = cost - cn > 1e-18; cost = cn; lambda = Math.max(lambda / 3, 1e-9); if (!improved) return { x, cost }; continue; }
      }
      lambda *= 4;
    }
    if (!improved) break;
  }
  return { x, cost };
}
