/**
 * @file shared-angle-and-bisector-builder.ts
 * @description منشئ بارامتري ذكي لمسائل المثلث المشترك في رأسين وقاطع على الضلع (المهمة 4.4):
 * مثل ΔABC ~ ΔDBA أو ΔDAC حيث D ∈ BC،
 * يرسم المثلث الرئيسي والقاطع الداخلي بأطوال المسألة الحقيقية فقط.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 260 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalVertexNode,
  CanonicalSegmentNode,
  CanonicalAngleNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  type MathNotationLanguage,
  localizeGeometricVertexLabelSSOT,
} from "../../ssot/numeral-and-unit-ssot";
import { pairKey } from "../fact-compositor/geo-label-utils";

export const MODULE_ID_SHARED_ANGLE_AND_BISECTOR_BUILDER =
  "shared_angle_and_bisector_builder" as const;

export interface SharedAngleAndBisectorOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly mainTri: readonly [string, string, string];
  readonly secantVertex: string;
  readonly onSegment?: readonly [string, string];
  readonly splitRatio?: number;
  readonly givenLengths?: ReadonlyMap<string, { readonly text: string; readonly numeric?: number }>;
  readonly givenAngles?: ReadonlyMap<string, { readonly deg?: number; readonly text?: string; readonly isRight?: boolean }>;
}

export function buildSharedAngleSecantFigure(
  opts: SharedAngleAndBisectorOptions
): CanonicalGeometryFigureIR {
  const notation: MathNotationLanguage = opts.notationLanguage || "english";
  const [a, b, c] = opts.mainTri;
  const d = opts.secantVertex;

  // 1. إحداثيات المثلث الرئيسي (A في الأعلى، و B و C على القاعدة)
  const vA: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${a}`,
    label: localizeGeometricVertexLabelSSOT(a, notation),
    position: { x: 3.5, y: 6.0 },
  };
  const vB: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${b}`,
    label: localizeGeometricVertexLabelSSOT(b, notation),
    position: { x: 1.0, y: 1.0 },
  };
  const vC: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${c}`,
    label: localizeGeometricVertexLabelSSOT(c, notation),
    position: { x: 9.0, y: 1.0 },
  };

  // 2. النقطة D على الضلع BC
  const ratio =
    opts.splitRatio && opts.splitRatio > 0 && opts.splitRatio < 1 ? opts.splitRatio : 0.38;

  const vD: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${d}`,
    label: localizeGeometricVertexLabelSSOT(d, notation),
    position: {
      x: Number((vB.position.x + ratio * (vC.position.x - vB.position.x)).toFixed(2)),
      y: vB.position.y,
    },
  };

  const vertices: CanonicalVertexNode[] = [vA, vB, vC, vD];

  // 3. بناء الأضلاع مع الأطوال المعطاة
  const getLen = (u: string, v: string) => {
    const p = pairKey(u, v);
    return opts.givenLengths?.get(p) || opts.givenLengths?.get(`${u}${v}`) || opts.givenLengths?.get(`${v}${u}`);
  };

  const segments: CanonicalSegmentNode[] = [
    // أضلاع المثلث الكبير
    {
      id: `${opts.figureId}_s_${a}_${b}`,
      fromVertexId: vA.id,
      toVertexId: vB.id,
      lengthLabel: getLen(a, b) ? { value: getLen(a, b)!.text } : undefined,
    },
    {
      id: `${opts.figureId}_s_${a}_${c}`,
      fromVertexId: vA.id,
      toVertexId: vC.id,
      lengthLabel: getLen(a, c) ? { value: getLen(a, c)!.text } : undefined,
    },

    // أجزاء القاعدة: B-D و D-C والقاعدة كاملة B-C
    {
      id: `${opts.figureId}_s_${b}_${d}`,
      fromVertexId: vB.id,
      toVertexId: vD.id,
      lengthLabel: getLen(b, d) ? { value: getLen(b, d)!.text } : undefined,
    },
    {
      id: `${opts.figureId}_s_${d}_${c}`,
      fromVertexId: vD.id,
      toVertexId: vC.id,
      lengthLabel: getLen(d, c) ? { value: getLen(d, c)!.text } : undefined,
    },

    // القاطع الداخلي A-D
    {
      id: `${opts.figureId}_s_${a}_${d}`,
      fromVertexId: vA.id,
      toVertexId: vD.id,
      lengthLabel: getLen(a, d) ? { value: getLen(a, d)!.text } : undefined,
    },
  ];

  // 4. بناء الزوايا المعطاة
  const angles: CanonicalAngleNode[] = [];

  for (const [vKey, angInfo] of opts.givenAngles?.entries() || []) {
    const vNode = vertices.find((vn) => vn.label === localizeGeometricVertexLabelSSOT(vKey, notation));
    if (vNode && !angles.some((a) => a.vertexId === vNode.id)) {
      angles.push({
        id: `${opts.figureId}_ang_${vKey}`,
        vertexId: vNode.id,
        arm1VertexId: vA.id,
        arm2VertexId: vB.id,
        degrees: angInfo.deg,
        degreesLabel: angInfo.text ? `${angInfo.text}°` : angInfo.deg ? `${angInfo.deg}°` : undefined,
        isRightAngle: angInfo.isRight,
      });
    }
  }

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: `تشابه مثلثين بقاطع داخلي ${a}${d} على الضلع ${b}${c}`,
    notationLanguage: notation,
    vertices,
    segments,
    angles,
    polygons: [
      [vA.id, vB.id, vD.id],
      [vA.id, vD.id, vC.id],
    ],
  };
}
