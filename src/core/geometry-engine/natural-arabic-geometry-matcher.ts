/**
 * @file natural-arabic-geometry-matcher.ts
 * @description المترجم الحتمي الموحد للوصف العربي الطبيعي (`[رسم هندسي: ...]`) إلى فروع السجل الهندسي القياسي (`CanonicalGeometryFigureIR`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 185 سطراً).
 */

import type { CanonicalGeometryFigureIR, FigureTriStateDecision } from "../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildParametricSimilarityFigure } from "./similarity-family/similarity-parametric-builder-orchestrator";
import { convertGeometryLatexToPlainText } from "./description-intake/geometry-latex-to-plain-normalizer";
import { healFourRaysHallucination } from "../ingestion/notebooklm-citation-latex-sanitizer";
import {
  isFigureFaithfulToPrompt,
  isPurelyTheoreticalNoDiagramProblem,
} from "./verification/geometry-figure-fidelity-gate";
import { applyAskedQuestionMarkToFigure } from "./verification/geometry-asked-question-mark-resolver";
import { evaluateFigureTriStateDecision } from "./verification/geometry-tri-state-decision-gate";
import { extractGeometryProblemSpecDual } from "./description-intake/geometry-problem-spec-extractor";
import { verifyProblemSpecMathematicalConsistency } from "./verification/geometry-problem-spec-consistency-checker";
import { composeFigureFromGeometryDescription } from "./fact-compositor/geo-figure-composer";
import { refineFigureToMatchGivens } from "./constraint-refiner/geometry-figure-constraint-refiner";
import { verifyGeometryFigure } from "./verification/geometry-figure-verification-orchestrator";
import { matchFromCatalogRegistry } from "./curriculum-catalogs/geometry-catalog-match-registry";
import { buildTriangleMidsegmentFigure } from "./triangle-family/triangle-midsegment-branch";
import { buildTriangleThalesParallelFigure } from "./triangle-family/triangle-thales-parallel-branch";
import { buildTriangleMediansCentroidFigure } from "./triangle-family/triangle-medians-centroid-branch";
import { buildTriangleEuclidAltitudeFigure } from "./triangle-family/triangle-euclid-altitude-branch";
import { isSimilarityGeometryContext } from "./similarity-family/similarity-context-detector";
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
import { buildCoordinatePlanePolygonFigure } from "./analytic-function-family/coordinate-plane-polygon-plotter";
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
  if (isPurelyTheoreticalNoDiagramProblem(desc)) return undefined;

  const cleanDesc = convertGeometryLatexToPlainText(desc);
  const isSimilarity = isSimilarityGeometryContext(cleanDesc);

  if (isSimilarity) {
    const parametricSim = buildParametricSimilarityFigure(desc, figureId, notationLanguage);
    if (parametricSim && isFigureFaithfulToPrompt(parametricSim, desc)) {
      return parametricSim;
    }
  }

  const stageRes = matchFromCatalogRegistry(desc, figureId, notationLanguage, isSimilarity);
  if (stageRes.ambiguity) {
    return undefined;
  }
  if (stageRes.figure) {
    return stageRes.figure;
  }

  if (/منحنى|دالة\s*تربيعية|شبكة\s*بيانية/i.test(desc)) return buildQuadraticParabolaCurveFigure({ figureId, notationLanguage, description: desc });
  if (/خط\s*الأعداد|فترة/i.test(desc)) return buildNumberLineIntervalFigure({ figureId, notationLanguage, description: desc });
  if (/(?:مستوى\s*إحداثي|شبكة\s*تربيعية|محوري\s*الإحداثيات)/i.test(desc) && /(?:ارسم|مث[ّل]?\s*بياني|عي[ّن]?\s*النقاط|مضلع|قطعة)/i.test(desc)) {
    const coordPoly = buildCoordinatePlanePolygonFigure({ figureId, notationLanguage, description: desc });
    if (coordPoly) return coordPoly;
  }

  // مراجعة قائمة الحجب: تم استبعاد الظل والعمود والشجرة والسارية لعدم حجب مسائل التشابه التطبيقية (المهمة 2.6)
  if (/شاشة|كمبيوتر|تلفاز|حديقة|ملعب|سباعي|ثماني|مستوى\s*إحداثي|رسم\s*بياني|إحداثيات|نقطة\s*الأصل|خريطة|مجهر|حشرة/i.test(desc)) {
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

  if (/هرم/i.test(desc)) {
    const baseM = cleanDesc.match(/(?:طول\s*)?(?:ضلع\s*قاعدت[هـا]?|ضلعه)\s*=?\s*(\d+(?:\.\d+)?)/i);
    const heightM = cleanDesc.match(/ارتفاع[هـا]?\s*=?\s*(\d+(?:\.\d+)?)/i);
    return buildRegularPyramid3DFigure({ figureId, notationLanguage, baseSideCm: baseM ? Number(baseM[1]) : undefined, heightCm: heightM ? Number(heightM[1]) : undefined });
  }
  if (/مخروط|أسطوانة/i.test(desc)) {
    const radM = cleanDesc.match(/(?:نصف\s*قطر[هـا]?|نق)\s*=?\s*(\d+(?:\.\d+)?)/i);
    const heightM = cleanDesc.match(/ارتفاع[هـا]?\s*=?\s*(\d+(?:\.\d+)?)/i);
    const slantM = cleanDesc.match(/(?:راسم[هـا]?|طول\s*راسم[هـا]?)\s*=?\s*(\d+(?:\.\d+)?)/i);
    return buildRightCircularCone3DFigure({ figureId, notationLanguage, radiusCm: radM ? Number(radM[1]) : undefined, heightCm: heightM ? Number(heightM[1]) : undefined, slantCm: slantM ? Number(slantM[1]) : undefined });
  }
  if (/مكعب|متوازي\s*مستطيلات/i.test(desc)) {
    const dimsM = cleanDesc.match(/أبعاده\s*(\d+(?:\.\d+)?)\s*[،,و]\s*(\d+(?:\.\d+)?)\s*[،,و]\s*(\d+(?:\.\d+)?)/i);
    const edgeM = cleanDesc.match(/(?:طول\s*حرفه|حرفه|ضلعه)\s*=?\s*(\d+(?:\.\d+)?)/i);
    const lenM = cleanDesc.match(/طول[هـا]?\s*=?\s*(\d+(?:\.\d+)?)/i);
    const widM = cleanDesc.match(/عرض[هـا]?\s*=?\s*(\d+(?:\.\d+)?)/i);
    const hgtM = cleanDesc.match(/ارتفاع[هـا]?\s*=?\s*(\d+(?:\.\d+)?)/i);
    const cubeEdge = edgeM ? Number(edgeM[1]) : undefined;
    return buildCubeCuboid3DFigure({
      figureId,
      notationLanguage,
      lengthCm: dimsM ? Number(dimsM[1]) : lenM ? Number(lenM[1]) : cubeEdge,
      widthCm: dimsM ? Number(dimsM[2]) : widM ? Number(widM[1]) : cubeEdge,
      heightCm: dimsM ? Number(dimsM[3]) : hgtM ? Number(hgtM[1]) : cubeEdge,
    });
  }
  if (/مستوى\s*مائل|قوى|رد\s*الفعل/i.test(desc)) return buildInclinedPlaneForcesFigure({ figureId, notationLanguage });
  if (/مثلث/i.test(desc) && /يوازي|توازي|طاليس/i.test(desc)) return buildTriangleThalesParallelFigure({ figureId, notationLanguage });

  return undefined;
}

