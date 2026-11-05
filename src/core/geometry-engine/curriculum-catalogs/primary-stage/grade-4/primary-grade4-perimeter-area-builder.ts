/**
 * @file primary-grade4-perimeter-area-builder.ts
 * @description منشئ أشكال المستطيل والمربع لحساب المحيط والمساحة للصف الرابع الابتدائي:
 * - يدعم استخراج الأبعاد الحقيقية والوحدات (سم، م، مم، كم، ديسم، وحدات).
 * - يدعم تدوير المربع المائل (Diamond / 45°).
 * - يدعم وسم الأضلاع الأربعة أو ضلعين متجاورين بدون حروف رؤوس ولا نقاط دائرية مطابقة لكتب رابعة ابتدائي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 250 سطراً).
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

export const MODULE_ID_PRIMARY_GRADE4_PERIMETER_AREA_BUILDER =
  "primary_grade4_perimeter_area_builder" as const;

export interface Grade4PerimeterAreaOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

export function extractGrade4Unit(text: string): ArabicMathUnit {
  if (/ديسم|ديسي\s*متر/i.test(text)) return "ديسم";
  if (/مم|مليمتر/i.test(text)) return "مم";
  if (/كم|كيلومتر/i.test(text)) return "كم";
  if (/سم|سنتيمتر/i.test(text)) return "سم";
  if (/(?:^|\s)م[²2]?(?:\s|$|[،.])/i.test(text) || /متر|أمتار/i.test(text)) return "م";
  if (/وحدة|وحدات/i.test(text)) return "وحدة";
  return "سم";
}

/**
 * ينشئ مستطيلاً دقيق الأبعاد والوحدات لحساب المحيط أو المساحة
 */
export function buildGrade4RectangleFigure(
  width: number,
  height: number,
  unit: ArabicMathUnit,
  opts: Grade4PerimeterAreaOptions,
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
    {
      id: `${opts.figureId}_sAB`,
      fromVertexId: vA.id,
      toVertexId: vB.id,
      lengthLabel: { value: width, unit },
    },
    {
      id: `${opts.figureId}_sBC`,
      fromVertexId: vB.id,
      toVertexId: vC.id,
      lengthLabel: { value: height, unit },
    },
    {
      id: `${opts.figureId}_sCD`,
      fromVertexId: vC.id,
      toVertexId: vD.id,
      lengthLabel: labelAllSides ? { value: width, unit } : undefined,
    },
    {
      id: `${opts.figureId}_sDA`,
      fromVertexId: vD.id,
      toVertexId: vA.id,
      lengthLabel: labelAllSides ? { value: height, unit } : undefined,
    },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: `مستطيل أبعاده ${width} ${unit} × ${height} ${unit}`,
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles: [
      { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
    ],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
  };
}

/**
 * ينشئ مربعاً لحساب المحيط أو المساحة (مستوٍ أو مائل 45°)
 */
export function buildGrade4SquareFigure(
  side: number,
  unit: ArabicMathUnit,
  opts: Grade4PerimeterAreaOptions,
  isRotated = false,
  labelAllSides = false
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  let vertices: CanonicalVertexNode[];
  if (isRotated) {
    vertices = [
      { id: `${opts.figureId}_sqTop`, label: "", hideVertexDot: true, position: { x: 5, y: 8.8 } },
      { id: `${opts.figureId}_sqRight`, label: "", hideVertexDot: true, position: { x: 8.8, y: 5 } },
      { id: `${opts.figureId}_sqBottom`, label: "", hideVertexDot: true, position: { x: 5, y: 1.2 } },
      { id: `${opts.figureId}_sqLeft`, label: "", hideVertexDot: true, position: { x: 1.2, y: 5 } },
    ];
  } else {
    vertices = [
      { id: `${opts.figureId}_sqA`, label: "", hideVertexDot: true, position: { x: 2, y: 8 } },
      { id: `${opts.figureId}_sqB`, label: "", hideVertexDot: true, position: { x: 8, y: 8 } },
      { id: `${opts.figureId}_sqC`, label: "", hideVertexDot: true, position: { x: 8, y: 2 } },
      { id: `${opts.figureId}_sqD`, label: "", hideVertexDot: true, position: { x: 2, y: 2 } },
    ];
  }

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
    angles: [
      { id: `${opts.figureId}_aRight`, vertexId: v3.id, arm1VertexId: v0.id, arm2VertexId: v2.id, isRightAngle: true },
    ],
    polygons: [[v0.id, v1.id, v2.id, v3.id]],
  };
}

/**
 * محلل تلقائي للنص لبناء شكل المستطيل أو المربع المناسب
 */
export function matchGrade4PerimeterAreaFigure(
  description: string,
  opts: Grade4PerimeterAreaOptions
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  const western = toWesternNumeralsSSOT(d);
  const isSquare = /مربع/i.test(d) && !/مستطيل/i.test(d);
  const isRotated = /مائل|معين\s*زواياه\s*قائمة|بزاوية\s*45|45°/i.test(d);
  const labelAll = /أضلاعه\s*الأربعة|جميع\s*الأضلاع|كل\s*ضلع|قانونين/i.test(d);
  const unit = extractGrade4Unit(d);

  // استخراج الأرقام من النص
  const rawNums = western.match(/(?<![0-9.])\d+(?:\.\d+)?(?![0-9.])/g);
  const nums = rawNums ? rawNums.map(Number).filter((n) => !Number.isNaN(n) && n > 0 && n !== 90 && n !== 45) : [];

  if (isSquare) {
    const side = nums.length >= 1 ? nums[0] : 6;
    return buildGrade4SquareFigure(side, unit, opts, isRotated, labelAll);
  }

  if (/مستطيل|أوجد\s*محيط|أوجد\s*مساحة|المحيط\s*=|المساحة\s*=/i.test(d)) {
    let width = 8;
    let height = 5;
    if (nums.length >= 2) {
      width = Math.max(nums[0], nums[1]);
      height = Math.min(nums[0], nums[1]);
    } else if (nums.length === 1) {
      width = nums[0];
      height = Math.round(width * 0.6) || 4;
    }
    return buildGrade4RectangleFigure(width, height, unit, opts, labelAll);
  }

  return undefined;
}
