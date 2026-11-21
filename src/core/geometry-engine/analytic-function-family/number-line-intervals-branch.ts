/**
 * @file number-line-intervals-branch.ts
 * @description ممثّل خط الأعداد الحقيقية والفترات المغلقة والمفتوحة (الإعدادي)
 * والكسور الاعتيادية والعشرية المقسمة إلى أنصاف أو أرباع أو أعشار (الابتدائي).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 125 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
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
  const fromToMatch = cleanDesc.match(/من\s*(-?\d+(?:\.\d+)?)\s*إلى\s*(-?\d+(?:\.\d+)?)/i);
  const fracMatch = cleanDesc.match(/(?<![\d.])(\d+)\s*\/\s*(\d+)(?![\d.])/);
  const pointMatch = cleanDesc.match(/موضع\s*(?:العدد\s*)?(-?\d+(?:\.\d+)?)/i);

  const hasSubdivision = /(?:مقسم|أرباع|أجزاء\s*من\s*عشرة|أنصاف|خماس|أثمان)/i.test(cleanDesc);
  const parsedLeft = intervalMatch ? Number(intervalMatch[2]) : fromToMatch ? Number(fromToMatch[1]) : hasSubdivision ? 0 : undefined;
  const parsedRight = intervalMatch ? Number(intervalMatch[3]) : fromToMatch ? Number(fromToMatch[2]) : hasSubdivision ? 2 : undefined;
  const hasExplicitBounds =
    params.leftBound !== undefined || params.rightBound !== undefined || Boolean(intervalMatch) || Boolean(fromToMatch);

  const leftVal = params.leftBound ?? parsedLeft ?? -2;
  const rightVal = params.rightBound ?? parsedRight ?? 4;
  const leftBracket = intervalMatch?.[1] ?? (fromToMatch || hasSubdivision ? "" : "[");
  const rightBracket = intervalMatch?.[4] ?? (fromToMatch || hasSubdivision ? "" : "]");
  const notation = params.notationLanguage || "arabic";

  if (hasSubdivision || fromToMatch || fracMatch) {
    const start = Math.min(leftVal, rightVal);
    const end = Math.max(leftVal, rightVal);
    const divCount = /عشرة|عشر/i.test(cleanDesc) ? 10 : /أرباع|ربع/i.test(cleanDesc) ? 4 : /أنصاف|نصف/i.test(cleanDesc) ? 2 : fracMatch ? Math.min(10, Math.max(2, Number(fracMatch[2]))) : 4;
    const totalSpan = Math.max(1, end - start);
    const tickCount = Math.min(20, Math.round(totalSpan * divCount));
    const vertices: CanonicalVertexNode[] = [];
    const segments: CanonicalSegmentNode[] = [];
    for (let i = 0; i <= tickCount; i++) {
      const val = Number((start + (i * totalSpan) / tickCount).toFixed(2));
      const intVal = Math.round(val);
      const isMajor = Math.abs(val - intVal) < 1e-6;
      const isMentionedInt =
        i === 0 ||
        i === tickCount ||
        new RegExp(`(?<![\\d.])${intVal}(?![\\d.])`).test(cleanDesc);
      const v: CanonicalVertexNode = {
        id: `${params.figureId}_t${i}`,
        label: isMajor && isMentionedInt ? String(intVal) : "",
        hideVertexDot: !(isMajor && isMentionedInt),
        position: { x: val, y: 0 },
      };
      vertices.push(v);
    }
    segments.push({
      id: `${params.figureId}_line`,
      fromVertexId: vertices[0].id,
      toVertexId: vertices[vertices.length - 1].id,
      arrowAtStart: true,
      arrowAtEnd: true,
      isLine: true,
    });
    if (pointMatch) {
      const px = Number(pointMatch[1]);
      if (Number.isFinite(px) && !vertices.some((v) => Math.abs(v.position.x - px) < 0.01)) {
        vertices.push({ id: `${params.figureId}_pt`, label: pointMatch[1], position: { x: px, y: 0 } });
      }
    }
    return {
      figureId: params.figureId,
      familyId: "analytic_coordinate_family",
      branchId: "triangle_base_general",
      titleArabic: `خط الأعداد من ${start} إلى ${end}`,
      notationLanguage: notation,
      vertices,
      segments,
      angles: [],
    };
  }

  const span = Math.max(6, Math.abs(leftVal) + 2, Math.abs(rightVal) + 2);
  const vMin: CanonicalVertexNode = { id: `${params.figureId}_min`, label: "-∞", position: { x: -span, y: 0 } };
  const vLeft: CanonicalVertexNode = { id: `${params.figureId}_left`, label: hasExplicitBounds ? `${leftBracket}${leftVal}` : "أ", position: { x: leftVal, y: 0 } };
  const vRight: CanonicalVertexNode = { id: `${params.figureId}_right`, label: hasExplicitBounds ? `${rightVal}${rightBracket}` : "ب", position: { x: rightVal, y: 0 } };
  const vMax: CanonicalVertexNode = { id: `${params.figureId}_max`, label: "+∞", position: { x: span, y: 0 } };
  const extraVertices: CanonicalVertexNode[] = pointMatch
    ? [{ id: `${params.figureId}_pt`, label: pointMatch[1], position: { x: Number(pointMatch[1]), y: 0 } }]
    : [];

  return {
    figureId: params.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: `تمثيل الفترة الحقيقية ${leftBracket}${leftVal}، ${rightVal}${rightBracket} على خط الأعداد`,
    notationLanguage: notation,
    vertices: [vMin, vLeft, ...extraVertices, vRight, vMax],
    segments: [
      { id: `${params.figureId}_base_line`, fromVertexId: vMin.id, toVertexId: vMax.id, strokeStyle: "dashed" },
      { id: `${params.figureId}_interval_seg`, fromVertexId: vLeft.id, toVertexId: vRight.id, strokeStyle: "solid" },
    ],
    angles: [],
  };
}
