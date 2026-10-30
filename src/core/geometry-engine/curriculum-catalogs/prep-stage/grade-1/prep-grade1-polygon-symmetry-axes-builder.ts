/**
 * @file prep-grade1-polygon-symmetry-axes-builder.ts
 * @description منشئ أشكال محاور تماثل المضلعات (المثلثات، الأشكال الرباعية، والمضلعات المنتظمة) (1ع ص 247).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import type {
  CanonicalAngleNode,
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

export interface PrepGrade1PolygonSymmetryOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly polygonKind?: "equilateral_triangle" | "regular_pentagon" | "regular_hexagon";
}

/**
 * ص 247: شكل مضلع مع رسم خطوط محاور التماثل المنقطة L1, L2, L3...
 */
export function buildPolygonSymmetryAxesFigure(opts: PrepGrade1PolygonSymmetryOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const kind = opts.polygonKind || "regular_hexagon";

  if (kind === "regular_pentagon") {
    // خماسي منتظم بـ 5 محاور تماثل
    const cx = 5;
    const cy = 5;
    const r = 3.6;
    const vertices: CanonicalVertexNode[] = [];
    const segments: CanonicalSegmentNode[] = [];

    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const x = parseFloat((cx + r * Math.cos(angle)).toFixed(2));
      const y = parseFloat((cy + r * Math.sin(angle)).toFixed(2));
      const char = String.fromCharCode(65 + i); // A, B, C, D, E
      vertices.push({
        id: `${opts.figureId}_v${char}`,
        label: localizeGeometricVertexLabelSSOT(char, notation),
        position: { x, y },
      });
    }

    for (let i = 0; i < 5; i++) {
      const next = (i + 1) % 5;
      segments.push({
        id: `${opts.figureId}_s${i}`,
        fromVertexId: vertices[i].id,
        toVertexId: vertices[next].id,
        tickMarks: 1,
      });
    }

    // رؤوس محاور التماثل على الحواف
    const axBottom: CanonicalVertexNode = { id: `${opts.figureId}_axB`, label: "L1", position: { x: cx, y: 8.5 } };
    vertices.push(axBottom);
    segments.push({
      id: `${opts.figureId}_sAx1`,
      fromVertexId: vertices[0].id,
      toVertexId: axBottom.id,
      strokeStyle: "dashed",
    });

    return {
      figureId: opts.figureId,
      familyId: "quadrilateral_family",
      branchId: "quad_trapezoid_with_altitudes",
      titleArabic: "الخماسي المنتظم: عدد محاور التماثل = 5 محاور",
      notationLanguage: notation,
      vertices,
      segments,
      angles: [],
    };
  }

  if (kind === "equilateral_triangle") {
    // مثلث متساوي الأضلاع بـ 3 محاور تماثل
    const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 5, y: 1.5 } };
    const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 1.5, y: 7.5 } };
    const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 8.5, y: 7.5 } };
    const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: "L1", position: { x: 5, y: 8.5 } };

    return {
      figureId: opts.figureId,
      familyId: "triangle_family",
      branchId: "triangle_isosceles_equilateral",
      titleArabic: "المثلث المتساوي الأضلاع: عدد محاور التماثل = 3 محاور",
      notationLanguage: notation,
      vertices: [vA, vB, vC, vD],
      segments: [
        { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
        { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
        { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id, tickMarks: 1 },
        { id: `${opts.figureId}_sAx1`, fromVertexId: vA.id, toVertexId: vD.id, strokeStyle: "dashed" },
      ],
      angles: [] as readonly CanonicalAngleNode[],
    };
  }

  // الافتراضي: سداسي منتظم بـ 6 محاور تماثل (ص 247)
  const cx = 5;
  const cy = 5;
  const r = 3.8;
  const vertices: CanonicalVertexNode[] = [];
  const segments: CanonicalSegmentNode[] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = parseFloat((cx + r * Math.cos(angle)).toFixed(2));
    const y = parseFloat((cy + r * Math.sin(angle)).toFixed(2));
    const char = String.fromCharCode(65 + i); // A, B, C, D, E, F
    vertices.push({
      id: `${opts.figureId}_v${char}`,
      label: localizeGeometricVertexLabelSSOT(char, notation),
      position: { x, y },
    });
  }

  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    segments.push({
      id: `${opts.figureId}_s${i}`,
      fromVertexId: vertices[i].id,
      toVertexId: vertices[next].id,
      tickMarks: 1,
    });
  }

  segments.push(
    { id: `${opts.figureId}_ax1`, fromVertexId: vertices[0].id, toVertexId: vertices[3].id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_ax2`, fromVertexId: vertices[1].id, toVertexId: vertices[4].id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_ax3`, fromVertexId: vertices[2].id, toVertexId: vertices[5].id, strokeStyle: "dashed" }
  );

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "السداسي المنتظم: عدد محاور التماثل = 6 محاور",
    notationLanguage: notation,
    vertices,
    segments,
    angles: [],
  };
}
