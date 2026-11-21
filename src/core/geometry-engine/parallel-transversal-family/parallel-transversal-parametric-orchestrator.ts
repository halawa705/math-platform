/**
 * @file parallel-transversal-parametric-orchestrator.ts
 * @description المنسق البارامتري الموحد لمسائل التوازي والقواطع والزوايا المنكسرة والمنصفات والمتعامدات
 * بدون أي كتالوجات نصية جامدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 160 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";
import { normalizeParallelismArabicLettersToLatin } from "./parallel-transversal-arabic-normalizer";
import { buildParallelBisectorsParametricFigure } from "./parallel-bisectors-parametric-builder";
import { buildParallelBrokenVertexParametricFigure } from "./parallel-broken-vertex-parametric-builder";
import { buildParallelStepProofParametricFigure } from "./parallel-step-proof-parametric-builder";
import { buildParallelTransversalParametricFromDescription } from "./parallel-transversal-parametric-builder";

export const MODULE_ID_PARALLEL_TRANSVERSAL_PARAMETRIC_ORCHESTRATOR =
  "parallel_transversal_parametric_orchestrator" as const;

function tryBuildPerpendicularParallelTransversalFigure(
  d: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  const isPerpParallel =
    /(?:(?:l1|l_1)\s*(?:\/\/|\\parallel|\|\|)\s*(?:l2|l_2).*(?:⊥|عمود)|(?:l3|l_3|n)\s*⊥\s*(?:l1|l_1)|(?:l1|l_1)\s*⊥\s*(?:l3|l_3).*(?:l2|l_2)\s*⊥\s*(?:l3|l_3)|عمود(?:ياً|ي)?\s*على\s*أحد\s*مستقيمين\s*متوازيين)/i.test(
      d
    );
  if (!isPerpParallel) return undefined;

  const transLabel = /l_?3/i.test(d) ? "L3" : "n";
  const hasL4 = /l_?4/i.test(d);
  const isProveParallel = /(?:أثبت|اثبت|إثبات|اثبات|برهن).*?(?:l1|l_1)\s*(?:\/\/|\\parallel|\|\|)\s*(?:l2|l_2)/i.test(d);
  const loc = (k: string) => localizeGeometricVertexLabelSSOT(k, notation);
  const xPos = hasL4 ? 3.8 : 5.0;

  const vL1A: CanonicalVertexNode = { id: `${figureId}_vL1A`, label: loc("l1"), position: { x: 1.2, y: 7.0 } };
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: xPos, y: 7.0 } };
  const vL1B: CanonicalVertexNode = { id: `${figureId}_vL1B`, label: "", position: { x: 9.0, y: 7.0 } };
  const vL2A: CanonicalVertexNode = { id: `${figureId}_vL2A`, label: loc("l2"), position: { x: 1.2, y: 3.0 } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: xPos, y: 3.0 } };
  const vL2B: CanonicalVertexNode = { id: `${figureId}_vL2B`, label: "", position: { x: 9.0, y: 3.0 } };
  const vNTop: CanonicalVertexNode = { id: `${figureId}_vNTop`, label: loc(transLabel), position: { x: xPos, y: 8.8 } };
  const vNBot: CanonicalVertexNode = { id: `${figureId}_vNBot`, label: "", position: { x: xPos, y: 1.2 } };

  const vertices: CanonicalVertexNode[] = [vL1A, vA, vL1B, vL2A, vB, vL2B, vNTop, vNBot];
  const lArrows: 1 | undefined = isProveParallel ? undefined : 1;
  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_sL1`, fromVertexId: vL1A.id, toVertexId: vL1B.id, ...(lArrows ? { parallelArrows: lArrows } : {}) },
    { id: `${figureId}_sL2`, fromVertexId: vL2A.id, toVertexId: vL2B.id, ...(lArrows ? { parallelArrows: lArrows } : {}) },
    { id: `${figureId}_sTransN`, fromVertexId: vNTop.id, toVertexId: vNBot.id, ...(hasL4 ? { parallelArrows: 2 } : {}) },
  ];
  const angles = [
    { id: `${figureId}_angA`, vertexId: vA.id, arm1VertexId: vNTop.id, arm2VertexId: vL1B.id, degrees: 90, degreesLabel: "90°", isRightAngle: true },
    { id: `${figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vL2B.id, degrees: 90, degreesLabel: isProveParallel ? "90°" : "؟", isRightAngle: true },
  ];

  if (hasL4) {
    const vL4Top: CanonicalVertexNode = { id: `${figureId}_vL4Top`, label: loc("L4"), position: { x: 6.8, y: 8.8 } };
    const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: "", position: { x: 6.8, y: 7.0 } };
    const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: 6.8, y: 3.0 } };
    const vL4Bot: CanonicalVertexNode = { id: `${figureId}_vL4Bot`, label: "", position: { x: 6.8, y: 1.2 } };
    vertices.push(vL4Top, vD, vC, vL4Bot);
    segments.push({ id: `${figureId}_sTransL4`, fromVertexId: vL4Top.id, toVertexId: vL4Bot.id, parallelArrows: 2 });
    angles.push({ id: `${figureId}_angC`, vertexId: vC.id, arm1VertexId: vD.id, arm2VertexId: vL2B.id, degrees: 90, degreesLabel: "؟", isRightAngle: true });
  }

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "المستقيم العمودي على أحد مستقيمين متوازيين",
    notationLanguage: notation,
    vertices,
    segments,
    angles,
  };
}

function tryBuildCorrespondingBisectorParametricFigure(
  d: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  const bisM = d.match(/BF\s*ينصف\s*∠?\s*EBA/i);
  if (!bisM || !/AB\s*(?:\/\/|\\parallel|\|\||∥)\s*CD/i.test(d)) return undefined;
  const fbaNum = Number(d.match(/∠\s*(?:FBA|ABF|EBF)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i)?.[1] ?? "55");
  const dcbLabelM = d.match(/∠\s*(?:DCB|BCD)\s*\)?\s*=\s*(\([^)]+\)|[0-9a-zA-Z+\-*/\s]+?)°/i);
  const dcbLabel = dcbLabelM ? `${dcbLabelM[1].trim()}°` : "(2x + 10)°";
  const loc = (k: string) => localizeGeometricVertexLabelSSOT(k, notation);

  const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: loc("E"), position: { x: 5.91, y: 9.0 } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: 5.0, y: 6.5 } };
  const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: 3.54, y: 2.5 } };
  const vFTrans: CanonicalVertexNode = { id: `${figureId}_vFTrans`, label: "", position: { x: 2.63, y: 0.0 } };
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: 1.5, y: 6.5 } };
  const vB2: CanonicalVertexNode = { id: `${figureId}_vB2`, label: "", position: { x: 8.8, y: 6.5 } };
  const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: 0.5, y: 2.5 } };
  const vDPrime: CanonicalVertexNode = { id: `${figureId}_vDPrime`, label: "", position: { x: 8.8, y: 2.5 } };
  const vF: CanonicalVertexNode = { id: `${figureId}_vF`, label: loc("F"), position: { x: 3.57, y: 8.55 } };

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: `AB // CD مع منصف الزاوية BF حيث m(∠FBA) = ${fbaNum}°`,
    notationLanguage: notation,
    vertices: [vE, vB, vC, vFTrans, vA, vB2, vDPrime, vD, vF],
    segments: [
      { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB2.id, parallelArrows: 1 },
      { id: `${figureId}_sCD`, fromVertexId: vDPrime.id, toVertexId: vD.id, parallelArrows: 1 },
      { id: `${figureId}_sTrans`, fromVertexId: vE.id, toVertexId: vFTrans.id },
      { id: `${figureId}_sBF`, fromVertexId: vB.id, toVertexId: vF.id, arrowAtEnd: true, isRay: true },
    ],
    angles: [
      { id: `${figureId}_angFBA`, vertexId: vB.id, arm1VertexId: vF.id, arm2VertexId: vA.id, degrees: fbaNum, degreesLabel: `${fbaNum}°` },
      { id: `${figureId}_angEBF`, vertexId: vB.id, arm1VertexId: vE.id, arm2VertexId: vF.id, degrees: fbaNum },
      { id: `${figureId}_angDCB`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degreesLabel: dcbLabel },
    ],
  };
}

