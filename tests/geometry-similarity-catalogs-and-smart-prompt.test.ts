/**
 * @file geometry-similarity-catalogs-and-smart-prompt.test.ts
 * @description اختبارات شاملة لتغذية معمل الأشكال لدرس تشابه المضلعات والموجه الذكي للبرومبت.
 */

import { describe, it, expect } from "vitest";
import { isGeometryContext, buildSmartGeometryPromptGuidance } from "../src/core/prompts/smart-geometry-prompt-director";
import { matchPrepSimilarityGeometryFigure } from "../src/core/geometry-engine/catalogs/prep-similarity-geometry-catalog";
import { parseNaturalGeometryTextSpecs, composeParametricSimilarQuadsFigure } from "../src/core/geometry-engine/parametric-similarity-description-parser";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

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

    expect(prompt).toContain("توجيه الإخراج الهندسي الذكي");
    expect(prompt).toContain("[رسم هندسي: ...]");
    expect(prompt).toContain("ABCD ~ EFGH");
    expect(prompt).toContain("أطوال الأضلاع مع قيمها ووحداتها");
    expect(prompt).toContain("قياسات الزوايا الدقيقة");
  });

  it("matches Example 2 from textbook images (quads with radicals and specific angles)", () => {
    const desc = "مضلعان رباعيان متشابهان ABCD ~ EFGH أطوال الأول AB = 6.5 سم و DA = 1.5√3 سم وزاوية C = 60° وزاوية H = 150°";
    const figure = matchPrepSimilarityGeometryFigure(desc);

    expect(figure).toBeDefined();
    expect(figure?.titleArabic).toContain("ABCD ~ EFGH");
    expect(figure?.vertices.length).toBe(8);

    const svg = projectGeometryFigureToSVGMarkup(figure!, { numeralMode: "western" });
    expect(svg).toContain("<svg");
    expect(svg).toContain("6.5");
    expect(svg).toContain("1.5√3");
  });

  it("matches Try-by-yourself 2 from textbook images (obtuse 120° and 45° with 10√3)", () => {
    const desc = "مضلعان رباعيان متشابهان فيهما زاوية 120° وزاوية 45° وأطوال 10√3 سم و 10√2 سم";
    const figure = matchPrepSimilarityGeometryFigure(desc);

    expect(figure).toBeDefined();
    expect(figure?.angles.some((a) => a.degrees === 120)).toBe(true);
    expect(figure?.angles.some((a) => a.degrees === 45)).toBe(true);
  });

  it("matches Right Trapezoids with algebraic variables (X - 3) and (Y + 1)", () => {
    const desc = "شبه منحرف قائم الزاوية متشابه بمجاهيل أطوال قاعدتيه X - 3 و Y + 1";
    const figure = matchPrepSimilarityGeometryFigure(desc);

    expect(figure).toBeDefined();
    expect(figure?.branchId).toBe("quad_trapezoid_with_altitudes");

    const svg = projectGeometryFigureToSVGMarkup(figure!, { numeralMode: "western" });
    expect(svg).toContain("(X - 3)");
    expect(svg).toContain("(Y + 1)");
  });

  it("matches House-shaped Pentagons ABCDE ~ KFGHJ (Try-by-yourself 3)", () => {
    const desc = "مضلعان خماسيان متشابهان ABCDE ~ KFGHJ على شكل منزل قاعدة 6 سم";
    const figure = matchPrepSimilarityGeometryFigure(desc);

    expect(figure).toBeDefined();
    expect(figure?.vertices.length).toBe(10);
  });

  it("matches Collinear Base quads intersecting at O (Example 3)", () => {
    const desc = "مضلعان على خط قاعدة مشتركة H-E-A-D يتقاطعان في نقطة O";
    const figure = matchPrepSimilarityGeometryFigure(desc);

    expect(figure).toBeDefined();
    expect(figure?.vertices.some((v) => v.label === "O" || v.label === "م")).toBe(true);
  });

  it("matches Deltoid/Kites similarity with 92° angles", () => {
    const desc = "طائرتان ورقيتان دالتون متشابهتان ABCD ~ HLKJ قياس الزاوية 92°";
    const figure = matchPrepSimilarityGeometryFigure(desc);

    expect(figure).toBeDefined();
    expect(figure?.angles.some((a) => a.degrees === 92)).toBe(true);
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
