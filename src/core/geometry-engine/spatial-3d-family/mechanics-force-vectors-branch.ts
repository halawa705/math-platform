/**
 * @file mechanics-force-vectors-branch.ts
 * @description فرع منبثق من أصل الميكانيكا والاستاتيكا والديناميكا:
 * يمثل اتزان جسم على مستوى مائل ومتجهات القوى (الوزن و، رد الفعل ر، قوة الشد أو الاحتكاك).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalGeometryFigureIR, CanonicalVertexNode } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_MECHANICS_FORCE_VECTORS_BRANCH =
  "mechanics_force_vectors_branch" as const;

export function buildInclinedPlaneForcesFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const notation = params.notationLanguage || "arabic";

  const vBaseRight: CanonicalVertexNode = { id: `${params.figureId}_A`, label: "أ", position: { x: 9, y: 0 } };
  const vBaseLeft: CanonicalVertexNode = { id: `${params.figureId}_B`, label: "ب", position: { x: 0, y: 0 } };
  const vTop: CanonicalVertexNode = { id: `${params.figureId}_C`, label: "جـ", position: { x: 0, y: 5.5 } };
  const vBody: CanonicalVertexNode = { id: `${params.figureId}_M`, label: "م (جسم)", position: { x: 4.5, y: 2.75 } };
  const vWeightDown: CanonicalVertexNode = { id: `${params.figureId}_W`, label: "و (الوزن)", position: { x: 4.5, y: 0.2 } };
  const vNormalReaction: CanonicalVertexNode = { id: `${params.figureId}_R`, label: "ر (رد الفعل)", position: { x: 6.2, y: 5.2 } };

  return {
    figureId: params.figureId,
    familyId: "solid3d_mechanics_family",
    branchId: "mechanics_inclined_plane_forces",
    titleArabic: "اتزان جسم على مستوى مائل بزاوية هـ تحت تأثير الوزن ورد الفعل",
    notationLanguage: notation,
    vertices: [vBaseRight, vBaseLeft, vTop, vBody, vWeightDown, vNormalReaction],
    segments: [
      { id: `${params.figureId}_AB`, fromVertexId: vBaseRight.id, toVertexId: vBaseLeft.id },
      { id: `${params.figureId}_BC`, fromVertexId: vBaseLeft.id, toVertexId: vTop.id },
      { id: `${params.figureId}_CA`, fromVertexId: vTop.id, toVertexId: vBaseRight.id },
      { id: `${params.figureId}_vec_W`, fromVertexId: vBody.id, toVertexId: vWeightDown.id, parallelArrows: 1 },
      { id: `${params.figureId}_vec_R`, fromVertexId: vBody.id, toVertexId: vNormalReaction.id, parallelArrows: 1 },
    ],
    angles: [],
  };
}
