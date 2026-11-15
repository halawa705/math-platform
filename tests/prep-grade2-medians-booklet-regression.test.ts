import { describe, expect, it } from "vitest";
import { matchGeometryWithDiagnostics } from "../src/core/geometry-engine/natural-arabic-geometry-matcher";
import { projectGeometryFigureToSVGMarkup } from "../src/core/geometry-engine/vector-svg-figure-projector";
import { solveSegmentPillOrBracketPlacement } from "../src/core/geometry-engine/svg-label-collision-layout-solver";
import { applyAskedQuestionMarkToFigure } from "../src/core/geometry-engine/verification/geometry-asked-question-mark-resolver";
import { convertEnglishUnitsToArabic } from "../src/core/math-text/math-unit-quantity-binder";
import { mergeLogicalSolutionSteps } from "../src/core/ingestion/notebooklm-exam-questions-parser";
import { parseSolvedExamplesFromSection } from "../src/core/ingestion/notebooklm-stage-parsers-helper";

describe("prep grade 2 triangle medians booklet regressions", () => {
  it("renders sequential medians M and ray-cut F cleanly without duplicate 16 or stray ?", () => {
    const prompt =
      "في الشكل المقابل مثلث ABC فيه D منتصف الضلع BC، E منتصف الضلع AC. رُسم المتوسطان AD و BE فتقاطعا في النقطة M. رُسم الشعاع CM ليقطع الضلع AB في F. فإذا كان AB = 16 سم، احسب بالبرهان طول القطعة المستقيمة BF.";
    const res = matchGeometryWithDiagnostics(
      {
        geometryTag:
          "مثلث ABC فيه D منتصف BC، E منتصف AC، المتوسطان AD و BE تقاطعا في M، الشعاع CM يقطع AB في F، AB = 16 سم",
        problemPrompt: prompt,
      },
      "try-3"
    );
    expect(res.decision).toBe("green");
    expect(res.figure).toBeDefined();
    const vLabels = res.figure!.vertices.map((v) => v.label);
    expect(vLabels).toEqual(expect.arrayContaining(["A", "B", "C", "D", "E", "M", "F"]));

    // Must not produce spurious duplicate 16 labels
    const len16Count = res.figure!.segments.filter((s) => s.lengthLabel?.value === 16).length;
    expect(len16Count).toBe(1);

    // Works even with verbal problem prompt alone (dual optional fallback)
    const promptOnly = matchGeometryWithDiagnostics({ problemPrompt: prompt }, "try-3-only");
    expect(promptOnly.figure).toBeDefined();
    expect(promptOnly.figure!.vertices.map((v) => v.label)).toEqual(
      expect.arrayContaining(["A", "B", "C", "D", "E", "M", "F"])
    );
  });

  it("renders perpendicular medians triangle (Example 61: AD ⊥ BE عند M) with M and right angle", () => {
    const res = matchGeometryWithDiagnostics(
      {
        geometryTag: "مثلث ABC فيه M نقطة تقاطع المتوسطات، AD ⊥ BE عند M، AM = 8 سم، BM = 6 سم",
        problemPrompt:
          "في الشكل المقابل مثلث ABC فيه M هي نقطة تقاطع المتوسطات. وكان المتوسطان AD و BE متعامدين (AD ⊥ BE عند M). فإذا كان AM = 8 سم، BM = 6 سم. احسب بالبرهان طول AB",
      },
      "ex-61"
    );
    expect(res.figure).toBeDefined();
    expect(res.decision).toBe("green");
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(
      expect.arrayContaining(["A", "B", "C", "D", "E", "M"])
    );
    expect(res.figure!.angles.some((a) => a.isRightAngle)).toBe(true);
  });

  it("renders parallelogram diagonals M + algebraic ratio AN = 2NM + ray-cut E (Try 54)", () => {
    const res = matchGeometryWithDiagnostics(
      {
        geometryTag:
          "متوازي أضلاع ABCD تقاطع قطراه في M، N ∈ AM، AN = 2NM، الشعاع DN يقطع BC في النقطة E",
        problemPrompt:
          "في الشكل المقابل متوازي أضلاع ABCD تقاطع قطراه في M. أُخذت النقطة N بحيث N ∈ AM، AN = 2NM. رُسم الشعاع DN ليقطع BC في النقطة E. أثبت بالبرهان أن E منتصف الضلع BC.",
      },
      "try-54"
    );
    expect(res.figure).toBeDefined();
    expect(res.decision).toBe("green");
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(
      expect.arrayContaining(["A", "B", "C", "D", "M", "N", "E"])
    );
  });

  it("renders ray intersection K on parallelogram diagonal (HW 7 / Example 50) without throwing diagonal label onto exterior side", () => {
    const res = matchGeometryWithDiagnostics(
      {
        geometryTag:
          "متوازي أضلاع ABCD تقاطع قطراه في M، E منتصف BC، تقاطعت AE مع BD في K، BD = 18 سم",
        problemPrompt:
          "في الشكل المقابل متوازي أضلاع ABCD قطراه يتقاطعان في M، E منتصف BC. إذا تقاطعت AE مع BD في K، وكان BD = 18 سم، فإن طول القطعة DK يساوي",
      },
      "hw-7"
    );
    expect(res.figure).toBeDefined();
    expect(res.figure!.vertices.map((v) => v.label)).toEqual(
      expect.arrayContaining(["A", "B", "C", "D", "E", "M", "K"])
    );

    // Interior composite span must use inline pill mode rather than projecting an exterior 20px bracket
    const placed = solveSegmentPillOrBracketPlacement({
      seg: {
        fromId: "B",
        toId: "D",
        x1: 30,
        y1: 120,
        x2: 190,
        y2: 40,
        isCompositeSpan: true,
        isInteriorSpan: true,
      },
      textStr: "18 سم",
      centerSx: 110,
      centerSy: 80,
      occupiedBoxes: [],
      allSegments: [],
      bounds: { width: 230, height: 165 },
    });
    expect(placed.mode).toBe("pill");
    expect(placed.bracket).toBeUndefined();
  });

  it("never attaches spurious المساحة = ؟ badge on area-equality proof problems (HW 6)", () => {
    const res = matchGeometryWithDiagnostics(
      {
        geometryTag:
          "مثلث ABC فيه D منتصف AB، E منتصف AC، المتوسطان BE و CD يتقاطعان في M، المطلوب: مساحة المثلث DMB = مساحة المثلث EMC",
        problemPrompt:
          "في الشكل المقابل مثلث ABC فيه D منتصف AB، E منتصف AC. المتوسطان BE و CD يتقاطعان في M. برهن هندسياً أن: (1) مساحة المثلث DMB = مساحة المثلث EMC. (2) مساحة الشكل الرباعي ADME = مساحة المثلث MBC.",
      },
      "hw-6"
    );
    expect(res.figure).toBeDefined();
    const checked = applyAskedQuestionMarkToFigure(
      res.figure!,
      "برهن هندسياً أن: مساحة المثلث DMB = مساحة المثلث EMC"
    );
    expect(checked.askedSpec?.kind).toBe("proof");
    expect(checked.interiorBadges?.some((b) => b.text.includes("المساحة")) ?? false).toBe(false);
  });

  it("isolates LTR radical expressions like 6√3 in SVG so RTL PDFs do not invert to 3√6", () => {
    const svg = projectGeometryFigureToSVGMarkup({
      figureId: "rad-test",
      familyId: "triangle_family",
      titleArabic: "مثلث",
      notationLanguage: "english",
      vertices: [
        { id: "rad-test_v_A", label: "A", position: { x: 0, y: 8 } },
        { id: "rad-test_v_B", label: "B", position: { x: 0, y: 0 } },
        { id: "rad-test_v_C", label: "C", position: { x: 6, y: 0 } },
      ],
      segments: [
        {
          id: "rad-test_s_0",
          fromVertexId: "rad-test_v_A",
          toVertexId: "rad-test_v_B",
          lengthLabel: { value: "6√3", unit: "سم", labelKind: "given" },
        },
        { id: "rad-test_s_1", fromVertexId: "rad-test_v_B", toVertexId: "rad-test_v_C" },
        { id: "rad-test_s_2", fromVertexId: "rad-test_v_C", toVertexId: "rad-test_v_A" },
      ],
      angles: [],
    });
    expect(svg).toContain('<tspan direction="ltr" unicode-bidi="isolate">6√3</tspan> سم');
  });

  it("never corrupts uppercase math segment $KM$ into $ كم kilometer unit", () => {
    expect(convertEnglishUnitsToArabic("فإن طول $KM$ يساوي $3\\text{ cm}$ و 5 km")).toBe(
      "فإن طول $KM$ يساوي $3 \\text{سم}$ و 5 كم"
    );
    expect(convertEnglishUnitsToArabic("$CM$ منتصف $KM$ والطول 12 cm")).toBe(
      "$CM$ منتصف $KM$ والطول 12 سم"
    );
  });

  it("filters lone quotation marks in solution steps and avoids copying prompt subquestions into steps", () => {
    expect(mergeLogicalSolutionSteps('خطوة 1: AM = 8\n"\nخطوة 2: AB = 10')).toEqual([
      "AM = 8",
      "AB = 10",
    ]);
    const exText = `
مثال 61: في مثلث ABC فيه AD ⊥ BE عند M، AM = 8 سم، BM = 6 سم. احسب بالبرهان:
(1) طول الضلع AB.
(2) طول المتوسط AD.
خطوات الحل:
1. المثلث AMB قائم الزاوية في M، لذا AB = 10 سم.
2. بما أن M تقسم المتوسط بنسبة 2:1، لذا AD = 12 سم.
الناتج النهائي: AB = 10 سم، AD = 12 سم
    `;
    const parsed = parseSolvedExamplesFromSection(exText, "مثال");
    expect(parsed[0]?.steps.some((s) => s.includes("المثلث AMB قائم"))).toBe(true);
    expect(parsed[0]?.steps.every((s) => !s.startsWith("طول الضلع AB"))).toBe(true);
  });
});
