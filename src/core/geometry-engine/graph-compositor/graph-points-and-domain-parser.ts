/**
 * @file graph-points-and-domain-parser.ts
 * @description محلل النقاط والمدى الصريح للرسوم البيانية (المرحلة 3.1):
 * - يستخرج نطاق المحاور (المدى س من ... إلى ... ، ص من ... إلى ...)
 * - يستخرج النقاط الإحداثية المعطاة صراحة في السؤال (x, y) مع تسميتها ونمطها.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 150 سطراً).
 */

import type { GraphPointSpec } from "@/core/ssot/cartesian-graph-spec-ssot";

export const MODULE_ID_GRAPH_POINTS_AND_DOMAIN_PARSER =
  "graph_points_and_domain_parser" as const;

export interface GraphDomainRangeLimits {
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin?: number;
  readonly yMax?: number;
}

export function parseDomainRangeClause(clause: string): GraphDomainRangeLimits | null {
  const m = clause.match(
    /المدى\s*س\s*من\s*([+-]?\d+(?:\.\d+)?)\s*إلى\s*([+-]?\d+(?:\.\d+)?)(?:\s*[،,]\s*ص\s*من\s*([+-]?\d+(?:\.\d+)?)\s*إلى\s*([+-]?\d+(?:\.\d+)?))?/u
  );
  if (!m) return null;

  return {
    xMin: Number(m[1]),
    xMax: Number(m[2]),
    yMin: m[3] ? Number(m[3]) : undefined,
    yMax: m[4] ? Number(m[4]) : undefined,
  };
}

export function parseCoordinatePoint(clause: string): GraphPointSpec | null {
  // يدعم: (2, 3) أو نقطة (2، 3) أو A(2, 3) أو نقطة التقاطع (1، -2)
  const m = clause.match(
    /^(?:(.*?)\s*)?\(\s*([+-]?\d+(?:\.\d+)?)\s*[،,]\s*([+-]?\d+(?:\.\d+)?)\s*\)\s*(.*)$/u
  );
  if (!m) return null;

  const prefix = (m[1] || "").trim();
  const x = Number(m[2]);
  const y = Number(m[3]);
  const suffix = (m[4] || "").trim();

  let label: string | undefined = undefined;
  const cleanPrefix = prefix.replace(/^نقطة\s*/, "").trim();
  if (cleanPrefix) label = cleanPrefix;
  else if (suffix) label = suffix;

  const isHollow = /مفتوح|فجوة|غير\s*معرف/i.test(clause);

  return {
    x,
    y,
    label: label || undefined,
    style: isHollow ? "hollow" : "solid",
  };
}
