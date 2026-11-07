/**
 * @file prep-grade1-parallel-bisectors-parametric-builder.ts
 * @description منشئ بارامتري لمسائل دمج التوازي مع منصفات الزوايا (الفكرة 5) وبراهين التوازي الرباعية:
 * 1. منصفان متوازيان BE ينصف ∠ABC و CF ينصف ∠BCD.
 * 2. منصفا زاويتين متداخلتين متعامدان BE ينصف ∠ABC و CE ينصف ∠BCD (∠BEC = 90°).
 * 3. منصف مفرد BE ينصف ∠ABC أو AE ينصف ∠BAC مع AB // CD.
 * 4. متوازي أضلاع ABCD مع منصف DE للزاوية ∠ADC.
 * 5. رباعي ABCD لإثبات توازي كل ضلعين متقابلين بمعلومية ثلاث زوايا.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 260 سطراً).
 */

import type {
  CanonicalAngleNode,
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";

const rad = (deg: number): number => (deg * Math.PI) / 180;

function extractAngleNum(d: string, pattern: RegExp): number | undefined {
  const m = d.match(pattern);
  return m ? Number(m[1]) : undefined;
}

/**
 * 1. منصفان متوازيان: BE ينصف ∠ABC و CF ينصف ∠BCD (مع أو بدون قياس عددي مثل m(∠ABE) = 32°)
 */
function buildTwoParallelBisectorsBECF(
  d: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  if (!/BE\s*ينصف\s*∠?\s*ABC/i.test(d) || !/CF\s*ينصف\s*∠?\s*BCD/i.test(d)) return undefined;
  const givenHalf = extractAngleNum(d, /∠\s*(?:ABE|EBA|EBC|CBE)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  const half = givenHalf ?? 32;
  const theta = half * 2;

  const bx = 6.5;
  const by = 7.5;
  const ax = 2.0;
  const ay = 7.5;
  const cx = bx - 4.6 * Math.cos(rad(theta));
  const cy = by - 4.6 * Math.sin(rad(theta));
  const dx = cx + 4.5;
  const dy = cy;
  const ex = bx - 3.2 * Math.cos(rad(half));
  const ey = by - 3.2 * Math.sin(rad(half));
  const fx = cx + 3.2 * Math.cos(rad(half));
  const fy = cy + 3.2 * Math.sin(rad(half));

  const loc = (k: string): string => localizeGeometricVertexLabelSSOT(k, notation);
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: ax, y: ay } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: bx, y: by } };
  const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: cx, y: cy } };
  const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: dx, y: dy } };
  const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: loc("E"), position: { x: ex, y: ey } };
  const vF: CanonicalVertexNode = { id: `${figureId}_vF`, label: loc("F"), position: { x: fx, y: fy } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id, arrowAtEnd: true, isRay: true },
    { id: `${figureId}_sCF`, fromVertexId: vC.id, toVertexId: vF.id, arrowAtEnd: true, isRay: true },
  ];

  const angles: CanonicalAngleNode[] = [
    {
      id: `${figureId}_angABE`,
      vertexId: vB.id,
      arm1VertexId: vA.id,
      arm2VertexId: vE.id,
      degrees: half,
      degreesLabel: givenHalf !== undefined ? `${givenHalf}°` : undefined,
      markSymbol: "dot",
    },
    { id: `${figureId}_angEBC`, vertexId: vB.id, arm1VertexId: vE.id, arm2VertexId: vC.id, degrees: half, markSymbol: "dot" },
    { id: `${figureId}_angBCF`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vF.id, degrees: half, markSymbol: "cross" },
    {
      id: `${figureId}_angFCD`,
      vertexId: vC.id,
      arm1VertexId: vF.id,
      arm2VertexId: vD.id,
      degrees: half,
      degreesLabel: givenHalf !== undefined ? "؟" : undefined,
      markSymbol: "cross",
    },
  ];

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "توازي AB // CD مع منصفي الزاويتين المتبادلتين BE و CF",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles,
  };
}

/**
 * 2. منصفا زاويتين متداخلتين يلتقيان في E بزاوية قائمة (BE ينصف ∠ABC و CE ينصف ∠BCD)
 */
