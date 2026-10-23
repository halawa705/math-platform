/**
 * @file cartesian-plane-root-core.ts
 * @description المصدر الوحيد للحقيقة (Root Archetype) للشبكة البيانية المتعامدة ح × ح (محور السينات ومحور الصادات ونقطة الأصل و).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type {
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_CARTESIAN_PLANE_ROOT_CORE =
  "cartesian_plane_root_core" as const;

export interface CartesianPlaneRootInstance {
  readonly originO: CanonicalVertexNode;
  readonly xMaxVertex: CanonicalVertexNode;
  readonly xMinVertex: CanonicalVertexNode;
  readonly yMaxVertex: CanonicalVertexNode;
  readonly yMinVertex: CanonicalVertexNode;
  readonly axesSegments: readonly CanonicalSegmentNode[];
  readonly notationLanguage: MathNotationLanguage;
}

export function createCartesianPlaneRootCore(params: {
  readonly idPrefix: string;
  readonly spanUnits?: number;
  readonly notationLanguage?: MathNotationLanguage;
}): CartesianPlaneRootInstance {
  const span = params.spanUnits ?? 5;
  const notation = params.notationLanguage || "arabic";

  const originO: CanonicalVertexNode = {
    id: `${params.idPrefix}_origin_O`,
    label: localizeGeometricVertexLabelSSOT("و", notation),
    position: { x: 0, y: 0 },
  };
  const xMaxVertex: CanonicalVertexNode = {
    id: `${params.idPrefix}_x_pos`,
    label: localizeGeometricVertexLabelSSOT("س", notation),
    position: { x: span, y: 0 },
  };
  const xMinVertex: CanonicalVertexNode = {
    id: `${params.idPrefix}_x_neg`,
    label: notation === "english" ? "X'" : "س'",
    position: { x: -span, y: 0 },
  };
  const yMaxVertex: CanonicalVertexNode = {
    id: `${params.idPrefix}_y_pos`,
    label: localizeGeometricVertexLabelSSOT("ص", notation),
    position: { x: 0, y: span },
  };
  const yMinVertex: CanonicalVertexNode = {
    id: `${params.idPrefix}_y_neg`,
    label: notation === "english" ? "Y'" : "ص'",
    position: { x: 0, y: -span },
  };

  const axesSegments: readonly CanonicalSegmentNode[] = [
    {
      id: `${params.idPrefix}_axis_X`,
      fromVertexId: xMinVertex.id,
      toVertexId: xMaxVertex.id,
      strokeStyle: "dashed",
    },
    {
      id: `${params.idPrefix}_axis_Y`,
      fromVertexId: yMinVertex.id,
      toVertexId: yMaxVertex.id,
      strokeStyle: "dashed",
    },
  ];

  return {
    originO,
    xMaxVertex,
    xMinVertex,
    yMaxVertex,
    yMinVertex,
    axesSegments,
    notationLanguage: notation,
  };
}
