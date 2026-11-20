import { describe, expect, it } from "vitest";
import { localizeFigureLabelText } from "@/core/geometry-engine/figure-label-symbol-localizer";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";
import { extractGeometryFactsFromPrompt } from "@/core/geometry-engine/description-intake/problem-geometry-context-extractor";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { mergeBookletThreeStagesRepliesToPrintableItems } from "@/core/ingestion/notebooklm-booklet-stages-merger";

describe("Quadrilaterals 22-page booklet regressions (all 11 issues)", () => {
  it("1. Trapezoid AB // DC with AD=(3a+1) and BC=(a+5) keeps AB horizontal parallel to DC", () => {
    const res = matchGeometryWithDiagnostics(
      {
        problemPrompt: "شبه منحرف ABCD فيه AB // DC، AD = (3a + 1) سم، BC = (a + 5) سم، m(∠B) = (3b + 5)°، m(∠C) = 130°.",
        geometryTag: "[رسم هندسي: شبه منحرف متساوي الساقين ABCD ؛ AB // DC ؛ AD = (3a + 1) سم ؛ BC = (a + 5) سم ؛ ق(∠C) = 130°]",
      },
      "reg_ex_03_02"
    );
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    const vMap = new Map(res.figure!.vertices.map((v) => [v.label, v.position]));
    const A = vMap.get("A")!;
    const B = vMap.get("B")!;
    const C = vMap.get("C")!;
    const D = vMap.get("D")!;
    expect(Math.abs(A.y - B.y)).toBeLessThan(0.05);
    expect(Math.abs(C.y - D.y)).toBeLessThan(0.05);
  });

  it("2. Localizer protects Arabic units (سم / م / متراً) after Latin expressions like 2x سم and (x+1) م", () => {
    expect(localizeFigureLabelText("2x سم", "english", "western")).toBe("2x سم");
    expect(localizeFigureLabelText("(2x - 3) سم", "english", "western")).toBe("(2x - 3) سم");
    expect(localizeFigureLabelText("2x م", "english", "western")).toBe("2x م");
    expect(localizeFigureLabelText("(x + 1) م", "english", "western")).toBe("(x + 1) م");
  });

  it("3. Does not extract m(∠A) + m(∠C) = 160° as a single angle ق(∠C) = 160°", () => {
    const facts = extractGeometryFactsFromPrompt("متوازي أضلاع ABCD فيه m(∠A) + m(∠C) = 160°. أوجد قياس كل من ∠A, ∠B.");
    expect(facts.some((f) => /∠C.*160/.test(f))).toBe(false);
    expect(facts.some((f) => /∠A.*160/.test(f))).toBe(false);
  });

  it("4. Recognizes definite-article 'متوازي الأضلاع ABCD' and draws full parallelogram instead of standalone segment", () => {
    const res = matchGeometryWithDiagnostics(
      "في متوازي الأضلاع ABCD تقاطع قطراه في O، حيث BO = 5 سم و AO = 4 سم. أوجد طول BD.",
      "reg_prac_06_03"
    );
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    const labels = res.figure!.vertices.map((v) => v.label);
    expect(labels).toEqual(expect.arrayContaining(["A", "B", "C", "D", "O"]));
    expect(res.figure!.polygons?.length).toBeGreaterThanOrEqual(1);
  });

  it("6. Rhombus ABCD with diagonal-side angle m(∠ACD) = 60° renders green with ∠C = 120°", () => {
    const res = matchGeometryWithDiagnostics(
      {
        problemPrompt: "معين ABCD تقاطع قطراه في M، فيه AC ⊥ BD و m(∠ACD) = 60°. أوجد قياس ∠BDC و قياس ∠BCD.",
        geometryTag: "[رسم هندسي: الرؤوس (معين ABCD تقاطع قطراه في M) ؛ الزوايا والتعامد (AC ⊥ BD ; m(∠ACD) = 60°) ؛ المطلوب: قياس ∠BDC و قياس ∠BCD]",
      },
      "reg_ex_09_01"
    );
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    const labels = res.figure!.vertices.map((v) => v.label);
    expect(labels).toEqual(expect.arrayContaining(["A", "B", "C", "D", "M"]));
  });

  it("7. Square ABCD with E ∈ امتداد BA and ED // AC draws diagonal AC and places E collinearly", () => {
    const res = matchGeometryWithDiagnostics(
      {
        problemPrompt: "ABCD مربع، E ∈ امتداد BA بحيث ED // AC. أثبت أن ACDE متوازي أضلاع.",
        geometryTag: "[رسم هندسي: الرؤوس (ABCD مربع ; E ∈ امتداد BA) ؛ الزوايا والتعامد (ED // AC)]",
      },
      "reg_ex_11_01"
    );
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    const segPairs = res.figure!.segments.map((s) => `${s.fromVertexId.slice(-1)}${s.toVertexId.slice(-1)}`);
    expect(segPairs.some((p) => p === "AC" || p === "CA")).toBe(true);
    expect(segPairs.some((p) => p === "ED" || p === "DE")).toBe(true);
  });

  it("8a. Accepts h = 9 م without unparsed line rejection", () => {
    const res = matchGeometryWithDiagnostics(
      {
        problemPrompt: "حديقة على شكل متوازي أضلاع ABCD طول قاعدتها AB = 12 م وارتفاعها h = 9 م. أوجد مساحتها.",
        geometryTag: "[رسم هندسي: متوازي أضلاع ABCD ؛ AB = 12 م ؛ h = 9 م]",
      },
      "reg_ex_11_02"
    );
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
  });

  it("8b. Square ABCD with exterior equilateral triangle CDE renders green", () => {
    const res = matchGeometryWithDiagnostics(
      {
        problemPrompt: "ABCD مربع، أُنشئ على ضلعه CD مثلث متساوي الأضلاع CDE في الخارج. أوجد قياس ∠ADE.",
        geometryTag: "[رسم هندسي: مربع ABCD ؛ CDE مثلث متساوي الأضلاع في الخارج]",
      },
      "reg_prac_11_01"
    );
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E"]));
  });

  it("8c. Rectangle ABCD with diagonals meeting at M and shared-edge rhombus MBNE renders green", () => {
    const res = matchGeometryWithDiagnostics(
      {
        problemPrompt: "مستطيل ABCD تقاطع قطراه في M، أُنشئ المعين MBNE. أثبت أن NE // BD.",
        geometryTag: "[رسم هندسي: مستطيل ABCD تقاطع قطراه في M ; معين MBNE]",
      },
      "reg_prac_11_02"
    );
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "M", "N", "E"]));
  });

  it("9. Square ABCD with exterior isosceles triangle CDE (m(∠DEC)=40°) computes bounded vertex E and connects AD/DE", () => {
    const res = matchGeometryWithDiagnostics(
      {
        problemPrompt: "ABCD مربع، أُنشئ على ضلعه CD مثلث متساوي الساقين CDE بحيث ED = EC و m(∠DEC) = 40°. احسب قياس ∠ADE.",
        geometryTag: "[رسم هندسي: مربع ABCD ؛ مثلث CDE متساوي الساقين ؛ ED = EC ؛ ق(∠DEC) = 40°]",
      },
      "reg_prac_11_04"
    );
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E"]));
  });

  it("10. SVG projector isolates LTR math (2x - 3) with LRI/PDI and direction:ltr", () => {
    const res = matchGeometryWithDiagnostics("[رسم هندسي: متوازي أضلاع ABCD ؛ AB = (2x - 3) سم ؛ BC = 5 سم]", "reg_hw_03_03");
    expect(res.figure).toBeDefined();
    const svg = projectGeometryFigureToSVGMarkup(res.figure!, { notationLanguage: "english", numeralMode: "western" });
    expect(svg).toContain('direction="ltr"');
    expect(svg).toContain("\u2066(2x - 3)\u2069");
  });

  it("10b. HW 24 (محيط ABM = 16 سم), HW 32 (E ∈ BC on rectangle), HW 43 (auto-connect △ACE) render green", () => {
    const hw24 = matchGeometryWithDiagnostics(
      "[رسم هندسي: متوازي أضلاع ABCD تقاطع قطراه في M ؛ محيط ABM = 16 سم]",
      "reg_hw_06_04"
    );
    expect(hw24.decision).toBe("green");
    expect(hw24.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "M"]));

    const hw32 = matchGeometryWithDiagnostics(
      "ABCD مستطيل، رسم القطر AC، وكانت E ∈ BC بحيث AB = BE. احسب قياس ∠AEC.",
      "reg_hw_08_04"
    );
    expect(hw32.decision).toBe("green");
    expect(hw32.figure?.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E"]));

    const hw43 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "ABCD مربع، رسم الشعاع CD ومد إلى E بحيث CD = DE. أثبت أن المثلث ACE قائم في C.",
        geometryTag: "[رسم هندسي: مربع ABCD ؛ نمد CD إلى E ؛ CD = DE]",
      },
      "reg_hw_11_03"
    );
    expect(hw43.decision).toBe("green");
    const segPairs = hw43.figure!.segments.map((s) => `${s.fromVertexId.slice(-1)}${s.toVertexId.slice(-1)}`);
    expect(segPairs.some((p) => p === "AE" || p === "EA")).toBe(true);
    expect(segPairs.some((p) => p === "AC" || p === "CA")).toBe(true);
  });

  it("11. Booklet merger assigns independent sequential numbers to worked examples, drills, and homework", () => {
    const stage1 = `
### الفكرة الأولى: خواص متوازي الأضلاع | معرف الفكرة: idea-1
**شرح الفكرة:** كل ضلعين متقابلين متساويان في الطول ومتوازيان.
**القاعدة:** محيط متوازي الأضلاع = مجموع أطوال أضلاعه.
**مثال (1):** أوجد محيط متوازي أضلاع ضلعاه 5 سم و 3 سم.
**خطوات الحل:**
1. المحيط = 2 × (5 + 3) = 16 سم.
**مثال (2):** أوجد قياس زاوية في متوازي أضلاع إحدى زواياه 60°.
**خطوات الحل:**
1. الزاوية المكملة = 180° - 60° = 120°.

### الفكرة الثانية: خواص المستطيل | معرف الفكرة: idea-2
**شرح الفكرة:** جميع زوايا المستطيل قوائم وقطراه متساويان.
**القاعدة:** محيط المستطيل = 2 × (الطول + العرض).
**مثال (1):** مستطيل بعداه 4 سم و 3 سم، أوجد محيطه.
**خطوات الحل:**
1. المحيط = 2 × (4 + 3) = 14 سم.
`;
    const stage2 = `
### الفكرة الأولى: خواص متوازي الأضلاع | معرف الفكرة: idea-1
**حاول بنفسك:**
1. تمرين أول على الفكرة الأولى.
2. تمرين ثانٍ على الفكرة الأولى.

### الفكرة الثانية: خواص المستطيل | معرف الفكرة: idea-2
**حاول بنفسك:**
1. تمرين أول على الفكرة الثانية.

**الواجب المنزلي:**
1. سؤال واجب أول.
2. سؤال واجب ثانٍ.
`;
    const items = mergeBookletThreeStagesRepliesToPrintableItems({
      stage1Raw: stage1,
      stage2Raw: stage2,
      branchId: "plane_geometry",
      branchNameAr: "الهندسة",
      unitId: "u1",
      lessonId: "l1",
      lessonTitleArabic: "الأشكال الرباعية",
    });
    const examples = items.filter((i) => i.isWorkedExample);
    const drills = items.filter((i) => i.id.includes("-drill-"));
    const hw = items.filter((i) => i.id.includes("-hw-"));

    expect(examples.map((e) => e.questionNumber)).toEqual([1, 2, 3]);
    expect(drills.map((d) => d.questionNumber)).toEqual([1, 2, 3]);
    expect(hw.map((h) => h.questionNumber)).toEqual([1, 2]);
  });

  it("12. Prompt extractor never splits '2x سم' into '2x س' + 'م', and never puts perimeter onto side AB", () => {
    const ex10 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "في الشكل المقابل، ABCD متوازي أضلاع فيه طول AB = (4x - 7) سم، وطول CD = 2x سم، وطول AD = (y - 5) سم، وطول BC = 5 سم.",
        geometryTag: "[رسم هندسي: الرؤوس (متوازي أضلاع ABCD) ؛ أطوال الأضلاع ووحداتها (AB = (4x - 7) سم ; CD = 2x سم ; AD = (y - 5) سم ; BC = 5 سم)]",
      },
      "reg_ex_10_unit"
    );
    expect(ex10.decision).toBe("green");
    const cdSeg = ex10.figure!.segments.find((s) => s.lengthLabel && String(s.lengthLabel.value).includes("2x"));
    expect(cdSeg?.lengthLabel?.value).toBe("2x");
    expect(cdSeg?.lengthLabel?.unit).toBe("سم");

    const perimOnly = matchGeometryWithDiagnostics({ problemPrompt: "معين محيطه 200 سم، فإن طول ضلعه يساوي:" }, "reg_perim_200");
    expect(perimOnly.decision).toBe("green");
    expect(perimOnly.figure!.segments.some((s) => String(s.lengthLabel?.value) === "200")).toBe(false);
    expect(perimOnly.figure!.interiorBadges?.some((b) => b.text.includes("200"))).toBe(true);
  });

  it("13. Topological polygon ordering keeps ABCD primary before MBNE (drill 43), CDE (drill 44), ABE (hw 36), ABEF (hw 13), and AM=6 (hw 8)", () => {
    const p43 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "في الشكل المقابل، ABCD مستطيل تقاطع قطراه في M، رُسم المعين MBNE بحيث تشارك القطران في النقطة M. إذا كان m(∠BNE) = 80°. احسب قياس ∠MBN.",
        geometryTag: "[رسم هندسي: الرؤوس (مستطيل ABCD تقاطع قطراه في M ; معين MBNE) ؛ الزوايا والتعامد (m(∠BNE) = 80°) ؛ المطلوب: قياس ∠MBN]",
      },
      "reg_p43_order"
    );
    expect(p43.decision).toBe("green");
    const v43 = new Map(p43.figure!.vertices.map((v) => [v.label, v.position]));
    // M must be the exact midpoint of rectangle ABCD (not outside)
    expect(v43.get("M")!.x).toBeCloseTo((v43.get("A")!.x + v43.get("C")!.x) / 2, 1);
    expect(v43.get("M")!.y).toBeCloseTo((v43.get("A")!.y + v43.get("C")!.y) / 2, 1);

    const hw36 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "في الشكل المقابل، ABCD مستطيل، رُسم القطر AC، وكانت النقطة E ∈ BC بحيث كان المثلث ABE متساوي الساقين فيه AB = BE. أوجد قياس ∠AEB، ثم احسب قياس ∠AEC.",
        geometryTag: "[رسم هندسي: الرؤوس (مستطيل ABCD) ؛ أطوال الأضلاع ووحداتها (AB = BE) ؛ الزوايا والتعامد (E ∈ BC) ؛ المطلوب: قياس ∠AEB وقياس ∠AEC]",
      },
      "reg_hw36_both"
    );
    expect(hw36.decision).toBe("green");
    expect(hw36.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E"]));

    const hw13 = matchGeometryWithDiagnostics(
      { problemPrompt: "في الشكل المقابل، إذا كان ABCD متوازي أضلاع و ABEF متوازي أضلاع آخر مشترك معه في القاعدة AB، فإن القطعة المستقيمة CD بالنسبة للقطعة EF:" },
      "reg_hw13_shared"
    );
    expect(hw13.decision).toBe("green");
    expect(hw13.figure!.polygons?.length).toBe(2);

    const hw8 = matchGeometryWithDiagnostics(
      { problemPrompt: "في متوازي الأضلاع ABCD، إذا كان طول نصف القطر AM = 6 سم، فإن طول القطر AC يساوي:" },
      "reg_hw8_halfdiag"
    );
    expect(hw8.decision).toBe("green");
    expect(hw8.figure!.vertices.map((v) => v.label)).toEqual(expect.arrayContaining(["A", "B", "C", "D", "M"]));

    const d34 = matchGeometryWithDiagnostics({ problemPrompt: "معين محيطه يساوي 48 سم، وطول أحد أضلاعه (2x + 4) سم. احسب قيمة x." }, "reg_d34_alg");
    expect(d34.decision).toBe("green");
    expect(d34.figure!.segments.some((s) => String(s.lengthLabel?.value).includes("2x + 4"))).toBe(true);
  });

  it("14. Asked composite angles (∠ADE, ∠MBN) render dashed orange unknown arc with ؟", () => {
    const p42 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "في الشكل المقابل، ABCD مربع، أُنشئ على ضلعه CD مثلث متساوي الساقين CDE بحيث ED = EC و m(∠DEC) = 40°. احسب بالبرهان قياس ∠ADE.",
        geometryTag: "[رسم هندسي: الرؤوس (ABCD مربع ; CDE مثلث متساوي الساقين خارجي) ؛ أطوال الأضلاع ووحداتها (ED = EC) ؛ الزوايا والتعامد (m(∠DEC) = 40°) ؛ المطلوب: قياس ∠ADE]",
      },
      "reg_p42_asked_arc"
    );
    expect(p42.decision).toBe("green");
    expect(p42.figure!.angles.some((a) => a.labelKind === "unknown" && a.vertexId.endsWith("_D"))).toBe(true);
    const svg = projectGeometryFigureToSVGMarkup(p42.figure!, { notationLanguage: "english", numeralMode: "western" });
    expect(svg).toContain('stroke="#D97706"');
    expect(svg).toContain('stroke-dasharray="3,2"');
    expect(svg).toContain(">؟<");
  });

  it("15. Dual asked angles (∠AEB و ∠AEC in HW 36) render two distinct unknown arcs labeled ؟₁ and ؟₂", () => {
    const hw36 = matchGeometryWithDiagnostics(
      {
        problemPrompt: "في الشكل المقابل، ABCD مستطيل، رُسم القطر AC، وكانت النقطة E ∈ BC بحيث كان المثلث ABE متساوي الساقين فيه AB = BE. أوجد قياس ∠AEB، ثم احسب قياس ∠AEC.",
        geometryTag: "[رسم هندسي: الرؤوس (مستطيل ABCD) ؛ أطوال الأضلاع ووحداتها (AB = BE) ؛ الزوايا والتعامد (E ∈ BC) ؛ المطلوب: قياس ∠AEB وقياس ∠AEC]",
      },
      "reg_hw36_dual_q"
    );
    expect(hw36.decision).toBe("green");
    expect(hw36.figure!.askedSpec?.targetKeys).toEqual(["AEB", "AEC"]);
    const unknownLabels = hw36.figure!.angles.filter((a) => a.labelKind === "unknown").map((a) => a.degreesLabel);
    expect(unknownLabels).toEqual(["؟₁", "؟₂"]);
    const svg = projectGeometryFigureToSVGMarkup(hw36.figure!, { notationLanguage: "english", numeralMode: "western" });
    expect(svg).toContain(">؟₁<");
    expect(svg).toContain(">؟₂<");
  });
});
