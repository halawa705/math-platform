/**
 * @file cartesian-graph-spec-ssot.ts
 * @description عقد الرسوم البيانية للدوال على المستوى الإحداثي (Cartesian Function Graph Spec v2).
 * يدعم الدوال الخطية والتربيعية والقيمة المطلقة، المتباينات مع تظليل نصف المستوى،
 * الدوال متعددة التعريف، رأس المنحنى ومحور التماثل، ونقاط التقاطع.
 * @invariant ملف SSOT ذري مستقل باسم فريد عالمياً وفق دستور المنصة (< 80 سطراً).
 */

export const MODULE_ID_CARTESIAN_GRAPH_SPEC_SSOT = "cartesian_graph_spec_ssot" as const;

export type GraphFunctionKind =
  | "linear"
  | "quadratic"
  | "absolute"
  | "vertical_line"
  | "horizontal_line"
  | "piecewise";

export type InequalityOperator = ">" | ">=" | "<" | "<=";
export type HalfPlaneShading = "above" | "below" | "left" | "right";

export interface DomainIntervalSpec {
  readonly min?: number;
  readonly max?: number;
  readonly includeMin?: boolean;
  readonly includeMax?: boolean;
}

export interface PiecewiseBranchSpec {
  readonly kind: "linear" | "quadratic" | "absolute" | "horizontal_line";
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly domain: DomainIntervalSpec;
  readonly label?: string;
}

export interface GraphFunctionSpec {
  readonly kind: GraphFunctionKind;
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly label?: string;
  readonly dashed?: boolean;
  readonly inequalityOp?: InequalityOperator;
  readonly shadeHalfPlane?: HalfPlaneShading;
  readonly domain?: DomainIntervalSpec;
  readonly branches?: readonly PiecewiseBranchSpec[];
  readonly axisOfSymmetry?: number;
  readonly vertexPoint?: GraphPointSpec;
}

export interface GraphPointSpec {
  readonly x: number;
  readonly y: number;
  readonly label?: string;
  readonly style?: "solid" | "hollow";
}

export interface CartesianGraphSpec {
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
  readonly functions: readonly GraphFunctionSpec[];
  readonly points: readonly GraphPointSpec[];
  readonly titleArabic?: string;
}
