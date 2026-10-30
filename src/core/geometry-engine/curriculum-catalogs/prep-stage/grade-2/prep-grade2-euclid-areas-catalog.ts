/**
 * @file prep-grade2-euclid-areas-catalog.ts
 * @description السجل المركزي لأشكال ومفاهيم الهندسة والمساحات للصف الثاني الإعدادي:
 * - تساوي مساحتي متوازيي أضلاع أو مثلثين مشتركين في قاعدة ومحصورين بين مستقيمين متوازيين.
 * - عكس نظرية فيثاغورس والمساقط ونظرية إقليدس.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PREP_GRADE2_EUCLID_AREAS_CATALOG =
  "prep_grade2_euclid_areas_catalog" as const;

export interface Grade2FigureBuildOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مثلثان مشتركان في قاعدة واحدة ومحصوران بين مستقيمين متوازيين (تساوي المساحات)
 */
function buildGrade2TrianglesSameBaseEqualAreaFigure(
  opts: Grade2FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // القاعدة المشتركة BC
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 2, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 9, y: 1 } };

  // الرأسان A و D على خط يوازي القاعدة
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 3, y: 7 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8, y: 7 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sDB`, fromVertexId: vD.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "تساوي مساحتي مثلثين لهما قاعدة مشتركة ورأساهما على مستقيم يوازيها",
    notationLanguage: notation,
    vertices: [vB, vC, vA, vD],
    segments,
    angles: [],
  };
}

export function matchPrepGrade2GeometryFigure(
  description: string,
  figureId = "prep2_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  if (/تساوي.*مساح|قاعدة\s*مشتركة.*توازي|محصورين\s*بين\s*مستقيمين/i.test(d)) {
    return buildGrade2TrianglesSameBaseEqualAreaFigure({ figureId, notationLanguage });
  }

  return undefined;
}
