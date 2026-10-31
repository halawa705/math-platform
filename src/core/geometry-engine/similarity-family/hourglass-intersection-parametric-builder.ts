/**
 * @file hourglass-intersection-parametric-builder.ts
 * @description منشئ بارامتري ذكي لمسائل الساعة الرملية والمقص والتقابل بالرأس (المهمة 4.3):
 * يرسم مثلثين متقابلين بالرأس عند نقطة تقاطع القطعتين،
 * ويضع أسهم التوازي إذا ورد توازٍ في السؤال، ويكتب الأطوال والزوايا المعطاة فقط.
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

export const MODULE_ID_HOURGLASS_INTERSECTION_PARAMETRIC_BUILDER =
  "hourglass_intersection_parametric_builder" as const;

export interface HourglassIntersectionParametricOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly intersectionVertex: string;
  readonly tri1Endpoints: readonly [string, string];
  readonly tri2Endpoints: readonly [string, string];
  readonly hasParallel?: boolean;
  readonly givenLengths?: ReadonlyMap<string, { readonly text: string; readonly numeric?: number }>;
  readonly givenAngles?: ReadonlyMap<string, { readonly deg?: number; readonly text?: string; readonly isRight?: boolean }>;
}

export function buildHourglassIntersectionFigure(
  opts: HourglassIntersectionParametricOptions
): CanonicalGeometryFigureIR {
  const notation: MathNotationLanguage = opts.notationLanguage || "english";
  const { intersectionVertex: mid, tri1Endpoints, tri2Endpoints } = opts;
  const [a, b] = tri1Endpoints;
  const [c, d] = tri2Endpoints;

  // 1. حساب إحداثيات الرؤوس: النقطة الوسطى في المركز، والطرفان في الأعلى والأسفل
  const vMid: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${mid}`,
    label: localizeGeometricVertexLabelSSOT(mid, notation),
    position: { x: 5.0, y: 4.0 },
  };

  // الطرف العلوي (مثلث 1)
  const vA: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${a}`,
    label: localizeGeometricVertexLabelSSOT(a, notation),
    position: { x: 2.0, y: 7.0 },
  };
  const vB: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${b}`,
    label: localizeGeometricVertexLabelSSOT(b, notation),
    position: { x: 8.0, y: 7.0 },
  };

  // الطرف السفلي (مثلث 2 - معكوس الرؤوس بالتقاطع المستقيم: الخط A-Mid-C والخط B-Mid-D)
  const vC: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${c}`,
    label: localizeGeometricVertexLabelSSOT(c, notation),
    position: { x: 8.0, y: 1.0 },
  };
  const vD: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${d}`,
    label: localizeGeometricVertexLabelSSOT(d, notation),
    position: { x: 2.0, y: 1.0 },
  };

  const vertices: CanonicalVertexNode[] = [vMid, vA, vB, vC, vD];

  // 2. بناء الأضلاع مع الأطوال المعطاة وأسهم التوازي إن وُجدت
  const getLen = (u: string, v: string) => {
    const p = pairKey(u, v);
    return opts.givenLengths?.get(p) || opts.givenLengths?.get(`${u}${v}`) || opts.givenLengths?.get(`${v}${u}`);
  };

  const segments: CanonicalSegmentNode[] = [
    // المثلث العلوي
    {
      id: `${opts.figureId}_s_${a}_${mid}`,
      fromVertexId: vA.id,
      toVertexId: vMid.id,
      lengthLabel: getLen(a, mid) ? { value: getLen(a, mid)!.text } : undefined,
    },
    {
      id: `${opts.figureId}_s_${b}_${mid}`,
      fromVertexId: vB.id,
      toVertexId: vMid.id,
      lengthLabel: getLen(b, mid) ? { value: getLen(b, mid)!.text } : undefined,
    },
    {
      id: `${opts.figureId}_s_${a}_${b}`,
      fromVertexId: vA.id,
      toVertexId: vB.id,
      lengthLabel: getLen(a, b) ? { value: getLen(a, b)!.text } : undefined,
      parallelArrows: opts.hasParallel ? 1 : undefined,
    },

    // المثلث السفلي
    {
      id: `${opts.figureId}_s_${c}_${mid}`,
      fromVertexId: vC.id,
      toVertexId: vMid.id,
      lengthLabel: getLen(c, mid) ? { value: getLen(c, mid)!.text } : undefined,
    },
    {
      id: `${opts.figureId}_s_${d}_${mid}`,
      fromVertexId: vD.id,
      toVertexId: vMid.id,
      lengthLabel: getLen(d, mid) ? { value: getLen(d, mid)!.text } : undefined,
    },
    {
      id: `${opts.figureId}_s_${c}_${d}`,
      fromVertexId: vC.id,
      toVertexId: vD.id,
      lengthLabel: getLen(c, d) ? { value: getLen(c, d)!.text } : undefined,
      parallelArrows: opts.hasParallel ? 1 : undefined,
    },
  ];

  // 3. بناء الزوايا المتقابلة بالرأس عند Mid
  const angles: CanonicalAngleNode[] = [
    {
      id: `${opts.figureId}_ang_mid_top`,
      vertexId: vMid.id,
      arm1VertexId: vA.id,
      arm2VertexId: vB.id,
      arcCount: 1,
      markSymbol: "arc",
    },
    {
      id: `${opts.figureId}_ang_mid_bot`,
      vertexId: vMid.id,
      arm1VertexId: vC.id,
      arm2VertexId: vD.id,
      arcCount: 1,
      markSymbol: "arc",
    },
  ];

  // إدراج أي زوايا صريحة معطاة
  for (const [vKey, angInfo] of opts.givenAngles?.entries() || []) {
    const vNode = vertices.find((vn) => vn.label === localizeGeometricVertexLabelSSOT(vKey, notation));
    if (vNode && !angles.some((a) => a.vertexId === vNode.id)) {
      angles.push({
        id: `${opts.figureId}_ang_${vKey}`,
        vertexId: vNode.id,
        arm1VertexId: vMid.id,
        arm2VertexId: vA.id,
        degrees: angInfo.deg,
        degreesLabel: angInfo.text ? `${angInfo.text}°` : angInfo.deg ? `${angInfo.deg}°` : undefined,
        isRightAngle: angInfo.isRight,
      });
    }
  }

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: `تقاطع قطعتين في النقطة ${mid} مع تشابه مثلثين متقابلين بالرأس`,
    notationLanguage: notation,
    vertices,
    segments,
    angles,
    polygons: [
      [vMid.id, vA.id, vB.id],
      [vMid.id, vC.id, vD.id],
    ],
  };
}
