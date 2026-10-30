/**
 * @file prep-grade1-special-quads-followup-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس تابع الأشكال الرباعية الخاصة (المستطيل، المعين، المربع) للصف الأول الإعدادي (الوحدة 3 - الدرس 6).
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 1 Special Quadrilaterals Followup Geometry Catalog", () => {
  it("1. matches Problem 6-1 p.234: Square attached to equilateral triangle DCE to find ACE = 105°", () => {
    const desc = "في الشكل المقابل ABCD مربع ملتصق بمثلث متساوي الأضلاع DCE أوجد بالبرهان قياس زاوية ACE = 105°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p234_6_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ACE = 105°");
    expect(fig?.angles.some((a) => a.degrees === 60)).toBe(true);
  });

  it("2. matches Problem 8 p.234: Rectangle ABCD with AED = 46° and ECB = 44° to find CED = 88°", () => {
    const desc = "في الشكل المقابل ABCD مستطيل وفيه AED = 46° و ECB = 44° أوجد بالبرهان قياس زاوية CED = 88°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p234_8", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("CED = 88°");
    expect(fig?.angles.some((a) => a.degrees === 46)).toBe(true);
  });

  it("3. matches Problem 12 p.235: Rectangle and square composite with FDC = 52° to find AFD = 97°", () => {
    const desc = "مستطيل ABCD يحوي بداخله ABFE مربع وفيه قياس FDC = 52° أوجد بالبرهان قياس زاوية AFD = 97°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p235_12", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AFD = 97°");
    expect(fig?.angles.some((a) => a.degrees === 52)).toBe(true);
  });

  it("4. matches Problem 13 p.235: Square with inscribed rhombus on diagonal AC with EA = FC", () => {
    const desc = "ABCD مربع تقاطع قطراه في M والنقطتان E و F على AC بحيث EA = FC أثبت أن الشكل EBFD معين";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p235_13", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("EBFD");
  });

  it("5. matches Problem 9 p.235: Rhombus ABCD with DBC = 62° to find head angle A = 56°", () => {
    const desc = "في الشكل المقابل ABCD معين فيه قياس DBC = 62° أوجد بالبرهان قياس زاوية A = 56°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p235_9", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DBC = 62°");
    expect(fig?.angles.some((a) => a.degrees === 62)).toBe(true);
  });

  it("6. matches Problem 7 p.234: Square with BD = 5a - 4 and MC = 2a - 1 to find a = 2 and AC = 6", () => {
    const desc = "مربع ABCD فيه قطراه BD = 5a - 4 و MC = 2a - 1 أوجد قيمة a وطول AC = 6";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p234_7", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("BD = 5a - 4");
  });

  it("7. matches Problem 3-3 p.233: Rhombus equal sides 7X - 11 = 5X + 1 to find X = 6", () => {
    const desc = "معين ABCD أضلاعه متساوية 7X - 11 و 5X + 1 أوجد قيمة X = 6";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p233_3_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("7X - 11 = 5X + 1");
  });

  it("8. matches Problem 3-2 p.233: Rectangle diagonals equal 4X - 5 = 3X to find X = 5", () => {
    const desc = "مستطيل ABCD قطراه متساويان 4X - 5 و 3X أوجد قيمة X = 5";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p233_3_2", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("4X - 5 = 3X");
  });

  it("9. matches general lesson keyword for prep grade 1 special quadrilaterals", () => {
    const desc = "تابع الأشكال الرباعية الخاصة والحالات الخاصة من متوازي الأضلاع المستطيل والمعين والمربع";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_general_special_quads", "arabic");

    expect(fig).toBeDefined();
  });

  it("10. projects generated canonical IR figures cleanly to vector SVG markup", () => {
    const desc = "في الشكل المقابل ABCD مربع ملتصق بمثلث متساوي الأضلاع DCE أوجد بالبرهان قياس زاوية ACE = 105°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_svg_test_special_quads", "arabic");

    expect(fig).toBeDefined();
    if (!fig) return;
    const svgMarkup = projectGeometryFigureToSVGMarkup(fig);
    expect(svgMarkup).toContain("<svg");
    expect(svgMarkup).toContain("</svg>");
    expect(svgMarkup).toContain("<line");
    expect(svgMarkup).toContain("<text");
  });
});
