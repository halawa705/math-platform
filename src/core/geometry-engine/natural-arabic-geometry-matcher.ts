/**
 * @file natural-arabic-geometry-matcher.ts
 * @description المترجم الحتمي الموحد للوصف العربي الطبيعي (`[رسم هندسي: ...]`) إلى فروع السجل الهندسي القياسي (`CanonicalGeometryFigureIR`).
 * يقرأ الوصف العربي ويستدعي الفرع المنبثق المناسب من عائلات المثلث، الدائرة، الرباعي، الشبكة الديكارتية، أو الفراغية والميكانيكا.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildTriangleMidsegmentFigure } from "./triangle-family/triangle-midsegment-branch";
import { buildTriangleThalesParallelFigure } from "./triangle-family/triangle-thales-parallel-branch";
import { buildTriangleMediansCentroidFigure } from "./triangle-family/triangle-medians-centroid-branch";
import { buildTriangleEuclidAltitudeFigure } from "./triangle-family/triangle-euclid-altitude-branch";
import { buildTriangleAngleBisectorFigure } from "./triangle-family/triangle-angle-bisector-branch";
import { buildTriangleExteriorAngleFigure } from "./triangle-family/triangle-exterior-angle-branch";
import { buildCircleChordBisectorFigure } from "./circle-family/circle-chord-bisector-branch";
import { buildCircleCentralInscribedFigure } from "./circle-family/circle-central-inscribed-branch";
import { buildCircleCyclicQuadFigure } from "./circle-family/circle-cyclic-quad-branch";
import { buildCircleExternalTangentsFigure } from "./circle-family/circle-external-tangents-branch";
import { buildCircleTangentChordAngleFigure } from "./circle-family/circle-tangent-chord-angle-branch";
import { buildCircleIntersectingPairFigure } from "./circle-family/circle-intersecting-pair-branch";
import { buildParallelogramDiagonalsFigure } from "./quadrilateral-family/parallelogram-diagonals-branch";
import { buildRectangleSquareRhombusFigure } from "./quadrilateral-family/rectangle-square-rhombus-branch";
import { buildTrapezoidAltitudesFigure } from "./quadrilateral-family/trapezoid-altitudes-branch";
import { buildHourglassButterflySimilarityFigure } from "./quadrilateral-family/hourglass-butterfly-similarity-branch";
import { buildQuadraticParabolaCurveFigure } from "./analytic-function-family/linear-quadratic-curve-branch";
import { buildNumberLineIntervalFigure } from "./analytic-function-family/number-line-intervals-branch";
import { buildRegularPyramid3DFigure } from "./spatial-3d-family/pyramid-spatial-planes-branch";
import { buildCubeCuboid3DFigure } from "./spatial-3d-family/cube-cuboid-prism-branch";
import { buildRightCircularCone3DFigure } from "./spatial-3d-family/cylinder-cone-sphere-branch";
import { buildInclinedPlaneForcesFigure } from "./spatial-3d-family/mechanics-force-vectors-branch";

export const MODULE_ID_NATURAL_ARABIC_GEOMETRY_MATCHER =
  "natural_arabic_geometry_matcher" as const;

export function matchArabicDescriptionToCanonicalGeometryFigure(
  arabicDescription: string,
  figureId = "matched_geom_fig",
  notationLanguage: MathNotationLanguage = "arabic"
): CanonicalGeometryFigureIR {
  const desc = (arabicDescription || "").trim();

  // 1. عائلة المثلث وفروعها المنبثقة
  if (/إقليدس|عمود.*وتر|مسقط/i.test(desc)) {
    return buildTriangleEuclidAltitudeFigure({ figureId, notationLanguage });
  }
  if (/متوسط|نقطة\s*تقاطع\s*المتوسطات/i.test(desc)) {
    return buildTriangleMediansCentroidFigure({ figureId, notationLanguage });
  }
  if (/طاليس|يوازي\s*ب\s*ج/i.test(desc) && !/منتصف/i.test(desc)) {
    return buildTriangleThalesParallelFigure({ figureId, notationLanguage });
  }
  if (/منصف\s*زاوية/i.test(desc)) {
    return buildTriangleAngleBisectorFigure({ figureId, notationLanguage });
  }
  if (/زاوية\s*خارجة/i.test(desc)) {
    return buildTriangleExteriorAngleFigure({ figureId, notationLanguage });
  }

  // 2. عائلة الدائرة وفروعها الـ 6 المنبثقة
  if (/مماسان|مماسين|نقطة\s*خارج\s*الدائرة/i.test(desc)) {
    return buildCircleExternalTangentsFigure({ figureId, notationLanguage });
  }
  if (/زاوية\s*مماسية/i.test(desc)) {
    return buildCircleTangentChordAngleFigure({ figureId, notationLanguage });
  }
  if (/رباعي\s*دائري/i.test(desc)) {
    return buildCircleCyclicQuadFigure({ figureId, notationLanguage });
  }
  if (/محيطية|مركزية/i.test(desc)) {
    return buildCircleCentralInscribedFigure({ figureId, notationLanguage });
  }
  if (/دائرتان\s*متقاطعتان|خط\s*المركزين/i.test(desc)) {
    return buildCircleIntersectingPairFigure({ figureId, notationLanguage });
  }
  if (/دائرة|وتر\s*في\s*دائرة/i.test(desc)) {
    return buildCircleChordBisectorFigure({ figureId, notationLanguage });
  }

  // 3. عائلة الأشكال الرباعية
  if (/شبه\s*منحرف/i.test(desc)) {
    return buildTrapezoidAltitudesFigure({ figureId, notationLanguage });
  }
  if (/ساعة\s*رملية|فراشة|تقاطع\s*قطعتين/i.test(desc)) {
    return buildHourglassButterflySimilarityFigure({ figureId, notationLanguage });
  }
  if (/مستطيل|مربع|معين/i.test(desc)) {
    return buildRectangleSquareRhombusFigure({ figureId, notationLanguage });
  }
  if (/متوازي\s*أضلاع/i.test(desc)) {
    return buildParallelogramDiagonalsFigure({ figureId, notationLanguage });
  }

  // 4. الشبكة الديكارتية وخط الأعداد
  if (/خط\s*الأعداد|فترة/i.test(desc)) {
    return buildNumberLineIntervalFigure({ figureId, notationLanguage });
  }
  if (/منحنى|دالة\s*تربيعية|شبكة\s*بيانية/i.test(desc)) {
    return buildQuadraticParabolaCurveFigure({ figureId, notationLanguage });
  }

  // 5. المجسمات الفراغية والميكانيكا
  if (/هرم/i.test(desc)) {
    return buildRegularPyramid3DFigure({ figureId, notationLanguage });
  }
  if (/مخروط|أسطوانة/i.test(desc)) {
    return buildRightCircularCone3DFigure({ figureId, notationLanguage });
  }
  if (/مكعب|متوازي\s*مستطيلات/i.test(desc)) {
    return buildCubeCuboid3DFigure({ figureId, notationLanguage });
  }
  if (/مستوى\s*مائل|قوى|رد\s*الفعل/i.test(desc)) {
    return buildInclinedPlaneForcesFigure({ figureId, notationLanguage });
  }

  // الشكل القياسي الافتراضي: المثلث والقطعة الواصلة بين منتصفي ضلعين
  return buildTriangleMidsegmentFigure({ figureId, notationLanguage });
}
