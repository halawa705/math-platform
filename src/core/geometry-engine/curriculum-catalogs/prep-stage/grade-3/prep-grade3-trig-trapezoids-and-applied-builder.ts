/**
 * @file prep-grade3-trig-trapezoids-and-applied-builder.ts
 * @description الباني البارامتري لأشكال شبه المنحرف (المتساوي الساقين والقائم الزاوية) والتطبيقات الحياتية
 * (طائرة ورقية، سلم على حائط، عمود إنارة وظل، برج وحبل مشدود) في درس النسب المثلثية للزاوية الحادة (3ع).
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
  toWesternNumeralsSSOT,
  type MathNotationLanguage,
} from "../../../../ssot/numeral-and-unit-ssot";
import { convertGeometryLatexToPlainText } from "../../../description-intake/geometry-latex-to-plain-normalizer";
import type { PrepGrade3TrigTriangleBuilderOptions } from "./prep-grade3-trig-triangles-builder";

export const MODULE_ID_PREP_GRADE3_TRIG_TRAPEZOIDS_AND_APPLIED_BUILDER =
  "prep_grade3_trig_trapezoids_and_applied_builder" as const;

function vLabel(ch: string, notation: MathNotationLanguage): string {
  if (notation === "english") return ch.toUpperCase();
  const mapAr: Record<string, string> = { A: "أ", B: "ب", C: "جـ", D: "د" };
  return mapAr[ch.toUpperCase()] || localizeGeometricVertexLabelSSOT(ch, notation);
}

/**
 * 9A. القاعدة الذهبية التاسعة (أ): شبه المنحرف المتساوي الساقين ABCD (AD // BC و AB = CD)
 */
export function buildTrigIsoscelesTrapezoidFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(opts.description));

  const adMatch =
    clean.match(/(?:^|[^\w])AD\s*=\s*(\d+(?:\.\d+)?)/i) ??
    clean.match(/AB\s*=\s*AD\s*=\s*(?:DC|CD)\s*=\s*(\d+(?:\.\d+)?)/i);
  const bcMatch = clean.match(/BC\s*=\s*(\d+(?:\.\d+)?)/i);
  const legMatch =
    clean.match(/AB\s*=\s*(?:AD\s*=\s*)?(?:CD|DC)\s*=\s*(\d+(?:\.\d+)?)/i) ??
    clean.match(/(?:AB|CD|DC)\s*=\s*(\d+(?:\.\d+)?)/i);

  const wTop = adMatch ? Number(adMatch[1]) : 4;
  const wBot = bcMatch ? Number(bcMatch[1]) : 12;
  const leg = legMatch ? Number(legMatch[1]) : 5;
  const dx = Math.abs(wBot - wTop) / 2;
  const h = leg > dx ? Math.sqrt(leg * leg - dx * dx) : wTop * 0.75;

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_v_B`, label: vLabel("B", notation), position: { x: 0, y: 0 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_v_C`, label: vLabel("C", notation), position: { x: wBot, y: 0 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_v_A`, label: vLabel("A", notation), position: { x: dx, y: h } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_v_D`, label: vLabel("D", notation), position: { x: wBot - dx, y: h } };
  const vE: CanonicalVertexNode = { id: `${opts.figureId}_v_E`, label: "", position: { x: dx, y: 0 } };
  const vF: CanonicalVertexNode = { id: `${opts.figureId}_v_F`, label: "", position: { x: wBot - dx, y: 0 } };

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شبه المنحرف المتساوي الساقين ABCD",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vE, vF, vC],
    segments: [
      { id: `${opts.figureId}_s_AD`, fromVertexId: vA.id, toVertexId: vD.id, parallelArrows: 1, lengthLabel: { value: wTop, unit: "سم" } },
      { id: `${opts.figureId}_s_BC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 1, lengthLabel: { value: wBot, unit: "سم" } },
      { id: `${opts.figureId}_s_AB`, fromVertexId: vA.id, toVertexId: vB.id, tickMarks: 1, lengthLabel: { value: leg, unit: "سم" } },
      { id: `${opts.figureId}_s_CD`, fromVertexId: vC.id, toVertexId: vD.id, tickMarks: 1, lengthLabel: { value: leg, unit: "سم" } },
      { id: `${opts.figureId}_s_AE`, fromVertexId: vA.id, toVertexId: vE.id, strokeStyle: "dashed" },
      { id: `${opts.figureId}_s_DF`, fromVertexId: vD.id, toVertexId: vF.id, strokeStyle: "dashed" },
    ],
    angles: [
      { id: `${opts.figureId}_ang_E`, vertexId: vE.id, arm1VertexId: vA.id, arm2VertexId: vF.id, isRightAngle: true, degrees: 90 },
    ],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
  };
}

/**
 * 9B. القاعدة الذهبية التاسعة (ب): شبه المنحرف القائم الزاوية ABCD (قائم في B أو A، فيه AD // BC)
 */
export function buildTrigRightTrapezoidFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(opts.description));

  const abMatch = clean.match(/AB\s*=\s*(\d+(?:\.\d+)?)/i);
  const adMatch = clean.match(/AD\s*=\s*(\d+(?:\.\d+)?)/i);
  const bcMatch = clean.match(/BC\s*=\s*(\d+(?:\.\d+)?)/i);

  const h = abMatch ? Number(abMatch[1]) : 3;
  const wTop = adMatch ? Number(adMatch[1]) : 6;
  const wBot = bcMatch ? Number(bcMatch[1]) : 10;
  const hasDiagonalAC = /ACB|BAC/i.test(clean);

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_v_B`, label: vLabel("B", notation), position: { x: 0, y: 0 } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_v_C`, label: vLabel("C", notation), position: { x: wBot, y: 0 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_v_A`, label: vLabel("A", notation), position: { x: 0, y: h } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_v_D`, label: vLabel("D", notation), position: { x: wTop, y: h } };
  const vH: CanonicalVertexNode = { id: `${opts.figureId}_v_H`, label: "", position: { x: wTop, y: 0 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_s_AB`, fromVertexId: vA.id, toVertexId: vB.id, lengthLabel: { value: h, unit: "سم" } },
    { id: `${opts.figureId}_s_AD`, fromVertexId: vA.id, toVertexId: vD.id, parallelArrows: 1, lengthLabel: { value: wTop, unit: "سم" } },
    { id: `${opts.figureId}_s_BC`, fromVertexId: vB.id, toVertexId: vC.id, parallelArrows: 1, lengthLabel: { value: wBot, unit: "سم" } },
    { id: `${opts.figureId}_s_DC`, fromVertexId: vD.id, toVertexId: vC.id },
    { id: `${opts.figureId}_s_DH`, fromVertexId: vD.id, toVertexId: vH.id, strokeStyle: "dashed" },
  ];
  if (hasDiagonalAC) {
    segments.push({ id: `${opts.figureId}_s_AC`, fromVertexId: vA.id, toVertexId: vC.id });
  }

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_trapezoid_with_altitudes",
    titleArabic: "شبه المنحرف القائم الزاوية ABCD",
    notationLanguage: notation,
    vertices: [vA, vD, vB, vH, vC],
    segments,
    angles: [
      { id: `${opts.figureId}_ang_B`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true, degrees: 90 },
      { id: `${opts.figureId}_ang_H`, vertexId: vH.id, arm1VertexId: vD.id, arm2VertexId: vC.id, isRightAngle: true, degrees: 90 },
    ],
    polygons: [[vA.id, vB.id, vC.id, vD.id]],
  };
}

/**
 * 10. القاعدة الذهبية العاشرة: التطبيقات الحياتية والعملية (طائرة ورقية، سلم، عمود إنارة وظل، برج وحبل)
 */
