/**
 * @file primary-grade4-composite-orthogonal-builders.ts
 * @description منشئات البنية الهندسية المتعامدة للأشكال المركبة (L، T، U مقلوب، الدرج) للصف الرابع الابتدائي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import type {
  ArabicMathUnit,
  MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE4_COMPOSITE_ORTHOGONAL_BUILDERS =
  "primary_grade4_composite_orthogonal_builders" as const;

export interface Grade4CompositeShapesOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/** 1. شكل حرف L */
export function buildGrade4LShapeFigure(
  params: {
    wTotal: number | string;
    hTotal: number | string;
    wTop: number | string;
    hBase: number | string;
    wStep?: number | string;
    hStep?: number | string;
    unit: ArabicMathUnit;
  },
  opts: Grade4CompositeShapesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const u = params.unit;

  const v0: CanonicalVertexNode = { id: `${opts.figureId}_l0`, label: "", hideVertexDot: true, position: { x: 1.5, y: 1.5 } };
  const v1: CanonicalVertexNode = { id: `${opts.figureId}_l1`, label: "", hideVertexDot: true, position: { x: 8.5, y: 1.5 } };
  const v2: CanonicalVertexNode = { id: `${opts.figureId}_l2`, label: "", hideVertexDot: true, position: { x: 8.5, y: 3.5 } };
  const v3: CanonicalVertexNode = { id: `${opts.figureId}_l3`, label: "", hideVertexDot: true, position: { x: 4.8, y: 3.5 } };
  const v4: CanonicalVertexNode = { id: `${opts.figureId}_l4`, label: "", hideVertexDot: true, position: { x: 4.8, y: 8.5 } };
  const v5: CanonicalVertexNode = { id: `${opts.figureId}_l5`, label: "", hideVertexDot: true, position: { x: 1.5, y: 8.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_s01`, fromVertexId: v0.id, toVertexId: v1.id, lengthLabel: { value: `${params.wTotal} ${u}`.trim() } },
    { id: `${opts.figureId}_s12`, fromVertexId: v1.id, toVertexId: v2.id, lengthLabel: { value: `${params.hBase} ${u}`.trim() } },
    { id: `${opts.figureId}_s23`, fromVertexId: v2.id, toVertexId: v3.id, lengthLabel: params.wStep ? { value: `${params.wStep} ${u}`.trim() } : undefined },
    { id: `${opts.figureId}_s34`, fromVertexId: v3.id, toVertexId: v4.id, lengthLabel: params.hStep ? { value: `${params.hStep} ${u}`.trim() } : undefined },
    { id: `${opts.figureId}_s45`, fromVertexId: v4.id, toVertexId: v5.id, lengthLabel: { value: `${params.wTop} ${u}`.trim() } },
    { id: `${opts.figureId}_s50`, fromVertexId: v5.id, toVertexId: v0.id, lengthLabel: { value: `${params.hTotal} ${u}`.trim() } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_composite_rectilinear_shape",
    titleArabic: `شكل مركب حرف L لحساب المحيط والمساحة وإيجاد المجهول (${u})`,
    notationLanguage: notation,
    vertices: [v0, v1, v2, v3, v4, v5],
    segments,
    angles: [],
    polygons: [[v0.id, v1.id, v2.id, v3.id, v4.id, v5.id]],
  };
}

/** 2. شكل حرف T */
export function buildGrade4TShapeFigure(
  params: {
    wTop: number | string;
    hTop: number | string;
    wStem: number | string;
    hStem: number | string;
    wLeftArm?: number | string;
    wRightArm?: number | string;
    unit: ArabicMathUnit;
  },
  opts: Grade4CompositeShapesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const u = params.unit;

  const v0: CanonicalVertexNode = { id: `${opts.figureId}_t0`, label: "", hideVertexDot: true, position: { x: 1.2, y: 8.5 } };
  const v1: CanonicalVertexNode = { id: `${opts.figureId}_t1`, label: "", hideVertexDot: true, position: { x: 8.8, y: 8.5 } };
  const v2: CanonicalVertexNode = { id: `${opts.figureId}_t2`, label: "", hideVertexDot: true, position: { x: 8.8, y: 6.8 } };
  const v3: CanonicalVertexNode = { id: `${opts.figureId}_t3`, label: "", hideVertexDot: true, position: { x: 6.4, y: 6.8 } };
  const v4: CanonicalVertexNode = { id: `${opts.figureId}_t4`, label: "", hideVertexDot: true, position: { x: 6.4, y: 1.5 } };
  const v5: CanonicalVertexNode = { id: `${opts.figureId}_t5`, label: "", hideVertexDot: true, position: { x: 3.6, y: 1.5 } };
  const v6: CanonicalVertexNode = { id: `${opts.figureId}_t6`, label: "", hideVertexDot: true, position: { x: 3.6, y: 6.8 } };
  const v7: CanonicalVertexNode = { id: `${opts.figureId}_t7`, label: "", hideVertexDot: true, position: { x: 1.2, y: 6.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_st01`, fromVertexId: v0.id, toVertexId: v1.id, lengthLabel: { value: `${params.wTop} ${u}`.trim() } },
    { id: `${opts.figureId}_st12`, fromVertexId: v1.id, toVertexId: v2.id, lengthLabel: { value: `${params.hTop} ${u}`.trim() } },
    { id: `${opts.figureId}_st23`, fromVertexId: v2.id, toVertexId: v3.id, lengthLabel: params.wRightArm ? { value: `${params.wRightArm} ${u}`.trim() } : undefined },
    { id: `${opts.figureId}_st34`, fromVertexId: v3.id, toVertexId: v4.id, lengthLabel: { value: `${params.hStem} ${u}`.trim() } },
    { id: `${opts.figureId}_st45`, fromVertexId: v4.id, toVertexId: v5.id, lengthLabel: { value: `${params.wStem} ${u}`.trim() } },
    { id: `${opts.figureId}_st56`, fromVertexId: v5.id, toVertexId: v6.id, lengthLabel: { value: `${params.hStem} ${u}`.trim() } },
    { id: `${opts.figureId}_st67`, fromVertexId: v6.id, toVertexId: v7.id, lengthLabel: params.wLeftArm ? { value: `${params.wLeftArm} ${u}`.trim() } : undefined },
    { id: `${opts.figureId}_st70`, fromVertexId: v7.id, toVertexId: v0.id, lengthLabel: { value: `${params.hTop} ${u}`.trim() } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_composite_rectilinear_shape",
    titleArabic: `شكل مركب حرف T (${params.wTop} ${u})`,
    notationLanguage: notation,
    vertices: [v0, v1, v2, v3, v4, v5, v6, v7],
    segments,
    angles: [],
    polygons: [[v0.id, v1.id, v2.id, v3.id, v4.id, v5.id, v6.id, v7.id]],
  };
}

/** 3. شكل حرف T مقلوب */
export function buildGrade4InvertedTShapeFigure(
  params: {
    wBase: number | string;
    hBase: number | string;
    wCol: number | string;
    hCol: number | string;
    wStep?: number | string;
    unit: ArabicMathUnit;
  },
  opts: Grade4CompositeShapesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const u = params.unit;

  const v0: CanonicalVertexNode = { id: `${opts.figureId}_it0`, label: "", hideVertexDot: true, position: { x: 1.2, y: 1.5 } };
  const v1: CanonicalVertexNode = { id: `${opts.figureId}_it1`, label: "", hideVertexDot: true, position: { x: 8.8, y: 1.5 } };
  const v2: CanonicalVertexNode = { id: `${opts.figureId}_it2`, label: "", hideVertexDot: true, position: { x: 8.8, y: 3.5 } };
  const v3: CanonicalVertexNode = { id: `${opts.figureId}_it3`, label: "", hideVertexDot: true, position: { x: 6.2, y: 3.5 } };
  const v4: CanonicalVertexNode = { id: `${opts.figureId}_it4`, label: "", hideVertexDot: true, position: { x: 6.2, y: 8.5 } };
  const v5: CanonicalVertexNode = { id: `${opts.figureId}_it5`, label: "", hideVertexDot: true, position: { x: 3.8, y: 8.5 } };
  const v6: CanonicalVertexNode = { id: `${opts.figureId}_it6`, label: "", hideVertexDot: true, position: { x: 3.8, y: 3.5 } };
  const v7: CanonicalVertexNode = { id: `${opts.figureId}_it7`, label: "", hideVertexDot: true, position: { x: 1.2, y: 3.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sit01`, fromVertexId: v0.id, toVertexId: v1.id, lengthLabel: { value: `${params.wBase} ${u}`.trim() } },
    { id: `${opts.figureId}_sit12`, fromVertexId: v1.id, toVertexId: v2.id, lengthLabel: { value: `${params.hBase} ${u}`.trim() } },
    { id: `${opts.figureId}_sit23`, fromVertexId: v2.id, toVertexId: v3.id, lengthLabel: params.wStep ? { value: `${params.wStep} ${u}`.trim() } : undefined },
    { id: `${opts.figureId}_sit34`, fromVertexId: v3.id, toVertexId: v4.id, lengthLabel: { value: `${params.hCol} ${u}`.trim() } },
    { id: `${opts.figureId}_sit45`, fromVertexId: v4.id, toVertexId: v5.id, lengthLabel: { value: `${params.wCol} ${u}`.trim() } },
    { id: `${opts.figureId}_sit56`, fromVertexId: v5.id, toVertexId: v6.id, lengthLabel: { value: `${params.hCol} ${u}`.trim() } },
    { id: `${opts.figureId}_sit67`, fromVertexId: v6.id, toVertexId: v7.id, lengthLabel: params.wStep ? { value: `${params.wStep} ${u}`.trim() } : undefined },
    { id: `${opts.figureId}_sit70`, fromVertexId: v7.id, toVertexId: v0.id, lengthLabel: { value: `${params.hBase} ${u}`.trim() } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_composite_rectilinear_shape",
    titleArabic: `شكل مركب حرف T مقلوب (${params.wBase} ${u})`,
    notationLanguage: notation,
    vertices: [v0, v1, v2, v3, v4, v5, v6, v7],
    segments,
    angles: [],
    polygons: [[v0.id, v1.id, v2.id, v3.id, v4.id, v5.id, v6.id, v7.id]],
  };
}

/** 4. شكل حرف U مقلوب */
export function buildGrade4InvertedUShapeFigure(
  params: {
    wTop: number | string;
    hTotal: number | string;
    wFoot: number | string;
    hCavity: number | string;
    wCavity?: number | string;
    hLeft?: number | string;
    unit: ArabicMathUnit;
  },
  opts: Grade4CompositeShapesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const u = params.unit;

  const v0: CanonicalVertexNode = { id: `${opts.figureId}_u0`, label: "", hideVertexDot: true, position: { x: 1.5, y: 1.5 } };
  const v1: CanonicalVertexNode = { id: `${opts.figureId}_u1`, label: "", hideVertexDot: true, position: { x: 4.2, y: 1.5 } };
  const v2: CanonicalVertexNode = { id: `${opts.figureId}_u2`, label: "", hideVertexDot: true, position: { x: 4.2, y: 4.8 } };
  const v3: CanonicalVertexNode = { id: `${opts.figureId}_u3`, label: "", hideVertexDot: true, position: { x: 5.8, y: 4.8 } };
  const v4: CanonicalVertexNode = { id: `${opts.figureId}_u4`, label: "", hideVertexDot: true, position: { x: 5.8, y: 1.5 } };
  const v5: CanonicalVertexNode = { id: `${opts.figureId}_u5`, label: "", hideVertexDot: true, position: { x: 8.5, y: 1.5 } };
  const v6: CanonicalVertexNode = { id: `${opts.figureId}_u6`, label: "", hideVertexDot: true, position: { x: 8.5, y: 8.5 } };
  const v7: CanonicalVertexNode = { id: `${opts.figureId}_u7`, label: "", hideVertexDot: true, position: { x: 1.5, y: 8.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_su01`, fromVertexId: v0.id, toVertexId: v1.id, lengthLabel: { value: `${params.wFoot} ${u}`.trim() } },
    { id: `${opts.figureId}_su12`, fromVertexId: v1.id, toVertexId: v2.id, lengthLabel: { value: `${params.hCavity} ${u}`.trim() } },
    { id: `${opts.figureId}_su23`, fromVertexId: v2.id, toVertexId: v3.id, lengthLabel: params.wCavity ? { value: `${params.wCavity} ${u}`.trim() } : undefined },
    { id: `${opts.figureId}_su34`, fromVertexId: v3.id, toVertexId: v4.id, lengthLabel: { value: `${params.hCavity} ${u}`.trim() } },
    { id: `${opts.figureId}_su45`, fromVertexId: v4.id, toVertexId: v5.id, lengthLabel: { value: `${params.wFoot} ${u}`.trim() } },
    { id: `${opts.figureId}_su56`, fromVertexId: v5.id, toVertexId: v6.id, lengthLabel: { value: `${params.hTotal} ${u}`.trim() } },
    { id: `${opts.figureId}_su67`, fromVertexId: v6.id, toVertexId: v7.id, lengthLabel: { value: `${params.wTop} ${u}`.trim() } },
    { id: `${opts.figureId}_su70`, fromVertexId: v7.id, toVertexId: v0.id, lengthLabel: { value: `${params.hLeft ?? params.hTotal} ${u}`.trim() } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_composite_rectilinear_shape",
    titleArabic: `شكل قوس مجوف U مقلوب (${params.wTop} ${u})`,
    notationLanguage: notation,
    vertices: [v0, v1, v2, v3, v4, v5, v6, v7],
    segments,
    angles: [],
    polygons: [[v0.id, v1.id, v2.id, v3.id, v4.id, v5.id, v6.id, v7.id]],
  };
}

/** 5. مستطيلان متجاوران / شكل الدرج */
export function buildGrade4AdjacentRectanglesFigure(
  params: {
    w1: number | string;
    h1: number | string;
    w2: number | string;
    h2: number | string;
    unit: ArabicMathUnit;
  },
  opts: Grade4CompositeShapesOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const u = params.unit;

  const vA0: CanonicalVertexNode = { id: `${opts.figureId}_ar0`, label: "", hideVertexDot: true, position: { x: 1.5, y: 1.5 } };
  const vA1: CanonicalVertexNode = { id: `${opts.figureId}_ar1`, label: "", hideVertexDot: true, position: { x: 5.0, y: 1.5 } };
  const vA2: CanonicalVertexNode = { id: `${opts.figureId}_ar2`, label: "", hideVertexDot: true, position: { x: 8.5, y: 1.5 } };
  const vA3: CanonicalVertexNode = { id: `${opts.figureId}_ar3`, label: "", hideVertexDot: true, position: { x: 8.5, y: 5.5 } };
  const vA4: CanonicalVertexNode = { id: `${opts.figureId}_ar4`, label: "", hideVertexDot: true, position: { x: 5.0, y: 5.5 } };
  const vA5: CanonicalVertexNode = { id: `${opts.figureId}_ar5`, label: "", hideVertexDot: true, position: { x: 5.0, y: 8.5 } };
  const vA6: CanonicalVertexNode = { id: `${opts.figureId}_ar6`, label: "", hideVertexDot: true, position: { x: 1.5, y: 8.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sar01`, fromVertexId: vA0.id, toVertexId: vA1.id, lengthLabel: { value: `${params.w1} ${u}`.trim() } },
    { id: `${opts.figureId}_sar12`, fromVertexId: vA1.id, toVertexId: vA2.id, lengthLabel: { value: `${params.w2} ${u}`.trim() } },
    { id: `${opts.figureId}_sar23`, fromVertexId: vA2.id, toVertexId: vA3.id, lengthLabel: { value: `${params.h2} ${u}`.trim() } },
    { id: `${opts.figureId}_sar34`, fromVertexId: vA3.id, toVertexId: vA4.id, lengthLabel: { value: `${params.w2} ${u}`.trim() } },
    { id: `${opts.figureId}_sar45`, fromVertexId: vA4.id, toVertexId: vA5.id },
    { id: `${opts.figureId}_sar56`, fromVertexId: vA5.id, toVertexId: vA6.id, lengthLabel: { value: `${params.w1} ${u}`.trim() } },
    { id: `${opts.figureId}_sar60`, fromVertexId: vA6.id, toVertexId: vA0.id, lengthLabel: { value: `${params.h1} ${u}`.trim() } },
    { id: `${opts.figureId}_sarDivider`, fromVertexId: vA1.id, toVertexId: vA4.id, strokeStyle: "dashed" },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_composite_rectilinear_shape",
    titleArabic: `شكل مركب من مستطيلين ملتصقين (${params.w1}×${params.h1} و ${params.w2}×${params.h2} ${u})`,
    notationLanguage: notation,
    vertices: [vA0, vA1, vA2, vA3, vA4, vA5, vA6],
    segments,
    angles: [],
    polygons: [
      [vA0.id, vA1.id, vA4.id, vA5.id, vA6.id],
      [vA1.id, vA2.id, vA3.id, vA4.id],
    ],
  };
}
