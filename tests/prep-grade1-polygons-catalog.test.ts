/**
 * @file prep-grade1-polygons-catalog.test.ts
 * @description اختبارات شاملة لفهرس ومنشئات درس المضلعات ومحاور التماثل وزوايا المضلع (1ع ص 247 و 252).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import { describe, expect, it } from "vitest";
import {
  matchPrepGrade1PolygonsFigure,
} from "../src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-1/prep-grade1-polygons-catalog";
import {
  buildRegularHexagonExternalRightTriangleFigure,
} from "../src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-1/prep-grade1-polygons-angles-proof-builder";
import {
  matchArabicDescriptionToCanonicalGeometryFigure,
  matchGeometryWithDiagnostics,
} from "../src/core/geometry-engine/natural-arabic-geometry-matcher";

describe("Prep Grade 1 Polygons and Symmetry Axes Geometry Catalog", () => {
  it("1. matches Problem 12 p.252: Regular hexagon ABCDEF with external right triangle to find angle H = 60°", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "في الشكل المقابل ABCDEF سداسي منتظم ، أوجد بالبرهان قياس زاوية H = 60° حيث HG ⊥ AG"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("سداسي منتظم");
    expect(fig?.titleArabic).toContain("H = 60°");
    expect(fig?.vertices.length).toBe(8);
  });

  it("2. matches Problem 14 p.252: Pentagon ABCDE with two right angles, EDC = 130°, EAB = 112° to find DEA = 118°", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "في الشكل المقابل ABCDE خماسي فيه CB ⊥ AB و BC ⊥ CD و EDC = 130° و EAB = 112° ، أوجد قياس زاوية DEA"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("خماسي");
    expect(fig?.titleArabic).toContain("118°");
    expect(fig?.vertices.length).toBe(5);
  });

  it("3. matches Problem 13-5 p.252: Pentagon ABCDE with angles 100°, 110°, 120° and base bisectors meeting at F to find AFB = 75°", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "في الشكل المقابل خماسي ABCDE زواياه 100° و 110° و 120° ومنصفا زاويتي القاعدتين يلتقيان في F لإيجاد قيمة X"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("75°");
    expect(fig?.vertices.length).toBe(6);
  });

  it("4. matches Problem 13-1 p.252: Hexagon with right angles and algebraic angles X and (X + 24)°", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "في الشكل المقابل سداسي بزوايا قائمة وزوايا جبرية X و (X + 24)° أوجد قيمة X"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("X + 24");
    expect(fig?.vertices.length).toBe(6);
  });

  it("5. matches regular pentagon symmetry axes (5 axes) p.247", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "الخماسي المنتظم محاور تماثل عددها 5 محاور"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("5 محاور");
    expect(fig?.segments.some(s => s.strokeStyle === "dashed")).toBe(true);
  });

  it("6. matches equilateral triangle symmetry axes (3 axes) p.247", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "مثلث متساوي الأضلاع عدد محاور تماثل 3"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("3 محاور");
    expect(fig?.segments.some(s => s.strokeStyle === "dashed")).toBe(true);
  });

  it("7. matches regular hexagon symmetry axes (6 axes) p.247", () => {
    const fig = matchArabicDescriptionToCanonicalGeometryFigure(
      "سداسي منتظم عدد محاور تماثله 6 محاور"
    );

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("6 محاور");
    expect(fig?.segments.some(s => s.strokeStyle === "dashed")).toBe(true);
  });

  it("8. matches general lesson description p.247", () => {
    const fig = matchPrepGrade1PolygonsFigure("درس المضلعات ومحاور التماثل للأشكال الهندسية");

    expect(fig).toBeDefined();
    expect(fig?.familyId).toBe("quadrilateral_family");
  });

  it("9. matches with diagnostics cleanly", () => {
    const res = matchGeometryWithDiagnostics(
      "في الشكل المقابل ABCDEF سداسي منتظم أوجد بالبرهان قياس زاوية H",
      "diag_hex_proof"
    );

    expect(res.figure).toBeDefined();
    expect(res.source).toBe("catalog");
  });

  it("10. supports Arabic notation language cleanly", () => {
    const fig = buildRegularHexagonExternalRightTriangleFigure({
      figureId: "ar_poly",
      notationLanguage: "arabic",
    });

    expect(fig.vertices[0].label).toBe("أ");
    expect(fig.vertices[1].label).toBe("ب");
    expect(fig.vertices[4].label).toBe("هـ"); // E -> هـ
    expect(fig.vertices[5].label).toBe("و");  // F -> و
  });
});
