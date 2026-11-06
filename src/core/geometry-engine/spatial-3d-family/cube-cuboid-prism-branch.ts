/**
 * @file cube-cuboid-prism-branch.ts
 * @description فرع منبثق من أصل المجسمات الفراغية (`solid3d-root-core.ts`):
 * يمثل المكعب ومتوازي المستطيلات والمنشور القائم.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { create3DProjectedVertex } from "./solid3d-root-core";

export const MODULE_ID_CUBE_CUBOID_PRISM_BRANCH =
  "cube_cuboid_prism_branch" as const;

export function buildCubeCuboid3DFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly lengthCm?: number;
  readonly widthCm?: number;
  readonly heightCm?: number;
}): CanonicalGeometryFigureIR {
  const notation = params.notationLanguage || "arabic";
  const L = params.lengthCm && params.lengthCm > 0 ? params.lengthCm : 6;
  const W = params.widthCm && params.widthCm > 0 ? params.widthCm : 4;
  const H = params.heightCm && params.heightCm > 0 ? params.heightCm : 5;

  const vA = create3DProjectedVertex({ id: `${params.figureId}_A`, labelArabic: "أ", x: L, y: 0, z: 0, notationLanguage: notation });
  const vB = create3DProjectedVertex({ id: `${params.figureId}_B`, labelArabic: "ب", x: 0, y: 0, z: 0, notationLanguage: notation });
  const vC = create3DProjectedVertex({ id: `${params.figureId}_C`, labelArabic: "جـ", x: 0, y: 0, z: W, notationLanguage: notation });
  const vD = create3DProjectedVertex({ id: `${params.figureId}_D`, labelArabic: "د", x: L, y: 0, z: W, notationLanguage: notation });
  const vA2 = create3DProjectedVertex({ id: `${params.figureId}_A2`, labelArabic: "أ'", x: L, y: H, z: 0, notationLanguage: notation });
  const vB2 = create3DProjectedVertex({ id: `${params.figureId}_B2`, labelArabic: "ب'", x: 0, y: H, z: 0, notationLanguage: notation });
  const vC2 = create3DProjectedVertex({ id: `${params.figureId}_C2`, labelArabic: "جـ'", x: 0, y: H, z: W, notationLanguage: notation });
  const vD2 = create3DProjectedVertex({ id: `${params.figureId}_D2`, labelArabic: "د'", x: L, y: H, z: W, notationLanguage: notation });

  return {
    figureId: params.figureId,
    familyId: "solid3d_mechanics_family",
    branchId: "solid_cube_cuboid_prism",
    titleArabic: "متوازي المستطيلات أ ب جـ د أ' ب' جـ' د' وأحرفه المتعامدة",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vA2, vB2, vC2, vD2],
    segments: [
      {
        id: `${params.figureId}_AB`,
        fromVertexId: vA.id,
        toVertexId: vB.id,
        ...(params.lengthCm ? { lengthLabel: { value: params.lengthCm, unit: "سم", labelKind: "given" } } : {}),
      },
      { id: `${params.figureId}_BC`, fromVertexId: vB.id, toVertexId: vC.id, strokeStyle: "dashed" },
      { id: `${params.figureId}_CD`, fromVertexId: vC.id, toVertexId: vD.id, strokeStyle: "dashed" },
      {
        id: `${params.figureId}_DA`,
        fromVertexId: vD.id,
        toVertexId: vA.id,
        ...(params.widthCm ? { lengthLabel: { value: params.widthCm, unit: "سم", labelKind: "given" } } : {}),
      },
      { id: `${params.figureId}_A2B2`, fromVertexId: vA2.id, toVertexId: vB2.id },
      { id: `${params.figureId}_B2C2`, fromVertexId: vB2.id, toVertexId: vC2.id },
      { id: `${params.figureId}_C2D2`, fromVertexId: vC2.id, toVertexId: vD2.id },
      { id: `${params.figureId}_D2A2`, fromVertexId: vD2.id, toVertexId: vA2.id },
      {
        id: `${params.figureId}_AA2`,
        fromVertexId: vA.id,
        toVertexId: vA2.id,
        ...(params.heightCm ? { lengthLabel: { value: params.heightCm, unit: "سم", labelKind: "given" } } : {}),
      },
      { id: `${params.figureId}_BB2`, fromVertexId: vB.id, toVertexId: vB2.id },
      { id: `${params.figureId}_CC2`, fromVertexId: vC.id, toVertexId: vC2.id, strokeStyle: "dashed" },
      { id: `${params.figureId}_DD2`, fromVertexId: vD.id, toVertexId: vD2.id },
    ],
    angles: [],
  };
}
