/**
 * @file prep-grade2-polygon-angles-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس الزوايا الداخلة والخارجة للمضلعات للصف الثاني الإعدادي.
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 2 Polygon Interior and Exterior Angles Geometry Catalog", () => {
  it("1. matches Problem 2-2 p.272: Pentagon with interior angles 120°, 120°, 95°, 96° to find X = 109°", () => {
    const desc = "مضلع خماسي قياسات زواياه الداخلة هي 120° و 120° و 95° و 96° أوجد قياس الزاوية الخامسة X";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p272_2_2", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مضلع خماسي بزوايا داخلة 120° و 120° و 95° و 96°");
    expect(fig?.vertices.length).toBe(5);
  });

  it("2. matches Problem 2-3 p.272: Regular pentagon with equal sides and interior angle 108°", () => {
    const desc = "مضلع خماسي منتظم متساوي الأضلاع أوجد قياس زاويته الداخلة 108° وقيمة X";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p272_2_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مضلع خماسي منتظم متساوي الأضلاع لإيجاد قياس زاويته الداخلة X = 108°");
  });

  it("3. matches Problem 6 p.273: Regular hexagon ABCDEF adjacent to quad CGHB with 110° and 135° to find ∠G = 55°", () => {
    const desc = "ABCDEF شكل سداسي منتظم ، CGHB شكل رباعي فيه قياس H = 110° وقياس GBC = 135° أوجد بالبرهان قياس زاوية G = 55°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p273_6", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("سداسي منتظم ABCDEF ملتصق برباعي CGHB");
    expect(fig?.angles.some((a) => a.degrees === 110)).toBe(true);
  });

  it("4. matches Problem 2-9 p.272: Two regular pentagons sharing an edge to find angle between them X = 144°", () => {
    const desc = "في الشكل المقابل خماسيان منتظمان مشتركان في ضلع أوجد قياس الزاوية بينهما 144° وقيمة X";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p272_2_9", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("خماسيان منتظمان مشتركان في ضلع لحساب الزاوية بينهما X = 144°");
  });

  it("5. matches Problem 3-1 p.273: Triangle with exterior angles (X+31)°, (2X+32)°, (3X-3)° to find X = 50°", () => {
    const desc = "مثلث قياسات زواياه الخارجة هي (X+31)° و (2X+32)° و (3X-3)° أوجد قيمة X = 50°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p273_3_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مثلث بزوايا خارجة (X+31)° و (2X+32)° و (3X-3)°");
  });

  it("6. matches Problem 3-2 p.273: Quadrilateral with exterior angles 2X°, 3X°, 4X°, X° to find X = 36°", () => {
    const desc = "شكل رباعي قياسات زواياه الخارجة هي 2X° و 3X° و 4X° و X° أوجد قيمة X = 36°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p273_3_2", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("شكل رباعي بزوايا خارجة 2X° و 3X° و 4X° و X°");
  });

  it("7. matches Problem 3-4 p.273 & Problem 8 p.276: Pentagon with exterior angles (X+19)°, 79°, 2X°, 55°, 84° to find X = 41°", () => {
    const desc = "مضلع خماسي زواياه الخارجة هي 84° و (X+19)° و 79° و (2X)° و 55° أوجد قيمة X = 41°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p273_3_4", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("خماسي بزوايا خارجة (X+19)° و 79° و 2X° و 55° و 84°");
  });

  it("8. matches Problem 4 p.273: Hexagon with exterior angles 2a, 4a, 3a, 2a, 2a, 5a to find a = 20 and ∠BCD = 120°", () => {
    const desc = "مضلع سداسي زواياه الخارجة هي 2a و 4a و 3a و 2a و 2a و 5a أوجد قيمة a = 20 وقياس زاوية BCD = 120°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p273_4", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("سداسي بزوايا خارجة 2a و 4a و 3a و 2a و 2a و 5a");
  });

  it("9. matches general lesson description", () => {
    const desc = "درس الزوايا الداخلة والخارجة للمضلعات للصف الثاني الإعدادي";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_general", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مضلع خماسي بزوايا داخلة");
  });

  it("10. projects to valid Vector SVG markup", () => {
    const desc = "مضلع خماسي قياسات زواياه الداخلة هي 120° و 120° و 95° و 96°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_svg_poly", "arabic");

    expect(fig).toBeDefined();
    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "eastern", notationLanguage: "arabic" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("viewBox");
  });
});
