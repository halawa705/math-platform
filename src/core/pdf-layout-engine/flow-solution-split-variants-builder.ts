/**
 * @file flow-solution-split-variants-builder.ts
 * @description يولّد نسخ «تقسيم الحل» الممكنة للأمثلة المحلولة: لكل مثال بخطوات ≥ 3 ولكل k (2 ≤ k < عدد الخطوات)
 * نسخة رأس (السؤال + أول k خطوة) ونسخة ذيل (بقية الخطوات). الخطوة كائن واحد لا يُجزَّأ أبداً.
 * تُقاس هذه النسخ حياً في منصة القياس الخفية ويستعملها فاصل الصفحات لملء فراغ آخر الصفحة.
 */

import type { FlowItem } from "./flow-item-model";

export const MODULE_ID_FLOW_SOLUTION_SPLIT_VARIANTS_BUILDER = "flow_solution_split_variants_builder" as const;

/** أقل عدد خطوات يبقى في الصفحة الأولى من البطاقة المقسومة. */
export const MIN_HEAD_STEPS = 2;

export interface SolutionSplitVariant {
  readonly k: number;
  readonly head: FlowItem;
  readonly tail: FlowItem;
}

type QuestionFlowItem = Extract<FlowItem, { readonly kind: "question" }>;

/** المثال المحلول الكامل فقط (حلّه ظاهر دائماً) وبلا فقرة «حاول بنفسك» الملتصقة به. */
function isSplittableSolvedExample(item: FlowItem): item is QuestionFlowItem {
  if (item.kind !== "question" || item.solutionSlice) return false;
  const q = item.question;
  if (!q.id.startsWith("booklet-s1-") || q.id.includes("-drill-")) return false;
  if (q.studentDrillPromptAr) return false;
  return (q.solutionStepsAr?.length ?? 0) >= MIN_HEAD_STEPS + 1;
}

export function buildSolutionSplitVariants(
  items: readonly FlowItem[]
): ReadonlyMap<string, readonly SolutionSplitVariant[]> {
  const result = new Map<string, readonly SolutionSplitVariant[]>();
  for (const item of items) {
    if (!isSplittableSolvedExample(item)) continue;
    const total = item.question.solutionStepsAr!.length;
    const variants: SolutionSplitVariant[] = [];
    for (let k = MIN_HEAD_STEPS; k < total; k++) {
      variants.push({
        k,
        head: { ...item, id: `${item.id}~head${k}`, span: item.span, solutionSlice: { from: 0, to: k, total } },
        tail: { ...item, id: `${item.id}~tail${k}`, span: item.span, solutionSlice: { from: k, to: total, total } },
      });
    }
    if (variants.length > 0) result.set(item.id, variants);
  }
  return result;
}
