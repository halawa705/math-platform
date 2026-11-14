/**
 * @file svg-label-collision-layout-solver.ts
 * @description محرك منع التداخل ثنائي الأبعاد لتسميات الأشكال الهندسية (SVG Label Collision Solver):
 * - يختار اتجاه الإزاحة الخارجي الصحيح بعيداً عن الأضلاع الداخلية والعلامات وأقواس الزوايا.
 * - يحوّل الأطوال المركبة المتداخلة إلى أقواس أبعاد خارجية (Dimension Brackets) واضحة.
 * - ينقل شارات المحيط/المساحة للخارج تلقائياً إذا ضاق المضلع، ويوسّع viewBox دون أي قص.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 280 سطراً).
 */

export const MODULE_ID_SVG_LABEL_COLLISION_LAYOUT_SOLVER =
  "svg_label_collision_layout_solver" as const;

export interface ScreenBox { readonly minX: number; readonly minY: number; readonly maxX: number; readonly maxY: number }
export interface PlacedPointLike { readonly sx: number; readonly sy: number }
export interface ScreenSegmentObstacle {
  readonly fromId: string; readonly toId: string;
  readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number;
  readonly hasMidDecor?: boolean; readonly isCompositeSpan?: boolean;
}
export const createCenteredBox = (cx: number, cy: number, w: number, h: number): ScreenBox => ({
  minX: cx - w / 2, minY: cy - h / 2, maxX: cx + w / 2, maxY: cy + h / 2,
});

export function boxOverlapArea(a: ScreenBox, b: ScreenBox, pad = 2): number {
  const ox = Math.min(a.maxX + pad, b.maxX + pad) - Math.max(a.minX - pad, b.minX - pad);
  const oy = Math.min(a.maxY + pad, b.maxY + pad) - Math.max(a.minY - pad, b.minY - pad);
  return ox > 0 && oy > 0 ? ox * oy : 0;
}

function pointToSegmentDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 < 1e-6) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function segmentIntersectsBox(
  seg: ScreenSegmentObstacle,
  box: ScreenBox,
  clearance = 2.5
): boolean {
  const bMinX = box.minX - clearance;
  const bMaxX = box.maxX + clearance;
  const bMinY = box.minY - clearance;
  const bMaxY = box.maxY + clearance;
  if (
    Math.max(seg.x1, seg.x2) < bMinX ||
    Math.min(seg.x1, seg.x2) > bMaxX ||
    Math.max(seg.y1, seg.y2) < bMinY ||
    Math.min(seg.y1, seg.y2) > bMaxY
  ) {
    return false;
  }
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  const hw = (box.maxX - box.minX) / 2 + clearance;
  const hh = (box.maxY - box.minY) / 2 + clearance;
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const px = seg.x1 + (seg.x2 - seg.x1) * t;
    const py = seg.y1 + (seg.y2 - seg.y1) * t;
    if (Math.abs(px - cx) <= hw && Math.abs(py - cy) <= hh) return true;
  }
  return false;
}

function scoreCandidateBox(
  box: ScreenBox,
  occupiedBoxes: readonly ScreenBox[],
  segments: readonly ScreenSegmentObstacle[],
  preferBounds?: { width: number; height: number }
): number {
  let cost = 0;
  for (const ob of occupiedBoxes) {
    const area = boxOverlapArea(box, ob, 1.5);
    if (area > 0) cost += 800 + area * 12;
  }
  for (const seg of segments) {
    if (seg.isCompositeSpan) continue;
    if (segmentIntersectsBox(seg, box, 2)) cost += 350;
  }
  if (preferBounds) {
    if (box.minX < 2 || box.maxX > preferBounds.width - 2) cost += 25;
    if (box.minY < 2 || box.maxY > preferBounds.height - 2) cost += 25;
  }
  return cost;
}

export function isCompositeCollinearSpan(
  fromId: string,
  toId: string,
  p1: PlacedPointLike,
  p2: PlacedPointLike,
  allVertices: Iterable<{ id: string; screen: PlacedPointLike }>
): boolean {
  const dx = p2.sx - p1.sx;
  const dy = p2.sy - p1.sy;
  const len = Math.hypot(dx, dy);
  if (len < 12) return false;
  for (const v of allVertices) {
    if (v.id === fromId || v.id === toId) continue;
    const t = ((v.screen.sx - p1.sx) * dx + (v.screen.sy - p1.sy) * dy) / (len * len);
    if (t <= 0.08 || t >= 0.92) continue;
    const perp = pointToSegmentDist(v.screen.sx, v.screen.sy, p1.sx, p1.sy, p2.sx, p2.sy);
    if (perp <= 3.5) return true;
  }
  return false;
}

