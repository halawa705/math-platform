/**
 * @file geometry-similarity-catalogs-and-smart-prompt.test.ts
 * @description اختبارات شاملة للموجه الذكي للبرومبت ومحرك تشابه المضلعات البارامتري.
 */

import { describe, it, expect } from "vitest";
import { isGeometryContext, buildSmartGeometryPromptGuidance } from "../src/core/prompts/smart-geometry-prompt-director";
import { parseNaturalGeometryTextSpecs, composeParametricSimilarQuadsFigure } from "../src/core/geometry-engine/parametric-similarity-description-parser";

describe("Smart Geometry Prompt Director & Polygon Similarity Engine", () => {
  it("detects geometry context from lesson or unit titles", () => {
    expect(isGeometryContext({ branchId: "plane_geometry" })).toBe(true);
    expect(isGeometryContext({ lessonTitleArabic: "تشابه المضلعات" })).toBe(true);
    expect(isGeometryContext({ unitTitleArabic: "الوحدة الثالثة: الهندسة" })).toBe(true);
    expect(isGeometryContext({ lessonTitleArabic: "حل المعادلات في ح", branchId: "algebra" })).toBe(false);
  });

  it("builds detailed geometry prompt guidance for NotebookLM with polygon similarity specs", () => {
    const prompt = buildSmartGeometryPromptGuidance({
      branchId: "plane_geometry",
      lessonTitleArabic: "تشابه المضلعات",
    });

    expect(prompt).toContain("توجيه الإخراج الهندسي للإعدادي");
    expect(prompt).toContain("[رسم هندسي: ...]");
    expect(prompt).toContain("ABCD ~ EFGH");
    expect(prompt).toContain("أطوال الأضلاع ووحداتها");
    expect(prompt).toContain("الزوايا");
  });

  it("dynamically parses custom natural geometry text specs", () => {
    const text = "مضلعان رباعيان متشابهان ABCD ~ EFGH ، AB = 7 سم ، BC = 9 سم ، ق(∠A) = 90° ، ق(∠B) = 40°";
    const specs = parseNaturalGeometryTextSpecs(text);

    expect(specs.sideLengths.get("AB")).toBe("7");
    expect(specs.sideLengths.get("BC")).toBe("9");
    expect(specs.angles.get("A")?.isRight).toBe(true);
    expect(specs.angles.get("B")?.degrees).toBe(40);

    const composed = composeParametricSimilarQuadsFigure(text);
    expect(composed).toBeDefined();
    expect(composed?.segments.some((s) => s.lengthLabel?.value === "7")).toBe(true);
    expect(composed?.angles.some((a) => a.degrees === 40)).toBe(true);
  });
});
