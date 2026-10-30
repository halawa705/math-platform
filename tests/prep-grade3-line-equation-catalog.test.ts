/**
 * @file prep-grade3-line-equation-catalog.test.ts
 * @description اختبارات شاملة لكتالوج أشكال درس معادلة الخط المستقيم (هندسة الصف الثالث الإعدادي):
 * يغطي المسائل العشر الواردة في صور امتحانات المحافظات (حلوان، الدقهلية، الجيزة، الشرقية، المنوفية).
 */

import { describe, it, expect } from "vitest";
import { matchPrepGrade3LineEquationFigure } from "../src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-3/prep-grade3-line-equation-catalog";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 3 Straight Line Equation Geometry Catalog", () => {
  it("1. matches Problem 21: Equal intercepts passing through (2, 3)", () => {
    const desc = "الشكل المقابل يمثل AB الذي معادلته y = k X + c ويقطع من محوري الإحداثيات جزأين متساويين في الطول ويمر بالنقطة (2 , 3)";
    const fig = matchPrepGrade3LineEquationFigure(desc, "fig_p21", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("جزأين متساويين");
    expect(fig?.vertices.some((v) => v.label === "A")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "B")).toBe(true);
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
    expect(svg).toContain("A");
    expect(svg).toContain("B");
  });

  it("2. matches Problem 22: Equilateral triangle ABO with midpoint C of AB", () => {
    const desc = "في الشكل المقابل : ABO مثلث متساوي الأضلاع ، C منتصف AB أوجد معادلة OC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p22", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("متساوي الأضلاع");
    expect(fig?.vertices.some((v) => v.label === "C")).toBe(true);
    expect(fig?.segments.some((s) => s.tickMarks === 2)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western" });
    expect(svg).toContain("<svg");
  });

  it("3. matches Problem 23: Rhombus OADB with A(2,6) and B(6,2) and D(8,8)", () => {
    const desc = "في الشكل المقابل : النقط O(0,0) ، A(2,6) ، B(6,2) ، D رؤوس معين . أوجد إحداثيي النقطة D ومعادلة OD و m(∠ DOH)";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p23", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("معين");
    expect(fig?.vertices.some((v) => v.label === "A(2,6)")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "B(6,2)")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "D")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "H")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western" });
    expect(svg).toContain("<svg");
    expect(svg).toContain("D");
  });

  it("4. matches Problem 24: Perpendicular lines L1 ⊥ L2 with equation 2X - y + 2 = 0", () => {
    const desc = "إذا كان: L2 ⊥ L1 ومعادلة L1 هي 2X - y + 2 = 0 أوجد معادلة L2";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p24", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("L1 ⊥ L2");
    expect(fig?.vertices.some((v) => v.label === "L1")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "L2")).toBe(true);
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western" });
    expect(svg).toContain("<svg");
  });

  it("5. matches Problem 25: A(0,8) with tan(∠ ABO) = 4/3", () => {
    const desc = "في الشكل المقابل : AB يقطع محور y في النقطة A(0,8) ويقطع محور x في النقطة B فإذا كان: tan(∠ ABO) = 4/3";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p25", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("A(0,8)");
    expect(fig?.vertices.some((v) => v.label === "A(0,8)")).toBe(true);
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western" });
    expect(svg).toContain("<svg");
  });

  it("6. matches Problem 26: Right triangle with A(-4,-3) and B(2,3) and AB ⊥ BC", () => {
    const desc = "في الشكل المقابل : إذا كان: A(-4,-3) ، B(2,3) ، AB ⊥ BC أوجد إحداثيي النقطة C ومعادلة AC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p26", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("A(-4,-3)");
    expect(fig?.vertices.some((v) => v.label === "A(-4,-3)")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "B(2,3)")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "C")).toBe(true);
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western" });
    expect(svg).toContain("<svg");
  });

  it("7. matches Problem 35: Slope angle θ with equation 2y = X - 4", () => {
    const desc = "في الشكل المقابل : إذا كانت معادلة المستقيم l هي 2y = X - 4 فأي من النسب الآتية تساوي tan θ ؟";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p35", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("2y = X - 4");
    expect(fig?.angles.some((a) => a.degreesLabel === "θ")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western" });
    expect(svg).toContain("<svg");
    expect(svg).toContain("θ");
  });

  it("8. matches Problem 36: Triangle AOB area is 9 units with A(0,6)", () => {
    const desc = "في الشكل المقابل : إذا كانت مساحة المثلث AOB تساوي 9 وحدات مربعة فما معادلة AB ؟";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p36", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مساحة المثلث AOB تساوي 9");
    expect(fig?.vertices.some((v) => v.label === "A(0,6)")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western" });
    expect(svg).toContain("<svg");
  });

  it("9. matches Problem 37: Square OABC side length 4 and diagonal AC", () => {
    const desc = "في الشكل المقابل : OABC مربع طول ضلعه 4 سم فما معادلة AC ؟";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p37", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مربع OABC");
    expect(fig?.vertices.some((v) => v.label === "B")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western" });
    expect(svg).toContain("<svg");
  });

  it("10. matches Problem 38: Right triangle OAB at A with BO = 6 and AB = 3", () => {
    const desc = "في الشكل المقابل : إذا كان: AB = 3 وحدات طول ، BO = 6 وحدات طول فما معادلة AO ؟";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p38", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("BO = 6");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 3)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 6)).toBe(true);
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western" });
    expect(svg).toContain("<svg");
  });

  it("11. supports Arabic notation mode for coordinate labels", () => {
    const desc = "ABO مثلث متساوي الأضلاع ، C منتصف AB أوجد معادلة OC";
    const fig = matchPrepGrade3LineEquationFigure(desc, "fig_arabic", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.vertices.some((v) => v.label === "أ")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "ب")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "جـ")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "eastern", notationLanguage: "arabic" });
    expect(svg).toContain("<svg");
  });
});
