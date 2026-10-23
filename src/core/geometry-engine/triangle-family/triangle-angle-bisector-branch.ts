/**
 * @file triangle-angle-bisector-branch.ts
 * @description فرع منبثق من الأصل الواحد للمثلث (`triangle-root-core.ts`):
 * يمثل نظرية منصف زاوية رأس المثلث (الداخلي أو الخارجي) وتقسيم القاعدة بنسبة طولي الضلعين الآخرين.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createTriangleRootCore } from "./triangle-root-core";

export const MODULE_ID_TRIANGLE_ANGLE_BISECTOR_BRANCH =
  "triangle_angle_bisector_branch" as const;

export function buildTriangleAngleBisectorFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createTriangleRootCore({
    idPrefix: params.figureId,
    kind: "scalene",
    notationLanguage: params.notationLanguage || "arabic",
    baseLengthCm: 9,
    heightLengthCm: 6,
  });

  const bisectorPointD = root.getPointOnEdgeByRatio("BC", 0.45, "د");

  return {
    figureId: params.figureId,
    familyId: "triangle_family",
    branchId: "triangle_interior_exterior_bisector",
    titleArabic: `منصف زاوية ${root.vertexTop.label} في المثلث ${root.vertexTop.label}${root.vertexRight.label}${root.vertexLeft.label} يقطع ${root.vertexRight.label}${root.vertexLeft.label} في ${bisectorPointD.label}`,
    notationLanguage: root.notationLanguage,
    vertices: [
      root.vertexTop,
      root.vertexRight,
      root.vertexLeft,
      bisectorPointD,
    ],
    segments: [
      ...root.baseSegments,
      {
        id: `${params.figureId}_bisector_AD`,
        fromVertexId: root.vertexTop.id,
        toVertexId: bisectorPointD.id,
        strokeStyle: "dashed",
      },
    ],
    angles: [],
  };
}
