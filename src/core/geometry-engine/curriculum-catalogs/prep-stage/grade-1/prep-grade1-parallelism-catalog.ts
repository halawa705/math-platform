/**
 * @file prep-grade1-parallelism-catalog.ts
 * @description منسق ومطابق أشكال درس التوازي للصف الأول الإعدادي (الوحدة 3 - الدرس 3).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildParallelCorrespondingAnglesFigure,
  buildParallelAlternateAnglesFigure,
  buildParallelConsecutiveInteriorAnglesFigure,
  buildParallelAlgebraicAlternate3X15Figure,
  buildParallelAlgebraicCorresponding9XFigure,
} from "./prep-grade1-parallel-basic-transversal-builder";
import {
  buildParallelBrokenZigzagClassicFigure,
  buildParallelBrokenThreeRaysAEC130Figure,
  buildParallelBrokenRightAngleFigure,
  buildParallelBrokenReflexAlgebraicFigure,
} from "./prep-grade1-parallel-broken-zigzag-builder";
import {
  buildParallelProofTransversalZFigure,
  buildParallelProofConsecutiveInteriorFigure,
  buildParallelTwoVariablesXYFigure,
  buildParallelNonParallelCheckFigure,
} from "./prep-grade1-parallel-proof-conditions-builder";

export function matchPrepGrade1ParallelismFigure(
  arabicDescription: string,
  figureId = "prep1_parallel_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. مسألة 10 ص 194: AB // CD و EF // CD مع A = 70° و C = 120° لإيجاد AEC = 130°
  if (/AEC.*130|AB\s*\/\/\s*CD.*EF\s*\/\/\s*CD.*70°.*120°|70°.*120°.*AEC/i.test(d)) {
    return buildParallelBrokenThreeRaysAEC130Figure({ figureId, notationLanguage });
  }

  // 2. مسألة 11 ص 194: AB // EF مع D = 100° و E = 115° و DAE = 35° لإثبات AB // DC
  if (/AB\s*\/\/\s*EF.*100°.*115°.*35°|DAE\s*=\s*35°.*AB\s*\/\/\s*DC/i.test(d)) {
    return buildParallelProofTransversalZFigure({ figureId, notationLanguage });
  }

  // 3. مسألة 14-6 ص 196: زاوية منعكسة جبرية (6X+40)° = 280° مع 30° و 50° لإيجاد X = 40°
  if (/6X\s*\+\s*40|منعكسة.*6X\s*\+\s*40|30°.*50°.*6X\s*\+\s*40/i.test(d)) {
    return buildParallelBrokenReflexAlgebraicFigure({ figureId, notationLanguage });
  }

  // 4. مسألة 14-3 ص 196: زاوية منكسرة قائمة 90° مع 40° لحساب X = 50°
  if (/منكسرة\s*قائمة|قائمة.*40°.*X|40°.*90°.*X.*توازي/i.test(d)) {
    return buildParallelBrokenRightAngleFigure({ figureId, notationLanguage });
  }

  // 5. مسألة 5-1 ص 192: زاوية منكسرة كلاسيكية بين متوازيين 40° و 55° لحساب X = 95°
  if (/40°.*55°.*X|منكسرة.*40°.*55°/i.test(d)) {
    return buildParallelBrokenZigzagClassicFigure({ figureId, notationLanguage });
  }

  // 6. مسألة 7-1 ص 193: إثبات AB // CD بزاويتين داخلتين 100° + 80° = 180°
  if (/100°.*80°.*AB\s*\/\/\s*CD|لماذا\s*يكون\s*AB\s*\/\/\s*CD.*100|100°.*80°.*داخلتان/i.test(d)) {
    return buildParallelProofConsecutiveInteriorFigure({ figureId, notationLanguage });
  }

  // 7. مسألة 9 ص 193: BA // CD مع B = 80° و C = 2y° و D = X° لحساب y = 50° و X = 80°
  if (/BA\s*\/\/\s*CD.*80°.*2y|2y.*X.*BA\s*\/\/\s*CD|B\s*=\s*80°.*2y.*X/i.test(d)) {
    return buildParallelTwoVariablesXYFigure({ figureId, notationLanguage });
  }

  // 8. مسألة 6-1 ص 193: اختبار هل p // q أم لا مع زاويتين 57° و 122°
  if (/هل\s*p\s*\/\/\s*q|57°.*122°.*هل/i.test(d)) {
    return buildParallelNonParallelCheckFigure({ figureId, notationLanguage });
  }

  // 9. شكل 4-7 ص 192: توازي وتبادل جبري (3X+15)° = 75° لإيجاد X = 20°
  if (/3X\s*\+\s*15.*75°|75°.*3X\s*\+\s*15/i.test(d)) {
    return buildParallelAlgebraicAlternate3X15Figure({ figureId, notationLanguage });
  }

  // 10. شكل 4-8 ص 192: توازي وتناظر جبري (9X-5)° = (5X+15)° لإيجاد X = 5°
  if (/9X\s*-\s*5.*5X\s*\+\s*15/i.test(d)) {
    return buildParallelAlgebraicCorresponding9XFigure({ figureId, notationLanguage });
  }

  // 11. شكل 3-2 ص 191: تداخل حرف U زاويتان داخلتان 70° و 110°
  if (/(?:توازي|متوازي|جهة\s*واحدة|حرف\s*U).*داخلتان.*70°|داخلتان.*70°.*(?:توازي|متوازي)|تداخل.*70°|110°.*70°.*تداخل/i.test(d)) {
    return buildParallelConsecutiveInteriorAnglesFigure({ figureId, notationLanguage });
  }

  // 12. شكل 3-3 ص 191: تبادل حرف Z بزاوية 64°
  if (/تبادل.*64°|Z.*64°|64°.*تبادل.*X/i.test(d)) {
    return buildParallelAlternateAnglesFigure({ figureId, notationLanguage });
  }

  // 13. شكل 3-1 ص 191: تناظر حرف F بزاوية 63°
  if (/تناظر.*63°|F.*63°|63°.*تناظر/i.test(d)) {
    return buildParallelCorrespondingAnglesFigure({ figureId, notationLanguage });
  }

  // 14. مطابقة عامة للتوازي في أولى إعدادي
  if (/التوازي|مستقيمان\s*متوازيان/i.test(d) && !/تطبيقات\s*التوازي/i.test(d)) {
    return buildParallelCorrespondingAnglesFigure({ figureId, notationLanguage });
  }

  return undefined;
}
