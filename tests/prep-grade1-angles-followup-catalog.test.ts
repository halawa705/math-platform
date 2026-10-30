/**
 * @file prep-grade1-angles-followup-catalog.test.ts
 * @description اختبارات شاملة لأشكال وفهرس درس تابع العلاقات بين الزوايا للصف الأول الإعدادي (الوحدة 3 - الدرس 1 تابع).
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 1 Angles Followup and Concurrent Angles Geometry Catalog", () => {
  it("1. matches Problem 8 p.176: Scissors angle problem (3X-18)° and (2X+12)° to find y = 26°", () => {
    const desc = "تفكير ناقد: إذا كان قياس الزاوية بين ذراعي المقص هما (3X-18)° و (2X+12)° وتم تقليلها أوجد قيمة y = 26°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p176_8", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("ذراعي المقص");
    expect(fig?.angles.some((a) => a.degreesLabel === "(3X-18)°")).toBe(true);
  });

  it("2. matches Problem 3 p.175: AC ∩ BD = {M} with CMD = 140° and MX bisecting AMB to find DMX = 110°", () => {
    const desc = "في الشكل المقابل AC ∩ BD = {M} وقياس CMD = 140° والشعاع MX ينصف AMB أوجد قياس DMX = 110°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p175_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("CMD = 140°");
    expect(fig?.angles.some((a) => a.degrees === 140)).toBe(true);
  });

  it("3. matches Problem 7-3 p.176: Vertically opposite (5X+7)° and (3X+57)° to find X = 25°", () => {
    const desc = "في الشكل المقابل زاويتان متقابلتان بالرأس (5X+7)° و (3X+57)° أوجد قيمة X = 25°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p176_7_3", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("(5X+7)°");
  });

  it("4. matches Problem 1-1 p.174: AB ∩ CD = {M} with AMC = 80° and DMB = 2X° to find X = 40°", () => {
    const desc = "في الشكل المقابل AB ∩ CD = {M} وقياس AMC = 80° وقياس DMB = 2X° أوجد قيمة X";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p174_1_1", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("2X°");
    expect(fig?.angles.some((a) => a.degrees === 80)).toBe(true);
  });

  it("5. matches Problem 1-6 p.174: Concurrent angles 70°, 100°, 80°, 10X° to find X = 11°", () => {
    const desc = "زوايا متجمعة حول نقطة M قياساتها 70° و 100° و 80° و 10X° أوجد قيمة X = 11°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p174_1_6", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("10X°");
    expect(fig?.angles.some((a) => a.degrees === 100)).toBe(true);
  });

  it("6. matches Problem 1-8 p.174: Concurrent angles with 140° and two equal angles X° to find X = 110°", () => {
    const desc = "ثلاث زوايا متجمعة حول نقطة M إحداها 140° والأخريان متساويتان X° و X° أوجد قيمة X = 110°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p174_1_8", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("140°");
    expect(fig?.angles.some((a) => a.degrees === 140)).toBe(true);
  });

  it("7. matches Problem 5 p.175: BMC = 2 AMB with AMB = 48° and DMC = 115° to find AMD = 101°", () => {
    const desc = "في الشكل المقابل BMC = 2 m(∠ AMB) وقياس DMC = 115° وقياس AMB = 48° أوجد قياس AMD = 101°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p175_5", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DMC = 115°");
    expect(fig?.angles.some((a) => a.degrees === 48)).toBe(true);
  });

  it("8. matches Problem 7-5 p.176: Concurrent angles with right angle 90° and (3X-5)°, (4X+2)°, (3X+63)° to find X = 21°", () => {
    const desc = "زوايا متجمعة حول نقطة فيها زاوية قائمة 90° وزوايا (3X-5)° و (4X+2)° و (3X+63)° أوجد قيمة X = 21°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p176_7_5", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("(3X-5)°");
    expect(fig?.angles.some((a) => a.degrees === 90)).toBe(true);
  });

  it("9. matches Problem 6 p.175: Collinear ABCD with ABE = 56° and XY ∩ BD = {C} to find DCY = 124°", () => {
    const desc = "النقاط A ، B ، C ، D تقع على مستقيم واحد مع ABE = 56° وتقاطع XY مع BD في C أوجد قياس DCY = 124°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p175_6", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DCY = 124°");
    expect(fig?.angles.some((a) => a.degrees === 56)).toBe(true);
  });

  it("10. matches Problem 4 p.175: CMX = 90° and AMY = 80° and XMB = 35° to find AMD = 125°", () => {
    const desc = "في الشكل المقابل CMX = 90° وقياس AMY = 80° وقياس XMB = 35° أوجد قياس زاوية AMD";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p175_4", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("CMX = 90°");
    expect(fig?.angles.some((a) => a.degrees === 90)).toBe(true);
  });

  it("11. matches Problem 1-2 p.174: AC ∩ BD = {M} with BMC = 120° and ME bisecting AMD to find EMD = 60°", () => {
    const desc = "في الشكل المقابل AC ∩ BD = {M} وقياس BMC = 120° والشعاع ME ينصف AMD أوجد قياس EMD = 60°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p174_1_2", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("EMD = 60°");
    expect(fig?.angles.some((a) => a.degrees === 120)).toBe(true);
  });

  it("12. matches general lesson keyword for prep grade 1 angles followup", () => {
    const desc = "تابع العلاقات بين الزوايا والزوايا المتجمعة حول نقطة";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_general_followup", "arabic");

    expect(fig).toBeDefined();
  });

  it("13. projects generated canonical IR figures cleanly to vector SVG markup", () => {
    const desc = "تفكير ناقد: إذا كان قياس الزاوية بين ذراعي المقص هما (3X-18)° و (2X+12)° وتم تقليلها أوجد قيمة y = 26°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_svg_test_scissors", "arabic");

    expect(fig).toBeDefined();
    if (!fig) return;
    const svgMarkup = projectGeometryFigureToSVGMarkup(fig);
    expect(svgMarkup).toContain("<svg");
    expect(svgMarkup).toContain("</svg>");
    expect(svgMarkup).toContain("<line");
    expect(svgMarkup).toContain("<text");
  });
});
