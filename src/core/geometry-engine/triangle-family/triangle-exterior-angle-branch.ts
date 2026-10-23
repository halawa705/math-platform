/**
 * @file triangle-exterior-angle-branch.ts
 * @description فرع منبثق من الأصل الواحد للمثلث (`triangle-root-core.ts`):
 * يمثل نظرية الزاوية الخارجة عن المثلث (تساوي مجموع قياسي الزاويتين الداخلتين عدا المجاورة لها).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";
import { createTriangleRootCore } from "./triangle-root-core";

export const MODULE_ID_TRIANGLE_EXTERIOR_ANGLE_BRANCH =
  "triangle_exterior_angle_branch" as const;

export function buildTriangleExteriorAngleFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const notation = params.notationLanguage || "arabic";
  const root = createTriangleRootCore({
    idPrefix: params.figureId,
    kind: "scalene",
    notationLanguage: notation,
    baseLengthCm: 7,
    heightLengthCm: 5.5,
  });

  const extVertexD: CanonicalVertexNode = {
    id: `${params.figureId}_ext_D`,
    label: localizeGeometricVertexLabelSSOT("د", notation),
    position: { x: -3, y: 0 },
  };

  return {
    figureId: params.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: `الزاوية الخارجة ∠${root.vertexTop.label}${root.vertexLeft.label}${extVertexD.label} عن المثلث ${root.vertexTop.label}${root.vertexRight.label}${root.vertexLeft.label}`,
    notationLanguage: notation,
    vertices: [root.vertexTop, root.vertexRight, root.vertexLeft, extVertexD],
    segments: [
      ...root.baseSegments,
      {
        id: `${params.figureId}_ray_CD`,
        fromVertexId: root.vertexLeft.id,
        toVertexId: extVertexD.id,
        strokeStyle: "solid",
      },
    ],
    angles: [],
  };
}
