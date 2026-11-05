/**
 * @file primary-grade4-unknown-dimension-builder.ts
 * @description منشئ أشكال إيجاد البعد المجهول في المستطيل والمربع للصف الرابع الابتدائي:
 * - يدعم المستطيل بمعلومية المحيط والبعد المجهول (x أو ؟).
 * - يدعم المستطيل بمعلومية المساحة والبعد المجهول (x أو ؟).
 * - يدعم المربع بمعلومية المحيط أو المساحة والضلع المجهول (y أو ؟).
 * - يضع شارة داخلية واضحة في منتصف الشكل (المحيط = ... / المساحة = ...).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 270 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  toWesternNumeralsSSOT,
  type ArabicMathUnit,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";
import { extractGrade4Unit } from "./primary-grade4-perimeter-area-builder";

export const MODULE_ID_PRIMARY_GRADE4_UNKNOWN_DIMENSION_BUILDER =
  "primary_grade4_unknown_dimension_builder" as const;

export interface Grade4UnknownDimensionOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

export interface RectangleUnknownSpec {
  readonly mode: "perimeter" | "area";
  readonly metricValue: number;
  readonly knownDimension: number;
  readonly unknownVariable: string;
  readonly unit: ArabicMathUnit;
  readonly isVertical?: boolean;
}

export interface SquareUnknownSpec {
  readonly mode: "perimeter" | "area";
  readonly metricValue: number;
  readonly unknownVariable: string;
  readonly unit: ArabicMathUnit;
}

/**
 * ينشئ شكلاً لمستطيل بمعلومية المحيط أو المساحة والبعد المجهول
 */
export function buildGrade4RectangleUnknownFigure(
  spec: RectangleUnknownSpec,
  opts: Grade4UnknownDimensionOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const unitSquare = spec.unit === "وحدة" ? "وحدة مربعة" : `${spec.unit}²`;
  const badgeText =
    spec.mode === "perimeter"
      ? `المحيط = ${spec.metricValue} ${spec.unit}`
      : `المساحة = ${spec.metricValue} ${unitSquare}`;

  // حساب البعد التقديري لضبط التناسب البصري للرسم
  let calcOther = 5;
  if (spec.mode === "perimeter" && spec.metricValue > 2 * spec.knownDimension) {
    calcOther = spec.metricValue / 2 - spec.knownDimension;
  } else if (spec.mode === "area" && spec.knownDimension > 0) {
    calcOther = spec.metricValue / spec.knownDimension;
  }

  const isVert = spec.isVertical ?? calcOther > spec.knownDimension;
  const wVal = isVert ? Math.min(spec.knownDimension, calcOther) : Math.max(spec.knownDimension, calcOther);
  const hVal = isVert ? Math.max(spec.knownDimension, calcOther) : Math.min(spec.knownDimension, calcOther);

  const aspect = Math.max(0.4, Math.min(2.5, wVal / (hVal || 1)));
  const baseW = aspect >= 1 ? 8.2 : Math.max(4.0, 8.2 * aspect);
  const baseH = aspect >= 1 ? Math.max(3.8, 8.2 / aspect) : 8.2;

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: "", hideVertexDot: true, position: { x: 1.5, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: "", hideVertexDot: true, position: { x: 1.5 + baseW, y: 1.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: "", hideVertexDot: true, position: { x: 1.5 + baseW, y: 1.5 + baseH } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: "", hideVertexDot: true, position: { x: 1.5, y: 1.5 + baseH } };

  // تحديد أي ضلع يحمل البعد المعلوم وأيهما يحمل المجهول
  const topLabel = isVert ? spec.unknownVariable : `${spec.knownDimension} ${spec.unit}`;
  const rightLabel = isVert ? `${spec.knownDimension} ${spec.unit}` : spec.unknownVariable;

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: topLabel } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: rightLabel } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: `مستطيل ${badgeText} وإيجاد البعد المجهول ${spec.unknownVariable}`,
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
    ],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
    interiorBadges: [
      {
        id: `${opts.figureId}_badge`,
        text: badgeText,
        position: { x: 1.5 + baseW / 2, y: 1.5 + baseH / 2 },
        badgeType: spec.mode,
      },
    ],
  };
}

