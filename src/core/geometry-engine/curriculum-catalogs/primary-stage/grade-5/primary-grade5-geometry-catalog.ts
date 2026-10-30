/**
 * @file primary-grade5-geometry-catalog.ts
 * @description السجل المركزي لأشكال ومفاهيم الهندسة والمساحات القياسية للصف الخامس الابتدائي:
 * - مساحة المثلث (قاعدة وارتفاع مناظر).
 * - مساحة متوازي الأضلاع والقطاعات الدائرية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
  CanonicalAngleNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE5_GEOMETRY_CATALOG =
  "primary_grade5_geometry_catalog" as const;

export interface Grade5FigureBuildOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مثلث مع ارتفاع ساقط على القاعدة لحساب المساحة (نصف القاعدة × الارتفاع)
 */
function buildGrade5TriangleAltitudeAreaFigure(
  opts: Grade5FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_pA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 8 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_pB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_pC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 1 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_pD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 8, unit: "سم" } },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, strokeStyle: "dashed", lengthLabel: { value: 6, unit: "سم" } },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "مساحة المثلث = نصف القاعدة × الارتفاع",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles,
  };
}

export function matchPrimaryGrade5GeometryFigure(
  description: string,
  figureId = "primary5_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  if (/مساحة.*مثلث|نصف.*القاعدة.*الارتفاع|قاعدة.*ارتفاع/i.test(d)) {
    return buildGrade5TriangleAltitudeAreaFigure({ figureId, notationLanguage });
  }

  return undefined;
}
