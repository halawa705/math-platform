/**
 * @file cartesian-graph-spec-ssot.ts
 * @description عقد الرسوم البيانية للدوال على المستوى الإحداثي (Cartesian Function Graph Spec).
 */
export const MODULE_ID_CARTESIAN_GRAPH_SPEC_SSOT = "cartesian_graph_spec_ssot" as const;

export type GraphFunctionKind = "linear" | "quadratic" | "absolute" | "vertical_line" | "horizontal_line";

export interface GraphFunctionSpec {
  readonly kind: GraphFunctionKind;
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly label?: string;
  readonly dashed?: boolean;
}

export interface GraphPointSpec {
  readonly x: number;
  readonly y: number;
  readonly label?: string;
}

export interface CartesianGraphSpec {
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
  readonly functions: readonly GraphFunctionSpec[];
  readonly points: readonly GraphPointSpec[];
}
