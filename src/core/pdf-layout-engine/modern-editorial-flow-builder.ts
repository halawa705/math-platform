/**
 * @file modern-editorial-flow-builder.ts
 * @description محرك بناء تدفق القالب المدرسي الحديث (للمذكرات والمراجعات وأوراق العمل):
 * يحافظ بالكامل على كبسولات الأفكار والشرح والقوانين والأمثلة المحلولة في المذكرات،
 * يبقي النماذج الحسابية والبصرية في تسلسلها الطبيعي دون تصنيفها كهندسة،
 * ويوحد الترقيم 100% بين ورقة الأسئلة وكراسة الإجابة ويمنع تكديس الحلول الطويلة في عمودين.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 245 سطراً).
 */

import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import type { DocumentAnswerVisibilityMode } from "../ssot/pdf-print-settings-ssot";
import type { FlowItem } from "./flow-item-model";
import { estimateVisualChoiceLength } from "./compact-mcq-inline-prompt-renderer";

export const MODULE_ID_MODERN_EDITORIAL_FLOW_BUILDER = "modern_editorial_flow_builder" as const;

/** علامة معزولة للتنظيف المرحلي (Phase 3/4): استُبدل الفحص السابق `essays.filter(hasDiagram)` بتمييز الهندسة الإقليدية الصرفة. */
export const legacyHasDiagramEssaySplitter = null;

const ARABIC_ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"] as const;

const isMcqItem = (q: PrintableMathQuestionItem): boolean =>
  q.kind === "mcq" || (Array.isArray(q.mcqChoicesAr) && q.mcqChoicesAr.length >= 2);

const isWorkedExampleItem = (q: PrintableMathQuestionItem): boolean =>
  Boolean(q.isWorkedExample) || q.id.startsWith("ws-concept-") || (q.id.startsWith("booklet-s1-") && !q.id.includes("-drill-"));

const hasDiagram = (q: PrintableMathQuestionItem): boolean =>
  Boolean(q.geometryFigure || q.graphSpec || q.rawSvgMarkup);

/** يميز مسائل الهندسة الإقليدية الصرفة عن النماذج الحسابية والبصرية والإحصائية. */
const isTrueEuclideanGeometryEssay = (q: PrintableMathQuestionItem): boolean =>
  Boolean(q.geometryFigure) &&
  q.geometryFigure!.familyId !== "primary_visual_models_family" &&
  q.geometryFigure!.familyId !== "statistics_family" &&
  !q.geometryFigure!.rawSvgMarkup &&
  !q.rawSvgMarkup;

function getQuestionSteps(q: PrintableMathQuestionItem): readonly string[] {
  if (q.solutionStepsAr && q.solutionStepsAr.length > 0) return q.solutionStepsAr;
  return q.modelAnswerAr?.trim() ? [q.modelAnswerAr] : [];
}

function canFitSlotInMultiCol(
  q: PrintableMathQuestionItem,
  isSolved: boolean,
  idPrefix: string
): boolean {
  const qHasFig = hasDiagram(q);
  const qHasTable = /\n\s*\|.*\|/.test(q.promptAr);
  if (qHasTable) return false;
  const qLen = estimateVisualChoiceLength(q.promptAr);

  if (!isSolved) {
    return (!qHasFig && qLen <= 145) || (qHasFig && qLen <= 130);
  }

  if (qHasFig && idPrefix === "ed-ans") return false;
  if (qLen > 115) return false;
  const steps = getQuestionSteps(q);
  if (steps.length > 3) return false;
  const stepLens = steps.map(estimateVisualChoiceLength);
  const maxStepLen = stepLens.length > 0 ? Math.max(...stepLens) : 0;
  const totalStepsLen = stepLens.reduce((sum, n) => sum + n, 0);
  return maxStepLen <= 62 && totalStepsLen <= 155;
}

