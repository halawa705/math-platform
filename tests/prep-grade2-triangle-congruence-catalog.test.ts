/**
 * @file prep-grade2-triangle-congruence-catalog.test.ts
 * @description اختبارات شاملة لكتالوج أشكال درس التطابق (هندسة الصف الثاني الإعدادي - الوحدة 3 - الدرس 1):
 * يغطي مسائل كتاب المعاصر والمتميزون الواردة في الصور المرفوعة.
 */

import { describe, it, expect } from "vitest";
import { matchPrepGrade2TriangleCongruenceFigure } from "../src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-2/prep-grade2-triangle-congruence-catalog";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 2 Triangle Congruence Geometry Catalog", () => {
  it("1. matches Problem 4: Reflection in DB with angles 30° and 100°", () => {
    const desc = "في الشكل المقابل : Δ BCD صورة Δ BAD بالانعكاس في DB أوجد قيمة كل من X ، y";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p4", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("بالانعكاس في محور DB");
    expect(fig?.angles.some((a) => a.degrees === 30)).toBe(true);
    expect(fig?.angles.some((a) => a.degrees === 100)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 30)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("2. matches Problem 5: Right triangles ΔABC ≅ ΔHAD with lengths 25 and 15", () => {
    const desc = "في الشكل المقابل : إذا كان: Δ ABC ≅ Δ HAD أوجد قيمة: X + y";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p5", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ΔABC ≅ ΔHAD");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 25)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 15)).toBe(true);
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("3. matches Problem 10: Isosceles triangle with D midpoint of BC and 63°", () => {
    const desc = "في الشكل المقابل : النقطة D منتصف BC ، AB = AC ، m(∠ B) = 63° أثبت أن : Δ ADB ≅ Δ ADC أوجد بالبرهان : m(∠ DAC)";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p10", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("D منتصف القاعدة BC");
    expect(fig?.segments.some((s) => s.tickMarks === 2)).toBe(true);
    expect(fig?.angles.some((a) => a.degrees === 63)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("4. matches Problem 11: Scissor midpoint E of AB and CD with AC // DB", () => {
    const desc = "في الشكل المقابل : E نقطة منتصف كل من AB ، CD برهن أن : Δ AEC ≅ Δ BED وأن AC // DB";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p11", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("بتنصيف E للقطعتين");
    expect(fig?.vertices.some((v) => v.label === "E")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("5. matches Problem 12: O midpoint of BD with OA = OC and 34° for AOC = 112°", () => {
    const desc = "في الشكل المقابل : برهن أن : Δ OAB ≅ Δ OCD أوجد : m(∠ AOC) حيث O منتصف BD وزاوية 34°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p12", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ΔOAB ≅ ΔOCD");
    expect(fig?.angles.some((a) => a.degrees === 34)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("6. matches Problem 13: Kite with angle bisector AC and perimeter 12 cm", () => {
    const desc = "في الشكل المقابل : AB = 3.6 سم ، AC ينصف ∠ BAD ، CD = 2.4 سم برهن أن : Δ ACB ≅ Δ ACD أوجد : محيط المضلع ABCD";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p13", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ΔACB ≅ ΔACD");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 3.6)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 2.4)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("7. matches Problem 16: Perpendicular right pair ACB ≅ BDE with 55°", () => {
    const desc = "في الشكل المقابل : BC = DE ، AB = EB أثبت أن : Δ ACB ≅ Δ BDE أوجد : قيمة X مع زاوية 55°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p16", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ΔACB ≅ ΔBDE");
    expect(fig?.angles.some((a) => a.degrees === 55)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("8. matches Problem 18: Right triangles shared hypotenuse AD with 30°", () => {
    const desc = "في الشكل المقابل : مثلثان في وتر مشترك AD وقائمان مع زاوية 30° أوجد قيمة X";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p18", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("وتر مشترك AD");
    expect(fig?.angles.some((a) => a.degrees === 30)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("9. matches Problem 15: Collinear parallel transversal BC ≅ CE with AB // DC", () => {
    const desc = "في الشكل المقابل : BC ≅ CE ، AB // DC ، AC // DE برهن أن : Δ ABC ≅ Δ DCE";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p15", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ΔABC ≅ ΔDCE");
    expect(fig?.segments.some((s) => s.parallelArrows === 1)).toBe(true);
    expect(fig?.segments.some((s) => s.parallelArrows === 2)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("10. matches Problem 19: Isosceles triangle with BD ≅ CE", () => {
    const desc = "في الشكل المقابل : ∠ B ≅ ∠ C ، ∠ ADE ≅ ∠ AED ، BD ≅ CE أثبت أن : Δ ABD ≅ Δ ACE";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p19", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ΔABD ≅ ΔACE");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("11. matches Problem 22: Shared apex A with lengths 3 and 4 cm", () => {
    const desc = "في الشكل المقابل : برهن أن : Δ ABC ≅ Δ ADE وأطوال AB = 3 سم و AD = 3 سم و AE = 4 سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p22", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ΔABC ≅ ΔADE");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("12. matches Problem 24: Parallelogram secant BD with AD ≅ CB and AD // BC", () => {
    const desc = "في الشكل المقابل : AD ≅ CB ، AD // BC برهن أن : Δ ABD ≅ Δ CDB";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p24", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ΔABD ≅ ΔCDB");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("13. matches Problem 25: Parallelogram altitudes DE ⊥ AC and BF ⊥ AC", () => {
    const desc = "في الشكل المقابل : متوازي أضلاع برهن أن : AB // CD و DF = BE مع DE ⊥ AC و BF ⊥ AC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p25", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DE ⊥ AC و BF ⊥ AC");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("14. matches Problem 23: Shared line with BE ≅ FC and double parallels", () => {
    const desc = "في الشكل المقابل : BA // ED ، CA // FD ، BE ≅ FC برهن أن : Δ ABC ≅ Δ DEF";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p23", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ΔABC ≅ ΔDEF");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("15. matches Problem 27: Angle bisector with 78° for X = 36°", () => {
    const desc = "في الشكل المقابل : أثبت أن : Δ BCD ≅ Δ BED أوجد : قيمة X مع زاوية 78° وزاوية 30°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p27", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ΔBCD ≅ ΔBED");
    expect(fig?.angles.some((a) => a.degrees === 78)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("16. matches Problem 26: Right apex with BD = 15 cm", () => {
    const desc = "في الشكل المقابل : أوجد : طول BD مع AE = 7 سم و EB = 8 سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p26", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("BD = 15 سم");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("17. supports Arabic notation mode correctly", () => {
    const desc = "في الشكل المقابل : النقطة D منتصف BC ، AB = AC ، m(∠ B) = 63° أثبت أن : Δ ADB ≅ Δ ADC";
    const fig = matchPrepGrade2TriangleCongruenceFigure(desc, "fig_arabic", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.vertices.some((v) => v.label === "أ")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "ب")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "جـ")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "د")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "eastern", notationLanguage: "arabic" });
    expect(svg).toContain("<svg");
  });
});
