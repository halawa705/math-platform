/**
 * @file circle-external-tangents-branch.ts
 * @description فرع منبثق من أصل الدائرة (`circle-root-core.ts`):
 * يمثل نظرية القطعتين المماستين المرسومتين من نقطة خارج الدائرة متساويتان في الطول.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createCircleRootCore } from "./circle-root-core";

export const MODULE_ID_CIRCLE_EXTERNAL_TANGENTS_BRANCH =
  "circle_external_tangents_branch" as const;

export function buildCircleExternalTangentsFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createCircleRootCore({
    idPrefix: params.figureId,
    radiusCm: 4,
    notationLanguage: params.notationLanguage || "arabic",
  });

  const extA = root.getExternalPoint(9, 0, "أ");
  const ptB = root.getPointOnCircumference(60, "ب");
  const ptC = root.getPointOnCircumference(300, "جـ");

  return {
    figureId: params.figureId,
    familyId: "circle_family",
    branchId: "circle_two_tangents_from_external_point",
    titleArabic: `القطعتان المماستان ${extA.label}${ptB.label}، ${extA.label}${ptC.label} المرسومتان من النقطة ${extA.label} للدائرة ${root.centerVertex.label}`,
    notationLanguage: root.notationLanguage,
    vertices: [root.centerVertex, extA, ptB, ptC],
    segments: [
      {
        id: `${params.figureId}_tan_AB`,
        fromVertexId: extA.id,
        toVertexId: ptB.id,
        tickMarks: 1,
      },
      {
        id: `${params.figureId}_tan_AC`,
        fromVertexId: extA.id,
        toVertexId: ptC.id,
        tickMarks: 1,
      },
      {
        id: `${params.figureId}_rad_MB`,
        fromVertexId: root.centerVertex.id,
        toVertexId: ptB.id,
        strokeStyle: "dashed",
      },
      {
        id: `${params.figureId}_rad_MC`,
        fromVertexId: root.centerVertex.id,
        toVertexId: ptC.id,
        strokeStyle: "dashed",
      },
    ],
    angles: [],
  };
}
