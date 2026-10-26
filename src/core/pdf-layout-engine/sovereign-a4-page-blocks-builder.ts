/**
 * @file sovereign-a4-page-blocks-builder.ts
 * @description المحرك السيادي المستقل لتوليد وتقسيم صفحات A4 القياسية (Sovereign A4 Page Composer):
 * - يحول عناصر المذكرة أو الاختبار إلى صفوف ذرية قابلة للقياس الحي (`SovereignA4RowBlock`).
 * - يجمع كل مثالين أو سؤالين متجاورين في صف ثنائي متوازن (`question_pair`) يستحيل انقسام خطواته أفقياً.
 * - يربط كبسولة الفكرة (`idea_capsule`) بأول صف أمثلة تحتها (`keepWithNext: true`) لمنع بقاء الكبسولة وحيدة في صفحة فارغة.
 * - يوزع الصفوف المقاسة بالبيكسل الحقيقي على صفحات A4 منفصلة (`794px × 1123px`) مع ضغط مرن ذكي (`Elastic Squeeze`) لتحقيق أعلى كثافة واستغلال للورق.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_SOVEREIGN_A4_PAGE_BLOCKS_BUILDER =
  "sovereign_a4_page_blocks_builder" as const;

export type SovereignA4RowBlock =
  | {
      readonly id: string;
      readonly kind: "idea_capsule";
      readonly anchorQuestion: PrintableMathQuestionItem;
      readonly ideaIndex: number;
      readonly keepWithNext: true;
    }
  | {
      readonly id: string;
      readonly kind: "question_pair";
      readonly items: readonly PrintableMathQuestionItem[];
    }
  | {
      readonly id: string;
      readonly kind: "idea_divider";
      readonly ideaIndex: number;
    }
  | {
      readonly id: string;
      readonly kind: "mcq_answer_key";
    }
  | {
      readonly id: string;
      readonly kind: "accreditation_footer";
    };

export interface DiscreteMeasuredA4Page {
  readonly pageNumber: number;
  readonly isFirstPage: boolean;
  readonly blocks: readonly SovereignA4RowBlock[];
  readonly usedHeightPx: number;
  readonly budgetHeightPx: number;
  readonly contentScale: number;
}

export function buildSovereignA4RowBlocks(params: {
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly columnsCount: 1 | 2;
  readonly includeAnswerKey: boolean;
}): {
  readonly blocks: readonly SovereignA4RowBlock[];
  readonly totalIdeasCount: number;
} {
  const { questions, columnsCount, includeAnswerKey } = params;
  const ideaGroups: Array<{
    readonly anchorQuestion?: PrintableMathQuestionItem;
    readonly items: PrintableMathQuestionItem[];
  }> = [];

  for (const q of questions) {
    const hasIdeaCapsule = Boolean(
      q.ideaBannerTitleAr || q.conceptExplanationAr || q.framedRuleAr
    );
    if (hasIdeaCapsule || ideaGroups.length === 0) {
      ideaGroups.push({
        anchorQuestion: hasIdeaCapsule ? q : undefined,
        items: [q],
      });
    } else {
      ideaGroups[ideaGroups.length - 1].items.push(q);
    }
  }

  const blocks: SovereignA4RowBlock[] = [];
  const step = columnsCount === 2 ? 2 : 1;

  ideaGroups.forEach((group, gIdx) => {
    const ideaIndex = gIdx + 1;
    if (group.anchorQuestion) {
      blocks.push({
        id: `block-capsule-${ideaIndex}`,
        kind: "idea_capsule",
        anchorQuestion: group.anchorQuestion,
        ideaIndex,
        keepWithNext: true,
      });
    }

    // فصل الأمثلة المحلولة في صفوف ثنائية، ثم التدريبات في صفوف ثنائية متوازنة
    const solvedExamples = group.items.filter(
      (q) => q.id.startsWith("booklet-s1-") && !q.id.includes("-drill-")
    );
    const drillsAndOthers = group.items.filter(
      (q) => !solvedExamples.includes(q)
    );

    const pushChunkedPairs = (
      list: readonly PrintableMathQuestionItem[],
      tag: string
    ) => {
      for (let i = 0; i < list.length; i += step) {
        const slice = list.slice(i, i + step);
        blocks.push({
          id: `block-pair-${ideaIndex}-${tag}-${i}`,
          kind: "question_pair",
          items: slice,
        });
      }
    };

    if (solvedExamples.length > 0 && drillsAndOthers.length > 0) {
      // إذا كان عدد الأمثلة المحلولة فردياً، ندمج أول تدريب معه لملء الخانة المقابلة وعدم إهدار نصف الصف
      if (step === 2 && solvedExamples.length % 2 === 1) {
        pushChunkedPairs(group.items, "merged");
      } else {
        pushChunkedPairs(solvedExamples, "ex");
        pushChunkedPairs(drillsAndOthers, "dr");
      }
    } else {
      pushChunkedPairs(group.items, "all");
    }

    const isHomeworkSection =
      group.anchorQuestion &&
      /الواجب\s*المنزلي|ثانياً/.test(group.anchorQuestion.ideaBannerTitleAr || "");

    if (group.anchorQuestion && !isHomeworkSection) {
      blocks.push({
        id: `block-divider-${ideaIndex}`,
        kind: "idea_divider",
        ideaIndex,
      });
    }
  });

  if (includeAnswerKey && questions.some((q) => q.kind === "mcq" && q.correctMcqIndex !== undefined)) {
    blocks.push({
      id: "block-mcq-answer-key",
      kind: "mcq_answer_key",
    });
  }

  blocks.push({
    id: "block-accreditation-footer",
    kind: "accreditation_footer",
  });

  return {
    blocks,
    totalIdeasCount: ideaGroups.length,
  };
}

const FIRST_PAGE_BUDGET_PX = 955;
const SUBSEQUENT_PAGE_BUDGET_PX = 1020;
const BLOCK_GAP_PX = 6;
const ELASTIC_OVERFLOW_TOLERANCE = 1.075;

export function packMeasuredBlocksIntoDiscreteA4Pages(
  blocks: readonly SovereignA4RowBlock[],
  heightsMap: ReadonlyMap<string, number>
): readonly DiscreteMeasuredA4Page[] {
  if (blocks.length === 0) return [];

  const pages: DiscreteMeasuredA4Page[] = [];
  let currentBlocks: SovereignA4RowBlock[] = [];
  let currentUsedPx = 0;

  const getBudget = (pageIdx: number) =>
    pageIdx === 1 ? FIRST_PAGE_BUDGET_PX : SUBSEQUENT_PAGE_BUDGET_PX;

  const estimateFallbackPx = (b: SovereignA4RowBlock): number => {
    if (b.kind === "idea_capsule") return 98;
    if (b.kind === "idea_divider") return 22;
    if (b.kind === "mcq_answer_key") return 180;
    if (b.kind === "accreditation_footer") return 95;
    return 190;
  };

  const getBlockHeight = (b: SovereignA4RowBlock): number =>
    heightsMap.get(b.id) ?? estimateFallbackPx(b);

  const flushPage = () => {
    if (currentBlocks.length === 0) return;
    const pNum = pages.length + 1;
    const budget = getBudget(pNum);
    const scale =
      currentUsedPx > budget
        ? Number(Math.max(0.84, budget / currentUsedPx).toFixed(3))
        : 1;
    pages.push({
      pageNumber: pNum,
      isFirstPage: pNum === 1,
      blocks: currentBlocks,
      usedHeightPx: currentUsedPx,
      budgetHeightPx: budget,
      contentScale: scale,
    });
    currentBlocks = [];
    currentUsedPx = 0;
  };

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const h = getBlockHeight(block);
    const nextPageIdx = pages.length + 1;
    const budget = getBudget(nextPageIdx);
    const maxElasticBudget = budget * ELASTIC_OVERFLOW_TOLERANCE;

    // إذا كان البلوك كبسولة فكرة، يجب أن يتسع هو وأول صف أمثلة تحته معاً حتى لا تبقى الكبسولة يتيمة
    if (block.kind === "idea_capsule" && i + 1 < blocks.length) {
      const nextBlock = blocks[i + 1];
      const nextH = getBlockHeight(nextBlock);
      const combinedH = h + BLOCK_GAP_PX + nextH;

      if (
        currentBlocks.length > 0 &&
        currentUsedPx + BLOCK_GAP_PX + combinedH > maxElasticBudget
      ) {
        flushPage();
      }

      // نضيف الكبسولة وأول صف أمثلة معاً في نفس الصفحة حتماً
      const gapBefore = currentBlocks.length > 0 ? BLOCK_GAP_PX : 0;
      currentBlocks.push(block, nextBlock);
      currentUsedPx += gapBefore + combinedH;
      i += 1;
      continue;
    }

    const addedH = (currentBlocks.length > 0 ? BLOCK_GAP_PX : 0) + h;
    if (currentBlocks.length > 0 && currentUsedPx + addedH > maxElasticBudget) {
      flushPage();
      currentBlocks.push(block);
      currentUsedPx = h;
    } else {
      currentBlocks.push(block);
      currentUsedPx += addedH;
    }
  }

  flushPage();
  return pages;
}
