/**
 * @file prep-grade2-polygon-angles-catalog.ts
 * @description منسق ومطابق أشكال درس الزوايا الداخلة والخارجة للمضلعات للصف الثاني الإعدادي (الوحدة 3 - تمارين 17).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildConvexPentagonInteriorAnglesFigure,
  buildRegularPentagonFigure,
  buildHexagonAdjacentQuadFigure,
  buildTwoSharedEdgePentagonsFigure,
} from "./prep-grade2-polygon-interior-angles-builder";
import {
  buildTriangleExteriorAnglesAlgebraicFigure,
  buildQuadrilateralExteriorAngles2X3X4XFigure,
  buildPentagonExteriorAnglesAlgebraicFigure,
  buildHexagonExteriorAnglesWithVariablesFigure,
} from "./prep-grade2-polygon-exterior-angles-builder";

export function matchPrepGrade2PolygonAnglesFigure(
  arabicDescription: string,
  figureId = "prep2_polygon_angles_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. خماسي بزوايا داخلة 120° و 120° و 95° و 96° لإيجاد X = 109° (مسألة 2-2 ص 272)
  if (/95°.*96°|120°.*120°.*95°|خماسي.*95°.*96°/i.test(d)) {
    return buildConvexPentagonInteriorAnglesFigure({ figureId, notationLanguage });
  }

  // 2. خماسي منتظم متساوي الأضلاع والزوايا لإيجاد الزاوية الداخلة 108° (مسألة 2-3 ص 272)
  if (/خماسي\s*منتظم.*108|متساوي\s*الأضلاع.*خماسي.*X|زاوية\s*الخماسي\s*المنتظم/i.test(d)) {
    return buildRegularPentagonFigure({ figureId, notationLanguage });
  }

  // 3. سداسي منتظم ملتصق برباعي CGHB بزوايا 110° و 135° لحساب زاوية G = 55° (مسألة 6 ص 273)
  if (/ABCDEF\s*شكل\s*سداسي\s*منتظم.*CGHB|H\s*=\s*110°.*GBC\s*=\s*135°|زاوية\s*G.*55/i.test(d)) {
    return buildHexagonAdjacentQuadFigure({ figureId, notationLanguage });
  }

  // 4. خماسيان منتظمان مشتركان في ضلع لإيجاد الزاوية بينهما X = 144° (مسألة 2-9 ص 272)
  if (/خماسيان\s*منتظمان|مشتركان\s*في\s*ضلع.*144/i.test(d)) {
    return buildTwoSharedEdgePentagonsFigure({ figureId, notationLanguage });
  }

  // 5. مثلث بزوايا خارجة (X+31)° و (2X+32)° و (3X-3)° لحساب X = 50° (مسألة 3-1 ص 273)
  if (/X\s*\+\s*31.*2X\s*\+\s*32.*3X\s*-\s*3|مثلث.*زوايا\s*خارجة.*3X\s*-\s*3/i.test(d)) {
    return buildTriangleExteriorAnglesAlgebraicFigure({ figureId, notationLanguage });
  }

  // 6. رباعي بزوايا خارجة 2X° و 3X° و 4X° و X° لحساب X = 36° (مسألة 3-2 ص 273)
  if (/2X.*3X.*4X.*X|رباعي.*زوايا\s*خارجة.*4X/i.test(d)) {
    return buildQuadrilateralExteriorAngles2X3X4XFigure({ figureId, notationLanguage });
  }

  // 7. خماسي بزوايا خارجة (X+19)° و 79° و 2X° و 55° و 84° لحساب X = 41° (مسألة 3-4 ص 273 ومسألة 8 ص 276)
  if (/X\s*\+\s*19.*79°.*2X|84°.*X\s*\+\s*19.*79°|خماسي.*زوايا\s*خارجة.*X\s*=\s*41/i.test(d)) {
    return buildPentagonExteriorAnglesAlgebraicFigure({ figureId, notationLanguage });
  }

  // 8. سداسي بزوايا خارجة 2a و 4a و 3a و 2a و 2a و 5a لحساب a = 20 وزاوية BCD = 120° (مسألة 4 ص 273)
  if (/2a.*4a.*3a.*5a|قيمة\s*a\s*=\s*20.*BCD\s*=\s*120/i.test(d)) {
    return buildHexagonExteriorAnglesWithVariablesFigure({ figureId, notationLanguage });
  }

  // 9. مطابقة عامة لدرس الزوايا الداخلة والخارجة للمضلعات
  if (/الزوايا\s*الداخلة\s*والخارجة\s*للمضلعات|الزوايا\s*الداخلة.*للمضلع|الزوايا\s*الخارجة.*للمضلع/i.test(d)) {
    return buildConvexPentagonInteriorAnglesFigure({ figureId, notationLanguage });
  }

  return undefined;
}
