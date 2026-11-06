/**
 * @file cartesian-functions-v2.test.ts
 * @description اختبارات شاملة لحزمة الرسوم البيانية للدوال Cartesian Function Graphs v2 (المرحلة 3):
 * - تفكيك المحللات الذرية
 * - نظام معادلتين خطيتين ونقطة التقاطع
 * - المتباينات الخطية وتظليل نصف المستوى
 * - الدوال التربيعية المتقدمة (رأس المنحنى، محور التماثل)
 * - دوال القيمة المطلقة والمتعددة التعريف
 * - فحص الاتساق الرياضي وتفادي التناقض
 * - تصيير الـ SVG مع التظليل والأنماط المتقطعة والمصمتة
 */

import { describe, it, expect } from "vitest";
import { parseCartesianGraphDescription } from "@/core/geometry-engine/graph-compositor/graph-fact-parser";
import { parseLinearFunctionOrInequality } from "@/core/geometry-engine/graph-compositor/linear-function-parser";
import { parseQuadraticFunction } from "@/core/geometry-engine/graph-compositor/quadratic-function-parser";
import { parseAbsoluteValueFunction } from "@/core/geometry-engine/graph-compositor/absolute-value-function-parser";
import { parsePiecewiseBranch, assemblePiecewiseFunction } from "@/core/geometry-engine/graph-compositor/piecewise-function-parser";
import { checkCartesianGraphConsistency } from "@/core/geometry-engine/graph-compositor/cartesian-consistency-checker";
import { projectCartesianGraphToSVGMarkup } from "@/core/geometry-engine/graph-compositor/graph-svg-projector";

