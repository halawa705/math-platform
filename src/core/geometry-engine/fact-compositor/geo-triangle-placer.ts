/**
 * @file geo-triangle-placer.ts
 * @description يحسب إحداثيات رؤوس مثلث (A,B,C) من المعطيات المتاحة بقواعد ثابتة، ويعيد دائماً مثلثاً صالحاً.
 */
import type { Vec2 } from "./geo-vector-math";

export const MODULE_ID_GEO_TRIANGLE_PLACER = "geo_triangle_placer" as const;
export type TriVertexKey = "A" | "B" | "C";

export interface TriangleKnowns {
  readonly ab?: number; readonly bc?: number; readonly ca?: number;
  readonly angleDeg?: Partial<Record<TriVertexKey, number>>;
  readonly rightAt?: TriVertexKey;
  readonly isoscelesApex?: TriVertexKey;
  readonly equilateral?: boolean;
}
export interface TrianglePoints { readonly A: Vec2; readonly B: Vec2; readonly C: Vec2 }

const DEFAULT_SIDE = 6;
const rad = (d: number) => (d * Math.PI) / 180;

function fromThreeSides(ab: number, bc: number, ca: number): TrianglePoints | null {
  const x = (ab * ab + bc * bc - ca * ca) / (2 * bc);
  const y2 = ab * ab - x * x;
  if (y2 <= 1e-9) return null;
  return { A: { x, y: Math.sqrt(y2) }, B: { x: 0, y: 0 }, C: { x: bc, y: 0 } };
}

function placeRight(at: TriVertexKey, k: TriangleKnowns): TrianglePoints {
  if (at === "B") { const a = k.bc ?? DEFAULT_SIDE; const c = k.ab ?? (k.ca && k.ca > a ? Math.sqrt(k.ca * k.ca - a * a) : a * 0.75); return { A: { x: 0, y: c }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } }; }
  if (at === "A") { const c = k.ab ?? DEFAULT_SIDE * 0.8; const b = k.ca ?? (k.bc && k.bc > c ? Math.sqrt(k.bc * k.bc - c * c) : c * 0.75); return { A: { x: 0, y: 0 }, B: { x: c, y: 0 }, C: { x: 0, y: b } }; }
  const a = k.bc ?? (k.ab && k.ca ? Math.sqrt(Math.max(k.ab * k.ab - k.ca * k.ca, 1)) : DEFAULT_SIDE); const b = k.ca ?? a * 0.75;
  return { A: { x: a, y: b }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } };
}

function placeIsosceles(apex: TriVertexKey, k: TriangleKnowns): TrianglePoints {
  const legs = apex === "A" ? (k.ab ?? k.ca) : apex === "B" ? (k.ab ?? k.bc) : (k.bc ?? k.ca);
  const base = apex === "A" ? k.bc : apex === "B" ? k.ca : k.ab;
  const s = legs ?? DEFAULT_SIDE; const w = base ?? s * 0.8;
  const h = Math.sqrt(Math.max(s * s - (w / 2) ** 2, 0.25));
  const top = { x: w / 2, y: h }; const L = { x: 0, y: 0 }; const R = { x: w, y: 0 };
  return apex === "A" ? { A: top, B: L, C: R } : apex === "B" ? { A: L, B: top, C: R } : { A: L, B: R, C: top };
}

/** يعيد دائماً مثلثاً (أقرب شكل معقول إن كانت المعطيات ناقصة أو متناقضة). */
export function placeTriangleFromKnowns(k: TriangleKnowns): TrianglePoints {
  if (k.ab && k.bc && k.ca) { const t = fromThreeSides(k.ab, k.bc, k.ca); if (t) return t; }
  if (k.equilateral) { const s = k.ab ?? k.bc ?? k.ca ?? DEFAULT_SIDE; return { A: { x: s / 2, y: (s * Math.sqrt(3)) / 2 }, B: { x: 0, y: 0 }, C: { x: s, y: 0 } }; }
  const right = k.rightAt ?? (["A", "B", "C"] as const).find((v) => k.angleDeg?.[v] === 90);
  if (right) return placeRight(right, k);
  if (k.isoscelesApex) return placeIsosceles(k.isoscelesApex, k);
  const ang = k.angleDeg ?? {};
  if (k.ab && k.bc && ang.B) return { A: { x: k.ab * Math.cos(rad(ang.B)), y: k.ab * Math.sin(rad(ang.B)) }, B: { x: 0, y: 0 }, C: { x: k.bc, y: 0 } };
  if (k.ab && k.ca && ang.A) return { A: { x: 0, y: 0 }, B: { x: k.ab, y: 0 }, C: { x: k.ca * Math.cos(rad(ang.A)), y: k.ca * Math.sin(rad(ang.A)) } };
  if (k.bc && k.ca && ang.C) return { A: { x: k.bc - k.ca * Math.cos(rad(ang.C)), y: k.ca * Math.sin(rad(ang.C)) }, B: { x: 0, y: 0 }, C: { x: k.bc, y: 0 } };
  if (ang.B && ang.C && ang.B + ang.C < 179) {
    const a = k.bc ?? DEFAULT_SIDE; const aAng = 180 - ang.B - ang.C; const c = (a * Math.sin(rad(ang.C))) / Math.sin(rad(aAng));
    return { A: { x: c * Math.cos(rad(ang.B)), y: c * Math.sin(rad(ang.B)) }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } };
  }
  const a = k.bc ?? DEFAULT_SIDE; const c = k.ab ?? a * 0.8; const b = k.ca ?? a * 0.9;
  return fromThreeSides(c, a, b) ?? { A: { x: a * 0.4, y: a * 0.8 }, B: { x: 0, y: 0 }, C: { x: a, y: 0 } };
}
