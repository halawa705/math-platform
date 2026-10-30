/**
 * @file prep-grade1-angles-relationships-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس أنواع الزوايا والعلاقات بينها للصف الأول الإعدادي (الوحدة 3 - الدرس 1).
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 1 Angles and Angle Relationships Geometry Catalog", () => {
  it("1. matches Problem 6-1 p.163: Complementary angles AC ⊥ AB with 25° to find X = 65°", () => {
    const desc = "في الشكل المقابل AC ⊥ AB ، قياس زاوية DAB = 25° أوجد قيمة X";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p163_6_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("زاويتان متتامتان");
    expect(fig?.angles.some((a) => a.degrees === 25)).toBe(true);
  });

  it("2. matches Problem 6-2 p.163: Right angle trisected into three equal angles to find EAD = 30°", () => {
    const desc = "في الشكل AC ⊥ AB زاوية قائمة مقسمة إلى ثلاث زوايا متساوية أوجد قياس زاوية EAD = 30°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p163_6_2", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("زاوية قائمة مقسمة إلى ثلاث زوايا متطابقة");
    expect(fig?.angles.some((a) => a.degrees === 30)).toBe(true);
  });

  it("3. matches Problem 7 p.165: Algebraic complementary angles (2X+2)° and (X+1)° to find X = 29°", () => {
    const desc = "زاويتان متتامتان AC ⊥ AB قياسهما (2X+2)° و (X+1)° أوجد قيمة X = 29°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p165_7", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("(2X+2)°");
  });

  it("4. matches Problem 14 p.165: Crossing barrier gate at 42° and (3X+3)° to find X = 15", () => {
    const desc = "ذراع بوابة العبور يصنع زاوية 42° مع القائم وزاوية (3X+3)° مع الأفقي أوجد قيمة X = 15";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p165_14", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ذراع بوابة العبور");
  });

  it("5. matches Problem 7-1 p.163: Supplementary angles on straight line A ∈ BC with 35° to find X = 145°", () => {
    const desc = "في الشكل المقابل A ∈ BC مستقيم ، قياس زاوية DAB = 35° أوجد قيمة X = 145°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p163_7_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("زاويتان متكاملتان على خط مستقيم");
    expect(fig?.angles.some((a) => a.degrees === 35)).toBe(true);
  });

  it("6. matches Problem 12-1 p.164: Collinear rays test OA and OB with 144° and 36° to check collinearity", () => {
    const desc = "في الشكل المقابل هل OA و OB على استقامة واحدة مع الزاويتين 144° و 36° ؟ ولماذا؟";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p164_12_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("استقامة الشعاعين OA و OB");
    expect(fig?.angles.some((a) => a.degrees === 144)).toBe(true);
  });

  it("7. matches Problem 8 p.165: Algebraic supplementary angles (5X+2)° and (4X-2)° to find X = 20°", () => {
    const desc = "النقطة B ∈ AC مستقيم زاويتان متكاملتان قياسهما (5X+2)° و (4X-2)° أوجد قيمة X = 20°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p165_8", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("(5X+2)°");
  });

  it("8. matches Problem 11 p.165: Three adjacent angles on line 5X°, 3X°, 2X° to find X = 18°", () => {
    const desc = "النقطة A ∈ CB مستقيم عليه ثلاث زوايا متجاورة 5X و 3X و 2X أوجد قيمة X = 18°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p165_11", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("5X° و 3X° و 2X°");
  });

  it("9. matches Problem 13-5 p.164: Vertically opposite angles (2X+26)° = (3X-21)° to find X = 47°", () => {
    const desc = "زاويتان متقابلتان بالرأس قياسهما (2X+26)° و (3X-21)° أوجد قيمة X = 47°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p164_13_5", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("متقابلتان بالرأس");
  });

  it("10. matches Problem 10 p.164: Straight line with bisected angle NOZ by OM with YOX = 50° to find MOX = 160°", () => {
    const desc = "الشعاع OM ينصف زاوية NOZ و O ∈ XN مستقيم وقياس YOX = 50° أوجد بالبرهان قياس زاوية MOX = 160°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p164_10", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("منصف OM للزاوية NOZ");
  });

  it("11. matches Problem 15 p.165: Squash ball wall rebound at 50° and angles (4X+21)° and (6X-1)° to find X = 11", () => {
    const desc = "كرة إسكواش ارتطمت بالحائط بزاوية 50° مع زاويتي ارتداد (4X+21)° و (6X-1)° أوجد قيمة X = 11";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p165_15", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ارتطام كرة الإسكواش بالحائط");
  });

  it("12. matches general lesson keyword for prep grade 1 angle relationships", () => {
    const desc = "أنواع الزوايا والعلاقات بين الزوايا المتتامة والمتكاملة";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_general", "arabic");

    expect(fig).toBeDefined();
  });

  it("13. projects generated canonical IR figures cleanly to vector SVG markup", () => {
    const desc = "في الشكل المقابل AC ⊥ AB ، قياس زاوية DAB = 25° أوجد قيمة X";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_svg_test", "arabic");

    expect(fig).toBeDefined();
    if (!fig) return;
    const svgMarkup = projectGeometryFigureToSVGMarkup(fig);
    expect(svgMarkup).toContain("<svg");
    expect(svgMarkup).toContain("</svg>");
    expect(svgMarkup).toContain("<line");
    expect(svgMarkup).toContain("<text");
  });
});
