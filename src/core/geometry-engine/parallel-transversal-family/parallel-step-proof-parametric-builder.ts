/**
 * @file parallel-step-proof-parametric-builder.ts
 * @description منشئ بارامتري لأشكال التوازي المتدرج لإثبات توازي مستقيمين غير متجاورين (مثل CA // BE لإثبات AB // CD).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 90 سطراً).
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

export const MODULE_ID_PARALLEL_STEP_PROOF_PARAMETRIC_BUILDER =
  "parallel_step_proof_parametric_builder" as const;

const PAR = "(?:\\/\\/|\\\\parallel|\\|\\||∥|⫽)";
const rad = (deg: number): number => (deg * Math.PI) / 180;
const extractAngleNum = (d: string, pattern: RegExp): number | undefined => {
  const m = d.match(pattern);
  return m ? Number(m[1]) : undefined;
};

function buildStepCAParallelBEFigure(
  d: string,
  figureId: string,
  notation: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  if (!new RegExp(`(?:CA|AC)\\s*${PAR}\\s*(?:BE|EB)`, "i").test(d)) return undefined;

  const degC = Number(d.match(/∠\s*(?:ACD|DCA|C)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i)?.[1] ?? "125");
  const degA = Number(d.match(/∠\s*(?:CAB|BAC|A)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i)?.[1] ?? "55");
  const degB = Number(d.match(/∠\s*(?:ABE|EBA|B)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i)?.[1] ?? String(degA));
  if (degA <= 10 || degA >= 170 || degB <= 10 || degB >= 170 || degC <= 10 || degC >= 170) {
    return undefined;
  }

  const ax = 4.2;
  const ay = 5.0;
  const bx = 7.7;
  const by = 5.0;
  const ex = bx + 3.4 * Math.cos(rad(180 - degB));
  const ey = by + 3.4 * Math.sin(rad(180 - degB));
  const cx = ax + 3.4 * Math.cos(rad(-degA));
  const cy = ay + 3.4 * Math.sin(rad(-degA));
  const dirCD = 180 - degA - degC;
  const dx = cx + 3.6 * Math.cos(rad(dirCD));
  const dy = cy + 3.6 * Math.sin(rad(dirCD));

  const loc = (k: string): string => localizeGeometricVertexLabelSSOT(k, notation);
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: ax, y: ay } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: bx, y: by } };
  const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: cx, y: cy } };
  const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: dx, y: dy } };
  const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: loc("E"), position: { x: ex, y: ey } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_sCA`, fromVertexId: vC.id, toVertexId: vA.id, parallelArrows: 1 },
    { id: `${figureId}_sBE`, fromVertexId: vB.id, toVertexId: vE.id, parallelArrows: 1 },
    { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${figureId}_angC`, vertexId: vC.id, arm1VertexId: vA.id, arm2VertexId: vD.id, degrees: degC, degreesLabel: `${degC}°` },
    { id: `${figureId}_angA`, vertexId: vA.id, arm1VertexId: vC.id, arm2VertexId: vB.id, degrees: degA, degreesLabel: `${degA}°` },
    { id: `${figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vE.id, degrees: degB, degreesLabel: `${degB}°` },
  ];

  return {
    figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: `توازي CA // BE مع الزوايا ${degC}° و ${degB}° و ${degA}° لإثبات AB // CD`,
    notationLanguage: notation,
    vertices: [vC, vD, vA, vB, vE],
    segments,
    angles,
  };
}

function buildStepTwoParallelPairsABCDEFigure(
  d: string,
  figureId: string,
  notation: MathNotationLanguage
): CanonicalGeometryFigureIR | undefined {
  if (!new RegExp(`AB\\s*${PAR}\\s*CD`, "i").test(d) || !new RegExp(`BC\\s*${PAR}\\s*DE`, "i").test(d)) {
    return undefined;
  }
  const degB = extractAngleNum(d, /∠\s*(?:ABC|CBA|B)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  if (degB === undefined || degB < 20 || degB > 160) return undefined;
  const degCGiven = extractAngleNum(d, /∠\s*(?:BCD|DCB|C)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  const degDGiven = extractAngleNum(d, /∠\s*(?:CDE|EDC|D)\s*\)?\s*=\s*(\d+(?:\.\d+)?)/i);
  const isProveBCDE = new RegExp(`(?:أثبت|اثبت|إثبات|اثبات|برهن).*?BC\\s*${PAR}\\s*DE`, "i").test(d);
  const isObtuseD = degDGiven !== undefined && Math.abs(degDGiven - (180 - degB)) < 2;

  const bx = 6.0; const by = 7.5;
  const cx = bx - 3.6 * Math.cos(rad(degB)); const cy = by - 3.6 * Math.sin(rad(degB));
  const dx = cx + 3.8; const dy = cy;
  const ex = isObtuseD ? dx + 3.2 * Math.cos(rad(degB)) : dx - 3.2 * Math.cos(rad(degB));
  const ey = isObtuseD ? dy + 3.2 * Math.sin(rad(degB)) : dy - 3.2 * Math.sin(rad(degB));

  const loc = (k: string): string => localizeGeometricVertexLabelSSOT(k, notation);
  const vA: CanonicalVertexNode = { id: `${figureId}_vA`, label: loc("A"), position: { x: 2.0, y: 7.5 } };
  const vB: CanonicalVertexNode = { id: `${figureId}_vB`, label: loc("B"), position: { x: bx, y: by } };
  const vC: CanonicalVertexNode = { id: `${figureId}_vC`, label: loc("C"), position: { x: cx, y: cy } };
  const vD: CanonicalVertexNode = { id: `${figureId}_vD`, label: loc("D"), position: { x: dx, y: dy } };
  const vE: CanonicalVertexNode = { id: `${figureId}_vE`, label: loc("E"), position: { x: ex, y: ey } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id, parallelArrows: 1 },
    { id: `${figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id, parallelArrows: 1 },
    { id: `${figureId}_sBC`, fromVertexId: vB.id, toVertexId: vC.id, ...(isProveBCDE ? {} : { parallelArrows: 2 }) },
    { id: `${figureId}_sDE`, fromVertexId: vD.id, toVertexId: vE.id, ...(isProveBCDE ? {} : { parallelArrows: 2 }) },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${figureId}_angB`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, degrees: degB, degreesLabel: `${degB}°` },
    {
      id: `${figureId}_angC`, vertexId: vC.id, arm1VertexId: vB.id, arm2VertexId: vD.id, degrees: degB,
      degreesLabel: degCGiven !== undefined ? `${degCGiven}°` : /∠\s*C\b/.test(d) ? "؟" : undefined,
    },
    {
      id: `${figureId}_angD`, vertexId: vD.id, arm1VertexId: vC.id, arm2VertexId: vE.id,
      degrees: isObtuseD ? 180 - degB : degB,
      degreesLabel: degDGiven !== undefined ? `${degDGiven}°` : "؟",
    },
  ];

  return {
    figureId, familyId: "triangle_family", branchId: "triangle_thales_parallel_line",
    titleArabic: `توازي AB // CD و BC // DE مع قياس ∠B = ${degB}°`, notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vE], segments, angles,
  };
}

export function buildParallelStepProofParametricFigure(
  d: string,
  figureId: string,
  notation: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  return buildStepCAParallelBEFigure(d, figureId, notation) ?? buildStepTwoParallelPairsABCDEFigure(d, figureId, notation);
}
