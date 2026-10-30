/**
 * @file question-figure-box-size.ts
 * @description يحسب مقاس صندوق الشكل بجوار السؤال بحسب نسبة أبعاد الشكل ومعامل التحجيم (figureScale) وعدد الأعمدة.
 */
export const MODULE_ID_QUESTION_FIGURE_BOX_SIZE = "question_figure_box_size" as const;

export interface FigureBoxSizePx {
  readonly boxWidthPx: number;
  readonly boxHeightPx: number;
  readonly svgWidthPx: number;
  readonly svgHeightPx: number;
}

const BASE_AREA_PX2 = 146 * 102; // مساحة الرسم الحالية (146×102) عند figureScale = 1
const BOX_PADDING_PX = 6;

/** @param aspect العرض ÷ الارتفاع للشكل (يُقصّ بين 0.6 و 2.6). */
export function computeFigureBoxSizePx(params: {
  readonly aspect: number;
  readonly figureScale: number;
  readonly columnsCount: 1 | 2;
}): FigureBoxSizePx {
  const aspect = Math.min(2.6, Math.max(0.6, Number.isFinite(params.aspect) ? params.aspect : 1.4));
  const scale = Math.min(1.6, Math.max(0.6, params.figureScale));
  const maxW = params.columnsCount === 2 ? 190 : 260;
  const area = BASE_AREA_PX2 * scale * scale;
  let w = Math.sqrt(area * aspect);
  let h = w / aspect;
  if (w > maxW) { w = maxW; h = w / aspect; }
  if (h > 170) { h = 170; w = h * aspect; }
  if (w < 84) { w = 84; h = w / aspect; }
  const svgWidthPx = Math.round(w);
  const svgHeightPx = Math.round(h);
  return { boxWidthPx: svgWidthPx + BOX_PADDING_PX, boxHeightPx: svgHeightPx + BOX_PADDING_PX, svgWidthPx, svgHeightPx };
}

/** نسبة أبعاد شكل من إحداثيات رؤوسه (عرض ÷ ارتفاع). */
export function computeFigureAspectFromVertices(vertices: readonly { readonly position: { readonly x: number; readonly y: number } }[]): number {
  if (vertices.length === 0) return 1.4;
  const xs = vertices.map((v) => v.position.x);
  const ys = vertices.map((v) => v.position.y);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  return w / Math.max(h, 1e-6);
}
