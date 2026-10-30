/**
 * @file verify-angle-degrees-rule.ts
 * @description قاعدة: كل زاوية عددية تُرسم من نفس فئتها (حادة/قائمة/منفرجة) وضمن مدى مقبول حول قيمتها؛ والقائمة بدقة.
 */
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import type { VerificationIssue } from "./verification-report-types-ssot";
import { buildVertexPositionMap, measureAngleDegrees } from "./figure-vector-measure-helpers";

export const MODULE_ID_VERIFY_ANGLE_DEGREES_RULE = "verify_angle_degrees_rule" as const;
const RIGHT_TOLERANCE_DEG = 1.5;
/** هامش الفئة حول 90°: الحادة تبقى حادة والمنفرجة تبقى منفرجة بفارق لا يقل عن هذا. */
const CLASS_MARGIN_DEG = 3;
const REFLEX_LIMIT_DEG = 180;

/** المدى المقبول لقياس الزاوية المرسومة: نفس الفئة (حادة/قائمة/منفرجة) وانحراف محدود نسبياً. */
export function acceptableAngleRangeDegrees(expected: number): { readonly min: number; readonly max: number } {
  if (Math.abs(expected - 90) < 0.5) return { min: 90 - RIGHT_TOLERANCE_DEG, max: 90 + RIGHT_TOLERANCE_DEG };
  const tol = Math.max(6, expected * 0.12);
  const margin = Math.min(CLASS_MARGIN_DEG, Math.abs(expected - 90) / 2);
  return expected < 90
    ? { min: Math.max(expected - tol, 3), max: Math.min(expected + tol, 90 - margin) }
    : { min: Math.max(expected - tol, 90 + margin), max: Math.min(expected + tol, 178) };
}

export function verifyAngleDegreesRule(fig: CanonicalGeometryFigureIR): VerificationIssue[] {
  const pos = buildVertexPositionMap(fig);
  const issues: VerificationIssue[] = [];
  for (const ang of fig.angles) {
    const expected = ang.isRightAngle ? 90 : ang.degrees;
    const v = pos.get(ang.vertexId); const p = pos.get(ang.arm1VertexId); const q = pos.get(ang.arm2VertexId);
    if (!v || !p || !q) {
      issues.push({ rule: "angle-refs", severity: "error", message: `الزاوية ${ang.id} تشير إلى رأس غير موجود.` });
      continue;
    }
    if (typeof expected !== "number" || expected >= REFLEX_LIMIT_DEG) continue;
    const drawn = measureAngleDegrees(v, p, q);
    const range = acceptableAngleRangeDegrees(expected);
    if (drawn < range.min || drawn > range.max) {
      issues.push({ rule: "angle-degrees", severity: "error", message: `الزاوية ${ang.id} معطاة ${expected}° لكنها مرسومة ${drawn.toFixed(1)}° (المقبول ${range.min.toFixed(0)}–${range.max.toFixed(0)}°).` });
    }
  }
  return issues;
}


