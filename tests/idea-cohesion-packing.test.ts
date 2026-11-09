import { describe, expect, it } from "vitest";
import { buildFlowItems } from "@/core/pdf-layout-engine/flow-items-builder";
import { packFlowItemsIntoPages } from "@/core/pdf-layout-engine/flow-page-packer";
import { FLOW_DENSITY_PROFILES } from "@/core/pdf-layout-engine/flow-page-geometry-constants";
import type { PrintableMathQuestionItem } from "@/core/pdf-layout-engine/a4-vector-html-sheet-renderer";

describe("Idea Cohesion on A4 Pages", () => {
  it("keeps an entire idea (Capsule + 2 Examples + 4 Drills) together on 1 page instead of splitting into two half-empty pages", () => {
    const q = (id: string, n: number, extra: Partial<PrintableMathQuestionItem> = {}): PrintableMathQuestionItem => ({
      id,
      questionNumber: n,
      kind: "essay_algebra",
      branchBadgeAr: "هندسة",
      marks: 2,
      promptAr: "في الشكل المقابل، إذا كان AB // CD، احسب قيمة x.",
      modelAnswerAr: "x = 20",
      ...extra,
    });

    // 2 complete ideas with 2 examples and 4 drills each
    const questions: PrintableMathQuestionItem[] = [
      // Idea 1: 2 examples + 4 drills
      q("booklet-s1-example-1-1", 1, { ideaBannerTitleAr: "الفكرة الأولى: التوازي والتبادل", conceptExplanationAr: "شرح", framedRuleAr: "قاعدة", isWorkedExample: true }),
      q("booklet-s1-example-1-2", 2, { isWorkedExample: true }),
      q("booklet-s1-drill-1-3", 3),
      q("booklet-s1-drill-1-4", 4),
      q("booklet-s1-drill-1-5", 5),
      q("booklet-s1-drill-1-6", 6),

      // Idea 2: 2 examples + 4 drills
      q("booklet-s1-example-2-1", 7, { ideaBannerTitleAr: "الفكرة الثانية: التناظر والتدخل", conceptExplanationAr: "شرح", framedRuleAr: "قاعدة", isWorkedExample: true }),
      q("booklet-s1-example-2-2", 8, { isWorkedExample: true }),
      q("booklet-s1-drill-2-9", 9),
      q("booklet-s1-drill-2-10", 10),
      q("booklet-s1-drill-2-11", 11),
      q("booklet-s1-drill-2-12", 12),
    ];

    const { items } = buildFlowItems({
      questions,
      columnsCount: 2,
      includeAnswerKey: false,
      includeAccreditation: false,
    });

    const heights = new Map<string, number>();
    for (const it of items) {
      if (it.kind === "idea_capsule") heights.set(it.id, 120);
      else if (it.kind === "question") {
        if ((it as any).isWorkedExample) heights.set(it.id, 420);
        else heights.set(it.id, 200);
      }
    }

    const budgets = { firstPagePx: 960, nextPagePx: 1010, firstPageCompactPx: 960 };
    const pages = packFlowItemsIntoPages(items, heights, {
      budgets,
      density: FLOW_DENSITY_PROFILES.ultra_compact,
    });

    console.log("PAGES COUNT:", pages.length);
    pages.forEach((p, idx) => {
      const pItems = p.segments.flatMap(s => s.kind === "full" ? [s.item.id] : [...s.rightItems.map(r=>r.id), ...s.leftItems.map(l=>l.id)]);
      console.log(`Page ${idx + 1} (${pItems.length} items, used=${p.usedHeightPx}/${p.budgetHeightPx}):`, pItems);
    });

    // Should pack Idea 1 on Page 1 and Idea 2 on Page 2 (2 pages total, not 4!)
    expect(pages.length).toBe(2);
  });
});
