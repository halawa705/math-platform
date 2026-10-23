/**
 * @file quadrilateral-root-core.ts
 * @description المصدر الوحيد للحقيقة (Root Archetype) لعائلة الأشكال الرباعية (متوازي الأضلاع، المستطيل، المربع، المعين، شبه المنحرف).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
 */

import type {
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_QUADRILATERAL_ROOT_CORE =
  "quadrilateral_root_core" as const;

export interface QuadrilateralRootInstance {
  readonly vA: CanonicalVertexNode;
  readonly vB: CanonicalVertexNode;
  readonly vC: CanonicalVertexNode;
  readonly vD: CanonicalVertexNode;
  readonly centerM: CanonicalVertexNode;
  readonly perimeterSegments: readonly CanonicalSegmentNode[];
  readonly notationLanguage: MathNotationLanguage;
}

export function createQuadrilateralRootCore(params: {
  readonly idPrefix: string;
  readonly baseWidthCm?: number;
  readonly heightCm?: number;
  readonly topSkewOffsetCm?: number;
  readonly topWidthCm?: number;
  readonly notationLanguage?: MathNotationLanguage;
}): QuadrilateralRootInstance {
  const notation = params.notationLanguage || "arabic";
  const w = params.baseWidthCm ?? 8;
  const h = params.heightCm ?? 5;
  const skew = params.topSkewOffsetCm ?? 2;
  const topW = params.topWidthCm ?? w;

  const vA: CanonicalVertexNode = {
    id: `${params.idPrefix}_vA`,
    label: localizeGeometricVertexLabelSSOT("أ", notation),
    position: { x: w + skew, y: h },
  };
  const vB: CanonicalVertexNode = {
    id: `${params.idPrefix}_vB`,
    label: localizeGeometricVertexLabelSSOT("ب", notation),
    position: { x: w, y: 0 },
  };
  const vC: CanonicalVertexNode = {
    id: `${params.idPrefix}_vC`,
    label: localizeGeometricVertexLabelSSOT("جـ", notation),
    position: { x: 0, y: 0 },
  };
  const vD: CanonicalVertexNode = {
    id: `${params.idPrefix}_vD`,
    label: localizeGeometricVertexLabelSSOT("د", notation),
    position: { x: w + skew - topW, y: h },
  };

  const centerM: CanonicalVertexNode = {
    id: `${params.idPrefix}_vM`,
    label: localizeGeometricVertexLabelSSOT("م", notation),
    position: {
      x: Number(((vA.position.x + vC.position.x) / 2).toFixed(2)),
      y: Number(((vA.position.y + vC.position.y) / 2).toFixed(2)),
    },
  };

  const perimeterSegments: readonly CanonicalSegmentNode[] = [
    { id: `${params.idPrefix}_AB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${params.idPrefix}_BC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${params.idPrefix}_CD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${params.idPrefix}_DA`, fromVertexId: vD.id, toVertexId: vA.id },
  ];

  return {
    vA,
    vB,
    vC,
    vD,
    centerM,
    perimeterSegments,
    notationLanguage: notation,
  };
}
