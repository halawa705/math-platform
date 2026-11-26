/**
 * @file editorial-group-solution-splitter.ts
 * @description مولد بدائل تقسيم الحلول لأزواج وصفوف الأمثلة المحلولة في القالب المدرسي الحديث
 * (`editorial_question_group`) على حدود الصفحة، لرفع نسبة إشغال الصفحات فوق 90% دون ترحيل الكتلة كاملة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 115 سطراً).
 */

import type { FlowItem } from "./flow-item-model";
import type { SolutionSplitVariant } from "./flow-solution-split-variants-builder";

export const MODULE_ID_EDITORIAL_GROUP_SOLUTION_SPLITTER =
  "editorial_group_solution_splitter" as const;

type EditorialGroupFlowItem = Extract<FlowItem, { readonly kind: "editorial_question_group" }>;

function extractSlotSteps(slot: EditorialGroupFlowItem["slots"][number]): readonly string[] {
  if (slot.question.solutionStepsAr && slot.question.solutionStepsAr.length > 0) {
    return slot.question.solutionStepsAr;
  }
  if (slot.question.modelAnswerAr && slot.question.modelAnswerAr.trim().length > 0) {
    return [slot.question.modelAnswerAr];
  }
  return [];
}

export function buildEditorialGroupSplitVariants(
  item: EditorialGroupFlowItem
): readonly SolutionSplitVariant[] {
  if (item.isContinuationTail) return [];
  if (!item.slots.some((s) => s.isSolved)) return [];

  const slotStepsList = item.slots.map(extractSlotSteps);
  const maxSteps = Math.max(...slotStepsList.map((steps) => steps.length));
  if (maxSteps < 2) return [];

  const variants: SolutionSplitVariant[] = [];
  for (let k = 1; k < maxSteps; k++) {
    const headSlots = item.slots.map((slot, idx) => ({
      ...slot,
      question: {
        ...slot.question,
        solutionStepsAr: slotStepsList[idx].slice(0, k),
        modelAnswerAr: "",
      },
    }));
    const tailSlots = item.slots.map((slot, idx) => ({
      ...slot,
      question: {
        ...slot.question,
        solutionStepsAr: slotStepsList[idx].slice(k),
        modelAnswerAr: "",
      },
    }));
    variants.push({
      k,
      head: {
        ...item,
        id: `${item.id}~head${k}`,
        slots: headSlots,
        isContinuationTail: false,
      },
      tail: {
        ...item,
        id: `${item.id}~tail${k}`,
        slots: tailSlots,
        isContinuationTail: true,
      },
    });
  }
  return variants;
}
