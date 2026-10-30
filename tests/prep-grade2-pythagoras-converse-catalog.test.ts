/**
 * @file prep-grade2-pythagoras-converse-catalog.test.ts
 * @description اختبارات شاملة لكتالوج أشكال درس نظرية فيثاغورس وعكسها (هندسة الصف الثاني الإعدادي - الوحدة 3 - الدرس 2):
 * يغطي مسائل امتحانات المحافظات الواردة في الصور المرفوعة (الغربية، المنوفية، الدقهلية، الجيزة).
 */

import { describe, it, expect } from "vitest";
import { matchPrepGrade2PythagorasConverseFigure } from "../src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-2/prep-grade2-pythagoras-converse-catalog";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 2 Pythagoras Theorem and Converse Geometry Catalog", () => {
  it("1. matches Problem 6: Triangle with altitude AD ⊥ BC and lengths 12, 13, 15 cm for area 84 cm²", () => {
    const desc = "في الشكل المقابل : إذا كانت AD ⊥ BC ، AD = 12 سم ، AC = 15 سم ، AB = 13 سم أوجد : مساحة المثلث ABC";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p6", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مساحة المثلث = 84 سم²");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 12)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 13)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 15)).toBe(true);
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("2. matches Problem 23: Quad with right angle B and sides 7, 24, 20, 15 cm to prove AD ⊥ CD", () => {
    const desc = "في الشكل المقابل : ABCD شكل رباعي فيه m(∠ B) = 90° ، AB = 7 سم ، BC = 24 سم ، CD = 20 سم ، AD = 15 سم أثبت أن : AD ⊥ CD";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p23", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AD ⊥ CD");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 24)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 7)).toBe(true);
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("3. matches Problem 28: Quad with right angle B and sides 9, 12, 8, 17 cm for area 114 cm²", () => {
    const desc = "في الشكل المقابل : ABCD شكل رباعي فيه m(∠ B) = 90° ، AB = 9 سم ، BC = 12 سم ، AD = 8 سم ، CD = 17 سم أثبت أن m(∠ DAC) = 90° ثم أوجد : مساحة الشكل ABCD";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p28", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("لمساحة 114 سم²");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 17)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("4. matches Problem 4-1: Right trapezoid with AD = 4 and EC = 3 to find hypotenuse X", () => {
    const desc = "أوجد قيمة X في الشكل حيث EC = 3 سم و BC = 4 سم في شبه منحرف قائم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p4_1", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("الوتر X بنظرية فيثاغورس");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 3)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("5. matches Problem 5-2: Right trapezoid with bases 10 and 16 cm and slant side 10 cm", () => {
    const desc = "أوجد مساحة شبه منحرف قائم قاعدتاه 10 سم و 16 سم وساقه المائلة 10 سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p5_2", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("أبعاد 10 و 16 سم");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("6. matches Problem 7: Right trapezoid with AB // DC and DC = 35 cm for perimeter 90 cm", () => {
    const desc = "في الشكل المقابل : إذا كانت AB // DC ، AD = 13 سم ، AB = 5 سم ، DC = 35 سم أوجد : محيط المضلع ABCD";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p7", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("المحيط = 90 سم");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 35)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("7. matches Problem 4-2: Altitude 3 and base 11 for X", () => {
    const desc = "أوجد قيمة X في مثلث مقسوم بعمود وفيه قاعدة 11 وارتفاع 3 بنظرية فيثاغورس";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p4_2", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ارتفاعه 3 وقاعدة 11");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("8. matches Problem 4-3: Altitude 6 and base 12 and side 10 for X", () => {
    const desc = "أوجد قيمة X في مثلث فيه قاعدة 12 وارتفاع 6 وضلع 10 بنظرية فيثاغورس";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p4_3", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ارتفاعه 6 وقاعدة 12");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("9. matches Problem 25: Converse of Pythagoras to prove angle BAC is right with 2, 1, 4 cm", () => {
    const desc = "في الشكل المقابل : AD ⊥ BC ، AD = 2 سم ، BD = 1 سم ، DC = 4 سم أثبت أن : m(∠ BAC) = 90°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p25", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("زاوية BAC قائمة");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 2)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("10. matches Problem 27: Double perpendicular triangles XYZ and CDX with XD = DZ", () => {
    const desc = "في الشكل المقابل : XD = DZ ، CX = 6 سم ، CD = 6.5 سم ، m(∠ Y) = 90° ، XY = 3 سم ، YZ = 4 سم أثبت أن : m(∠ CXD) = 90°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p27", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("زاوية CXD قائمة");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 6.5)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("11. matches Problem 29: Quad with sides 32, 24, 9, 45 to prove ACD is obtuse", () => {
    const desc = "في الشكل المقابل : ABCD شكل رباعي فيه m(∠ B) = 90° ، AB = 32 سم ، BC = 24 سم ، CD = 9 سم ، AD = 45 سم أثبت أن : المثلث ACD منفرج الزاوية";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p29", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مثلث ACD منفرج");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("12. supports Arabic notation mode correctly", () => {
    const desc = "إذا كانت AD ⊥ BC ، AD = 12 سم ، AC = 15 سم ، AB = 13 سم أوجد مساحة المثلث ABC";
    const fig = matchPrepGrade2PythagorasConverseFigure(desc, "fig_arabic", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.vertices.some((v) => v.label === "أ")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "ب")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "جـ")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "د")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "eastern", notationLanguage: "arabic" });
    expect(svg).toContain("<svg");
  });
});
