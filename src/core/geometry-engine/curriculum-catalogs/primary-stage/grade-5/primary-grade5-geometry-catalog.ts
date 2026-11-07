/**
 * @file primary-grade5-geometry-catalog.ts
 * @description السجل المركزي لأشكال ومفاهيم الهندسة والمساحات القياسية للصف الخامس الابتدائي:
 * - مساحة المثلث (قاعدة وارتفاع مناظر).
 * - مساحة متوازي الأضلاع والقطاعات الدائرية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
  CanonicalAngleNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  toWesternNumeralsSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";
import { buildGrade5CoordinatePlaneFigure, parseGrade5CoordinatePoints } from "./primary-grade5-coordinate-plane-builder";

export const MODULE_ID_PRIMARY_GRADE5_GEOMETRY_CATALOG =
  "primary_grade5_geometry_catalog" as const;

export interface Grade5FigureBuildOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
  readonly baseVal?: number;
  readonly heightVal?: number;
  readonly areaVal?: number;
  readonly unit?: string;
  readonly sideAbVal?: number;
}

/**
 * مثلث مع ارتفاع ساقط على القاعدة لحساب المساحة (نصف القاعدة × الارتفاع) بالأبعاد الحقيقية من المسألة
 */
function buildGrade5TriangleAltitudeAreaFigure(
  opts: Grade5FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const unit = opts.unit || "سم";
  const b = opts.baseVal ?? 8;
  const h = opts.heightVal ?? 6;
  const scale = 7 / Math.max(b, h, 1);
  const drawnB = Math.max(3.5, Math.min(8, Number((b * scale).toFixed(2))));
  const drawnH = Math.max(2.5, Math.min(7, Number((h * scale).toFixed(2))));

  const xLeft = Number((5 - drawnB / 2).toFixed(2));
  const xRight = Number((5 + drawnB / 2).toFixed(2));

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_pA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: Number((1.5 + drawnH).toFixed(2)) } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_pB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: xLeft, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_pC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: xRight, y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_pD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 5, y: 1.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    {
      id: `${opts.figureId}_sBC`,
      fromVertexId: vB.id,
      toVertexId: vC.id,
      lengthLabel: opts.baseVal !== undefined ? { value: opts.baseVal, unit, labelKind: "given" } : opts.areaVal !== undefined && opts.heightVal !== undefined ? { value: "؟", labelKind: "unknown" } : undefined,
    },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },
    {
      id: `${opts.figureId}_sAD`,
      fromVertexId: vA.id,
      toVertexId: vD.id,
      strokeStyle: "dashed",
      lengthLabel: opts.heightVal !== undefined ? { value: opts.heightVal, unit, labelKind: "given" } : opts.areaVal !== undefined && opts.baseVal !== undefined ? { value: "؟", labelKind: "unknown" } : undefined,
    },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aD`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "مساحة المثلث = نصف القاعدة × الارتفاع",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments,
    angles,
    polygons: [[vA.id, vB.id, vC.id]],
    interiorBadges:
      opts.areaVal !== undefined
        ? [{ id: `${opts.figureId}_area`, text: `المساحة = ${opts.areaVal} ${unit}²`, position: { x: 5, y: Number((1.5 + drawnH * 0.35).toFixed(2)) }, badgeType: "area", labelKind: "given" }]
        : undefined,
  };
}

/**
 * متوازي أضلاع مع قاعدة وارتفاع ساقط لحساب المساحة (طول القاعدة × الارتفاع المناظر)
 */
function buildGrade5ParallelogramAreaFigure(
  opts: Grade5FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const unit = opts.unit || "سم";
  const b = opts.baseVal ?? 8;
  const h = opts.heightVal ?? 5;
  const scale = 6.5 / Math.max(b, h, 1);
  const w = Math.max(3.5, Math.min(7.5, Number((b * scale).toFixed(2))));
  const dH = Math.max(2.5, Math.min(6, Number((h * scale).toFixed(2))));
  const shift = 1.6;

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: Number((1.5 + shift).toFixed(2)), y: Number((1.5 + dH).toFixed(2)) } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1.5, y: 1.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: Number((1.5 + w).toFixed(2)), y: 1.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: Number((1.5 + w + shift).toFixed(2)), y: Number((1.5 + dH).toFixed(2)) } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("هـ", notation), position: { x: Number((1.5 + shift).toFixed(2)), y: 1.5 } };

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_parallelogram_diagonals",
    titleArabic: "مساحة متوازي الأضلاع = طول القاعدة × الارتفاع المناظر",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments: [
      { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: opts.sideAbVal !== undefined ? { value: opts.sideAbVal, unit, labelKind: "given" } : undefined },
      { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: opts.baseVal !== undefined ? { value: opts.baseVal, unit, labelKind: "given" } : undefined },
      { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
      { id: `${opts.figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
      { id: `${opts.figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id, strokeStyle: "dashed", lengthLabel: opts.heightVal !== undefined ? { value: opts.heightVal, unit, labelKind: "given" } : undefined },
    ],
    angles: [{ id: `${opts.figureId}_aE`, vertexId: vE.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true }],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
    interiorBadges:
      opts.areaVal !== undefined
        ? [{ id: `${opts.figureId}_area`, text: `المساحة = ${opts.areaVal} ${unit}²`, position: { x: Number((1.5 + w * 0.55).toFixed(2)), y: Number((1.5 + dH * 0.5).toFixed(2)) }, badgeType: "area", labelKind: "given" }]
        : undefined,
  };
}

export function matchPrimaryGrade5GeometryFigure(
  description: string,
  figureId = "primary5_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = toWesternNumeralsSSOT(description.trim());
  if (!d) return undefined;

  // مستوى إحداثي للربع الأول بنقاط عربية صريحة (لا نخمّن نقاطاً)
  if (/مستوى\s*إحداثي|شبكة\s*(?:ال)?إحداثيات|شبكة\s*تربيعية/i.test(d)) {
    const pts = parseGrade5CoordinatePoints(d);
    if (pts.length > 0) {
      return buildGrade5CoordinatePlaneFigure(pts, /مثلث|مستطيل|مضلع|مربع/i.test(d), figureId, notationLanguage);
    }
  }

  // يسمح بأسماء القطع بعد الكلمة: «القاعدة ب جـ = 8» / «الارتفاع أ د = 6» / «ب جـ = 10» كقاعدة
  const seg = "(?:[أ-ي]ـ?\\s*[أ-ي]ـ?\\s*)?";
  const num = "=?\\s*(\\d+(?:\\.\\d+)?)\\s*(سم|م|ديسم|مم)?";
  const baseM =
    d.match(new RegExp(`(?:طول\\s*)?(?:ال)?قاعد(?:ة|ت)(?:ها|ه)?\\s*${seg}${num}`, "i")) ||
    d.match(new RegExp(`(?:^|[؛;\\s])ب\\s*جـ?\\s*${num}`, "i"));
  const heightM = d.match(new RegExp(`(?:ال)?ارتفاع(?:ها|ه)?(?:\\s*(?:المناظر|الأصغر))?\\s*${seg}${num}`, "i"));
  const areaM = d.match(/مساحت(?:ها|ه)?\s*=?\s*(\d+(?:\.\d+)?)/i);
  const sideAbM = d.match(new RegExp(`(?:^|[؛;\\s])أ\\s*ب\\s*${num}`, "i"));
  const unit = baseM?.[2] || heightM?.[2] || "سم";
  const baseVal = baseM ? Number(baseM[1]) : undefined;
  const heightVal = heightM ? Number(heightM[1]) : undefined;
  const areaVal = areaM ? Number(areaM[1]) : undefined;
  const sideAbVal = sideAbM ? Number(sideAbM[1]) : undefined;

  if (/متوازي\s*(?:ال)?أضلاع/i.test(d) && (baseVal !== undefined || heightVal !== undefined || /ارتفاع/i.test(d))) {
    return buildGrade5ParallelogramAreaFigure({ figureId, notationLanguage, baseVal, heightVal, areaVal, unit, sideAbVal });
  }

  const isTriangleWords = /مثلث/i.test(d) && (baseVal !== undefined || heightVal !== undefined);
  if (isTriangleWords || /مساحة.*مثلث|نصف.*القاعدة.*الارتفاع|(?:مثلث.*)?قاعدت(?:ها|ه)?.*ارتفاع/i.test(d)) {
    return buildGrade5TriangleAltitudeAreaFigure({ figureId, notationLanguage, baseVal, heightVal, areaVal, unit });
  }

  return undefined;
}