function buildIntersectingBisectorsRightAngleBEC(
  d: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  if (!/BE\s*ينصف\s*∠?\s*ABC/i.test(d) || !/CE\s*ينصف\s*∠?\s*BCD/i.test(d)) return undefined;

  const loc = (k: string): string => localizeGeometricVertexLabelSSOT(k, notation);
  const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: 2.2, y: 2.5 } };
  const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: 8.5, y: 2.5 } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: 3.98, y: 7.39 } };
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: 8.5, y: 7.39 } };
  const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: loc("E"), position: { x: 5.69, y: 4.94 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_sAB`, fromVertexId: vB.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
    { id: `${figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id },
    { id: `${figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${figureId}_angABE`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degrees: 55, markSymbol: "dot" },
    { id: `${figureId}_angEBC`, vertexId: vB.id, arm1VertexId: vE.id, arm2VertexId: vC.id, degrees: 55, markSymbol: "dot" },
    { id: `${figureId}_angBCE`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vE.id, degrees: 35, markSymbol: "cross" },
    { id: `${figureId}_angECD`, vertexId: vC.id, arm1VertexId: vE.id, arm2VertexId: vD.id, degrees: 35, markSymbol: "cross" },
    { id: `${figureId}_angBEC`, vertexId: vE.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: 90, degreesLabel: "؟", isRightAngle: true },
  ];

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "منصفا زاويتين متداخلتين BE و CE يلتقيان في E بزاوية قائمة 90°",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE],
    segments,
    angles,
  };
}

/**
 * 3. منصف مفرد BE ينصف ∠ABC أو AE ينصف ∠BAC مع AB // CD
 */