export function matchParallelTransversalParametricFigure(
  arabicDescription: string,
  figureId = "parallel_transversal_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = normalizeParallelismArabicLettersToLatin((arabicDescription || "").trim());
  if (!d) return undefined;

  if (
    /شكل\s*رباعي|مستطيل|مربع|معين|شبه\s*منحرف|سداسي|خماسي|معادلة|إحداثي|l1\s*\/\/\s*l2\s*\/\/\s*l3|أربعة\s*مستقيمات|متوسطات|مثلث|نمد\s+[A-Z]{2}|امتداد|[A-Z]{2}\s*∩\s*[A-Z]{2}/i.test(
      d
    ) ||
    (/متوازي\s*(?:الأضلاع|اضلاع)/i.test(d) && !/DE\s*ينصف\s*∠?\s*ADC/i.test(d))
  ) {
    return undefined;
  }

  return (
    buildParallelBisectorsParametricFigure(d, figureId, notationLanguage) ??
    tryBuildCorrespondingBisectorParametricFigure(d, figureId, notationLanguage) ??
    buildParallelStepProofParametricFigure(d, figureId, notationLanguage) ??
    buildParallelBrokenVertexParametricFigure(d, figureId, notationLanguage) ??
    buildParallelTransversalParametricFromDescription(d, figureId, notationLanguage) ??
    tryBuildPerpendicularParallelTransversalFigure(d, figureId, notationLanguage)
  );
}
