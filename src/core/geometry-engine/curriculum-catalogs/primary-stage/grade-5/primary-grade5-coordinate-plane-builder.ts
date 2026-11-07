/**
 * @file primary-grade5-coordinate-plane-builder.ts
 * @description مستوى إحداثي للصف الخامس الابتدائي (الربع الأول): يرسم المحورين وشبكة تربيعية والنقاط المعطاة بالأعداد
 * من المسألة نفسها (أ(3 ، 5) ...) مع مساقط منقطة على المحورين، ويصل النقاط بالترتيب عند ذكر مثلث/مستطيل/مضلع.
 * لا يخمّن أي نقطة: بلا نقاط صريحة لا يُرسم شيء.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 140 سطراً).
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

export const MODULE_ID_PRIMARY_GRADE5_COORDINATE_PLANE_BUILDER =
  "primary_grade5_coordinate_plane_builder" as const;

export interface Grade5CoordinatePoint {
  readonly letterAr: string;
  readonly x: number;
  readonly y: number;
}

const POINT_RE = /([أ-ي])ـ?\s*\(\s*(\d+(?:\.\d+)?)\s*[,،]\s*(\d+(?:\.\d+)?)\s*\)/g;

/** يستخرج النقاط ذات الحروف العربية والإحداثيات غير السالبة؛ يعيد [] إن لم توجد. */
export function parseGrade5CoordinatePoints(text: string): Grade5CoordinatePoint[] {
  const points: Grade5CoordinatePoint[] = [];
  for (const m of text.matchAll(POINT_RE)) {
    points.push({ letterAr: m[1] === "ج" ? "جـ" : m[1] === "ه" ? "هـ" : m[1], x: Number(m[2]), y: Number(m[3]) });
  }
  return points;
}

export function buildGrade5CoordinatePlaneFigure(
  points: readonly Grade5CoordinatePoint[],
  closeShape: boolean,
  figureId: string,
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR {
  const notation = notationLanguage;
  const maxX = Math.max(...points.map((p) => p.x)) + 1.5;
  const maxY = Math.max(...points.map((p) => p.y)) + 1.5;

  const vO: CanonicalVertexNode = { id: `${figureId}_vO`, label: localizeGeometricVertexLabelSSOT("و", notation), position: { x: 0, y: 0 } };
  const vX: CanonicalVertexNode = { id: `${figureId}_vX`, label: notation === "english" ? "x" : "س", position: { x: maxX, y: 0 } };
  const vY: CanonicalVertexNode = { id: `${figureId}_vY`, label: notation === "english" ? "y" : "ص", position: { x: 0, y: maxY } };

  const pointVertices: CanonicalVertexNode[] = points.map((p, i) => ({
    id: `${figureId}_p${i}`,
    label: `${localizeGeometricVertexLabelSSOT(p.letterAr, notation)}(${p.x}, ${p.y})`,
    position: { x: p.x, y: p.y },
  }));

  const feet: CanonicalVertexNode[] = [];
  const segments: CanonicalSegmentNode[] = [
    { id: `${figureId}_axisX`, fromVertexId: vO.id, toVertexId: vX.id, arrowAtEnd: true },
    { id: `${figureId}_axisY`, fromVertexId: vO.id, toVertexId: vY.id, arrowAtEnd: true },
  ];

  // مساقط منقطة على المحورين عند نقطة واحدة أو شكل صغير (≤ 4 نقاط) لتسهيل قراءة الإحداثيين
  if (points.length <= 4) {
    pointVertices.forEach((pv, i) => {
      const p = points[i];
      if (p.x > 0) {
        const fx: CanonicalVertexNode = { id: `${figureId}_fx${i}`, label: "", hideVertexDot: true, position: { x: p.x, y: 0 } };
        feet.push(fx);
        segments.push({ id: `${figureId}_dx${i}`, fromVertexId: pv.id, toVertexId: fx.id, strokeStyle: "dashed" });
      }
      if (p.y > 0) {
        const fy: CanonicalVertexNode = { id: `${figureId}_fy${i}`, label: "", hideVertexDot: true, position: { x: 0, y: p.y } };
        feet.push(fy);
        segments.push({ id: `${figureId}_dy${i}`, fromVertexId: pv.id, toVertexId: fy.id, strokeStyle: "dashed" });
      }
    });
  }

  if (points.length >= 2) {
    const last = closeShape && points.length >= 3 ? points.length : points.length - 1;
    for (let i = 0; i < last; i++) {
      const a = pointVertices[i];
      const b = pointVertices[(i + 1) % points.length];
      segments.push({ id: `${figureId}_s${i}`, fromVertexId: a.id, toVertexId: b.id });
    }
  }

  return {
    figureId,
    familyId: "analytic_coordinate_family",
    branchId: "triangle_base_general",
    titleArabic: "المستوى الإحداثي: تعيين النقاط وقراءة الإحداثيات",
    notationLanguage: notation,
    coordinateGrid: { enabled: true },
    vertices: [vO, vX, vY, ...pointVertices, ...feet],
    segments,
    angles: [],
  };
}
