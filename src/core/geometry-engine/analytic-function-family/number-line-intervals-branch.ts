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
import { toWesternNumeralsSSOT, type MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_NUMBER_LINE_INTERVALS_BRANCH =
  "number_line_intervals_branch" as const;

export function buildNumberLineIntervalFigure(params: {
  readonly figureId: string;
  readonly description?: string;
  readonly leftBound?: number;
  readonly rightBound?: number;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalGeometryFigureIR {
  const cleanDesc = params.description ? toWesternNumeralsSSOT(params.description) : "";
  const intervalMatch = cleanDesc.match(/([\[\]])\s*(-?\d+(?:\.\d+)?)\s*[,،]\s*(-?\d+(?:\.\d+)?)\s*([\[\]])/);

  const parsedLeft = intervalMatch ? Number(intervalMatch[2]) : undefined;
  const parsedRight = intervalMatch ? Number(intervalMatch[3]) : undefined;
  const hasExplicitBounds = params.leftBound !== undefined || params.rightBound !== undefined || Boolean(intervalMatch);

  const leftVal = params.leftBound ?? parsedLeft ?? -2;
  const rightVal = params.rightBound ?? parsedRight ?? 4;
  const leftBracket = intervalMatch?.[1] ?? "[";
  const rightBracket = intervalMatch?.[4] ?? "]";
  const notation = params.notationLanguage || "arabic";

  const span = Math.max(6, Math.abs(leftVal) + 2, Math.abs(rightVal) + 2);
  const vMin: CanonicalVertexNode = {
    id: `${params.figureId}_min`,
    label: "-∞",
    position: { x: -span, y: 0 },
  };
  const vLeft: CanonicalVertexNode = {
    id: `${params.figureId}_left`,
    label: hasExplicitBounds ? `${leftBracket}${leftVal}` : "أ",
    position: { x: leftVal, y: 0 },
  };
  const vRight: CanonicalVertexNode = {
    id: `${params.figureId}_right`,
    label: hasExplicitBounds ? `${rightVal}${rightBracket}` : "ب",
    position: { x: rightVal, y: 0 },
  };
  const vMax: CanonicalVertexNode = {
    id: `${params.figureId}_max`,
    label: "+∞",
    position: { x: span, y: 0 },
  };

  return {
    figureId: params.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: `تمثيل الفترة الحقيقية ${leftBracket}${leftVal}، ${rightVal}${rightBracket} على خط الأعداد`,
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
