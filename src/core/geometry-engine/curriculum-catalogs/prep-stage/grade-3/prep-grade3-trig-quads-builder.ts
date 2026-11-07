/**
 * @file prep-grade3-trig-quads-builder.ts
 * @description الباني البارامتري للأشكال الرباعية والمستوى الإحداثي في درس «النسب المثلثية للزاوية الحادة» (3ع):
 * 4. مربع ABCD فيه E منتصف AD لحساب tan(∠BCE) أو tan(∠ECD).
 * 5. مستطيل OABC في المستوى الإحداثي المتعامد مع القطر OB لحساب tan(∠ABO).
 * 6. مستطيل ABCD معلوم البعدين مع القطر AC لحساب النسب المثلثية لزاوية القطر.
 * 7. مربعات متطابقة متجاورة تكوّن مستطيلاً ABCD مع القطر AC لحساب tan(∠CAB).
 * 8. معين ABCD يتقاطع قطراه AC و BD في النقطة M.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 270 سطراً).
 */

import type {
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
import type { PrepGrade3TrigTriangleBuilderOptions } from "./prep-grade3-trig-triangles-builder";

export const MODULE_ID_PREP_GRADE3_TRIG_QUADS_BUILDER =
  "prep_grade3_trig_quads_builder" as const;

function vLabel(ch: string, notation: MathNotationLanguage): string {
  if (notation === "english") return ch.toUpperCase();
  const mapAr: Record<string, string> = {
    A: "أ",
    B: "ب",
    C: "جـ",
    D: "د",
    E: "هـ",
    M: "م",
    O: "و",
  };
  return mapAr[ch.toUpperCase()] || localizeGeometricVertexLabelSSOT(ch, notation);
}

/**
 * 4. القاعدة الذهبية الرابعة: مربع ABCD فيه E منتصف الضلع AD وتوصيل CE و BE
 */
export function buildTrigSquareMidpointFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const s = 6;
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_v_B`, label: vLabel("B", notation), position: { x: 0, y: 0 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_v_C`, label: vLabel("C", notation), position: { x: s, y: 0 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_v_D`, label: vLabel("D", notation), position: { x: s, y: s } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_v_A`, label: vLabel("A", notation), position: { x: 0, y: s } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_v_E`, label: vLabel("E", notation), position: { x: s / 2, y: s } };

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "المربع ABCD فيه E منتصف الضلع AD",
    notationLanguage: notation,
    vertices: [vA, vE, vD, vB, vC],
    segments: [
      { id: `${opts.figureId}_s_AB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 2 },
      { id: `${opts.figureId}_s_BC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 2 },
      { id: `${opts.figureId}_s_CD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 2 },
      { id: `${opts.figureId}_s_AE`, fromVertexId: vA.id, toVertexId: vE.id, tickMarks: 1 },
      { id: `${opts.figureId}_s_ED`, fromVertexId: vE.id, toVertexId: vD.id, tickMarks: 1 },
      { id: `${opts.figureId}_s_CE`, fromVertexId: vC.id, toVertexId: vE.id },
      { id: `${opts.figureId}_s_BE`, fromVertexId: vB.id, toVertexId: vE.id, strokeStyle: "dashed" },
    ],
    angles: [
      { id: `${opts.figureId}_ang_B`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true, degrees: 90 },
      { id: `${opts.figureId}_ang_D`, vertexId: vD.id, arm1VertexId: vE.id, arm2VertexId: vC.id, isRightAngle: true, degrees: 90 },
    ],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
  };
}

/**
 * 5. القاعدة الذهبية الخامسة: المستطيل OABC في المستوى الإحداثي المتعامد مع القطر OB
 */
export function buildTrigCoordinateRectangleOABCFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(opts.description));

  const matchA = clean.match(/A\s*\(\s*(\d+(?:\.\d+)?)\s*[,،]\s*(\d+(?:\.\d+)?)\s*\)/i);
  const matchB = clean.match(/B\s*\(\s*(\d+(?:\.\d+)?)\s*[,،]\s*(\d+(?:\.\d+)?)\s*\)/i);
  const hasExplicitO = /O\s*\(\s*0\s*[,،]\s*0\s*\)/i.test(clean);
  const hasExplicitC = /C\s*\(\s*0\s*[,،]\s*\d+/i.test(clean);

  const w = matchA ? Number(matchA[1]) : matchB ? Number(matchB[1]) : 6;
  const h = matchB ? Number(matchB[2]) : 3;

  const vO: CanonicalVertexNode = {
    id: `${opts.figureId}_v_O`,
    label: hasExplicitO ? (notation === "english" ? "O(0,0)" : "و(0,0)") : vLabel("O", notation),
    position: { x: 0, y: 0 },
  };
  const vA: CanonicalVertexNode = {
    id: `${opts.figureId}_v_A`,
    label: `${vLabel("A", notation)}(${w}, 0)`,
    position: { x: w, y: 0 },
  };
  const vB: CanonicalVertexNode = {
    id: `${opts.figureId}_v_B`,
    label: `${vLabel("B", notation)}(${w}, ${h})`,
    position: { x: w, y: h },
  };
  const vC: CanonicalVertexNode = {
    id: `${opts.figureId}_v_C`,
    label: hasExplicitC ? `${vLabel("C", notation)}(0, ${h})` : vLabel("C", notation),
    position: { x: 0, y: h },
  };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_v_X`, label: "", position: { x: w + 1.8, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_v_Y`, label: "", position: { x: 0, y: h + 1.5 } };

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "المستطيل OABC في المستوى الإحداثي المتعامد",
    notationLanguage: notation,
    vertices: [vO, vA, vB, vC, vX, vY],
    segments: [
      { id: `${opts.figureId}_s_axisX`, fromVertexId: vO.id, toVertexId: vX.id, strokeStyle: "dashed" },
      { id: `${opts.figureId}_s_axisY`, fromVertexId: vO.id, toVertexId: vY.id, strokeStyle: "dashed" },
      { id: `${opts.figureId}_s_OA`, fromVertexId: vO.id, toVertexId: vA.id },
      { id: `${opts.figureId}_s_AB`, fromVertexId: vA.id, toVertexId: vB.id },
      { id: `${opts.figureId}_s_BC`, fromVertexId: vB.id, toVertexId: vC.id },
      { id: `${opts.figureId}_s_CO`, fromVertexId: vC.id, toVertexId: vO.id },
      { id: `${opts.figureId}_s_OB`, fromVertexId: vO.id, toVertexId: vB.id },
    ],
    angles: [
      { id: `${opts.figureId}_ang_A`, vertexId: vA.id, arm1VertexId: vO.id, arm2VertexId: vB.id, isRightAngle: true, degrees: 90 },
    ],
    polygons: [[vO.id, vA.id, vB.id, vC.id]],
  };
}

/**
 * 6. القاعدة الذهبية السادسة: المستطيل ABCD المعلوم البعدين مع القطر AC
 */
export function buildTrigRectangleDiagonalFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(opts.description));
  const abMatch = clean.match(/AB\s*=\s*(\d+(?:\.\d+)?)/i);
  const bcMatch = clean.match(/BC\s*=\s*(\d+(?:\.\d+)?)/i);
  const h = abMatch ? Number(abMatch[1]) : 6;
  const w = bcMatch ? Number(bcMatch[1]) : 8;

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_v_B`, label: vLabel("B", notation), position: { x: 0, y: 0 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_v_C`, label: vLabel("C", notation), position: { x: w, y: 0 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_v_D`, label: vLabel("D", notation), position: { x: w, y: h } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_v_A`, label: vLabel("A", notation), position: { x: 0, y: h } };

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "المستطيل ABCD وقطره AC",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD],
    segments: [
      { id: `${opts.figureId}_s_AB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: h, unit: "سم" } },
      { id: `${opts.figureId}_s_BC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: w, unit: "سم" } },
      { id: `${opts.figureId}_s_CD`, fromVertexId: vC.id, toVertexId: vD.id },
      { id: `${opts.figureId}_s_DA`, fromVertexId: vD.id, toVertexId: vA.id },
      { id: `${opts.figureId}_s_AC`, fromVertexId: vA.id, toVertexId: vC.id },
    ],
    angles: [
      { id: `${opts.figureId}_ang_B`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true, degrees: 90 },
      { id: `${opts.figureId}_ang_D`, vertexId: vD.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true, degrees: 90 },
    ],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
  };
}

/**
 * 7. القاعدة الذهبية السابعة: مربعات متطابقة متجاورة تكوّن المستطيل ABCD مع القطر AC
 */
export function buildTrigAdjacentCongruentSquaresFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(opts.description));
  const count = /ثلاث|3\s*سم/i.test(clean) && !/أربع|اربع|4/i.test(clean) ? 3 : 4;
  const hasExplicitTotalWidth = new RegExp(`\\b${count}\\s*(?:سم|وحد)`).test(clean);

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_v_B`, label: vLabel("B", notation), position: { x: 0, y: 0 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_v_A`, label: vLabel("A", notation), position: { x: count, y: 0 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_v_D`, label: vLabel("D", notation), position: { x: count, y: 1 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_v_C`, label: vLabel("C", notation), position: { x: 0, y: 1 } };

  const vertices: CanonicalVertexNode[] = [vA, vB, vC, vD];
  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_s_BC`, fromVertexId: vB.id, toVertexId: vC.id, lengthLabel: { value: 1, unit: "سم" } },
    {
      id: `${opts.figureId}_s_AB`,
      fromVertexId: vA.id,
      toVertexId: vB.id,
      ...(hasExplicitTotalWidth ? { lengthLabel: { value: count, unit: "سم" } } : {}),
    },
    { id: `${opts.figureId}_s_CD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_s_DA`, fromVertexId: vD.id, toVertexId: vA.id },
    { id: `${opts.figureId}_s_AC`, fromVertexId: vA.id, toVertexId: vC.id },
  ];

  for (let i = 1; i < count; i++) {
    const vBot: CanonicalVertexNode = { id: `${opts.figureId}_div_b_${i}`, label: "", position: { x: i, y: 0 } };
    const vTop: CanonicalVertexNode = { id: `${opts.figureId}_div_t_${i}`, label: "", position: { x: i, y: 1 } };
    vertices.push(vBot, vTop);
    segments.push({ id: `${opts.figureId}_s_div_${i}`, fromVertexId: vBot.id, toVertexId: vTop.id, strokeStyle: "dashed" });
  }

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_composite_rectilinear_shape",
    titleArabic: `${count} مربعات متطابقة مكونة المستطيل ABCD`,
    notationLanguage: notation,
    vertices,
    segments,
    angles: [
      { id: `${opts.figureId}_ang_B`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true, degrees: 90 },
    ],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
  };
}

/**
 * 8. القاعدة الذهبية الثامنة: المعين ABCD الذي يتقاطع قطراه AC و BD في النقطة M
 */
export function buildTrigRhombusDiagonalsFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(opts.description));
  const acMatch = clean.match(/AC\s*=\s*(\d+(?:\.\d+)?)/i);
  const bdMatch = clean.match(/BD\s*=\s*(\d+(?:\.\d+)?)/i);
  const d1 = acMatch ? Number(acMatch[1]) : 12;
  const d2 = bdMatch ? Number(bdMatch[1]) : 16;

  const vM: CanonicalVertexNode = { id: `${opts.figureId}_v_M`, label: vLabel("M", notation), position: { x: 0, y: 0 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_v_A`, label: vLabel("A", notation), position: { x: 0, y: d1 / 2 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_v_C`, label: vLabel("C", notation), position: { x: 0, y: -d1 / 2 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_v_B`, label: vLabel("B", notation), position: { x: d2 / 2, y: 0 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_v_D`, label: vLabel("D", notation), position: { x: -d2 / 2, y: 0 } };

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_rectangle_square_rhombus",
    titleArabic: "المعين ABCD المتقاطع قطراه في M",
    notationLanguage: notation,
    vertices: [vA, vB, vC, vD, vM],
    segments: [
      { id: `${opts.figureId}_s_AB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1 },
      { id: `${opts.figureId}_s_BC`, fromVertexId: vB.id, toVertexId: vC.id, tickMarks: 1 },
      { id: `${opts.figureId}_s_CD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 1 },
      { id: `${opts.figureId}_s_DA`, fromVertexId: vD.id, toVertexId: vA.id, tickMarks: 1 },
      { id: `${opts.figureId}_s_AC`, fromVertexId: vA.id, toVertexId: vC.id, lengthLabel: { value: d1, unit: "سم" } },
      { id: `${opts.figureId}_s_BD`, fromVertexId: vB.id, toVertexId: vD.id, lengthLabel: { value: d2, unit: "سم" } },
    ],
    angles: [
      { id: `${opts.figureId}_ang_M`, vertexId: vM.id, arm1VertexId: vA.id, arm2VertexId: vB.id, isRightAngle: true, degrees: 90 },
    ],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
  };
}
