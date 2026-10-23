/**
 * @file number-line-intervals-branch.ts
 * @description فرع منبثق من أصل الشبكة الديكارتية (`cartesian-plane-root-core.ts`):
 * يمثل خط الأعداد الحقيقية والعمليات على الفترات المغلقة والمفتوحة (اتحاد، تقاطع، فرق).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_NUMBER_LINE_INTERVALS_BRANCH =
  "number_line_intervals_branch" as const;

export function buildNumberLineIntervalFigure(params: {
  readonly figureId: string;
  readonly leftBound?: number;
  readonly rightBound?: number;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const leftVal = params.leftBound ?? -2;
  const rightVal = params.rightBound ?? 4;
  const notation = params.notationLanguage || "arabic";

  const vMin: CanonicalVertexNode = {
    id: `${params.figureId}_min`,
    label: "-∞",
    position: { x: -6, y: 0 },
  };
  const vLeft: CanonicalVertexNode = {
    id: `${params.figureId}_left`,
    label: `[${leftVal}`,
    position: { x: leftVal, y: 0 },
  };
  const vRight: CanonicalVertexNode = {
    id: `${params.figureId}_right`,
    label: `${rightVal}]`,
    position: { x: rightVal, y: 0 },
  };
  const vMax: CanonicalVertexNode = {
    id: `${params.figureId}_max`,
    label: "+∞",
    position: { x: 6, y: 0 },
  };

  return {
    figureId: params.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: `تمثيل الفترة الحقيقية [${leftVal}، ${rightVal}] على خط الأعداد`,
    notationLanguage: notation,
    vertices: [vMin, vLeft, vRight, vMax],
    segments: [
      {
        id: `${params.figureId}_base_line`,
        fromVertexId: vMin.id,
        toVertexId: vMax.id,
        strokeStyle: "dashed",
      },
      {
        id: `${params.figureId}_interval_seg`,
        fromVertexId: vLeft.id,
        toVertexId: vRight.id,
        strokeStyle: "solid",
      },
    ],
    angles: [],
  };
}
