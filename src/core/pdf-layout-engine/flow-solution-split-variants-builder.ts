/**
 * @file flow-solution-split-variants-builder.ts
 * @description يولّد نسخ «تقسيم الحل» الممكنة للأمثلة المحلولة: لكل مثال بخطوات ≥ 3 ولكل k (2 ≤ k < عدد الخطوات)
 * نسخة رأس (السؤال + أول k خطوة) ونسخة ذيل (بقية الخطوات). الخطوة كائن واحد لا يُجزَّأ أبداً.
 * تُقاس هذه النسخ حياً في منصة القياس الخفية ويستعملها فاصل الصفحات لملء فراغ آخر الصفحة.
 */

import type { FlowItem } from "./flow-item-model";

export const MODULE_ID_FLOW_SOLUTION_SPLIT_VARIANTS_BUILDER = "flow_solution_split_variants_builder" as const;

/** أقل عدد خطوات قياسي يبقى في الصفحة الأولى من البطاقة المقسومة (مع السماح بـ 1 للمسائل ذات الخطوتين فقط). */
export const MIN_HEAD_STEPS = 2;

export interface SolutionSplitVariant {
  readonly k: number;
  readonly head: FlowItem;
  readonly tail: FlowItem;
}

type QuestionFlowItem = Extract<FlowItem, { readonly kind: "question" }>;

/** أي مثال محلول أو بطاقة إجابة خطواتها ظاهرة قابلة للتقسيم النظيف بين صفحتين دون تجزئة الخطوة. */
function isSplittableSolvedExample(item: FlowItem): item is QuestionFlowItem {
  if (item.kind !== "question" || item.solutionSlice) return false;
  if (item.forceHideSolution) return false;
  const q = item.question;
  const isWorked =
    Boolean(q.isWorkedExample) ||
    Boolean(item.isAnswerCard) ||
    q.id.startsWith("ws-concept-") ||
    (q.id.startsWith("booklet-s1-") && !q.id.includes("-drill-"));
  if (!isWorked) return false;
  return (q.solutionStepsAr?.length ?? 0) >= 2;
}

export function buildSolutionSplitVariants(
  items: readonly FlowItem[]
): ReadonlyMap<string, readonly SolutionSplitVariant[]> {
  const result = new Map<string, readonly SolutionSplitVariant[]>();
  for (const item of items) {
    if (!isSplittableSolvedExample(item)) continue;
    const total = item.question.solutionStepsAr!.length;
    const startK = total >= MIN_HEAD_STEPS + 1 ? MIN_HEAD_STEPS : 1;
    const variants: SolutionSplitVariant[] = [];
    for (let k = startK; k < total; k++) {
      variants.push({
        k,
        head: { ...item, id: `${item.id}~head${k}`, span: "full", solutionSlice: { from: 0, to: k, total } },
        tail: { ...item, id: `${item.id}~tail${k}`, span: "full", solutionSlice: { from: k, to: total, total } },
      });
    }
    if (variants.length > 0) result.set(item.id, variants);
  }
  return result;
}
