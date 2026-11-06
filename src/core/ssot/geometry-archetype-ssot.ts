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
  | "solid3d_mechanics_family"
  | "statistics_family"
  | "primary_visual_models_family";

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
  | "quad_hourglass_butterfly_similarity"
  | "quad_composite_rectilinear_shape";

export type Solid3DDerivedBranchId =
  | "solid_cube_cuboid_prism"
  | "solid_cylinder_cone_sphere"
  | "solid_regular_pyramid"
  | "mechanics_inclined_plane_forces";

export type StatisticsDerivedBranchId =
  | "stats_dot_plot"
  | "stats_histogram_columns"
  | "stats_boxplot_and_quartiles"
  | "stats_bar_chart"
  | "stats_frequency_distribution_table"
  | "stats_frequency_polygon_and_curve"
  | "stats_ascending_descending_ogive"
  | "stats_pie_circular_sectors"
  | "stats_scatter_regression_line";

export type PrimaryVisualModelsBranchId = "primary_bar_model" | "primary_analog_clock";

export type GeometryCanonicalBranchId =
  | PrimaryVisualModelsBranchId
  | TriangleDerivedBranchId
  | CircleDerivedBranchId
  | QuadrilateralDerivedBranchId
  | Solid3DDerivedBranchId
  | StatisticsDerivedBranchId;

export interface Point2DCoordinate {
  readonly x: number;
  readonly y: number;
}

/**
 * تصنيف نوع الملصق البصري في النموذج الوسيط IR v2:
 * - `given`: معطى صريح في المسألة
 * - `unknown`: مطلوب مجهول يُرسم كعلامة استفهام «؟» أو متغير السؤال
 * - `name`: اسم رأس أو عنصر تعريفي
 */
export type FigureLabelSemanticKind = "given" | "unknown" | "name";

/**
 * نوع المطلوب الهندسي في المسألة (`asked`) وفق مخطط المرحلة 2 و3:
 * - `length`: طول قطعة مستقيمة أو نصف قطر أو محيط
 * - `angle`: قياس زاوية
 * - `area`: مساحة منطقة أو مضلع
 * - `ratio`: نسبة بين قطعتين أو مساحتين
 * - `coordinates`: إحداثيات نقطة
 * - `proof`: برهان أو إثبات (لا يوضع له «؟» على الشكل)
 */
export type GeometryAskedKind =
  | "length"
  | "angle"
  | "area"
  | "ratio"
  | "coordinates"
  | "proof";

export interface GeometryAskedTargetSpec {
  readonly kind: GeometryAskedKind;
  /** الرؤوس أو القطعة أو الزاوية المطلوبة بعد التطبيع اللاتيني (مثل "AB" أو "ABC" أو "B"). */
  readonly targetKey?: string;
  /** المتغير الجبري الصريح إن كان السؤال يطلب قيمة متغير موجود على الرسم (مثل "x" أو "س"). */
  readonly variableSymbol?: string;
  /** النص الأصلي لجملة المطلوب في المسألة. */
  readonly rawAskedClause?: string;
}

/**
 * القرار الثلاثي لبوابة الصدق والتحقق في المرحلة 2:
 * - `green`: اجتاز جميع الفحوص ويُعتمد تلقائياً
 * - `yellow`: نقص أو التباس قابل للإصلاح بتحرير قائمة الحقائق
 * - `red`: مرفوض (لا شكل) مع السبب الصريح
 */
export type FigureTriStateDecision = "green" | "yellow" | "red";

/**
 * الكائنات الهندسية في مواصفة المسألة المهيكلة (`Problem Spec` — المرحلة 3.1).
 */
export type ProblemSpecObjectKind =
  | "point"
  | "segment"
  | "ray"
  | "line"
  | "triangle"
  | "quadrilateral"
  | "polygon"
  | "circle"
  | "arc";

export interface ProblemSpecObjectNode {
  readonly kind: ProblemSpecObjectKind;
  readonly id: string;
  readonly vertices?: readonly string[];
  readonly center?: string;
  readonly subtype?: string;
}

/**
 * العلاقات الهندسية في مواصفة المسألة المهيكلة (`Problem Spec` — المرحلة 3.1).
 */
export type ProblemSpecRelationKind =
  | "right_angle"
  | "parallel"
  | "perpendicular"
  | "equal_length"
  | "midpoint"
  | "point_on"
  | "bisector"
  | "median"
  | "tangent"
  | "on_circle"
  | "intersect"
  | "similarity"
  | "congruence";

export interface ProblemSpecRelationNode {
  readonly kind: ProblemSpecRelationKind;
  readonly at?: string;
  readonly targets: readonly string[];
}

export interface ProblemSpecGivenNode {
  readonly target: string;
  readonly value: string;
  readonly numericValue?: number;
  readonly unit?: ArabicMathUnit | string;
}

/**
 * مواصفة المسألة المهيكلة الكاملة (`GeometryProblemSpec` — المرحلة 3.1):
 * مخطط JSON ثابت يُستخرج من نص المسألة ووسم الرسم بالتوازي (Zero-DSL).
 */
