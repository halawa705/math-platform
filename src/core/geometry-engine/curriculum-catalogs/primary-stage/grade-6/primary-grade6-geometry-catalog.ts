/**
 * @file primary-grade6-geometry-catalog.ts
 * @description السجل المركزي لأشكال ومفاهيم الهندسة والحجوم القياسية للصف السادس الابتدائي:
 * - الدائرة ومحيطها ومساحتها ونصف قطرها.
 * - المكعب ومتوازي المستطيلات والمجسمات البسيطة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PRIMARY_GRADE6_GEOMETRY_CATALOG =
  "primary_grade6_geometry_catalog" as const;

export interface Grade6FigureBuildOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * دائرة مع نصف قطر r مرسوم ومحدد بوحدة سم
 */
function buildGrade6CircleRadiusFigure(
  opts: Grade6FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vCenter: CanonicalVertexNode = { id: `${opts.figureId}_center`, label: localizeGeometricVertexLabelSSOT("م", notation), position: { x: 5, y: 5 } };
  const vRim: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 8.5, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sRadius`, fromVertexId: vCenter.id, toVertexId: vRim.id, lengthLabel: { value: 7, unit: "سم" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "circle_family",
    branchId: "circle_base_radius_chord",
    titleArabic: "الدائرة: نصف القطر ومحيط ومساحة الدائرة",
    notationLanguage: notation,
    vertices: [vCenter, vRim],
    segments,
    angles: [],
  };
}

export function matchPrimaryGrade6GeometryFigure(
  description: string,
  figureId = "primary6_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  if (/دائرة.*نصف\s*قطر|محيط\s*الدائرة|مساحة\s*الدائرة|ط.*نق/i.test(d)) {
    return buildGrade6CircleRadiusFigure({ figureId, notationLanguage });
  }

  return undefined;
}
