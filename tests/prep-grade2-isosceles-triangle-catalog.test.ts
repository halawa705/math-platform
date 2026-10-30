/**
 * @file prep-grade2-isosceles-triangle-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس المثلث المتساوي الساقين للصف الثاني الإعدادي.
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 2 Isosceles Triangle Geometry Catalog", () => {
  it("1. matches Problem 3 p.241: Isosceles ABC (AB=AC, ∠A=40°) with equilateral DBE to find ∠CBD = 130°", () => {
    const desc = "في الشكل المقابل : DBE مثلث متساوي الأضلاع ، AC = AB ، قياس A = 40° أوجد بالبرهان قياس CBD = 130°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p241_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مثلث متساوي الساقين ABC بزاوية 40° ومثلث متساوي الأضلاع DBE");
    expect(fig?.angles.some((a) => a.degrees === 40)).toBe(true);
  });

  it("2. matches Problem 4 p.241: Isosceles ABC (AB=AC, ∠A=50°) with equilateral EBD on extended base to find ∠ABE = 55°", () => {
    const desc = "في الشكل المقابل : مثلث ABC متساوي الساقين فيه AB = AC وقياس A = 50° ومثلث EBD متساوي الأضلاع أوجد قياس ABE = 55°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p241_4", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مثلث متساوي الساقين ABC برأس 50° ومثلث متساوي الأضلاع EBD");
  });

  it("3. matches Problem 5 p.241: Triangle ABC (30°, 40°) adjacent to isosceles CAD to find ∠D = 70° and ∠CAD = 40°", () => {
    const desc = "في الشكل المقابل قياس BAC = 30° وقياس B = 40° و AC = AD أوجد بالبرهان قياس D = 70° وقياس CAD = 40°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p241_5", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مجاور للمتساوي الساقين CAD");
  });

  it("4. matches Problem 7 p.241: Equilateral ABC with C midpoint of BD (BC=CD) to prove AD ⊥ BA", () => {
    const desc = "في الشكل المقابل ABC مثلث متساوي الأضلاع ، BC = CD أثبت أن AD ⊥ BA";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p241_7", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AD ⊥ BA");
  });

  it("5. matches Problem 8 p.242: Quadrilateral ABCD with DA // CB, AB = AD, ∠A = 120°, ∠BDC = 65° to find ∠C = 85°", () => {
    const desc = "شكل رباعي فيه DA // CB ، AB = AD ، قياس A = 120° وقياس BDC = 65° أوجد قياس زاوية C = 85°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p242_8", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DA // CB و AB = AD");
    expect(fig?.angles.some((a) => a.degrees === 120)).toBe(true);
  });

  it("6. matches Problem 9 p.242: Isosceles triangle with exterior angle bisector AE // BC", () => {
    const desc = "في الشكل المقابل AB = AC و A ينتمي للشعاع BD و AE // BC أثبت أن AE ينصف الزاوية الخارجة DAC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p242_9", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AE // BC ينصف الزاوية الخارجة DAC");
  });

  it("7. matches Problem 10 p.242: Triangle ABC with BD = DC, AB = AD to prove ∠ABC = 3 ∠C", () => {
    const desc = "في الشكل المقابل BD = DC و AB = AD أثبت أن قياس ABC = 3 قياس C";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p242_10", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("قياس ABC = 3 قياس C");
  });

  it("8. matches Problem 11 p.242: Isosceles triangle with algebraic angles (2X+13)° and (3X-17)° to find 73° and 34°", () => {
    const desc = "مثلث متساوي الساقين زاويتا قاعدته (2X+13)° و (3X-17)° أوجد قياسات زوايا المثلث 73° و 73° و 34°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p242_11", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("(2X+13)° و (3X-17)°");
  });

  it("9. matches Problem 15-3 p.243: Isosceles triangle with exterior angle 120° and 12 cm and 4X to find X = 3", () => {
    const desc = "مثلث متساوي الساقين له زاوية خارجية 120° وضلعان متساويان أحدهما 12 سم وقاعدة طولها 4X سم لإيجاد قيمة X";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p243_15_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("بزاوية خارجية 120° وضلعين 12 سم و 4X");
  });

  it("10. matches Problem 15-9 p.243: Right isosceles triangle 45°-45°-90° with hypotenuse 5√2 cm to find X = 5", () => {
    const desc = "مثلث قائم متساوي الساقين فيه زاوية 45° والوتر 5√2 سم أوجد قيمة الضلع X سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p243_15_9", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("قائم متساوي الساقين بزاوية 45° ووتر 5√2 سم");
  });

  it("11. matches Problem 17 p.244: Isosceles ABC with ∠A = 72° and base angle bisectors to prove DBC is isosceles", () => {
    const desc = "مثلث ABC فيه AB = AC وقياس A = 72° والشعاع BD ينصف زاوية B والشعاع CD ينصف زاوية C أثبت أن المثلث DBC متساوي الساقين";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p244_17", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("زاوية رأس 72° ومنصفا زاويتي القاعدة");
  });

  it("12. matches Problem 19 p.244: Two right triangles sharing hypotenuse AB with midpoint E to prove DEC is isosceles", () => {
    const desc = "في الشكل المقابل قياس ACB = قياس ADB = 90° و E منتصف الوتر المشترك AB أثبت أن المثلث DEC متساوي الساقين";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p244_19", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("المثلث DEC متساوي الساقين");
  });

  it("13. projects to valid Vector SVG markup", () => {
    const desc = "مثلث متساوي الساقين زاويتا قاعدته (2X+13)° و (3X-17)°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_svg_iso", "arabic");

    expect(fig).toBeDefined();
    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "eastern", notationLanguage: "arabic" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("viewBox");
  });
});
