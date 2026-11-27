/**
 * @file rectilinear-composite-orthogonal-builders.ts
 * @description منشئات البنية الهندسية المتعامدة للأشكال المركبة (L، T، T مقلوب، U مقلوب، الدرج) بدون أي تكرار منطقي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 175 سطراً).
 */

import type {
  CanonicalGeometryFigureIR,
  CanonicalSegmentNode,
  CanonicalVertexNode,
} from "../../ssot/geometry-archetype-ssot";
import type { ArabicMathUnit, MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";

export const MODULE_ID_RECTILINEAR_COMPOSITE_ORTHOGONAL_BUILDERS =
  "rectilinear_composite_orthogonal_builders" as const;

export interface RectilinearCompositeOptions {
  readonly figureId: string;
  readonly notationLanguage?: MathNotationLanguage;
}

export function buildPolygonFromCoords(
  coords: readonly (readonly [number, number])[],
  labels: readonly (string | undefined)[],
  u: ArabicMathUnit,
  opts: RectilinearCompositeOptions,
  titleArabic: string,
  prefix: string,
  extra?: {
    readonly divider?: readonly [number, number];
    readonly polygons?: readonly (readonly number[])[];
  }
): CanonicalGeometryFigureIR {
  const notation = opts.notationLanguage || "english";
  const vertices: CanonicalVertexNode[] = coords.map(([x, y], i) => ({
    id: `${opts.figureId}_${prefix}${i}`,
    label: "",
    hideVertexDot: true,
    position: { x, y },
  }));
  const n = vertices.length;
  const segments: CanonicalSegmentNode[] = vertices.map((v, i) => ({
    id: `${opts.figureId}_s${prefix}${i}`,
    fromVertexId: v.id,
    toVertexId: vertices[(i + 1) % n].id,
    lengthLabel: labels[i] !== undefined ? { value: `${labels[i]} ${u}`.trim() } : undefined,
  }));
  if (extra?.divider) {
    segments.push({
      id: `${opts.figureId}_s${prefix}div`,
      fromVertexId: vertices[extra.divider[0]].id,
      toVertexId: vertices[extra.divider[1]].id,
      strokeStyle: "dashed",
    });
  }
  const polygons = extra?.polygons
    ? extra.polygons.map((grp) => grp.map((idx) => vertices[idx].id))
    : [vertices.map((v) => v.id)];

  return {
    figureId: opts.figureId,
    familyId: "quadrilateral_family",
    branchId: "quad_composite_rectilinear_shape",
    titleArabic,
    notationLanguage: notation,
    vertices,
    segments,
    angles: [],
    polygons,
  };
}

export function buildRectilinearLShapeFigure(
  params: { wTotal: number | string; hTotal: number | string; wTop: number | string; hBase: number | string; wStep?: number | string; hStep?: number | string; unit: ArabicMathUnit },
  opts: RectilinearCompositeOptions
): CanonicalGeometryFigureIR {
  return buildPolygonFromCoords(
    [[1.5, 1.5], [8.5, 1.5], [8.5, 3.5], [4.8, 3.5], [4.8, 8.5], [1.5, 8.5]],
    [`${params.wTotal}`, `${params.hBase}`, params.wStep !== undefined ? `${params.wStep}` : undefined, params.hStep !== undefined ? `${params.hStep}` : undefined, `${params.wTop}`, `${params.hTotal}`],
    params.unit,
    opts,
    `شكل مركب حرف L لحساب المحيط والمساحة وإيجاد المجهول (${params.unit})`,
    "l"
  );
}

export function buildRectilinearTShapeFigure(
  params: { wTop: number | string; hTop: number | string; wStem: number | string; hStem: number | string; wLeftArm?: number | string; wRightArm?: number | string; unit: ArabicMathUnit },
  opts: RectilinearCompositeOptions
): CanonicalGeometryFigureIR {
  return buildPolygonFromCoords(
    [[1.2, 8.5], [8.8, 8.5], [8.8, 6.8], [6.4, 6.8], [6.4, 1.5], [3.6, 1.5], [3.6, 6.8], [1.2, 6.8]],
    [`${params.wTop}`, `${params.hTop}`, params.wRightArm !== undefined ? `${params.wRightArm}` : undefined, `${params.hStem}`, `${params.wStem}`, `${params.hStem}`, params.wLeftArm !== undefined ? `${params.wLeftArm}` : undefined, `${params.hTop}`],
    params.unit,
    opts,
    `شكل مركب حرف T (${params.wTop} ${params.unit})`,
    "t"
  );
}

export function buildRectilinearInvertedTShapeFigure(
  params: { wBase: number | string; hBase: number | string; wCol: number | string; hCol: number | string; wStep?: number | string; unit: ArabicMathUnit },
  opts: RectilinearCompositeOptions
): CanonicalGeometryFigureIR {
  return buildPolygonFromCoords(
    [[1.2, 1.5], [8.8, 1.5], [8.8, 3.5], [6.2, 3.5], [6.2, 8.5], [3.8, 8.5], [3.8, 3.5], [1.2, 3.5]],
    [`${params.wBase}`, `${params.hBase}`, params.wStep !== undefined ? `${params.wStep}` : undefined, `${params.hCol}`, `${params.wCol}`, `${params.hCol}`, params.wStep !== undefined ? `${params.wStep}` : undefined, `${params.hBase}`],
    params.unit,
    opts,
    `شكل مركب حرف T مقلوب (${params.wBase} ${params.unit})`,
    "it"
  );
}

export function buildRectilinearInvertedUShapeFigure(
  params: { wTop: number | string; hTotal: number | string; wFoot: number | string; hCavity: number | string; wCavity?: number | string; hLeft?: number | string; unit: ArabicMathUnit },
  opts: RectilinearCompositeOptions
): CanonicalGeometryFigureIR {
  return buildPolygonFromCoords(
    [[1.5, 1.5], [4.2, 1.5], [4.2, 4.8], [5.8, 4.8], [5.8, 1.5], [8.5, 1.5], [8.5, 8.5], [1.5, 8.5]],
    [`${params.wFoot}`, `${params.hCavity}`, params.wCavity !== undefined ? `${params.wCavity}` : undefined, `${params.hCavity}`, `${params.wFoot}`, `${params.hTotal}`, `${params.wTop}`, `${params.hLeft ?? params.hTotal}`],
    params.unit,
    opts,
    `شكل قوس مجوف U مقلوب (${params.wTop} ${params.unit})`,
    "u"
  );
}

export function buildRectilinearAdjacentRectanglesFigure(
  params: { w1: number | string; h1: number | string; w2: number | string; h2: number | string; unit: ArabicMathUnit },
  opts: RectilinearCompositeOptions
): CanonicalGeometryFigureIR {
  const nW1 = typeof params.w1 === "number" ? params.w1 : 5;
  const nH1 = typeof params.h1 === "number" ? params.h1 : 5;
  const nW2 = typeof params.w2 === "number" ? params.w2 : 3;
  const nH2 = typeof params.h2 === "number" ? params.h2 : 3;
  const totW = Math.max(nW1 + nW2, 1);
  const maxH = Math.max(nH1, nH2, 1);
  const wRatio = Math.max(0.32, Math.min(0.68, nW1 / totW));
  const xMid = Number((1.5 + 7.0 * wRatio).toFixed(2));
  const yTop1 = Number((1.5 + 6.8 * Math.max(0.38, Math.min(1, nH1 / maxH))).toFixed(2));
  const yTop2 = Number((1.5 + 6.8 * Math.max(0.38, Math.min(1, nH2 / maxH))).toFixed(2));

  return buildPolygonFromCoords(
    [[1.5, 1.5], [xMid, 1.5], [8.5, 1.5], [8.5, yTop2], [xMid, yTop2], [xMid, yTop1], [1.5, yTop1]],
    [undefined, undefined, `${params.h2}`, `${params.w2}`, undefined, `${params.w1}`, `${params.h1}`],
    params.unit,
    opts,
    `شكل مركب من مستطيلين ملتصقين (${params.w1}×${params.h1} و ${params.w2}×${params.h2} ${params.unit})`,
    "ar",
    { divider: [1, nH1 >= nH2 ? 4 : 5], polygons: [[0, 1, 4, 5, 6], [1, 2, 3, 4]] }
  );
}
