/**
 * @file prep-grade1-quadrilaterals-catalog.ts
 * @description منسق ومطابق أشكال وفهرس درس الأشكال الرباعية ومتوازي الأضلاع للصف الأول الإعدادي (الوحدة 3 - الدرس 5).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildQuadAnglesSum120With5XFigure,
  buildQuadExteriorAngle4XFigure,
  buildQuadAngleBisectorParallelProofFigure,
  buildTrapezoidIsoscelesAlgebraicFigure,
} from "./prep-grade1-quadrilateral-angles-sum-builder";
import {
  buildParallelogramAnglesOppositeConsecutiveFigure,
  buildParallelogramOppositeSidesAlgebraicFigure,
  buildParallelogramDiagonalsBisectFigure,
  buildParallelogramSidesAndAnglesEquationsFigure,
} from "./prep-grade1-parallelogram-properties-builder";
import {
  buildParallelogramExternalTriangleEGBFigure,
  buildParallelogramProofDiagonalsCMBFigure,
  buildParallelogramProofConsecutiveAngles65115Figure,
  buildParallelogramAlgebraicParametersABFigure,
} from "./prep-grade1-parallelogram-proof-conditions-builder";

export function matchPrepGrade1QuadrilateralsFigure(
  arabicDescription: string,
  figureId = "prep1_quad_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. مسألة 5 ص 221: متوازي أضلاع ABCD مع مثلث خارجي EGB فيه D = 75° و G = 35° و GBA = 70° لحساب E = 110°
  if (/ABCD\s*متوازي\s*أضلاع.*D\s*=\s*75°|EGB.*35°.*70°|GBA\s*=\s*70°.*E\s*=\s*110/i.test(d)) {
    return buildParallelogramExternalTriangleEGBFigure({ figureId, notationLanguage });
  }

  // 2. مسألة 7 ص 222: قطرا الشكل الرباعي مع ABD = 34° و DCA = 31° و CMB = 65° لإثبات متوازي الأضلاع
  if (/ABD\s*=\s*34°.*DCA\s*=\s*31°|CMB\s*=\s*65°.*متوازي\s*أضلاع/i.test(d)) {
    return buildParallelogramProofDiagonalsCMBFigure({ figureId, notationLanguage });
  }

  // 3. مسألة 11 ص 222: قيم a و b التي تجعل الشكل متوازي أضلاع (a - 11 = 32 و 2b - 5 = b - 1)
  if (/a\s*-\s*11.*2b\s*-\s*5|b\s*-\s*1.*32°.*متوازي\s*أضلاع|قيم\s*a\s*،?\s*b.*متوازي/i.test(d)) {
    return buildParallelogramAlgebraicParametersABFigure({ figureId, notationLanguage });
  }

  // 4. مسألة 10 ص 222: إثبات متوازي الأضلاع بزوايا D = 65° و C = 115° و E = 70° و A = 45°
  if (/D\s*=\s*65°.*C\s*=\s*115°|E\s*=\s*70°.*A\s*=\s*45°.*متوازي/i.test(d)) {
    return buildParallelogramProofConsecutiveAngles65115Figure({ figureId, notationLanguage });
  }

  // 5. مسألة 6 ص 222: شكل رباعي B = 60° و D = 130° و A = 110° ومنصف CF لإثبات BA // CF
  if (/B\s*=\s*60°.*D\s*=\s*130°.*A\s*=\s*110°|CF\s*ينصف.*DCE|BA\s*\/\/\s*CF.*إثبات/i.test(d)) {
    return buildQuadAngleBisectorParallelProofFigure({ figureId, notationLanguage });
  }

  // 6. مسألة 3-4 ص 221: أضلاع وزوايا جبرية 5X - 11 = 2X + 1 و (10y+1)° + (6y+3)° = 180°
  if (/5X\s*-\s*11.*2X\s*\+\s*1|10y\s*\+\s*1.*6y\s*\+\s*3/i.test(d)) {
    return buildParallelogramSidesAndAnglesEquationsFigure({ figureId, notationLanguage });
  }

  // 7. مسألة 3-3 ص 221: قطرا المتوازي ينصف كل منهما الآخر 3y - 4 = 2y و X + y = 10
  if (/3y\s*-\s*4.*2y|X\s*\+\s*y.*10.*قطر|ينصف\s*كل\s*منهما\s*الآخر.*3y\s*-\s*4/i.test(d)) {
    return buildParallelogramDiagonalsBisectFigure({ figureId, notationLanguage });
  }

  // 8. مسألة 3-2 ص 221: أضلاع متوازي الأضلاع المتقابلة متساوية X - 2 = 10 و 2y - 7 = y
  if (/X\s*-\s*2.*10.*2y\s*-\s*7|2y\s*-\s*7.*y.*متوازي/i.test(d)) {
    return buildParallelogramOppositeSidesAlgebraicFigure({ figureId, notationLanguage });
  }

  // 9. مسألة 3-1 ص 221: متوازي أضلاع ABCD فيه A = 50° لحساب المقابلة والمتتالية
  if (/متوازي\s*أضلاع.*A\s*=\s*50°|50°.*متوازي\s*أضلاع.*y.*X/i.test(d)) {
    return buildParallelogramAnglesOppositeConsecutiveFigure({ figureId, notationLanguage });
  }

  // 10. مسألة 1-1 ص 220: شكل رباعي زواياه 120° و 2X° و 2X° و X° ومجموعها 360°
  if (/120°.*2X.*2X.*X|رباعي.*120°.*5X/i.test(d)) {
    return buildQuadAnglesSum120With5XFigure({ figureId, notationLanguage });
  }

  // 11. مسألة 1-4 ص 220: زاوية خارجة لشكل رباعي 4X° مع داخلة 70° و 100° و 110°
  if (/خارجة.*4X.*70°.*100°|4X.*70°.*100°.*110°/i.test(d)) {
    return buildQuadExteriorAngle4XFigure({ figureId, notationLanguage });
  }

  // 12. مسألة 2-2 ص 220: شبه منحرف متساوي الساقين (3X-55)° = 2X° لحساب D = 70°
  if (/شبه\s*منحرف.*3X\s*-\s*55|3X\s*-\s*55.*2X/i.test(d)) {
    return buildTrapezoidIsoscelesAlgebraicFigure({ figureId, notationLanguage });
  }

  // 13. مطابقة عامة لدرس الأشكال الرباعية في أولى إعدادي
  if (/الأشكال\s*الرباعية|متوازي\s*الأضلاع|خواص\s*متوازي\s*الأضلاع/i.test(d)) {
    return buildParallelogramAnglesOppositeConsecutiveFigure({ figureId, notationLanguage });
  }

  return undefined;
}
