/**
 * @file geo-vector-math.ts
 * @description عمليات متجهات ثنائية البعد النقية للمركّب الهندسي.
 */
export const MODULE_ID_GEO_VECTOR_MATH = "geo_vector_math" as const;

export interface Vec2 { readonly x: number; readonly y: number }

export const vAdd = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const vSub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const vScale = (a: Vec2, k: number): Vec2 => ({ x: a.x * k, y: a.y * k });
const vDot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const vLen = (a: Vec2): number => Math.hypot(a.x, a.y);
export const vDist = (a: Vec2, b: Vec2): number => vLen(vSub(a, b));
/** نقطة على القطعة a→b عند النسبة t (0 = a ، 1 = b). */
export const vLerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
export const vMid = (a: Vec2, b: Vec2): Vec2 => vLerp(a, b, 0.5);

/** مسقط النقطة p على المستقيم المار بـ a و b. */
export function footOfPerpendicular(p: Vec2, a: Vec2, b: Vec2): Vec2 {
  const ab = vSub(b, a);
  const len2 = vDot(ab, ab) || 1;
  const t = vDot(vSub(p, a), ab) / len2;
  return vLerp(a, b, t);
}

/** تقاطع مستقيمين (p1p2) و (p3p4)؛ يعيد null إن كانا متوازيين. */
export function lineIntersection(p1: Vec2, p2: Vec2, p3: Vec2, p4: Vec2): Vec2 | null {
  const d1 = vSub(p2, p1);
  const d2 = vSub(p4, p3);
  const den = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((p3.x - p1.x) * d2.y - (p3.y - p1.y) * d2.x) / den;
  return vLerp(p1, p2, t);
}

/** قدم منصف الزاوية عند a على الضلع المقابل bc (نظرية المنصف: bd/dc = ab/ac). */
export function angleBisectorFoot(a: Vec2, b: Vec2, c: Vec2): Vec2 {
  const ab = vDist(a, b);
  const ac = vDist(a, c);
  return vLerp(b, c, ab / (ab + ac || 1));
}
