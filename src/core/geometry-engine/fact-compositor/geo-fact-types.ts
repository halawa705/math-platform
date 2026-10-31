/**
 * @file geo-fact-types.ts
 * @description مفردات «الحقائق الهندسية» المغلقة التي يفهمها المركّب. كل حقيقة سطر واحد قصير.
 */
export const MODULE_ID_GEO_FACT_TYPES = "geo_fact_types" as const;

export type Seg = readonly [string, string];
export type QuadKind = "rectangle" | "square" | "rhombus" | "parallelogram" | "trapezoid" | "general";

export type GeoFact =
  | { readonly k: "triangle"; readonly labels: readonly string[]; readonly right?: string; readonly isoApex?: string; readonly equilateral?: boolean }
  | { readonly k: "quad"; readonly kind: QuadKind; readonly labels: readonly string[] }
  | { readonly k: "circle"; readonly center: string; readonly radius?: number }
  | { readonly k: "radius"; readonly r: number }
  | { readonly k: "onCircle"; readonly labels: readonly string[] }
  | { readonly k: "chord"; readonly seg: Seg }
  | { readonly k: "diameter"; readonly seg: Seg }
  | { readonly k: "tangent"; readonly seg: Seg; readonly at: string }
  | { readonly k: "length"; readonly seg: Seg; readonly text: string; readonly numeric?: number }
  | { readonly k: "equal"; readonly a: Seg; readonly b: Seg }
  | { readonly k: "angle"; readonly arms?: readonly [string, string, string]; readonly vertex: string; readonly deg?: number; readonly text?: string; readonly right?: boolean }
  | { readonly k: "pointOn"; readonly p: string; readonly seg: Seg }
  | { readonly k: "midpoint"; readonly p: string; readonly seg: Seg }
  | { readonly k: "parallel"; readonly a: Seg; readonly b: Seg }
  | { readonly k: "perp"; readonly a: Seg; readonly b: Seg; readonly foot?: string }
  | { readonly k: "bisector"; readonly seg: Seg; readonly vertex: string }
  | { readonly k: "median"; readonly seg: Seg }
  | { readonly k: "intersect"; readonly a: Seg; readonly b: Seg; readonly p: string }
  | { readonly k: "diagonalsMeet"; readonly p: string }
  | { readonly k: "draw"; readonly seg: Seg }
  | { readonly k: "extend"; readonly from: string; readonly through: string; readonly to: string }
  | { readonly k: "similarity"; readonly tri1: readonly string[]; readonly tri2: readonly string[]; readonly ratio?: number }
  | { readonly k: "congruence"; readonly tri1: readonly string[]; readonly tri2: readonly string[] }
  | { readonly k: "ratio"; readonly a: Seg; readonly b: Seg; readonly num: number; readonly den: number };