/**
 * ينشئ شكلاً لمربع بمعلومية المحيط أو المساحة والضلع المجهول
 */
export function buildGrade4SquareUnknownFigure(
  spec: SquareUnknownSpec,
  opts: Grade4UnknownDimensionOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const unitSquare = spec.unit === "وحدة" ? "وحدة مربعة" : `${spec.unit}²`;
  const badgeText =
    spec.mode === "perimeter"
      ? `المحيط = ${spec.metricValue} ${spec.unit}`
      : `المساحة = ${spec.metricValue} ${unitSquare}`;

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_sqD`, label: "", hideVertexDot: true, position: { x: 2, y: 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_sqC`, label: "", hideVertexDot: true, position: { x: 8, y: 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_sqB`, label: "", hideVertexDot: true, position: { x: 8, y: 8 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_sqA`, label: "", hideVertexDot: true, position: { x: 2, y: 8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: spec.unknownVariable } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: `مربع ${badgeText} وإيجاد طول الضلع ${spec.unknownVariable}`,
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
    ],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
    interiorBadges: [
      {
        id: `${opts.figureId}_badge`,
        text: badgeText,
        position: { x: 5, y: 5 },
        badgeType: spec.mode,
      },
    ],
  };
}

/**
 * يطابق المسائل التي تطلب إيجاد البعد المجهول في المستطيل أو المربع
 */
export function matchGrade4UnknownDimensionFigure(
  description: string,
  opts: Grade4UnknownDimensionOptions
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  const western = toWesternNumeralsSSOT(d);

  // الكشف عن سياق المجهول: x, y, ؟, ?, مجهول, الضلع المجهول, البعد المجهول
  const hasUnknownContext =
    /مجهول|[؟?]|(?:طول\s*الضلع|البعد)\s*[xxyyسص]/i.test(d) ||
    /(?:المحيط|المساحة)\s*=\s*\d+.*(?:الضلع|البعد|[xxyyسص])/i.test(d) ||
    /أوجد\s*(?:طول\s*الضلع|البعد)\s*المجهول/i.test(d);

  if (!hasUnknownContext) return undefined;

  const isSquare = /مربع/i.test(d) && !/مستطيل/i.test(d);
  const isArea = /مساحة|المساحة|م²|سم²|مم²|كم²/i.test(d) && !/محيط\s*=/i.test(d);
  const mode: "perimeter" | "area" = isArea ? "area" : "perimeter";
  const unit = extractGrade4Unit(d);

  // استخراج اسم المتغير (x, y, س, ص, أو ؟)
  let unknownVar = "x";
  if (/\b[yYص]\b/i.test(d) || (isSquare && !/\b[xXس]\b/i.test(d))) {
    unknownVar = "y";
  } else if (/[؟?]/.test(d) && !/\b[xXyYسص]\b/i.test(d)) {
    unknownVar = "؟";
  }

  // استخراج الأرقام
  const rawNums = western.match(/(?<![0-9.])\d+(?:\.\d+)?(?![0-9.])/g);
  const nums = rawNums ? rawNums.map(Number).filter((n) => !Number.isNaN(n) && n > 0 && n !== 90) : [];

  if (isSquare) {
    const metricVal = nums.length >= 1 ? nums[0] : (mode === "perimeter" ? 28 : 64);
    return buildGrade4SquareUnknownFigure(
      { mode, metricValue: metricVal, unknownVariable: unknownVar, unit },
      opts
    );
  }

  // مستطيل
  let metricVal = mode === "perimeter" ? 24 : 30;
  let knownDim = 8;
  if (nums.length >= 2) {
    metricVal = Math.max(nums[0], nums[1]);
    knownDim = Math.min(nums[0], nums[1]);
  } else if (nums.length === 1) {
    metricVal = nums[0];
    knownDim = mode === "perimeter" ? Math.round(metricVal / 3) : 5;
  }

  const isVertical = /رأسي|عمودي|طوله|ارتفاع/i.test(d) && !/عرضه/i.test(d);

  return buildGrade4RectangleUnknownFigure(
    {
      mode,
      metricValue: metricVal,
      knownDimension: knownDim,
      unknownVariable: unknownVar,
      unit,
      isVertical,
    },
    opts
  );
}
