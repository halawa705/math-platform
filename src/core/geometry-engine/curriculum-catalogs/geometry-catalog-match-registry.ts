/**
 * @file geometry-catalog-match-registry.ts
 * @description السجل الموحد لمطابقات الأشكال البصرية والمناهج التأسيسية للمرحلة الابتدائية (الصفوف 3–6).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 110 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../ssot/numeral-and-unit-ssot";

import { matchPrimaryGrade3GeometryFigure } from "./primary-stage/grade-3/primary-grade3-geometry-catalog";
import { matchPrimaryGrade4VisualModelsFigure } from "./primary-stage/grade-4/primary-grade4-visual-models-catalog";
import { matchPrimaryGrade4GeometryFigure } from "./primary-stage/grade-4/primary-grade4-geometry-catalog";
import { matchPrimaryGrade5GeometryFigure } from "./primary-stage/grade-5/primary-grade5-geometry-catalog";
import { matchPrimaryGrade6GeometryFigure } from "./primary-stage/grade-6/primary-grade6-geometry-catalog";

export const MODULE_ID_GEOMETRY_CATALOG_MATCH_REGISTRY =
  "geometry_catalog_match_registry" as const;

export interface CatalogMatcherDescriptor {
  readonly id: string;
  readonly gradeId: string;
  readonly stage: "primary";
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
  { id: "primary-3-geometry", gradeId: "prim_grade_3", stage: "primary", match: matchPrimaryGrade3GeometryFigure },
  { id: "primary-4-visual-models", gradeId: "prim_grade_4", stage: "primary", match: matchPrimaryGrade4VisualModelsFigure },
  { id: "primary-4-geometry", gradeId: "prim_grade_4", stage: "primary", match: matchPrimaryGrade4GeometryFigure },
  { id: "primary-5-geometry", gradeId: "prim_grade_5", stage: "primary", match: matchPrimaryGrade5GeometryFigure },
  { id: "primary-6-geometry", gradeId: "prim_grade_6", stage: "primary", match: matchPrimaryGrade6GeometryFigure },
];

/**
 * يفحص كتالوجات المرحلة الابتدائية ويكشف أي تعارض أو التباس، مع حجبها عن السياقات الإعدادية الصريحة.
 */
export function matchFromCatalogRegistry(
  desc: string,
  figureId: string,
  notation: MathNotationLanguage = "english",
  _isSimilarityContext = false
): CatalogRegistryMatchResult {
  const candidates: Array<{ id: string; figure: CanonicalGeometryFigureIR }> = [];

  const hasArabicGridPoints = /[أ-ي]ـ?\s*\(\s*\d+\s*[,،]\s*\d+\s*\)/.test(desc) && !/[A-Za-z]/.test(desc);
  const descForPrepContextTest = (
    hasArabicGridPoints
      ? desc.replace(/مستوى\s*(?:ال)?إحداثي|شبكة\s*(?:ال)?إحداثيات|إحداثي(?:ات)?/g, " ")
      : desc
  ).replace(/(?:^|[؛;،\s])[أ-ي]ـ?\s+[أ-ي]ـ?\s*⊥\s*[أ-ي]ـ?\s+[أ-ي]ـ?(?=\s*$|\s*[؛;،])/g, " ");

  const isPrepContext =
    /(?:برهان|أثبت|معادلة|إحداثي|احداثي|ميل|متوسط|فيثاغورس|إقليدس|اقليدس|طاليس|تشابه|تطابق|محيطية|مركزية|مماس|قاطع|وتر|رباعي\s*دائري|[A-Z]{2,4}\s*~|[A-Z]{2,4}\s*≅|\\sim|\\cong|⊥|\/\/|∠|قطراه|أقطار|قطرا\s*(?:المتوازي|المستطيل|المربع|المعين|الشكل)|زاويتا\s*قاعدت|(?:ال)?خارج(?:ي)?ة|محاور|تماثل|استقامة\s*واحدة|تناظر|تبادل|تداخل|حرف\s*[ZFUE]|[A-Z]{2,4}|\b[a-zA-Z]\b\s*=|(?:\d+[a-zA-Z]))/i.test(
      descForPrepContextTest
    );

  if (isPrepContext) {
    return { ambiguity: false, candidateCatalogIds: [] };
  }

  for (const entry of GEOMETRY_CATALOG_MATCHERS) {
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

  return {
    ambiguity: true,
    candidateCatalogIds: candidates.map((c) => c.id),
  };
}
