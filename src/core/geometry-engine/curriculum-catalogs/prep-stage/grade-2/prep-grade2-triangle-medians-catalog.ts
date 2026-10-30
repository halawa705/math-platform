/**
 * @file prep-grade2-triangle-medians-catalog.ts
 * @description منسق ومطابق أشكال درس متوسطات المثلث للصف الثاني الإعدادي (الوحدة 3 - الدرس الرابع).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildMediansCentroidMidsegmentPerimeterFigure,
  buildThreeMediansCentroidGFigure,
  buildPerpendicularMediansADBEFigure,
  buildMediansWithMidsegmentRatioPerimeterFigure,
} from "./prep-grade2-triangle-medians-centroid-builder";
import {
  buildRightTriangleMedianHypotenuseAlgebraicFigure,
  buildRightTriangleMedianWithCentroidGFigure,
  buildConverseRightTriangleMedianFigure,
  buildRightTriangleMedianWithPerpendicularMEFigure,
} from "./prep-grade2-right-triangle-median-hypotenuse-builder";
import {
  buildTwoTrianglesMedianMidsegmentBHEFFigure,
  buildTwoRightTrianglesMediansDMACFigure,
  buildParallelogramCentroidDiagonalsMFigure,
  buildRightTriangleAltitudeMidsegmentEFDFigure,
} from "./prep-grade2-compound-medians-quadrilaterals-builder";

export function matchPrepGrade2TriangleMediansFigure(
  arabicDescription: string,
  figureId = "prep2_median_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. متوسطان متعامدان AD ⊥ BE مع CE = 15 و BG = 18 لحساب AD = 18 سم (مسألة 22 ص 230)
  if (/AD\s*⊥\s*BE|CE\s*=\s*15.*BG\s*=\s*18|متوسطان\s*متعامدان/i.test(d)) {
    return buildPerpendicularMediansADBEFigure({ figureId, notationLanguage });
  }

  // 2. مثلث قائم بمتوسط من رأس القائمة بمجاهيل جبرية 2X-3 و 3X-8 أو X+12 و 8X (مسألة 9 ص 227 ومسألة 10 ص 228)
  if ((/2X\s*-\s*3/i.test(d) && /3X\s*-\s*8/i.test(d)) || (/X\s*\+\s*12/i.test(d) && /8X/i.test(d)) || (/AD\s*متوسط.*قائم.*A/i.test(d) && /X/i.test(d))) {
    return buildRightTriangleMedianHypotenuseAlgebraicFigure({ figureId, notationLanguage });
  }

  // 3. مثلث قائم في A بأضلاع 24 و 18 سم ومركز المتوسطات G لحساب AG = 10 سم (مسألة 11 ص 228)
  if (/24\s*سم.*18\s*سم.*AG|AG\s*=\s*10|قائم.*A.*نقطة\s*تقاطع\s*متوسطات.*AG/i.test(d)) {
    return buildRightTriangleMedianWithCentroidGFigure({ figureId, notationLanguage });
  }

  // 4. عكس نظرية المتوسط: متوسط AD = 17 سم والضلع المقابل 34 سم لإثبات القائمة (مسألة 17 و 18 ص 229)
  if (/AD.*17.*BC.*34|17\s*سم.*34\s*سم|BD.*AD.*5.*AC.*10|عكس.*المتوسط.*240/i.test(d)) {
    return buildConverseRightTriangleMedianFigure({ figureId, notationLanguage });
  }

  // 5. مثلث قائم في A بمركز متوسطات M وعمود ME = 4 و DE = 3 لحساب BC = 30 سم (مسألة 20 ص 229)
  if (/ME\s*⊥\s*DC|ME\s*=\s*4.*DE\s*=\s*3|طول\s*BC.*30/i.test(d)) {
    return buildRightTriangleMedianWithPerpendicularMEFigure({ figureId, notationLanguage });
  }

  // 6. المتوسطات الثلاثة تلتقي في G مع AP=21, GQ=5, BG=16 أو AG=8, GE=3.5 (مسألة 4 ص 226، ومسألة 5 ص 227)
  if (/AP\s*=\s*21.*BG\s*=\s*16|AG\s*=\s*8.*GE\s*=\s*3\.5|المتوسطات\s*الثلاثة.*G/i.test(d)) {
    return buildThreeMediansCentroidGFigure({ figureId, notationLanguage });
  }

  // 7. متوسطان CD و AF ومحيط المثلث AMC = 36 ومحيط MFD = 18 أو MXY = 12 ومحيط MAC = 24 (مسألة 7 و 8 ص 227)
  if (/AMC\s*=\s*36|MFD\s*=\s*18|محيط.*MXY.*12.*MAC.*24/i.test(d)) {
    return buildMediansWithMidsegmentRatioPerimeterFigure({ figureId, notationLanguage });
  }

  // 8. متوسطان متقاطعان مع قطعة واصلة DE وأطوال BC = 12 و BE = 9 (مسألة 3 و 4 ص 226)
  if (/BE\s*=\s*9.*BC\s*=\s*12|MC\s*=\s*8.*BE\s*=\s*9|LZ\s*=\s*15.*YM\s*=\s*18/i.test(d)) {
    return buildMediansCentroidMidsegmentPerimeterFigure({ figureId, notationLanguage });
  }

  // 9. مثلث قائم ABC في B بمتوسط BH وشكل رباعي بقطعة واصلة EF لإثبات BH = EF (مسألة 12 ص 228)
  if (/BH\s*متوسط.*قائم.*B.*EF|BH\s*=\s*EF/i.test(d)) {
    return buildTwoTrianglesMedianMidsegmentBHEFFigure({ figureId, notationLanguage });
  }

  // 10. مثلث قائم ADC بمركز متوسطات M وقطعة EF = 9 لحساب AC = 18 و DM = 6 سم (مسألة 13 ص 228)
  if (/EF\s*=\s*9.*DM|ADC\s*قائم.*D.*M\s*نقطة\s*تلاقي\s*متوسطات/i.test(d)) {
    return buildTwoRightTrianglesMediansDMACFigure({ figureId, notationLanguage });
  }

  // 11. متوازي أضلاع ABCD بتقاطع قطري M و DE = 2 EM لإثبات AF = FD (مسألة 21 ص 230)
  if (/DE\s*=\s*2\s*EM|متوازي\s*أضلاع.*تقاطع\s*قطراه\s*في\s*M.*AF\s*=\s*FD/i.test(d)) {
    return buildParallelogramCentroidDiagonalsMFigure({ figureId, notationLanguage });
  }

  // 12. مثلث ABC بارتفاع AD ⊥ BC ومنصفات E و F لإثبات محيط EFD = 1/2 محيط ABC (مسألة 15 ص 229)
  if (/AD\s*⊥\s*BC.*محيط\s*المثلث\s*EFD|محيط\s*EFD.*نصف.*محيط\s*ABC/i.test(d)) {
    return buildRightTriangleAltitudeMidsegmentEFDFigure({ figureId, notationLanguage });
  }

  // 13. مطابقة عامة لدرس متوسطات المثلث في 2 إعدادي
  if (/متوسطات\s*المثلث|نقطة\s*تلاقي\s*المتوسطات|مركز\s*المتوسطات/i.test(d)) {
    return buildMediansCentroidMidsegmentPerimeterFigure({ figureId, notationLanguage });
  }

  return undefined;
}
