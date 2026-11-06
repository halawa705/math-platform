/**
 * @file geometry-problem-spec-and-constructor.test.ts
 * @description اختبارات المرحلة 3 (Problem Spec والمُنشئ العام والمحسّن متعدد البدايات):
 * 1. استخراج `GeometryProblemSpec` المزدوج من النص والوسم ورصد التعارضات.
 * 2. فحص الاتساق الرياضي المغلق قبل الرسم (المتباينة المثلثية، مجموع الزوايا، فيثاغورس).
 * 3. البناء العام للمضلعات والمثلثات المتجاورة والمحسّن العددي متعدد البدايات (Multi-Start LM).
 */

import { describe, expect, it } from "vitest";
import { extractGeometryProblemSpecDual } from "@/core/geometry-engine/description-intake/geometry-problem-spec-extractor";
import { verifyProblemSpecMathematicalConsistency } from "@/core/geometry-engine/verification/geometry-problem-spec-consistency-checker";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { refineFigureToMatchGivens } from "@/core/geometry-engine/constraint-refiner/geometry-figure-constraint-refiner";
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";

describe("Phase 3: GeometryProblemSpec, Mathematical Consistency & General Constructor", () => {
  it("extracts structured GeometryProblemSpec (objects, relations, givens, asked) and verifies dual agreement", () => {
    const prompt =
      "[رسم هندسي: مثلث أ ب جـ قائم في ب، د منتصف أ جـ، أ ب = 6 سم، ب جـ = 8 سم] في المثلث أ ب جـ القائم الزاوية في ب، إذا كانت د منتصف أ جـ و أ ب = 6 سم و ب جـ = 8 سم، أوجد طول ب د";
    const dual = extractGeometryProblemSpecDual(prompt);

    expect(dual.dualSourcesAgree).toBe(true);
    expect(dual.conflictReasons).toHaveLength(0);
    expect(dual.spec.objects.some((o) => o.kind === "triangle")).toBe(true);
    expect(dual.spec.relations.some((r) => r.kind === "midpoint")).toBe(true);
    expect(dual.spec.givens.some((g) => g.target === "AB" && g.numericValue === 6)).toBe(true);
    expect(dual.spec.givens.some((g) => g.target === "BC" && g.numericValue === 8)).toBe(true);
    expect(dual.spec.asked?.kind).toBe("length");
    expect(dual.spec.asked?.targetKey).toBe("BD");
  });

  it("detects numeric conflict between problem text and geometry tag in dual extraction", () => {
    const conflictingPrompt =
      "[رسم هندسي: مثلث أ ب جـ فيه أ ب = 10 سم، ب جـ = 8 سم] في المثلث أ ب جـ إذا كان أ ب = 6 سم و ب جـ = 8 سم أوجد طول أ جـ";
    const dual = extractGeometryProblemSpecDual(conflictingPrompt);

    expect(dual.dualSourcesAgree).toBe(false);
    expect(dual.conflictReasons.some((d) => d.includes("AB"))).toBe(true);
  });

  it("rejects triangle inequality violations (e.g. sides 2, 3, 10) before drawing", () => {
    const impossibleSides = "مثلث أ ب جـ فيه أ ب = 2 سم، ب جـ = 3 سم، أ جـ = 10 سم، أوجد محيط المثلث";
    const dual = extractGeometryProblemSpecDual(impossibleSides);
    const consistency = verifyProblemSpecMathematicalConsistency(dual.spec);

    expect(consistency.passed).toBe(false);
    expect(consistency.violations.some((v) => v.includes("المتباينة المثلثية"))).toBe(true);

    const diag = matchGeometryWithDiagnostics(impossibleSides, "test_impossible_tri");
    expect(diag.decision).toBe("red");
    expect(diag.figure).toBeUndefined();
  });

  it("rejects impossible triangle angle sums (>= 180° for two angles) before drawing", () => {
    const impossibleAngles = "مثلث أ ب جـ فيه ق(∠أ) = 105°، ق(∠ب) = 85°، أوجد ق(∠جـ)";
    const dual = extractGeometryProblemSpecDual(impossibleAngles);
    const consistency = verifyProblemSpecMathematicalConsistency(dual.spec);

    expect(consistency.passed).toBe(false);
    expect(consistency.violations.some((v) => v.includes("مجموع زاويتين"))).toBe(true);

    const diag = matchGeometryWithDiagnostics(impossibleAngles, "test_impossible_angles");
    expect(diag.decision).toBe("red");
    expect(diag.figure).toBeUndefined();
  });

  it("rejects right triangle where leg exceeds hypotenuse or violates Pythagoras", () => {
    const legExceedsHyp = "مثلث أ ب جـ قائم في ب، أ ب = 12 سم، أ جـ = 8 سم، أوجد طول ب جـ";
    const dual1 = extractGeometryProblemSpecDual(legExceedsHyp);
    const check1 = verifyProblemSpecMathematicalConsistency(dual1.spec);
    expect(check1.passed).toBe(false);

    const badPythagoras = "مثلث أ ب جـ قائم في ب، أ ب = 3 سم، ب جـ = 4 سم، أ جـ = 9 سم";
    const dual2 = extractGeometryProblemSpecDual(badPythagoras);
    const check2 = verifyProblemSpecMathematicalConsistency(dual2.spec);
    expect(check2.passed).toBe(false);

    const validPythagoras = "مثلث أ ب جـ قائم في ب، أ ب = 3 سم، ب جـ = 4 سم، أ جـ = 5 سم";
    const dual3 = extractGeometryProblemSpecDual(validPythagoras);
    const check3 = verifyProblemSpecMathematicalConsistency(dual3.spec);
    expect(check3.passed).toBe(true);
  });

  it("constructs adjacent congruent triangles sharing a side via the general constructor", () => {
    const desc = "مثلث ABC، مثلث ADC، AB = 5 سم، BC = 4 سم، AD = 5 سم، DC = 4 سم، AC = 6 سم";
    const diag = matchGeometryWithDiagnostics(desc, "test_adj_tri", "english");

    expect(diag.decision).toBe("green");
    expect(diag.figure).toBeDefined();
    expect(diag.figure!.vertices).toHaveLength(4);
  });

  it("refines distorted initial vertex positions using multi-start Levenberg-Marquardt", () => {
    const distorted: CanonicalGeometryFigureIR = {
      figureId: "distorted_tri",
      familyId: "triangle_family",
      branchId: "triangle_base_general",
      titleArabic: "مثلث 3-4-5 مشوه",
      notationLanguage: "english",
      vertices: [
        { id: "vA", label: "A", position: { x: 0, y: 0 } },
        { id: "vB", label: "B", position: { x: 4, y: 0 } },
        { id: "vC", label: "C", position: { x: 3.2, y: 1.1 } },
      ],
      segments: [
        { id: "sAB", fromVertexId: "vA", toVertexId: "vB", lengthLabel: { value: 4, unit: "سم" } },
        { id: "sBC", fromVertexId: "vB", toVertexId: "vC", lengthLabel: { value: 3, unit: "سم" } },
        { id: "sCA", fromVertexId: "vC", toVertexId: "vA", lengthLabel: { value: 5, unit: "سم" } },
      ],
      angles: [
        { id: "aB", vertexId: "vB", arm1VertexId: "vA", arm2VertexId: "vC", degrees: 90, isRightAngle: true },
      ],
      polygons: [["vA", "vB", "vC"]],
    };

    const refined = refineFigureToMatchGivens(distorted);
    expect(refined.refined).toBe(true);
    expect(refined.report.passed).toBe(true);
  });
});
