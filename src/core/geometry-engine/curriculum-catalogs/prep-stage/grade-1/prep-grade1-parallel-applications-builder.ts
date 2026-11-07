/**
 * @file prep-grade1-parallel-applications-builder.ts
 * @description منشئ أشكال التطبيقات المركبة للتوازي: منصفات الزوايا (حرف F مع منصف) ونظرية المستقيم العمودي على أحد متوازيين (1ع).
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

export interface PrepGrade1ParallelAppOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مثال 7 ص 5: AB // CD والشعاع BF ينصف ∠EBA حيث m(∠FBA) = 55° و m(∠DCB) = (2x + 10)° بالتناظر
 */
export function buildParallelBisectorCorrespondingFigure(
  opts: PrepGrade1ParallelAppOptions & {
    readonly degFBA?: number;
    readonly angDCBLabel?: string;
  }
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vE: CanonicalVertexNode = { id: `${opts.figureId}_vE`, label: localizeGeometricVertexLabelSSOT("E", notation), position: { x: 5.91, y: 9.0 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: 5.0, y: 6.5 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 3.54, y: 2.5 } };
  const vFTrans: CanonicalVertexNode = { id: `${opts.figureId}_vFTrans`, label: "", position: { x: 2.63, y: 0.0 } };

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: 1.5, y: 6.5 } };
  const vB2: CanonicalVertexNode = { id: `${opts.figureId}_vB2`, label: "", position: { x: 8.8, y: 6.5 } };

  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: localizeGeometricVertexLabelSSOT("D", notation), position: { x: 0.5, y: 2.5 } };
  const vDPrime: CanonicalVertexNode = { id: `${opts.figureId}_vDPrime`, label: "", position: { x: 8.8, y: 2.5 } };

  // شعاع المنصف BF ينصف ∠EBA (الزاوية 110° منقسمة إلى 55° و 55°)
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_vF`, label: localizeGeometricVertexLabelSSOT("F", notation), position: { x: 3.57, y: 8.55 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB2.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sCD`, fromVertexId: vDPrime.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${opts.figureId}_sTrans`, fromVertexId: vE.id, toVertexId: vFTrans.id },
    { id: `${opts.figureId}_sBF`, fromVertexId: vB.id, toVertexId: vF.id, arrowAtEnd: true, isRay: true },
  ];

  const fbaDeg = opts.degFBA ?? 55;
  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "AB // CD مع منصف الزاوية BF حيث m(∠FBA) = 55° و m(∠DCB) = (2x + 10)° بالتناظر",
    notationLanguage: notation,
    vertices: [vE, vB, vC, vFTrans, vA, vB2, vDPrime, vD, vF],
    segments,
    angles: [
      { id: `${opts.figureId}_angFBA`, vertexId: vB.id, arm1VertexId: vF.id, arm2VertexId: vA.id, degrees: fbaDeg, degreesLabel: `${fbaDeg}°` },
      { id: `${opts.figureId}_angEBF`, vertexId: vB.id, arm1VertexId: vE.id, arm2VertexId: vF.id, degrees: fbaDeg },
      { id: `${opts.figureId}_angDCB`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degreesLabel: opts.angDCBLabel || "(2x + 10)°" },
    ],
  };
}

/**
 * مثال 8 ص 5: l1 // l2 والمستقيم n عمودي على l1 (n ⊥ l1) عند A ويقطع l2 في B
 * لإثبات أن n ⊥ l2 وحساب قياس الزاوية القائمة الناتجة 90°
 */
export function buildParallelPerpendicularTransversalFigure(
  opts: PrepGrade1ParallelAppOptions & {
    readonly transversalLabel?: string;
    readonly hasL4?: boolean;
    readonly isProveL1L2Parallel?: boolean;
  }
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const transLabel = opts.transversalLabel || "n";
  const hasL4 = Boolean(opts.hasL4);

  const vL1A: CanonicalVertexNode = { id: `${opts.figureId}_vL1A`, label: localizeGeometricVertexLabelSSOT("l1", notation), position: { x: 1.2, y: 7.0 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: localizeGeometricVertexLabelSSOT("A", notation), position: { x: hasL4 ? 3.8 : 5.0, y: 7.0 } };
  const vL1B: CanonicalVertexNode = { id: `${opts.figureId}_vL1B`, label: "", position: { x: 9.0, y: 7.0 } };

  const vL2A: CanonicalVertexNode = { id: `${opts.figureId}_vL2A`, label: localizeGeometricVertexLabelSSOT("l2", notation), position: { x: 1.2, y: 3.0 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: localizeGeometricVertexLabelSSOT("B", notation), position: { x: hasL4 ? 3.8 : 5.0, y: 3.0 } };
  const vL2B: CanonicalVertexNode = { id: `${opts.figureId}_vL2B`, label: "", position: { x: 9.0, y: 3.0 } };

  const vNTop: CanonicalVertexNode = { id: `${opts.figureId}_vNTop`, label: localizeGeometricVertexLabelSSOT(transLabel, notation), position: { x: hasL4 ? 3.8 : 5.0, y: 8.8 } };
  const vNBot: CanonicalVertexNode = { id: `${opts.figureId}_vNBot`, label: "", position: { x: hasL4 ? 3.8 : 5.0, y: 1.2 } };

  const vertices: CanonicalVertexNode[] = [vL1A, vA, vL1B, vL2A, vB, vL2B, vNTop, vNBot];
  const lArrows: 1 | undefined = opts.isProveL1L2Parallel ? undefined : 1;
  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sL1`, fromVertexId: vL1A.id, toVertexId: vL1B.id, ...(lArrows ? { parallelArrows: lArrows } : {}) },
    { id: `${opts.figureId}_sL2`, fromVertexId: vL2A.id, toVertexId: vL2B.id, ...(lArrows ? { parallelArrows: lArrows } : {}) },
    { id: `${opts.figureId}_sTransN`, fromVertexId: vNTop.id, toVertexId: vNBot.id, ...(hasL4 ? { parallelArrows: 2 } : {}) },
  ];

  const angles = [
    { id: `${opts.figureId}_angA`, vertexId: vA.id, arm1VertexId: vNTop.id, arm2VertexId: vL1B.id, degrees: 90, degreesLabel: "90°", isRightAngle: true },
    { id: `${opts.figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vL2B.id, degrees: 90, degreesLabel: opts.isProveL1L2Parallel ? "90°" : "؟", isRightAngle: true },
  ];

  if (hasL4) {
    const vL4Top: CanonicalVertexNode = { id: `${opts.figureId}_vL4Top`, label: localizeGeometricVertexLabelSSOT("L4", notation), position: { x: 6.8, y: 8.8 } };
    const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: "", position: { x: 6.8, y: 7.0 } };
    const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: localizeGeometricVertexLabelSSOT("C", notation), position: { x: 6.8, y: 3.0 } };
    const vL4Bot: CanonicalVertexNode = { id: `${opts.figureId}_vL4Bot`, label: "", position: { x: 6.8, y: 1.2 } };
    vertices.push(vL4Top, vD, vC, vL4Bot);
    segments.push({ id: `${opts.figureId}_sTransL4`, fromVertexId: vL4Top.id, toVertexId: vL4Bot.id, parallelArrows: 2 });
    angles.push({ id: `${opts.figureId}_angC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vL2B.id, degrees: 90, degreesLabel: "؟", isRightAngle: true });
  }

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "المستقيم العمودي على أحد مستقيمين متوازيين l1 // l2 يكون عمودياً على الآخر",
    notationLanguage: notation,
    vertices,
    segments,
    angles,
  };
}
