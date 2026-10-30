/**
 * @file prep-grade3-line-equation-catalog.ts
 * @description السجل المركزي ومنسق أشكال درس معادلة الخط المستقيم (هندسة الصف الثالث الإعدادي):
 * يطابق الأوصاف الطبيعية لمسائل امتحانات المحافظات (حلوان، الدقهلية، الجيزة، الشرقية، المنوفية):
 * 1. مستقيم يقطع جزأين متساويين ويمر بالنقطة (2, 3) (الدقهلية 19).
 * 2. مثلث متساوي الأضلاع ABO في المستوى مع C منتصف AB ومعادلة OC (الجيزة 20).
 * 3. معين OADB رؤوسه O(0,0) و A(2,6) و B(6,2) و D(8,8) والقطر OD (الشرقية 14).
 * 4. مستقيمان متعامدان L1 ⊥ L2 ومعادلة L1 هي 2X - y + 2 = 0.
 * 5. مستقيم يقطع الصادات في A(0,8) وظل الزاوية ABO = 4/3 (الشرقية 13).
 * 6. مثلث قائم في B مع A(-4,-3) و B(2,3) و C على محور السينات (الدقهلية 23).
 * 7. مستقيم 2y = X - 4 وزاوية الميل θ مع محور السينات.
 * 8. مساحة المثلث AOB تساوي 9 وحدات مع A(0,6) (المنوفية 17).
 * 9. مربع OABC طول ضلعه 4 سم ومعادلة القطر AC (الشرقية 23).
 * 10. مثلث OAB قائم في A مع OB = 6 و AB = 3 ومعادلة AO.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildLineEqualInterceptsAOBFigure,
  buildLineTriangleAreaAOBFigure,
  buildLineAngleThetaFigure,
  buildLineTangentAngleABOFigure,
} from "./prep-grade3-line-intercepts-builder";
import {
  buildPerpendicularLinesAtYAxisFigure,
  buildPerpendicularSegmentsABCFigure,
  buildRightTriangleOnAxesFigure,
} from "./prep-grade3-line-perpendicular-builder";
import {
  buildEquilateralTriangleOnAxisFigure,
  buildRhombusInCoordinatePlaneFigure,
  buildSquareDiagonalLineFigure,
} from "./prep-grade3-line-shapes-builder";

export const MODULE_ID_PREP_GRADE3_LINE_EQUATION_CATALOG =
  "prep_grade3_line_equation_catalog" as const;

export function matchPrepGrade3LineEquationFigure(
  description: string,
  figureId = "prep3_line_eq_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  // 1. مستقيم يقطع من محوري الإحداثيات جزأين متساويين في الطول (مسألة 21)
  if (/جزأين\s*متساويين|يقطع.*محوري\s*الإحداثيات\s*جزأين|معادلته\s*y\s*=\s*k\s*X\s*\+\s*c.*\(2\s*[,،]\s*3\)/i.test(d)) {
    return buildLineEqualInterceptsAOBFigure({ figureId, notationLanguage });
  }

  // 2. مثلث متساوي الأضلاع ABO مع C منتصف AB ومعادلة OC (مسألة 22)
  if (/ABO\s*مثلث\s*متساوي\s*الأضلاع|مثلث\s*متساوي\s*الأضلاع.*C\s*منتصف|معادلة\s*OC|معادلة\s*و\s*جـ/i.test(d)) {
    return buildEquilateralTriangleOnAxisFigure({ figureId, notationLanguage });
  }

  // 3. معين OADB مع O(0,0) و A(2,6) و B(6,2) و D رؤوس معين (مسألة 23)
  if (/رؤوس\s*معين|معين.*A\(2\s*[,،]\s*6\)|معادلة\s*OD.*معين|m\s*\(\s*∠?\s*DOH\s*\)/i.test(d)) {
    return buildRhombusInCoordinatePlaneFigure({ figureId, notationLanguage });
  }

  // 4. مستقيمان متعامدان L1 ⊥ L2 ومعادلة L1 هي 2X - y + 2 = 0 (مسألة 24)
  if (/L[12]\s*⊥\s*L[12]|L_2\s*⊥\s*L_1|2X\s*-\s*y\s*\+\s*2\s*=\s*0|٢س\s*-\s*ص\s*\+\s*٢\s*=\s*٠/i.test(d)) {
    return buildPerpendicularLinesAtYAxisFigure({ figureId, notationLanguage });
  }

  // 5. مستقيم يقطع الصادات في A(0,8) وظل الزاوية ABO = 4/3 (مسألة 25)
  if (/A\(0\s*[,،]\s*8\)|tan\s*\(\s*∠?\s*ABO\s*\)\s*=\s*4\s*\/\s*3|ظا\s*\(\s*∠?\s*ABO\s*\)|يقطع\s*محور\s*y\s*في.*A\(0\s*[,،]\s*8\)/i.test(d)) {
    return buildLineTangentAngleABOFigure({ figureId, notationLanguage });
  }

  // 6. مثلث قائم الزاوية في B مع A(-4,-3) و B(2,3) و C على محور السينات (مسألة 26)
  if (/A\(-4\s*[,،]\s*-3\)|A\(-\s*4\s*[,،]\s*-\s*3\)|AB\s*⊥\s*BC.*إحداثيي.*C|AB\s*⊥\s*BC.*معادلة\s*AC/i.test(d)) {
    return buildPerpendicularSegmentsABCFigure({ figureId, notationLanguage });
  }

  // 7. مستقيم 2y = X - 4 وزاوية الميل θ مع الاتجاه الموجب (مسألة 35)
  if (/2y\s*=\s*X\s*-\s*4|2\s*ص\s*=\s*س\s*-\s*4|tan\s*θ|ظا\s*θ|النسب\s*الآتية\s*تساوي\s*tan/i.test(d)) {
    return buildLineAngleThetaFigure({ figureId, notationLanguage });
  }

  // 8. مساحة المثلث AOB تساوي 9 وحدات مربعة مع A(0,6) (مسألة 36)
  if (/مساحة\s*المثلث\s*AOB\s*تساوي\s*9|مساحة\s*مثلث\s*AOB.*9|A\(0\s*[,،]\s*6\).*معادلة\s*AB/i.test(d)) {
    return buildLineTriangleAreaAOBFigure({ figureId, notationLanguage });
  }

  // 9. مربع OABC طول ضلعه 4 سم ومعادلة القطر AC (مسألة 37)
  if (/OABC\s*مربع.*طول\s*ضلعه\s*4|OABC\s*مربع.*معادلة\s*AC|مربع.*معادلة\s*AC/i.test(d)) {
    return buildSquareDiagonalLineFigure({ figureId, notationLanguage });
  }

  // 10. مثلث OAB قائم في A مع OB = 6 و AB = 3 لإيجاد معادلة AO (مسألة 38)
  if (/AB\s*=\s*3.*BO\s*=\s*6|BO\s*=\s*6.*AB\s*=\s*3|معادلة\s*AO.*AB\s*=\s*3/i.test(d)) {
    return buildRightTriangleOnAxesFigure({ figureId, notationLanguage });
  }

  // 11. مطابقة عامة لمعادلة خط مستقيم في المستوى الإحداثي
  if (/معادلة\s*الخط\s*المستقيم/i.test(d) && /محور|إحداثي|نقطة\s*الأصل/i.test(d)) {
    return buildLineEqualInterceptsAOBFigure({ figureId, notationLanguage });
  }

  return undefined;
}
