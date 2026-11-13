/**
 * @file flow-practice-items-reorder-search.ts
 * @description بحث ترتيب أفضل لتمارين التدريب داخل نفس الفكرة فقط (لا الأمثلة المحلولة ولا الكبسولات ولا أسئلة MCQ المدمجة):
 * يجرّب ترتيبات (الأصلي / الأقصر أولاً / الأطول أولاً / تبادل طويل-قصير) ويختار ما يعطي أقل عدد صفحات ثم أعلى امتلاء خام.
 * يعيد ترقيم التمارين المُعاد ترتيبها تسلسلياً (وبطاقات إجاباتها) كي تبقى الأرقام متتابعة في الصفحة والإجابات معاً.
 * لا يغيّر الترتيب إلا عند تحسّن حقيقي، وإلا يُعاد الترتيب الأصلي كما هو.
 */

import { auditFlowPages } from "./flow-layout-quality-audit";
import type { FlowItem, FlowPage } from "./flow-item-model";
import { packFlowItemsIntoPages, type FlowPackOptions } from "./flow-page-packer";

export const MODULE_ID_FLOW_PRACTICE_ITEMS_REORDER_SEARCH = "flow_practice_items_reorder_search" as const;

const MIN_MEAN_FILL_GAIN = 0.01;

type QuestionFlowItem = Extract<FlowItem, { kind: "question" }>;
type OrderStrategy = (sorted: readonly QuestionFlowItem[], heightOf: (i: QuestionFlowItem) => number) => QuestionFlowItem[];

function isReorderablePractice(item: FlowItem): item is QuestionFlowItem {
  return (
    item.kind === "question" &&
    item.span === "column" &&
    !item.isWorkedExample &&
    !item.isAnswerCard &&
    !item.solutionSlice &&
    item.ideaIndex !== undefined
  );
}

const STRATEGIES: readonly OrderStrategy[] = [
  (items, h) => items.slice().sort((a, b) => h(a) - h(b)),
  (items, h) => items.slice().sort((a, b) => h(b) - h(a)),
  (items, h) => {
    const asc = items.slice().sort((a, b) => h(a) - h(b));
    const out: QuestionFlowItem[] = [];
    while (asc.length > 0) {
      out.push(asc.pop()!);
      if (asc.length > 0) out.push(asc.shift()!);
    }
    return out;
  },
];

function buildVariant(
  items: readonly FlowItem[],
  heights: ReadonlyMap<string, number>,
  strategy: OrderStrategy
): readonly FlowItem[] {
  const heightOf = (i: QuestionFlowItem) => heights.get(i.id) ?? 0;
  const slotsByIdea = new Map<number, number[]>();
  items.forEach((item, idx) => {
    if (!isReorderablePractice(item)) return;
    const list = slotsByIdea.get(item.ideaIndex!) ?? [];
    list.push(idx);
    slotsByIdea.set(item.ideaIndex!, list);
  });

  const next = items.slice();
  const newNumberById = new Map<string, number>();
  for (const slots of slotsByIdea.values()) {
    if (slots.length < 2) continue;
    const original = slots.map((s) => items[s] as QuestionFlowItem);
    const numbers = original.map((o) => o.question.questionNumber);
    const reordered = strategy(original, heightOf);
    reordered.forEach((item, pos) => {
      const questionNumber = numbers[pos];
      newNumberById.set(item.question.id, questionNumber);
      next[slots[pos]] = { ...item, question: { ...item.question, questionNumber } };
    });
  }
  if (newNumberById.size === 0) return items;

  const answerSlots: number[] = [];
  next.forEach((item, idx) => {
    if (item.kind === "question" && item.isAnswerCard && newNumberById.has(item.question.id)) answerSlots.push(idx);
  });
  const renumberedAnswers = answerSlots
    .map((s) => {
      const item = next[s] as QuestionFlowItem;
      return { ...item, question: { ...item.question, questionNumber: newNumberById.get(item.question.id)! } };
    })
    .sort((a, b) => a.question.questionNumber - b.question.questionNumber);
  answerSlots.forEach((slot, pos) => { next[slot] = renumberedAnswers[pos]; });
  return next;
}

function scorePages(pages: readonly FlowPage[], heights: ReadonlyMap<string, number>): { pages: number; meanFill: number } {
  const rows = auditFlowPages(pages, heights).slice(0, -1);
  const meanFill = rows.length === 0 ? 1 : rows.reduce((sum, r) => sum + Math.min(1, r.rawFillRatio), 0) / rows.length;
  return { pages: pages.length, meanFill };
}

export function packFlowItemsWithBestPracticeOrder(
  items: readonly FlowItem[],
  heights: ReadonlyMap<string, number>,
  options: FlowPackOptions
): readonly FlowPage[] {
  const basePages = packFlowItemsIntoPages(items, heights, options);
  if (!items.some(isReorderablePractice)) return basePages;

  let bestPages = basePages;
  let best = scorePages(basePages, heights);
  for (const strategy of STRATEGIES) {
    const variant = buildVariant(items, heights, strategy);
    if (variant === items) continue;
    const pages = packFlowItemsIntoPages(variant, heights, options);
    const score = scorePages(pages, heights);
    const better = score.pages < best.pages || (score.pages === best.pages && score.meanFill > best.meanFill + MIN_MEAN_FILL_GAIN);
    if (better && !pages.some((p) => p.overflowsBudget)) {
      bestPages = pages;
      best = score;
    }
  }
  return bestPages;
}
