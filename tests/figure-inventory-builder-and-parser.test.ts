/**
 * @file figure-inventory-builder-and-parser.test.ts
 * @description اختبارات وحدة منشئ برومبت الجرد ومحلل الرد (المهمة 0.3).
 */

import { describe, it, expect } from "vitest";
import { buildFigureInventoryPromptForNotebookLM } from "@/core/geometry-engine/baseline-measurement/figure-inventory-prompt-builder";
import { parseFigureInventoryResponse } from "@/core/geometry-engine/baseline-measurement/figure-inventory-response-parser";
import { SEED_CURRICULUM_FIGURE_ARCHETYPES } from "@/core/ssot/figure-archetype-inventory-ssot";

describe("Figure Inventory Builder & Parser (Task 0.3)", () => {
  it("يبني برومبت جرد منهجي واضح وموجه لـ NotebookLM", () => {
    const prompt = buildFigureInventoryPromptForNotebookLM({
      gradeNameArabic: "الصف الثالث الإعدادي",
      gradeId: "prep-3",
      unitNameArabic: "التشابه والدائرة",
    });

    expect(prompt).toContain("الصف الثالث الإعدادي");
    expect(prompt).toContain("prep-3");
    expect(prompt).toContain("=== [ARCHETYPE] ===");
    expect(prompt).toContain("GRADE:");
    expect(prompt).toContain("UNIT:");
    expect(prompt).toContain("LESSON:");
  });

  it("يحلل رد NotebookLM المجدول ويستخرج الأشكال القياسية بدقة", () => {
    const sampleResponse = `
=== [ARCHETYPE] === | GRADE: prep-3 | UNIT: التشابه | LESSON: نظرية إقليدس | KIND: plane_geometry | NAME: مثلث قائم بعمود على الوتر | TAG: [رسم هندسي: مثلث أ ب جـ قائم في أ ; أ د ⊥ ب جـ ; ب د = 9 سم ; د جـ = 16 سم] | GIVENS: أ د عمودي، ب د=9، د جـ=16 | UNKNOWN: length
=== [ARCHETYPE] === | GRADE: prep-1 | UNIT: المفاهيم الهندسية | LESSON: الزوايا المتجمعة | KIND: plane_geometry | NAME: مروحة الزوايا المتجمعة حول نقطة | TAG: [رسم هندسي: زوايا متجمعة حول م ; ق(∠أ م ب) = 110° ; ق(∠ب م جـ) = 90°] | GIVENS: 110° و 90° | UNKNOWN: angle
=== [ARCHETYPE] === | GRADE: primary-6 | UNIT: الإحصاء | LESSON: مخطط الصندوق | KIND: statistics_chart | NAME: مخطط الصندوق والربيعات | TAG: [رسم إحصائي: مخطط صندوق ; أدنى=10 ; وسيط=25 ; أقصى=40] | GIVENS: القيم الخمس | UNKNOWN: none
    `.trim();

    const parsed = parseFigureInventoryResponse(sampleResponse, "prep-3");
    expect(parsed).toHaveLength(3);

    expect(parsed[0].gradeId).toBe("prep-3");
    expect(parsed[0].lessonTitleArabic).toBe("نظرية إقليدس");
    expect(parsed[0].category).toBe("plane_geometry");
    expect(parsed[0].unknownKind).toBe("length");

    expect(parsed[1].gradeId).toBe("prep-1");
    expect(parsed[1].category).toBe("plane_geometry");
    expect(parsed[1].unknownKind).toBe("angle");

    expect(parsed[2].gradeId).toBe("primary-6");
    expect(parsed[2].category).toBe("statistics_chart");
    expect(parsed[2].unknownKind).toBe("none");
  });

  it("يحتوي السجل التأسيسي على أنماط معتمدة تغطي ابتدائي 3–6 وإعدادي 1–3", () => {
    expect(SEED_CURRICULUM_FIGURE_ARCHETYPES.length).toBeGreaterThanOrEqual(10);
    const grades = new Set(SEED_CURRICULUM_FIGURE_ARCHETYPES.map((a) => a.gradeId));
    expect(grades.has("primary-3")).toBe(true);
    expect(grades.has("primary-4")).toBe(true);
    expect(grades.has("primary-5")).toBe(true);
    expect(grades.has("primary-6")).toBe(true);
    expect(grades.has("prep-1")).toBe(true);
    expect(grades.has("prep-2")).toBe(true);
    expect(grades.has("prep-3")).toBe(true);
  });
});
