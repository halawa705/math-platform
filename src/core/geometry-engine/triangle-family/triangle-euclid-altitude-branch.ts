/**
 * @file triangle-euclid-altitude-branch.ts
 * @description فرع منبثق من الأصل الواحد للمثلث (`triangle-root-core.ts`):
 * يمثل نظرية إقليدس (مثلث قائم الزاوية في أ سقط منه العمود أ د على الوتر ب جـ).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createTriangleRootCore } from "./triangle-root-core";

export const MODULE_ID_TRIANGLE_EUCLID_ALTITUDE_BRANCH =
  "triangle_euclid_altitude_branch" as const;

export function buildTriangleEuclidAltitudeFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createTriangleRootCore({
    idPrefix: params.figureId,
    kind: "scalene",
    notationLanguage: params.notationLanguage || "arabic",
    baseLengthCm: 10,
    heightLengthCm: 4.8,
  });

  const footD = root.getAltitudeFoot("A", "د");

  return {
    figureId: params.figureId,
    familyId: "triangle_family",
    branchId: "triangle_euclid_right_altitude",
    titleArabic: `نظرية إقليدس: المثلث ${root.vertexTop.label}${root.vertexRight.label}${root.vertexLeft.label} قائم في ${root.vertexTop.label}، و ${root.vertexTop.label}${footD.label} عمودي على ${root.vertexRight.label}${root.vertexLeft.label}`,
    notationLanguage: root.notationLanguage,
    vertices: [root.vertexTop, root.vertexRight, root.vertexLeft, footD],
    segments: [
      {
        id: `${params.figureId}_ab`,
        fromVertexId: root.vertexTop.id,
        toVertexId: root.vertexRight.id,
        lengthLabel: { value: 6, unit: "سم" },
      },
      {
        id: `${params.figureId}_ac`,
        fromVertexId: root.vertexTop.id,
        toVertexId: root.vertexLeft.id,
        lengthLabel: { value: 8, unit: "سم" },
      },
      {
        id: `${params.figureId}_bc`,
        fromVertexId: root.vertexRight.id,
        toVertexId: root.vertexLeft.id,
        lengthLabel: { value: 10, unit: "سم" },
      },
      {
        id: `${params.figureId}_ad_alt`,
        fromVertexId: root.vertexTop.id,
        toVertexId: footD.id,
        strokeStyle: "dashed",
        lengthLabel: { value: 4.8, unit: "سم" },
      },
    ],
    angles: [
      {
        id: `${params.figureId}_ang_A`,
        vertexId: root.vertexTop.id,
        arm1VertexId: root.vertexRight.id,
        arm2VertexId: root.vertexLeft.id,
        isRightAngle: true,
      },
    ],
  };
}
