/**
 * @file geometry-archetype-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) للسجل الشجري لعائلات الأشكال الهندسية القياسية.
 * المبدأ المعماري: كل عائلة هندسية لها أصل واحد (Root Archetype) مثل المثلث أو الدائرة،
 * وتنبثق منه الأشكال الفرعية الخاصة بالكتب الخارجية والمدرسية (مثل قطعة واصلة بين منتصفي ضلعين،
 * متوسطات المثلث، نظرية إقليدس، توازي طاليس، مماسات الدائرة) دون تكرار كود الرسم الأساسي.
 */

import type { ArabicMathUnit, MathNotationLanguage } from "./numeral-and-unit-ssot";

export type GeometryFamilyId =
  | "triangle_family"
  | "quadrilateral_family"
  | "circle_family"
  | "analytic_coordinate_family"
  | "solid3d_mechanics_family";

export type TriangleDerivedBranchId =
  | "triangle_base_general"
  | "triangle_right_pythagoras"
  | "triangle_isosceles_equilateral"
  | "triangle_midsegment_joining_midpoints"
  | "triangle_thales_parallel_line"
  | "triangle_medians_and_centroid"
  | "triangle_euclid_right_altitude"
  | "triangle_interior_exterior_bisector"
  | "triangle_exterior_angle_extension";

export type CircleDerivedBranchId =
  | "circle_base_radius_chord"
  | "circle_perpendicular_from_center_to_chord"
  | "circle_equal_chords_equidistant"
  | "circle_central_and_inscribed_angles"
  | "circle_inscribed_cyclic_quadrilateral"
  | "circle_two_tangents_from_external_point"
  | "circle_tangent_and_chord_angle"
  | "circle_two_intersecting_or_touching";

export type QuadrilateralDerivedBranchId =
  | "quad_parallelogram_diagonals"
  | "quad_rectangle_square_rhombus"
  | "quad_trapezoid_with_altitudes"
  | "quad_hourglass_butterfly_similarity";

export type Solid3DDerivedBranchId =
  | "solid_cube_cuboid_prism"
  | "solid_cylinder_cone_sphere"
  | "solid_regular_pyramid"
  | "mechanics_inclined_plane_forces";

export type GeometryCanonicalBranchId =
  | TriangleDerivedBranchId
  | CircleDerivedBranchId
  | QuadrilateralDerivedBranchId
  | Solid3DDerivedBranchId;

export interface Point2DCoordinate {
  readonly x: number;
  readonly y: number;
}

export interface CanonicalVertexNode {
  readonly id: string;
  readonly label: string;
  readonly position: Point2DCoordinate;
}

export interface CanonicalSegmentNode {
  readonly id: string;
  readonly fromVertexId: string;
  readonly toVertexId: string;
  readonly lengthLabel?: { readonly value: number | string; readonly unit?: ArabicMathUnit | string };
  readonly tickMarks?: 1 | 2 | 3;
  readonly parallelArrows?: 1 | 2;
  readonly strokeStyle?: "solid" | "dashed" | "dotted";
}

export interface CanonicalAngleNode {
  readonly id: string;
  readonly vertexId: string;
  readonly arm1VertexId: string;
  readonly arm2VertexId: string;
  readonly degrees?: number;
  readonly degreesLabel?: string;
  readonly isRightAngle?: boolean;
  readonly arcCount?: 1 | 2;
  readonly markSymbol?: "arc" | "dot" | "cross";
}

export interface CanonicalGeometryFigureIR {
  readonly figureId: string;
  readonly familyId: GeometryFamilyId;
  readonly branchId: GeometryCanonicalBranchId;
  readonly titleArabic: string;
  readonly notationLanguage: MathNotationLanguage;
  readonly vertices: readonly CanonicalVertexNode[];
  readonly segments: readonly CanonicalSegmentNode[];
  readonly angles: readonly CanonicalAngleNode[];
}