export function buildTrigAppliedLifeRightTriangleFigure(
  opts: PrepGrade3TrigTriangleBuilderOptions
): CanonicalGeometryFigureIR | undefined {
  const notation = opts.notationLanguage || "english";
  const clean = convertGeometryLatexToPlainText(toWesternNumeralsSSOT(opts.description));

  let lenHeight: number | undefined;
  let lenGround: number | undefined;
  let lenHyp: number | undefined;
  let titleArabic = "تطبيقات النسب المثلثية في المثلث القائم";

  if (/طائرة\s*ورقية/i.test(clean)) {
    titleArabic = "طائرة ورقية مربوطة بخيط مائل بزاوية θ مع الأرض";
    const strMatch = clean.match(/(?:خيط\s*طوله|طول\s*الخيط)\s*(\d+(?:\.\d+)?)/i) ?? clean.match(/(\d+(?:\.\d+)?)\s*(?:متر|م\b)/i);
    lenHyp = strMatch ? Number(strMatch[1]) : 20;
  } else if (/سلم/i.test(clean)) {
    titleArabic = "سلم يستند على حائط رأسي وأرض أفقية";
    const ladMatch = clean.match(/سلم\s*طوله\s*(\d+(?:\.\d+)?)/i);
    const distMatch = clean.match(/يبعد\s*(\d+(?:\.\d+)?)\s*(?:أمتار|امتار|متر|م\b)/i);
    const hgtMatch = clean.match(/على\s*ارتفاع\s*(\d+(?:\.\d+)?)\s*(?:أمتار|امتار|متر|م\b)/i);
    lenHyp = ladMatch ? Number(ladMatch[1]) : 10;
    if (distMatch) lenGround = Number(distMatch[1]);
    if (hgtMatch) lenHeight = Number(hgtMatch[1]);
  } else if (/عمود\s*إنارة|عمود\s*انارة|يلقي\s*ظل|برج|حبل\s*مشدود/i.test(clean)) {
    titleArabic = "عمود أو برج رأسي مع الظل أو الحبل المشدود";
    const hgtMatch = clean.match(/ارتفاع[هـا]?\s*(\d+(?:\.\d+)?)/i);
    const grdMatch =
      clean.match(/(?:ظل[اً]?[^0-9]{0,25}طول[هـا]?|طول\s*ظل[هـا]?|تبعد|يبعد)\s*(\d+(?:\.\d+)?)/i);
    if (hgtMatch) lenHeight = Number(hgtMatch[1]);
    if (grdMatch) lenGround = Number(grdMatch[1]);
  } else {
    return undefined;
  }

  let h = 6;
  let w = 8;
  if (lenHeight && lenGround) {
    h = lenHeight;
    w = lenGround;
  } else if (lenHyp && lenGround && lenHyp > lenGround) {
    w = lenGround;
    h = Math.sqrt(lenHyp * lenHyp - lenGround * lenGround);
  } else if (lenHyp && lenHeight && lenHyp > lenHeight) {
    h = lenHeight;
    w = Math.sqrt(lenHyp * lenHyp - lenHeight * lenHeight);
  } else if (lenHyp) {
    h = lenHyp * 0.6;
    w = lenHyp * 0.8;
  }

  const vB: CanonicalVertexNode = { id: `${opts.figureId}_v_B`, label: vLabel("B", notation), position: { x: 0, y: 0 } };
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_v_A`, label: vLabel("A", notation), position: { x: 0, y: h } };
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_v_C`, label: vLabel("C", notation), position: { x: w, y: 0 } };

  const angles: CanonicalAngleNode[] = [
    { id: `${opts.figureId}_ang_B`, vertexId: vB.id, arm1VertexId: vA.id, arm2VertexId: vC.id, isRightAngle: true, degrees: 90 },
  ];
  if (/θ|\\theta|زاوية\s*ميل/i.test(opts.description)) {
    angles.push({
      id: `${opts.figureId}_ang_C`,
      vertexId: vC.id,
      arm1VertexId: vA.id,
      arm2VertexId: vB.id,
      degreesLabel: "θ",
    });
  }

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_right_pythagoras",
    titleArabic,
    notationLanguage: notation,
    vertices: [vA, vB, vC],
    segments: [
      {
        id: `${opts.figureId}_s_AB`,
        fromVertexId: vA.id,
        toVertexId: vB.id,
        ...(lenHeight ? { lengthLabel: { value: lenHeight, unit: "م" } } : {}),
      },
      {
        id: `${opts.figureId}_s_BC`,
        fromVertexId: vB.id,
        toVertexId: vC.id,
        ...(lenGround ? { lengthLabel: { value: lenGround, unit: "م" } } : {}),
      },
      {
        id: `${opts.figureId}_s_AC`,
        fromVertexId: vA.id,
        toVertexId: vC.id,
        ...(lenHyp ? { lengthLabel: { value: lenHyp, unit: "م" } } : {}),
      },
    ],
    angles,
    polygons: [[vA.id, vB.id, vC.id]],
  };
}
