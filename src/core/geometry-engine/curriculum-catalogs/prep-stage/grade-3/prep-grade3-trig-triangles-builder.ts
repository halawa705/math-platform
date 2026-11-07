/**
 * @file prep-grade3-trig-triangles-builder.ts
 * @description الباني البارامتري للأشكال المثلثية الذهبية لدرس «النسب المثلثية الأساسية للزاوية الحادة» (حساب المثلثات - الصف الثالث الإعدادي):
 * 1. المثلث القائم الزاوية القياسي (بأي تسمية رؤوس ABC, XYZ, DEF, LMN, PQR وأي رأس قائمة وأي أضلاع معطاة).
 * 2. المثلثان القائمان المتداخلان المشتركان في زاوية حادة (ΔADE قائم في D و ΔABC قائم في B).
 * 3. المثلث المتساوي الساقين والعمود الساقط من الرأس على القاعدة (AD ⊥ BC أو XW ⊥ YZ).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 270 سطراً).
 */

import type {
  CanonicalAngleNode,
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../../../ssot/geometry-archetype-ssot";
import {
  localizeGeometricVertexLabelSSOT,
  toWesternNumeralsSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";
import { convertGeometryLatexToPlainText } from "../../../description-intake/geometry-latex-to-plain-normalizer";
import { normalizeLabelKey } from "../../../fact-compositor/geo-label-utils";

export const MODULE_ID_PREP_GRADE3_TRIG_TRIANGLES_BUILDER =
  "prep_grade3_trig_triangles_builder" as const;

export interface PrepGrade3TrigTriangleBuilderOptions {
  readonly figureId: string;
  readonly description: string;
  readonly notationLanguage?: MathNotationLanguage;
}

function stripGoalText(raw: string): string {
  return convertGeometryLatexToPlainText(toWesternNumeralsSSOT(raw)).replace(
    /(?:أوجد|اوجد|احسب|فاحسب|أثبت\s*أن|اثبت\s*ان|برهن\s*أن|برهن\s*ان|فإن|فان)(?:\s*[:：]?\s+|\s*[:：]\s*)[^؛;\n]*?(?=\s(?:حيث|إذا\s*كان|اذا\s*كان|علماً\s*بأن|وفيه)\s|$)/gi,
    " "
  );
}

function extractSegmentLengthsMap(text: string): Map<string, number> {
  const map = new Map<string, number>();
  const clean = stripGoalText(text);

  for (const cm of clean.matchAll(/\b([A-Za-z]{2})\s*=\s*([A-Za-z]{2})\s*=\s*(\d+(?:\.\d+)?)/g)) {
    const s1 = [cm[1][0].toUpperCase(), cm[1][1].toUpperCase()].sort().join("");
    const s2 = [cm[2][0].toUpperCase(), cm[2][1].toUpperCase()].sort().join("");
    const val = Number(cm[3]);
    if (Number.isFinite(val) && val > 0) {
      map.set(s1, val);
      map.set(s2, val);
    }
  }

  for (const sm of clean.matchAll(/(?<![A-Za-z])([A-Za-z]{2})\s*=\s*(\d+(?:\.\d+)?)(?!\s*\/)/g)) {
    const rawSeg = sm[1].toUpperCase();
    if (/^(SIN|COS|TAN)$/i.test(rawSeg)) continue;
    const key = [rawSeg[0], rawSeg[1]].sort().join("");
    const val = Number(sm[2]);
    if (Number.isFinite(val) && val > 0 && !map.has(key)) map.set(key, val);
  }
  return map;
}

function segKey(a: string, b: string): string {
  return [a.toUpperCase(), b.toUpperCase()].sort().join("");
}

function vLabel(ch: string, notation: MathNotationLanguage): string {
  if (notation === "english") return ch.toUpperCase();
  const mapAr: Record<string, string> = {
    A: "أ", B: "ب", C: "جـ", D: "د", E: "هـ", F: "و", L: "ل", M: "م",
    N: "ن", P: "ب", Q: "ك", R: "ر", W: "و", X: "س", Y: "ص", Z: "ع",
  };
  return mapAr[ch.toUpperCase()] || localizeGeometricVertexLabelSSOT(ch, notation);
}

/**
 * 1. القاعدة الذهبية الأولى: المثلث القائم الزاوية القياسي (ABC, XYZ, DEF, LMN, PQR)
 */
export function buildTrigParametricRightTriangleFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR | undefined {
  const notation = opts.notationLanguage || "english";
  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(opts.description));

  const triMatch =
    clean.match(/(?:المثلث|مثلث|Δ)\s*([A-Za-z]{3})\s*(?:ال)?قائم(?:\s*الزاوية)?\s*(?:في|عند)\s*([A-Za-z])/i) ??
    clean.match(/\b([A-Za-z]{3})\s*مثلث\s*قائم(?:\s*الزاوية)?\s*(?:في|عند)\s*([A-Za-z])/i);

  let triLetters = ["A", "B", "C"];
  let rightVertex = "B";

  if (triMatch) {
    triLetters = triMatch[1].toUpperCase().split("");
    rightVertex = normalizeLabelKey(triMatch[2]).toUpperCase();
  } else {
    const arMatch = clean.match(
      /(?:المثلث|مثلث|Δ)\s*([أ-ي]ـ?\s+[أ-ي]ـ?\s+[أ-ي]ـ?)\s*(?:ال)?قائم(?:\s*الزاوية)?\s*(?:في|عند)\s*([أ-ي]ـ?)/i
    );
    if (!arMatch) return undefined;
    triLetters = arMatch[1].trim().split(/\s+/).map((c) => normalizeLabelKey(c).toUpperCase());
    rightVertex = normalizeLabelKey(arMatch[2]).toUpperCase();
  }

  if (triLetters.length !== 3 || !triLetters.includes(rightVertex)) return undefined;

  const [vTop, vBase] = triLetters.filter((v) => v !== rightVertex);
  const lengths = extractSegmentLengthsMap(opts.description);
  const lenLegTop = lengths.get(segKey(rightVertex, vTop));
  const lenLegBase = lengths.get(segKey(rightVertex, vBase));
  const lenHyp = lengths.get(segKey(vTop, vBase));

  let h = 3;
  let w = 4;
  if (lenLegTop && lenLegBase) {
    h = lenLegTop; w = lenLegBase;
  } else if (lenLegTop && lenHyp && lenHyp > lenLegTop) {
    h = lenLegTop; w = Math.sqrt(lenHyp * lenHyp - lenLegTop * lenLegTop);
  } else if (lenLegBase && lenHyp && lenHyp > lenLegBase) {
    w = lenLegBase; h = Math.sqrt(lenHyp * lenHyp - lenLegBase * lenLegBase);
  } else if (lenLegTop) {
    h = lenLegTop; w = (lenLegTop * 4) / 3;
  } else if (lenLegBase) {
    w = lenLegBase; h = (lenLegBase * 3) / 4;
  } else if (lenHyp) {
    h = lenHyp * 0.6; w = lenHyp * 0.8;
  }

  const nodeRight: CanonicalVertexNode = { id: `${opts.figureId}_v_${rightVertex}`, label: vLabel(rightVertex, notation), position: { x: 0, y: 0 } };
  const nodeTop: CanonicalVertexNode = { id: `${opts.figureId}_v_${vTop}`, label: vLabel(vTop, notation), position: { x: 0, y: h } };
  const nodeBase: CanonicalVertexNode = { id: `${opts.figureId}_v_${vBase}`, label: vLabel(vBase, notation), position: { x: w, y: 0 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_s_${vTop}${rightVertex}`, fromVertexId: nodeTop.id, toVertexId: nodeRight.id, ...(lenLegTop ? { lengthLabel: { value: lenLegTop, unit: "سم" } } : {}) },
    { id: `${opts.figureId}_s_${rightVertex}${vBase}`, fromVertexId: nodeRight.id, toVertexId: nodeBase.id, ...(lenLegBase ? { lengthLabel: { value: lenLegBase, unit: "سم" } } : {}) },
    { id: `${opts.figureId}_s_${vTop}${vBase}`, fromVertexId: nodeTop.id, toVertexId: nodeBase.id, ...(lenHyp ? { lengthLabel: { value: lenHyp, unit: "سم" } } : {}) },
  ];

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_ang_${rightVertex}`, vertexId: nodeRight.id, arm1VertexId: nodeTop.id, arm2VertexId: nodeBase.id, isRightAngle: true, degrees: 90 },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: `المثلث ${triLetters.join("")} القائم الزاوية في ${rightVertex}`,
    notationLanguage: notation,
    vertices: [nodeTop, nodeRight, nodeBase],
    segments,
    angles,
    polygons: [[nodeTop.id, nodeRight.id, nodeBase.id]],
  };
}

/**
 * 2. القاعدة الذهبية الثانية: مثلثان قائمان متداخلان يشتركان في زاوية حادة (ΔADE قائم في D و ΔABC قائم في B)
 */
export function buildTrigNestedRightTrianglesFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR | undefined {
  const notation = opts.notationLanguage || "english";
  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(opts.description));
  if (!/ADE.*قائم\s*في\s*D/i.test(clean) && !/زاوية\s*مشتركة.*قائم/i.test(clean)) {
    return undefined;
  }

  const lengths = extractSegmentLengthsMap(opts.description);
  const lenAD = lengths.get("AD") ?? 8;
  const lenED = lengths.get("DE") ?? 6;
  const lenBC = lengths.get("BC") ?? 12;
  const xB = lenED > 0 ? (lenAD * lenBC) / lenED : lenAD * 2;

  const vA: CanonicalVertexNode = { id: `${opts.figureId}_v_A`, label: vLabel("A", notation), position: { x: 0, y: 0 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_v_D`, label: vLabel("D", notation), position: { x: lenAD, y: 0 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_v_B`, label: vLabel("B", notation), position: { x: xB, y: 0 } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_v_E`, label: vLabel("E", notation), position: { x: lenAD, y: lenED } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_v_C`, label: vLabel("C", notation), position: { x: xB, y: lenBC } };

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_thales_parallel_line",
    titleArabic: "مثلثان قائمان متداخلان ΔADE و ΔABC يشتركان في الزاوية A",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vE, vC],
    segments: [
      { id: `${opts.figureId}_s_AD`, fromVertexId: vA.id, toVertexId: vD.id, lengthLabel: { value: lenAD, unit: "سم" } },
      { id: `${opts.figureId}_s_DB`, fromVertexId: vD.id, toVertexId: vB.id },
      { id: `${opts.figureId}_s_ED`, fromVertexId: vE.id, toVertexId: vD.id, lengthLabel: { value: lenED, unit: "سم" } },
      { id: `${opts.figureId}_s_BC`, fromVertexId: vC.id, toVertexId: vB.id, lengthLabel: { value: lenBC, unit: "سم" } },
      { id: `${opts.figureId}_s_AE`, fromVertexId: vA.id, toVertexId: vE.id },
      { id: `${opts.figureId}_s_EC`, fromVertexId: vE.id, toVertexId: vC.id },
    ],
    angles: [
      { id: `${opts.figureId}_ang_D`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vE.id, isRightAngle: true, degrees: 90 },
      { id: `${opts.figureId}_ang_B`, vertexId: vB.id, arm1VertexId: vD.id, arm2VertexId: vC.id, isRightAngle: true, degrees: 90 },
    ],
    polygons: [[vA.id, vB.id, vC.id]],
  };
}

