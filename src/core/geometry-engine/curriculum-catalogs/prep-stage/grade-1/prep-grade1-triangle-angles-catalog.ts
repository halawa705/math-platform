/**
 * @file prep-grade1-triangle-angles-catalog.ts
 * @description منسق ومطابق أشكال وفهرس درس المثلث والزاوية الداخلة والخارجة للصف الأول الإعدادي (الوحدة 3 - الدرس 4).
 * @invariant يلتزم بحدود الأسطر (< 200 سطر) وTypeScript الصارم وفق دستور المنصة (AGENTS.md).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildTriangleInteriorAnglesRatioFigure,
  buildTriangleExteriorSum2282Figure,
  buildTriangleEquilateralExterior120Figure,
  buildTriangleTwoExteriors110104Figure,
} from "./prep-grade1-triangle-interior-exterior-builder";
import {
  buildTriangleExteriorAlgebraic3X10Figure,
  buildTriangleExteriorTwoUnknowns125Figure,
  buildTriangleExteriorAlgebraic2X16Figure,
  buildTriangleThreeAlgebraicAnglesFigure,
} from "./prep-grade1-triangle-algebraic-angles-builder";
import {
  buildTriangleParallelDE100Figure,
  buildTriangleParallelDoubleFXDEFigure,
  buildTriangleBaseAngleBisectors126Figure,
  buildTriangleMidParallelEDFigure,
} from "./prep-grade1-triangle-parallel-bisectors-builder";

export function matchPrepGrade1TriangleAnglesFigure(
  arabicDescription: string,
  figureId = "prep1_triangle_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. مسألة 14-7 ص 210: منصفا زاويتي القاعدة يتقاطعان بزاوية 126° لحساب زاوية الرأس C = 72°
  if (/126°.*منصف|منصفا\s*زاويتي\s*القاعدة.*126|126°.*رأس.*72/i.test(d)) {
    return buildTriangleBaseAngleBisectors126Figure({ figureId, notationLanguage });
  }

  // 2. مسألة 8 ص 209: DE // CB مع D = 100° و C = 30° لحساب زاوية BAC = 70°
  if (/DE\s*\/\/\s*CB.*100°.*30°|D\s*=\s*100°.*C\s*=\s*30°.*BAC/i.test(d)) {
    return buildTriangleParallelDE100Figure({ figureId, notationLanguage });
  }

  // 3. مسألة 9 ص 209: DE // FX // CB مع F = 135° و D = 120° لحساب زوايا المثلث ABC
  if (/DE\s*\/\/\s*FX\s*\/\/\s*CB|135°.*120°.*زوايا\s*المثلث\s*ABC/i.test(d)) {
    return buildTriangleParallelDoubleFXDEFigure({ figureId, notationLanguage });
  }

  // 4. مسألة 10 ص 209: ED // CB مع B = 60° و A = 80° لحساب AED = 40° و DEC = 140°
  if (/ED\s*\/\/\s*CB.*B\s*=\s*60°.*A\s*=\s*80°|AED.*40°.*DEC.*140/i.test(d)) {
    return buildTriangleMidParallelEDFigure({ figureId, notationLanguage });
  }

  // 5. مسألة 14-1 ص 210: زاوية خارجة (3X+10)° مع زاويتين داخلتين 60° و 70° لإيجاد X = 40°
  if (/3X\s*\+\s*10.*60°.*70°|خارجة.*3X\s*\+\s*10/i.test(d)) {
    return buildTriangleExteriorAlgebraic3X10Figure({ figureId, notationLanguage });
  }

  // 6. مسألة 14-2 ص 210: زاويتان داخلتان (2X-2)° و (3X+7)° والزاوية الخارجة 125° لإيجاد X = 24°
  if (/2X\s*-\s*2.*3X\s*\+\s*7.*125|125°.*2X\s*-\s*2/i.test(d)) {
    return buildTriangleExteriorTwoUnknowns125Figure({ figureId, notationLanguage });
  }

  // 7. مسألة 14-3 ص 210: زاوية خارجة (2X+16)° مع داخلتين (X+1)° و 80° لحساب X = 65°
  if (/2X\s*\+\s*16.*X\s*\+\s*1.*80/i.test(d)) {
    return buildTriangleExteriorAlgebraic2X16Figure({ figureId, notationLanguage });
  }

  // 8. مسألة 14-4 ص 210: زوايا المثلث الداخلة (2X-5)° و (3X+4)° و (4X-8)° لحساب B = 76°
  if (/2X\s*-\s*5.*3X\s*\+\s*4.*4X\s*-\s*8/i.test(d)) {
    return buildTriangleThreeAlgebraicAnglesFigure({ figureId, notationLanguage });
  }

  // 9. مسألة 2-3 ص 207: زوايا المثلث a° و 3a° و 5a° لحساب a = 20°
  if (/5a.*3a.*a|a°.*3a°.*5a°/i.test(d)) {
    return buildTriangleInteriorAnglesRatioFigure({ figureId, notationLanguage });
  }

  // 10. مسألة 2-5 ص 207: زاوية خارجة مع زاويتين داخلتين 22° و 82° لحساب X = 104°
  if (/22°.*82°.*خارجة|خارجة.*22°.*82°/i.test(d)) {
    return buildTriangleExteriorSum2282Figure({ figureId, notationLanguage });
  }

  // 11. مسألة 2-7 ص 207: مثلث متساوي الأضلاع والزاوية الخارجة عنه = 120°
  if (/متساوي\s*الأضلاع.*خارجة.*120|خارجة.*متساوي\s*الأضلاع/i.test(d)) {
    return buildTriangleEquilateralExterior120Figure({ figureId, notationLanguage });
  }

  // 12. مسألة 2-9 ص 207: زاويتان خارجتان 110° و 104° لحساب زاوية الرأس X = 34°
  if (/110°.*104°.*رأس|خارجتان.*110°.*104°/i.test(d)) {
    return buildTriangleTwoExteriors110104Figure({ figureId, notationLanguage });
  }

  // 13. مطابقة عامة للمثلث 1 إعدادي
  if (/الزاوية\s*الخارجة\s*للمثلث|مجموع\s*قياسات\s*الزوايا\s*الداخلة\s*للمثلث/i.test(d)) {
    return buildTriangleExteriorSum2282Figure({ figureId, notationLanguage });
  }

  return undefined;
}
