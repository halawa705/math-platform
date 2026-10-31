/**
 * @file euclid-altitude-parametric-builder.ts
 * @description منشئ بارامتري ذكي لمسائل نظرية إقليدس وتشابه المثلث القائم (المهمة 4.5):
 * يرسم المثلث القائم الزاوية وعمود الارتفاع الساقط على الوتر،
 * ويضع مربعي الزاوية القائمة في الرأس وعند المسقط، ويكتب الأطوال المعطاة فقط.
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

export const MODULE_ID_EUCLID_ALTITUDE_PARAMETRIC_BUILDER =
  "euclid_altitude_parametric_builder" as const;

export interface EuclidAltitudeParametricOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly rightApex: string;
  readonly hyp1: string;
  readonly hyp2: string;
  readonly altitudeFoot?: string;
  readonly splitRatio?: number;
  readonly givenLengths?: ReadonlyMap<string, { readonly text: string; readonly numeric?: number }>;
  readonly givenAngles?: ReadonlyMap<string, { readonly deg?: number; readonly text?: string }>;
}

export function buildEuclidAltitudeParametricFigure(
  opts: EuclidAltitudeParametricOptions
): CanonicalGeometryFigureIR {
  const notation: MathNotationLanguage = opts.notationLanguage || "english";
  const { rightApex: a, hyp1: b, hyp2: c } = opts;
  const d = opts.altitudeFoot || "D";

  // 1. حساب إحداثيات المثلث القائم (الوتر BC على محور السينات، ورأس القائمة A في الأعلى)
  // حسب نظرية إقليدس: AD^2 = BD * DC، إذا كان BD = 3.6 و DC = 6.4 فإن BC = 10 و AD = 4.8
  const baseBC = 8.0;
  const ratio =
    opts.splitRatio && opts.splitRatio > 0 && opts.splitRatio < 1 ? opts.splitRatio : 0.36;

  const footX = 1.0 + ratio * baseBC;
  const altHeight = Number((Math.sqrt(ratio * (1 - ratio)) * baseBC).toFixed(2)) || 3.5;

  const vB: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${b}`,
    label: localizeGeometricVertexLabelSSOT(b, notation),
    position: { x: 1.0, y: 1.0 },
  };
  const vC: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${c}`,
    label: localizeGeometricVertexLabelSSOT(c, notation),
    position: { x: 1.0 + baseBC, y: 1.0 },
  };
  const vD: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${d}`,
    label: localizeGeometricVertexLabelSSOT(d, notation),
    position: { x: Number(footX.toFixed(2)), y: 1.0 },
  };
  const vA: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${a}`,
    label: localizeGeometricVertexLabelSSOT(a, notation),
    position: { x: Number(footX.toFixed(2)), y: Number((1.0 + altHeight).toFixed(2)) },
  };

  const vertices: CanonicalVertexNode[] = [vA, vB, vC, vD];

  // 2. بناء الأضلاع مع الأطوال المعطاة
  const getLen = (u: string, v: string) => {
    const p = pairKey(u, v);
    return opts.givenLengths?.get(p) || opts.givenLengths?.get(`${u}${v}`) || opts.givenLengths?.get(`${v}${u}`);
  };

  const segments: CanonicalSegmentNode[] = [
    // ضلعي القائمة: AB و AC
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

    // أجزاء الوتر: BD و DC
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

    // عمود الارتفاع AD الساقط على الوتر
    {
      id: `${opts.figureId}_s_${a}_${d}`,
      fromVertexId: vA.id,
      toVertexId: vD.id,
      lengthLabel: getLen(a, d) ? { value: getLen(a, d)!.text } : undefined,
    },
  ];

  // 3. بناء الزوايا القائمة (عند رأس القائمة وعند مسقط العمود)
  const angles: CanonicalAngleNode[] = [
    // زاوية القائمة في A
    {
      id: `${opts.figureId}_ang_apex_right`,
      vertexId: vA.id,
      arm1VertexId: vB.id,
      arm2VertexId: vC.id,
      degrees: 90,
      isRightAngle: true,
    },
    // زاوية عمود الارتفاع في D
    {
      id: `${opts.figureId}_ang_foot_right`,
      vertexId: vD.id,
      arm1VertexId: vA.id,
      arm2VertexId: vC.id,
      degrees: 90,
      isRightAngle: true,
    },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_euclid_right_altitude",
    titleArabic: `تشابه المثلث القائم في ${a} مع عمود إقليدس ${a}${d} ⊥ ${b}${c}`,
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