function packQuestionsIntoEditorialGroups(params: {
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly columnsCount: 1 | 2;
  readonly startNumber: number;
  readonly isSolved: boolean;
  readonly idPrefix: string;
  readonly explicitDisplayNumbers?: ReadonlyMap<string, number>;
}): readonly FlowItem[] {
  const { questions, columnsCount, startNumber, isSolved, idPrefix, explicitDisplayNumbers } = params;
  const result: FlowItem[] = [];
  let cursor = 0;
  let seqNum = startNumber;
  let groupSeq = 0;

  const numFor = (q: PrintableMathQuestionItem): number =>
    explicitDisplayNumbers?.get(q.id) ?? seqNum++;

  while (cursor < questions.length) {
    const q = questions[cursor];
    const qHasFig = hasDiagram(q);
    const qLen = estimateVisualChoiceLength(q.promptAr);
    const qFitsMultiCol = canFitSlotInMultiCol(q, isSolved, idPrefix);

    if (columnsCount === 1 || !qFitsMultiCol) {
      result.push({
        id: `${idPrefix}-g-${++groupSeq}`,
        kind: "editorial_question_group",
        span: "full",
        slots: [{ question: q, displayNumber: numFor(q), isSolved }],
      });
      cursor += 1;
      continue;
    }

    if (!isSolved && !qHasFig && qLen <= 44 && cursor + 2 < questions.length) {
      const q2 = questions[cursor + 1];
      const q3 = questions[cursor + 2];
      if (!hasDiagram(q2) && !hasDiagram(q3) && estimateVisualChoiceLength(q2.promptAr) <= 44 && estimateVisualChoiceLength(q3.promptAr) <= 44) {
        result.push({
          id: `${idPrefix}-g-${++groupSeq}`,
          kind: "editorial_question_group",
          span: "full",
          slots: [
            { question: q, displayNumber: numFor(q), isSolved },
            { question: q2, displayNumber: numFor(q2), isSolved },
            { question: q3, displayNumber: numFor(q3), isSolved },
          ],
        });
        cursor += 3;
        continue;
      }
    }

    if (cursor + 1 < questions.length) {
      const nextQ = questions[cursor + 1];
      const stepsBalanced = !isSolved || Math.abs(getQuestionSteps(q).length - getQuestionSteps(nextQ).length) <= 1;
      if (canFitSlotInMultiCol(nextQ, isSolved, idPrefix) && stepsBalanced) {
        result.push({
          id: `${idPrefix}-g-${++groupSeq}`,
          kind: "editorial_question_group",
          span: "full",
          slots: [
            { question: q, displayNumber: numFor(q), isSolved },
            { question: nextQ, displayNumber: numFor(nextQ), isSolved },
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
      slots: [{ question: q, displayNumber: numFor(q), isSolved }],
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
    (q) =>
      Boolean(
        q.conceptExplanationAr ||
          q.framedRuleAr ||
          isWorkedExampleItem(q) ||
          (q.ideaBannerTitleAr && /^(?:###?\s*)?الفكرة\b/i.test(q.ideaBannerTitleAr.trim()))
      )
  );

  const items: FlowItem[] = [];
  let ideasCount = 1;

  // حساب ترتيب وترقيم المقالي الحتمي الموحد بين ورقة الأسئلة وكراسة الإجابة
  const allEssays = questions.filter((q) => !isMcqItem(q));
  const nonGeoEssays = allEssays.filter((q) => !isTrueEuclideanGeometryEssay(q));
  const trueGeoEssays = allEssays.filter(isTrueEuclideanGeometryEssay);
  const orderedEssays = [...nonGeoEssays, ...trueGeoEssays];
  const essayDisplayNumberMap = new Map<string, number>();
  orderedEssays.forEach((q, idx) => {
    if (q.id) essayDisplayNumberMap.set(q.id, idx + 1);
  });

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
      if (mcqs.length > 0) {
        items.push({ id: "ed-ribbon-mcq", kind: "editorial_ribbon_banner", span: "full", titleArabic: "اختر الإجابة الصحيحة من بين الإجابات المعطاة" });
        mcqs.forEach((q, idx) => {
          items.push({ id: `ed-mcq-${q.id || idx + 1}`, kind: "question", span: "full", question: q, sectionLocalNumber: idx + 1, forceHideSolution: true });
        });
      }
      if (orderedEssays.length > 0) {
        items.push({ id: "ed-ribbon-essay", kind: "editorial_ribbon_banner", span: "full", titleArabic: "المقالي" });
        let subIdx = 0;
        if (nonGeoEssays.length > 0) {
          items.push({ id: "ed-sub-alg", kind: "editorial_sub_banner", span: "full", badgeLabelAr: `السؤال ${ARABIC_ORDINALS[subIdx++] ?? subIdx}`, instructionAr: "أجب عن الأسئلة الآتية :" });
          items.push(...packQuestionsIntoEditorialGroups({ questions: nonGeoEssays, columnsCount, startNumber: 1, isSolved: false, idPrefix: "ed-alg", explicitDisplayNumbers: essayDisplayNumberMap }));
        }
        if (trueGeoEssays.length > 0) {
          items.push({ id: "ed-sub-geo", kind: "editorial_sub_banner", span: "full", badgeLabelAr: `السؤال ${ARABIC_ORDINALS[subIdx++] ?? subIdx}`, instructionAr: "أسئلة الهندسة والبرهان :" });
          items.push(...packQuestionsIntoEditorialGroups({ questions: trueGeoEssays, columnsCount, startNumber: nonGeoEssays.length + 1, isSolved: false, idPrefix: "ed-geo", explicitDisplayNumbers: essayDisplayNumberMap }));
        }
      }
    }
  }

  if (showAnswersSection) {
    const nonExampleQs = questions.filter((q) => !isWorkedExampleItem(q));
    const hasMcqs = nonExampleQs.some((q) => isMcqItem(q) && q.correctMcqIndex !== undefined);
    const answerSourceEssays = hasPedagogicalBooklet ? nonExampleQs.filter((q) => !isMcqItem(q)) : orderedEssays.filter((q) => !isWorkedExampleItem(q));
    const nonMcqAnswerables = answerSourceEssays.filter(
      (q) => (q.solutionStepsAr?.length ?? 0) > 0 || Boolean(q.modelAnswerAr?.trim())
    );
    items.push({ id: "ed-ans-banner", kind: "answer_section_banner", span: "full", titleArabic: "كراسة الإجابة ونماذج الحل المعتمدة", subtitleArabic: "مراجعة وتدقيق نموذجي لولي الأمر والمعلم" });
    if (hasMcqs) items.push({ id: "ed-mcq-key", kind: "mcq_answer_key", span: "full" });
    if (nonMcqAnswerables.length > 0) {
      items.push(...packQuestionsIntoEditorialGroups({
        questions: nonMcqAnswerables,
        columnsCount,
        startNumber: 1,
        isSolved: true,
        idPrefix: "ed-ans",
        explicitDisplayNumbers: hasPedagogicalBooklet ? undefined : essayDisplayNumberMap,
      }));
    }
  }

  return { items, totalIdeasCount: ideasCount };
}
