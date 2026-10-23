/**
 * @file triangle-thales-parallel-branch.ts
 * @description فرع منبثق من الأصل الواحد للمثلث (`triangle-root-core.ts`):
 * يمثل نظرية طاليس والتوازي (شعاع مرسوم يوازي أحد أضلاع المثلث ويقسم الضلعين الآخرين بنسبة معطاة).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";
import { createTriangleRootCore } from "./triangle-root-core";

export const MODULE_ID_TRIANGLE_THALES_PARALLEL_BRANCH =
  "triangle_thales_parallel_branch" as const;

export function buildTriangleThalesParallelFigure(params: {
  readonly figureId: string;
  readonly ratioFromTop?: number;
  readonly baseLengthCm?: number;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const ratio = params.ratioFromTop ?? 0.4;
  const baseCm = params.baseLengthCm ?? 10;
  const root = createTriangleRootCore({
    idPrefix: params.figureId,
    kind: "scalene",
    notationLanguage: params.notationLanguage || "arabic",
    baseLengthCm: baseCm,
    heightLengthCm: 7,
  });

  const vertexD = root.getPointOnEdgeByRatio("AB", ratio, "د");
  const vertexE = root.getPointOnEdgeByRatio("AC", ratio, "هـ");

  return {
    figureId: params.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: `المثلث ${root.vertexTop.label}${root.vertexRight.label}${root.vertexLeft.label} فيه ${vertexD.label}${vertexE.label} يوازي ${root.vertexRight.label}${root.vertexLeft.label}`,
    notationLanguage: root.notationLanguage,
    vertices: [
      root.vertexTop,
      root.vertexRight,
      root.vertexLeft,
      vertexD,
      vertexE,
    ],
    segments: [
      ...root.baseSegments.map((seg, idx) =>
        idx === 1
          ? {
              ...seg,
              parallelArrows: 1 as const,
              lengthLabel: { value: baseCm, unit: "سم" as const },
            }
          : seg
      ),
      {
        id: `${params.figureId}_seg_DE_thales`,
        fromVertexId: vertexD.id,
        toVertexId: vertexE.id,
        parallelArrows: 1,
        lengthLabel: {
          value: Number((baseCm * ratio).toFixed(1)),
          unit: "سم",
        },
      },
    ],
    angles: [],
  };
}