/**
 * 3. القاعدة الذهبية الثالثة: المثلث المتساوي الساقين والعمود الساقط من الرأس على القاعدة (AD ⊥ BC أو XW ⊥ YZ)
 */
export function buildTrigIsoscelesAltitudeTriangleFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR | undefined {
  const notation = opts.notationLanguage || "english";
  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(opts.description));
  if (!/متساوي\s*الساقين/i.test(clean)) return undefined;

  const isXYZ = /\bXYZ\b/i.test(clean);
  const [apex, leftBase, rightBase, foot] = isXYZ ? ["X", "Y", "Z", "W"] : ["A", "B", "C", "D"];

  const lengths = extractSegmentLengthsMap(opts.description);
  const legLen = lengths.get(segKey(apex, leftBase)) ?? lengths.get(segKey(apex, rightBase)) ?? 10;
  const baseLen = lengths.get(segKey(leftBase, rightBase)) ?? 12;

  const halfBase = baseLen / 2;
  const h = legLen > halfBase ? Math.sqrt(legLen * legLen - halfBase * halfBase) : halfBase * 1.2;

  const vApex: CanonicalVertexNode = { id: `${opts.figureId}_v_${apex}`, label: vLabel(apex, notation), position: { x: 0, y: h } };
  const vLeft: CanonicalVertexNode = { id: `${opts.figureId}_v_${leftBase}`, label: vLabel(leftBase, notation), position: { x: -halfBase, y: 0 } };
  const vRight: CanonicalVertexNode = { id: `${opts.figureId}_v_${rightBase}`, label: vLabel(rightBase, notation), position: { x: halfBase, y: 0 } };
  const vFoot: CanonicalVertexNode = { id: `${opts.figureId}_v_${foot}`, label: vLabel(foot, notation), position: { x: 0, y: 0 } };

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic: `المثلث ${apex}${leftBase}${rightBase} المتساوي الساقين والعمود ${apex}${foot} ⊥ ${leftBase}${rightBase}`,
    notationLanguage: notation,
    vertices: [vApex, vLeft, vFoot, vRight],
    segments: [
      { id: `${opts.figureId}_s_${apex}${leftBase}`, fromVertexId: vApex.id, toVertexId: vLeft.id, tickMarks: 1, lengthLabel: { value: legLen, unit: "سم" } },
      { id: `${opts.figureId}_s_${apex}${rightBase}`, fromVertexId: vApex.id, toVertexId: vRight.id, tickMarks: 1, lengthLabel: { value: legLen, unit: "سم" } },
      { id: `${opts.figureId}_s_${leftBase}${rightBase}`, fromVertexId: vLeft.id, toVertexId: vRight.id, lengthLabel: { value: baseLen, unit: "سم" } },
      { id: `${opts.figureId}_s_${apex}${foot}`, fromVertexId: vApex.id, toVertexId: vFoot.id, strokeStyle: "dashed" },
    ],
    angles: [
      { id: `${opts.figureId}_ang_${foot}`, vertexId: vFoot.id, arm1VertexId: vApex.id, arm2VertexId: vRight.id, isRightAngle: true, degrees: 90 },
    ],
    polygons: [[vApex.id, vLeft.id, vRight.id]],
  };
}
