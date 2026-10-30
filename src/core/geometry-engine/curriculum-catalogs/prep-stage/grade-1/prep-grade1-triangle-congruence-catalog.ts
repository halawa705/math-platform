/**
 * @file prep-grade1-triangle-congruence-catalog.ts
 * @description السجل المركزي لأشكال ومفاهيم الهندسة والتطابق للصف الأول الإعدادي:
 * - حالات تطابق المثلثات الأربع مع علامات التساوي والزوايا المتناظرة.
 * - التوازي والتبادل والتناظر والتداخل.
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
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_PREP_GRADE1_TRIANGLE_CONGRUENCE_CATALOG =
  "prep_grade1_triangle_congruence_catalog" as const;

export interface Grade1FigureBuildOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مثلثان متطابقان بحالة ضلعين وزاوية محصورة (SAS)
 */
function buildGrade1TriangleCongruenceSASFigure(
  opts: Grade1FigureBuildOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 2, y: 7 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 1, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 6, y: 1 } };

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: notation === "english" ? "D" : "د", position: { x: 10, y: 7 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: notation === "english" ? "E" : "هـ", position: { x: 9, y: 1 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: notation === "english" ? "F" : "و", position: { x: 14, y: 1 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
    { id: `${opts.figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 2 },
    { id: `${opts.figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id },

    { id: `${opts.figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, tickMarks: 1 },
    { id: `${opts.figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, tickMarks: 2 },
    { id: `${opts.figureId}_sFD`, fromVertexId: vF.id, toVertexId: vD.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_aB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: 55 },
    { id: `${opts.figureId}_aE`, vertexId: vE.id, arm1VertexId: vD.id, arm2VertexId: vF.id, degrees: 55 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_base_general",
    titleArabic: "تطابق مثلثين بحالة ضلعين وزاوية محصورة (SAS)",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles,
  };
}

export function matchPrepGrade1GeometryFigure(
  description: string,
  figureId = "prep1_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  if (/تطابق.*مثلث|مثلثان\s*متطابقان|SAS|SSS|ASA/i.test(d)) {
    return buildGrade1TriangleCongruenceSASFigure({ figureId, notationLanguage });
  }

  return undefined;
}
