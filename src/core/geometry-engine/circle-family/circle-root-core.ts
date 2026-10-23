/**
 * @file circle-root-core.ts
 * @description المصدر الوحيد للحقيقة (Root Archetype) لعائلة الدائرة في محرك الهندسة.
 * يحسب النقاط القطبية على محيط الدائرة، الوتر، منتصف الوتر، والنقاط الخارجة للمماسات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import type {
  CanonicalVertexNode,
  Point2DCoordinate,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_CIRCLE_ROOT_CORE = "circle_root_core" as const;

export interface CircleRootInstance {
  readonly idPrefix: string;
  readonly radiusCm: number;
  readonly notationLanguage: MathNotationLanguage;
  readonly centerVertex: CanonicalVertexNode;
  getPointOnCircumference(angleDegrees: number, labelArabic: string): CanonicalVertexNode;
  getExternalPoint(distanceFromCenterCm: number, angleDegrees: number, labelArabic: string): CanonicalVertexNode;
  getMidpointBetween(v1: CanonicalVertexNode, v2: CanonicalVertexNode, labelArabic: string): CanonicalVertexNode;
}

export function createCircleRootCore(params: {
  readonly idPrefix: string;
  readonly radiusCm?: number;
  readonly centerLabelArabic?: string;
  readonly notationLanguage?: MathNotationLanguage;
}): CircleRootInstance {
  const radius = params.radiusCm ?? 5;
  const notation = params.notationLanguage || "arabic";
  const centerPos: Point2DCoordinate = { x: radius + 2, y: radius + 2 };

  const centerVertex: CanonicalVertexNode = {
    id: `${params.idPrefix}_center_M`,
    label: localizeGeometricVertexLabelSSOT(params.centerLabelArabic || "م", notation),
    position: centerPos,
  };

  return {
    idPrefix: params.idPrefix,
    radiusCm: radius,
    notationLanguage: notation,
    centerVertex,

    getPointOnCircumference(angleDegrees, labelArabic) {
      const rad = (angleDegrees * Math.PI) / 180;
      return {
        id: `${params.idPrefix}_pt_${Math.round(angleDegrees)}`,
        label: localizeGeometricVertexLabelSSOT(labelArabic, notation),
        position: {
          x: Number((centerPos.x + radius * Math.cos(rad)).toFixed(2)),
          y: Number((centerPos.y + radius * Math.sin(rad)).toFixed(2)),
        },
      };
    },

    getExternalPoint(distanceFromCenterCm, angleDegrees, labelArabic) {
      const rad = (angleDegrees * Math.PI) / 180;
      return {
        id: `${params.idPrefix}_ext_${Math.round(angleDegrees)}`,
        label: localizeGeometricVertexLabelSSOT(labelArabic, notation),
        position: {
          x: Number((centerPos.x + distanceFromCenterCm * Math.cos(rad)).toFixed(2)),
          y: Number((centerPos.y + distanceFromCenterCm * Math.sin(rad)).toFixed(2)),
        },
      };
    },

    getMidpointBetween(v1, v2, labelArabic) {
      return {
        id: `${params.idPrefix}_mid_${v1.id}_${v2.id}`,
        label: localizeGeometricVertexLabelSSOT(labelArabic, notation),
        position: {
          x: Number(((v1.position.x + v2.position.x) / 2).toFixed(2)),
          y: Number(((v1.position.y + v2.position.y) / 2).toFixed(2)),
        },
      };
    },
  };
}
