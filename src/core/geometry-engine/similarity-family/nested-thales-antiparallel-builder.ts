/**
 * @file nested-thales-antiparallel-builder.ts
 * @description منشئ بارامتري ذكي لمسائل طاليس والقاطع العكسي في المثلث (المهمة 4.2):
 * يرسم المثلث الأصلي ويحدد موقع القاطع DE بنسبة التقسيم الحقيقية،
 * ويضع أسهم التوازي في حالة طاليس، أو قوسي تطابق الزوايا في حالة القاطع العكسي،
 * ويكتب الأطوال المعطاة فقط.
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

export const MODULE_ID_NESTED_THALES_ANTIPARALLEL_BUILDER =
  "nested_thales_antiparallel_builder" as const;

export interface NestedThalesAntiparallelOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly isAntiparallel?: boolean;
  readonly apex: string;
  readonly base1: string;
  readonly base2: string;
  readonly cut1: string;
  readonly cut2: string;
  readonly splitRatio?: number;
  readonly givenLengths?: ReadonlyMap<string, { readonly text: string; readonly numeric?: number }>;
  readonly givenAngles?: ReadonlyMap<string, { readonly deg?: number; readonly text?: string; readonly isRight?: boolean }>;
}

export function buildNestedThalesAntiparallelFigure(
  opts: NestedThalesAntiparallelOptions
): CanonicalGeometryFigureIR {
  const notation: MathNotationLanguage = opts.notationLanguage || "english";
  const { apex, base1, base2, cut1, cut2 } = opts;

  // 1. إحداثيات المثلث الكبير (Apex عند القمة، والقاعدة على محور السينات)
  const vApex: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${apex}`,
    label: localizeGeometricVertexLabelSSOT(apex, notation),
    position: { x: 4.5, y: 7.0 },
  };
  const vB1: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${base1}`,
    label: localizeGeometricVertexLabelSSOT(base1, notation),
    position: { x: 1.0, y: 1.0 },
  };
  const vB2: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${base2}`,
    label: localizeGeometricVertexLabelSSOT(base2, notation),
    position: { x: 8.0, y: 1.0 },
  };

  // 2. حساب موقع القاطع على الضلعين
  let r1 = opts.splitRatio && opts.splitRatio > 0 && opts.splitRatio < 1 ? opts.splitRatio : 0.5;
  let r2 = r1;

  // إذا كان قاطعاً عكسياً غير موازٍ، نميل القاطع بنسبتين مختلفتين ليظهر الميل بوضوح
  if (opts.isAntiparallel) {
    r1 = 0.45;
    r2 = 0.65;
  }

  // النقطة D على الضلع Apex-B1: position = Apex + r1 * (B1 - Apex)
  const vCut1: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${cut1}`,
    label: localizeGeometricVertexLabelSSOT(cut1, notation),
    position: {
      x: Number((vApex.position.x + r1 * (vB1.position.x - vApex.position.x)).toFixed(2)),
      y: Number((vApex.position.y + r1 * (vB1.position.y - vApex.position.y)).toFixed(2)),
    },
  };

  // النقطة E على الضلع Apex-B2: position = Apex + r2 * (B2 - Apex)
  const vCut2: CanonicalVertexNode = {
    id: `${opts.figureId}_v_${cut2}`,
    label: localizeGeometricVertexLabelSSOT(cut2, notation),
    position: {
      x: Number((vApex.position.x + r2 * (vB2.position.x - vApex.position.x)).toFixed(2)),
      y: Number((vApex.position.y + r2 * (vB2.position.y - vApex.position.y)).toFixed(2)),
    },
  };

  const vertices: CanonicalVertexNode[] = [vApex, vB1, vB2, vCut1, vCut2];

  // 3. بناء الأضلاع مع علامات التوازي والأطوال المعطاة
  const getLen = (u: string, v: string) => {
    const p = pairKey(u, v);
    return opts.givenLengths?.get(p) || opts.givenLengths?.get(`${u}${v}`) || opts.givenLengths?.get(`${v}${u}`);
  };

  const segments: CanonicalSegmentNode[] = [
    // أجزاء الضلع الأيسر: Apex-Cut1 و Cut1-Base1
    {
      id: `${opts.figureId}_s_${apex}_${cut1}`,
      fromVertexId: vApex.id,
      toVertexId: vCut1.id,
      lengthLabel: getLen(apex, cut1) ? { value: getLen(apex, cut1)!.text } : undefined,
    },
    {
      id: `${opts.figureId}_s_${cut1}_${base1}`,
      fromVertexId: vCut1.id,
      toVertexId: vB1.id,
      lengthLabel: getLen(cut1, base1) ? { value: getLen(cut1, base1)!.text } : undefined,
    },

    // أجزاء الضلع الأيمن: Apex-Cut2 و Cut2-Base2
    {
      id: `${opts.figureId}_s_${apex}_${cut2}`,
      fromVertexId: vApex.id,
      toVertexId: vCut2.id,
      lengthLabel: getLen(apex, cut2) ? { value: getLen(apex, cut2)!.text } : undefined,
    },
    {
      id: `${opts.figureId}_s_${cut2}_${base2}`,
      fromVertexId: vCut2.id,
      toVertexId: vB2.id,
      lengthLabel: getLen(cut2, base2) ? { value: getLen(cut2, base2)!.text } : undefined,
    },

    // القاطع الداخلي Cut1-Cut2
    {
      id: `${opts.figureId}_s_${cut1}_${cut2}`,
      fromVertexId: vCut1.id,
      toVertexId: vCut2.id,
      lengthLabel: getLen(cut1, cut2) ? { value: getLen(cut1, cut2)!.text } : undefined,
      parallelArrows: !opts.isAntiparallel ? 1 : undefined,
    },

    // القاعدة Base1-Base2
    {
      id: `${opts.figureId}_s_${base1}_${base2}`,
      fromVertexId: vB1.id,
      toVertexId: vB2.id,
      lengthLabel: getLen(base1, base2) ? { value: getLen(base1, base2)!.text } : undefined,
      parallelArrows: !opts.isAntiparallel ? 1 : undefined,
    },
  ];

  // 4. بناء الزوايا وعلامات التطابق العكسي
  const angles: CanonicalAngleNode[] = [];

  if (opts.isAntiparallel) {
    // في القاطع العكسي: الزاوية AED تطابق الزاوية B
    angles.push({
      id: `${opts.figureId}_ang_match_E`,
      vertexId: vCut2.id,
      arm1VertexId: vApex.id,
      arm2VertexId: vCut1.id,
      arcCount: 1,
      markSymbol: "arc",
    });
    angles.push({
      id: `${opts.figureId}_ang_match_B`,
      vertexId: vB1.id,
      arm1VertexId: vApex.id,
      arm2VertexId: vB2.id,
      arcCount: 1,
      markSymbol: "arc",
    });
  }

  // إضافة أي زاوية صريحة معطاة
  for (const [vKey, angInfo] of opts.givenAngles?.entries() || []) {
    const vNode = vertices.find((vn) => vn.label === localizeGeometricVertexLabelSSOT(vKey, notation));
    if (vNode && !angles.some((a) => a.vertexId === vNode.id)) {
      angles.push({
        id: `${opts.figureId}_ang_${vKey}`,
        vertexId: vNode.id,
        arm1VertexId: vApex.id,
        arm2VertexId: vB1.id,
        degrees: angInfo.deg,
        degreesLabel: angInfo.text ? `${angInfo.text}°` : angInfo.deg ? `${angInfo.deg}°` : undefined,
        isRightAngle: angInfo.isRight,
      });
    }
  }

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: opts.isAntiparallel
      ? `قاطع عكسي غير موازٍ في المثلث Δ${apex}${base1}${base2}`
      : `توازي طاليس في المثلث Δ${apex}${base1}${base2}`,
    notationLanguage: notation,
    vertices,
    segments,
    angles,
    polygons: [
      [vApex.id, vCut1.id, vCut2.id],
      [vCut1.id, vB1.id, vB2.id, vCut2.id],
    ],
  };
}
