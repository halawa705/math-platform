/**
 * @file geometry-catalog-match-registry.ts
 * @description السجل المركزي الموحد لمطابقات الكتالوجات المنهجية (المرحلة 2.3):
 * يستبدل سلاسل `??` العشوائية بسجل منظم يفحص جميع الكتالوجات ويكتشف الالتباس والتناقض بدقة،
 * مانعاً فوز الكتالوجات الخاطئة بحسب أسبقية الترتيب في الكود.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";

import { matchPrimaryGrade3GeometryFigure } from "./primary-stage/grade-3/primary-grade3-geometry-catalog";
import { matchPrimaryGrade4VisualModelsFigure } from "./primary-stage/grade-4/primary-grade4-visual-models-catalog";
import { matchPrimaryGrade4GeometryFigure } from "./primary-stage/grade-4/primary-grade4-geometry-catalog";
import { matchPrimaryGrade5GeometryFigure } from "./primary-stage/grade-5/primary-grade5-geometry-catalog";
import { matchPrimaryGrade6GeometryFigure } from "./primary-stage/grade-6/primary-grade6-geometry-catalog";

import { matchPrepGrade1GeometryFigure } from "./prep-stage/grade-1/prep-grade1-triangle-congruence-catalog";
import { matchPrepGrade1AnglesRelationshipsFigure } from "./prep-stage/grade-1/prep-grade1-angles-relationships-catalog";
import { matchPrepGrade1AnglesFollowupFigure } from "./prep-stage/grade-1/prep-grade1-angles-followup-catalog";
import { matchPrepGrade1ParallelismFigure } from "./prep-stage/grade-1/prep-grade1-parallelism-catalog";
import { matchPrepGrade1TriangleAnglesFigure } from "./prep-stage/grade-1/prep-grade1-triangle-angles-catalog";
import { matchPrepGrade1QuadrilateralsFigure } from "./prep-stage/grade-1/prep-grade1-quadrilaterals-catalog";
import { matchPrepGrade1SpecialQuadsFollowupFigure } from "./prep-stage/grade-1/prep-grade1-special-quads-followup-catalog";
import { matchPrepGrade1PolygonsFigure } from "./prep-stage/grade-1/prep-grade1-polygons-catalog";
import { matchPrepGrade1CoordinatesFigure } from "./prep-stage/grade-1/prep-grade1-coordinates-catalog";

import { matchPrepGrade2GeometryFigure } from "./prep-stage/grade-2/prep-grade2-euclid-areas-catalog";
import { matchPrepGrade2TriangleCongruenceFigure } from "./prep-stage/grade-2/prep-grade2-triangle-congruence-catalog";
import { matchPrepGrade2PythagorasConverseFigure } from "./prep-stage/grade-2/prep-grade2-pythagoras-converse-catalog";
import { matchPrepGrade2ParallelApplicationsFigure } from "./prep-stage/grade-2/prep-grade2-parallel-applications-catalog";
import { matchPrepGrade2TriangleMediansFigure } from "./prep-stage/grade-2/prep-grade2-triangle-medians-catalog";
import { matchPrepGrade2IsoscelesTriangleFigure } from "./prep-stage/grade-2/prep-grade2-isosceles-triangle-catalog";
import { matchPrepGrade2IsoscelesFollowupFigure } from "./prep-stage/grade-2/prep-grade2-isosceles-followup-catalog";
import { matchPrepGrade2PolygonAnglesFigure } from "./prep-stage/grade-2/prep-grade2-polygon-angles-catalog";

import { matchPrepSimilarityGeometryFigure } from "./prep-stage/grade-3/prep-similarity-geometry-catalog";
import { matchPrepGrade3TriangleSimilarityFigure } from "./prep-stage/grade-3/prep-grade3-triangle-similarity-catalog";
import { matchPrepGrade3LineEquationFigure } from "./prep-stage/grade-3/prep-grade3-line-equation-catalog";

export const MODULE_ID_GEOMETRY_CATALOG_MATCH_REGISTRY =
  "geometry_catalog_match_registry" as const;

export interface CatalogMatcherDescriptor {
  readonly id: string;
  readonly gradeId: string;
  readonly stage: "primary" | "preparatory";
  readonly match: (
    desc: string,
    figureId: string,
    notation: MathNotationLanguage
  ) => CanonicalGeometryFigureIR | undefined;
}

export interface CatalogRegistryMatchResult {
  readonly figure?: CanonicalGeometryFigureIR;
  readonly matchedCatalogId?: string;
  readonly ambiguity: boolean;
  readonly candidateCatalogIds: readonly string[];
}

export const GEOMETRY_CATALOG_MATCHERS: readonly CatalogMatcherDescriptor[] = [
  // المرحلة الابتدائية
  { id: "primary-3-geometry", gradeId: "prim_grade_3", stage: "primary", match: matchPrimaryGrade3GeometryFigure },
  { id: "primary-4-visual-models", gradeId: "prim_grade_4", stage: "primary", match: matchPrimaryGrade4VisualModelsFigure },
  { id: "primary-4-geometry", gradeId: "prim_grade_4", stage: "primary", match: matchPrimaryGrade4GeometryFigure },
  { id: "primary-5-geometry", gradeId: "prim_grade_5", stage: "primary", match: matchPrimaryGrade5GeometryFigure },
  { id: "primary-6-geometry", gradeId: "prim_grade_6", stage: "primary", match: matchPrimaryGrade6GeometryFigure },

  // المرحلة الإعدادية - الصف الأول
  { id: "prep-1-triangle-congruence", gradeId: "prep_grade_1", stage: "preparatory", match: matchPrepGrade1GeometryFigure },
  { id: "prep-1-angles-relationships", gradeId: "prep_grade_1", stage: "preparatory", match: matchPrepGrade1AnglesRelationshipsFigure },
  { id: "prep-1-angles-followup", gradeId: "prep_grade_1", stage: "preparatory", match: matchPrepGrade1AnglesFollowupFigure },
  { id: "prep-1-parallelism", gradeId: "prep_grade_1", stage: "preparatory", match: matchPrepGrade1ParallelismFigure },
  { id: "prep-1-triangle-angles", gradeId: "prep_grade_1", stage: "preparatory", match: matchPrepGrade1TriangleAnglesFigure },
  { id: "prep-1-quadrilaterals", gradeId: "prep_grade_1", stage: "preparatory", match: matchPrepGrade1QuadrilateralsFigure },
  { id: "prep-1-special-quads-followup", gradeId: "prep_grade_1", stage: "preparatory", match: matchPrepGrade1SpecialQuadsFollowupFigure },
  { id: "prep-1-polygons", gradeId: "prep_grade_1", stage: "preparatory", match: matchPrepGrade1PolygonsFigure },
  { id: "prep-1-coordinates", gradeId: "prep_grade_1", stage: "preparatory", match: matchPrepGrade1CoordinatesFigure },

  // المرحلة الإعدادية - الصف الثاني
  { id: "prep-2-euclid-areas", gradeId: "prep_grade_2", stage: "preparatory", match: matchPrepGrade2GeometryFigure },
  { id: "prep-2-triangle-congruence", gradeId: "prep_grade_2", stage: "preparatory", match: matchPrepGrade2TriangleCongruenceFigure },
  { id: "prep-2-pythagoras-converse", gradeId: "prep_grade_2", stage: "preparatory", match: matchPrepGrade2PythagorasConverseFigure },
  { id: "prep-2-parallel-applications", gradeId: "prep_grade_2", stage: "preparatory", match: matchPrepGrade2ParallelApplicationsFigure },
  { id: "prep-2-triangle-medians", gradeId: "prep_grade_2", stage: "preparatory", match: matchPrepGrade2TriangleMediansFigure },
  { id: "prep-2-isosceles-triangle", gradeId: "prep_grade_2", stage: "preparatory", match: matchPrepGrade2IsoscelesTriangleFigure },
  { id: "prep-2-isosceles-followup", gradeId: "prep_grade_2", stage: "preparatory", match: matchPrepGrade2IsoscelesFollowupFigure },
  { id: "prep-2-polygon-angles", gradeId: "prep_grade_2", stage: "preparatory", match: matchPrepGrade2PolygonAnglesFigure },

  // المرحلة الإعدادية - الصف الثالث
  { id: "prep-3-similarity-geometry", gradeId: "prep_grade_3", stage: "preparatory", match: matchPrepSimilarityGeometryFigure },
  { id: "prep-3-triangle-similarity", gradeId: "prep_grade_3", stage: "preparatory", match: matchPrepGrade3TriangleSimilarityFigure },
  { id: "prep-3-line-equation", gradeId: "prep_grade_3", stage: "preparatory", match: matchPrepGrade3LineEquationFigure },
];

/**
 * يفحص جميع الكتالوجات في السجل ويكشف أي تعارض أو التباس
 */
