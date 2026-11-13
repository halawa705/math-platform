/**
 * @file flow-page-packer-fill-quality.test.ts
 * @description اختبارات تراجع لمحرك التوزيع: لا فيض، لا يتيم (كبسولة/فاصل)، صفحات ممتلئة، أعمدة متساوية، ولا فاصل «نهاية الفكرة» لأقسام المراجعة.
 */

import { describe, expect, it } from "vitest";
import { buildFlowItems } from "./flow-items-builder";
import { auditFlowPages } from "./flow-layout-quality-audit";
import { resolveFlowBannerKind } from "./flow-banner-kind-resolver";
import { FLOW_DENSITY_PROFILES } from "./flow-page-geometry-constants";
import { packFlowItemsIntoPages } from "./flow-page-packer";
import { fullWidthHeightKey, type FlowItem } from "./flow-item-model";
import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";

const BUDGETS = { firstPagePx: 915, nextPagePx: 1020 } as const;

function q(id: string, n: number, extra: Partial<PrintableMathQuestionItem> = {}): PrintableMathQuestionItem {
  return { id, questionNumber: n, kind: "essay_algebra", branchBadgeAr: "", marks: 2, promptAr: "س", modelAnswerAr: "ج", ...extra };
}

function bookletQuestions(ideas: number): PrintableMathQuestionItem[] {
  const out: PrintableMathQuestionItem[] = [];
  let n = 0;
  for (let i = 1; i <= ideas; i++) {
    out.push(q(`booklet-s1-example-${i}-1`, ++n, { ideaBannerTitleAr: `الفكرة ${i}`, conceptExplanationAr: "ش", framedRuleAr: "ق" }));
    out.push(q(`booklet-s1-example-${i}-2`, ++n));
    out.push(q(`booklet-s1-drill-${i}-1`, ++n));
  }
  return out;
}

function syntheticHeights(items: readonly FlowItem[]): Map<string, number> {
  const heights = new Map<string, number>();
  items.forEach((item, idx) => {
    const h = item.kind === "idea_capsule" ? 120 : item.kind === "idea_divider" ? 22 : item.kind === "accreditation_footer" ? 95 : 150 + ((idx * 53) % 170);
    heights.set(item.id, h);
    if (item.kind === "question" && item.span === "column") heights.set(fullWidthHeightKey(item.id), Math.round(h * 0.62));
  });
  return heights;
}

describe("flow page packer — fill quality", () => {
  const { items } = buildFlowItems({ questions: bookletQuestions(7), columnsCount: 2, includeAnswerKey: true });
  const heights = syntheticHeights(items);
  const pages = packFlowItemsIntoPages(items, heights, { budgets: BUDGETS, density: FLOW_DENSITY_PROFILES.ultra_compact });
  const audit = auditFlowPages(pages, heights);

  it("never overflows a page budget", () => {
    expect(audit.every((row) => !row.overflowsBudget)).toBe(true);
  });

  it("keeps every item exactly once and in reading order", () => {
    const placed = pages.flatMap((p) => p.segments.flatMap((s) => (s.kind === "full" ? [s.item.id] : [...s.rightItems, ...s.leftItems].map((i) => i.id))));
    expect([...placed].sort()).toEqual(items.map((i) => i.id).sort());
  });

  it("never ends a page with a capsule or starts one with a divider", () => {
    pages.forEach((page, idx) => {
      const flat = page.segments.flatMap((s) => (s.kind === "full" ? [s.item] : [...s.rightItems, ...s.leftItems]));
      if (idx < pages.length - 1) expect(flat[flat.length - 1].kind).not.toBe("idea_capsule");
      expect(flat[0].kind).not.toBe("idea_divider");
    });
  });

  it("fills non-last pages to >= 90% and equalises columns", () => {
    const body = audit.slice(0, -1);
    body.forEach((row) => expect(row.fillRatio).toBeGreaterThanOrEqual(0.9));
    expect(body.reduce((sum, row) => sum + row.fillRatio, 0) / body.length).toBeGreaterThanOrEqual(0.92);
    audit.forEach((row) => expect(row.worstColumnImbalancePx).toBeLessThan(70));
  });

  it("stretches only question cards, never capsules or dividers", () => {
    const byId = new Map(items.map((i) => [i.id, i]));
    pages.forEach((p) => Object.keys(p.targetHeightPxById).forEach((id) => expect(byId.get(id)?.kind).toBe("question")));
  });
});

