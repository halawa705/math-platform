/**
 * @file prep-similarity-geometry-catalog.ts
 * @description السجل المركزي ومنسق أشكال ورسومات درس تشابه المضلعات وفق كتاب المعاصر ووزارة التربية والتعليم:
 * - يدعم الأشكال الرباعية العامة بجذور وزوايا، متوازي الأضلاع، المعين، شبه المنحرف القائم بمجاهيل،
 * - شكل الطائرة الورقية (دالتون)، المضلع الخماسي، الأشكال المركبة ذات القاعدة المشتركة، والتحليل البارامتري الذكي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildSimilarQuadsWithRadicalsAndAnglesFigure,
  buildSimilarQuadsWithObtuseAngleFigure,
  buildSimilarQuadsWithAngleMarksFigure,
} from "./prep-similarity-general-quads-builder";
import {
  buildSimilarRightTrapezoidsWithVariablesFigure,
  buildSimilarParallelogramsFigure,
  buildSimilarRhombusesFigure,
} from "./prep-similarity-special-quads-builder";
import { buildSimilarKitesDeltoidsFigure } from "./prep-similarity-deltoids-kites-builder";
import {
  buildCollinearBaseQuadsIntersectingAtOFigure,
  buildSimilarHousePentagonsFigure,
  buildTriangleSecantSimilarQuadsFigure,
} from "./prep-similarity-composite-figures-builder";
import { composeParametricSimilarQuadsFigure } from "../../../parametric-similarity-description-parser";

export const MODULE_ID_PREP_SIMILARITY_GEOMETRY_CATALOG =
  "prep_similarity_geometry_catalog" as const;

/**
 * مطابقة أوصاف وأسئلة درس التشابه وتحويلها إلى الشكل الهندسي المتجهي الدقيق
 */
export function matchPrepSimilarityGeometryFigure(
  description: string,
  figureId = "prep_sim_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  // 1. الأشكال المركبة (قاعدة مشتركة تتقاطع في O، أو مثلث مقطوع بقاطع)
  if (/قاعدة\s*مشتركة|يتقاطعان\s*في\s*O|HEAD|OAE|OA\s*=\s*OE/i.test(d)) {
    return buildCollinearBaseQuadsIntersectingAtOFigure({ figureId, notationLanguage });
  }
  if (/ABCD\s*~\s*EBGF|مثلث.*مقطوع|EBGF/i.test(d)) {
    return buildTriangleSecantSimilarQuadsFigure({ figureId, notationLanguage });
  }

  // 2. طائرة ورقية / دالتون
  if (/طائرة\s*ورقية|دالتون|HLKJ|92°|92\s*درجة/i.test(d)) {
    return buildSimilarKitesDeltoidsFigure({ figureId, notationLanguage });
  }

  // 3. شبه منحرف قائم الزاوية مع مجاهيل جبرية (X - 3) و (Y + 1)
  if (/شبه\s*منحرف/i.test(d) && (/تشابه|متشابه/i.test(d) || /مجاهيل/i.test(d) || /X\s*-\s*3|Y\s*\+\s*1/i.test(d))) {
    return buildSimilarRightTrapezoidsWithVariablesFigure({ figureId, notationLanguage });
  }

  // 4. متوازي أضلاع متشابه (110° أو 120°)
  if (/متوازي\s*أضلاع|متوازيا\s*أضلاع/i.test(d) && (/110/i.test(d) || /120/i.test(d) || /تشابه/i.test(d))) {
    return buildSimilarParallelogramsFigure({ figureId, notationLanguage });
  }

  // 5. معينان متشابهان
  if (/معينان|معين.*متشابه|معين.*ABCD.*EFGH/i.test(d)) {
    return buildSimilarRhombusesFigure({ figureId, notationLanguage });
  }

  // 6. مضلعان خماسيان (شكل منزل ABCDE ~ KFGHJ)
  if (/خماسي/i.test(d) && (/تشابه|متشابه|منزل|KFGHJ/i.test(d))) {
    return buildSimilarHousePentagonsFigure({ figureId, notationLanguage });
  }

  // 7. مضلعان بزوايا 120° و 45° وجذور 10√3 و 10√2 (حاول بنفسك 2)
  if (/120°|10√3|10√2|45°/i.test(d) && /تشابه|متشابه|رباعي|ABCD.*EFGH/i.test(d)) {
    return buildSimilarQuadsWithObtuseAngleFigure({ figureId, notationLanguage });
  }

  // 8. مضلعان بهما جذور وزوايا خاصة (60° و 150° وجذور 1.5√3 و √3 - مثال 2)
  if (/1\.5√3|150°|y\s*-\s*1\/3|(?:^|[^\d])√3|مثال\s*2/i.test(d)) {
    return buildSimilarQuadsWithRadicalsAndAnglesFigure({ figureId, notationLanguage });
  }

  // 9. مضلعان بهما علامات زوايا متطابقة × و • (حاول بنفسك 1)
  if (/علامات.*زوايا|زوايا.*متطابقة|60°/i.test(d) && /تشابه|ABCD.*EFGH/i.test(d)) {
    return buildSimilarQuadsWithAngleMarksFigure({ figureId, notationLanguage });
  }

  // 10. إطار صورة خشبي داخلي وخارجي
  if (/إطار.*صورة|صورة.*خشب|مستطيل.*داخلي.*خارجي/i.test(d)) {
    return buildSimilarRightTrapezoidsWithVariablesFigure({ figureId, notationLanguage });
  }

  // 11. الفحص البارامتري الذكي: استخراج أطوال الأضلاع والزوايا المخصصة من النص
  const dynamicFigure = composeParametricSimilarQuadsFigure(d, figureId, notationLanguage);
  if (dynamicFigure) {
    return dynamicFigure;
  }

  // 12. مضلعان رباعيان قياسيان عامان عند ذكر التشابه العام
  if (/مضلع.*رباعي|رباعي.*متشابه|مضلعان.*متشابهان|مضلعين.*متشابهين|ABCD.*EFGH|ABCD.*PQRS/i.test(d)) {
    return buildSimilarQuadsWithRadicalsAndAnglesFigure({ figureId, notationLanguage });
  }

  if (/تشابه/i.test(d) && (/مضلعان/i.test(d) || /مضلعين/i.test(d))) {
    return buildSimilarQuadsWithRadicalsAndAnglesFigure({ figureId, notationLanguage });
  }

  return undefined;
}
