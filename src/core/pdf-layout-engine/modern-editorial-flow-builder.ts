/**
 * @file modern-editorial-flow-builder.ts
 * @description محرك بناء تدفق القالب المدرسي الحديث (للمذكرات والمراجعات وأوراق العمل):
 * يحافظ بالكامل على كبسولات الأفكار والشرح والقوانين والأمثلة المحلولة في المذكرات،
 * ويرص أسئلة اختر بنمط مسطح عالي الكثافة، ويجمّع المسائل والأمثلة في 1 أو 2 أو 3 أعمدة مع شريط «✍ الحـــــل».
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 255 سطراً).
 */

import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import type { DocumentAnswerVisibilityMode } from "../ssot/pdf-print-settings-ssot";
import type { FlowItem } from "./flow-item-model";
import { estimateVisualChoiceLength } from "./compact-mcq-inline-prompt-renderer";

export const MODULE_ID_MODERN_EDITORIAL_FLOW_BUILDER = "modern_editorial_flow_builder" as const;

const ARABIC_ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"] as const;

const isMcqItem = (q: PrintableMathQuestionItem): boolean =>
  q.kind === "mcq" || (Array.isArray(q.mcqChoicesAr) && q.mcqChoicesAr.length >= 2);

const isWorkedExampleItem = (q: PrintableMathQuestionItem): boolean =>
  Boolean(q.isWorkedExample) || q.id.startsWith("ws-concept-") || (q.id.startsWith("booklet-s1-") && !q.id.includes("-drill-"));

const hasDiagram = (q: PrintableMathQuestionItem): boolean =>
  Boolean(q.geometryFigure || q.graphSpec || q.rawSvgMarkup);

function packQuestionsIntoEditorialGroups(params: {
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly columnsCount: 1 | 2;
  readonly startNumber: number;
  readonly isSolved: boolean;
  readonly idPrefix: string;
}): readonly FlowItem[] {
  const { questions, columnsCount, startNumber, isSolved, idPrefix } = params;
  const result: FlowItem[] = [];
  let cursor = 0;
  let seqNum = startNumber;
  let groupSeq = 0;

  while (cursor < questions.length) {
    const q = questions[cursor];
    const qHasFig = hasDiagram(q);
    const qLen = estimateVisualChoiceLength(q.promptAr);
    const qFitsMultiCol = (!qHasFig && qLen <= 145) || (qHasFig && qLen <= 130);

    if (columnsCount === 1 || !qFitsMultiCol) {
      result.push({
        id: `${idPrefix}-g-${++groupSeq}`,
        kind: "editorial_question_group",
        span: "full",
        slots: [{ question: q, displayNumber: seqNum++, isSolved }],
      });
      cursor += 1;
      continue;
    }

    if (!qHasFig && qLen <= 44 && cursor + 2 < questions.length) {
      const q2 = questions[cursor + 1];
      const q3 = questions[cursor + 2];
      if (!hasDiagram(q2) && !hasDiagram(q3) && estimateVisualChoiceLength(q2.promptAr) <= 44 && estimateVisualChoiceLength(q3.promptAr) <= 44) {
        result.push({
          id: `${idPrefix}-g-${++groupSeq}`,
          kind: "editorial_question_group",
          span: "full",
          slots: [
            { question: q, displayNumber: seqNum++, isSolved },
            { question: q2, displayNumber: seqNum++, isSolved },
            { question: q3, displayNumber: seqNum++, isSolved },
          ],
        });
        cursor += 3;
        continue;
      }
    }

    if (cursor + 1 < questions.length) {
      const nextQ = questions[cursor + 1];
      const nextLen = estimateVisualChoiceLength(nextQ.promptAr);
      if ((!hasDiagram(nextQ) && nextLen <= 145) || (hasDiagram(nextQ) && nextLen <= 130)) {
        result.push({
          id: `${idPrefix}-g-${++groupSeq}`,
          kind: "editorial_question_group",
          span: "full",
          slots: [
            { question: q, displayNumber: seqNum++, isSolved },
            { question: nextQ, displayNumber: seqNum++, isSolved },
          ],
        });
        cursor += 2;
        continue;
      }
    }

    result.push({
      id: `${idPrefix}-g-${++groupSeq}`,
      kind: "editorial_question_group",
      span: "full",
      slots: [{ question: q, displayNumber: seqNum++, isSolved }],
    });
    cursor += 1;
  }

  return result;
}

