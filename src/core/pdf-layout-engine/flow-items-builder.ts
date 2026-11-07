/**
 * @file flow-items-builder.ts
 * @description يحوّل أسئلة المذكرة إلى كائنات تدفق مرنة: لكل فكرة كبسولة (فكرة+قاعدة) بعرض كامل، ثم أمثلتها
 * وتدريباتها كأسئلة بعرض العمود (أو الكامل إن كان التخطيط عموداً واحداً)، ثم فاصل «نهاية الفكرة» للأفكار فقط.
 * في نسخة الطالب: الأسئلة فقط بدون إجابات أسفلها.
 * في نسخة ولي الأمر: نسخة الطالب كاملة أولاً، ثم في النهاية كراسة الإجابة (جدول إجابات اختر + بطاقات حل كل سؤال).
 */

import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import type {
  DocumentAnswerVisibilityMode,
  PrintPaperTemplateId,
} from "../ssot/pdf-print-settings-ssot";
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
  return (
    Boolean(q.isWorkedExample) ||
    q.id.startsWith("ws-concept-") ||
    (q.id.startsWith("booklet-s1-") && !q.id.includes("-drill-"))
  );
}

function isMcqQuestion(q: PrintableMathQuestionItem): boolean {
  return q.kind === "mcq" || (Array.isArray(q.mcqChoicesAr) && q.mcqChoicesAr.length >= 2);
}

function shouldGenerateAnswerCard(q: PrintableMathQuestionItem): boolean {
  if (isSolvedExample(q)) return false;
  const hasSteps = Boolean(q.solutionStepsAr?.some((s) => s.trim().length > 0));
  const hasModelAnswer = Boolean(q.modelAnswerAr && q.modelAnswerAr.trim().length > 0);
  if (!isMcqQuestion(q)) {
    return hasSteps || hasModelAnswer;
  }
  return Boolean(q.solutionStepsAr && q.solutionStepsAr.filter((s) => s.trim().length > 0).length > 1);
}

export function buildFlowItems(params: {
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly columnsCount: 1 | 2;
  readonly includeAnswerKey: boolean;
  readonly includeAccreditation?: boolean;
  readonly paperTemplateId?: PrintPaperTemplateId;
  readonly answerVisibilityMode?: DocumentAnswerVisibilityMode;
}): { readonly items: readonly FlowItem[]; readonly totalIdeasCount: number } {
  const {
    questions,
    columnsCount,
    includeAnswerKey,
    includeAccreditation = true,
    paperTemplateId,
    answerVisibilityMode,
  } = params;
  const questionSpan = columnsCount === 2 ? "column" : "full";
  const nonExampleQuestions = questions.filter((q) => !isSolvedExample(q));
  const hasMcqs = nonExampleQuestions.some((q) => isMcqQuestion(q) && q.correctMcqIndex !== undefined);
  const answerableQuestions = nonExampleQuestions.filter(shouldGenerateAnswerCard);

  const isParentEdition = answerVisibilityMode === "questions_with_answers";
  const isAnswerKeyOnly = answerVisibilityMode === "answer_key_only";
  const isStudentOnly = answerVisibilityMode === "questions_only";
  const isLegacyMode = answerVisibilityMode === undefined;

  const showQuestionsFlow = !isAnswerKeyOnly;
  const showAnswersSection = isParentEdition || isAnswerKeyOnly;
  const forceHideSolutionInQuestionsFlow = isParentEdition || isStudentOnly;

  if (paperTemplateId === "official_school_exam") {
    const mcqs = questions.filter(isMcqQuestion);
    const nonMcqs = questions.filter((q) => !isMcqQuestion(q));
    const items: FlowItem[] = [];
    let secIdx = 0;

    if (showQuestionsFlow) {
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
            forceHideSolution: true,
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
            forceHideSolution: true,
          });
        });
      }

      items.push({
        id: "flow-exam-wish-banner",
        kind: "exam_wish_banner",
        span: "full",
      });
    }

    if (showAnswersSection) {
      items.push({
        id: "flow-exam-answer-section-banner",
        kind: "answer_section_banner",
        span: "full",
        titleArabic: "نموذج الإجابة الرسمي للاختبار المعتمد",
        subtitleArabic: "إجابات وتوزيع درجات رسمي لولي الأمر والمعلم",
      });

      if (hasMcqs) {
        items.push({ id: "flow-mcq-answer-key", kind: "mcq_answer_key", span: "full" });
      }

      for (const q of answerableQuestions) {
        items.push({
          id: `flow-exam-ans-card-${q.id || q.questionNumber}`,
          kind: "question",
          span: "full",
          question: q,
          isAnswerCard: true,
          forceHideSolution: false,
        });
      }
    } else if (isLegacyMode && includeAnswerKey && hasMcqs) {
      items.push({ id: "flow-mcq-answer-key", kind: "mcq_answer_key", span: "full" });
    }

    return { items, totalIdeasCount: secIdx };
  }

  const groups = groupQuestionsByIdea(questions);
  const items: FlowItem[] = [];

  if (showQuestionsFlow) {
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
        const workedExample = isSolvedExample(question);
        items.push({
          id: `flow-q-${ideaIndex}-${question.id}`,
          kind: "question",
          span: questionSpan,
          question,
          forceHideSolution: workedExample ? false : forceHideSolutionInQuestionsFlow,
        });
      }

      const isIdeaGroup =
        group.anchorQuestion && resolveFlowBannerKind(group.anchorQuestion.ideaBannerTitleAr) === "idea";
      if (isIdeaGroup) {
        items.push({ id: `flow-divider-${ideaIndex}`, kind: "idea_divider", span: "full", ideaIndex });
      }
    });
  }

  if (showAnswersSection && (hasMcqs || answerableQuestions.length > 0)) {
    items.push({
      id: "flow-answer-section-banner",
      kind: "answer_section_banner",
      span: "full",
      titleArabic: "كراسة الإجابة ونماذج الحل الرسمية",
      subtitleArabic: "مراجعة وتدقيق معتمد لولي الأمر والمعلم",
    });

    if (hasMcqs) {
      items.push({ id: "flow-mcq-answer-key", kind: "mcq_answer_key", span: "full" });
    }

    for (const q of answerableQuestions) {
      items.push({
        id: `flow-ans-card-${q.id || q.questionNumber}`,
        kind: "question",
        span: questionSpan,
        question: q,
        isAnswerCard: true,
        forceHideSolution: false,
      });
    }
  } else if (isLegacyMode && includeAnswerKey && hasMcqs) {
    items.push({ id: "flow-mcq-answer-key", kind: "mcq_answer_key", span: "full" });
  }

  if (includeAccreditation) {
    items.push({ id: "flow-accreditation-footer", kind: "accreditation_footer", span: "full" });
  }

  return { items, totalIdeasCount: groups.length };
}
