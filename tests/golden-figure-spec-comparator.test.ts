/**
 * @file golden-figure-spec-comparator.test.ts
 * @description اختبارات وحدة المقارِن الآلي لمواصفات الشكل الهندسي المرجعي (المهمة 0.1).
 */

import { describe, it, expect } from "vitest";
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import { compareFigureAgainstExpectedSpec } from "@/core/geometry-engine/baseline-measurement/golden-figure-spec-comparator";
import { loadGoldenGeometryCorpus } from "@/core/geometry-engine/baseline-measurement/golden-corpus-json-directory-loader";
import { matchGeometryWithDiagnostics } from "@/core/geometry-engine/natural-arabic-geometry-matcher";
import { combineProblemAndTagGeometryContext } from "@/core/geometry-engine/description-intake/problem-geometry-context-extractor";

describe("Golden Figure Spec Comparator (Task 0.1)", () => {
  it("يطابق الشكل بنجاح عندما تتوفر الرؤوس والأطوال والزوايا", () => {
    const mockFig: CanonicalGeometryFigureIR = {
      figureId: "test_fig_1",
      familyId: "triangle_family",
      branchId: "triangle_right_pythagoras",
      titleArabic: "مثلث قائم",
      vertices: [
        { id: "vA", label: "A", position: { x: 0, y: 0 } },
        { id: "vB", label: "B", position: { x: 4, y: 0 } },
        { id: "vC", label: "C", position: { x: 0, y: 3 } },
      ],
      segments: [
        { id: "sAB", fromVertexId: "vA", toVertexId: "vB", lengthLabel: { value: 4, unit: "سم" } },
        { id: "sAC", fromVertexId: "vA", toVertexId: "vC", lengthLabel: { value: 3, unit: "سم" } },
        { id: "sBC", fromVertexId: "vB", toVertexId: "vC", lengthLabel: { value: "؟", labelKind: "unknown" } },
      ],
      angles: [
        { id: "aA", vertexId: "vA", arm1VertexId: "vB", arm2VertexId: "vC", isRightAngle: true, degrees: 90 },
      ],
      polygons: [["vA", "vB", "vC"]],
    };

    const res = compareFigureAgainstExpectedSpec({
      figure: mockFig,
      expectedOutcome: "figure",
      expectedSpec: {
        vertices: ["أ", "ب", "جـ"], // تعريب مقابل A, B, C
        displayedLengths: ["3", "4"],
        displayedAngles: ["90"],
        questionMarkTarget: "BC",
        expectedFamilyId: "triangle_family",
      },
    });

    expect(res.matches).toBe(true);
    expect(res.score).toBe(1);
    expect(res.vertexDiscrepancies).toHaveLength(0);
    expect(res.lengthDiscrepancies).toHaveLength(0);
    expect(res.questionMarkMatched).toBe(true);
  });

  it("يكتشف الرؤوس والأطوال المفقودة بدقة", () => {
    const mockFig: CanonicalGeometryFigureIR = {
      figureId: "test_fig_2",
      familyId: "triangle_family",
      branchId: "triangle_base_general",
      titleArabic: "مثلث",
      vertices: [
        { id: "vA", label: "A", position: { x: 0, y: 0 } },
        { id: "vB", label: "B", position: { x: 5, y: 0 } },
      ],
      segments: [
        { id: "sAB", fromVertexId: "vA", toVertexId: "vB", lengthLabel: { value: 5, unit: "سم" } },
      ],
      angles: [],
      polygons: [["vA", "vB"]],
    };

    const res = compareFigureAgainstExpectedSpec({
      figure: mockFig,
      expectedOutcome: "figure",
      expectedSpec: {
        vertices: ["A", "B", "C"],
        displayedLengths: ["5", "12"],
        displayedAngles: ["60"],
      },
    });

    expect(res.matches).toBe(false);
    expect(res.vertexDiscrepancies.length).toBeGreaterThan(0);
    expect(res.lengthDiscrepancies.length).toBeGreaterThan(0);
    expect(res.angleDiscrepancies.length).toBeGreaterThan(0);
  });

  it("يتعامل مع المسائل النظرية (رفض صحيح مقابل شكل وهمي)", () => {
    const passRes = compareFigureAgainstExpectedSpec({
      figure: null,
      expectedOutcome: "no_figure",
    });
    expect(passRes.matches).toBe(true);

    const failRes = compareFigureAgainstExpectedSpec({
      figure: {
        figureId: "hallucinated",
        familyId: "triangle_family",
        branchId: "triangle_base_general",
        titleArabic: "وهمي",
        vertices: [],
        segments: [],
        angles: [],
        polygons: [],
      },
      expectedOutcome: "no_figure",
    });
    expect(failRes.matches).toBe(false);
  });

  it("ينفذ مقارنة آلية على >= 60 حالة مبذورة في المجموعة الذهبية", () => {
    const cases = loadGoldenGeometryCorpus();
    const seededCases = cases.filter((c) => c.expectedFigureSpec !== undefined);

    // معيار القبول: >= 60 حالة مبذورة بمواصفة
    expect(seededCases.length).toBeGreaterThanOrEqual(60);

    let comparedCount = 0;
    for (const testCase of seededCases) {
      const combined = combineProblemAndTagGeometryContext(
        testCase.geometryRaw || undefined,
        testCase.problemText
      );
      const diag = matchGeometryWithDiagnostics(combined, `cmp_${testCase.id}`, "arabic");
      const report = compareFigureAgainstExpectedSpec({
        figure: diag.figure,
        expectedOutcome: testCase.expectedOutcome,
        expectedSpec: testCase.expectedFigureSpec,
      });

      expect(typeof report.score).toBe("number");
      expect(Array.isArray(report.discrepancies)).toBe(true);
      comparedCount++;
    }

    expect(comparedCount).toBeGreaterThanOrEqual(60);
  });
});
