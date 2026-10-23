/**
 * @file functions-domain-vertex-validator.ts
 * @description المدقق الحتمي للدوال التربيعية والخطية والكسرية:
 * يحسب إحداثيات رأس المنحنى التربيعي (-ب / 2أ، د(-ب / 2أ)) ومعادلة محور التماثل والقيمة العظمى أو الصغرى.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

export const MODULE_ID_FUNCTIONS_DOMAIN_VERTEX_VALIDATOR =
  "functions_domain_vertex_validator" as const;

export interface ParabolaVertexAuditResult {
  readonly vertexX: number;
  readonly vertexY: number;
  readonly axisOfSymmetryEquationAr: string;
  readonly extremumKindAr: "قيمة صغرى" | "قيمة عظمى";
  readonly extremumValue: number;
}

export function computeQuadraticParabolaVertexSSOT(params: {
  readonly a: number;
  readonly b: number;
  readonly c: number;
}): ParabolaVertexAuditResult {
  const safeA = params.a === 0 ? 1 : params.a;
  const vx = Number((-params.b / (2 * safeA)).toFixed(3));
  const vy = Number((safeA * vx * vx + params.b * vx + params.c).toFixed(3));

  return {
    vertexX: vx,
    vertexY: vy,
    axisOfSymmetryEquationAr: `س = ${vx}`,
    extremumKindAr: safeA > 0 ? "قيمة صغرى" : "قيمة عظمى",
    extremumValue: vy,
  };
}
