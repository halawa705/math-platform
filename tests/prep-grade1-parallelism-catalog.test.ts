/**
 * @file prep-grade1-parallelism-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس التوازي للصف الأول الإعدادي (الوحدة 3 - الدرس 3).
 */

import { describe, it, expect } from "vitest";
import {
  matchOptionalGeometryFigureFromArabicDescription,
  matchGeometryWithDiagnostics,
} from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";
import { renderKatexHtmlCached } from "../src/components/global-ui/math-katex-cached-html-renderer";

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

  it("16. Example 1 from PDF: AB // CD cut by EF at G & H with alternate (9x-5)° and (5x+15)°", () => {
    const desc = "في الشكل المقابل، إذا كان AB || CD، وكان المستقيم EF قاطعاً لهما في G و H على الترتيب، حيث m(∠AGH) = (9x - 5)° و m(∠GHD) = (5x + 15)° وهما زاويتان متبادلتان داخلياً، فأوجد قيمة x.";
    const res = matchGeometryWithDiagnostics(desc, "fig_ex1", "english");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F", "G", "H"]));
    expect(res.figure?.segments.some((s) => (s.parallelArrows ?? 0) > 0)).toBe(true);
    expect(res.figure?.angles.length).toBe(2);
  });

  it("17. Example 2 from PDF: BA // CD cut by BC with consecutive interior angle 60°", () => {
    const desc = "في الشكل المقابل، إذا كان BA || CD، وكان المستقيم BC قاطعاً لهما، حيث قياس الزاوية الداخلة m(∠C) = 60°، فأوجد قياس الزاوية الداخلة m(∠B).";
    const res = matchGeometryWithDiagnostics(desc, "fig_ex2", "english");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["B", "A", "C", "D"]));
    expect(res.figure?.segments.some((s) => (s.parallelArrows ?? 0) > 0)).toBe(true);
    expect(res.figure?.angles.some((a) => a.degrees === 60)).toBe(true);
  });

  it("18. Example 3 from PDF: AB // DE with broken angle at C (40° and 25°) to find ∠ACE", () => {
    const desc = "في الشكل المقابل، إذا كان AB || DE، وكانت الزاوية المنكسرة عند الرأس C تتكون من الشعاعين CA و CD، حيث m(∠CAB) = 40° و m(∠CDE) = 25°، فأوجد قياس ∠ACE.";
    const res = matchGeometryWithDiagnostics(desc, "fig_ex3", "english");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F"]));
    expect(res.figure?.segments.some((s) => s.strokeStyle === "dashed")).toBe(true);
  });

  it("19. Example 4 from PDF: AB // CD with point E between lines (45° and 130°) to find m(∠AEC)", () => {
    const desc = "في الشكل المقابل، إذا كان AB || CD، وكانت نقطة E تقع بين المستقيمين، حيث m(∠A) = 45° و m(∠C) = 130°، فأوجد قياس الزاوية المنكسرة m(∠AEC).";
    const res = matchGeometryWithDiagnostics(desc, "fig_ex4", "english");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "E", "C", "D"]));
  });

  it("20. Example 5 from PDF: CA // BE with 125°, 55°, 55° to prove AB // CD", () => {
    const desc = "في الشكل المقابل، إذا كان CA || BE، وكان m(∠C) = 125° و m(∠B) = 55° و m(∠A) = 55°، فأثبت أن AB || CD.";
    const res = matchGeometryWithDiagnostics(desc, "fig_ex5", "english");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["C", "D", "A", "B", "E"]));
  });

  it("21. Example 6 from PDF: EC cuts AB and CD with corresponding angles 110° and 110°", () => {
    const desc = "في الشكل المقابل، إذا كان القاطع EC يقطع المستقيمين AB و CD في النقطتين B و C على الترتيب، حيث m(∠EBA) = 110° و m(∠BCD) = 110°، فأثبت أن AB || CD.";
    const res = matchGeometryWithDiagnostics(desc, "fig_ex6", "english");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["E", "B", "C", "A", "D"]));
  });

  it("22. Example 7 from PDF: AB // CD with bisector BF and corresponding (2x+10)°", () => {
    const desc = "في الشكل المقابل، إذا كان AB || CD، وكان الشعاع BF ينصف ∠EBA حيث m(∠FBA) = 55°، وكان m(∠DCB) = (2x + 10)° بالتناظر مع ∠EBA، فأوجد قيمة x.";
    const res = matchGeometryWithDiagnostics(desc, "fig_ex7", "english");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["E", "B", "C", "A", "D", "F"]));
    expect(res.figure?.segments.some((s) => s.isRay)).toBe(true);
  });

  it("23. Example 8 from PDF: l1 // l2 with perpendicular transversal n ⊥ l1", () => {
    const desc = "في الشكل المقابل، إذا كان l1 || l2 وكان المستقيم n عمودياً على l1 (n ⊥ l1) عند نقطة A ويقطع l2 في نقطة B، فأثبت برهانياً أن المستقيم n عمودي على l2 (n ⊥ l2) واحسب قياس الزاوية القائمة الناتجة.";
    const res = matchGeometryWithDiagnostics(desc, "fig_ex8", "english");
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B"]));
    expect(res.figure?.angles.some((a) => a.isRightAngle)).toBe(true);
  });

  it("24. Slanted parallel symbol: renders slanted double solidus in KaTeX output", () => {
    const html = renderKatexHtmlCached("AB \\parallel CD");
    // يجب أن يصيّر رمز التوازي كشرطتين مائلتين (مائل قليلاً) وليس || الرأسي
    expect(html).toContain("mspace");
    expect(html).not.toContain("<span class=\"mrel\">∥</span>");
  });
});