export function matchArabicDescriptionToCanonicalGeometryFigure(
  arabicDescription: string,
  figureId = "matched_geom_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  return matchOptionalGeometryFigureFromArabicDescription(arabicDescription, figureId, notationLanguage);
}

const TOPOLOGY_LOCKED_BRANCH_IDS: ReadonlySet<string> = new Set([
  "triangle_thales_parallel_line",
  "quad_hourglass_butterfly_similarity",
  "triangle_euclid_right_altitude",
  "quad_composite_rectilinear_shape",
]);

function finalizeVerifiedFigure(
  figure: CanonicalGeometryFigureIR,
  warnings: readonly string[]
): { readonly figure: CanonicalGeometryFigureIR; readonly warnings: readonly string[] } {
  if (figure.familyId === "statistics_family" || figure.familyId === "analytic_coordinate_family" || figure.familyId === "solid3d_mechanics_family" || Boolean(figure.rawSvgMarkup)) {
    return { figure, warnings };
  }
  if (figure.branchId && TOPOLOGY_LOCKED_BRANCH_IDS.has(figure.branchId)) {
    const report = verifyGeometryFigure(figure);
    const issues = report.issues.filter((i) => i.severity === "error" && i.rule !== "length-scale" && i.rule !== "length-order").map((i) => `تحقق الشكل: ${i.message}`);
    return { figure, warnings: [...warnings, ...issues] };
  }
  const refined = refineFigureToMatchGivens(figure);
  const remaining = refined.report.issues.filter((i) => i.severity === "error").map((i) => `تحقق الشكل: ${i.message}`);
  return { figure: refined.figure, warnings: [...warnings, ...remaining] };
}