describe("Cartesian Function Graphs v2 (Phase 3)", () => {
  describe("Task 3.1 & 3.2: Linear Functions and Systems with Intersection", () => {
    it("parses standard linear equation ص = 2س - 3", () => {
      const fn = parseLinearFunctionOrInequality("ص = 2س - 3");
      expect(fn).toBeDefined();
      expect(fn?.kind).toBe("linear");
      expect(fn?.a).toBe(2);
      expect(fn?.b).toBe(-3);
      expect(fn?.dashed).toBeFalsy();
    });

    it("parses linear system with valid intersection point (2, 3)", () => {
      const desc = "[رسم بياني: ص = 2س - 1 ؛ ص = -س + 5 ؛ نقطة التقاطع (2، 3)]";
      const spec = parseCartesianGraphDescription(desc);
      expect(spec).not.toBeNull();
      expect(spec?.functions.length).toBe(2);
      expect(spec?.points.length).toBe(1);
      expect(spec?.points[0].x).toBe(2);
      expect(spec?.points[0].y).toBe(3);
    });

    it("detects and rejects contradictory intersection point", () => {
      // ص = 2س - 1 و ص = -س + 5 يتقاطعان عند (2، 3)
      // إذا ادعى الرد نقطة التقاطع (4، 10) فإنها تناقض رياضي
      const desc = "[رسم بياني: ص = 2س - 1 ؛ ص = -س + 5 ؛ نقطة التقاطع (4، 10)]";
      const spec = parseCartesianGraphDescription(desc);
      expect(spec).toBeNull(); // أسقطه فاحص الاتساق
    });
  });

  describe("Task 3.3: Linear Inequalities with Shading", () => {
    it("parses strict inequality with dashed line and shading above: ص > 2س + 1", () => {
      const fn = parseLinearFunctionOrInequality("ص > 2س + 1");
      expect(fn).toBeDefined();
      expect(fn?.inequalityOp).toBe(">");
      expect(fn?.dashed).toBe(true);
      expect(fn?.shadeHalfPlane).toBe("above");
    });

    it("parses non-strict inequality with solid line and shading below: ص <= -س + 4", () => {
      const fn = parseLinearFunctionOrInequality("ص ≤ -س + 4");
      expect(fn).toBeDefined();
      expect(fn?.inequalityOp).toBe("<=");
      expect(fn?.dashed).toBe(false);
      expect(fn?.shadeHalfPlane).toBe("below");
    });

    it("parses horizontal inequality ص >= 3 with shading above", () => {
      const fn = parseLinearFunctionOrInequality("ص >= 3");
      expect(fn).toBeDefined();
      expect(fn?.kind).toBe("horizontal_line");
      expect(fn?.a).toBe(3);
      expect(fn?.shadeHalfPlane).toBe("above");
    });

    it("parses vertical inequality س > -2 with shading right and dashed line", () => {
      const fn = parseLinearFunctionOrInequality("س > -2");
      expect(fn).toBeDefined();
      expect(fn?.kind).toBe("vertical_line");
      expect(fn?.a).toBe(-2);
      expect(fn?.dashed).toBe(true);
      expect(fn?.shadeHalfPlane).toBe("right");
    });
  });

  describe("Task 3.4: Quadratic Curves, Vertex & Axis of Symmetry", () => {
    it("parses standard quadratic form ص = س² - 4س + 3 and computes vertex (2, -1)", () => {
      const fn = parseQuadraticFunction("ص = س² - 4س + 3", "أوجد رأس المنحنى ومحور التماثل");
      expect(fn).toBeDefined();
      expect(fn?.kind).toBe("quadratic");
      expect(fn?.a).toBe(1);
      expect(fn?.b).toBe(-4);
      expect(fn?.c).toBe(3);
      expect(fn?.vertexPoint).toBeDefined();
      expect(fn?.vertexPoint?.x).toBe(2);
      expect(fn?.vertexPoint?.y).toBe(-1);
      expect(fn?.axisOfSymmetry).toBe(2);
    });

    it("parses vertex form ص = -(س - 1)² + 4 into standard coefficients", () => {
      const fn = parseQuadraticFunction("ص = -(س - 1)² + 4", "رأس المنحنى");
      expect(fn).toBeDefined();
      expect(fn?.kind).toBe("quadratic");
      expect(fn?.a).toBe(-1);
      expect(fn?.b).toBe(2);
      expect(fn?.c).toBe(3);
      expect(fn?.vertexPoint?.x).toBe(1);
      expect(fn?.vertexPoint?.y).toBe(4);
    });
  });

  describe("Task 3.5: Absolute Value and Piecewise Functions", () => {
    it("parses absolute value function ص = |س - 3| - 2", () => {
      const fn = parseAbsoluteValueFunction("ص = |س - 3| - 2", "رأس الدالة");
      expect(fn).toBeDefined();
      expect(fn?.kind).toBe("absolute");
      expect(fn?.a).toBe(1);
      expect(fn?.b).toBe(3);
      expect(fn?.c).toBe(-2);
      expect(fn?.vertexPoint?.x).toBe(3);
      expect(fn?.vertexPoint?.y).toBe(-2);
    });

    it("parses composite absolute value ص = 2|3س - 6| + 1", () => {
      const fn = parseAbsoluteValueFunction("ص = 2|3س - 6| + 1");
      expect(fn).toBeDefined();
      expect(fn?.b).toBe(2); // apex at x = 6/3 = 2
      expect(fn?.c).toBe(1);
    });

    it("parses piecewise branches with domains", () => {
      const b1 = parsePiecewiseBranch("ص = 2س عندما س ≥ 0");
      const b2 = parsePiecewiseBranch("ص = -2س عندما س < 0");
      expect(b1).toBeDefined();
      expect(b1?.domain.min).toBe(0);
      expect(b1?.domain.includeMin).toBe(true);
      expect(b2?.domain.max).toBe(0);
      expect(b2?.domain.includeMax).toBe(false);

      const assembled = assemblePiecewiseFunction([b1!, b2!]);
      expect(assembled.kind).toBe("piecewise");
      expect(assembled.branches?.length).toBe(2);
    });
  });

  describe("Task 3.6 & 3.7: Consistency Checking and SVG Projection", () => {
    it("flags point out of range", () => {
      const spec = {
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        functions: [{ kind: "linear" as const, a: 1, b: 0, c: 0 }],
        points: [{ x: 10, y: 10, label: "A" }],
      };
      const rep = checkCartesianGraphConsistency(spec);
      expect(rep.warnings.length).toBeGreaterThan(0);
      expect(rep.warnings[0]).toContain("خارج حدود المدى");
    });

    it("renders SVG markup with shading, dashed line, and points", () => {
      const spec = parseCartesianGraphDescription("[رسم بياني: ص > 2س - 1 ؛ (1، 1)]");
      expect(spec).not.toBeNull();
      const svg = projectCartesianGraphToSVGMarkup(spec!);
      expect(svg).toContain("<svg");
      expect(svg).toContain("<polygon"); // shading
      expect(svg).toContain(`stroke-dasharray="4,3"`); // dashed line for strict inequality
      expect(svg).toContain("<circle"); // point
    });
  });
});