export interface GeometryProblemSpec {
  readonly objects: readonly ProblemSpecObjectNode[];
  readonly relations: readonly ProblemSpecRelationNode[];
  readonly givens: readonly ProblemSpecGivenNode[];
  readonly asked?: GeometryAskedTargetSpec;
}

export interface CanonicalCircleNode {
  readonly id: string;
  readonly centerVertexId: string;
  /** نصف القطر بوحدات إحداثيات الشكل (إن غاب يُقاس من أقرب نقطة محيطية أو rimVertexId). */
  readonly radius: number;
  readonly rimVertexId?: string;
  readonly strokeStyle?: "solid" | "dashed" | "dotted";
  readonly fillColorHex?: string;
  readonly fillOpacity?: number;
}

export interface CanonicalArcNode {
  readonly id: string;
  readonly centerVertexId: string;
  readonly radius: number;
  readonly startAngleDeg: number;
  readonly endAngleDeg: number;
  readonly counterClockwise?: boolean;
  readonly strokeStyle?: "solid" | "dashed" | "dotted";
  readonly arcLabel?: {
    readonly value: string;
    readonly labelKind?: FigureLabelSemanticKind;
  };
}

export interface CanonicalShadedRegionNode {
  readonly id: string;
  /** قائمة معرّفات الرؤوس المكونة للمنطقة المظللة بالترتيب. */
  readonly vertexIds: readonly string[];
  readonly fillColorHex?: string;
  readonly fillOpacity?: number;
  readonly patternStyle?: "solid_tint" | "diagonal_hatch";
  readonly regionLabel?: string;
  readonly labelKind?: FigureLabelSemanticKind;
}

export interface CanonicalCoordinateGridSpec {
  readonly enabled: boolean;
  readonly step?: number;
  readonly showAxesArrows?: boolean;
  readonly showTickNumbers?: boolean;
  readonly originVertexId?: string;
}

export interface CanonicalVertexNode {
  readonly id: string;
  readonly label: string;
  readonly position: Point2DCoordinate;
  readonly hideVertexDot?: boolean;
  readonly labelKind?: FigureLabelSemanticKind;
}

export interface CanonicalSegmentNode {
  readonly id: string;
  readonly fromVertexId: string;
  readonly toVertexId: string;
  readonly lengthLabel?: {
    readonly value: number | string;
    readonly unit?: ArabicMathUnit | string;
    readonly labelKind?: FigureLabelSemanticKind;
  };
  readonly tickMarks?: 1 | 2 | 3;
  readonly parallelArrows?: 1 | 2;
  readonly strokeStyle?: "solid" | "dashed" | "dotted";
  readonly isRay?: boolean;
  readonly isLine?: boolean;
  readonly arrowAtEnd?: boolean;
  readonly arrowAtStart?: boolean;
}

export interface CanonicalAngleNode {
  readonly id: string;
  readonly vertexId: string;
  readonly arm1VertexId: string;
  readonly arm2VertexId: string;
  readonly degrees?: number;
  readonly degreesLabel?: string;
  readonly labelKind?: FigureLabelSemanticKind;
  readonly isRightAngle?: boolean;
  readonly arcCount?: 1 | 2;
  readonly markSymbol?: "arc" | "dot" | "cross";
}

export interface CanonicalInteriorBadgeNode {
  readonly id: string;
  readonly text: string;
  readonly position: Point2DCoordinate;
  readonly badgeType?: "perimeter" | "area" | "generic";
  readonly labelKind?: FigureLabelSemanticKind;
  readonly fontSize?: number;
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
  /** دوائر صريحة بالمركز ونصف القطر (يدعم دائرة واحدة أو دائرتين متقاطعتين/متماستين أو أكثر في IR v2). */
  readonly circles?: readonly CanonicalCircleNode[];
  /** أقواس دائرية صريحة بزاويتي البداية والنهاية (IR v2). */
  readonly arcs?: readonly CanonicalArcNode[];
  /** مضلعات صريحة للتظليل (قوائم معرّفات رؤوس). إن غابت يُستعمل التخمين القديم حسب عدد الرؤوس. */
  readonly polygons?: readonly (readonly string[])[];
  /** مناطق مظللة صريحة بلون أو تهشير مخصص (IR v2). */
  readonly shadedRegions?: readonly CanonicalShadedRegionNode[];
  /** إعدادات الشبكة الإحداثية الاختيارية لمسائل الإحداثيات والتحويلات الهندسية (IR v2). */
  readonly coordinateGrid?: CanonicalCoordinateGridSpec;
  /** شارات ونصوص توضيحية حرة داخل مساحة الشكل (مثل "المحيط = 24 سم" أو "المساحة = ؟"). */
  readonly interiorBadges?: readonly CanonicalInteriorBadgeNode[];
  /** توصيف المطلوب المستخرج من السؤال لربطه بعلامة «؟» على الشكل (IR v2). */
  readonly askedSpec?: GeometryAskedTargetSpec;
  /** رسم متجهي SVG نقي مولد مسبقاً (خاص بالأشكال الإحصائية أو المركبة الفائقة الدقة). */
  readonly rawSvgMarkup?: string;
}
