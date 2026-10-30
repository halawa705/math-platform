/**
 * @file verify-segment-length-scale-rule.ts
 * @description قاعدة: الأطوال العددية المكتوبة على الأضلاع يجب أن تكون متناسبة مع الأطوال المرسومة بمعامل مقياس واحد.
 */
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import type { VerificationIssue } from "./verification-report-types-ssot";
import { buildVertexPositionMap, measureDistance, median, parseNumericLabel } from "./figure-vector-measure-helpers";

export const MODULE_ID_VERIFY_SEGMENT_LENGTH_SCALE_RULE = "verify_segment_length_scale_rule" as const;
const TOLERANCE = 0.12;
/** إن زادت نسبة طولين معطيين عن هذا الحد فيجب أن يبقى الأطول هو الأطول في الرسم. */
const ORDER_RATIO = 1.25;

export function verifySegmentLengthScaleRule(fig: CanonicalGeometryFigureIR): VerificationIssue[] {
  const pos = buildVertexPositionMap(fig);
  const rows: { id: string; ratio: number; value: number }[] = [];
  for (const s of fig.segments) {
    const value = parseNumericLabel(s.lengthLabel?.value);
    const a = pos.get(s.fromVertexId); const b = pos.get(s.toVertexId);
    if (value === null || !a || !b) continue;
    const drawn = measureDistance(a, b);
    if (drawn > 0) rows.push({ id: s.id, ratio: drawn / value, value });
  }
  if (rows.length < 2) return [];
  const scale = median(rows.map((r) => r.ratio));
  const orderIssues: VerificationIssue[] = [];
  for (const x of rows) for (const y of rows) {
    if (x.value / y.value >= ORDER_RATIO && x.ratio * x.value <= y.ratio * y.value) {
      orderIssues.push({ rule: "length-order", severity: "warning", message: `الضلع ${x.id} (${x.value}) أطول من ${y.id} (${y.value}) لكنه لا يبدو أطول في الرسم.` });
    }
  }
  return [...orderIssues, ...rows
    .filter((r) => Math.abs(r.ratio / scale - 1) > TOLERANCE)
    .map((r) => ({
      rule: "length-scale",
      severity: "warning" as const,
      message: `الضلع ${r.id} مكتوب عليه ${r.value} لكن طوله المرسوم لا يتناسب مع باقي الأضلاع (انحراف ${(Math.abs(r.ratio / scale - 1) * 100).toFixed(0)}٪).`,
    })),
  ];
}


