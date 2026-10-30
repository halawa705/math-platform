/**
 * @file verify-structural-and-visual-quality-rule.ts
 * @description قاعدة: سلامة المراجع (رؤوس/أضلاع/مضلعات)، تفرّد الأسماء، وعدم تقارب النقاط أو انهيار الأشكال بصرياً.
 */
import type { CanonicalGeometryFigureIR } from "@/core/ssot/geometry-archetype-ssot";
import type { VerificationIssue } from "./verification-report-types-ssot";
import { buildVertexPositionMap, measureDistance } from "./figure-vector-measure-helpers";

export const MODULE_ID_VERIFY_STRUCTURAL_AND_VISUAL_QUALITY_RULE = "verify_structural_and_visual_quality_rule" as const;

export function verifyStructuralAndVisualQualityRule(fig: CanonicalGeometryFigureIR): VerificationIssue[] {
  const pos = buildVertexPositionMap(fig);
  const issues: VerificationIssue[] = [];
  for (const s of fig.segments) {
    if (!pos.has(s.fromVertexId) || !pos.has(s.toVertexId)) issues.push({ rule: "segment-refs", severity: "error", message: `الضلع ${s.id} يشير إلى رأس غير موجود.` });
  }
  for (const poly of fig.polygons ?? []) {
    if (poly.some((id) => !pos.has(id))) issues.push({ rule: "polygon-refs", severity: "error", message: "مضلع يشير إلى رأس غير موجود." });
  }
  const seen = new Map<string, number>();
  for (const v of fig.vertices) seen.set(v.label, (seen.get(v.label) ?? 0) + 1);
  for (const [label, n] of seen) if (n > 1 && label.trim()) issues.push({ rule: "duplicate-label", severity: "error", message: `الاسم «${label}» مكرر على ${n} رؤوس.` });

  const xs = fig.vertices.map((v) => v.position.x); const ys = fig.vertices.map((v) => v.position.y);
  const diag = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  for (let i = 0; i < fig.vertices.length; i++) for (let j = i + 1; j < fig.vertices.length; j++) {
    const d = measureDistance(fig.vertices[i].position, fig.vertices[j].position);
    if (diag > 0 && d / diag < 0.04) issues.push({ rule: "crowded-points", severity: "warning", message: `النقطتان ${fig.vertices[i].label} و${fig.vertices[j].label} متقاربتان جداً في الرسم.` });
  }
  return issues;
}
