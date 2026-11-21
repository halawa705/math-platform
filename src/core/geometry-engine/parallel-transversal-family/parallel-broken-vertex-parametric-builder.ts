/**
 * @file prep-grade1-parallel-broken-vertex-parametric-builder.ts
 * @description منشئ بارامتري لأشكال الزوايا المنكسرة بين مستقيمين متوازيين (AB // CD مع الرأس E بينهما)،
 * وثلاثة مستقيمات متوازية (AB // CD // EF مع الرأس C)، وتوازي الضلعين المتعاقبين (AB // CD و BC // DE).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 260 سطراً).
 */

import type {
  CanonicalAngleNode,
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  type MathNotationLanguage,
} from "../../ssot/numeral-and-unit-ssot";

const PAR = "(?:\\/\\/|\\\\parallel|\\|\\||∥|⫽)";
const rad = (deg: number): number => (deg * Math.PI) / 180;

function extractAngleNum(d: string, pattern: RegExp): number | undefined {
  const m = d.match(pattern);
  return m ? Number(m[1]) : undefined;
}

/**
 * 1. ثلاثة مستقيمات متوازية AB // CD // EF (أو AB // CD و AB // EF) مع رأس منكسر C لحساب ∠ACE
 */
function buildThreeParallelLinesACEFigure(
  d: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  if (!new RegExp(`AB\\s*${PAR}\\s*CD`, "i").test(d) || !new RegExp(`(?:CD|AB)\\s*${PAR}\\s*EF`, "i").test(d)) {
    return undefined;
  }
  const degA = extractAngleNum(d, /∠\s*(?:BAC|CAB|A)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  const degE = extractAngleNum(d, /∠\s*(?:CFE|CEF|FEC|EFC|E|F)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  if (degA === undefined || degE === undefined) return undefined;

  const cx = 4.0;
  const cy = 5.0;
  const ax = cx + 2.8 / Math.tan(rad(degA));
  const ay = 7.8;
  const ex = cx - 2.8 / Math.tan(rad(degE));
  const ey = 2.2;
  const aceDeg = degA + (180 - degE);

  const loc = (k: string): string => localizeGeometricVertexLabelSSOT(k, notation);
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: ax, y: ay } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: ax - 3.5, y: ay } };
  const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: cx, y: cy } };
  const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: cx + 3.8, y: cy } };
  const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: loc("E"), position: { x: ex, y: ey } };
  const vF: CanonicalVertexNode = { id: `${figureId}_vF`, label: loc("F"), position: { x: ex + 3.2, y: ey } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_sAB`, fromVertexId: vB.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, parallelArrows: 1 },
    { id: `${figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
    { id: `${figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id },
  ];

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: `ثلاثة مستقيمات متوازية AB // CD // EF مع زاويتين ${degA}° و ${degE}° لحساب ∠ACE`,
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles: [
      { id: `${figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: degA, degreesLabel: `${degA}°` },
      { id: `${figureId}_angE`, vertexId: vE.id, arm1VertexId: vC.id, arm2VertexId: vF.id, degrees: degE, degreesLabel: `${degE}°` },
      { id: `${figureId}_angACE`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degrees: aceDeg, degreesLabel: "؟" },
    ],
  };
}

function buildBrokenVertexCBetweenABAndDEFigure(
  d: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  if (!new RegExp(`AB\\s*${PAR}\\s*DE`, "i").test(d)) return undefined;
  const degA = extractAngleNum(d, /∠\s*(?:CAB|BAC|A)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  const degD = extractAngleNum(d, /∠\s*(?:CDE|EDC|D)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  if (degA === undefined || degD === undefined) return undefined;
  const cx = 6.0; const cy = 5.0;
  const ax = cx - 2.2 / Math.tan(rad(degA));
  const dx = cx - 2.0 / Math.tan(rad(degD));
  const loc = (k: string): string => localizeGeometricVertexLabelSSOT(k, notation);
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: ax, y: 7.2 } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: ax + 3.8, y: 7.2 } };
  const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: cx, y: cy } };
  const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: dx, y: 3.0 } };
  const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: loc("E"), position: { x: dx + 3.8, y: 3.0 } };
  const vH: CanonicalVertexNode = { id: `${figureId}_vH`, label: "", position: { x: cx - 3.0, y: cy } };
  return {
    figureId, familyId: "triangle_family", branchId: "triangle_thales_parallel_line", notationLanguage: notation,
    titleArabic: `زاوية منكسرة عند C بين المتوازيين AB // DE مع خط عمل متقطع`,
    vertices: [vA, vB, vC, vD, vE, vH],
    segments: [
      { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
      { id: `${figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, parallelArrows: 1 },
      { id: `${figureId}_sAC`, fromVertexId: vA.id, toVertexId: vC.id },
      { id: `${figureId}_sDC`, fromVertexId: vD.id, toVertexId: vC.id },
      { id: `${figureId}_sCH`, fromVertexId: vC.id, toVertexId: vH.id, strokeStyle: "dashed", parallelArrows: 1 },
    ],
    angles: [
      { id: `${figureId}_angA`, vertexId: vA.id, arm1VertexId: vB.id, arm2VertexId: vC.id, degrees: degA, degreesLabel: `${degA}°` },
      { id: `${figureId}_angD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vE.id, degrees: degD, degreesLabel: `${degD}°` },
      { id: `${figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: degA + degD, degreesLabel: "؟" },
    ],
  };
}

/**
 * 2. زاوية منكسرة عند E بين مستقيمين متوازيين AB // CD (مع شعاع العمل المتقطع EF)
 */
function buildBrokenVertexEBetweenABAndCDFigure(
  d: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  if (!new RegExp(`AB\\s*${PAR}\\s*CD`, "i").test(d)) return undefined;
  if (!/∠\s*(?:BAE|EAB|ECD|DCE|AEC|CEA|A|C)|نقطة\s*بينهما|المنكسرة/i.test(d)) return undefined;

  const splitMatch = d.match(/تبادل\s*(\d+(?:\.\d+)?)\s*°\s*وزاوية\s*تبادل\s*(\d+(?:\.\d+)?)\s*°/i);
  const givenA = splitMatch ? Number(splitMatch[1]) : extractAngleNum(d, /∠\s*(?:BAE|EAB|A)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  const givenC = splitMatch ? Number(splitMatch[2]) : extractAngleNum(d, /∠\s*(?:ECD|DCE|C)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  const givenEReflex = extractAngleNum(d, /∠\s*(?:AEC|CEA)\s*\)?\s*المنعكسة\s*=\s*(\d+(?:\.\d+)?)/i);
  const givenE = givenEReflex ?? extractAngleNum(d, /∠\s*(?:AEC|CEA)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);

  let degA = givenA;
  let degC = givenC;
  let degE = givenE;

  if (degA !== undefined && degC !== undefined && degE === undefined) {
    degE = degA < 90 && degC < 90 ? degA + degC : (180 - degA) + (180 - degC);
  } else if (degA !== undefined && degE !== undefined && degC === undefined) {
    if (degE >= 180) {
      degC = 120;
    } else if (degA < 90) {
      degC = degE - degA;
    } else {
      degC = 360 - degA - degE;
    }
  } else if (degC !== undefined && degE !== undefined && degA === undefined) {
    degA = degC < 90 ? degE - degC : 360 - degC - degE;
  }

  if (degA === undefined || degC === undefined || degE === undefined) return undefined;
  if (degA <= 10 || degA >= 170 || degC <= 10 || degC >= 170) return undefined;

  const ex = 5.0;
  const ey = 5.0;
  const ax = ex - 2.8 / Math.tan(rad(degA));
  const ay = 7.8;
  const cx = ex - 2.8 / Math.tan(rad(degC));
  const cy = 2.2;
  const fx = degA < 90 ? ex - 3.2 : ex + 3.2;

  const loc = (k: string): string => localizeGeometricVertexLabelSSOT(k, notation);
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: ax, y: ay } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: ax + 3.4, y: ay } };
  const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: cx, y: cy } };
  const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: cx + 3.4, y: cy } };
  const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: loc("E"), position: { x: ex, y: ey } };
  const vF: CanonicalVertexNode = { id: `${figureId}_vF`, label: loc("F"), position: { x: fx, y: ey } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${figureId}_sAE`, fromVertexId: vA.id, toVertexId: vE.id },
    { id: `${figureId}_sCE`, fromVertexId: vC.id, toVertexId: vE.id },
    { id: `${figureId}_sEF`, fromVertexId: vE.id, toVertexId: vF.id, strokeStyle: "dashed", parallelArrows: 1 },
  ];

  const drawnE = degA < 90 && degC < 90 ? degA + degC : (180 - degA) + (180 - degC);
  const angles: CanonicalAngleNode[] = [
    {
      id: `${figureId}_angA`,
      vertexId: vA.id,
      arm1VertexId: vB.id,
      arm2VertexId: vE.id,
      degrees: degA,
      degreesLabel: givenA !== undefined ? `${givenA}°` : "؟",
    },
    {
      id: `${figureId}_angC`,
      vertexId: vC.id,
      arm1VertexId: vE.id,
      arm2VertexId: vD.id,
      degrees: degC,
      degreesLabel: givenC !== undefined ? `${givenC}°` : "؟",
    },
    {
      id: `${figureId}_angE`,
      vertexId: vE.id,
      arm1VertexId: vA.id,
      arm2VertexId: vC.id,
      degrees: givenE !== undefined && givenE >= 180 ? givenE : drawnE,
      degreesLabel: givenE !== undefined ? `${givenE}°` : "؟",
    },
  ];

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: `زاوية منكسرة عند E بين المتوازيين AB // CD مع شعاع العمل EF`,
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE, vF],
    segments,
    angles,
  };
}

export function buildParallelBrokenVertexParametricFigure(
  description: string,
  figureId: string,
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  return (
    buildThreeParallelLinesACEFigure(description, figureId, notationLanguage) ??
    buildBrokenVertexCBetweenABAndDEFigure(description, figureId, notationLanguage) ??
    buildBrokenVertexEBetweenABAndCDFigure(description, figureId, notationLanguage)
  );
}