function buildSingleBisectorParallelFigure(
  d: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  const loc = (k: string): string => localizeGeometricVertexLabelSSOT(k, notation);

  if (/BE\s*ينصف\s*∠?\s*ABC/i.test(d)) {
    const degEBC = extractAngleNum(d, /∠\s*(?:EBC|CBE|ABE|EBA)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
    const degABC = extractAngleNum(d, /∠\s*(?:ABC|CBA)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
    const half = degEBC ?? (degABC !== undefined ? degABC / 2 : 35);
    const theta = half * 2;
    const bx = 6.5;
    const by = 7.5;
    const cx = bx - 4.6 * Math.cos(rad(theta));
    const cy = by - 4.6 * Math.sin(rad(theta));

    const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: 2.0, y: 7.5 } };
    const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: bx, y: by } };
    const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: cx, y: cy } };
    const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: cx + 4.5, y: cy } };
    const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: loc("E"), position: { x: bx - 3.2 * Math.cos(rad(half)), y: by - 3.2 * Math.sin(rad(half)) } };

    return {
      figureId,
      familyId: "triangle_family",
      branchId: "triangle_thales_parallel_line",
      titleArabic: `توازي AB // CD مع الشعاع BE منصف ∠ABC`,
      notationLanguage: notation,
      vertices: [vA, vB, vC, vD, vE],
      segments: [
        { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
        { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
        { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
        { id: `${figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id, arrowAtEnd: true, isRay: true },
      ],
      angles: [
        { id: `${figureId}_angABE`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degrees: half, markSymbol: "dot" },
        {
          id: `${figureId}_angEBC`,
          vertexId: vB.id,
          arm1VertexId: vE.id,
          arm2VertexId: vC.id,
          degrees: half,
          degreesLabel: degEBC !== undefined ? `${degEBC}°` : degABC !== undefined ? `${degABC}°` : undefined,
          markSymbol: "dot",
        },
        { id: `${figureId}_angBCD`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: theta, degreesLabel: "؟" },
      ],
    };
  }

  if (/AE\s*ينصف\s*∠?\s*BAC/i.test(d)) {
    const degC = extractAngleNum(d, /∠\s*(?:ACD|DCA|C)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i) ?? 110;
    const thetaA = 180 - degC;
    const half = thetaA / 2;
    const ax = 3.0;
    const ay = 7.5;
    const cx = ax + 4.6 * Math.cos(rad(thetaA));
    const cy = ay - 4.6 * Math.sin(rad(thetaA));

    const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: ax, y: ay } };
    const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: 8.2, y: ay } };
    const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: cx, y: cy } };
    const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: 8.5, y: cy } };
    const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: loc("E"), position: { x: ax + 3.2 * Math.cos(rad(half)), y: ay - 3.2 * Math.sin(rad(half)) } };

    return {
      figureId,
      familyId: "triangle_family",
      branchId: "triangle_thales_parallel_line",
      titleArabic: `توازي AB // CD مع الشعاع AE منصف ∠BAC وقياس ∠ACD = ${degC}°`,
      notationLanguage: notation,
      vertices: [vA, vB, vC, vD, vE],
      segments: [
        { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
        { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
        { id: `${figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
        { id: `${figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id, arrowAtEnd: true, isRay: true },
      ],
      angles: [
        { id: `${figureId}_angBAE`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vE.id, degrees: half, degreesLabel: "؟", markSymbol: "dot" },
        { id: `${figureId}_angEAC`, vertexId: vA.id, arm1VertexId: vE.id, arm2VertexId: vC.id, degrees: half, markSymbol: "dot" },
        { id: `${figureId}_angACD`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: degC, degreesLabel: `${degC}°` },
      ],
    };
  }

  return undefined;
}

/**
 * 4. متوازي أضلاع ABCD مع منصف DE للزاوية ∠ADC أو إثبات توازي رباعي ABCD بمعلومية 3 زوايا
 */
function buildParallelogramParallelismFigure(
  d: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  const loc = (k: string): string => localizeGeometricVertexLabelSSOT(k, notation);

  if (/DE\s*ينصف\s*∠?\s*ADC/i.test(d)) {
    const degB = extractAngleNum(d, /∠\s*(?:ABC|CBA|B)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i) ?? 80;
    const halfD = degB / 2;
    const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: 1.8, y: 2.5 } };
    const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: 7.2, y: 2.5 } };
    const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: 1.8 + 4.0 * Math.cos(rad(degB)), y: 2.5 + 4.0 * Math.sin(rad(degB)) } };
    const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: 7.2 + 4.0 * Math.cos(rad(degB)), y: 2.5 + 4.0 * Math.sin(rad(degB)) } };
    const bisAngle = 180 + halfD;
    const vE: CanonicalVertexNode = {
      id: `${figureId}_vE`,
      label: loc("E"),
      position: { x: vD.position.x + 3.6 * Math.cos(rad(bisAngle)), y: vD.position.y + 3.6 * Math.sin(rad(bisAngle)) },
    };

    return {
      figureId,
      familyId: "triangle_family",
      branchId: "triangle_thales_parallel_line",
      titleArabic: `متوازي أضلاع ABCD فيه m(∠ABC) = ${degB}° والشعاع DE ينصف ∠ADC`,
      notationLanguage: notation,
      vertices: [vA, vB, vC, vD, vE],
      segments: [
        { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
        { id: `${figureId}_sCD`, fromVertexId: vD.id, toVertexId: vC.id, parallelArrows: 1 },
        { id: `${figureId}_sAD`, fromVertexId: vA.id, toVertexId: vD.id, parallelArrows: 2 },
        { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 2 },
        { id: `${figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, arrowAtEnd: true, isRay: true },
      ],
      angles: [
        { id: `${figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: degB, degreesLabel: `${degB}°` },
        { id: `${figureId}_angADE`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degrees: halfD, markSymbol: "dot" },
        { id: `${figureId}_angEDC`, vertexId: vD.id, arm1VertexId: vE.id, arm2VertexId: vC.id, degrees: halfD, degreesLabel: "؟", markSymbol: "dot" },
      ],
    };
  }

  // إثبات أن AD // BC و AB // CD بمعلومية m(∠A) = 120° و m(∠B) = 60° و m(∠C) = 120°
  const degA = extractAngleNum(d, /∠\s*A\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  const degB = extractAngleNum(d, /∠\s*B\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  const degC = extractAngleNum(d, /∠\s*C\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  if (degA !== undefined && degB !== undefined && degC !== undefined && Math.abs(degA + degB - 180) < 2) {
    const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: 1.8, y: 2.5 } };
    const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: 7.0, y: 2.5 } };
    const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: 1.8 + 3.8 * Math.cos(rad(degB)), y: 2.5 + 3.8 * Math.sin(rad(degB)) } };
    const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: 7.0 + 3.8 * Math.cos(rad(degB)), y: 2.5 + 3.8 * Math.sin(rad(degB)) } };
    return {
      figureId,
      familyId: "triangle_family",
      branchId: "triangle_thales_parallel_line",
      titleArabic: `الشكل الرباعي ABCD لإثبات توازي الأضلاع المتقابلة`,
      notationLanguage: notation,
      vertices: [vA, vB, vC, vD],
      segments: [
        { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
        { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id },
        { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
        { id: `${figureId}_sDA`, fromVertexId: vD.id, toVertexId: vA.id },
      ],
      angles: [
        { id: `${figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: degA, degreesLabel: `${degA}°` },
        { id: `${figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: degB, degreesLabel: `${degB}°` },
        { id: `${figureId}_angC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: degC, degreesLabel: `${degC}°` },
      ],
    };
  }

  return undefined;
}

export function buildParallelBisectorsParametricFigure(
  description: string,
  figureId: string,
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  return (
    buildTwoParallelBisectorsBECF(description, figureId, notationLanguage) ??
    buildIntersectingBisectorsRightAngleBEC(description, figureId, notationLanguage) ??
    buildParallelogramParallelismFigure(description, figureId, notationLanguage) ??
    buildSingleBisectorParallelFigure(description, figureId, notationLanguage)
  );
}
