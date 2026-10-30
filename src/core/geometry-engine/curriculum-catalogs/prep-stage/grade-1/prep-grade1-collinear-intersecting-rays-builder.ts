/**
 * @file prep-grade1-collinear-intersecting-rays-builder.ts
 * @description منشئ أشكال المستقيمات المشتركة والمنصفات المتقاطعة وتطبيقات الزوايا (1ع).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
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

export interface PrepGrade1CollinearIntersectingOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 6 ص 175: نقاط A, B, C, D على استقامة واحدة مع ABE = 56° وتقاطع XY مع BD في C لحساب DCY = 124°
 */
export function buildCollinearABCDIntersectingXYFigure(opts: PrepGrade1CollinearIntersectingOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 8.8, y: 5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 6.5, y: 5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 3.5, y: 5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 1.2, y: 5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 7.8, y: 8 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: localizeGeometricVertexLabelSSOT("X", notation), position: { x: 1.8, y: 8 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: localizeGeometricVertexLabelSSOT("Y", notation), position: { x: 5.2, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sLineAD`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id },
    { id: `${opts.figureId}_sLineXY`, fromVertexId: vX.id, toVertexId: vY.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مستقيم ABCD مع زاوية ABE = 56° وتقاطع XY مع BD في C لحساب DCY = 124°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vX, vY],
    segments,
    angles: [
      { id: `${opts.figureId}_angABE`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degrees: 56, degreesLabel: "56°" },
      { id: `${opts.figureId}_angBCX`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vX.id, degreesLabel: "*" },
      { id: `${opts.figureId}_angEBC`, vertexId: vB.id, arm1VertexId: vE.id, arm2VertexId: vC.id, degreesLabel: "*" },
      { id: `${opts.figureId}_angDCY`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vY.id, degreesLabel: "؟" },
    ],
  };
}

/**
 * مسألة 4 ص 175: AB ∩ CD = {M} مع CMX = 90° و AMY = 80° و XMB = 35° لحساب AMD = 125°
 */
export function buildIntersectingLinesWithMultipleRaysFigure(opts: PrepGrade1CollinearIntersectingOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 8.5, y: 5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 1.5, y: 5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 7.5, y: 8 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 2.5, y: 2 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: localizeGeometricVertexLabelSSOT("X", notation), position: { x: 2.2, y: 7.8 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: localizeGeometricVertexLabelSSOT("Y", notation), position: { x: 5.8, y: 1.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vB.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_sMX`, fromVertexId: vM.id, toVertexId: vX.id },
    { id: `${opts.figureId}_sMY`, fromVertexId: vM.id, toVertexId: vY.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مستقيمان متقاطعان AB و CD مع تعامد CMX = 90° وزاويتي AMY = 80° و XMB = 35° لحساب AMD = 125°",
    notationLanguage: notation,
    vertices: [vM, vA, vB, vC, vD, vX, vY],
    segments,
    angles: [
      { id: `${opts.figureId}_angCMX`, vertexId: vM.id, arm1VertexId: vC.id, arm2VertexId: vX.id, degrees: 90, degreesLabel: "90°" },
      { id: `${opts.figureId}_angXMB`, vertexId: vM.id, arm1VertexId: vX.id, arm2VertexId: vB.id, degrees: 35, degreesLabel: "35°" },
      { id: `${opts.figureId}_angAMY`, vertexId: vM.id, arm1VertexId: vA.id, arm2VertexId: vY.id, degrees: 80, degreesLabel: "80°" },
      { id: `${opts.figureId}_angAMD`, vertexId: vM.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: 125, degreesLabel: "125°" },
    ],
  };
}

/**
 * مسألة 1-2 ص 174: AC ∩ BD = {M} مع BMC = 120° والشعاع ME ينصف AMD لحساب EMD = 60°
 */
export function buildIntersectingLinesBisectedEMDFigure(opts: PrepGrade1CollinearIntersectingOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: localizeGeometricVertexLabelSSOT("M", notation), position: { x: 5, y: 5 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 8.5, y: 5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 1.5, y: 5 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 7, y: 8.5 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 3, y: 1.5 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 6.5, y: 2 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAC`, fromVertexId: vC.id, toVertexId: vA.id },
    { id: `${opts.figureId}_sBD`, fromVertexId: vD.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sME`, fromVertexId: vM.id, toVertexId: vE.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "مستقيمان متقاطعان AC و BD مع BMC = 120° والشعاع ME ينصف AMD لحساب EMD = 60°",
    notationLanguage: notation,
    vertices: [vM, vA, vC, vB, vD, vE],
    segments,
    angles: [
      { id: `${opts.figureId}_angBMC`, vertexId: vM.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 120, degreesLabel: "120°" },
      { id: `${opts.figureId}_angAME`, vertexId: vM.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degreesLabel: "*" },
      { id: `${opts.figureId}_angEMD`, vertexId: vM.id, arm1VertexId: vE.id, arm2VertexId: vD.id, degreesLabel: "*" },
    ],
  };
}
