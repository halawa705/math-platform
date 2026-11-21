/**
 * @file explicit-geometry-constraints-types.ts
 * @description عقد القيود الهندسية الصريحة المُمرَّر من المركّب إلى المحسّن العددي (Levenberg-Marquardt)
 * لمنع انحناء الخطوط المستقيمة أو انكسار الزوايا المتقابلة بالرأس أثناء التحسين.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 40 سطراً).
 */

export const MODULE_ID_EXPLICIT_GEOMETRY_CONSTRAINTS_TYPES =
  "explicit_geometry_constraints_types" as const;

export interface CanonicalExplicitGeometryConstraints {
  /** ثلاثيات الرؤوس التي يجب أن تبقى على استقامة واحدة بزاوية 180° عند الرأس الأوسط: [end1VertexId, midVertexId, end2VertexId] */
  readonly collinearTriples: readonly (readonly [string, string, string])[];
  /** أزواج القطع المتوازية الصريحة: [a1VertexId, a2VertexId, b1VertexId, b2VertexId] */
  readonly parallelPairs: readonly (readonly [string, string, string, string])[];
  /** أزواج القطع المتعامدة الصريحة: [a1VertexId, a2VertexId, b1VertexId, b2VertexId] */
  readonly perpendicularPairs: readonly (readonly [string, string, string, string])[];
}
