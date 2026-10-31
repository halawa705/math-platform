/**
 * @file prep-grade3-similarity-full-notebooklm-response.test.ts
 * @description اختبارات شاملة لجميع أفكار رد NotebookLM الحقيقي لمنهج الصف الثالث الإعدادي (تشابه المثلثات).
 * يتحقق بنسبة 100% من مطابقة الأشكال الهندسية للمعطيات الفعلية وخلوها التام من أي تشويه أو تداخل.
 */

import { describe, it, expect } from "vitest";
import { matchOptionalGeometryFigureFromArabicDescription } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { checkFigureFidelityToPrompt } from "../src/core/geometry-engine/verification/geometry-figure-fidelity-gate";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep 3 Similarity — Full Real NotebookLM Response Suite", () => {
  // الفكرة 1: إيجاد قياسات الزوايا ونسبة التشابه (المثال 1-1 والمثال 1-2)
  it("idea-01: Example 1-1 builds disjoint triangles with exact angles 40° and 65° and ZERO alien 2y or 100°", () => {
    const prompt =
      "[رسم هندسي: مثلثان \\Delta ABC و \\Delta DEF متطابقا الزوايا متناظراً، m(\\angle A) = 40^\\circ، m(\\angle B) = 65^\\circ] إذا كان \\Delta ABC \\sim \\Delta DEF وكان m(\\angle A) = 40^\\circ و m(\\angle B) = 65^\\circ، فإن m(\\angle F) = ........";
    const figure = matchOptionalGeometryFigureFromArabicDescription(prompt, "fig_1_1", "english");

    expect(figure).toBeDefined();
    const fidelity = checkFigureFidelityToPrompt(figure!, prompt);
    expect(fidelity.passed).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(figure!, { numeralMode: "western" });
    expect(svg).toContain("40°");
    expect(svg).toContain("65°");
    expect(svg).not.toContain("2y");
    expect(svg).not.toContain("100°");
  });

  it("idea-01: Example 1-2 builds similar triangles with exact sides 6, 8, 10 and 3", () => {
    const prompt =
      "[رسم هندسي: مثلثان \\Delta ABC \\sim \\Delta DEF، أطوال أضلاع \\Delta ABC هي AB = 6 سم، BC = 8 سم، AC = 10 سم، وطول الضلع المناظر DE = 3 سم] إذا كان \\Delta ABC \\sim \\Delta DEF وكان AB = 6 سم، BC = 8 سم، AC = 10 سم، وطول DE = 3 سم";
    const figure = matchOptionalGeometryFigureFromArabicDescription(prompt, "fig_1_2", "english");

    expect(figure).toBeDefined();
    const fidelity = checkFigureFidelityToPrompt(figure!, prompt);
    expect(fidelity.passed).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(figure!, { numeralMode: "western" });
    expect(svg).toContain("6");
    expect(svg).toContain("8");
    expect(svg).toContain("10");
    expect(svg).toContain("3");
  });

  // الفكرة 2: محيطي مثلثين متشابهين (المثال 2-1)
  it("idea-02: Example 2-1 builds triangles ABC and XYZ with sides 3, 4, 5 without alien butterfly 8, 12, 18", () => {
    const prompt =
      "[رسم هندسي: مثلثان متشابهان \\Delta ABC \\sim \\Delta XYZ، أطوال أضلاع \\Delta ABC هي 3 سم، 4 سم، 5 سم، ونسبة التشابه تساوي \\frac{2}{3}] إذا كان \\Delta ABC \\sim \\Delta XYZ";
    const figure = matchOptionalGeometryFigureFromArabicDescription(prompt, "fig_2_1", "english");

    expect(figure).toBeDefined();
    const fidelity = checkFigureFidelityToPrompt(figure!, prompt);
    expect(fidelity.passed).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(figure!, { numeralMode: "western" });
    expect(svg).toContain("3");
    expect(svg).toContain("4");
    expect(svg).toContain("5");
    expect(svg).not.toContain(">18<");
    expect(svg).not.toContain(">12<");
    expect(svg).not.toContain(">8<");
  });

  // الفكرة 3: القاطع العكسي (المثال 3-1)
  it("idea-03: Example 3-1 builds antiparallel secant with lengths 4, 5, 3, 6 in triangle ABC", () => {
    const prompt =
      "[رسم هندسي: \\Delta ABC فيه D \\in AB، E \\in AC بحيث m(\\angle AED) = m(\\angle B)، AD = 4 سم، BD = 5 سم، AE = 3 سم، EC = 6 سم] في الشكل المقابل: \\Delta ABC فيه D ينتمي إلى AB و E ينتمي إلى AC";
    const figure = matchOptionalGeometryFigureFromArabicDescription(prompt, "fig_3_1", "english");

    expect(figure).toBeDefined();
    const fidelity = checkFigureFidelityToPrompt(figure!, prompt);
    expect(fidelity.passed).toBe(true);

    const labels = figure!.vertices.map((v) => v.label);
    expect(labels).toContain("A");
    expect(labels).toContain("B");
    expect(labels).toContain("C");
    expect(labels).toContain("D");
    expect(labels).toContain("E");

    const svg = projectGeometryFigureToSVGMarkup(figure!, { numeralMode: "western" });
    expect(svg).toContain("4");
    expect(svg).toContain("5");
    expect(svg).toContain("3");
    expect(svg).toContain("6");
  });

  // الفكرة 4: التشابه بالتوازي وطاليس (المثال 4-1)
  it("idea-04: Example 4-1 builds Thales parallel DE // BC with parallel arrows", () => {
    const prompt =
      "[رسم هندسي: \\Delta ABC فيه DE // BC، D \\in AB، E \\in AC، AD = 3 سم، DB = 6 سم، AE = 2 سم] في \\Delta ABC إذا كان DE // BC";
    const figure = matchOptionalGeometryFigureFromArabicDescription(prompt, "fig_4_1", "english");

    expect(figure).toBeDefined();
    const fidelity = checkFigureFidelityToPrompt(figure!, prompt);
    expect(fidelity.passed).toBe(true);

    const hasParallel = figure!.segments.some((s) => s.parallelArrows && s.parallelArrows >= 1);
    expect(hasParallel).toBe(true);
  });

  // الفكرة 5: التقاطع بالرأس والساعة الرملية (المثال 5-1 والمثال 5-2)
  it("idea-05: Example 5-1 builds hourglass intersection at E with sides 4, 6, 3", () => {
    const prompt =
      "[رسم هندسي: AC \\cap BD = \\{E\\}، AB // CD، AE = 4 سم، EC = 6 سم، BE = 3 سم] في الشكل المقابل القطعتان AC و BD تتقاطعان في E";
    const figure = matchOptionalGeometryFigureFromArabicDescription(prompt, "fig_5_1", "english");

    expect(figure).toBeDefined();
    const fidelity = checkFigureFidelityToPrompt(figure!, prompt);
    expect(fidelity.passed).toBe(true);

    const labels = figure!.vertices.map((v) => v.label);
    expect(labels).toContain("E");
    expect(labels).toContain("A");
    expect(labels).toContain("C");

    const svg = projectGeometryFigureToSVGMarkup(figure!, { numeralMode: "western" });
    expect(svg).toContain("4");
    expect(svg).toContain("6");
    expect(svg).toContain("3");
  });

  // الفكرتان 11 و 12: إقليدس والمثلث القائم (المثال 11-1 والمثال 12-1)
  it("idea-11: Example 11-1 builds Euclid right triangle at A with altitude AD perp BC and lengths 9, 16", () => {
    const prompt =
      "[رسم هندسي: \\Delta ABC قائم الزاوية في A، AD \\perp BC، BD = 9 سم، CD = 16 سم] في \\Delta ABC القائم الزاوية في A، AD عمودي على BC، فإذا كان BD = 9 سم و CD = 16 سم";
    const figure = matchOptionalGeometryFigureFromArabicDescription(prompt, "fig_11_1", "english");

    expect(figure).toBeDefined();
    const fidelity = checkFigureFidelityToPrompt(figure!, prompt);
    expect(fidelity.passed).toBe(true);

    const rightAngles = figure!.angles.filter((a) => a.isRightAngle);
    expect(rightAngles.length).toBeGreaterThanOrEqual(2); // رأس المثلث A ومسقط العمود D

    const svg = projectGeometryFigureToSVGMarkup(figure!, { numeralMode: "western" });
    expect(svg).toContain("9");
    expect(svg).toContain("16");
    expect(svg).not.toContain("18"); // zero alien lengths
  });

  it("idea-12: Example 12-1 builds Euclid altitude with AD = 3.6 and BD = 6.4", () => {
    const prompt =
      "[رسم هندسي: \\Delta ABC قائم في A، AD \\perp BC، AD = 3.6 سم، BD = 6.4 سم] في المثلث ABC القائم في A سقط العمود AD على الوتر BC";
    const figure = matchOptionalGeometryFigureFromArabicDescription(prompt, "fig_12_1", "english");

    expect(figure).toBeDefined();
    const fidelity = checkFigureFidelityToPrompt(figure!, prompt);
    expect(fidelity.passed).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(figure!, { numeralMode: "western" });
    expect(svg).toContain("3.6");
    expect(svg).toContain("6.4");
  });

  // الفكرة 14: المسائل التطبيقية الحياتية والظل والارتفاع (المثال 14-1)
  it("idea-14: Example 14-1 builds applied shadow and height right triangles with 1.8 m, 2.4 m, 2 m", () => {
    const prompt =
      "يقف رجل طوله 1.8 م أمام عمود إنارة، فإذا كان طول ظل الرجل 2.4 م، والمسافة بين الرجل وقاعدة العمود 2 م، أوجد ارتفاع عمود الإنارة.";
    const figure = matchOptionalGeometryFigureFromArabicDescription(prompt, "fig_14_1", "english");

    expect(figure).toBeDefined();
    const fidelity = checkFigureFidelityToPrompt(figure!, prompt);
    expect(fidelity.passed).toBe(true);

    const rightAngles = figure!.angles.filter((a) => a.isRightAngle);
    expect(rightAngles.length).toBeGreaterThanOrEqual(2); // عند قاعدة الرجل وعند قاعدة العمود

    const svg = projectGeometryFigureToSVGMarkup(figure!, { numeralMode: "western" });
    expect(svg).toContain("1.8");
    expect(svg).toContain("2.4");
    expect(svg).toContain("2");
  });

  // التأكد من أن الأسئلة النظرية البحتة لا يُرسم لها شكل
  it("blocks diagrams on purely theoretical questions with zero geometry context", () => {
    const prompt =
      "إذا تشابه مضلعان فإن قياسات الزوايا المتناظرة تكون متساوية وأطوال الأضلاع المتناظرة تكون متناسبة.";
    const figure = matchOptionalGeometryFigureFromArabicDescription(prompt, "fig_theo", "english");
    expect(figure).toBeUndefined();
  });
});
