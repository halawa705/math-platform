/**
 * @file prep-grade2-parallel-applications-catalog.ts
 * @description السجل المركزي ومنسق أشكال درس تطبيقات التوازي (هندسة الصف الثاني الإعدادي - الوحدة 3 - الدرس 3):
 * يطابق كافة الأوصاف الطبيعية لمسائل كتاب المعاصر والمتميزون لامتحانات المحافظات:
 * 1. نظرية طاليس الخاصة لعدة مستقيمات متوازية وقواطع متساوية ومجهول m (مسألة 8 ص 210).
 * 2. قاطعان لمستقيمات متوازية بأجزاء متساوية 4X و 8 و y+1 (مسألة 3 ص 210).
 * 3. توازيات متعددة FD // GE مع أجزاء متساوية لإيجاد KE = 24 سم (مسألة 18 ص 214).
 * 4. مثلث متوسط FED منصفات أضلاع 6 و 8 و 10 سم ومحيطه 12 سم وقائم (مسألة 8 ص 212).
 * 5. قطعة واصلة بين منتصفين DE = 2X+1 و BC = 5X-5 لإيجاد X = 7 (مسألة 13 ص 213).
 * 6. مثلث قائم في C مع منصفين D و E لحساب طول DE = 1.5 سم (مسألة 6 ص 211).
 * 7. رباعي ABCD مع منصفين Z و X وتوازي ZY // DC و YC = 4 سم لحساب محيط AXY (مسألة 7 ص 211).
 * 8. رباعي ABCD مع FE = 10 سم واصلة بين منتصفين وأبعاد 12 و 16 سم لإثبات زاوية D قائمة (مسألة 12 ص 212).
 * 9. متوازي أضلاع ABCD مع منصفين E و F لإثبات أن AC = 3 AG (مسألة 19 ص 214).
 * 10. تكرار تنصيف الأضلاع لإثبات BC = 4 GH (مسألة 21 ص 214).
 * 11. رباعي ABCD قائم في D مع أطوال 9 و 12 و 4 سم لحساب مساحة BEF = 15 سم² (مسألة 22 ص 214).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import type { CanonicalGeometryFigureIR } from "../../../../ssot/geometry-archetype-ssot";
import type { MathNotationLanguage } from "../../../../ssot/numeral-and-unit-ssot";
import {
  buildThalesFourParallelsXE6Figure,
  buildThalesTransversals4x8yFigure,
  buildThalesMultipleParallelsGK8Figure,
} from "./prep-grade2-thales-parallel-intercepts-builder";
import {
  buildTriangleMidsegmentsPerimeter12Figure,
  buildTriangleMidsegmentAlgebraicX7Figure,
  buildRightTriangleMidsegmentDE15Figure,
  buildDoubleMidsegmentQuadGHFigure,
} from "./prep-grade2-triangle-midsegments-builder";
import {
  buildParallelQuadMidpointsZYDCFigure,
  buildParallelQuadFE10RightAngleDFigure,
  buildParallelogramTrisectionACFigure,
  buildParallelQuadAreaBEF15Figure,
} from "./prep-grade2-parallel-quadrilaterals-builder";

export const MODULE_ID_PREP_GRADE2_PARALLEL_APPLICATIONS_CATALOG =
  "prep_grade2_parallel_applications_catalog" as const;

export function matchPrepGrade2ParallelApplicationsFigure(
  description: string,
  figureId = "prep2_para_app_fig",
  notationLanguage: MathNotationLanguage = "english"
): CanonicalGeometryFigureIR | undefined {
  const d = description.trim();
  if (!d) return undefined;

  // 1. نظرية طاليس الخاصة بعدة مستقيمات متوازية XA // YB // EC // FD وقواطع متساوية ومجهول m (مسألة 8 ص 210)
  if (/XA\s*\/\/\s*YB|XE\s*=\s*6.*EF\s*=\s*\(?\s*m\s*\+\s*2\s*\)?|قيمة\s*m.*طاليس/i.test(d)) {
    return buildThalesFourParallelsXE6Figure({ figureId, notationLanguage });
  }

  // 2. قاطعان لمستقيمات متوازية بأجزاء متساوية 4X و 8 و y+1 (مسألة 3 ص 210)
  if (/l[1-4]\s*\/\/\s*l[1-4]|قاطعان\s*لهم.*4X.*8|4X.*8.*y\s*\+\s*1/i.test(d)) {
    return buildThalesTransversals4x8yFigure({ figureId, notationLanguage });
  }

  // 3. توازيات متعددة FD // GE مع أجزاء متساوية لإيجاد KE = 24 سم (مسألة 18 ص 214)
  if (/FD\s*\/\/\s*GE.*GK\s*=\s*8|AG\s*=\s*GF\s*=\s*FB|طول\s*KE.*24/i.test(d)) {
    return buildThalesMultipleParallelsGK8Figure({ figureId, notationLanguage });
  }

  // 4. مثلث متوسط FED منصفات أضلاع 6 و 8 و 10 سم ومحيطه 12 سم وقائم (مسألة 8 ص 212)
  if (/منتصفات.*AB.*BC.*AC.*محيط\s*المثلث\s*FED|محيط\s*المثلث\s*FED.*12|6\s*سم.*8\s*سم.*10\s*سم.*منتصف/i.test(d)) {
    return buildTriangleMidsegmentsPerimeter12Figure({ figureId, notationLanguage });
  }

  // 5. قطعة واصلة بين منتصفين DE = 2X+1 و BC = 5X-5 لإيجاد X = 7 (مسألة 13 ص 213)
  if (/2X\s*\+\s*1.*5X\s*-\s*5|DE\s*=\s*\(?\s*2X\s*\+\s*1\s*\)?.*BC\s*=\s*\(?\s*5X\s*-\s*5\s*\)?|قيمة\s*X.*2X\s*\+\s*1/i.test(d)) {
    return buildTriangleMidsegmentAlgebraicX7Figure({ figureId, notationLanguage });
  }

  // 6. مثلث قائم في C مع منصفين D و E لحساب طول DE = 1.5 سم (مسألة 6 ص 211)
  if (/DE.*1\.5|منتصفا\s*AB\s*،\s*BC.*BC\s*=\s*4.*AB\s*=\s*5|m\s*\(\s*∠?\s*C\s*\)\s*=\s*90°.*طول\s*DE/i.test(d)) {
    return buildRightTriangleMidsegmentDE15Figure({ figureId, notationLanguage });
  }

  // 7. رباعي ABCD مع منصفين Z و X وتوازي ZY // DC و YC = 4 سم لحساب محيط AXY (مسألة 7 ص 211)
  if (/ZY\s*\/\/\s*DC.*YC\s*=\s*4|محيط\s*المثلث\s*AXY|Z\s*،\s*X\s*منتصفا\s*AD\s*،\s*AB/i.test(d)) {
    return buildParallelQuadMidpointsZYDCFigure({ figureId, notationLanguage });
  }

  // 8. رباعي ABCD مع FE = 10 سم واصلة بين منتصفين وأبعاد 12 و 16 سم لإثبات زاوية D قائمة (مسألة 12 ص 212)
  if (/FE\s*=\s*10/i.test(d) && (/12/i.test(d) || /16/i.test(d) || /D\s*=\s*90/i.test(d))) {
    return buildParallelQuadFE10RightAngleDFigure({ figureId, notationLanguage });
  }

  // 9. متوازي أضلاع ABCD مع منصفين E و F لإثبات أن AC = 3 AG (مسألة 19 ص 214)
  if (/AC\s*=\s*3\s*AG|متوازي\s*أضلاع.*E\s*،\s*F\s*منتصفي\s*BC\s*،\s*AD/i.test(d)) {
    return buildParallelogramTrisectionACFigure({ figureId, notationLanguage });
  }

  // 10. تكرار تنصيف الأضلاع لإثبات BC = 4 GH (مسألة 21 ص 214)
  if (/BC\s*=\s*4\s*GH|G\s*منتصف\s*DF.*BC\s*=\s*4/i.test(d)) {
    return buildDoubleMidsegmentQuadGHFigure({ figureId, notationLanguage });
  }

  // 11. رباعي ABCD قائم في D مع أطوال 9 و 12 و 4 سم لحساب مساحة BEF = 15 سم² (مسألة 22 ص 214)
  if (/مساحة\s*المثلث\s*BEF.*15|BEF.*15\s*سم|AD\s*=\s*9.*CD\s*=\s*12.*AB\s*=\s*4/i.test(d)) {
    return buildParallelQuadAreaBEF15Figure({ figureId, notationLanguage });
  }

  // 12. مطابقة عامة لتطبيقات التوازي في 2 إعدادي
  if (/تطبيقات\s*التوازي|طاليس\s*الخاصة/i.test(d)) {
    return buildTriangleMidsegmentsPerimeter12Figure({ figureId, notationLanguage });
  }

  return undefined;
}
