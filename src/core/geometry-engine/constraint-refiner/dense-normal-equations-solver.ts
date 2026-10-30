/**
 * @file dense-normal-equations-solver.ts
 * @description حلّ جملة خطية صغيرة A·x = b بالحذف الغاوسي مع المحور الجزئي (للمصفوفات الكثيفة الصغيرة فقط).
 */
export const MODULE_ID_DENSE_NORMAL_EQUATIONS_SOLVER = "dense_normal_equations_solver" as const;

/** تعيد null عند تفرّد المصفوفة. تعدّل نسخاً داخلية ولا تغيّر المدخلات. */
export function solveDenseLinearSystem(a: readonly (readonly number[])[], b: readonly number[]): number[] | null {
  const n = b.length;
  const m = a.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) piv = r;
    if (Math.abs(m[piv][col]) < 1e-14) return null;
    [m[col], m[piv]] = [m[piv], m[col]];
    for (let r = col + 1; r < n; r++) {
      const f = m[r][col] / m[col][col];
      for (let c = col; c <= n; c++) m[r][c] -= f * m[col][c];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = m[r][n];
    for (let c = r + 1; c < n; c++) s -= m[r][c] * x[c];
    x[r] = s / m[r][r];
  }
  return x;
}