describe("final review section banners", () => {
  it("classifies section / homework / idea titles correctly", () => {
    expect(resolveFlowBannerKind("أولاً: أسئلة الاختيار من متعدد (20 سؤالاً)")).toBe("section");
    expect(resolveFlowBannerKind("ثانياً: الأسئلة المقالية والبرهان (6 مسألة)")).toBe("section");
    expect(resolveFlowBannerKind("📚 تمارين الواجب المنزلي الشاملة على الدرس")).toBe("homework");
    expect(resolveFlowBannerKind("الفكرة الأولى: خواص الأس")).toBe("idea");
  });

  it("adds no «نهاية الفكرة» divider after a review section", () => {
    const qs = [q("rev-mcq-1", 1, { ideaBannerTitleAr: "أولاً: أسئلة الاختيار من متعدد (2 سؤالاً)" }), q("rev-mcq-2", 2)];
    const { items } = buildFlowItems({ questions: qs, columnsCount: 2, includeAnswerKey: false });
    expect(items.some((i) => i.kind === "idea_divider")).toBe(false);
  });

  it("keeps booklet solved examples visible inline in both Student and Parent editions while placing drill/homework answers at the end in Parent edition only", () => {
    const qs: PrintableMathQuestionItem[] = [
      q("booklet-s1-example-1-1", 1, {
        isWorkedExample: true,
        ideaBannerTitleAr: "الفكرة الأولى: تشابه المضلعات",
        conceptExplanationAr: "شرح",
        framedRuleAr: "قاعدة",
        solutionStepsAr: ["خطوة ١", "الناتج النهائي: 5 سم"],
      }),
      q("booklet-s1-drill-1-1", 2, {
        solutionStepsAr: ["حل حاول بنفسك"],
      }),
      q("booklet-s2-hw-1", 3, {
        ideaBannerTitleAr: "📚 تمارين الواجب المنزلي الشاملة على الدرس",
        solutionStepsAr: ["حل الواجب"],
      }),
    ];

    const studentFlow = buildFlowItems({
      questions: qs,
      columnsCount: 2,
      includeAnswerKey: false,
      answerVisibilityMode: "questions_only",
    });
    const studentQuestions = studentFlow.items.filter((i): i is Extract<FlowItem, { kind: "question" }> => i.kind === "question");
    const studentExample = studentQuestions.find((i) => i.question.id === "booklet-s1-example-1-1");
    const studentDrill = studentQuestions.find((i) => i.question.id === "booklet-s1-drill-1-1");
    expect(studentExample?.forceHideSolution).toBe(false);
    expect(studentDrill?.forceHideSolution).toBe(true);
    expect(studentFlow.items.some((i) => i.kind === "answer_section_banner")).toBe(false);

    const parentFlow = buildFlowItems({
      questions: qs,
      columnsCount: 2,
      includeAnswerKey: true,
      answerVisibilityMode: "questions_with_answers",
    });
    const parentQuestions = parentFlow.items.filter((i): i is Extract<FlowItem, { kind: "question" }> => i.kind === "question");
    const parentBodyExample = parentQuestions.find((i) => !i.isAnswerCard && i.question.id === "booklet-s1-example-1-1");
    const parentBodyDrill = parentQuestions.find((i) => !i.isAnswerCard && i.question.id === "booklet-s1-drill-1-1");
    const parentAnswerCards = parentQuestions.filter((i) => i.isAnswerCard);
    expect(parentBodyExample?.forceHideSolution).toBe(false);
    expect(parentBodyDrill?.forceHideSolution).toBe(true);
    // الأمثلة المحلولة لا تتكرر في كراسة الإجابة النهائية، فقط حاول بنفسك والواجب
    expect(parentAnswerCards.map((c) => c.question.id)).toEqual(["booklet-s1-drill-1-1", "booklet-s2-hw-1"]);
  });

  it("keeps worked-example pairs side-by-side instead of splitting into stretched full-width slabs when prior page is already well filled", () => {
    const qs: PrintableMathQuestionItem[] = [
      q("booklet-s1-example-1-1", 1, {
        isWorkedExample: true,
        ideaBannerTitleAr: "الفكرة الأولى",
        conceptExplanationAr: "شرح ١",
        framedRuleAr: "قاعدة ١",
        solutionStepsAr: ["خطوة ١", "خطوة ٢", "خطوة ٣"],
      }),
      q("booklet-s1-example-1-2", 2, {
        isWorkedExample: true,
        solutionStepsAr: ["خطوة ١", "خطوة ٢", "خطوة ٣"],
      }),
      q("booklet-s1-drill-1-1", 3),
      q("booklet-s1-example-2-1", 4, {
        isWorkedExample: true,
        ideaBannerTitleAr: "الفكرة الثانية",
        conceptExplanationAr: "شرح ٢",
        framedRuleAr: "قاعدة ٢",
        solutionStepsAr: ["١", "٢", "٣", "٤", "٥", "٦", "٧"],
      }),
      q("booklet-s1-example-2-2", 5, {
        isWorkedExample: true,
        solutionStepsAr: ["١", "٢", "٣", "٤", "٥", "٦", "٧"],
      }),
      q("booklet-s1-drill-2-1", 6),
    ];
    const built = buildFlowItems({ questions: qs, columnsCount: 2, includeAnswerKey: false });
    const h = new Map<string, number>();
    built.items.forEach((item) => {
      if (item.kind === "idea_capsule") h.set(item.id, 130);
      else if (item.kind === "idea_divider") h.set(item.id, 18);
      else if (item.kind === "question") {
        const base = item.question.id.includes("example-2-") ? 360 : item.isWorkedExample ? 290 : 140;
        h.set(item.id, base);
        if (item.span === "column") h.set(fullWidthHeightKey(item.id), Math.round(base * 0.65));
      }
    });
    const packed = packFlowItemsIntoPages(built.items, h, {
      budgets: { firstPagePx: 890, nextPagePx: 1020 },
      density: FLOW_DENSITY_PROFILES.ultra_compact,
    });
    const hasSplitWorkedPair = packed.some((pg) =>
      pg.segments.some((s) => s.kind === "full" && s.item.kind === "question" && Boolean(s.item.solutionSlice))
    );
    expect(hasSplitWorkedPair).toBe(false);
  });
});
