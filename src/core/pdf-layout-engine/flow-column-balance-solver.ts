/**
 * @file flow-column-balance-solver.ts
 * @description موازن الأعمدة: لمجموعة كائنات متتابعة (بترتيب القراءة) يختار نقطة الفصل بين العمود الأيمن والأيسر التي
 * تقلل ارتفاع المجموعة (أي تجعل العمودين متساويين قدر الإمكان) مع حفظ ترتيب الأسئلة: الأيمن أولاً ثم الأيسر.
 */

export const MODULE_ID_FLOW_COLUMN_BALANCE_SOLVER = "flow_column_balance_solver" as const;

export interface BalancedColumnSplit {
  /** عدد الكائنات في العمود الأيمن (الباقي في الأيسر). */
  readonly rightCount: number;
  readonly heightPx: number;
}

export function stackHeightPx(heights: readonly number[], gapPx: number): number {
  if (heights.length === 0) return 0;
  return heights.reduce((sum, h) => sum + h, 0) + gapPx * (heights.length - 1);
}

export function solveBalancedColumnSplit(
  heights: readonly number[],
  gapPx: number
): BalancedColumnSplit {
  const count = heights.length;
  let best: BalancedColumnSplit = { rightCount: count, heightPx: stackHeightPx(heights, gapPx) };
  for (let k = count - 1; k >= 0; k--) {
    const tallest = Math.max(
      stackHeightPx(heights.slice(0, k), gapPx),
      stackHeightPx(heights.slice(k), gapPx)
    );
    if (tallest < best.heightPx - 0.5) best = { rightCount: k, heightPx: tallest };
  }
  return best;
}
