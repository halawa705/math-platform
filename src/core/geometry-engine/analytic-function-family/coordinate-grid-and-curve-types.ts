/**
 * @file coordinate-grid-and-curve-types.ts
 * @description أنواع الشبكة الإحداثية الديكارتية ومنحنيات الدوال والمعادلات الخطية في النموذج الوسيط IR v2.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 60 سطراً).
 */

import type { Point2DCoordinate } from "../../ssot/geometry-archetype-ssot";

export const MODULE_ID_COORDINATE_GRID_AND_CURVE_TYPES =
  "coordinate_grid_and_curve_types" as const;

export interface CanonicalCoordinateCurveNode {
  readonly id: string;
  readonly points: readonly Point2DCoordinate[];
  readonly strokeColorHex?: string;
  readonly strokeWidth?: number;
  readonly strokeStyle?: "solid" | "dashed" | "dotted";
  readonly label?: string;
  readonly labelPosition?: Point2DCoordinate;
}

export interface CanonicalCoordinateGridSpec {
  readonly enabled: boolean;
  readonly quadrantMode?: "four_quadrant" | "first_quadrant";
  readonly xRange?: readonly [number, number];
  readonly yRange?: readonly [number, number];
  readonly step?: number;
  readonly showGridLines?: boolean;
  readonly showAxesArrows?: boolean;
  readonly showTickNumbers?: boolean;
  readonly originVertexId?: string;
  readonly xAxisLabel?: string;
  readonly yAxisLabel?: string;
  readonly curves?: readonly CanonicalCoordinateCurveNode[];
}
