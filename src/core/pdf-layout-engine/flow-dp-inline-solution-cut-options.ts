/**
 * @file flow-dp-inline-solution-cut-options.ts
 * @description خيارات «القطع داخل الحل» التي يراها فاصل الصفحات كحدود صفحة بديلة عادية (لا مرحلة ترقيع لاحقة):
 * عند الكائن رقم i يمكن إنهاء الصفحة برأس المثال (السؤال + أول k خطوة، k ≥ 0) وبدء الصفحة التالية بذيله،
 * أو — إن كان i و i+1 زوج أمثلة متجاورين — إنهاؤها برأسَي المثالين معاً وبدء التالية بذيليهما.
 * لا قيود اختيار هنا: كل الخيارات المقاسة تُعرض، ودالة التكلفة وحدها تقرر.
 */

import type { FlowItem } from "./flow-item-model";
import { buildSolutionSplitVariants, type SolutionSplitVariant } from "./flow-solution-split-variants-builder";

export const MODULE_ID_FLOW_DP_INLINE_SOLUTION_CUT_OPTIONS = "flow_dp_inline_solution_cut_options" as const;

export interface InlineSolutionCutOption {
  /** عدد الكائنات الأصلية التي يستهلكها القطع (1 = مثال منفرد، 2 = زوج). */
  readonly consumed: 1 | 2;
  readonly heads: readonly FlowItem[];
  readonly tails: readonly FlowItem[];
  /** مفتاح فريد للذيول المرحَّلة للصفحة التالية. */
  readonly carryKey: string;
  /** عدد الخطوات في كل ذيل (لتكلفة الأرملة). */
  readonly tailStepCounts: readonly number[];
}

export type InlineSolutionCutLookup = (index: number) => readonly InlineSolutionCutOption[];

function withSpan(item: FlowItem, span: "full" | "column", heights: ReadonlyMap<string, number>): FlowItem | undefined {
  if (item.kind !== "question") return undefined;
  const id = span === "column" ? `${item.id}::col` : item.id;
  if (!heights.has(id)) return undefined;
  return { ...item, id, span };
}

function isWorkedPair(a: FlowItem | undefined, b: FlowItem | undefined): boolean {
  return (
    a?.kind === "question" && b?.kind === "question" &&
    a.span === "column" && b.span === "column" &&
    Boolean(a.isWorkedExample) && Boolean(b.isWorkedExample) &&
    a.ideaIndex !== undefined && a.ideaIndex === b.ideaIndex
  );
}

function stepsOf(v: SolutionSplitVariant): number {
  return v.tail.kind === "question" && v.tail.solutionSlice ? v.tail.solutionSlice.to - v.tail.solutionSlice.from : 0;
}

function singleOptions(item: FlowItem, variants: readonly SolutionSplitVariant[], heights: ReadonlyMap<string, number>): InlineSolutionCutOption[] {
  const spans: readonly ("full" | "column")[] = item.span === "column" ? ["column", "full"] : ["full"];
  const out: InlineSolutionCutOption[] = [];
  for (const span of spans) {
    for (const v of variants) {
      const head = withSpan(v.head, span, heights);
      const tail = withSpan(v.tail, span, heights);
      if (!head || !tail) continue;
      out.push({ consumed: 1, heads: [head], tails: [tail], carryKey: tail.id, tailStepCounts: [stepsOf(v)] });
    }
  }
  return out;
}

function pairOptions(
  v1s: readonly SolutionSplitVariant[],
  v2s: readonly SolutionSplitVariant[],
  heights: ReadonlyMap<string, number>
): InlineSolutionCutOption[] {
  const out: InlineSolutionCutOption[] = [];
  for (const v1 of v1s) {
    const h1 = withSpan(v1.head, "column", heights);
    const t1 = withSpan(v1.tail, "column", heights);
    if (!h1 || !t1) continue;
    for (const v2 of v2s) {
      const h2 = withSpan(v2.head, "column", heights);
      const t2 = withSpan(v2.tail, "column", heights);
      if (!h2 || !t2) continue;
      out.push({ consumed: 2, heads: [h1, h2], tails: [t1, t2], carryKey: `${t1.id}+${t2.id}`, tailStepCounts: [stepsOf(v1), stepsOf(v2)] });
    }
  }
  return out;
}

/** يبني دالة بحث (مخزّنة) تعيد خيارات القطع عند كل فهرس. */
export function buildInlineSolutionCutLookup(
  items: readonly FlowItem[],
  heights: ReadonlyMap<string, number>
): InlineSolutionCutLookup {
  const variantsById = buildSolutionSplitVariants(items);
  const cache = new Map<number, readonly InlineSolutionCutOption[]>();
  return (index) => {
    const cached = cache.get(index);
    if (cached) return cached;
    const item = items[index];
    const variants = item ? variantsById.get(item.id) : undefined;
    let options: InlineSolutionCutOption[] = [];
    if (item && variants) {
      options = singleOptions(item, variants, heights);
      const sibling = items[index + 1];
      const siblingVariants = sibling ? variantsById.get(sibling.id) : undefined;
      if (siblingVariants && isWorkedPair(item, sibling)) options.push(...pairOptions(variants, siblingVariants, heights));
    }
    cache.set(index, options);
    return options;
  };
}
