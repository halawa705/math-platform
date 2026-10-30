/**
 * @file prep-grade1-quadrilaterals-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس الأشكال الرباعية ومتوازي الأضلاع للصف الأول الإعدادي (الوحدة 3 - الدرس 5).
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 1 Quadrilaterals and Parallelogram Geometry Catalog", () => {
  it("1. matches Problem 5 p.221: Parallelogram with external triangle EGB to find E = 110°", () => {
    const desc = "في الشكل المقابل ABCD متوازي أضلاع فيه قياس D = 75° ومثلث خارجي EGB فيه قياس G = 35° وقياس GBA = 70° أوجد قياس زاوية E = 110°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p221_5", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("E = 110°");
    expect(fig?.angles.some((a) => a.degrees === 75)).toBe(true);
  });

  it("2. matches Problem 7 p.222: Parallelogram proof by diagonals with ABD = 34°, DCA = 31°, CMB = 65°", () => {
    const desc = "شكل رباعي تقاطع قطراه في M وفيه قياس ABD = 34° وقياس DCA = 31° وقياس CMB = 65° أثبت أن الشكل متوازي أضلاع";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p222_7", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("متوازي أضلاع");
    expect(fig?.angles.some((a) => a.degrees === 65)).toBe(true);
  });

  it("3. matches Problem 11 p.222: Algebraic parameters a and b for parallelogram (a - 11 = 32 and 2b - 5 = b - 1)", () => {
    const desc = "أوجد قيم a ، b التي تجعل الشكل ABCD متوازي أضلاع وفيه (a - 11)° = 32° و (2b - 5) = (b - 1)";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p222_11", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("a = 43");
  });

  it("4. matches Problem 10 p.222: Parallelogram proof by angles D = 65°, C = 115°, E = 70°, A = 45°", () => {
    const desc = "في الشكل المقابل قياس D = 65° وقياس C = 115° وقياس E = 70° و A = 45° أثبت أن ABCD متوازي أضلاع";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p222_10", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("D = 65° و C = 115°");
    expect(fig?.angles.some((a) => a.degrees === 65)).toBe(true);
  });

  it("5. matches Problem 6 p.222: Quad with B = 60°, D = 130°, A = 110° and bisector CF to prove BA // CF", () => {
    const desc = "شكل رباعي ABCD فيه B = 60° و D = 130° و A = 110° والشعاع CF ينصف DCE أثبت أن BA // CF";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p222_6", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("BA // CF");
    expect(fig?.angles.some((a) => a.degrees === 60)).toBe(true);
  });

  it("6. matches Problem 3-4 p.221: Parallelogram equations 5X - 11 = 2X + 1 and (10y+1)° + (6y+3)° = 180°", () => {
    const desc = "متوازي أضلاع أضلاعه المتقابلة 5X - 11 و 2X + 1 وزواياه المتتالية (10y+1)° و (6y+3)° أوجد قيمة X و y";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p221_3_4", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("5X - 11 = 2X + 1");
  });

  it("7. matches Problem 3-3 p.221: Parallelogram diagonals bisecting 3y - 4 = 2y and X + y = 10", () => {
    const desc = "متوازي أضلاع قطراه ينصف كل منهما الآخر وفيه 3y - 4 = 2y و X + y = 10 أوجد قيمة X و y";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p221_3_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("3y - 4 = 2y");
  });

  it("8. matches Problem 3-2 p.221: Parallelogram opposite sides X - 2 = 10 and 2y - 7 = y", () => {
    const desc = "متوازي أضلاع أضلاعه المتقابلة متساوية X - 2 = 10 و 2y - 7 = y أوجد قيمة X و y";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p221_3_2", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("X - 2 = 10");
  });

  it("9. matches Problem 3-1 p.221: Parallelogram ABCD with A = 50° to find opposite and consecutive angles", () => {
    const desc = "متوازي أضلاع ABCD فيه قياس زاوية A = 50° أوجد قيمة X و y";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p221_3_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("A = 50°");
    expect(fig?.angles.some((a) => a.degrees === 50)).toBe(true);
  });

  it("10. matches Problem 1-1 p.220: Quadrilateral angles sum 120° and 2X°, 2X°, X° to find X = 48°", () => {
    const desc = "شكل رباعي قياسات زواياه 120° و 2X و 2X و X أوجد قيمة X = 48°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p220_1_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("X = 48°");
  });

  it("11. matches Problem 1-4 p.220: Quadrilateral exterior angle 4X° with interior 70°, 100°, 110° to find X = 25°", () => {
    const desc = "شكل رباعي زاوية خارجة عنه 4X مع زوايا داخلة 70° و 100° و 110° أوجد قيمة X = 25°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p220_1_4", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("X = 25°");
  });

  it("12. matches Problem 2-2 p.220: Isosceles trapezoid with (3X-55)° = 2X° to find D = 70°", () => {
    const desc = "شبه منحرف متساوي الساقين زاويتا قاعدته (3X-55) و 2X أوجد قيمة زاوية D = 70°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p220_2_2", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("D = 70°");
  });

  it("13. matches general lesson keyword for prep grade 1 quadrilaterals", () => {
    const desc = "درس الأشكال الرباعية ومتوازي الأضلاع وخواص متوازي الأضلاع";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_general_quad", "arabic");

    expect(fig).toBeDefined();
  });

  it("14. projects generated canonical IR figures cleanly to vector SVG markup", () => {
    const desc = "في الشكل المقابل ABCD متوازي أضلاع فيه قياس D = 75° ومثلث خارجي EGB فيه قياس G = 35° وقياس GBA = 70° أوجد قياس زاوية E = 110°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_svg_test_quad", "arabic");

    expect(fig).toBeDefined();
    if (!fig) return;
    const svgMarkup = projectGeometryFigureToSVGMarkup(fig);
    expect(svgMarkup).toContain("<svg");
    expect(svgMarkup).toContain("</svg>");
    expect(svgMarkup).toContain("<line");
    expect(svgMarkup).toContain("<text");
  });
});
