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
/** عند التفاوت الشديد في الأطوال (8:1 فأكثر) يتعذر الرسم بمقياس حقيقي مقروء فيُخفف فحص المقياس إلى تحذير «غير مرسوم بمقياس رسم». */
const EXTREME_SCALE_RATIO = 8.0;

export function verifySegmentLengthScaleRule(fig: CanonicalGeometryFigureIR): VerificationIssue[] {
  if (fig.familyId === "solid3d_mechanics_family" || fig.branchId === "quad_composite_rectilinear_shape") {
    return [];
  }
  const pos = buildVertexPositionMap(fig);
  const rows: { id: string; ratio: number; value: number }[] = [];
  for (const s of fig.segments) {
    const value = parseNumericLabel(s.lengthLabel?.value);
    const a = pos.get(s.fromVertexId); const b = pos.get(s.toVertexId);
    if (value === null || value <= 0 || !a || !b) continue;
    const drawn = measureDistance(a, b);
    if (drawn > 0) rows.push({ id: s.id, ratio: drawn / value, value });
  }
  if (rows.length < 2) return [];

  const values = rows.map((r) => r.value);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const isExtremeRatio = maxVal / minVal >= EXTREME_SCALE_RATIO || Boolean(fig.titleArabic?.includes("غير مرسوم بمقياس رسم"));
  const scaleSeverity: "error" | "warning" = isExtremeRatio ? "warning" : "error";

  const scale = median(rows.map((r) => r.ratio));
  const orderIssues: VerificationIssue[] = [];
  for (const x of rows) for (const y of rows) {
    if (x.value / y.value >= ORDER_RATIO && x.ratio * x.value <= y.ratio * y.value) {
      orderIssues.push({
        rule: "length-order",
        severity: scaleSeverity,
        message: `الضلع ${x.id} (${x.value}) أطول من ${y.id} (${y.value}) لكنه لا يبدو أطول في الرسم.`,
      });
    }
  }
  return [...orderIssues, ...rows
    .filter((r) => Math.abs(r.ratio / scale - 1) > TOLERANCE)
    .map((r) => ({
      rule: "length-scale",
      severity: scaleSeverity,
      message: isExtremeRatio
        ? `تفاوت شديد في الأطوال (${maxVal}:${minVal}) — غير مرسوم بمقياس رسم للضلع ${r.id}.`
        : `الضلع ${r.id} مكتوب عليه ${r.value} لكن طوله المرسوم لا يتناسب مع باقي الأضلاع (انحراف ${(Math.abs(r.ratio / scale - 1) * 100).toFixed(0)}٪).`,
    })),
  ];
}


