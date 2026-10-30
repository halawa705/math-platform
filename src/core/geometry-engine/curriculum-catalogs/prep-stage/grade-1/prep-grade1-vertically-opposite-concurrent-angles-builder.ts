/**
 * @file prep-grade1-vertically-opposite-concurrent-angles-builder.ts
 * @description منشئ أشكال الزوايا المتقابلة بالرأس والزوايا المتجمعة حول نقطة (360°) وانعكاس الكرة (1ع).
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

export interface PrepGrade1VerticallyOppositeOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

/**
 * مسألة 13-5 ص 164: زاويتان متقابلتان بالرأس (2X+26)° = (3X-21)° لحساب قيمة X = 47°
 */
export function buildVerticallyOppositeAnglesAlgebraicFigure(
  opts: PrepGrade1VerticallyOppositeOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 5, y: 5 } };
  const v1: CanonicalVertexNode = { id: `${opts.figureId}_v1`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 1.5, y: 3.5 } };
  const v2: CanonicalVertexNode = { id: `${opts.figureId}_v2`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 8.5, y: 6.5 } };
  const v3: CanonicalVertexNode = { id: `${opts.figureId}_v3`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 2, y: 7.5 } };
  const v4: CanonicalVertexNode = { id: `${opts.figureId}_v4`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 8, y: 2.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sLine1`, fromVertexId: v1.id, toVertexId: v2.id },
    { id: `${opts.figureId}_sLine2`, fromVertexId: v3.id, toVertexId: v4.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_hourglass_butterfly_similarity",
    titleArabic: "زاويتان متقابلتان بالرأس (2X+26)° = (3X-21)° لإيجاد X = 47°",
    notationLanguage: notation,
    vertices: [vO, v1, v2, v3, v4],
    segments,
    angles: [
      { id: `${opts.figureId}_angTop`, vertexId: vO.id, arm1VertexId: v3.id, arm2VertexId: v2.id, degreesLabel: "(2X+26)°" },
      { id: `${opts.figureId}_angBot`, vertexId: vO.id, arm1VertexId: v1.id, arm2VertexId: v4.id, degreesLabel: "(3X-21)°" },
    ],
  };
}

/**
 * مسألة 10 ص 164: خط مستقيم O ∈ XN ومنصف OM للزاوية NOZ وزاوية YOX = 50° لحساب MOX = 160°
 */
export function buildStraightLineBisectedAngleNOZFigure(
  opts: PrepGrade1VerticallyOppositeOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 5, y: 2 } };
  const vX: CanonicalVertexNode = { id: `${opts.figureId}_vX`, label: notation === "english" ? "X" : "س", position: { x: 9, y: 2 } };
  const vN: CanonicalVertexNode = { id: `${opts.figureId}_vN`, label: notation === "english" ? "N" : "ن", position: { x: 1, y: 2 } };
  const vY: CanonicalVertexNode = { id: `${opts.figureId}_vY`, label: notation === "english" ? "Y" : "ص", position: { x: 7.5, y: 6.5 } };
  const vZ: CanonicalVertexNode = { id: `${opts.figureId}_vZ`, label: notation === "english" ? "Z" : "ع", position: { x: 2.5, y: 6.5 } };
  const vM: CanonicalVertexNode = { id: `${opts.figureId}_vM`, label: notation === "english" ? "M" : "م", position: { x: 1.5, y: 4.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sNX`, fromVertexId: vN.id, toVertexId: vX.id },
    { id: `${opts.figureId}_sOY`, fromVertexId: vO.id, toVertexId: vY.id },
    { id: `${opts.figureId}_sOZ`, fromVertexId: vO.id, toVertexId: vZ.id },
    { id: `${opts.figureId}_sOM`, fromVertexId: vO.id, toVertexId: vM.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_interior_exterior_bisector",
    titleArabic: "خط مستقيم ومنصف OM للزاوية NOZ مع زاوية YOX = 50° لحساب زاوية MOX = 160°",
    notationLanguage: notation,
    vertices: [vN, vO, vX, vY, vZ, vM],
    segments,
    angles: [
      { id: `${opts.figureId}_angYOX`, vertexId: vO.id, arm1VertexId: vX.id, arm2VertexId: vY.id, degrees: 50, degreesLabel: "50°" },
      { id: `${opts.figureId}_angNOM`, vertexId: vO.id, arm1VertexId: vN.id, arm2VertexId: vM.id, arcCount: 1 },
      { id: `${opts.figureId}_angMOZ`, vertexId: vO.id, arm1VertexId: vM.id, arm2VertexId: vZ.id, arcCount: 1 },
    ],
  };
}

/**
 * مسألة 15 ص 165: ارتطام كرة الإسكواش بالحائط بزاوية 50° وزاويتين متساويتين (4X+21)° و (6X-1)° لحساب X = 11 والزاوية 65°
 */
export function buildSquashBallWallReboundFigure(
  opts: PrepGrade1VerticallyOppositeOptions
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";

  const vO: CanonicalVertexNode = { id: `${opts.figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 5, y: 5 } };
  const vWallTop: CanonicalVertexNode = { id: `${opts.figureId}_vWT`, label: localizeGeometricVertexLabelSSOT("أ", notation), position: { x: 5, y: 9 } };
  const vWallBot: CanonicalVertexNode = { id: `${opts.figureId}_vWB`, label: localizeGeometricVertexLabelSSOT("ب", notation), position: { x: 5, y: 1 } };
  const vIn: CanonicalVertexNode = { id: `${opts.figureId}_vIn`, label: localizeGeometricVertexLabelSSOT("جـ", notation), position: { x: 1, y: 7.5 } };
  const vOut: CanonicalVertexNode = { id: `${opts.figureId}_vOut`, label: localizeGeometricVertexLabelSSOT("د", notation), position: { x: 1, y: 2.5 } };

  const segments: CanonicalSegmentNode[] = [
    { id: `${opts.figureId}_sWall`, fromVertexId: vWallTop.id, toVertexId: vWallBot.id, strokeStyle: "solid" },
    { id: `${opts.figureId}_sIn`, fromVertexId: vIn.id, toVertexId: vO.id },
    { id: `${opts.figureId}_sOut`, fromVertexId: vO.id, toVertexId: vOut.id },
  ];

  return {
    figureId: opts.figureId,
    familyId: "triangle_family",
    branchId: "triangle_exterior_angle_extension",
    titleArabic: "ارتطام كرة الإسكواش بالحائط بزاوية 50° وزاويتين (4X+21)° و (6X-1)° لحساب X = 11 والزاوية 65°",
    notationLanguage: notation,
    vertices: [vWallTop, vO, vWallBot, vIn, vOut],
    segments,
    angles: [
      { id: `${opts.figureId}_angBounce`, vertexId: vO.id, arm1VertexId: vIn.id, arm2VertexId: vOut.id, degrees: 50, degreesLabel: "50°" },
      { id: `${opts.figureId}_angTop`, vertexId: vO.id, arm1VertexId: vWallTop.id, arm2VertexId: vIn.id, degreesLabel: "(4X+21)°" },
      { id: `${opts.figureId}_angBot`, vertexId: vO.id, arm1VertexId: vOut.id, arm2VertexId: vWallBot.id, degreesLabel: "(6X-1)°" },
    ],
  };
}
