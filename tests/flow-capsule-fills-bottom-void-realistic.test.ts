/**
 * @file flow-capsule-fills-bottom-void-realistic.test.ts
 * @description سيناريو واقعي: صفحة فيها 4 تدريبات يتبعها فراغ كبير، ثم فكرة جديدة أمثلتها طويلة.
 * المطلوب: تصعد كبسولة الفكرة (العنوان + الشرح + القاعدة) لأسفل الصفحة بدل ترك نصف صفحة فارغاً.
 */

import { describe, expect, it } from "vitest";
import { buildFlowItems } from "@/core/pdf-layout-engine/flow-items-builder";
import { FLOW_DENSITY_PROFILES } from "@/core/pdf-layout-engine/flow-page-geometry-constants";
import { packFlowItemsIntoPages } from "@/core/pdf-layout-engine/flow-page-packer";
import type { FlowItem, FlowPage } from "@/core/pdf-layout-engine/flow-item-model";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";

function q(id: string, n: number, extra: Partial<PrintableMathQuestionItem> = {}): PrintableMathQuestionItem {
  return { id, questionNumber: n, kind: "essay_algebra", branchBadgeAr: "", marks: 2, promptAr: "س", modelAnswerAr: "ج", ...extra };
}

function flat(page: FlowPage): FlowItem[] {
  return page.segments.flatMap((s) => (s.kind === "full" ? [s.item] : [...s.rightItems, ...s.leftItems]));
}

describe("capsule fills bottom void (realistic heights)", () => {
  const questions = [
    q("booklet-s1-example-1-1", 1, { ideaBannerTitleAr: "الفكرة 1", conceptExplanationAr: "ش", framedRuleAr: "ق", isWorkedExample: true }),
    q("booklet-s1-example-1-2", 2, { isWorkedExample: true }),
    q("booklet-s1-drill-1-3", 3),
    q("booklet-s1-drill-1-4", 4),
    q("booklet-s1-drill-1-5", 5),
    q("booklet-s1-drill-1-6", 6),
    q("booklet-s1-example-2-1", 7, { ideaBannerTitleAr: "الفكرة 2", conceptExplanationAr: "ش", framedRuleAr: "ق", isWorkedExample: true }),
    q("booklet-s1-example-2-2", 8, { isWorkedExample: true }),
  ];
  const { items } = buildFlowItems({ questions, columnsCount: 2, includeAnswerKey: false, includeAccreditation: false });
  const heights = new Map<string, number>();
  for (const it of items) {
    if (it.kind === "idea_capsule") heights.set(it.id, 150);
    else if (it.kind === "question" && it.isWorkedExample) heights.set(it.id, 560);
    else heights.set(it.id, 250);
  }
  const pages = packFlowItemsIntoPages(items, heights, {
    budgets: { firstPagePx: 900, nextPagePx: 1000 },
    density: FLOW_DENSITY_PROFILES.ultra_compact,
  });

  it("the second idea capsule is not pushed to a page that leaves the previous page mostly empty", () => {
    const pageOfCapsule2 = pages.findIndex((p) => flat(p).some((i) => i.id === "flow-capsule-2"));
    const prev = pages[pageOfCapsule2 - 1];
    const prevRawFill = prev ? flat(prev).reduce((s, i) => s + (heights.get(i.id) ?? 0), 0) / prev.budgetHeightPx : 1;
    // الصفحة السابقة إما ممتلئة >= 85% أو تحوي الكبسولة نفسها
    expect(pageOfCapsule2 === 0 || prevRawFill >= 0.85 || flat(pages[pageOfCapsule2 - 1]).some((i) => i.id === "flow-capsule-2")).toBe(true);
  });
});