export function solveVertexLabelPlacement(params: {
  sx: number; sy: number; label: string; centerSx: number; centerSy: number; isRayTip: boolean;
  occupiedBoxes: ScreenBox[]; segments: readonly ScreenSegmentObstacle[]; bounds: { width: number; height: number };
}): { lx: number; ly: number; box: ScreenBox } {
  const { sx, sy, label, centerSx, centerSy, isRayTip, occupiedBoxes, segments, bounds } = params;
  const baseAngle = Math.atan2(sy - centerSy, sx - centerSx);
  const textW = Math.max(11, label.length * 6.4);
  const textH = 11.5;
  const radii = isRayTip ? [11.5, 15] : [10, 13.5, 16.5];
  const angleOffsets = [0, 0.45, -0.45, 0.9, -0.9, 1.4, -1.4, Math.PI / 2, -Math.PI / 2, Math.PI];

  let best = { lx: sx + Math.cos(baseAngle) * radii[0], ly: sy + Math.sin(baseAngle) * radii[0] + 3.2, cost: Infinity, box: createCenteredBox(sx, sy, textW, textH) };
  for (const r of radii) {
    for (let ai = 0; ai < angleOffsets.length; ai++) {
      const a = baseAngle + angleOffsets[ai];
      const cx = sx + Math.cos(a) * r;
      const cy = sy + Math.sin(a) * r;
      const box = createCenteredBox(cx, cy, textW, textH);
      const cost = scoreCandidateBox(box, occupiedBoxes, segments, bounds) + (r - radii[0]) * 4 + ai * 1.5;
      if (cost < best.cost) {
        best = { lx: cx, ly: cy + 3.2, cost, box };
        if (cost === 0) { occupiedBoxes.push(box); return { lx: best.lx, ly: best.ly, box }; }
      }
    }
  }
  occupiedBoxes.push(best.box);
  return { lx: best.lx, ly: best.ly, box: best.box };
}

export function solveSegmentPillOrBracketPlacement(params: {
  seg: ScreenSegmentObstacle; textStr: string; centerSx: number; centerSy: number;
  occupiedBoxes: ScreenBox[]; allSegments: readonly ScreenSegmentObstacle[]; bounds: { width: number; height: number };
}): {
  mode: "pill" | "bracket"; lx: number; ly: number; pillW: number; box: ScreenBox;
  bracket?: { x1: number; y1: number; x2: number; y2: number; nx: number; ny: number; offset: number };
} {
  const { seg, textStr, centerSx, centerSy, occupiedBoxes, allSegments, bounds } = params;
  const dx = seg.x2 - seg.x1;
  const dy = seg.y2 - seg.y1;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  const midX = (seg.x1 + seg.x2) / 2;
  const midY = (seg.y1 + seg.y2) / 2;
  if ((midX - centerSx) * nx + (midY - centerSy) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }

  const pillW = Math.max(textStr.length * 5.3 + 7, 18);
  const pillH = 11.5;

  if (seg.isCompositeSpan) {
    const offsets = [20, 26, -20, -26, 33];
    const ts = [0.5, 0.35, 0.65];
    let best = { lx: midX + nx * 20, ly: midY + ny * 20 + 2.8, offset: 20, cost: Infinity, box: createCenteredBox(midX, midY, pillW, pillH) };
    for (const off of offsets) {
      for (const t of ts) {
        const bx = seg.x1 + dx * t + nx * off;
        const by = seg.y1 + dy * t + ny * off;
        const box = createCenteredBox(bx, by, pillW, pillH);
        const signPenalty = off < 0 ? 40 : 0;
        const cost = scoreCandidateBox(box, occupiedBoxes, allSegments, bounds) + Math.abs(off) * 0.8 + signPenalty + Math.abs(t - 0.5) * 18;
        if (cost < best.cost) {
          best = { lx: bx, ly: by + 2.8, offset: off, cost, box };
        }
      }
    }
    occupiedBoxes.push(best.box);
    const sgn = best.offset >= 0 ? 1 : -1;
    return {
      mode: "bracket",
      lx: best.lx,
      ly: best.ly,
      pillW,
      box: best.box,
      bracket: { x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2, nx: nx * sgn, ny: ny * sgn, offset: Math.abs(best.offset) },
    };
  }

  const tList = seg.hasMidDecor ? [0.33, 0.67, 0.5, 0.25, 0.75, 0.4, 0.6] : [0.5, 0.35, 0.65, 0.26, 0.74, 0.42, 0.58];
  const distList = [9, 13, 17, 22, -10, -14];
  let best = { lx: midX + nx * 9, ly: midY + ny * 9 + 2.8, cost: Infinity, box: createCenteredBox(midX, midY, pillW, pillH) };

  for (let di = 0; di < distList.length; di++) {
    const dist = distList[di];
    for (let ti = 0; ti < tList.length; ti++) {
      const t = tList[ti];
      const cx = seg.x1 + dx * t + nx * dist;
      const cy = seg.y1 + dy * t + ny * dist;
      const box = createCenteredBox(cx, cy, pillW, pillH);
      const prefPenalty = (dist < 0 ? 45 : 0) + di * 6 + ti * 3;
      const cost = scoreCandidateBox(box, occupiedBoxes, allSegments, bounds) + prefPenalty;
      if (cost < best.cost) {
        best = { lx: cx, ly: cy + 2.8, cost, box };
      }
    }
  }
  occupiedBoxes.push(best.box);
  return { mode: "pill", lx: best.lx, ly: best.ly, pillW, box: best.box };
}

