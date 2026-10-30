/**
 * @file prep-grade1-triangle-angles-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس المثلث والزاوية الداخلة والخارجة للصف الأول الإعدادي (الوحدة 3 - الدرس 4).
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 1 Triangle Angles and Exterior Geometry Catalog", () => {
  it("1. matches Problem 14-7 p.210: Base angle bisectors intersecting at 126° to find C = 72°", () => {
    const desc = "في المثلث ABC منصفا زاويتي القاعدة يتقاطعان بزاوية 126° أوجد قياس زاوية الرأس C = 72°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p210_14_7", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("126°");
    expect(fig?.angles.some((a) => a.degrees === 126)).toBe(true);
  });

  it("2. matches Problem 8 p.209: DE // CB with D = 100° and C = 30° to find BAC = 70°", () => {
    const desc = "في الشكل المقابل DE // CB وفيه قياس D = 100° وقياس C = 30° أوجد قياس زاوية BAC = 70°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p209_8", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("BAC = 70°");
    expect(fig?.angles.some((a) => a.degrees === 100)).toBe(true);
  });

  it("3. matches Problem 9 p.209: DE // FX // CB with F = 135° and D = 120° to find angles of ABC", () => {
    const desc = "في الشكل المقابل DE // FX // CB وقياس F = 135° وقياس D = 120° احسب قياسات زوايا المثلث ABC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p209_9", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("المثلث ABC");
    expect(fig?.angles.some((a) => a.degrees === 135)).toBe(true);
  });

  it("4. matches Problem 10 p.209: ABC triangle with B = 60°, A = 80° and ED // CB to find AED = 40° and DEC = 140°", () => {
    const desc = "مثلث ABC فيه B = 60° و A = 80° والقطعة ED // CB أوجد قياس AED = 40° و DEC = 140°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p209_10", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DEC = 140°");
    expect(fig?.angles.some((a) => a.degrees === 80)).toBe(true);
  });

  it("5. matches Problem 14-1 p.210: Exterior angle (3X+10)° with interior 60° and 70° to find X = 40°", () => {
    const desc = "زاوية خارجة للمثلث قياسها (3X+10)° والزاويتان الداخلتان 60° و 70° أوجد قيمة X = 40°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p210_14_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("(3X+10)°");
  });

  it("6. matches Problem 14-2 p.210: Exterior angle 125° with (2X-2)° and (3X+7)° to find X = 24°", () => {
    const desc = "مثلث زاويتاه الداخلتان (2X-2)° و (3X+7)° والزاوية الخارجة 125° أوجد قيمة X = 24°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p210_14_2", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("125°");
  });

  it("7. matches Problem 14-3 p.210: Exterior angle (2X+16)° with (X+1)° and 80° to find X = 65°", () => {
    const desc = "زاوية خارجة للمثلث قياسها (2X+16)° مع زاويتين داخلتين (X+1)° و 80° أوجد قيمة X = 65°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p210_14_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("(2X+16)°");
  });

  it("8. matches Problem 14-4 p.210: Three algebraic interior angles (2X-5)°, (3X+4)°, (4X-8)° to find B = 76°", () => {
    const desc = "مثلث زواياه الداخلة (2X-5)° و (3X+4)° و (4X-8)° أوجد قياس زاوية B = 76°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p210_14_4", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("B = 76°");
  });

  it("9. matches Problem 2-3 p.207: Interior angles ratio a°, 3a°, 5a° to find a = 20°", () => {
    const desc = "مثلث زواياه الداخلة a° و 3a° و 5a° أوجد قيمة a = 20°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p207_2_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("a = 20°");
  });

  it("10. matches Problem 2-5 p.207: Exterior sum with 22° and 82° to find X = 104°", () => {
    const desc = "زاوية خارجة لمثلث مع زاويتين داخلتين 22° و 82° أوجد قيمة X = 104°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p207_2_5", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("X = 104°");
  });

  it("11. matches Problem 2-7 p.207: Equilateral triangle exterior angle = 120°", () => {
    const desc = "مثلث متساوي الأضلاع والزاوية الخارجة عنه تساوي 120°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p207_2_7", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("120°");
  });

  it("12. matches Problem 2-9 p.207: Two exterior angles 110° and 104° to find head angle X = 34°", () => {
    const desc = "مثلث بزاويتين خارجتين 110° و 104° أوجد قياس زاوية الرأس X = 34°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p207_2_9", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("X = 34°");
  });

  it("13. matches general lesson keyword for prep grade 1 triangle angles", () => {
    const desc = "مجموع قياسات الزوايا الداخلة للمثلث والزاوية الخارجة للمثلث";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_general_triangle", "arabic");

    expect(fig).toBeDefined();
  });

  it("14. projects generated canonical IR figures cleanly to vector SVG markup", () => {
    const desc = "في المثلث ABC منصفا زاويتي القاعدة يتقاطعان بزاوية 126° أوجد قياس زاوية الرأس C = 72°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_svg_test_triangle", "arabic");

    expect(fig).toBeDefined();
    if (!fig) return;
    const svgMarkup = projectGeometryFigureToSVGMarkup(fig);
    expect(svgMarkup).toContain("<svg");
    expect(svgMarkup).toContain("</svg>");
    expect(svgMarkup).toContain("<line");
    expect(svgMarkup).toContain("<text");
  });
});
