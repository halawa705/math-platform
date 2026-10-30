/**
 * @file natural-arabic-geometry-matcher.ts
 * @description المترجم الحتمي الموحد للوصف العربي الطبيعي (`[رسم هندسي: ...]`) إلى فروع السجل الهندسي القياسي (`CanonicalGeometryFigureIR`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 185 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { composeFigureFromGeometryDescription } from "./fact-compositor/geo-figure-composer";
import { matchPrimaryGrade4GeometryFigure } from "./curriculum-catalogs/primary-stage/grade-4/primary-grade4-geometry-catalog";
import { matchPrimaryGrade5GeometryFigure } from "./curriculum-catalogs/primary-stage/grade-5/primary-grade5-geometry-catalog";
import { matchPrimaryGrade6GeometryFigure } from "./curriculum-catalogs/primary-stage/grade-6/primary-grade6-geometry-catalog";
import { matchPrepGrade1GeometryFigure } from "./curriculum-catalogs/prep-stage/grade-1/prep-grade1-triangle-congruence-catalog";
import { matchPrepGrade1AnglesRelationshipsFigure } from "./curriculum-catalogs/prep-stage/grade-1/prep-grade1-angles-relationships-catalog";
import { matchPrepGrade1AnglesFollowupFigure } from "./curriculum-catalogs/prep-stage/grade-1/prep-grade1-angles-followup-catalog";
import { matchPrepGrade1ParallelismFigure } from "./curriculum-catalogs/prep-stage/grade-1/prep-grade1-parallelism-catalog";
import { matchPrepGrade1TriangleAnglesFigure } from "./curriculum-catalogs/prep-stage/grade-1/prep-grade1-triangle-angles-catalog";
import { matchPrepGrade1QuadrilateralsFigure } from "./curriculum-catalogs/prep-stage/grade-1/prep-grade1-quadrilaterals-catalog";
import { matchPrepGrade1SpecialQuadsFollowupFigure } from "./curriculum-catalogs/prep-stage/grade-1/prep-grade1-special-quads-followup-catalog";
import { matchPrepGrade2GeometryFigure } from "./curriculum-catalogs/prep-stage/grade-2/prep-grade2-euclid-areas-catalog";
import { matchPrepGrade2TriangleCongruenceFigure } from "./curriculum-catalogs/prep-stage/grade-2/prep-grade2-triangle-congruence-catalog";
import { matchPrepGrade2PythagorasConverseFigure } from "./curriculum-catalogs/prep-stage/grade-2/prep-grade2-pythagoras-converse-catalog";
import { matchPrepGrade2ParallelApplicationsFigure } from "./curriculum-catalogs/prep-stage/grade-2/prep-grade2-parallel-applications-catalog";
import { matchPrepGrade2TriangleMediansFigure } from "./curriculum-catalogs/prep-stage/grade-2/prep-grade2-triangle-medians-catalog";
import { matchPrepGrade2IsoscelesTriangleFigure } from "./curriculum-catalogs/prep-stage/grade-2/prep-grade2-isosceles-triangle-catalog";
import { matchPrepGrade2IsoscelesFollowupFigure } from "./curriculum-catalogs/prep-stage/grade-2/prep-grade2-isosceles-followup-catalog";
import { matchPrepGrade2PolygonAnglesFigure } from "./curriculum-catalogs/prep-stage/grade-2/prep-grade2-polygon-angles-catalog";
import { matchPrepSimilarityGeometryFigure } from "./curriculum-catalogs/prep-stage/grade-3/prep-similarity-geometry-catalog";
import { matchPrepGrade3TriangleSimilarityFigure } from "./curriculum-catalogs/prep-stage/grade-3/prep-grade3-triangle-similarity-catalog";
import { matchPrepGrade3LineEquationFigure } from "./curriculum-catalogs/prep-stage/grade-3/prep-grade3-line-equation-catalog";
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

export const MODULE_ID_NATURAL_ARABIC_GEOMETRY_MATCHER = "natural_arabic_geometry_matcher" as const;

export function matchOptionalGeometryFigureFromArabicDescription(
  arabicDescription: string,
  figureId = "matched_geom_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const desc = (arabicDescription || "").trim();
  if (!desc) return undefined;

  if (/≅|تطابق|متطابق|صورة.*بالانعكاس/i.test(desc)) {
    const prep2Congruence = matchPrepGrade2TriangleCongruenceFigure(desc, figureId, notationLanguage);
    if (prep2Congruence) return prep2Congruence;
    const prep1Congruence = matchPrepGrade1GeometryFigure(desc, figureId, notationLanguage);
    if (prep1Congruence) return prep1Congruence;
  }

  const prepTriSim = matchPrepGrade3TriangleSimilarityFigure(desc, figureId, notationLanguage);
  if (prepTriSim) return prepTriSim;
  const prep3LineEq = matchPrepGrade3LineEquationFigure(desc, figureId, notationLanguage);
  if (prep3LineEq) return prep3LineEq;
  const prepSimMatch = matchPrepSimilarityGeometryFigure(desc, figureId, notationLanguage);
  if (prepSimMatch) return prepSimMatch;
  const prep2Congruence = matchPrepGrade2TriangleCongruenceFigure(desc, figureId, notationLanguage);
  if (prep2Congruence) return prep2Congruence;
  const prep2Pythagoras = matchPrepGrade2PythagorasConverseFigure(desc, figureId, notationLanguage);
  if (prep2Pythagoras) return prep2Pythagoras;
  const prep2Parallel = matchPrepGrade2ParallelApplicationsFigure(desc, figureId, notationLanguage);
  if (prep2Parallel) return prep2Parallel;
  const prep2Medians = matchPrepGrade2TriangleMediansFigure(desc, figureId, notationLanguage);
  if (prep2Medians) return prep2Medians;
  const prep2Isosceles = matchPrepGrade2IsoscelesTriangleFigure(desc, figureId, notationLanguage);
  if (prep2Isosceles) return prep2Isosceles;
  const prep2IsoFollowup = matchPrepGrade2IsoscelesFollowupFigure(desc, figureId, notationLanguage);
  if (prep2IsoFollowup) return prep2IsoFollowup;
  const prep2PolyAngles = matchPrepGrade2PolygonAnglesFigure(desc, figureId, notationLanguage);
  if (prep2PolyAngles) return prep2PolyAngles;
  const prep2Match = matchPrepGrade2GeometryFigure(desc, figureId, notationLanguage);
  if (prep2Match) return prep2Match;
  const prep1AnglesFollowup = matchPrepGrade1AnglesFollowupFigure(desc, figureId, notationLanguage);
  if (prep1AnglesFollowup) return prep1AnglesFollowup;
  const prep1Angles = matchPrepGrade1AnglesRelationshipsFigure(desc, figureId, notationLanguage);
  if (prep1Angles) return prep1Angles;
  const prep1Parallel = matchPrepGrade1ParallelismFigure(desc, figureId, notationLanguage);
  if (prep1Parallel) return prep1Parallel;
  const prep1TriAngles = matchPrepGrade1TriangleAnglesFigure(desc, figureId, notationLanguage);
  if (prep1TriAngles) return prep1TriAngles;
  const prep1Quads = matchPrepGrade1QuadrilateralsFigure(desc, figureId, notationLanguage);
  if (prep1Quads) return prep1Quads;
  const prep1SpecialQuads = matchPrepGrade1SpecialQuadsFollowupFigure(desc, figureId, notationLanguage);
  if (prep1SpecialQuads) return prep1SpecialQuads;
  const prep1Match = matchPrepGrade1GeometryFigure(desc, figureId, notationLanguage);
  if (prep1Match) return prep1Match;
  const primary6Match = matchPrimaryGrade6GeometryFigure(desc, figureId, notationLanguage);
  if (primary6Match) return primary6Match;
  const primary5Match = matchPrimaryGrade5GeometryFigure(desc, figureId, notationLanguage);
  if (primary5Match) return primary5Match;
  const primary4Match = matchPrimaryGrade4GeometryFigure(desc, figureId, notationLanguage);
  if (primary4Match) return primary4Match;

  if (/شاشة|كمبيوتر|تلفاز|تمثال|مبنى|برج|شجرة|سارية|حديقة|ملعب|سباعي|ثماني|مستوى\s*إحداثي|رسم\s*بياني|إحداثيات|نقطة\s*الأصل|خريطة|مجهر|حشرة|ظل/i.test(desc)) {
    return undefined;
  }

  if (/إقليدس|عمود.*وتر|مسقط/i.test(desc)) return buildTriangleEuclidAltitudeFigure({ figureId, notationLanguage });
  if (/متوسط|نقطة\s*تقاطع\s*المتوسطات/i.test(desc)) return buildTriangleMediansCentroidFigure({ figureId, notationLanguage });
  if (/طاليس|يوازي/i.test(desc) && /مثلث/i.test(desc) && !/منتصف/i.test(desc)) return buildTriangleThalesParallelFigure({ figureId, notationLanguage });
  if (/منصف\s*زاوية/i.test(desc)) return buildTriangleAngleBisectorFigure({ figureId, notationLanguage });
  if (/زاوية\s*خارجة/i.test(desc)) return buildTriangleExteriorAngleFigure({ figureId, notationLanguage });
  if (/منتصف/i.test(desc) && /مثلث/i.test(desc)) return buildTriangleMidsegmentFigure({ figureId, notationLanguage });

  if (/مماسان|مماسين|نقطة\s*خارج\s*الدائرة/i.test(desc)) return buildCircleExternalTangentsFigure({ figureId, notationLanguage });
  if (/زاوية\s*مماسية/i.test(desc)) return buildCircleTangentChordAngleFigure({ figureId, notationLanguage });
  if (/رباعي\s*دائري/i.test(desc)) return buildCircleCyclicQuadFigure({ figureId, notationLanguage });
  if (/محيطية|مركزية/i.test(desc)) return buildCircleCentralInscribedFigure({ figureId, notationLanguage });
  if (/دائرتان\s*متقاطعتان|خط\s*المركزين/i.test(desc)) return buildCircleIntersectingPairFigure({ figureId, notationLanguage });
  if (/دائرة|وتر\s*في\s*دائرة/i.test(desc)) return buildCircleChordBisectorFigure({ figureId, notationLanguage });

  if (/شبه\s*منحرف/i.test(desc)) return buildTrapezoidAltitudesFigure({ figureId, notationLanguage });
  if (/ساعة\s*رملية|فراشة|تقاطع\s*قطعتين/i.test(desc)) return buildHourglassButterflySimilarityFigure({ figureId, notationLanguage });
  if (/(?:^|\s)(?:مستطيل|مربع|معين)(?:\s|$|[،.])/i.test(desc) && !/مستطيلان|مربعان/i.test(desc)) return buildRectangleSquareRhombusFigure({ figureId, notationLanguage });
  if (/متوازي\s*أضلاع/i.test(desc) && !/متوازيا/i.test(desc)) return buildParallelogramDiagonalsFigure({ figureId, notationLanguage });

  if (/خط\s*الأعداد|فترة/i.test(desc)) return buildNumberLineIntervalFigure({ figureId, notationLanguage });
  if (/منحنى|دالة\s*تربيعية|شبكة\s*بيانية/i.test(desc)) return buildQuadraticParabolaCurveFigure({ figureId, notationLanguage });

  if (/هرم/i.test(desc)) return buildRegularPyramid3DFigure({ figureId, notationLanguage });
  if (/مخروط|أسطوانة/i.test(desc)) return buildRightCircularCone3DFigure({ figureId, notationLanguage });
  if (/مكعب|متوازي\s*مستطيلات/i.test(desc)) return buildCubeCuboid3DFigure({ figureId, notationLanguage });
  if (/مستوى\s*مائل|قوى|رد\s*الفعل/i.test(desc)) return buildInclinedPlaneForcesFigure({ figureId, notationLanguage });
  if (/مثلث/i.test(desc) && /يوازي|توازي|طاليس/i.test(desc)) return buildTriangleThalesParallelFigure({ figureId, notationLanguage });

  return undefined;
}

export function matchArabicDescriptionToCanonicalGeometryFigure(
  arabicDescription: string,
  figureId = "matched_geom_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR {
  return (
    matchOptionalGeometryFigureFromArabicDescription(arabicDescription, figureId, notationLanguage) ??
    buildTriangleMidsegmentFigure({ figureId, notationLanguage })
  );
}

export function matchGeometryWithDiagnostics(
  desc: string,
  figureId: string,
  notation: MathNotationLanguage = "english"
): {
  readonly figure?: CanonicalGeometryFigureIR;
  readonly warnings: readonly string[];
  readonly source: "compositor" | "catalog" | "none";
} {
  const composed = composeFigureFromGeometryDescription(desc, figureId, notation);
  if (composed.figure && composed.warnings.length === 0) {
    return { figure: composed.figure, warnings: [], source: "compositor" };
  }
  const legacy = matchOptionalGeometryFigureFromArabicDescription(desc, figureId, notation);
  if (legacy) {
    return { figure: legacy, warnings: composed.warnings, source: "catalog" };
  }
  if (composed.figure) {
    return { figure: composed.figure, warnings: composed.warnings, source: "compositor" };
  }
  return {
    warnings: composed.warnings.length ? composed.warnings : ["لم يُتعرَّف على الشكل من الوصف."],
    source: "none",
  };
}