export function solveInteriorBadgePlacement(params: {
  targetCx: number; targetCy: number; badgeW: number; badgeH: number;
  geomBounds: ScreenBox; occupiedBoxes: ScreenBox[]; allSegments: readonly ScreenSegmentObstacle[];
}): { cx: number; cy: number; box: ScreenBox } {
  const { targetCx, targetCy, badgeW, badgeH, geomBounds, occupiedBoxes, allSegments } = params;
  const centerBox = createCenteredBox(targetCx, targetCy, badgeW, badgeH);
  if (scoreCandidateBox(centerBox, occupiedBoxes, allSegments) === 0) {
    occupiedBoxes.push(centerBox);
    return { cx: targetCx, cy: targetCy, box: centerBox };
  }
  const midX = (geomBounds.minX + geomBounds.maxX) / 2;
  const maxObsY = occupiedBoxes.reduce((m, b) => (b.minY > geomBounds.maxY - 6 ? Math.max(m, b.maxY) : m), geomBounds.maxY);
  const minObsY = occupiedBoxes.reduce((m, b) => (b.maxY < geomBounds.minY + 6 ? Math.min(m, b.minY) : m), geomBounds.minY);
  const candidates = [
    { cx: midX, cy: maxObsY + badgeH / 2 + 5 },
    { cx: midX, cy: geomBounds.maxY + 28 },
    { cx: midX, cy: minObsY - badgeH / 2 - 5 },
  ];
  let best = { cx: midX, cy: maxObsY + badgeH / 2 + 5, cost: Infinity, box: centerBox };
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const box = createCenteredBox(c.cx, c.cy, badgeW, badgeH);
    const cost = scoreCandidateBox(box, occupiedBoxes, allSegments) + i * 5;
    if (cost < best.cost) best = { cx: c.cx, cy: c.cy, cost, box };
  }
  occupiedBoxes.push(best.box);
  return { cx: best.cx, cy: best.cy, box: best.box };
}

export function computeExpandedSvgViewBox(params: {
  baseWidth: number; baseHeight: number; points: Iterable<PlacedPointLike>; boxes: readonly ScreenBox[];
}): { minX: number; minY: number; width: number; height: number } {
  let minX = 0;
  let minY = 0;
  let maxX = params.baseWidth;
  let maxY = params.baseHeight;
  for (const p of params.points) {
    if (p.sx < 2) minX = Math.min(minX, p.sx - 6);
    if (p.sx > params.baseWidth - 2) maxX = Math.max(maxX, p.sx + 6);
    if (p.sy < 2) minY = Math.min(minY, p.sy - 6);
    if (p.sy > params.baseHeight - 2) maxY = Math.max(maxY, p.sy + 6);
  }
  for (const b of params.boxes) {
    if (b.minX < 2) minX = Math.min(minX, b.minX - 4);
    if (b.maxX > params.baseWidth - 2) maxX = Math.max(maxX, b.maxX + 4);
    if (b.minY < 2) minY = Math.min(minY, b.minY - 4);
    if (b.maxY > params.baseHeight - 2) maxY = Math.max(maxY, b.maxY + 4);
  }
  return {
    minX: Number(minX.toFixed(1)),
    minY: Number(minY.toFixed(1)),
    width: Number((maxX - minX).toFixed(1)),
    height: Number((maxY - minY).toFixed(1)),
  };
}
