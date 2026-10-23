/**
 * @file triangle-midsegment-branch.ts
 * @description شكل منبثق من الأصل الواحد للمثلث (`triangle-root-core.ts`):
 * يمثل نظرية "القطعة المستقيمة الواصلة بين منتصفي ضلعين في مثلث توازي الضلع الثالث وتساوي نصف طوله".
 * لا يكرر أي كود لرسم المثلث، بل يستدعي الأصل ويضيف المنتصفين (د، هـ) وعلامات التنصيف والتوازي.
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createTriangleRootCore } from "./triangle-root-core";

export interface TriangleMidsegmentParams {
  readonly figureId: string;
  readonly vertexLabelsArabic?: readonly [string, string, string];
  readonly midpointLabelsArabic?: readonly [string, string];
  readonly thirdSideLengthCm?: number;
  readonly notationLanguage?: MathNotationLanguage;
}

export function buildTriangleMidsegmentFigure(
  params: TriangleMidsegmentParams
): CanonicalGeometryFigureIR {
  const root = createTriangleRootCore({
    idPrefix: params.figureId,
    kind: "scalene",
    vertexLabelsArabic: params.vertexLabelsArabic || ["أ", "ب", "جـ"],
    notationLanguage: params.notationLanguage || "arabic",
    baseLengthCm: params.thirdSideLengthCm ?? 10,
    heightLengthCm: 7,
  });

  const midLabels = params.midpointLabelsArabic || ["د", "هـ"];
  const vertexD = root.getEdgeMidpoint("AB", midLabels[0]);
  const vertexE = root.getEdgeMidpoint("AC", midLabels[1]);

  const hasExplicitLength =
    typeof params.thirdSideLengthCm === "number" && params.thirdSideLengthCm > 0;
  const baseLength = params.thirdSideLengthCm ?? 10;
  const midsegmentLength = Number((baseLength / 2).toFixed(1));

  return {
    figureId: params.figureId,
    familyId: "triangle_family",
    branchId: "triangle_midsegment_joining_midpoints",
    titleArabic: `المثلث ${root.vertexTop.label}${root.vertexRight.label}${root.vertexLeft.label} فيه ${vertexD.label} منتصف ${root.vertexTop.label}${root.vertexRight.label}، ${vertexE.label} منتصف ${root.vertexTop.label}${root.vertexLeft.label}`,
    notationLanguage: root.notationLanguage,
    vertices: [root.vertexTop, root.vertexRight, root.vertexLeft, vertexD, vertexE],
    segments: [
      {
        id: `${params.figureId}_seg_AD`,
        fromVertexId: root.vertexTop.id,
        toVertexId: vertexD.id,
        tickMarks: 1,
      },
      {
        id: `${params.figureId}_seg_DB`,
        fromVertexId: vertexD.id,
        toVertexId: root.vertexRight.id,
        tickMarks: 1,
      },
      {
        id: `${params.figureId}_seg_AE`,
        fromVertexId: root.vertexTop.id,
        toVertexId: vertexE.id,
        tickMarks: 2,
      },
      {
        id: `${params.figureId}_seg_EC`,
        fromVertexId: vertexE.id,
        toVertexId: root.vertexLeft.id,
        tickMarks: 2,
      },
      {
        id: `${params.figureId}_seg_BC`,
        fromVertexId: root.vertexRight.id,
        toVertexId: root.vertexLeft.id,
        parallelArrows: 1,
        lengthLabel: hasExplicitLength ? { value: baseLength, unit: "سم" } : undefined,
      },
      {
        id: `${params.figureId}_seg_DE`,
        fromVertexId: vertexD.id,
        toVertexId: vertexE.id,
        parallelArrows: 1,
        lengthLabel: hasExplicitLength ? { value: midsegmentLength, unit: "سم" } : undefined,
      },
    ],
    angles: [],
  };
}