export function matchFromCatalogRegistry(
  desc: string,
  figureId: string,
  notation: MathNotationLanguage = "english",
  isSimilarityContext = false
): CatalogRegistryMatchResult {
  const candidates: Array<{ id: string; figure: CanonicalGeometryFigureIR }> = [];

  // «أ د ⊥ ب جـ» بحروف عربية بلا زوايا/برهان = ارتفاع ابتدائي (مساحة المثلث) لا سياق إعدادي
  const hasArabicGridPoints = /[أ-ي]ـ?\s*\(\s*\d+\s*[,،]\s*\d+\s*\)/.test(desc) && !/[A-Za-z]/.test(desc);
  const descForPrepContextTest = (hasArabicGridPoints ? desc.replace(/مستوى\s*(?:ال)?إحداثي|شبكة\s*(?:ال)?إحداثيات/g, " ") : desc)
    .replace(/(?:^|[؛;،\s])[أ-ي]ـ?\s+[أ-ي]ـ?\s*⊥\s*[أ-ي]ـ?\s+[أ-ي]ـ?(?=\s*$|\s*[؛;،])/g, " ");
  const isPrepContext =
    /(?:برهان|أثبت|معادلة|إحداثي|احداثي|ميل|متوسط|فيثاغورس|إقليدس|اقليدس|طاليس|تشابه|تطابق|محيطية|مركزية|مماس|قاطع|وتر|رباعي\s*دائري|[A-Z]{2,4}\s*~|[A-Z]{2,4}\s*≅|\\sim|\\cong|⊥|\/\/|∠|قطراه|أقطار|قطرا\s*(?:المتوازي|المستطيل|المربع|المعين|الشكل)|زاويتا\s*قاعدت|(?:ال)?خارج(?:ي)?ة|محاور|تماثل|استقامة\s*واحدة|تناظر|تبادل|تداخل|حرف\s*[ZFUE]|[A-Z]{2,4}|\b[a-zA-Z]\b\s*=|(?:\d+[a-zA-Z]))/i.test(
      descForPrepContextTest
    );

  for (const entry of GEOMETRY_CATALOG_MATCHERS) {
    // حماية: استبعاد كتالوجات الابتدائي إذا كانت المسألة تتضمن نظريات ومفاهيم إعدادية صريحة
    if (entry.stage === "primary" && isPrepContext) {
      continue;
    }

    // حماية: كتالوجات الصف الأول والتطابق لا تعمل في سياق تشابه المثلثات والمضلعات الصريح (3ع)
    if (
      isSimilarityContext &&
      (entry.id === "prep-2-triangle-congruence" ||
        entry.id === "prep-1-angles-followup" ||
        entry.id === "prep-1-angles-relationships")
    ) {
      continue;
    }

    try {
      const fig = entry.match(desc, figureId, notation);
      if (fig) {
        candidates.push({ id: entry.id, figure: fig });
      }
    } catch {
      // حماية من انهيار أي كتالوج
    }
  }

  if (candidates.length === 0) {
    return { ambiguity: false, candidateCatalogIds: [] };
  }

  if (candidates.length === 1) {
    return {
      figure: candidates[0].figure,
      matchedCatalogId: candidates[0].id,
      ambiguity: false,
      candidateCatalogIds: [candidates[0].id],
    };
  }

  // إذا تطابق أكثر من كتالوج، نتحقق هل هي نفس الهيئة تماماً أم هناك التباس فعلي
  const first = candidates[0].figure;
  const isIdentical = candidates.every(
    (c) =>
      c.figure.branchId === first.branchId &&
      c.figure.vertices.length === first.vertices.length
  );

  if (isIdentical) {
    return {
      figure: first,
      matchedCatalogId: candidates[0].id,
      ambiguity: false,
      candidateCatalogIds: candidates.map((c) => c.id),
    };
  }

  // التباس حقيقي: أشكال متناقضة تنافست على نفس المسألة
  return {
    ambiguity: true,
    candidateCatalogIds: candidates.map((c) => c.id),
  };
}
