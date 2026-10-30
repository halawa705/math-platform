/**
 * @file prep-grade2-parallel-applications-catalog.test.ts
 * @description اختبارات شاملة لكتالوج أشكال درس تطبيقات التوازي (هندسة الصف الثاني الإعدادي - الوحدة 3 - الدرس 3):
 * يغطي مسائل نظرية طاليس الخاصة والقطع الواصلة بين منتصفات أضلاع المثلث وامتحانات المحافظات.
 */

import { describe, it, expect } from "vitest";
import { matchPrepGrade2ParallelApplicationsFigure } from "../src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-2/prep-grade2-parallel-applications-catalog";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 2 Parallel Applications Geometry Catalog", () => {
  it("1. matches Problem 8 p.210: Thales four parallels with XE = 6 cm and EF = m + 2", () => {
    const desc = "في الشكل المقابل : XA // YB // EC // FD ، AB = BC = CD ، XE = 6 سم ، EF = (m + 2) سم فإن : قيمة m";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p8_210", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("نظرية طاليس الخاصة بأربعة مستقيمات متوازية");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 6)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("2. matches Problem 3 p.210: Two transversals with 4X, 8, y+1", () => {
    const desc = "في كل من الشكلين الآتيين : l1 // l2 // l3 // l4 ، قاطعان لهم مع أجزاء 4X سم و 8 سم و (y+1) سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p3_210", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("قاطعان لمستقيمات متوازية بأجزاء متساوية");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 8)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("3. matches Problem 18 p.214: Multiple parallels FD // GE with GK = 8 cm to find KE = 24 cm", () => {
    const desc = "في الشكل المقابل : FD // GE ، GK = 8 سم ، AG = GF = FB أوجد : طول KE";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p18_214", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("توازيات متعددة FD // GE");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 8)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("4. matches Problem 8 p.212: Midsegments FED of sides 6, 8, 10 cm for perimeter 12 cm", () => {
    const desc = "في الشكل المقابل : D ، E ، F منتصفات AB ، BC ، AC على الترتيب ، أطوال الأضلاع 6 سم و 8 سم و 10 سم أوجد : محيط المثلث FED";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p8_212", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("محيط المثلث FED");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 6)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 8)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 10)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("5. matches Problem 13 p.213: Midsegment DE = (2X+1) and BC = (5X-5) for X = 7", () => {
    const desc = "في الشكل المقابل : D ، E منتصفا AB ، AC أوجد قيمة X حيث DE = (2X+1) سم و BC = (5X-5) سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p13_213", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DE = 2X+1 و BC = 5X-5");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("6. matches Problem 6 p.211: Right triangle in C with AB = 5, BC = 4 for DE = 1.5 cm", () => {
    const desc = "في الشكل المقابل : ABC مثلث فيه m(∠ C) = 90° ، D ، E منتصفا AB ، BC على الترتيب ، BC = 4 سم ، AB = 5 سم أوجد بالبرهان : طول DE";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p6_211", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DE = 1.5 سم");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 4)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 5)).toBe(true);
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("7. matches Problem 7 p.211: Quad ABCD with midpoints Z and X and ZY // DC for perimeter of AXY", () => {
    const desc = "في الشكل المقابل : ABCD شكل رباعي فيه : Z ، X منتصفا AD ، AB على الترتيب ، ZY // DC بحيث YC = 4 سم أوجد : محيط المثلث AXY";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p7_211", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("لحساب محيط AXY");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 4)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("8. matches Problem 12 p.212: Quad with midsegment FE = 10 cm and 12, 16 to prove D = 90°", () => {
    const desc = "في الشكل المقابل : E منتصف BC ، F منتصف AB ، FE = 10 سم ، DC = 16 سم ، AD = 12 سم أثبت أن : m(∠ D) = 90°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p12_212", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("قطعة FE = 10 سم");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 10)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 16)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("9. matches Problem 19 p.214: Parallelogram ABCD with midpoints E and F to prove AC = 3 AG", () => {
    const desc = "في الشكل المقابل : ABCD متوازي أضلاع إذا كانت : E ، F منتصفي BC ، AD على الترتيب . فأثبت أن : AC = 3 AG";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p19_214", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AC = 3 AG");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("10. matches Problem 21 p.214: Iterated midsegments to prove BC = 4 GH", () => {
    const desc = "في الشكل المقابل : إذا كانت D منتصف AB ، E منتصف AC ، G منتصف DF برهن أن : BC = 4 GH";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p21_214", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("BC = 4 GH");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("11. matches Problem 22 p.214: Quad ABCD right at D with midpoints to find area BEF = 15 cm²", () => {
    const desc = "في الشكل المقابل : ABCD شكل رباعي فيه AD = 9 سم ، CD = 12 سم ، AB = 4 سم أوجد مساحة المثلث BEF";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p22_214", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مساحة BEF = 15 سم²");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 9)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 12)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("12. supports Arabic notation mode correctly", () => {
    const desc = "في الشكل المقابل : D ، E ، F منتصفات AB ، BC ، AC على الترتيب ، أوجد : محيط المثلث FED";
    const fig = matchPrepGrade2ParallelApplicationsFigure(desc, "fig_arabic", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.vertices.some((v) => v.label === "أ")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "ب")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "جـ")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "eastern", notationLanguage: "arabic" });
    expect(svg).toContain("<svg");
  });
});
