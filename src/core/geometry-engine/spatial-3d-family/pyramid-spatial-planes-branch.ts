/**
 * @file pyramid-spatial-planes-branch.ts
 * @description فرع منبثق من أصل المجسمات الفراغية (`solid3d-root-core.ts`):
 * يمثل الهرم الرباعي المنتظم م أ ب جـ د وارتفاعه الجانبي والعام.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { create3DProjectedVertex } from "./solid3d-root-core";

export const MODULE_ID_PYRAMID_SPATIAL_PLANES_BRANCH =
  "pyramid_spatial_planes_branch" as const;

export function buildRegularPyramid3DFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const notation = params.notationLanguage || "arabic";

  const apexM = create3DProjectedVertex({
    id: `${params.figureId}_M`,
    labelArabic: "م",
    x: 4,
    y: 8,
    z: 2,
    notationLanguage: notation,
  });
  const baseA = create3DProjectedVertex({
    id: `${params.figureId}_A`,
    labelArabic: "أ",
    x: 8,
    y: 0,
    z: 0,
    notationLanguage: notation,
  });
  const baseB = create3DProjectedVertex({
    id: `${params.figureId}_B`,
    labelArabic: "ب",
    x: 0,
    y: 0,
    z: 0,
    notationLanguage: notation,
  });
  const baseC = create3DProjectedVertex({
    id: `${params.figureId}_C`,
    labelArabic: "جـ",
    x: 0,
    y: 0,
    z: 4,
    notationLanguage: notation,
  });
  const baseD = create3DProjectedVertex({
    id: `${params.figureId}_D`,
    labelArabic: "د",
    x: 8,
    y: 0,
    z: 4,
    notationLanguage: notation,
  });
  const centerN = create3DProjectedVertex({
    id: `${params.figureId}_N`,
    labelArabic: "ن",
    x: 4,
    y: 0,
    z: 2,
    notationLanguage: notation,
  });

  return {
    figureId: params.figureId,
    familyId: "solid3d_mechanics_family",
    branchId: "solid_regular_pyramid",
    titleArabic: "الهرم الرباعي المنتظم م أ ب جـ د وارتفاعه العمودي م ن",
    notationLanguage: notation,
    vertices: [apexM, baseA, baseB, baseC, baseD, centerN],
    segments: [
      { id: `${params.figureId}_AB`, fromVertexId: baseA.id, toVertexId: baseB.id },
      { id: `${params.figureId}_BC`, fromVertexId: baseB.id, toVertexId: baseC.id, strokeStyle: "dashed" },
      { id: `${params.figureId}_CD`, fromVertexId: baseC.id, toVertexId: baseD.id, strokeStyle: "dashed" },
      { id: `${params.figureId}_DA`, fromVertexId: baseD.id, toVertexId: baseA.id },
      { id: `${params.figureId}_MA`, fromVertexId: apexM.id, toVertexId: baseA.id },
      { id: `${params.figureId}_MB`, fromVertexId: apexM.id, toVertexId: baseB.id },
      { id: `${params.figureId}_MC`, fromVertexId: apexM.id, toVertexId: baseC.id, strokeStyle: "dashed" },
      { id: `${params.figureId}_MD`, fromVertexId: apexM.id, toVertexId: baseD.id },
      { id: `${params.figureId}_MN`, fromVertexId: apexM.id, toVertexId: centerN.id, strokeStyle: "dotted" },
    ],
    angles: [],
  };
}
