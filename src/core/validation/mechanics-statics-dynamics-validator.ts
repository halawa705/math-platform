/**
 * @file mechanics-statics-dynamics-validator.ts
 * @description المدقق الحتمي للاستاتيكا والديناميكا:
 * يحسب محصلة قوتين متلاقيتين في نقطة ح = √(ق1² + ق2² + 2 ق1 ق2 جتا ي) ومعادلات الحركة بعجلة منتظمة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

export const MODULE_ID_MECHANICS_STATICS_DYNAMICS_VALIDATOR =
  "mechanics_statics_dynamics_validator" as const;

export function computeTwoForcesResultantMagnitude(params: {
  readonly force1Newton: number;
  readonly force2Newton: number;
  readonly angleDegreesBetweenForces: number;
}): number {
  const { force1Newton: f1, force2Newton: f2, angleDegreesBetweenForces } = params;
  const rad = (angleDegreesBetweenForces * Math.PI) / 180;
  const rSq = f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(rad);
  return Number(Math.sqrt(Math.max(0, rSq)).toFixed(2));
}
