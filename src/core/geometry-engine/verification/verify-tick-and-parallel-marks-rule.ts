/**
 * @file verify-tick-and-parallel-marks-rule.ts
 * @description قاعدة: الأضلاع ذات عدد الشرطات نفسه متساوية الطول، والأضلاع ذات أسهم التوازي نفسها متوازية.
 */
import type { CanonicalGeometryFigureIR, CanonicalSegmentNode } from "@/core/ssot/geometry-archetype-ssot";
import type { VerificationIssue } from "./verification-report-types-ssot";
import { buildVertexPositionMap, measureDistance } from "./figure-vector-measure-helpers";

export const MODULE_ID_VERIFY_TICK_AND_PARALLEL_MARKS_RULE = "verify_tick_and_parallel_marks_rule" as const;

export function verifyTickAndParallelMarksRule(fig: CanonicalGeometryFigureIR): VerificationIssue[] {
  const pos = buildVertexPositionMap(fig);
  const issues: VerificationIssue[] = [];
  const vec = (s: CanonicalSegmentNode) => {
    const a = pos.get(s.fromVertexId); const b = pos.get(s.toVertexId);
    return a && b ? { dx: b.x - a.x, dy: b.y - a.y, len: measureDistance(a, b) } : null;
  };
  for (const n of [1, 2, 3] as const) {
    const group = fig.segments.filter((s) => s.tickMarks === n).map(vec).filter((x) => x !== null);
    if (group.length < 2) continue;
    const min = Math.min(...group.map((g) => g.len)); const max = Math.max(...group.map((g) => g.len));
    if (min > 0 && max / min > 1.03) issues.push({ rule: "tick-equality", severity: "error", message: `أضلاع بعدد شرطات ${n} غير متساوية في الرسم (${min.toFixed(1)} مقابل ${max.toFixed(1)}).` });
  }
  for (const n of [1, 2] as const) {
    const group = fig.segments.filter((s) => s.parallelArrows === n).map(vec).filter((x) => x !== null);
    for (let i = 1; i < group.length; i++) {
      const cross = Math.abs(group[0].dx * group[i].dy - group[0].dy * group[i].dx) / (group[0].len * group[i].len || 1);
      if (cross > 0.02) issues.push({ rule: "parallel-marks", severity: "error", message: `قطعتان بعلامة توازٍ ${n} غير متوازيتين في الرسم.` });
    }
  }
  return issues;
}
