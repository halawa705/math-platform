/**
 * @file flow-items-builder.ts
 * @description يحوّل أسئلة المذكرة إلى كائنات تدفق مرنة: لكل فكرة كبسولة (فكرة+قاعدة) بعرض كامل، ثم أمثلتها المحلولة
 * ثم تدريباتها كأسئلة بعرض العمود (أو الكامل إن كان التخطيط عموداً واحداً)، ثم فاصل نهاية الفكرة، وفي الأخير جدول
 * الإجابات واعتماد المستند.
 */

import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import type { FlowItem } from "./flow-item-model";

export const MODULE_ID_FLOW_ITEMS_BUILDER = "flow_items_builder" as const;

interface IdeaGroup {
  readonly anchorQuestion?: PrintableMathQuestionItem;
  readonly items: PrintableMathQuestionItem[];
}

function groupQuestionsByIdea(questions: readonly PrintableMathQuestionItem[]): IdeaGroup[] {
  const groups: IdeaGroup[] = [];
  for (const q of questions) {
    const hasCapsule = Boolean(q.ideaBannerTitleAr || q.conceptExplanationAr || q.framedRuleAr);
    if (hasCapsule || groups.length === 0) {
      groups.push({ anchorQuestion: hasCapsule ? q : undefined, items: [q] });
    } else {
      groups[groups.length - 1].items.push(q);
    }
  }
  return groups;
}

function isSolvedExample(q: PrintableMathQuestionItem): boolean {
  return q.id.startsWith("booklet-s1-") && !q.id.includes("-drill-");
}

export function buildFlowItems(params: {
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly columnsCount: 1 | 2;
  readonly includeAnswerKey: boolean;
}): { readonly items: readonly FlowItem[]; readonly totalIdeasCount: number } {
  const { questions, columnsCount, includeAnswerKey } = params;
  const questionSpan = columnsCount === 2 ? "column" : "full";
  const groups = groupQuestionsByIdea(questions);
  const items: FlowItem[] = [];

  groups.forEach((group, groupIndex) => {
    const ideaIndex = groupIndex + 1;
    if (group.anchorQuestion) {
      items.push({
        id: `flow-capsule-${ideaIndex}`,
        kind: "idea_capsule",
        span: "full",
        anchorQuestion: group.anchorQuestion,
        ideaIndex,
      });
    }

    const ordered = [
      ...group.items.filter(isSolvedExample),
      ...group.items.filter((q) => !isSolvedExample(q)),
    ];
    for (const question of ordered) {
      items.push({ id: `flow-q-${ideaIndex}-${question.id}`, kind: "question", span: questionSpan, question });
    }

    const isHomework = /الواجب\s*المنزلي|ثانياً/.test(group.anchorQuestion?.ideaBannerTitleAr || "");
    if (group.anchorQuestion && !isHomework) {
      items.push({ id: `flow-divider-${ideaIndex}`, kind: "idea_divider", span: "full", ideaIndex });
    }
  });

  if (includeAnswerKey && questions.some((q) => q.kind === "mcq" && q.correctMcqIndex !== undefined)) {
    items.push({ id: "flow-mcq-answer-key", kind: "mcq_answer_key", span: "full" });
  }
  items.push({ id: "flow-accreditation-footer", kind: "accreditation_footer", span: "full" });

  return { items, totalIdeasCount: groups.length };
}
