/**
 * @file prep-grade3-trig-shared-hypotenuse-triangles-builder.ts
 * @description الباني البارامتري لمسائل المثلثين القائمين المشتركين في ضلع (مثل ΔDBC قائم في C و ΔABD قائم في D).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";
import type { PrepGrade3TrigTriangleBuilderOptions } from "./prep-grade3-trig-triangles-builder";

export const MODULE_ID_PREP_GRADE3_TRIG_SHARED_HYPOTENUSE_TRIANGLES_BUILDER =
  "prep_grade3_trig_shared_hypotenuse_triangles_builder" as const;

function vLabel(ch: string, notation: MathNotationLanguage): string {
  if (notation === "english") return ch.toUpperCase();
  const mapAr: Record<string, string> = { A: "أ", B: "ب", C: "جـ", D: "د" };
  return mapAr[ch.toUpperCase()] || localizeGeometricVertexLabelSSOT(ch, notation);
}

export function buildTrigTwoConnectedRightTrianglesFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const w = 6;
  const h = 7;
  const vC: CanonicalVertexNode = {
    id: `${opts.figureId}_v_C`,
    label: vLabel("C", notation),
    position: { x: 0, y: 0 },
  };
  const vB: CanonicalVertexNode = {
    id: `${opts.figureId}_v_B`,
    label: vLabel("B", notation),
    position: { x: w, y: 0 },
  };
  const vD: CanonicalVertexNode = {
    id: `${opts.figureId}_v_D`,
    label: vLabel("D", notation),
    position: { x: 0, y: h },
  };
  const vA: CanonicalVertexNode = {
    id: `${opts.figureId}_v_A`,
    label: vLabel("A", notation),
    position: { x: -4.5, y: h + 3.5 },
  };

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: "مثلثان قائمان مشتركان في الضلع BD",
    notationLanguage: notation,
    vertices: [vA, vD, vC, vB],
    segments: [
      { id: `${opts.figureId}_s_BC`, fromVertexId: vC.id, toVertexId: vB.id },
      {
        id: `${opts.figureId}_s_CD`,
        fromVertexId: vC.id,
        toVertexId: vD.id,
        lengthLabel: { value: "6√3", unit: "سم" },
      },
      { id: `${opts.figureId}_s_BD`, fromVertexId: vB.id, toVertexId: vD.id },
      { id: `${opts.figureId}_s_DA`, fromVertexId: vD.id, toVertexId: vA.id },
      { id: `${opts.figureId}_s_AB`, fromVertexId: vA.id, toVertexId: vB.id },
    ],
    angles: [
      {
        id: `${opts.figureId}_ang_C`,
        vertexId: vC.id,
        arm1VertexId: vB.id,
        arm2VertexId: vD.id,
        isRightAngle: true,
        degrees: 90,
      },
      {
        id: `${opts.figureId}_ang_D`,
        vertexId: vD.id,
        arm1VertexId: vB.id,
        arm2VertexId: vA.id,
        isRightAngle: true,
        degrees: 90,
      },
      {
        id: `${opts.figureId}_ang_CBD`,
        vertexId: vB.id,
        arm1VertexId: vC.id,
        arm2VertexId: vD.id,
        degrees: 60,
        degreesLabel: "60°",
      },
      {
        id: `${opts.figureId}_ang_A`,
        vertexId: vA.id,
        arm1VertexId: vD.id,
        arm2VertexId: vB.id,
        degrees: 45,
        degreesLabel: "45°",
      },
    ],
    polygons: [
      [vC.id, vB.id, vD.id],
      [vD.id, vB.id, vA.id],
    ],
  };
}
