/**
 * @file prep-grade2-isosceles-followup-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس تابع المثلث المتساوي الساقين ومحاور التماثل والثلاثيني الستيني (2ع).
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 2 Isosceles Followup and 30-60-90 Geometry Catalog", () => {
  it("1. matches Problem 4 p.256: Right isosceles in C with altitude CD ⊥ AB, AD = 20 to find AB = 40 and ∠DCB = 45°", () => {
    const desc = "مثلث ABC قائم الزاوية في C ومتساوي الساقين ، CD ⊥ AB ، طول AD = 20 سم أوجد طول AB = 40 سم وقياس DCB = 45°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p256_4", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("قائم في C ومتساوي الساقين بارتفاع CD ⊥ AB");
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);
  });

  it("2. matches Problem 6 p.256: Isosceles AB = AC = 15 with BC = 18 and altitude AD to find BD = 9 and AD = 12", () => {
    const desc = "في الشكل المقابل AB = AC = 15 سم و BC = 18 سم و الشعاع AE عمودي على BC أوجد طولي BD = 9 سم و AD = 12 سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p256_6", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AB = AC = 15 سم وقاعدة 18 سم وارتفاع AD = 12 سم");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 15)).toBe(true);
  });

  it("3. matches Problem 17 p.258: Tower with cables 19 m and (2X-3) m to find X = 11 and y = 50°", () => {
    const desc = "برج اتصالات مثبت بسلكين متساويين في الطول وزاوية الرأس مقسومة إلى 50° و y° وقاعدة السلكين 19 م و (2X-3) م فما قيمة كل من X ، y";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p258_17", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("برج اتصالات متماثل بسلكين متساويين");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 19)).toBe(true);
  });

  it("4. matches Problem 15 p.258: Trapezoid ABCD with AD // BC and MB = MC to prove common axis of symmetry", () => {
    const desc = "شكل رباعي فيه MB = MC و AD // BC أثبت أن محور تماثل AMD هو نفسه محور تماثل BMC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p258_15", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("محور تماثل مشترك");
  });

  it("5. matches Problem 19 p.259: 30-60-90 triangle with hypotenuse 16 cm and 5X-2 to find X = 2 and area = 32√3", () => {
    const desc = "مثلث ثلاثيني ستيني قائم في B بزاوية 30° ووتر 16 سم وضلع مقابل 5X - 2 أوجد قيمة X ومساحة المثلث 32√3 سم²";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p259_19", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مثلث ثلاثيني ستيني قائم في B بزاوية 30° ووتر 16 سم");
    expect(fig?.angles.some((a) => a.degrees === 30)).toBe(true);
  });

  it("6. matches Problem 20 p.259: 30-60-90 triangle ABC with midsegment FE = 6 cm to find BC = 6 cm", () => {
    const desc = "مثلث ثلاثيني ستيني فيه قياس CAB = 30° وقطعة FE = 6 سم واصلة بين منتصفي ضلعين أوجد طول BC = 6 سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p259_20", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مثلث ثلاثيني ستيني ABC بزاوية 30° ومثلث ADC بقطعة FE = 6 سم");
  });

  it("7. matches Problem 23 p.259: 30-60-90 triangle with hypotenuse 12 cm and medians meeting at G to find AB = 6 and EG = 2", () => {
    const desc = "المثلث ABC قائم الزاوية في B وقياس C = 30° و AC = 12 سم والمتوسطان يلتقيان في G أوجد طول AB = 6 سم و EG = 2 سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p259_23", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("بوتر 12 سم ومتوسطين يلتقيان في G");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 12)).toBe(true);
  });

  it("8. matches Problem 22 p.259: Isosceles with altitude AD ⊥ BC, BAD = 30°, BC = 9 cm to find AD = 9/2 √3", () => {
    const desc = "مثلث متساوي الساقين AB = AC مع ارتفاع AD ⊥ BC وقياس BAD = 30° و BC = 9 سم أوجد طول AD = 9/2 √3 سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p259_22", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("بارتفاع AD ⊥ BC وزاوية 30° وقاعدة 9 سم");
  });

  it("9. matches Problem 10 p.257: Deltoid XAYB with sides 15 and 13 cm and 10 and (5+n) to find n = 5", () => {
    const desc = "شكل دلتون XAYB بأضلاع 15 سم و 13 سم ومحور تماثل بأجزاء 10 سم و 5 + n سم لإيجاد قيمة n = 5";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p257_10", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("شكل دلتون XAYB بأضلاع 15 و 13 سم");
  });

  it("10. matches Problem 13 p.257: Isosceles triangles ABC and DBC with shared base BC to prove AD is the axis of symmetry", () => {
    const desc = "مثلثان متساويا الساقين ABC و DBC بقاعدة مشتركة BC فيهما AB = AC وقياس ABD = قياس ACD أثبت أن AD هو محور تماثل BC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p257_13", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("بقاعدة مشتركة لإثبات أن AD محور تماثل BC");
  });

  it("11. matches Problem 16 p.258: Pentagon ABCDE to prove BF ⊥ DE", () => {
    const desc = "مضلع خماسي ABCDE فيه AB = BC و AE = CD و F منتصف ED أثبت أن BF ⊥ DE";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p258_16", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("خماسي متماثل ABCDE بضلعين متساويين ومنتصف F");
  });

  it("12. projects to valid Vector SVG markup", () => {
    const desc = "مثلث ثلاثيني ستيني قائم في B بزاوية 30° ووتر 16 سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_svg_test_3060", "arabic");

    expect(fig).toBeDefined();
    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "eastern", notationLanguage: "arabic" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("viewBox");
  });
});
