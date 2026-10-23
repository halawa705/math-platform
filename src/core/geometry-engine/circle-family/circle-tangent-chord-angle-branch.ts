/**
 * @file circle-tangent-chord-angle-branch.ts
 * @description فرع منبثق من أصل الدائرة (`circle-root-core.ts`):
 * يمثل نظرية الزاوية المماسية والزاوية المحيطية المشتركة معها في القوس.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createCircleRootCore } from "./circle-root-core";

export const MODULE_ID_CIRCLE_TANGENT_CHORD_ANGLE_BRANCH =
  "circle_tangent_chord_angle_branch" as const;

export function buildCircleTangentChordAngleFigure(params: {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const root = createCircleRootCore({
    idPrefix: params.figureId,
    radiusCm: 4.5,
    notationLanguage: params.notationLanguage || "arabic",
  });

  const ptA = root.getPointOnCircumference(270, "أ");
  const ptB = root.getPointOnCircumference(30, "ب");
  const ptC = root.getPointOnCircumference(140, "جـ");
  const tanD = root.getExternalPoint(7, 320, "د");

  return {
    figureId: params.figureId,
    familyId: "circle_family",
    branchId: "circle_tangent_and_chord_angle",
    titleArabic: `الزاوية المماسية ∠${tanD.label}${ptA.label}${ptB.label} والزاوية المحيطية ∠${ptA.label}${ptC.label}${ptB.label}`,
    notationLanguage: root.notationLanguage,
    vertices: [root.centerVertex, ptA, ptB, ptC, tanD],
    segments: [
      { id: `${params.figureId}_AB`, fromVertexId: ptA.id, toVertexId: ptB.id },
      { id: `${params.figureId}_BC`, fromVertexId: ptB.id, toVertexId: ptC.id },
      { id: `${params.figureId}_CA`, fromVertexId: ptC.id, toVertexId: ptA.id },
      {
        id: `${params.figureId}_tan_AD`,
        fromVertexId: ptA.id,
        toVertexId: tanD.id,
        strokeStyle: "solid",
      },
    ],
    angles: [],
  };
}
