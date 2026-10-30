/**
 * @file prep-grade1-coordinate-projections-builder.ts
 * @description منشئ أشكال مسقط قطعة مستقيمة على محوري الإحداثيات (محور X ومحور Y) في المستوى الإحداثي (1ع).
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

export interface PrepGrade1CoordinatesOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 1: رسم AB في المستوى الإحداثي حيث A(2, 3) و B(-4, -1) ومسقطها على محور X هو A'B' بطول 6 وحدات
 */
export function buildSegmentProjectionOnXAxisFigure(opts: PrepGrade1CoordinatesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  // محاور الإحداثيات
  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: 0.5, y: 5 } };
  const vXpos: CanonicalVertexNode = { id: `${opts.figureId}_vXpos`, label: notation === "english" ? "X" : "س", position: { x: 9.5, y: 5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 5, y: 9.5 } };
  const vYpos: CanonicalVertexNode = { id: `${opts.figureId}_vYpos`, label: notation === "english" ? "y" : "ص", position: { x: 5, y: 0.5 } };
  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 5, y: 5 } };

  // النقاط الأصلية والمساقط: النقطة A(2, 3) -> في الرسم x: 5 + 2*0.7 = 6.4, y: 5 - 3*0.7 = 2.9
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: "A(2, 3)", position: { x: 6.4, y: 2.9 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: "B(-4, -1)", position: { x: 2.2, y: 5.7 } };
  const vAprime: CanonicalVertexNode = { id: `${opts.figureId}_vAp`, label: "A'(2, 0)", position: { x: 6.4, y: 5 } };
  const vBprime: CanonicalVertexNode = { id: `${opts.figureId}_vBp`, label: "B'(-4, 0)", position: { x: 2.2, y: 5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAxisX`, fromVertexId: vXneg.id, toVertexId: vXpos.id },
    { id: `${opts.figureId}_sAxisY`, fromVertexId: vYneg.id, toVertexId: vYpos.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sProjA`, fromVertexId: vA.id, toVertexId: vAprime.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjB`, fromVertexId: vB.id, toVertexId: vBprime.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjAB`, fromVertexId: vBprime.id, toVertexId: vAprime.id, lengthLabel: { value: "6 وحدات" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مسقط القطعة AB على محور السينات: A(2,3) و B(-4,-1) طول المسقط = 6 وحدات",
    notationLanguage: notation,
    vertices: [vXneg, vXpos, vYneg, vYpos, vO, vA, vB, vAprime, vBprime],
    segments,
    angles: [],
  };
}

/**
 * مسألة 2: رسم CD في المستوى الإحداثي حيث C(1, 4) و D(5, 1) ومسقطها على محور Y هو C'D' بطول 3 وحدات
 */
export function buildSegmentProjectionOnYAxisFigure(opts: PrepGrade1CoordinatesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: 1, y: 7.5 } };
  const vXpos: CanonicalVertexNode = { id: `${opts.figureId}_vXpos`, label: notation === "english" ? "X" : "س", position: { x: 9.5, y: 7.5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 2.5, y: 9 } };
  const vYpos: CanonicalVertexNode = { id: `${opts.figureId}_vYpos`, label: notation === "english" ? "y" : "ص", position: { x: 2.5, y: 0.5 } };
  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 2.5, y: 7.5 } };

  // C(1, 4) و D(5, 1)
  const vC: CanonicalVertexNode = { id: `${opts.figureId}_vC`, label: "C(1, 4)", position: { x: 3.7, y: 2.7 } };
  const vD: CanonicalVertexNode = { id: `${opts.figureId}_vD`, label: "D(5, 1)", position: { x: 8.5, y: 6.3 } };
  const vCprime: CanonicalVertexNode = { id: `${opts.figureId}_vCp`, label: "C'(0, 4)", position: { x: 2.5, y: 2.7 } };
  const vDprime: CanonicalVertexNode = { id: `${opts.figureId}_vDp`, label: "D'(0, 1)", position: { x: 2.5, y: 6.3 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAxisX`, fromVertexId: vXneg.id, toVertexId: vXpos.id },
    { id: `${opts.figureId}_sAxisY`, fromVertexId: vYneg.id, toVertexId: vYpos.id },
    { id: `${opts.figureId}_sCD`, fromVertexId: vC.id, toVertexId: vD.id },
    { id: `${opts.figureId}_sProjC`, fromVertexId: vC.id, toVertexId: vCprime.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjD`, fromVertexId: vD.id, toVertexId: vDprime.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjCD`, fromVertexId: vDprime.id, toVertexId: vCprime.id, lengthLabel: { value: "3 وحدات" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مسقط القطعة CD على محور الصادات: C(1,4) و D(5,1) طول المسقط = 3 وحدات",
    notationLanguage: notation,
    vertices: [vXneg, vXpos, vYneg, vYpos, vO, vC, vD, vCprime, vDprime],
    segments,
    angles: [],
  };
}

/**
 * مسألة حاول بنفسك 2: مسقط AB على المحورين مع A(3, -2) و B(-4, 4)
 */
export function buildSegmentProjectionsBothAxesFigure(opts: PrepGrade1CoordinatesOptions): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vXneg: CanonicalVertexNode = { id: `${opts.figureId}_vXneg`, label: "", position: { x: 0.5, y: 5 } };
  const vXpos: CanonicalVertexNode = { id: `${opts.figureId}_vXpos`, label: notation === "english" ? "X" : "س", position: { x: 9.5, y: 5 } };
  const vYneg: CanonicalVertexNode = { id: `${opts.figureId}_vYneg`, label: "", position: { x: 5, y: 9.5 } };
  const vYpos: CanonicalVertexNode = { id: `${opts.figureId}_vYpos`, label: notation === "english" ? "y" : "ص", position: { x: 5, y: 0.5 } };
  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 5, y: 5 } };

  // A(3, -2) و B(-4, 4)
  const vA: CanonicalVertexNode = { id: `${opts.figureId}_vA`, label: "A(3, -2)", position: { x: 7.4, y: 6.6 } };
  const vB: CanonicalVertexNode = { id: `${opts.figureId}_vB`, label: "B(-4, 4)", position: { x: 1.8, y: 1.8 } };
  const vApX: CanonicalVertexNode = { id: `${opts.figureId}_vApX`, label: "A'(3, 0)", position: { x: 7.4, y: 5 } };
  const vBpX: CanonicalVertexNode = { id: `${opts.figureId}_vBpX`, label: "B'(-4, 0)", position: { x: 1.8, y: 5 } };
  const vApY: CanonicalVertexNode = { id: `${opts.figureId}_vApY`, label: "A''(0, -2)", position: { x: 5, y: 6.6 } };
  const vBpY: CanonicalVertexNode = { id: `${opts.figureId}_vBpY`, label: "B''(0, 4)", position: { x: 5, y: 1.8 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sAxisX`, fromVertexId: vXneg.id, toVertexId: vXpos.id },
    { id: `${opts.figureId}_sAxisY`, fromVertexId: vYneg.id, toVertexId: vYpos.id },
    { id: `${opts.figureId}_sAB`, fromVertexId: vA.id, toVertexId: vB.id },
    { id: `${opts.figureId}_sProjAX`, fromVertexId: vA.id, toVertexId: vApX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjBX`, fromVertexId: vB.id, toVertexId: vBpX.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjAY`, fromVertexId: vA.id, toVertexId: vApY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sProjBY`, fromVertexId: vB.id, toVertexId: vBpY.id, strokeStyle: "dashed" },
    { id: `${opts.figureId}_sLengthX`, fromVertexId: vBpX.id, toVertexId: vApX.id, lengthLabel: { value: "7 وحدات" } },
    { id: `${opts.figureId}_sLengthY`, fromVertexId: vApY.id, toVertexId: vBpY.id, lengthLabel: { value: "6 وحدات" } },
  ];

  return {
    figureId: opts.figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "مسقط القطعة AB على المحورين: المسقط السيني = 7 وحدات، المسقط الصادي = 6 وحدات",
    notationLanguage: notation,
    vertices: [vXneg, vXpos, vYneg, vYpos, vO, vA, vB, vApX, vBpX, vApY, vBpY],
    segments,
    angles: [],
  };
}
