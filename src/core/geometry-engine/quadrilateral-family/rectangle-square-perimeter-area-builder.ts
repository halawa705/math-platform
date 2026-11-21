/**
 * @file rectangle-square-perimeter-area-builder.ts
 * @description منشئ بارامتري لأشكال المستطيل والمربع لحساب المحيط والمساحة مع دعم الوحدات والمربع المائل 45°.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 175 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  toWesternNumeralsSSOT,
  type ArabicMathUnit,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_RECTANGLE_SQUARE_PERIMETER_AREA_BUILDER =
  "rectangle_square_perimeter_area_builder" as const;

export interface PerimeterAreaBuilderOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

export function extractArabicLengthUnit(text: string): ArabicMathUnit {
  if (/ديسم|ديسي\s*متر/i.test(text)) return "ديسم";
  if (/مم|مليمتر/i.test(text)) return "مم";
  if (/كم|كيلومتر/i.test(text)) return "كم";
  if (/سم|سنتيمتر/i.test(text)) return "سم";
  if (/(?:^|\s)م[²2]?(?:\s|$|[،.])/i.test(text) || /متر|أمتار/i.test(text)) return "م";
  if (/وحدة|وحدات/i.test(text)) return "وحدة";
  return "سم";
}

export function buildParametricRectangleFigure(
  width: number,
  height: number,
  unit: ArabicMathUnit,
  opts: PerimeterAreaBuilderOptions,
  labelAllSides = false
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const aspect = Math.max(0.35, Math.min(2.8, width / (height || 1)));
  const baseW = aspect >= 1 ? 8.5 : Math.max(3.8, 8.5 * aspect);
  const baseH = aspect >= 1 ? Math.max(3.5, 8.5 / aspect) : 8.5;

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: "", hideVertexDot: true, position: { x: 1.5, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: "", hideVertexDot: true, position: { x: 1.5 + baseW, y: 1.5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: "", hideVertexDot: true, position: { x: 1.5 + baseW, y: 1.5 + baseH } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: "", hideVertexDot: true, position: { x: 1.5, y: 1.5 + baseH } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: width, unit } },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: height, unit } },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, lengthLabel: labelAllSides ? { value: width, unit } : undefined },
    { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id, lengthLabel: labelAllSides ? { value: height, unit } : undefined },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: `مستطيل أبعاده ${width} ${unit} × ${height} ${unit}`,
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [{ id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true }],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
  };
}

export function buildParametricSquareFigure(
  side: number,
  unit: ArabicMathUnit,
  opts: PerimeterAreaBuilderOptions,
  isRotated = false,
  labelAllSides = false
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const vertices: CanonicalVertexNode[] = isRotated
    ? [
        { id: `${opts.figureId}_sqTop`, label: "", hideVertexDot: true, position: { x: 5, y: 8.8 } },
        { id: `${opts.figureId}_sqRight`, label: "", hideVertexDot: true, position: { x: 8.8, y: 5 } },
        { id: `${opts.figureId}_sqBottom`, label: "", hideVertexDot: true, position: { x: 5, y: 1.2 } },
        { id: `${opts.figureId}_sqLeft`, label: "", hideVertexDot: true, position: { x: 1.2, y: 5 } },
      ]
    : [
        { id: `${opts.figureId}_sqA`, label: "", hideVertexDot: true, position: { x: 2, y: 8 } },
        { id: `${opts.figureId}_sqB`, label: "", hideVertexDot: true, position: { x: 8, y: 8 } },
        { id: `${opts.figureId}_sqC`, label: "", hideVertexDot: true, position: { x: 8, y: 2 } },
        { id: `${opts.figureId}_sqD`, label: "", hideVertexDot: true, position: { x: 2, y: 2 } },
      ];

  const [v0, v1, v2, v3] = vertices;
  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_s01`, fromVertexId: v0.id, toVertexId: v1.id, lengthLabel: { value: side, unit } },
    { id: `${opts.figureId}_s12`, fromVertexId: v1.id, toVertexId: v2.id, lengthLabel: labelAllSides ? { value: side, unit } : undefined },
    { id: `${opts.figureId}_s23`, fromVertexId: v2.id, toVertexId: v3.id, lengthLabel: labelAllSides ? { value: side, unit } : undefined },
    { id: `${opts.figureId}_s30`, fromVertexId: v3.id, toVertexId: v0.id, lengthLabel: labelAllSides || !isRotated ? { value: side, unit } : undefined },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: `مربع طول ضلعه ${side} ${unit}${isRotated ? " (مائل)" : ""}`,
    notationLanguage: notation,
    vertices,
    segments,
    angles: [{ id: `${opts.figureId}_aRight`, vertexId: v3.id, arm1VertexId: v0.id, arm2VertexId: v2.id, isRightAngle: true }],
    polygons: [[v0.id, v1.id, v2.id, v3.id]],
  };
}

export function matchParametricPerimeterAreaFigure(
  description: string,
  opts: PerimeterAreaBuilderOptions
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  const western = toWesternNumeralsSSOT(d);
  if (/(?:[A-Z]{2,4}|قطر|محاور|تماثل|متوازي\s*(?:ال)?مستطيلات|مكعب|هرم)/.test(d)) return undefined;

  const isSquare = /مربع/i.test(d) && !/مستطيل/i.test(d);
  const isRotated = /مائل|معين\s*زواياه\s*قائمة|بزاوية\s*45|45°/i.test(d);
  const labelAll = /أضلاعه\s*الأربعة|جميع\s*الأضلاع|كل\s*ضلع|قانونين/i.test(d);
  const unit = extractArabicLengthUnit(d);

  const rawNums = western.match(/(?<![0-9.])\d+(?:\.\d+)?(?![0-9.])/g);
  const nums = rawNums ? rawNums.map(Number).filter((n) => !Number.isNaN(n) && n > 0 && n !== 90 && n !== 45) : [];

  if (isSquare && nums.length >= 1) {
    return buildParametricSquareFigure(nums[0], unit, opts, isRotated, labelAll);
  }

  const isNonRect = /شبه\s*(?:ال)?منحرف|مثلث|دائرة|متوازي\s*(?:ال)?أضلاع|معين|هرم|مخروط|أسطوانة|اسطوانة/i.test(d);
  if (!isNonRect && /مستطيل/i.test(d) && nums.length >= 1) {
    const width = nums.length >= 2 ? Math.max(nums[0], nums[1]) : nums[0];
    const height = nums.length >= 2 ? Math.min(nums[0], nums[1]) : Math.round(nums[0] * 0.6) || 4;
    return buildParametricRectangleFigure(width, height, unit, opts, labelAll);
  }

  return undefined;
}
