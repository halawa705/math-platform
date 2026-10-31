/**
 * @file prep-grade2-triangle-congruence-catalog.ts
 * @description السجل المركزي ومنسق أشكال درس التطابق (هندسة الصف الثاني الإعدادي - الوحدة 3 - الدرس 1):
 * يطابق كافة الأوصاف الطبيعية لمسائل كتاب المعاصر والمتميزون لامتحانات المحافظات:
 * 1. تطابق بالانعكاس في DB مع زوايا 30° و 100° (مسألة 4).
 * 2. مثلثان قائمان متجاوران ABC ≅ HAD (مسألة 5).
 * 3. مثلث متساوي الساقين مع D منتصف BC وزاوية 63° (مسألة 10).
 * 4. مقص بتنصيف E للقطعتين AB و CD وتوازي AC // DB (مسألة 11).
 * 5. مركز O منتصف BD مع زاوية 34° وقياس AOC = 112° (مسألة 12).
 * 6. طائرة ورقية مع منصف الرأس AC ومحيط 12 سم (مسألة 13).
 * 7. مثلثان قائمان متعامدان ACB ≅ BDE مع 55° و x = 35° (مسألة 16).
 * 8. مثلثان قائمان في وتر مشترك AD مع 30° (مسألة 18).
 * 9. متتاليان على استقامة واحدة بتوازيات متناظرة (مسألة 15).
 * 10. متساوي الساقين مع BD = CE (مسألة 19).
 * 11. مشترك في الرأس A بأطوال 3 و 4 سم (مسألة 22).
 * 12. متوازي أضلاع مقسوم بقطر BD مع AD = CB و AD // BC (مسألة 24).
 * 13. متوازي أضلاع مع عمودين متعاكسين DE ⊥ AC و BF ⊥ AC (مسألة 25).
 * 14. مثلثان متداخلان مع توازيات متناظرة و BE = FC (مسألة 23).
 * 15. منصف زاوية مع 78° و x = 36° (مسألة 27).
 * 16. مثلثان بقائم مشترك لإيجاد BD = 15 سم (مسألة 26).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildCongruenceReflectionInDBFigure,
  buildCongruenceIsoscelesMidpointDFigure,
  buildCongruenceKiteBisectorACFigure,
  buildCongruenceIsoscelesWingsFigure,
} from "./prep-grade2-congruence-shared-base-builder";
import {
  buildCongruenceScissorMidpointEFigure,
  buildCongruenceCenterOMidpointBDFigure,
  buildCongruenceSharedApexAFigure,
  buildCongruencePerpendicularApexFigure,
} from "./prep-grade2-congruence-scissor-butterfly-builder";
import {
  buildCongruenceParallelogramSecantBDFigure,
  buildCongruenceParallelogramAltitudesFigure,
  buildCongruenceParallelogram5x4Figure,
} from "./prep-grade2-congruence-parallelogram-diagonals-builder";
import {
  buildCongruenceRightTrianglesAdjacentFigure,
  buildCongruencePerpendicularRightPairFigure,
  buildCongruenceRightTrianglesSharedHypotenuseFigure,
} from "./prep-grade2-congruence-right-triangles-builder";
import {
  buildCongruenceCollinearParallelTransversalFigure,
  buildCongruenceNestedParallelSharedLineFigure,
  buildCongruenceAngleBisector78Figure,
} from "./prep-grade2-congruence-parallel-transversal-builder";

export const MODULE_ID_PREP_GRADE2_TRIANGLE_CONGRUENCE_CATALOG =
  "prep_grade2_triangle_congruence_catalog" as const;

export function matchPrepGrade2TriangleCongruenceFigure(
  description: string,
  figureId = "prep2_congruence_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  // 1. تطابق بالانعكاس في محور DB (مسألة 4)
  if (/بالانعكاس\s*في.*DB|انعكاس.*DB|صورة.*BAD|BAD.*صورة/i.test(d)) {
    return buildCongruenceReflectionInDBFigure({ figureId, notationLanguage });
  }

  // 2. مثلثان قائمان متجاوران ABC ≅ HAD (مسألة 5)
  if (/ABC.*HAD|3y\s*-\s*6|قيمة.*X\s*\+\s*y/i.test(d)) {
    return buildCongruenceRightTrianglesAdjacentFigure({ figureId, notationLanguage });
  }

  // 3. مثلث متساوي الساقين مع D منتصف القاعدة BC وزاوية 63° (مسألة 10)
  if (/D\s*منتصف\s*BC.*AB\s*=\s*AC|AB\s*=\s*AC.*63°|ADB.*ADC.*63°|DAC.*27°/i.test(d)) {
    return buildCongruenceIsoscelesMidpointDFigure({ figureId, notationLanguage });
  }

  // 4. مقص بتنصيف E للقطعتين AB و CD وتوازي AC // DB (مسألة 11)
  if (/E\s*نقطة\s*منتصف\s*كل\s*من\s*AB.*CD|AEC.*BED|E\s*منتصف.*AB.*CD/i.test(d)) {
    return buildCongruenceScissorMidpointEFigure({ figureId, notationLanguage });
  }

  // 5. مركز O منتصف BD مع زاوية 34° وقياس AOC = 112° (مسألة 12)
  if (/OAB.*OCD|O\s*منتصف\s*BD|AOC.*112°|(?:\b34°\b.*(?:AOC|OAB|OCD|112°))/i.test(d) && /OAB|OCD|BD/i.test(d)) {
    return buildCongruenceCenterOMidpointBDFigure({ figureId, notationLanguage });
  }

  // 6. طائرة ورقية مع منصف الرأس AC ومحيط 12 سم (مسألة 13)
  if (/3\.6.*2\.4|AC\s*ينصف.*BAD|محيط\s*المضلع\s*ABCD.*(?:3\.6|2\.4|ينصف)|ACB.*ACD/i.test(d)) {
    return buildCongruenceKiteBisectorACFigure({ figureId, notationLanguage });
  }

  // 7. مثلثان قائمان متعامدان ACB ≅ BDE مع 55° و x = 35° (مسألة 16)
  if (/ACB\s*≅?\s*BDE|BC\s*=\s*DE.*AB\s*=\s*EB|(?:\bقائمان\b.*55°.*X)/i.test(d)) {
    return buildCongruencePerpendicularRightPairFigure({ figureId, notationLanguage });
  }

  // 8. مثلثان قائمان في وتر مشترك AD مع 30° (مسألة 18)
  if (/وتر\s*مشترك.*AD|وتر\s*مشترك.*30°|30°.*X.*قائم/i.test(d)) {
    return buildCongruenceRightTrianglesSharedHypotenuseFigure({ figureId, notationLanguage });
  }

  // 9. متتاليان على استقامة واحدة بتوازيات متناظرة (مسألة 15)
  if (/BC.*CE.*AB\s*\/\/\s*DC|ABC\s*≅\s*DCE|(?:\bABC\b.*DCE.*(?:تطابق|≅))/i.test(d)) {
    return buildCongruenceCollinearParallelTransversalFigure({ figureId, notationLanguage });
  }

  // 10. متساوي الساقين مع قطعتين متساويتين BD = CE على القاعدة (مسألة 19)
  if (/ABD.*ACE|ADE.*AED.*BD.*CE/i.test(d)) {
    return buildCongruenceIsoscelesWingsFigure({ figureId, notationLanguage });
  }

  // 11. مشترك في الرأس A بأطوال 3 و 4 سم (مسألة 22)
  if (/ABC.*ADE.*4\s*سم|AB\s*=\s*3.*AD\s*=\s*3.*AE\s*=\s*4/i.test(d)) {
    return buildCongruenceSharedApexAFigure({ figureId, notationLanguage });
  }

  // 12. متوازي أضلاع مقسوم بقطر BD مع AD = CB و AD // BC (مسألة 24)
  if (/ABD.*CDB|AD.*CB.*AD\s*\/\/\s*BC/i.test(d)) {
    return buildCongruenceParallelogramSecantBDFigure({ figureId, notationLanguage });
  }

  // 13. متوازي أضلاع مع عمودين متعاكسين DE ⊥ AC و BF ⊥ AC (مسألة 25)
  if (/DE\s*⊥\s*AC.*BF\s*⊥\s*AC|DF\s*=\s*BE.*متوازي/i.test(d)) {
    return buildCongruenceParallelogramAltitudesFigure({ figureId, notationLanguage });
  }

  // 14. متوازي أضلاع أو مستطيل مقسوم بقطر بأطوال 5 سم و 4 سم (مسألة 6-2)
  if (/5\s*سم.*4\s*سم.*قطر|أطوال.*5\s*سم.*4\s*سم.*تطابق/i.test(d)) {
    return buildCongruenceParallelogram5x4Figure({ figureId, notationLanguage });
  }

  // 15. مثلثان متداخلان مع توازيات متناظرة و BE = FC (مسألة 23)
  if (/BA\s*\/\/\s*ED.*CA\s*\/\/\s*FD|ABC.*DEF.*BE.*FC/i.test(d)) {
    return buildCongruenceNestedParallelSharedLineFigure({ figureId, notationLanguage });
  }

  // 16. منصف زاوية مع 78° و x = 36° (مسألة 27)
  if (/BCD.*BED|78°.*X|30°.*78°/i.test(d)) {
    return buildCongruenceAngleBisector78Figure({ figureId, notationLanguage });
  }

  // 17. مثلثان بقائم مشترك لإيجاد BD = 15 سم (مسألة 26)
  if (/طول\s*BD.*15\s*سم|AE\s*=\s*7.*EB\s*=\s*8/i.test(d)) {
    return buildCongruencePerpendicularApexFigure({ figureId, notationLanguage });
  }

  return undefined;
}
