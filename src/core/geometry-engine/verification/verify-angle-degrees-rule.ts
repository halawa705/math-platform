/**
 * @file verify-angle-degrees-rule.ts
 * @description قاعدة: كل زاوية عددية (أو قائمة) يجب أن تُرسم بقياسها الفعلي.
 */
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import type { VerificationIssue } from "./verification-report-types-ssot";
import { buildVertexPositionMap, measureAngleDegrees } from "./figure-vector-measure-helpers";

export const MODULE_ID_VERIFY_ANGLE_DEGREES_RULE = "verify_angle_degrees_rule" as const;
const TOLERANCE_DEG = 1.5;

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
    if (typeof expected !== "number") continue;
    const drawn = measureAngleDegrees(v, p, q);
    if (Math.abs(drawn - expected) > TOLERANCE_DEG) {
      issues.push({ rule: "angle-degrees", severity: "error", message: `الزاوية ${ang.id} معطاة ${expected}° لكنها مرسومة ${drawn.toFixed(1)}°.` });
    }
  }
  return issues;
}
