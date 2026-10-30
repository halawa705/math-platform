/**
 * @file prep-grade3-triangle-similarity-catalog.ts
 * @description السجل المركزي ومنسق أشكال تشابه المثلثات للصف الثالث الإعدادي / الأول الثانوي:
 * - تقاطع الفراشة والمقص المتقابل بالرأس (ΔABC ~ ΔADE).
 * - المثلثات المتداخلة بزاوية مشتركة B وقاطع داخلي (ΔABC ~ ΔDBA).
 * - القاطع العكسي غير الموازي (ΔABC ~ ΔADH).
 * - توازي طاليس وتوازي حرف Z (XY || BC و AB || DE).
 * - تشابه المثلثات القائمة وإسقاط عمود إقليدس (ΔADB ~ ΔBDC).
 * - المثلثات المنفصلة بزوايا وأبعاد متناسبة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildTriangleButterflyAtApexAFigure,
  buildParallelogramSecantButterflyFigure,
} from "./prep-grade3-triangle-butterfly-similarity-builder";
import {
  buildTriangleNestedWithCommonAngleBFigure,
  buildTriangleAntiparallelSecantFigure,
} from "./prep-grade3-triangle-nested-similarity-builder";
import {
  buildTriangleThalesParallelSimilarityFigure,
  buildTriangleZShapeParallelFigure,
} from "./prep-grade3-triangle-thales-similarity-builder";
import { buildTriangleEuclidSimilarityAltitudeFigure } from "./prep-grade3-triangle-euclid-similarity-builder";
import { buildTwoSeparateSimilarTrianglesWithAngle120Figure } from "./prep-grade3-triangle-separate-similarity-builder";

export const MODULE_ID_PREP_GRADE3_TRIANGLE_SIMILARITY_CATALOG =
  "prep_grade3_triangle_similarity_catalog" as const;

export function matchPrepGrade3TriangleSimilarityFigure(
  description: string,
  figureId = "prep3_tri_sim_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  // 1. تقاطع الفراشة / مقص متقابل بالرأس عند A أو في متوازي أضلاع
  if (/متوازي\s*أضلاع.*ABF|ABF\s*~\s*DEF|FCG\s*~\s*EBG/i.test(d)) {
    return buildParallelogramSecantButterflyFigure({ figureId, notationLanguage });
  }
  if (/متقابل.*بالرأس|فراشة|مقص|ABC\s*~\s*ADE|ADE|علامة\s*\*/i.test(d) && /مثلث/i.test(d)) {
    return buildTriangleButterflyAtApexAFigure({ figureId, notationLanguage });
  }

  // 2. تشابه المثلثات القائمة وإسقاط عمود من رأس القائمة (إقليدس)
  if ((/قائم.*عمود|BD\s*⊥\s*AC|AD\s*⊥\s*BC/i.test(d) && /تشابه|~/i.test(d)) || /ADB\s*~\s*BDC|إقليدس.*تشابه/i.test(d)) {
    return buildTriangleEuclidSimilarityAltitudeFigure({ figureId, notationLanguage });
  }

  // 3. مثلثان متداخلان بزاوية مشتركة B وقاطع داخلي (مثال 7)
  if (/زاوية\s*مشتركة\s*B|زاوية\s*مشتركة\s*ب|ABC\s*~\s*DBA|DBA|قاطع\s*داخلي/i.test(d)) {
    return buildTriangleNestedWithCommonAngleBFigure({ figureId, notationLanguage });
  }

  // 4. قاطع عكسي غير موازي (ADH أو AED)
  if (/قاطع\s*عكسي|غير\s*مواز|ABC\s*~\s*ADH|ABC\s*~\s*AED|ADH|AED/i.test(d)) {
    return buildTriangleAntiparallelSecantFigure({ figureId, notationLanguage });
  }

  // 5. توازي متبادل على شكل حرف Z (حاول 7 ومسألة 14)
  if (/توازي\s*متبادل|حرف\s*Z|ABC\s*~\s*CDE|CDE|DE\s*=\s*X/i.test(d)) {
    return buildTriangleZShapeParallelFigure({ figureId, notationLanguage });
  }

  // 6. توازي طاليس داخل المثلث (XY || BC أو DE || BC)
  if ((/يوازي|توازي|طاليس/i.test(d) && /مثلث/i.test(d)) || /XY\s*\/\/\s*BC|AXY\s*~\s*ABC/i.test(d)) {
    return buildTriangleThalesParallelSimilarityFigure({ figureId, notationLanguage });
  }

  // 7. مثلثان منفصلان بزاوية 120° (مثال 6)
  if ((/120°|120\s*درجة/i.test(d) && (/تشابه|متشابه|منفصل/i.test(d) || /DEF/i.test(d))) || /ABC\s*~\s*DEF/i.test(d)) {
    return buildTwoSeparateSimilarTrianglesWithAngle120Figure({ figureId, notationLanguage });
  }

  // 8. مطابقة عامة لتشابه المثلثات
  if (/تشابه\s*مثلث|مثلثين\s*متشابهين|مثلثان\s*متشابهان/i.test(d)) {
    return buildTriangleButterflyAtApexAFigure({ figureId, notationLanguage });
  }

  return undefined;
}
