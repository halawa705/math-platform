/**
 * @file prep-grade2-triangle-medians-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس متوسطات المثلث للصف الثاني الإعدادي.
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 2 Triangle Medians Geometry Catalog", () => {
  it("1. matches Problem 3 p.226: Medians BE and CD with DE = 6 cm and BE = 9, BC = 12 cm", () => {
    const desc = "في المثلث ABC المتوسطان BE = 9 سم و CD يتقاطعان في M ، وفيه BC = 12 سم و MC = 8 سم أوجد طول DE";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p226_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("متوسطان ونقطة تلاقي المتوسطات M");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 12)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 9)).toBe(true);
  });

  it("2. matches Problem 5 p.227: Three medians meeting at G with AP = 21, BG = 16, GQ = 5", () => {
    const desc = "إذا كانت G نقطة تقاطع متوسطات المثلث ABC وكان AP = 21 سم و GQ = 5 سم و BG = 16 سم أوجد طول BR و CG و PG";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p227_5", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("المتوسطات الثلاثة للمثلث ونقطة التلاقي G");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 21)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 16)).toBe(true);
  });

  it("3. matches Problem 22 p.230: Perpendicular medians AD ⊥ BE with CE = 15, BG = 18 to find AD = 18", () => {
    const desc = "في الشكل المقابل AD ⊥ BE و CE = 15 سم و BG = 18 سم أوجد بالبرهان طول AD";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p230_22", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("متوسطان متعامدان AD ⊥ BE");
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);
  });

  it("4. matches Problem 8 p.227: Medians CD and AF with AMC perimeter = 36 and MFD perimeter = 18", () => {
    const desc = "AF و CD متوسطان في المثلث ABC فإذا كان محيط المثلث AMC = 36 سم أوجد محيط المثلث MFD";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p227_8", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AMC = 36 سم ومحيط MFD = 18 سم");
  });

  it("5. matches Problem 9 p.227: Right triangle in A with median AD = 7 cm and segments 2X-3 and 3X-8", () => {
    const desc = "المثلث ABC قائم الزاوية في A ، فيه AD متوسط وطوله 7 سم ، BD = 2X - 3 و CD = 3X - 8 أوجد قيمة X";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p227_9", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("متوسط المثلث القائم من رأس القائمة AD = 7 سم");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 7)).toBe(true);
  });

  it("6. matches Problem 11 p.228: Right triangle in A with legs 24 and 18 cm, centroid G, AG = 10", () => {
    const desc = "المثلث ABC قائم الزاوية في A بأضلاع القائمة 24 سم و 18 سم ، G نقطة تقاطع متوسطات المثلث أوجد طول AG";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p228_11", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AG = 10 سم");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 24)).toBe(true);
  });

  it("7. matches Problem 18 p.229: Converse of median: AD = 17, BC = 34, AB = 16 to prove right angle and area 240", () => {
    const desc = "في المثلث ABC إذا كان AD متوسط وطوله 17 سم وكان BC = 34 سم و AB = 16 سم أثبت أن زاوية A قائمة ثم احسب مساحته";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p229_18", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("عكس نظرية المتوسط");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 34)).toBe(true);
  });

  it("8. matches Problem 20 p.229: Right triangle in A with ME ⊥ DC, ME = 4, DE = 3, BC = 30", () => {
    const desc = "المثلث ABC قائم الزاوية في A ، و M نقطة تلاقي متوسطاته ، ME ⊥ DC وفيه DE = 3 سم و ME = 4 سم أوجد طول BC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p229_20", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ME = 4 و DE = 3 لحساب الوتر BC = 30 سم");
    expect(fig?.angles.length).toBeGreaterThanOrEqual(2);
  });

  it("9. matches Problem 12 p.228: Right triangle with median BH and quad with midsegment EF to prove BH = EF", () => {
    const desc = "في الشكل المقابل BH متوسط في المثلث ABC القائم الزاوية في B و E و F منتصفا AD و CD أثبت أن BH = EF";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p228_12", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("BH = EF");
  });

  it("10. matches Problem 13 p.228: Two right triangles with EF = 9, AC = 18, DM = 6", () => {
    const desc = "المثلث ADC قائم الزاوية في D و M نقطة تلاقي متوسطات ADC وقطعة EF = 9 سم أوجد طول كل من AC و DM";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p228_13", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AC = 18 و DM = 6 سم");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 18)).toBe(true);
  });

  it("11. matches Problem 21 p.230: Parallelogram ABCD with diagonals meeting at M, DE = 2 EM to prove AF = FD", () => {
    const desc = "ABCD متوازي أضلاع تقاطع قطراه في M وفيه DE = 2 EM أثبت أن AF = FD";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p230_21", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DE = 2 EM لإثبات AF = FD");
  });

  it("12. matches Problem 15 p.229: Triangle with altitude AD ⊥ BC and midsegment EF to prove perimeter EFD = 1/2 perimeter ABC", () => {
    const desc = "مثلث ABC فيه AD ⊥ BC و E و F منتصفا AB و AC أثبت أن محيط المثلث EFD = نصف محيط ABC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p229_15", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("محيط EFD = 1/2 محيط ABC");
  });

  it("13. projects all figures to clean Vector SVG markup", () => {
    const desc = "في المثلث ABC المتوسطان BE = 9 سم و CD يتقاطعان في M ، وفيه BC = 12 سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_svg_test", "arabic");

    expect(fig).toBeDefined();
    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "eastern", notationLanguage: "arabic" });

    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("viewBox");
  });
});