export function buildModernEditorialFlowItems(params: {
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly columnsCount: 1 | 2;
  readonly includeAnswerKey: boolean;
  readonly includeAccreditation?: boolean;
  readonly answerVisibilityMode?: DocumentAnswerVisibilityMode;
}): { readonly items: readonly FlowItem[]; readonly totalIdeasCount: number } {
  const { questions, columnsCount, answerVisibilityMode } = params;
  const isParentEdition = answerVisibilityMode === "questions_with_answers";
  const isAnswerKeyOnly = answerVisibilityMode === "answer_key_only";
  const showQuestionsFlow = !isAnswerKeyOnly;
  const showAnswersSection = isParentEdition || isAnswerKeyOnly;
  const hasPedagogicalBooklet = questions.some(
    (q) => Boolean(q.ideaBannerTitleAr || q.conceptExplanationAr || q.framedRuleAr || isWorkedExampleItem(q))
  );

  const items: FlowItem[] = [];
  let ideasCount = 1;

  if (showQuestionsFlow) {
    if (hasPedagogicalBooklet) {
      const groups: Array<{ anchor?: PrintableMathQuestionItem; list: PrintableMathQuestionItem[] }> = [];
      for (const q of questions) {
        const hasCap = Boolean(q.ideaBannerTitleAr || q.conceptExplanationAr || q.framedRuleAr);
        if (hasCap || groups.length === 0) groups.push({ anchor: hasCap ? q : undefined, list: [q] });
        else groups[groups.length - 1].list.push(q);
      }
      ideasCount = Math.max(1, groups.filter((g) => !g.anchor?.ideaBannerTitleAr?.includes("الواجب المنزلي")).length);

      groups.forEach((grp, gIdx) => {
        const ideaIdx = gIdx + 1;
        if (grp.anchor) {
          items.push({ id: `ed-capsule-${ideaIdx}`, kind: "idea_capsule", span: "full", anchorQuestion: grp.anchor, ideaIndex: ideaIdx });
        }
        const worked = grp.list.filter(isWorkedExampleItem);
        const practice = grp.list.filter((q) => !isWorkedExampleItem(q));
        const workedEssays = worked.filter((q) => !isMcqItem(q));
        if (workedEssays.length > 0) {
          items.push(...packQuestionsIntoEditorialGroups({ questions: workedEssays, columnsCount, startNumber: workedEssays[0].questionNumber, isSolved: true, idPrefix: `ed-ex-${ideaIdx}` }));
        }
        worked.filter(isMcqItem).forEach((q, mIdx) => {
          items.push({ id: `ed-ex-mcq-${ideaIdx}-${q.id || mIdx}`, kind: "question", span: "full", question: q, forceHideSolution: false, isWorkedExample: true, ideaIndex: ideaIdx });
        });
        practice.filter(isMcqItem).forEach((q, mIdx) => {
          items.push({ id: `ed-pr-mcq-${ideaIdx}-${q.id || mIdx}`, kind: "question", span: "full", question: q, forceHideSolution: true, ideaIndex: ideaIdx });
        });
        const practiceEssays = practice.filter((q) => !isMcqItem(q));
        if (practiceEssays.length > 0) {
          items.push(...packQuestionsIntoEditorialGroups({ questions: practiceEssays, columnsCount, startNumber: practiceEssays[0].questionNumber, isSolved: false, idPrefix: `ed-pr-${ideaIdx}` }));
        }
      });
    } else {
      const mcqs = questions.filter(isMcqItem);
      const essays = questions.filter((q) => !isMcqItem(q));
      if (mcqs.length > 0) {
        items.push({ id: "ed-ribbon-mcq", kind: "editorial_ribbon_banner", span: "full", titleArabic: "اختر الإجابة الصحيحة من بين الإجابات المعطاة" });
        mcqs.forEach((q, idx) => {
          items.push({ id: `ed-mcq-${q.id || idx + 1}`, kind: "question", span: "full", question: q, sectionLocalNumber: idx + 1, forceHideSolution: true });
        });
      }
      if (essays.length > 0) {
        items.push({ id: "ed-ribbon-essay", kind: "editorial_ribbon_banner", span: "full", titleArabic: "المقالي" });
        const algebraEssays = essays.filter((q) => !hasDiagram(q));
        const geoEssays = essays.filter(hasDiagram);
        let subIdx = 0;
        if (algebraEssays.length > 0) {
          items.push({ id: "ed-sub-alg", kind: "editorial_sub_banner", span: "full", badgeLabelAr: `السؤال ${ARABIC_ORDINALS[subIdx++] ?? subIdx}`, instructionAr: "أجب عن الأسئلة الآتية :" });
          items.push(...packQuestionsIntoEditorialGroups({ questions: algebraEssays, columnsCount, startNumber: 1, isSolved: false, idPrefix: "ed-alg" }));
        }
        if (geoEssays.length > 0) {
          items.push({ id: "ed-sub-geo", kind: "editorial_sub_banner", span: "full", badgeLabelAr: `السؤال ${ARABIC_ORDINALS[subIdx++] ?? subIdx}`, instructionAr: "أسئلة الهندسة والبرهان :" });
          items.push(...packQuestionsIntoEditorialGroups({ questions: geoEssays, columnsCount, startNumber: algebraEssays.length + 1, isSolved: false, idPrefix: "ed-geo" }));
        }
      }
    }
  }

  if (showAnswersSection) {
    const nonExampleQs = questions.filter((q) => !isWorkedExampleItem(q));
    const hasMcqs = nonExampleQs.some((q) => isMcqItem(q) && q.correctMcqIndex !== undefined);
    const nonMcqAnswerables = nonExampleQs.filter(
      (q) => !isMcqItem(q) && ((q.solutionStepsAr?.length ?? 0) > 0 || Boolean(q.modelAnswerAr?.trim()))
    );
    items.push({ id: "ed-ans-banner", kind: "answer_section_banner", span: "full", titleArabic: "كراسة الإجابة ونماذج الحل المعتمدة", subtitleArabic: "مراجعة وتدقيق نموذجي لولي الأمر والمعلم" });
    if (hasMcqs) items.push({ id: "ed-mcq-key", kind: "mcq_answer_key", span: "full" });
    if (nonMcqAnswerables.length > 0) {
      items.push(...packQuestionsIntoEditorialGroups({ questions: nonMcqAnswerables, columnsCount, startNumber: 1, isSolved: true, idPrefix: "ed-ans" }));
    }
  }

  return { items, totalIdeasCount: ideasCount };
}
