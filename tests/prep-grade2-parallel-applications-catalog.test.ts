/**
 * @file prep-grade2-parallel-applications-catalog.test.ts
 * @description اختبارات شاملة لكتالوج أشكال درس تطبيقات التوازي (هندسة الصف الثاني الإعدادي - الوحدة 3 - الدرس 3):
 * يغطي مسائل نظرية طاليس الخاصة والقطع الواصلة بين منتصفات أضلاع المثلث وامتحانات المحافظات.
 */

import { describe, it, expect } from "vitest";
import { matchPrepGrade2ParallelApplicationsFigure } from "../src/core/geometry-engine/curriculum-catalogs/prep-stage/grade-2/prep-grade2-parallel-applications-catalog";
import {
  matchGeometryWithDiagnostics,
  matchOptionalGeometryFigureFromArabicDescription,
} from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";

describe("Prep Grade 2 Parallel Applications Geometry Catalog", () => {
  it("1. matches Problem 8 p.210: Thales four parallels with XE = 6 cm and EF = m + 2", () => {
    const desc = "في الشكل المقابل : XA // YB // EC // FD ، AB = BC = CD ، XE = 6 سم ، EF = (m + 2) سم فإن : قيمة m";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p8_210", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("نظرية طاليس الخاصة بأربعة مستقيمات متوازية");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 6)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("2. matches Problem 3 p.210: Two transversals with 4X, 8, y+1", () => {
    const desc = "في كل من الشكلين الآتيين : l1 // l2 // l3 // l4 ، قاطعان لهم مع أجزاء 4X سم و 8 سم و (y+1) سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p3_210", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("قاطعان لمستقيمات متوازية بأجزاء متساوية");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 8)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("3. matches Problem 18 p.214: Multiple parallels FD // GE with GK = 8 cm to find KE = 24 cm", () => {
    const desc = "في الشكل المقابل : FD // GE ، GK = 8 سم ، AG = GF = FB أوجد : طول KE";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p18_214", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("توازيات متعددة FD // GE");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 8)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("4. matches Problem 8 p.212: Midsegments FED of sides 6, 8, 10 cm for perimeter 12 cm", () => {
    const desc = "في الشكل المقابل : D ، E ، F منتصفات AB ، BC ، AC على الترتيب ، أطوال الأضلاع 6 سم و 8 سم و 10 سم أوجد : محيط المثلث FED";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p8_212", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("محيط المثلث FED");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 6)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 8)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 10)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("5. matches Problem 13 p.213: Midsegment DE = (2X+1) and BC = (5X-5) for X = 7", () => {
    const desc = "في الشكل المقابل : D ، E منتصفا AB ، AC أوجد قيمة X حيث DE = (2X+1) سم و BC = (5X-5) سم";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p13_213", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DE = 2X+1 و BC = 5X-5");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("6. matches Problem 6 p.211: Right triangle in C with AB = 5, BC = 4 for DE = 1.5 cm", () => {
    const desc = "في الشكل المقابل : ABC مثلث فيه m(∠ C) = 90° ، D ، E منتصفا AB ، BC على الترتيب ، BC = 4 سم ، AB = 5 سم أوجد بالبرهان : طول DE";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p6_211", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("DE = 1.5 سم");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 4)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 5)).toBe(true);
    expect(fig?.angles.some((a) => a.isRightAngle)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("7. matches Problem 7 p.211: Quad ABCD with midpoints Z and X and ZY // DC for perimeter of AXY", () => {
    const desc = "في الشكل المقابل : ABCD شكل رباعي فيه : Z ، X منتصفا AD ، AB على الترتيب ، ZY // DC بحيث YC = 4 سم أوجد : محيط المثلث AXY";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p7_211", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("لحساب محيط AXY");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 4)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("8. matches Problem 12 p.212: Quad with midsegment FE = 10 cm and 12, 16 to prove D = 90°", () => {
    const desc = "في الشكل المقابل : E منتصف BC ، F منتصف AB ، FE = 10 سم ، DC = 16 سم ، AD = 12 سم أثبت أن : m(∠ D) = 90°";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p12_212", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("قطعة FE = 10 سم");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 10)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 16)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("9. matches Problem 19 p.214: Parallelogram ABCD with midpoints E and F to prove AC = 3 AG", () => {
    const desc = "في الشكل المقابل : ABCD متوازي أضلاع إذا كانت : E ، F منتصفي BC ، AD على الترتيب . فأثبت أن : AC = 3 AG";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p19_214", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("AC = 3 AG");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("10. matches Problem 21 p.214: Iterated midsegments to prove BC = 4 GH", () => {
    const desc = "في الشكل المقابل : إذا كانت D منتصف AB ، E منتصف AC ، G منتصف DF برهن أن : BC = 4 GH";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p21_214", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("BC = 4 GH");

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("11. matches Problem 22 p.214: Quad ABCD right at D with midpoints to find area BEF = 15 cm²", () => {
    const desc = "في الشكل المقابل : ABCD شكل رباعي فيه AD = 9 سم ، CD = 12 سم ، AB = 4 سم أوجد مساحة المثلث BEF";
    const fig = matchOptionalGeometryFigureFromArabicDescription(desc, "fig_p22_214", "english");

    expect(fig).toBeDefined();
    expect(fig?.titleArabic).toContain("مساحة BEF = 15 سم²");
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 9)).toBe(true);
    expect(fig?.segments.some((s) => s.lengthLabel?.value === 12)).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "western", notationLanguage: "english" });
    expect(svg).toContain("<svg");
  });

  it("12. supports Arabic notation mode correctly", () => {
    const desc = "في الشكل المقابل : D ، E ، F منتصفات AB ، BC ، AC على الترتيب ، أوجد : محيط المثلث FED";
    const fig = matchPrepGrade2ParallelApplicationsFigure(desc, "fig_arabic", "arabic");

    expect(fig).toBeDefined();
    expect(fig?.vertices.some((v) => v.label === "أ")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "ب")).toBe(true);
    expect(fig?.vertices.some((v) => v.label === "جـ")).toBe(true);

    const svg = projectGeometryFigureToSVGMarkup(fig!, { numeralMode: "eastern", notationLanguage: "arabic" });
    expect(svg).toContain("<svg");
  });

  it("13. generates diagrams for concrete verbal parallel-transversal and midpoint problems (Track B4–B5)", () => {
    const prompts = [
      "إذا كانت عدة مستقيمات متوازية وقسمت قاطعاً لها إلى 4 أجزاء متساوية طول كل منها 3 سم ، وكان قاطع آخر لها طوله الكلي 20 سم ، فما طول كل جزء من أجزاء القاطع الآخر؟",
      "مستقيمات متوازية تقطع قاطعاً أول مقسم لقطعتين متساويتين ، وتقطع قاطعاً ثانياً إلى قطعتين طولاهما (4x - 1) سم و (2x + 7) سم . أوجد قيمة x وطول القاطع الثاني.",
      "سلم طوارئ يتكون من فخذين مائلين وتصل بينهما 3 درجات أفقية متوازية قسمت المسافة إلى 3 أجزاء متساوية. فإذا كانت المسافة المائلة بين كل درجتين متتاليتين على الفخذ الأيمن 45 سم ، وعلى الفخذ الأيسر (5x + 10) سم ، فما قيمة x؟",
      "ABCD شبه منحرف فيه AD // BC، النقطتان E, F منتصفي AB, CD على الترتيب. إذا كان EF يقطع القطر AC في M وكان AD = 12 سم، فأوجد طول EM.",
      "عمود إنارة مائل قليلاً دُعّم بحبلين متوازيين مشدودين إلى الأرض، فكانت المسافات المحصورة على الأرض متساوية وتساوي 1.5 متر لكل جزء، وكانت المسافة المائلة على العمود للجزء الأول 1.2 متر. فما طول الجزء الثاني المائل على العمود؟",
      "في المثلث ABC، النقط D, E, F تقسم الضلع AB إلى 4 أجزاء متساوية، ورُسمت من هذه النقاط مستقيمات توازي BC لتقطع AC في X, Y, Z على الترتيب. إذا كان BC = 24 سم، فإن طول القطعة المتوسطة EY يساوي:",
    ];

    for (const [idx, prompt] of prompts.entries()) {
      const res = matchGeometryWithDiagnostics(prompt, `fig_verbal_${idx}`, "english");
      expect(res.figure, `Expected diagram for prompt #${idx + 1}: ${JSON.stringify(res.warnings)}`).toBeDefined();
      expect(res.decision, `Expected green decision for prompt #${idx + 1}: ${JSON.stringify(res.warnings)}`).toBe("green");
    }
  });

  it("14. resolves the 6 booklet diagram regressions (nested DEF, tower DE, bridge EF, parallelogram G/K, non-collapsed 2D triangles, 4 midpoints KLMN)", () => {
    // 1. حاول بنفسك 28: مثلث DEF مرسوم بربط منتصفات أضلاع المثلث ABC (يجب ألا يرسم مثلثين منفصلين)
    const p28 = matchGeometryWithDiagnostics(
      "إذا كان △DEF هو مثلث مرسوم بربط منتصفات أضلاع المثلث ABC، وكان محيط المثلث الأصغر DEF يساوي 18 سم، فما هو محيط المثلث الأكبر ABC؟",
      "fig_p28",
      "english"
    );
    expect(p28.figure, JSON.stringify(p28.warnings)).toBeDefined();
    expect(p28.figure!.polygons?.length).toBe(1);
    expect(p28.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F"]));

    // 2. حاول بنفسك 51: برج اتصالات رأسي AB مع دعامة رأسية DE بين منتصف السلك D والأرض E
    const p51 = matchGeometryWithDiagnostics(
      "برج اتصالات رأسي AB ارتفاعه 30 متراً مقام على أرض أفقية. دُعّم البرج بسلك مشدود يصل من قمته A إلى نقطة C على الأرض. قام المهندسون بتثبيت دعامة رأسية DE تصل بين منتصف السلك D والأرض E. احسب طول الدعامة DE.",
      "fig_p51",
      "english"
    );
    expect(p51.figure, JSON.stringify(p51.warnings)).toBeDefined();
    expect(p51.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E"]));

    // 3. حاول بنفسك 53: جسر مشاة شبه منحرف ABCD مع الدعامتين المتوازيتين AD = 14 و BC = 22 وكابل EF
    const p53 = matchGeometryWithDiagnostics(
      "صمم مهندس جسراً مشاة على شكل شبه منحرف ABCD، حيث الدعامتان المتوازيتان قياسهما AD = 14 متراً و BC = 22 متراً. ولزيادة الأمان، تم تركيب كابل فولاذي وسيط EF يصل بين منتصفي جانبي الجسر AB و CD. احسب طول الكابل الفولاذي EF.",
      "fig_p53",
      "english"
    );
    expect(p53.figure).toBeDefined();
    const vA = p53.figure!.vertices.find((v) => v.label === "A")!;
    const vD = p53.figure!.vertices.find((v) => v.label === "D")!;
    const vB = p53.figure!.vertices.find((v) => v.label === "B")!;
    const vC = p53.figure!.vertices.find((v) => v.label === "C")!;
    expect(Math.abs(vA.position.y - vD.position.y)).toBeLessThan(0.5);
    expect(Math.abs(vB.position.y - vC.position.y)).toBeLessThan(0.5);

    // 4. مثال 56: متوازي أضلاع ABCD مع E منتصف BC و F منتصف AD والقطر AC يقطع DF في G و EB في K
    const ex56 = matchGeometryWithDiagnostics(
      "في الشكل المقابل، ABCD متوازي أضلاع. النقطة E منتصف BC، والنقطة F منتصف AD. رُسم القطر AC ليقطع DF في النقطة G ويقطع EB في النقطة K. أثبت بالبرهان أن AG = GK = KC.",
      "fig_ex56",
      "english"
    );
    expect(ex56.figure).toBeDefined();
    expect(ex56.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "F", "G"]));

    // 5. حاول بنفسك 57 و واجب 11: عدم انهيار المثلث ثنائي الأبعاد إلى خط أفقي أحادي البعد
    for (const [id, text] of [
      [
        "fig_p57",
        "في الشكل المقابل، △ABC فيه D منتصف AB، E منتصف AC. رُسم DF // AC ليقطع BC في F. أُخذت النقطة M منتصف DF، ورُسم المستقيم المار بالنقطة M موازياً BC ليقطع AC في N. أثبت أن طول MN = 1/4 BC.",
      ],
      [
        "fig_hw11",
        "في الشكل المقابل، △ABC فيه D منتصف AB، رُسم الشعاع DE // BC يقطع AC في E. ثم رُسم الشعاع EF // AB يقطع BC في F. إذا كان BC = 14 سم، فإن طول BF يساوي:",
      ],
    ] as const) {
      const res = matchGeometryWithDiagnostics(text, id, "english");
      expect(res.figure, `${id}: ${JSON.stringify(res.warnings)}`).toBeDefined();
      const xs = res.figure!.vertices.map((v) => v.position.x);
      const ys = res.figure!.vertices.map((v) => v.position.y);
      const spanX = Math.max(...xs) - Math.min(...xs);
      const spanY = Math.max(...ys) - Math.min(...ys);
      expect(Math.min(spanX, spanY) / Math.max(spanX, spanY)).toBeGreaterThan(0.22);
    }

    // 6. حاول بنفسك 47: شكل رباعي ABCD مع النقط K, L, M, N منتصفات الأضلاع الأربعة (عدم سقوط النقطة الأولى K)
    const p47 = matchGeometryWithDiagnostics(
      "في الشكل المقابل، ABCD شكل رباعي فيه AC = BD. النقط K, L, M, N منتصفات الأضلاع AB, BC, CD, DA على الترتيب. أثبت أن الشكل KLMN معين.",
      "fig_p47",
      "english"
    );
    expect(p47.figure).toBeDefined();
    expect(p47.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "K", "L", "M", "N"]));
  });
});
