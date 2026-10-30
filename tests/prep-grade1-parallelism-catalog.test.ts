/**
 * @file prep-grade1-parallelism-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس التوازي للصف الأول الإعدادي (الوحدة 3 - الدرس 3).
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 1 Parallelism Geometry Catalog", () => {
  it("1. matches Problem 10 p.194: AB // CD // EF with A = 70° and C = 120° to find AEC = 130°", () => {
    const desc = "في الشكل المقابل AB // CD ، EF // CD وقياس A = 70° وقياس C = 120° أوجد بالبرهان قياس AEC = 130°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p194_10", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AEC = 130°");
    expect(fig?.angles.some((a) => a.degrees === 70)).toBe(true);
  });

  it("2. matches Problem 11 p.194: AB // EF with D = 100°, E = 115°, DAE = 35° to prove AB // DC", () => {
    const desc = "في الشكل المقابل AB // EF وفيه قياس D = 100° وقياس E = 115° وقياس DAE = 35° أثبت أن AB // DC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p194_11", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("إثبات أن AB // DC");
    expect(fig?.angles.some((a) => a.degrees === 100)).toBe(true);
  });

  it("3. matches Problem 14-6 p.196: Broken zigzag reflex angle (6X+40)° with 30° and 50° to find X = 40°", () => {
    const desc = "تفكير إبداعي: مستقيمان متوازيان مع زاويتي 30° و 50° وزاوية منعكسة (6X+40)° أوجد قيمة X = 40°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p196_14_6", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("(6X+40)°");
  });

  it("4. matches Problem 14-3 p.196: Broken zigzag right angle 90° with 40° to find X = 50°", () => {
    const desc = "شعاعان متوازيان وزاوية منكسرة قائمة 90° مع زاوية 40° أوجد قيمة X = 50°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p196_14_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("منكسرة قائمة 90°");
    expect(fig?.angles.some((a) => a.degrees === 90)).toBe(true);
  });

  it("5. matches Problem 5-1 p.192: Classic broken zigzag between parallel lines with 40° and 55° to find X = 95°", () => {
    const desc = "زاوية منكسرة بين مستقيمين متوازيين مع زاويتي 40° و 55° أوجد بالبرهان قيمة X = 95°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p192_5_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("X = 95°");
  });

  it("6. matches Problem 7-1 p.193: Proof of AB // CD by consecutive interior angles 100° + 80° = 180°", () => {
    const desc = "بيّن لماذا يكون AB // CD مع الزاويتين الداخلتين 100° و 80° وفي جهة واحدة من القاطع";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p193_7_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("100° + 80° = 180°");
  });

  it("7. matches Problem 9 p.193: BA // CD with B = 80°, C = 2y°, D = X° to find y = 50° and X = 80°", () => {
    const desc = "في الشكل المقابل BA // CD وفيه قياس B = 80° وقياس C = 2y° وقياس D = X° أوجد قيمة X و y";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p193_9", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("y = 50° و X = 80°");
  });

  it("8. matches Problem 6-1 p.193: Test if p // q with angles 57° and 122°", () => {
    const desc = "هل p // q أم لا ؟ ولماذا؟ مع الزاويتين 57° و 122°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p193_6_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("غير متوازيين");
  });

  it("9. matches Problem 4-7 p.192: Algebraic alternate (3X+15)° = 75° to find X = 20°", () => {
    const desc = "توازي وتبادل جبري (3X+15)° = 75° أوجد قيمة X = 20°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p192_4_7", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("(3X+15)° = 75°");
  });

  it("10. matches Problem 4-8 p.192: Algebraic corresponding (9X-5)° = (5X+15)° to find X = 5°", () => {
    const desc = "مستقيمان متوازيان بزوايا متناظرة (9X-5)° و (5X+15)° أوجد قيمة X = 5°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p192_4_8", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("(9X-5)° = (5X+15)°");
  });

  it("11. matches Problem 3-2 p.191: Consecutive interior U shape with 70° to find 110°", () => {
    const desc = "مستقيمان متوازيان زاويتان داخلتان في جهة واحدة من القاطع تداخل 70° لإيجاد 110°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p191_3_2", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("تداخل");
  });

  it("12. matches Problem 3-3 p.191: Alternate Z shape with 64° to find X = 64°", () => {
    const desc = "مستقيمان متوازيان بحالة تبادل حرف Z مع زاوية 64° أوجد قيمة X = 64°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p191_3_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("تبادل");
  });

  it("13. matches Problem 3-1 p.191: Corresponding F shape with 63°", () => {
    const desc = "مستقيمان متوازيان بحالة تناظر حرف F مع زاوية 63°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p191_3_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("تناظر");
  });

  it("14. matches general lesson keyword for prep grade 1 parallelism", () => {
    const desc = "درس التوازي والمستقيمات المتوازية والقاطع";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_general_parallel", "arabic");

    expect(fig).toBeDefined();
  });

  it("15. projects generated canonical IR figures cleanly to vector SVG markup", () => {
    const desc = "في الشكل المقابل AB // CD ، EF // CD وقياس A = 70° وقياس C = 120° أوجد بالبرهان قياس AEC = 130°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_svg_test_parallel", "arabic");

    expect(fig).toBeDefined();
    if (!fig) return;
    const svgMarkup = projectGeometryFigureToSVGMarkup(fig);
    expect(svgMarkup).toContain("<svg");
    expect(svgMarkup).toContain("</svg>");
    expect(svgMarkup).toContain("<line");
    expect(svgMarkup).toContain("<text");
  });
});
