/**
 * @file triangle-root-core.ts
 * @description المصدر الوحيد للحقيقة (Root Archetype) لعائلة المثلث في محرك الهندسة.
 * يحسب الإحداثيات الديكارتية الدقيقة لرؤوس المثلث (قائم، متساوي الساقين، متساوي الأضلاع، عام)،
 * ويوفر الدوال الهندسية النقية التي تنبثق منها جميع أشكال المثلث في الكتب الخارجية والمدرسية:
 * - منتصف أي ضلع (`getEdgeMidpoint`)
 * - نقطة تقسيم ضلع بنسبة (`getPointOnEdgeByRatio`)
 * - مسقط العمود الساقط من رأس على الضلع المقابل (`getAltitudeFoot`)
 * - نقطة تقاطع المتوسطات م بنسبة 1:2 (`getCentroidPoint`)
 * - شعاع امتداد الضلع للزاوية الخارجة (`getExteriorExtensionPoint`)
 */

import type {
  CanonicalSegmentNode,
  CanonicalVertexNode,
  Point2DCoordinate,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";

export type BaseTriangleKind = "right" | "isosceles" | "equilateral" | "scalene";

export interface TriangleRootConfig {
  readonly idPrefix: string;
  readonly kind: BaseTriangleKind;
  readonly vertexLabelsArabic?: readonly [string, string, string];
  readonly notationLanguage?: MathNotationLanguage;
  readonly baseLengthCm?: number;
  readonly heightLengthCm?: number;
}

export interface TriangleRootInstance {
  readonly idPrefix: string;
  readonly notationLanguage: MathNotationLanguage;
  readonly vertexTop: CanonicalVertexNode;   // الرأس الأعلى (أ / A)
  readonly vertexRight: CanonicalVertexNode; // الرأس الأيمن للقاعدة (ب / B)
  readonly vertexLeft: CanonicalVertexNode;  // الرأس الأيسر للقاعدة (جـ / C)
  readonly baseSegments: readonly [CanonicalSegmentNode, CanonicalSegmentNode, CanonicalSegmentNode];
  getEdgeMidpoint(edge: "AB" | "AC" | "BC", midpointLabelArabic: string): CanonicalVertexNode;
  getPointOnEdgeByRatio(
    edge: "AB" | "AC" | "BC",
    ratioFromStart: number,
    pointLabelArabic: string
  ): CanonicalVertexNode;
  getAltitudeFoot(fromVertex: "A" | "B" | "C", footLabelArabic: string): CanonicalVertexNode;
  getCentroidPoint(centroidLabelArabic?: string): CanonicalVertexNode;
}

export function createTriangleRootCore(config: TriangleRootConfig): TriangleRootInstance {
  const notation = config.notationLanguage || "arabic";
  const rawLabels = config.vertexLabelsArabic || ["أ", "ب", "جـ"];
  const baseW = config.baseLengthCm ?? 8;
  const heightH =
    config.kind === "equilateral"
      ? Number(((baseW * Math.sqrt(3)) / 2).toFixed(2))
      : config.heightLengthCm ?? 6;

  // في الهندسة المصرية: ب على يمين القاعدة، جـ على يسار القاعدة، أ في الأعلى
  const topX =
    config.kind === "right"
      ? baseW // قائم في ب (يمين القاعدة)
      : config.kind === "scalene"
      ? baseW * 0.62
      : baseW * 0.5;

  const vertexTop: CanonicalVertexNode = {
    id: `${config.idPrefix}_vA`,
    label: localizeGeometricVertexLabelSSOT(rawLabels[0], notation),
    position: { x: topX, y: heightH },
  };

  const vertexRight: CanonicalVertexNode = {
    id: `${config.idPrefix}_vB`,
    label: localizeGeometricVertexLabelSSOT(rawLabels[1], notation),
    position: { x: baseW, y: 0 },
  };

  const vertexLeft: CanonicalVertexNode = {
    id: `${config.idPrefix}_vC`,
    label: localizeGeometricVertexLabelSSOT(rawLabels[2], notation),
    position: { x: 0, y: 0 },
  };

  const baseSegments: readonly [CanonicalSegmentNode, CanonicalSegmentNode, CanonicalSegmentNode] = [
    {
      id: `${config.idPrefix}_seg_AB`,
      fromVertexId: vertexTop.id,
      toVertexId: vertexRight.id,
      tickMarks: config.kind === "isosceles" || config.kind === "equilateral" ? 1 : undefined,
    },
    {
      id: `${config.idPrefix}_seg_BC`,
      fromVertexId: vertexRight.id,
      toVertexId: vertexLeft.id,
      tickMarks: config.kind === "equilateral" ? 1 : undefined,
    },
    {
      id: `${config.idPrefix}_seg_AC`,
      fromVertexId: vertexTop.id,
      toVertexId: vertexLeft.id,
      tickMarks: config.kind === "isosceles" || config.kind === "equilateral" ? 1 : undefined,
    },
  ];

  const resolveEdgeEndpoints = (
    edge: "AB" | "AC" | "BC"
  ): [Point2DCoordinate, Point2DCoordinate] => {
    if (edge === "AB") return [vertexTop.position, vertexRight.position];
    if (edge === "AC") return [vertexTop.position, vertexLeft.position];
    return [vertexRight.position, vertexLeft.position];
  };

  return {
    idPrefix: config.idPrefix,
    notationLanguage: notation,
    vertexTop,
    vertexRight,
    vertexLeft,
    baseSegments,

    getEdgeMidpoint(edge, midpointLabelArabic) {
      const [p1, p2] = resolveEdgeEndpoints(edge);
      return {
        id: `${config.idPrefix}_mid_${edge}`,
        label: localizeGeometricVertexLabelSSOT(midpointLabelArabic, notation),
        position: {
          x: Number(((p1.x + p2.x) / 2).toFixed(2)),
          y: Number(((p1.y + p2.y) / 2).toFixed(2)),
        },
      };
    },

    getPointOnEdgeByRatio(edge, ratioFromStart, pointLabelArabic) {
      const [p1, p2] = resolveEdgeEndpoints(edge);
      const t = Math.max(0.05, Math.min(0.95, ratioFromStart));
      return {
        id: `${config.idPrefix}_pt_${edge}_${Math.round(t * 100)}`,
        label: localizeGeometricVertexLabelSSOT(pointLabelArabic, notation),
        position: {
          x: Number((p1.x + (p2.x - p1.x) * t).toFixed(2)),
          y: Number((p1.y + (p2.y - p1.y) * t).toFixed(2)),
        },
      };
    },

    getAltitudeFoot(fromVertex, footLabelArabic) {
      const p =
        fromVertex === "A"
          ? vertexTop.position
          : fromVertex === "B"
          ? vertexRight.position
          : vertexLeft.position;
      const [a, b] =
        fromVertex === "A"
          ? [vertexRight.position, vertexLeft.position]
          : fromVertex === "B"
          ? [vertexTop.position, vertexLeft.position]
          : [vertexTop.position, vertexRight.position];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy || 1;
      const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
      return {
        id: `${config.idPrefix}_alt_foot_${fromVertex}`,
        label: localizeGeometricVertexLabelSSOT(footLabelArabic, notation),
        position: {
          x: Number((a.x + t * dx).toFixed(2)),
          y: Number((a.y + t * dy).toFixed(2)),
        },
      };
    },

    getCentroidPoint(centroidLabelArabic = "م") {
      return {
        id: `${config.idPrefix}_centroid`,
        label: localizeGeometricVertexLabelSSOT(centroidLabelArabic, notation),
        position: {
          x: Number(
            ((vertexTop.position.x + vertexRight.position.x + vertexLeft.position.x) / 3).toFixed(2)
          ),
          y: Number(
            ((vertexTop.position.y + vertexRight.position.y + vertexLeft.position.y) / 3).toFixed(2)
          ),
        },
      };
    },
  };
}
