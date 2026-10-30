/**
 * @file prep-grade2-isosceles-triangle-catalog.ts
 * @description منسق ومطابق أشكال درس المثلث المتساوي الساقين للصف الثاني الإعدادي (الوحدة 3 - الدرس الخامس).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildIsoscelesAlgebraicAnglesFigure,
  buildIsoscelesExteriorBisectorFigure,
  buildIsoscelesExteriorAngle120Figure,
  buildRightIsosceles45DegreeFigure,
} from "./prep-grade2-isosceles-angles-algebraic-builder";
import {
  buildIsoscelesSharingVertexWithEquilateralFigure,
  buildIsoscelesAdjacentToEquilateralOnBaseFigure,
  buildIsoscelesAdjacentCADFigure,
  buildEquilateralWithExtendedBaseRightAngleFigure,
} from "./prep-grade2-isosceles-compound-triangles-builder";
import {
  buildIsoscelesInTrapezoidDABCBFigure,
  buildIsoscelesBaseAngleBisectorsFigure,
  buildTwoRightTrianglesSharedHypotenuseDECFigure,
  buildTriangleTripleAngleProofFigure,
} from "./prep-grade2-isosceles-proof-quadrilaterals-builder";

export function matchPrepGrade2IsoscelesTriangleFigure(
  arabicDescription: string,
  figureId = "prep2_isosceles_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = (arabicDescription || "").trim();
  if (!d) return undefined;

  // 1. مثلث متساوي الساقين ABC (AB=AC, ∠A=40°) ومثلث متساوي الأضلاع DBE لإيجاد ∠CBD = 130° (مسألة 3 ص 241)
  if (/DBE\s*مثلث\s*متساوي\s*الأضلاع.*AC\s*=\s*AB|CBD.*130|A\s*=\s*40°.*CBD/i.test(d)) {
    return buildIsoscelesSharingVertexWithEquilateralFigure({ figureId, notationLanguage });
  }

  // 2. مثلث متساوي الساقين ABC (AB=AC, ∠A=50°) ومثلث متساوي الأضلاع EBD لحساب ∠ABE = 55° (مسألة 4 ص 241)
  if (/ABE.*55|A\s*=\s*50°.*ABE|EBD.*متساوي\s*الأضلاع.*ABE/i.test(d)) {
    return buildIsoscelesAdjacentToEquilateralOnBaseFigure({ figureId, notationLanguage });
  }

  // 3. مثلث ABC (30°, 40°) مجاور لمتساوي الساقين CAD لحساب زاوية D = 70° و CAD = 40° (مسألة 5 ص 241)
  if (/BAC\s*=\s*30°.*B\s*=\s*40°.*AC\s*=\s*AD|CAD.*40.*D.*70/i.test(d)) {
    return buildIsoscelesAdjacentCADFigure({ figureId, notationLanguage });
  }

  // 4. مثلث متساوي الأضلاع ABC مع C منتصف BD لإثبات تعامد AD ⊥ BA (مسألة 7 ص 241)
  if (/ABC\s*مثلث\s*متساوي\s*الأضلاع.*BC\s*=\s*CD|AD\s*⊥\s*BA/i.test(d)) {
    return buildEquilateralWithExtendedBaseRightAngleFigure({ figureId, notationLanguage });
  }

  // 5. شكل رباعي ABCD فيه DA // CB و AB = AD وزوايا 120° و 65° لحساب زاوية C = 85° (مسألة 8 ص 242)
  if (/DA\s*\/\/\s*CB.*AB\s*=\s*AD|A\s*=\s*120°.*BDC\s*=\s*65°|زاوية\s*C.*85/i.test(d)) {
    return buildIsoscelesInTrapezoidDABCBFigure({ figureId, notationLanguage });
  }

  // 6. مثلث متساوي الساقين وشعاع AE // BC ينصف الزاوية الخارجة DAC (مسألة 9 ص 242)
  if (/AE\s*\/\/\s*BC.*ينصف.*DAC|AE\s*ينصف.*DAC/i.test(d)) {
    return buildIsoscelesExteriorBisectorFigure({ figureId, notationLanguage });
  }

  // 7. مثلث ABC فيه BD = DC و AB = AD لإثبات أن قياس ABC = 3 قياس C (مسألة 10 ص 242)
  if (/BD\s*=\s*DC.*AB\s*=\s*AD|ABC\s*=\s*3\s*m\s*\(\s*∠?\s*C\s*\)/i.test(d)) {
    return buildTriangleTripleAngleProofFigure({ figureId, notationLanguage });
  }

  // 8. مثلث متساوي الساقين بزوايا جبرية (2X+13)° و (3X-17)° لحساب 73° و 34° (مسألة 11 ص 242)
  if (/2X\s*\+\s*13.*3X\s*-\s*17|73°.*34°/i.test(d)) {
    return buildIsoscelesAlgebraicAnglesFigure({ figureId, notationLanguage });
  }

  // 9. مثلث متساوي الساقين بزاوية خارجية 120° وضلعين 12 سم و 4X سم لإيجاد X = 3 (مسألة 15-3 ص 243)
  if (/120°.*4X|4X.*12\s*سم.*120°/i.test(d)) {
    return buildIsoscelesExteriorAngle120Figure({ figureId, notationLanguage });
  }

  // 10. مثلث قائم متساوي الساقين بزاوية 45° ووتر 5√2 سم لحساب X = 5 سم (مسألة 15-9 ص 243)
  if (/5√2.*45°|45°.*5√2/i.test(d)) {
    return buildRightIsosceles45DegreeFigure({ figureId, notationLanguage });
  }

  // 11. مثلث متساوي الساقين ABC بزاوية رأس 72° ومنصفا الزاويتين لإثبات DBC متساوي الساقين (مسألة 17 ص 244)
  if (/A\s*=\s*72°.*ينصف.*DBC|ينصف.*ABC.*ينصف.*ACB.*DBC/i.test(d)) {
    return buildIsoscelesBaseAngleBisectorsFigure({ figureId, notationLanguage });
  }

  // 12. مثلثان قائمان بوتر مشترك AB ومنتصف E لإثبات أن المثلث DEC متساوي الساقين (مسألة 19 ص 244)
  if (/ACB.*ADB.*90°.*E\s*منتصف\s*AB|DEC\s*متساوي\s*الساقين/i.test(d)) {
    return buildTwoRightTrianglesSharedHypotenuseDECFigure({ figureId, notationLanguage });
  }

  // 13. مطابقة عامة لدرس المثلث المتساوي الساقين في 2 إعدادي
  if (/المثلث\s*المتساوي\s*الساقين|متساوي\s*الساقين.*2\s*إعدادي|زاويتا\s*القاعدة/i.test(d)) {
    return buildIsoscelesAlgebraicAnglesFigure({ figureId, notationLanguage });
  }

  return undefined;
}
