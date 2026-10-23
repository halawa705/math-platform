/**
 * @file cylinder-cone-sphere-branch.ts
 * @description فرع منبثق من أصل المجسمات الفراغية (`solid3d-root-core.ts`):
 * يمثل المخروط الدوراني القائم والأسطوانة الدائرية القائمة والكرة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { create3DProjectedVertex } from "./solid3d-root-core";

export const MODULE_ID_CYLINDER_CONE_SPHERE_BRANCH =
  "cylinder_cone_sphere_branch" as const;

export function buildRightCircularCone3DFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const notation = params.notationLanguage || "arabic";

  const apexA = create3DProjectedVertex({ id: `${params.figureId}_A`, labelArabic: "أ", x: 4, y: 7, z: 0, notationLanguage: notation });
  const baseB = create3DProjectedVertex({ id: `${params.figureId}_B`, labelArabic: "ب", x: 8, y: 0, z: 0, notationLanguage: notation });
  const baseC = create3DProjectedVertex({ id: `${params.figureId}_C`, labelArabic: "جـ", x: 0, y: 0, z: 0, notationLanguage: notation });
  const centerM = create3DProjectedVertex({ id: `${params.figureId}_M`, labelArabic: "م", x: 4, y: 0, z: 0, notationLanguage: notation });

  return {
    figureId: params.figureId,
    familyId: "solid3d_mechanics_family",
    branchId: "solid_cylinder_cone_sphere",
    titleArabic: "المخروط الدائري القائم وطول راسمه أ ب وارتفاعه أ م ونصف قطر قاعدته م ب",
    notationLanguage: notation,
    vertices: [apexA, baseB, baseC, centerM],
    segments: [
      { id: `${params.figureId}_AB`, fromVertexId: apexA.id, toVertexId: baseB.id, lengthLabel: { value: 10, unit: "سم" } },
      { id: `${params.figureId}_AC`, fromVertexId: apexA.id, toVertexId: baseC.id },
      { id: `${params.figureId}_BC`, fromVertexId: baseB.id, toVertexId: baseC.id },
      { id: `${params.figureId}_AM`, fromVertexId: apexA.id, toVertexId: centerM.id, strokeStyle: "dashed", lengthLabel: { value: 8, unit: "سم" } },
    ],
    angles: [],
  };
}
