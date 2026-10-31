/**
 * @file disjoint-triangles-parametric-builder.ts
 * @description منشئ بارامتري ذكي لمثلثين منفصلين متشابهين أو متطابقين (المهمة 4.1):
 * يرسم المثلثين برؤوس المسألة الحقيقية وبالتناسب البصري الدقيق،
 * ويكتب فقط الأطوال والزوايا المعطاة في السؤال دون أي إقحام لعناصر غريبة.
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

export const MODULE_ID_DISJOINT_TRIANGLES_PARAMETRIC_BUILDER =
  "disjoint_triangles_parametric_builder" as const;

export interface DisjointTrianglesParametricOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly tri1: readonly [string, string, string];
  readonly tri2: readonly [string, string, string];
  readonly ratio?: number;
  readonly givenLengths?: ReadonlyMap<string, { readonly text: string; readonly numeric?: number }>;
  readonly givenAngles?: ReadonlyMap<string, { readonly deg?: number; readonly text?: string; readonly isRight?: boolean }>;
}

export function buildDisjointSimilarTrianglesFigure(
  opts: DisjointTrianglesParametricOptions
): CanonicalGeometryFigureIR {
  const notation: MathNotationLanguage = opts.notationLanguage || "english";
  const [a1, b1, c1] = opts.tri1;
  const [a2, b2, c2] = opts.tri2;

  // 1. تحديد زاوية القمة وشكل المثلث الأول بناءً على الزوايا أو الأطوال المعطاة
  const angA = opts.givenAngles?.get(a1)?.deg;
  const angB = opts.givenAngles?.get(b1)?.deg;
  const angC = opts.givenAngles?.get(c1)?.deg;

  let baseWidth1 = 5.0;
  let apexX1 = 2.0;
  let apexY1 = 3.8;

  if (angA && angB && angA + angB < 180) {
    const radA = (angA * Math.PI) / 180;
    const radB = (angB * Math.PI) / 180;
    const radC = Math.PI - radA - radB;
    const bSide = (baseWidth1 * Math.sin(radB)) / Math.sin(radC);
    apexX1 = bSide * Math.cos(radA);
    apexY1 = bSide * Math.sin(radA);
  } else if (opts.givenAngles?.get(a1)?.isRight) {
    apexX1 = 0;
    apexY1 = 4.0;
  }

  // 2. إحداثيات المثلث الأول T1
  const xOffset1 = 1.0;
  const yBase = 1.0;

  const vA1: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${a1}`,
    label: localizeGeometricVertexLabelSSOT(a1, notation),
    position: { x: Number((xOffset1 + apexX1).toFixed(2)), y: Number((yBase + apexY1).toFixed(2)) },
  };
  const vB1: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${b1}`,
    label: localizeGeometricVertexLabelSSOT(b1, notation),
    position: { x: xOffset1, y: yBase },
  };
  const vC1: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${c1}`,
    label: localizeGeometricVertexLabelSSOT(c1, notation),
    position: { x: Number((xOffset1 + baseWidth1).toFixed(2)), y: yBase },
  };

  // 3. معامل تكبير/تصغير المثلث الثاني T2
  let scale = 0.7;
  if (opts.ratio && opts.ratio > 0) {
    scale = opts.ratio >= 1 ? Number((1 / opts.ratio).toFixed(2)) : Number(opts.ratio.toFixed(2));
    // ضمان بقاء المقياس في حدود بصرية متناسقة بين 0.4 و 0.9
    scale = Math.max(0.45, Math.min(0.85, scale));
  }

  const baseWidth2 = baseWidth1 * scale;
  const apexX2 = apexX1 * scale;
  const apexY2 = apexY1 * scale;
  const xOffset2 = xOffset1 + baseWidth1 + 2.5; // مسافة فاصلة مريحة بين المثلثين

  const vA2: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${a2}`,
    label: localizeGeometricVertexLabelSSOT(a2, notation),
    position: { x: Number((xOffset2 + apexX2).toFixed(2)), y: Number((yBase + apexY2).toFixed(2)) },
  };
  const vB2: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${b2}`,
    label: localizeGeometricVertexLabelSSOT(b2, notation),
    position: { x: xOffset2, y: yBase },
  };
  const vC2: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${c2}`,
    label: localizeGeometricVertexLabelSSOT(c2, notation),
    position: { x: Number((xOffset2 + baseWidth2).toFixed(2)), y: yBase },
  };

  const vertices: CanonicalVertexNode[] = [vA1, vB1, vC1, vA2, vB2, vC2];

  // 4. بناء أضلاع المثلثين مع إدراج الأطوال المعطاة فقط
  const buildSegment = (
    u: CanonicalVertexNode,
    v: CanonicalVertexNode,
    uKey: string,
    vKey: string
  ): CanonicalSegmentNode => {
    const pKey = pairKey(uKey, vKey);
    const revKey = `${uKey}${vKey}`;
    const altKey = `${vKey}${uKey}`;
    const lenInfo =
      opts.givenLengths?.get(pKey) ||
      opts.givenLengths?.get(revKey) ||
      opts.givenLengths?.get(altKey);

    return {
      id: `${opts.figureId}_s_${uKey}_${vKey}`,
      fromVertexId: u.id,
      toVertexId: v.id,
      lengthLabel: lenInfo ? { value: lenInfo.text } : undefined,
    };
  };

  const segments: CanonicalSegmentNode[] = [
    buildSegment(vA1, vB1, a1, b1),
    buildSegment(vB1, vC1, b1, c1),
    buildSegment(vA1, vC1, a1, c1),

    buildSegment(vA2, vB2, a2, b2),
    buildSegment(vB2, vC2, b2, c2),
    buildSegment(vA2, vC2, a2, c2),
  ];

  // 5. بناء زوايا المثلثين مع إدراج الزوايا المعطاة فقط
  const angles: CanonicalAngleNode[] = [];

  const attachAngle = (
    v: CanonicalVertexNode,
    u: CanonicalVertexNode,
    w: CanonicalVertexNode,
    vKey: string
  ) => {
    const angInfo = opts.givenAngles?.get(vKey);
    if (!angInfo) return;

    angles.push({
      id: `${opts.figureId}_ang_${vKey}`,
      vertexId: v.id,
      arm1VertexId: u.id,
      arm2VertexId: w.id,
      degrees: angInfo.deg,
      degreesLabel: angInfo.text ? `${angInfo.text}°` : angInfo.deg ? `${angInfo.deg}°` : undefined,
      isRightAngle: angInfo.isRight || angInfo.deg === 90,
      arcCount: 1,
      markSymbol: "arc",
    });
  };

  attachAngle(vA1, vB1, vC1, a1);
  attachAngle(vB1, vA1, vC1, b1);
  attachAngle(vC1, vA1, vB1, c1);

  attachAngle(vA2, vB2, vC2, a2);
  attachAngle(vB2, vA2, vC2, b2);
  attachAngle(vC2, vA2, vB2, c2);

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: `تشابه المثلثين Δ${a1}${b1}${c1} و Δ${a2}${b2}${c2}`,
    notationLanguage: notation,
    vertices,
    segments,
    angles,
    polygons: [
      [vA1.id, vB1.id, vC1.id],
      [vA2.id, vB2.id, vC2.id],
    ],
  };
}
