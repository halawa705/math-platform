/**
 * @file solid3d-root-core.ts
 * @description المصدر الوحيد للحقيقة (Root Archetype) لعائلة المجسمات ثلاثية الأبعاد والهندسة الفراغية والميكانيكا.
 * يحول الإحداثيات الفراغية (x, y, z) إلى إسقاط أوبليك/أيزومتري ثنائي الأبعاد للطباعة والشاشة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type {
  CanonicalVertexNode,
  Point2DCoordinate,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_SOLID3D_ROOT_CORE = "solid3d_root_core" as const;

export function project3DPointToOblique2D(
  x: number,
  y: number,
  z: number,
  angleDeg = 35,
  depthScale = 0.5
): Point2DCoordinate {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Number((x + z * depthScale * Math.cos(rad)).toFixed(2)),
    y: Number((y + z * depthScale * Math.sin(rad)).toFixed(2)),
  };
}

export function create3DProjectedVertex(params: {
  readonly id: string;
  readonly labelArabic: string;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly notationLanguage?: MathNotationLanguage;
}): CanonicalVertexNode {
  return {
    id: params.id,
    label: localizeGeometricVertexLabelSSOT(
      params.labelArabic,
      params.notationLanguage || "arabic"
    ),
    position: project3DPointToOblique2D(params.x, params.y, params.z),
  };
}
