/**
 * @file flow-items-builder.ts
 * @description يحوّل أسئلة المذكرة إلى كائنات تدفق مرنة: لكل فكرة كبسولة (فكرة+قاعدة) بعرض كامل، ثم أمثلتها المحلولة
 * ثم تدريباتها كأسئلة بعرض العمود (أو الكامل إن كان التخطيط عموداً واحداً)، ثم فاصل «نهاية الفكرة» للأفكار فقط
 * (لا للواجب المنزلي ولا لأقسام المراجعة)، وفي الأخير جدول الإجابات واعتماد المستند.
 */

import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import type { PrintPaperTemplateId } from "../ssot/pdf-print-settings-ssot";
import { resolveFlowBannerKind } from "./flow-banner-kind-resolver";
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

function isMcqQuestion(q: PrintableMathQuestionItem): boolean {
  return q.kind === "mcq" || (Array.isArray(q.mcqChoicesAr) && q.mcqChoicesAr.length >= 2);
}

export function buildFlowItems(params: {
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly columnsCount: 1 | 2;
  readonly includeAnswerKey: boolean;
  readonly includeAccreditation?: boolean;
  readonly paperTemplateId?: PrintPaperTemplateId;
}): { readonly items: readonly FlowItem[]; readonly totalIdeasCount: number } {
  const { questions, columnsCount, includeAnswerKey, includeAccreditation = true, paperTemplateId } = params;
  const questionSpan = columnsCount === 2 ? "column" : "full";

  if (paperTemplateId === "official_school_exam") {
    const mcqs = questions.filter(isMcqQuestion);
    const nonMcqs = questions.filter((q) => !isMcqQuestion(q));
    const items: FlowItem[] = [];
    let secIdx = 0;

    if (mcqs.length > 0) {
      secIdx++;
      items.push({
        id: "flow-exam-sec-mcq",
        kind: "exam_section_banner",
        span: "full",
        sectionOrdinalArabic: "الأول",
        sectionTitleArabic: "اختر الإجابة الصحيحة من بين القوسين :",
        questionsCount: mcqs.length,
      });
      mcqs.forEach((q, idx) => {
        items.push({
          id: `flow-exam-q-mcq-${q.id || idx + 1}`,
          kind: "question",
          span: "full",
          question: q,
          sectionLocalNumber: idx + 1,
        });
      });
    }

    if (nonMcqs.length > 0) {
      const ordinal = secIdx === 0 ? "الأول" : "الثاني";
      secIdx++;
      items.push({
        id: "flow-exam-sec-essay",
        kind: "exam_section_banner",
        span: "full",
        sectionOrdinalArabic: ordinal,
        sectionTitleArabic: "أجب عن الأسئلة الآتية (الأسئلة المقالية والمسائل) :",
        questionsCount: nonMcqs.length,
      });
      nonMcqs.forEach((q, idx) => {
        items.push({
          id: `flow-exam-q-essay-${q.id || idx + 1}`,
          kind: "question",
          span: "full",
          question: q,
          sectionLocalNumber: idx + 1,
        });
      });
    }

    items.push({
      id: "flow-exam-wish-banner",
      kind: "exam_wish_banner",
      span: "full",
    });

    if (includeAnswerKey && questions.some((q) => q.kind === "mcq" && q.correctMcqIndex !== undefined)) {
      items.push({ id: "flow-mcq-answer-key", kind: "mcq_answer_key", span: "full" });
    }

    return { items, totalIdeasCount: secIdx };
  }

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

    const isIdeaGroup = group.anchorQuestion && resolveFlowBannerKind(group.anchorQuestion.ideaBannerTitleAr) === "idea";
    if (isIdeaGroup) {
      items.push({ id: `flow-divider-${ideaIndex}`, kind: "idea_divider", span: "full", ideaIndex });
    }
  });

  if (includeAnswerKey && questions.some((q) => q.kind === "mcq" && q.correctMcqIndex !== undefined)) {
    items.push({ id: "flow-mcq-answer-key", kind: "mcq_answer_key", span: "full" });
  }
  if (includeAccreditation) {
    items.push({ id: "flow-accreditation-footer", kind: "accreditation_footer", span: "full" });
  }

  return { items, totalIdeasCount: groups.length };
}
