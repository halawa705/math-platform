/**
 * @file prep-grade1-polygons-catalog.ts
 * @description منسق ومطابق أشكال وفهرس درس المضلعات ومحاور التماثل وزوايا المضلع للصف الأول الإعدادي (الوحدة 3 - الدرس 7).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import { buildPolygonSymmetryAxesFigure } from "./prep-grade1-polygon-symmetry-axes-builder";
import {
  buildRegularHexagonExternalRightTriangleFigure,
  buildPentagonTwoRightAnglesEDC130Figure,
  buildPentagonBaseBisectorsAFBFigure,
  buildHexagonAlgebraicTwoRightAnglesFigure,
} from "./prep-grade1-polygons-angles-proof-builder";

export function matchPrepGrade1PolygonsFigure(
  arabicDescription: string,
  figureId = "prep1_polygons_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. مسألة 12 ص 252: سداسي منتظم ABCDEF مع امتداد ضلع ومثلث قائم لحساب زاوية H = 60°
  if (/ABCDEF\s*سداسي\s*منتظم.*H|سداسي\s*منتظم.*(?:H\s*=\s*60|HG\s*⊥\s*AG|HG\s*عمود)/i.test(d)) {
    return buildRegularHexagonExternalRightTriangleFigure({ figureId, notationLanguage });
  }

  // 2. مسألة 14 ص 252: خماسي ABCDE بزوايا قائمة و EDC = 130° و EAB = 112° لحساب DEA = 118°
  if (/EDC\s*=\s*130.*EAB\s*=\s*112|خماسي.*EDC.*130.*DEA|DEA.*118/i.test(d)) {
    return buildPentagonTwoRightAnglesEDC130Figure({ figureId, notationLanguage });
  }

  // 3. مسألة 13-5 ص 252: خماسي ABCDE بزوايا 100° و 110° و 120° ومنصفا زاويتي القاعدتين لإيجاد AFB = 75°
  if (/100°.*110°.*120°.*(?:F|AFB|X)|خماسي.*100°.*110°.*120°|منصف.*خماسي.*F/i.test(d)) {
    return buildPentagonBaseBisectorsAFBFigure({ figureId, notationLanguage });
  }

  // 4. مسألة 13-1 ص 252: سداسي بزوايا قائمة وجبرية X و (X + 24)°
  if (/X\s*\+\s*24.*سداسي|سداسي.*X\s*\+\s*24/i.test(d)) {
    return buildHexagonAlgebraicTwoRightAnglesFigure({ figureId, notationLanguage });
  }

  // 5. محاور تماثل الخماسي المنتظم (5 محاور) ص 247
  if (/(?:الخماسي|خماسي)\s*(?:المنتظم|منتظم).*محاور|محاور\s*تماثل.*(?:الخماسي|خماسي)/i.test(d)) {
    return buildPolygonSymmetryAxesFigure({ figureId, notationLanguage, polygonKind: "regular_pentagon" });
  }

  // 6. محاور تماثل المثلث المتساوي الأضلاع (3 محاور) ص 247
  if (/(?:المثلث|مثلث)\s*(?:المتساوي|متساوي)\s*الأضلاع.*محاور|محاور\s*تماثل.*(?:المثلث|مثلث)\s*(?:المتساوي|متساوي)\s*الأضلاع/i.test(d)) {
    return buildPolygonSymmetryAxesFigure({ figureId, notationLanguage, polygonKind: "equilateral_triangle" });
  }

  // 7. محاور تماثل السداسي المنتظم (6 محاور) ص 247
  if (/(?:السداسي|سداسي)\s*(?:المنتظم|منتظم).*محاور|محاور\s*تماثل.*(?:السداسي|سداسي)/i.test(d)) {
    return buildPolygonSymmetryAxesFigure({ figureId, notationLanguage, polygonKind: "regular_hexagon" });
  }

  // 8. مطابقة عامة لدرس المضلعات ص 247 و 252
  if (/المضلعات.*محاور\s*تماثل|محاور\s*تماثل\s*بعض\s*المضلعات|درس\s*المضلعات|المضلع\s*المحدب\s*والمقعر/i.test(d)) {
    return buildPolygonSymmetryAxesFigure({ figureId, notationLanguage, polygonKind: "regular_hexagon" });
  }

  return undefined;
}
