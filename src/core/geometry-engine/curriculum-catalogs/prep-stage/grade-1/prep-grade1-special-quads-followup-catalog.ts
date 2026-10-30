/**
 * @file prep-grade1-special-quads-followup-catalog.ts
 * @description منسق ومطابق أشكال وفهرس درس تابع الأشكال الرباعية الخاصة (المستطيل، المعين، المربع) (1ع).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildRectangleDiagonalsEqualAlgebraicFigure,
  buildRhombusEqualSidesAlgebraicFigure,
  buildRhombusAngleDBC62Figure,
  buildSquareDiagonalsRelationFigure,
} from "./prep-grade1-special-quads-properties-builder";
import {
  buildSquareEquilateralCompositeFigure,
  buildRectangleInternalAngleCED88Figure,
  buildRectangleSquareCompositeAFD97Figure,
  buildSquareInscribedRhombusFigure,
} from "./prep-grade1-square-equilateral-composite-builder";

export function matchPrepGrade1SpecialQuadsFollowupFigure(
  arabicDescription: string,
  figureId = "prep1_special_quads_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. مسألة 6-1 ص 234: مربع ملتصق بمثلث متساوي الأضلاع لحساب زاوية ACE = 105°
  if (/مربع.*متساوي\s*الأضلاع.*105|ABCD\s*مربع.*DCE.*105|ACE.*105/i.test(d)) {
    return buildSquareEquilateralCompositeFigure({ figureId, notationLanguage });
  }

  // 2. مسألة 8 ص 234: مستطيل ABCD مع AED = 46° و ECB = 44° لحساب CED = 88°
  if (/AED\s*=\s*46°.*ECB\s*=\s*44°|مستطيل.*AED.*46°.*CED.*88|CED.*88/i.test(d)) {
    return buildRectangleInternalAngleCED88Figure({ figureId, notationLanguage });
  }

  // 3. مسألة 12 ص 235: مستطيل ومربع متداخلان مع FDC = 52° لحساب AFD = 97°
  if (/ABFE\s*مربع.*FDC\s*=\s*52°|مستطيل.*ABFE\s*مربع.*AFD|AFD.*97/i.test(d)) {
    return buildRectangleSquareCompositeAFD97Figure({ figureId, notationLanguage });
  }

  // 4. مسألة 13 ص 235: مربع وبداخله معين على القطر AC مع EA = FC
  if (/EBFD\s*معين|EA\s*=\s*FC.*معين|معين.*EA\s*=\s*FC|ABCD\s*مربع.*EBFD|EA\s*=\s*FC.*مربع/i.test(d)) {
    return buildSquareInscribedRhombusFigure({ figureId, notationLanguage });
  }

  // 5. مسألة 9 ص 235: معين ABCD فيه DBC = 62° لإيجاد زاوية الرأس A = 56°
  if (/ABCD\s*معين.*DBC\s*=\s*62°|معين.*DBC.*62°.*A\s*=\s*56/i.test(d)) {
    return buildRhombusAngleDBC62Figure({ figureId, notationLanguage });
  }

  // 6. مسألة 7 ص 234: مربع ABCD فيه BD = 5a - 4 و MC = 2a - 1 لحساب a = 2 وطول AC = 6
  if (/BD\s*=\s*5a\s*-\s*4.*MC\s*=\s*2a\s*-\s*1|5a\s*-\s*4.*2a\s*-\s*1.*مربع/i.test(d)) {
    return buildSquareDiagonalsRelationFigure({ figureId, notationLanguage });
  }

  // 7. مسألة 3-3 ص 233: معين أضلاعه متساوية 7X - 11 = 5X + 1 لحساب X = 6
  if (/7X\s*-\s*11.*5X\s*\+\s*1|معين.*7X\s*-\s*11/i.test(d)) {
    return buildRhombusEqualSidesAlgebraicFigure({ figureId, notationLanguage });
  }

  // 8. مسألة 3-2 ص 233 ومسألة 6-2 ص 234: قطرا المستطيل متساويان 4X - 5 = 3X أو 3X - 1 = 2X + 3
  if (/(?:4X\s*-\s*5.*3X|3X.*4X\s*-\s*5|3X\s*-\s*1.*2X\s*\+\s*3)/i.test(d) && /مستطيل|قطر/i.test(d)) {
    return buildRectangleDiagonalsEqualAlgebraicFigure({ figureId, notationLanguage });
  }

  // 9. مطابقة عامة للدرس
  if (/تابع\s*الأشكال\s*الرباعية\s*الخاصة|الحالات\s*الخاصة\s*من\s*متوازي\s*الأضلاع/i.test(d)) {
    return buildSquareEquilateralCompositeFigure({ figureId, notationLanguage });
  }

  return undefined;
}