export function matchGeometryWithDiagnostics(
  desc: string,
  figureId: string,
  notation: MathNotationLanguage = "english"
): {
  readonly figure?: CanonicalGeometryFigureIR;
  readonly warnings: readonly string[];
  readonly source: "compositor" | "catalog" | "none";
  readonly decision: FigureTriStateDecision;
} {
  const cleanDesc = healFourRaysHallucination(desc);
  if (isPurelyTheoreticalNoDiagramProblem(cleanDesc)) {
    return { warnings: ["المسألة نظرية لفظية عامة ولا تتطلب شكلاً هندسياً."], source: "none", decision: "red" };
  }
  const specDual = extractGeometryProblemSpecDual(cleanDesc);
  const consistency = verifyProblemSpecMathematicalConsistency(specDual.spec);
  if (!consistency.passed) {
    return { warnings: consistency.violations, source: "none", decision: "red" };
  }
  const composed = composeFigureFromGeometryDescription(cleanDesc, figureId, notation);
  if (composed.figure) {
    const withAsked = applyAskedQuestionMarkToFigure(composed.figure, cleanDesc);
    const verified = finalizeVerifiedFigure(withAsked, []);
    const isLocked = Boolean(verified.figure.branchId && TOPOLOGY_LOCKED_BRANCH_IDS.has(verified.figure.branchId));
    const tri = evaluateFigureTriStateDecision(verified.figure, cleanDesc, verified.warnings, isLocked);
    if (tri.decision === "green") return { figure: verified.figure, warnings: [], source: "compositor", decision: "green" };
  }
  const legacy = matchOptionalGeometryFigureFromArabicDescription(cleanDesc, figureId, notation);
  if (legacy) {
    const withAsked = applyAskedQuestionMarkToFigure(legacy, cleanDesc);
    const verifiedLegacy = finalizeVerifiedFigure(withAsked, []);
    const isLocked = Boolean(verifiedLegacy.figure.branchId && TOPOLOGY_LOCKED_BRANCH_IDS.has(verifiedLegacy.figure.branchId));
    const triLegacy = evaluateFigureTriStateDecision(verifiedLegacy.figure, cleanDesc, verifiedLegacy.warnings, isLocked);
    if (triLegacy.decision === "green") return { figure: verifiedLegacy.figure, warnings: [], source: "catalog", decision: "green" };
    return { warnings: triLegacy.reasons, source: "none", decision: triLegacy.decision };
  }
  if (composed.figure) {
    const withAsked = applyAskedQuestionMarkToFigure(composed.figure, cleanDesc);
    const verified = finalizeVerifiedFigure(withAsked, composed.warnings);
    const isLocked = Boolean(verified.figure.branchId && TOPOLOGY_LOCKED_BRANCH_IDS.has(verified.figure.branchId));
    const tri = evaluateFigureTriStateDecision(verified.figure, cleanDesc, verified.warnings, isLocked);
    return { warnings: tri.reasons.length > 0 ? tri.reasons : ["تعذر التحقق الكامل من مطابقة الشكل للمعطيات."], source: "none", decision: tri.decision };
  }
  const emptyTri = evaluateFigureTriStateDecision(null, cleanDesc, composed.warnings);
  return { warnings: emptyTri.reasons, source: "none", decision: emptyTri.decision };
}


